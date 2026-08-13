'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function QRRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/qr/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    })
    if (error) { setError(error.message); setLoading(false) }
    else if (data.session) {
      // Sin confirmación de email — sesión inmediata
      router.push(next)
    } else {
      // Con confirmación — igual redirigir al login con mensaje
      router.push(`/qr/login?next=${encodeURIComponent(next)}&registered=1`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#FBCAD8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h1 className="text-white text-xl font-extrabold mb-1">Crear cuenta gratis</h1>
        <p className="text-gray-500 text-sm">Para activar y gestionar tus carteles QR</p>
      </div>

      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        {error && (
          <p className="text-red-400 text-xs font-medium bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Tu nombre"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8]/50 transition"
          />
        </div>

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
            onChange={e => setPass(e.target.value)}
            required
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8]/50 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FBCAD8] text-[#0F172A] font-extrabold py-4 rounded-xl text-sm hover:bg-white transition-colors disabled:opacity-40"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta gratis ★'}
        </button>
      </form>

      <p className="text-gray-600 text-xs mt-6 text-center">
        ¿Ya tenés cuenta?{' '}
        <a href={`/qr/login?next=${encodeURIComponent(next)}`} className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors">
          Iniciá sesión
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

export default function QRRegisterPage() {
  return (
    <Suspense>
      <QRRegisterForm />
    </Suspense>
  )
}
