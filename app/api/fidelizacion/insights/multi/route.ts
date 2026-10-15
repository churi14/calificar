/**
 * GET /api/fidelizacion/insights/multi?days=30
 * Devuelve métricas de TODOS los programas del negocio autenticado.
 * Útil para la vista comparativa de sucursales (plan Ultimate).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authClient.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30')

  const user = await getUserFromToken(req)
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Obtener el negocio del usuario
  const { data: business } = await supabase
    .from('businesses')
    .select('id, plan')
    .eq('owner_user_id', user.id)
    .eq('active', true)
    .single()

  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  // Gate: solo Ultimate
  if (!['ultimate', 'gifted'].includes((business.plan ?? '').toLowerCase())) {
    return NextResponse.json({ error: 'Requiere plan Ultimate', upgrade_required: true }, { status: 403 })
  }

  // Obtener todos los programas activos
  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('id, name, stamps_goal')
    .eq('business_id', business.id)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (!programs?.length) return NextResponse.json({ results: [] })

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // Para cada programa, calcular métricas
  const results = await Promise.all(programs.map(async (prog) => {
    // Sellos en el período
    const { data: stamps } = await supabase
      .from('loyalty_transactions')
      .select('created_at, card_id')
      .eq('program_id', prog.id)
      .eq('type', 'stamp')
      .gte('created_at', since)

    const totalStamps = stamps?.length ?? 0
    const activeCardIds = new Set(stamps?.map(s => s.card_id).filter(Boolean))
    const activeClients = activeCardIds.size

    // Nuevos clientes en el período
    const { count: newClients } = await supabase
      .from('loyalty_cards')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', prog.id)
      .eq('active', true)
      .gte('created_at', since)

    // Total clientes activos del programa
    const { count: totalClients } = await supabase
      .from('loyalty_cards')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', prog.id)
      .eq('active', true)

    const conversionRate = totalClients ? Math.round((activeClients / totalClients) * 100) : 0

    // Hora pico
    const hourCounts = new Array(24).fill(0)
    stamps?.forEach(s => {
      const h = new Date(s.created_at).getHours()
      hourCounts[h]++
    })
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

    // Día de la semana pico
    const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const dowCounts = new Array(7).fill(0)
    stamps?.forEach(s => {
      const d = new Date(s.created_at).getDay()
      dowCounts[d]++
    })
    const peakDow = dowCounts.indexOf(Math.max(...dowCounts))
    const peakDay = DOW_LABELS[peakDow]

    // Premios canjeados
    const { count: rewardsRedeemed } = await supabase
      .from('loyalty_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', prog.id)
      .eq('type', 'reward')
      .gte('created_at', since)

    return {
      program_id: prog.id,
      program_name: prog.name,
      stamps_goal: prog.stamps_goal,
      total_stamps: totalStamps,
      active_clients: activeClients,
      new_clients: newClients ?? 0,
      total_clients: totalClients ?? 0,
      conversion_rate: conversionRate,
      peak_hour: peakHour,
      peak_day: peakDay,
      rewards_redeemed: rewardsRedeemed ?? 0,
    }
  }))

  return NextResponse.json({ results, days })
}
