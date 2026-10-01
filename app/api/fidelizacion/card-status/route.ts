/**
 * GET /api/fidelizacion/card-status?program_id=X&phone=Y
 * Consulta el estado de la tarjeta de un cliente sin crear sello.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const program_id = searchParams.get('program_id')
  const phone = searchParams.get('phone')

  if (!program_id || !phone) {
    return NextResponse.json({ error: 'program_id y phone son requeridos' }, { status: 400 })
  }

  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 6) {
    return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 })
  }

  // Verificar que el programa existe
  const { data: program, error: progErr } = await supabase
    .from('loyalty_programs')
    .select('id, stamps_goal, reward_description, name, color_primary, logo_url, businesses(name)')
    .eq('id', program_id)
    .single()

  if (progErr || !program) {
    return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 })
  }

  // Buscar tarjeta (match bidireccional)
  const { data: allCards } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('program_id', program_id)

  const card = (allCards ?? []).find(c => {
    const stored = c.phone.replace(/\D/g, '')
    return stored.endsWith(cleanPhone) || cleanPhone.endsWith(stored)
  }) ?? null

  if (!card) {
    return NextResponse.json({ found: false })
  }

  // Últimas transacciones del cliente
  const { data: txs } = await supabase
    .from('loyalty_transactions')
    .select('id, type, created_at, coupon_code, note')
    .eq('card_id', card.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Cupones activos (premios no canjeados)
  const activeCoupons = (txs ?? []).filter(t => t.type === 'reward' && t.coupon_code)

  return NextResponse.json({
    found: true,
    card: {
      id: card.id,
      name: card.name,
      stamps: card.stamps,
      total_visits: card.total_visits,
    },
    program: {
      name: program.name,
      stamps_goal: program.stamps_goal,
      reward_description: program.reward_description,
      color_primary: program.color_primary,
      business_name: (program.businesses as any)?.name ?? '',
    },
    active_coupons: activeCoupons,
  })
}
