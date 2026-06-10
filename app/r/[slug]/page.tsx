import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import FunnelClient from './client'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('name')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  return {
    title: data ? `Calificá tu experiencia en ${data.name}` : 'Calificar',
    robots: 'noindex'
  }
}

export default async function FunnelPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ emp?: string }> }) {
  const { slug } = await params
  const { emp } = await searchParams
  const supabase = createServiceClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, google_review_url, logo_url, whatsapp_number, negative_redirect, threshold, primary_color, accent_color')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!business) notFound()

  let employee = null
  if (emp) {
    const { data } = await supabase
      .from('employees')
      .select('id, name')
      .eq('business_id', business.id)
      .eq('slug', emp)
      .eq('active', true)
      .single()
    employee = data
  }

  return <FunnelClient business={business} employee={employee} />
}