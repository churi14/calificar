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
  // ── montado en cliente (evita SSR mismatch) ────────────────────────────────
  const [mounted, setMounted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [browser, setBrowser] = useState<Browser>('safari')
  const [dismissed, setDismissed] = useState(false)
  const [notifState, setNotifState] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle')
  const [notifSupported, setNotifSupported] = useState(true) // false → iOS < 16.4
  const [step, setStep] = useState<1 | 2>(1)

  useEffect(() => {
    setMounted(true)

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    // standalone: navigator.standalone (Safari) o display-mode (Chrome iOS)
    const standalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches
    setIsIOS(ios)
    setIsStandalone(standalone)
    if (ios) setBrowser(detectIOSBrowser())

    // Verificar soporte real de notificaciones push (requiere iOS 16.4+ en standalone)
    const hasNotifSupport = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setNotifSupported(hasNotifSupport)

    // Inicializar estado según permiso actual
    if (hasNotifSupport) {
      if (Notification.permission === 'granted') {
        setNotifState('granted')
        // Re-suscribir silenciosamente si la suscripción no está en la DB
        if (cardId && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
          navigator.serviceWorker.getRegistration(`/t/${programId}/`)
            .then(async reg => {
              if (!reg?.active) return
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
      } else if (Notification.permission === 'denied') {
        // Ya bloqueadas — mostrar estado informativo en lugar de ocultar
        setNotifState('denied')
      }
    }

    // Si ya descartó el banner esta sesión, no mostrarlo
    if (sessionStorage.getItem(`ios_prompt_dismissed_${programId}`)) {
      setDismissed(true)
    }
  }, [programId, cardId])

  function dismiss() {
    sessionStorage.setItem(`ios_prompt_dismissed_${programId}`, '1')
    setDismissed(true)
    onDismiss?.()
  }

  async function activarNotificaciones() {
    if (!cardId) return
    setNotifState('loading')

    // VAPID check ANTES de cualquier cosa
    const vapidRaw = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidRaw) {
      alert('ERROR: FALTA VAPID KEY EN EL FRONTEND\nNEXT_PUBLIC_VAPID_PUBLIC_KEY es undefined')
      setNotifState('denied'); return
    }
    alert(`VAPID OK: ${vapidRaw.slice(0, 20)}...`)

    try {
      // PASO 1: permiso
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setNotifState('denied'); return }
      alert('Paso 1: Permiso concedido ✓')

      // PASO 2: SW disponible
      if (!('serviceWorker' in navigator)) {
        alert('ERROR FATAL: serviceWorker no existe en navigator\niOS < 16.4 o contexto inseguro')
        setNotifState('denied'); return
      }

      // PASO 3: registrar SW aislado
      let reg: ServiceWorkerRegistration
      try {
        const existing = await navigator.serviceWorker.getRegistration(`/t/${programId}/`)
        if (!existing) {
          reg = await navigator.serviceWorker.register(`/t/${programId}/sw.js`, { scope: `/t/${programId}/` })
          alert(`Paso 2a: SW registrado\nscope: ${reg.scope}`)
        } else {
          reg = existing
          alert(`Paso 2a: SW ya existía\nscope: ${reg.scope}`)
        }
      } catch (e) {
        alert('ERROR FATAL: SW register falló\n' + (e instanceof Error ? e.message : String(e)))
        setNotifState('denied'); return
      }

      // PASO 4: esperar activación usando reg directamente (evita navigator.serviceWorker.ready que requiere que el SW controle la página)
      try {
        if (!reg.active) {
          const sw = reg.installing ?? reg.waiting
          if (!sw) throw new Error('No hay SW en ningún estado')
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('SW activation timeout 10s')), 10000)
            sw.addEventListener('statechange', function handler() {
              if (sw.state === 'activated') {
                clearTimeout(timeout); sw.removeEventListener('statechange', handler); resolve()
              } else if (sw.state === 'redundant') {
                clearTimeout(timeout); sw.removeEventListener('statechange', handler); reject(new Error('SW became redundant'))
              }
            })
          })
        }
        alert(`Paso 2: SW activo ✓\nscope: ${reg.scope}`)
      } catch (e) {
        alert('ERROR FATAL: SW activation falló\n' + (e instanceof Error ? e.message : String(e)))
        setNotifState('denied'); return
      }

      // PASO 5: subscribe push
      let sub: PushSubscription
      try {
        const padding = '='.repeat((4 - (vapidRaw.length % 4)) % 4)
        const base64 = (vapidRaw + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const key = Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
        alert(`Paso 3: Token generado ✓\nendpoint: ${sub.endpoint.slice(0, 60)}...`)
      } catch (e) {
        alert('ERROR FATAL: pushManager.subscribe falló\n' + (e instanceof Error ? e.message : String(e)))
        setNotifState('denied'); return
      }

      // PASO 6: guardar en DB
      let apiRes: Response
      try {
        apiRes = await fetch('/api/fidelizacion/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId, program_id: programId, subscription: sub.toJSON() }),
        })
      } catch (e) {
        alert('ERROR FATAL: fetch /push/subscribe falló (red)\n' + (e instanceof Error ? e.message : String(e)))
        setNotifState('denied'); return
      }

      if (!apiRes.ok) {
        const body = await apiRes.text().catch(() => '(no body)')
        alert(`ERROR FATAL: API respondió ${apiRes.status}\n${body}`)
        setNotifState('denied'); return
      }

      alert('Paso 4: Guardado en DB ✓ — ¡TODO OK!')
      setNotifState('granted')
      onNotifGranted?.()
    } catch (e) {
      alert('ERROR FATAL inesperado\n' + (e instanceof Error ? e.message : String(e)))
      setNotifState('denied')
    }
  }

  // Nada hasta estar montado en el cliente (evita SSR mismatch / hidratación)
  if (!mounted) return null

  // Solo aplica a iOS
  if (!isIOS) return null

  // ─── CASO B: standalone + gestión de notificaciones ──────────────────────
  if (isStandalone) {
    // Ya activadas → nada que mostrar
    if (notifState === 'granted') return null

    // Sin soporte de push (iOS < 16.4 o browser incompatible)
    if (!notifSupported) {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6">
          <div className="w-full max-w-sm rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(24,24,27,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-lg flex-shrink-0">📵</span>
            <p className="text-xs text-white/50 leading-snug">
              Tu dispositivo requiere <strong className="text-white/70">iOS 16.4+</strong> para recibir notificaciones desde la app.
            </p>
          </div>
        </div>
      )
    }

    // Permiso bloqueado por el usuario
    if (notifState === 'denied') {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6">
          <div className="w-full max-w-sm rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(24,24,27,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-lg flex-shrink-0">🔕</span>
            <p className="text-xs text-white/50 leading-snug">
              Notificaciones bloqueadas. Para activarlas: <strong className="text-white/70">Ajustes → {businessName} → Notificaciones</strong>.
            </p>
          </div>
        </div>
      )
    }

    // Estado normal: pedir permiso
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
