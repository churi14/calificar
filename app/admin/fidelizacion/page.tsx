'use client'

import { useEffect, useState } from 'react'

type Program = {
  id: string
  name: string
  active: boolean
  stamps_goal: number
  reward_description: string
  color_primary: string
  logo_url: string | null
  address: string | null
  created_at: string
  businesses: { name: string; id: string } | null
  loyalty_cards: { count: number }[]
}

type Business = { id: string; name: string }



const EMPTY_FORM = {
  business_id: '',
  name: '',
  description: '',
  logo_url: '',
  cover_url: '',
  color_primary: '#7C3AED',
  stamps_goal: 10,
  reward_description: '',
  address: '',
  lat: '',
  lng: '',
}

export default function AdminFidelizacionPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/fidelizacion/admin/upload-logo', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, logo_url: data.url }))
    setUploadingLogo(false)
  }
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [cards, setCards] = useState<Record<string, unknown>[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [newBizName, setNewBizName] = useState('')
  const [creatingBiz, setCreatingBiz] = useState(false)
  const [showNewBiz, setShowNewBiz] = useState(false)
  const [promoModal, setPromoModal] = useState<string | null>(null) // program_id
  const [promoForm, setPromoForm] = useState({ title: '', body: '' })
  const [promoSending, setPromoSending] = useState(false)
  const [promoResult, setPromoResult] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [progRes, bizRes] = await Promise.all([
      fetch('/api/fidelizacion/admin'),
      fetch('/api/fidelizacion/admin/businesses'),
    ])
    const { programs: p } = await progRes.json()
    const { businesses: b } = await bizRes.json()
    setPrograms(p ?? [])
    setBusinesses(b ?? [])
    setLoading(false)
  }

  async function loadCards(programId: string) {
    setLoadingCards(true)
    setSelectedProgram(programId)
    const res = await fetch(`/api/fidelizacion/admin/cards?program_id=${programId}`)
    const { cards: c } = await res.json()
    setCards(c ?? [])
    setLoadingCards(false)
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(p: Program) {
    setForm({
      business_id: p.businesses?.id ?? '',
      name: p.name,
      description: '',
      logo_url: p.logo_url ?? '',
      cover_url: '',
      color_primary: p.color_primary,
      stamps_goal: p.stamps_goal,
      reward_description: p.reward_description,
      address: p.address ?? '',
      lat: '',
      lng: '',
    })
    setEditId(p.id)
    setShowForm(true)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Borrar "${name}"? Se eliminarán todos los clientes y sellos. Esta acción no se puede deshacer.`)) return
    await fetch(`/api/fidelizacion/admin?id=${id}`, { method: 'DELETE' })
    load()
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      stamps_goal: Number(form.stamps_goal),
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      ...(editId ? { id: editId } : {}),
    }

    await fetch('/api/fidelizacion/admin', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)
    setShowForm(false)
    load()
  }

  async function createBusiness() {
    if (!newBizName.trim()) return
    setCreatingBiz(true)
    const res = await fetch('/api/fidelizacion/admin/create-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBizName.trim() }),
    })
    const data = await res.json()
    if (data.business) {
      setBusinesses(prev => [...prev, data.business])
      setForm(f => ({ ...f, business_id: data.business.id }))
      setNewBizName('')
      setShowNewBiz(false)
    }
    setCreatingBiz(false)
  }

  async function sendPromo() {
    if (!promoModal || !promoForm.title || !promoForm.body) return
    setPromoSending(true)
    setPromoResult(null)

    // promoModal puede ser "program_id" o "card:card_id:program_id"
    const isIndividual = promoModal.startsWith('card:')
    const body = isIndividual
      ? { card_id: promoModal.split(':')[1], program_id: promoModal.split(':')[2], ...promoForm }
      : { program_id: promoModal, ...promoForm }

    const res = await fetch('/api/fidelizacion/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setPromoSending(false)
    setPromoResult(data.sent !== undefined ? `✓ Enviado a ${data.sent} destinatario${data.sent !== 1 ? 's' : ''}` : '❌ Error al enviar')
  }

  const selectedProgramData = programs.find(p => p.id === selectedProgram)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Fidelización</h1>
          <p className="text-sm text-gray-500 mt-0.5">Programas de puntos y sellos por negocio</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nuevo programa
        </button>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editId ? 'Editar programa' : 'Nuevo programa'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Negocio</label>
                <select
                  value={form.business_id}
                  onChange={e => setForm(f => ({ ...f, business_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">Seleccioná un negocio</option>
                  {businesses.map((b: Business) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {!showNewBiz ? (
                  <button
                    type="button"
                    onClick={() => setShowNewBiz(true)}
                    className="mt-1.5 text-xs text-violet-600 font-semibold hover:underline"
                  >
                    + Crear negocio nuevo
                  </button>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      value={newBizName}
                      onChange={e => setNewBizName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createBusiness()}
                      placeholder="Nombre del negocio"
                      className="flex-1 border border-violet-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    <button
                      type="button"
                      onClick={createBusiness}
                      disabled={creatingBiz || !newBizName.trim()}
                      className="bg-violet-600 text-white text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50"
                    >
                      {creatingBiz ? '...' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewBiz(false); setNewBizName('') }}
                      className="text-gray-400 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre del programa</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Club de puntos, Tarjeta frecuente..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Sellos para premio</label>
                  <input
                    type="number"
                    value={form.stamps_goal}
                    onChange={e => setForm(f => ({ ...f, stamps_goal: Number(e.target.value) }))}
                    min={1}
                    max={50}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Color primario</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={form.color_primary}
                      onChange={e => setForm(f => ({ ...f, color_primary: e.target.value }))}
                      placeholder="#7C3AED"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    <label className="cursor-pointer flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-violet-400 transition-colors"
                        style={{ backgroundColor: form.color_primary }}
                      />
                      <input
                        type="color"
                        value={form.color_primary}
                        onChange={e => setForm(f => ({ ...f, color_primary: e.target.value }))}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Premio al completar</label>
                <input
                  value={form.reward_description}
                  onChange={e => setForm(f => ({ ...f, reward_description: e.target.value }))}
                  placeholder="Café gratis, 20% de descuento..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Logo del negocio</label>
                <div className="flex items-center gap-3">
                  {form.logo_url && (
                    <img src={form.logo_url} alt="" className="w-14 h-14 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1 flex-shrink-0" />
                  )}
                  <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-3 px-4 cursor-pointer transition-colors ${uploadingLogo ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50'}`}>
                    <span className="text-xs font-semibold text-gray-500">
                      {uploadingLogo ? 'Subiendo...' : form.logo_url ? '📁 Cambiar logo' : '📁 Subir logo (.png, .svg, .jpg)'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f) }}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
                {form.logo_url && (
                  <input
                    value={form.logo_url}
                    onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-400 mt-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Dirección del local</label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Av. Corrientes 1234, CABA"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Latitud (GPS)</label>
                  <input
                    value={form.lat}
                    onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                    placeholder="-34.6037"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Longitud (GPS)</label>
                  <input
                    value={form.lng}
                    onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                    placeholder="-58.3816"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Las coordenadas GPS permiten que Google Wallet notifique al cliente cuando está cerca del local.
                Buscá la dirección en Google Maps, clic derecho → "¿Qué hay aquí?" para copiar lat/lng.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.business_id || !form.name || !form.reward_description}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear programa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal enviar promoción */}
      {promoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Enviar promoción 🔔</h2>
            <p className="text-xs text-gray-400 mb-5">
              Se enviará una notificación push a todos los clientes del programa que la tengan activada.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Título</label>
                <input
                  value={promoForm.title}
                  onChange={e => setPromoForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="¡Oferta especial hoy!"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mensaje</label>
                <textarea
                  value={promoForm.body}
                  onChange={e => setPromoForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Hoy 2x1 en postres. ¡Vení a verlo!"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>
            </div>

            {promoResult && (
              <p className={`text-sm font-semibold mt-4 ${promoResult.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {promoResult}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setPromoModal(null); setPromoForm({ title: '', body: '' }); setPromoResult(null) }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={sendPromo}
                disabled={promoSending || !promoForm.title || !promoForm.body}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {promoSending ? 'Enviando...' : 'Enviar notificación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de programas */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎴</p>
          <p className="font-semibold">No hay programas todavía</p>
          <p className="text-sm mt-1">Creá el primero para empezar.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {programs.map(p => {
            const cardCount = p.loyalty_cards?.[0]?.count ?? 0
            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: p.color_primary }}
                    >
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="w-full h-full object-contain p-1" />
                      ) : '★'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.businesses?.name ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      onClick={() => openEdit(p)}
                      className="text-xs text-violet-600 font-semibold hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-xs text-red-400 font-semibold hover:underline"
                    >
                      Borrar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-gray-900">{cardCount}</p>
                    <p className="text-xs text-gray-400">clientes</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-gray-900">{p.stamps_goal}</p>
                    <p className="text-xs text-gray-400">sellos/premio</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center truncate">
                    <p className="text-sm font-bold text-gray-900 truncate">{p.reward_description}</p>
                    <p className="text-xs text-gray-400">premio</p>
                  </div>
                </div>

                {/* Links útiles */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <a
                    href={`/fidelizacion/unirse?program=${p.id}`}
                    target="_blank"
                    className="bg-violet-50 text-violet-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    🔗 Link de registro
                  </a>
                  <a
                    href={`/fidelizacion/stamp?program=${p.id}`}
                    target="_blank"
                    className="bg-amber-50 text-amber-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    📡 URL del NFC
                  </a>
                  <button
                    onClick={() => selectedProgram === p.id ? setSelectedProgram(null) : loadCards(p.id)}
                    className="bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {selectedProgram === p.id ? '▲ Ocultar clientes' : '▼ Ver clientes'}
                  </button>
                  <button
                    onClick={() => { setPromoModal(p.id); setPromoForm({ title: '', body: '' }); setPromoResult(null) }}
                    className="bg-violet-50 text-violet-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    🔔 Enviar promo
                  </button>
                </div>

                {/* QR de registro para imprimir */}
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">QR de registro</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${p.id}`)}&color=0F172A&bgcolor=FFFFFF&qzone=1`}
                      alt="QR registro"
                      width={100}
                      height={100}
                      className="rounded-xl border border-gray-100"
                    />
                    <div className="text-xs text-gray-500">
                      <p className="font-semibold text-gray-700 mb-1">Escaneá para unirte</p>
                      <p className="text-[11px] break-all text-gray-400">{`calificar.com.ar/fidelizacion/unirse?program=${p.id}`}</p>
                      <a
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`https://calificar.com.ar/fidelizacion/unirse?program=${p.id}`)}&color=0F172A&bgcolor=FFFFFF&qzone=2`}
                        download={`qr-registro-${p.id}.png`}
                        className="inline-block mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1 rounded-lg text-[11px] transition-colors"
                      >
                        ⬇ Descargar QR
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tabla de clientes */}
                {selectedProgram === p.id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {loadingCards ? (
                      <p className="text-xs text-gray-400 text-center py-4">Cargando...</p>
                    ) : cards.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">Sin clientes todavía.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-100">
                            <th className="text-left pb-2">Nombre</th>
                            <th className="text-left pb-2">Teléfono</th>
                            <th className="text-center pb-2">Sellos</th>
                            <th className="text-center pb-2">Visitas</th>
                            <th className="text-left pb-2">Cumple</th>
                            <th className="text-left pb-2">Desde</th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(cards as Record<string, unknown>[]).map((c) => (
                            <tr key={c.id as string} className="hover:bg-gray-50">
                              <td className="py-2 font-medium text-gray-900">{c.name as string || '—'}</td>
                              <td className="py-2 text-gray-500">{c.phone as string}</td>
                              <td className="py-2 text-center">
                                <span className="font-bold text-violet-700">{c.stamps as number}</span>
                                <span className="text-gray-400">/{p.stamps_goal}</span>
                              </td>
                              <td className="py-2 text-center text-gray-500">{c.total_visits as number}</td>
                              <td className="py-2 text-gray-400">
                                {c.birth_date ? new Date(c.birth_date as string).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '—'}
                              </td>
                              <td className="py-2 text-gray-400">
                                {new Date(c.created_at as string).toLocaleDateString('es-AR')}
                              </td>
                              <td className="py-2">
                                <button
                                  onClick={() => { setPromoModal(`card:${c.id as string}:${p.id}`); setPromoForm({ title: '', body: '' }); setPromoResult(null) }}
                                  className="text-[10px] bg-violet-50 hover:bg-violet-100 text-violet-600 font-semibold px-2 py-1 rounded-lg transition-colors"
                                >
                                  📣
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
