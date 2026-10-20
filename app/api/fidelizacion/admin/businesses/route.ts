import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { data, error } = await supabase
    .from('businesses')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ businesses: data ?? [] })
}

/**
 * DELETE /api/fidelizacion/admin/businesses?id=X&delete_user=1
 * Borra por completo un negocio (con su programa, tarjetas y movimientos, por cascada) y, si se pide,
 * también el usuario con el que se registró, para que el email quede libre. Solo administradores.
 * No borra negocios con un plan pago vigente, ni usuarios administradores ni usuarios con otros negocios.
 */
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  const alsoUser = req.nextUrl.searchParams.get('delete_user') === '1'

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, owner_user_id, plan, plan_expires_at')
    .eq('id', id)
    .maybeSingle()
  if (!biz) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const paid = ['beauty', 'starter', 'pro', 'ultimate'].includes((biz.plan ?? '').toLowerCase())
    && (!biz.plan_expires_at || new Date(biz.plan_expires_at) > new Date())
  if (paid) {
    return NextResponse.json({ error: 'Este negocio tiene un plan pago vigente. Pasalo a "Trial" desde Gestión de planes antes de borrarlo.' }, { status: 409 })
  }

  // ¿Se puede borrar también el usuario? Solo si no es administrador y no tiene otros negocios
  let userToDelete: string | null = null
  if (alsoUser && biz.owner_user_id) {
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', biz.owner_user_id).maybeSingle()
    const { count } = await supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('owner_user_id', biz.owner_user_id)
    if (prof?.role !== 'admin' && (count ?? 0) <= 1) userToDelete = biz.owner_user_id as string
  }

  const { error } = await supabase.from('businesses').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: `No se pudo borrar: ${error.message}` }, { status: 409 })
  }

  let userDeleted = false
  if (userToDelete) {
    const { error: uErr } = await supabase.auth.admin.deleteUser(userToDelete)
    userDeleted = !uErr
  }

  return NextResponse.json({ ok: true, name: biz.name, user_deleted: userDeleted })
}
