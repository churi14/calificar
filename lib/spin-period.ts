/**
 * Período de giro de la ruleta en hora de Argentina (UTC-3, sin horario de verano).
 * El día arranca a las 00:00 de Argentina; la semana, el lunes a las 00:00.
 */
const AR_OFFSET_MS = 3 * 60 * 60 * 1000

export type SpinFrequency = 'daily' | 'weekly'

/** Inicio (en UTC real) del período de giro vigente */
export function spinPeriodStart(frequency: SpinFrequency, now: Date = new Date()): Date {
  // "Reloj de pared" argentino: leído con métodos UTC da la hora local de Argentina
  const ar = new Date(now.getTime() - AR_OFFSET_MS)
  ar.setUTCHours(0, 0, 0, 0)
  if (frequency === 'weekly') {
    const dayOfWeek = ar.getUTCDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    ar.setUTCDate(ar.getUTCDate() - daysToMonday)
  }
  return new Date(ar.getTime() + AR_OFFSET_MS)
}

/** Cuándo vuelve a poder girar quien giró en el período vigente */
export function spinNextAt(frequency: SpinFrequency, now: Date = new Date()): Date {
  const start = spinPeriodStart(frequency, now)
  return new Date(start.getTime() + (frequency === 'daily' ? 1 : 7) * 24 * 60 * 60 * 1000)
}
