import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import SplashClient from './SplashClient'

export const dynamic = 'force-dynamic'

export default async function QRRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('qr_redirects')
    .select('code, business_name, google_url, activated')
    .eq('code', code.toUpperCase())
    .single()

  // Código inválido
  if (!data) redirect('https://calificar.com.ar')

  // No activado aún → setup
  if (!data.activated || !data.google_url) {
    redirect(`/g/${code}/setup`)
  }

  return (
    <SplashClient
      code={data.code}
      businessName={data.business_name ?? 'Tu negocio'}
      googleUrl={data.google_url}
    />
  )
}
