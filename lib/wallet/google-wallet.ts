/**
 * Google Wallet Loyalty — Calificar
 * Crea, actualiza y genera links JWT para pases de fidelización
 */

import { GoogleAuth } from 'google-auth-library'
import * as jwt from 'jsonwebtoken'

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID ?? ''
const BASE_CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID ?? ''
const SERVICE_EMAIL = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL ?? ''
const PRIVATE_KEY_ID = process.env.GOOGLE_WALLET_PRIVATE_KEY_ID ?? ''

// Lazy — no evaluar en module scope para evitar crash cuando la var no existe en build time
function getPrivateKey() {
  return (process.env.GOOGLE_WALLET_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
}

const WALLET_API = 'https://walletobjects.googleapis.com/walletobjects/v1'

// ─── Auth ────────────────────────────────────────────────────────────────────

function getAuth() {
  return new GoogleAuth({
    credentials: {
      type: 'service_account',
      client_email: SERVICE_EMAIL,
      private_key: getPrivateKey(),
    },
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  })
}

async function authHeaders() {
  const auth = getAuth()
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return {
    Authorization: `Bearer ${token.token}`,
    'Content-Type': 'application/json',
  }
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface LoyaltyProgramConfig {
  classId: string          // ej: 'calificar_restaurante_xyz'
  programName: string      // ej: 'Club de puntos La Pizzería'
  issuerName: string       // ej: 'La Pizzería'
  logoUrl: string
  hexBgColor: string       // ej: '#7C3AED'
  heroImageUrl?: string
  lat?: number
  lng?: number
  stampsGoal: number
  rewardDescription: string
}

export interface CardObjectConfig {
  classId: string
  objectId: string         // ej: 'calificar_card_<uuid>'
  customerName: string
  stamps: number
  stampsGoal: number
  rewardDescription: string
}

// ─── Clase (programa del negocio) ────────────────────────────────────────────

export async function createOrUpdateLoyaltyClass(cfg: LoyaltyProgramConfig) {
  const fullClassId = `${ISSUER_ID}.${cfg.classId}`
  const headers = await authHeaders()

  const body: Record<string, unknown> = {
    id: fullClassId,
    issuerName: cfg.issuerName,
    programName: cfg.programName,
    programLogo: {
      sourceUri: { uri: cfg.logoUrl },
      contentDescription: { defaultValue: { language: 'es', value: cfg.issuerName } },
    },
    hexBackgroundColor: cfg.hexBgColor,
    rewardsTierPoints: `Meta: ${cfg.stampsGoal} sellos`,
    rewardsTier: cfg.rewardDescription,
    reviewStatus: 'UNDER_REVIEW',
    multipleDevicesAndHoldersAllowedStatus: 'ONE_USER_ALL_DEVICES',
  }

  if (cfg.heroImageUrl) {
    body.heroImage = {
      sourceUri: { uri: cfg.heroImageUrl },
      contentDescription: { defaultValue: { language: 'es', value: 'Banner' } },
    }
  }

  if (cfg.lat && cfg.lng) {
    body.locations = [{ latitude: cfg.lat, longitude: cfg.lng }]
  }

  // Intentar GET primero — si existe, PATCH; si no, POST
  const getRes = await fetch(`${WALLET_API}/loyaltyClass/${fullClassId}`, { headers })
  if (getRes.ok) {
    await fetch(`${WALLET_API}/loyaltyClass/${fullClassId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    })
    return fullClassId
  }

  await fetch(`${WALLET_API}/loyaltyClass`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return fullClassId
}

// ─── Objeto (tarjeta del cliente) ─────────────────────────────────────────────

export async function createLoyaltyObject(cfg: CardObjectConfig) {
  const fullClassId = `${ISSUER_ID}.${cfg.classId}`
  const fullObjectId = `${ISSUER_ID}.${cfg.objectId}`
  const headers = await authHeaders()

  const body = {
    id: fullObjectId,
    classId: fullClassId,
    state: 'ACTIVE',
    loyaltyPoints: {
      balance: { string: `${cfg.stamps} / ${cfg.stampsGoal}` },
      label: 'Sellos',
    },
    textModulesData: [
      {
        header: 'Premio',
        body: cfg.rewardDescription,
        id: 'reward',
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: fullObjectId,
    },
    accountName: cfg.customerName,
    accountId: cfg.objectId,
  }

  const res = await fetch(`${WALLET_API}/loyaltyObject`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error creando objeto Wallet: ${err}`)
  }

  return fullObjectId
}

// ─── Actualizar puntos en una tarjeta existente ───────────────────────────────

export async function updateLoyaltyObjectStamps(
  objectId: string,
  stamps: number,
  stampsGoal: number
) {
  const fullObjectId = `${ISSUER_ID}.${objectId}`
  const headers = await authHeaders()

  await fetch(`${WALLET_API}/loyaltyObject/${fullObjectId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      loyaltyPoints: {
        balance: { string: `${stamps} / ${stampsGoal}` },
        label: 'Sellos',
      },
    }),
  })
}

// ─── Generar JWT → link "Agregar a Google Wallet" ────────────────────────────

export function generateWalletJwt(objectId: string, classId: string): string {
  const fullClassId = `${ISSUER_ID}.${classId}`
  const fullObjectId = `${ISSUER_ID}.${objectId}`

  const payload = {
    iss: SERVICE_EMAIL,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [process.env.NEXT_PUBLIC_APP_URL ?? 'https://calificar.com.ar'],
    payload: {
      loyaltyObjects: [
        { id: fullObjectId, classId: fullClassId },
      ],
    },
  }

  return jwt.sign(payload, getPrivateKey(), {
    algorithm: 'RS256',
    keyid: PRIVATE_KEY_ID,
  })
}

export function getWalletLink(objectId: string, classId: string): string {
  const token = generateWalletJwt(objectId, classId)
  return `https://pay.google.com/gp/v/save/${token}`
}
