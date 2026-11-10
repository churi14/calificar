/**
 * Precios, plazos y límites de los planes. Una sola fuente para el servidor (checkout, webhook,
 * sucursales) y para la interfaz (panel, páginas de precios), así nunca se contradicen.
 */
export type PaidPlan = 'beauty' | 'starter' | 'pro' | 'ultimate'

/** Precio mensual en pesos argentinos */
export const PLAN_PRICES_ARS: Record<PaidPlan, number> = {
  beauty: 7999,
  starter: 10000,
  pro: 25000,
  ultimate: 50000,
}

/** Cada pago activa el plan por 30 días */
export const PLAN_DURATION_DAYS = 30

export const fmtARS = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

/**
 * Cantidad máxima de locales (la principal más las sucursales) que permite cada plan.
 * En Pro se pueden sumar locales extra de a uno (`extra`, lo carga el administrador de Calificar).
 */
export function maxLocales(plan?: string | null, extra: number = 0): number {
  switch ((plan ?? '').toLowerCase()) {
    case 'pro': return 3 + Math.max(0, Math.min(47, Math.floor(extra) || 0))
    case 'ultimate':
    case 'gifted': return 51   // "ilimitados", con un tope técnico de 50 sucursales
    default: return 1          // Starter y prueba: un solo local
  }
}

/** Tipos de negocio que pueden contratar el plan Beauty (salones, peluquerías, uñas, estética) */
export const BEAUTY_BUSINESS_TYPES = ['salon', 'belleza']
export const isBeautyType = (type?: string | null) => BEAUTY_BUSINESS_TYPES.includes((type ?? '').toLowerCase())
