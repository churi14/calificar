import Link from 'next/link'
import HeroNav from '@/components/landing/HeroNav'
import Footer from '@/components/landing/Footer'

const WA = 'https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

const BENEFITS = [
  {
    icon: '⭐',
    title: 'Más reseñas 5 estrellas en Google',
    desc: 'El sistema dirige a los clientes satisfechos directamente a tu perfil de Google. Cuantas más reseñas positivas tengas, más alto aparecés en Google Maps cuando alguien busca un local como el tuyo.',
    color: 'bg-amber-50',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    icon: '🛡️',
    title: 'Las quejas no llegan a internet',
    desc: 'Cuando un cliente no está del todo satisfecho, el sistema lo redirige a vos en privado antes de que pueda publicar una mala reseña. Podés resolver el problema sin que nadie más lo vea.',
    color: 'bg-green-50',
    iconBg: 'bg-green-100 text-green-700',
  },
  {
    icon: '📱',
    title: 'Sin apps, sin fricción',
    desc: 'El cliente apoya el celular cerca del cartel o escanea el QR. En tres segundos ya está calificando. No necesita instalar nada, crear cuenta ni tener datos especiales.',
    color: 'bg-blue-50',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '📊',
    title: 'Métricas en tiempo real',
    desc: 'Desde tu panel ves cuántos clientes pasaron por el funnel, cuántos fueron a Google y cuántos te dejaron feedback privado. Todo por local y por período.',
    color: 'bg-violet-50',
    iconBg: 'bg-violet-100 text-violet-700',
  },
  {
    icon: '👥',
    title: 'Medí el desempeño de tu equipo',
    desc: 'Cada mozo, vendedor o empleado puede tener su propia tarjeta o QR. Ves quién genera más reseñas y podés reconocer al que más se esfuerza en atender bien.',
    color: 'bg-pink-50',
    iconBg: 'bg-pink-100 text-pink-700',
  },
  {
    icon: '🔗',
    title: 'Link dinámico, siempre actualizado',
    desc: 'El destino del QR y el NFC se puede cambiar en cualquier momento desde tu panel, sin cambiar el cartel físico. Si cambiás de lugar de Google, listo — actualizás el link y el cartel sigue funcionando.',
    color: 'bg-orange-50',
    iconBg: 'bg-orange-100 text-orange-700',
  },
]

const STATS = [
  { value: '3 seg', label: 'es todo lo que tarda un cliente en calificar' },
  { value: '+300%', label: 'más reseñas en los primeros 90 días (promedio)' },
  { value: '0 apps', label: 'el cliente no tiene que instalar nada' },
]

export default function BeneficiosPage() {
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
      <section className="pt-32 pb-20 px-6 text-center bg-[#F5EFE7]">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#FBCAD8] text-[#0F172A] text-xs font-extrabold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            Por qué Calificar
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] leading-tight mb-6">
            Un sistema que trabaja mientras vos atendés
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Cada cliente que pasa por tu local es una oportunidad de mejorar tu reputación online. Calificar convierte esa oportunidad en acción automáticamente, sin que tengas que pedirle nada a nadie.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#0F172A] py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-white mb-2">{s.value}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#0F172A] text-center mb-4">
            Todo lo que ganás con el sistema
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            Desde el primer día que instalás el cartel, el sistema empieza a trabajar para tu reputación.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className={`${b.color} rounded-3xl p-8`}>
                <div className={`w-12 h-12 rounded-2xl ${b.iconBg} flex items-center justify-center text-2xl mb-5`}>
                  {b.icon}
                </div>
                <h3 className="font-extrabold text-[#0F172A] text-lg mb-3">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA — simple */}
      <section className="bg-[#F5EFE7] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#0F172A] mb-4">Así de simple es</h2>
          <p className="text-gray-500 mb-16">Tres pasos. Sin complicaciones.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { n: '1', t: 'El cliente escanea', d: 'Apoya el celu al cartel NFC o escanea el QR. Sin apps, sin registro.' },
              { n: '2', t: 'Califica su experiencia', d: 'Si fue positiva, va directo a Google. Si no, te escribe a vos en privado.' },
              { n: '3', t: 'Vos ves todo', d: 'Desde el panel ves scans, positivos, negativos y el desempeño por empleado.' },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="w-10 h-10 bg-[#0F172A] text-white rounded-full flex items-center justify-center font-extrabold text-lg mb-5 mx-auto">
                  {s.n}
                </div>
                <h3 className="font-extrabold text-[#0F172A] mb-3">{s.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#0F172A] mb-4">
            ¿Listo para multiplicar tus reseñas?
          </h2>
          <p className="text-gray-500 mb-10">Hablemos. Te contamos cómo funciona y qué cartel le conviene a tu local.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={WA} target="_blank"
              className="inline-flex items-center justify-center bg-[#0F172A] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1e293b] transition-colors shadow-lg text-base">
              Quiero mi sistema →
            </a>
            <Link href="/r/demo"
              className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full hover:border-gray-400 transition-colors text-base">
              Ver demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
