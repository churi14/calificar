'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const next = searchParams.get('next') ?? '/onboarding'
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/auth/callback?next=${encodeURIComponent(next)}`,
      }
    })
    if (error) { setError(error.message); setLoading(false) }
    else if (data.session) {
      // Email confirmation desactivado — sesión inmediata, redirigir directo
      router.push(next)
    } else {
      // Email confirmation activado — mostrar pantalla de email
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-1.5 mb-8">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
            <span className="font-extrabold text-xl text-[#0F172A]">Calificar</span>
          </Link>
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">¡Revisá tu email!</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-1">
              Te mandamos un link de confirmación a
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-5">{email}</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Hacé click en el botón del email para activar tu cuenta. Revisá también la carpeta de spam si no aparece.
            </p>
            <Link href="/login"
              className="w-full block text-center bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-1.5">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" /><span className="font-extrabold text-xl text-[#0F172A]">Calificar</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Creá tu cuenta gratis</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Tu nombre"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="tu@email.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)} required
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Al registrarte aceptás los{' '}
            <a href="/terminos" target="_blank" className="underline underline-offset-2 hover:text-gray-600">términos de uso</a>
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-gray-900 font-semibold hover:underline">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
