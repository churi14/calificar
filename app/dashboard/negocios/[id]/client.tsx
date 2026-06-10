'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Business = {
  id: string; name: string; slug: string
  google_review_url: string | null; logo_url: string | null
  whatsapp_number: string | null; negative_redirect: string
  threshold: number; primary_color: string; accent_color: string
  active: boolean; total_scans: number; positive_scans: number; negative_scans: number
}

type DayScan = { date: string; total: number; positive: number }
type Employee = { id: string; name: string; total_scans: number; slug: string }

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function BusinessDetailClient({
  business, weeklyScans, employees, unreadFeedback, appUrl
}: {
  business: Business
  weeklyScans: DayScan[]
  employees: Employee[]
  unreadFeedback: number
  appUrl: string
}) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [form, setForm] = useState({
    google_review_url: business.google_review_url ?? '',
    whatsapp_number:   business.whatsapp_number ?? '',
    negative_redirect: business.negative_redirect,
    threshold:         business.threshold,
    primary_color:     business.primary_color,
    accent_color:      business.accent_color,
  })

  const funnelUrl = `${appUrl}/r/${business.slug}`
  const maxScans = Math.max(...weeklyScans.map(d => d.total), 1)

  // Generar QR cuando monte
  useEffect(() => {
    import('qrcode').then(QRCode => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, funnelUrl, {
          width: 160, margin: 1,
          color: { dark: '#111111', light: '#FFFFFF' }
        })
      }
    })
  }, [funnelUrl])

  async function copyUrl() {
    await navigator.clipboard.writeText(funnelUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  async function downloadQR(format: 'png' | 'svg') {
    const QRCode = await import('qrcode')
    if (format === 'png') {
      const url = await QRCode.toDataURL(funnelUrl, { width: 400, margin: 2 })
      const a = document.createElement('a'); a.href = url
      a.download = `qr-${business.slug}.png`; a.click()
    } else {
      const svg = await QRCode.toString(funnelUrl, { type: 'svg', margin: 2 })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `qr-${business.slug}.svg`; a.click()
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('businesses').update({
      google_review_url: form.google_review_url,
      whatsapp_number:   form.whatsapp_number.replace(/\D/g, ''),
      negative_redirect: form.negative_redirect,
      threshold:         form.threshold,
      primary_color:     form.primary_color,
      accent_color:      form.accent_color,
    }).eq('id', business.id)

    if (error) { setSaveMsg('Error al guardar'); }
    else { setSaveMsg('Guardado ✓'); router.refresh() }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function toggleActive() {
    const supabase = createClient()
    await supabase.from('businesses').update({ active: !business.active }).eq('id', business.id)
    router.refresh()
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <Link href="/dashboard/negocios" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
            ← Mis locales
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-gray-900">{business.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${business.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${business.active ? 'bg-green-500' : 'bg-gray-400'}`}/>
              {business.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">calificar.ar/r/{business.slug}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={toggleActive}
            className="text-sm border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600">
            {business.active ? 'Pausar' : 'Activar'}
          </button>
          <Link href={funnelUrl} target="_blank"
            className="text-sm border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600">
            Ver funnel ↗
          </Link>
          <Link href={`/dashboard/negocios/${business.id}/empleados/nuevo`}
            className="text-sm bg-gray-900 text-white rounded-xl px-4 py-2 hover:bg-gray-700 transition-colors font-semibold">
            + Empleado
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: '📱', label: 'Scans totales', value: business.total_scans ?? 0, sub: '', color: 'text-gray-900' },
          { icon: '⭐', label: 'Positivos → Google', value: business.positive_scans ?? 0,
            sub: business.total_scans ? `${Math.round(((business.positive_scans??0)/(business.total_scans||1))*100)}% del total` : '—',
            color: 'text-amber-500' },
          { icon: '🛡️', label: 'Filtrados (privados)', value: business.negative_scans ?? 0,
            sub: business.total_scans ? `${Math.round(((business.negative_scans??0)/(business.total_scans||1))*100)}% del total` : '—',
            color: 'text-green-600' },
          { icon: '💬', label: 'Feedback sin leer', value: unreadFeedback,
            sub: unreadFeedback > 0 ? 'Requiere atención' : 'Todo leído',
            color: unreadFeedback > 0 ? 'text-red-500' : 'text-gray-900', alert: unreadFeedback > 0 },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border p-4 ${s.alert ? 'border-red-200' : 'border-gray-100'}`}>
            <div className="text-lg mb-2">{s.icon}</div>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* QR */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Código QR y link del funnel</h2>
          <div className="flex gap-4 items-start mb-4">
            <div className="border border-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              <canvas ref={canvasRef} className="block"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Listo para imprimir</p>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">Pegalo en tu cartel NFC o imprimilo y enmarcalo.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => downloadQR('png')}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-2">
                  ↓ Descargar PNG
                </button>
                <button onClick={() => downloadQR('svg')}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-2">
                  ↓ Descargar SVG
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
            <span className="text-xs text-gray-500 font-mono flex-1 truncate">{funnelUrl}</span>
            <button onClick={copyUrl}
              className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          {unreadFeedback > 0 && (
            <Link href="/dashboard/feedback"
              className="mt-3 flex items-center gap-2 text-xs text-red-500 font-semibold hover:text-red-700">
              <span className="w-2 h-2 bg-red-500 rounded-full"/>
              {unreadFeedback} feedback sin leer →
            </Link>
          )}
        </div>

        {/* CHART */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Actividad — últimos 7 días</h2>
          <div className="flex items-end gap-2 h-28 mb-2">
            {weeklyScans.map((d, i) => {
              const pct = maxScans > 0 ? (d.total / maxScans) * 100 : 0
              const day = DAY_LABELS[new Date(d.date + 'T12:00:00').getDay()]
              const isToday = d.date === new Date().toISOString().split('T')[0]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full relative"
                    style={{ height: `${Math.max(pct, 4)}%` }}>
                    <div className="w-full h-full rounded-t-md transition-all"
                      style={{ background: isToday ? '#111' : '#F59E0B', opacity: d.total === 0 ? 0.2 : 0.85 }}/>
                    {d.total > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {d.total}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] ${isToday ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{day}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400">Esta semana</p>
              <p className="text-lg font-bold text-gray-900">{weeklyScans.reduce((s,d)=>s+d.total,0)} scans</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">→ Google</p>
              <p className="text-lg font-bold text-amber-500">{weeklyScans.reduce((s,d)=>s+d.positive,0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Filtrados</p>
              <p className="text-lg font-bold text-green-600">{weeklyScans.reduce((s,d)=>s+d.total-d.positive,0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* SETTINGS */}
        <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Configuración</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Link de reseñas de Google</label>
              <input value={form.google_review_url} onChange={e => setForm(f=>({...f,google_review_url:e.target.value}))}
                placeholder="https://g.page/r/..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">WhatsApp para feedback negativo</label>
              <input value={form.whatsapp_number} onChange={e => setForm(f=>({...f,whatsapp_number:e.target.value}))}
                placeholder="5491100000000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Umbral — {form.threshold}★ o menos → feedback privado
              </label>
              <input type="range" min="1" max="4" value={form.threshold}
                onChange={e => setForm(f=>({...f,threshold:parseInt(e.target.value)}))}
                className="w-full accent-amber-500"/>
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                <span>1★ — filtrar casi todo</span><span>4★ — filtrar muchos</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Feedback negativo va a</label>
              <div className="flex gap-2">
                {[['whatsapp','📲 WhatsApp'],['form','📝 Formulario']].map(([v,l])=>(
                  <label key={v} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${form.negative_redirect===v?'border-gray-900 bg-gray-50 font-semibold':'border-gray-200 text-gray-500'}`}>
                    <input type="radio" name="nr" value={v} checked={form.negative_redirect===v}
                      onChange={()=>setForm(f=>({...f,negative_redirect:v}))} className="hidden"/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Color principal</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.primary_color} onChange={e=>setForm(f=>({...f,primary_color:e.target.value}))}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
                  <span className="text-xs font-mono text-gray-400">{form.primary_color}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Color estrellas</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.accent_color} onChange={e=>setForm(f=>({...f,accent_color:e.target.value}))}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
                  <span className="text-xs font-mono text-gray-400">{form.accent_color}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
            <button type="submit" disabled={saving}
              className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saveMsg && <span className={`text-sm font-semibold ${saveMsg.includes('✓')?'text-green-600':'text-red-500'}`}>{saveMsg}</span>}
          </div>
        </form>

        {/* EMPLEADOS */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm">Ranking de empleados</h2>
            <Link href={`/dashboard/negocios/${business.id}/empleados/nuevo`}
              className="text-xs text-gray-500 hover:text-gray-700">+ Agregar</Link>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-1">Sin empleados todavía</p>
              <p className="text-xs text-gray-300 mb-3">Cada empleado tiene su propio QR personalizado</p>
              <Link href={`/dashboard/negocios/${business.id}/empleados/nuevo`}
                className="text-xs text-gray-900 font-semibold underline underline-offset-2">
                Agregar primer empleado →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((emp, i) => {
                const maxEmp = Math.max(...employees.map(e=>e.total_scans), 1)
                const pct = Math.round((emp.total_scans/maxEmp)*100)
                return (
                  <div key={emp.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-300 w-4">{i+1}°</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{emp.name}</span>
                        <span className="text-xs text-gray-400">{emp.total_scans} scans</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400 transition-all" style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                    <button onClick={async()=>{
                      await navigator.clipboard.writeText(`${business.id}/r/${business.slug}?emp=${emp.slug}`)
                    }} className="text-xs border border-gray-100 rounded-lg px-2 py-1 text-gray-400 hover:text-gray-700 hover:border-gray-200 transition-colors">
                      QR
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            <span>QR por empleado disponible en plan Pro</span>
            <Link href="/dashboard/plan" className="text-gray-700 font-semibold hover:underline ml-auto">Mejorar →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
