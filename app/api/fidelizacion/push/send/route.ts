/**
 * POST /api/fidelizacion/push/send
 * Envía una notificación push a todos los clientes de un programa.
 * Body: { program_id, title, body, url? }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { verifyProgramOwner } from '@/lib/business-auth'

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
  const { program_id, card_id, title, body, url } = await req.json()

  if (!program_id || !title || !body) {
    return NextResponse.json({ error: 'program_id, title y body son requeridos' }, { status: 400 })
  }

  // Verificar que el usuario autenticado es dueño del programa
  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Obtener logo del negocio (para el ícono de la notificación)
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('logo_url, app_icon_url, businesses(plan, plan_expires_at)')
    .eq('id', program_id)
    .single()

  const bizRaw = program?.businesses
  const biz = (Array.isArray(bizRaw) ? bizRaw[0] : bizRaw) as { plan?: string | null; plan_expires_at?: string | null } | null
  const isProPlus = ['pro', 'ultimate', 'gifted'].includes((biz?.plan ?? '').toLowerCase())
    && (!biz?.plan_expires_at || new Date(biz.plan_expires_at) > new Date())
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'
  // Usar app_icon_url si existe, sino logo_url — URL directa de CDN para que cargue rápido
  const iconUrl = isProPlus
    ? (program?.app_icon_url || program?.logo_url || `${BASE}/notification-icon.png`)
    : `${BASE}/notification-icon.png`

  const vapid = getVapidConfig()
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  // Traer suscripciones con nombre del cliente: individual (card_id) o todas las del programa
  let query = supabase
    .from('push_subscriptions')
    .select('*, loyalty_cards(name, phone)')
    .eq('program_id', program_id)
  if (card_id) query = query.eq('card_id', card_id)
  const { data: subs, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Sin suscriptores' })
  }

  const payload = JSON.stringify({ title, body, icon: iconUrl, url: url || '/fidelizacion/tarjeta' })

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

  // Construir lista de destinatarios: nombre + resultado
  type SubWithCard = typeof subs[number] & { loyalty_cards?: { name?: string; phone?: string } | null }
  const recipients = (subs as SubWithCard[]).map((sub, i) => ({
    name: sub.loyalty_cards?.name ?? 'Cliente',
    phone: sub.loyalty_cards?.phone ?? '',
    ok: results[i].status === 'fulfilled',
  }))

  // Guardar log (solo para pushes masivos del negocio, no los de cumpleaños individuales)
  if (!card_id && sent > 0) {
    await supabase.from('push_logs').insert({
      program_id,
      title,
      body,
      sent_to: sent,
    })
  }

  return NextResponse.json({ ok: true, sent, total: subs.length, recipients })
}
