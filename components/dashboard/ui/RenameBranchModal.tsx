'use client'

import React, { useState } from 'react'

interface RenameBranchModalProps {
  accessToken: string
  programId: string
  /** 'main' para la sucursal principal, o el id de la sucursal */
  branchId: string
  currentName: string
  onClose: () => void
  onRenamed: (branchId: string, newName: string) => void
}

export default function RenameBranchModal({
  accessToken, programId, branchId, currentName, onClose, onRenamed,
}: RenameBranchModalProps) {
  const [name,   setName]   = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const unchanged = name.trim() === currentName.trim()

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (saving || name.trim().length < 2 || unchanged) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/fidelizacion/branches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ program_id: programId, branch_id: branchId, name: name.trim() }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.ok) {
        setError(d.error ?? 'No se pudo cambiar el nombre. Intentá de nuevo.')
        setSaving(false)
        return
      }
      onRenamed(branchId, d.name ?? name.trim())
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
      <form onSubmit={save} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-1">Cambiar nombre de la sucursal</h2>
        <p className="text-sm text-zinc-500 dark:text-gray-400 mb-5">
          Es solo para vos: aparece en el menú, en las métricas y en los QR. Tus clientes no lo ven.
        </p>

        <label className="text-xs font-semibold text-zinc-600 dark:text-gray-300 block mb-1.5">Nombre</label>
        <input
          autoFocus
          type="text"
          value={name}
          maxLength={40}
          onChange={e => { setName(e.target.value); setError('') }}
          onFocus={e => e.currentTarget.select()}
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
            disabled={saving || name.trim().length < 2 || unchanged}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: '#7C3AED' }}
          >
            {saving ? 'Guardando...' : 'Guardar nombre'}
          </button>
        </div>
      </form>
    </div>
  )
}
