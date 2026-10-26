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
import { createOrUpdateLoyaltyClass } from '@/lib/wallet/google-wallet'

// Cliente con service role para escrituras (bypass RLS)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Manda un mail a los administradores cuando se registra un negocio nuevo */
async function notifyAdminsNewBusiness(b: { name: string; type: string; phone: string; email: string }) {
  if (!process.env.RESEND_API_KEY) return
  let to: string[] = (process.env.ADMIN_NOTIFY_EMAIL ?? '').split(',').map(x => x.trim()).filter(Boolean)
  if (to.length === 0) {
    const { data } = await adminSupabase.from('profiles').select('email').eq('role', 'admin')
    to = (data ?? []).map(r => r.email as string).filter(Boolean)
  }
  if (to.length === 0) return
  const digits = b.phone.startsWith('54') ? b.phone : `549${b.phone.replace(/^0+/, '')}`
  const wa = b.phone ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola! Te escribo de Calificar por ${b.name}.`)}` : ''
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Calificar <notificaciones@calificar.com.ar>',
    to,
    subject: `Nuevo registro: ${b.name}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px">
      <h2 style="margin:0 0 12px">Se registró un negocio nuevo 🎉</h2>
      <p style="margin:4px 0"><b>Negocio:</b> ${b.name}</p>
      <p style="margin:4px 0"><b>Rubro:</b> ${b.type}</p>
      <p style="margin:4px 0"><b>Email:</b> ${b.email}</p>
      <p style="margin:4px 0"><b>WhatsApp:</b> ${b.phone || 'sin teléfono'}</p>
      ${wa ? `<p style="margin:16px 0"><a href="${wa}" style="background:#25D366;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:10px;display:inline-block">Escribirle por WhatsApp</a></p>` : ''}
    </div>`,
  })
}

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
      phone,
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
          whatsapp_number: typeof phone === 'string' ? phone.replace(/\D/g, '').slice(0, 15) || null : null,
        })
        .select('id')
        .single()

      if (bizErr || !business) {
        return NextResponse.json({ error: bizErr?.message ?? 'Error creando negocio' }, { status: 500 })
      }

      businessId = business.id

      // Aviso por mail al administrador: nuevo registro (no frena el registro si falla)
      try {
        await notifyAdminsNewBusiness({
          name: businessName,
          type: businessType ?? 'otro',
          phone: typeof phone === 'string' ? phone.replace(/\D/g, '') : '',
          email: user.email ?? '',
        })
      } catch (e) {
        console.error('[onboarding] no se pudo avisar al admin:', e)
      }
    }

    // ── Verificar si el negocio ya tiene un programa de fidelidad ────────────
    const { data: existingProgram } = await adminSupabase
      .from('loyalty_programs')
      .select('id')
      .eq('business_id', businessId)
      .limit(1)
      .single()

    if (existingProgram) {
      // Ya tiene programa — redirigir al panel sin crear nada nuevo
      return NextResponse.json({ ok: true, business_id: businessId, program: existingProgram, existing: true })
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

    // ── Crear clase en Google Wallet ─────────────────────────────────────────
    // Sin esto, cualquier tarjeta falla con "Ocurrió un error" al agregar a Wallet
    try {
      await createOrUpdateLoyaltyClass({
        classId: program.id,
        programName: `Tarjeta de Sellos — ${businessName}`,
        issuerName: businessName,
        logoUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/logo-wallet.png`,
        hexBgColor: primaryColor,
        stampsGoal,
        rewardDescription,
      })
    } catch (walletErr) {
      // No bloquear el onboarding si falla Wallet — se puede sincronizar después
      console.error('[WALLET] Error creando clase en onboarding:', walletErr)
    }

    return NextResponse.json({ ok: true, business_id: businessId, program })
  } catch (err) {
    console.error('Error en /api/fidelizacion/onboarding:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
