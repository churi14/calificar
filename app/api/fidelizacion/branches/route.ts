/**
 * GET  /api/fidelizacion/branches?program_id=X  → sucursales activas del programa (dueño)
 * POST /api/fidelizacion/branches               → crea una sucursal { program_id, name }
 * PATCH /api/fidelizacion/branches              → renombra una sucursal o la principal { program_id, branch_id | 'main', name }
 *
 * Una sucursal es un local dentro del MISMO programa: la tarjeta del cliente es compartida y
 * cada sello guarda en qué sucursal se dio. La sucursal "Principal" no es una fila: es branch_id NULL.
 * Crear sucursales depende del plan: Starter 1 local, Pro hasta 3 locales, Ultimate/gifted ilimitados (tope 50).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { maxLocales } from '@/lib/plans'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Nombre actual de la sucursal principal ("Principal" si el dueño no lo cambió o la columna no existe todavía) */
async function getMainName(programId: string): Promise<string> {
  const { data, error } = await supabase
    .from('loyalty_programs')
    .select('main_branch_name')
    .eq('id', programId)
    .maybeSingle()
  if (error) return 'Principal'
  return ((data as { main_branch_name?: string | null } | null)?.main_branch_name ?? '').trim() || 'Principal'
}

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('branches')
    .select('id, name, created_at')
    .eq('program_id', program_id)
    .eq('active', true)
    .order('created_at', { ascending: true })

  // Si la migración todavía no se corrió, no hay sucursales (no es un error para el panel)
  if (error) return NextResponse.json({ branches: [], migration_pending: true })
  return NextResponse.json({ branches: data ?? [] })
}

export async function POST(req: NextRequest) {
  const { program_id, name } = await req.json().catch(() => ({ program_id: null, name: '' }))
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const branchName = String(name ?? '').trim()
  if (branchName.length < 2 || branchName.length > 40) {
    return NextResponse.json({ error: 'El nombre de la sucursal debe tener entre 2 y 40 caracteres' }, { status: 400 })
  }

  // Gate: solo Ultimate / gifted vigente
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('businesses(plan, plan_expires_at)')
    .eq('id', program_id)
    .single()
  const bizRaw = program?.businesses as { plan?: string | null; plan_expires_at?: string | null } | { plan?: string | null; plan_expires_at?: string | null }[] | null | undefined
  const biz = Array.isArray(bizRaw) ? bizRaw[0] : bizRaw
  const maxLoc = maxLocales(biz?.plan)
  const expired = biz?.plan_expires_at ? new Date(biz.plan_expires_at) < new Date() : false
  if (maxLoc <= 1 || expired) {
    return NextResponse.json({ error: 'Agregar sucursales requiere un plan Pro o Ultimate vigente', upgrade_required: true }, { status: 403 })
  }

  const { data: existing, error: listErr } = await supabase
    .from('branches')
    .select('id, name')
    .eq('program_id', program_id)
    .eq('active', true)

  if (listErr) {
    return NextResponse.json({ error: 'Las sucursales todavía no están habilitadas en la base de datos (falta correr la migración).' }, { status: 503 })
  }
  // La principal cuenta como un local
  if ((existing?.length ?? 0) + 1 >= maxLoc) {
    return NextResponse.json({
      error: maxLoc <= 3
        ? `Tu plan incluye hasta ${maxLoc} locales. Para sumar más, pasá al plan Ultimate.`
        : 'Llegaste al máximo de sucursales.',
      upgrade_required: maxLoc <= 3,
    }, { status: 403 })
  }
  const mainName = await getMainName(program_id)
  if (branchName.toLowerCase() === mainName.toLowerCase() || (existing ?? []).some(b => b.name.toLowerCase() === branchName.toLowerCase())) {
    return NextResponse.json({ error: 'Ya existe una sucursal con ese nombre' }, { status: 409 })
  }

  const { data: branch, error } = await supabase
    .from('branches')
    .insert({ program_id, name: branchName })
    .select('id, name, created_at')
    .single()

  if (error || !branch) {
    return NextResponse.json({ error: error?.message ?? 'Error creando la sucursal' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, branch })
}

export async function PATCH(req: NextRequest) {
  const { program_id, branch_id, name } = await req.json().catch(() => ({ program_id: null, branch_id: null, name: '' }))
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const newName = String(name ?? '').trim()
  if (newName.length < 2 || newName.length > 40) {
    return NextResponse.json({ error: 'El nombre debe tener entre 2 y 40 caracteres' }, { status: 400 })
  }

  const { data: others } = await supabase
    .from('branches')
    .select('id, name')
    .eq('program_id', program_id)
    .eq('active', true)
  const branchRows = others ?? []
  const isMain = !branch_id || branch_id === 'main'

  if (isMain) {
    // Renombrar la principal: no puede repetir el nombre de otra sucursal
    if (branchRows.some(b => b.name.toLowerCase() === newName.toLowerCase())) {
      return NextResponse.json({ error: 'Ya existe una sucursal con ese nombre' }, { status: 409 })
    }
    const { error } = await supabase.from('loyalty_programs').update({ main_branch_name: newName }).eq('id', program_id)
    if (error) {
      return NextResponse.json({ error: 'Todavía no se puede renombrar la principal: falta actualizar la base de datos (migración main_branch_name.sql).' }, { status: 503 })
    }
    return NextResponse.json({ ok: true, branch_id: 'main', name: newName })
  }

  // Renombrar una sucursal: tiene que ser de este programa y no repetir nombres
  const target = branchRows.find(b => b.id === branch_id)
  if (!target) return NextResponse.json({ error: 'Sucursal no encontrada' }, { status: 404 })
  const mainName = await getMainName(program_id)
  if (newName.toLowerCase() === mainName.toLowerCase() || branchRows.some(b => b.id !== branch_id && b.name.toLowerCase() === newName.toLowerCase())) {
    return NextResponse.json({ error: 'Ya existe una sucursal con ese nombre' }, { status: 409 })
  }
  const { error } = await supabase.from('branches').update({ name: newName }).eq('id', branch_id).eq('program_id', program_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, branch_id, name: newName })
}
