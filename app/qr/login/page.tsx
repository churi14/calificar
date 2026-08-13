'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function QRLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/qr/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false) }
    else router.push(next)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#FBCAD8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h1 className="text-white text-xl font-extrabold mb-1">Iniciá sesión</h1>
        <p className="text-gray-500 text-sm">Para gestionar tus carteles QR</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {error && (
          <p className="text-red-400 text-xs font-medium bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8]/50 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8]/50 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FBCAD8] text-[#0F172A] font-extrabold py-4 rounded-xl text-sm hover:bg-white transition-colors disabled:opacity-40"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="text-gray-600 text-xs mt-6 text-center">
        ¿No tenés cuenta?{' '}
        <a href={`/qr/register?next=${encodeURIComponent(next)}`} className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
          Registrate gratis
        </a>
      </p>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <a href="https://calificar.com.ar" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
          ★ Calificar
        </a>
      </div>
    </div>
  )
}

export default function QRLoginPage() {
  return (
    <Suspense>
      <QRLoginForm />
    </Suspense>
  )
}
