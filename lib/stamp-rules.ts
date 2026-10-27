/**
 * Reglas de sellado de un programa: ¿solo sella el negocio? y cada cuánto puede recibir un sello una tarjeta.
 * Solo rigen si el plan incluye la función; si el plan no la incluye (o la migración stamp_business_only.sql
 * no se corrió), vale lo de siempre: auto-sello abierto, 1 sello cada 4 horas.
 */
import { createClient } from '@supabase/supabase-js'
import { programCan } from '@/lib/program-plan'
import { DEFAULT_STAMP_INTERVAL, isStampInterval, type StampInterval } from '@/lib/stamp-interval'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface StampRules {
  businessOnly: boolean
  interval: StampInterval
}

export async function getStampRules(programId: string): Promise<StampRules> {
  const defaults: StampRules = { businessOnly: false, interval: DEFAULT_STAMP_INTERVAL }
  const { data, error } = await admin
    .from('loyalty_programs')
    .select('business_only_stamps, stamp_interval')
    .eq('id', programId)
    .maybeSingle()
  if (error || !data) return defaults
  if (!(await programCan(programId, 'business_only'))) return defaults
  return {
    businessOnly: !!data.business_only_stamps,
    interval: isStampInterval(data.stamp_interval) ? data.stamp_interval : DEFAULT_STAMP_INTERVAL,
  }
}
