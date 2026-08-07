import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const serviceClient = createServiceClient()
  const { data } = await serviceClient
    .from('qr_redirects')
    .select('code, business_name, google_url, activated, scan_count, created_at, activated_at')
    .order('created_at', { ascending: false })
    .limit(500)

  return NextResponse.json({ codes: data ?? [] })
}
