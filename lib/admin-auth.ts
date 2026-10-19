/**
 * Autorización para las rutas de /api/fidelizacion/admin/*
 *  - isCalificarAdmin: el usuario es administrador de Calificar (por Bearer o por cookie de sesión)
 *  - canAccessProgram: administrador de Calificar, dueño del negocio o miembro del equipo del programa
 *  - requireAdmin / requireProgramAccess: devuelven una respuesta 401/403 lista para retornar, o null si pasa
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { verifyProgramMember } from '@/lib/business-auth'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Id del usuario que hace el pedido: token Bearer o cookie de sesión (panel admin) */
async function requestUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    const { data: { user } } = await admin.auth.getUser(auth.slice(7))
    if (user?.id) return user.id
  }
  try {
    const cookieStore = await cookies()
    const serverClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() { /* solo lectura */ } } }
    )
    const { data: { user } } = await serverClient.auth.getUser()
    return user?.id ?? null
  } catch {
    return null
  }
}

export async function isCalificarAdmin(req: NextRequest): Promise<boolean> {
  const userId = await requestUserId(req)
  if (!userId) return false
  const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single()
  return profile?.role === 'admin'
}

export async function canAccessProgram(req: NextRequest, programId: string): Promise<boolean> {
  if (await verifyProgramMember(req, programId)) return true
  return isCalificarAdmin(req)
}

/** null si es admin; si no, la respuesta de error para devolver */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  if (await isCalificarAdmin(req)) return null
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

/** null si tiene acceso al programa; si no, la respuesta de error para devolver */
export async function requireProgramAccess(req: NextRequest, programId: string): Promise<NextResponse | null> {
  if (await canAccessProgram(req, programId)) return null
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
