/**
 * GET /api/negocio/clients
 * Devuelve los clientes del programa del negocio autenticado.
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

  // Obtener el perfil con business_id
  const { data: profile } = await admin
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'business' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
  }

  const businessId = profile.business_id
  if (!businessId) return NextResponse.json({ error: 'Sin negocio asignado' }, { status: 400 })

  // Buscar el programa del negocio
  const { data: program } = await admin
    .from('loyalty_programs')
    .select('id, name, stamps_goal, reward_description, color_primary')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!program) return NextResponse.json({ program: null, clients: [] })

  const { data: clients } = await admin
    .from('loyalty_cards')
    .select('id, name, phone, stamps, total_visits, created_at')
    .eq('program_id', program.id)
    .order('stamps', { ascending: false })

  return NextResponse.json({ program, clients: clients ?? [] })
}
