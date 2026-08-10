import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { method, amount_ars, reference } = await req.json()
  if (!method || !reference) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  if (!amount_ars || amount_ars < 5000) return NextResponse.json({ error: 'La donación mínima es $5.000 ARS' }, { status: 400 })

  const serviceClient = createServiceClient()
  const { error } = await serviceClient.from('donations').insert({
    user_id: user.id,
    method,
    amount_ars,
    reference: reference.trim(),
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
