/**
 * POST /api/fidelizacion/admin/create-business
 * Crea un negocio nuevo rápidamente desde el panel admin.
 * Body: { name }
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
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  // Generar slug único
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const slug = `${base}-${Date.now().toString(36)}`

  const { data, error } = await admin
    .from('businesses')
    .insert({
      name: name.trim(),
      owner_id: user.id,
      slug,
      google_review_url: '',
      whatsapp_number: '',
      negative_redirect: 'whatsapp',
      threshold: 3,
      primary_color: '#111111',
      accent_color: '#F59E0B',
    })
    .select('id, name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ business: data })
}
