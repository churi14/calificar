import Link from 'next/link'

const WA = 'https://wa.me/5491100000000?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

const COL1_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'El cartel', href: '/tienda' },
  { label: 'Beneficios', href: '#' },
  { label: 'Precios', href: '#planes' },
  { label: 'Demo', href: '/r/demo' },
]

const COL2_LINKS = [
  { label: 'Sobre Calificar', href: '#' },
  { label: 'Clientes', href: '#' },
  { label: 'Empleos', href: '#' },
]

const COL3_LINKS = [
  { label: 'Contáctanos', href: WA },
  { label: 'Iniciar prueba gratuita', href: WA },
  { label: 'Ver demo', href: '/r/demo' },
  { label: 'Preguntas frecuentes', href: '#' },
]

function SocialIcon({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <a href="#" aria-label={name}
      className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center
        text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="relative bg-[#0F172A]">
      {/* Curva superior — conecta con la sección rosa de arriba */}
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"
        className="absolute bottom-full left-0 w-full h-16 sm:h-20 lg:h-28">
        <path fill="#0F172A" d="M0,120 C360,10 1080,10 1440,120 L1440,120 L0,120 Z"/>
      </svg>

      <div className="max-w-7xl mx-auto py-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Columna 1 — marca, dirección y navegación */}
          <div>
            <Link href="/" className="font-display font-extrabold text-xl text-white flex items-center gap-1.5 mb-4">
              <span className="text-[#FBCAD8]">★</span> Calificar
            </Link>
            <p className="text-sm text-gray-400 mb-8 max-w-[220px] leading-relaxed">
              Merlo, Buenos Aires, Argentina
            </p>
            <ul className="space-y-3">
              {COL1_LINKS.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 2 — compañía */}
          <div>
            <h3 className="font-display font-bold text-white mb-4">Compañía</h3>
            <ul className="space-y-3">
              {COL2_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — empezar y redes sociales */}
          <div>
            <h3 className="font-display font-bold text-white mb-4">Empezar</h3>
            <ul className="space-y-3 mb-10">
              {COL3_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined}
                    className="text-gray-400 hover:text-white transition-colors text-sm">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <SocialIcon name="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.5-1.5H16.5V4.3c-.27-.04-1.2-.1-2.28-.1-2.26 0-3.81 1.38-3.81 3.92V10.5H8v3h2.41V21h3.09z"/>
                </svg>
              </SocialIcon>
              <SocialIcon name="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </SocialIcon>
              <SocialIcon name="X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l16 16M20 4L4 20"/>
                </svg>
              </SocialIcon>
              <SocialIcon name="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="3"/>
                  <path d="M7 10v6M7 7v.01M11 16v-4.5a1.5 1.5 0 013 0V16M14 11.5a1.5 1.5 0 013 0V16"/>
                </svg>
              </SocialIcon>
              <SocialIcon name="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="3"/>
                  <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none"/>
                </svg>
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-xs text-gray-500">© 2026 Calificar — Hecho en Argentina</p>
        </div>
      </div>
    </footer>
  )
}