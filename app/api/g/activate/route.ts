import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code, business_name, google_url, owner_id } = await req.json()

  if (!code || !business_name || !google_url || typeof google_url !== 'string') {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verificar que el código existe y no está ya activado por otra cuenta
  const { data: existing } = await supabase
    .from('qr_redirects')
    .select('id, activated, owner_id')
    .eq('code', code.toUpperCase())
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Código inválido.' }, { status: 404 })
  }

  // Si ya tiene owner y es distinto al que intenta activar, rechazar
  if (existing.activated && existing.owner_id && owner_id && existing.owner_id !== owner_id) {
    return NextResponse.json({ error: 'Este código ya fue activado por otra cuenta.' }, { status: 403 })
  }

  // Activar — si viene owner_id lo asociamos
  const updatePayload: Record<string, unknown> = {
    business_name,
    google_url,
    activated: true,
    activated_at: new Date().toISOString(),
  }
  if (owner_id) updatePayload.owner_id = owner_id

  const { error } = await supabase
    .from('qr_redirects')
    .update(updatePayload)
    .eq('code', code.toUpperCase())

  if (error) {
    return NextResponse.json({ error: 'Error al guardar.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
