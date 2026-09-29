'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

type Result = {
  success: boolean
  is_new?: boolean
  client_name?: string
  stamps?: number
  stamps_goal?: number
  goal_reached?: boolean
  reward?: string | null
  coupon_code?: string | null
  milestone_reached?: boolean
  milestone_label?: string | null
  // error
  error?: string
  cooldown?: boolean
  next_available?: string
}

export default function SelfStampPage() {
  const { programId } = useParams<{ programId: string }>()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [result, setResult] = useState<Result | null>(null)
  const [needsName, setNeedsName] = useState(false)

  async function submit() {
    if (!phone.trim()) return
    setStep('loading')
    const res = await fetch('/api/fidelizacion/self-stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: programId, phone: phone.trim(), name: name.trim() || undefined }),
    })
    const data: Result = await res.json()
    if (data.is_new && !name.trim() && res.ok) {
      // Primera vez y no ingresó nombre — pedirlo
      setNeedsName(true)
      setStep('form')
      return
    }
    setResult(data)
    setStep('result')
  }

  function reset() {
    setPhone(''); setName(''); setResult(null); setStep('form'); setNeedsName(false)
  }

  // ── Pantalla de resultado ─────────────────────────────────────────────────
  if (step === 'result' && result) {
    if (result.error && !result.success) {
      const isCooldown = result.cooldown
      return (
        <Screen>
          <div className="text-center">
            <div className="text-6xl mb-6">{isCooldown ? '⏳' : '❌'}</div>
            <h1 className="text-2xl font-extrabold text-zinc-900 mb-3">
              {isCooldown ? 'Ya sellaste hoy' : 'Algo salió mal'}
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-2">{result.error}</p>
            {result.next_available && (
              <p className="text-zinc-400 text-xs">
                Podés sellar de nuevo a las{' '}
                {new Date(result.next_available).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            <button onClick={reset} className="mt-8 px-6 py-3 rounded-2xl bg-zinc-100 text-zinc-700 font-semibold text-sm">
              Volver
            </button>
          </div>
        </Screen>
      )
    }

    if (result.goal_reached) {
      return (
        <Screen>
          <div className="text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-2xl font-extrabold text-zinc-900 mb-2">¡Completaste tu tarjeta!</h1>
            <p className="text-zinc-600 mb-4">Tu premio: <strong>{result.reward}</strong></p>
            {result.coupon_code && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl px-6 py-4 mb-6 text-center">
                <p className="text-xs text-violet-500 font-semibold uppercase tracking-wider mb-1">Tu cupón</p>
                <p className="font-mono font-extrabold text-violet-800 text-2xl tracking-widest">{result.coupon_code}</p>
                <p className="text-xs text-violet-400 mt-1">Mostralo al local para canjearlo</p>
              </div>
            )}
            <p className="text-zinc-400 text-sm">Tu tarjeta se reinició. ¡Seguí juntando!</p>
          </div>
        </Screen>
      )
    }

    if (result.milestone_reached) {
      return (
        <Screen>
          <div className="text-center">
            <div className="text-7xl mb-6">⭐</div>
            <h1 className="text-2xl font-extrabold text-zinc-900 mb-2">¡Sello #{result.stamps! + 1} cargado!</h1>
            <p className="text-zinc-600 mb-4">Alcanzaste un hito: <strong>{result.milestone_label}</strong></p>
            {result.coupon_code && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-4">
                <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">Cupón intermedio</p>
                <p className="font-mono font-extrabold text-amber-800 text-2xl tracking-widest">{result.coupon_code}</p>
              </div>
            )}
            <StampProgress stamps={result.stamps!} goal={result.stamps_goal!} />
          </div>
        </Screen>
      )
    }

    return (
      <Screen>
        <div className="text-center">
          <div className="text-7xl mb-4">✅</div>
          <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">
            {result.is_new ? `¡Bienvenido${result.client_name ? `, ${result.client_name}` : ''}!` : '¡Sello cargado!'}
          </h1>
          <p className="text-zinc-500 text-sm mb-6">
            {result.is_new ? 'Tu tarjeta fue creada y ya tiene tu primer sello.' : `Tenés ${result.stamps} de ${result.stamps_goal} sellos.`}
          </p>
          <StampProgress stamps={result.stamps!} goal={result.stamps_goal!} />
          <p className="text-xs text-zinc-400 mt-4">
            Te quedan <strong>{result.stamps_goal! - result.stamps!}</strong> sellos para tu premio
          </p>
        </div>
      </Screen>
    )
  }

  // ── Pantalla loading ──────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <Screen>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Cargando sello…</p>
        </div>
      </Screen>
    )
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <Screen>
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎴</div>
        <h1 className="text-2xl font-extrabold text-zinc-900">¡Sumá tu sello!</h1>
        <p className="text-zinc-500 text-sm mt-1">Ingresá tu número para registrar tu visita.</p>
      </div>

      <div className="space-y-3">
        {needsName && (
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tu nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="¿Cómo te llamás?"
              autoFocus
              className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
            />
            <p className="text-xs text-zinc-400 mt-1">Solo la primera vez que usás la tarjeta.</p>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tu teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Ej: 1130001234"
            autoFocus={!needsName}
            className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
          />
        </div>

        <button
          onClick={submit}
          disabled={!phone.trim()}
          className="w-full py-4 rounded-2xl font-extrabold text-lg text-white transition-all disabled:opacity-40 mt-2"
          style={{ background: '#7C3AED' }}
        >
          ⚡ Cargar sello
        </button>
      </div>

      <p className="text-center text-xs text-zinc-400 mt-6">
        Máximo 1 sello cada 4 horas por número.
      </p>
    </Screen>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        {children}
      </div>
    </div>
  )
}

function StampProgress({ stamps, goal }: { stamps: number; goal: number }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {Array.from({ length: goal }).map((_, i) => (
        <div
          key={i}
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all ${
            i < stamps
              ? 'border-violet-500 bg-violet-500 text-white'
              : 'border-zinc-200 bg-zinc-50 text-zinc-300'
          }`}
        >
          {i < stamps ? '★' : '☆'}
        </div>
      ))}
    </div>
  )
}
