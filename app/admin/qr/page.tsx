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
  owner_id: string | null
  label: string | null
}

const SWATCHES = ['#000000','#FFFFFF','#7C3AED','#0F172A','#DC2626','#2563EB','#059669','#F59E0B']

type QRStyle = { fg: string; bg: string; transparent: boolean; size: number }

function ColorRow({ label, value, onChange, swatches = SWATCHES }: { label: string; value: string; onChange: (v: string) => void; swatches?: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 mb-1.5">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {swatches.map(c2 => (
          <button key={c2} onClick={() => onChange(c2)}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: c2, borderColor: value === c2 ? '#6366f1' : c2 === '#FFFFFF' ? '#d1d5db' : c2 }}
          />
        ))}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-24 text-xs font-mono bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-400"
          placeholder="#000000"
          maxLength={9}
        />
      </div>
    </div>
  )
}

function QRCanvas({ url, size = 120, fg = '#0F172A', bg = '#FFFFFF', transparent = false }: { url: string; size?: number; fg?: string; bg?: string; transparent?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    import('qrcode').then(QRCode => {
      if (!canvasRef.current) return
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 1,
        color: { dark: fg, light: transparent ? '#FFFFFF' : bg },
      }).then(() => {
        if (!transparent || !canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')!
        const img = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
        const d = img.data
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200) d[i + 3] = 0
        }
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.putImageData(img, 0, 0)
      })
    })
  }, [url, size, fg, bg, transparent])

  return <canvas ref={canvasRef} className="rounded-lg block"/>
}

