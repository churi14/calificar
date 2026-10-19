/**
 * GET /api/fidelizacion/insights/advanced?program_id=xxx&days=30
 * Métricas avanzadas: tendencia, funnel, distribución de sellos, top clientes.
 */

import { programCan, planRequiredBody } from '@/lib/program-plan'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30')

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await programCan(program_id, 'insights'))) {
    return NextResponse.json(planRequiredBody('Ultimate'), { status: 403 })
  }

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('stamps_goal')
    .eq('id', program_id)
    .single()

  const stampsGoal = program?.stamps_goal ?? 10

  const now = new Date()
  const periodStart = new Date(now.getTime() - days * 864e5)
  const prevStart   = new Date(periodStart.getTime() - days * 864e5)

  // ── Datos del período actual ──────────────────────────────────────────────
  const { data: curStamps } = await supabase
    .from('loyalty_transactions')
    .select('card_id, created_at')
    .eq('program_id', program_id)
    .eq('type', 'stamp')
    .gte('created_at', periodStart.toISOString())

  const { count: curNewClients } = await supabase
    .from('loyalty_cards')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .gte('created_at', periodStart.toISOString())

  const { count: curRewards } = await supabase
    .from('loyalty_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .eq('type', 'reward')
    .gte('created_at', periodStart.toISOString())

  // ── Datos del período anterior (para tendencia) ───────────────────────────
  const { data: prevStamps } = await supabase
    .from('loyalty_transactions')
    .select('card_id')
    .eq('program_id', program_id)
    .eq('type', 'stamp')
    .gte('created_at', prevStart.toISOString())
    .lt('created_at', periodStart.toISOString())

  const { count: prevNewClients } = await supabase
    .from('loyalty_cards')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .gte('created_at', prevStart.toISOString())
    .lt('created_at', periodStart.toISOString())

  const { count: prevRewards } = await supabase
    .from('loyalty_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .eq('type', 'reward')
    .gte('created_at', prevStart.toISOString())
    .lt('created_at', periodStart.toISOString())

  function pctChange(cur: number, prev: number) {
    if (prev === 0) return cur > 0 ? 100 : 0
    return Math.round(((cur - prev) / prev) * 100)
  }

  const curActiveCards = new Set(curStamps?.map(s => s.card_id).filter(Boolean)).size
  const prevActiveCards = new Set(prevStamps?.map(s => s.card_id).filter(Boolean)).size

  const trend = {
    stamps:        { cur: curStamps?.length ?? 0,  prev: prevStamps?.length ?? 0,  pct: pctChange(curStamps?.length ?? 0, prevStamps?.length ?? 0) },
    active_clients:{ cur: curActiveCards,           prev: prevActiveCards,           pct: pctChange(curActiveCards, prevActiveCards) },
    new_clients:   { cur: curNewClients ?? 0,       prev: prevNewClients ?? 0,       pct: pctChange(curNewClients ?? 0, prevNewClients ?? 0) },
    rewards:       { cur: curRewards ?? 0,          prev: prevRewards ?? 0,          pct: pctChange(curRewards ?? 0, prevRewards ?? 0) },
  }

  // ── Funnel ────────────────────────────────────────────────────────────────
  const { count: totalRegistered } = await supabase
    .from('loyalty_cards')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .eq('active', true)

  const { count: atLeastOneStamp } = await supabase
    .from('loyalty_cards')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .eq('active', true)
    .gt('total_visits', 0)

  const halfGoal = Math.ceil(stampsGoal / 2)
  const { count: halfwayClients } = await supabase
    .from('loyalty_cards')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .eq('active', true)
    .gte('total_visits', halfGoal)

  const { count: completedClients } = await supabase
    .from('loyalty_transactions')
    .select('card_id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .eq('type', 'reward')

  const total = totalRegistered ?? 1
  const funnel = [
    { stage: 'Registrados',            count: totalRegistered ?? 0, pct: 100 },
    { stage: 'Al menos 1 visita',      count: atLeastOneStamp ?? 0, pct: Math.round(((atLeastOneStamp ?? 0) / total) * 100) },
    { stage: `+${halfGoal} visitas`,   count: halfwayClients ?? 0,  pct: Math.round(((halfwayClients ?? 0) / total) * 100) },
    { stage: 'Completaron tarjeta',    count: completedClients ?? 0, pct: Math.round(((completedClients ?? 0) / total) * 100) },
  ]

  // ── Distribución de sellos actuales ──────────────────────────────────────
  const { data: allCards } = await supabase
    .from('loyalty_cards')
    .select('stamps, total_visits, name, phone')
    .eq('program_id', program_id)
    .eq('active', true)

  const buckets: Record<number, number> = {}
  for (let i = 0; i <= stampsGoal; i++) buckets[i] = 0
  allCards?.forEach(c => {
    const s = Math.min(c.stamps, stampsGoal)
    buckets[s] = (buckets[s] ?? 0) + 1
  })
  const stamp_distribution = Object.entries(buckets).map(([s, count]) => ({
    stamps: parseInt(s),
    count,
    label: parseInt(s) === stampsGoal ? `${s} (completa)` : String(s),
  }))

  // ── Top 5 clientes (por total_visits) ────────────────────────────────────
  const top_clients = (allCards ?? [])
    .sort((a, b) => (b.total_visits ?? 0) - (a.total_visits ?? 0))
    .slice(0, 5)
    .map(c => ({
      name: c.name ?? c.phone,
      visits: c.total_visits ?? 0,
      stamps: c.stamps ?? 0,
    }))

  // ── Riesgo de churn ───────────────────────────────────────────────────────
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 864e5).toISOString()
  const { data: recentlyActive } = await supabase
    .from('loyalty_transactions')
    .select('card_id')
    .eq('program_id', program_id)
    .eq('type', 'stamp')
    .gte('created_at', thirtyDaysAgo)

  const recentCardIds = new Set(recentlyActive?.map(s => s.card_id).filter(Boolean))
  const totalActive = allCards?.length ?? 0
  const churnRisk = totalActive > 0
    ? Math.round(((totalActive - recentCardIds.size) / totalActive) * 100)
    : 0

  return NextResponse.json({
    trend,
    funnel,
    stamp_distribution,
    top_clients,
    churn_risk: churnRisk,
    avg_visits: totalActive > 0
      ? Math.round((allCards ?? []).reduce((s, c) => s + (c.total_visits ?? 0), 0) / totalActive * 10) / 10
      : 0,
    days,
  })
}
