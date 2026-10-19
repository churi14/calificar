/**
 * POST /api/fidelizacion/spin-wheel/spin
 * El cliente gira la ruleta. No requiere auth del negocio — solo card_id válido.
 * Body: { card_id, program_id }
 */

import { programCan, planRequiredBody } from '@/lib/program-plan'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { spinPeriodStart, spinNextAt, type SpinFrequency } from '@/lib/spin-period'
import { couponPrefix } from '@/lib/coupons'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Prize = {
  id: string
  label: string
  type: 'stamps' | 'coupon' | 'none'
  value: number
  probability: number
  color: string
  coupon_prefix?: string
}

function weightedRandom(prizes: Prize[]): Prize {
  const total = prizes.reduce((s, p) => s + (p.probability ?? 1), 0)
  let rand = Math.random() * total
  for (const p of prizes) {
    rand -= p.probability ?? 1
    if (rand <= 0) return p
  }
  return prizes[prizes.length - 1]
}

function genCoupon(prefix: string): string {
  const clean = couponPrefix(prefix)
  const a = Math.random().toString(36).substring(2, 6).toUpperCase()
  const b = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${clean}-${a}-${b}`
}

export async function POST(req: NextRequest) {
  try {
    const { card_id, program_id } = await req.json()
    if (!card_id || !program_id) {
      return NextResponse.json({ error: 'card_id y program_id requeridos' }, { status: 400 })
    }
    // La ruleta es del plan Ultimate (la prueba gratuita la incluye)
    if (!(await programCan(program_id, 'wheel'))) {
      return NextResponse.json(planRequiredBody('Ultimate'), { status: 403 })
    }

    // Verificar que la tarjeta existe y pertenece al programa
    const { data: card } = await supabase
      .from('loyalty_cards')
      .select('id, stamps, active')
      .eq('id', card_id)
      .eq('program_id', program_id)
      .eq('active', true)
      .single()

    if (!card) return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })

    // Verificar configuración de la ruleta
    const { data: settings } = await supabase
      .from('spin_wheel_settings')
      .select('*')
      .eq('program_id', program_id)
      .single()

    if (!settings?.enabled) {
      return NextResponse.json({ error: 'La ruleta no está habilitada' }, { status: 403 })
    }

    const prizes = settings.prizes as Prize[]
    if (!prizes?.length) {
      return NextResponse.json({ error: 'No hay premios configurados' }, { status: 400 })
    }

    // Verificar cooldown — el día/semana arranca a las 00:00 de Argentina
    const frequency: SpinFrequency = settings.frequency ?? 'daily'
    const now = new Date()
    const sinceDate = spinPeriodStart(frequency, now)

    const { data: recentSpin } = await supabase
      .from('spin_wheel_history')
      .select('id, spun_at')
      .eq('card_id', card_id)
      .eq('program_id', program_id)
      .gte('spun_at', sinceDate.toISOString())
      .limit(1)
      .maybeSingle()

    if (recentSpin) {
      return NextResponse.json({
        error: 'Ya giraste hoy',
        cooldown: true,
        next_spin_at: spinNextAt(frequency, now).toISOString(),
      }, { status: 429 })
    }

    // Girar
    const prize = weightedRandom(prizes)

    let couponCode: string | null = null
    let newStamps = card.stamps
    // Hitos o premio final alcanzados por los sellos de la ruleta
    const extraCoupons: { kind: 'milestone' | 'reward'; label: string; code: string }[] = []

    if (prize.type === 'stamps' && prize.value > 0) {
      const { data: program } = await supabase
        .from('loyalty_programs')
        .select('stamps_goal, reward_description, milestones')
        .eq('id', program_id)
        .single()

      const goal: number = program?.stamps_goal ?? Infinity
      const milestones: { at: number; label: string; coupon_prefix?: string }[] = (await programCan(program_id, 'milestones')) ? (program?.milestones ?? []) : []

      // Sumar de a un sello, igual que el escaneo normal: dispara hitos y reinicia al llegar a la meta
      let stamps = card.stamps
      for (let i = 0; i < prize.value; i++) {
        stamps += 1
        if (stamps >= goal) {
          const label = program?.reward_description ?? 'Premio'
          extraCoupons.push({ kind: 'reward', label, code: genCoupon(label) })
          stamps = 0
        } else {
          const hit = milestones.find(m => m.at === stamps)
          if (hit) extraCoupons.push({ kind: 'milestone', label: hit.label, code: genCoupon(hit.coupon_prefix ?? hit.label) })
        }
      }
      newStamps = stamps

      await supabase
        .from('loyalty_cards')
        .update({ stamps: newStamps })
        .eq('id', card_id)

      await supabase.from('loyalty_transactions').insert({
        card_id,
        program_id,
        type: 'stamp',
        amount: prize.value,
        note: `Ruleta: ${prize.label}`,
        registered_by: 'system',
      })

      for (const c of extraCoupons) {
        await supabase.from('loyalty_transactions').insert({
          card_id,
          program_id,
          type: 'reward',
          amount: c.kind === 'reward' ? -goal : 0,
          note: c.label,
          coupon_code: c.code,
          registered_by: 'system',
        })
      }
    } else if (prize.type === 'coupon') {
      couponCode = genCoupon(prize.coupon_prefix ?? prize.label)
      await supabase.from('loyalty_transactions').insert({
        card_id,
        program_id,
        type: 'reward',
        amount: 0,
        note: prize.label,
        coupon_code: couponCode,
        registered_by: 'system',
      })
    }

    // Registrar giro en historial
    await supabase.from('spin_wheel_history').insert({
      card_id,
      program_id,
      prize_label: prize.label,
      prize_type: prize.type,
      prize_value: prize.value ?? 0,
      coupon_code: couponCode,
    })

    return NextResponse.json({
      ok: true,
      prize: {
        label: prize.label,
        type: prize.type,
        value: prize.value,
        color: prize.color,
        coupon_code: couponCode,
      },
      new_stamps: newStamps,
      extra_coupons: extraCoupons,
      prize_index: prizes.findIndex(p => p.id === prize.id),
    })
  } catch (err) {
    console.error('Error en spin-wheel/spin:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
