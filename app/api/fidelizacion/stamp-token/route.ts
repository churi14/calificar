/**
 * GET /api/fidelizacion/stamp-token?program_id=X
 * Devuelve el token rotativo actual para el programa (planes Pro+).
 * Token = HMAC-SHA256(stamp_secret, ventana_actual). Ventana: 30 minutos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, randomBytes } from 'crypto'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const WINDOW_SECONDS = 30 * 60 // 30 minutos

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
  return (
    generateToken(secret, current) === token ||
    generateToken(secret, current - 1) === token
  )
}

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  // Verificar que el usuario es dueño del programa
  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar plan del negocio
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('id, stamp_secret, businesses!inner(plan, plan_expires_at)')
    .eq('id', program_id)
    .single()

  if (!program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  const biz = program.businesses as unknown as { plan: string | null; plan_expires_at: string | null }
  const isExpired = biz.plan_expires_at ? new Date(biz.plan_expires_at) < new Date() : false
  const allowedPlans = ['pro', 'ultimate', 'gifted']
  if (!allowedPlans.includes(biz.plan ?? '') || isExpired) {
    return NextResponse.json({ error: 'plan_required', plan_needed: 'pro' }, { status: 403 })
  }

  // Obtener o generar stamp_secret
  let secret = program.stamp_secret as string | null
  if (!secret) {
    secret = randomBytes(32).toString('hex')
    await supabase
      .from('loyalty_programs')
      .update({ stamp_secret: secret })
      .eq('id', program_id)
  }

  const windowIndex = currentWindowIndex()
  const token = generateToken(secret, windowIndex)
  const windowEndMs = (windowIndex + 1) * WINDOW_SECONDS * 1000
  const secondsRemaining = Math.round((windowEndMs - Date.now()) / 1000)

  return NextResponse.json({
    token,
    seconds_remaining: secondsRemaining,
    window_seconds: WINDOW_SECONDS,
    link: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/s/${program_id}?t=${token}`,
  })
}
