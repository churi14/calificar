'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Program = {
  id: string
  name: string
  stamps_goal: number
  reward_description: string
  color_primary: string
  logo_url: string | null
  businesses: { name: string }
}

export default function UnirsePage() {
  const params = useSearchParams()
  const router = useRouter()
  const programId = params.get('program')

  const [program, setProgram] = useState<Program | null>(null)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!programId) return
    fetch(`/api/fidelizacion/program?id=${programId}`)
      .then(r => r.json())
      .then(d => setProgram(d.program))
      .catch(() => {})
  }, [programId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || phone.length < 8) { setError('Ingresá un teléfono válido'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/fidelizacion/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: programId, phone, name }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }

    // Guardar card_id en localStorage para próximas visitas
    localStorage.setItem(`loyalty_card_${programId}`, data.card.id)

    // Si hay wallet link, mostrar botón; si no, ir a la tarjeta
    if (data.wallet_link) {
      router.push(`/fidelizacion/tarjeta?card=${data.card.id}&program=${programId}&wallet=${encodeURIComponent(data.wallet_link)}`)
    } else {
      router.push(`/fidelizacion/tarjeta?card=${data.card.id}&program=${programId}`)
    }
  }

  const color = program?.color_primary ?? '#7C3AED'

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header del programa */}
        <div className="text-center mb-8">
          {program?.logo_url ? (
            <img src={program.logo_url} alt="" className="h-16 w-16 rounded-2xl mx-auto mb-4 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: color }}>
              ★
            </div>
          )}
          <h1 className="text-xl font-extrabold text-zinc-900">
            {program ? `${program.businesses?.name ?? 'Calificar'} — ${program.name}` : 'Cargando...'}
          </h1>
          {program && (
            <p className="text-sm text-zinc-500 mt-1">
              Juntá {program.stamps_goal} sellos y ganás: <strong>{program.reward_description}</strong>
            </p>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Tu nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Juan"
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Teléfono <span className="text-red-400">*</span></label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="11 1234-5678"
              required
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <p className="text-xs text-zinc-400 mt-1">Usamos el teléfono para identificar tu tarjeta.</p>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-3.5 rounded-full text-sm transition-all active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: color }}
          >
            {loading ? 'Creando tu tarjeta...' : 'Crear mi tarjeta gratis →'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-5">
          Sin app, sin contraseña. Solo tu teléfono.
        </p>
      </div>
    </main>
  )
}
