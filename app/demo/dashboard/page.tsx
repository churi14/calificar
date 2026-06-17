'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Datos mock ───────────────────────────────────────────────────────────────
const WEEKLY = [
  { day: 'Vie', total: 38, positive: 34 },
  { day: 'Sáb', total: 41, positive: 37 },
  { day: 'Dom', total: 29, positive: 25 },
  { day: 'Lun', total: 22, positive: 19 },
  { day: 'Mar', total: 35, positive: 30 },
  { day: 'Mié', total: 31, positive: 28 },
  { day: 'Jue', total: 35, positive: 26 },
]

const EMPLOYEES_INIT = [
  { name: 'María García', scans: 34 },
  { name: 'Juan Torres',  scans: 28 },
  { name: 'Laura Sosa',   scans: 19 },
  { name: 'Carlos Méndez', scans: 11 },
]

type FeedbackItem = {
  id: number; stars: number; comment: string
  time: string; whatsapp: string; name: string
  type: 'positive' | 'negative'
}

const FEEDBACK_INIT: FeedbackItem[] = [
  { id: 10, stars: 5, comment: 'Excelente atención, el café estaba perfecto. Volvería sin dudarlo.', time: 'hace 2 horas', whatsapp: '5491166778899', name: 'Cliente satisfecho', type: 'positive' },
  { id: 11, stars: 5, comment: 'María me atendió de 10. Todo muy limpio y rápido.', time: 'hace 3 horas', whatsapp: '5491144556677', name: 'Cliente satisfecho', type: 'positive' },
  { id: 12, stars: 2, comment: 'Esperé 20 minutos para que me traigan el pedido y el medialunas estaban frías.', time: 'ayer', whatsapp: '5491133445566', name: 'Cliente anónimo', type: 'negative' },
  { id: 13, stars: 4, comment: 'Muy buen lugar, solo le falta un poco más de espacio entre las mesas.', time: 'ayer', whatsapp: '5491122334455', name: 'Cliente satisfecho', type: 'positive' },
  { id: 14, stars: 1, comment: 'El baño estaba en mal estado y nadie lo atendía cuando lo pedí.', time: 'hace 2 días', whatsapp: '5491111223344', name: 'Cliente anónimo', type: 'negative' },
  { id: 15, stars: 5, comment: 'El mejor café del barrio, sin dudas. Juan siempre tan amable.', time: 'hace 3 días', whatsapp: '5491100112233', name: 'Cliente satisfecho', type: 'positive' },
]

const INCOMING_FEEDBACK: FeedbackItem = {
  id: 1, stars: 2,
  comment: 'El café llegó frío y tardaron mucho en atenderme.',
  time: 'hace un momento', whatsapp: '5491155667788', name: 'Cliente anónimo', type: 'negative',
}

const CARD = 'bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
const NAV = [
  { icon: '📊', label: 'Inicio'           },
  { icon: '🏪', label: 'Mi local', active: true },
  { icon: '💬', label: 'Feedback recibido' },
]

