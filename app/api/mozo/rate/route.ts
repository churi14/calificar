import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { code, stars, comment } = await req.json()

  if (!code || !stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('mozo_ratings')
    .insert({ code, stars, comment: comment?.trim() || null })

  if (error) {
    console.error('mozo_ratings insert error:', error)
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  }

  // Fetch google_url to redirect after
  const { data } = await supabase
    .from('qr_redirects')
    .select('google_url')
    .eq('code', code)
    .single()

  return NextResponse.json({ ok: true, google_url: data?.google_url ?? null })
}
