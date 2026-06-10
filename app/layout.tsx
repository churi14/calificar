import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Calificar — Más reseñas, mejor reputación',
  description: 'Conseguí más reseñas 5 estrellas en Google y protegé tu negocio de las negativas.',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23111'/><text x='16' y='23' text-anchor='middle' fill='%23F59E0B' font-size='20' font-family='Arial'>★</text></svg>" }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={outfit.className}>{children}</body>
    </html>
  )
}
