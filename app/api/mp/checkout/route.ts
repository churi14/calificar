import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { PLAN_PRICES_ARS, DISCOUNT_WINDOW_DAYS, discountedPrice } from '@/lib/plans'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLANS = {
  starter: { name: 'Plan Starter — Calificar Fidelización', price: PLAN_PRICES_ARS.starter },
  pro:     { name: 'Plan Pro — Calificar Fidelización',     price: PLAN_PRICES_ARS.pro },
  ultimate:{ name: 'Plan Ultimate — Calificar Fidelización',price: PLAN_PRICES_ARS.ultimate },
} as const

/** Returns true if the business was created within the welcome-offer window (DISCOUNT_WINDOW_DAYS) */
async function isWithinFirstWeek(userId: string): Promise<boolean> {
  const { data: biz } = await serviceClient
    .from('businesses')
    .select('created_at')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!biz?.created_at) return false
  const createdAt = new Date(biz.created_at)
  const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= DISCOUNT_WINDOW_DAYS
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { plan, discount } = await req.json()
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const planData = PLANS[plan as keyof typeof PLANS]
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://calificar.com.ar'

  // Server-side discount validation: only allow inside the welcome-offer window
  let finalPrice: number = planData.price
  let planTitle = planData.name
  if (discount) {
    const eligible = await isWithinFirstWeek(user.id)
    if (!eligible) {
      return NextResponse.json({ error: `La oferta de bienvenida ya terminó: duraba ${DISCOUNT_WINDOW_DAYS} días desde que creaste tu negocio.` }, { status: 403 })
    }
    finalPrice = discountedPrice(planData.price)
    planTitle = planData.name + ' — 50% OFF Primer Mes'
  }

  const preference = {
    items: [{
      title:      planTitle,
      quantity:   1,
      unit_price: finalPrice,
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
