/**
 * GET /api/negocio/coupons
 * Devuelve los cupones generados del programa del negocio autenticado.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await admin
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'business' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
  }

  if (!profile.business_id) return NextResponse.json({ error: 'Sin negocio asignado' }, { status: 400 })

  // Obtener el programa activo del negocio
  const { data: program } = await admin
    .from('loyalty_programs')
    .select('id')
    .eq('business_id', profile.business_id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!program) return NextResponse.json({ coupons: [] })

  const { data } = await admin
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
    .eq('program_id', program.id)
    .eq('type', 'reward')
    .not('coupon_code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100)

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
