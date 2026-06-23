'use client'

import { useState, useRef } from 'react'

type Business = {
  id: string; name: string; slug: string
  google_review_url: string | null; logo_url: string | null
  whatsapp_number: string | null; negative_redirect: string
  threshold: number; primary_color: string; accent_color: string
}

type Employee = { id: string; name: string } | null
type Stage = 'rating' | 'positive' | 'negative' | 'feedback-sent'

export default function FunnelClient({ business, employee }: { business: Business; employee: Employee }) {
  const [stage,    setStage]   = useState<Stage>('rating')
  const [hovered,  setHover]   = useState(0)
  const [selected, setSel]     = useState(0)
  const [sending,  setSending] = useState(false)

  // Campos del formulario negativo
  const [message,  setMsg]     = useState('')
  const [nombre,   setNombre]  = useState('')
  const [email,    setEmail]   = useState('')
  const [wapp,     setWapp]    = useState('')
  const [foto,     setFoto]    = useState<{ base64: string; ext: string; preview: string } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const accent    = business.accent_color  || '#F59E0B'
  const primary   = business.primary_color || '#111111'
  const threshold = business.threshold ?? 3

  async function trackScan(rating: number, outcome: 'positive' | 'negative') {
    await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: business.id, employee_id: employee?.id ?? null, rating, outcome })
    })
  }

  async function handleStarClick(star: number) {
    setSel(star)
    if (star >= threshold + 1) {
      await trackScan(star, 'positive')
      setTimeout(() => {
        setStage('positive')
        setTimeout(() => {
          if (business.google_review_url) window.location.href = business.google_review_url
        }, 900)
      }, 300)
    } else {
      await trackScan(star, 'negative')
      setStage('negative')
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      const base64 = dataUrl.split(',')[1]
      setFoto({ base64, ext, preview: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  async function sendFeedback() {
    if (!message.trim()) return
    setSending(true)
    try {
      if (business.negative_redirect === 'whatsapp' && business.whatsapp_number) {
        // Modo WhatsApp: armar mensaje y abrir WA
        const contactInfo = [
          nombre  ? `Nombre: ${nombre}`   : null,
          email   ? `Email: ${email}`     : null,
          wapp    ? `WhatsApp: ${wapp}`   : null,
        ].filter(Boolean).join('\n')

        const txt = encodeURIComponent(
          `[Calificar - ${business.name}]\n⭐ ${selected} estrella${selected !== 1 ? 's' : ''}\n\n"${message}"${contactInfo ? `\n\n${contactInfo}` : ''}`
        )
        window.open(`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}?text=${txt}`, '_blank')

        // Guardar también en DB aunque sea modo WA
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: business.id, employee_id: employee?.id ?? null,
            rating: selected, message, nombre, email, whatsapp: wapp,
            photo_base64: foto?.base64 ?? null, photo_ext: foto?.ext ?? null,
          })
        })
        setStage('feedback-sent')
      } else {
        // Modo formulario: guardar en DB
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: business.id, employee_id: employee?.id ?? null,
            rating: selected, message, nombre, email, whatsapp: wapp,
            photo_base64: foto?.base64 ?? null, photo_ext: foto?.ext ?? null,
          })
        })
        if (res.ok) setStage('feedback-sent')
      }
    } finally {
      setSending(false)
    }
  }

  const displayStars = hovered || selected

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1a1a1a 100%)' }}>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center"
            style={{ background: `linear-gradient(135deg, ${primary}15, ${accent}15)` }}>
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name}
                className="h-24 w-24 mx-auto mb-3 object-cover rounded-2xl"/>
            ) : (
              <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: primary }}>
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{business.name}</h1>
            {employee && <p className="text-sm text-gray-500 mt-1">con {employee.name}</p>}
          </div>

          {/* RATING */}
          {stage === 'rating' && (
            <div className="px-8 pb-8 pt-4">
              <p className="text-center text-gray-700 font-semibold text-base mb-2">¿Cómo fue tu experiencia?</p>
              <p className="text-center text-gray-400 text-sm mb-7">Tu opinión nos ayuda a mejorar</p>
              <div className="flex justify-center gap-2 mb-6" onMouseLeave={() => setHover(0)}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} className="p-1 focus:outline-none"
                    onMouseEnter={() => setHover(star)}
                    onClick={() => handleStarClick(star)}>
                    <svg width="44" height="44" viewBox="0 0 24 24"
                      fill={displayStars >= star ? accent : 'none'}
                      stroke={displayStars >= star ? accent : '#D1D5DB'}
                      strokeWidth="1.5"
                      style={{ filter: displayStars >= star ? `drop-shadow(0 0 8px ${accent}80)` : 'none', transition: 'all 0.15s' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-gray-500 h-5">
                {displayStars===1&&'Muy malo'}{displayStars===2&&'Malo'}{displayStars===3&&'Regular'}
                {displayStars===4&&'Muy bueno'}{displayStars===5&&'¡Excelente!'}
              </p>
            </div>
          )}

          {/* POSITIVE */}
          {stage === 'positive' && (
            <div className="px-8 pb-8 pt-4 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${accent}20` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={accent}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h2 className="text-gray-900 font-bold text-xl mb-2">¡Gracias!</h2>
              <p className="text-gray-500 text-sm">Te estamos llevando a Google para que dejes tu reseña...</p>
              <div className="mt-6 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 animate-spin"
                  style={{ borderTopColor: accent }}/>
              </div>
            </div>
          )}

          {/* NEGATIVE */}
          {stage === 'negative' && (
            <div className="px-8 pb-8 pt-4">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-orange-50 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">😔</span>
                </div>
                <h2 className="text-gray-900 font-bold text-lg mb-1">Lamentamos escuchar eso</h2>
                <p className="text-gray-500 text-sm">Contanos qué pasó y lo resolvemos. Tu opinión es privada.</p>
              </div>

              <textarea value={message} onChange={e => setMsg(e.target.value)}
                placeholder="¿Qué podríamos haber hecho mejor?" rows={3}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-gray-400 placeholder-gray-300 mb-4"/>

              {/* Campos opcionales */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Opcional — para que podamos contactarte</p>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-300 placeholder-gray-300"/>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Tu email" type="email"
                  className="w-full bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-300 placeholder-gray-300"/>
                <input value={wapp} onChange={e => setWapp(e.target.value)}
                  placeholder="Tu WhatsApp (ej: 1155667788)" type="tel"
                  className="w-full bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-300 placeholder-gray-300"/>

                {/* Foto */}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange}/>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full bg-white border border-dashed border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:border-gray-400 transition-colors">
                  {foto ? (
                    <div className="flex items-center gap-2">
                      <img src={foto.preview} alt="" className="w-8 h-8 rounded-lg object-cover"/>
                      <span className="text-green-600 font-medium text-xs">Foto adjuntada ✓</span>
                      <span onClick={e => { e.stopPropagation(); setFoto(null) }}
                        className="ml-auto text-gray-300 hover:text-red-400 text-base leading-none">×</span>
                    </div>
                  ) : (
                    <span>📷 Adjuntá una foto (opcional)</span>
                  )}
                </button>
                <p className="text-[11px] text-gray-400 leading-relaxed">Con tus datos podemos contactarte y ofrecerte algo a cambio.</p>
              </div>

              <button onClick={sendFeedback} disabled={!message.trim() || sending}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-opacity"
                style={{ background: primary }}>
                {sending ? 'Enviando...' : business.negative_redirect === 'whatsapp' ? 'Enviar por WhatsApp' : 'Enviar comentario'}
              </button>
              <button onClick={() => setStage('rating')}
                className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600">← Volver</button>
            </div>
          )}

          {/* SENT */}
          {stage === 'feedback-sent' && (
            <div className="px-8 pb-8 pt-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 mx-auto mb-4 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-gray-900 font-bold text-xl mb-2">¡Gracias por avisarnos!</h2>
              <p className="text-gray-500 text-sm">Tu comentario fue recibido. Nos pondremos en contacto a la brevedad para resolverlo.</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-5 opacity-60">
          Powered by <span className="font-semibold">Calificar.ar</span>
        </p>
      </div>
    </div>
  )
}
