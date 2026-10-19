/**
 * Resuelve una audiencia a la lista de tarjetas (clientes) que la cumplen. Solo servidor.
 */
import { createClient } from '@supabase/supabase-js'
import { audienceRules, type Audience, type AudienceRules } from '@/lib/audience-types'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DAY_MS = 86_400_000
const TZ = 'America/Argentina/Buenos_Aires'

const num = (v: unknown): number | undefined => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 100_000) : undefined
}

/** Deja solo valores válidos: lo que llega del navegador no es de fiar */
export function cleanRules(raw: unknown): AudienceRules {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const out: AudienceRules = {}
  const set = <K extends keyof AudienceRules>(k: K, v: AudienceRules[K]) => { if (v !== undefined) out[k] = v }
  set('minStamps', num(r.minStamps))
  set('maxStamps', num(r.maxStamps))
  set('minVisits', num(r.minVisits))
  set('idleDaysMin', num(r.idleDaysMin))
  set('idleDaysMax', num(r.idleDaysMax))
  set('joinedWithinDays', num(r.joinedWithinDays))
  if (r.birthdayThisMonth === true) out.birthdayThisMonth = true
  if (r.nearReward === true) out.nearReward = true
  return out
}

/** Valida la audiencia que viene del navegador */
export function parseAudience(raw: unknown): Audience | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as { kind?: string; id?: string; rules?: unknown }
  if (a.kind === 'all') return { kind: 'all' }
  if (a.kind === 'ready' && typeof a.id === 'string') return { kind: 'ready', id: a.id as never }
  if (a.kind === 'rules') return { kind: 'rules', rules: cleanRules(a.rules) }
  return null
}

type CardRow = { id: string; name: string | null; stamps: number | null; total_visits: number | null; birth_date: string | null; created_at: string }

/** null en `ids` = todos los clientes */
export async function resolveAudience(
  programId: string,
  audience: Audience
): Promise<{ ids: string[] | null; names: string[] }> {
  const rules = audienceRules(audience)
  if (!rules) return { ids: null, names: [] }

  const [{ data: program }, { data: cards }] = await Promise.all([
    admin.from('loyalty_programs').select('stamps_goal').eq('id', programId).single(),
    admin.from('loyalty_cards')
      .select('id, name, stamps, total_visits, birth_date, created_at')
      .eq('program_id', programId)
      .not('active', 'is', false),
  ])
  const goal = (program?.stamps_goal as number | undefined) ?? 10
  const rows = (cards ?? []) as CardRow[]

  // Última visita de cada cliente (último sello)
  const lastVisit = new Map<string, number>()
  const needsVisits = rules.idleDaysMin !== undefined || rules.idleDaysMax !== undefined
  if (needsVisits) {
    const { data: tx } = await admin
      .from('loyalty_transactions')
      .select('card_id, created_at')
      .eq('program_id', programId)
      .eq('type', 'stamp')
      .order('created_at', { ascending: false })
      .limit(30_000)
    for (const t of tx ?? []) {
      const id = t.card_id as string
      if (id && !lastVisit.has(id)) lastVisit.set(id, new Date(t.created_at as string).getTime())
    }
  }

  const now = Date.now()
  const currentMonth = Number(new Date().toLocaleDateString('en-CA', { timeZone: TZ }).split('-')[1])

  const matched = rows.filter(c => {
    const stamps = c.stamps ?? 0
    if (rules.minStamps !== undefined && stamps < rules.minStamps) return false
    if (rules.maxStamps !== undefined && stamps > rules.maxStamps) return false
    if (rules.minVisits !== undefined && (c.total_visits ?? 0) < rules.minVisits) return false
    if (rules.nearReward && !(stamps >= goal - 2 && stamps < goal)) return false
    if (rules.joinedWithinDays !== undefined && now - new Date(c.created_at).getTime() > rules.joinedWithinDays * DAY_MS) return false
    if (rules.birthdayThisMonth) {
      const m = Number(String(c.birth_date ?? '').split('-')[1])
      if (m !== currentMonth) return false
    }
    if (needsVisits) {
      const last = lastVisit.get(c.id) ?? new Date(c.created_at).getTime()
      const idle = (now - last) / DAY_MS
      if (rules.idleDaysMin !== undefined && idle < rules.idleDaysMin) return false
      if (rules.idleDaysMax !== undefined && idle > rules.idleDaysMax) return false
    }
    return true
  })

  return { ids: matched.map(c => c.id), names: matched.slice(0, 5).map(c => (c.name ?? '').trim() || 'Cliente') }
}
