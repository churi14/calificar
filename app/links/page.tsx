import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calificar — Links',
  description: 'Todo sobre Calificar en un solo lugar.',
}

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

const LINKS = [
  {
    href: '/r/demo',
    label: 'Probar la demo',
    sub: 'Mirá cómo vive tu cliente el proceso',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
    style: 'primary',
  },
  {
    href: WA,
    label: 'Hablar por WhatsApp',
    sub: 'Te respondemos en minutos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    style: 'whatsapp',
    external: true,
  },
  {
    href: '/tienda',
    label: 'Ver la tienda',
    sub: 'Carteles NFC + QR desde $4.500',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    style: 'ghost',
  },
  {
    href: '/precios',
    label: 'Ver planes y precios',
    sub: 'Sistema desde $5.000/mes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    style: 'ghost',
  },
  {
    href: '/',
    label: 'Conocer Calificar',
    sub: 'Todo sobre el sistema',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
      </svg>
    ),
    style: 'ghost',
  },
]

export default function LinksPage() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .link-item {
          opacity: 0;
          animation: fadeUp 400ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .link-item:nth-child(1) { animation-delay: 80ms;  }
        .link-item:nth-child(2) { animation-delay: 140ms; }
        .link-item:nth-child(3) { animation-delay: 200ms; }
        .link-item:nth-child(4) { animation-delay: 260ms; }
        .link-item:nth-child(5) { animation-delay: 320ms; }

        .btn-link {
          transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1),
                      background-color 180ms ease;
        }
        .btn-link:active { transform: scale(0.97); }
        .btn-link:hover  { transform: translateY(-2px); }

        .avatar-ring {
          opacity: 0;
          animation: fadeUp 500ms cubic-bezier(0.23, 1, 0.32, 1) 0ms forwards;
        }
        .tagline {
          opacity: 0;
          animation: fadeUp 400ms cubic-bezier(0.23, 1, 0.32, 1) 20ms forwards;
        }
        .social-row {
          opacity: 0;
          animation: fadeUp 400ms cubic-bezier(0.23, 1, 0.32, 1) 400ms forwards;
        }

        @media (hover: hover) and (pointer: fine) {
          .btn-link:hover { box-shadow: 0 8px 24px -4px rgba(0,0,0,0.25); }
        }
      `}</style>

      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm flex flex-col items-center">

          {/* Avatar / Logo */}
          <div className="avatar-ring mb-5">
            <div className="w-20 h-20 rounded-full bg-[#1E293B] border-2 border-white/10 flex items-center justify-center shadow-xl">
              <img src="/logo.svg" alt="Calificar" className="w-10 h-10" style={{filter:'brightness(0) invert(1)'}} />
            </div>
          </div>

          {/* Nombre + tagline */}
          <div className="tagline text-center mb-10">
            <h1 className="text-white font-extrabold text-xl tracking-tight mb-1">Calificar</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Reseñas de Google en piloto automático para tu local
            </p>
          </div>

          {/* Links */}
          <div className="w-full space-y-3">
            {LINKS.map((link, i) => {
              const isExternal = link.external || link.href.startsWith('http')

              const classes = {
                primary: 'bg-[#FBCAD8] text-[#0F172A] hover:bg-white',
                whatsapp: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
                ghost: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
              }[link.style]

              const inner = (
                <span className={`btn-link w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${classes}`}>
                  <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-black/10">
                    {link.icon}
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block font-bold text-sm leading-tight">{link.label}</span>
                    <span className="block text-xs opacity-60 mt-0.5 font-medium">{link.sub}</span>
                  </span>
                  <span className="opacity-40 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </span>
                </span>
              )

              return (
                <div key={link.href} className="link-item">
                  {isExternal
                    ? <a href={link.href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
                    : <Link href={link.href} className="block">{inner}</Link>
                  }
                </div>
              )
            })}
          </div>

          {/* Redes */}
          <div className="social-row flex items-center gap-4 mt-10">
            <a href="https://facebook.com" target="_blank" aria-label="Facebook"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.5-1.5H16.5V4.3c-.27-.04-1.2-.1-2.28-.1-2.26 0-3.81 1.38-3.81 3.92V10.5H8v3h2.41V21h3.09z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            </a>
          </div>

          {/* Footer */}
          <p className="text-gray-600 text-xs mt-8">calificar.com.ar</p>
        </div>
      </div>
    </>
  )
}