export default function DemoDashboard() {
  const [scans,     setScans]     = useState(231)
  const [positivos, setPositivos] = useState(199)
  const [filtrados, setFiltrados] = useState(32)
  const [feedback,  setFeedback]  = useState<FeedbackItem[]>(FEEDBACK_INIT)
  const [readIds,   setReadIds]   = useState<Set<number>>(new Set())
  const sinLeer = feedback.filter(f => !readIds.has(f.id) && f.type === 'negative').length
  const [selectedFb, setSelectedFb] = useState<FeedbackItem | null>(null)

  function openFeedback(f: FeedbackItem) {
    setSelectedFb(f)
    setReadIds(prev => new Set([...prev, f.id]))
  }

  const [empModal,  setEmpModal]  = useState(false)
  const [newEmpName, setNewEmpName] = useState('')
  const [employees, setEmployees] = useState(EMPLOYEES_INIT)
  const [activeNav, setActiveNav] = useState<'local'|'feedback'>('local')
  const [toast,     setToast]     = useState(false)

  // Feedback negativo simulado a los 8s
  useEffect(() => {
    const t = setTimeout(() => {
      setScans(s => s + 1)
      setFiltrados(f => f + 1)
      setFeedback(prev => [INCOMING_FEEDBACK, ...prev])
      setToast(true)
      setTimeout(() => setToast(false), 6000)
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  function addEmployee() {
    if (!newEmpName.trim()) return
    setEmployees(prev => [...prev, { name: newEmpName.trim(), scans: 0 }])
    setNewEmpName('')
    setEmpModal(false)
  }

  const maxScans = Math.max(...WEEKLY.map(d => d.total), 1)
  const maxEmp   = Math.max(...employees.map(e => e.scans), 1)
  const weeklyScanTotal = WEEKLY.reduce((s, d) => s + d.total, 0)
  const weeklyPositive  = WEEKLY.reduce((s, d) => s + d.positive, 0)

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex relative">

      {/* ── TOAST ── */}
      <div className={`fixed top-6 right-6 z-[200] max-w-sm w-full transition-all duration-500 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-[#0F172A] text-white rounded-2xl px-5 py-4 shadow-2xl flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🔔</span>
          <div className="flex-1">
            <p className="font-bold text-sm mb-1">¡Nuevo feedback privado!</p>
            <p className="text-xs text-gray-300 leading-relaxed">Un cliente calificó con 2 estrellas. Tocá para ver los detalles.</p>
          </div>
          <button onClick={() => setToast(false)} className="text-gray-400 hover:text-white text-lg leading-none">×</button>
        </div>
      </div>

      {/* ── MODAL FEEDBACK ── */}
      {selectedFb && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={() => setSelectedFb(null)}/>
          <div className="relative bg-white rounded-[2rem] max-w-md w-full shadow-2xl p-8">
            <button onClick={() => setSelectedFb(null)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-700 text-2xl leading-none">×</button>
            <div className="flex items-center gap-2 mb-1">
              {Array.from({length:5}).map((_,i) => (
                <svg key={i} width="20" height="20" viewBox="0 0 24 24"
                  fill={i < selectedFb.stars ? '#FBBF24' : '#E5E7EB'}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
              <span className="text-xs text-gray-400 ml-1">{selectedFb.time}</span>
            </div>
            <h3 className="font-display font-extrabold text-[#0F172A] text-xl mb-4">Feedback privado</h3>

            <div className="bg-[#F5EFE7] rounded-2xl p-5 mb-5">
              <p className="text-gray-700 leading-relaxed italic">"{selectedFb.comment}"</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-24 flex-shrink-0">Cliente</span>
                <span className="font-medium text-gray-700">{selectedFb.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-24 flex-shrink-0">Calificación</span>
                <span className="font-medium text-gray-700">{selectedFb.stars} de 5 estrellas</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-24 flex-shrink-0">Llegó por</span>
                <span className="font-medium text-gray-700">WhatsApp (privado)</span>
              </div>
            </div>

            <a href={`https://wa.me/${selectedFb.whatsapp}?text=${encodeURIComponent('Hola! Vi tu comentario y quería hablar con vos sobre tu experiencia en Café El Sol.')}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 bg-[#056E4B] text-white font-bold py-4 rounded-full hover:bg-[#045c3f] transition-colors shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar por WhatsApp
            </a>
            <p className="text-xs text-gray-400 text-center mt-3">En la versión real, el cliente deja su número al enviar feedback negativo.</p>
          </div>
        </div>
      )}

      {/* ── MODAL EMPLEADO ── */}
      {empModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={() => setEmpModal(false)}/>
          <div className="relative bg-white rounded-[2rem] max-w-sm w-full shadow-2xl p-8">
            <button onClick={() => setEmpModal(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-700 text-2xl leading-none">×</button>
            <h3 className="font-display font-extrabold text-[#0F172A] text-xl mb-2">Agregar empleado</h3>
            <p className="text-sm text-gray-500 mb-6">Cada empleado tiene su propia tarjeta y QR personalizado.</p>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nombre completo</label>
            <input
              value={newEmpName}
              onChange={e => setNewEmpName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEmployee()}
              placeholder="Ej: Ana Gómez"
              className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 mb-5"
              autoFocus
            />
            <button onClick={addEmployee}
              className="w-full bg-[#0F172A] text-white font-bold py-3.5 rounded-full hover:bg-gray-700 transition-colors">
              Agregar
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Demo — no se guarda en base de datos</p>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
            <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" /><span className="font-extrabold text-xl text-[#0F172A]">Calificar</span></Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: '📊', label: 'Inicio', key: 'local' as const },
            { icon: '🏪', label: 'Mi local', key: 'local' as const },
            { icon: '💬', label: 'Feedback recibido', key: 'feedback' as const },
          ].map(item => (
            <button key={item.label}
              onClick={() => setActiveNav(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors
                ${activeNav === item.key && item.key !== 'local' || (item.key === 'local' && activeNav === 'local' && item.label === 'Mi local')
                  ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
              {item.label === 'Feedback recibido' && sinLeer > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {sinLeer}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">N</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">negocio@demo.ar</p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">Gratis</span>
            </div>
          </div>
          <p className="text-xs text-gray-300 font-medium">Vista demo — sin datos reales</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 ml-60 p-8">

        {/* Banner demo */}
        <div className="mb-6 bg-[#FBCAD8]/30 border border-[#FBCAD8] rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#0F172A]">
            👀 Estás viendo la <span className="font-extrabold">demo interactiva</span> del panel. Los datos son ficticios y no se guardan.
          </p>
          <Link href="/r/demo" className="text-xs font-bold text-[#056E4B] whitespace-nowrap hover:underline">
            Ver vista cliente →
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Café El Sol</h1>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold bg-green-50 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>Activo
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">calificar.com.ar/r/cafe-el-sol</p>
          </div>
          <button onClick={() => setEmpModal(true)}
            className="text-sm bg-gray-900 text-white rounded-xl px-5 py-2.5 hover:bg-gray-700 font-semibold flex items-center gap-2">
            + Agregar empleado
          </button>
        </div>

        {/* ── VISTA: MI LOCAL ── */}
        {activeNav === 'local' && (<>
          {/* Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Scans totales',        value: scans,     sub: null, alert: false },
              { label: 'Positivos → Google',   value: positivos, sub: `${Math.round(positivos/scans*100)}%`, alert: false },
              { label: 'Filtrados (privados)', value: filtrados, sub: `${Math.round(filtrados/scans*100)}%`, alert: false },
              { label: 'Feedback sin leer',    value: sinLeer,   sub: null, alert: sinLeer > 0 },
            ].map(s => (
              <div key={s.label}
                onClick={() => s.alert && setActiveNav('feedback')}
                className={`${CARD} p-6 ${s.alert ? 'ring-2 ring-red-300 cursor-pointer hover:shadow-lg' : 'cursor-default'} transition-all`}>
                <p className="text-sm text-gray-400 mb-3">{s.label}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold ${s.alert ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>{s.value}</p>
                  {s.sub && <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{s.sub} del total</span>}
                </div>
                {s.alert
                  ? <p className="text-xs text-red-400 mt-2">Tocá para verlo →</p>
                  : s.label === 'Feedback sin leer' ? <p className="text-xs text-gray-300 mt-2">Todo leído</p> : null}
              </div>
            ))}
          </div>

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* QR */}
              <div className={`${CARD} p-6`}>
                <h2 className="font-bold text-gray-900 text-base mb-5">Código QR y link del funnel</h2>
                <div className="flex gap-5 items-start mb-5">
                  <div className="bg-gray-50 rounded-2xl p-3 flex-shrink-0">
                    <div className="w-[120px] h-[120px] rounded-lg bg-white border border-gray-100 grid grid-cols-5 gap-0.5 p-2">
                      {Array.from({length:25}).map((_,i)=>(
                        <div key={i} className={`rounded-[2px] ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,12,7,11].includes(i)?'bg-gray-900':'bg-gray-100'}`}/>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Listo para imprimir</p>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">Pegalo en tu cartel NFC o imprimilo y enmarcalo.</p>
                    <div className="flex flex-col gap-2">
                      <button className="text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 text-gray-600 font-medium">↓ Descargar PNG</button>
                      <button className="text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 text-gray-600 font-medium">↓ Descargar SVG</button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-500 font-mono flex-1 truncate">calificar.com.ar/r/cafe-el-sol</span>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-gray-600 hover:bg-gray-100 shadow-sm">Copiar</button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* ACTIVIDAD */}
              <div className={`${CARD} p-6`}>
                <h2 className="font-bold text-gray-900 text-base mb-5">Actividad — últimos 7 días</h2>
                <div className="flex items-end gap-2 h-32 mb-3">
                  {WEEKLY.map((d, i) => {
                    const pct = (d.total / Math.max(...WEEKLY.map(x => x.total), 1)) * 100
                    const isToday = i === WEEKLY.length - 1
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full relative" style={{ height: `${Math.max(pct, 4)}%` }}>
                          <div className="w-full h-full rounded-t-md" style={{ background: isToday ? '#3B82F6' : '#DBEAFE' }}/>
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.total}</div>
                        </div>
                        <span className={`text-xs ${isToday ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{d.day}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-6 mt-5 pt-4 border-t border-gray-50">
                  <div><p className="text-xs text-gray-400 mb-1">Esta semana</p><p className="text-lg font-bold text-gray-900">{WEEKLY.reduce((s,d)=>s+d.total,0)} scans</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">→ Google</p><p className="text-lg font-bold text-blue-500">{WEEKLY.reduce((s,d)=>s+d.positive,0)}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Filtrados</p><p className="text-lg font-bold text-gray-900">{WEEKLY.reduce((s,d)=>s+d.total-d.positive,0)}</p></div>
                </div>
              </div>

              {/* RANKING */}
              <div className={`${CARD} p-6`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900 text-base">Ranking de empleados</h2>
                  <button onClick={() => setEmpModal(true)} className="text-xs text-gray-400 hover:text-gray-700 font-medium">+ Agregar</button>
                </div>
                <div className="space-y-4">
                  {employees.map((emp, i) => {
                    const pct = Math.round((emp.scans / Math.max(...employees.map(e=>e.scans),1)) * 100)
                    return (
                      <div key={emp.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 w-5">{i+1}°</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                            <span className="text-xs text-gray-400">{emp.scans} scans</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gray-900" style={{width:`${pct}%`}}/>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>)}

        {/* ── VISTA: FEEDBACK RECIBIDO ── */}
        {activeNav === 'feedback' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Feedback recibido</h2>
                <p className="text-sm text-gray-400 mt-0.5">{feedback.length} mensajes en total</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-green-50 text-green-700 font-semibold px-3 py-1.5 rounded-full">
                  ✓ {feedback.filter(f=>f.type==='positive').length} positivos
                </span>
                <span className="text-xs bg-red-50 text-red-600 font-semibold px-3 py-1.5 rounded-full">
                  ⚠ {feedback.filter(f=>f.type==='negative').length} negativos
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {feedback.map(f => {
                const isUnread = !readIds.has(f.id) && f.type === 'negative'
                return (
                  <button key={f.id} onClick={() => openFeedback(f)}
                    className={`w-full text-left rounded-2xl px-5 py-4 transition-all hover:shadow-md group border
                      ${f.type === 'negative'
                        ? isUnread
                          ? 'bg-red-50 border-red-200 hover:border-red-300'
                          : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                        : 'bg-green-50 border-green-100 hover:border-green-200'
                      }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {Array.from({length:5}).map((_,i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < f.stars ? '#FBBF24' : '#E5E7EB'}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{f.time}</span>
                      {isUnread && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"/>}
                      <span className={`ml-auto text-xs font-semibold group-hover:underline ${f.type==='negative'?'text-red-500':'text-green-600'}`}>
                        {f.type === 'negative' ? 'Ver y contactar →' : 'Ver detalle →'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 italic">"{f.comment}"</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
