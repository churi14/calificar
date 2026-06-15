import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business_id, employee_id, rating, message, nombre, email, whatsapp, photo_base64, photo_ext } = body

    if (!business_id || !message?.trim()) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    let photo_url: string | null = null

    // Subir foto a Supabase Storage si viene
    if (photo_base64 && photo_ext) {
      const fileName = `${business_id}/${Date.now()}.${photo_ext}`
      const buffer = Buffer.from(photo_base64, 'base64')
      const { error: storageError } = await supabase.storage
        .from('feedback-photos')
        .upload(fileName, buffer, {
          contentType: `image/${photo_ext}`,
          upsert: false,
        })
      if (!storageError) {
        const { data } = supabase.storage.from('feedback-photos').getPublicUrl(fileName)
        photo_url = data.publicUrl
      }
    }

    // Guardar feedback en DB
    const { error } = await supabase.from('feedback').insert({
      business_id,
      employee_id: employee_id ?? null,
      rating,
      message: message.trim(),
      nombre:   nombre?.trim()   || null,
      email:    email?.trim()    || null,
      whatsapp: whatsapp?.trim() || null,
      photo_url,
      read: false,
    })

    if (error) throw error

    // Obtener datos del negocio para notificación
    const { data: biz } = await supabase
      .from('businesses')
      .select('name, whatsapp_number, negative_redirect')
      .eq('id', business_id)
      .single()

    // Notificación por WhatsApp si está configurado
    if (biz?.negative_redirect === 'whatsapp' && biz?.whatsapp_number) {
      const contactInfo = [
        nombre   ? `Nombre: ${nombre}`   : null,
        email    ? `Email: ${email}`     : null,
        whatsapp ? `WhatsApp: ${whatsapp}` : null,
      ].filter(Boolean).join('\n')

      const txt = encodeURIComponent(
        `[Calificar - ${biz.name}]\n⭐ ${rating} estrella${rating !== 1 ? 's' : ''}\n\n"${message}"${contactInfo ? `\n\n${contactInfo}` : ''}${photo_url ? `\n\n📷 Foto: ${photo_url}` : ''}`
      )
      // No esperamos la respuesta — es un link que el dueño abre, no un envío automático
    }

    return NextResponse.json({ ok: true, photo_url })
  } catch (e) {
    console.error('Error feedback:', e)
    return NextResponse.json({ error: 'Error al guardar feedback' }, { status: 500 })
  }
}

// Marcar feedback como leído
export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = createServiceClient()
    const { error } = await supabase.from('feedback').update({ read: true }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}