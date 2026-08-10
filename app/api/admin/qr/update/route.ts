import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { code, business_name, google_url, client_id, notes } = await req.json()
  if (!code) return NextResponse.json({ error: 'Falta code' }, { status: 400 })

  const serviceClient = createServiceClient()

  // Construir el update dinámicamente para no pisar campos no enviados
  const updates: Record<string, unknown> = {}
  if (business_name !== undefined) updates.business_name = business_name || null
  if (google_url !== undefined) updates.google_url = google_url || null
  if (client_id !== undefined) updates.client_id = client_id || null
  if (notes !== undefined) updates.notes = notes || null

  // Si se están editando URL o nombre, marcar como activado si tiene URL
  if (google_url !== undefined) {
    updates.activated = !!google_url
    if (google_url) updates.activated_at = new Date().toISOString()
  }

  const { error } = await serviceClient
    .from('qr_redirects')
    .update(updates)
    .eq('code', code)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
