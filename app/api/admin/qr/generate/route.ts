import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

// Caracteres sin ambigüedad (sin 0/O, 1/I/L)
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(length = 6): string {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

export async function POST(req: NextRequest) {
  // Verificar que es admin
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

  const { quantity = 10 } = await req.json()
  const qty = Math.min(Math.max(parseInt(quantity), 1), 500)

  const serviceClient = createServiceClient()

  // Generar códigos únicos
  const codes: { code: string }[] = []
  let attempts = 0
  while (codes.length < qty && attempts < qty * 5) {
    attempts++
    const code = generateCode()
    // Verificar que no existe
    const { data } = await serviceClient
      .from('qr_redirects')
      .select('code')
      .eq('code', code)
      .single()
    if (!data) codes.push({ code })
  }

  const { data, error } = await serviceClient
    .from('qr_redirects')
    .insert(codes)
    .select('code')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ generated: data?.length ?? 0, codes: data?.map(d => d.code) })
}
