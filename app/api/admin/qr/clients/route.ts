import { NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const serviceClient = createServiceClient()
  const { data } = await serviceClient
    .from('profiles')
    .select('id, name, email')
    .or('role.eq.business,role.is.null')
    .order('name', { ascending: true })

  return NextResponse.json({ clients: data ?? [] })
}
