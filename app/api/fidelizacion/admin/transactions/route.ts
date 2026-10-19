import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireProgramAccess } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  const limit = Math.min(5000, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') ?? '20') || 20))
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const denied = await requireProgramAccess(req, program_id)
  if (denied) return denied

  const { data: transactions, error } = await supabase
    .from('loyalty_transactions')
    .select('id, type, created_at, coupon_code, loyalty_cards(name)')
    .eq('program_id', program_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ transactions })
}
