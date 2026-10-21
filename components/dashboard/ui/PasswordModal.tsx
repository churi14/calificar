'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Usá al menos 8 caracteres.'); return }
    if (password !== repeat) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    const { error } = await createClient().auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else setDone(true)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-extrabold text-zinc-900 mb-1">Contraseña guardada</h3>
            <p className="text-sm text-zinc-500 mb-5">Ya podés entrar con tu mail y esta contraseña desde calificar.com.ar/login.</p>
            <button onClick={onClose} className="w-full bg-zinc-900 text-white font-bold text-sm py-3 rounded-xl">Listo</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-zinc-900">Contraseña de tu cuenta</h3>
            <p className="text-sm text-zinc-500 -mt-1">Es opcional: sirve para entrar sin esperar un código por mail.</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
              className="w-full border-2 border-zinc-200 focus:border-violet-400 rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
            <input
              type="password"
              value={repeat}
              onChange={e => setRepeat(e.target.value)}
              placeholder="Repetí la contraseña"
              autoComplete="new-password"
              className="w-full border-2 border-zinc-200 focus:border-violet-400 rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white font-bold text-sm py-3 rounded-xl disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
            <button type="button" onClick={onClose} className="text-xs text-zinc-400">Cancelar</button>
          </form>
        )}
      </div>
    </div>
  )
}
