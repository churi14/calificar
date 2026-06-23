import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function NegociosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, active, total_scans, positive_scans, negative_scans, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', user.id).single()

  const planLimits: Record<string, number> = { free: 0, basic: 3, pro: 999 }
  const plan = profile?.plan ?? 'free'
  const limit = planLimits[plan] ?? 0
  const canAdd = (businesses?.length ?? 0) < limit

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mis locales</h1>
          <p className="text-sm text-gray-400 mt-0.5">{businesses?.length ?? 0} de {limit === 999 ? 'ilimitados' : limit} locales en tu plan</p>
        </div>
        {plan === 'free' ? (
          <span className="border border-gray-200 bg-gray-50 text-gray-400 font-medium px-4 py-2.5 rounded-xl text-sm cursor-not-allowed">
            Cuenta pendiente de activación
          </span>
        ) : canAdd ? (
          <Link href="/dashboard/negocios/nuevo"
            className="bg-gray-900 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors">
            + Nuevo local
          </Link>
        ) : (
          <Link href="/dashboard/plan"
            className="border border-amber-300 bg-amber-50 text-amber-700 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-amber-100 transition-colors">
            ⭐ Mejorar plan para agregar más
          </Link>
        )}
      </div>

      {!businesses?.length ? (
        plan === 'free' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">⏳</p>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Tu cuenta está pendiente de activación</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Para crear tu local y empezar a recibir reseñas, contactanos por WhatsApp. Activamos tu cuenta después de coordinar el pago.
            </p>
            <a href="https://wa.me/5491100000000?text=Hola%2C%20quiero%20activar%20mi%20cuenta%20de%20Calificar"
              target="_blank" rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-green-700 transition-colors">
              Contactar por WhatsApp →
            </a>
          </div>
        ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-4">🏪</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Todavía no tenés locales</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Creá tu primer local y empezá a recibir reseñas de 5 estrellas en Google.
          </p>
          <Link href="/dashboard/negocios/nuevo"
            className="inline-block bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors">
            Crear mi primer local →
          </Link>
        </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {businesses.map(b => {
            const conversion = b.total_scans ? Math.round((b.positive_scans/b.total_scans)*100) : 0
            return (
              <Link key={b.id} href={`/dashboard/negocios/${b.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-base font-bold text-gray-600 group-hover:bg-gray-200 transition-colors">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {b.active ? 'Activo' : 'Pausado'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-0.5">{b.name}</h3>
                <p className="text-xs text-gray-400 mb-4">calificar.com.ar/r/{b.slug}</p>

                <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-4">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-gray-900">{b.total_scans ?? 0}</p>
                    <p className="text-[10px] text-gray-400">Scans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-amber-500">{b.positive_scans ?? 0}</p>
                    <p className="text-[10px] text-gray-400">→ Google</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-gray-900">{conversion}%</p>
                    <p className="text-[10px] text-gray-400">Conversión</p>
                  </div>
                </div>
              </Link>
            )
          })}

          {canAdd && (
            <Link href="/dashboard/negocios/nuevo"
              className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 min-h-[160px] text-gray-400 hover:text-gray-600">
              <span className="text-2xl">+</span>
              <span className="text-sm font-medium">Nuevo local</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

