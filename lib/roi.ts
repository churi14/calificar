/**
 * Calculadora de retorno de la tarjeta de sellos, en pesos.
 * Funciones puras: las usan la home, el registro y el panel, así todos dan el mismo resultado.
 *
 * Supuestos (se muestran en pantalla):
 *  - Un sello por visita; solo los clientes que usan la tarjeta (`adoption`) y las visitas extra suman premios.
 *  - Los clientes "que vuelven más" son visitas extra sobre las que ya tenés.
 *  - Cada premio cuesta lo que le cuesta al negocio darlo, no lo que cobraría.
 */

export type RoiReward = { at: number; name: string; cost: number }

export type RoiInput = {
  /** Lo que gasta un cliente en cada visita ($) */
  ticket: number
  /** Clientes atendidos por día */
  visitsPerDay: number
  /** Días que abre por semana (1–7) */
  daysPerWeek: number
  /** De cada $100 cobrados, cuántos quedan de ganancia (1–100) */
  margin: number
  /** Cantidad de sellos de la tarjeta */
  goal: number
  /** Premios en el camino y al final; `at` es el número de sello */
  rewards: RoiReward[]
  /** Cuánto más vuelven los clientes (%) */
  lift: number
  /** De tus clientes actuales, qué porcentaje usa la tarjeta (0–100) */
  adoption: number
  /** Precio mensual del plan ($) */
  planPrice: number
}

export type RoiStamp = {
  n: number
  /** Ganancia que dejó el cliente hasta este sello */
  earned: number
  /** Lo que se le regaló hasta este sello (costo para el negocio) */
  given: number
  /** earned − given */
  balance: number
  rewards: RoiReward[]
}

export type RoiResult = {
  monthlyVisits: number
  extraVisits: number
  extraRevenue: number
  extraProfit: number
  rewardCost: number
  planPrice: number
  /** Lo que queda por mes después de premios y plan */
  net: number
  netBeforePlan: number
  net12: number
  /** Días de atención hasta pagar el plan del mes (null si no se paga nunca) */
  paybackOpenDays: number | null
  openDaysPerMonth: number
  /** Visitas extra por mes necesarias para empezar a ganar (null si con estos premios no se puede) */
  breakEvenExtraVisits: number | null
  breakEvenLift: number | null
  /** Por cada $1.000 del plan, cuánto queda */
  perThousand: number
  profitPerVisit: number
  rewardsPerCard: number
  profitPerCard: number
  netPerCard: number
  track: RoiStamp[]
  /** Primer sello desde el que el cliente ya te dejó más de lo que le regalaste (null si nunca) */
  breakEvenStamp: number | null
}

export const WEEKS_PER_MONTH = 4.33

const num = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0)

