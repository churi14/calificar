/**
 * POST /api/fidelizacion/branches
 * Body: { name }
 * El dueño de un negocio Ultimate/gifted crea una sucursal nueva: un programa de fidelidad
 * más dentro de su mismo negocio, copiando el diseño y la configuración del programa principal
 * (el más antiguo) y creando su clase de Google Wallet.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/business-auth'
import { createOrUpdateLoyaltyClass } from '@/lib/wallet/google-wallet'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_BRANCHES = 50

/** Campos de diseño/configuración que se copian del programa principal.
 *  No se copian: id, ubicación (lat/lng/address), dominio propio ni nada específico del local. */
const COPY_FIELDS = [
  'type', 'description', 'logo_url', 'cover_url',
  'color_primary', 'color_secondary', 'card_text_color', 'page_bg_color',
  'app_icon_url', 'stamp_icon_url', 'stamp_icon_no_bg', 'card_background_url',
  'stamps_goal', 'reward_description', 'milestones', 'points_per_peso',
] as const

export async function POST(req: NextRequest) {
  const auth = await verifyToken(req)
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name } = await req.json().catch(() => ({ name: '' }))
  const branchName = String(name ?? '').trim().replace(/[()]/g, '')
  if (branchName.length < 2 || branchName.length > 40) {
    return NextResponse.json({ error: 'El nombre de la sucursal debe tener entre 2 y 40 caracteres' }, { status: 400 })
  }

  // Negocio del usuario
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, plan, plan_expires_at')
    .eq('owner_user_id', auth.userId)
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  // Gate: solo Ultimate / gifted vigente
  const planOk = ['ultimate', 'gifted'].includes((business.plan ?? '').toLowerCase())
  const expired = business.plan_expires_at ? new Date(business.plan_expires_at) < new Date() : false
  if (!planOk || expired) {
    return NextResponse.json({ error: 'Agregar sucursales requiere plan Ultimate vigente', upgrade_required: true }, { status: 403 })
  }

  // Programas existentes: el más antiguo es el principal (modelo del diseño)
  const { data: existing } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', business.id)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (!existing || existing.length === 0) {
    return NextResponse.json({ error: 'Primero configurá tu programa principal' }, { status: 400 })
  }
  if (existing.length >= MAX_BRANCHES) {
    return NextResponse.json({ error: `Llegaste al máximo de ${MAX_BRANCHES} sucursales` }, { status: 400 })
  }

  const source = existing[0] as Record<string, unknown>
  const programName = `Tarjeta de Sellos — ${business.name} (${branchName})`

  // Evitar duplicados por nombre
  if (existing.some(p => (p.name as string).toLowerCase() === programName.toLowerCase())) {
    return NextResponse.json({ error: 'Ya existe una sucursal con ese nombre' }, { status: 409 })
  }

  const copied: Record<string, unknown> = {}
  for (const key of COPY_FIELDS) {
    if (key in source && source[key] !== undefined) copied[key] = source[key]
  }

  const { data: program, error } = await supabase
    .from('loyalty_programs')
    .insert({ ...copied, business_id: business.id, name: programName, active: true })
    .select(`*, businesses(name, id, plan, plan_expires_at, created_at), loyalty_cards(count)`)
    .single()

  if (error || !program) {
    return NextResponse.json({ error: error?.message ?? 'Error creando la sucursal' }, { status: 500 })
  }

  // Clase de Google Wallet (si falla, la sucursal igual queda creada)
  let wallet: 'ok' | 'failed' = 'ok'
  try {
    await createOrUpdateLoyaltyClass({
      classId: program.id,
      programName,
      issuerName: business.name,
      logoUrl: (copied.logo_url as string | null) ?? 'https://calificar.com.ar/logo.svg',
      hexBgColor: (copied.color_primary as string) ?? '#7C3AED',
      heroImageUrl: (copied.cover_url as string | null) ?? undefined,
      stampsGoal: (copied.stamps_goal as number) ?? 10,
      rewardDescription: (copied.reward_description as string) ?? '',
    })
  } catch (walletErr) {
    console.error('Error creando clase Wallet de la sucursal (no crítico):', walletErr)
    wallet = 'failed'
  }

  return NextResponse.json({ ok: true, program, wallet })
}
