import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { code, destination_url, label } = await req.json()
  if (!code) return NextResponse.json({ error: 'Falta code' }, { status: 400 })

  const serviceClient = createServiceClient()

  // Verificar que el QR pertenece al usuario
  const { data: existing } = await serviceClient
    .from('qr_redirects').select('owner_id').eq('code', code).single()
  if (!existing || existing.owner_id !== user.id)
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const updates: Record<string, unknown> = {}
  if (destination_url !== undefined) updates.google_url = destination_url || null
  if (label !== undefined) updates.label = label || null

  const { error } = await serviceClient
    .from('qr_redirects').update(updates).eq('code', code)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
