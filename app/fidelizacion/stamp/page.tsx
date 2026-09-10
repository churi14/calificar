'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Status = 'loading' | 'phone-input' | 'success' | 'reward' | 'error' | 'no-card' | 'cooldown'

function StampContent() {
  const params = useSearchParams()
  const programId = params.get('program')
  const cardId = params.get('card')

  const [status, setStatus] = useState<Status>('loading')
  const [stamps, setStamps] = useState(0)
  const [stampsGoal, setStampsGoal] = useState(10)
  const [reward, setReward] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [resolvedCardId, setResolvedCardId] = useState<string | null>(cardId)
  const [phone, setPhone] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  useEffect(() => {
    if (!programId) { setStatus('error'); return }
    if (!cardId) { setStatus('phone-input'); return }
    doStamp(cardId)
  }, [programId, cardId])

  async function doStamp(cid: string) {
    setStatus('loading')
    try {
      const res = await fetch('/api/fidelizacion/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cid, program_id: programId, registered_by: 'nfc' }),
      })
      const data = await res.json()
      if (data.cooldown) { setStatus('cooldown'); return }
      if (data.error) { setStatus('error'); return }
      setStamps(data.stamps)
      setStampsGoal(data.stamps_goal)
      setResolvedCardId(cid)
      if (data.goal_reached) {
        setReward(data.reward ?? '¡Premio!')
        setCouponCode(data.coupon_code ?? '')
        setStatus('reward')
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
    doStamp(data.card.id)
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
          </div>
        )
      })()}

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
        </div>
      )}

      {status === 'cooldown' && (
        <div className="flex flex-col items-center gap-4 max-w-xs">
          <div className="text-5xl">⏳</div>
          <h1 className="text-xl font-bold text-zinc-900">Ya sumaste un sello hoy</h1>
          <p className="text-zinc-500 text-sm">Podés sumar un sello por visita. Volvé mañana o pedile al encargado que te lo sume desde el panel.</p>
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
