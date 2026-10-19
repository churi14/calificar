/**
 * GET /api/fidelizacion/wallet-link?card_id=xxx
 * Genera o regenera el link "Agregar a Google Wallet" para una tarjeta.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getWalletLink } from '@/lib/wallet/google-wallet'
import { programCan } from '@/lib/program-plan'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get('card_id')
  if (!cardId) {
    return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })
  }

  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('*, loyalty_programs(id, stamps_goal, reward_description)')
    .eq('id', cardId)
    .single()

  if (!card || !card.wallet_object_id) {
    return NextResponse.json({ error: 'Tarjeta no encontrada o sin objeto Wallet' }, { status: 404 })
  }

  if (!(await programCan(card.loyalty_programs.id, 'wallet'))) {
    return NextResponse.json({ error: 'Google Wallet no está disponible en el plan de este negocio' }, { status: 403 })
  }

  const walletLink = getWalletLink(card.wallet_object_id, card.loyalty_programs.id)

  return NextResponse.json({ wallet_link: walletLink })
}
