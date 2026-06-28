import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatDate, planLabel, planColor } from '@/lib/utils'
import AdminChart from './AdminChart'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServiceClient()

  // Counts globales
  const [
    { count: totalClients },
    { count: totalBusinesses },
    { count: totalScans },
    { count: totalFeedback },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).or('role.eq.business,role.is.null'),
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('scans').select('*', { count: 'exact', head: true }),
    supabase.from('feedback').select('*', { count: 'exact', head: true }),
  ])

  // Nuevos esta semana
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoISO = weekAgo.toISOString()

  const [
    { count: newClientsWeek },
    { count: newBusinessesWeek },
    { count: newScansWeek },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .or('role.eq.business,role.is.null').gte('created_at', weekAgoISO),
    supabase.from('businesses').select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgoISO),
    supabase.from('scans').select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgoISO),
  ])

  // Scans por día (últimos 7 días)
  const { data: recentScansRaw } = await supabase
    .from('scans')
    .select('created_at')
    .gte('created_at', weekAgoISO)

  const scansByDay: Record<string, number> = {}
  for (const scan of recentScansRaw ?? []) {
    const day = (scan.created_at as string).slice(0, 10)
    scansByDay[day] = (scansByDay[day] ?? 0) + 1
  }

  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: scansByDay[key] ?? 0 }
  })

  // Últimos 5 clientes
  const { data: recentClients } = await supabase
    .from('profiles')
    .select('id, name, email, plan, created_at')
    .or('role.eq.business,role.is.null')
    .order('created_at', { ascending: false })
    .limit(5)

  // Últimos 5 locales creados
  const { data: recentBusinesses } = await supabase
    .from('businesses')
    .select('id, name, slug, total_scans, created_at, owner_id, profiles(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Panel Admin</h1>
        <p className="text-sm text-gray-400 mt-0.5">Vista global de la plataforma</p>
      </div>

      {/* STATS GLOBALES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clientes totales', value: totalClients ?? 0, delta: newClientsWeek ?? 0, icon: '👥', color: 'text-gray-900' },
          { label: 'Locales activos', value: totalBusinesses ?? 0, delta: newBusinessesWeek ?? 0, icon: '🏪', color: 'text-blue-600' },
          { label: 'Scans totales', value: totalScans ?? 0, delta: newScansWeek ?? 0, icon: '📱', color: 'text-amber-500' },
          { label: 'Feedback recibido', value: totalFeedback ?? 0, delta: null, icon: '💬', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-xl mb-2">{s.icon}</div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            {s.delta !== null && s.delta > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-1">+{s.delta} esta semana</p>
            )}
          </div>
        ))}
      </div>

      {/* GRÁFICO SCANS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Scans últimos 7 días</h2>
            <p className="text-xs text-gray-400 mt-0.5">{newScansWeek ?? 0} scans en total esta semana</p>
          </div>
        </div>
        <AdminChart days={chartDays} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ÚLTIMOS CLIENTES */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Últimos clientes</h2>
            <Link href="/admin/clientes" className="text-xs text-gray-500 hover:text-gray-700">Ver todos →</Link>
          </div>
          {!recentClients?.length ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin clientes todavía</p>
          ) : (
            <div className="space-y-1">
              {recentClients.map(c => (
                <Link key={c.id} href={`/admin/clientes/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{c.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planColor(c.plan)}`}>
                      {planLabel(c.plan)}
                    </span>
                    <span className="text-xs text-gray-300 hidden sm:inline">{formatDate(c.created_at)}</span>
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

        {/* ÚLTIMOS LOCALES */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Últimos locales</h2>
          </div>
          {!recentBusinesses?.length ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin locales todavía</p>
          ) : (
            <div className="space-y-1">
              {recentBusinesses.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{b.name}</p>
                    <p className="text-xs text-gray-400">{(b as any).profiles?.name ?? '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-700">{b.total_scans ?? 0} scans</p>
                    <p className="text-xs text-gray-300">{formatDate(b.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
