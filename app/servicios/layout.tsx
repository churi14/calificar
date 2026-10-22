import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calificar Reseñas — Más reseñas de Google para tu local',
  description: 'Conseguí más reseñas positivas en Google y filtrá las negativas antes de que lleguen. Cartel NFC + QR para negocios con atención al público en Argentina.',
  alternates: { canonical: '/servicios' },
}

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
