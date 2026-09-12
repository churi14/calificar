export const metadata = {
  title: 'Política de Privacidad – Calificar',
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Política de Privacidad</h1>
        <p className="text-zinc-400 text-sm mb-10">Última actualización: septiembre 2026</p>

        <div className="prose prose-zinc max-w-none space-y-8 text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">1. Información que recopilamos</h2>
            <p>
              Calificar recopila información que los usuarios proporcionan al registrarse y usar la plataforma,
              incluyendo nombre del negocio, dirección de correo electrónico, y preferencias de configuración
              del programa de fidelidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">2. Uso de la información</h2>
            <p>
              Utilizamos la información recopilada para operar y mejorar nuestros servicios, enviar
              comunicaciones relacionadas con tu cuenta, y brindar soporte técnico. No vendemos ni
              compartimos tu información personal con terceros con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">3. Autenticación con Google</h2>
            <p>
              Calificar permite iniciar sesión con tu cuenta de Google mediante OAuth 2.0. Al hacerlo,
              accedemos únicamente a tu nombre y dirección de correo electrónico. No almacenamos tu
              contraseña de Google ni accedemos a otros datos de tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">4. Cookies y seguimiento</h2>
            <p>
              Usamos cookies y almacenamiento local para mantener tu sesión activa y recordar tus
              preferencias durante el proceso de configuración. No utilizamos cookies de publicidad
              ni rastreo de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">5. Seguridad</h2>
            <p>
              Implementamos medidas de seguridad estándar de la industria para proteger tu información.
              Los datos se almacenan en servidores seguros provistos por Supabase con cifrado en tránsito
              y en reposo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">6. Tus derechos</h2>
            <p>
              Podés solicitar el acceso, corrección o eliminación de tus datos personales en cualquier
              momento contactándonos en{' '}
              <a href="mailto:hola@calificar.com.ar" className="text-violet-600 underline">
                hola@calificar.com.ar
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">7. Contacto</h2>
            <p>
              Si tenés preguntas sobre esta política, escribinos a{' '}
              <a href="mailto:hola@calificar.com.ar" className="text-violet-600 underline">
                hola@calificar.com.ar
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
