/**
 * Qué función se habilita en cada plan. Una sola fuente para el panel, las APIs y los textos.
 * Decidido con el dueño (octubre 2026), ver planes-y-funciones.xlsx.
 *
 *  Starter: tarjeta web con logo, QR, sello rápido/manual, cupones, lista de clientes, 1 local.
 *  Pro:     + Wallet, avisos push, exportar, premios en el camino, proximidad, cumpleaños, reactivación,
 *             reseñas, referidos, audiencias, diseño completo y hasta 3 locales con métricas por local.
 *  Ultimate: + ruleta, estadísticas de actividad, reactivación por frecuencia, audiencias con reglas propias,
 *             usuarios del equipo, dominio propio, tarjeta sin marca Calificar y hasta 50 locales.
 *
 * La prueba gratuita abre casi todo para que conozcan el sistema; quedan afuera lo que ya estaba cerrado
 * (Wallet, diseño completo, dominio propio, métricas por sucursal y quitar la marca).
 */
export type Feature =
  | 'wallet'
  | 'design'
  | 'push'
  | 'export'
  | 'milestones'
  | 'proximity'
  | 'birthday'
  | 'reactivation'
  | 'reactivation_hour'
  | 'reactivation_smart'
  | 'wheel'
  | 'referrals'
  | 'reviews'
  | 'insights'
  | 'audiences'
  | 'audiences_custom'
  | 'branch_metrics'
  | 'team'
  | 'custom_domain'
  | 'no_branding'

type Tier = 'starter' | 'pro' | 'ultimate'
const RANK: Record<Tier, number> = { starter: 1, pro: 2, ultimate: 3 }

/** Plan mínimo que incluye cada función */
const MIN_TIER: Record<Feature, Tier> = {
  wallet: 'pro',
  design: 'pro',
  push: 'pro',
  export: 'pro',
  milestones: 'pro',
  proximity: 'pro',
  birthday: 'pro',
  reactivation: 'pro',
  reactivation_hour: 'pro',
  reactivation_smart: 'ultimate',
  wheel: 'ultimate',
  referrals: 'pro',
  reviews: 'pro',
  insights: 'ultimate',
  audiences: 'pro',
  audiences_custom: 'ultimate',
  branch_metrics: 'pro',
  team: 'ultimate',
  custom_domain: 'ultimate',
  no_branding: 'ultimate',
}

/** Lo que NO tiene la prueba gratuita (el resto sí) */
const NOT_IN_TRIAL: Feature[] = ['wallet', 'design', 'branch_metrics', 'custom_domain', 'no_branding']

export function planTier(plan?: string | null): Tier | 'trial' | 'beauty' {
  const p = (plan ?? 'trial').toLowerCase()
  if (p === 'gifted') return 'ultimate'
  if (p === 'beauty') return 'beauty'
  if (p === 'starter' || p === 'pro' || p === 'ultimate') return p
  return 'trial'
}

/** Plan Beauty (salones): lo básico de la tarjeta + cumpleaños automáticos. El resto se pide a medida. */
const BEAUTY_FEATURES: Feature[] = ['birthday']

export function canUse(plan: string | null | undefined, feature: Feature): boolean {
  const tier = planTier(plan)
  if (tier === 'beauty') return BEAUTY_FEATURES.includes(feature)
  if (tier === 'trial') return !NOT_IN_TRIAL.includes(feature)
  return RANK[tier] >= RANK[MIN_TIER[feature]]
}

/** Nombre del plan mínimo, para los carteles "disponible en Pro" */
export function minPlanLabel(feature: Feature): string {
  return MIN_TIER[feature] === 'ultimate' ? 'Ultimate' : MIN_TIER[feature] === 'pro' ? 'Pro' : 'Starter'
}

/** Cantidad máxima de usuarios del equipo (sin contar al dueño) */
export const MAX_TEAM_MEMBERS = 20
