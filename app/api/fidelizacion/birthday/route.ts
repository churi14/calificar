/**
 * GET  /api/fidelizacion/birthday?program_id=xxx  → config + stats
 * POST /api/fidelizacion/birthday                 → guardar config
 * PUT  /api/fidelizacion/birthday                 → trigger manual (generar cupones hoy)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { canUse } from '@/lib/plan-features'
import { programPlan, runBirthdayCampaign } from '@/lib/birthday-run'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET: config + cumpleaños próximos + cupones activos ───────────────────────
export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
  if (!(await verifyProgramOwner(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
  if (!(await verifyProgramOwner(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (enabled && !canUse(await programPlan(program_id), 'birthday')) {
    return NextResponse.json({ error: 'Las campañas de cumpleaños son del plan Pro en adelante', upgrade_required: true }, { status: 403 })
  }

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

// ── PUT: generar hoy los cupones de cumpleaños (botón del panel; el cron diario usa /api/cron/birthday) ──
export async function PUT(req: NextRequest) {
  const { program_id } = await req.json()
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const cronSecret = req.headers.get('x-cron-secret')
  const isCron = !!cronSecret && cronSecret === process.env.CRON_SECRET
  if (!isCron && !(await verifyProgramOwner(req, program_id))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const result = await runBirthdayCampaign(program_id)
  return NextResponse.json({ ok: true, ...result })
}
