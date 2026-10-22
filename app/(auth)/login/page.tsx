'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeMode, setCodeMode] = useState<'off' | 'email' | 'verify'>('off')
  const [usePassword, setUsePassword] = useState(false)
  const [code, setCode] = useState('')
  const [info, setInfo] = useState('')

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email.trim()) { setError('Escribí tu email primero.'); return }
    setLoading(true); setError(''); setInfo('')
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } })
    setLoading(false)
    if (error) {
      const msg = (error.message ?? '').toLowerCase()
      if (error.status === 429 || msg.includes('rate limit') || msg.includes('too many') || msg.includes('seconds')) {
        setError('Pediste muchos códigos seguidos. Esperá unos minutos y volvé a intentar, o entrá con Google.')
      } else if (msg.includes('signups not allowed') || msg.includes('not found') || msg.includes('user')) {
        setError('No encontramos una cuenta con ese email. Revisá que esté bien escrito o registrate.')
      } else {
        setError(`No pudimos enviar el código (${error.message}). Probá con Google.`)
      }
      return
    }
    setCodeMode('verify'); setInfo('Te mandamos un código al mail.')
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
    if (error) { setError('El código no es válido o venció. Pedí uno nuevo.'); setLoading(false); return }
    router.push(next)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false) }
    else router.push(next)
  }

  async function handleGoogle() {
    setLoading(true)
    const supabase = await createClient()
    // Cerrar sesión activa primero para evitar que un usuario quede logueado
    // con la cuenta equivocada cuando tiene múltiples perfiles
    await supabase.auth.signOut()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
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
          <p className="text-slate-400 text-sm">Ingresá a tu cuenta</p>
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
            <span className="text-xs text-slate-500">o con tu email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {error && (
            <div className="text-red-400 text-sm p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
          )}

          {!usePassword && (
            <>
              {codeMode !== 'verify' ? (
                <form onSubmit={sendCode} className="space-y-3">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="tu@email.com"
                    className="w-full rounded-xl px-3 py-3 text-sm text-white focus:outline-none placeholder-slate-600"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.6)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                  />
                  <button type="submit" disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Recibir código por mail'}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="space-y-3">
                  {info && <p className="text-emerald-400 text-xs">{info} Revisá también spam.</p>}
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} autoFocus
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="Código del mail"
                    className="w-full rounded-xl px-3 py-3 text-center text-lg font-bold tracking-widest text-white focus:outline-none placeholder-slate-600"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }} />
                  <button type="submit" disabled={loading || code.length < 6}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50">
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                  <button type="button" onClick={() => sendCode()} disabled={loading} className="w-full text-xs text-slate-400 hover:text-white">
                    Reenviar código
                  </button>
                </form>
              )}
              <button type="button" onClick={() => { setUsePassword(true); setError('') }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Tengo contraseña
              </button>
            </>
          )}

          {usePassword && (
            <form onSubmit={handleLogin} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="tu@email.com"
                className="w-full rounded-xl px-3 py-3 text-sm text-white focus:outline-none placeholder-slate-600"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Contraseña"
                className="w-full rounded-xl px-3 py-3 text-sm text-white focus:outline-none placeholder-slate-600"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }} />
              <button type="submit" disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => { setUsePassword(false); setError('') }} className="text-xs text-slate-500 hover:text-slate-300">
                  ← Entrar con código
                </button>
                <Link href="/recuperar" className="text-xs text-slate-500 hover:text-violet-400 transition-colors">¿Olvidaste tu contraseña?</Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">Registrate gratis</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
