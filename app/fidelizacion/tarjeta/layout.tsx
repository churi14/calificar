/**
 * Layout server-side para /fidelizacion/tarjeta
 * Lee el logo del programa desde la URL y lo inyecta como apple-touch-icon
 * en el <head> antes de que cargue el JS — necesario para que iOS lo lea bien.
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ program?: string }>
}) {
  const params = searchParams ? await searchParams : null
  const programId = params?.program

  if (!programId) return {}

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('name, logo_url, app_icon_url, businesses!inner(name, plan)')
    .eq('id', programId)
    .single()

  if (!program) return {}

  const biz = Array.isArray(program.businesses) ? program.businesses[0] : program.businesses
  const plan = (biz?.plan ?? 'trial').toLowerCase()
  const isPro = ['pro', 'ultimate', 'gifted'].includes(plan)

  const iconUrl = program.app_icon_url || (isPro ? program.logo_url : null)
  const name = biz?.name ?? program.name

  return {
    title: name,
    icons: iconUrl
      ? {
          apple: iconUrl,
          shortcut: iconUrl,
        }
      : undefined,
  }
}

export default function TarjetaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
