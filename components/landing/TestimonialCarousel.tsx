'use client'

import { useState, useEffect } from 'react'

// Testimonios de ejemplo — reemplazar por reales cuando los tengas
const TESTIMONIALS = [
  {
    quote: 'Desde que pusimos el cartel, las quejas nos llegan por WhatsApp y las reseñas en Google solo muestran lo mejor. Cambió la forma en que manejamos la atención al cliente.',
    author: 'Lucio Ortiz',
    business: 'Café El Sol',
  },
  {
    quote: 'Lo más útil es saber qué mozo trae más reseñas. Ahora el equipo le pone más onda a pedir la opinión al final de la mesa.',
    author: 'Marina Díaz',
    business: 'Restaurante La Parrilla',
  },
  {
    quote: 'Configuramos todo en una tarde. El cartel quedó en el mostrador y desde la primera semana ya se notó la diferencia en las reseñas.',
    author: 'Tomás Beltrán',
    business: 'Peluquería Estilo Propio',
  },
]

export default function TestimonialCarousel() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(id)
  }, [])

  const t = TESTIMONIALS[i]

  return (
    <div className="text-center">
      <p className="font-display font-semibold text-2xl sm:text-4xl leading-snug max-w-3xl mx-auto mb-8 text-white">
        “{t.quote}”
      </p>
      <p className="font-semibold text-white">{t.author}</p>
      <p className="text-violet-200 text-sm">{t.business}</p>

      <div className="flex justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            aria-label={`Ver testimonio ${idx + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === i ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}/>
        ))}
      </div>
    </div>
  )
}
