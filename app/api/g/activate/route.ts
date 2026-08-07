import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code, business_name, google_url } = await req.json()

  if (!code || !business_name || !google_url) {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verificar que el código existe
  const { data: existing } = await supabase
    .from('qr_redirects')
    .select('id, activated')
    .eq('code', code.toUpperCase())
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Código inválido.' }, { status: 404 })
  }

  // Activar
  const { error } = await supabase
    .from('qr_redirects')
    .update({
      business_name,
      google_url,
      activated: true,
      activated_at: new Date().toISOString(),
    })
    .eq('code', code.toUpperCase())

  if (error) {
    return NextResponse.json({ error: 'Error al guardar.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
