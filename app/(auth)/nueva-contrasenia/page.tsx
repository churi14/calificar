'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NuevaContraseniaPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [done,      setDone]      = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== password2) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError('El link expiró o ya fue usado. Pedí uno nuevo.')
    else setDone(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-1.5">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" /><span className="font-extrabold text-xl text-[#0F172A]">Calificar</span></Link>
          <p className="text-gray-500 text-sm mt-2">Nueva contraseña</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
              <p className="text-sm text-gray-500 mb-5">Ya podés ingresar con tu nueva contraseña.</p>
              <button onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors">
                Ir al dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nueva contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Repetir contraseña</label>
                <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} required
                  placeholder="Repetí la contraseña"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
