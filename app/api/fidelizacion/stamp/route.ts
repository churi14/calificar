/**
 * POST /api/fidelizacion/stamp
 * Suma un sello a la tarjeta del cliente.
 * Se llama desde el NFC del mostrador o desde el panel del negocio.
 *
 * SEGURIDAD: SIEMPRE requiere Bearer token del dueño del programa,
 * sin importar el valor de registered_by. No existe path sin auth.
 *
 * Body: { card_id, program_id, registered_by? }
 */

import { programCan } from '@/lib/program-plan'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { updateLoyaltyObjectStamps } from '@/lib/wallet/google-wallet'
import { verifyProgramMember } from '@/lib/business-auth'
import { resolveBranchId } from '@/lib/branches'
import { couponPrefix } from '@/lib/coupons'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { card_id, program_id, registered_by = 'nfc', purchase_amount, branch_id: rawBranchId } = await req.json()

    if (!card_id || !program_id) {
      return NextResponse.json({ error: 'card_id y program_id son requeridos' }, { status: 400 })
    }

    // Auth obligatoria para TODOS los paths — NFC y manual por igual.
    // Un cliente nunca puede llamar a este endpoint directamente.
    const access = await verifyProgramMember(req, program_id)
    if (!access) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Sucursal donde se da el sello (null = Principal). Inválida o inexistente se cuenta como Principal.
    // Un miembro del equipo limitado a una sucursal siempre da sellos en esa sucursal
    const branchId = await resolveBranchId(supabase, program_id, access.branchId ?? rawBranchId)
    const branchField = branchId ? { branch_id: branchId } : {}

    // Traer tarjeta y programa juntos
    const { data: card, error: cardErr } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('id', card_id)
      .eq('program_id', program_id)
      .single()

    if (cardErr || !card) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
    }

    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('id', program_id)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    }

    // Anti-abuso: máximo 1 sello por cliente cada 4 horas (excepto 'manual' desde el panel del negocio)
    if (registered_by !== 'manual') {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      const { data: recentStamp } = await supabase
        .from('loyalty_transactions')
        .select('id')
        .eq('card_id', card_id)
        .eq('type', 'stamp')
        .gte('created_at', fourHoursAgo)
        .limit(1)
        .single()

      if (recentStamp) {
        return NextResponse.json({
          error: 'Ya sumaste un sello en las últimas 4 horas.',
          cooldown: true,
          wallet_object_id: card.wallet_object_id ?? null,
        }, { status: 429 })
      }
    }

    const newStamps = card.stamps + 1
    const goalReached = newStamps >= program.stamps_goal

    // Chequear hitos intermedios (milestones)
    // Formato: [{ at: 3, label: "20% OFF", coupon_prefix: "DESC20" }, ...]
    const milestones: { at: number; label: string; coupon_prefix?: string }[] = (await programCan(program_id, 'milestones')) ? (program.milestones ?? []) : []
    const hitMilestone = !goalReached ? milestones.find(m => m.at === newStamps) ?? null : null

    // Reset de stamps: SOLO al llegar a la meta final. Los milestones no resetean.
    const finalStamps = goalReached ? 0 : newStamps

    // Generar cupón único para meta final
    function genCoupon(prefix: string) {
      return `${couponPrefix(prefix)}-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`
    }

    const couponCode = goalReached
      ? genCoupon(program.reward_description ?? 'PREMIO')
      : hitMilestone
        ? genCoupon(hitMilestone.coupon_prefix ?? hitMilestone.label)
        : null

    // Actualizar tarjeta
    await supabase
      .from('loyalty_cards')
      .update({
        stamps: finalStamps,
        total_visits: card.total_visits + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', card_id)

    // Registrar transacción de sello
    await supabase.from('loyalty_transactions').insert({
      card_id,
      program_id,
      type: 'stamp',
      amount: 1,
      purchase_amount: purchase_amount ?? null,
      registered_by,
      ...branchField,
    })

    // Si llegó a la meta, registrar canje final
    if (goalReached) {
      await supabase.from('loyalty_transactions').insert({
        card_id,
        program_id,
        type: 'reward',
        amount: -program.stamps_goal,
        note: program.reward_description,
        registered_by: 'system',
        coupon_code: couponCode,
        ...branchField,
      })
    }

    // Si alcanzó un hito intermedio, registrar milestone
    if (hitMilestone) {
      await supabase.from('loyalty_transactions').insert({
        card_id,
        program_id,
        type: 'reward',
        amount: 0,
        note: hitMilestone.label,
        registered_by: 'system',
        coupon_code: couponCode,
        ...branchField,
      })
    }

    // Si llegó a la meta → push de reseña Google (no bloquea)
    if (goalReached) {
      void (async () => {
        try {
          const { data: gr } = await supabase
            .from('google_review_settings')
            .select('enabled, google_maps_url, push_title, push_body')
            .eq('program_id', program_id)
            .single()
          if (gr?.enabled && gr?.google_maps_url && (await programCan(program_id, 'reviews'))) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/api/fidelizacion/push/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-cron-secret': process.env.CRON_SECRET ?? '',
              },
              body: JSON.stringify({
                program_id,
                card_id,
                title: gr.push_title,
                body:  gr.push_body,
                url:   gr.google_maps_url,
              }),
            })
          }
        } catch { /* no bloquea */ }
      })()
    }

    // Actualizar Google Wallet (no bloquea la respuesta)
    let walletUpdateError: string | null = null
    if (card.wallet_object_id) {
      try {
        await updateLoyaltyObjectStamps(
          card.wallet_object_id,
          finalStamps,
          program.stamps_goal
        )
      } catch (err) {
        walletUpdateError = String(err)
        console.error('Error actualizando Wallet:', walletUpdateError)
      }
    }

    return NextResponse.json({
      success: true,
      stamps: finalStamps,
      stamps_goal: program.stamps_goal,
      goal_reached: goalReached,
      reward: goalReached ? program.reward_description : null,
      coupon_code: couponCode,
      // Milestone intermedio
      milestone_reached: hitMilestone ? true : false,
      milestone_label: hitMilestone?.label ?? null,
      // Google Wallet
      wallet_object_id: card.wallet_object_id ?? null,
      wallet_update_error: walletUpdateError, // null si OK, string si falló
    })
  } catch (err) {
    console.error('Error en /api/fidelizacion/stamp:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
