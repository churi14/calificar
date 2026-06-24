'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Business = {
  id: string; name: string; slug: string; active: boolean
  google_review_url: string | null; whatsapp_number: string | null
  negative_redirect: string; threshold: number
  primary_color: string; accent_color: string
}

export default function BusinessEditor({ business, clientId }: { business: Business; clientId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name:              business.name,
    google_review_url: business.google_review_url ?? '',
    whatsapp_number:   business.whatsapp_number ?? '',
    negative_redirect: business.negative_redirect,
    threshold:         business.threshold,
    primary_color:     business.primary_color,
    accent_color:      business.accent_color,
  })

  function set(key: string, val: string | number) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/update-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bizId: business.id, ...form })
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('Guardado ✓')
      router.refresh()
    } else {
      setMsg(`Error: ${data.error ?? res.status}`)
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
  }

  async function toggleActive() {
    setToggling(true)
    const res = await fetch('/api/admin/update-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bizId: business.id, active: !business.active })
    })
    if (res.ok) router.refresh()
    setToggling(false)
  }

  const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300'
  const LABEL = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Estado + link funnel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Estado</h2>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <span className="text-sm text-gray-500">Estado actual</span>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${business.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {business.active ? 'Activo' : 'Pausado'}
          </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <span className="text-sm text-gray-500">Link funnel</span>
          <a href={`https://calificar.com.ar/r/${business.slug}`} target="_blank"
            className="text-xs text-blue-500 hover:underline font-mono">
            /r/{business.slug}
          </a>
        </div>

        <button
          onClick={toggleActive}
          disabled={toggling}
          className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
            business.active
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {toggling ? 'Aplicando...' : business.active ? 'Pausar local' : 'Activar local'}
        </button>
      </div>

      {/* Formulario edición */}
      <div className="lg:col-span-2">
        <form onSubmit={save} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-bold text-gray-900">Configuración del local</h2>

          {msg && (
            <div className={`text-sm p-3 rounded-xl border ${msg.includes('✓') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {msg}
            </div>
          )}

          <div>
            <label className={LABEL}>Nombre del local</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required className={INPUT}
              placeholder="Ej: Café El Molino"/>
          </div>

          <div>
            <label className={LABEL}>Link de reseñas de Google</label>
            <input value={form.google_review_url} onChange={e => set('google_review_url', e.target.value)}
              className={INPUT} placeholder="https://g.page/r/..." type="url"/>
            <p className="text-xs text-gray-400 mt-1">En Google Maps → tu negocio → Compartir → Copiar enlace de reseñas</p>
          </div>

          <div>
            <label className={LABEL}>WhatsApp (para feedback negativo)</label>
            <input value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)}
              className={INPUT} placeholder="5491155667788" type="tel"/>
          </div>

          <div>
            <label className={LABEL}>
              Umbral de estrellas — {form.threshold}★ o menos → privado
            </label>
            <input type="range" min="1" max="4" value={form.threshold}
              onChange={e => set('threshold', parseInt(e.target.value))}
              className="w-full accent-amber-500"/>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1★ (filtrar casi todo)</span>
              <span>4★ (filtrar muchos)</span>
            </div>
          </div>

          <div>
            <label className={LABEL}>Redirigir feedback negativo a</label>
            <div className="flex gap-3">
              {[['whatsapp', '📲 WhatsApp'], ['form', '📝 Formulario privado']].map(([val, label]) => (
                <div key={val}
                  onClick={() => set('negative_redirect', val)}
                  className={`flex-1 p-3 rounded-xl border cursor-pointer transition-colors select-none ${form.negative_redirect === val ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={LABEL}>Color principal</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color} onChange={e => set('primary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
                <span className="text-sm text-gray-500 font-mono">{form.primary_color}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className={LABEL}>Color estrellas</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent_color} onChange={e => set('accent_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
                <span className="text-sm text-gray-500 font-mono">{form.accent_color}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

    </div>
  )
}
