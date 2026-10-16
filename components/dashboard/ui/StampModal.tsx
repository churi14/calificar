'use client'

import React, { useState } from 'react'

// ── props ─────────────────────────────────────────────────────────────────────
interface StampModalProps {
  cardName: string
  onConfirm: (amount?: number) => Promise<void>
  onClose: () => void
}

// ── componente ────────────────────────────────────────────────────────────────
export default function StampModal({ cardName, onConfirm, onClose }: StampModalProps) {
  const [amount, setAmount]   = useState('')
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    await onConfirm(amount ? parseFloat(amount) : undefined)
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="font-bold text-zinc-900 text-lg mb-1">Dar sello a {cardName}</h3>
        <p className="text-zinc-500 text-sm mb-4">Ingresá el monto de compra (opcional)</p>

        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Ej: 5000"
          className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-violet-400 mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Dar sello ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
