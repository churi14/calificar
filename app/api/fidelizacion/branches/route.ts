/**
 * GET  /api/fidelizacion/branches?program_id=X  → sucursales activas del programa (dueño)
 * POST /api/fidelizacion/branches               → crea una sucursal { program_id, name }
 *
 * Una sucursal es un local dentro del MISMO programa: la tarjeta del cliente es compartida y
 * cada sello guarda en qué sucursal se dio. La sucursal "Principal" no es una fila: es branch_id NULL.
 * Crear sucursales requiere plan Ultimate/gifted vigente.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_BRANCHES = 50

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
  const planOk = ['ultimate', 'gifted'].includes((biz?.plan ?? '').toLowerCase())
  const expired = biz?.plan_expires_at ? new Date(biz.plan_expires_at) < new Date() : false
  if (!planOk || expired) {
    return NextResponse.json({ error: 'Agregar sucursales requiere plan Ultimate vigente', upgrade_required: true }, { status: 403 })
  }

  const { data: existing, error: listErr } = await supabase
    .from('branches')
    .select('id, name')
    .eq('program_id', program_id)
    .eq('active', true)

  if (listErr) {
    return NextResponse.json({ error: 'Las sucursales todavía no están habilitadas en la base de datos (falta correr la migración).' }, { status: 503 })
  }
  if ((existing?.length ?? 0) >= MAX_BRANCHES) {
    return NextResponse.json({ error: `Llegaste al máximo de ${MAX_BRANCHES} sucursales` }, { status: 400 })
  }
  if (branchName.toLowerCase() === 'principal' || (existing ?? []).some(b => b.name.toLowerCase() === branchName.toLowerCase())) {
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
