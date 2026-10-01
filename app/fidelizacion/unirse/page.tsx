'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Program = {
  id: string
  name: string
  stamps_goal: number
  reward_description: string
  color_primary: string
  logo_url: string | null
  businesses: { name: string; whatsapp_number?: string | null }
}

function UnirseContent() {
  const params = useSearchParams()
  const router = useRouter()
  const programId = params.get('program')

  const [program, setProgram] = useState<Program | null>(null)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [dni, setDni] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Lookup "ya tengo tarjeta"
  const [showLookup, setShowLookup] = useState(false)
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  useEffect(() => {
    if (!programId) return

    // Si ya tiene tarjeta guardada, redirigir directo
    const savedCard = localStorage.getItem(`loyalty_card_${programId}`)
    if (savedCard) {
      router.replace(`/fidelizacion/tarjeta?card=${savedCard}&program=${programId}`)
      return
    }

    fetch(`/api/fidelizacion/program?id=${programId}`)
      .then(r => r.json())
      .then(d => setProgram(d.program))
      .catch(() => {})
  }, [programId, router])

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!lookupPhone || lookupPhone.length < 6) { setLookupError('Ingresá tu número de teléfono'); return }
    setLookupLoading(true)
    setLookupError('')
    const res = await fetch(`/api/fidelizacion/card-status?program_id=${programId}&phone=${encodeURIComponent(lookupPhone)}`)
    const data = await res.json()
    setLookupLoading(false)
    if (!data.found) { setLookupError('No encontramos una tarjeta con ese número.'); return }
    localStorage.setItem(`loyalty_card_${programId}`, data.card.id)
    router.push(`/fidelizacion/tarjeta?card=${data.card.id}&program=${programId}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || phone.length < 8) { setError('Ingresá un teléfono válido'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/fidelizacion/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: programId, phone, name, birth_date: birthDate || null, dni: dni.trim() || null }),
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

  // Calcular luminosidad del color primario para elegir fondo contrastante
  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    return { r, g, b }
  }
  const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#7C3AED')
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  // Si el color es oscuro → fondo claro (tinte suave); si es claro → fondo oscuro
  const bgColor = lum < 0.4
    ? `${color}15`   // tinte muy suave del color primario
    : lum < 0.7
      ? `${color}20`
      : '#1a1a1a'    // fondo oscuro si el color es muy claro

  const textOnColor = lum < 0.5 ? 'white' : '#111827'

  const businessWa = program?.businesses?.whatsapp_number
  const waHref = businessWa
    ? `https://wa.me/${businessWa.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Tengo una consulta sobre el programa de puntos.')}`
    : null

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero con color del negocio */}
      <div className="flex flex-col items-center justify-center pt-14 pb-10 px-6" style={{ backgroundColor: color }}>
        {program?.logo_url ? (
          <img src={program.logo_url} alt=""
            className="h-24 max-w-[200px] object-contain mb-5 drop-shadow-lg"
            style={{ filter: lum < 0.5 ? 'brightness(0) invert(1)' : 'brightness(0)' }} />
        ) : (
          <div className="text-5xl mb-5" style={{ color: textOnColor }}>★</div>
        )}
        <h1 className="text-2xl font-extrabold text-center" style={{ color: textOnColor }}>
          {program ? (program.businesses?.name ?? program.name) : 'Cargando...'}
        </h1>
        {program && (
          <p className="text-sm text-center mt-2 opacity-80" style={{ color: textOnColor }}>
            Juntá {program.stamps_goal} sellos y ganás: <strong>{program.reward_description}</strong>
          </p>
        )}
      </div>

      {/* Formulario sobre fondo blanco */}
      <div className="flex-1 bg-white px-6 pt-8 pb-10">
        <div className="w-full max-w-sm mx-auto">
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
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Fecha de cumpleaños <span className="text-zinc-300">(opcional)</span></label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <p className="text-xs text-zinc-400 mt-1">Te mandamos un regalo el día de tu cumple 🎂</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">DNI <span className="text-zinc-300">(opcional)</span></label>
            <input
              type="text"
              inputMode="numeric"
              value={dni}
              onChange={e => setDni(e.target.value)}
              placeholder="12345678"
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <div className="mt-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
              <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                Tu tarjeta está asociada a tu número de teléfono. Si lo cambiás o perdés el celular, <strong>perdés el acceso</strong>. Con el DNI podés recuperarla sin importar el teléfono.
              </p>
            </div>
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

        {/* WA del negocio — fijo abajo, sobre el banner PWA */}
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-white text-sm font-semibold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #20b857 100%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultar
          </a>
        )}

        {/* Sección "ya tengo tarjeta" */}
        <div className="mt-8 pt-6 border-t border-zinc-100">
          {!showLookup ? (
            <button
              onClick={() => setShowLookup(true)}
              className="w-full py-3 rounded-full border-2 border-zinc-200 text-sm font-semibold text-zinc-600 hover:border-zinc-300 transition-colors"
            >
              Ya me registré → Ver mis sellos
            </button>
          ) : (
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-3 text-center">Ingresá tu número para encontrar tu tarjeta</p>
              <form onSubmit={handleLookup} className="flex flex-col gap-3">
                <input
                  type="tel"
                  value={lookupPhone}
                  onChange={e => setLookupPhone(e.target.value)}
                  placeholder="Tu número de teléfono"
                  autoFocus
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                {lookupError && <p className="text-red-500 text-xs text-center">{lookupError}</p>}
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full text-white font-bold py-3 rounded-full text-sm disabled:opacity-60"
                  style={{ backgroundColor: color }}
                >
                  {lookupLoading ? 'Buscando...' : 'Buscar mi tarjeta →'}
                </button>
                <button type="button" onClick={() => setShowLookup(false)} className="text-xs text-zinc-400 text-center">
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </div>
        </div>
      </div>
    </main>
  )
}

export default function UnirsePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </main>
    }>
      <UnirseContent />
    </Suspense>
  )
}
