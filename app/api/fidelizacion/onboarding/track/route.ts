/**
 * POST /api/fidelizacion/onboarding/track
 * Registra eventos de funnel del onboarding (anónimos).
 * Fire-and-forget: el cliente no necesita esperar la respuesta.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { session_id, step, step_name, event, data } = await req.json()

    if (!session_id || !event) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    await supabase.from('onboarding_events').insert({
      session_id,
      step,
      step_name,
      event,
      data,
      user_agent: req.headers.get('user-agent'),
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Silencioso — no romper el onboarding por un error de tracking
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
