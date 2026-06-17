'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Stage = 'rating' | 'positive' | 'negative' | 'sent'
type View  = 'cliente' | 'empresa'

const EMPLOYEES: Record<string, { name: string; emoji: string }> = {
  maria:   { name: 'María García',  emoji: '👩' },
  juan:    { name: 'Juan Torres',   emoji: '👨' },
  laura:   { name: 'Laura Sosa',    emoji: '👩‍🦱' },
  carlos:  { name: 'Carlos Méndez', emoji: '🧔' },
}

const RANKING = [
  { name: 'María García',  scans: 34, pct: 100 },
  { name: 'Juan Torres',   scans: 28, pct: 82 },
  { name: 'Laura Sosa',    scans: 19, pct: 56 },
  { name: 'Carlos Méndez', scans: 11, pct: 32 },
]

const OVERVIEW = [
  { label: 'Scans totales',        value: '231', sub: null as string | null },
  { label: 'Positivos → Google',   value: '199', sub: '86%' },
  { label: 'Filtrados (privados)', value: '32',  sub: '14%' },
  { label: 'Feedback sin leer',    value: '0',   sub: null },
]

const WA = 'https://wa.me/5491123867934?text=Vi%20la%20demo%20de%20Calificar%20y%20me%20interesa'

function IconWhatsApp({ color = '#25D366' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function DemoFunnel() {
  const params = useSearchParams()
  const empSlug = params.get('emp') ?? ''
  const employee = EMPLOYEES[empSlug] ?? null

  const [view, setView]     = useState<View>('cliente')
  const [stage, setStage]   = useState<Stage>('rating')
  const [hovered, setHover] = useState(0)
  const [selected, setSel]  = useState(0)
  const [message, setMsg]   = useState('')
  const [nombre,  setNombre] = useState('')
  const [email,   setEmail]  = useState('')
  const [wapp,    setWapp]   = useState('')
  const [foto,    setFoto]   = useState<string | null>(null)

  const display = hovered || selected

  function reset() {
    setStage('rating'); setSel(0); setHover(0)
    setMsg(''); setNombre(''); setEmail(''); setWapp(''); setFoto(null)
  }

  function handleStar(star: number) {
    setSel(star)
    if (star >= 4) setTimeout(() => setStage('positive'), 300)
    else setStage('negative')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-[#0F172A]">

      {/* Banner demo */}
      <div className="w-full max-w-3xl mb-3 flex items-center justify-between px-1">
        <span className="flex items-center gap-2 text-white text-sm font-semibold">
          <span className="text-[#FBCAD8]">★</span> Demo — así lo ve tu cliente
        </span>
        <Link href="/" className="text-gray-400 hover:text-white text-xs transition-colors">Volver</Link>
      </div>

      {/* Toggle Vista cliente / Vista empresa */}
      <div className="w-full max-w-sm mb-5 flex bg-white/5 rounded-full p-1">
        <button onClick={() => setView('cliente')}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${view === 'cliente' ? 'bg-white text-[#0F172A]' : 'text-gray-400 hover:text-white'}`}>
          Vista cliente
        </button>
        <button onClick={() => setView('empresa')}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${view === 'empresa' ? 'bg-white text-[#0F172A]' : 'text-gray-400 hover:text-white'}`}>
          Vista empresa
        </button>
      </div>

      {/* SLIDER */}
      <div className="w-full max-w-3xl overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out"
          style={{ width: '200%', transform: view === 'empresa' ? 'translateX(-50%)' : 'translateX(0%)' }}>

          {/* === SLIDE 1 — VISTA CLIENTE === */}
          <div className="w-1/2 px-1">
            <div className="w-full max-w-sm mx-auto">
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-8 pt-8 pb-5 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl bg-[#F5EFE7]">☕</div>
                  <h1 className="font-extrabold text-[#0F172A] text-lg">Café El Sol</h1>
                  {employee ? (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#FBCAD8]/30 text-xs font-medium text-[#0F172A]">
                      con <span className="font-semibold">{employee.name}</span> {employee.emoji}
                    </span>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Buenos Aires, Argentina</p>
                  )}
                </div>

                {/* RATING */}
                {stage === 'rating' && (
                  <div className="px-8 pb-6 pt-4">
                    <p className="text-center text-[#0F172A] font-semibold mb-1.5">¿Cómo fue tu experiencia?</p>
                    <p className="text-center text-gray-400 text-xs mb-7">Tu opinión nos ayuda a mejorar</p>

                    <div className="flex justify-center gap-2 mb-5" onMouseLeave={() => setHover(0)}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                          onMouseEnter={() => setHover(star)} onClick={() => handleStar(star)}>
                          <svg width="48" height="48" viewBox="0 0 24 24"
                            fill={display >= star ? '#FBBF24' : '#E5E7EB'} stroke="none"
                            style={{ transition: 'fill .15s' }}>
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
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#FBBF24]/15">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#FBBF24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                    <h2 className="text-[#0F172A] font-extrabold text-xl mb-2">¡Gracias!</h2>
                    <p className="text-gray-500 text-sm mb-4">En el local real, el cliente iría directo a Google Maps a dejar su reseña de 5 estrellas.</p>
                    <div className="bg-[#056E4B]/10 rounded-2xl px-4 py-3 text-xs text-[#056E4B] text-left leading-relaxed font-medium">
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
                      <div className="w-14 h-14 rounded-full bg-[#FBCAD8]/30 mx-auto mb-3 flex items-center justify-center text-2xl">😔</div>
                      <h2 className="text-[#0F172A] font-extrabold text-lg mb-1">Lamentamos escuchar eso</h2>
                      <p className="text-gray-500 text-sm">Tu comentario es privado — no llega a Google.</p>
                    </div>

                    <textarea value={message} onChange={e => setMsg(e.target.value)} rows={3}
                      placeholder="¿Qué podríamos haber hecho mejor?"
                      className="w-full rounded-2xl bg-[#F5EFE7] p-4 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#FBCAD8] placeholder-gray-400 mb-4"/>

                    {/* Campos opcionales de contacto */}
                    <div className="bg-[#F5EFE7] rounded-2xl p-4 mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Opcional — para que podamos contactarte
                      </p>
                      <div className="space-y-2.5">
                        <input value={nombre} onChange={e => setNombre(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8] placeholder-gray-300"/>
                        <input value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="Tu email"
                          type="email"
                          className="w-full bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8] placeholder-gray-300"/>
                        <input value={wapp} onChange={e => setWapp(e.target.value)}
                          placeholder="Tu WhatsApp (ej: 1155667788)"
                          type="tel"
                          className="w-full bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBCAD8] placeholder-gray-300"/>

                        {/* Upload de foto */}
                        <label className="block cursor-pointer">
                          <div className={`w-full rounded-xl border-2 border-dashed transition-colors px-4 py-3 text-center
                            ${foto ? 'border-[#FBCAD8] bg-[#FBCAD8]/10' : 'border-gray-200 bg-white hover:border-[#FBCAD8]'}`}>
                            {foto ? (
                              <div className="flex items-center justify-between gap-2">
                                <img src={foto} alt="preview" className="w-12 h-12 rounded-lg object-cover flex-shrink-0"/>
                                <span className="text-xs text-[#056E4B] font-semibold flex-1 text-left">Foto adjuntada ✓</span>
                                <button type="button" onClick={e => { e.preventDefault(); setFoto(null) }}
                                  className="text-gray-400 hover:text-red-400 text-lg leading-none">×</button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-gray-400">
                                <span className="text-lg">📷</span>
                                <span className="text-xs font-medium">Adjuntá una foto (opcional)</span>
                              </div>
                            )}
                          </div>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = ev => setFoto(ev.target?.result as string)
                              reader.readAsDataURL(file)
                            }}/>
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                        Con tus datos, el local puede contactarte y ofrecerte algo a cambio.
                      </p>
                    </div>

                    <button onClick={() => setStage('sent')}
                      className="w-full py-3.5 rounded-full text-white font-semibold text-sm bg-[#0F172A] hover:bg-[#1E293B] transition-colors">
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
                    <div className="w-16 h-16 rounded-full bg-[#056E4B]/10 mx-auto mb-4 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#056E4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h2 className="text-[#0F172A] font-extrabold text-xl mb-2">¡Gracias por avisarnos!</h2>
                    <p className="text-gray-500 text-sm mb-4">El dueño recibe este mensaje de forma privada y puede resolverlo antes de que sea una mala reseña en Google.</p>

                    {/* Resumen de lo que recibe el dueño */}
                    <div className="bg-[#F5EFE7] rounded-2xl px-4 py-4 text-left mb-3 space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Así llega al panel del negocio</p>
                      <div className="flex items-start gap-2 text-sm text-[#0F172A]">
                        <span className="text-gray-400 w-16 flex-shrink-0 text-xs pt-0.5">Mensaje</span>
                        <span className="font-medium italic">"{message || 'Sin mensaje'}"</span>
                      </div>
                      {foto && (
                        <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                          <span className="text-gray-400 w-16 flex-shrink-0 text-xs">Foto</span>
                          <img src={foto} alt="adjunto" className="w-16 h-16 rounded-xl object-cover shadow-sm"/>
                        </div>
                      )}
                      {nombre && (
                        <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                          <span className="text-gray-400 w-16 flex-shrink-0 text-xs">Nombre</span>
                          <span className="font-medium">{nombre}</span>
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                          <span className="text-gray-400 w-16 flex-shrink-0 text-xs">Email</span>
                          <span className="font-medium">{email}</span>
                        </div>
                      )}
                      {wapp && (
                        <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                          <span className="text-gray-400 w-16 flex-shrink-0 text-xs">WhatsApp</span>
                          <span className="font-medium">{wapp}</span>
                        </div>
                      )}
                      {!nombre && !email && !wapp && !foto && (
                        <p className="text-xs text-gray-400 italic">El cliente no dejó datos de contacto.</p>
                      )}
                    </div>

                    <div className="bg-[#FBCAD8]/20 rounded-2xl px-4 py-3 text-xs text-[#0F172A] text-left leading-relaxed font-medium mb-4">
                      <strong>✓ Negativo filtrado:</strong> el dueño resuelve el problema en privado. Tu reputación en Google queda intacta.
                    </div>
                    <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                      ← Volver a la demo
                    </button>
                  </div>
                )}

                {/* EMPLEADOS — selector de demo, dentro de la tarjeta */}
                {stage === 'rating' && (
                  <div className="px-6 pb-6">
                    <div className="bg-[#F5EFE7] rounded-[2rem] p-4">
                      <p className="text-xs text-gray-400 mb-3 text-center font-semibold uppercase tracking-wider">
                        Probá la tarjeta de cada empleado
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(EMPLOYEES).map(([slug, emp]) => (
                          <a key={slug} href={`/r/demo?emp=${slug}`}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-full text-sm font-medium transition-all
                              ${empSlug === slug ? 'bg-[#0F172A] text-white' : 'bg-white text-gray-600 shadow-sm hover:shadow-md'}`}>
                            <span>{emp.emoji}</span>
                            <span className="truncate">{emp.name.split(' ')[0]}</span>
                          </a>
                        ))}
                      </div>
                      {empSlug && (
                        <a href="/r/demo" className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-3">
                          Ver sin empleado
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* === SLIDE 2 — VISTA EMPRESA === */}
          <div className="w-1/2 px-1">
            <div className="w-full">
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">

                {/* fake browser bar */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200"/>
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200"/>
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200"/>
                  <span className="ml-3 text-xs text-gray-300 font-mono truncate">calificar.com.ar/dashboard/negocios/cafe-el-sol</span>
                </div>

                <div className="p-6 sm:p-8 bg-[#F7F9FB]">
                  {/* header */}
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-[#0F172A] text-base sm:text-lg">Café El Sol</h2>
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"/> Activo
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">calificar.com.ar/r/cafe-el-sol</p>
                    </div>
                  </div>

                  {/* overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {OVERVIEW.map(s => (
                      <div key={s.label} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                        <p className="text-[11px] text-gray-400 mb-1.5 truncate">{s.label}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xl font-bold text-[#0F172A]">{s.value}</p>
                          {s.sub && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full">
                              {s.sub}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* qr + ranking */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                      <p className="text-xs font-bold text-[#0F172A] mb-3">Código QR del local</p>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-[#F5EFE7] flex items-center justify-center text-2xl flex-shrink-0">▦</div>
                        <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-0">
                          <span className="text-[11px] text-gray-400 font-mono truncate block">calificar.com.ar/r/cafe-el-sol</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                      <p className="text-xs font-bold text-[#0F172A] mb-3">Ranking de empleados</p>
                      <div className="space-y-2.5">
                        {RANKING.map((e, i) => (
                          <div key={e.name}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-medium text-gray-700 truncate">{i+1}° {e.name}</span>
                              <span className="text-[11px] text-gray-400">{e.scans}</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${e.pct}%` }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4 px-4">
              Así ve cada local sus estadísticas, su QR y el ranking de su equipo en tiempo real.
            </p>
            <div className="text-center mt-3">
              <Link href="/demo/dashboard" target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0F172A] px-4 py-2.5 rounded-full hover:bg-[#1E293B] transition-colors">
                Probar el panel completo →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400 mb-3">¿Querés este sistema para tu local?</p>
        <a href={WA} target="_blank"
          className="inline-flex items-center gap-2 bg-[#056E4B] text-white font-bold px-7 py-3.5 rounded-full text-sm hover:bg-[#045A3D] transition-colors shadow-lg">
          <IconWhatsApp color="#FFFFFF"/>
          Consultanos por WhatsApp
        </a>
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
