/**
 * GET /api/fidelizacion/admin/list-businesses
 * Lista todos los negocios con su plan actual. Solo admin.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await admin
    .from('businesses')
    .select('id, name, plan, plan_expires_at, billing_notes, owner_user_id, created_at, loyalty_programs(id)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ businesses: data ?? [] })
}
