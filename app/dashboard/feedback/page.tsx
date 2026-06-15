import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, plan')
    .eq('id', user!.id)
    .single()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, total_scans, positive_scans, negative_scans, active')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  // Si no tiene ningún negocio, mandarlo al onboarding
  if (!businesses || businesses.length === 0) {
    redirect('/onboarding')
  }

  const { data: recentFeedback } = await supabase
    .from('feedback')
    .select('id, message, rating, created_at, read, business_id, businesses(name)')
    .in('business_id', businesses?.map(b => b.id) ?? [])
    .order('created_at', { ascending: false })
    .limit(5)

  const totalScans    = businesses?.reduce((s, b) => s + (b.total_scans ?? 0), 0) ?? 0
  const totalPositive = businesses?.reduce((s, b) => s + (b.positive_scans ?? 0), 0) ?? 0
  const totalNegative = businesses?.reduce((s, b) => s + (b.negative_scans ?? 0), 0) ?? 0
  const unreadFeedback = recentFeedback?.filter(f => !f.read).length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Buen día, {profile?.name?.split(' ')[0] ?? 'ahí'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Resumen de tus locales</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Scans totales', value: totalScans, icon: '📱', color: 'text-blue-600' },
          { label: 'Positivos → Google', value: totalPositive, icon: '⭐', color: 'text-amber-500' },
          { label: 'Negativos filtrados', value: totalNegative, icon: '🛡️', color: 'text-green-600' },
          { label: 'Feedback sin leer', value: unreadFeedback, icon: '💬', color: 'text-red-500', alert: unreadFeedback > 0 },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl border p-5 ${stat.alert ? 'border-red-200' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{stat.icon}</span>
              {stat.alert && <span className="w-2 h-2 bg-red-500 rounded-full"/>}
            </div>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MIS LOCALES */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Mis locales</h2>
            <Link href="/dashboard/negocios/nuevo" className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
              + Nuevo
            </Link>
          </div>
          {businesses?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">Todavía no tenés ningún local</p>
              <Link href="/dashboard/negocios/nuevo" className="text-sm text-gray-900 font-semibold underline underline-offset-2">
                Crear mi primer local →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {businesses?.map(b => (
                <Link key={b.id} href={`/dashboard/negocios/${b.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                    <p className="text-xs text-gray-400">calificar.ar/r/{b.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{b.total_scans ?? 0} scans</p>
                    <p className="text-xs text-green-600">{b.positive_scans ?? 0} positivos</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* FEEDBACK RECIENTE */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Feedback reciente</h2>
            <Link href="/dashboard/feedback" className="text-xs text-gray-500 hover:text-gray-700">Ver todo →</Link>
          </div>
          {!recentFeedback?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Sin feedback todavía</p>
              <p className="text-gray-300 text-xs mt-1">Los comentarios privados de clientes aparecerán acá</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map(f => (
                <div key={f.id} className={`p-3 rounded-xl border text-sm ${!f.read ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500">
                      {'★'.repeat(f.rating ?? 0)} {(f as any).businesses?.name}
                    </span>
                    {!f.read && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"/>}
                  </div>
                  <p className="text-gray-700 text-xs line-clamp-2">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}