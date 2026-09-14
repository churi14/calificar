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
      router.push(next)
    } else {
      setDone(true)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
  }
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(124,58,237,0.6)')
  const inputBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#070A14' }}>
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-8">
            <img src="/logo.svg" alt="Calificar" className="h-8 w-auto" />
            <span className="font-extrabold text-xl text-white">Calificar</span>
          </Link>
          <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-white mb-2">¡Revisá tu email!</h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-1">
              Te mandamos un link de confirmación a
            </p>
            <p className="text-sm font-semibold text-white mb-5">{email}</p>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Hacé click en el botón del email para activar tu cuenta. Revisá también la carpeta de spam si no aparece.
            </p>
            <Link href="/login"
              className="w-full block text-center bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#070A14' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3">
            <img src="/logo.svg" alt="Calificar" className="h-8 w-auto" />
            <span className="font-extrabold text-xl text-white">Calificar</span>
          </Link>
          <p className="text-slate-400 text-sm">Creá tu cuenta gratis</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-slate-500">o con email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="text-red-400 text-sm p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Tu nombre"
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none placeholder-slate-600"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="tu@email.com"
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none placeholder-slate-600"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={e => setPass(e.target.value)} required
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none placeholder-slate-600"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Al registrarte aceptás los{' '}
              <a href="/terminos" target="_blank" className="text-slate-400 underline underline-offset-2 hover:text-violet-400 transition-colors">términos de uso</a>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">Iniciá sesión</Link>
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
