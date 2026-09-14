'use client'

import { useState } from 'react'
import Link from 'next/link'
import DarkLayout from '@/components/landing/DarkLayout'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Tengo%20una%20pregunta%20sobre%20Calificar.'

const FAQS = [
  {
    q: '¿Cómo funciona exactamente?',
    a: 'El cliente apoya su celular cerca del cartel NFC o escanea el código QR. Aparece una pantalla donde califica su experiencia de 1 a 5 estrellas. Si la puntuación supera el umbral que vos configurás, se lo envía directamente a Google para dejar la reseña. Si no llega al umbral, lo redirigimos a un formulario o WhatsApp privado para que te cuente qué pasó.',
  },
  {
    q: '¿El cliente necesita instalar alguna app?',
    a: 'No. Todo funciona a través del navegador del celular. El cliente no necesita instalar nada, crear una cuenta ni tener ninguna app especial. Solo apoya el celu o escanea el QR, y listo.',
  },
  {
    q: '¿Qué pasa con los clientes que tienen mala experiencia?',
    a: 'En vez de ir directo a Google, el sistema los redirige hacia vos. Pueden mandarte un mensaje por WhatsApp o llenar un formulario privado. Así podés solucionar el problema antes de que se convierta en una reseña negativa pública.',
  },
  {
    q: '¿Qué umbral de estrellas conviene usar?',
    a: 'Depende del negocio. Lo más común es filtrar a los clientes que dan 3 estrellas o menos (umbral en 3). Eso significa que los de 4 y 5 estrellas van a Google, y los de 1 a 3 te escriben a vos. Podés ajustarlo en cualquier momento desde tu panel.',
  },
  {
    q: '¿Puedo tener más de un local?',
    a: 'Sí. Con los planes Básico y Pro podés agregar múltiples locales, cada uno con su propio QR, NFC, colores y configuración. Desde el panel ves las métricas de cada local por separado.',
  },
  {
    q: '¿Cómo se mide el desempeño de cada empleado?',
    a: 'Podés crear un perfil por empleado dentro de cada local. Cada uno tiene su propio QR y link. Cuando el cliente escanea el QR de un empleado específico, el scan se registra a nombre de ese empleado. Desde el ranking del panel ves quién genera más reseñas.',
  },
  {
    q: '¿El cartel incluye la suscripción al sistema?',
    a: 'El cartel físico se compra por única vez. La suscripción al panel de administración (donde ves métricas, configurás el sistema y gestionás empleados) se paga mensualmente. Podés empezar con el plan gratuito y escalar cuando quieras.',
  },
  {
    q: '¿Cuánto tarda la configuración?',
    a: 'Una vez que recibís el cartel, la configuración inicial tarda menos de 10 minutos. Nosotros programamos el chip NFC con tu link antes de enviarlo. Solo tenés que conectar tu cuenta de Google y ajustar los colores si querés.',
  },
  {
    q: '¿Qué pasa si cambio mi link de Google?',
    a: 'Desde el panel podés actualizar el link en cualquier momento sin cambiar el cartel físico. El QR y el NFC son dinámicos: apuntan al link que configuraste, no al link fijo. Así que si cambiás de lugar de Google, actualizás el sistema y el cartel sigue funcionando.',
  },
  {
    q: '¿Cómo pago y cómo me envían el cartel?',
    a: 'El pedido se hace por WhatsApp. Te mandamos los datos de pago y coordinamos el envío por correo o moto según la zona. Los pagos se pueden hacer por transferencia bancaria o MercadoPago.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="py-5 border-b border-white/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left gap-4">
        <span className="font-semibold text-white text-base leading-snug">{q}</span>
        <span className="flex-shrink-0 text-slate-400 text-2xl leading-none transition-transform duration-200" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          +
        </span>
      </button>
      {open && (
        <p className="text-slate-400 text-sm leading-relaxed mt-3 pr-10">
          {a}
        </p>
      )}
    </div>
  )
}

export default function PreguntasFrecuentesPage() {
  return (
    <DarkLayout>
      {/* HERO */}
      <section className="pt-14 pb-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 60%)' }} />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block text-violet-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
            FAQ
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Preguntas frecuentes
          </h1>
          <p className="text-slate-400 text-lg">
            Todo lo que necesitás saber antes de arrancar.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-8 px-6">
        <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-10" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {FAQS.map(f => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 pt-10 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-lg font-semibold text-white mb-2">¿No encontraste lo que buscabas?</p>
          <p className="text-slate-400 mb-8">Escribinos por WhatsApp y te respondemos en minutos.</p>
          <a href={WA} target="_blank"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg shadow-violet-900/40 text-base">
            Hacer una pregunta →
          </a>
        </div>
      </section>
    </DarkLayout>
  )
}
