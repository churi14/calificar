import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const { data: cards, error } = await supabase
    .from('loyalty_cards')
    .select('id, name, phone, stamps, total_visits, birth_date, created_at, dni')
    .eq('program_id', program_id)
    .neq('active', false)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cards })
}

export async function DELETE(req: NextRequest) {
  const card_id = req.nextUrl.searchParams.get('card_id')
  if (!card_id) return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })

  // Verificar que la tarjeta pertenece a un programa del usuario
  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('program_id')
    .eq('id', card_id)
    .single()

  if (!card) return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })

  const owner = await verifyProgramOwner(req, card.program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Soft-delete: ocultar la tarjeta sin borrarla (el QR del cliente sigue funcionando)
  await supabase.from('loyalty_cards').update({ active: false }).eq('id', card_id)

  return NextResponse.json({ ok: true })
}
