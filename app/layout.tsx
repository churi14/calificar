import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Calificar — Gestión de reseñas de Google',
  description: 'Filtrá las reseñas negativas antes de que lleguen a Google. Cartel NFC + QR y panel de control para tu local.',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%237C3AED'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='18' font-family='Arial' font-weight='bold'>★</text></svg>" }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}