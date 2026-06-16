import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedbackClient from './client'

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)

  const businessIds = businesses?.map(b => b.id) ?? []

  const { data: feedback } = await supabase
    .from('feedback')
    .select('*, businesses(name)')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false })
    .limit(200)

  return <FeedbackClient feedback={feedback ?? []} businesses={businesses ?? []}/>
}
