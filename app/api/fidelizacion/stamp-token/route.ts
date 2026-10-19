/**
 * GET /api/fidelizacion/stamp-token?program_id=X
 * Devuelve el token rotativo actual para el programa (todos los planes).
 *
 * Tokens de un solo uso almacenados en DB:
 * - Se genera un nuevo token cada 10 segundos (si el anterior ya fue usado o expiró)
 * - Cada token es válido hasta que se usa para un sello (luego queda "consumed")
 * - Los tokens sin usar expiran a las 2 horas (así el link mandado por WhatsApp sigue sirviendo un rato)
 * - Con ?fresh=1 siempre se crea un link nuevo: para mandar uno distinto a cada cliente
 * - Se limpian tokens vencidos en cada request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { verifyProgramMember } from '@/lib/business-auth'
import { resolveBranchId } from '@/lib/branches'

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

  // Dueño del programa o miembro de su equipo
  const access = await verifyProgramMember(req, program_id)
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar plan del negocio
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('id, stamp_secret')
    .eq('id', program_id)
    .single()

  if (!program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })

  // Clave del QR del local: se crea la primera vez. El QR fijo la lleva en el link (?k=) y sigue
  // dando sellos aunque el negocio exija el link de un solo uso para los pedidos por WhatsApp.
  let localKey: string = program.stamp_secret as string
  if (!localKey) {
    localKey = randomBytes(16).toString('hex')
    await supabase
      .from('loyalty_programs')
      .update({ stamp_secret: localKey })
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
  const wantsFresh = req.nextUrl.searchParams.get('fresh') === '1'
  const { data: existing } = wantsFresh ? { data: null } : await supabase
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
  // Sucursal del local que muestra este QR (null = Principal)
  const branchId = await resolveBranchId(supabase, program_id, req.nextUrl.searchParams.get('branch_id'))
  const branchParam = branchId ? `&b=${branchId}` : ''

  return NextResponse.json({
    token,
    seconds_remaining: secondsRemaining,
    window_seconds: TOKEN_WINDOW_SECONDS,
    local_key: localKey,
    link: `${appUrl}/s/${program_id}?t=${token}${branchParam}`,
  })
}
