/**
 * GET /api/cron/reactivation
 * Llamado por Vercel Cron una vez al día (ver vercel.json).
 * Itera todos los programas con reactivation_campaigns.enabled = true
 * y dispara el trigger de reactivación para cada uno.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'

export async function GET(req: NextRequest) {
  // Verificar cron secret
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Traer todos los programas con campaña de reactivación activa
  const { data: campaigns, error } = await admin
    .from('reactivation_campaigns')
    .select('program_id')
    .eq('enabled', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  let processed = 0
  let totalSent = 0

  for (const campaign of campaigns) {
    try {
      const res = await fetch(`${BASE}/api/fidelizacion/reactivation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.CRON_SECRET ?? '',
        },
        body: JSON.stringify({ program_id: campaign.program_id }),
      })
      const data = await res.json()
      totalSent += data.sent ?? 0
      processed++
    } catch {
      // Si un programa falla, seguimos con los demás
    }
  }

  return NextResponse.json({ ok: true, processed, total_sent: totalSent })
}
