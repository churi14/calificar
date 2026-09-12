/**
 * POST /api/fidelizacion/proximity
 * Guarda la configuración de avisos de proximidad y sincroniza con Google Wallet.
 *
 * Body: { program_id, lat, lng, location_label, message, enabled }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createOrUpdateLoyaltyClass } from '@/lib/wallet/google-wallet'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { program_id, lat, lng, location_label, message, enabled } = await req.json()

    if (!program_id) {
      return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
    }

    // 1. Leer el programa completo para tener todos los datos que necesita el Wallet
    const { data: program, error: pErr } = await admin
      .from('loyalty_programs')
      .select('*, businesses(name)')
      .eq('id', program_id)
      .single()

    if (pErr || !program) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
    }

    // 2. Guardar en DB
    const { error: updateErr } = await admin
      .from('loyalty_programs')
      .update({
        proximity_message: message ?? null,
        location_lat: lat ?? null,
        location_lng: lng ?? null,
        location_label: location_label ?? null,
        proximity_enabled: enabled ?? false,
      })
      .eq('id', program_id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 3. Sincronizar con Google Wallet (si tenés credenciales configuradas)
    if (process.env.GOOGLE_WALLET_ISSUER_ID) {
      try {
        await createOrUpdateLoyaltyClass({
          classId: program_id,
          programName: program.name,
          issuerName: program.businesses?.name ?? 'Calificar',
          logoUrl: program.logo_url ?? 'https://calificar.com.ar/logo.png',
          hexBgColor: program.color_primary ?? '#7C3AED',
          stampsGoal: program.stamps_goal,
          rewardDescription: program.reward_description,
          lat: enabled && lat ? lat : undefined,
          lng: enabled && lng ? lng : undefined,
        })
      } catch (walletErr) {
        console.error('Wallet sync error (non-fatal):', walletErr)
        // No fallar — la DB ya se guardó
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('proximity route error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const { data } = await admin
    .from('loyalty_programs')
    .select('proximity_message, location_lat, location_lng, location_label, proximity_enabled')
    .eq('id', program_id)
    .single()

  return NextResponse.json(data ?? {})
}
