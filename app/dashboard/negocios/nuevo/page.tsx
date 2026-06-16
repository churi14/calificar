'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

export default function NuevoNegocioPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', google_review_url: '', whatsapp_number: '',
    negative_redirect: 'whatsapp', threshold: '3',
    primary_color: '#111111', accent_color: '#F59E0B'
  })
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(val: string) {
    setForm(f => ({ ...f, name: val }))
    setSlug(slugify(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado'); setLoading(false); return }

    const { error } = await supabase.from('businesses').insert({
      owner_id: user.id,
      name: form.name,
      slug: slug || slugify(form.name),
      google_review_url: form.google_review_url,
      whatsapp_number: form.whatsapp_number.replace(/\D/g, ''),
      negative_redirect: form.negative_redirect,
      threshold: parseInt(form.threshold),
      primary_color: form.primary_color,
      accent_color: form.accent_color
    })

    if (error) {
      setError(error.code === '23505' ? 'Ya existe un local con ese nombre. Cambiá el nombre.' : error.message)
      setLoading(false)
    } else {
      router.push('/dashboard/negocios')
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/negocios" className="text-sm text-gray-500 hover:text-gray-700">← Volver</Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Nuevo local</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre del local *</label>
          <input value={form.name} onChange={e => handleNameChange(e.target.value)} required
            placeholder="Ej: Café El Molino"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
          {slug && (
            <p className="text-xs text-gray-400 mt-1.5">
              URL del funnel: <span className="font-semibold text-gray-600">calificar.ar/r/{slug}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Link de reseñas de Google *</label>
          <input value={form.google_review_url} onChange={e => setForm(f => ({ ...f, google_review_url: e.target.value }))} required
            placeholder="https://g.page/r/..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
          <p className="text-xs text-gray-400 mt-1">En Google Maps → tu negocio → Compartir → Copiar enlace de reseñas</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp del local (para feedback negativo)</label>
          <input value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
            placeholder="5491123867934"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Umbral de estrellas — {form.threshold}★ o menos → feedback privado
          </label>
          <input type="range" min="1" max="4" value={form.threshold}
            onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
            className="w-full accent-amber-500"/>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1★ (filtrar casi todo)</span>
            <span>4★ (filtrar muchos)</span>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Con {form.threshold}★: los clientes con {form.threshold} estrella{parseInt(form.threshold)>1?'s':''} o menos van al feedback privado, {parseInt(form.threshold)+1}★ o más van a Google.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Redirigir feedback negativo a</label>
          <div className="flex gap-3">
            {[['whatsapp', '📲 WhatsApp'], ['form', '📝 Formulario privado']].map(([val, label]) => (
              <label key={val} className={`flex items-center gap-2 flex-1 p-3 rounded-xl border cursor-pointer transition-colors ${form.negative_redirect === val ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                <input type="radio" name="redirect" value={val} checked={form.negative_redirect === val}
                  onChange={() => setForm(f => ({ ...f, negative_redirect: val }))} className="hidden"/>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Color principal</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
              <span className="text-sm text-gray-500 font-mono">{form.primary_color}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Color estrellas</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"/>
              <span className="text-sm text-gray-500 font-mono">{form.accent_color}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
          {loading ? 'Creando...' : 'Crear local'}
        </button>
      </form>
    </div>
  )
}

