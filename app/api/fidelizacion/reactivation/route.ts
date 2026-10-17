/**
 * GET  /api/fidelizacion/reactivation?program_id=xxx  → config actual
 * POST /api/fidelizacion/reactivation                 → guardar config
 * PUT  /api/fidelizacion/reactivation                 → trigger manual / cron
 *
 * La lógica del PUT:
 *   Para cada trigger habilitado (5/15/30 días), busca clientes cuyo
 *   último sello fue exactamente hace N días y que NO hayan recibido
 *   este mismo trigger hoy. Les manda push y registra el log.
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

  let { error } = await admin.from('reactivation_campaigns')
    .upsert({ ...row, send_hour: hour }, { onConflict: 'program_id' })

  // Si la columna send_hour todavía no existe (migración pendiente), guardar el resto igual
  if (error && /send_hour/.test(error.message)) {
    ;({ error } = await admin.from('reactivation_campaigns').upsert(row, { onConflict: 'program_id' }))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
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

  return NextResponse.json({ ok: true, sent: totalSent })
}
