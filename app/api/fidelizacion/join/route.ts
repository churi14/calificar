/**
 * POST /api/fidelizacion/join
 * El cliente se une a un programa de fidelización.
 * Crea la loyalty_card en Supabase y el objeto en Google Wallet.
 * Devuelve el link "Agregar a Google Wallet".
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createLoyaltyObject, getWalletLink } from '@/lib/wallet/google-wallet'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { program_id, phone, name, email, birth_date } = await req.json()

    if (!program_id || !phone) {
      return NextResponse.json({ error: 'program_id y phone son requeridos' }, { status: 400 })
    }

    // Verificar que el programa existe
    const { data: program, error: progErr } = await supabase
      .from('loyalty_programs')
      .select('*, businesses(name)')
      .eq('id', program_id)
      .eq('active', true)
      .single()

    if (progErr || !program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    }

    // Verificar si ya tiene tarjeta
    const { data: existing } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('program_id', program_id)
      .eq('phone', phone)
      .single()

    if (existing) {
      // Ya tiene tarjeta — devolver el wallet link existente
      const walletLink = existing.wallet_object_id
        ? getWalletLink(existing.wallet_object_id, program.id)
        : null

      return NextResponse.json({
        card: existing,
        wallet_link: walletLink,
        already_member: true,
      })
    }

    // Crear tarjeta en Supabase
    const { data: card, error: cardErr } = await supabase
      .from('loyalty_cards')
      .insert({
        program_id,
        phone,
        name: name ?? phone,
        email: email ?? null,
        birth_date: birth_date ?? null,
        stamps: 0,
        points: 0,
        total_visits: 0,
      })
      .select()
      .single()

    if (cardErr || !card) {
      return NextResponse.json({ error: 'Error creando tarjeta' }, { status: 500 })
    }

    // Crear objeto en Google Wallet
    const objectId = `calificar_card_${card.id}`
    try {
      await createLoyaltyObject({
        classId: program.id,          // usamos el UUID del programa como classId
        objectId,
        customerName: name ?? phone,
        stamps: 0,
        stampsGoal: program.stamps_goal,
        rewardDescription: program.reward_description,
      })

      // Guardar el wallet_object_id en la tarjeta
      await supabase
        .from('loyalty_cards')
        .update({ wallet_object_id: objectId })
        .eq('id', card.id)
    } catch (walletErr) {
      console.error('Error creando objeto Wallet (no crítico):', walletErr)
    }

    const walletLink = getWalletLink(objectId, program.id)

    return NextResponse.json({
      card: { ...card, wallet_object_id: objectId },
      wallet_link: walletLink,
      already_member: false,
    })
  } catch (err) {
    console.error('Error en /api/fidelizacion/join:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
