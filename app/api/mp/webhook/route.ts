import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { PLAN_PRICES_ARS, PLAN_DURATION_DAYS } from '@/lib/plans'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP manda distintos tipos: payment, merchant_order, etc.
    if (body.type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Verificar el pago en la API de MP
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    const payment = await res.json()

    // Solo procesar pagos aprobados
    if (payment.status !== 'approved') {
      console.log(`Pago ${paymentId} status: ${payment.status}, ignorando`)
      return NextResponse.json({ ok: true })
    }

    // external_reference = "userId|plan"
    const ref = payment.external_reference || ''
    const [userId, plan] = ref.split('|')
    if (!userId || !plan) {
      console.error('external_reference inválido:', ref)
      return NextResponse.json({ ok: true })
    }

    // Solo planes que existen (el external_reference lo arma nuestro checkout)
    const planKey = String(plan).toLowerCase()
    if (!(planKey in PLAN_PRICES_ARS)) {
      console.error('Plan inválido en external_reference:', ref)
      return NextResponse.json({ ok: true })
    }

    const supabase = createServiceClient()

    // Idempotencia: Mercado Pago puede avisar dos veces del mismo pago. Si ya lo procesamos, no sumamos días otra vez.
    const { data: profile } = await supabase
      .from('profiles')
      .select('mp_payment_id, plan_expires_at')
      .eq('id', userId)
      .maybeSingle()
    if (profile?.mp_payment_id === String(paymentId)) {
      return NextResponse.json({ ok: true })
    }

    // Vencimiento: 30 días desde hoy; si el plan todavía estaba vigente, desde su vencimiento (pagar antes no pierde días)
    const { data: businesses } = await supabase
      .from('businesses')
      .select('plan_expires_at')
      .eq('owner_user_id', userId)
    const now = Date.now()
    const currentExpiries = [profile?.plan_expires_at, ...(businesses ?? []).map(b => b.plan_expires_at)]
      .filter((d): d is string => !!d)
      .map(d => new Date(d).getTime())
      .filter(t => t > now)
    const base = currentExpiries.length ? Math.max(...currentExpiries) : now
    const expiresAt = new Date(base)
    expiresAt.setDate(expiresAt.getDate() + PLAN_DURATION_DAYS)

    // El panel lee el plan de `businesses`; `profiles` guarda el pago. Se actualizan las dos.
    const { error } = await supabase.from('profiles').update({
      plan: planKey,
      plan_expires_at: expiresAt.toISOString(),
      mp_payment_id:   String(paymentId),
    }).eq('id', userId)

    const { error: bizError } = await supabase.from('businesses').update({
      plan: planKey,
      plan_expires_at: expiresAt.toISOString(),
    }).eq('owner_user_id', userId)

    if (error || bizError) console.error('Error actualizando plan:', error ?? bizError)
    else console.log(`Plan ${planKey} activado para user ${userId}, vence ${expiresAt.toISOString()}`)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    // Siempre devolver 200 a MP para que no reintente
    return NextResponse.json({ ok: true })
  }
}

// MP también manda GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ ok: true })
}
