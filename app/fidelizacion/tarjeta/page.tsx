'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    card_text_color: string | null
    logo_url: string | null
    stamp_icon_url: string | null
    card_background_url: string | null
    page_bg_color: string | null
    stamp_icon_no_bg: boolean | null
    businesses: { name: string; whatsapp_number?: string | null; plan?: string | null }
  }
}

function TarjetaContent() {
  const params = useSearchParams()
  const cardId = params.get('card')
  const programId = params.get('program')
  const walletLink = params.get('wallet')

  const [card, setCard] = useState<CardData | null>(null)
  const [walletLinkFromApi, setWalletLinkFromApi] = useState<string | null>(null)
  const [walletSaved, setWalletSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifState, setNotifState] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle')
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [coupons, setCoupons] = useState<{ label: string; code: string; created_at: string }[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [installDismissed, setInstallDismissed] = useState(false)

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
  }

  async function activarNotificaciones() {
    if (!cardId || !programId) return
    setNotifState('loading')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setNotifState('denied'); return }

      // Registrar SW si no está registrado aún
      if (!('serviceWorker' in navigator)) { setNotifState('denied'); return }
      let reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js')
      }

      // Esperar a que el SW esté activo, con timeout de 5s para no quedar colgado
      const activeReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 5000)),
      ]) as ServiceWorkerRegistration

      const vapidKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      const sub = await activeReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
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

  // Manifest dinámico con logo del negocio
  useEffect(() => {
    if (!programId) return
    const existing = document.querySelector('link[rel="manifest"]')
    if (existing) existing.remove()
    const link = document.createElement('link')
    link.rel = 'manifest'
    link.href = `/api/fidelizacion/manifest?program_id=${programId}${cardId ? `&card_id=${cardId}` : ''}`
    document.head.appendChild(link)
    return () => { link.remove() }
  }, [programId, cardId])

  // apple-touch-icon dinámico para iOS (usa logo del negocio si está disponible)
  useEffect(() => {
    if (!card) return
    const iconUrl = card.loyalty_programs.logo_url
    if (!iconUrl) return
    const existing = document.querySelector('link[rel="apple-touch-icon"]')
    if (existing) existing.remove()
    const link = document.createElement('link')
    link.rel = 'apple-touch-icon'
    link.setAttribute('href', iconUrl)
    document.head.appendChild(link)
    return () => { link.remove() }
  }, [card])

  // Re-suscribir silenciosamente si el permiso ya estaba granted pero la suscripción
  // puede no estar en la DB (por el bug anterior del string/Uint8Array)
  useEffect(() => {
    if (!cardId || !programId) return
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    async function reSubscribeSilently() {
      try {
        let reg = await navigator.serviceWorker.getRegistration('/sw.js')
        if (!reg) reg = await navigator.serviceWorker.register('/sw.js')
        const activeReg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]) as ServiceWorkerRegistration
        const vapidKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        // Obtener suscripción existente o crear una nueva
        let sub = await activeReg.pushManager.getSubscription()
        if (!sub) {
          sub = await activeReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey })
        }
        // Siempre upsert en DB para asegurar que esté guardada con las keys correctas
        await fetch('/api/fidelizacion/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId, program_id: programId, subscription: sub.toJSON() }),
        })
      } catch {
        // Silencioso — no molestar al usuario si falla
      }
    }

    reSubscribeSilently()
  }, [cardId, programId])

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    // Detectar si ya tiene permiso de notificaciones
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotifState('granted')
      } else if (Notification.permission === 'default') {
        // Mostrar modal después de 1.5s para que vea su tarjeta primero
        setTimeout(() => setShowNotifModal(true), 1500)
      }
    }
    // PWA install banner — Android (beforeinstallprompt)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      if (!sessionStorage.getItem('pwa_dismissed')) {
        setTimeout(() => setShowInstallBanner(true), 3000)
      }
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    // iOS: mostrar banner si no está instalado y es Safari iOS
    if (isIOS && !isStandalone && !sessionStorage.getItem('pwa_dismissed')) {
      setTimeout(() => setShowInstallBanner(true), 3000)
    }
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  useEffect(() => {
    if (!cardId) return

    // Leer flag de wallet guardado
    if (localStorage.getItem(`wallet_saved_${cardId}`)) setWalletSaved(true)

    fetch(`/api/fidelizacion/card?card_id=${cardId}`)
      .then(r => r.json())
      .then(d => { setCard(d.card); if (d.wallet_link) setWalletLinkFromApi(d.wallet_link); setLoading(false) })
      .catch(() => setLoading(false))

    fetch(`/api/fidelizacion/card-coupons?card_id=${cardId}`)
      .then(r => r.json())
      .then(d => { if (d.coupons) setCoupons(d.coupons) })
      .catch(() => {})

    // Realtime: actualiza stamps automáticamente cuando el negocio sella
    const channel = supabase
      .channel(`card-${cardId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'loyalty_cards',
        filter: `id=eq.${cardId}`,
      }, (payload) => {
        setCard(prev => prev ? { ...prev, stamps: payload.new.stamps, total_visits: payload.new.total_visits } : prev)
        // Refrescar cupones por si cayó un premio nuevo
        fetch(`/api/fidelizacion/card-coupons?card_id=${cardId}`)
          .then(r => r.json())
          .then(d => { if (d.coupons) setCoupons(d.coupons) })
          .catch(() => {})
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
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
        <div className="max-w-xs">
          <p className="text-5xl mb-4">😕</p>
          <h1 className="text-lg font-extrabold text-zinc-900 mb-2">Esta tarjeta ya no existe</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Puede que el negocio la haya eliminado, o que la cuenta fue dada de baja. Tu historial de sellos no puede recuperarse.
          </p>
          {programId && (
            <a
              href={`/s/${programId}`}
              className="inline-block px-6 py-3 rounded-2xl font-bold text-white text-sm"
              style={{ background: '#7C3AED' }}
            >
              Registrarme de nuevo
            </a>
          )}
        </div>
      </main>
    )
  }

  const program = card.loyalty_programs
  const color = program.color_primary ?? '#7C3AED'
  const textColor = program.card_text_color ?? '#FFFFFF'
  const stamps = card.stamps
  const goal = program.stamps_goal
  const progress = Math.min((stamps / goal) * 100, 100)

  // Generar grid de sellos
  const selloItems = Array.from({ length: goal }, (_, i) => i < stamps)

  // Ícono de sello: stamp_icon_url (Pro+) > logo_url (Pro+) > null (básico)
  const bizPlan = (program.businesses as { plan?: string | null } | null)?.plan ?? 'trial'
  const isProPlus = ['pro', 'ultimate', 'gifted'].includes(bizPlan.toLowerCase())
  const stampIcon = program.stamp_icon_url ?? (isProPlus ? program.logo_url : null)
  const cardBgImage = program.card_background_url
  const pageBgColor = program.page_bg_color ?? '#09090b'
  const stampNoBg = program.stamp_icon_no_bg ?? false

  async function activarDesdeModal() {
    setShowNotifModal(false)
    await activarNotificaciones()
  }

  async function instalarApp() {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setShowInstallBanner(false)
    }
  }

  function dismissInstall() {
    sessionStorage.setItem('pwa_dismissed', '1')
    setInstallDismissed(true)
    setShowInstallBanner(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center pb-24" style={{ backgroundColor: pageBgColor }}>

      {/* Modal de notificaciones */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <div className="text-4xl text-center mb-3">🔔</div>
            <h2 className="text-lg font-extrabold text-zinc-900 text-center mb-1">Activá las notificaciones</h2>
            <p className="text-sm text-zinc-500 text-center mb-5">
              Te avisamos cuando {card?.loyalty_programs?.businesses?.name ?? 'el negocio'} tenga promos especiales para vos.
            </p>
            <button onClick={activarDesdeModal} className="w-full text-white font-bold py-3.5 rounded-full text-sm mb-3" style={{ backgroundColor: color }}>
              Activar notificaciones
            </button>
            <button onClick={() => setShowNotifModal(false)} className="w-full text-zinc-400 text-sm py-2">Ahora no</button>
          </div>
        </div>
      )}

      {/* Banner PWA */}
      {showInstallBanner && !installDismissed && !isStandalone && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden">
            {isIOS ? (
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    className="flex items-start gap-3 flex-1 text-left active:opacity-70"
                    onClick={async () => {
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        try {
                          await navigator.share({ title: 'Instalá la app', url: window.location.href })
                        } catch { /* cancelado */ }
                      }
                    }}
                  >
                    <span className="text-2xl">📲</span>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">Instalá la app</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">Tocá aquí → <strong>Agregar a inicio</strong></p>
                    </div>
                  </button>
                  <button onClick={dismissInstall} className="text-zinc-300 text-lg leading-none flex-shrink-0 mt-0.5">✕</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4">
                <span className="text-2xl">📲</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 text-sm">Instalá la app</p>
                  <p className="text-xs text-zinc-500">Accedé rápido desde tu pantalla de inicio</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={dismissInstall} className="text-xs text-zinc-400 px-2 py-1.5">No, gracias</button>
                  <button onClick={instalarApp} className="text-xs font-bold text-white px-3 py-1.5 rounded-xl" style={{ background: color }}>Instalar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TARJETA ── */}
      <div className="w-full max-w-sm px-4 pt-10 pb-2">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ background: `linear-gradient(145deg, ${color}f0, ${color}bb)` }}>
          {/* Imagen de fondo — dentro del card, no escapa */}
          {cardBgImage && (
            <div className="absolute inset-0"
              style={{ backgroundImage: `url(${cardBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
          )}
          {/* Overlay de color sobre la imagen para que el texto sea legible */}
          {cardBgImage && (
            <div className="absolute inset-0" style={{ background: `${color}99` }} />
          )}
          {/* Header */}
          <div className="relative px-6 pt-7 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: `${textColor}99` }}>{card.name}</p>
              <p className="font-extrabold text-xl leading-tight" style={{ color: textColor }}>{program.businesses?.name ?? program.name}</p>
            </div>
            {program.logo_url ? (
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={program.logo_url} alt="" className="w-11 h-11 object-contain" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-extrabold" style={{ color: textColor }}>
                {(program.businesses?.name ?? program.name).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Grid sellos */}
          <div className="relative px-6 pb-4">
            <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(goal, 5)}, 1fr)` }}>
              {selloItems.map((filled, i) =>
                stampIcon ? (
                  stampNoBg ? (
                    <div key={i} className="aspect-square flex items-center justify-center p-1 transition-all">
                      <img src={stampIcon} alt="" className="w-full h-full object-contain"
                        style={filled ? {} : { filter: 'grayscale(100%) opacity(0.25)' }} />
                    </div>
                  ) : (
                    <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center p-2 transition-all ${filled ? 'bg-white shadow-md' : 'bg-white/15'}`}>
                      <img src={stampIcon} alt="" className="w-full h-full object-contain"
                        style={filled ? {} : { filter: 'grayscale(100%) brightness(1.5) opacity(0.3)' }} />
                    </div>
                  )
                ) : (
                  <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-base font-bold transition-all ${filled ? 'bg-white shadow-md' : 'bg-white/15'}`}
                    style={filled ? { color } : { color: 'rgba(255,255,255,0.35)' }}>
                    {filled ? '✓' : '·'}
                  </div>
                )
              )}
            </div>
          </div>
          {/* Progreso */}
          <div className="relative px-6 py-5">
            <div className="flex justify-between text-xs mb-2" style={{ color: `${textColor}b3` }}>
              <span className="font-bold text-sm" style={{ color: textColor }}>{stamps} de {goal} sellos</span>
              <span>{program.reward_description}</span>
            </div>
            <div className="rounded-full h-2" style={{ background: `${textColor}30` }}>
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: textColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN INFERIOR — siempre oscura para que el QR contraste ── */}
      <div className="w-full max-w-sm px-4 mt-4 flex flex-col gap-3">

        {/* Cupones */}
        {coupons.length > 0 && coupons.map((c, i) => (
          <div key={i} className="bg-white rounded-3xl px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>Premio ganado 🎁</p>
            <p className="text-sm font-semibold text-zinc-800 mb-3">{c.label}</p>
            <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-zinc-400 mb-1 uppercase tracking-widest">Código de descuento</p>
              <p className="text-lg font-mono font-extrabold text-white tracking-widest">{c.code}</p>
            </div>
            <p className="text-xs text-zinc-400 mt-2 text-center">Mostralo al encargado — un solo uso</p>
          </div>
        ))}

        {/* QR — fondo SIEMPRE blanco, contrasta con cualquier color */}
        {cardId && programId && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Mostrá este QR en el local
            </p>
            <p className="text-xs text-zinc-400 mb-4">para sumar tu sello</p>
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `https://calificar.com.ar/fidelizacion/stamp?program=${programId}&card=${cardId}`
                )}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
                alt="Tu QR personal"
                width={200}
                height={200}
                className="rounded-xl"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-4">El encargado escanea y se suma automáticamente</p>
          </div>
        )}

        {/* Google / Apple Wallet */}
        {isAndroid && (walletLink ?? walletLinkFromApi) && (
          <a href={(walletLink ?? walletLinkFromApi)!} target="_blank" rel="noopener noreferrer"
            onClick={() => { localStorage.setItem(`wallet_saved_${cardId}`, '1'); setWalletSaved(true) }}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold px-6 py-4 rounded-full text-sm shadow-lg border border-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.56 10.738l-9.52-9.52A1.5 1.5 0 0010.978.5H3.5A3 3 0 00.5 3.5v7.478c0 .398.158.78.44 1.062l9.52 9.52a3 3 0 004.242 0l6.858-6.858a3 3 0 000-4.243zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
            </svg>
            {walletSaved ? 'Ver en Google Wallet' : 'Agregar a Google Wallet'}
          </a>
        )}
        {isAndroid && !(walletLink ?? walletLinkFromApi) && (
          <div className="flex items-center justify-center gap-2 bg-white/10 text-white/40 font-semibold px-6 py-4 rounded-full text-sm cursor-not-allowed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.56 10.738l-9.52-9.52A1.5 1.5 0 0010.978.5H3.5A3 3 0 00.5 3.5v7.478c0 .398.158.78.44 1.062l9.52 9.52a3 3 0 004.242 0l6.858-6.858a3 3 0 000-4.243zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
            </svg>
            Google Wallet — Próximamente
          </div>
        )}
        {isIOS && (
          <div className="flex items-center justify-center gap-2 bg-white/10 text-white/40 font-semibold px-6 py-4 rounded-full text-sm cursor-not-allowed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.02 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple Wallet — Próximamente
          </div>
        )}

        {/* Notificaciones — en iOS solo funciona desde la PWA instalada */}
        {isIOS && !isStandalone ? (
          notifState !== 'granted' && (
            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
              <span className="text-xl flex-shrink-0">📲</span>
              <p className="text-xs text-white/60 leading-snug">
                Para activar notificaciones, instalá la app primero:<br />
                <span className="text-white/80 font-semibold">Compartir → Agregar a inicio</span>
              </p>
            </div>
          )
        ) : (
          <>
            {'Notification' in (typeof window !== 'undefined' ? window : {}) && notifState !== 'granted' && (
              <button onClick={activarNotificaciones} disabled={notifState === 'loading' || notifState === 'denied'}
                className={`flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-full text-sm transition-colors ${
                  notifState === 'denied' ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/15 text-white hover:bg-white/20 border border-white/20'
                }`}>
                {notifState === 'loading' ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Activando...</>
                  : notifState === 'denied' ? <>🔕 Notificaciones bloqueadas</>
                  : <>🔔 Activar notificaciones de promos</>}
              </button>
            )}
            {notifState === 'granted' && (
              <p className="text-center text-sm font-semibold" style={{ color: `${textColor}cc` }}>✓ Notificaciones activadas</p>
            )}
          </>
        )}

        {/* Estadísticas */}
        <div className="bg-white/10 border border-white/10 rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Tu resumen</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{card.total_visits}</p>
              <p className="text-xs text-white/50">visitas totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{stamps}</p>
              <p className="text-xs text-white/50">sellos actuales</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/30 text-center pb-2">
          Guardá este link o escaneá el cartel NFC del local para sumar sellos.
        </p>
      </div>

      {/* Botón WhatsApp flotante */}
      {card?.loyalty_programs?.businesses?.whatsapp_number && (() => {
        const waNum = card.loyalty_programs.businesses.whatsapp_number!.replace(/\D/g, '')
        const bizName = card.loyalty_programs.businesses.name ?? 'el local'
        const href = `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola ${bizName}! Tengo una consulta.`)}`
        return (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="fixed right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-white text-sm font-semibold shadow-lg"
            style={{ bottom: showInstallBanner && !installDismissed && !isStandalone ? '7rem' : '1.5rem', background: 'linear-gradient(135deg, #25D366 0%, #20b857 100%)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultar
          </a>
        )
      })()}
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
