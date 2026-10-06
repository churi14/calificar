/**
 * GET /api/fidelizacion/manifest?program_id=X
 * Devuelve un Web App Manifest dinámico con el logo y nombre del negocio.
 * Planes starter/pro/ultimate/gifted usan el logo del negocio como ícono.
 * Plan trial usa el ícono genérico de Calificar.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const program_id = req.nextUrl.searchParams.get('program_id')
  const card_id = req.nextUrl.searchParams.get('card_id')
  const scope_path = req.nextUrl.searchParams.get('scope_path') // 't' → /t/{program_id}/ scope aislado

  let appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'
  if (!appUrl.startsWith('http')) appUrl = 'https://' + appUrl

  // Manifest genérico si no hay programa
  if (!program_id) {
    return defaultManifest(appUrl)
  }

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('id, name, color_primary, logo_url, app_icon_url, businesses!inner(name, plan)')
    .eq('id', program_id)
    .single()

  if (!program) return defaultManifest(appUrl)

  // Supabase puede devolver array u objeto según el tipo de relación
  const bizRaw = program.businesses
  const biz = (Array.isArray(bizRaw) ? bizRaw[0] : bizRaw) as { name: string; plan: string | null } | null
  const plan = (biz?.plan ?? 'trial').toLowerCase()
  const businessName = biz?.name ?? program.name
  const color = program.color_primary ?? '#7C3AED'

  // Pro/Ultimate/Gifted → usar app_icon_url si está, sino logo_url como fallback
  const iconUrl = program.app_icon_url || (
    ['pro', 'ultimate', 'gifted'].includes(plan) ? program.logo_url : null
  )
  const useBusinessLogo = !!iconUrl

  // scope: aislado por negocio cuando scope_path='t', genérico sino
  const scope = scope_path === 't'
    ? `${appUrl}/t/${program_id}/`
    : `${appUrl}/`

  const startUrl = scope_path === 't'
    ? (card_id
        ? `${appUrl}/t/${program_id}?card=${card_id}`
        : `${appUrl}/fidelizacion/unirse?program=${program_id}`)
    : (card_id
        ? `${appUrl}/fidelizacion/tarjeta?card=${card_id}&program=${program_id}`
        : `${appUrl}/fidelizacion/unirse?program=${program_id}`)

  // Chrome requiere PNG en 192x192 Y 512x512 para permitir instalación como PWA.
  // SVG con sizes="any" NO cumple el criterio A2HS de Chromium.
  const icons = useBusinessLogo
    ? [
        { src: iconUrl!, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: iconUrl!, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: iconUrl!, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ]
    : [
        // Fallback: íconos genéricos de Calificar en PNG (requerido por Chromium)
        { src: `${appUrl}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: `${appUrl}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: `${appUrl}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ]

  const manifest = {
    name: businessName,
    short_name: businessName.length > 12 ? businessName.substring(0, 12) + '…' : businessName,
    description: `Tarjeta de sellos de ${businessName}`,
    start_url: startUrl,
    scope,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: color,
    orientation: 'portrait',
    icons,
  }

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function defaultManifest(appUrl: string) {
  return new NextResponse(JSON.stringify({
    name: 'Calificar Fidelización',
    short_name: 'Calificar',
    description: 'Tu tarjeta de puntos digital',
    start_url: `${appUrl}/fidelizacion/tarjeta`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7C3AED',
    orientation: 'portrait',
    icons: [
      { src: `${appUrl}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${appUrl}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${appUrl}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }), {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
