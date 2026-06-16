'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoClientePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'free' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/admin/create-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false) }
    else router.push('/admin/clientes')
  }

  return (
    <div className="max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-gray-600">← Clientes</Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Nuevo cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>}

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nombre *</label>
          <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required
            placeholder="Nombre del dueño o local"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email *</label>
          <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required
            placeholder="cliente@email.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contraseña *</label>
          <input type="text" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required
            placeholder="Mínimo 6 caracteres"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
          <p className="text-xs text-gray-400 mt-1">Se la mandás al cliente por WhatsApp</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Plan</label>
          <div className="grid grid-cols-3 gap-2">
            {[['free','Gratis'],['basic','Básico'],['pro','Pro']].map(([v,l]) => (
              <label key={v} className={`flex items-center justify-center py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${form.plan===v?'border-gray-900 bg-gray-900 text-white':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <input type="radio" name="plan" value={v} checked={form.plan===v}
                  onChange={()=>setForm(f=>({...f,plan:v}))} className="hidden"/>
                {l}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 leading-relaxed">
          <strong>Después de crear el cliente:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Entrá al perfil del cliente → Crear negocio para él</li>
            <li>Configurar Google Maps URL y WhatsApp</li>
            <li>Descargar QR y programar el chip NFC</li>
            <li>Mandar credenciales al cliente por WhatsApp</li>
          </ol>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
          {loading ? 'Creando...' : 'Crear cliente'}
        </button>
      </form>
    </div>
  )
}