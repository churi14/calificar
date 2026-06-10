'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Stage = 'rating' | 'positive' | 'negative' | 'sent'

const EMPLOYEES: Record<string, { name: string; emoji: string }> = {
  maria:   { name: 'María García',  emoji: '👩' },
  juan:    { name: 'Juan Torres',   emoji: '👨' },
  laura:   { name: 'Laura Sosa',    emoji: '👩‍🦱' },
  carlos:  { name: 'Carlos Méndez', emoji: '🧔' },
}

const WA = 'https://wa.me/5491100000000?text=Vi%20la%20demo%20de%20Calificar%20y%20me%20interesa'

function DemoFunnel() {
  const params = useSearchParams()
  const empSlug = params.get('emp') ?? ''
  const employee = EMPLOYEES[empSlug] ?? null

  const [stage, setStage]   = useState<Stage>('rating')
  const [hovered, setHover] = useState(0)
  const [selected, setSel]  = useState(0)
  const [message, setMsg]   = useState('')

  const accent  = '#F59E0B'
  const display = hovered || selected

  function reset() { setStage('rating'); setSel(0); setHover(0); setMsg('') }

  function handleStar(star: number) {
    setSel(star)
    if (star >= 4) setTimeout(() => setStage('positive'), 300)
    else setStage('negative')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1a1a1a 100%)' }}>

      {/* Banner demo */}
      <div className="w-full max-w-sm mb-4">
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-amber-300 text-xs font-semibold">Demo — así lo ve tu cliente</span>
          </div>
          <Link href="/" className="text-amber-400 text-xs hover:text-amber-200 underline underline-offset-2">Volver</Link>
        </div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center" style={{ background: '#11111108' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl bg-gray-900">☕</div>
            <h1 className="font-bold text-gray-900 text-lg">Café El Sol</h1>
            {employee ? (
              <p className="text-sm text-gray-500 mt-1">con <span className="font-semibold">{employee.name}</span> {employee.emoji}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Buenos Aires, Argentina</p>
            )}
          </div>

          {/* RATING */}
          {stage === 'rating' && (
            <div className="px-8 pb-8 pt-4">
              <p className="text-center text-gray-700 font-semibold mb-1.5">¿Cómo fue tu experiencia?</p>
              <p className="text-center text-gray-400 text-xs mb-7">Tu opinión nos ayuda a mejorar</p>

              <div className="flex justify-center gap-2 mb-5" onMouseLeave={() => setHover(0)}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                    onMouseEnter={() => setHover(star)} onClick={() => handleStar(star)}>
                    <svg width="44" height="44" viewBox="0 0 24 24"
                      fill={display >= star ? accent : 'none'}
                      stroke={display >= star ? accent : '#D1D5DB'} strokeWidth="1.5"
                      style={{ filter: display >= star ? `drop-shadow(0 0 8px ${accent}80)` : 'none', transition: 'all .15s' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-gray-400 h-5">
                {display===1&&'Muy malo'}{display===2&&'Malo'}{display===3&&'Regular'}
                {display===4&&'Muy bueno'}{display===5&&'¡Excelente!'}
              </p>
            </div>
          )}

          {/* POSITIVE */}
          {stage === 'positive' && (
            <div className="px-8 pb-6 pt-4 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{background:`${accent}20`}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={accent}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h2 className="text-gray-900 font-bold text-xl mb-2">¡Gracias!</h2>
              <p className="text-gray-500 text-sm mb-4">En el local real, el cliente iría directo a Google Maps a dejar su reseña de 5 estrellas.</p>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 text-left leading-relaxed">
                <strong>✓ Positivo filtrado:</strong> el cliente va directo a Google Maps.
                {employee && <span> La reseña queda registrada a nombre de <strong>{employee.name}</strong>.</span>}
              </div>
              <button onClick={reset} className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                ← Volver a la demo
              </button>
            </div>
          )}

          {/* NEGATIVE */}
          {stage === 'negative' && (
            <div className="px-8 pb-6 pt-4">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-orange-50 mx-auto mb-3 flex items-center justify-center text-2xl">😔</div>
                <h2 className="text-gray-900 font-bold text-lg mb-1">Lamentamos escuchar eso</h2>
                <p className="text-gray-500 text-sm">Tu comentario es privado — no llega a Google.</p>
              </div>
              <textarea value={message} onChange={e => setMsg(e.target.value)} rows={3}
                placeholder="¿Qué podríamos haber hecho mejor?"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
              <button onClick={() => setStage('sent')}
                className="w-full mt-3 py-3 rounded-xl text-white font-semibold text-sm bg-gray-900 hover:bg-gray-700 transition-colors">
                Enviar comentario (demo)
              </button>
              <button onClick={reset} className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600">
                ← Volver
              </button>
            </div>
          )}

          {/* SENT */}
          {stage === 'sent' && (
            <div className="px-8 pb-6 pt-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 mx-auto mb-4 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-gray-900 font-bold text-xl mb-2">¡Gracias por avisarnos!</h2>
              <p className="text-gray-500 text-sm mb-4">El dueño recibe este mensaje por WhatsApp. La mala reseña nunca llega a Google Maps.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 text-left leading-relaxed">
                <strong>✓ Negativo filtrado:</strong> el dueño resuelve el problema en privado. Tu reputación en Google queda intacta.
              </div>
              <button onClick={reset} className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                ← Volver a la demo
              </button>
            </div>
          )}
        </div>

        {/* EMPLEADOS — selector de demo */}
        {stage === 'rating' && (
          <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 text-center font-semibold uppercase tracking-wider">
              Probá la tarjeta de cada empleado
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(EMPLOYEES).map(([slug, emp]) => (
                <a key={slug} href={`/r/demo?emp=${slug}`}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${empSlug === slug ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                  <span>{emp.emoji}</span>
                  <span className="truncate">{emp.name.split(' ')[0]}</span>
                </a>
              ))}
            </div>
            {empSlug && (
              <a href="/r/demo" className="block text-center text-xs text-gray-500 hover:text-gray-300 mt-2">
                Ver sin empleado
              </a>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-5 text-center">
          <p className="text-xs text-gray-500 mb-3">¿Querés este sistema para tu local?</p>
          <a href={WA} target="_blank"
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl text-sm hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultanos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DemoPage() {
  return (
    <Suspense>
      <DemoFunnel />
    </Suspense>
  )
}