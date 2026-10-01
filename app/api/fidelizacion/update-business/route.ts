/**
 * POST /api/fidelizacion/update-business
 * Permite al dueño de un negocio actualizar sus datos (nombre, whatsapp, etc.)
 * Verifica que el usuario autenticado sea dueño del programa/negocio.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { program_id, whatsapp_number, business_name } = body

    if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

    // Verificar que el usuario es dueño
    const owner = await verifyProgramOwner(req, program_id)
    if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Obtener el business_id del programa
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('business_id')
      .eq('id', program_id)
      .single()

    if (!program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

    const update: Record<string, unknown> = {}
    if (business_name !== undefined) update.name = business_name
    if (whatsapp_number !== undefined) update.whatsapp_number = whatsapp_number.replace(/\D/g, '') || null

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase
      .from('businesses')
      .update(update)
      .eq('id', program.business_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error en /api/fidelizacion/update-business:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
