/**
 * GET /api/fidelizacion/card-coupons?card_id=xxx
 * Devuelve los cupones de premios intermedios (milestones) de una tarjeta.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get('card_id')
  if (!cardId) return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })

  // Traer transacciones de tipo reward con coupon_code (milestones y premios finales)
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('note, coupon_code, created_at')
    .eq('card_id', cardId)
    .eq('type', 'reward')
    .not('coupon_code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ coupons: [] })

  const coupons = (data ?? []).map(t => ({
    label: t.note ?? 'Premio',
    code: t.coupon_code,
    created_at: t.created_at,
  }))

  return NextResponse.json({ coupons })
}
