/**
 * GET /api/fidelizacion/wallet-debug?program_id=xxx
 * Diagnóstico completo de Google Wallet — muestra exactamente qué falla.
 * Usar solo para debug, no exponer en producción para usuarios finales.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleAuth } from 'google-auth-library'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID ?? ''
const SERVICE_EMAIL = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL ?? ''
const WALLET_API = 'https://walletobjects.googleapis.com/walletobjects/v1'

function getPrivateKey() {
  return (process.env.GOOGLE_WALLET_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
}

async function getToken() {
  const auth = new GoogleAuth({
    credentials: {
      type: 'service_account',
      client_email: SERVICE_EMAIL,
      private_key: getPrivateKey(),
    },
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token
}

export async function GET(req: NextRequest) {
  const programId = req.nextUrl.searchParams.get('program_id')

  const debug: Record<string, unknown> = {
    env: {
      ISSUER_ID: ISSUER_ID || '⚠ VACÍO',
      SERVICE_EMAIL: SERVICE_EMAIL || '⚠ VACÍO',
      HAS_PRIVATE_KEY: !!process.env.GOOGLE_WALLET_PRIVATE_KEY,
      PRIVATE_KEY_ID: process.env.GOOGLE_WALLET_PRIVATE_KEY_ID || '⚠ VACÍO',
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || '⚠ VACÍO',
    }
  }

  // Test 1: Obtener token de auth
  try {
    const token = await getToken()
    debug.auth_token = token ? '✓ Token obtenido OK' : '⚠ Token vacío'
  } catch (e) {
    debug.auth_token = `❌ ERROR: ${e instanceof Error ? e.message : String(e)}`
    return NextResponse.json(debug)
  }

  // Test 2: Verificar clase del programa
  if (programId) {
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('id, name, color_primary, stamps_goal, reward_description, logo_url')
      .eq('id', programId)
      .single()

    if (!program) {
      debug.program = '❌ Programa no encontrado en Supabase'
    } else {
      debug.program = { id: program.id, name: program.name }

      const fullClassId = `${ISSUER_ID}.${program.id}`
      debug.class_id_used = fullClassId

      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

      // GET de la clase
      const getRes = await fetch(`${WALLET_API}/loyaltyClass/${encodeURIComponent(fullClassId)}`, { headers })
      const getBody = await getRes.text()

      if (getRes.ok) {
        debug.wallet_class = `✓ Clase existe (status ${getRes.status})`
      } else {
        debug.wallet_class = `❌ Clase NO existe — status ${getRes.status}: ${getBody}`

        // Intentar crearla
        const createRes = await fetch(`${WALLET_API}/loyaltyClass`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: fullClassId,
            issuerName: program.name,
            programName: program.name,
            programLogo: {
              sourceUri: { uri: program.logo_url ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'}/logo-wallet.png` },
              contentDescription: { defaultValue: { language: 'es', value: program.name } },
            },
            hexBackgroundColor: program.color_primary ?? '#7C3AED',
            rewardsTierPoints: `Meta: ${program.stamps_goal} sellos`,
            rewardsTier: program.reward_description,
            reviewStatus: 'UNDER_REVIEW',
            multipleDevicesAndHoldersAllowedStatus: 'ONE_USER_ALL_DEVICES',
          }),
        })
        const createBody = await createRes.text()
        debug.wallet_class_create = createRes.ok
          ? `✓ Clase creada OK`
          : `❌ Error creando clase — status ${createRes.status}: ${createBody}`
      }

      // Verificar un objeto de tarjeta si existe
      const { data: card } = await supabase
        .from('loyalty_cards')
        .select('id, wallet_object_id, name')
        .eq('program_id', programId)
        .limit(1)
        .single()

      if (card?.wallet_object_id) {
        const fullObjectId = `${ISSUER_ID}.${card.wallet_object_id}`
        const objRes = await fetch(`${WALLET_API}/loyaltyObject/${encodeURIComponent(fullObjectId)}`, { headers: { Authorization: `Bearer ${await getToken()}` } })
        const objBody = await objRes.text()
        debug.wallet_object = objRes.ok
          ? `✓ Objeto existe para "${card.name}"`
          : `❌ Objeto NO existe — status ${objRes.status}: ${objBody}`
        debug.object_id_used = fullObjectId
      } else {
        debug.wallet_object = 'ℹ Sin tarjetas con wallet_object_id en este programa'
      }
    }
  } else {
    // Sin program_id: listar todos los programas para encontrar el ID correcto
    const { data: programs } = await supabase
      .from('loyalty_programs')
      .select('id, name, business_id, active')
      .order('created_at', { ascending: false })
    debug.all_programs = programs ?? []
    debug.tip = 'Copiá el "id" del programa que querés y pasalo como ?program_id=...'
  }

  return NextResponse.json(debug, { status: 200 })
}
