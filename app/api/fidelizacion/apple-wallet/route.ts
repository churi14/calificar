/**
 * GET /api/fidelizacion/apple-wallet?card_id=xxx
 * Genera y devuelve un archivo .pkpass para Apple Wallet.
 *
 * Variables de entorno necesarias (ver lib/wallet/apple-wallet.ts):
 *   APPLE_PASS_TYPE_IDENTIFIER, APPLE_TEAM_IDENTIFIER,
 *   APPLE_SIGNER_CERT, APPLE_SIGNER_KEY, APPLE_SIGNER_KEY_PASSPHRASE, APPLE_WWDR_CERT
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createApplePass } from '@/lib/wallet/apple-wallet'
import { programCan } from '@/lib/program-plan'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get('card_id')
  if (!cardId) {
    return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })
  }

  // Verificar que los certificados están configurados
  if (!process.env.APPLE_SIGNER_CERT || !process.env.APPLE_WWDR_CERT) {
    return NextResponse.json(
      { error: 'Apple Wallet no configurado en este servidor' },
      { status: 503 }
    )
  }

  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('id, name, phone, stamps, active, loyalty_programs(id, name, stamps_goal, reward_description, color_primary, card_text_color, logo_url, businesses(name))')
    .eq('id', cardId)
    .single()

  if (!card || !card.active) {
    return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
  }

  const rawProgram = card.loyalty_programs
  const program = Array.isArray(rawProgram) ? rawProgram[0] : rawProgram as {
    id: string
    name: string
    stamps_goal: number
    reward_description: string
    color_primary: string | null
    card_text_color: string | null
    logo_url: string | null
    businesses: { name: string }[] | { name: string } | null
  } | null

  if (!program) {
    return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
  }

  if (!(await programCan(program.id, 'wallet'))) {
    return NextResponse.json({ error: 'Apple Wallet no está disponible en el plan de este negocio' }, { status: 403 })
  }

  try {
    const pkpassBuffer = await createApplePass({
      serialNumber: card.id,
      customerName: card.name ?? card.phone ?? 'Cliente',
      stamps: card.stamps ?? 0,
      stampsGoal: program.stamps_goal ?? 10,
      rewardDescription: program.reward_description ?? 'Premio',
      programName: program.name ?? 'Programa de fidelización',
      businessName: (Array.isArray(program.businesses) ? program.businesses[0]?.name : (program.businesses as { name: string } | null)?.name) ?? 'Negocio',
      primaryColor: program.color_primary ?? '#7C3AED',
      textColor: program.card_text_color ?? '#FFFFFF',
      logoUrl: program.logo_url,
      programId: program.id,
    })

    return new NextResponse(new Uint8Array(pkpassBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="calificar-${card.id.substring(0, 8)}.pkpass"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Error generando .pkpass:', err)
    return NextResponse.json({ error: 'Error generando el pase' }, { status: 500 })
  }
}
