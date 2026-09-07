import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
