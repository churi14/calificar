/**
 * GET  /api/fidelizacion/spin-wheel?program_id=xxx          — settings públicos (para mostrar la rueda)
 * GET  /api/fidelizacion/spin-wheel?program_id=xxx&owner=1  — settings completos (dueño)
 * POST /api/fidelizacion/spin-wheel                         — guardar settings (dueño)
 */

import { programCan, planRequiredBody } from '@/lib/program-plan'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { spinPeriodStart, spinNextAt, type SpinFrequency } from '@/lib/spin-period'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEFAULT_PRIZES = [
  { id: '1', label: '2 sellos',           type: 'stamps', value: 2, probability: 25, color: '#7C3AED' },
  { id: '2', label: '1 sello',            type: 'stamps', value: 1, probability: 35, color: '#10B981' },
  { id: '3', label: '¡Premio especial!',  type: 'coupon', value: 0, probability: 10, color: '#F59E0B', coupon_prefix: 'PREMIO' },
  { id: '4', label: 'Suerte próxima vez', type: 'none',   value: 0, probability: 30, color: '#6B7280' },
]

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const isOwner = req.nextUrl.searchParams.get('owner') === '1'
  if (isOwner) {
    const owner = await verifyProgramOwner(req, program_id)
    if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data } = await supabase
    .from('spin_wheel_settings')
    .select('*')
    .eq('program_id', program_id)
    .maybeSingle()

  // Si no hay config guardada, devolver defaults
  const settings = data ?? {
    program_id,
    enabled: false,
    frequency: 'daily',
    prizes: DEFAULT_PRIZES,
  }

  // La ruleta es del plan Ultimate: sin el plan, el cliente no la ve
  const wheelAllowed = await programCan(program_id, 'wheel')

  // Versión pública: no exponer el coupon_prefix
  if (!isOwner) {
    const { prizes, announced_at: _an, ...restRaw } = settings as typeof settings & { announced_at?: string | null }
    const rest = { ...restRaw, enabled: !!restRaw.enabled && wheelAllowed }
    const publicPrizes = (prizes as typeof DEFAULT_PRIZES).map(({ coupon_prefix: _cp, ...p }) => p)

    // Con card_id: ¿esa tarjeta todavía puede girar en este período?
    const card_id = req.nextUrl.searchParams.get('card_id')
    let spinInfo: { can_spin: boolean; next_spin_at: string | null } | null = null
    if (card_id && rest.enabled) {
      const frequency: SpinFrequency = settings.frequency ?? 'daily'
      const { data: recent } = await supabase
        .from('spin_wheel_history')
        .select('id')
        .eq('card_id', card_id)
        .eq('program_id', program_id)
        .gte('spun_at', spinPeriodStart(frequency).toISOString())
        .limit(1)
        .maybeSingle()
      spinInfo = recent
        ? { can_spin: false, next_spin_at: spinNextAt(frequency).toISOString() }
        : { can_spin: true, next_spin_at: null }
    }

    return NextResponse.json({ settings: { ...rest, prizes: publicPrizes }, ...(spinInfo ?? {}) })
  }

  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { program_id, enabled, frequency, prizes } = body

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (enabled && !(await programCan(program_id, 'wheel'))) {
    return NextResponse.json(planRequiredBody('Ultimate'), { status: 403 })
  }

  if (!Array.isArray(prizes) || prizes.length < 2) {
    return NextResponse.json({ error: 'Necesitás al menos 2 premios' }, { status: 400 })
  }

  // Estado previo, para avisar a los clientes solo la primera vez que se activa.
  // Si la columna announced_at todavía no existe (migración pendiente), no se avisa.
  const { data: prev, error: prevErr } = await supabase
    .from('spin_wheel_settings')
    .select('enabled, announced_at')
    .eq('program_id', program_id)
    .maybeSingle()
  const canAnnounce = !prevErr && !prev?.announced_at

  const { error } = await supabase
    .from('spin_wheel_settings')
    .upsert({
      program_id,
      enabled: !!enabled,
      frequency: frequency ?? 'daily',
      prizes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'program_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Primera activación → push a todos los clientes suscriptos (una sola vez)
  let announced: number | null = null
  if (enabled && canAnnounce) {
    try {
      const { data: prog } = await supabase
        .from('loyalty_programs')
        .select('name, businesses(name)')
        .eq('id', program_id)
        .single()
      const bizRaw = prog?.businesses as { name?: string } | { name?: string }[] | null | undefined
      const biz = Array.isArray(bizRaw) ? bizRaw[0] : bizRaw
      const bizName = biz?.name ?? prog?.name ?? 'tu local'

      const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'
      const res = await fetch(`${BASE}/api/fidelizacion/push/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.CRON_SECRET ?? '',
        },
        body: JSON.stringify({
          program_id,
          title: '🎰 ¡Ruleta de la suerte!',
          body: `Ya podés girar y ganar premios en ${bizName}. ¡Probá tu suerte!`,
          url: `/t/${program_id}#ruleta`,
        }),
      })
      if (res.ok) {
        const d = await res.json().catch(() => ({}))
        announced = d.sent ?? 0
        await supabase
          .from('spin_wheel_settings')
          .update({ announced_at: new Date().toISOString() })
          .eq('program_id', program_id)
      }
    } catch { /* el aviso es opcional: si falla, no rompe el guardado */ }
  }

  return NextResponse.json({ ok: true, announced })
}
