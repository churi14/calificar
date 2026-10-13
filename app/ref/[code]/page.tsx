/**
 * /ref/[code] — Link de referido
 * El cliente comparte este link; al abrirlo redirige al formulario de unirse
 * con el ref_code guardado como query param.
 */

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Props {
  params: Promise<{ code: string }>
}

export default async function RefPage({ params }: Props) {
  const { code } = await params

  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('id, program_id, active')
    .eq('ref_code', code)
    .maybeSingle()

  if (!card || !card.active) return notFound()

  redirect(`/fidelizacion/unirse?program=${card.program_id}&ref=${code}`)
}
