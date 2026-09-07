import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get('card_id')
  if (!cardId) return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })

  const { data: card, error } = await supabase
    .from('loyalty_cards')
    .select('*, loyalty_programs(name, stamps_goal, reward_description, color_primary, logo_url, businesses(name))')
    .eq('id', cardId)
    .single()

  if (error || !card) return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })

  return NextResponse.json({ card })
}
