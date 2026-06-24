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
type RawScan = { created_at: string; outcome: string; employee_id: string | null; employee_name: string | null }
type Employee = { id: string; name: string; total_scans: number; slug: string }

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const CARD = 'bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
const INPUT = 'w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-300 transition-shadow'
const LABEL = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'

export default function BusinessDetailClient({
  business, weeklyScans, rawScans, employees, unreadFeedback, appUrl
}: {
  business: Business
  weeklyScans: DayScan[]
  rawScans: RawScan[]
  employees: Employee[]
  unreadFeedback: number
  appUrl: string
}) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(business.logo_url)
  const [logoUploading, setLogoUploading] = useState(false)
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('El logo debe pesar menos de 2MB'); return }

    setLogoUploading(true)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const fileName = `${business.id}.${ext}`
    const supabase = createClient()

    const { error: storageError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { contentType: file.type, upsert: true })

    if (storageError) {
      alert('Error al subir el logo: ' + storageError.message)
      setLogoUploading(false)
      return
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(fileName)
    const publicUrl = data.publicUrl + '?t=' + Date.now() // cache-bust

    await supabase.from('businesses').update({ logo_url: publicUrl }).eq('id', business.id)
    setLogoUrl(publicUrl)
    setLogoUploading(false)
  }

  async function removeLogo() {
    const supabase = createClient()
    await supabase.from('businesses').update({ logo_url: null }).eq('id', business.id)
    setLogoUrl(null)
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3">
        <div>
          <Link href="/dashboard/negocios" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2 transition-colors">
            ← Mis locales
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${business.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${business.active ? 'bg-green-500' : 'bg-gray-400'}`}/>
              {business.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">calificar.com.ar/r/{business.slug}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={toggleActive}
            className={`text-sm rounded-xl px-4 py-2.5 transition-colors text-gray-600 font-medium ${CARD} hover:bg-gray-50`}>
            {business.active ? 'Pausar' : 'Activar'}
          </button>
          <Link href={funnelUrl} target="_blank"
            className={`text-sm rounded-xl px-4 py-2.5 transition-colors text-gray-600 font-medium ${CARD} hover:bg-gray-50`}>
            Ver funnel ↗
          </Link>
          <Link href={`/dashboard/negocios/${business.id}/empleados/nuevo`}
            className="text-sm bg-gray-900 text-white rounded-xl px-4 py-2.5 hover:bg-gray-700 transition-colors font-semibold">
            + Empleado
          </Link>
        </div>
      </div>

      {/* OVERVIEW — métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Scans totales', labelMobile: 'Scans', value: business.total_scans ?? 0, sub: null as string | null, accent: 'text-gray-900' },
          { label: 'Positivos → Google', labelMobile: 'Positivos', value: business.positive_scans ?? 0,
            sub: business.total_scans ? `${Math.round(((business.positive_scans??0)/(business.total_scans||1))*100)}%` : null,
            accent: 'text-gray-900' },
          { label: 'Filtrados (privados)', labelMobile: 'Filtrados', value: business.negative_scans ?? 0,
            sub: business.total_scans ? `${Math.round(((business.negative_scans??0)/(business.total_scans||1))*100)}%` : null,
            accent: 'text-gray-900' },
          { label: 'Feedback sin leer', labelMobile: 'Sin leer', value: unreadFeedback, sub: null,
            accent: unreadFeedback > 0 ? 'text-red-500' : 'text-gray-900', alert: unreadFeedback > 0 },
        ].map(s => (
          <div key={s.label} className={`${CARD} p-4 md:p-6`}>
            <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">
              <span className="md:hidden">{s.labelMobile}</span>
              <span className="hidden md:inline">{s.label}</span>
            </p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${s.accent}`}>{s.value}</p>
              {s.sub && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  {s.sub} del total
                </span>
              )}
            </div>
            {s.label === 'Feedback sin leer' && (
              <p className={`text-xs mt-2 ${s.alert ? 'text-red-400' : 'text-gray-300'}`}>
                {s.alert ? 'Requiere atención' : 'Todo leído'}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* GRID PRINCIPAL — 12 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUMNA IZQUIERDA — QR + Configuración */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* QR */}
          <div className={`${CARD} p-6`}>
            <h2 className="font-bold text-gray-900 text-base mb-5">Código QR y link del funnel</h2>
            <div className="flex flex-col sm:flex-row gap-5 items-start mb-5">
              <div className="bg-gray-50 rounded-2xl p-3 flex-shrink-0 self-center sm:self-start">
                <canvas ref={canvasRef} className="block rounded-lg"/>
              </div>
              <div className="w-full">
                <p className="text-sm font-semibold text-gray-800 mb-1">Listo para imprimir</p>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Pegalo en tu cartel NFC o imprimilo y enmarcalo.</p>
                <div className="flex sm:flex-col gap-2">
                  <button onClick={() => downloadQR('png')}
                    className="flex-1 sm:flex-none text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 transition-colors text-gray-600 flex items-center justify-center sm:justify-start gap-2 font-medium">
                    ↓ Descargar PNG
                  </button>
                  <button onClick={() => downloadQR('svg')}
                    className="flex-1 sm:flex-none text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 transition-colors text-gray-600 flex items-center justify-center sm:justify-start gap-2 font-medium">
                    ↓ Descargar SVG
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-500 font-mono flex-1 truncate">{funnelUrl}</span>
              <button onClick={copyUrl}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            {unreadFeedback > 0 && (
              <Link href="/dashboard/feedback"
                className="mt-4 flex items-center gap-2 text-sm text-red-500 font-semibold hover:text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full"/>
                {unreadFeedback} feedback sin leer →
              </Link>
            )}
          </div>

          {/* CONFIGURACIÓN */}
          <form onSubmit={saveSettings} className={`${CARD} p-6`}>
            <h2 className="font-bold text-gray-900 text-base mb-5">Configuración</h2>

            <div className="space-y-5">

              {/* LOGO */}
              <div>
                <label className={LABEL}>Logo del local</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ background: logoUrl ? 'transparent' : form.primary_color + '22' }}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoUploading ? (
                      <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1"/>
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: form.primary_color }}>
                        {business.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => logoInputRef.current?.click()}
                      className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                      {logoUrl ? 'Cambiar logo' : 'Subir logo'}
                    </button>
                    {logoUrl && (
                      <button type="button" onClick={removeLogo}
                        className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                        Quitar logo
                      </button>
                    )}
                    <p className="text-[10px] text-gray-300">PNG, JPG o SVG · máx 2MB</p>
                  </div>
                </div>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden" onChange={handleLogoUpload}/>
              </div>

              <div>
                <label className={LABEL}>Link de reseñas de Google</label>
                <input value={form.google_review_url} onChange={e => setForm(f=>({...f,google_review_url:e.target.value}))}
                  placeholder="https://g.page/r/..."
                  className={INPUT}/>
              </div>

              <div>
                <label className={LABEL}>WhatsApp para feedback negativo</label>
                <input value={form.whatsapp_number} onChange={e => setForm(f=>({...f,whatsapp_number:e.target.value}))}
                  placeholder="5491123867934"
                  className={INPUT}/>
              </div>

              <div>
                <label className={`${LABEL} mb-3`}>
                  Umbral — {form.threshold}★ o menos → feedback privado
                </label>
                <input type="range" min="1" max="4" value={form.threshold}
                  onChange={e => setForm(f=>({...f,threshold:parseInt(e.target.value)}))}
                  className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-gray-900"/>
                <div className="flex justify-between text-[10px] text-gray-300 mt-1.5">
                  <span>1★ — filtrar casi todo</span><span>4★ — filtrar muchos</span>
                </div>
              </div>

              <div>
                <label className={`${LABEL} mb-3`}>Feedback negativo va a</label>
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                  {[['whatsapp','WhatsApp'],['form','Formulario']].map(([v,l])=>(
                    <label key={v} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all ${form.negative_redirect===v?'bg-white shadow-sm text-gray-900':'text-gray-400 hover:text-gray-600'}`}>
                      <input type="radio" name="nr" value={v} checked={form.negative_redirect===v}
                        onChange={()=>setForm(f=>({...f,negative_redirect:v}))} className="hidden"/>
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={LABEL}>Color principal</label>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <input type="color" value={form.primary_color} onChange={e=>setForm(f=>({...f,primary_color:e.target.value}))}
                      className="w-7 h-7 rounded-lg border-none cursor-pointer p-0 bg-transparent"/>
                    <span className="text-xs font-mono text-gray-400">{form.primary_color}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className={LABEL}>Color estrellas</label>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <input type="color" value={form.accent_color} onChange={e=>setForm(f=>({...f,accent_color:e.target.value}))}
                      className="w-7 h-7 rounded-lg border-none cursor-pointer p-0 bg-transparent"/>
                    <span className="text-xs font-mono text-gray-400">{form.accent_color}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-50">
              <button type="submit" disabled={saving}
                className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {saveMsg && <span className={`text-sm font-semibold ${saveMsg.includes('✓')?'text-green-600':'text-red-500'}`}>{saveMsg}</span>}
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA — Actividad + Ranking */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* ACTIVIDAD */}
          <div className={`${CARD} p-6`}>
            <h2 className="font-bold text-gray-900 text-base mb-5">Actividad — últimos 7 días</h2>
            <div className="flex items-end gap-2 h-32 mb-3">
              {weeklyScans.map((d, i) => {
                const pct = maxScans > 0 ? (d.total / maxScans) * 100 : 0
                const day = DAY_LABELS[new Date(d.date + 'T12:00:00').getDay()]
                const isToday = d.date === new Date().toISOString().split('T')[0]
                const isSelected = selectedDay === d.date
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div
                      className={`w-full relative cursor-pointer ${d.total > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      onClick={() => d.total > 0 && setSelectedDay(isSelected ? null : d.date)}
                    >
                      <div className="w-full h-full rounded-t-md transition-all"
                        style={{ background: isSelected ? '#1D4ED8' : isToday ? '#3B82F6' : '#DBEAFE' }}/>
                      {d.total > 0 && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {d.total}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs ${isToday ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{day}</span>
                  </div>
                )
              })}
            </div>

            {/* DETALLE DEL DÍA SELECCIONADO */}
            {selectedDay && (() => {
              const dayScans = rawScans.filter(s => s.created_at.split('T')[0] === selectedDay)
              const label = DAY_LABELS[new Date(selectedDay + 'T12:00:00').getDay()]
              return (
                <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                    <span className="text-xs font-bold text-gray-700">{label} {selectedDay} — {dayScans.length} scans</span>
                    <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-400 hover:text-gray-700">✕</button>
                  </div>
                  {dayScans.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">Sin datos</p>
                  ) : (
                    <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                      {dayScans.map((s, i) => {
                        const hora = new Date(s.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                        return (
                          <div key={i} className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 font-mono w-12">{hora}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.outcome === 'positive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {s.outcome === 'positive' ? '→ Google' : 'Filtrado'}
                              </span>
                            </div>
                            {s.employee_name && (
                              <span className="text-[10px] text-gray-400">{s.employee_name}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-gray-50">
              <div>
                <p className="text-xs text-gray-400 mb-1">Esta semana</p>
                <p className="text-lg font-bold text-gray-900">{weeklyScans.reduce((s,d)=>s+d.total,0)} scans</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">→ Google</p>
                <p className="text-lg font-bold text-blue-500">{weeklyScans.reduce((s,d)=>s+d.positive,0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Filtrados</p>
                <p className="text-lg font-bold text-gray-900">{weeklyScans.reduce((s,d)=>s+d.total-d.positive,0)}</p>
              </div>
            </div>
            {!selectedDay && weeklyScans.some(d => d.total > 0) && (
              <p className="text-[10px] text-gray-300 mt-2 text-center">Clickeá una barra para ver el detalle</p>
            )}
          </div>

          {/* RANKING */}
          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-base">Ranking de empleados</h2>
              <Link href={`/dashboard/negocios/${business.id}/empleados/nuevo`}
                className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors">+ Agregar</Link>
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
              <div className="space-y-4">
                {employees.map((emp, i) => {
                  const maxEmp = Math.max(...employees.map(e=>e.total_scans), 1)
                  const pct = Math.round((emp.total_scans/maxEmp)*100)
                  return (
                    <div key={emp.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-5">{i+1}°</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                          <span className="text-xs text-gray-400">{emp.total_scans} scans</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gray-900 transition-all" style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                      <button onClick={async()=>{
                        await navigator.clipboard.writeText(`${business.id}/r/${business.slug}?emp=${emp.slug}`)
                      }} className="text-xs bg-gray-50 rounded-lg px-2.5 py-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        QR
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
              <span>QR por empleado disponible en plan Pro</span>
              <Link href="/dashboard/plan" className="text-gray-700 font-semibold hover:underline ml-auto">Mejorar →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}