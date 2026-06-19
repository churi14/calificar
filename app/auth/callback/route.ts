import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirigir al `next` param o al dashboard por defecto
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, mandar al login con error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
