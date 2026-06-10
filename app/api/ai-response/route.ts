import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { business_id, business_name, review_text, rating, tone } = await req.json()
    if (!review_text) return NextResponse.json({ error: 'review_text requerido' }, { status: 400 })

    // Verificar auth y plan
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Verificar límite de plan
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    const plan = profile?.plan ?? 'free'
    const limit = plan === 'free' ? 10 : plan === 'basic' ? 100 : 9999

    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
    const { count } = await supabase.from('ai_responses')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business_id)
      .gte('created_at', startOfMonth.toISOString())

    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: `Límite de ${limit} respuestas IA alcanzado este mes` }, { status: 429 })
    }

    const toneMap: Record<string, string> = {
      profesional: 'profesional y cordial',
      cercano: 'cercano y cálido, tuteando al cliente',
      formal: 'muy formal y respetuoso'
    }

    const { content } = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Sos el dueño o encargado de "${business_name}". Tenés que responder la siguiente reseña de Google de un cliente con ${rating} estrella${rating !== 1 ? 's' : ''}. 
        
Tu tono debe ser: ${toneMap[tone] ?? 'profesional y cordial'}.

Reglas:
- Máximo 3 oraciones
- Agradecé si es positiva, disculpate y ofrecé solución si es negativa
- No uses frases genéricas como "Gracias por su visita"
- Menciona algo específico de la reseña si es posible
- No pongas nombre de empleado ni datos de contacto
- Respondé solo con el texto de la respuesta, sin comillas ni explicaciones

Reseña del cliente:
"${review_text}"`
      }]
    })

    const response = content[0].type === 'text' ? content[0].text : ''

    // Guardar en historial
    await supabase.from('ai_responses').insert({ business_id, review_text, response })

    return NextResponse.json({ response })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: 'Error generando respuesta' }, { status: 500 })
  }
}

