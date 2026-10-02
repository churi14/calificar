/**
 * GET /api/fidelizacion/manifest?program_id=X&card_id=Y
 * Devuelve un manifest.json dinámico con el logo y colores del negocio.
 * Si el negocio tiene plan activo, usa su logo; si no, usa el de Calificar.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isPlanActive(plan: string | null, expiresAt: string | null) {
  if (!plan || plan === 'trial') return false
  if (!expiresAt) return true
  return new Date(expiresAt) > new Date()
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const program_id = searchParams.get('program_id')
  const card_id = searchParams.get('card_id')

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'

  // Fallback: manifest genérico de Calificar
  const fallback = {
    name: 'Calificar Fidelización',
    short_name: 'Calificar',
    description: 'Tu tarjeta de puntos digital',
    start_url: card_id ? `${BASE}/fidelizacion/tarjeta?card=${card_id}&program=${program_id ?? ''}` : `${BASE}/fidelizacion/tarjeta`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7C3AED',
    orientation: 'portrait',
    icons: [{ src: `${BASE}/logo.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  }

  if (!program_id) {
    return NextResponse.json(fallback, {
      headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=300' },
    })
  }

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('id, name, color_primary, logo_url, businesses(name, plan, plan_expires_at)')
    .eq('id', program_id)
    .single()

  if (!program) {
    return NextResponse.json(fallback, {
      headers: { 'Content-Type': 'application/manifest+json' },
    })
  }

  const biz = program.businesses as unknown as { name: string; plan: string | null; plan_expires_at: string | null } | null
  const hasPaidPlan = isPlanActive(biz?.plan ?? null, biz?.plan_expires_at ?? null)
  const bizName = biz?.name ?? program.name
  const startUrl = card_id
    ? `${BASE}/fidelizacion/tarjeta?card=${card_id}&program=${program_id}`
    : `${BASE}/fidelizacion/tarjeta?program=${program_id}`

  // Si tiene plan pago Y tiene logo → usar el endpoint de ícono generado (con fondo sólido)
  const iconSrc = hasPaidPlan && program.logo_url
    ? `${BASE}/api/fidelizacion/icon?program_id=${program.id}&size=192`
    : `${BASE}/logo.svg`

  const manifest = {
    name: `${bizName} — Sellos`,
    short_name: bizName.length > 12 ? bizName.substring(0, 12) : bizName,
    description: `Tu tarjeta de sellos de ${bizName}`,
    start_url: startUrl,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: program.color_primary ?? '#7C3AED',
    orientation: 'portrait',
    icons: [
      { src: iconSrc, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: iconSrc.replace('size=192', 'size=512'), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
