/**
 * GET  /api/fidelizacion/spin-wheel?program_id=xxx          — settings públicos (para mostrar la rueda)
 * GET  /api/fidelizacion/spin-wheel?program_id=xxx&owner=1  — settings completos (dueño)
 * POST /api/fidelizacion/spin-wheel                         — guardar settings (dueño)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyProgramOwner } from '@/lib/business-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEFAULT_PRIZES = [
  { id: '1', label: '2 sellos',           type: 'stamps', value: 2, probability: 25, color: '#7C3AED' },
  { id: '2', label: '1 sello',            type: 'stamps', value: 1, probability: 35, color: '#10B981' },
  { id: '3', label: '¡Premio especial!',  type: 'coupon', value: 0, probability: 10, color: '#F59E0B', coupon_prefix: 'PREMIO' },
  { id: '4', label: 'Suerte próxima vez', type: 'none',   value: 0, probability: 30, color: '#6B7280' },
]

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const isOwner = req.nextUrl.searchParams.get('owner') === '1'
  if (isOwner) {
    const owner = await verifyProgramOwner(req, program_id)
    if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data } = await supabase
    .from('spin_wheel_settings')
    .select('*')
    .eq('program_id', program_id)
    .maybeSingle()

  // Si no hay config guardada, devolver defaults
  const settings = data ?? {
    program_id,
    enabled: false,
    frequency: 'daily',
    prizes: DEFAULT_PRIZES,
  }

  // Versión pública: no exponer el coupon_prefix
  if (!isOwner) {
    const { prizes, ...rest } = settings
    const publicPrizes = (prizes as typeof DEFAULT_PRIZES).map(({ coupon_prefix: _cp, ...p }) => p)
    return NextResponse.json({ settings: { ...rest, prizes: publicPrizes } })
  }

  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { program_id, enabled, frequency, prizes } = body

  if (!program_id) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 })

  const owner = await verifyProgramOwner(req, program_id)
  if (!owner) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!Array.isArray(prizes) || prizes.length < 2) {
    return NextResponse.json({ error: 'Necesitás al menos 2 premios' }, { status: 400 })
  }

  const { error } = await supabase
    .from('spin_wheel_settings')
    .upsert({
      program_id,
      enabled: !!enabled,
      frequency: frequency ?? 'daily',
      prizes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'program_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
