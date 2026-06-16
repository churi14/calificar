'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-contrasenia`,
    })
    if (error) setError('No encontramos una cuenta con ese email.')
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-1.5">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" /><span className="font-extrabold text-xl text-[#0F172A]">Calificar</span></Link>
          <p className="text-gray-500 text-sm mt-2">Recuperar contraseña</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 mb-2">¡Revisá tu email!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Te mandamos un link a <strong>{email}</strong> para que puedas crear una nueva contraseña.
              </p>
              <p className="text-xs text-gray-400 mt-3">Si no llega en unos minutos, revisá la carpeta de spam.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">
                Ingresá tu email y te mandamos un link para crear una nueva contraseña.
              </p>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-gray-900 font-semibold hover:underline">← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}
