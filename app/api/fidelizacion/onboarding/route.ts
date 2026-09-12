/**
 * POST /api/fidelizacion/onboarding
 * Crea un negocio + programa de fidelidad para un usuario recién registrado.
 *
 * Requiere sesión autenticada (cookie de Supabase).
 * Body: { businessName, businessType?, stampsGoal, rewardDescription }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Cliente con service role para escrituras (bypass RLS)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // ── Verificar sesión del usuario ─────────────────────────────────────────
    const cookieStore = await cookies()

    const anonSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    // Intentar auth por header (OAuth browser flow) o por cookie (SSR flow)
    let user = null
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await anonClient.auth.getUser(token)
      user = data.user
    } else {
      const { data: { user: cookieUser }, error: authErr } = await anonSupabase.auth.getUser()
      if (!authErr) user = cookieUser
    }

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const {
      businessName,
      businessType,
      stampsGoal = 8,
      rewardDescription,
      milestones = [],
      primaryColor = '#7C3AED',
    } = await req.json()

    if (!businessName || !rewardDescription) {
      return NextResponse.json({ error: 'businessName y rewardDescription son requeridos' }, { status: 400 })
    }

    // ── Verificar si el usuario ya tiene un negocio ──────────────────────────
    const { data: existingBusiness } = await adminSupabase
      .from('businesses')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    let businessId: string

    if (existingBusiness) {
      businessId = existingBusiness.id
    } else {
      // ── Crear negocio ──────────────────────────────────────────────────────
      // Generar slug único a partir del nombre
      const baseSlug = businessName
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`

      const { data: business, error: bizErr } = await adminSupabase
        .from('businesses')
        .insert({
          name: businessName,
          slug,
          type: businessType ?? 'otro',
          owner_user_id: user.id,
          active: true,
        })
        .select('id')
        .single()

      if (bizErr || !business) {
        return NextResponse.json({ error: bizErr?.message ?? 'Error creando negocio' }, { status: 500 })
      }

      businessId = business.id
    }

    // ── Crear programa de fidelidad ──────────────────────────────────────────
    const { data: program, error: progErr } = await adminSupabase
      .from('loyalty_programs')
      .insert({
        business_id: businessId,
        name: `Tarjeta de Sellos — ${businessName}`,
        type: 'stamps',
        stamps_goal: stampsGoal,
        reward_description: rewardDescription,
        color_primary: primaryColor,
        color_secondary: '#FFFFFF',
        milestones,
        active: true,
      })
      .select()
      .single()

    if (progErr || !program) {
      return NextResponse.json({ error: progErr?.message ?? 'Error creando programa' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, business_id: businessId, program })
  } catch (err) {
    console.error('Error en /api/fidelizacion/onboarding:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
