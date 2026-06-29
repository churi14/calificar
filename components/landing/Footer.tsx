import Link from 'next/link'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

const COL1_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'El cartel', href: '/tienda' },
  { label: 'Beneficios', href: '/beneficios' },
  { label: 'Precios', href: '/precios' },
  { label: 'Demo', href: '/r/demo' },
]

const COL2_LINKS = [
  { label: 'Sobre Calificar', href: '/sobre-calificar' },
]

const COL3_LINKS = [
  { label: 'Contáctanos', href: WA },
  { label: 'Ver demo', href: '/r/demo' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
]

export default function Footer() {
  return (
    <footer className="relative bg-[#0F172A]">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"
        className="absolute bottom-full left-0 w-full h-16 sm:h-20 lg:h-28">
        <path fill="#0F172A" d="M0,120 C360,10 1080,10 1440,120 L1440,120 L0,120 Z"/>
      </svg>

      <div className="max-w-7xl mx-auto py-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Columna 1 — marca y navegación */}
          <div>
            <Link href="/" className="font-display font-extrabold text-xl text-white flex items-center gap-1.5 mb-6">
              <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" style={{filter:"brightness(0) invert(1)"}} />
              <span className="font-extrabold text-xl text-white">Calificar</span>
            </Link>
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
                  <Link href={l.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — empezar y redes */}
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
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.5-1.5H16.5V4.3c-.27-.04-1.2-.1-2.28-.1-2.26 0-3.81 1.38-3.81 3.92V10.5H8v3h2.41V21h3.09z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2026 Calificar —{' '}
            <a href="https://www.enredconsultora.com.ar/" target="_blank" rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors underline underline-offset-2">
              En Red Consultora
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
