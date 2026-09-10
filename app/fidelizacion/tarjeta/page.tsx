'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type CardData = {
  id: string
  name: string
  stamps: number
  total_visits: number
  loyalty_programs: {
    name: string
    stamps_goal: number
    reward_description: string
    color_primary: string
    logo_url: string | null
    businesses: { name: string }
  }
}

function TarjetaContent() {
  const params = useSearchParams()
  const cardId = params.get('card')
  const programId = params.get('program')
  const walletLink = params.get('wallet')

  const [card, setCard] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifState, setNotifState] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle')

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

  async function activarNotificaciones() {
    if (!cardId || !programId) return
    setNotifState('loading')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setNotifState('denied'); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await fetch('/api/fidelizacion/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, program_id: programId, subscription: sub.toJSON() }),
      })

      setNotifState('granted')
    } catch {
      setNotifState('denied')
    }
  }

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    // Detectar si ya tiene permiso
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifState('granted')
    }
  }, [])

  useEffect(() => {
    if (!cardId) return
    fetch(`/api/fidelizacion/card?card_id=${cardId}`)
      .then(r => r.json())
      .then(d => { setCard(d.card); setLoading(false) })
      .catch(() => setLoading(false))
  }, [cardId])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </main>
    )
  }

  if (!card) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-4xl mb-4">😕</p>
          <p className="text-zinc-500">Tarjeta no encontrada.</p>
        </div>
      </main>
    )
  }

  const program = card.loyalty_programs
  const color = program.color_primary ?? '#7C3AED'
  const stamps = card.stamps
  const goal = program.stamps_goal
  const progress = Math.min((stamps / goal) * 100, 100)

  // Generar grid de sellos
  const selloItems = Array.from({ length: goal }, (_, i) => i < stamps)

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center px-4 py-10">

      {/* Tarjeta visual */}
      <div
        className="w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl mb-6"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div className="flex flex-col items-center mb-5">
          {program.logo_url ? (
            <img
              src={program.logo_url}
              alt={program.businesses?.name ?? 'Logo'}
              className="h-16 max-w-[180px] object-contain mb-3"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl mb-3">★</div>
          )}
          <p className="font-extrabold text-lg leading-tight text-center opacity-95">{program.name}</p>
          <p className="text-xs opacity-60 mt-0.5">{program.businesses?.name ?? 'Calificar'}</p>
        </div>

        <p className="text-sm font-semibold opacity-80 mb-3">{card.name}</p>

        {/* Grid de sellos */}
        <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${Math.min(goal, 5)}, 1fr)` }}>
          {selloItems.map((filled, i) => (
            <div
              key={i}
              className={`aspect-square rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                filled
                  ? 'bg-white text-violet-700 border-white shadow-md'
                  : 'bg-white/10 border-white/30 text-white/40'
              }`}
            >
              {filled ? '★' : '○'}
            </div>
          ))}
        </div>

        {/* Progreso */}
        <div className="bg-white/20 rounded-full h-2 mb-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs opacity-70">
          <span>{stamps} de {goal} sellos</span>
          <span>Premio: {program.reward_description}</span>
        </div>
      </div>

      {/* QR personal para que el negocio escanee */}
      {cardId && programId && (
        <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 mb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Mostrá este QR en el local para sumar tu sello
          </p>
          <div className="flex justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                `https://calificar.com.ar/fidelizacion/stamp?program=${programId}&card=${cardId}`
              )}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
              alt="Tu QR personal"
              width={160}
              height={160}
              className="rounded-xl"
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-3">El encargado escanea este QR y se suma automáticamente</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-4">
        {isAndroid && walletLink && (
          <a
            href={walletLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-black text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-zinc-800 transition-colors shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.56 10.738l-9.52-9.52A1.5 1.5 0 0010.978.5H3.5A3 3 0 00.5 3.5v7.478c0 .398.158.78.44 1.062l9.52 9.52a3 3 0 004.242 0l6.858-6.858a3 3 0 000-4.243zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
            </svg>
            Agregar a Google Wallet
          </a>
        )}
        {isAndroid && !walletLink && (
          <div className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-400 font-semibold px-6 py-3 rounded-full text-sm cursor-not-allowed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.56 10.738l-9.52-9.52A1.5 1.5 0 0010.978.5H3.5A3 3 0 00.5 3.5v7.478c0 .398.158.78.44 1.062l9.52 9.52a3 3 0 004.242 0l6.858-6.858a3 3 0 000-4.243zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
            </svg>
            Google Wallet — Próximamente
          </div>
        )}
        {isIOS && (
          <div className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-400 font-semibold px-6 py-3 rounded-full text-sm cursor-not-allowed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.02 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple Wallet — Próximamente
          </div>
        )}

        {/* Botón notificaciones */}
        {'Notification' in (typeof window !== 'undefined' ? window : {}) && notifState !== 'granted' && (
          <button
            onClick={activarNotificaciones}
            disabled={notifState === 'loading' || notifState === 'denied'}
            className={`flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-full text-sm transition-colors ${
              notifState === 'denied'
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg'
            }`}
          >
            {notifState === 'loading' ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Activando...</>
            ) : notifState === 'denied' ? (
              <>🔕 Notificaciones bloqueadas</>
            ) : (
              <>🔔 Activar notificaciones de promos</>
            )}
          </button>
        )}
        {notifState === 'granted' && (
          <p className="text-center text-sm text-emerald-600 font-semibold">✓ Notificaciones activadas</p>
        )}
      </div>

      {/* Estadísticas */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Tu resumen</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-zinc-900">{card.total_visits}</p>
            <p className="text-xs text-zinc-400">visitas totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-zinc-900">{stamps}</p>
            <p className="text-xs text-zinc-400">sellos actuales</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 mt-6 text-center">
        Guardá este link o escaneá el cartel NFC del local para sumar sellos.
      </p>
    </main>
  )
}

export default function TarjetaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </main>
    }>
      <TarjetaContent />
    </Suspense>
  )
}
