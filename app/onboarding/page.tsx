'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3 | 4

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

const INPUT = 'w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-300 transition-shadow'

export default function OnboardingPage() {
  const router = useRouter()
  const [step,    setStep]    = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [bizId,   setBizId]   = useState('')

  // Datos del negocio
  const [name,       setName]    = useState('')
  const [slug,       setSlug_]   = useState('')
  const [googleUrl,  setGoogle]  = useState('')
  const [whatsapp,   setWA]      = useState('')

  function handleNameChange(val: string) {
    setName(val)
    setSlug_(slugify(val))
  }

  async function createBusiness() {
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Sesión expirada'); return }

      const { data, error: err } = await supabase.from('businesses').insert({
        name:              name.trim(),
        slug:              slug,
        owner_id:          user.id,
        google_review_url: googleUrl.trim() || null,
        whatsapp_number:   whatsapp.trim().replace(/\D/g, '') || null,
        negative_redirect: whatsapp.trim() ? 'whatsapp' : 'form',
        threshold:         3,
        primary_color:     '#111111',
        accent_color:      '#F59E0B',
        active:            true,
      }).select('id').single()

      if (err) {
        if (err.code === '23505') setError('Ese nombre de local ya existe, probá con otro.')
        else setError('Error al crear el local. Intentá de nuevo.')
        return
      }

      setBizId(data.id)
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  const funnelUrl = `calificar.ar/r/${slug}`

  return (
    <div className="min-h-screen bg-[#F5EFE7] flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <Link href="/" className="font-display font-extrabold text-2xl text-[#0F172A] flex items-center gap-2 mb-10">
        <span className="text-[#FBCAD8]">★</span> calificar
      </Link>

      {/* Progress */}
      {step < 4 && (
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step > s ? 'bg-[#056E4B] text-white' : step === s ? 'bg-[#0F172A] text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#056E4B]' : 'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-md">

        {/* ── PASO 1: Nombre del local ── */}
        {step === 1 && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Paso 1 de 3</p>
            <h1 className="font-display font-extrabold text-3xl text-[#0F172A] mb-2">¿Cómo se llama tu local?</h1>
            <p className="text-gray-500 text-sm mb-8">Esto va a aparecer en la pantalla que ven tus clientes.</p>

            <input value={name} onChange={e => handleNameChange(e.target.value)}
              placeholder="Ej: Café El Sol, La Parrilla, etc."
              className={INPUT} autoFocus/>

            {slug && (
              <p className="text-xs text-gray-400 mt-3 ml-1">
                Tu link va a ser: <span className="font-mono font-semibold text-gray-600">calificar.ar/r/{slug}</span>
              </p>
            )}

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            <button onClick={() => { if (name.trim().length >= 2) { setError(''); setStep(2) } else setError('Ingresá al menos 2 caracteres') }}
              className="w-full mt-8 bg-[#0F172A] text-white font-bold py-4 rounded-full text-base hover:bg-[#1E293B] transition-colors">
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 2: Link de Google ── */}
        {step === 2 && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Paso 2 de 3</p>
            <h1 className="font-display font-extrabold text-3xl text-[#0F172A] mb-2">Tu link de Google Reviews</h1>
            <p className="text-gray-500 text-sm mb-3">Los clientes satisfechos van a ir directo acá a dejarte su reseña.</p>

            {/* Cómo conseguirlo */}
            <div className="bg-[#F5EFE7] rounded-2xl p-4 mb-6 text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800 text-xs uppercase tracking-wider">¿Cómo lo consigo?</p>
              <ol className="space-y-1.5 text-xs">
                <li>1. Buscá tu local en Google Maps</li>
                <li>2. Hacé click en "Reseñas" o "Escribir reseña"</li>
                <li>3. Copiá la URL del navegador</li>
              </ol>
              <a href="https://search.google.com/local/writereview" target="_blank"
                className="inline-block text-xs font-semibold text-[#056E4B] underline underline-offset-2 mt-1">
                También podés buscarlo acá →
              </a>
            </div>

            <input value={googleUrl} onChange={e => setGoogle(e.target.value)}
              placeholder="https://g.page/r/..."
              type="url"
              className={INPUT}/>

            <p className="text-xs text-gray-400 mt-2 ml-1">Podés completarlo más adelante desde el panel.</p>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-4 rounded-full hover:bg-gray-50 transition-colors">
                ← Atrás
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 bg-[#0F172A] text-white font-bold py-4 rounded-full hover:bg-[#1E293B] transition-colors">
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: WhatsApp ── */}
        {step === 3 && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Paso 3 de 3</p>
            <h1 className="font-display font-extrabold text-3xl text-[#0F172A] mb-2">¿Dónde recibís las quejas?</h1>
            <p className="text-gray-500 text-sm mb-6">Cuando un cliente no está conforme, te avisamos en privado. Ponés tu WhatsApp y te llega ahí.</p>

            <input value={whatsapp} onChange={e => setWA(e.target.value)}
              placeholder="Ej: 1155667788 (sin el 0 ni el 15)"
              type="tel"
              className={INPUT}/>

            <div className="bg-[#056E4B]/5 rounded-2xl p-4 mt-4 text-xs text-[#056E4B] font-medium">
              ✓ El cliente no ve tu número — solo vos recibís el mensaje privado
            </div>

            <p className="text-xs text-gray-400 mt-3 ml-1">También podés usar el formulario del panel en vez de WhatsApp. Lo configurás después.</p>

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-4 rounded-full hover:bg-gray-50 transition-colors">
                ← Atrás
              </button>
              <button onClick={createBusiness} disabled={loading}
                className="flex-1 bg-[#056E4B] text-white font-bold py-4 rounded-full hover:bg-[#045c3f] transition-colors disabled:opacity-50">
                {loading ? 'Creando...' : '¡Listo!'}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 4: ¡Todo listo! ── */}
        {step === 4 && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-[#056E4B]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#056E4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <h1 className="font-display font-extrabold text-3xl text-[#0F172A] mb-2">¡{name} está listo!</h1>
            <p className="text-gray-500 text-sm mb-6">Tu sistema de reseñas ya está activo. Compartí tu link o pegá el QR en tu local.</p>

            <div className="bg-[#F5EFE7] rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
              <span className="text-sm font-mono text-gray-700 flex-1 text-left truncate">{funnelUrl}</span>
              <button onClick={() => navigator.clipboard.writeText(`https://${funnelUrl}`)}
                className="text-xs font-bold text-[#056E4B] hover:underline flex-shrink-0">
                Copiar
              </button>
            </div>

            <div className="space-y-3">
              <Link href={`/dashboard/negocios/${bizId}`}
                className="w-full flex items-center justify-center bg-[#0F172A] text-white font-bold py-4 rounded-full hover:bg-[#1E293B] transition-colors">
                Ir a mi panel →
              </Link>
              <Link href={`/r/${slug}`} target="_blank"
                className="w-full flex items-center justify-center border border-gray-200 text-gray-600 font-semibold py-4 rounded-full hover:bg-gray-50 transition-colors text-sm">
                Ver cómo lo ven mis clientes ↗
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-6 leading-relaxed">
              Desde el panel podés descargar el QR para imprimirlo, agregar empleados y ver tus estadísticas en tiempo real.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}