/**
 * POST /api/fidelizacion/review-reward
 * El negocio ya vio la captura de la reseña: marca la tarjeta como premiada
 * (una sola vez por cliente) y le suma el sello.
 *
 * Body: { card_id, program_id }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramMember } from '@/lib/business-auth'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { card_id, program_id } = await req.json().catch(() => ({}))
  if (!card_id || !program_id) return NextResponse.json({ error: 'card_id y program_id requeridos' }, { status: 400 })

  const access = await verifyProgramMember(req, program_id)
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Atómico: solo pasa de "claimed" a "rewarded" una vez, así no se carga dos veces el mismo sello
  const { data: marked, error } = await admin
    .from('loyalty_cards')
    .update({ review_state: 'rewarded' })
    .eq('id', card_id)
    .eq('program_id', program_id)
    .eq('review_state', 'claimed')
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!marked || marked.length === 0) {
    return NextResponse.json({ error: 'Este cliente no tiene una reseña pendiente' }, { status: 409 })
  }

  // Sello por la vía de siempre (mismo control de plan, sucursal y premios)
  const stampRes = await fetch(new URL('/api/fidelizacion/stamp', req.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: req.headers.get('authorization') ?? '',
      cookie: req.headers.get('cookie') ?? '',
    },
    body: JSON.stringify({ card_id, program_id, registered_by: 'review' }),
  })

  if (!stampRes.ok) {
    // Si el sello falló, vuelve a pendiente para poder reintentar
    await admin.from('loyalty_cards').update({ review_state: 'claimed' }).eq('id', card_id)
    const body = await stampRes.json().catch(() => ({}))
    return NextResponse.json({ error: body.error ?? 'No se pudo cargar el sello' }, { status: stampRes.status })
  }

  return NextResponse.json({ ok: true })
}
