// Template HTML del email de notificación de feedback negativo

export function feedbackEmailHtml({
  businessName,
  rating,
  message,
  nombre,
  email,
  whatsapp,
  photoUrl,
  dashboardUrl,
}: {
  businessName: string
  rating: number
  message: string
  nombre?: string | null
  email?: string | null
  whatsapp?: string | null
  photoUrl?: string | null
  dashboardUrl: string
}) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const contactRows = [
    nombre   ? `<tr><td style="padding:4px 0;color:#6B7280;font-size:13px;width:80px">Nombre</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#111">${nombre}</td></tr>` : '',
    email    ? `<tr><td style="padding:4px 0;color:#6B7280;font-size:13px">Email</td><td style="padding:4px 0;font-size:13px"><a href="mailto:${email}" style="color:#2563EB">${email}</a></td></tr>` : '',
    whatsapp ? `<tr><td style="padding:4px 0;color:#6B7280;font-size:13px">WhatsApp</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#111">${whatsapp}</td></tr>` : '',
  ].filter(Boolean).join('')

  const waLink = whatsapp
    ? `<a href="https://wa.me/549${whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola! Vi tu comentario sobre tu experiencia en ${businessName} y quería hablar con vos.`)}" style="display:inline-block;background:#056E4B;color:white;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none;font-size:14px;margin-right:8px">💬 Responder por WhatsApp</a>`
    : ''

  const emailLink = email
    ? `<a href="mailto:${email}?subject=Tu experiencia en ${businessName}&body=Hola! Vimos tu comentario y queremos resolverlo." style="display:inline-block;background:#111;color:white;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none;font-size:14px">✉️ Responder por email</a>`
    : ''

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5EFE7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;padding:0 16px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:22px;font-weight:900;color:#0F172A">★ calificar</span>
    </div>

    <!-- Card -->
    <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">

      <!-- Top banner -->
      <div style="background:#0F172A;padding:20px 28px">
        <p style="margin:0;color:#FBCAD8;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">Feedback privado — ${businessName}</p>
        <p style="margin:6px 0 0;color:white;font-size:22px;letter-spacing:2px">${stars}</p>
        <p style="margin:4px 0 0;color:#94A3B8;font-size:13px">${rating} estrella${rating !== 1 ? 's' : ''} — recibido ahora</p>
      </div>

      <div style="padding:28px">

        <!-- Comentario -->
        <div style="background:#F5EFE7;border-radius:16px;padding:18px;margin-bottom:20px">
          <p style="margin:0 0 6px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Comentario del cliente</p>
          <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;font-style:italic">"${message}"</p>
        </div>

        ${photoUrl ? `
        <!-- Foto -->
        <div style="margin-bottom:20px">
          <p style="margin:0 0 8px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Foto adjunta</p>
          <img src="${photoUrl}" alt="Foto del cliente" style="width:100%;max-height:200px;object-fit:cover;border-radius:12px"/>
        </div>
        ` : ''}

        <!-- Datos del cliente -->
        ${contactRows ? `
        <div style="margin-bottom:24px">
          <p style="margin:0 0 10px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Datos del cliente</p>
          <table style="width:100%;border-collapse:collapse">${contactRows}</table>
        </div>
        ` : `
        <p style="font-size:13px;color:#9CA3AF;font-style:italic;margin-bottom:24px">El cliente no dejó datos de contacto.</p>
        `}

        <!-- Botones de acción -->
        ${waLink || emailLink ? `
        <div style="margin-bottom:20px">
          ${waLink}${emailLink}
        </div>
        ` : ''}

        <!-- Ver en el panel -->
        <div style="text-align:center;padding-top:16px;border-top:1px solid #F3F4F6">
          <a href="${dashboardUrl}" style="color:#6B7280;font-size:13px;text-decoration:none">
            Ver en el panel de Calificar →
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:12px;color:#9CA3AF;margin-top:24px">
      Este mensaje es privado — no llegó a Google Maps.<br>
      <a href="https://calificar.ar" style="color:#9CA3AF">calificar.ar</a>
    </p>
  </div>
</body>
</html>
`
}

export function feedbackEmailText({
  businessName, rating, message, nombre, email, whatsapp,
}: {
  businessName: string; rating: number; message: string
  nombre?: string | null; email?: string | null; whatsapp?: string | null
}) {
  const contact = [
    nombre   ? `Nombre: ${nombre}`   : null,
    email    ? `Email: ${email}`     : null,
    whatsapp ? `WhatsApp: ${whatsapp}` : null,
  ].filter(Boolean).join('\n')

  return `
Nuevo feedback privado — ${businessName}
${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating} estrella${rating !== 1 ? 's' : ''})

"${message}"

${contact || 'El cliente no dejó datos de contacto.'}

Ver en el panel: https://calificar.ar/dashboard/feedback
  `.trim()
}
