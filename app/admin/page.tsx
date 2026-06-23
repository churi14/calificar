import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatDate, planLabel, planColor } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = createServiceClient()

  const { count: totalClients } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'business')

  const { count: totalBusinesses } = await supabase
    .from('businesses').select('*', { count: 'exact', head: true })

  const { count: totalScans } = await supabase
    .from('scans').select('*', { count: 'exact', head: true })

  const { count: totalFeedback } = await supabase
    .from('feedback').select('*', { count: 'exact', head: true })

  // Últimos 5 clientes
  const { data: recentClients } = await supabase
    .from('profiles')
    .select('id, name, email, plan, created_at')
    .eq('role', 'business')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Panel Admin</h1>
        <p className="text-sm text-gray-400 mt-0.5">Vista global de todos los clientes</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clientes totales', value: totalClients ?? 0, icon: '👥', color: 'text-gray-900' },
          { label: 'Locales activos', value: totalBusinesses ?? 0, icon: '🏪', color: 'text-blue-600' },
          { label: 'Scans totales', value: totalScans ?? 0, icon: '📱', color: 'text-amber-500' },
          { label: 'Feedback recibido', value: totalFeedback ?? 0, icon: '💬', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-xl mb-2">{s.icon}</div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ÚLTIMOS CLIENTES */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Últimos clientes</h2>
          <Link href="/admin/clientes" className="text-xs text-gray-500 hover:text-gray-700">Ver todos →</Link>
        </div>
        {!recentClients?.length ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin clientes todavía</p>
        ) : (
          <div className="space-y-2">
            {recentClients.map(c => (
              <Link key={c.id} href={`/admin/clientes/${c.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                    {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planColor(c.plan)}`}>
                    {planLabel(c.plan)}
                  </span>
                  <span className="text-xs text-gray-300">{formatDate(c.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <Link href="/admin/clientes/nuevo"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            + Crear nuevo cliente
          </Link>
        </div>
      </div>
    </div>
  )
}