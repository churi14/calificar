'use client'

import { useEffect, useState } from 'react'

export default function SplashClient({
  businessName,
  googleUrl,
  code,
}: {
  businessName: string
  googleUrl: string
  code: string
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Registrar scan
    fetch('/api/g/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    // Barra de progreso
    const start = Date.now()
    const duration = 2000
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)
      if (elapsed >= duration) {
        clearInterval(interval)
        window.location.href = googleUrl
      }
    }, 16)

    return () => clearInterval(interval)
  }, [code, googleUrl])

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 500ms cubic-bezier(0.23,1,0.32,1) forwards; }
        .fade-up-2 { animation: fadeUp 500ms cubic-bezier(0.23,1,0.32,1) 150ms forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 500ms cubic-bezier(0.23,1,0.32,1) 300ms forwards; opacity: 0; }
      `}</style>

      {/* Logo Calificar */}
      <div className="fade-up mb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#FBCAD8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      </div>

      {/* Nombre del negocio */}
      <div className="fade-up-2 text-center mb-10">
        <h1 className="text-white text-2xl font-extrabold tracking-tight mb-1">
          {businessName}
        </h1>
        <p className="text-gray-500 text-sm">Redirigiendo a Google Maps…</p>
      </div>

      {/* Barra de progreso */}
      <div className="fade-up-3 w-full max-w-xs">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FBCAD8] rounded-full transition-none"
            style={{ width: `${progress}%`, transition: 'width 16ms linear' }}
          />
        </div>
      </div>

      {/* Powered by Calificar */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <a
          href="https://calificar.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          ★ Powered by{' '}
          <span className="font-semibold text-gray-500">Calificar</span>
        </a>
      </div>
    </div>
  )
}
