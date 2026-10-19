/**
 * GET /api/fidelizacion/my-programs
 * Devuelve los programas de fidelización del usuario autenticado.
 * Filtra por owner_user_id en businesses para que cada negocio
 * solo vea SUS propios programas.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { canUse } from '@/lib/plan-features'

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  // 1. Identificar el usuario autenticado (cookie o Bearer token)
  let user = null
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const { data } = await anonClient.auth.getUser(authHeader.substring(7))
    user = data.user
  }
  if (!user) {
    const supabase = await createServerClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  }
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // 2. Traer los negocios que le pertenecen (solo activos)
  const { data: businesses, error: bizError } = await serviceClient
    .from('businesses')
    .select('id')
    .eq('owner_user_id', user.id)
    .eq('active', true)

  if (bizError) return NextResponse.json({ error: bizError.message }, { status: 500 })

  // Negocios donde la persona es parte del equipo (plan con equipo); se identifica por su email confirmado
  const ownedIds = new Set((businesses ?? []).map(b => b.id as string))
  const memberBranch = new Map<string, string | null>()
  const email = (user.email ?? '').toLowerCase()
  if (email && user.email_confirmed_at) {
    const { data: rows } = await serviceClient
      .from('business_members')
      .select('business_id, branch_id')
      .eq('email', email)
    const memberIds = (rows ?? []).map(r => r.business_id as string).filter(id => !ownedIds.has(id))
    if (memberIds.length > 0) {
      const { data: plans } = await serviceClient
        .from('businesses')
        .select('id, plan')
        .in('id', memberIds)
        .eq('active', true)
      const allowed = new Set((plans ?? []).filter(b => canUse(b.plan as string | null, 'team')).map(b => b.id as string))
      for (const r of rows ?? []) {
        if (allowed.has(r.business_id as string)) memberBranch.set(r.business_id as string, (r.branch_id as string | null) ?? null)
      }
    }
  }

  const bizIds = [...ownedIds, ...memberBranch.keys()]
  if (bizIds.length === 0) {
    return NextResponse.json({ programs: [], email: user.email })
  }

  // 3. Traer los programas de esos negocios
  const { data: programs, error } = await serviceClient
    .from('loyalty_programs')
    .select(`
      *,
      businesses(name, id, plan, plan_expires_at, created_at),
      loyalty_cards(count)
    `)
    .in('business_id', bizIds)
    .eq('active', true)
    // El más antiguo primero: es el programa principal y el que abre el panel por defecto
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cada programa indica el rol de quien consulta: dueño o equipo (y su sucursal fija, si tiene)
  const withRole = (programs ?? []).map(p => {
    const bid = p.business_id as string
    return ownedIds.has(bid)
      ? { ...p, role: 'owner' as const, member_branch_id: null }
      : { ...p, role: 'staff' as const, member_branch_id: memberBranch.get(bid) ?? null }
  })

  return NextResponse.json({ programs: withRole, email: user.email })
}
