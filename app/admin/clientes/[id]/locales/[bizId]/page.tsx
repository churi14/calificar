import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import BusinessEditor from './BusinessEditor'

export const dynamic = 'force-dynamic'

type Business = {
  id: string; name: string; slug: string; active: boolean
  google_review_url: string | null; whatsapp_number: string | null
  negative_redirect: string; threshold: number
  primary_color: string; accent_color: string
  total_scans: number; positive_scans: number; negative_scans: number
}

export default async function EditBusinessPage({
  params
}: {
  params: Promise<{ id: string; bizId: string }>
}) {
  const { id: clientId, bizId } = await params
  const supabase = createServiceClient()

  // Verificar que el negocio pertenece a este cliente
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, active, google_review_url, whatsapp_number, negative_redirect, threshold, primary_color, accent_color, total_scans, positive_scans, negative_scans')
    .eq('id', bizId)
    .eq('owner_id', clientId)
    .single()

  if (!business) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', clientId)
    .single()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-gray-600">← Clientes</Link>
        <span className="text-gray-200">/</span>
        <Link href={`/admin/clientes/${clientId}`} className="text-sm text-gray-400 hover:text-gray-600">
          {profile?.name ?? profile?.email ?? 'Cliente'}
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-extrabold text-gray-900">{business.name}</h1>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Scans', value: business.total_scans ?? 0 },
          { label: 'Positivos', value: business.positive_scans ?? 0 },
          { label: 'Filtrados', value: business.negative_scans ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <BusinessEditor business={business as Business} clientId={clientId} />
    </div>
  )
}
