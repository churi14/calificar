/**
 * POST /api/negocio/stamp
 * El dueño del negocio suma un sello a un cliente manualmente.
 * Body: { card_id, program_id }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
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

  const { card_id, program_id } = await req.json()
  if (!card_id || !program_id) {
    return NextResponse.json({ error: 'card_id y program_id requeridos' }, { status: 400 })
  }

  // Llamamos al mismo endpoint interno de stamp
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/fidelizacion/stamp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card_id, program_id, registered_by: 'manual' }),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
