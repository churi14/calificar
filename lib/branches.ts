/**
 * Sucursales de un programa. branch_id NULL = sucursal "Principal".
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Valida que la sucursal pertenezca al programa y esté activa.
 * Devuelve el id si es válida; null si no viene, no existe o la tabla todavía no está creada
 * (así los sellos nunca fallan por una sucursal inválida: se cuentan como Principal).
 */
export async function resolveBranchId(
  supabase: SupabaseClient,
  programId: string,
  branchId: unknown,
): Promise<string | null> {
  if (typeof branchId !== 'string' || !/^[0-9a-f-]{36}$/i.test(branchId)) return null
  const { data, error } = await supabase
    .from('branches')
    .select('id')
    .eq('id', branchId)
    .eq('program_id', programId)
    .eq('active', true)
    .maybeSingle()
  if (error || !data) return null
  return data.id as string
}
