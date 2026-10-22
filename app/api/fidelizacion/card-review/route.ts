/**
 * POST /api/fidelizacion/card-review
 * El cliente avisa desde su tarjeta que dejó la reseña en Google (queda esperando la captura).
 * Después de esto el aviso no se le vuelve a mostrar.
 *
 * Body: { card_id }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { card_id } = await req.json().catch(() => ({}))
  if (!card_id) return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })

  const { error } = await admin
    .from('loyalty_cards')
    .update({ review_state: 'claimed', review_claimed_at: new Date().toISOString() })
    .eq('id', card_id)
    .is('review_state', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
