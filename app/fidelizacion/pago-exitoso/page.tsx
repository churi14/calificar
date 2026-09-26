import Link from 'next/link'

export default async function PagoExitosoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; payment_id?: string }>
}) {
  const { plan } = await searchParams

  const planNames: Record<string, string> = {
    starter: 'Starter',
    pro: 'Pro',
    ultimate: 'Ultimate',
  }

  const planName = planNames[plan ?? ''] ?? 'tu plan'

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#070A14' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <span className="text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3">
          ¡Pago recibido!
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          Tu plan <span className="text-violet-400 font-bold">{planName}</span> ya está activo.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          En 30 días te vamos a avisar para renovar. Sin cobros automáticos.
        </p>

        <div className="space-y-3">
          <Link
            href="/negocio/fidelizacion"
            className="w-full flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            Ir a mi panel →
          </Link>
          <Link
            href="/fidelizacion"
            className="w-full flex items-center justify-center text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
