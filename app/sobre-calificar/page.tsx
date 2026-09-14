import Link from 'next/link'
import type { Metadata } from 'next'
import DarkLayout from '@/components/landing/DarkLayout'

export const metadata: Metadata = {
  title: 'Sobre Calificar — Quiénes somos',
  description: 'Calificar es un sistema de carteles NFC + QR para conseguir más reseñas en Google. Desarrollado por En Red Consultora, empresa argentina de tecnología para pymes.',
  alternates: { canonical: 'https://calificar.com.ar/sobre-calificar' },
  openGraph: {
    title: 'Sobre Calificar — Quiénes somos',
    description: 'Nacimos para darle a los pequeños negocios el control de su reputación online. Parte de En Red Consultora.',
    url: 'https://calificar.com.ar/sobre-calificar',
  },
}

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

export default function SobreCalificarPage() {
  return (
    <DarkLayout>
      {/* HERO */}
      <section className="pt-14 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-block text-violet-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
            Quiénes somos
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
            Sobre Calificar
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Nacimos para darle a los pequeños y medianos negocios una herramienta que antes solo tenían las grandes cadenas: control real sobre su reputación online.
          </p>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-display text-2xl font-extrabold text-white mb-4">El problema que vimos</h2>
            <p className="text-slate-400 leading-relaxed">
              Muchos dueños de locales nos contaban lo mismo: trabajan todo el día para que sus clientes estén contentos, pero las reseñas en Google no reflejan eso. Los clientes satisfechos no dejan reseñas — no es que no quieran, simplemente no lo hacen solos. Y cuando alguien tiene un mal día y sí escribe, esa reseña queda ahí para siempre.
            </p>
          </div>

          <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-display text-2xl font-extrabold text-white mb-4">Nuestra solución</h2>
            <p className="text-slate-400 leading-relaxed">
              Calificar es un sistema que combina carteles físicos con tecnología NFC y QR para capturar la opinión del cliente en el momento exacto: cuando termina su experiencia en tu local. Si estuvo conforme, lo enviamos directo a Google. Si no, lo redirigimos hacia vos en privado para que puedas resolver el problema antes de que se convierta en una mala reseña pública.
            </p>
          </div>

          <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-display text-2xl font-extrabold text-white mb-4">Para quién es</h2>
            <p className="text-slate-400 leading-relaxed">
              Calificar está pensado para restaurantes, bares, cafeterías, peluquerías, clínicas, talleres, tiendas y cualquier negocio con atención al público que quiera mejorar su posicionamiento en Google Maps y tener más control sobre lo que dicen de él en internet.
            </p>
          </div>

          <div className="rounded-3xl p-8" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <h2 className="font-display text-2xl font-extrabold text-white mb-6">Nuestros valores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🎯', t: 'Simplicidad', d: 'Que funcione para cualquier negocio sin necesitar soporte técnico.' },
                { icon: '🤝', t: 'Confianza', d: 'No vendemos humo. Mostramos resultados reales desde el primer mes.' },
                { icon: '🇦🇷', t: 'Local', d: 'Hecho en Argentina, para negocios argentinos. Entendemos el contexto.' },
              ].map(v => (
                <div key={v.t} className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-3xl mb-3">{v.icon}</div>
                  <h3 className="font-bold text-white mb-2">{v.t}</h3>
                  <p className="text-sm text-slate-400">{v.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EN RED CONSULTORA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl py-14 px-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold mb-4">Parte del grupo</p>
          <a href="https://www.enredconsultora.com.ar/" target="_blank" rel="noopener noreferrer"
            className="inline-block text-white text-2xl font-extrabold hover:text-violet-300 transition-colors mb-4">
            En Red Consultora
          </a>
          <p className="text-slate-400 leading-relaxed max-w-xl mx-auto">
            Calificar es un producto desarrollado por En Red Consultora, una empresa de consultoría y desarrollo digital enfocada en ayudar a los negocios a crecer usando tecnología. Combinamos estrategia, diseño y herramientas digitales para que las pymes compitan de igual a igual con las grandes marcas.
          </p>
          <a href="https://www.enredconsultora.com.ar/" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-6 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-4">
            Conocer más sobre En Red Consultora →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-2xl font-extrabold text-white mb-4">¿Hablamos?</h2>
          <p className="text-slate-400 mb-8">Si tenés dudas sobre el sistema o querés saber si es para tu negocio, escribinos.</p>
          <a href={WA} target="_blank"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg shadow-violet-900/40 text-base">
            Escribinos por WhatsApp →
          </a>
        </div>
      </section>
    </DarkLayout>
  )
}
