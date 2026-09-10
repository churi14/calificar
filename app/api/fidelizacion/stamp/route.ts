/**
 * POST /api/fidelizacion/stamp
 * Suma un sello a la tarjeta del cliente.
 * Se llama desde el NFC del mostrador (cliente logueado) o desde el panel del negocio.
 *
 * Body: { card_id, program_id, registered_by? }
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
    const { card_id, program_id, registered_by = 'nfc', purchase_amount } = await req.json()

    if (!card_id || !program_id) {
      return NextResponse.json({ error: 'card_id y program_id son requeridos' }, { status: 400 })
    }

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
        }, { status: 429 })
      }
    }

    const newStamps = card.stamps + 1
    const goalReached = newStamps >= program.stamps_goal
    const finalStamps = goalReached ? 0 : newStamps  // reset al canjear

    // Generar cupón único si llega a la meta
    const couponCode = goalReached
      ? `${(program.reward_description ?? 'PREMIO').substring(0,4).toUpperCase().replace(/\s/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`
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

    // Registrar transacción
    await supabase.from('loyalty_transactions').insert({
      card_id,
      program_id,
      type: 'stamp',
      amount: 1,
      purchase_amount: purchase_amount ?? null,
      registered_by,
    })

    // Si llegó a la meta, registrar el canje con cupón
    if (goalReached) {
      await supabase.from('loyalty_transactions').insert({
        card_id,
        program_id,
        type: 'reward',
        amount: -program.stamps_goal,
        note: program.reward_description,
        registered_by: 'system',
        coupon_code: couponCode,
      })
    }

    // Actualizar Google Wallet (no bloquea la respuesta)
    if (card.wallet_object_id) {
      updateLoyaltyObjectStamps(
        card.wallet_object_id,
        finalStamps,
        program.stamps_goal
      ).catch(err => console.error('Error actualizando Wallet:', err))
    }

    return NextResponse.json({
      success: true,
      stamps: finalStamps,
      stamps_goal: program.stamps_goal,
      goal_reached: goalReached,
      reward: goalReached ? program.reward_description : null,
      coupon_code: couponCode,
    })
  } catch (err) {
    console.error('Error en /api/fidelizacion/stamp:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
