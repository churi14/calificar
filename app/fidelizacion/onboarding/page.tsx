'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// ─── Tracking ─────────────────────────────────────────────────────────────────
const STEP_NAMES = [
  'tipo_negocio', 'tipo_programa', 'diseno_tarjeta', 'donde_vendes',
  'datos_clientes', 'cantidad_sellos', 'premio_final', 'premios_intermedios',
  'cumpleanios', 'nombre_negocio', 'colores', 'registro',
]

function getOrCreateSessionId(): string {
  try {
    let sid = localStorage.getItem('cal_ob_session')
    if (!sid) {
      sid = crypto.randomUUID()
      localStorage.setItem('cal_ob_session', sid)
    }
    return sid
  } catch {
    return 'unknown'
  }
}

function track(step: number, event: string, data?: Record<string, unknown>) {
  const session_id = getOrCreateSessionId()
  // Fire and forget — no await, no blocker
  fetch('/api/fidelizacion/onboarding/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, step, step_name: STEP_NAMES[step], event, data }),
  }).catch(() => {})
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 12

const BUSINESS_TYPES = [
  { id: 'cafeteria',   label: 'Cafetería',          icon: '☕' },
  { id: 'restaurante', label: 'Restaurante',         icon: '🍽️' },
  { id: 'panaderia',   label: 'Panadería y postres', icon: '🥐' },
  { id: 'bar',         label: 'Bar y bebidas',       icon: '🍺' },
  { id: 'salon',       label: 'Salón y barbería',    icon: '✂️' },
  { id: 'belleza',     label: 'Belleza y spa',       icon: '💆' },
  { id: 'tienda',      label: 'Tienda y boutique',   icon: '🛍️' },
  { id: 'fitness',     label: 'Fitness y bienestar', icon: '🏋️' },
  { id: 'mascotas',    label: 'Mascotas',            icon: '🐾' },
]

const QUICK_REWARDS = ['Bebida gratis', 'Postre gratis', 'Descuento 20%', '2×1', 'Regalo sorpresa']

const COLORS = [
  { id: 'violet', label: 'Violeta', hex: '#7C3AED' },
  { id: 'navy',   label: 'Noche',   hex: '#1E293B' },
  { id: 'rose',   label: 'Rosa',    hex: '#E11D48' },
  { id: 'teal',   label: 'Verde',   hex: '#0D9488' },
  { id: 'orange', label: 'Naranja', hex: '#EA580C' },
  { id: 'blue',   label: 'Azul',    hex: '#2563EB' },
]

const STEP_META: { chip: string; est: string; icon: string }[] = [
  { chip: 'SOBRE TU NEGOCIO',   est: '~60 SEG', icon: '✦' },
  { chip: 'BUEN COMIENZO',      est: '~55 SEG', icon: '✦' },
  { chip: 'EL LOOK',            est: '~50 SEG', icon: '🎨' },
  { chip: 'TU OPERACIÓN',       est: '~45 SEG', icon: '📍' },
  { chip: 'TUS CLIENTES',       est: '~40 SEG', icon: '👥' },
  { chip: '¡GENIAL!',           est: '~35 SEG', icon: '✦' },
  { chip: 'VALE LA PENA',       est: '~30 SEG', icon: '🎁' },
  { chip: 'ESCALERA DE PREMIOS',est: '~25 SEG', icon: '🏅' },
  { chip: 'QUE VUELVAN SOLOS',  est: '~20 SEG', icon: '🎂' },
  { chip: 'DALE TU TOQUE',      est: '~15 SEG', icon: '✏️' },
  { chip: 'HAZLO TUYO',         est: '~10 SEG', icon: '🎨' },
  { chip: 'ÚLTIMO PASO',        est: '¡LISTO!', icon: '✦' },
]

