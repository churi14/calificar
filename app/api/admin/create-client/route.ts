import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verificar que quien llama es admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const { name, email, password, plan } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const admin = createServiceClient()

  // Crear usuario con Supabase Admin API
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true // no necesita confirmar email
  })

  if (createError) {
    const msg = createError.message.includes('already registered')
      ? 'Ya existe un usuario con ese email'
      : createError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Actualizar plan en el perfil (el trigger ya creó el perfil base)
  if (plan && plan !== 'free') {
    await admin.from('profiles').update({ plan }).eq('id', newUser.user.id)
  }

  return NextResponse.json({ ok: true, userId: newUser.user.id })
}

