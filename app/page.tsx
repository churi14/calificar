import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  const WA = 'https://wa.me/5491100000000?text=Hola!%20Quiero%20info%20sobre%20Calificar%20para%20mi%20local.'

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* NAV */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-gray-900 flex items-center gap-1.5">
            <span className="text-amber-500">★</span> calificar
          </span>
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
            <Link href="/tienda" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium">Carteles</Link>
            <Link href="/r/demo" className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium">Demo</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 hidden sm:block">
              Iniciar sesión
            </Link>
            <a href={WA} target="_blank"
              className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Quiero mi sistema →
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-0 lg:pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 mb-6">
                ★ +200 negocios ya lo usan
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-6">
                Más reseñas<br/>5 estrellas.<br/>
                <span className="text-amber-500">Menos malas.</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                El cliente feliz va directo a Google. El insatisfecho te escribe a vos en privado.
                Protegé tu reputación y mejorá tu servicio al mismo tiempo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href={WA} target="_blank"
                  className="bg-gray-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors text-base">
                  Quiero mi sistema →
                </a>
                <Link href="/tienda"
                  className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-base">
                  Ver carteles
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-4">Incluye cartel NFC físico + plataforma digital</p>
            </div>

            {/* Mockup celular */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-[280px] sm:w-[320px]">
                {/* Glow de fondo */}
                <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full scale-90 translate-y-10"/>
                {/* Frame del celular */}
                <div className="relative rounded-[2.5rem] border-[8px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"/>
                  <Image src="/screenshots/funnel.png" alt="Funnel de Calificar en el celular"
                    width={320} height={620} className="w-full h-auto"/>
                </div>
                {/* Badge flotante */}
                <div className="absolute -left-6 top-1/3 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100 hidden sm:block">
                  <p className="text-xs text-gray-400 mb-0.5">Filtro activo</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full"/> Protegiendo tu reputación
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n:'01', t:'El cliente escanea tu cartel', d:'Con el celu, en 2 segundos. Sin apps, sin buscar nada.' },
              { n:'02', t:'Califica su experiencia', d:'4 o 5 estrellas → Google Maps. 1, 2 o 3 → te escribe a vos en privado.' },
              { n:'03', t:'Vos solo recibís las buenas', d:'Las reseñas negativas se filtran antes de llegar a Google. Tu reputación crece.' },
            ].map(({ n, t, d }) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold mb-4">{n}</div>
                <h3 className="font-bold text-gray-900 mb-2">{t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <Image src="/screenshots/dashboard.png" alt="Dashboard de Calificar"
                width={1200} height={500} className="w-full h-auto"/>
            </div>
          </div>
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 mb-5">
              📊 Tu panel de control
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Todas tus estadísticas en un solo lugar
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Cuántos clientes escanearon tu cartel, cuántos fueron a Google, cuántos te escribieron en privado.
              Todo en tiempo real, sin planillas ni complicaciones.
            </p>
            <div className="space-y-3 max-w-sm mx-auto lg:mx-0">
              {[
                'Estadísticas actualizadas al instante',
                'Feedback privado de clientes insatisfechos',
                'Historial de los últimos 7 días',
                'Acceso desde el celu o la compu',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-amber-500 font-bold">✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Todo lo que incluye</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { e:'🛡️', t:'Filtro anti-haters', d:'Los clientes descontentos te escriben a vos. Los contentos van a Google.' },
              { e:'🤖', t:'Respuestas con IA', d:'Pegás la reseña y la IA te redacta una respuesta profesional en segundos.' },
              { e:'📊', t:'Estadísticas en tiempo real', d:'Cuántos scans, cuántos positivos, cuántos negativos y de qué día.' },
              { e:'👥', t:'Ranking de empleados', d:'QR personalizado por mozo/vendedor. Sabés quién consigue más reseñas.' },
              { e:'🔗', t:'Link dinámico', d:'El QR del cartel nunca cambia. Vos cambiás el destino desde la plataforma.' },
              { e:'📱', t:'Cartel físico incluido', d:'NFC + QR configurado y listo para instalar en tu local. Sin complicaciones.' },
            ].map(({ e, t, d }) => (
              <div key={t} className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                <span className="text-2xl">{e}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMPLEADOS */}
      <section className="bg-gray-900 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30 mb-5">
                👥 Función exclusiva
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Sabé qué mozo trae más reseñas
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Cada empleado tiene su propia tarjeta NFC. Cuando el cliente la escanea,
                la reseña queda registrada a nombre de ese mozo o vendedor.
                A fin de mes sabés exactamente quién aporta más a tu reputación — y podés premiarlo.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Tarjeta NFC personal por empleado',
                  'Ranking en tiempo real en tu dashboard',
                  'Incentivá a tu equipo con datos reales',
                  'Funciona con mozos, vendedores y cajeros',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-amber-500 font-bold">✓</span>{f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/r/demo?emp=maria"
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors text-sm">
                  Probar tarjeta de mozo →
                </Link>
                <a href={WA} target="_blank"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
                  Consultar precio
                </a>
              </div>
            </div>

            {/* Mockup celular con empleado */}
            <div className="relative flex justify-center">
              <div className="relative w-[260px] sm:w-[290px]">
                <div className="absolute inset-0 bg-amber-400/10 blur-3xl rounded-full scale-90"/>
                <div className="relative rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-800 rounded-b-2xl z-10"/>
                  <Image src="/screenshots/funnel-empleado.png" alt="Funnel personalizado por empleado"
                    width={290} height={620} className="w-full h-auto"/>
                </div>
              </div>
            </div>
          </div>

          {/* RANKING */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-sm">Ranking del mes — Café El Sol</h3>
              <span className="text-xs text-amber-400 font-semibold">Junio 2026</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { n:'María García', s:34, pct:100, medal:'🥇' },
                { n:'Juan Torres',  s:28, pct:82,  medal:'🥈' },
                { n:'Laura Sosa',   s:19, pct:56,  medal:'🥉' },
                { n:'Carlos Méndez',s:11, pct:32,  medal:'' },
              ].map((emp,idx) => (
                <div key={emp.n} className="flex items-center gap-3">
                  <span className="text-base w-5 text-center">{emp.medal || `${idx+1}°`}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white font-medium">{emp.n}</span>
                      <span className="text-xs text-gray-400">{emp.s} reseñas</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{width:`${emp.pct}%`}}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRECIO */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white text-center mb-6">¿Cuánto cuesta agregar empleados?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              {[
                { prod:'Cartel de mostrador', desc:'NFC + QR del local', price:'$14.500', note:'pago único' },
                { prod:'Tarjeta por empleado', desc:'NFC card personal', price:'$3.600', note:'c/u · pack ×5 $18.000' },
                { prod:'Plataforma', desc:'Dashboard + filtro + IA', price:'$8.000', note:'por mes' },
              ].map(p => (
                <div key={p.prod} className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">{p.prod}</p>
                  <p className="text-2xl font-extrabold text-white">{p.price}</p>
                  <p className="text-xs text-amber-400 mt-0.5">{p.note}</p>
                  <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-400 mb-3">
                Un restaurante con 4 mozos → cartel + 4 tarjetas + suscripción = <span className="text-white font-bold">$40.500 de entrada + $8.000/mes</span>
              </p>
              <a href={WA} target="_blank"
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                Quiero esto para mi local
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Planes de la plataforma</h2>
          <p className="text-gray-500 text-center mb-12">El cartel físico y las tarjetas de empleados se cobran aparte.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name:'Gratis', price:'$0', period:'incluido',
                color:'border-gray-200',
                features:['1 local','Filtro anti-haters','QR para imprimir','10 respuestas IA/mes'],
              },
              {
                name:'Básico', price:'$8.000', period:'ARS/mes',
                color:'border-amber-400 ring-2 ring-amber-400',
                badge:'✦ Más popular',
                features:['Hasta 3 locales','Filtro anti-haters','100 respuestas IA/mes','Ranking de empleados'],
              },
              {
                name:'Pro', price:'$15.000', period:'ARS/mes',
                color:'border-gray-200',
                features:['Locales ilimitados','Filtro anti-haters','IA ilimitada','Ranking de empleados'],
              },
            ].map(plan => (
              <div key={plan.name} className={`bg-white rounded-2xl border p-6 ${plan.color} relative`}>
                {(plan as any).badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {(plan as any).badge}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="text-sm flex items-center gap-2 text-gray-600">
                      <span className="text-amber-500">✓</span><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={WA} target="_blank"
                  className="block text-center py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Consultar por WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 lg:py-24 px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          ¿Listo para empezar?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Te instalamos el cartel y configuramos todo. En menos de una semana
          empezás a recibir mejores reseñas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={WA} target="_blank"
            className="bg-gray-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors text-base">
            Quiero mi sistema →
          </a>
          <Link href="/r/demo"
            className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-base">
            Ver demo
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center">
        <p className="text-sm text-gray-400">
          <span className="font-semibold text-gray-600">★ calificar.ar</span> — Hecho en Argentina 🇦🇷
        </p>
        <Link href="/login" className="text-xs text-gray-300 hover:text-gray-500 mt-2 inline-block">
          Acceso clientes
        </Link>
      </footer>
    </div>
  )
}