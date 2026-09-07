'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Status = 'loading' | 'success' | 'reward' | 'error' | 'no-card'

function StampContent() {
  const params = useSearchParams()
  const router = useRouter()
  const programId = params.get('program')
  const cardId = params.get('card')

  const [status, setStatus] = useState<Status>('loading')
  const [stamps, setStamps] = useState(0)
  const [stampsGoal, setStampsGoal] = useState(10)
  const [reward, setReward] = useState('')

  useEffect(() => {
    if (!programId) { setStatus('error'); return }
    if (!cardId) { setStatus('no-card'); return }

    fetch('/api/fidelizacion/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId, program_id: programId, registered_by: 'nfc' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStatus('error'); return }
        setStamps(data.stamps)
        setStampsGoal(data.stamps_goal)
        if (data.goal_reached) {
          setReward(data.reward ?? '¡Premio!')
          setStatus('reward')
        } else {
          setStatus('success')
        }
      })
      .catch(() => setStatus('error'))
  }, [programId, cardId])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Registrando sello...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-5 max-w-xs">
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center text-4xl">
            ✅
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900">¡Sello sumado!</h1>

          {/* Progreso visual */}
          <div className="w-full">
            <div className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>{stamps} sellos</span>
              <span>Meta: {stampsGoal}</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3">
              <div
                className="bg-violet-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stamps / stampsGoal) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-zinc-500 mt-3">
              Te faltan <strong className="text-violet-700">{stampsGoal - stamps}</strong> sellos para tu premio
            </p>
          </div>

          <Link
            href={`/fidelizacion/tarjeta?card=${cardId}&program=${programId}`}
            className="text-violet-600 text-sm font-semibold underline underline-offset-2"
          >
            Ver mi tarjeta →
          </Link>
        </div>
      )}

      {status === 'reward' && (
        <div className="flex flex-col items-center gap-5 max-w-xs">
          <div className="text-6xl animate-bounce">🎉</div>
          <h1 className="text-2xl font-extrabold text-zinc-900">¡Llegaste a la meta!</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Tu premio</p>
            <p className="text-lg font-bold text-zinc-900">{reward}</p>
          </div>
          <p className="text-zinc-500 text-sm">Mostrá esta pantalla al encargado para canjear tu premio.</p>
          <p className="text-xs text-zinc-400">Tu tarjeta fue reiniciada. ¡A juntar más sellos!</p>
        </div>
      )}

      {status === 'no-card' && (
        <div className="flex flex-col items-center gap-5 max-w-xs">
          <div className="text-5xl">👋</div>
          <h1 className="text-2xl font-extrabold text-zinc-900">¡Sumate al programa!</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Todavía no tenés tu tarjeta de fidelidad. Registrate gratis y empezá a juntar sellos hoy.
          </p>
          <Link
            href={`/fidelizacion/unirse?program=${programId}`}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-full text-sm transition-colors"
          >
            Crear mi tarjeta gratis
          </Link>
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
