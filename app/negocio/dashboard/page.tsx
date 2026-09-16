'use client'

import { useEffect, useState } from 'react'

type Program = {
  id: string
  name: string
  stamps_goal: number
  reward_description: string
  color_primary: string
}

type Client = {
  id: string
  name: string
  phone: string
  stamps: number
  total_visits: number
  created_at: string
}

export default function NegocioDashboard() {
  const [program, setProgram] = useState<Program | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [stampingId, setStampingId] = useState<string | null>(null)
  const [stampResult, setStampResult] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponResult, setCouponResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/negocio/clients')
    if (res.status === 401) { window.location.href = '/login'; return }
    const data = await res.json()
    setProgram(data.program ?? null)
    setClients(data.clients ?? [])
    setLoading(false)
  }

  async function addStamp(client: Client) {
    if (!program) return
    setStampingId(client.id)
    const res = await fetch('/api/negocio/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: client.id, program_id: program.id }),
    })
    const data = await res.json()
    setStampingId(null)

    if (data.goal_reached) {
      setStampResult(prev => ({ ...prev, [client.id]: '🎉 ¡Premio alcanzado!' }))
    } else if (data.stamps !== undefined) {
      setStampResult(prev => ({ ...prev, [client.id]: `✓ Sello #${data.stamps} sumado` }))
    } else {
      setStampResult(prev => ({ ...prev, [client.id]: '❌ Error' }))
    }

    // Actualizar lista local
    setClients(prev => prev.map(c =>
      c.id === client.id ? { ...c, stamps: data.stamps ?? c.stamps, total_visits: c.total_visits + 1 } : c
    ))

    setTimeout(() => setStampResult(prev => { const n = { ...prev }; delete n[client.id]; return n }), 3000)
  }

  async function redeemCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponResult(null)
    const res = await fetch('/api/fidelizacion/redeem-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupon_code: couponInput.trim().toUpperCase() }),
    })
    const data = await res.json()
    setCouponLoading(false)
    if (res.ok) {
      setCouponResult({ ok: true, msg: `✅ Canjeado: ${data.note ?? 'Premio'}` })
      setCouponInput('')
    } else if (res.status === 409) {
      setCouponResult({ ok: false, msg: '⚠️ Este cupón ya fue canjeado anteriormente.' })
    } else if (res.status === 404) {
      setCouponResult({ ok: false, msg: '❌ Cupón no encontrado. Revisá el código.' })
    } else {
      setCouponResult({ ok: false, msg: '❌ Error al canjear. Intentá de nuevo.' })
    }
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </main>
    )
  }

  if (!program) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-4xl mb-4">🎴</p>
          <p className="font-semibold text-zinc-700">No tenés un programa activo.</p>
          <p className="text-sm text-zinc-400 mt-1">Contactá a Calificar para configurarlo.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div
        className="px-6 py-8 text-white"
        style={{ background: `linear-gradient(135deg, ${program.color_primary}, ${program.color_primary}cc)` }}
      >
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Panel del negocio</p>
        <h1 className="text-2xl font-extrabold">{program.name}</h1>
        <p className="text-sm opacity-75 mt-1">
          {clients.length} clientes · Meta: {program.stamps_goal} sellos → {program.reward_description}
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 px-4 -mt-4">
        {[
          { label: 'Clientes', value: clients.length },
          { label: 'Visitas hoy', value: clients.reduce((a, c) => a + c.total_visits, 0) },
          { label: 'Cerca del premio', value: clients.filter(c => c.stamps >= program.stamps_goal - 1).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-zinc-900">{s.value}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Canjear cupón */}
      <div className="px-4 mt-5">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">🎟 Canjear cupón</p>
          <form onSubmit={redeemCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={e => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Ingresá el código del cliente"
              className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              type="submit"
              disabled={couponLoading || !couponInput.trim()}
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {couponLoading ? '...' : 'Canjear'}
            </button>
          </form>
          {couponResult && (
            <p className={`text-xs font-semibold mt-2 ${couponResult.ok ? 'text-green-600' : 'text-red-500'}`}>
              {couponResult.msg}
            </p>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="px-4 mt-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* Lista de clientes */}
      <div className="px-4 mt-4 pb-10 space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-zinc-400 text-sm py-10">Sin clientes todavía.</p>
        ) : filtered.map(client => (
          <div key={client.id} className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900 text-sm truncate">{client.name || '—'}</p>
                <p className="text-xs text-zinc-400">{client.phone}</p>
              </div>

              {/* Sellos */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-extrabold" style={{ color: program.color_primary }}>
                    {client.stamps}
                    <span className="text-xs text-zinc-400 font-normal">/{program.stamps_goal}</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">sellos</p>
                </div>

                {stampResult[client.id] ? (
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${
                    stampResult[client.id].startsWith('✓') || stampResult[client.id].startsWith('🎉')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {stampResult[client.id]}
                  </span>
                ) : (
                  <button
                    onClick={() => addStamp(client)}
                    disabled={stampingId === client.id}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {stampingId === client.id ? '...' : '+ Sello'}
                  </button>
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-3 bg-zinc-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((client.stamps / program.stamps_goal) * 100, 100)}%`,
                  backgroundColor: program.color_primary
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
