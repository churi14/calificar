// ── Shared types for the Fidelización dashboard ──────────────────────────────
// Extracted from app/negocio/fidelizacion/page.tsx as part of Fase 1 refactor.

export type Milestone = {
  at: number
  label: string
  coupon_prefix?: string
}

export type Program = {
  id: string
  name: string
  stamps_goal: number
  reward_description: string
  color_primary: string
  card_text_color: string | null
  card_background_url: string | null
  page_bg_color: string | null
  stamp_icon_no_bg: boolean | null
  logo_url: string | null
  app_icon_url: string | null
  stamp_icon_url: string | null
  milestones?: Milestone[]
  /** Nombre que el dueño le puso a la sucursal principal (vacío = "Principal") */
  main_branch_name?: string | null
  businesses?: { name: string; id: string }
}

export type Branch = {
  id: string
  name: string
  created_at?: string
}

export type Card = {
  id: string
  name: string
  phone: string
  stamps: number
  total_visits: number
  birth_date: string | null
  created_at: string
  dni?: string | null
}

export type Transaction = {
  id: string
  type: 'stamp' | 'reward'
  created_at: string
  loyalty_cards: { name: string }
  coupon_code: string | null
}

export type Stats = {
  total: number
  stampsToday: number
  rewardsTotal: number
}

export type PushLog = {
  id: string
  title: string
  body: string
  sent_to: number
  created_at: string
}

export type PushSubscriber = {
  id: string
  card_id: string
  name: string
  phone: string
  subscribed_at: string
}

export type NotifRecipient = {
  name: string
  phone: string
  ok: boolean
}

export type StampModalState = {
  cardId: string
  name: string
}

export type ViewType =
  | 'hoy'
  | 'sello-rapido'
  | 'tarjeta'
  | 'clientes'
  | 'cupones'
  | 'push'
  | 'proximidad'
  | 'cumple'
  | 'reactivacion'
  | 'insights'
  | 'reseñas'
  | 'referencias'
  | 'ruleta'
  | 'metricas'
  | 'dominio'
  | 'imprimir'
  | 'perfil'
  | 'plan'
  | 'ayuda'
  | 'primeros-pasos'
