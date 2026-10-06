import { redirect } from 'next/navigation'

/**
 * Ruta eliminada — la billetera unificada contradice el modelo white-label.
 * Cada negocio tiene su propia PWA aislada en /t/[programId].
 */
export default function MiBilleteraRedirect() {
  redirect('/')
}
