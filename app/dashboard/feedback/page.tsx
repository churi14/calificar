import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function FeedbackPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: businesses } = await supabase
    .from('businesses').select('id').eq('owner_id', user.id)

  const businessIds = businesses?.map(b => b.id) ?? []

  const { data: feedback } = await supabase
    .from('feedback')
    .select('*, businesses(name)')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false })

  // Marcar todos como leídos
  if (businessIds.length) {
    await supabase.from('feedback')
      .update({ read: true })
      .in('business_id', businessIds)
      .eq('read', false)
  }

  const unread = feedback?.filter(f => !f.read).length ?? 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Feedback privado</h1>
        <p className="text-sm text-gray-400 mt-0.5">Comentarios de clientes que no llegaron a Google</p>
      </div>

      {!feedback?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-4">💬</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sin feedback todavía</h2>
          <p className="text-sm text-gray-400">Cuando un cliente con poca satisfacción deje un comentario, aparecerá acá.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= (f.rating??0) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{(f as any).businesses?.name}</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(f.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{f.message}</p>
              {f.contact && (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                  <span>📞</span>
                  <span>{f.contact}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
