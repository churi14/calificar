import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generador de QR Dinámicos Gratis | Calificar',
  description: 'Creá códigos QR dinámicos gratis. Cambiá la URL de destino cuando quieras sin reimprimir. Estadísticas de scans incluidas. Para negocios argentinos.',
  keywords: ['qr dinámico gratis', 'generador qr dinámico', 'qr dinámico argentina', 'crear qr gratis', 'qr editable', 'qr con estadísticas'],
  openGraph: {
    title: 'QR Dinámicos Gratis — Calificar',
    description: 'Creá QRs que podés editar cuando quieras. Sin reimprimir. Gratis.',
    url: 'https://calificar.com.ar/qr',
    siteName: 'Calificar',
    locale: 'es_AR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://calificar.com.ar/qr',
  },
}

export default function QRLayout({ children }: { children: React.ReactNode }) {
  return children
}