export function calcRoi(input: RoiInput): RoiResult {
  const ticket = num(input.ticket)
  const goal = Math.max(1, Math.round(num(input.goal)) || 1)
  const margin = Math.min(100, num(input.margin))
  const daysPerWeek = Math.min(7, num(input.daysPerWeek))
  const rewards = input.rewards
    .map(r => ({ ...r, at: Math.min(goal, Math.max(1, Math.round(num(r.at)) || 1)), cost: num(r.cost) }))
    .sort((a, b) => a.at - b.at)

  const openDaysPerMonth = daysPerWeek * WEEKS_PER_MONTH
  const monthlyVisits = num(input.visitsPerDay) * openDaysPerMonth
  const extraVisits = monthlyVisits * (num(input.lift) / 100)
  const stampedVisits = monthlyVisits * (Math.min(100, num(input.adoption)) / 100) + extraVisits

  const profitPerVisit = ticket * (margin / 100)
  const rewardsPerCard = rewards.reduce((s, r) => s + r.cost, 0)
  const rewardCostPerVisit = rewardsPerCard / goal

  const extraRevenue = extraVisits * ticket
  const extraProfit = extraVisits * profitPerVisit
  const rewardCost = stampedVisits * rewardCostPerVisit
  const netBeforePlan = extraProfit - rewardCost
  const planPrice = num(input.planPrice)
  const net = netBeforePlan - planPrice

  const paybackOpenDays = netBeforePlan > 0 && openDaysPerMonth > 0
    ? planPrice / (netBeforePlan / openDaysPerMonth)
    : null

  const perVisitGain = profitPerVisit - rewardCostPerVisit
  const breakEvenExtraVisits = perVisitGain > 0
    ? (planPrice + monthlyVisits * (Math.min(100, num(input.adoption)) / 100) * rewardCostPerVisit) / perVisitGain
    : null
  const breakEvenLift = breakEvenExtraVisits !== null && monthlyVisits > 0
    ? (breakEvenExtraVisits / monthlyVisits) * 100
    : null

  const track: RoiStamp[] = []
  for (let n = 1; n <= goal; n++) {
    const given = rewards.filter(r => r.at <= n).reduce((s, r) => s + r.cost, 0)
    const earned = n * profitPerVisit
    track.push({ n, earned, given, balance: earned - given, rewards: rewards.filter(r => r.at === n) })
  }
  let breakEvenStamp: number | null = null
  for (let i = track.length - 1; i >= 0; i--) {
    if (track[i].balance >= 0) breakEvenStamp = track[i].n
    else break
  }

  return {
    monthlyVisits, extraVisits, extraRevenue, extraProfit, rewardCost, planPrice,
    net, netBeforePlan, net12: net * 12,
    paybackOpenDays, openDaysPerMonth,
    breakEvenExtraVisits, breakEvenLift,
    perThousand: planPrice > 0 ? (net / planPrice) * 1000 : 0,
    profitPerVisit, rewardsPerCard,
    profitPerCard: goal * profitPerVisit,
    netPerCard: goal * profitPerVisit - rewardsPerCard,
    track, breakEvenStamp,
  }
}

export type RoiPreset = {
  id: string
  label: string
  icon: string
  ticket: number
  visitsPerDay: number
  daysPerWeek: number
  margin: number
  goal: number
  rewards: RoiReward[]
}

/** Valores de ejemplo (en pesos) para arrancar; el dueño los cambia por los suyos */
export const ROI_PRESETS: RoiPreset[] = [
  {
    id: 'peluqueria', label: 'Peluquería', icon: '✂️',
    ticket: 25000, visitsPerDay: 8, daysPerWeek: 6, margin: 50, goal: 10,
    rewards: [
      { at: 3, name: 'Baño de crema', cost: 3000 },
      { at: 6, name: 'Descuento en productos', cost: 4000 },
      { at: 10, name: 'Corte gratis', cost: 8000 },
    ],
  },
  {
    id: 'unas', label: 'Uñas', icon: '💅',
    ticket: 20000, visitsPerDay: 8, daysPerWeek: 6, margin: 55, goal: 8,
    rewards: [
      { at: 4, name: 'Diseño de regalo', cost: 2500 },
      { at: 8, name: 'Manicuría gratis', cost: 7000 },
    ],
  },
  {
    id: 'estetica', label: 'Estética y spa', icon: '💆',
    ticket: 35000, visitsPerDay: 5, daysPerWeek: 6, margin: 50, goal: 6,
    rewards: [
      { at: 3, name: 'Mascarilla de regalo', cost: 4000 },
      { at: 6, name: 'Limpieza facial gratis', cost: 12000 },
    ],
  },
  {
    id: 'cafe', label: 'Café o kiosco', icon: '☕',
    ticket: 9000, visitsPerDay: 60, daysPerWeek: 7, margin: 55, goal: 8,
    rewards: [
      { at: 4, name: 'Galletita de regalo', cost: 700 },
      { at: 8, name: 'Café gratis', cost: 2000 },
    ],
  },
  {
    id: 'otro', label: 'Otro negocio', icon: '🏪',
    ticket: 10000, visitsPerDay: 20, daysPerWeek: 6, margin: 50, goal: 8,
    rewards: [{ at: 8, name: 'Premio final', cost: 3000 }],
  },
]

/** Del tipo de negocio del registro al ejemplo que mejor le queda */
export function presetForBusinessType(type?: string | null): RoiPreset {
  switch (type) {
    case 'salon': return ROI_PRESETS[0]
    case 'belleza': return ROI_PRESETS[2]
    case 'cafeteria':
    case 'panaderia':
    case 'bar':
    case 'restaurante': return ROI_PRESETS[3]
    default: return ROI_PRESETS[4]
  }
}
