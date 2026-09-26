import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLANS = {
  starter: { name: 'Plan Starter — Calificar Fidelización', price: 14999 },
  pro:     { name: 'Plan Pro — Calificar Fidelización',     price: 29999 },
  ultimate:{ name: 'Plan Ultimate — Calificar Fidelización',price: 69999 },
} as const

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { plan } = await req.json()
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const planData = PLANS[plan as keyof typeof PLANS]
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://calificar.com.ar'

  const preference = {
    items: [{
      title:      planData.name,
      quantity:   1,
      unit_price: planData.price,
      currency_id: 'ARS',
    }],
    external_reference: `${user.id}|${plan}`,
    back_urls: {
      success: `${BASE_URL}/fidelizacion/pago-exitoso?plan=${plan}`,
      failure: `${BASE_URL}/fidelizacion/pago-cancelado`,
      pending: `${BASE_URL}/fidelizacion/pago-pendiente`,
    },
    auto_return: 'approved',
    notification_url: `${BASE_URL}/api/mp/webhook`,
    statement_descriptor: 'CALIFICARFIDE',
    expires: false,
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(preference),
  })

  const data = await res.json()
  if (!res.ok) {
    console.error('MP preference error:', data)
    return NextResponse.json({ error: data.message || 'Error MP' }, { status: 500 })
  }

  return NextResponse.json({ init_point: data.init_point })
}
