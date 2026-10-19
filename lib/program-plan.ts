/**
 * Plan de un programa, para las APIs que tienen que respetar lo que incluye cada plan.
 */
import { createClient } from '@supabase/supabase-js'
import { canUse, type Feature } from '@/lib/plan-features'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Plan del negocio dueño del programa ('trial' si no se encuentra) */
export async function getProgramPlan(programId: string): Promise<string> {
  const { data } = await admin.from('loyalty_programs').select('businesses(plan)').eq('id', programId).single()
  const raw = data?.businesses as { plan?: string | null } | { plan?: string | null }[] | null | undefined
  const biz = Array.isArray(raw) ? raw[0] : raw
  return biz?.plan ?? 'trial'
}

/** ¿El plan del programa incluye esta función? */
export async function programCan(programId: string, feature: Feature): Promise<boolean> {
  return canUse(await getProgramPlan(programId), feature)
}

/** Respuesta estándar cuando el plan no incluye la función */
export function planRequiredBody(minPlan: string) {
  return { error: `Esta función es del plan ${minPlan} en adelante`, upgrade_required: true }
}
