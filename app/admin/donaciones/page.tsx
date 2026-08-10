'use client'

import { useState, useEffect, useCallback } from 'react'

type Donation = {
  id: string
  user_id: string
  method: string
  amount_ars: number | null
  reference: string | null
  status: string
  created_at: string
  reviewed_at: string | null
  profiles: { name: string; email: string } | null
}

const METHOD_LABELS: Record<string, string> = {
  cafecito: '☕ Cafecito',
}

export default function AdminDonacionesPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/donations/list')
    const data = await res.json()
    setDonations(data.donations ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setProcessing(id)
    await fetch('/api/admin/donations/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donation_id: id, action }),
    })
    setProcessing(null)
    load()
  }

  const filtered = donations.filter(d =>
    filter === 'all' ? true : d.status === filter
  )

  const pending = donations.filter(d => d.status === 'pending').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donaciones</h1>
          <p className="text-sm text-gray-400 mt-0.5">Verificá y aprobá las donaciones para activar QRs ilimitados</p>
        </div>
        {pending > 0 && (
          <span className="bg-amber-100 text-amber-700 font-bold text-sm px-4 py-2 rounded-xl">
            {pending} pendiente{pending !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-1 mb-6">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : f === 'rejected' ? 'Rechazadas' : 'Todas'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No hay donaciones en esta categoría.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(d => (
              <div key={d.id} className="px-6 py-4 flex items-center gap-4">
                {/* Usuario */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.profiles?.name ?? 'Usuario'}</p>
                  <p className="text-xs text-gray-400 truncate">{d.profiles?.email}</p>
                </div>

                {/* Método */}
                <div className="flex-shrink-0">
                  <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                    {METHOD_LABELS[d.method] ?? d.method}
                  </span>
                </div>

                {/* Monto */}
                <div className="flex-shrink-0 text-right w-24">
                  <p className="text-sm font-bold text-gray-900">
                    {d.amount_ars ? `$${d.amount_ars.toLocaleString('es-AR')}` : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400">ARS declarados</p>
                </div>

                {/* Referencia */}
                <div className="flex-shrink-0 max-w-[180px]">
                  <p className="text-xs font-mono text-gray-600 truncate" title={d.reference ?? ''}>
                    {d.reference ?? '—'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(d.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>

                {/* Status / Acciones */}
                {d.status === 'pending' ? (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(d.id, 'approve')}
                      disabled={processing === d.id}
                      className="text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processing === d.id ? '…' : '✓ Aprobar'}
                    </button>
                    <button
                      onClick={() => handleAction(d.id, 'reject')}
                      disabled={processing === d.id}
                      className="text-xs font-bold bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
                    d.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {d.status === 'approved' ? '✓ Aprobada' : '✕ Rechazada'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
