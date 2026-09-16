/**
 * GET /api/fidelizacion/admin/coupons?program_id=xxx
 * Devuelve todos los cupones (premios) generados para un programa.
 * Solo para admins de Calificar.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const programId = req.nextUrl.searchParams.get('program_id')
  if (!programId) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select(`
      id,
      coupon_code,
      note,
      created_at,
      redeemed_at,
      loyalty_cards (
        name,
        phone
      )
    `)
    .eq('program_id', programId)
    .eq('type', 'reward')
    .not('coupon_code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ coupons: [] })

  const coupons = (data ?? []).map(t => ({
    id: t.id,
    coupon_code: t.coupon_code,
    note: t.note ?? 'Premio',
    created_at: t.created_at,
    redeemed_at: t.redeemed_at ?? null,
    client_name: (t.loyalty_cards as { name?: string; phone?: string } | null)?.name ?? '—',
    client_phone: (t.loyalty_cards as { name?: string; phone?: string } | null)?.phone ?? '—',
  }))

  return NextResponse.json({ coupons })
}
