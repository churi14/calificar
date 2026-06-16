'use client'

import { useEffect, useState } from 'react'

// Testimonios de ejemplo — reemplazar por reales cuando los tengas
const TESTIMONIALS = [
  {
    quote: 'Desde que pusimos el cartel, las quejas nos llegan por WhatsApp y las reseñas en Google solo muestran lo mejor. Cambió la forma en que manejamos la atención al cliente.',
    name: 'Lucio Ortiz',
    role: 'Dueño, Café El Sol',
  },
  {
    quote: 'Lo más útil es saber qué mozo trae más reseñas. Ahora el equipo le pone más onda a pedir la opinión al final de la mesa.',
    name: 'Marina Díaz',
    role: 'Encargada, Restaurante La Parrilla',
  },
  {
    quote: 'Configuramos todo en una tarde. El cartel quedó en el mostrador y desde la primera semana ya se notó la diferencia en las reseñas.',
    name: 'Tomás Beltrán',
    role: 'Dueño, Peluquería Estilo Propio',
  },
]

export default function TestimonialPill() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(id)
  }, [])

  const t = TESTIMONIALS[i]

  return (
    <div>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-full p-8 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-xl">
        {/* Foto del cliente */}
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
          Foto
        </div>

        {/* Texto */}
        <div className="text-center md:text-left">
          <p className="text-gray-700 leading-relaxed mb-4">
            &ldquo;{t.quote}&rdquo;
          </p>
          <p className="font-display font-bold text-gray-900">{t.name}</p>
          <p className="text-sm text-gray-500">{t.role}</p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            aria-label={`Ver testimonio ${idx + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === i ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}/>
        ))}
      </div>
    </div>
  )
}
