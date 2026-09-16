'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Status = 'loading' | 'phone-input' | 'success' | 'reward' | 'milestone' | 'error' | 'no-card' | 'cooldown' | 'unauthorized'

function WalletButton({ objectId: _ }: { objectId: string }) {
  // Abre la app de Google Wallet directamente (el pass ya está guardado ahí)
  const intentUrl = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.google.android.apps.walletnfcrel;S.browser_fallback_url=${encodeURIComponent('https://pay.google.com')};end`
  return (
    <a
      href={intentUrl}
      className="flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl hover:bg-zinc-800 transition-colors w-full"
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Abrir Google Wallet
    </a>
  )
}

function StampContent() {
  const params = useSearchParams()
  const router = useRouter()
  const programId = params.get('program')
  const cardId = params.get('card')

  const [status, setStatus] = useState<Status>('loading')
  const [stamps, setStamps] = useState(0)
  const [stampsGoal, setStampsGoal] = useState(10)
  const [reward, setReward] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [milestoneLabel, setMilestoneLabel] = useState('')
  const [resolvedCardId, setResolvedCardId] = useState<string | null>(cardId)
  const [phone, setPhone] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [walletObjectId, setWalletObjectId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuthAndStamp() {
      if (!programId) { setStatus('error'); return }

      // Verificar sesión — si está logueado (negocio) se usa token, si no (cliente con NFC) se sella sin auth
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setAccessToken(session.access_token)
        if (!cardId) {
          // Revisar si tenemos una tarjeta guardada para este programa
          const savedCardId = localStorage.getItem(`calificar_card_${programId}`)
          if (savedCardId) { doStamp(savedCardId, session.access_token); return }
          setStatus('phone-input'); return
        }
        doStamp(cardId, session.access_token)
      } else {
        // Cliente sin sesión: revisar localStorage antes de pedir teléfono
        if (!cardId) {
          const savedCardId = localStorage.getItem(`calificar_card_${programId}`)
          if (savedCardId) { doStamp(savedCardId); return }
          setStatus('phone-input'); return
        }
        doStamp(cardId)
      }
    }
    checkAuthAndStamp()
  }, [programId, cardId])

  async function doStamp(cid: string, token?: string) {
    setStatus('loading')
    const tok = token ?? accessToken
    try {
      const res = await fetch('/api/fidelizacion/stamp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tok ? { 'Authorization': `Bearer ${tok}` } : {}),
        },
        body: JSON.stringify({ card_id: cid, program_id: programId, registered_by: tok ? 'manual' : 'nfc' }),
      })
      const data = await res.json()
      if (data.cooldown) { if (data.wallet_object_id) setWalletObjectId(data.wallet_object_id); setStatus('cooldown'); return }
      if (res.status === 401) { setStatus('unauthorized'); return }
      if (data.error) { setStatus('error'); return }
      setStamps(data.stamps)
      setStampsGoal(data.stamps_goal)
      setResolvedCardId(cid)
      if (data.wallet_object_id) setWalletObjectId(data.wallet_object_id)
      // Guardar card_id en localStorage para próximas visitas
      if (programId) localStorage.setItem(`calificar_card_${programId}`, cid)
      if (data.goal_reached) {
        setReward(data.reward ?? '¡Premio!')
        setCouponCode(data.coupon_code ?? '')
        setStatus('reward')
      } else if (data.milestone_reached) {
        setMilestoneLabel(data.milestone_label ?? '¡Descuento ganado!')
        setCouponCode(data.coupon_code ?? '')
        setStatus('milestone')
      } else {
        setStatus('success')
      }
    } catch {
      setStatus('error')
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim() || !programId) return
    setPhoneLoading(true)
    setPhoneError('')

    const res = await fetch(`/api/fidelizacion/card-by-phone?program_id=${programId}&phone=${encodeURIComponent(phone.trim())}`)
    const data = await res.json()
    setPhoneLoading(false)

    if (!data.found) {
      setPhoneError('No encontramos tu tarjeta con ese número. ¿Ya te registraste?')
      return
    }
    doStamp(data.card.id, accessToken ?? undefined)
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Registrando sello...</p>
        </div>
      )}

      {status === 'phone-input' && (
        <div className="flex flex-col items-center gap-5 max-w-xs w-full">
          <div className="text-5xl">📱</div>
          <h1 className="text-2xl font-extrabold text-zinc-900">¿Cuál es tu número?</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Ingresá el teléfono con el que te registraste para sumar tu sello.
          </p>
          <form onSubmit={handlePhoneSubmit} className="w-full flex flex-col gap-3">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ej: 1123456789"
              className="w-full border-2 border-zinc-200 focus:border-violet-400 rounded-2xl px-4 py-3.5 text-center text-lg font-semibold focus:outline-none transition-colors"
              autoFocus
            />
            {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
            <button
              type="submit"
              disabled={phoneLoading || !phone.trim()}
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-50"
            >
              {phoneLoading ? 'Buscando...' : 'Sumar sello →'}
            </button>
          </form>
          <Link
            href={`/fidelizacion/unirse?program=${programId}`}
            className="text-zinc-400 text-xs hover:text-zinc-600 transition-colors"
          >
            No tengo tarjeta todavía → Registrarme gratis
          </Link>
        </div>
      )}

      {status === 'success' && (() => {
        const remaining = stampsGoal - stamps
        const almostThere = remaining <= 2
        return (
          <div className="flex flex-col items-center gap-5 max-w-xs w-full">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${almostThere ? 'bg-amber-100 animate-pulse' : 'bg-violet-100'}`}>
              {almostThere ? '🔥' : '✅'}
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 text-center">
              {almostThere ? `¡Te falta${remaining === 1 ? '' : 'n'} ${remaining}!` : '¡Sello sumado!'}
            </h1>
            {almostThere && (
              <p className="text-amber-600 font-semibold text-sm text-center animate-pulse">
                Estás muy cerca de tu premio 🎁
              </p>
            )}
            <div className="w-full">
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>{stamps} sellos</span>
                <span>Meta: {stampsGoal}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${almostThere ? 'bg-amber-500' : 'bg-violet-600'}`}
                  style={{ width: `${Math.min((stamps / stampsGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-zinc-500 mt-3 text-center">
                Te faltan <strong className={almostThere ? 'text-amber-600' : 'text-violet-700'}>{remaining}</strong> sellos para tu premio
              </p>
            </div>
            <Link
              href={`/fidelizacion/tarjeta?card=${resolvedCardId}&program=${programId}`}
              className="text-violet-600 text-sm font-semibold underline underline-offset-2"
            >
              Ver mi tarjeta →
            </Link>
            {walletObjectId && <WalletButton objectId={walletObjectId} />}
          </div>
        )
      })()}

      {status === 'milestone' && (
        <div className="flex flex-col items-center gap-5 max-w-xs w-full text-center">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
            }
            .confetti-piece { animation: confetti-fall 1.2s ease-in forwards; }
          `}</style>
          <div className="relative">
            <div className="text-7xl">🎁</div>
            <div className="absolute -top-2 left-0 right-0 flex justify-around pointer-events-none">
              {['🎊','⭐','✨','🎉','🎊'].map((e, i) => (
                <span key={i} className="confetti-piece text-lg" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900">¡Ganaste un descuento!</h1>
          <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl px-6 py-4 w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1">Tu descuento</p>
            <p className="text-lg font-bold text-zinc-900">{milestoneLabel}</p>
          </div>
          {couponCode && (
            <div className="bg-zinc-900 rounded-2xl px-6 py-4 w-full">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Código de descuento</p>
              <p className="text-xl font-mono font-extrabold text-white tracking-widest">{couponCode}</p>
              <p className="text-xs text-zinc-500 mt-1">Mostralo al encargado — un solo uso</p>
            </div>
          )}
          <p className="text-zinc-500 text-sm">Tu tarjeta se reinició. ¡Seguí acumulando sellos!</p>
          <Link
            href={`/fidelizacion/tarjeta?card=${resolvedCardId}&program=${programId}`}
            className="text-violet-600 text-sm font-semibold underline underline-offset-2"
          >
            Ver mi tarjeta →
          </Link>
          {walletObjectId && <WalletButton objectId={walletObjectId} />}
        </div>
      )}

      {status === 'reward' && (
        <div className="flex flex-col items-center gap-5 max-w-xs w-full text-center">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
            }
            .confetti-piece { animation: confetti-fall 1.2s ease-in forwards; }
          `}</style>
          <div className="relative">
            <div className="text-7xl">🏆</div>
            <div className="absolute -top-2 left-0 right-0 flex justify-around pointer-events-none">
              {['🎊','⭐','🎉','✨','🎊'].map((e, i) => (
                <span key={i} className="confetti-piece text-lg" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900">¡Completaste la tarjeta!</h1>
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl px-6 py-4 w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Tu premio</p>
            <p className="text-lg font-bold text-zinc-900">{reward}</p>
          </div>
          {couponCode && (
            <div className="bg-zinc-900 rounded-2xl px-6 py-4 w-full">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Código de canje</p>
              <p className="text-xl font-mono font-extrabold text-white tracking-widest">{couponCode}</p>
              <p className="text-xs text-zinc-500 mt-1">Mostralo al encargado — un solo uso</p>
            </div>
          )}
          <p className="text-zinc-500 text-sm">Tu tarjeta fue reiniciada. ¡A juntar más sellos!</p>
          {walletObjectId && <WalletButton objectId={walletObjectId} />}
        </div>
      )}

      {status === 'cooldown' && (
        <div className="flex flex-col items-center gap-4 max-w-xs w-full">
          <div className="text-5xl">⏳</div>
          <h1 className="text-xl font-bold text-zinc-900">Ya sumaste un sello hoy</h1>
          <p className="text-zinc-500 text-sm text-center">Podés sumar un sello por visita. Volvé mañana o pedile al encargado que te lo sume desde el panel.</p>
          {walletObjectId && <WalletButton objectId={walletObjectId} />}
        </div>
      )}

      {status === 'unauthorized' && (
        <div className="flex flex-col items-center gap-4 max-w-xs">
          <div className="text-5xl">🔒</div>
          <h1 className="text-xl font-bold text-zinc-900">Sin permisos</h1>
          <p className="text-zinc-500 text-sm">Solo el dueño o encargado del negocio puede sellar tarjetas.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 max-w-xs">
          <div className="text-5xl">😕</div>
          <h1 className="text-xl font-bold text-zinc-900">Algo salió mal</h1>
          <p className="text-zinc-500 text-sm">No pudimos registrar tu sello. Avisale al encargado.</p>
        </div>
      )}
    </main>
  )
}

export default function StampPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </main>
    }>
      <StampContent />
    </Suspense>
  )
}
