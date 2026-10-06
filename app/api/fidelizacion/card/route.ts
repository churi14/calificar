import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getWalletLink } from '@/lib/wallet/google-wallet'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get('card_id')
  if (!cardId) return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })

  const { data: card, error } = await supabase
    .from('loyalty_cards')
    .select('*, loyalty_programs(id, name, stamps_goal, reward_description, color_primary, card_text_color, logo_url, app_icon_url, stamp_icon_url, card_background_url, page_bg_color, stamp_icon_no_bg, businesses(name, whatsapp_number, plan))')
    .eq('id', cardId)
    .single()

  if (error || !card) return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })

  // Generar wallet link si el dispositivo es Android y tiene wallet_object_id
  let wallet_link: string | null = null
  if (card.wallet_object_id && card.loyalty_programs?.id) {
    try {
      wallet_link = getWalletLink(card.wallet_object_id, card.loyalty_programs.id, {
        customerName: card.name ?? card.phone,
        stamps: card.stamps,
        stampsGoal: card.loyalty_programs.stamps_goal,
        rewardDescription: card.loyalty_programs.reward_description,
      })
    } catch {
      // Si falla la firma, no bloqueamos la respuesta
    }
  }

  return NextResponse.json({ card, wallet_link })
}
