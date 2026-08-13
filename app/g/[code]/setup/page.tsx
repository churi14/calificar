'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'auth-check' | 'choose' | 'form' | 'done'

export default function SetupPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [step, setStep] = useState<Step>('auth-check')
  const [userId, setUserId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [googleUrl, setGoogleUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Verificar sesión al cargar
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        setStep('form')
      } else {
        setStep('choose')
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Auto-agregar https:// si no tiene protocolo
    let url = googleUrl.trim()
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    setSaving(true)
    const res = await fetch('/api/g/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        business_name: businessName.trim(),
        google_url: url,
        owner_id: userId ?? undefined,
      }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'Error al activar. Revisá el código.')
      setSaving(false)
      return
    }

    setStep('done')
    setTimeout(() => router.push(`/g/${code}`), 2500)
  }

  // ─── Loading ───────────────────────────────────────────────
  if (step === 'auth-check') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    )
  }

  // ─── Hecho ─────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-white text-2xl font-extrabold mb-2">¡Cartel activado!</h1>
        <p className="text-gray-400 text-sm mb-4">Probando el redirect ahora…</p>
        {userId && (
          <p className="text-gray-600 text-xs">
            Podés gestionar tu QR desde{' '}
            <a href="/qr/dashboard" className="text-[#FBCAD8] underline underline-offset-2">tu panel</a>
          </p>
        )}
      </div>
    )
  }

  // ─── Elegir: crear cuenta o iniciar sesión ─────────────────
  if (step === 'choose') {
    const next = encodeURIComponent(`/g/${code}/setup`)
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#FBCAD8">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h1 className="text-white text-xl font-extrabold mb-1">Activá tu cartel</h1>
          <p className="text-gray-500 text-sm">Código: <span className="text-gray-300 font-mono font-bold">{code}</span></p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <a
            href={`/qr/register?next=${next}`}
            className="flex items-center gap-4 bg-[#FBCAD8] text-[#0F172A] rounded-2xl px-5 py-4 hover:bg-white transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0F172A]/10 flex items-center justify-center flex-shrink-0 text-lg">✨</div>
            <div className="text-left">
              <p className="font-extrabold text-sm leading-tight">Crear cuenta gratis</p>
              <p className="text-[11px] text-[#0F172A]/60 mt-0.5 leading-tight">Activá y cambiá el link cuando quieras</p>
            </div>
          </a>

          <a
            href={`/qr/login?next=${next}`}
            className="flex items-center gap-4 bg-white/8 border border-white/10 text-white rounded-2xl px-5 py-4 hover:bg-white/12 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-lg">👤</div>
            <div className="text-left">
              <p className="font-extrabold text-sm leading-tight">Ya tengo cuenta</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Iniciá sesión para vincular el cartel</p>
            </div>
          </a>

          <button
            onClick={() => setStep('form')}
            className="flex items-center gap-4 w-full bg-white/5 border border-white/8 text-gray-400 rounded-2xl px-5 py-4 hover:bg-white/8 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-lg">⚡</div>
            <div className="text-left">
              <p className="font-extrabold text-sm leading-tight text-gray-300">Activar sin cuenta</p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">Rápido, sin registro</p>
            </div>
          </button>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <a href="https://calificar.com.ar" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
            ★ Calificar
          </a>
        </div>
      </div>
    )
  }

  // ─── Formulario de activación ──────────────────────────────
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#FBCAD8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h1 className="text-white text-xl font-extrabold mb-1">Activá tu cartel</h1>
        <p className="text-gray-500 text-sm">Código: <span className="text-gray-300 font-mono font-bold">{code}</span></p>
        {userId && (
          <p className="text-green-500 text-xs mt-1.5 font-medium">✓ Sesión iniciada — el cartel quedará en tu cuenta</p>
        )}
      </div>

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
            type="text"
            placeholder="google.com/maps/... o cualquier link"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8]/50 transition"
          />
          <p className="text-[11px] text-gray-600 mt-1.5">
            Podés pegar cualquier link — Google Maps, tu web, Instagram, WhatsApp, etc.
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

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <a href="https://calificar.com.ar" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
          ★ Calificar
        </a>
      </div>
    </div>
  )
}
