import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const FREE_LIMIT = 30

function generateCode(length = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { destination_url, label } = await req.json()
  if (!destination_url) return NextResponse.json({ error: 'Falta la URL de destino' }, { status: 400 })

  const serviceClient = createServiceClient()

  // Verificar límite según plan
  const { data: profile } = await serviceClient
    .from('profiles').select('qr_unlimited').eq('id', user.id).single()
  const isUnlimited = profile?.qr_unlimited === true

  if (!isUnlimited) {
    const { count } = await serviceClient
      .from('qr_redirects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
    if ((count ?? 0) >= FREE_LIMIT) {
      return NextResponse.json({ error: 'Límite alcanzado', code: 'LIMIT_REACHED' }, { status: 403 })
    }
  }

  // Generar código único
  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const { data } = await serviceClient.from('qr_redirects').select('code').eq('code', code).single()
    if (!data) break
    code = generateCode()
    attempts++
  }

  const { error } = await serviceClient.from('qr_redirects').insert({
    code,
    owner_id: user.id,
    google_url: destination_url,
    label: label || null,
    activated: true,
    activated_at: new Date().toISOString(),
    scan_count: 0,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ code })
}
