import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Verificar sesión
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Verificar rol admin con service client (evita RLS)
    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: `Sin permisos (role: ${profile?.role})` }, { status: 403 })
    }

    const body = await req.json()
    const { bizId, ...fields } = body

    if (!bizId) return NextResponse.json({ error: 'Falta bizId' }, { status: 400 })

    // Campos permitidos para actualizar
    const allowed = ['name', 'google_review_url', 'whatsapp_number', 'negative_redirect', 'threshold', 'primary_color', 'accent_color', 'active']
    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in fields) {
        // Limpiar número de WhatsApp
        if (key === 'whatsapp_number' && typeof fields[key] === 'string') {
          update[key] = fields[key].replace(/\D/g, '') || null
        } else {
          update[key] = fields[key] === '' ? null : fields[key]
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })
    }

    const { error: updateError } = await service.from('businesses').update(update).eq('id', bizId)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error interno' }, { status: 500 })
  }
}
