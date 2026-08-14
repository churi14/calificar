import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const service = createServiceClient()

  // Crear usuario en Supabase Auth
  const { data: newUser, error: authError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError) {
    const msg = authError.message.includes('already registered')
      ? 'Ya existe una cuenta con ese email'
      : authError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Vincular al padre (puede tardar un momento en crearse el perfil por el trigger)
  // Intentar hasta 3 veces con delay
  let linked = false
  for (let i = 0; i < 3; i++) {
    await new Promise(r => setTimeout(r, 500))
    const { error: updateError } = await service
      .from('profiles')
      .update({ parent_user_id: user.id, name })
      .eq('id', newUser.user.id)
    if (!updateError) { linked = true; break }
  }

  if (!linked) {
    // Igual el usuario fue creado, solo no se vinculó — no es crítico
    console.error('No se pudo vincular el perfil')
  }

  return NextResponse.json({ ok: true, user_id: newUser.user.id })
}
