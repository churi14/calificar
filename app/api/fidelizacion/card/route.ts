import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getWalletLink } from '@/lib/wallet/google-wallet'
import { planState, GENERIC_CARD_DESIGN } from '@/lib/plan-status'
import { canUse } from '@/lib/plan-features'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get('card_id')
  if (!cardId) return NextResponse.json({ error: 'card_id requerido' }, { status: 400 })

  const { data: card, error } = await supabase
    .from('loyalty_cards')
    .select('*, loyalty_programs(id, name, stamps_goal, reward_description, color_primary, card_text_color, logo_url, app_icon_url, stamp_icon_url, card_background_url, page_bg_color, stamp_icon_no_bg, milestones, businesses(name, whatsapp_number, plan, plan_expires_at, created_at))')
    .eq('id', cardId)
    .single()

  if (error || !card) return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })

  const bizRaw0 = card.loyalty_programs?.businesses
  const biz0 = (Array.isArray(bizRaw0) ? bizRaw0[0] : bizRaw0) as { plan?: string | null } | null
  const plan0 = biz0?.plan

  // Generar wallet link si el dispositivo es Android y tiene wallet_object_id (Wallet: Pro en adelante)
  let wallet_link: string | null = null
  if (card.wallet_object_id && card.loyalty_programs?.id && canUse(plan0, 'wallet')) {
    try {
      wallet_link = getWalletLink(card.wallet_object_id, card.loyalty_programs.id, {
        customerName: card.name ?? card.phone,
        stamps: card.stamps,
        stampsGoal: card.loyalty_programs.stamps_goal,
        rewardDescription: card.loyalty_programs.reward_description,
      })
    } catch {
      // Si falla la firma, no bloqueamos la respuesta
    }
  }

  // Referidos: se muestra el link para compartir solo si el negocio lo tiene activado y su plan lo incluye
  if (card.loyalty_programs?.id) {
    const { data: ref } = await supabase.from('referral_settings').select('enabled').eq('program_id', card.loyalty_programs.id).maybeSingle()
    card.loyalty_programs = { ...card.loyalty_programs, referral_enabled: !!ref?.enabled && canUse(plan0, 'referrals') }
  }

  // Los premios en el camino son del plan Pro en adelante
  if (card.loyalty_programs && !canUse(plan0, 'milestones')) {
    card.loyalty_programs = { ...card.loyalty_programs, milestones: [] }
  }
  // La marca Calificar aparece en todas las tarjetas menos en Ultimate
  if (card.loyalty_programs && !canUse(plan0, 'no_branding')) {
    card.loyalty_programs = { ...card.loyalty_programs, calificar_branding: true }
  }

  // Sin plan vigente (pasada la gracia): tarjeta genérica de Calificar, conservando el nombre del negocio.
  // Sigue funcionando igual: sellos, registro y canje de premios.
  const bizRaw = card.loyalty_programs?.businesses
  const biz = Array.isArray(bizRaw) ? bizRaw[0] : bizRaw
  if (card.loyalty_programs && planState(biz ?? {}) === 'basic') {
    card.loyalty_programs = { ...card.loyalty_programs, ...GENERIC_CARD_DESIGN, calificar_branding: true }
  }

  return NextResponse.json({ card, wallet_link })
}
