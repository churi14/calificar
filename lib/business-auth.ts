/**
 * business-auth.ts
 * Verifica que el token JWT pertenezca al dueño del programa solicitado.
 * Usar en todos los APIs de negocio que requieran ownership.
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { canUse } from '@/lib/plan-features'

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

export type ProgramAccess = {
  userId: string
  /** owner: el dueño del negocio. staff: miembro del equipo (solo sellos, clientes y cupones) */
  role: 'owner' | 'staff'
  /** Si el miembro está limitado a una sucursal, su id; si no, null */
  branchId: string | null
}

/**
 * El dueño del negocio o un miembro de su equipo (plan Ultimate).
 * Para las rutas del día a día: dar sellos, ver clientes y canjear cupones.
 * Las rutas de configuración siguen usando verifyProgramOwner: el equipo no puede tocarlas.
 */
export async function verifyProgramMember(
  req: NextRequest,
  programId: string
): Promise<ProgramAccess | null> {
  const token = extractToken(req)
  if (!token) return null

  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return null

  const { data } = await admin
    .from('loyalty_programs')
    .select('business_id, businesses!inner(owner_user_id, plan)')
    .eq('id', programId)
    .single()
  if (!data) return null

  const biz = data.businesses as unknown as { owner_user_id: string; plan: string | null }
  if (biz.owner_user_id === user.id) return { userId: user.id, role: 'owner', branchId: null }

  // Miembro del equipo: se identifica por su email (confirmado) y requiere un plan con equipo
  const email = (user.email ?? '').toLowerCase()
  if (!email || !(user.email_confirmed_at || (user as { confirmed_at?: string }).confirmed_at)) return null
  if (!canUse(biz.plan, 'team')) return null

  const { data: member } = await admin
    .from('business_members')
    .select('id, user_id, branch_id')
    .eq('business_id', data.business_id)
    .eq('email', email)
    .maybeSingle()
  if (!member) return null

  if (!member.user_id) {
    await admin.from('business_members').update({ user_id: user.id }).eq('id', member.id)
  }
  return { userId: user.id, role: 'staff', branchId: member.branch_id ?? null }
}
