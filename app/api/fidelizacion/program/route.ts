import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { data: program, error } = await supabase
    .from('loyalty_programs')
    .select('*, businesses(name)')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error || !program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  return NextResponse.json({ program })
}

export async function PATCH(req: NextRequest) {
  const { program_id, milestones } = await req.json()
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  // Verificar que el usuario es dueño del programa
  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { error } = await supabase
    .from('loyalty_programs')
    .update({ milestones: milestones ?? [] })
    .eq('id', program_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
