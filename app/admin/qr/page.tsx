'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const BASE = 'https://calificar.com.ar'

type Client = { id: string; name: string; email: string }

type QRCode = {
  code: string
  business_name: string | null
  google_url: string | null
  activated: boolean
  scan_count: number
  created_at: string
  activated_at: string | null
  client_id: string | null
  notes: string | null
  buyer_name: string | null
  buyer_phone: string | null
  profiles: { name: string; email: string } | null
}

function QRCanvas({ url, size = 120 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    import('qrcode').then(QRCode => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        })
      }
    })
  }, [url, size])

  return <canvas ref={canvasRef} className="rounded-lg block"/>
}

function QRCard({ code }: { code: string }) {
  const url = `${BASE}/g/${code}`

  async function download() {
    const QRCode = await import('qrcode')
    const dataUrl = await QRCode.toDataURL(url, {
      width: 800, margin: 2,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-calificar-${code}.png`
    a.click()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] flex flex-col items-center gap-3 border border-gray-100">
      <QRCanvas url={url} size={120} />
      <div className="text-center">
        <p className="font-mono font-bold text-gray-900 text-sm">{code}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{BASE}/g/{code}</p>
      </div>
      <button
        onClick={download}
        className="w-full text-xs font-semibold bg-gray-900 text-white py-2 rounded-xl hover:bg-gray-700 transition-colors"
      >
        ↓ Descargar PNG
      </button>
    </div>
  )
}

type EditState = {
  business_name: string
  google_url: string
  client_id: string
  notes: string
  buyer_name: string
  buyer_phone: string
}

export default function AdminQRPage() {
  const [codes, setCodes] = useState<QRCode[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(10)
  const [generateClientId, setGenerateClientId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<string[] | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ business_name: '', google_url: '', client_id: '', notes: '', buyer_name: '', buyer_phone: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const [codesRes, clientsRes] = await Promise.all([
      fetch('/api/admin/qr/list'),
      fetch('/api/admin/qr/clients'),
    ])
    const codesData = await codesRes.json()
    const clientsData = await clientsRes.json()
    if (!codesRes.ok) {
      setLoadError(codesData.error ?? `Error ${codesRes.status}`)
      setCodes([])
    } else {
      setCodes(codesData.codes ?? [])
    }
    setClients(clientsData.clients ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleGenerate() {
    setGenerating(true)
    setGenerated(null)
    const res = await fetch('/api/admin/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, client_id: generateClientId || undefined }),
    })
    const data = await res.json()
    setGenerated(data.codes ?? [])
    setGenerating(false)
    load()
  }

  function copyUrl(code: string) {
    navigator.clipboard.writeText(`${BASE}/g/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  function startEdit(c: QRCode) {
    setEditing(c.code)
    setShowQR(null)
    setSaveError(null)
    setEditState({
      business_name: c.business_name ?? '',
      google_url: c.google_url ?? '',
      client_id: c.client_id ?? '',
      notes: c.notes ?? '',
      buyer_name: c.buyer_name ?? '',
      buyer_phone: c.buyer_phone ?? '',
    })
  }

  function cancelEdit() {
    setEditing(null)
    setSaveError(null)
  }

  async function saveEdit(code: string) {
    setSaving(true)
    setSaveError(null)
    const res = await fetch('/api/admin/qr/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...editState }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setSaveError(data.error ?? 'Error al guardar'); return }
    setEditing(null)
    load()
  }

  const filtered = codes.filter(c =>
    filter === 'all' ? true : filter === 'active' ? c.activated : !c.activated
  )

  const total = codes.length
  const active = codes.filter(c => c.activated).length
  const pending = total - active
  const totalScans = codes.reduce((s, c) => s + (c.scan_count ?? 0), 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">QR Dinámicos</h1>
      <p className="text-sm text-gray-400 mb-8">Generá los códigos, descargá los QR y programá los chips NFC con la misma URL.</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total generados', value: total },
          { label: 'Activados', value: active, color: 'text-green-600' },
          { label: 'Pendientes', value: pending, color: 'text-orange-500' },
          { label: 'Scans totales', value: totalScans, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
            <p className="text-xs text-gray-400 mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color ?? 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Generar */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Generar nuevos códigos</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <label className="text-sm text-gray-500 font-medium">Cantidad:</label>
            <input
              type="number"
              min={1}
              max={500}
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
            />
          </div>
          {clients.length > 0 && (
            <select
              value={generateClientId}
              onChange={e => setGenerateClientId(e.target.value)}
              className="text-sm bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="">— Sin cliente —</option>
              {clients.map(cl => (
                <option key={cl.id} value={cl.id}>{cl.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generando…' : `Generar ${quantity} código${quantity !== 1 ? 's' : ''}`}
          </button>
          {generated && (
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">
              ✓ {generated.length} códigos listos
            </span>
          )}
        </div>

        {generated && generated.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              QR listos para imprimir o programar en NFC:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {generated.map(code => (
                <QRCard key={code} code={code} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Todos los códigos</h2>
          <div className="flex gap-1">
            {(['all', 'active', 'pending'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {f === 'all' ? 'Todos' : f === 'active' ? 'Activados' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando…</div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <p className="text-red-500 font-semibold text-sm mb-2">Error al cargar: {loadError}</p>
            <p className="text-gray-400 text-xs">Asegurate de tener <code className="bg-gray-100 px-1 rounded">role = admin</code> en tu perfil de Supabase.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No hay códigos todavía.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(c => (
              <div key={c.code}>
                {/* Fila principal */}
                <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  {/* Código */}
                  <span className="font-mono text-sm font-bold text-gray-900 w-24 flex-shrink-0">{c.code}</span>

                  {/* Estado */}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${c.activated ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                    {c.activated ? '● Activado' : '○ Pendiente'}
                  </span>

                  {/* Negocio + cliente */}
                  <div className="flex-1 min-w-0">
                    {c.activated ? (
                      <>
                        <p className="text-sm font-semibold text-gray-800 truncate">{c.business_name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.google_url}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-300 italic">Sin activar</p>
                    )}
                    {/* Comprador asignado */}
                    {(c.buyer_name || c.profiles?.name) && (
                      <p className="text-[11px] text-violet-600 font-semibold mt-0.5 truncate flex items-center gap-1">
                        👤 {c.buyer_name || c.profiles?.name}
                        {c.buyer_phone && <span className="text-gray-400 font-normal">· {c.buyer_phone}</span>}
                      </p>
                    )}
                  </div>

                  {/* Scans */}
                  <div className="text-center flex-shrink-0 w-16">
                    <p className="text-lg font-bold text-gray-900">{c.scan_count}</p>
                    <p className="text-[10px] text-gray-400">scans</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setShowQR(showQR === c.code ? null : c.code); setEditing(null) }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {showQR === c.code ? 'Cerrar' : '🔲 QR'}
                    </button>
                    <button
                      onClick={() => editing === c.code ? cancelEdit() : startEdit(c)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${editing === c.code ? 'bg-gray-200 text-gray-700' : 'bg-violet-50 hover:bg-violet-100 text-violet-700'}`}
                    >
                      {editing === c.code ? 'Cancelar' : '✏️ Editar'}
                    </button>
                    <button
                      onClick={() => copyUrl(c.code)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copied === c.code ? '✓' : 'Copiar URL'}
                    </button>
                  </div>
                </div>

                {/* Panel QR expandido */}
                {showQR === c.code && (
                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center gap-6">
                    <QRCanvas url={`${BASE}/g/${c.code}`} size={100} />
                    <div>
                      <p className="font-mono font-bold text-gray-900 mb-1">{c.code}</p>
                      <p className="text-xs text-gray-400 mb-3">{BASE}/g/{c.code}</p>
                      <button
                        onClick={async () => {
                          const QRCode = await import('qrcode')
                          const dataUrl = await QRCode.toDataURL(`${BASE}/g/${c.code}`, { width: 800, margin: 2 })
                          const a = document.createElement('a')
                          a.href = dataUrl; a.download = `qr-${c.code}.png`; a.click()
                        }}
                        className="text-xs font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        ↓ Descargar PNG
                      </button>
                    </div>
                  </div>
                )}

                {/* Panel edición inline */}
                {editing === c.code && (
                  <div className="px-6 py-5 bg-violet-50/60 border-t border-violet-100">
                    <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-4">Editar código {c.code}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                      {/* ── COMPRADOR ── */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre del comprador</label>
                        <input
                          type="text"
                          value={editState.buyer_name}
                          onChange={e => setEditState(s => ({ ...s, buyer_name: e.target.value }))}
                          placeholder="Ej: Juan García"
                          className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teléfono</label>
                        <input
                          type="tel"
                          value={editState.buyer_phone}
                          onChange={e => setEditState(s => ({ ...s, buyer_phone: e.target.value }))}
                          placeholder="Ej: 11 2233-4455"
                          className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                        />
                      </div>

                      {/* Nombre del negocio */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre del negocio</label>
                        <input
                          type="text"
                          value={editState.business_name}
                          onChange={e => setEditState(s => ({ ...s, business_name: e.target.value }))}
                          placeholder="Ej: Pizzería El Rey"
                          className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                        />
                      </div>

                      {/* URL de Google */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">URL de Google Maps / G.page</label>
                        <input
                          type="url"
                          value={editState.google_url}
                          onChange={e => setEditState(s => ({ ...s, google_url: e.target.value }))}
                          placeholder="https://g.page/..."
                          className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                        />
                      </div>

                      {/* Notas internas */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notas internas</label>
                        <input
                          type="text"
                          value={editState.notes}
                          onChange={e => setEditState(s => ({ ...s, notes: e.target.value }))}
                          placeholder="Ej: Pedido del 07/08, entregado en mano"
                          className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                        />
                      </div>

                      {/* Cliente registrado (opcional) */}
                      {clients.length > 0 && (
                        <div className="sm:col-span-2 pt-1 border-t border-violet-100">
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Vincular a cliente registrado (opcional)</label>
                          <select
                            value={editState.client_id}
                            onChange={e => setEditState(s => ({ ...s, client_id: e.target.value }))}
                            className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-600"
                          >
                            <option value="">— Sin vincular —</option>
                            {clients.map(cl => (
                              <option key={cl.id} value={cl.id}>{cl.name} ({cl.email})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {saveError && (
                      <p className="text-xs text-red-500 mb-3">{saveError}</p>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => saveEdit(c.code)}
                        disabled={saving}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
