/**
 * GET /api/fidelizacion/insights?program_id=xxx&days=30
 * Activity Insights: horarios pico, días de semana, clientes nuevos,
 * tasa de retorno, tasa de conversión al premio.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const since = new Date(Date.now() - days * 86400000).toISOString()
  const since90 = new Date(Date.now() - 90 * 86400000).toISOString()

  const [stampsRes, cardsRes, programRes] = await Promise.all([
    // Todos los sellos del período
    admin
      .from('loyalty_transactions')
      .select('card_id, created_at')
      .eq('program_id', program_id)
      .eq('type', 'stamp')
      .gte('created_at', since),

    // Todas las tarjetas activas
    admin
      .from('loyalty_cards')
      .select('id, stamps, created_at')
      .eq('program_id', program_id)
      .eq('active', true),

    // Meta de sellos del programa
    admin
      .from('loyalty_programs')
      .select('stamps_goal')
      .eq('id', program_id)
      .single(),
  ])

  const stamps = stampsRes.data ?? []
  const cards  = cardsRes.data ?? []
  const goal   = programRes.data?.stamps_goal ?? 10

  // ── 1. Sellos por hora del día (0-23) ─────────────────────────────────────
  const byHour = Array(24).fill(0)
  for (const s of stamps) {
    const h = new Date(s.created_at).getHours()
    byHour[h]++
  }

  // ── 2. Sellos por día de la semana (0=Dom … 6=Sáb) ───────────────────────
  const byDow = Array(7).fill(0)
  for (const s of stamps) {
    const d = new Date(s.created_at).getDay()
    byDow[d]++
  }
  const byDowLabeled = DAY_LABELS.map((label, i) => ({ label, count: byDow[i] }))

  // ── 3. Clientes nuevos por semana (últimas 8 semanas) ────────────────────
  const newByWeek: Record<string, number> = {}
  for (const c of cards) {
    const d = new Date(c.created_at)
    // Obtener lunes de la semana
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = monday.toISOString().slice(0, 10)
    newByWeek[key] = (newByWeek[key] ?? 0) + 1
  }
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - i * 7)
    return d.toISOString().slice(0, 10)
  }).reverse()
  const newClientsWeekly = weeks.map(w => ({ week: w, count: newByWeek[w] ?? 0 }))

  // ── 4. Clientes activos (al menos 1 sello en el período) ─────────────────
  const activeCardIds = new Set(stamps.map(s => s.card_id))
  const activeClients = activeCardIds.size

  // ── 5. Tasa de conversión: cards con stamps >= goal / total cards ─────────
  const converted = cards.filter(c => (c.stamps ?? 0) >= goal).length
  const conversionRate = cards.length > 0 ? Math.round((converted / cards.length) * 100) : 0

  // ── 6. Tasa de retorno: promedio de días entre visitas ───────────────────
  // Para esto necesitamos múltiples sellos por cliente — usamos los últimos 90 días
  const { data: stamps90 } = await admin
    .from('loyalty_transactions')
    .select('card_id, created_at')
    .eq('program_id', program_id)
    .eq('type', 'stamp')
    .gte('created_at', since90)
    .order('created_at', { ascending: true })

  const visitsByCard: Record<string, Date[]> = {}
  for (const s of stamps90 ?? []) {
    if (!visitsByCard[s.card_id]) visitsByCard[s.card_id] = []
    visitsByCard[s.card_id].push(new Date(s.created_at))
  }

  let totalGaps = 0
  let gapCount  = 0
  for (const visits of Object.values(visitsByCard)) {
    if (visits.length < 2) continue
    for (let i = 1; i < visits.length; i++) {
      const diffDays = (visits[i].getTime() - visits[i - 1].getTime()) / 86400000
      if (diffDays > 0 && diffDays < 60) { // ignorar gaps enormes (churn real)
        totalGaps += diffDays
        gapCount++
      }
    }
  }
  const avgReturnDays = gapCount > 0 ? Math.round(totalGaps / gapCount) : null

  // ── 7. Hora pico ─────────────────────────────────────────────────────────
  const peakHour = byHour.indexOf(Math.max(...byHour))

  // ── 8. Día pico ──────────────────────────────────────────────────────────
  const peakDowIdx = byDow.indexOf(Math.max(...byDow))
  const peakDay = DAY_LABELS[peakDowIdx]

  return NextResponse.json({
    period_days: days,
    total_stamps: stamps.length,
    total_cards: cards.length,
    active_clients: activeClients,
    conversion_rate: conversionRate,
    avg_return_days: avgReturnDays,
    peak_hour: peakHour,
    peak_day: peakDay,
    by_hour: byHour,
    by_dow: byDowLabeled,
    new_clients_weekly: newClientsWeekly,
  })
}
