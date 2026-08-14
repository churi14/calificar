'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const BASE = 'https://calificar.com.ar'
const FREE_LIMIT = 30

const CAFECITO_URL = 'https://cafecito.app/calificar'

type QREntry = {
  code: string
  label: string | null
  google_url: string | null
  scan_count: number
  created_at: string
  activated: boolean
}

type DonateStep = 'options' | 'confirm' | 'sent'

// ── Vista Vendedor (sub-usuario) ─────────────────────────────────
function VendedorView({ userEmail }: { userEmail: string }) {
  const [codes, setCodes] = useState<QREntry[]>([])
  const [loading, setLoading] = useState(true)
  const [parentName, setParentName] = useState('')

  useEffect(() => {
    fetch('/api/qr/my-codes').then(r => r.json()).then(d => {
      setCodes(d.codes ?? [])
      setParentName(d.parentName ?? '')
      setLoading(false)
    })
  }, [])

  const totalScans = codes.reduce((s, c) => s + (c.scan_count ?? 0), 0)
  const activated = codes.filter(c => c.activated).length

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/qr'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
            <span className="font-extrabold text-lg text-gray-900">Calificar</span>
            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full ml-1">Vendedor</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{userEmail}</span>
            <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-gray-700 font-medium">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Mis activaciones</h1>
          {parentName && <p className="text-sm text-gray-400 mt-0.5">Equipo de {parentName}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'QRs activados', value: activated, icon: '✅' },
            { label: 'Total scans', value: totalScans, icon: '📱' },
            { label: 'QRs asignados', value: codes.length, icon: '🔲' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando…</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔲</div>
            <p className="font-bold text-gray-900 mb-2">Sin QRs asignados todavía</p>
            <p className="text-gray-400 text-sm">Cuando actives un cartel aparece acá.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map(c => (
              <div key={c.code} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${c.activated ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                  {c.activated ? '✓' : '○'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.label ?? c.code}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.code}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-gray-900">{c.scan_count}</p>
                  <p className="text-[10px] text-gray-400">scans</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

type TeamMember = {
  id: string
  name: string | null
  email: string
  created_at: string
  qr_count: number
  activated_count: number
  total_scans: number
  qrs: Array<{ code: string; business_name: string | null; activated: boolean; scan_count: number }>
}

// ── Modal Agregar Miembro ────────────────────────────────────────
function AddMemberModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completá todos los campos'); return
    }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/qr/team/create-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Error al crear el usuario'); return }
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Agregar vendedor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-gray-500">El vendedor va a poder activar QRs en su propia cuenta y vos vas a ver sus estadísticas acá.</p>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
              placeholder="Pablo López"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="pablo@mail.com"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Mínimo 6 caracteres"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleSubmit} disabled={loading}
            className="w-full bg-violet-600 text-white font-bold py-3 rounded-2xl hover:bg-violet-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Creando…' : 'Crear vendedor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toast ────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs">
        <span className="text-green-400">✓</span>
        <span>{msg}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 ml-1">✕</button>
      </div>
    </div>
  )
}

// ── QR Canvas ────────────────────────────────────────────────────
function QRCanvas({ url, size = 140 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    import('qrcode').then(QRCode => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: size, margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        })
      }
    })
  }, [url, size])
  return <canvas ref={canvasRef} className="rounded-xl block" />
}

