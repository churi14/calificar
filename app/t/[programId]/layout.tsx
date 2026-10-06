/**
 * Layout server-side para /t/[programId]
 *
 * React 19 (Next.js 16) soporta hoisting nativo de <link>, <meta> y <title>
 * desde cualquier Server Component al <head>. Inyectamos el manifest directo
 * en el JSX — sin depender de generateMetadata que ignora query params.
 */
import { createClient } from '@supabase/supabase-js'
import type { Metadata, Viewport } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// generateMetadata para title, icons, etc (sin manifest — lo hacemos via JSX)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ programId: string }>
}): Promise<Metadata> {
  const { programId } = await params

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('name, app_icon_url, logo_url, businesses!inner(name, plan)')
    .eq('id', programId)
    .single()

  if (!program) return {}

  const biz = Array.isArray(program.businesses) ? program.businesses[0] : program.businesses
  const plan = (biz?.plan ?? 'trial').toLowerCase()
  const isPro = ['pro', 'ultimate', 'gifted'].includes(plan)
  const businessName = biz?.name ?? program.name
  const iconUrl = program.app_icon_url || (isPro ? program.logo_url : null)

  return {
    title: businessName,
    icons: iconUrl ? { apple: iconUrl, shortcut: iconUrl } : undefined,
  }
}

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
  return { themeColor: program?.color_primary ?? '#7C3AED' }
}

// El layout es async Server Component — puede leer params directamente.
// React 19 hoist <link rel="manifest"> al <head> automáticamente.
export default async function TLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ programId: string }>
}) {
  const { programId } = await params
  const manifestHref = `/api/fidelizacion/manifest?program_id=${programId}&scope_path=t`

  return (
    <>
      {/* React 19: este <link> se mueve al <head> en el HTML inicial (SSR) */}
      <link rel="manifest" href={manifestHref} />
      {children}
    </>
  )
}
