/**
 * Precios, plazos y límites de los planes. Una sola fuente para el servidor (checkout, webhook,
 * sucursales) y para la interfaz (panel, popup de descuento), así nunca se contradicen.
 */
export type PaidPlan = 'starter' | 'pro' | 'ultimate'

/** Precio mensual en pesos argentinos */
export const PLAN_PRICES_ARS: Record<PaidPlan, number> = {
  starter: 14999,
  pro: 29999,
  ultimate: 69999,
}

/** Oferta de bienvenida: 50% el primer mes, durante la primera semana desde que se crea el negocio */
export const DISCOUNT_PERCENT = 50
export const DISCOUNT_WINDOW_DAYS = 7

/** Cada pago activa el plan por 30 días */
export const PLAN_DURATION_DAYS = 30

/** Precio con la oferta de bienvenida, redondeado igual que lo cobra Mercado Pago */
export const discountedPrice = (price: number) => Math.round((price * (100 - DISCOUNT_PERCENT)) / 100)

export const fmtARS = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

/** Días que le quedan a la oferta de bienvenida (0 si ya terminó) */
export function discountDaysLeft(businessCreatedAt?: string | null, now: number = Date.now()): number {
  if (!businessCreatedAt) return 0
  const elapsedDays = (now - new Date(businessCreatedAt).getTime()) / 86_400_000
  return Math.max(0, Math.ceil(DISCOUNT_WINDOW_DAYS - elapsedDays))
}

/** Cantidad máxima de locales (la principal más las sucursales) que permite cada plan */
export function maxLocales(plan?: string | null): number {
  switch ((plan ?? '').toLowerCase()) {
    case 'pro': return 3
    case 'ultimate':
    case 'gifted': return 51   // "ilimitados", con un tope técnico de 50 sucursales
    default: return 1          // Starter y prueba: un solo local
  }
}
