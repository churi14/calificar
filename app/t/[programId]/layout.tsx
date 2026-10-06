/**
 * Layout server-side para /t/[programId]
 * Inyecta el manifest dinámico con scope aislado por programa via SSR.
 * generateMetadata corre en el servidor → el <link rel="manifest"> está en el HTML inicial.
 */
import { createClient } from '@supabase/supabase-js'
import type { Metadata, Viewport } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programId: string }>
}): Promise<Metadata> {
  const { programId } = await params

  // Siempre inyectar el manifest — incluso si Supabase falla.
  // Usamos path relativo (sin dominio) — Next.js lo maneja mejor que URLs absolutas.
  const manifestHref = `/api/fidelizacion/manifest?program_id=${programId}&scope_path=t`

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('name, color_primary, app_icon_url, logo_url, businesses!inner(name, plan)')
    .eq('id', programId)
    .single()

  if (!program) {
    return {
      manifest: manifestHref,
    }
  }

  const biz = Array.isArray(program.businesses) ? program.businesses[0] : program.businesses
  const plan = (biz?.plan ?? 'trial').toLowerCase()
  const isPro = ['pro', 'ultimate', 'gifted'].includes(plan)
  const businessName = biz?.name ?? program.name
  const iconUrl = program.app_icon_url || (isPro ? program.logo_url : null)

  return {
    title: businessName,
    manifest: manifestHref,
    icons: iconUrl
      ? { apple: iconUrl, shortcut: iconUrl }
      : undefined,
  }
}

// themeColor va en viewport (separado de Metadata desde Next.js 14)
export async function generateViewport({
  params,
}: {
  params: Promise<{ programId: string }>
}): Promise<Viewport> {
  const { programId } = await params
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('color_primary')
    .eq('id', programId)
    .single()
  return {
    themeColor: program?.color_primary ?? '#7C3AED',
  }
}

export default function TLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
