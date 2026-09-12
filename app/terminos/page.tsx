export const metadata = {
  title: 'Términos y Condiciones – Calificar',
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Términos y Condiciones</h1>
        <p className="text-zinc-400 text-sm mb-10">Última actualización: septiembre 2026</p>

        <div className="prose prose-zinc max-w-none space-y-8 text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">1. Aceptación de los términos</h2>
            <p>
              Al acceder y usar Calificar, aceptás estos Términos y Condiciones. Si no estás de acuerdo
              con alguna parte, no debés usar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">2. Descripción del servicio</h2>
            <p>
              Calificar es una plataforma de programas de fidelidad para negocios. Permite crear y
              gestionar tarjetas de sellos digitales para premiar a clientes frecuentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">3. Registro y cuenta</h2>
            <p>
              Para usar Calificar debés crear una cuenta con información veraz y actualizada. Sos
              responsable de mantener la confidencialidad de tu cuenta y de todas las actividades
              que ocurran bajo ella.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">4. Uso aceptable</h2>
            <p>
              Te comprometés a usar Calificar únicamente para fines legales y de acuerdo con estos
              términos. No podés usar la plataforma para actividades fraudulentas, ilegales o que
              perjudiquen a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">5. Propiedad intelectual</h2>
            <p>
              Todo el contenido de Calificar, incluyendo diseño, código y marca, es propiedad de
              Calificar y está protegido por las leyes de propiedad intelectual aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">6. Limitación de responsabilidad</h2>
            <p>
              Calificar no será responsable por daños indirectos, incidentales o consecuentes que
              surjan del uso o la imposibilidad de usar la plataforma. El servicio se provee "tal cual"
              sin garantías de ningún tipo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Te
              notificaremos de cambios significativos por correo electrónico o mediante un aviso
              en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">8. Contacto</h2>
            <p>
              Para consultas sobre estos términos, escribinos a{' '}
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
