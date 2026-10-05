/**
 * GET /api/fidelizacion/stamp-token?program_id=X
 * Devuelve el token rotativo actual para el programa (todos los planes).
 *
 * Tokens de un solo uso almacenados en DB:
 * - Se genera un nuevo token cada 10 segundos (si el anterior ya fue usado o expiró)
 * - Cada token es válido hasta que se usa para un sello (luego queda "consumed")
 * - Los tokens sin usar expiran a las 2 horas
 * - Se limpian tokens vencidos en cada request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const TOKEN_WINDOW_SECONDS = 10  // rotación cada 10 segundos
export const TOKEN_TTL_HOURS = 2        // expiran a las 2 horas si no se usan

function generateRandomToken(): string {
  return randomBytes(8).toString('hex') // 16 chars hex
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
    .select('id, stamp_secret')
    .eq('id', program_id)
    .single()

  if (!program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  // Activar stamp_secret si el programa no lo tiene (marca que usa tokens)
  if (!program.stamp_secret) {
    const secret = randomBytes(16).toString('hex')
    await supabase
      .from('loyalty_programs')
      .update({ stamp_secret: secret })
      .eq('id', program_id)
  }

  // Limpiar tokens vencidos del programa (mantenimiento ligero)
  await supabase
    .from('stamp_tokens')
    .delete()
    .eq('program_id', program_id)
    .lt('expires_at', new Date().toISOString())

  // Buscar token activo creado en los últimos TOKEN_WINDOW_SECONDS y no usado
  const windowStart = new Date(Date.now() - TOKEN_WINDOW_SECONDS * 1000).toISOString()
  const { data: existing } = await supabase
    .from('stamp_tokens')
    .select('id, token, created_at, expires_at')
    .eq('program_id', program_id)
    .is('used_at', null)
    .gte('created_at', windowStart)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let token: string
  let tokenCreatedAt: number

  if (existing) {
    token = existing.token
    tokenCreatedAt = new Date(existing.created_at).getTime()
  } else {
    // Crear nuevo token
    token = generateRandomToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
    const { data: inserted } = await supabase
      .from('stamp_tokens')
      .insert({ program_id, token, expires_at: expiresAt.toISOString() })
      .select('created_at')
      .single()
    tokenCreatedAt = inserted ? new Date(inserted.created_at).getTime() : Date.now()
  }

  const ageSeconds = (Date.now() - tokenCreatedAt) / 1000
  const secondsRemaining = Math.max(1, Math.round(TOKEN_WINDOW_SECONDS - ageSeconds))
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'

  return NextResponse.json({
    token,
    seconds_remaining: secondsRemaining,
    window_seconds: TOKEN_WINDOW_SECONDS,
    link: `${appUrl}/s/${program_id}?t=${token}`,
  })
}
