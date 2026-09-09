/**
 * POST /api/fidelizacion/push/send
 * Envía una notificación push a todos los clientes de un programa.
 * Body: { program_id, title, body, url? }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

function getVapidConfig() {
  return {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
    subject: process.env.VAPID_SUBJECT!,
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { program_id, title, body, url } = await req.json()

  if (!program_id || !title || !body) {
    return NextResponse.json({ error: 'program_id, title y body son requeridos' }, { status: 400 })
  }

  const vapid = getVapidConfig()
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  // Traer todas las suscripciones del programa
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('program_id', program_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Sin suscriptores' })
  }

  const payload = JSON.stringify({ title, body, url: url || '/fidelizacion/tarjeta' })

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )

  // Limpiar suscripciones que ya no son válidas (410 Gone)
  const expired: string[] = []
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const err = r.reason as { statusCode?: number }
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        expired.push(subs[i].id)
      }
    }
  })
  if (expired.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', expired)
  }

  const sent = results.filter(r => r.status === 'fulfilled').length

  return NextResponse.json({ ok: true, sent, total: subs.length })
}
