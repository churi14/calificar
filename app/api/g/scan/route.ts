import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ ok: false })

  const supabase = createServiceClient()
  await supabase.rpc('increment_qr_scan', { p_code: code })

  return NextResponse.json({ ok: true })
}
