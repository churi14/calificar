/**
 * Equipo del negocio (plan Ultimate): personas que entran al panel con su propio usuario
 * y solo pueden dar sellos, ver clientes y canjear cupones.
 *
 * GET    /api/fidelizacion/team?program_id=X            → lista del equipo (solo el dueño)
 * POST   /api/fidelizacion/team                         → { program_id, email, branch_id? } suma a una persona
 * DELETE /api/fidelizacion/team?program_id=X&member_id= → quita a una persona
 *
 * La persona se identifica por su email: tiene que entrar a calificar.com.ar con ese mismo email
 * (Google o email confirmado). Si la migración team_members.sql no se corrió, responde 503.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { canUse, MAX_TEAM_MEMBERS } from '@/lib/plan-features'
import { getProgramPlan, planRequiredBody } from '@/lib/program-plan'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function businessIdOf(programId: string): Promise<string | null> {
  const { data } = await admin.from('loyalty_programs').select('business_id').eq('id', programId).single()
  return (data?.business_id as string | undefined) ?? null
}

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
  if (!(await verifyProgramOwner(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const allowed = canUse(await getProgramPlan(program_id), 'team')
  const businessId = await businessIdOf(program_id)
  if (!businessId) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  const { data, error } = await admin
    .from('business_members')
    .select('id, email, branch_id, user_id, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ members: [], allowed, migration_pending: true })

  return NextResponse.json({
    allowed,
    max: MAX_TEAM_MEMBERS,
    members: (data ?? []).map(m => ({
      id: m.id, email: m.email, branch_id: m.branch_id, created_at: m.created_at, joined: !!m.user_id,
    })),
  })
}

export async function POST(req: NextRequest) {
  const { program_id, email, branch_id } = await req.json().catch(() => ({}))
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!canUse(await getProgramPlan(program_id), 'team')) {
    return NextResponse.json(planRequiredBody('Ultimate'), { status: 403 })
  }

  const cleanEmail = String(email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 120) {
    return NextResponse.json({ error: 'Ingresá un email válido' }, { status: 400 })
  }

  const businessId = await businessIdOf(program_id)
  if (!businessId) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  // No hace falta sumar al dueño
  const { data: ownerUser } = await admin.auth.admin.getUserById(owner.userId)
  if ((ownerUser?.user?.email ?? '').toLowerCase() === cleanEmail) {
    return NextResponse.json({ error: 'Ese es tu propio email: ya tenés acceso total' }, { status: 400 })
  }

  // Si se limita a una sucursal, tiene que ser de este programa
  let branchId: string | null = null
  if (branch_id) {
    const { data: b } = await admin.from('branches').select('id').eq('id', branch_id).eq('program_id', program_id).eq('active', true).maybeSingle()
    if (!b) return NextResponse.json({ error: 'Sucursal no encontrada' }, { status: 400 })
    branchId = b.id as string
  }

  const { count, error: countErr } = await admin
    .from('business_members')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
  if (countErr) {
    return NextResponse.json({ error: 'El equipo todavía no está habilitado en la base de datos (falta correr la migración).' }, { status: 503 })
  }
  if ((count ?? 0) >= MAX_TEAM_MEMBERS) {
    return NextResponse.json({ error: `Llegaste al máximo de ${MAX_TEAM_MEMBERS} personas en el equipo` }, { status: 403 })
  }

  const { data: member, error } = await admin
    .from('business_members')
    .upsert({ business_id: businessId, email: cleanEmail, branch_id: branchId, role: 'staff' }, { onConflict: 'business_id,email' })
    .select('id, email, branch_id, created_at')
    .single()
  if (error || !member) return NextResponse.json({ error: error?.message ?? 'No se pudo sumar a la persona' }, { status: 500 })

  return NextResponse.json({ ok: true, member: { ...member, joined: false } })
}

export async function DELETE(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  const member_id = req.nextUrl.searchParams.get('member_id')
  if (!program_id || !member_id) return NextResponse.json({ error: 'program_id y member_id requeridos' }, { status: 400 })
  if (!(await verifyProgramOwner(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const businessId = await businessIdOf(program_id)
  if (!businessId) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  const { error } = await admin.from('business_members').delete().eq('id', member_id).eq('business_id', businessId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
