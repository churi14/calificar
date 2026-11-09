'use client'

import { useEffect, useState } from 'react'

const DURATION_MS = 4000
const SKIP_AFTER_MS = 2000

const PERKS = [
  'Tarjeta de sellos digital con QR',
  'Premios, cupones y avisos al celular',
  'Cumpleaños y reseñas de Google',
]

export default function SplashClient({
  businessName,
  googleUrl,
  code,
}: {
  businessName: string
  googleUrl: string
  code: string
}) {
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    // Registrar scan (si falla, la redirección sigue igual)
    fetch('/api/g/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {})

    // La redirección tiene su propio temporizador: no depende de la barra ni del resto de la pantalla
    const redirect = setTimeout(() => { window.location.href = googleUrl }, DURATION_MS)
    const skip = setTimeout(() => setCanSkip(true), SKIP_AFTER_MS)
    return () => {
      clearTimeout(redirect)
      clearTimeout(skip)
    }
  }, [code, googleUrl])

  // Se abre en otra pestaña para no cortar la redirección; el código permite medir qué carteles traen visitas
  const promoUrl = `https://calificar.com.ar/?utm_source=cartel&utm_medium=splash&utm_campaign=cartel-qr&utm_content=${encodeURIComponent(code)}`

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 pb-11 text-center relative">
      <style>{`
        @keyframes splashFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes splashUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .splash-fill { animation: splashFill ${DURATION_MS}ms linear forwards; }
        .splash-up { animation: splashUp 500ms cubic-bezier(0.23,1,0.32,1) forwards; }
        .splash-up-2 { animation: splashUp 500ms cubic-bezier(0.23,1,0.32,1) 150ms forwards; opacity: 0; }
      `}</style>

      {/* Nombre del negocio y barra de espera */}
      <h1 className="splash-up text-white text-[34px] leading-[1.1] font-bold tracking-tight mb-2 max-w-[340px] break-words text-balance">
        {businessName}
      </h1>
      <p className="splash-up text-gray-500 text-sm mb-5">Redirigiendo…</p>
      <div className="splash-up w-[200px] h-1 bg-white/10 rounded-full overflow-hidden mb-12">
        <div className="splash-fill h-full bg-[#FBCAD8] rounded-full" />
      </div>

      {/* Marca Calificar Fidelización */}
      <div className="splash-up-2 flex flex-col items-center">
        <a href={promoUrl} target="_blank" rel="noopener noreferrer" className="block mb-5">
          <img src="/qr-logo.svg" alt="Calificar Fidelización" width={230} className="w-[230px] h-auto" />
        </a>
        <p className="text-white font-semibold text-base mb-2.5">Que tus clientes vuelvan</p>
        <ul className="text-left mb-3 space-y-1.5">
          {PERKS.map(p => (
            <li key={p} className="text-[13px] text-slate-300 leading-snug flex gap-2">
              <span className="text-[#FBCAD8] font-bold" aria-hidden="true">✓</span>
              {p}
            </li>
          ))}
        </ul>
        <a
          href={promoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#FBCAD8] text-[#0F172A] text-[15px] font-semibold px-7 py-3 rounded-xl"
        >
          Probar Calificar →
        </a>
      </div>

      {/* Salida rápida: aparece a los 2 segundos */}
      {canSkip && (
        <button
          type="button"
          onClick={() => { window.location.href = googleUrl }}
          className="absolute bottom-6 left-0 right-0 text-[13px] text-slate-400 underline"
        >
          Ir ahora
        </button>
      )}
    </div>
  )
}
