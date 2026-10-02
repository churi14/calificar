/**
 * GET /api/fidelizacion/icon?program_id=X&size=96
 * Genera un ícono cuadrado con el color del negocio de fondo y su logo centrado.
 * Ideal para notificaciones push y PWA.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const program_id = searchParams.get('program_id')
  const size = Math.min(parseInt(searchParams.get('size') ?? '192'), 512)

  // Fallback: logo de Calificar
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'

  if (!program_id) {
    return NextResponse.redirect(`${BASE}/logo.svg`)
  }

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('logo_url, color_primary')
    .eq('id', program_id)
    .single()

  if (!program?.logo_url) {
    return NextResponse.redirect(`${BASE}/logo.svg`)
  }

  try {
    // Descargar logo
    const logoRes = await fetch(program.logo_url)
    if (!logoRes.ok) return NextResponse.redirect(`${BASE}/logo.svg`)
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer())

    const color = program.color_primary ?? '#7C3AED'
    const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#7C3AED')

    // Logo redimensionado al 70% del ícono, centrado
    const logoSize = Math.round(size * 0.70)
    const padding = Math.round((size - logoSize) / 2)

    const resizedLogo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r, g, b, alpha: 0 } })
      .png()
      .toBuffer()

    // Fondo sólido con el color del negocio + logo encima
    const icon = await sharp({
      create: { width: size, height: size, channels: 4, background: { r, g, b, alpha: 255 } },
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toBuffer()

    return new NextResponse(icon as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('[icon] Error generando ícono:', err)
    return NextResponse.redirect(`${BASE}/logo.svg`)
  }
}
