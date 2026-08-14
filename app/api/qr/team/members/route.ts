import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = createServiceClient()

  // Obtener miembros del equipo
  const { data: members } = await service
    .from('profiles')
    .select('id, name, email, created_at')
    .eq('parent_user_id', user.id)
    .order('created_at', { ascending: true })

  if (!members || members.length === 0) {
    return NextResponse.json({ members: [] })
  }

  // Obtener QRs de cada miembro
  const memberIds = members.map(m => m.id)
  const { data: qrs } = await service
    .from('qr_redirects')
    .select('code, business_name, google_url, activated, scan_count, activated_at, owner_id, buyer_name')
    .in('owner_id', memberIds)
    .order('created_at', { ascending: false })

  // Armar stats por miembro
  const result = members.map(m => {
    const memberQRs = (qrs ?? []).filter(q => q.owner_id === m.id)
    const totalScans = memberQRs.reduce((s, q) => s + (q.scan_count ?? 0), 0)
    const activated = memberQRs.filter(q => q.activated).length
    return {
      ...m,
      qr_count: memberQRs.length,
      activated_count: activated,
      total_scans: totalScans,
      qrs: memberQRs,
    }
  })

  return NextResponse.json({ members: result })
}
