'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const BASE = 'https://calificar.com.ar'
const FREE_LIMIT = 30

// ── REEMPLAZAR CON TUS DATOS REALES ──────────────────────────────
const CAFECITO_URL = 'https://cafecito.app/calificar'   // ← tu URL de Cafecito
const WALLET_USDT  = 'TU_WALLET_USDT_TRC20_AQUI'        // ← wallet USDT (TRC-20)
const WALLET_ETH   = '0xTU_WALLET_ETH_AQUI'              // ← wallet ETH (ERC-20)
const WALLET_BTC   = 'TU_WALLET_BTC_AQUI'                // ← wallet BTC
// ─────────────────────────────────────────────────────────────────

type QREntry = {
  code: string
  label: string | null
  google_url: string | null
  scan_count: number
  created_at: string
  activated: boolean
}

type DonateStep = 'options' | 'confirm' | 'sent'

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
  const [method, setMethod] = useState<'cafecito' | 'usdt' | 'eth' | 'btc' | ''>('')
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const wallets: Record<string, { label: string; address: string; note: string }> = {
    usdt: { label: 'USDT (TRC-20)', address: WALLET_USDT, note: 'Red Tron · mínimo $5 USDT' },
    eth:  { label: 'ETH (ERC-20)',  address: WALLET_ETH,  note: 'Red Ethereum · mínimo $5 equivalente' },
    btc:  { label: 'BTC (Bitcoin)', address: WALLET_BTC,  note: 'Red Bitcoin · mínimo $5 equivalente' },
  }

  function copyWallet(addr: string, key: string) {
    navigator.clipboard.writeText(addr)
    setCopiedWallet(key)
    setTimeout(() => setCopiedWallet(null), 2000)
  }

  async function handleSubmit() {
    if (!method || !reference.trim()) { setError('Completá todos los campos'); return }
    const ars = parseInt(amount)
    if (!ars || ars < 5000) { setError('La donación mínima es $5.000 ARS'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/qr/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, amount_ars: ars, reference }),
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
                className="flex items-center gap-3 w-full bg-[#FFF0D3] hover:bg-[#FFE4B0] border border-[#F5C880] text-[#8B5E00] font-bold py-3.5 px-5 rounded-2xl transition-colors mb-3"
              >
                <span className="text-2xl">☕</span>
                <div className="text-left">
                  <p className="font-bold text-sm">Donar con Cafecito</p>
                  <p className="text-xs font-normal text-[#A07020]">Mercado Pago · tarjeta · efectivo</p>
                </div>
                <span className="ml-auto text-sm">→</span>
              </a>

              {/* Cripto */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden mb-5">
                {Object.entries(wallets).map(([key, w]) => (
                  <div key={key} className="px-4 py-3 flex items-center justify-between border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{w.label}</p>
                      <p className="text-[10px] text-gray-400">{w.note}</p>
                    </div>
                    <button
                      onClick={() => copyWallet(w.address, key)}
                      className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-3"
                    >
                      {copiedWallet === key ? '✓ Copiado' : 'Copiar wallet'}
                    </button>
                  </div>
                ))}
              </div>

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
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Método de pago</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as typeof method)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900"
                >
                  <option value="">— Seleccioná —</option>
                  <option value="cafecito">Cafecito</option>
                  <option value="usdt">USDT (TRC-20)</option>
                  <option value="eth">ETH (ERC-20)</option>
                  <option value="btc">BTC (Bitcoin)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {method === 'cafecito' ? 'Email que usaste en Cafecito' : 'Hash / ID de la transacción'}
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder={method === 'cafecito' ? 'ejemplo@mail.com' : '0xabc123...'}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
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
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUserEmail(data.user.email ?? '')
    })
    load()
  }, [load])

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
