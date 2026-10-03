'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

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
  error?: string
  cooldown?: boolean
  next_available?: string
}

type CardStatus = {
  found: boolean
  card?: { id: string; name: string; stamps: number; total_visits: number }
  program?: { name: string; stamps_goal: number; reward_description: string; color_primary: string; business_name: string }
  active_coupons?: { id: string; coupon_code: string | null; note: string | null; created_at: string }[]
}

function SelfStampContent() {
  const { programId } = useParams<{ programId: string }>()
  const searchParams = useSearchParams()
  const stampToken = searchParams.get('t') ?? undefined
  const [tab, setTab] = useState<'sello' | 'ver'>('sello')

  // ── Tab Sello ──
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [dni, setDni] = useState('')
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [result, setResult] = useState<Result | null>(null)
  const [needsName, setNeedsName] = useState(false)

  // ── Tab Ver ──
  const [viewPhone, setViewPhone] = useState('')
  const [viewDni, setViewDni] = useState('')
  const [viewMode, setViewMode] = useState<'phone' | 'dni'>('phone')
  const [viewStep, setViewStep] = useState<'form' | 'loading' | 'result'>('form')
  const [viewStatus, setViewStatus] = useState<CardStatus | null>(null)

  async function submit() {
    if (!phone.trim()) return
    if (needsName && !name.trim()) return
    setStep('loading')
    const res = await fetch('/api/fidelizacion/self-stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: programId, phone: phone.trim(), name: name.trim() || undefined, dni: dni.trim() || undefined, token: stampToken }),
    })
    const data: Result = await res.json()
    if (data.is_new && !name.trim() && res.ok) {
      setNeedsName(true)
      setStep('form')
      return
    }
    setResult(data)
    setStep('result')
  }

  function reset() {
    setPhone(''); setName(''); setDni(''); setResult(null); setStep('form'); setNeedsName(false)
  }

  async function viewCard() {
    const query = viewMode === 'phone' ? viewPhone.trim() : viewDni.trim()
    if (!query) return
    setViewStep('loading')
    const param = viewMode === 'phone'
      ? `phone=${encodeURIComponent(query)}`
      : `dni=${encodeURIComponent(query)}`
    const res = await fetch(`/api/fidelizacion/card-status?program_id=${programId}&${param}`)
    const data: CardStatus = await res.json()
    setViewStatus(data)
    setViewStep('result')
  }

  function resetView() {
    setViewPhone(''); setViewDni(''); setViewStatus(null); setViewStep('form')
  }

  // ── Resultado sello ───────────────────────────────────────────────────────
  const stampResult = step === 'result' && result ? (
    result.error && !result.success ? (
      <Screen>
        <div className="text-center">
          <div className="text-6xl mb-6">{result.cooldown ? '⏳' : '❌'}</div>
          <h1 className="text-2xl font-extrabold text-zinc-900 mb-3">
            {result.cooldown ? 'Ya sellaste hoy' : 'Algo salió mal'}
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-2">{result.error}</p>
          {result.next_available && (
            <p className="text-zinc-400 text-xs">
              Podés sellar de nuevo a las{' '}
              {new Date(result.next_available).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <div className="flex gap-3 mt-8 justify-center">
            <button onClick={reset} className="px-6 py-3 rounded-2xl bg-zinc-100 text-zinc-700 font-semibold text-sm">
              Volver
            </button>
            <button onClick={() => { reset(); setTab('ver') }} className="px-6 py-3 rounded-2xl bg-violet-100 text-violet-700 font-semibold text-sm">
              Ver mis sellos
            </button>
          </div>
        </div>
      </Screen>
    ) : result.goal_reached ? (
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
    ) : result.milestone_reached ? (
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
    ) : (
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
  ) : null

  if (stampResult) return stampResult

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

  // ── Vista "Ver mis sellos" resultado ─────────────────────────────────────
  if (tab === 'ver' && viewStep === 'loading') {
    return (
      <Screen>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Buscando tu tarjeta…</p>
        </div>
      </Screen>
    )
  }

  if (tab === 'ver' && viewStep === 'result' && viewStatus) {
    if (!viewStatus.found) {
      return (
        <Screen>
          <div className="text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h1 className="text-xl font-extrabold text-zinc-900 mb-2">No encontramos tu tarjeta</h1>
            <p className="text-zinc-500 text-sm mb-6">No hay ninguna tarjeta registrada con ese número. ¿Querés crear una?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={resetView} className="px-5 py-3 rounded-2xl bg-zinc-100 text-zinc-700 font-semibold text-sm">
                Volver
              </button>
              <button onClick={() => { resetView(); setTab('sello'); if (viewMode === 'phone') setPhone(viewPhone) }} className="px-5 py-3 rounded-2xl font-bold text-white text-sm" style={{ background: '#7C3AED' }}>
                Registrarme
              </button>
            </div>
          </div>
        </Screen>
      )
    }

    const { card, program, active_coupons } = viewStatus
    const color = program?.color_primary ?? '#7C3AED'

    return (
      <Screen>
        <div>
          {/* Header tarjeta */}
          <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
            <p className="text-xs font-semibold opacity-70 mb-0.5">{program?.business_name}</p>
            <p className="font-extrabold text-lg mb-4">{card?.name}</p>
            <StampProgress stamps={card?.stamps ?? 0} goal={program?.stamps_goal ?? 10} white />
            <p className="text-xs opacity-70 mt-3">
              {card?.stamps} de {program?.stamps_goal} sellos · {(program?.stamps_goal ?? 0) - (card?.stamps ?? 0)} para tu premio
            </p>
          </div>

          {/* Premio */}
          <div className="bg-zinc-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Premio al completar</p>
            <p className="text-sm font-semibold text-zinc-800">🎁 {program?.reward_description}</p>
          </div>

          {/* Cupones activos */}
          {(active_coupons?.length ?? 0) > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cupones activos</p>
              {active_coupons!.map(c => (
                <div key={c.id} className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-violet-500 font-semibold">{c.note}</p>
                  <p className="font-mono font-extrabold text-violet-800 text-lg tracking-widest">{c.coupon_code}</p>
                  <p className="text-[10px] text-violet-400 mt-0.5">Mostralo al local</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-400 text-center mb-4">
            {card?.total_visits} visita{card?.total_visits !== 1 ? 's' : ''} en total
          </p>

          <button onClick={resetView} className="w-full py-3 rounded-2xl bg-zinc-100 text-zinc-700 font-semibold text-sm">
            Buscar otro número
          </button>
        </div>
      </Screen>
    )
  }

  // ── Formulario principal ──────────────────────────────────────────────────
  return (
    <Screen>
      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => setTab('sello')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'sello' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
        >
          ⚡ Cargar sello
        </button>
        <button
          onClick={() => setTab('ver')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'ver' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
        >
          🃏 Ver mis sellos
        </button>
      </div>

      {tab === 'sello' ? (
        <>
          <div className="text-center mb-6">
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
                  required
                  className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
                />
                <p className="text-xs text-zinc-400 mt-1">Obligatorio — así te reconocemos en el local.</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tu teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Ej: 1130001234"
                autoFocus={!needsName}
                className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
              />
            </div>

            {/* DNI opcional */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                DNI <span className="font-normal normal-case text-zinc-400">(opcional)</span>
              </label>
              <input
                type="number"
                value={dni}
                onChange={e => setDni(e.target.value)}
                placeholder="Ej: 38500000"
                className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
              />
              <div className="mt-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
                <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Tu tarjeta está asociada a tu número de teléfono. Si lo cambiás o perdés el celular, <strong>perdés el acceso</strong>. Con el DNI podés recuperarla sin importar el teléfono.
                </p>
              </div>
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
        </>
      ) : (
        <>
          <div className="text-center mb-5">
            <div className="text-5xl mb-3">🃏</div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Ver mis sellos</h1>
            <p className="text-zinc-500 text-sm mt-1">Buscá tu tarjeta por teléfono o DNI.</p>
          </div>

          {/* Selector teléfono / DNI */}
          <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 mb-4">
            <button
              onClick={() => setViewMode('phone')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'phone' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
            >
              📱 Teléfono
            </button>
            <button
              onClick={() => setViewMode('dni')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'dni' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
            >
              🪪 DNI
            </button>
          </div>

          <div className="space-y-3">
            {viewMode === 'phone' ? (
              <input
                type="tel"
                value={viewPhone}
                onChange={e => setViewPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && viewCard()}
                placeholder="Ej: 1130001234"
                autoFocus
                className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
              />
            ) : (
              <>
                <input
                  type="number"
                  value={viewDni}
                  onChange={e => setViewDni(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && viewCard()}
                  placeholder="Ej: 38500000"
                  autoFocus
                  className="w-full px-4 py-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-lg placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
                />
                <p className="text-xs text-zinc-400 text-center">Solo funciona si registraste tu DNI al unirte.</p>
              </>
            )}

            <button
              onClick={viewCard}
              disabled={viewMode === 'phone' ? !viewPhone.trim() : !viewDni.trim()}
              className="w-full py-4 rounded-2xl font-extrabold text-lg text-white transition-all disabled:opacity-40"
              style={{ background: '#7C3AED' }}
            >
              Ver mi tarjeta
            </button>
          </div>
        </>
      )}
    </Screen>
  )
}

export default function SelfStampPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    }>
      <SelfStampContent />
    </Suspense>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        {children}
      </div>
    </div>
  )
}

function StampProgress({ stamps, goal, white }: { stamps: number; goal: number; white?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {Array.from({ length: goal }).map((_, i) => (
        <div
          key={i}
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all ${
            i < stamps
              ? white
                ? 'border-white bg-white/30 text-white'
                : 'border-violet-500 bg-violet-500 text-white'
              : white
                ? 'border-white/40 bg-white/10 text-white/40'
                : 'border-zinc-200 bg-zinc-50 text-zinc-300'
          }`}
        >
          {i < stamps ? '★' : '☆'}
        </div>
      ))}
    </div>
  )
}
