import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { PLAN_PRICES_ARS, isBeautyType } from '@/lib/plans'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLANS = {
  beauty:  { name: 'Plan Beauty — Calificar Fidelización',  price: PLAN_PRICES_ARS.beauty },
  starter: { name: 'Plan Starter — Calificar Fidelización', price: PLAN_PRICES_ARS.starter },
  pro:     { name: 'Plan Pro — Calificar Fidelización',     price: PLAN_PRICES_ARS.pro },
  ultimate:{ name: 'Plan Ultimate — Calificar Fidelización',price: PLAN_PRICES_ARS.ultimate },
} as const

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { plan } = await req.json()
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  // El plan Beauty es solo para salones, peluquerías, uñas y estética
  if (plan === 'beauty') {
    const { data: biz } = await serviceClient
      .from('businesses')
      .select('type')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (!isBeautyType(biz?.type as string | null | undefined)) {
      return NextResponse.json({ error: 'El plan Beauty es solo para salones de belleza, peluquerías, uñas y estética.' }, { status: 403 })
    }
  }

  const planData = PLANS[plan as keyof typeof PLANS]
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://calificar.com.ar'

  // El precio sale siempre del servidor (lib/plans.ts): no se acepta ningún monto ni descuento del cliente
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
