/**
 * GET /api/fidelizacion/stamp-token?program_id=X
 * Devuelve el token rotativo actual para el programa (planes Pro+).
 * El token se genera con HMAC-SHA256(stamp_secret, ventana_de_tiempo).
 * Ventana: 30 minutos. Acepta ventana actual y anterior para evitar edge cases.
 *
 * Si el programa no tiene stamp_secret, lo genera y guarda automáticamente.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WINDOW_SECONDS = 30 * 60 // 30 minutos

export function generateToken(secret: string, windowIndex: number): string {
  return createHmac('sha256', secret)
    .update(windowIndex.toString())
    .digest('hex')
    .slice(0, 12)
}

export function currentWindowIndex(): number {
  return Math.floor(Date.now() / 1000 / WINDOW_SECONDS)
}

export function validateToken(secret: string, token: string): boolean {
  const current = currentWindowIndex()
  // Acepta ventana actual y la anterior (para evitar que alguien quede cortado justo en el cambio)
  return (
    generateToken(secret, current) === token ||
    generateToken(secret, current - 1) === token
  )
}

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  // Verificar autenticación del negocio
  const authHeader = req.headers.get('authorization')
  const accessToken = authHeader?.replace('Bearer ', '')

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar que el token pertenece al dueño del programa
  const { data: { user }, error: authErr } = await supabase.auth.getUser(accessToken)
  if (authErr || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, plan, plan_expires_at')
    .eq('owner_id', user.id)
    .single()

  if (!biz) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  // Solo Pro y Ultimate
  const isExpired = biz.plan_expires_at ? new Date(biz.plan_expires_at) < new Date() : false
  const allowedPlans = ['pro', 'ultimate', 'gifted']
  if (!allowedPlans.includes(biz.plan ?? '') || isExpired) {
    return NextResponse.json({ error: 'plan_required', plan_needed: 'pro' }, { status: 403 })
  }

  // Obtener o generar stamp_secret del programa
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('id, stamp_secret')
    .eq('id', program_id)
    .eq('business_id', biz.id)
    .single()

  if (!program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  let secret = program.stamp_secret
  if (!secret) {
    // Generar y guardar secret la primera vez
    secret = randomBytes(32).toString('hex')
    await supabase
      .from('loyalty_programs')
      .update({ stamp_secret: secret })
      .eq('id', program_id)
  }

  const windowIndex = currentWindowIndex()
  const token = generateToken(secret, windowIndex)
  const windowStartMs = windowIndex * WINDOW_SECONDS * 1000
  const windowEndMs = (windowIndex + 1) * WINDOW_SECONDS * 1000
  const secondsRemaining = Math.round((windowEndMs - Date.now()) / 1000)

  return NextResponse.json({
    token,
    seconds_remaining: secondsRemaining,
    window_seconds: WINDOW_SECONDS,
    link: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/s/${program_id}?t=${token}`,
  })
}
