/**
 * GET /api/fidelizacion/insights/multi?days=30
 * Métricas por SUCURSAL del negocio autenticado (planes Pro y Ultimate): una fila por sucursal
 * ("Principal" = sellos sin sucursal). La tarjeta del cliente es compartida entre sucursales.
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

  // Gate: Pro (hasta 3 locales) y Ultimate
  if (!['pro', 'ultimate', 'gifted'].includes((business.plan ?? '').toLowerCase())) {
    return NextResponse.json({ error: 'Requiere plan Pro o Ultimate', upgrade_required: true }, { status: 403 })
  }

  // Obtener todos los programas activos
  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', business.id)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (!programs?.length) return NextResponse.json({ results: [] })

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const AR_OFFSET_MS = 3 * 60 * 60 * 1000 // Argentina = UTC-3, sin horario de verano

  type StampRow = { card_id: string | null; branch_id: string | null; created_at: string }

  // Trae todas las filas (Supabase corta en 1000 por consulta)
  async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
    const out: T[] = []
    for (let from = 0; ; from += 1000) {
      const { data } = await build(from, from + 999)
      if (!data?.length) break
      out.push(...data)
      if (data.length < 1000) break
    }
    return out
  }

  // Por programa: una fila por sucursal ("Principal" = branch_id NULL). La tarjeta es compartida;
  // las métricas salen de en qué sucursal se dio cada sello.
  const perProgram = await Promise.all(programs.map(async (prog) => {
    const { data: branchRows, error: branchErr } = await supabase
      .from('branches')
      .select('id, name')
      .eq('program_id', prog.id)
      .eq('active', true)
      .order('created_at', { ascending: true })
    const branches = branchErr ? [] : (branchRows ?? [])
    const hasBranches = branches.length > 0

    // Todos los sellos del programa (historial completo, para total y primer sello)
    const stamps = await fetchAll<StampRow>((from, to) =>
      supabase
        .from('loyalty_transactions')
        .select('card_id, branch_id, created_at')
        .eq('program_id', prog.id)
        .eq('type', 'stamp')
        .order('created_at', { ascending: true })
        .range(from, to)
    )
    // Premios del período
    const rewards = await fetchAll<{ branch_id: string | null }>((from, to) =>
      supabase
        .from('loyalty_transactions')
        .select('branch_id')
        .eq('program_id', prog.id)
        .eq('type', 'reward')
        .gte('created_at', since)
        .range(from, to)
    )
    // Tarjetas del programa
    const cards = await fetchAll<{ id: string; created_at: string }>((from, to) =>
      supabase
        .from('loyalty_cards')
        .select('id, created_at')
        .eq('program_id', prog.id)
        .eq('active', true)
        .range(from, to)
    )

    const keyOf = (b: string | null) => (hasBranches ? (b ?? 'main') : 'main')
    // Sucursal del primer sello de cada tarjeta (para "clientes nuevos")
    const firstBucket = new Map<string, string>()
    for (const s of stamps) {
      if (s.card_id && !firstBucket.has(s.card_id)) firstBucket.set(s.card_id, keyOf(s.branch_id))
    }
    const newCards = cards.filter(c => c.created_at >= since)

    const buckets: { key: string; branchId: string | null; label: string }[] = hasBranches
      ? [{ key: 'main', branchId: null, label: ((prog as { main_branch_name?: string | null }).main_branch_name ?? '').trim() || 'Principal' }, ...branches.map(b => ({ key: b.id, branchId: b.id, label: b.name }))]
      : [{ key: 'main', branchId: null, label: prog.name }]

    return buckets.map(bk => {
      const all = stamps.filter(s => keyOf(s.branch_id) === bk.key)
      const period = all.filter(s => s.created_at >= since)
      const activeIds = new Set(period.map(s => s.card_id).filter(Boolean))

      // Sin sucursales: se mantiene el cálculo anterior (todas las tarjetas del programa)
      const totalClients = hasBranches
        ? new Set(all.map(s => s.card_id).filter(Boolean)).size
        : cards.length
      const newClients = hasBranches
        ? newCards.filter(c => (firstBucket.get(c.id) ?? 'main') === bk.key).length
        : newCards.length

      // Hora y día pico en hora de Argentina
      const hourCounts = new Array(24).fill(0)
      const dowCounts = new Array(7).fill(0)
      period.forEach(s => {
        const ar = new Date(new Date(s.created_at).getTime() - AR_OFFSET_MS)
        hourCounts[ar.getUTCHours()]++
        dowCounts[ar.getUTCDay()]++
      })

      return {
        program_id: hasBranches ? (bk.branchId ?? prog.id) : prog.id,
        branch_id: bk.branchId,
        program_name: hasBranches && programs.length > 1 ? `${prog.name} · ${bk.label}` : bk.label,
        stamps_goal: prog.stamps_goal,
        total_stamps: period.length,
        active_clients: activeIds.size,
        new_clients: newClients,
        total_clients: totalClients,
        conversion_rate: totalClients ? Math.round((activeIds.size / totalClients) * 100) : 0,
        peak_hour: hourCounts.indexOf(Math.max(...hourCounts)),
        peak_day: DOW_LABELS[dowCounts.indexOf(Math.max(...dowCounts))],
        rewards_redeemed: rewards.filter(r => keyOf(r.branch_id) === bk.key).length,
      }
    })
  }))

  return NextResponse.json({ results: perProgram.flat(), days })
}
