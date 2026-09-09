/**
 * POST /api/fidelizacion/push/subscribe
 * Guarda la suscripción Web Push de un cliente.
 * Body: { card_id, program_id, subscription: { endpoint, keys: { p256dh, auth } } }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { card_id, program_id, subscription } = await req.json()

  if (!card_id || !program_id || !subscription?.endpoint) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      card_id,
      program_id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }, { onConflict: 'card_id,endpoint' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
