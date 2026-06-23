import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BusinessDetailClient from './client'

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!business) notFound()

  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const { data: scans } = await supabase
    .from('scans')
    .select('created_at, outcome, employee_id')
    .eq('business_id', id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  const days: Record<string, { total: number; positive: number }> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    days[key] = { total: 0, positive: 0 }
  }
  scans?.forEach(s => {
    const key = s.created_at.split('T')[0]
    if (days[key]) {
      days[key].total++
      if (s.outcome === 'positive') days[key].positive++
    }
  })

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name, total_scans, slug')
    .eq('business_id', id)
    .order('total_scans', { ascending: false })

  const { count: unreadCount } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', id)
    .eq('read', false)

  const employeeMap: Record<string, string> = {}
  employees?.forEach(e => { employeeMap[e.id] = e.name })

  const rawScans = scans?.map(s => ({
    created_at: s.created_at,
    outcome: s.outcome as string,
    employee_id: s.employee_id ?? null,
    employee_name: s.employee_id ? (employeeMap[s.employee_id] ?? null) : null,
  })) ?? []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'

  return (
    <BusinessDetailClient
      business={business}
      weeklyScans={Object.entries(days).map(([date, v]) => ({ date, ...v }))}
      rawScans={rawScans}
      employees={employees ?? []}
      unreadFeedback={unreadCount ?? 0}
      appUrl={appUrl}
    />
  )
}