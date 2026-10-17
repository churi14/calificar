'use client'

import React, { useState } from 'react'
import type { Branch } from '@/types/dashboard'

interface NewBranchModalProps {
  accessToken: string
  programId: string
  onClose: () => void
  onCreated: (branch: Branch) => void
}

export default function NewBranchModal({ accessToken, programId, onClose, onCreated }: NewBranchModalProps) {
  const [name,    setName]    = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (saving || name.trim().length < 2) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/fidelizacion/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ program_id: programId, name: name.trim() }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.branch) {
        setError(d.error ?? 'No se pudo crear la sucursal. Intentá de nuevo.')
        setSaving(false)
        return
      }
      onCreated(d.branch as Branch)
    } catch {
      setError('Error de red. Revisá tu conexión.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60"
      onClick={e => { if (e.target === e.currentTarget && !saving) onClose() }}
    >
      <form onSubmit={create} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-1">Nueva sucursal</h2>
        <p className="text-sm text-zinc-500 dark:text-gray-400 mb-5">
          La tarjeta del cliente es la misma en todas tus sucursales. Cada sucursal tiene su propio QR y sus propias métricas.
        </p>

        <label className="text-xs font-semibold text-zinc-600 dark:text-gray-300 block mb-1.5">Nombre de la sucursal</label>
        <input
          autoFocus
          type="text"
          value={name}
          maxLength={40}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="Ej: Centro, Palermo, Costanera"
          className="w-full border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition-colors"
        />
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-600 dark:text-gray-300 bg-zinc-100 dark:bg-gray-800 hover:bg-zinc-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || name.trim().length < 2}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: '#7C3AED' }}
          >
            {saving ? 'Creando...' : 'Crear sucursal'}
          </button>
        </div>
      </form>
    </div>
  )
}
