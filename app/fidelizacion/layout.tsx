import type { Metadata } from 'next'

export const metadata: Metadata = {
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