function QRCard({ code, initialStyle }: { code: string; initialStyle?: QRStyle }) {
  const url = `${BASE}/g/${code}`
  const [style, setStyle] = useState<QRStyle>(initialStyle ?? { fg: '#000000', bg: '#FFFFFF', transparent: false, size: 800 })
  const [showOpts, setShowOpts] = useState(false)

  async function download() {
    const QRCode = await import('qrcode')
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, url, {
      width: style.size, margin: 2,
      color: { dark: style.fg, light: style.transparent ? '#FFFFFF' : style.bg },
    })
    if (style.transparent) {
      const ctx = canvas.getContext('2d')!
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200) d[i + 3] = 0
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.putImageData(img, 0, 0)
    }
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qr-${code}${style.transparent ? '-transparent' : ''}.png`
    a.click()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] flex flex-col items-center gap-3 border border-gray-100">
      <div className={`rounded-xl p-2 ${style.transparent ? 'bg-[repeating-conic-gradient(#ccc_0%_25%,#fff_0%_50%)] bg-[length:12px_12px]' : ''}`}
        style={style.transparent ? {} : { backgroundColor: style.bg }}>
        <QRCanvas url={url} size={120} fg={style.fg} bg={style.bg} transparent={style.transparent} />
      </div>
      <div className="text-center">
        <p className="font-mono font-bold text-gray-900 text-sm">{code}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{BASE}/g/{code}</p>
      </div>

      <button onClick={() => setShowOpts(o => !o)}
        className="w-full text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
        {showOpts ? '▲ Ocultar' : '▼ Ajustar'}
      </button>

      {showOpts && (
        <div className="w-full space-y-3 pt-1 border-t border-gray-100">
          <ColorRow label="Color QR" value={style.fg} onChange={v => setStyle(s => ({ ...s, fg: v }))} />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Fondo</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setStyle(s => ({ ...s, transparent: !s.transparent }))}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${style.transparent ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}>
                Sin fondo
              </button>
              {!style.transparent && (
                <ColorRow label="" value={style.bg} onChange={v => setStyle(s => ({ ...s, bg: v }))} />
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Tamaño</p>
            <div className="flex gap-1">
              {[{ l: 'S', v: 400 }, { l: 'M', v: 800 }, { l: 'L', v: 1200 }, { l: 'XL', v: 2000 }].map(o => (
                <button key={o.v} onClick={() => setStyle(s => ({ ...s, size: o.v }))}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${style.size === o.v ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={download}
        className="w-full text-xs font-semibold bg-gray-900 text-white py-2 rounded-xl hover:bg-gray-700 transition-colors">
        ↓ Descargar {style.size}px
      </button>
    </div>
  )
}

type EditState = {
  business_name: string
  google_url: string
  menu_url: string
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
  const [generateStyle, setGenerateStyle] = useState<QRStyle>({ fg: '#000000', bg: '#FFFFFF', transparent: false, size: 800 })
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [qrStyle, setQrStyle] = useState({ fg: '#000000', bg: '#FFFFFF', transparent: false, size: 800 })
  const [editState, setEditState] = useState<EditState>({ business_name: '', google_url: '', menu_url: '', client_id: '', notes: '', buyer_name: '', buyer_phone: '' })
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
      menu_url: (c as any).menu_url ?? '',
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
        <h2 className="font-bold text-gray-900 mb-5">Generar nuevos códigos</h2>

        {/* Fila superior: cantidad + cliente + botón */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <label className="text-sm text-gray-500 font-medium">Cantidad:</label>
            <input type="number" min={1} max={500} value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
            />
          </div>
          {clients.length > 0 && (
            <select value={generateClientId} onChange={e => setGenerateClientId(e.target.value)}
              className="text-sm bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="">— Sin cliente —</option>
              {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
            </select>
          )}
          <button onClick={handleGenerate} disabled={generating}
            className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
            {generating ? 'Generando…' : `Generar ${quantity} código${quantity !== 1 ? 's' : ''}`}
          </button>
          {generated && (
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">
              ✓ {generated.length} códigos listos
            </span>
          )}
        </div>

        {/* Personalización de estilo del QR */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Estilo del QR generado</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Color QR */}
            <ColorRow label="Color del QR" value={generateStyle.fg} onChange={v => setGenerateStyle(s => ({ ...s, fg: v }))} />

            {/* Fondo */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Fondo</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => setGenerateStyle(s => ({ ...s, transparent: !s.transparent }))}
                  className={`self-start text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${generateStyle.transparent ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}>
                  {generateStyle.transparent ? '✓ Sin fondo' : 'Sin fondo'}
                </button>
                {!generateStyle.transparent && (
                  <ColorRow label="" value={generateStyle.bg} onChange={v => setGenerateStyle(s => ({ ...s, bg: v }))} />
                )}
              </div>
            </div>

            {/* Tamaño */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Tamaño PNG</p>
              <div className="flex gap-2 flex-wrap">
                {[{ l: 'S · 400px', v: 400 }, { l: 'M · 800px', v: 800 }, { l: 'L · 1200px', v: 1200 }, { l: 'XL · 2000px', v: 2000 }].map(o => (
                  <button key={o.v} onClick={() => setGenerateStyle(s => ({ ...s, size: o.v }))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${generateStyle.size === o.v ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {generated && generated.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              QR listos para imprimir o programar en NFC:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {generated.map(code => (
                <QRCard key={code} code={code} initialStyle={generateStyle} />
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
                        {c.activated_at && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            ⏱ {new Date(c.activated_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-300 italic">Sin activar</p>
                    )}
                    {/* Comprador asignado */}
                    {(c.buyer_name || c.label) && (
                      <p className="text-[11px] text-violet-600 font-semibold mt-0.5 truncate flex items-center gap-1">
                        👤 {c.buyer_name || c.label}
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

                {/* Panel QR expandido con customizador */}
                {showQR === c.code && (
                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-wrap items-start gap-8">
                      {/* Preview */}
                      <div className={`rounded-2xl p-3 flex-shrink-0 ${qrStyle.transparent ? 'bg-[repeating-conic-gradient(#ccc_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]' : ''}`} style={qrStyle.transparent ? {} : { backgroundColor: qrStyle.bg }}>
                        <QRCanvas url={`${BASE}/g/${c.code}`} size={140} fg={qrStyle.fg} bg={qrStyle.bg} transparent={qrStyle.transparent} />
                      </div>

                      {/* Controles */}
                      <div className="flex-1 min-w-[260px]">
                        <p className="font-mono font-bold text-gray-700 text-sm mb-4">{BASE}/g/{c.code}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <ColorRow label="Color del QR" value={qrStyle.fg} onChange={v => setQrStyle(s => ({ ...s, fg: v }))} />
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Fondo</label>
                            <button onClick={() => setQrStyle(s => ({ ...s, transparent: !s.transparent }))}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors mb-2 ${qrStyle.transparent ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                              {qrStyle.transparent ? '✓ Sin fondo' : 'Sin fondo'}
                            </button>
                            {!qrStyle.transparent && (
                              <ColorRow label="" value={qrStyle.bg} onChange={v => setQrStyle(s => ({ ...s, bg: v }))} />
                            )}
                          </div>
                        </div>

                        {/* Tamaño */}
                        <div className="mb-5">
                          <label className="block text-xs font-semibold text-gray-500 mb-2">Tamaño PNG</label>
                          <div className="flex gap-2">
                            {[{ label: 'S', val: 400 }, { label: 'M', val: 800 }, { label: 'L', val: 1200 }, { label: 'XL', val: 2000 }].map(o => (
                              <button key={o.val} onClick={() => setQrStyle(s => ({ ...s, size: o.val }))}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${qrStyle.size === o.val ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                              >
                                {o.label} <span className="font-normal opacity-60">{o.val}px</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Descargar */}
                        <button
                          onClick={async () => {
                            const QRCode = await import('qrcode')
                            const url = `${BASE}/g/${c.code}`
                            const canvas = document.createElement('canvas')
                            await QRCode.toCanvas(canvas, url, {
                              width: qrStyle.size,
                              margin: 2,
                              color: { dark: qrStyle.fg, light: qrStyle.transparent ? '#FFFFFF' : qrStyle.bg },
                            })
                            if (qrStyle.transparent) {
                              const ctx = canvas.getContext('2d')!
                              const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
                              const d = img.data
                              for (let i = 0; i < d.length; i += 4) {
                                if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200) d[i + 3] = 0
                              }
                              ctx.clearRect(0, 0, canvas.width, canvas.height)
                              ctx.putImageData(img, 0, 0)
                            }
                            const a = document.createElement('a')
                            a.href = canvas.toDataURL('image/png')
                            a.download = `qr-${c.code}${qrStyle.transparent ? '-transparent' : ''}.png`
                            a.click()
                          }}
                          className="bg-gray-900 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          ↓ Descargar PNG {qrStyle.size}px
                        </button>
                      </div>
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

                      {/* URL del menú */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                          URL del menú <span className="text-violet-500 font-normal">(activa el Linktree en /l/{editing})</span>
                        </label>
                        <input
                          type="url"
                          value={editState.menu_url}
                          onChange={e => setEditState(s => ({ ...s, menu_url: e.target.value }))}
                          placeholder="https://... (PDF, página, Instagram, etc.)"
                          className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 text-gray-900 placeholder-gray-300"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Si completás este campo, el QR puede apuntar a <code className="bg-gray-100 px-1 rounded">calificar.com.ar/l/{editing}</code> — menú + calificar mozo + reseña Google.</p>
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
