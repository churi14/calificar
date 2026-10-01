/**
 * GET /api/fidelizacion/card-status?program_id=X&phone=Y
 * GET /api/fidelizacion/card-status?program_id=X&dni=Z
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
  const dni = searchParams.get('dni')

  if (!program_id || (!phone && !dni)) {
    return NextResponse.json({ error: 'program_id y phone o dni son requeridos' }, { status: 400 })
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

  // Buscar tarjeta
  const { data: allCards } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('program_id', program_id)

  let card = null

  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 6) {
      return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 })
    }
    card = (allCards ?? []).find(c => {
      const stored = c.phone.replace(/\D/g, '')
      return stored.endsWith(cleanPhone) || cleanPhone.endsWith(stored)
    }) ?? null
  } else if (dni) {
    const cleanDni = dni.replace(/\D/g, '')
    if (cleanDni.length < 6) {
      return NextResponse.json({ error: 'DNI inválido' }, { status: 400 })
    }
    card = (allCards ?? []).find(c => c.dni && c.dni.replace(/\D/g, '') === cleanDni) ?? null
  }

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

  const activeCoupons = (txs ?? []).filter(t => t.type === 'reward' && t.coupon_code)

  return NextResponse.json({
    found: true,
    card: {
      id: card.id,
      name: card.name,
      stamps: card.stamps,
      total_visits: card.total_visits,
      has_dni: !!card.dni,
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
