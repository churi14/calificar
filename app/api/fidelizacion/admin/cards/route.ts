/**
 * GET /api/fidelizacion/admin/cards?program_id=xxx
 * Lista los clientes de un programa con su progreso.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const programId = req.nextUrl.searchParams.get('program_id')
  if (!programId) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const { data: cards, error } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('program_id', programId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ cards })
}
