/**
 * Modo "solo con link de un solo uso" (delivery / dark kitchen).
 * GET  /api/fidelizacion/stamp-settings?program_id=X  → { require_stamp_token }   (dueño o equipo)
 * POST /api/fidelizacion/stamp-settings               → { program_id, require_stamp_token } (solo el dueño)
 *
 * Con el modo activado, el QR fijo y el link fijo dejan de dar sellos: solo vale el link de un solo uso
 * que el negocio manda por cada pedido. Si la migración stamp_link_only.sql no se corrió, responde 503.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramMember, verifyProgramOwner } from '@/lib/business-auth'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
  if (!(await verifyProgramMember(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await admin.from('loyalty_programs').select('require_stamp_token').eq('id', program_id).maybeSingle()
  if (error) return NextResponse.json({ require_stamp_token: false, available: false })
  return NextResponse.json({ require_stamp_token: !!data?.require_stamp_token, available: true })
}

export async function POST(req: NextRequest) {
  const { program_id, require_stamp_token } = await req.json().catch(() => ({}))
  if (!program_id || typeof require_stamp_token !== 'boolean') {
    return NextResponse.json({ error: 'program_id y require_stamp_token son requeridos' }, { status: 400 })
  }
  if (!(await verifyProgramOwner(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { error } = await admin.from('loyalty_programs').update({ require_stamp_token }).eq('id', program_id)
  if (error) {
    return NextResponse.json({ error: 'Todavía no se puede activar: falta actualizar la base de datos (migración stamp_link_only.sql).' }, { status: 503 })
  }
  return NextResponse.json({ ok: true, require_stamp_token })
}
