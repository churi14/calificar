/**
 * GET /api/fidelizacion/admin/coupons?program_id=xxx
 * Devuelve todos los cupones (premios) generados para un programa.
 * Solo para admins de Calificar.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** ¿Es un admin de Calificar? (Bearer o cookie de sesión del panel admin) */
async function isCalificarAdmin(req: NextRequest): Promise<boolean> {
  let userId: string | null = null

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    const { data: { user } } = await supabase.auth.getUser(auth.slice(7))
    userId = user?.id ?? null
  }

  if (!userId) {
    try {
      const cookieStore = await cookies()
      const serverClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { /* read-only */ } } }
      )
      const { data: { user } } = await serverClient.auth.getUser()
      userId = user?.id ?? null
    } catch { /* sin sesión */ }
  }

  if (!userId) return false
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return profile?.role === 'admin'
}

export async function GET(req: NextRequest) {
  const programId = req.nextUrl.searchParams.get('program_id')
  if (!programId) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  // Solo el dueño del programa o un admin de Calificar
  const owner = await verifyProgramOwner(req, programId)
  if (!owner && !(await isCalificarAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

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
