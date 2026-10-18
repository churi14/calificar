/**
 * GET  /api/fidelizacion/reactivation?program_id=xxx  → config actual
 * POST /api/fidelizacion/reactivation                 → guardar config
 * PUT  /api/fidelizacion/reactivation                 → trigger manual / cron
 *
 * La lógica del PUT:
 *   1) Para cada trigger habilitado (5/15/30 días), busca clientes cuyo
 *      último sello fue exactamente hace N días y que NO hayan recibido
 *      este mismo trigger hoy. Les manda push y registra el log.
 *   2) Si está activo el aviso "según la frecuencia" (smart_enabled), busca
 *      clientes que ya pasaron SU ritmo habitual (cards_overdue) y les avisa una
 *      sola vez por ausencia (trigger_days = 0 en el log).
 *
 * GET con ?smart_preview=1&factor=2 devuelve cuántos clientes están pasados hoy.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'

const DEFAULT_MESSAGES: Record<number, { title: string; body: string }> = {
  5:  { title: '¡Te extrañamos!', body: 'Hace 5 días que no pasás. Tu tarjeta te espera 🎁' },
  15: { title: '¿Todo bien?',     body: 'Hace 15 días que no te vemos. Volvé y seguí sumando sellos ✨' },
  30: { title: 'Un mes sin verte', body: 'Hace un mes que no pasás. ¡Tu próximo sello puede acercarte al premio! 🏆' },
}

const SMART_DEFAULT_MESSAGE = '¡Hola {nombre}! Hace un tiempito que no te vemos. Tu tarjeta te espera 🎁'
const SMART_TITLE = 'Te extrañamos'

type Overdue = { card_id: string; name: string | null; avg_gap: number; days_since: number; last_stamp: string }

const clampFactor = (f: unknown) => {
  const n = Number(f)
  return Number.isFinite(n) ? Math.min(5, Math.max(1.2, n)) : 2
}

/** Arma el texto del push: reemplaza {nombre} por el primer nombre y limpia los espacios si falta */
function smartBody(template: string | null | undefined, name: string | null): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? ''
  return (template?.trim() || SMART_DEFAULT_MESSAGE)
    .replace(/\{nombre\}/gi, first)
    .replace(/\s+([!,.?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const TZ = 'America/Argentina/Buenos_Aires'

/** Fecha 'YYYY-MM-DD' en hora de Argentina, restando `daysAgo` días */
function arDate(daysAgo = 0): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

// ── GET: leer configuración ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Vista previa del aviso "según la frecuencia": quiénes ya pasaron su ritmo hoy
  if (req.nextUrl.searchParams.get('smart_preview') === '1') {
    const { data, error } = await admin.rpc('cards_overdue', {
      p_program_id: program_id,
      p_factor: clampFactor(req.nextUrl.searchParams.get('factor')),
    })
    if (error) return NextResponse.json({ available: false, count: 0, sample: [] })
    const rows = (data ?? []) as Overdue[]
    return NextResponse.json({
      available: true,
      count: rows.length,
      sample: rows.slice(0, 5).map(r => ({ name: r.name, avg_gap: r.avg_gap, days_since: r.days_since })),
    })
  }

  const { data, error } = await admin
    .from('reactivation_campaigns')
    .select('*')
    .eq('program_id', program_id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ config: data ?? null })
}

// ── POST: guardar configuración ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    program_id,
    enabled,
    trigger_5_enabled, trigger_15_enabled, trigger_30_enabled,
    message_5, message_15, message_30,
    send_hour,
    smart_enabled, smart_factor, smart_message,
  } = body

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const hour = Number.isInteger(send_hour) && send_hour >= 0 && send_hour <= 23 ? send_hour : 10

  const row = {
    program_id,
    enabled: enabled ?? false,
    trigger_5_enabled:  trigger_5_enabled  ?? true,
    trigger_15_enabled: trigger_15_enabled ?? true,
    trigger_30_enabled: trigger_30_enabled ?? false,
    message_5:  message_5  ?? null,
    message_15: message_15 ?? null,
    message_30: message_30 ?? null,
    updated_at: new Date().toISOString(),
  }

  const smart = {
    smart_enabled: smart_enabled ?? false,
    smart_factor: clampFactor(smart_factor),
    smart_message: typeof smart_message === 'string' && smart_message.trim() ? smart_message.trim() : null,
  }

  let { error } = await admin.from('reactivation_campaigns')
    .upsert({ ...row, send_hour: hour, ...smart }, { onConflict: 'program_id' })

  // Si faltan columnas nuevas (migración pendiente), guardar el resto igual
  let sendHourSaved = true
  let smartSaved = true
  if (error && /smart_/.test(error.message)) {
    smartSaved = false
    ;({ error } = await admin.from('reactivation_campaigns')
      .upsert({ ...row, send_hour: hour }, { onConflict: 'program_id' }))
  }
  if (error && /send_hour/.test(error.message)) {
    sendHourSaved = false
    ;({ error } = await admin.from('reactivation_campaigns').upsert(row, { onConflict: 'program_id' }))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, send_hour_saved: sendHourSaved, smart_saved: smartSaved })
}

