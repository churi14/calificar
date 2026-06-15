import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Calificar',
  description: 'Términos y condiciones de uso del servicio Calificar.ar',
}

const FECHA = '14 de junio de 2025'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-extrabold text-xl text-[#0F172A] flex items-center gap-1.5">
            <span className="text-[#FBCAD8]">★</span> Calificar
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <h1 className="font-display font-extrabold text-4xl text-[#0F172A] mb-3">Términos y Condiciones</h1>
          <p className="text-sm text-gray-400">Última actualización: {FECHA}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-600 leading-relaxed">

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">1. Aceptación de los términos</h2>
            <p>Al registrarte y utilizar Calificar (<strong>calificar.ar</strong>), aceptás estos términos en su totalidad. Si no estás de acuerdo, te pedimos que no uses el servicio. Nos reservamos el derecho de modificar estos términos en cualquier momento, notificándote por email o mediante un aviso en la plataforma.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">2. Descripción del servicio</h2>
            <p>Calificar es una plataforma de gestión de reseñas que permite a negocios recibir opiniones de sus clientes, filtrar las positivas hacia Google Maps y gestionar el feedback negativo de forma privada. El servicio incluye:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm">
              <li>Un funnel digital personalizado para cada negocio</li>
              <li>Dashboard de estadísticas y gestión</li>
              <li>Sistema de feedback privado con datos del cliente</li>
              <li>Código QR y chip NFC (en los productos físicos adquiridos)</li>
              <li>Opcionalmente: dominio propio, Linktree personalizado y hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">3. Registro y cuenta</h2>
            <p>Para usar el servicio debés crear una cuenta con un email válido y una contraseña. Sos responsable de mantener la confidencialidad de tus credenciales. Calificar no se responsabiliza por accesos no autorizados derivados del uso de tus credenciales por terceros.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">4. Planes y pagos</h2>
            <p>Calificar ofrece un plan mensual ($5.000/mes) y un plan anual de dominio propio ($30.000/año + $5.000/mes). Los precios están expresados en pesos argentinos (ARS) y pueden modificarse con previo aviso de 30 días.</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm">
              <li>El pago se realiza por transferencia bancaria o Mercado Pago</li>
              <li>No hay contrato de permanencia mínima</li>
              <li>Podés cancelar en cualquier momento — el servicio continúa hasta el final del período pagado</li>
              <li>No se realizan reembolsos parciales por períodos no utilizados</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">5. Productos físicos (carteles)</h2>
            <p>Los carteles NFC + QR son productos físicos vendidos por separado a través de nuestra tienda. Una vez despachados, no se aceptan devoluciones salvo defecto de fabricación comprobado dentro de los 7 días de recibido el pedido. El daño físico, la rotura o el extravío del cartel no están cubiertos por ningún plan de mantenimiento digital.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">6. Uso aceptable</h2>
            <p>Al usar Calificar te comprometés a:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm">
              <li>No utilizar el servicio para manipular o falsificar reseñas en Google</li>
              <li>No recolectar datos de clientes sin consentimiento o con fines no declarados</li>
              <li>No intentar acceder a cuentas de otros usuarios o a la infraestructura del sistema</li>
              <li>No usar el sistema para enviar spam o mensajes masivos no solicitados</li>
            </ul>
            <p className="mt-3">El incumplimiento puede resultar en la suspensión inmediata de la cuenta sin derecho a reembolso.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">7. Datos de clientes y privacidad</h2>
            <p>Los datos que tus clientes ingresan voluntariamente en el formulario de feedback (nombre, email, WhatsApp, foto) son responsabilidad tuya como dueño del negocio. Calificar actúa como procesador de esos datos en tu nombre. Te comprometés a:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm">
              <li>Usar esos datos únicamente para contactar al cliente en relación a su experiencia</li>
              <li>No vender ni ceder esos datos a terceros</li>
              <li>Respetar el derecho del cliente a que sus datos sean eliminados si lo solicita</li>
            </ul>
            <p className="mt-3">Calificar no comparte estos datos con terceros ni los usa con fines publicitarios.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">8. Propiedad intelectual</h2>
            <p>Todo el contenido, diseño y código de la plataforma Calificar es propiedad de sus creadores. No podés copiar, reproducir ni distribuir ningún elemento del sistema sin autorización expresa. Los logos y contenidos de cada negocio son propiedad de sus respectivos dueños.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">9. Disponibilidad del servicio</h2>
            <p>Hacemos nuestro mejor esfuerzo para mantener el servicio disponible las 24 horas, pero no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimiento o actualizaciones que impliquen interrupciones breves. No somos responsables por daños derivados de la no disponibilidad temporal del servicio.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">10. Limitación de responsabilidad</h2>
            <p>Calificar no se responsabiliza por pérdidas de negocio, daños indirectos o consecuencias derivadas del uso o la imposibilidad de uso del servicio. La responsabilidad máxima en cualquier caso estará limitada al monto pagado por el usuario en los últimos 3 meses.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">11. Cancelación y baja</h2>
            <p>Podés dar de baja tu cuenta en cualquier momento contactándonos por WhatsApp o email. Al cancelar, tus datos serán eliminados dentro de los 30 días, excepto aquellos que debamos conservar por obligaciones legales. Si tenés dominio propio, te transferimos la gestión del dominio antes de cerrar la cuenta.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">12. Legislación aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad de Buenos Aires.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-[#0F172A] mb-3">13. Contacto</h2>
            <p>Para consultas sobre estos términos podés escribirnos por WhatsApp o al email de contacto disponible en <Link href="/" className="text-[#056E4B] hover:underline">calificar.ar</Link>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}