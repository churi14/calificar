'use client'

import { useState } from 'react'
import Link from 'next/link'
import HeroNav from '@/components/landing/HeroNav'
import Footer from '@/components/landing/Footer'

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
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-semibold text-[#0F172A] text-base leading-snug">{q}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 transition-transform ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <p className="text-gray-600 text-sm leading-relaxed pb-5 pr-10">
          {a}
        </p>
      )}
    </div>
  )
}

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Logo */}
      <div className="fixed top-6 left-6 sm:left-10 z-50">
        <Link href="/" className="font-extrabold text-xl text-gray-900 flex items-center gap-1.5">
          <img src="/logo.svg" alt="Calificar" className="h-7 w-auto" />
          <span className="font-extrabold text-xl text-[#0F172A]">Calificar</span>
        </Link>
      </div>
      <div className="fixed top-6 right-6 lg:right-10 z-50">
        <HeroNav />
      </div>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 bg-[#F5EFE7] text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-[#FBCAD8] text-[#0F172A] text-xs font-extrabold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            FAQ
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] leading-tight mb-4">
            Preguntas frecuentes
          </h1>
          <p className="text-gray-600 text-lg">
            Todo lo que necesitás saber antes de arrancar.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
            {FAQS.map(f => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-lg font-semibold text-[#0F172A] mb-2">¿No encontraste lo que buscabas?</p>
          <p className="text-gray-500 mb-8">Escribinos por WhatsApp y te respondemos en minutos.</p>
          <a href={WA} target="_blank"
            className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1e293b] transition-colors shadow-lg text-base">
            Hacer una pregunta →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