// ─── Stamp Grid (step 5) ──────────────────────────────────────────────────────
function StampGrid({ total, color }: { total: number; color: string }) {
  const MAX = 12
  const demoFilled = Math.max(1, Math.floor(total * 0.35))

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
      <div className="flex justify-between text-xs text-zinc-400 mb-3 font-bold uppercase tracking-wide">
        <span>Vista previa</span>
        <span>{demoFilled} / {total}</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {Array.from({ length: MAX }).map((_, i) => {
          const visible = i < total
          const isReward = i === total - 1
          const isFilled = i < demoFilled && visible
          return (
            <div
              key={i}
              style={{
                transform: visible ? 'scale(1)' : 'scale(0)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease',
                aspectRatio: '1',
                borderRadius: '50%',
                background: isReward ? '#FEF3C7' : isFilled ? color : 'transparent',
                border: visible && !isReward && !isFilled ? '2px dashed #D4D4D8' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '12px', fontWeight: 'bold',
              }}
            >
              {visible && (isReward ? '🎁' : isFilled ? '✓' : '')}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Mini Card Preview ────────────────────────────────────────────────────────
function MiniCard({ name, color, stamps }: { name: string; color: string; stamps: number }) {
  return (
    <div className="rounded-xl p-3" style={{ background: color }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
        >
          {name ? name[0].toUpperCase() : 'C'}
        </div>
        <div>
          <p className="text-white font-extrabold text-xs leading-none truncate max-w-[80px]">
            {name || 'Tu negocio'}
          </p>
          <p className="text-white/60 text-[9px] mt-0.5">LEALTAD</p>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: Math.min(stamps, 8) }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full"
            style={{ background: i < 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 rounded-full transition-all duration-500"
          style={{ background: i <= step ? '#7C3AED' : '#E4E4E7' }}
        />
      ))}
    </div>
  )
}

// ─── Hint Footer ──────────────────────────────────────────────────────────────
function Hint({ text = '👆 Tocá uno y seguimos' }: { text?: string }) {
  return (
    <p className="text-center text-xs text-zinc-400 mt-5 font-medium">{text}</p>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [animDir, setAnimDir] = useState<'fwd' | 'back'>('fwd')

  // Track step views (drop-off detection)
  useEffect(() => {
    track(step, 'step_view')
  }, [step])

  // Form data
  const [businessType, setBusinessType] = useState('')
  const [cardDesign, setCardDesign] = useState<'template' | 'custom'>('template')
  const [locations, setLocations] = useState(1)
  const [clientData, setClientData] = useState<'basic' | 'full'>('basic')
  const [stampsGoal, setStampsGoal] = useState(8)
  const [reward, setReward] = useState('')
  const [hasMilestone, setHasMilestone] = useState(false)
  const [milestoneAt, setMilestoneAt] = useState(4)
  const [milestoneReward, setMilestoneReward] = useState('')
  const [birthdayAction, setBirthdayAction] = useState<'celebrate' | 'skip'>('skip')
  const [businessName, setBusinessName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')

  // Auth
  const [email, setEmail] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  function navigate(next: number, dir: 'fwd' | 'back' = 'fwd') {
    setAnimDir(dir)
    setAnimKey(k => k + 1)
    setStep(next)
  }

  function goBack() {
    if (step > 0) navigate(step - 1, 'back')
  }

  function next() { navigate(step + 1) }

  function saveConfig() {
    try {
      localStorage.setItem('cal_onboarding', JSON.stringify({
        businessType, cardDesign, locations, clientData,
        stampsGoal, reward,
        milestones: hasMilestone && milestoneReward
          ? [{ at: milestoneAt, label: milestoneReward }]
          : [],
        collectBirthday: clientData === 'full',
        birthdayAction,
        businessName, primaryColor,
      }))
    } catch {}
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleGoogle() {
    setAuthLoading(true)
    setAuthError('')
    track(11, 'auth_click', { method: 'google' })
    saveConfig()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/fidelizacion/onboarding/complete` },
    })
    if (error) { setAuthError(error.message); setAuthLoading(false) }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setAuthLoading(true)
    setAuthError('')
    track(11, 'auth_click', { method: 'email' })
    saveConfig()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/fidelizacion/onboarding/complete` },
    })
    setAuthLoading(false)
    if (error) setAuthError(error.message)
    else setEmailSent(true)
  }

  const meta = STEP_META[step]

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      <style>{`
        @keyframes stepIn     { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes stepInBack { from { opacity:0; transform:translateX(-28px);} to { opacity:1; transform:translateX(0); } }
        .anim-fwd  { animation: stepIn     0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
        .anim-back { animation: stepInBack 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        {step > 0 ? (
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 hover:bg-white/70 transition-colors"
            style={{ background: 'rgba(255,255,255,0.45)' }}
          >
            ←
          </button>
        ) : <div className="w-9" />}

        <Link href="/" className="text-xl font-extrabold text-zinc-900 tracking-tight">calificar</Link>

        <div className="text-right">
          <p className="text-xs font-bold" style={{ color: '#7C3AED' }}>{meta.est}</p>
          <p className="text-xs text-zinc-400 font-medium">PASO {step + 1} DE {TOTAL_STEPS}</p>
        </div>
      </header>

      {/* ── Progress ───────────────────────────────────────────────────────── */}
      <div className="px-5 pt-1 pb-4">
        <ProgressBar step={step} />
      </div>

      {/* ── Step Content ───────────────────────────────────────────────────── */}
      <div
        key={animKey}
        className={`flex-1 px-5 pb-12 ${animDir === 'fwd' ? 'anim-fwd' : 'anim-back'}`}
      >
        <div className="max-w-sm mx-auto">

          {/* ── STEP 0: Tipo de negocio ────────────────────────────────────── */}
          {step === 0 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-1">¿Qué tipo de negocio tenés?</h1>
              <p className="text-zinc-500 text-sm mb-4">Armamos tu tarjeta a medida — sellos, recompensas y todo.</p>
              <div className="flex gap-3 text-xs text-zinc-500 mb-5">
                <span className="flex items-center gap-1"><span style={{ color: '#7C3AED' }}>✓</span> 7 días gratis</span>
                <span className="flex items-center gap-1"><span style={{ color: '#7C3AED' }}>✓</span> sin tarjeta</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {BUSINESS_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setBusinessType(t.id); track(0, 'select', { value: t.id }); next() }}
                    className="bg-white rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center border-2 transition-all duration-150 hover:shadow-sm active:scale-95"
                    style={{ borderColor: businessType === t.id ? '#7C3AED' : '#E4E4E7' }}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-xs font-semibold text-zinc-700 leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setBusinessType('otro'); track(0, 'select', { value: 'otro' }); next() }}
                className="w-full bg-white border-2 border-dashed border-zinc-300 rounded-2xl p-3 flex items-center gap-3 text-left hover:border-violet-400 transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-lg flex-shrink-0">🔗</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Otro tipo de negocio</p>
                  <p className="text-xs" style={{ color: '#7C3AED' }}>Tu negocio también tiene clientes frecuentes</p>
                </div>
              </button>
              <Hint />
            </>
          )}

          {/* ── STEP 1: Cómo premiás la lealtad ───────────────────────────── */}
          {step === 1 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-1">¿Cómo premiás la lealtad?</h1>
              <p className="text-zinc-500 text-sm mb-5">Elegí una — podés cambiarla cuando quieras.</p>

              {/* Stamps card — active */}
              <button
                onClick={next}
                className="w-full bg-white rounded-2xl p-4 border-2 text-left mb-3 transition-all hover:shadow-sm active:scale-[0.99]"
                style={{ borderColor: '#7C3AED' }}
              >
                <div className="rounded-xl p-3 mb-3" style={{ background: '#7C3AED' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/25 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">C</span>
                    </div>
                    <span className="text-white font-bold text-xs">Tu negocio</span>
                    <span className="ml-auto text-white/70 text-xs uppercase tracking-wider">Lealtad</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[true, true, true, false, false, false, false, false].map((f, i) => (
                      <div key={i} className="w-6 h-6 rounded-full" style={{ background: f ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs mt-2">3 de 8 juntados</p>
                </div>
                <p className="text-sm font-extrabold text-zinc-900 mb-0.5">Tarjeta de sellos</p>
                <p className="text-xs text-zinc-500">La tarjeta de sellos que tus clientes ya conocen, ahora en su celular.</p>
              </button>

              {/* Membership — coming soon */}
              <div className="w-full bg-white/50 rounded-2xl p-4 border-2 border-zinc-200 text-left relative opacity-60">
                <div className="absolute top-3 right-3 bg-zinc-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Próximamente</div>
                <div className="rounded-xl p-3 mb-3 bg-zinc-900">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">C</span>
                    </div>
                    <span className="text-white font-bold text-xs">Tu negocio</span>
                    <span className="ml-auto bg-yellow-400 text-zinc-900 text-[9px] font-bold px-2 py-0.5 rounded-full">GOLD</span>
                  </div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Miembro desde 2025</p>
                </div>
                <p className="text-sm font-extrabold text-zinc-900 mb-0.5">Pase de membresía</p>
                <p className="text-xs text-zinc-500">Niveles, beneficios y acceso VIP para los clientes que querés consentir.</p>
              </div>
              <Hint text="👆 Tocá una opción para seguir" />
            </>
          )}

          {/* ── STEP 2: Diseño de tarjeta ──────────────────────────────────── */}
          {step === 2 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-1">¿Cómo querés que se vea tu tarjeta?</h1>
              <p className="text-zinc-500 text-sm mb-5">Tocá una — se cambia cuando quieras.</p>

              <button
                onClick={() => { setCardDesign('template'); track(2, 'select', { value: 'template' }); next() }}
                className="w-full text-left mb-3 rounded-2xl overflow-hidden border-2 transition-all hover:shadow-md active:scale-[0.99]"
                style={{ borderColor: cardDesign === 'template' ? '#7C3AED' : '#E4E4E7' }}
              >
                <div className="p-4 pb-2" style={{ background: '#7C3AED' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/25 flex items-center justify-center text-white font-bold text-xs">C</div>
                    <span className="text-white font-bold text-xs">Tu negocio</span>
                    <span className="ml-auto text-white/60 text-xs uppercase">Lealtad</span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {[true, true, true, false, false, false, false, false].map((f, i) => (
                      <div key={i} className="w-6 h-6 rounded-full" style={{ background: f ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white p-3">
                  <p className="text-sm font-extrabold text-zinc-900">Bonita y lista</p>
                  <p className="text-xs text-zinc-500">Un diseño nuestro, elegante desde el primer día.</p>
                </div>
              </button>

              <button
                onClick={() => { setCardDesign('custom'); track(2, 'select', { value: 'custom' }); next() }}
                className="w-full text-left rounded-2xl overflow-hidden border-2 border-zinc-200 transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className="p-4 pb-2" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}>
                  <div className="absolute top-2 right-2 bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">TU ARTE</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/25 flex items-center justify-center text-white font-bold text-xs">C</div>
                    <span className="text-white font-bold text-xs">Tu negocio</span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {[true, true, true, false, false, false, false, false].map((f, i) => (
                      <div key={i} className="w-6 h-6 rounded-full" style={{ background: f ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)' }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white p-3">
                  <p className="text-sm font-extrabold text-zinc-900">Exactamente como la querés</p>
                  <p className="text-xs text-zinc-500">Subís tu logo y colores — y no se parece a ninguna.</p>
                </div>
              </button>
              <Hint />
            </>
          )}

          {/* ── STEP 3: Dónde vendés ───────────────────────────────────────── */}
          {step === 3 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-1">¿Dónde vendés?</h1>
              <p className="text-zinc-500 text-sm mb-5">Elegí la que te queda. Ajustamos todo lo demás.</p>
              {[
                { n: 1,  label: 'Un local',       sub: 'Un solo lugar' },
                { n: 2,  label: 'Dos locales',    sub: '' },
                { n: 3,  label: 'Tres locales',   sub: '' },
                { n: 10, label: 'Más de tres',    sub: 'Una cadena de verdad' },
                { n: 0,  label: 'Solo en línea',  sub: 'Sin local físico' },
              ].map(opt => (
                <button
                  key={opt.n}
                  onClick={() => { setLocations(opt.n); track(3, 'select', { value: opt.n, label: opt.label }); next() }}
                  className="w-full bg-white rounded-2xl p-4 border-2 mb-2 flex items-center gap-3 text-left transition-all hover:shadow-sm active:scale-[0.99]"
                  style={{ borderColor: locations === opt.n ? '#7C3AED' : '#E4E4E7' }}
                >
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                    style={{ background: locations === opt.n ? '#7C3AED' : '#D4D4D8' }}
                  >
                    {opt.n === 10 ? '3+' : opt.n === 0 ? '📱' : opt.n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                    {opt.sub && <p className="text-xs text-zinc-500">{opt.sub}</p>}
                  </div>
                </button>
              ))}
              <Hint />
            </>
          )}

          {/* ── STEP 4: Qué querés saber de tus clientes ──────────────────── */}
          {step === 4 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-1">¿Qué querés saber de tus clientes?</h1>
              <p className="text-zinc-500 text-sm mb-5">Ejemplos — tocá el más parecido.</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Basic */}
                <button
                  onClick={() => { setClientData('basic'); track(4, 'select', { value: 'basic' }); next() }}
                  className="bg-white rounded-2xl p-4 border-2 text-left transition-all hover:shadow-sm active:scale-[0.99]"
                  style={{ borderColor: clientData === 'basic' ? '#7C3AED' : '#E4E4E7' }}
                >
                  <div className="border border-zinc-200 rounded-xl p-2 mb-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 bg-zinc-50 rounded-lg px-2 py-1.5">
                      <span className="text-zinc-400 text-xs">👤</span>
                      <span className="text-xs text-zinc-400">Nombre</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 rounded-lg px-2 py-1.5">
                      <span className="text-zinc-400 text-xs">📱</span>
                      <span className="text-xs text-zinc-400">Celular</span>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-zinc-400 mt-1.5">2 CAMPOS</div>
                    </div>
                  </div>
                  <p className="text-xs font-extrabold text-zinc-900 mb-0.5">Lo esencial</p>
                  <p className="text-xs text-zinc-500">Rápido de llenar, casi nadie lo abandona.</p>
                </button>

                {/* Full */}
                <button
                  onClick={() => { setClientData('full'); track(4, 'select', { value: 'full' }); next() }}
                  className="bg-white rounded-2xl p-4 border-2 text-left transition-all hover:shadow-sm active:scale-[0.99]"
                  style={{ borderColor: clientData === 'full' ? '#7C3AED' : '#E4E4E7' }}
                >
                  <div className="border border-zinc-200 rounded-xl p-2 mb-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 bg-zinc-50 rounded-lg px-2 py-1.5">
                      <span className="text-zinc-400 text-xs">👤</span>
                      <span className="text-xs text-zinc-400">Nombre</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 rounded-lg px-2 py-1.5">
                      <span className="text-zinc-400 text-xs">📱</span>
                      <span className="text-xs text-zinc-400">Celular</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 rounded-lg px-2 py-1.5">
                      <span className="text-xs">🎂</span>
                      <span className="text-xs text-zinc-400">Cumpleaños</span>
                    </div>
                    <div className="text-xs text-zinc-400 text-center mt-1">LOS QUE VOS QUERÁS</div>
                  </div>
                  <p className="text-xs font-extrabold text-zinc-900 mb-0.5">Quiero conocerlos</p>
                  <p className="text-xs text-zinc-500">Vos decidís qué más preguntar.</p>
                </button>
              </div>
              <Hint />
            </>
          )}

          {/* ── STEP 5: Cuántos sellos ─────────────────────────────────────── */}
          {step === 5 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-2">¿Cuántos sellos llenan la tarjeta?</h1>
              <p className="text-zinc-500 text-sm mb-6">
                De 4 a 12 funciona mejor.{' '}
                <strong style={{ color: '#7C3AED' }}>El punto dulce son 8</strong>{' '}
                — frecuente para sentirse ganable, lejano para sentirse merecido.
              </p>

              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  onClick={() => setStampsGoal(g => Math.max(4, g - 1))}
                  className="w-12 h-12 rounded-full bg-white border-2 border-zinc-200 text-xl font-bold text-zinc-600 flex items-center justify-center hover:border-violet-400 transition-colors active:scale-95"
                >−</button>
                <div
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white font-extrabold shadow-lg transition-all duration-200"
                  style={{ background: primaryColor }}
                >
                  <span className="text-3xl leading-none">{stampsGoal}</span>
                  <span className="text-[10px] font-bold opacity-70 mt-0.5">SELLOS</span>
                </div>
                <button
                  onClick={() => setStampsGoal(g => Math.min(12, g + 1))}
                  className="w-12 h-12 rounded-full bg-white border-2 border-zinc-200 text-xl font-bold text-zinc-600 flex items-center justify-center hover:border-violet-400 transition-colors active:scale-95"
                >+</button>
              </div>

              <StampGrid total={stampsGoal} color={primaryColor} />

              <button
                onClick={() => { track(5, 'step_complete', { stamps_goal: stampsGoal }); next() }}
                className="mt-5 w-full text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
                style={{ background: primaryColor }}
              >
                Se ve bien →
              </button>
            </>
          )}

          {/* ── STEP 6: Premio ─────────────────────────────────────────────── */}
          {step === 6 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-2">¿Qué reciben los frecuentes?</h1>
              <p className="text-zinc-500 text-sm mb-5">Cuando llenen su tarjeta, esto es lo que reciben.</p>

              <div
                className="rounded-2xl px-5 py-3 text-center mb-5 font-semibold text-zinc-700"
                style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' }}
              >
                <span style={{ color: primaryColor }}>{stampsGoal} sellos</span>
                {' = '}
                <span className="italic text-zinc-500">{reward || 'lo que reciben'}</span>
              </div>

              <input
                type="text"
                value={reward}
                onChange={e => setReward(e.target.value)}
                placeholder="ej. 50% en el segundo producto"
                className="w-full border-2 border-zinc-200 focus:border-violet-500 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none transition-colors mb-3 bg-white"
                autoFocus
              />

              <p className="text-xs text-zinc-400 mb-3 font-medium">O elegí uno rápido:</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {QUICK_REWARDS.map(r => (
                  <button
                    key={r}
                    onClick={() => setReward(r)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                    style={{
                      borderColor: reward === r ? primaryColor : '#E4E4E7',
                      background: reward === r ? '#EDE9FE' : 'white',
                      color: reward === r ? primaryColor : '#52525B',
                    }}
                  >{r}</button>
                ))}
              </div>

              <button
                disabled={!reward.trim()}
                onClick={() => { track(6, 'step_complete', { reward, is_quick_pick: QUICK_REWARDS.includes(reward) }); next() }}
                className="w-full text-white font-bold py-4 rounded-2xl text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
                style={{ background: primaryColor }}
              >Se ve bien →</button>
            </>
          )}

          {/* ── STEP 7: Premios intermedios ────────────────────────────────── */}
          {step === 7 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-2">¿Querés dar premios en el camino?</h1>
              <p className="text-zinc-500 text-sm mb-5">
                Por ejemplo: a la 3ª compra un 20% off, a la 5ª un 30% off — el contador se reinicia automáticamente.
              </p>

              {/* Yes option */}
              <button
                onClick={() => { setHasMilestone(true) }}
                className="w-full bg-white rounded-2xl p-4 border-2 text-left mb-3 transition-all hover:shadow-sm"
                style={{ borderColor: hasMilestone ? primaryColor : '#E4E4E7' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: hasMilestone ? '#EDE9FE' : '#F4F4F5' }}>🏅</div>
                  <div>
                    <p className="text-sm font-extrabold text-zinc-900">Sí, quiero premios intermedios</p>
                    <p className="text-xs text-zinc-500">Automatico. Tus clientes los reciben sin que vos hagas nada.</p>
                  </div>
                </div>

                {hasMilestone && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">A los</span>
                      <input
                        type="number"
                        min={1}
                        max={stampsGoal - 1}
                        value={milestoneAt}
                        onChange={e => setMilestoneAt(Number(e.target.value))}
                        className="w-16 border-2 border-zinc-200 focus:border-violet-400 rounded-xl px-2 py-1.5 text-center text-sm font-bold focus:outline-none"
                      />
                      <span className="text-xs text-zinc-500 font-medium">sellos, dales:</span>
                    </div>
                    <input
                      type="text"
                      value={milestoneReward}
                      onChange={e => setMilestoneReward(e.target.value)}
                      placeholder="ej. 20% de descuento"
                      className="w-full border-2 border-zinc-200 focus:border-violet-400 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                    <p className="text-xs text-zinc-400">Podés agregar más desde el panel después.</p>
                  </div>
                )}
              </button>

              {/* No option */}
              <button
                onClick={() => { setHasMilestone(false); track(7, 'select', { value: 'none' }); next() }}
                className="w-full bg-white/60 rounded-2xl p-4 border-2 border-zinc-200 flex items-center gap-3 text-left hover:bg-white transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-lg flex-shrink-0">🎯</div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-900">Solo el premio final</p>
                  <p className="text-xs text-zinc-500">Clásico. Un premio al completar la tarjeta.</p>
                </div>
              </button>

              {hasMilestone && (
                <button
                  onClick={next}
                  className="mt-4 w-full text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
                  style={{ background: primaryColor }}
                >
                  Se ve bien →
                </button>
              )}
            </>
          )}

          {/* ── STEP 8: Cumpleaños ─────────────────────────────────────────── */}
          {step === 8 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-2">¿Querés hacer algo especial en el cumpleaños de tus clientes?</h1>
              <p className="text-zinc-500 text-sm mb-5">Calificar lo hace por vos, todo el año — tocá uno.</p>

              {/* Yes */}
              <button
                onClick={() => { setBirthdayAction('celebrate'); track(8, 'select', { value: 'celebrate' }); next() }}
                className="w-full bg-white rounded-2xl p-4 border-2 mb-3 text-left transition-all hover:shadow-sm active:scale-[0.99]"
                style={{ borderColor: birthdayAction === 'celebrate' ? primaryColor : '#E4E4E7', borderWidth: '2px' }}
              >
                <div
                  className="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block mb-3"
                  style={{ background: primaryColor }}
                >RECOMENDADO</div>
                <div className="space-y-2 mb-3">
                  {['Nunca se te pasa un cumpleaños', 'Les avisás antes para que vengan', 'Regalo automático en su día'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                      <span style={{ color: primaryColor }}>✓</span> {feat}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-extrabold text-zinc-900">Sí, celebrarlos</p>
                <p className="text-xs text-zinc-500">Automático. Vos solo entregás el regalo.</p>
              </button>

              {/* No */}
              <button
                onClick={() => { setBirthdayAction('skip'); track(8, 'select', { value: 'skip' }); next() }}
                className="w-full bg-white/60 rounded-2xl p-4 border-2 border-zinc-200 flex items-center gap-3 text-left hover:bg-white transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg flex-shrink-0">📅</div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-900">Ahora no</p>
                  <p className="text-xs text-zinc-500">Solo sellos y premio. Lo activás después.</p>
                </div>
              </button>
              <Hint />
            </>
          )}

          {/* ── STEP 9: Nombre del negocio ─────────────────────────────────── */}
          {step === 9 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-2">¿Cómo se llama tu negocio?</h1>
              <p className="text-zinc-500 text-sm mb-5">Esto es lo que verán tus clientes en su tarjeta. Lo podés cambiar cuando quieras.</p>

              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Nombre del negocio</label>
              <div className="relative mt-1 mb-5">
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Ej: La Esquina Café"
                  className="w-full border-2 border-violet-400 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none bg-white pr-12"
                  autoFocus
                />
                {businessName && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: primaryColor }}>✓</span>
                )}
              </div>

              {/* Live card preview */}
              <div className="rounded-2xl p-4 mb-5 shadow-lg" style={{ background: primaryColor }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-lg">
                    {businessName ? businessName[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm leading-none">{businessName || 'Tu negocio'}</p>
                    <p className="text-white/60 text-xs mt-0.5">LEALTAD</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: stampsGoal }).map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: i < 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                        color: primaryColor,
                      }}
                    >
                      {i < 3 ? '✓' : ''}
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={!businessName.trim()}
                onClick={next}
                className="w-full text-white font-bold py-4 rounded-2xl text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
                style={{ background: primaryColor }}
              >Continuar →</button>
            </>
          )}

          {/* ── STEP 10: Colores ───────────────────────────────────────────── */}
          {step === 10 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-2">
                ¿Qué estilo va con {businessName || 'tu negocio'}?
              </h1>
              <p className="text-zinc-500 text-sm mb-5">Tocá uno — cada color se puede ajustar después.</p>

              {/* Large preview */}
              <div className="rounded-2xl p-4 mb-5 shadow-lg transition-all duration-300" style={{ background: primaryColor }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-lg">
                    {businessName ? businessName[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm leading-none">{businessName || 'Tu negocio'}</p>
                    <p className="text-white/60 text-xs mt-0.5">LEALTAD</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: Math.min(stampsGoal, 8) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full"
                      style={{ background: i < 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }}
                    />
                  ))}
                </div>
              </div>

              {/* Color grid */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setPrimaryColor(c.hex); track(10, 'select', { color: c.id, hex: c.hex }) }}
                    className="rounded-xl overflow-hidden border-2 transition-all active:scale-95"
                    style={{ borderColor: primaryColor === c.hex ? c.hex : 'transparent' }}
                  >
                    <div className="p-2.5" style={{ background: c.hex }}>
                      <p className="text-white text-xs font-extrabold truncate">{businessName || 'Tu negocio'}</p>
                      <div className="flex gap-1 mt-1.5">
                        {[true, true, false, false].map((f, i) => (
                          <div key={i} className="w-4 h-4 rounded-full" style={{ background: f ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
                        ))}
                      </div>
                      <div className="flex gap-0.5 mt-1 w-8 h-1 rounded-full bg-white/50">
                        <div className="w-4 h-1 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="bg-white py-1.5 text-center">
                      <p className="text-xs font-bold text-zinc-700">{c.label}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={next}
                className="w-full text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
                style={{ background: primaryColor }}
              >Continuar →</button>

              <p className="text-center text-xs text-zinc-400 mt-3">Esto es solo el comienzo — logo, colores y cada detalle se pueden personalizar después.</p>
            </>
          )}

          {/* ── STEP 11: Auth ──────────────────────────────────────────────── */}
          {step === 11 && (
            <>
              <Chip meta={meta} />
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight mb-2">
                {businessName} está listo para despegar.
              </h1>
              <p className="text-zinc-500 text-sm mb-5">
                Iniciá sesión para guardar todo —{' '}
                <strong className="text-zinc-700">un solo toque</strong>. Tu programa te espera al otro lado.
              </p>

              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 mb-5">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">TU CONFIGURACIÓN</span>
                  <span className="text-xs font-bold flex items-center gap-1" style={{ color: primaryColor }}>✓ LISTO</span>
                </div>
                {[
                  { icon: '🏪', label: 'NEGOCIO',          value: businessName },
                  { icon: '🎯', label: 'TIPO DE PROGRAMA',  value: `Sellos · se llena con ${stampsGoal}` },
                  { icon: '🎁', label: 'QUÉ RECIBEN',       value: reward },
                  { icon: '🚀', label: 'PLAN',              value: 'Gratis por 7 días, sin tarjeta' },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-3 py-2.5 border-b border-zinc-100 last:border-0">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-sm flex-shrink-0">{row.icon}</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{row.label}</p>
                      <p className="text-sm font-semibold text-zinc-800">{row.value}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-zinc-400 mt-2 text-center">✏️ No te preocupés, todo se puede cambiar después.</p>
              </div>

              {!emailSent ? (
                <>
                  <button
                    onClick={handleGoogle}
                    disabled={authLoading}
                    className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-3.5 flex items-center justify-center gap-3 font-semibold text-zinc-800 hover:border-zinc-300 transition-colors mb-3 disabled:opacity-60"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {authLoading ? 'Redirigiendo...' : 'Continuar con Google'}
                  </button>

                  {!showEmailForm ? (
                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700 transition-colors py-2"
                    >
                      o continuá con tu correo
                    </button>
                  ) : (
                    <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full border-2 border-zinc-200 focus:border-violet-500 rounded-2xl px-4 py-3.5 text-sm focus:outline-none transition-colors bg-white"
                        autoFocus
                        required
                      />
                      <button
                        type="submit"
                        disabled={authLoading || !email.trim()}
                        className="w-full text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-40 transition-all active:scale-[0.98]"
                        style={{ background: primaryColor }}
                      >
                        {authLoading ? 'Enviando...' : 'Enviarme link de acceso →'}
                      </button>
                    </form>
                  )}

                  {authError && <p className="text-red-500 text-xs text-center mt-2">{authError}</p>}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">📩</div>
                  <h3 className="text-lg font-extrabold text-zinc-900 mb-1">Revisá tu email</h3>
                  <p className="text-zinc-500 text-sm">
                    Te mandamos un link a <strong className="text-zinc-700">{email}</strong>. Hacé click y tu programa se activa solo.
                  </p>
                  <button
                    onClick={() => { setEmailSent(false); setEmail('') }}
                    className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                  >Usar otro email</button>
                </div>
              )}

              <p className="text-center text-xs text-zinc-400 mt-5">
                ⭐⭐⭐⭐⭐ Únite a +1,000 negocios en +10 países
              </p>
            </>
          )}

        </div>
      </div>
    </main>
  )
}

// ─── Chip Helper ──────────────────────────────────────────────────────────────
function Chip({ meta }: { meta: { chip: string; icon: string } }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
      <span>{meta.icon}</span> {meta.chip}
    </div>
  )
}
