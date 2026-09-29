import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Precios de Calificar explicados · qué incluye cada plan',
  description: 'Los tres planes de Calificar explicados en lenguaje claro: qué incluye Starter ($14.999), Pro ($29.999) y Ultimate ($69.999) ARS por mes. 14 días gratis, sin tarjeta.',
  openGraph: {
    title: 'Precios de Calificar · Starter, Pro y Ultimate',
    description: 'Tarjetas de fidelización digitales para tu negocio. Planes desde $14.999 ARS/mes. 14 días gratis.',
  },
}

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur z-40">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/fidelizacion" className="font-extrabold text-zinc-900 text-lg tracking-tight">
            Calificar
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/negocio/fidelizacion" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link href="/fidelizacion/onboarding" className="text-sm font-bold bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors">
              Probá 14 días gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-12 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600 mb-4">Precios explicados</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 leading-tight mb-6">
          Qué incluye cada plan,<br className="hidden sm:block" /> sin letra chica.
        </h1>
        <p className="text-zinc-500 text-lg leading-relaxed max-w-2xl mx-auto">
          <strong className="text-zinc-700">Tarjetas y notificaciones ilimitadas en los tres planes</strong>, menos de $1.000 al día en el plan más popular.
          Pagás por el tamaño de tu negocio: locales, programas y cantidad de usuarios.
          14 días gratis, sin tarjeta; cancelás cuando querés.
        </p>
      </section>

      {/* Plan cards */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          {/* Starter */}
          <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Para un local</p>
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-3">Starter</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold text-zinc-900">$14.999</span>
              <span className="text-sm text-zinc-400">ARS / mes</span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">$500/día · menos que un café</p>
            <p className="text-sm text-zinc-600 mb-5 flex-1">
              Tu tarjeta con tu marca, notificaciones y tus clientes. Todo lo esencial.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-zinc-600">
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Tu tarjeta con tu logo y colores</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Tarjetas ilimitadas</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Notificaciones ilimitadas</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Cartelito NFC + QR para el mostrador</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Panel con tus números</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>1 local · 1 programa · 1 usuario</li>
            </ul>
            <Link href="/fidelizacion/onboarding" className="block text-center py-3 rounded-xl font-bold text-sm border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all mb-3">
              Probá 14 días gratis →
            </Link>
            <a href="#starter" className="text-center text-xs text-violet-600 font-semibold hover:text-violet-800 transition-colors">
              Ver qué incluye Starter ↓
            </a>
          </div>

          {/* Pro — Recomendado */}
          <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col relative shadow-2xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
              RECOMENDADO
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 mt-1">Para destacar</p>
            <h2 className="text-2xl font-extrabold text-white mb-3">Pro</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold text-white">$29.999</span>
              <span className="text-sm text-zinc-400">ARS / mes</span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">$1.000/día · menos que dos cafés</p>
            <p className="text-sm text-zinc-300 mb-5 flex-1">
              Tu tarjeta al detalle, campañas que salen solas y cupones únicos por objetivo.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-zinc-300">
              <li className="flex gap-2"><span className="text-violet-400 font-bold flex-shrink-0">✓</span>Todo lo de Starter</li>
              <li className="flex gap-2"><span className="text-violet-400 font-bold flex-shrink-0">✓</span>Hasta 3 programas de fidelidad</li>
              <li className="flex gap-2"><span className="text-violet-400 font-bold flex-shrink-0">✓</span>Campañas de cumpleaños automáticas</li>
              <li className="flex gap-2"><span className="text-violet-400 font-bold flex-shrink-0">✓</span>Formulario de registro personalizable</li>
              <li className="flex gap-2"><span className="text-violet-400 font-bold flex-shrink-0">✓</span>Cupones únicos por objetivo</li>
              <li className="flex gap-2"><span className="text-violet-400 font-bold flex-shrink-0">✓</span>Hasta 3 locales · 3 programas · 3 usuarios</li>
            </ul>
            <Link href="/fidelizacion/onboarding" className="block text-center py-3 rounded-xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-500 transition-all mb-3">
              Probá 14 días gratis →
            </Link>
            <a href="#pro" className="text-center text-xs text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Ver qué incluye Pro ↓
            </a>
          </div>

          {/* Ultimate */}
          <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Sin límites</p>
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-3">Ultimate</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold text-zinc-900">$69.999</span>
              <span className="text-sm text-zinc-400">ARS / mes</span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">$2.333/día · para todas tus sucursales</p>
            <p className="text-sm text-zinc-600 mb-5 flex-1">
              Sucursales, programas y usuarios ilimitados. API y exportación completa.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-zinc-600">
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Todo lo de Pro</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Programas ilimitados</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Sucursales ilimitadas</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Múltiples usuarios por local</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>Exportación completa con historial</li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">✓</span>API + integración con tu sistema</li>
            </ul>
            <Link href="/fidelizacion/onboarding" className="block text-center py-3 rounded-xl font-bold text-sm border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all mb-3">
              Probá 14 días gratis →
            </Link>
            <a href="#ultimate" className="text-center text-xs text-violet-600 font-semibold hover:text-violet-800 transition-colors">
              Ver qué incluye Ultimate ↓
            </a>
          </div>
        </div>

        {/* Enterprise strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-5">
          <div>
            <p className="font-bold text-zinc-900 text-sm">¿Tenés una cadena o necesitás algo a medida?</p>
            <p className="text-xs text-zinc-500 mt-0.5">Cotizamos integraciones con tu POS o sistema existente.</p>
          </div>
          <a href="https://wa.me/5491123867934?text=Hola!%20Quiero%20info%20sobre%20un%20plan%20Enterprise%20para%20Calificar."
            target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-colors"
            style={{ background: '#25D366' }}>
            Hablar por WhatsApp
          </a>
        </div>
      </section>

      {/* Glosario */}
      <section className="bg-zinc-50 border-y border-zinc-200 py-16">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Lo que significa cada cosa</p>
          <h2 className="text-3xl font-extrabold text-zinc-900 mb-2">Los términos, explicados en una línea.</h2>
          <p className="text-zinc-500 mb-10">Sin jerga. Cada uno con lo que incluye cada plan.</p>

          <div className="space-y-0 divide-y divide-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
            {[
              {
                term: 'Tarjeta de lealtad digital (wallet)',
                def: 'La tarjeta de sellos que tu cliente guarda en Apple Wallet o Google Wallet. No descarga ninguna app: la agrega con un QR o enlace y le queda junto a sus tarjetas de pago. "Ilimitadas" significa que no pagás más por tener más clientes.',
                plans: [['Starter', 'Ilimitadas'], ['Pro', 'Ilimitadas'], ['Ultimate', 'Ilimitadas']],
              },
              {
                term: 'Sello',
                def: 'Cada vez que un cliente visita o compra, escaneás su tarjeta desde tu celular y el sello se marca solo. Al llegar a la meta (por ejemplo, 8 visitas) canjea el premio y la tarjeta vuelve a empezar.',
                plans: [['Starter', 'Ilimitados'], ['Pro', 'Ilimitados'], ['Ultimate', 'Ilimitados']],
              },
              {
                term: 'Programa de fidelidad',
                def: 'Una tarjeta de sellos activa, con su propia meta y su propio premio. Un café con tarjeta de 8 sellos es 1 programa; si además querés una tarjeta de postres, es otro programa.',
                plans: [['Starter', '1'], ['Pro', 'Hasta 3'], ['Ultimate', 'Ilimitados']],
              },
              {
                term: 'Local / Sucursal',
                def: 'Cada local físico donde dás sellos. Cada sucursal tiene su propio panel con sus propios números.',
                plans: [['Starter', '1'], ['Pro', 'Hasta 3'], ['Ultimate', 'Ilimitadas']],
                note: 'Para 2 o más locales, subís de plan.',
              },
              {
                term: 'Usuario del equipo',
                def: 'Cada persona con acceso al panel: vos, un socio, la persona de caja. Todas pueden escanear y dar sellos desde su celular.',
                plans: [['Starter', '1'], ['Pro', 'Hasta 3'], ['Ultimate', 'Ilimitados']],
              },
              {
                term: 'Notificación push',
                def: 'Un mensaje que aparece en la pantalla del celular de tu cliente, como los de cualquier app, sin que él haya instalado nada y sin que vos pagues publicidad. Lo escribís en el panel y lo mandás a todos o a un grupo.',
                plans: [['Starter', 'Ilimitadas'], ['Pro', 'Ilimitadas'], ['Ultimate', 'Ilimitadas']],
              },
              {
                term: 'Zona de notificación (geolocalización)',
                def: 'Un radio alrededor de tu local. Cuando un cliente con tu tarjeta pasa por ahí, su celular le muestra tu mensaje solo, sin que nadie lo mande. Es lo que trae de vuelta al que iba de paso.',
                plans: [['Starter', '1 zona'], ['Pro', '1 por local'], ['Ultimate', 'Ilimitadas']],
              },
              {
                term: 'Cupón único',
                def: 'Un código irrepetible que se genera automáticamente cuando el cliente completa la tarjeta o alcanza un hito. Lo mostrás al local para canjearlo. Sirve para evitar fraude.',
                plans: [['Starter', 'Incluidos'], ['Pro', 'Incluidos'], ['Ultimate', 'Incluidos']],
              },
              {
                term: 'Exportación de datos',
                def: 'Tus clientes son tuyos. En todos los planes descargás la lista con nombre y teléfono. En Ultimate, además, el detalle: sellos, historial y premios.',
                plans: [['Starter', 'Lista de clientes'], ['Pro', 'Lista de clientes'], ['Ultimate', 'Clientes + historial']],
              },
            ].map(({ term, def, plans, note }) => (
              <div key={term} className="px-6 py-5">
                <p className="font-bold text-zinc-900 text-sm mb-1">{term}</p>
                <p className="text-sm text-zinc-500 mb-3 leading-relaxed">{def}</p>
                {note && <p className="text-xs text-amber-600 font-medium mb-3">⚠ {note}</p>}
                <div className="flex flex-wrap gap-3">
                  {plans.map(([plan, val]) => (
                    <div key={plan} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{plan}</span>
                      <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan por plan */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Plan por plan</p>
          <h2 className="text-3xl font-extrabold text-zinc-900 mb-12">Qué hacés con cada plan.</h2>

          {/* Starter detail */}
          <div id="starter" className="mb-20 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
              <h3 className="text-2xl font-extrabold text-zinc-900">Starter</h3>
              <Link href="/fidelizacion/onboarding" className="inline-block px-5 py-2.5 rounded-xl font-bold text-sm bg-zinc-900 text-white hover:bg-zinc-700 transition-colors">
                Probá 14 días gratis →
              </Link>
            </div>
            <p className="text-zinc-500 text-sm mb-1"><strong className="text-zinc-700">$14.999 ARS / mes</strong> · $500/día · menos que un café</p>
            <p className="text-zinc-400 text-sm mb-8">Para un local que quiere que sus clientes vuelvan más seguido y saber quiénes son.</p>

            <div className="space-y-8">
              <DetailItem
                icon="🎴"
                title="Tu tarjeta con tu logo y tus colores"
                body="Elegís la recompensa, escribís el nombre de tu negocio y continuás con Google. La tarjeta queda lista en 30 segundos y se actualiza sola en el celular de todos tus clientes: si cambiás el premio o el color, se refleja al instante."
              />
              <DetailItem
                icon="⭐"
                title="Sellos ilimitados"
                body="Cada vez que un cliente visita, escaneás su tarjeta desde tu celular (sin app para el cliente). El sello se marca solo. La meta y el premio los cambiás cuando querés."
              />
              <DetailItem
                icon="🔔"
                title="Notificaciones ilimitadas"
                body="Escribís un mensaje en el panel y se lo mandás a todos tus clientes. Les llega en la pantalla del celular como cualquier app, sin que ellos hayan instalado nada. Cien clientes o diez mil, el precio es el mismo."
              />
              <DetailItem
                icon="📍"
                title="Zona de notificación por geolocalización"
                body="Un radio de acción alrededor de tu local. Cuando un cliente pasa cerca con tu tarjeta guardada, su celular le muestra tu mensaje automáticamente, sin que nadie lo mande. Es lo que trae de vuelta al que iba de paso."
              />
              <DetailItem
                icon="📊"
                title="Panel con tus números y tu lista de clientes"
                body="Quién volvió, cuándo y cuántos sellos tiene. La lista (nombre y teléfono) la exportás cuando querés: es tuya, no queda atrapada en Calificar."
              />
              <DetailItem
                icon="🎁"
                title="Cupones únicos al completar la tarjeta"
                body="Cuando un cliente llega a la meta, el sistema genera un código irrepetible. Lo muestra al mostrador y vos lo marcás como canjeado. Evita que el mismo código se use dos veces."
              />
              <DetailItem
                icon="💬"
                title="Soporte en español"
                body="Por WhatsApp o correo. Te respondemos personas, no bots, también durante la prueba."
              />
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-sm text-zinc-600">
                <strong className="text-zinc-900">1 local · 1 programa de fidelidad · 1 usuario del equipo.</strong> Si necesitás más locales, programas o personas con acceso al panel, Pro trae 3 de cada uno.
              </div>
            </div>
          </div>

          {/* Pro detail */}
          <div id="pro" className="mb-20 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-extrabold text-zinc-900">Pro</h3>
                <span className="text-[10px] font-bold bg-violet-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Recomendado</span>
              </div>
              <Link href="/fidelizacion/onboarding" className="inline-block px-5 py-2.5 rounded-xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-500 transition-colors">
                Probá 14 días gratis →
              </Link>
            </div>
            <p className="text-zinc-500 text-sm mb-1"><strong className="text-zinc-700">$29.999 ARS / mes</strong> · $1.000/día · menos que dos cafés</p>
            <p className="text-zinc-400 text-sm mb-2">Para el negocio que quiere su tarjeta al detalle, hablarle a cada tipo de cliente y hacer campañas que salen solas.</p>
            <p className="text-zinc-400 text-sm mb-8">Todo lo de Starter, y además:</p>

            <div className="space-y-8">
              <DetailItem
                icon="🏆"
                title="Hasta 3 programas de fidelidad"
                body="¿Querés una tarjeta de visitas y otra de compras con monto? Son dos programas. Cada uno con su propia meta, su propio premio y su propia tarjeta. Tus clientes los ven por separado en el wallet."
              />
              <DetailItem
                icon="🎂"
                title="Campañas de cumpleaños automáticas"
                body="Tres mensajes que salen solos: antes del cumpleaños, el día y después. Un regalo que no gasta sellos, con la ventana que vos elegís (el día, su semana o su mes). Lo configurás una vez y corre todos los días, todos los años. Requiere el campo de fecha de nacimiento en el formulario de registro."
              />
              <DetailItem
                icon="📋"
                title="Formulario de registro personalizable"
                body="Elegís qué datos le pedís al cliente cuando se registra: teléfono, cumpleaños, barrio, lo que te sirva. Cada dato extra es un filtro para segmentar tus notificaciones después."
              />
              <DetailItem
                icon="🎟"
                title="Cupones únicos en hitos intermedios"
                body="Además del cupón al completar la tarjeta, podés configurar premios intermedios: en el sello 3 un 10% de descuento, en el sello 6 un producto gratis. Cada uno genera un código único irrepetible."
              />
              <DetailItem
                icon="📍"
                title="Zona de notificación por local"
                body="En Starter tenés una zona global. En Pro, cada local tiene su propia zona de notificación. Mandá una promo solo a los clientes que pasaron cerca de ese local."
              />
              <DetailItem
                icon="📈"
                title="Métricas por sucursal"
                body="Ves los números de cada local por separado: sellos del día, clientes nuevos, premios canjeados. Comparás sucursales sin hacer cuentas."
              />
              <DetailItem
                icon="⚡"
                title="Soporte prioritario"
                body="Los mismos canales que Starter, tu turno primero. Respuesta en menos de 2 horas en horario laboral."
              />
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-sm text-zinc-600">
                <strong className="text-zinc-900">Hasta 3 locales · 3 programas · 3 usuarios del equipo.</strong> Podés tener una tarjeta de café, otra de postres y una membresía VIP al mismo tiempo. Si necesitás más, Ultimate no tiene límite.
              </div>
            </div>
          </div>

          {/* Ultimate detail */}
          <div id="ultimate" className="mb-8 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
              <h3 className="text-2xl font-extrabold text-zinc-900">Ultimate</h3>
              <Link href="/fidelizacion/onboarding" className="inline-block px-5 py-2.5 rounded-xl font-bold text-sm bg-zinc-900 text-white hover:bg-zinc-700 transition-colors">
                Probá 14 días gratis →
              </Link>
            </div>
            <p className="text-zinc-500 text-sm mb-1"><strong className="text-zinc-700">$69.999 ARS / mes</strong> · $2.333/día · para todas tus sucursales</p>
            <p className="text-zinc-400 text-sm mb-2">Para cadenas y negocios que necesitan locales, programas y equipo ilimitados, más integración con sus sistemas.</p>
            <p className="text-zinc-400 text-sm mb-8">Todo lo de Pro, y además:</p>

            <div className="space-y-8">
              <DetailItem
                icon="🏢"
                title="Locales, programas y usuarios ilimitados"
                body="Abrís un local nuevo y lo agregás al panel el mismo día, sin cambiar de plan ni pagar extras. Sumás personas al equipo sin límite: cajeros, supervisores, encargados de zona."
              />
              <DetailItem
                icon="🎯"
                title="Zonas de notificación ilimitadas"
                body="En Starter tenés 1 zona, en Pro una por local. En Ultimate no hay tope: ponés las zonas que necesites en todos tus locales. El celular mantiene activas hasta 10 a la vez (límite de iOS), pero vos configurás todas las que querés."
              />
              <DetailItem
                icon="📤"
                title="Exportación completa con historial"
                body="No solo la lista de clientes: también sellos, historial de visitas y premios canjeados de cada cliente, en un archivo tuyo para cruzarlo con lo que ya usás."
              />
              <DetailItem
                icon="🔌"
                title="API + integración con tu sistema"
                body="El acceso a la API viene habilitado en el plan: dás sellos, consultás clientes y disparás notificaciones desde tu propio sistema o POS. La integración se cotiza aparte según lo que haya que conectar. Escribinos y te decimos precio y tiempos."
              />
              <DetailItem
                icon="👥"
                title="Múltiples usuarios con roles por local"
                body="Asignás personas al panel de un local específico: el encargado del local de Palermo ve solo los números de Palermo, no los de Caballito. Control total por sucursal."
              />
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-sm text-zinc-600">
                <strong className="text-zinc-900">Sin límites de ningún tipo.</strong> Locales, programas, usuarios, zonas y exportación completa. Más API. Es el plan para cuando el negocio creció.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50 border-y border-zinc-200 py-16">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Preguntas de precio</p>
          <h2 className="text-3xl font-extrabold text-zinc-900 mb-10">Lo que preguntan antes de elegir plan.</h2>

          <div className="space-y-0 divide-y divide-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
            {[
              {
                q: '¿Cobran por cliente o por tarjeta?',
                a: 'No. Las tarjetas y las notificaciones son ilimitadas en los tres planes. Pagás por la estructura de tu negocio: locales, usuarios del equipo y programas activos.',
              },
              {
                q: '¿Qué pasa cuando terminan los 14 días gratis?',
                a: 'No se cobra nada automáticamente: no te pedimos tarjeta de crédito durante la prueba. Si te gusta, elegís un plan y seguís donde ibas. Si no, no pasa nada.',
              },
              {
                q: '¿Puedo cambiar de plan después?',
                a: 'Sí, en cualquier momento desde el panel: hacia arriba cuando crezcas o hacia abajo si lo necesitás.',
              },
              {
                q: '¿Qué cuenta como local?',
                a: 'Cada punto físico donde das sellos. Starter incluye 1, Pro hasta 3 y Ultimate los que necesites. Si tenés 2 o más locales, subís de plan.',
              },
              {
                q: '¿El cliente tiene que instalar algo?',
                a: 'No. La tarjeta se agrega a Apple Wallet o Google Wallet con un QR o enlace. No descarga ninguna app extra y le queda guardada junto a sus tarjetas de pago.',
              },
              {
                q: '¿Cómo funciona el pago?',
                a: 'Aceptamos todos los medios disponibles en Mercado Pago. El cobro es mensual y cancelás desde el panel cuando querés, sin que se te cobre el período siguiente.',
              },
              {
                q: '¿Puedo llevarme mis datos si me voy?',
                a: 'Sí. En todos los planes exportás tu lista de clientes (nombre y teléfono). En Ultimate, además, la exportación detallada de sellos, historial y premios.',
              },
              {
                q: '¿Cómo es el soporte?',
                a: 'En español, por WhatsApp o correo, en los tres planes y también durante la prueba. Te responden personas, no bots. Pro y Ultimate tienen prioridad.',
              },
              {
                q: '¿Qué necesito para empezar?',
                a: 'Solo una cuenta de Google. La tarjeta queda lista en 30 segundos: elegís el nombre, la recompensa y el logo, y ya podés compartirla con tus clientes.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group px-6 py-5 cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-sm text-zinc-900 list-none select-none">
                  {q}
                  <span className="ml-4 flex-shrink-0 text-zinc-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 text-center">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">14 DÍAS GRATIS</p>
          <h2 className="text-4xl font-extrabold text-zinc-900 mb-4">
            Empezá gratis.<br className="hidden sm:block" /> Elegí plan después.
          </h2>
          <p className="text-zinc-500 text-lg mb-8">
            Tu tarjeta queda lista en 30 segundos. Sin tarjeta de crédito, sin compromiso.
          </p>
          <Link href="/fidelizacion/onboarding"
            className="inline-block px-8 py-4 rounded-2xl font-extrabold text-lg text-white transition-all hover:opacity-90"
            style={{ background: '#7C3AED' }}>
            Probá 14 días gratis →
          </Link>
          <p className="text-xs text-zinc-400 mt-4">Continuás con Google · Sin tarjeta de crédito · Cancelás cuando querés</p>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-zinc-500">
            <span>✓ Sin tarjeta de crédito</span>
            <span>✓ Cancelás cuando querés</span>
            <span>✓ Soporte en español</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <span className="font-bold text-zinc-900">Calificar</span>
          <span>Tarjetas de fidelización digitales para tu negocio · Hecho en Argentina</span>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-zinc-700">Privacidad</Link>
            <Link href="/terminos" className="hover:text-zinc-700">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DetailItem({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-bold text-zinc-900 text-sm mb-1">{title}</p>
        <p className="text-sm text-zinc-500 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
