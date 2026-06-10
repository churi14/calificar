import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, planLabel, planColor } from '@/lib/utils'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, name, email, plan, created_at')
    .eq('role', 'business')
    .order('created_at', { ascending: false })

  // Contar negocios por cliente
  const { data: bizCounts } = await supabase
    .from('businesses')
    .select('owner_id')

  const countMap: Record<string, number> = {}
  bizCounts?.forEach(b => { countMap[b.owner_id] = (countMap[b.owner_id] ?? 0) + 1 })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{clients?.length ?? 0} clientes en total</p>
        </div>
        <Link href="/admin/clientes/nuevo"
          className="bg-gray-900 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors">
          + Nuevo cliente
        </Link>
      </div>

      {!clients?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-4">👥</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sin clientes todavía</h2>
          <Link href="/admin/clientes/nuevo"
            className="inline-block bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-700 transition-colors mt-3">
            Crear primer cliente →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Cliente</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Plan</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Locales</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Alta</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planColor(c.plan)}`}>
                      {planLabel(c.plan)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">{countMap[c.id] ?? 0} local{(countMap[c.id] ?? 0) !== 1 ? 'es' : ''}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/clientes/${c.id}`}
                      className="text-xs text-gray-500 hover:text-gray-900 font-semibold">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

