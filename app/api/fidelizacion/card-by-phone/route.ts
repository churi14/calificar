/**
 * GET /api/fidelizacion/card-by-phone?program_id=xxx&phone=xxx
 * Busca la tarjeta de un cliente por teléfono y programa.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const programId = req.nextUrl.searchParams.get('program_id')
  const phone = req.nextUrl.searchParams.get('phone')?.replace(/\s/g, '')

  if (!programId || !phone) {
    return NextResponse.json({ error: 'program_id y phone requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('id, name, stamps, total_visits')
    .eq('program_id', programId)
    .eq('phone', phone)
    .single()

  if (error || !data) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({ found: true, card: data })
}
