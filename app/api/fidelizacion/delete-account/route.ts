/**
 * POST /api/fidelizacion/delete-account
 * Soft-delete: desactiva el negocio y el programa del usuario.
 * NO borra ningún dato — loyalty_cards, transactions, etc. quedan intactos.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  // Autenticar
  let user = null
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const { data } = await anonClient.auth.getUser(authHeader.substring(7))
    user = data.user
  }
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Buscar negocios del usuario
  const { data: businesses } = await serviceClient
    .from('businesses')
    .select('id')
    .eq('owner_user_id', user.id)

  if (!businesses || businesses.length === 0) {
    return NextResponse.json({ error: 'No se encontró ningún negocio' }, { status: 404 })
  }

  const bizIds = businesses.map(b => b.id)

  // Soft-delete: marcar negocio como inactivo y agregar deleted_at
  await serviceClient
    .from('businesses')
    .update({ active: false })
    .in('id', bizIds)

  // Desactivar programas de fidelidad
  await serviceClient
    .from('loyalty_programs')
    .update({ active: false })
    .in('business_id', bizIds)

  // NO eliminamos: loyalty_cards, loyalty_transactions, push_subscriptions
  // Los datos de clientes quedan en la base de datos

  return NextResponse.json({ ok: true })
}
