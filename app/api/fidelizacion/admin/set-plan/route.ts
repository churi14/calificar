/**
 * PUT /api/fidelizacion/admin/set-plan
 * Actualiza el plan de un negocio. Solo admin.
 * Body: { business_id, plan, months?, billing_notes? }
 *
 * plan: 'trial' | 'starter' | 'pro' | 'ultimate' | 'gifted'
 * months: si se pasa, plan_expires_at = ahora + N meses. Si no, null (no vence).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_PLANS = ['trial', 'starter', 'pro', 'ultimate', 'gifted']

export async function PUT(req: NextRequest) {
  // Verificar que sea admin
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )
  // Fallback: usar cookie session (para llamadas desde el panel admin)
  const sessionUser = user ?? (await supabase.auth.getUser()).data.user
  if (!sessionUser) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', sessionUser.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Solo admins pueden cambiar planes' }, { status: 403 })
  }

  const { business_id, plan, months, billing_notes } = await req.json()

  if (!business_id || !plan) {
    return NextResponse.json({ error: 'business_id y plan son requeridos' }, { status: 400 })
  }

  if (!VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: `Plan inválido. Opciones: ${VALID_PLANS.join(', ')}` }, { status: 400 })
  }

  // Calcular vencimiento
  let plan_expires_at: string | null = null
  if (months && months > 0) {
    const d = new Date()
    d.setMonth(d.getMonth() + months)
    plan_expires_at = d.toISOString()
  }

  const updateData: Record<string, unknown> = { plan, plan_expires_at }
  if (billing_notes !== undefined) updateData.billing_notes = billing_notes

  const { error } = await admin
    .from('businesses')
    .update(updateData)
    .eq('id', business_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, plan, plan_expires_at })
}
