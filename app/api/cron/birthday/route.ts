/**
 * GET /api/cron/birthday
 * Llamado una vez al día por Vercel Cron (ver vercel.json). Recorre los programas con la campaña
 * de cumpleaños activada y genera el cupón y el aviso de los clientes que cumplen años hoy.
 */
import { NextRequest, NextResponse } from 'next/server'
import { enabledBirthdayPrograms, runBirthdayCampaign } from '@/lib/birthday-run'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const programs = await enabledBirthdayPrograms()
  let generated = 0
  for (const id of programs) {
    try {
      generated += (await runBirthdayCampaign(id)).generated
    } catch {
      // si un programa falla, seguimos con los demás
    }
  }
  return NextResponse.json({ ok: true, programs: programs.length, generated })
}
