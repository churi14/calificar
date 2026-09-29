/**
 * GET /api/fidelizacion/my-programs
 * Devuelve los programas de fidelización del usuario autenticado.
 * Filtra por owner_user_id en businesses para que cada negocio
 * solo vea SUS propios programas.
 */
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // 1. Identificar el usuario autenticado
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // 2. Traer los negocios que le pertenecen
  const { data: businesses, error: bizError } = await serviceClient
    .from('businesses')
    .select('id')
    .eq('owner_user_id', user.id)

  if (bizError) return NextResponse.json({ error: bizError.message }, { status: 500 })
  if (!businesses || businesses.length === 0) {
    return NextResponse.json({ programs: [], email: user.email })
  }

  const bizIds = businesses.map(b => b.id)

  // 3. Traer los programas de esos negocios
  const { data: programs, error } = await serviceClient
    .from('loyalty_programs')
    .select(`
      *,
      businesses(name, id, plan, plan_expires_at, created_at),
      loyalty_cards(count)
    `)
    .in('business_id', bizIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ programs: programs ?? [], email: user.email })
}
