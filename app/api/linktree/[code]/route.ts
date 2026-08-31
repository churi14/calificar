import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('qr_redirects')
    .select('code, business_name, google_url, menu_url, activated')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !data || !data.activated) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    code: data.code,
    business_name: data.business_name ?? 'Local',
    google_url: data.google_url,
    menu_url: data.menu_url ?? null,
  })
}
