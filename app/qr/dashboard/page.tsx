'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const BASE = 'https://calificar.com.ar'
const FREE_LIMIT = 5

type QREntry = {
  code: string
  label: string | null
  google_url: string | null
  scan_count: number
  created_at: string
  activated: boolean
}

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
  return <canvas ref={canvasRef} className="rounded-xl block"/>
}

export default function QRDashboard() {
  const [codes, setCodes] = useState<QREntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [createError, setCreateError] = useState('')
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/qr/my-codes')
    if (res.status === 401) { window.location.href = '/login'; return }
    const data = await res.json()
    setCodes(data.codes ?? [])
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
    if (codes.length >= FREE_LIMIT) { setCreateError(`El plan gratis permite hasta ${FREE_LIMIT} QRs`); return }
    setCreating(true)
    setCreateError('')
    const res = await fetch('/api/qr/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_url: newUrl, label: newLabel }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setCreateError(data.error ?? 'Error al crear'); return }
    setNewUrl(''); setNewLabel(''); setShowCreate(false)
    load()
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
    setSaving(false)
    setEditingCode(null)
    load()
  }

  function startEdit(c: QREntry) {
    setEditingCode(c.code)
    setEditUrl(c.google_url ?? '')
    setEditLabel(c.label ?? '')
  }

  async function downloadQR(code: string) {
    const QRCode = await import('qrcode')
    const dataUrl = await QRCode.toDataURL(`${BASE}/g/${code}`, {
      width: 800, margin: 2,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
    const a = document.createElement('a')
    a.href = dataUrl; a.download = `qr-${code}.png`; a.click()
  }

  function copyUrl(code: string) {
    navigator.clipboard.writeText(`${BASE}/g/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/qr'
  }

  const canCreate = codes.length < FREE_LIMIT

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
            <span className="text-sm text-gray-400 hidden sm:block">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mis QRs dinámicos</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {codes.length} de {FREE_LIMIT} QRs usados · plan gratis
            </p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setCreateError('') }}
            disabled={!canCreate}
            className="bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Nuevo QR
          </button>
        </div>

        {/* Crear QR — inline form */}
        {showCreate && (
          <div className="bg-white rounded-2xl border-2 border-violet-200 p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Nuevo QR dinámico</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  URL de destino <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="https://tu-web.com.ar o https://wa.me/549..."
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                  autoFocus
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Nombre o etiqueta <span className="text-gray-300">(opcional, solo lo ves vos)</span>
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Ej: QR del local, Instagram, WhatsApp pedidos..."
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                />
              </div>
            </div>
            {createError && <p className="text-xs text-red-500 mb-3">{createError}</p>}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="bg-violet-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {creating ? 'Creando…' : 'Crear QR'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de QRs */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando…</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔲</div>
            <p className="font-bold text-gray-900 text-lg mb-2">Todavía no tenés QRs</p>
            <p className="text-gray-400 text-sm mb-6">Creá tu primer QR dinámico gratis en segundos.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-violet-700 transition-colors"
            >
              Crear mi primer QR
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map(c => (
              <div key={c.code} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* QR + stats */}
                <div className="p-6 flex flex-col items-center gap-4">
                  <QRCanvas url={`${BASE}/g/${c.code}`} size={140} />

                  {/* Label + code */}
                  <div className="text-center w-full">
                    {c.label && (
                      <p className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{c.label}</p>
                    )}
                    <p className="font-mono text-xs text-gray-400">{c.code}</p>
                  </div>

                  {/* Stats */}
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
                    <div className="text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.activated ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                        {c.activated ? '● Activo' : '○ Sin URL'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* URL destino (editable) */}
                <div className="px-5 pb-4">
                  {editingCode === c.code ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        placeholder="Etiqueta (opcional)"
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 text-gray-700"
                      />
                      <input
                        type="url"
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        placeholder="Nueva URL de destino"
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 text-gray-700"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(c.code)}
                          disabled={saving}
                          className="flex-1 bg-violet-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? '…' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditingCode(null)}
                          className="flex-1 bg-gray-100 text-gray-600 font-medium text-xs py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(c)}
                      className="w-full flex items-center gap-2 bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 rounded-xl px-3 py-2.5 transition-all group text-left"
                    >
                      <span className="flex-1 text-xs text-gray-500 truncate font-mono">
                        {c.google_url || 'Sin URL — tocá para editar'}
                      </span>
                      <span className="text-gray-300 group-hover:text-violet-400 transition-colors text-xs flex-shrink-0">✏️</span>
                    </button>
                  )}
                </div>

                {/* Acciones */}
                <div className="px-5 pb-5 flex gap-2">
                  <button
                    onClick={() => downloadQR(c.code)}
                    className="flex-1 bg-gray-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    ↓ Descargar
                  </button>
                  <button
                    onClick={() => copyUrl(c.code)}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium text-xs py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {copied === c.code ? '✓ Copiado' : 'Copiar URL'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Límite alcanzado */}
        {codes.length >= FREE_LIMIT && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-bold text-amber-900 text-sm">Llegaste al límite del plan gratis</p>
              <p className="text-amber-700 text-xs mt-1">
                El plan gratis incluye hasta {FREE_LIMIT} QRs dinámicos.
                Si necesitás más, escribinos por WhatsApp.
              </p>
              <a
                href="https://wa.me/5491123867934?text=Hola!%20Necesito%20m%C3%A1s%20de%205%20QR%20din%C3%A1micos."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors"
              >
                Escribirnos por WhatsApp →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
