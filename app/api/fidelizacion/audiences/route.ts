/**
 * GET /api/fidelizacion/audiences?program_id=X&audience=<json>
 * Vista previa de un grupo de clientes para los avisos: cuántos son y cuántos pueden recibir la notificación.
 * Pro: listas ya armadas. Ultimate: reglas propias.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'
import { programCan, planRequiredBody } from '@/lib/program-plan'
import { audienceFeature } from '@/lib/audience-types'
import { parseAudience, resolveAudience } from '@/lib/audiences'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })
  if (!(await verifyProgramOwner(req, program_id))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let audience = null
  try { audience = parseAudience(JSON.parse(req.nextUrl.searchParams.get('audience') ?? '{"kind":"all"}')) } catch { /* inválida */ }
  if (!audience) return NextResponse.json({ error: 'Audiencia inválida' }, { status: 400 })

  const feature = audienceFeature(audience)
  if (feature && !(await programCan(program_id, feature))) {
    return NextResponse.json(planRequiredBody(feature === 'audiences' ? 'Pro' : 'Ultimate'), { status: 403 })
  }

  const { ids, names } = await resolveAudience(program_id, audience)

  const { data: subs } = await admin.from('push_subscriptions').select('card_id').eq('program_id', program_id)
  const subscribed = new Set((subs ?? []).map(s => s.card_id as string))

  if (ids === null) {
    const { count } = await admin.from('loyalty_cards').select('id', { count: 'exact', head: true }).eq('program_id', program_id).not('active', 'is', false)
    return NextResponse.json({ count: count ?? 0, with_push: subscribed.size, sample: [] })
  }
  return NextResponse.json({ count: ids.length, with_push: ids.filter(id => subscribed.has(id)).length, sample: names })
}
