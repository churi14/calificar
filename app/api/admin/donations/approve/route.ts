import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { donation_id, action } = await req.json() // action: 'approve' | 'reject'
  if (!donation_id || !action) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const serviceClient = createServiceClient()

  // Obtener donación
  const { data: donation } = await serviceClient
    .from('donations').select('user_id, status').eq('id', donation_id).single()
  if (!donation) return NextResponse.json({ error: 'Donación no encontrada' }, { status: 404 })
  if (donation.status !== 'pending') return NextResponse.json({ error: 'Ya fue procesada' }, { status: 400 })

  // Actualizar status
  await serviceClient.from('donations').update({
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewed_at: new Date().toISOString(),
  }).eq('id', donation_id)

  // Si se aprueba, desbloquear QRs ilimitados
  if (action === 'approve') {
    await serviceClient.from('profiles').update({ qr_unlimited: true }).eq('id', donation.user_id)
  }

  return NextResponse.json({ ok: true })
}
