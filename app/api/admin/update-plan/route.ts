import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Verificar sesión del admin
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Usar service client para leer el rol (evita problemas de RLS)
    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: `Sin permisos (role: ${profile?.role})` }, { status: 403 })
    }

    const { userId, plan } = await req.json()
    if (!userId || !plan) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    if (!['free', 'basic', 'pro'].includes(plan)) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

    const { error: updateError } = await service.from('profiles').update({ plan }).eq('id', userId)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error interno' }, { status: 500 })
  }
}
