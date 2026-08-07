'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function SetupPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [businessName, setBusinessName] = useState('')
  const [googleUrl, setGoogleUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!googleUrl.includes('google') && !googleUrl.includes('g.page') && !googleUrl.includes('maps')) {
      setError('El link debe ser de Google Maps o Google Business.')
      return
    }

    setSaving(true)
    const res = await fetch('/api/g/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, business_name: businessName.trim(), google_url: googleUrl.trim() }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'Error al activar. Revisá el código.')
      setSaving(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push(`/g/${code}`), 2500)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-white text-2xl font-extrabold mb-2">¡Cartel activado!</h1>
        <p className="text-gray-400 text-sm">Probando el redirect a Google ahora…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 py-12">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#FBCAD8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h1 className="text-white text-xl font-extrabold mb-1">Activá tu cartel</h1>
        <p className="text-gray-500 text-sm">Código: <span className="text-gray-300 font-mono font-bold">{code}</span></p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Nombre de tu negocio
          </label>
          <input
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            required
            placeholder="Ej: Café El Sol"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8]/50 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Link de reseñas de Google
          </label>
          <input
            value={googleUrl}
            onChange={e => setGoogleUrl(e.target.value)}
            required
            type="url"
            placeholder="https://g.page/r/tu-negocio/review"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8]/50 transition"
          />
          <p className="text-[11px] text-gray-600 mt-1.5">
            Encontralo en Google Business Profile → Reseñas → "Obtener más reseñas"
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-xs font-medium bg-red-500/10 rounded-lg px-4 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving || !businessName || !googleUrl}
          className="w-full bg-[#FBCAD8] text-[#0F172A] font-extrabold py-4 rounded-xl text-sm hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Activando…' : 'Activar cartel ★'}
        </button>
      </form>

      {/* ¿Ya lo activaste? */}
      <p className="text-gray-600 text-xs mt-8 text-center">
        ¿Ya activaste este cartel?{' '}
        <a href={`/g/${code}`} className="text-gray-400 underline underline-offset-2">Ir al redirect</a>
      </p>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <a href="https://calificar.com.ar" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
          ★ Calificar
        </a>
      </div>
    </div>
  )
}
