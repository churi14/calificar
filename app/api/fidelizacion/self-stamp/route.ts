/**
 * POST /api/fidelizacion/self-stamp
 * El cliente se sella a sí mismo desde el link /s/[programId].
 * Busca o crea la tarjeta por teléfono y aplica el sello.
 * Anti-abuso: máximo 1 sello por tarjeta cada 4 horas.
 */
import { programCan } from '@/lib/program-plan'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { updateLoyaltyObjectStamps } from '@/lib/wallet/google-wallet'
import { resolveBranchId } from '@/lib/branches'
import { couponPrefix } from '@/lib/coupons'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Valida y consume un token de sello de un solo uso.
 * Devuelve true si el token era válido y fue marcado como usado.
 * Devuelve false si no existe, ya fue usado, o expiró.
 */
async function consumeStampToken(program_id: string, token: string): Promise<boolean> {
  const now = new Date().toISOString()

  // Buscar token válido: no usado, no vencido, pertenece al programa
  const { data: row } = await supabase
    .from('stamp_tokens')
    .select('id')
    .eq('program_id', program_id)
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', now)
    .limit(1)
    .maybeSingle()

  if (!row) return false

  // Marcar como usado (atomically — si alguien más lo usó antes, no encontrará used_at=null)
  const { data: updated } = await supabase
    .from('stamp_tokens')
    .update({ used_at: now })
    .eq('id', row.id)
    .is('used_at', null)
    .select('id')

  return (updated?.length ?? 0) > 0
}

export async function POST(req: NextRequest) {
  try {
    const { program_id, phone, name, dni, token, branch_id: rawBranchId } = await req.json()

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
      .select('id, stamps_goal, reward_description, milestones, business_id, stamp_secret')
      .eq('id', program_id)
      .single()

    if (progErr || !program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    }

    // Buscar tarjeta por teléfono + programa (match bidireccional para código de área)
    // Solo tarjetas activas — las inactivas (eliminadas por el negocio) se ignoran
    const { data: allCards } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('program_id', program_id)
      .neq('active', false)

    const cleanName = (name ?? '').trim()
    const cleanDni = dni ? String(dni).replace(/\D/g, '').trim() : null

    // ¿El negocio exige el link de un solo uso para dar sellos? (modo delivery / dark kitchen)
    // Si la columna todavía no existe (migración pendiente), cuenta como desactivado.
    const { data: modeRow } = await supabase
      .from('loyalty_programs')
      .select('require_stamp_token')
      .eq('id', program_id)
      .maybeSingle()
    const tokenRequired = !!(modeRow as { require_stamp_token?: boolean } | null)?.require_stamp_token

    // Buscar la tarjeta: match por teléfono (con y sin código de área) y, si no, por los últimos 8 dígitos
    let card = (allCards ?? []).find(c => {
      const stored = c.phone.replace(/\D/g, '')
      return stored.endsWith(cleanPhone) || cleanPhone.endsWith(stored)
    }) ?? null
    if (!card) {
      const last8 = cleanPhone.slice(-8)
      card = (allCards ?? []).find(c => c.phone.replace(/\D/g, '').slice(-8) === last8) ?? null
    }
    const isNew = !card

    // Cliente nuevo sin nombre: se le pide el nombre antes de hacer nada (no se gasta el link)
    if (!card && !cleanName) {
      return NextResponse.json({ success: false, is_new: true, needs_name: true })
    }

    // Anti-abuso: máximo 1 sello por tarjeta cada 4 horas (se mira antes de gastar el link de un solo uso)
    if (card) {
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
    }

    // Link de un solo uso: si viene, tiene que ser válido; si el negocio lo exige, es obligatorio para todos
    if (token || tokenRequired) {
      const valid = token ? await consumeStampToken(program_id, token) : false
      if (!valid) {
        return NextResponse.json({
          error: tokenRequired && !token
            ? 'Este negocio da los sellos con un link que te manda por cada pedido. Pedile el link al local.'
            : 'Este link ya fue usado o expiró. Pedí el link actualizado al negocio.',
          token_required: true,
        }, { status: 403 })
      }
    }

    if (!card) {
      const { data: newCard, error: createErr } = await supabase
        .from('loyalty_cards')
        .insert({ program_id, phone: cleanPhone, name: cleanName, stamps: 0, total_visits: 0, active: true, ...(cleanDni ? { dni: cleanDni } : {}) })
        .select()
        .single()

      if (createErr || !newCard) {
        return NextResponse.json({ error: 'No se pudo crear la tarjeta' }, { status: 500 })
      }
      card = newCard
    }

    // Si la tarjeta existe pero el nombre es el teléfono (registro incompleto), actualizarlo
    if (card && cleanName && card.name === card.phone) {
      const updates: Record<string, string> = { name: cleanName }
      if (cleanDni && !card.dni) updates.dni = cleanDni
      await supabase.from('loyalty_cards').update(updates).eq('id', card.id)
      card = { ...card, name: cleanName }
    }

    const newStamps = card.stamps + 1
    const goalReached = newStamps >= program.stamps_goal
    const milestones: { at: number; label: string; coupon_prefix?: string }[] = (await programCan(program.id as string, 'milestones')) ? (program.milestones ?? []) : []
    const hitMilestone = !goalReached ? milestones.find(m => m.at === newStamps) ?? null : null
    const finalStamps = goalReached ? 0 : newStamps

    function genCoupon(prefix: string) {
      return `${couponPrefix(prefix)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    }

    const couponCode = goalReached
      ? genCoupon(program.reward_description ?? 'PREMIO')
      : hitMilestone
        ? genCoupon(hitMilestone.coupon_prefix ?? hitMilestone.label)
        : null

    // Sucursal del QR/NFC que escaneó el cliente (null = Principal)
    const branchId = await resolveBranchId(supabase, program_id, rawBranchId)
    const branchField = branchId ? { branch_id: branchId } : {}

    // Actualizar tarjeta
    await supabase
      .from('loyalty_cards')
      .update({ stamps: finalStamps, total_visits: card.total_visits + 1, updated_at: new Date().toISOString() })
      .eq('id', card.id)

    // Registrar transacción
    await supabase.from('loyalty_transactions').insert({
      card_id: card.id, program_id, type: 'stamp', amount: 1, registered_by: 'self', ...branchField,
    })

    if (goalReached) {
      await supabase.from('loyalty_transactions').insert({
        card_id: card.id, program_id, type: 'reward',
        amount: -program.stamps_goal, note: program.reward_description,
        registered_by: 'system', coupon_code: couponCode, ...branchField,
      })
    }

    if (hitMilestone) {
      await supabase.from('loyalty_transactions').insert({
        card_id: card.id, program_id, type: 'reward',
        amount: 0, note: hitMilestone.label,
        registered_by: 'system', coupon_code: couponCode, ...branchField,
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
