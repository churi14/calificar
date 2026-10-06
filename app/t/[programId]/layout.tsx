/**
 * Layout server-side para /t/[programId]
 * Inyecta el manifest dinámico con scope aislado por programa.
 * Cada negocio tiene su propio scope → sus PWAs no se pisan entre sí.
 */
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('name, color_primary, app_icon_url, logo_url, businesses!inner(name, plan)')
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
    // El manifest usa /t/{programId}/ como scope → PWA aislada por negocio
    manifest: `${appUrl}/api/fidelizacion/manifest?program_id=${programId}&scope_path=t`,
    icons: iconUrl
      ? { apple: iconUrl, shortcut: iconUrl }
      : undefined,
    themeColor: program.color_primary ?? '#7C3AED',
  }
}

export default function TLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
