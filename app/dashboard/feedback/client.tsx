'use client'

import { useState } from 'react'

type FeedbackItem = {
  id: string; created_at: string; business_id: string
  rating: number; message: string | null
  nombre: string | null; email: string | null
  whatsapp: string | null; photo_url: string | null
  read: boolean
  businesses: { name: string } | null
}

type Filter = 'todos' | 'sin-leer' | 'negativos' | 'positivos'

const CARD = 'bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'

function fmt(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60)   return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

async function markRead(id: string) {
  await fetch('/api/feedback', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
}

export default function FeedbackClient({ feedback, businesses }: {
  feedback: FeedbackItem[]
  businesses: { id: string; name: string }[]
}) {
  const [filter,     setFilter]   = useState<Filter>('todos')
  const [selected,   setSelected] = useState<FeedbackItem | null>(null)
  const [items,      setItems]    = useState(feedback)
  const [zoomPhoto,  setZoomPhoto] = useState<string | null>(null)

  function open(f: FeedbackItem) {
    setSelected(f)
    if (!f.read) {
      markRead(f.id)
      setItems(prev => prev.map(i => i.id === f.id ? { ...i, read: true } : i))
    }
  }

  const filtered = items.filter(f => {
    if (filter === 'sin-leer')  return !f.read
    if (filter === 'negativos') return f.rating <= 3
    if (filter === 'positivos') return f.rating >= 4
    return true
  })

  const sinLeer   = items.filter(f => !f.read).length
  const negativos = items.filter(f => f.rating <= 3).length
  const positivos = items.filter(f => f.rating >= 4).length

  return (
    <div>
      {/* MODAL DETALLE */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={() => setSelected(null)}/>
          <div className="relative bg-white rounded-[2rem] max-w-md w-full shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-700 text-2xl leading-none">×</button>

            {/* Estrellas + fecha */}
            <div className="flex items-center gap-2 mb-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="18" height="18" viewBox="0 0 24 24"
                  fill={s <= selected.rating ? '#FBBF24' : '#E5E7EB'}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
              <span className="text-xs text-gray-400 ml-1">{fmt(selected.created_at)}</span>
              {selected.businesses && (
                <span className="ml-auto text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  {selected.businesses.name}
                </span>
              )}
            </div>

            <h3 className="font-display font-extrabold text-[#0F172A] text-xl mb-4">Feedback privado</h3>

            {/* Comentario */}
            <div className="bg-[#F5EFE7] rounded-2xl p-5 mb-5">
              <p className="text-gray-700 leading-relaxed italic">"{selected.message || 'Sin mensaje'}"</p>
            </div>

            {/* Foto */}
            {selected.photo_url && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Foto adjunta</p>
                <img src={selected.photo_url} alt="Foto del cliente"
                  onClick={() => setZoomPhoto(selected.photo_url)}
                  className="w-full max-h-48 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm"/>
              </div>
            )}

            {/* Datos del cliente */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos del cliente</p>
              {selected.nombre ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 w-20 flex-shrink-0">Nombre</span>
                  <span className="font-medium text-gray-800">{selected.nombre}</span>
                </div>
              ) : null}
              {selected.email ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 w-20 flex-shrink-0">Email</span>
                  <a href={`mailto:${selected.email}`}
                    className="font-medium text-blue-600 hover:underline">{selected.email}</a>
                </div>
              ) : null}
              {selected.whatsapp ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 w-20 flex-shrink-0">WhatsApp</span>
                  <span className="font-medium text-gray-800">{selected.whatsapp}</span>
                </div>
              ) : null}
              {!selected.nombre && !selected.email && !selected.whatsapp && (
                <p className="text-sm text-gray-400 italic">El cliente no dejó datos de contacto.</p>
              )}
            </div>

            {/* Botones de contacto */}
            <div className="space-y-2">
              {selected.whatsapp && (
                <a href={`https://wa.me/549${selected.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola! Vi tu comentario sobre tu experiencia en ${selected.businesses?.name ?? 'nuestro local'} y quería hablar con vos.`)}`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 bg-[#056E4B] text-white font-bold py-3.5 rounded-full hover:bg-[#045c3f] transition-colors shadow-md">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}?subject=Tu experiencia en ${selected.businesses?.name ?? 'nuestro local'}&body=Hola! Vimos tu comentario y queremos resolverlo.`}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3.5 rounded-full hover:bg-gray-700 transition-colors">
                  ✉️ Responder por email
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ZOOM FOTO */}
      {zoomPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setZoomPhoto(null)}>
          <img src={zoomPhoto} alt="" className="max-w-2xl w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"/>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Feedback privado</h1>
        <p className="text-sm text-gray-400 mt-0.5">Comentarios que no llegaron a Google</p>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap mb-6">
        {([
          { key: 'todos',     label: `Todos (${items.length})` },
          { key: 'sin-leer',  label: `Sin leer (${sinLeer})`,  badge: sinLeer > 0 },
          { key: 'negativos', label: `Negativos (${negativos})` },
          { key: 'positivos', label: `Positivos (${positivos})` },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-all border
              ${filter === f.key
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : (f as any).badge
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {filtered.length === 0 ? (
        <div className={`${CARD} p-12 text-center`}>
          <p className="text-4xl mb-4">💬</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sin feedback en esta categoría</h2>
          <p className="text-sm text-gray-400">Probá otro filtro o esperá a que lleguen nuevos comentarios.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <button key={f.id} onClick={() => open(f)}
              className={`w-full text-left ${CARD} px-5 py-4 transition-all hover:shadow-lg group border-2
                ${!f.read && f.rating <= 3 ? 'border-red-100' : 'border-transparent'}`}>
              <div className="flex items-start gap-4">

                {/* Indicador de leído */}
                <div className="flex-shrink-0 pt-1">
                  <div className={`w-2 h-2 rounded-full ${!f.read ? 'bg-red-500' : 'bg-transparent'}`}/>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Estrellas */}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
                          fill={s <= f.rating ? '#FBBF24' : '#E5E7EB'}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    {f.businesses && (
                      <span className="text-xs text-gray-400 font-medium">{f.businesses.name}</span>
                    )}
                    <span className="ml-auto text-xs text-gray-300">{fmt(f.created_at)}</span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 italic mb-2">
                    "{f.message || 'Sin mensaje'}"
                  </p>

                  {/* Tags de datos recolectados */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {f.nombre   && <span className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">👤 {f.nombre}</span>}
                    {f.email    && <span className="text-[11px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">✉️ email</span>}
                    {f.whatsapp && <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">💬 whatsapp</span>}
                    {f.photo_url && <span className="text-[11px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">📷 foto</span>}
                  </div>
                </div>

                {/* Foto miniatura */}
                {f.photo_url && (
                  <img src={f.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm"/>
                )}

                <span className="text-gray-300 group-hover:text-gray-500 text-lg flex-shrink-0 self-center">→</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