// ── PUT: ejecutar trigger (llamado por cron o manual) ─────────────────────────
export async function PUT(req: NextRequest) {
  const { program_id } = await req.json()
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  // Verificar auth: owner O cron secret
  const cronSecret = req.headers.get('x-cron-secret')
  const isCron = cronSecret && cronSecret === process.env.CRON_SECRET
  if (!isCron) {
    const owner = await verifyProgramOwner(req, program_id)
    if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: cfg } = await admin
    .from('reactivation_campaigns')
    .select('*')
    .eq('program_id', program_id)
    .single()

  if (!cfg?.enabled) return NextResponse.json({ ok: true, sent: 0, message: 'Campaña desactivada' })

  const triggers: number[] = []
  if (cfg.trigger_5_enabled)  triggers.push(5)
  if (cfg.trigger_15_enabled) triggers.push(15)
  if (cfg.trigger_30_enabled) triggers.push(30)

  let totalSent = 0

  for (const days of triggers) {
    const dateStr = arDate(days) // 'YYYY-MM-DD' en hora de Argentina

    // Clientes cuyo último sello fue exactamente hace `days` días
    // Usamos una función RPC o query directa agrupando por card_id
    const { data: candidates } = await admin.rpc('cards_last_stamp_on_date', {
      p_program_id: program_id,
      p_date: dateStr,
    })

    if (!candidates || candidates.length === 0) continue

    // Filtrar los que ya recibieron este trigger hoy
    const today = arDate(0)
    const cardIds = candidates.map((c: { card_id: string }) => c.card_id)

    const { data: alreadySent } = await admin
      .from('reactivation_logs')
      .select('card_id')
      .eq('program_id', program_id)
      .eq('trigger_days', days)
      .eq('sent_date', today)
      .in('card_id', cardIds)

    const alreadySet = new Set((alreadySent ?? []).map((r: { card_id: string }) => r.card_id))
    const toNotify = candidates.filter((c: { card_id: string }) => !alreadySet.has(c.card_id))

    for (const candidate of toNotify) {
      const msgTemplate = cfg[`message_${days}` as keyof typeof cfg] as string | null
      const defaults = DEFAULT_MESSAGES[days]
      const title = defaults.title
      const body  = msgTemplate ?? defaults.body

      // Mandar push individual
      await fetch(`${BASE}/api/fidelizacion/push/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.CRON_SECRET ?? '',
        },
        body: JSON.stringify({
          program_id,
          card_id: candidate.card_id,
          title,
          body,
          url: '/fidelizacion/tarjeta',
        }),
      }).catch(() => {})

      // Registrar log
      await admin.from('reactivation_logs').insert({
        card_id: candidate.card_id,
        program_id,
        trigger_days: days,
        sent_date: today,
      }).then(() => { totalSent++ })
    }
  }

  // ── Aviso según la frecuencia de cada cliente ──
  if (cfg.smart_enabled) {
    const { data: overdue, error: overdueErr } = await admin.rpc('cards_overdue', {
      p_program_id: program_id,
      p_factor: clampFactor(cfg.smart_factor),
    })
    const candidates = (overdueErr ? [] : (overdue ?? [])) as Overdue[]

    if (candidates.length > 0) {
      // Un solo aviso por ausencia: se saltea a quien ya recibió uno después de su último sello
      const { data: prevLogs } = await admin
        .from('reactivation_logs')
        .select('card_id, sent_at')
        .eq('program_id', program_id)
        .eq('trigger_days', 0)
        .in('card_id', candidates.map(c => c.card_id))
      const lastSent = new Map<string, number>()
      for (const l of (prevLogs ?? []) as { card_id: string; sent_at: string }[]) {
        lastSent.set(l.card_id, Math.max(lastSent.get(l.card_id) ?? 0, new Date(l.sent_at).getTime()))
      }
      const today = arDate(0)

      for (const c of candidates) {
        if ((lastSent.get(c.card_id) ?? 0) > new Date(c.last_stamp).getTime()) continue

        await fetch(`${BASE}/api/fidelizacion/push/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': process.env.CRON_SECRET ?? '',
          },
          body: JSON.stringify({
            program_id,
            card_id: c.card_id,
            title: SMART_TITLE,
            body: smartBody(cfg.smart_message, c.name),
            url: '/fidelizacion/tarjeta',
          }),
        }).catch(() => {})

        await admin.from('reactivation_logs').insert({
          card_id: c.card_id,
          program_id,
          trigger_days: 0,
          sent_date: today,
        }).then(() => { totalSent++ })
      }
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent })
}
