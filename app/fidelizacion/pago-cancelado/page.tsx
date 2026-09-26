import Link from 'next/link'

export default function PagoCanceladoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#070A14' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-4xl">✕</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3">
          Pago no completado
        </h1>
        <p className="text-slate-400 mb-8">
          No se realizó ningún cargo. Podés intentarlo de nuevo cuando quieras.
        </p>

        <div className="space-y-3">
          <Link
            href="/fidelizacion#precios"
            className="w-full flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            Ver planes →
          </Link>
          <Link
            href="/negocio/fidelizacion"
            className="w-full flex items-center justify-center text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Ir a mi panel
          </Link>
        </div>
      </div>
    </div>
  )
}
