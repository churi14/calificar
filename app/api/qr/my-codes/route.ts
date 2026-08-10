import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const serviceClient = createServiceClient()
  const [codesResult, profileResult] = await Promise.all([
    serviceClient
      .from('qr_redirects')
      .select('code, label, google_url, scan_count, created_at, activated')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    serviceClient
      .from('profiles')
      .select('qr_unlimited')
      .eq('id', user.id)
      .single(),
  ])

  if (codesResult.error) return NextResponse.json({ error: codesResult.error.message }, { status: 500 })
  return NextResponse.json({
    codes: codesResult.data ?? [],
    unlimited: profileResult.data?.qr_unlimited ?? false,
  })
}
