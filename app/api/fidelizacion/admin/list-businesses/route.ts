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

  // Traer emails desde profiles
  const ownerIds = [...new Set((data ?? []).map((b: { owner_user_id: string }) => b.owner_user_id).filter(Boolean))]
  const { data: profiles } = ownerIds.length
    ? await admin.from('profiles').select('id, email').in('id', ownerIds)
    : { data: [] }

  const emailMap: Record<string, string> = {}
  for (const p of profiles ?? []) emailMap[p.id] = p.email

  const businesses = (data ?? []).map((b: { owner_user_id: string }) => ({
    ...b,
    owner_email: emailMap[b.owner_user_id] ?? null,
  }))

  return NextResponse.json({ businesses })
}
