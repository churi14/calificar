import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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

    // Calcular vencimiento (30 días desde hoy)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const supabase = createServiceClient()
    const { error } = await supabase.from('profiles').update({
      plan,
      plan_expires_at: expiresAt.toISOString(),
      mp_payment_id:   String(paymentId),
    }).eq('id', userId)

    if (error) console.error('Error actualizando plan:', error)
    else console.log(`Plan ${plan} activado para user ${userId}, vence ${expiresAt.toISOString()}`)

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
