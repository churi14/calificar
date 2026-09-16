/**
 * POST /api/fidelizacion/redeem-coupon
 * El encargado del negocio o un admin de Calificar canjea un cupón.
 * Acepta auth por Bearer token (business owners) o cookie de sesión (admin panel).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthenticatedUser(req: NextRequest): Promise<{ userId: string; isAdmin: boolean } | null> {
  // 1. Intentar Bearer token primero
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      return { userId: user.id, isAdmin: profile?.role === 'admin' }
    }
  }

  // 2. Intentar cookie de sesión (Next.js server component / admin panel)
  try {
    const cookieStore = await cookies()
    const serverClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* read-only */ },
        },
      }
    )
    const { data: { user }, error } = await serverClient.auth.getUser()
    if (!error && user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      return { userId: user.id, isAdmin: profile?.role === 'admin' }
    }
  } catch {
    // ignore cookie errors
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const { coupon_code } = await req.json()

    if (!coupon_code?.trim()) {
      return NextResponse.json({ error: 'coupon_code requerido' }, { status: 400 })
    }

    // Buscar la transacción con ese cupón
    const { data: tx, error: txErr } = await supabase
      .from('loyalty_transactions')
      .select('id, card_id, program_id, note, redeemed_at')
      .eq('coupon_code', coupon_code.trim().toUpperCase())
      .single()

    if (txErr || !tx) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    if (tx.redeemed_at) {
      return NextResponse.json({
        error: 'Este cupón ya fue canjeado',
        redeemed_at: tx.redeemed_at,
      }, { status: 409 })
    }

    // Verificar auth
    const authUser = await getAuthenticatedUser(req)
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Admins de Calificar pueden canjear cualquier cupón
    if (!authUser.isAdmin) {
      // Verificar que el usuario sea dueño del programa
      const { data: program } = await supabase
        .from('loyalty_programs')
        .select('businesses!inner(owner_user_id)')
        .eq('id', tx.program_id)
        .single()

      if (!program) {
        return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
      }

      const biz = program.businesses as unknown as { owner_user_id: string }
      if (biz.owner_user_id !== authUser.userId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    // Marcar como canjeado
    await supabase
      .from('loyalty_transactions')
      .update({ redeemed_at: new Date().toISOString() })
      .eq('id', tx.id)

    return NextResponse.json({
      success: true,
      note: tx.note,
      card_id: tx.card_id,
    })
  } catch (err) {
    console.error('Error en /api/fidelizacion/redeem-coupon:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
