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
    const { program_id, phone, name, email, birth_date, dni } = await req.json()

    if (!program_id || !phone) {
      return NextResponse.json({ error: 'program_id y phone son requeridos' }, { status: 400 })
    }

    // Verificar que el programa existe
    const { data: program, error: progErr } = await supabase
      .from('loyalty_programs')
      .select('*, businesses(name, whatsapp_number)')
      .eq('id', program_id)
      .eq('active', true)
      .single()

    if (progErr || !program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const cleanDni = dni ? String(dni).replace(/\D/g, '').trim() : null

    // Buscar tarjeta existente para este teléfono + programa (incluyendo inactivas).
    // NO filtrar por active: true — si la tarjeta fue soft-deleted la reactivamos,
    // no creamos un duplicado que chocaría con la restricción UNIQUE.
    const { data: allCards } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('program_id', program_id)

    const existing = (allCards ?? []).find(c => {
      const stored = c.phone.replace(/\D/g, '')
      return stored.endsWith(cleanPhone) || cleanPhone.endsWith(stored)
    }) ?? (allCards ?? []).find(c => c.phone.replace(/\D/g, '').slice(-8) === cleanPhone.slice(-8)) ?? null

    if (existing) {
      // Si la tarjeta fue soft-deleted (active: false), reactivarla.
      // Esto resuelve el caso "admin borró al cliente → cliente vuelve a registrarse".
      let activeCard = existing
      if (!existing.active) {
        const { data: reactivated, error: reactivateErr } = await supabase
          .from('loyalty_cards')
          .update({ active: true })
          .eq('id', existing.id)
          .select()
          .single()
        if (reactivateErr || !reactivated) {
          return NextResponse.json({ error: 'Error reactivando tarjeta' }, { status: 500 })
        }
        activeCard = reactivated
      }

      const objectId = activeCard.wallet_object_id ?? `calificar_card_${activeCard.id}`
      if (!activeCard.wallet_object_id) {
        try {
          await createLoyaltyObject({
            classId: program.id,
            objectId,
            customerName: activeCard.name ?? activeCard.phone,
            stamps: activeCard.stamps,
            stampsGoal: program.stamps_goal,
            rewardDescription: program.reward_description,
          })
        } catch { /* ya puede existir en Google — ignorar */ }
        await supabase.from('loyalty_cards').update({ wallet_object_id: objectId }).eq('id', activeCard.id)
      }

      const walletLink = getWalletLink(objectId, program.id, {
        customerName: activeCard.name ?? activeCard.phone,
        stamps: activeCard.stamps,
        stampsGoal: program.stamps_goal,
        rewardDescription: program.reward_description,
      })

      return NextResponse.json({
        card: { ...activeCard, wallet_object_id: objectId },
        wallet_link: walletLink,
        already_member: !existing.active ? false : true, // reactivada = tratarla como nueva
      })
    }

    // Crear nueva tarjeta
    const { data: card, error: cardErr } = await supabase
      .from('loyalty_cards')
      .insert({
        program_id,
        phone: cleanPhone,
        name: (name ?? '').trim() || cleanPhone,
        email: email ?? null,
        birth_date: birth_date ?? null,
        stamps: 0,
        points: 0,
        total_visits: 0,
        active: true,
        ...(cleanDni ? { dni: cleanDni } : {}),
      })
      .select()
      .single()

    if (cardErr || !card) {
      // Si es violación de UNIQUE (23505), buscar y reactivar el registro conflictivo.
      // Esto puede pasar por condición de carrera (dos requests simultáneos).
      if (cardErr?.code === '23505') {
        const { data: conflicting } = await supabase
          .from('loyalty_cards')
          .select('*')
          .eq('program_id', program_id)
          .eq('phone', cleanPhone)
          .maybeSingle()
        if (conflicting) {
          if (!conflicting.active) {
            await supabase.from('loyalty_cards').update({ active: true }).eq('id', conflicting.id)
            conflicting.active = true
          }
          return NextResponse.json({ card: conflicting, already_member: true })
        }
      }
      console.error('[JOIN] Error insertando loyalty_card:', cardErr)
      return NextResponse.json({ error: 'Error creando tarjeta' }, { status: 500 })
    }

    // Crear objeto en Google Wallet
    const objectId = `calificar_card_${card.id}`

    // Guardar el wallet_object_id SIEMPRE — aunque la pre-creación falle,
    // el JWT embebe el objeto completo y Google lo crea al vuelo cuando el usuario guarda
    await supabase.from('loyalty_cards').update({ wallet_object_id: objectId }).eq('id', card.id)

    try {
      await createLoyaltyObject({
        classId: program.id,
        objectId,
        customerName: name ?? phone,
        stamps: 0,
        stampsGoal: program.stamps_goal,
        rewardDescription: program.reward_description,
      })
    } catch (walletErr: unknown) {
      // No bloquea el flujo — el JWT tiene el objeto completo embebido
      const msg = walletErr instanceof Error ? walletErr.message : JSON.stringify(walletErr)
      console.error('[WALLET] Pre-creación falló (no crítico):', msg)
    }

    const walletLink = getWalletLink(objectId, program.id, {
      customerName: name ?? phone,
      stamps: 0,
      stampsGoal: program.stamps_goal,
      rewardDescription: program.reward_description,
    })

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
