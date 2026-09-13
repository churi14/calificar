/**
 * GET /api/fidelizacion/stats?program_id=xxx
 * Retorna: push_logs recientes + ventas por día (últimos 30 días)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const since30 = new Date(Date.now() - 30 * 86400000).toISOString()

  const [pushRes, salesRes] = await Promise.all([
    admin
      .from('push_logs')
      .select('id, title, body, sent_to, created_at')
      .eq('program_id', program_id)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('loyalty_transactions')
      .select('purchase_amount, created_at')
      .eq('program_id', program_id)
      .eq('type', 'stamp')
      .gte('created_at', since30)
      .not('purchase_amount', 'is', null),
  ])

  // Agrupar ventas por día
  const salesByDay: Record<string, number> = {}
  for (const tx of salesRes.data ?? []) {
    const day = tx.created_at.slice(0, 10)
    salesByDay[day] = (salesByDay[day] ?? 0) + (tx.purchase_amount ?? 0)
  }

  return NextResponse.json({
    push_logs: pushRes.data ?? [],
    sales_by_day: salesByDay,
    total_sales: Object.values(salesByDay).reduce((a, b) => a + b, 0),
  })
}
