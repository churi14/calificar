/**
 * Ajustes de sellado del programa.
 * GET  /api/fidelizacion/stamp-settings?program_id=X
 *        → { require_stamp_token, business_only, stamp_interval, available, control_available }   (dueño o equipo)
 * POST /api/fidelizacion/stamp-settings   (solo el dueño; cualquier combinación de estos campos)
 *        { program_id, require_stamp_token?, business_only_stamps?, stamp_interval? }
 *
 * - require_stamp_token: modo "solo con link de un solo uso" (delivery / dark kitchen).
 * - business_only_stamps + stamp_interval (plan Pro): solo sella el negocio y tiempo mínimo entre sellos.
 * Si la migración correspondiente no se corrió, responde 503 al guardar.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramMember, verifyProgramOwner } from '@/lib/business-auth'
import { programCan, planRequiredBody } from '@/lib/program-plan'
import { DEFAULT_STAMP_INTERVAL, isStampInterval } from '@/lib/stamp-interval'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
  if (!(await verifyProgramMember(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const full = await admin
    .from('loyalty_programs')
    .select('require_stamp_token, business_only_stamps, stamp_interval')
    .eq('id', program_id)
    .maybeSingle()
  if (!full.error) {
    return NextResponse.json({
      require_stamp_token: !!full.data?.require_stamp_token,
      business_only: !!full.data?.business_only_stamps,
      stamp_interval: isStampInterval(full.data?.stamp_interval) ? full.data?.stamp_interval : DEFAULT_STAMP_INTERVAL,
      available: true,
      control_available: true,
    })
  }

  // Todavía sin la migración nueva: se sigue pudiendo usar el modo de links de un solo uso
  const old = await admin.from('loyalty_programs').select('require_stamp_token').eq('id', program_id).maybeSingle()
  if (old.error) {
    return NextResponse.json({ require_stamp_token: false, business_only: false, stamp_interval: DEFAULT_STAMP_INTERVAL, available: false, control_available: false })
  }
  return NextResponse.json({
    require_stamp_token: !!old.data?.require_stamp_token,
    business_only: false,
    stamp_interval: DEFAULT_STAMP_INTERVAL,
    available: true,
    control_available: false,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { program_id, require_stamp_token, business_only_stamps, stamp_interval } = body
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (typeof require_stamp_token === 'boolean') update.require_stamp_token = require_stamp_token
  if (typeof business_only_stamps === 'boolean') update.business_only_stamps = business_only_stamps
  if (stamp_interval !== undefined) {
    if (!isStampInterval(stamp_interval)) return NextResponse.json({ error: 'Intervalo inválido' }, { status: 400 })
    update.stamp_interval = stamp_interval
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No hay nada para guardar' }, { status: 400 })

  if (!(await verifyProgramOwner(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Apagar el modo siempre se puede; prenderlo o cambiar el intervalo es del plan Pro en adelante
  const needsPlan = business_only_stamps === true || stamp_interval !== undefined
  if (needsPlan && !(await programCan(program_id, 'business_only'))) {
    return NextResponse.json(planRequiredBody('Pro'), { status: 403 })
  }

  const { error } = await admin.from('loyalty_programs').update(update).eq('id', program_id)
  if (error) {
    const file = 'business_only_stamps' in update || 'stamp_interval' in update ? 'stamp_business_only.sql' : 'stamp_link_only.sql'
    return NextResponse.json({ error: `Todavía no se puede activar: falta actualizar la base de datos (migración ${file}).` }, { status: 503 })
  }
  return NextResponse.json({ ok: true, ...update })
}
