import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { requireProgramAccess } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const denied = await requireProgramAccess(req, program_id)
  if (denied) return denied

  const base = 'id, name, phone, stamps, total_visits, birth_date, created_at, dni'
  const load = (cols: string) => supabase
    .from('loyalty_cards')
    .select(cols)
    .eq('program_id', program_id)
    .not('active', 'is', false)
    .order('created_at', { ascending: false })

  // review_state existe una vez corrida la migración review_prompt.sql; sin ella la lista sigue andando
  let { data: cards, error } = await load(`${base}, review_state`)
  if (error) ({ data: cards, error } = await load(base))

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
