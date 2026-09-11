/**
 * GET /api/admin/funnel
 * Retorna datos del funnel de onboarding para el panel de admin.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // ── 1. Pasos del funnel (cuántas sesiones únicas vieron cada paso) ──────────
  const { data: stepViews } = await supabase
    .from('onboarding_events')
    .select('step, step_name, session_id')
    .eq('event', 'step_view')

  // Agrupar por paso
  const stepMap: Record<number, { step_name: string; sessions: Set<string> }> = {}
  for (const row of stepViews ?? []) {
    if (!stepMap[row.step]) stepMap[row.step] = { step_name: row.step_name, sessions: new Set() }
    stepMap[row.step].sessions.add(row.session_id)
  }
  const steps = Object.entries(stepMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([step, d]) => ({ step: Number(step), step_name: d.step_name, sessions: d.sessions.size }))

  // ── 2. Conversiones finales ─────────────────────────────────────────────────
  const { count: registrados } = await supabase
    .from('onboarding_events')
    .select('id', { count: 'exact', head: true })
    .eq('event', 'registered')

  const totalSesiones = steps[0]?.sessions ?? 0

  // ── 3. Selecciones por paso ─────────────────────────────────────────────────
  const { data: selects } = await supabase
    .from('onboarding_events')
    .select('step_name, data')
    .eq('event', 'select')

  // Agrupar tipo de negocio
  const tipoNegocio: Record<string, number> = {}
  const colores: Record<string, number> = {}
  const cumple: Record<string, number> = {}
  const stamps: number[] = []

  for (const row of selects ?? []) {
    const val = row.data?.value ?? row.data?.color ?? ''
    if (row.step_name === 'tipo_negocio' && val) tipoNegocio[val] = (tipoNegocio[val] ?? 0) + 1
    if (row.step_name === 'colores' && row.data?.color) colores[row.data.color] = (colores[row.data.color] ?? 0) + 1
    if (row.step_name === 'cumpleanios' && val) cumple[val] = (cumple[val] ?? 0) + 1
  }

  // Stamps goal distribution
  const { data: stampCompletes } = await supabase
    .from('onboarding_events')
    .select('data')
    .eq('step_name', 'cantidad_sellos')
    .eq('event', 'step_complete')

  const stampsGoalDist: Record<number, number> = {}
  for (const row of stampCompletes ?? []) {
    const g = row.data?.stamps_goal
    if (g) stampsGoalDist[g] = (stampsGoalDist[g] ?? 0) + 1
  }

  // ── 4. Auth methods ─────────────────────────────────────────────────────────
  const { data: authClicks } = await supabase
    .from('onboarding_events')
    .select('data')
    .eq('event', 'auth_click')

  const authMethods: Record<string, number> = {}
  for (const row of authClicks ?? []) {
    const m = row.data?.method ?? 'unknown'
    authMethods[m] = (authMethods[m] ?? 0) + 1
  }

  // ── 5. Actividad reciente ───────────────────────────────────────────────────
  const { data: recent } = await supabase
    .from('onboarding_events')
    .select('session_id, step_name, event, data, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    steps,
    total_sessions: totalSesiones,
    registrados: registrados ?? 0,
    conversion_rate: totalSesiones > 0 ? Math.round(((registrados ?? 0) / totalSesiones) * 100) : 0,
    tipo_negocio: tipoNegocio,
    colores,
    cumple,
    stamps_goal_dist: stampsGoalDist,
    auth_methods: authMethods,
    recent,
  })
}
