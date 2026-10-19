/**
 * Estado de un negocio según su prueba o su plan:
 *  - active: prueba vigente o plan al día (también gifted y planes sin fecha de vencimiento)
 *  - grace:  venció hace menos de GRACE_DAYS días; todo sigue igual, solo se avisa
 *  - basic:  pasada la gracia; la tarjeta del cliente se muestra genérica (nombre del negocio + marca Calificar).
 *            El sistema sigue funcionando: se suman sellos, se registran clientes, se canjean premios.
 *
 * La prueba dura TRIAL_DAYS desde que se creó el negocio (no hay una columna aparte).
 */
export const TRIAL_DAYS = 14
export const GRACE_DAYS = 1

export type PlanState = 'active' | 'grace' | 'basic'

export type PlanStatusInput = {
  plan?: string | null
  plan_expires_at?: string | null
  created_at?: string | null
}

const DAY_MS = 86_400_000

/** Cuándo vence la prueba o el plan (null = no vence) */
export function planEndsAt(b: PlanStatusInput): Date | null {
  const plan = (b.plan ?? 'trial').toLowerCase()
  if (plan === 'gifted') return null
  if (plan === 'trial') {
    if (!b.created_at) return null
    return new Date(new Date(b.created_at).getTime() + TRIAL_DAYS * DAY_MS)
  }
  return b.plan_expires_at ? new Date(b.plan_expires_at) : null
}

export function planState(b: PlanStatusInput, now: number = Date.now()): PlanState {
  const end = planEndsAt(b)
  if (!end || Number.isNaN(end.getTime())) return 'active'
  const t = end.getTime()
  if (now <= t) return 'active'
  if (now <= t + GRACE_DAYS * DAY_MS) return 'grace'
  return 'basic'
}

/** Días que le quedan a la prueba o al plan (0 si ya venció, null si no vence) */
export function planDaysLeft(b: PlanStatusInput, now: number = Date.now()): number | null {
  const end = planEndsAt(b)
  if (!end) return null
  return Math.max(0, Math.ceil((end.getTime() - now) / DAY_MS))
}

/** Diseño genérico de Calificar para la tarjeta en modo básico */
export const GENERIC_CARD_DESIGN = {
  color_primary: '#7C3AED',
  card_text_color: null,
  logo_url: null,
  app_icon_url: null,
  stamp_icon_url: null,
  card_background_url: null,
  page_bg_color: null,
  stamp_icon_no_bg: null,
} as const
