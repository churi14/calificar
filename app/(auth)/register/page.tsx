'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-1.5">
            <span className="text-amber-500">★</span> calificar
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