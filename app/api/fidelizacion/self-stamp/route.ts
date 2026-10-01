/**
 * POST /api/fidelizacion/self-stamp
 * El cliente se sella a sí mismo desde el link /s/[programId].
 * Busca o crea la tarjeta por teléfono y aplica el sello.
 * Anti-abuso: máximo 1 sello por tarjeta cada 4 horas.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { updateLoyaltyObjectStamps } from '@/lib/wallet/google-wallet'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { program_id, phone, name } = await req.json()

    if (!program_id || !phone) {
      return NextResponse.json({ error: 'program_id y phone son requeridos' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 6) {
      return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 })
    }

    // Verificar que el programa existe y está activo
    const { data: program, error: progErr } = await supabase
      .from('loyalty_programs')
      .select('id, stamps_goal, reward_description, milestones, business_id')
      .eq('id', program_id)
      .single()

    if (progErr || !program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    }

    // Buscar tarjeta por teléfono + programa (match bidireccional para código de área)
    const { data: allCards } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('program_id', program_id)

    let card = (allCards ?? []).find(c => {
      const stored = c.phone.replace(/\D/g, '')
      return stored.endsWith(cleanPhone) || cleanPhone.endsWith(stored)
    }) ?? null

    const isNew = !card
    if (!card) {
      // Si no se encontró con match bidireccional, verificar por últimos 8 dígitos
      // para evitar duplicados por variaciones de código de área
      const last8 = cleanPhone.slice(-8)
      const duplicate = (allCards ?? []).find(c => c.phone.replace(/\D/g, '').slice(-8) === last8)
      if (duplicate) {
        // Usar la tarjeta existente en vez de crear una nueva
        card = duplicate
      } else {
        const clientName = (name ?? '').trim() || 'Cliente'
        const { data: newCard, error: createErr } = await supabase
          .from('loyalty_cards')
          .insert({ program_id, phone: cleanPhone, name: clientName, stamps: 0, total_visits: 0 })
          .select()
          .single()

        if (createErr || !newCard) {
          return NextResponse.json({ error: 'No se pudo crear la tarjeta' }, { status: 500 })
        }
        card = newCard
      }
    }

    // Anti-abuso: máximo 1 sello cada 4 horas
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    const { data: recentStamp } = await supabase
      .from('loyalty_transactions')
      .select('id, created_at')
      .eq('card_id', card.id)
      .eq('type', 'stamp')
      .gte('created_at', fourHoursAgo)
      .limit(1)
      .maybeSingle()

    if (recentStamp) {
      const nextAvailable = new Date(new Date(recentStamp.created_at).getTime() + 4 * 60 * 60 * 1000)
      return NextResponse.json({
        error: 'Ya recibiste un sello en las últimas 4 horas.',
        cooldown: true,
        next_available: nextAvailable.toISOString(),
        stamps: card.stamps,
        stamps_goal: program.stamps_goal,
      }, { status: 429 })
    }

    const newStamps = card.stamps + 1
    const goalReached = newStamps >= program.stamps_goal
    const milestones: { at: number; label: string; coupon_prefix?: string }[] = program.milestones ?? []
    const hitMilestone = !goalReached ? milestones.find(m => m.at === newStamps) ?? null : null
    const finalStamps = goalReached ? 0 : newStamps

    function genCoupon(prefix: string) {
      return `${prefix.substring(0, 6).toUpperCase().replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    }

    const couponCode = goalReached
      ? genCoupon(program.reward_description ?? 'PREMIO')
      : hitMilestone
        ? genCoupon(hitMilestone.coupon_prefix ?? hitMilestone.label)
        : null

    // Actualizar tarjeta
    await supabase
      .from('loyalty_cards')
      .update({ stamps: finalStamps, total_visits: card.total_visits + 1, updated_at: new Date().toISOString() })
      .eq('id', card.id)

    // Registrar transacción
    await supabase.from('loyalty_transactions').insert({
      card_id: card.id, program_id, type: 'stamp', amount: 1, registered_by: 'self',
    })

    if (goalReached) {
      await supabase.from('loyalty_transactions').insert({
        card_id: card.id, program_id, type: 'reward',
        amount: -program.stamps_goal, note: program.reward_description,
        registered_by: 'system', coupon_code: couponCode,
      })
    }

    if (hitMilestone) {
      await supabase.from('loyalty_transactions').insert({
        card_id: card.id, program_id, type: 'reward',
        amount: 0, note: hitMilestone.label,
        registered_by: 'system', coupon_code: couponCode,
      })
    }

    // Google Wallet (no bloquea respuesta)
    if (card.wallet_object_id) {
      try { await updateLoyaltyObjectStamps(card.wallet_object_id, finalStamps, program.stamps_goal) }
      catch { /* silent */ }
    }

    return NextResponse.json({
      success: true,
      is_new: isNew,
      client_name: card.name,
      stamps: finalStamps,
      stamps_goal: program.stamps_goal,
      goal_reached: goalReached,
      reward: goalReached ? program.reward_description : null,
      coupon_code: couponCode,
      milestone_reached: !!hitMilestone,
      milestone_label: hitMilestone?.label ?? null,
    })
  } catch (err) {
    console.error('Error en /api/fidelizacion/self-stamp:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
