import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { feedbackEmailHtml, feedbackEmailText } from '@/lib/email/feedback-notification'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.ar'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business_id, employee_id, rating, message, nombre, email, whatsapp, photo_base64, photo_ext } = body

    if (!business_id || !message?.trim()) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    let photo_url: string | null = null

    // Subir foto a Supabase Storage
    if (photo_base64 && photo_ext) {
      const fileName = `${business_id}/${Date.now()}.${photo_ext}`
      const buffer = Buffer.from(photo_base64, 'base64')
      const { error: storageError } = await supabase.storage
        .from('feedback-photos')
        .upload(fileName, buffer, { contentType: `image/${photo_ext}`, upsert: false })
      if (!storageError) {
        const { data } = supabase.storage.from('feedback-photos').getPublicUrl(fileName)
        photo_url = data.publicUrl
      }
    }

    // Guardar feedback en DB
    const { error: dbError } = await supabase.from('feedback').insert({
      business_id,
      employee_id: employee_id ?? null,
      rating,
      message:  message.trim(),
      nombre:   nombre?.trim()   || null,
      email:    email?.trim()    || null,
      whatsapp: whatsapp?.trim() || null,
      photo_url,
      read: false,
    })
    if (dbError) throw dbError

    // Obtener datos del negocio + email del dueño
    const { data: biz } = await supabase
      .from('businesses')
      .select('name, whatsapp_number, negative_redirect, owner_id')
      .eq('id', business_id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('email: id, name')
      .eq('id', biz?.owner_id)
      .single()

    // Email del dueño (viene de auth.users)
    const { data: authUser } = await supabase.auth.admin.getUserById(biz?.owner_id ?? '')
    const ownerEmail = authUser?.user?.email

    // Mandar email de notificación si hay email del dueño y API key configurada
    if (ownerEmail && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from:    'Calificar <notificaciones@calificar.ar>',
        to:      ownerEmail,
        subject: `⚠️ Nuevo feedback privado — ${biz?.name ?? 'Tu local'}`,
        html: feedbackEmailHtml({
          businessName: biz?.name ?? 'Tu local',
          rating, message, nombre, email, whatsapp, photoUrl: photo_url,
          dashboardUrl: `${APP_URL}/dashboard/feedback`,
        }),
        text: feedbackEmailText({
          businessName: biz?.name ?? 'Tu local',
          rating, message, nombre, email, whatsapp,
        }),
      })
    }

    return NextResponse.json({ ok: true, photo_url })
  } catch (e) {
    console.error('Error feedback:', e)
    return NextResponse.json({ error: 'Error al guardar feedback' }, { status: 500 })
  }
}

// Marcar como leído
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