/**
 * business-auth.ts
 * Verifica que el token JWT pertenezca al dueño del programa solicitado.
 * Usar en todos los APIs de negocio que requieran ownership.
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Extrae el Bearer token del header Authorization.
 */
function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

/**
 * Verifica que el usuario autenticado sea el dueño del programa.
 * Retorna { userId } si es válido, null si no está autorizado.
 */
export async function verifyProgramOwner(
  req: NextRequest,
  programId: string
): Promise<{ userId: string } | null> {
  const token = extractToken(req)
  if (!token) return null

  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return null

  // Verificar que el programa pertenezca a un negocio del usuario
  const { data } = await admin
    .from('loyalty_programs')
    .select('businesses!inner(owner_user_id)')
    .eq('id', programId)
    .single()

  if (!data) return null

  const biz = data.businesses as unknown as { owner_user_id: string }
  if (biz.owner_user_id !== user.id) return null

  return { userId: user.id }
}

/**
 * Verifica solo el token (sin checar ownership de programa).
 * Para endpoints donde el program_id viene en el body y no en la URL.
 */
export async function verifyToken(
  req: NextRequest
): Promise<{ userId: string; token: string } | null> {
  const token = extractToken(req)
  if (!token) return null

  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return null

  return { userId: user.id, token }
}
