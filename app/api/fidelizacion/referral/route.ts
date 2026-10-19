/**
 * GET  /api/fidelizacion/referral?program_id=xxx  — lee config de referidos
 * POST /api/fidelizacion/referral                 — guarda config de referidos
 */

import { programCan, planRequiredBody } from '@/lib/program-plan'
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

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data } = await supabase
    .from('referral_settings')
    .select('*')
    .eq('program_id', program_id)
    .maybeSingle()

  return NextResponse.json({ settings: data ?? { enabled: false, referrer_stamps: 1, referred_stamps: 1 } })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { program_id, enabled, referrer_stamps, referred_stamps } = body

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (enabled && !(await programCan(program_id, 'referrals'))) {
    return NextResponse.json(planRequiredBody('Pro'), { status: 403 })
  }

  const { error } = await supabase
    .from('referral_settings')
    .upsert({
      program_id,
      enabled: !!enabled,
      referrer_stamps: referrer_stamps ?? 1,
      referred_stamps: referred_stamps ?? 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'program_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
