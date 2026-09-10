/**
 * GET  /api/fidelizacion/admin          — lista todos los programas con stats
 * POST /api/fidelizacion/admin          — crea un programa nuevo
 * PUT  /api/fidelizacion/admin          — actualiza un programa existente
 *
 * Solo accesible para el admin (service role).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createOrUpdateLoyaltyClass } from '@/lib/wallet/google-wallet'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── GET: listar programas con cantidad de clientes ──────────────────────────
export async function GET() {
  const { data: programs, error } = await supabase
    .from('loyalty_programs')
    .select(`
      *,
      businesses(name, id),
      loyalty_cards(count)
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ programs })
}

// ─── POST: crear programa + clase en Google Wallet ───────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    business_id,
    name,
    description,
    logo_url,
    cover_url,
    color_primary = '#7C3AED',
    color_secondary = '#FFFFFF',
    type = 'stamps',
    stamps_goal = 10,
    points_per_peso,
    reward_description,
    lat,
    lng,
    address,
  } = body

  if (!business_id || !name || !reward_description) {
    return NextResponse.json({ error: 'business_id, name y reward_description son requeridos' }, { status: 400 })
  }

  // Obtener nombre del negocio
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', business_id)
    .single()

  // Insertar programa en Supabase
  const { data: program, error } = await supabase
    .from('loyalty_programs')
    .insert({
      business_id,
      name,
      description,
      logo_url,
      cover_url,
      color_primary,
      color_secondary,
      type,
      stamps_goal,
      points_per_peso,
      reward_description,
      lat,
      lng,
      address,
      active: true,
    })
    .select()
    .single()

  if (error || !program) {
    return NextResponse.json({ error: error?.message ?? 'Error creando programa' }, { status: 500 })
  }

  // Crear clase en Google Wallet (no bloquea si falla)
  try {
    await createOrUpdateLoyaltyClass({
      classId: program.id,
      programName: name,
      issuerName: business?.name ?? 'Calificar',
      logoUrl: logo_url ?? 'https://calificar.com.ar/logo.svg',
      hexBgColor: color_primary,
      heroImageUrl: cover_url,
      lat,
      lng,
      stampsGoal: stamps_goal,
      rewardDescription: reward_description,
    })
  } catch (walletErr) {
    console.error('Error creando clase Wallet (no crítico):', walletErr)
  }

  return NextResponse.json({ program })
}

// ─── PUT: actualizar programa ─────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...fields } = body

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { data: program, error } = await supabase
    .from('loyalty_programs')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sincronizar con Google Wallet
  try {
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', program.business_id)
      .single()

    await createOrUpdateLoyaltyClass({
      classId: program.id,
      programName: program.name,
      issuerName: business?.name ?? 'Calificar',
      logoUrl: program.logo_url ?? 'https://calificar.com.ar/logo.svg',
      hexBgColor: program.color_primary,
      heroImageUrl: program.cover_url,
      lat: program.lat,
      lng: program.lng,
      stampsGoal: program.stamps_goal,
      rewardDescription: program.reward_description,
    })
  } catch (e) {
    console.error('Error actualizando clase Wallet:', e)
  }

  return NextResponse.json({ program })
}

// ─── DELETE: borrar programa (y en cascada sus tarjetas/transacciones) ────────
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { error } = await supabase
    .from('loyalty_programs')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
