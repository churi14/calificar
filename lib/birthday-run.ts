/**
 * Campaña de cumpleaños de un programa: genera el cupón del día y avisa al cliente.
 * La usan el botón manual del panel (PUT /api/fidelizacion/birthday) y el cron diario (/api/cron/birthday).
 * Todo en hora de Argentina.
 */
import { createClient } from '@supabase/supabase-js'
import { canUse } from '@/lib/plan-features'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TZ = 'America/Argentina/Buenos_Aires'

function generateCode(name: string): string {
  const prefix = (name || 'CLI').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `CUMPLE-${prefix}-${rand}`
}

/** Plan del negocio dueño del programa ('trial' si no se encuentra) */
export async function programPlan(programId: string): Promise<string> {
  const { data } = await admin.from('loyalty_programs').select('businesses(plan)').eq('id', programId).single()
  const raw = data?.businesses as { plan?: string | null } | { plan?: string | null }[] | null | undefined
  const biz = Array.isArray(raw) ? raw[0] : raw
  return biz?.plan ?? 'trial'
}

export async function runBirthdayCampaign(programId: string): Promise<{ generated: number; message?: string }> {
  const { data: cfg } = await admin.from('birthday_campaigns').select('*').eq('program_id', programId).single()
  if (!cfg?.enabled) return { generated: 0, message: 'Campaña desactivada' }
  if (!canUse(await programPlan(programId), 'birthday')) {
    return { generated: 0, message: 'El plan actual no incluye campañas de cumpleaños' }
  }

  // Hoy en Argentina: 'YYYY-MM-DD'
  const todayAR = new Date().toLocaleDateString('en-CA', { timeZone: TZ })
  const [year, mm, dd] = todayAR.split('-').map(Number)

  const { data: cards } = await admin
    .from('loyalty_cards')
    .select('id, name, phone, birth_date')
    .eq('program_id', programId)
    .not('active', 'is', false)
    .not('birth_date', 'is', null)

  const birthdayCards = (cards ?? []).filter(c => {
    const [, bm, bd] = String(c.birth_date).split('-').map(Number)
    return bm === mm && bd === dd
  })

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'
  let generated = 0

  for (const card of birthdayCards) {
    // Un cupón por cliente por año
    const { data: existing } = await admin.from('birthday_coupons')
      .select('id').eq('card_id', card.id).eq('year', year).maybeSingle()
    if (existing) continue

    const code = generateCode(card.name ?? '')
    const validUntil = new Date(Date.parse(`${todayAR}T12:00:00-03:00`) + 30 * 86_400_000)
      .toLocaleDateString('en-CA', { timeZone: TZ })

    const { error: insErr } = await admin.from('birthday_coupons').insert({
      card_id: card.id,
      program_id: programId,
      coupon_code: code,
      year,
      valid_from: todayAR,
      valid_until: validUntil,
    })
    if (insErr) continue

    if (cfg.message_day0) {
      const msg = String(cfg.message_day0)
        .replace('{codigo}', code)
        .replace('{nombre}', (card.name ?? '').split(' ')[0] ?? '')
      await fetch(`${base}/api/fidelizacion/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cron-secret': process.env.CRON_SECRET ?? '' },
        body: JSON.stringify({
          program_id: programId,
          card_id: card.id,
          title: '🎂 ¡Feliz cumpleaños!',
          body: msg,
          url: '/fidelizacion/tarjeta',
        }),
      }).catch(() => {})
    }

    generated++
  }

  return { generated }
}

/** Programas con campaña de cumpleaños activada (para el cron) */
export async function enabledBirthdayPrograms(): Promise<string[]> {
  const { data } = await admin.from('birthday_campaigns').select('program_id').eq('enabled', true)
  return (data ?? []).map(r => r.program_id as string)
}
