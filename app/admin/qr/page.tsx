'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const BASE = 'https://calificar.com.ar'

type QRCode = {
  code: string
  business_name: string | null
  google_url: string | null
  activated: boolean
  scan_count: number
  created_at: string
  activated_at: string | null
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

export default function AdminQRPage() {
  const [codes, setCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<string[] | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/qr/list')
    const data = await res.json()
    setCodes(data.codes ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleGenerate() {
    setGenerating(true)
    setGenerated(null)
    const res = await fetch('/api/admin/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
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

        {/* Grid de QRs generados */}
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
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No hay códigos todavía.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(c => (
              <div key={c.code} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                {/* Código */}
                <span className="font-mono text-sm font-bold text-gray-900 w-24 flex-shrink-0">{c.code}</span>

                {/* Estado */}
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${c.activated ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                  {c.activated ? '● Activado' : '○ Pendiente'}
                </span>

                {/* Negocio */}
                <div className="flex-1 min-w-0">
                  {c.activated ? (
                    <>
                      <p className="text-sm font-semibold text-gray-800 truncate">{c.business_name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.google_url}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-300 italic">Sin activar</p>
                  )}
                </div>

                {/* Scans */}
                <div className="text-center flex-shrink-0 w-16">
                  <p className="text-lg font-bold text-gray-900">{c.scan_count}</p>
                  <p className="text-[10px] text-gray-400">scans</p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Mini QR expandible */}
                  <button
                    onClick={() => setShowQR(showQR === c.code ? null : c.code)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {showQR === c.code ? 'Cerrar' : '🔲 QR'}
                  </button>
                  <button
                    onClick={() => copyUrl(c.code)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied === c.code ? '✓' : 'Copiar URL'}
                  </button>
                </div>
              </div>
            ))}

            {/* QR expandido inline */}
            {filtered.map(c => showQR === c.code ? (
              <div key={`qr-${c.code}`} className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center gap-6">
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
            ) : null)}
          </div>
        )}
      </div>
    </div>
  )
}