// ── Modal Donación ────────────────────────────────────────────────
function DonationModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [step, setStep] = useState<DonateStep>('options')
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!reference.trim()) { setError('Ingresá el email que usaste en Cafecito'); return }
    const ars = parseInt(amount)
    if (!ars || ars < 5000) { setError('La donación mínima es $5.000 ARS'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/qr/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'cafecito', amount_ars: ars, reference }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error ?? 'Error al enviar'); return }
    setStep('sent')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

        {step === 'options' && (
          <>
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-6 pt-6 pb-5 text-white relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
              <div className="text-3xl mb-2">🙏</div>
              <h2 className="font-extrabold text-xl">¿Te está siendo útil?</h2>
              <p className="text-violet-200 text-sm mt-1">
                Calificar QR es gratis porque la comunidad lo hace posible.
              </p>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-600 text-sm mb-5">
                Con una donación de <strong className="text-gray-900">$5.000 ARS o más</strong> desbloqueás <strong className="text-gray-900">QRs ilimitados</strong> para siempre.
              </p>

              {/* Cafecito */}
              <a
                href={CAFECITO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full bg-[#FFF0D3] hover:bg-[#FFE4B0] border border-[#F5C880] text-[#8B5E00] font-bold py-4 px-5 rounded-2xl transition-colors mb-5"
              >
                <span className="text-3xl">☕</span>
                <div className="text-left">
                  <p className="font-bold text-sm">Donar en Cafecito</p>
                  <p className="text-xs font-normal text-[#A07020]">Mercado Pago · tarjeta · efectivo</p>
                </div>
                <span className="ml-auto text-lg">→</span>
              </a>

              <button
                onClick={() => setStep('confirm')}
                className="w-full text-sm font-bold text-violet-600 hover:text-violet-800 transition-colors py-2"
              >
                Ya doné → Confirmar mi donación
              </button>
              <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors py-1">
                Cerrar — seguir con plan gratis
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
              <button onClick={() => setStep('options')} className="text-gray-400 hover:text-gray-700">←</button>
              <h2 className="font-bold text-gray-900">Confirmar donación</h2>
              <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-[#FFF8EC] border border-[#F5C880] rounded-xl px-4 py-3 flex items-center gap-2 text-[#8B5E00] text-xs font-semibold">
                <span>☕</span> Donación vía Cafecito
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email que usaste en Cafecito</label>
                <input
                  type="email"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="ejemplo@mail.com"
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Monto donado (ARS aproximado)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={5000}
                  placeholder="5000"
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                />
                <p className="text-[10px] text-gray-400 mt-1">Mínimo $5.000 ARS</p>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-2xl hover:bg-violet-700 transition-colors disabled:opacity-50 text-sm"
              >
                {submitting ? 'Enviando…' : 'Enviar confirmación'}
              </button>
            </div>
          </>
        )}

        {step === 'sent' && (
          <div className="px-6 py-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-extrabold text-xl text-gray-900 mb-2">¡Gracias por donar!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Verificaremos tu donación en las próximas horas y te activaremos los QRs ilimitados. Te avisamos por email.
            </p>
            <button
              onClick={() => { onSent(); onClose() }}
              className="bg-violet-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-violet-700 transition-colors text-sm"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────
export default function QRDashboard() {
  const [codes, setCodes] = useState<QREntry[]>([])
  const [unlimited, setUnlimited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [createError, setCreateError] = useState('')
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showDonation, setShowDonation] = useState(false)
  const [isVendedor, setIsVendedor] = useState<boolean | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    const res = await fetch('/api/qr/team/members')
    if (res.ok) {
      const data = await res.json()
      setMembers(data.members ?? [])
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/qr/my-codes')
    if (res.status === 401) { window.location.href = '/login'; return }
    const data = await res.json()
    setCodes(data.codes ?? [])
    setUnlimited(data.unlimited ?? false)
    setLoading(false)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUserEmail(data.user.email ?? '')
      // Detectar si es sub-usuario (vendedor)
      const { data: profile } = await supabase
        .from('profiles')
        .select('parent_user_id')
        .eq('id', data.user.id)
        .single()
      setIsVendedor(!!(profile?.parent_user_id))
    })
    load()
    loadMembers()
  }, [load, loadMembers])

  async function handleCreate() {
    if (!newUrl.trim()) { setCreateError('Ingresá la URL de destino'); return }
    try { new URL(newUrl) } catch { setCreateError('La URL no es válida'); return }
    setCreating(true); setCreateError('')
    const res = await fetch('/api/qr/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_url: newUrl, label: newLabel }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) {
      if (data.code === 'LIMIT_REACHED') { setShowDonation(true); setShowCreate(false); return }
      setCreateError(data.error ?? 'Error al crear'); return
    }
    setNewUrl(''); setNewLabel(''); setShowCreate(false)
    await load()

    // Toast con contador + sugerir donación en ciertos umbrales
    const newCount = codes.length + 1
    const remaining = FREE_LIMIT - newCount
    if (unlimited) {
      setToast('QR creado ✓')
    } else if (remaining <= 0) {
      setShowDonation(true)
    } else {
      setToast(`QR #${newCount} creado ✓ — te quedan ${remaining} gratuitos`)
      if (remaining <= 10) setTimeout(() => setShowDonation(true), 3500)
    }
  }

  async function handleSaveEdit(code: string) {
    if (!editUrl.trim()) return
    try { new URL(editUrl) } catch { return }
    setSaving(true)
    await fetch('/api/qr/update-url', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, destination_url: editUrl, label: editLabel }),
    })
    setSaving(false); setEditingCode(null)
    load(); setToast('URL actualizada ✓')
  }

  function startEdit(c: QREntry) { setEditingCode(c.code); setEditUrl(c.google_url ?? ''); setEditLabel(c.label ?? '') }

  async function downloadQR(code: string) {
    const QRCode = await import('qrcode')
    const dataUrl = await QRCode.toDataURL(`${BASE}/g/${code}`, { width: 800, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } })
    const a = document.createElement('a'); a.href = dataUrl; a.download = `qr-${code}.png`; a.click()
  }

  function copyUrl(code: string) {
    navigator.clipboard.writeText(`${BASE}/g/${code}`)
    setCopied(code); setTimeout(() => setCopied(null), 2000)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/qr'
  }

  const canCreate = unlimited || codes.length < FREE_LIMIT
  const remaining = FREE_LIMIT - codes.length

  // Sub-usuario: mostrar vista restringida
  if (isVendedor === null) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Cargando…</div>
  if (isVendedor) return <VendedorView userEmail={userEmail} />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/qr" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
            <span className="font-extrabold text-lg text-gray-900">Calificar</span>
            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full ml-1">QR</span>
          </Link>
          <div className="flex items-center gap-4">
            {unlimited && (
              <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                ★ Ilimitados
              </span>
            )}
            <span className="text-sm text-gray-400 hidden sm:block">{userEmail}</span>
            <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mis QRs dinámicos</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {unlimited
                ? `${codes.length} QRs · plan ilimitado ★`
                : `${codes.length} de ${FREE_LIMIT} QRs usados · ${remaining > 0 ? `quedan ${remaining}` : 'límite alcanzado'}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!unlimited && (
              <button
                onClick={() => setShowDonation(true)}
                className="text-sm text-violet-600 font-semibold hover:text-violet-800 transition-colors hidden sm:block"
              >
                ☕ Donar y desbloquear
              </button>
            )}
            <button
              onClick={() => setShowAddMember(true)}
              className="text-sm text-gray-500 font-semibold hover:text-gray-800 transition-colors hidden sm:block"
              title="Agregar vendedor"
            >
              👥
            </button>
            <button
              onClick={() => { setShowCreate(true); setCreateError('') }}
              disabled={!canCreate}
              className="bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Nuevo QR
            </button>
          </div>
        </div>

        {/* Barra de progreso del plan */}
        {!unlimited && codes.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Plan gratuito</span>
              <span className="text-xs font-bold text-gray-700">{codes.length} / {FREE_LIMIT} QRs</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  remaining <= 5 ? 'bg-red-400' : remaining <= 10 ? 'bg-amber-400' : 'bg-violet-500'
                }`}
                style={{ width: `${Math.min((codes.length / FREE_LIMIT) * 100, 100)}%` }}
              />
            </div>
            {remaining <= 10 && remaining > 0 && (
              <p className="text-xs text-amber-600 font-semibold mt-2">
                ⚠️ Solo te quedan {remaining} QRs gratuitos.{' '}
                <button onClick={() => setShowDonation(true)} className="underline hover:text-amber-800">Donando desbloqueás ilimitados.</button>
              </p>
            )}
          </div>
        )}

        {/* Crear QR */}
        {showCreate && (
          <div className="bg-white rounded-2xl border-2 border-violet-200 p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Nuevo QR dinámico</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">URL de destino <span className="text-red-400">*</span></label>
                <input
                  type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="https://tu-web.com.ar · wa.me/549... · Instagram · Google Maps"
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                  autoFocus
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre o etiqueta <span className="text-gray-300">(solo lo ves vos)</span></label>
                <input
                  type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Ej: Instagram del local, WhatsApp pedidos, Menú digital..."
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                />
              </div>
            </div>
            {createError && <p className="text-xs text-red-500 mb-3">{createError}</p>}
            <div className="flex items-center gap-3">
              <button onClick={handleCreate} disabled={creating}
                className="bg-violet-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50">
                {creating ? 'Creando…' : 'Crear QR'}
              </button>
              <button onClick={() => setShowCreate(false)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        {/* Mi equipo */}
        {members.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Mi equipo</h2>
                <p className="text-xs text-gray-400 mt-0.5">{members.length} vendedor{members.length !== 1 ? 'es' : ''}</p>
              </div>
              <button
                onClick={() => setShowAddMember(true)}
                className="bg-violet-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors"
              >
                + Agregar
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {members.map(m => (
                <div key={m.id}>
                  <button
                    onClick={() => setExpandedMember(expandedMember === m.id ? null : m.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 font-bold text-violet-600 text-sm">
                      {(m.name ?? m.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{m.name ?? '—'}</p>
                      <p className="text-xs text-gray-400 truncate">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-center hidden sm:block">
                        <p className="font-extrabold text-lg text-gray-900">{m.activated_count}</p>
                        <p className="text-[10px] text-gray-400">activados</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="font-extrabold text-lg text-gray-900">{m.total_scans}</p>
                        <p className="text-[10px] text-gray-400">scans</p>
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-lg text-gray-900">{m.qr_count}</p>
                        <p className="text-[10px] text-gray-400">QRs</p>
                      </div>
                      <span className="text-gray-300 text-sm">{expandedMember === m.id ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  {expandedMember === m.id && m.qrs.length > 0 && (
                    <div className="px-6 pb-4 bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-3">
                        {m.qrs.map(q => (
                          <div key={q.code} className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 p-3">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0 ${q.activated ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                              {q.activated ? '✓' : '○'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{q.business_name ?? q.code}</p>
                              <p className="text-[10px] text-gray-400">{q.scan_count} scans · <span className="font-mono">{q.code}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {m.qrs.length === 0 && (
                        <p className="text-xs text-gray-400 py-3 text-center">Sin QRs todavía</p>
                      )}
                    </div>
                  )}
                  {expandedMember === m.id && m.qrs.length === 0 && (
                    <div className="px-6 pb-4 bg-gray-50">
                      <p className="text-xs text-gray-400 py-3 text-center">Sin QRs todavía</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón agregar miembro si no hay ninguno */}
        {members.length === 0 && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 text-sm text-violet-600 font-semibold hover:text-violet-800 transition-colors"
            >
              👥 Agregar vendedor al equipo
            </button>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando…</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔲</div>
            <p className="font-bold text-gray-900 text-lg mb-2">Todavía no tenés QRs</p>
            <p className="text-gray-400 text-sm mb-6">Creá tu primer QR dinámico gratis en segundos.</p>
            <button onClick={() => setShowCreate(true)}
              className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-violet-700 transition-colors">
              Crear mi primer QR
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map(c => (
              <div key={c.code} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex flex-col items-center gap-4">
                  <QRCanvas url={`${BASE}/g/${c.code}`} size={140} />
                  <div className="text-center w-full">
                    {c.label && <p className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{c.label}</p>}
                    <p className="font-mono text-xs text-gray-400">{c.code}</p>
                  </div>
                  <div className="w-full flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                    <div className="text-center">
                      <p className="font-extrabold text-xl text-gray-900">{c.scan_count}</p>
                      <p className="text-[10px] text-gray-400 font-medium">scans</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm text-gray-900">
                        {new Date(c.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">creado</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.activated ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                      {c.activated ? '● Activo' : '○ Sin URL'}
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-4">
                  {editingCode === c.code ? (
                    <div className="space-y-2">
                      <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)}
                        placeholder="Etiqueta (opcional)"
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 text-gray-700" />
                      <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)}
                        placeholder="Nueva URL de destino" autoFocus
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 text-gray-700" />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(c.code)} disabled={saving}
                          className="flex-1 bg-violet-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50">
                          {saving ? '…' : 'Guardar'}
                        </button>
                        <button onClick={() => setEditingCode(null)}
                          className="flex-1 bg-gray-100 text-gray-600 font-medium text-xs py-2 rounded-lg hover:bg-gray-200">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(c)}
                      className="w-full flex items-center gap-2 bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 rounded-xl px-3 py-2.5 transition-all group text-left">
                      <span className="flex-1 text-xs text-gray-500 truncate font-mono">
                        {c.google_url || 'Sin URL — tocá para editar'}
                      </span>
                      <span className="text-gray-300 group-hover:text-violet-400 text-xs flex-shrink-0">✏️</span>
                    </button>
                  )}
                </div>

                <div className="px-5 pb-5 flex gap-2">
                  <button onClick={() => downloadQR(c.code)}
                    className="flex-1 bg-gray-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
                    ↓ Descargar
                  </button>
                  <button onClick={() => copyUrl(c.code)}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium text-xs py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                    {copied === c.code ? '✓ Copiado' : 'Copiar URL'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Modal agregar vendedor */}
      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onCreated={() => { loadMembers(); setToast('Vendedor creado ✓') }}
        />
      )}

      {/* Modal donación */}
      {showDonation && (
        <DonationModal
          onClose={() => setShowDonation(false)}
          onSent={() => setToast('¡Donación registrada! Te avisamos cuando se active.')}
        />
      )}
    </div>
  )
}
