'use client'

import { usePathname } from 'next/navigation'
import WhatsAppButton from './WhatsAppButton'

// Rutas donde el WA de Calificar NO debe mostrarse
// (páginas de clientes finales de los negocios)
const HIDE_PATHS = ['/fidelizacion', '/s/']

export default function ConditionalWhatsApp() {
  const pathname = usePathname()
  const hide = HIDE_PATHS.some(p => pathname.startsWith(p))
  if (hide) return null
  return <WhatsAppButton />
}
