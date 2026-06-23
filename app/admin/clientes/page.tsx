import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatDate, planLabel, planColor } from '@/lib/utils'

export default async function ClientesPage() {
  const supabase = createServiceClient()

  // Traer TODOS los usuarios — neq() excluye NULLs en Postgres, por eso usamos filter directo
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, name, email, plan, role, created_at')
    .or('role.eq.business,role.is.null')
    .order('created_at', { ascending: false })

  // Contar negocios por cliente
  const clientIds = clients?.map(c => c.id) ?? []
  const { data: businesses } = clientIds.length
    ? await supabase.from('businesses').select('owner_id').in('owner_id', clientIds)
    : { data: [] }

  const bizCount: Record<string, number> = {}
  businesses?.forEach(b => { bizCount[b.owner_id] = (bizCount[b.owner_id] ?? 0) + 1 })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{clients?.length ?? 0} registrados</p>
        </div>
        <Link href="/admin/clientes/nuevo"
          className="bg-gray-900 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors">
          + Nuevo cliente
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {!clients?.length ? (
          <p className="text-sm text-gray-400 text-center py-12">Sin clientes todavía</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50">
              <span className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</span>
              <span className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
              <span className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</span>
              <span className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Locales</span>
              <span className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Registro</span>
            </div>
            {clients.map(c => (
              <Link key={c.id} href={`/admin/clientes/${c.id}`}
                className="grid grid-cols-12 px-5 py-3.5 hover:bg-gray-50 transition-colors group items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                    {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 truncate">{c.name ?? '—'}</span>
                </div>
                <span className="col-span-3 text-sm text-gray-500 truncate">{c.email}</span>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planColor(c.plan)}`}>
                    {planLabel(c.plan)}
                  </span>
                </div>
                <span className="col-span-1 text-sm text-gray-700 font-semibold text-center">{bizCount[c.id] ?? 0}</span>
                <span className="col-span-2 text-xs text-gray-400 text-right">{formatDate(c.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
