/**
 * Tiempo mínimo entre dos sellos de una misma tarjeta. Configurable por programa (plan Pro).
 * 'day' cuenta por día calendario de Argentina: se reinicia a las 00:00.
 */
import { spinPeriodStart, spinNextAt } from '@/lib/spin-period'

export type StampInterval = 'h4' | 'h12' | 'day'

export const DEFAULT_STAMP_INTERVAL: StampInterval = 'h4'

export const STAMP_INTERVALS: { id: StampInterval; label: string }[] = [
  { id: 'h4',  label: 'Cada 4 horas' },
  { id: 'h12', label: 'Cada 12 horas' },
  { id: 'day', label: '1 por día (se reinicia a las 00:00)' },
]

const HOURS: Record<'h4' | 'h12', number> = { h4: 4, h12: 12 }

export const isStampInterval = (v: unknown): v is StampInterval => v === 'h4' || v === 'h12' || v === 'day'

/** Desde cuándo un sello cuenta como "reciente" (si hay uno desde acá, todavía no puede recibir otro) */
export function recentSince(interval: StampInterval, now: Date = new Date()): Date {
  if (interval === 'day') return spinPeriodStart('daily', now)
  return new Date(now.getTime() - HOURS[interval] * 60 * 60 * 1000)
}

/** Cuándo vuelve a poder recibir un sello quien recibió el último en `last` */
export function nextStampAt(interval: StampInterval, last: Date): Date {
  if (interval === 'day') return spinNextAt('daily', last)
  return new Date(last.getTime() + HOURS[interval] * 60 * 60 * 1000)
}

/** Para completar frases como "Ya recibiste un sello ___" */
export function limitText(interval: StampInterval): string {
  return interval === 'day' ? 'hoy' : `en las últimas ${HOURS[interval]} horas`
}
