/**
 * GET  /api/fidelizacion/google-review?program_id=xxx  → leer config
 * POST /api/fidelizacion/google-review                 → guardar config
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await admin
    .from('google_review_settings')
    .select('*')
    .eq('program_id', program_id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ config: data ?? null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { program_id, enabled, google_maps_url, push_title, push_body } = body

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { error } = await admin.from('google_review_settings').upsert({
    program_id,
    enabled: enabled ?? false,
    google_maps_url: google_maps_url ?? null,
    push_title: push_title || '¡Ganaste tu premio! 🏆',
    push_body:  push_body  || '¿Te gustó? Tu opinión nos ayuda mucho. ¡Dejanos una reseña en Google!',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'program_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
