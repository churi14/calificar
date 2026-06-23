import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const { userId, plan } = await req.json()
  if (!userId || !plan) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  if (!['free', 'basic', 'pro'].includes(plan)) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

  const admin = createServiceClient()
  const { error } = await admin.from('profiles').update({ plan }).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
