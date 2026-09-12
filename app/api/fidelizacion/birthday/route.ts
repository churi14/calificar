/**
 * GET  /api/fidelizacion/birthday?program_id=xxx  → config + stats
 * POST /api/fidelizacion/birthday                 → guardar config
 * PUT  /api/fidelizacion/birthday                 → trigger manual (generar cupones hoy)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateCode(name: string): string {
  const prefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `CUMPLE-${prefix}-${rand}`
}

// ── GET: config + cumpleaños próximos + cupones activos ───────────────────────
export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const [configRes, couponsRes, cardsRes] = await Promise.all([
    admin.from('birthday_campaigns').select('*').eq('program_id', program_id).single(),
    admin.from('birthday_coupons').select('*, loyalty_cards(name, phone)')
      .eq('program_id', program_id)
      .gte('valid_until', new Date().toISOString().slice(0, 10))
      .order('valid_from', { ascending: true }),
    admin.from('loyalty_cards').select('id, name, birth_date')
      .eq('program_id', program_id)
      .not('birth_date', 'is', null),
  ])

  // Cumpleaños este mes y próximos 30 días
  const today = new Date()
  const upcoming = (cardsRes.data ?? []).filter(c => {
    if (!c.birth_date) return false
    const bd = new Date(c.birth_date)
    const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate())
    const diff = Math.floor((thisYear.getTime() - today.getTime()) / 86400000)
    return diff >= 0 && diff <= 30
  }).sort((a, b) => {
    const da = new Date(a.birth_date!), db = new Date(b.birth_date!)
    const aDay = new Date(today.getFullYear(), da.getMonth(), da.getDate())
    const bDay = new Date(today.getFullYear(), db.getMonth(), db.getDate())
    return aDay.getTime() - bDay.getTime()
  })

  return NextResponse.json({
    config: configRes.data ?? null,
    active_coupons: couponsRes.data ?? [],
    upcoming_birthdays: upcoming,
    total_with_birthday: cardsRes.data?.length ?? 0,
  })
}

// ── POST: guardar configuración ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { program_id, enabled, discount_type, discount_value, message_day0, message_mid, message_last } = body

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const { error } = await admin.from('birthday_campaigns').upsert({
    program_id,
    enabled: enabled ?? false,
    discount_type: discount_type ?? 'percent',
    discount_value: discount_value ?? 20,
    message_day0: message_day0 ?? null,
    message_mid: message_mid ?? null,
    message_last: message_last ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'program_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ── PUT: trigger — generar cupones para cumpleaños de hoy ─────────────────────
export async function PUT(req: NextRequest) {
  const { program_id } = await req.json()
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  // Leer config
  const { data: cfg } = await admin.from('birthday_campaigns').select('*').eq('program_id', program_id).single()
  if (!cfg?.enabled) return NextResponse.json({ ok: true, generated: 0, message: 'Campaña desactivada' })

  const today = new Date()
  const mm = today.getMonth() + 1
  const dd = today.getDate()
  const year = today.getFullYear()

  // Buscar clientes cuyo cumpleaños es hoy
  const { data: cards } = await admin
    .from('loyalty_cards')
    .select('id, name, phone, birth_date')
    .eq('program_id', program_id)
    .not('birth_date', 'is', null)

  const birthdayCards = (cards ?? []).filter(c => {
    const bd = new Date(c.birth_date)
    return bd.getMonth() + 1 === mm && bd.getDate() === dd
  })

  let generated = 0
  for (const card of birthdayCards) {
    // Verificar si ya existe cupón este año
    const { data: existing } = await admin.from('birthday_coupons')
      .select('id').eq('card_id', card.id).eq('year', year).single()
    if (existing) continue

    const code = generateCode(card.name)
    const validFrom = today.toISOString().slice(0, 10)
    const validUntil = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10)

    await admin.from('birthday_coupons').insert({
      card_id: card.id,
      program_id,
      coupon_code: code,
      year,
      valid_from: validFrom,
      valid_until: validUntil,
    })

    // Enviar push del día 0
    if (cfg.message_day0) {
      const msg = cfg.message_day0.replace('{codigo}', code).replace('{nombre}', card.name.split(' ')[0])
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/api/fidelizacion/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id,
          card_id: card.id,
          title: '🎂 ¡Feliz cumpleaños!',
          body: msg,
        }),
      }).catch(() => {})
    }

    generated++
  }

  return NextResponse.json({ ok: true, generated })
}
