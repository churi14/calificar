import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calificar Fidelización · Tarjeta de sellos digital para tu negocio',
  description: 'Reemplazá las tarjetitas de papel por una tarjeta digital en el celular de tus clientes. Sellos, premios y avisos automáticos. 14 días gratis.',
  manifest: '/manifest.json',
  themeColor: '#7C3AED',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Calificar',
  },
}

export default function FidelizacionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
