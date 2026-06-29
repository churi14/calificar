import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  // Verificar que viene de Vercel Cron (o de una llamada autorizada)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Rango: últimos 7 días
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 7)
  weekStart.setHours(0, 0, 0, 0)

  // Semana anterior (para comparación)
  const prevStart = new Date(weekStart)
  prevStart.setDate(prevStart.getDate() - 7)

  // Todos los negocios con su owner
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, owner_id, profiles(name, email)')
    .eq('active', true)

  if (!businesses?.length) {
    return NextResponse.json({ sent: 0, message: 'No active businesses' })
  }

  let sent = 0
  const errors: string[] = []

  for (const biz of businesses) {
    const owner = (biz as any).profiles
    if (!owner?.email) continue

    // Scans esta semana
    const { data: thisWeekScans } = await supabase
      .from('scans')
      .select('outcome')
      .eq('business_id', biz.id)
      .gte('created_at', weekStart.toISOString())

    // Scans semana anterior
    const { data: prevWeekScans } = await supabase
      .from('scans')
      .select('outcome')
      .eq('business_id', biz.id)
      .gte('created_at', prevStart.toISOString())
      .lt('created_at', weekStart.toISOString())

    const totalThis = thisWeekScans?.length ?? 0
    const totalPrev = prevWeekScans?.length ?? 0
    const positiveThis = thisWeekScans?.filter(s => s.outcome === 'positive').length ?? 0
    const filteredThis = totalThis - positiveThis

    // Si no hubo actividad esta semana, no enviamos
    if (totalThis === 0) continue

    const positivePct = totalThis > 0 ? Math.round((positiveThis / totalThis) * 100) : 0
    const diff = totalThis - totalPrev
    const diffText = diff > 0
      ? `<span style="color:#16A34A">▲ ${diff} más que la semana pasada</span>`
      : diff < 0
      ? `<span style="color:#DC2626">▼ ${Math.abs(diff)} menos que la semana pasada</span>`
      : `<span style="color:#6B7280">igual que la semana pasada</span>`

    // Top empleado
    const { data: topEmp } = await supabase
      .from('employees')
      .select('name, total_scans')
      .eq('business_id', biz.id)
      .order('total_scans', { ascending: false })
      .limit(1)
      .single()

    const topEmpRow = topEmp
      ? `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;color:#374151;font-size:14px">🏆 Mejor empleado</td>
          <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;text-align:right;font-weight:700;color:#1F2937;font-size:14px">${topEmp.name} — ${topEmp.total_scans} scans</td>
        </tr>`
      : ''

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'
    const dashboardUrl = `${appUrl}/dashboard`

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5EFE7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE7;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:540px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:#0F172A;padding:28px 32px;text-align:center">
            <img src="${appUrl}/logo.png" alt="Calificar" height="60" style="display:block;margin:0 auto 12px"/>
            <p style="margin:0;color:#94A3B8;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Resumen semanal</p>
          </td>
        </tr>

        <!-- Saludo -->
        <tr>
          <td style="padding:28px 32px 8px">
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1F2937">${biz.name}</h1>
            <p style="margin:0;color:#6B7280;font-size:14px">Esta semana generaste <strong>${totalThis} scans</strong>. ${diffText}</p>
          </td>
        </tr>

        <!-- Stats -->
        <tr>
          <td style="padding:20px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;color:#374151;font-size:14px">📱 Scans totales</td>
                <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;text-align:right;font-weight:700;color:#1F2937;font-size:14px">${totalThis}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;color:#374151;font-size:14px">⭐ Enviados a Google</td>
                <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;text-align:right;font-weight:700;color:#16A34A;font-size:14px">${positiveThis} (${positivePct}%)</td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;color:#374151;font-size:14px">🛡️ Filtrados (privados)</td>
                <td style="padding:12px 0;border-bottom:1px solid #F0EBE3;text-align:right;font-weight:700;color:#374151;font-size:14px">${filteredThis}</td>
              </tr>
              ${topEmpRow}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 32px 32px;text-align:center">
            <a href="${dashboardUrl}" style="display:inline-block;background:#0F172A;color:#FFFFFF;font-size:14px;font-weight:700;padding:14px 32px;border-radius:100px;text-decoration:none">
              Ver mi panel completo →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8F5F1;padding:20px 32px;text-align:center">
            <p style="margin:0;color:#9CA3AF;font-size:12px">
              Estás recibiendo este resumen porque tenés un local activo en Calificar.<br>
              <a href="${appUrl}" style="color:#6B7280;text-decoration:none">calificar.com.ar</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    try {
      await resend.emails.send({
        from: 'Calificar <hola@calificar.com.ar>',
        to: owner.email,
        subject: `📊 Tu resumen de la semana — ${biz.name}`,
        html,
      })
      sent++
    } catch (e: any) {
      errors.push(`${biz.name}: ${e.message}`)
    }
  }

  return NextResponse.json({ sent, errors })
}
