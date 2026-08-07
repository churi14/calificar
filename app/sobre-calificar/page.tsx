import Link from 'next/link'
import type { Metadata } from 'next'
import HeroNav from '@/components/landing/HeroNav'
import Footer from '@/components/landing/Footer'

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
      <section className="pt-32 pb-20 px-6 bg-[#F5EFE7]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-[#FBCAD8] text-[#0F172A] text-xs font-extrabold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            Quiénes somos
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] leading-tight mb-6">
            Sobre Calificar
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Nacimos para darle a los pequeños y medianos negocios una herramienta que antes solo tenían las grandes cadenas: control real sobre su reputación online.
          </p>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-10">

          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4">El problema que vimos</h2>
            <p className="text-gray-600 leading-relaxed">
              Muchos dueños de locales nos contaban lo mismo: trabajan todo el día para que sus clientes estén contentos, pero las reseñas en Google no reflejan eso. Los clientes satisfechos no dejan reseñas — no es que no quieran, simplemente no lo hacen solos. Y cuando alguien tiene un mal día y sí escribe, esa reseña queda ahí para siempre.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4">Nuestra solución</h2>
            <p className="text-gray-600 leading-relaxed">
              Calificar es un sistema que combina carteles físicos con tecnología NFC y QR para capturar la opinión del cliente en el momento exacto: cuando termina su experiencia en tu local. Si estuvo conforme, lo enviamos directo a Google. Si no, lo redirigimos hacia vos en privado para que puedas resolver el problema antes de que se convierta en una mala reseña pública.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4">Para quién es</h2>
            <p className="text-gray-600 leading-relaxed">
              Calificar está pensado para restaurantes, bares, cafeterías, peluquerías, clínicas, talleres, tiendas y cualquier negocio con atención al público que quiera mejorar su posicionamiento en Google Maps y tener más control sobre lo que dicen de él en internet.
            </p>
          </div>

          <div className="bg-[#F5EFE7] rounded-3xl p-8">
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4">Nuestros valores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: '🎯', t: 'Simplicidad', d: 'Que funcione para cualquier negocio sin necesitar soporte técnico.' },
                { icon: '🤝', t: 'Confianza', d: 'No vendemos humo. Mostramos resultados reales desde el primer mes.' },
                { icon: '🇦🇷', t: 'Local', d: 'Hecho en Argentina, para negocios argentinos. Entendemos el contexto.' },
              ].map(v => (
                <div key={v.t} className="bg-white rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-3">{v.icon}</div>
                  <h3 className="font-bold text-[#0F172A] mb-2">{v.t}</h3>
                  <p className="text-sm text-gray-500">{v.d}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* EN RED CONSULTORA */}
      <section className="bg-[#0F172A] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-4">Parte del grupo</p>
          <a href="https://www.enredconsultora.com.ar/" target="_blank" rel="noopener noreferrer"
            className="inline-block text-white text-2xl font-extrabold hover:text-gray-300 transition-colors mb-4">
            En Red Consultora
          </a>
          <p className="text-gray-400 leading-relaxed max-w-xl mx-auto">
            Calificar es un producto desarrollado por En Red Consultora, una empresa de consultoría y desarrollo digital enfocada en ayudar a los negocios a crecer usando tecnología. Combinamos estrategia, diseño y herramientas digitales para que las pymes compitan de igual a igual con las grandes marcas.
          </p>
          <a href="https://www.enredconsultora.com.ar/" target="_blank" rel="noopener noreferrer"
            className="inline-block mt-6 text-sm font-semibold text-gray-400 hover:text-white transition-colors underline underline-offset-4">
            Conocer más sobre En Red Consultora →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4">¿Hablamos?</h2>
          <p className="text-gray-500 mb-8">Si tenés dudas sobre el sistema o querés saber si es para tu negocio, escribinos.</p>
          <a href={WA} target="_blank"
            className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1e293b] transition-colors shadow-lg text-base">
            Escribinos por WhatsApp →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
