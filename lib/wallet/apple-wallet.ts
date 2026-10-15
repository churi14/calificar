/**
 * Apple Wallet (.pkpass) — Tarjeta de sellos tipo storeCard
 *
 * Variables de entorno necesarias:
 *   APPLE_PASS_TYPE_IDENTIFIER   — e.g. "pass.com.calificar.loyalty"
 *   APPLE_TEAM_IDENTIFIER        — e.g. "XXXXXXXXXX"
 *   APPLE_SIGNER_CERT            — certificado PEM del Pass Type ID (base64-encoded)
 *   APPLE_SIGNER_KEY             — clave privada PEM (base64-encoded)
 *   APPLE_SIGNER_KEY_PASSPHRASE  — passphrase de la clave (puede estar vacío)
 *   APPLE_WWDR_CERT              — certificado intermediario de Apple WWDR G4 (base64-encoded)
 */

import { PKPass, PassType } from 'passkit-generator'

export interface ApplePassData {
  serialNumber: string
  customerName: string
  stamps: number
  stampsGoal: number
  rewardDescription: string
  programName: string
  businessName: string
  primaryColor: string   // hex, e.g. "#7C3AED"
  textColor: string      // hex, e.g. "#FFFFFF"
  logoUrl?: string | null
  programId: string
}

/** Convierte #RRGGBB → "rgb(R, G, B)" para Apple Wallet */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) || 0
  const g = parseInt(clean.substring(2, 4), 16) || 0
  const b = parseInt(clean.substring(4, 6), 16) || 0
  return `rgb(${r}, ${g}, ${b})`
}

/** Devuelve Buffer del .pkpass listo para enviar al cliente */
export async function createApplePass(data: ApplePassData): Promise<Buffer> {
  const {
    serialNumber,
    customerName,
    stamps,
    stampsGoal,
    rewardDescription,
    programName,
    businessName,
    primaryColor,
    textColor,
    programId,
  } = data

  // ── Certificados desde env vars (base64) ──────────────────────────────────
  const signerCert = Buffer.from(process.env.APPLE_SIGNER_CERT ?? '', 'base64')
  const signerKey  = Buffer.from(process.env.APPLE_SIGNER_KEY  ?? '', 'base64')
  const wwdr       = Buffer.from(process.env.APPLE_WWDR_CERT   ?? '', 'base64')
  const passPhrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE ?? ''

  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER ?? ''
  const teamIdentifier     = process.env.APPLE_TEAM_IDENTIFIER     ?? ''

  // ── Íconos placeholder (1×1 px PNG transparente) ─────────────────────────
  // En producción reemplazá por los íconos reales del negocio
  const PLACEHOLDER_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )

  // ── Contenido del pase ────────────────────────────────────────────────────
  const progress = `${stamps}/${stampsGoal}`
  const pct = Math.min(Math.round((stamps / stampsGoal) * 100), 100)

  const pass = new PKPass(
    {
      'icon.png':    PLACEHOLDER_PNG,
      'icon@2x.png': PLACEHOLDER_PNG,
      'logo.png':    PLACEHOLDER_PNG,
      'logo@2x.png': PLACEHOLDER_PNG,
    },
    {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: passPhrase || undefined,
    },
    {
      passTypeIdentifier,
      teamIdentifier,
      serialNumber,
      description: `${businessName} — Tarjeta de fidelización`,
      organizationName: businessName,
      logoText: businessName,
      backgroundColor: hexToRgb(primaryColor || '#7C3AED'),
      foregroundColor: hexToRgb(textColor || '#FFFFFF'),
      labelColor: hexToRgb(textColor || '#FFFFFF'),
    }
  )

  // ── Tipo de pase: storeCard ───────────────────────────────────────────────
  const storeCard = new PassType('storeCard')
  storeCard.primaryFields.push({
    key:   'stamps',
    label: 'SELLOS',
    value: progress,
  })
  storeCard.secondaryFields.push(
    { key: 'progress', label: 'PROGRESO', value: `${pct}%` },
    { key: 'reward',   label: 'PREMIO',   value: rewardDescription }
  )
  storeCard.auxiliaryFields.push(
    { key: 'program',  label: 'PROGRAMA', value: programName },
    { key: 'customer', label: 'CLIENTE',  value: customerName }
  )

  // @ts-expect-error — API moderna de passkit-generator v3: `types` setter
  pass.types = [storeCard]

  // ── Barcode (QR) ─────────────────────────────────────────────────────────
  pass.setBarcodes({
    message:         `https://calificar.com.ar/t/${programId}?card=${serialNumber}`,
    format:          'PKBarcodeFormatQR',
    messageEncoding: 'iso-8859-1',
  })

  return pass.getAsBuffer()
}
