/**
 * POST /api/fidelizacion/redeem-coupon
 * El encargado del negocio canjea un cupón ingresando el código.
 * Requiere auth de dueño del programa al que pertenece la tarjeta.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Verificar que el usuario autenticado es dueño del programa
    const owner = await verifyProgramOwner(req, tx.program_id)
    if (!owner) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
