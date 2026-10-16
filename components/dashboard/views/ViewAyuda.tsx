'use client'

import React, { useState } from 'react'

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewAyudaProps {
  onNav: (id: string) => void
  mode?: 'ayuda' | 'primeros-pasos'
}

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewAyuda({ onNav, mode = 'ayuda' }: ViewAyudaProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: '¿Cómo se une un cliente al programa?',
      a: 'El cliente escanea el QR de tu local (lo encontrás en la sección "Hoy") o hace click en el enlace que le compartís. Automáticamente se crea su tarjeta de sellos digital.',
    },
    {
      q: '¿Cómo sello manualmente a un cliente?',
      a: 'Entrá a "Clientes", buscá al cliente por nombre o teléfono, y hacé click en "+ Sello". También podés usar el botón "Escanear un cliente" que abre la cámara para leer el QR de la tarjeta del cliente.',
    },
    {
      q: '¿Qué es Google Wallet / Apple Wallet?',
      a: 'Son las billeteras digitales de Android e iOS. Tus clientes pueden guardar ahí la tarjeta de sellos y la ven en la pantalla de bloqueo, junto con sus tarjetas bancarias.',
    },
    {
      q: '¿Cómo funciona la notificación push?',
      a: 'Los clientes que activaron las notificaciones en su tarjeta reciben el mensaje directamente en su teléfono, aunque no estén en la app. Desde "Avisos push" podés escribir y enviar el mensaje a todos.',
    },
    {
      q: '¿Puedo cambiar el diseño de la tarjeta?',
      a: 'Sí. En "Tarjeta" podés cambiar el color principal, subir tu logo, y personalizar el texto de bienvenida y la recompensa.',
    },
    {
      q: '¿Qué pasa cuando un cliente completa la tarjeta?',
      a: 'El sistema le muestra automáticamente el premio en su tarjeta. Vos lo ves en el panel de clientes. Podés marcar el premio como entregado desde ahí.',
    },
    {
      q: '¿Los datos de mis clientes son privados?',
      a: 'Sí. Los datos (nombre, teléfono) son solo tuyos. Calificar no los comparte ni los usa para publicidad.',
    },
    {
      q: '¿Cómo cancelo si no quiero seguir?',
      a: 'Escribinos por WhatsApp o por email a hola@calificar.com.ar y lo cancelamos al instante, sin preguntas.',
    },
  ]

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">
        {mode === 'primeros-pasos' ? 'Primeros pasos' : 'Ayuda'}
      </h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        {mode === 'primeros-pasos'
          ? 'Todo lo que necesitás para arrancar con Calificar.'
          : 'Respuestas a las preguntas más frecuentes sobre Calificar.'}
      </p>

      {/* Contacto rápido */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href="https://wa.me/5491123867934?text=Hola!%20Necesito%20ayuda%20con%20Calificar."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3 hover:border-green-200 dark:hover:border-green-800 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#25D366' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.5l5.805-1.522A11.951 11.951 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.871 9.871 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.118 12C2.118 6.985 6.985 2.118 12 2.118S21.882 6.985 21.882 12 17.015 21.882 12 21.882z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              WhatsApp
            </p>
            <p className="text-xs text-zinc-400 dark:text-gray-500">Respuesta en minutos</p>
          </div>
        </a>

        <a
          href="mailto:hola@calificar.com.ar"
          className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3 hover:border-violet-200 dark:hover:border-violet-800 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center flex-shrink-0 text-lg">✉️</div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
              Email
            </p>
            <p className="text-xs text-zinc-400 dark:text-gray-500">hola@calificar.com.ar</p>
          </div>
        </a>
      </div>

      {/* Guía rápida */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-zinc-50 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500">GUÍA RÁPIDA</p>
        </div>
        {[
          { n: '1', t: 'Personalizá tu tarjeta',  d: 'Subí tu logo y elegí el color en "Tarjeta"',           nav: 'tarjeta' },
          { n: '2', t: 'Compartí el QR',          d: 'Mostralo en tu mostrador o compartilo por WhatsApp',   nav: 'hoy' },
          { n: '3', t: 'Sellá a tus clientes',    d: 'Manualmente desde "Clientes" o escaneando su tarjeta', nav: 'clientes' },
          { n: '4', t: 'Enviá avisos push',        d: 'Comunicá ofertas a todos tus clientes con un click',  nav: 'push' },
        ].map(step => (
          <button
            key={step.n}
            onClick={() => onNav(step.nav)}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-zinc-50 dark:border-gray-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
              {step.n}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{step.t}</p>
              <p className="text-xs text-zinc-400 dark:text-gray-500 mt-0.5">{step.d}</p>
            </div>
            <span className="text-zinc-300 dark:text-gray-600 text-sm">›</span>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-50 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-gray-500">PREGUNTAS FRECUENTES</p>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-zinc-50 dark:border-gray-800 last:border-0">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-sm font-semibold text-zinc-900 dark:text-white pr-4">{faq.q}</p>
              <span className="text-zinc-400 dark:text-gray-500 text-sm flex-shrink-0">{openFaq === i ? '▲' : '▼'}</span>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-zinc-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
