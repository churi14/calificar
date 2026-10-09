'use client'

/**
 * IOSPWAPrompt — maneja el flujo completo de iOS:
 *
 * Caso A (iOS + NO standalone):
 *   Muestra banner de instalación con instrucciones según el browser:
 *   - Safari: compartir desde barra inferior
 *   - Chrome (CriOS): compartir desde barra superior
 *
 * Caso B (iOS + standalone + sin permiso de notificaciones):
 *   Muestra botón para activar notificaciones push.
 *   En iOS las notificaciones SOLO están disponibles en modo PWA standalone.
 */

import { useState, useEffect } from 'react'

interface Props {
  programId: string
  cardId: string | null
  color: string
  businessName: string
  onNotifGranted?: () => void
  onDismiss?: () => void
}

type Browser = 'safari' | 'chrome' | 'other'

function detectIOSBrowser(): Browser {
  const ua = navigator.userAgent
  if (/CriOS/i.test(ua)) return 'chrome'
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'safari'
  return 'other'
}

export default function IOSPWAPrompt({ programId, cardId, color, businessName, onNotifGranted, onDismiss }: Props) {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [browser, setBrowser] = useState<Browser>('safari')
  const [dismissed, setDismissed] = useState(false)
  const [notifState, setNotifState] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle')
  const [step, setStep] = useState<1 | 2>(1) // paso 1 = instrucciones, paso 2 = confirmación

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsIOS(ios)
    setIsStandalone(standalone)
    if (ios) setBrowser(detectIOSBrowser())

    // Chequear permiso y sincronizar suscripción con la DB si es necesario
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifState('granted')
      // Re-suscribir silenciosamente si la suscripción no está en la DB
      if (cardId && 'serviceWorker' in navigator && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        navigator.serviceWorker.ready
          .then(async reg => {
            let sub = await reg.pushManager.getSubscription()
            if (!sub) {
              const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
              const padding = '='.repeat((4 - (vapidKey.length % 4)) % 4)
              const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/')
              const raw = window.atob(base64)
              const key = Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
              sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
            }
            await fetch('/api/fidelizacion/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ card_id: cardId, program_id: programId, subscription: sub.toJSON() }),
            })
          })
          .catch(() => {})
      }
    }

    // Si ya descartó el banner esta sesión, no mostrarlo
    if (sessionStorage.getItem(`ios_prompt_dismissed_${programId}`)) {
      setDismissed(true)
    }
  }, [programId])

  function dismiss() {
    sessionStorage.setItem(`ios_prompt_dismissed_${programId}`, '1')
    setDismissed(true)
    onDismiss?.()
  }

  async function activarNotificaciones() {
    if (!cardId) return
    setNotifState('loading')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setNotifState('denied'); return }

      if (!('serviceWorker' in navigator)) { setNotifState('denied'); return }
      let reg = await navigator.serviceWorker.getRegistration(`/t/${programId}/sw.js`)
      if (!reg) reg = await navigator.serviceWorker.register(`/t/${programId}/sw.js`, { scope: `/t/${programId}/` })

      const activeReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]) as ServiceWorkerRegistration

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const padding = '='.repeat((4 - (vapidKey.length % 4)) % 4)
      const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/')
      const rawData = window.atob(base64)
      const key = Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))

      const sub = await activeReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
      await fetch('/api/fidelizacion/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, program_id: programId, subscription: sub.toJSON() }),
      })
      setNotifState('granted')
      onNotifGranted?.()
    } catch {
      setNotifState('denied')
    }
  }

  // Solo aplica a iOS
  if (!isIOS) return null

  // ─── CASO B: standalone + sin notificaciones ───────────────────────────────
  if (isStandalone) {
    if (notifState === 'granted' || notifState === 'denied') return null

    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-safe pb-6">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(160deg, #18181b 0%, #09090b 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-white text-sm leading-snug mb-1">
                  ¡No te pierdas tus premios!
                </p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Activá los avisos para enterarte al instante cuando completes tus sellos o recibas promos sorpresa de {businessName}.
                </p>
              </div>
            </div>
            <button
              onClick={activarNotificaciones}
              disabled={notifState === 'loading'}
              className="mt-4 w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: color }}
            >
              {notifState === 'loading'
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Activando...</span>
                : 'Activar Avisos'}
            </button>
            <button onClick={() => setNotifState('denied')}
              className="mt-2 w-full text-center text-xs text-white/30 py-1">
              Ahora no
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── CASO A: iOS en navegador, no instalada ────────────────────────────────
  if (dismissed) return null

  const isSafari = browser === 'safari'
  const isChrome = browser === 'chrome'
  if (!isSafari && !isChrome) return null // otros browsers iOS no soportan A2HS

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6">
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #18181b 0%, #09090b 100%)', border: '1px solid rgba(255,255,255,0.10)' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
              🎁
            </div>
            <p className="font-extrabold text-white text-sm leading-tight">
              Llevá tu tarjeta<br />en el celu
            </p>
          </div>
          <button onClick={dismiss}
            className="text-white/30 text-lg leading-none flex-shrink-0 mt-0.5 active:text-white/60">
            ✕
          </button>
        </div>

        {/* Pasos */}
        {step === 1 && (
          <div className="px-5 pb-5">
            <div className="space-y-3 mb-4">
              {/* Paso 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: color, color: '#fff' }}>
                  1
                </div>
                <p className="text-sm text-white/70 leading-snug">
                  {isSafari
                    ? <>Tocá el botón de <strong className="text-white">Compartir</strong> en la barra de abajo <span className="text-base">⬆️</span></>
                    : <>Tocá el botón de <strong className="text-white">Compartir</strong> arriba a la derecha <span className="text-base">⬆️</span></>
                  }
                </p>
              </div>
              {/* Paso 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: color, color: '#fff' }}>
                  2
                </div>
                <p className="text-sm text-white/70 leading-snug">
                  Deslizá hacia abajo y elegí <strong className="text-white">"Agregar a inicio"</strong> <span className="text-base">➕</span>
                </p>
              </div>
            </div>

            {/* Botón "Ya lo hice" */}
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: color }}
            >
              Ya lo hice →
            </button>

            {/* Indicador de browser */}
            <p className="text-center text-xs text-white/25 mt-3">
              {isSafari ? 'Safari en iPhone' : 'Chrome en iPhone'}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="px-5 pb-5 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-sm font-bold text-white mb-1">¡Listo!</p>
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              Abrí la app desde tu pantalla de inicio para sumar tu primer sello.
            </p>
            <button
              onClick={dismiss}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: color }}
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
