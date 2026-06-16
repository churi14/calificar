import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import FunnelClient from './client'

interface Props {
  params: { slug: string }
  searchParams: { emp?: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('name')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  return {
    title: data ? `Calificá tu experiencia en ${data.name}` : 'Calificar',
    robots: 'noindex'
  }
}

export default async function FunnelPage({ params, searchParams }: Props) {
  const supabase = createServiceClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, google_review_url, logo_url, whatsapp_number, negative_redirect, threshold, primary_color, accent_color')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!business) notFound()

  // Si viene con parámetro de empleado, buscarlo
  let employee = null
  if (searchParams.emp) {
    const { data } = await supabase
      .from('employees')
      .select('id, name')
      .eq('business_id', business.id)
      .eq('slug', searchParams.emp)
      .eq('active', true)
      .single()
    employee = data
  }

  return <FunnelClient business={business} employee={employee} />
}
