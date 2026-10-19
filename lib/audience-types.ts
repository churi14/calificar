/**
 * Audiencias para los avisos: grupos de clientes a los que se manda un mensaje.
 * Pro: listas ya armadas. Ultimate: reglas propias. Tipos y textos compartidos entre el panel y el servidor.
 */
export type AudienceRules = {
  /** Sellos actuales entre min y max */
  minStamps?: number
  maxStamps?: number
  /** Visitas totales desde N */
  minVisits?: number
  /** Sin venir hace al menos N días */
  idleDaysMin?: number
  /** Vinieron hace como mucho N días */
  idleDaysMax?: number
  /** Se sumaron en los últimos N días */
  joinedWithinDays?: number
  /** Cumplen años este mes */
  birthdayThisMonth?: boolean
  /** Les faltan 1 o 2 sellos para el premio */
  nearReward?: boolean
}

export type ReadyAudienceId = 'new14' | 'idle15' | 'idle30' | 'idle60' | 'near_reward' | 'birthday_month' | 'frequent'

export type Audience =
  | { kind: 'all' }
  | { kind: 'ready'; id: ReadyAudienceId }
  | { kind: 'rules'; rules: AudienceRules }

export const READY_AUDIENCES: { id: ReadyAudienceId; label: string; rules: AudienceRules }[] = [
  { id: 'new14',          label: 'Clientes nuevos (últimos 14 días)',   rules: { joinedWithinDays: 14 } },
  { id: 'idle15',         label: 'Hace 15 días o más que no vienen',    rules: { idleDaysMin: 15 } },
  { id: 'idle30',         label: 'Hace un mes o más que no vienen',     rules: { idleDaysMin: 30 } },
  { id: 'idle60',         label: 'Hace 2 meses o más que no vienen',    rules: { idleDaysMin: 60 } },
  { id: 'near_reward',    label: 'Les falta poco para el premio',       rules: { nearReward: true } },
  { id: 'birthday_month', label: 'Cumplen años este mes',               rules: { birthdayThisMonth: true } },
  { id: 'frequent',       label: 'Clientes frecuentes (10 visitas o más)', rules: { minVisits: 10 } },
]

/** Reglas que corresponden a una audiencia (null = todos) */
export function audienceRules(a: Audience): AudienceRules | null {
  if (a.kind === 'all') return null
  if (a.kind === 'ready') return READY_AUDIENCES.find(r => r.id === a.id)?.rules ?? null
  return a.rules
}

/** Función del plan que hace falta para usar la audiencia (null = ninguna) */
export function audienceFeature(a: Audience): 'audiences' | 'audiences_custom' | null {
  if (a.kind === 'all') return null
  return a.kind === 'ready' ? 'audiences' : 'audiences_custom'
}
