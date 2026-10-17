'use client'

import React, { useState, useEffect } from 'react'

// ── props ─────────────────────────────────────────────────────────────────────
interface ViewDominioPersonalizadoProps {
  selectedProgram: string | null
  accessToken: string
}

const DEFAULT_CNAME = 'cname.vercel-dns.com'

// ── pequeño botón "Copiar" ────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        })
      }}
      className="ml-2 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded-md transition-colors shrink-0"
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}

// ── guías por proveedor ───────────────────────────────────────────────────────
const PROVIDERS: { name: string; steps: string[] }[] = [
  {
    name: 'GoDaddy',
    steps: [
      'Entrá a tu cuenta de GoDaddy → "Mis productos" → al lado de tu dominio tocá "DNS".',
      'Tocá "Agregar nuevo registro".',
      'Tipo: CNAME · Nombre: el subdominio (ej. tarjeta) · Valor: el destino de abajo · TTL: el que viene por defecto.',
      'Guardá.',
    ],
  },
  {
    name: 'Namecheap',
    steps: [
      'Entrá a "Domain List" → tocá "Manage" en tu dominio → pestaña "Advanced DNS".',
      'Tocá "Add New Record" y elegí "CNAME Record".',
      'Host: el subdominio (ej. tarjeta) · Value: el destino de abajo · TTL: Automatic.',
      'Tocá el tilde verde para guardar.',
    ],
  },
  {
    name: 'Cloudflare',
    steps: [
      'Entrá a tu dominio → menú "DNS" → "Records" → "Add record".',
      'Type: CNAME · Name: el subdominio (ej. tarjeta) · Target: el destino de abajo.',
      'IMPORTANTE: apagá la nube naranja para que quede en gris ("DNS only"). Si queda naranja, no funciona.',
      'Guardá.',
    ],
  },
  {
    name: 'NIC Argentina (.com.ar) u otro proveedor',
    steps: [
      'NIC Argentina solo registra el dominio: los registros DNS se cargan donde tengas apuntados los "servidores DNS" (nameservers) de tu dominio.',
      'Si no sabés dónde, lo más simple es usar Cloudflare (gratis): creás una cuenta, agregás tu dominio y en NIC Argentina cambiás los servidores DNS por los dos que te indica Cloudflare.',
      'Después seguí los pasos de Cloudflare de arriba.',
      'Si tu dominio lo maneja tu hosting o tu diseñador web, pedile que cargue el registro CNAME con los datos de esta pantalla.',
    ],
  },
]

// ── componente ────────────────────────────────────────────────────────────────
export default function ViewDominioPersonalizado({
  selectedProgram,
  accessToken,
}: ViewDominioPersonalizadoProps) {
  const [domain, setDomain]             = useState('')
  const [savedDomain, setSavedDomain]   = useState<string | null>(null)
  const [verified, setVerified]         = useState(false)
  const [isUltimate, setIsUltimate]     = useState(false)
  const [loading, setLoading]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [checking, setChecking]         = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [warning, setWarning]           = useState('')
  const [checkMsg, setCheckMsg]         = useState<{ ok: boolean; text: string } | null>(null)
  const [cnameTarget, setCnameTarget]   = useState(DEFAULT_CNAME)
  const [openProvider, setOpenProvider] = useState<string | null>(null)
  const [showGuide, setShowGuide]       = useState(true)

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }

  useEffect(() => {
    if (!selectedProgram) return
    setLoading(true)
    fetch(`/api/fidelizacion/custom-domain?program_id=${selectedProgram}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(d => {
        setSavedDomain(d.custom_domain ?? null)
        setDomain(d.custom_domain ?? '')
        setVerified(d.verified ?? false)
        setIsUltimate(d.is_ultimate ?? false)
        setShowGuide(!d.custom_domain)   // con dominio ya cargado la guía queda cerrada
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedProgram, accessToken])

  async function save() {
    if (!domain.trim()) return
    setSaving(true); setError(''); setSuccess(''); setWarning(''); setCheckMsg(null)
    const res = await fetch('/api/fidelizacion/custom-domain', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ program_id: selectedProgram, domain: domain.trim() }),
    })
    const d = await res.json()
    setSaving(false)
    if (!res.ok) { setError(d.error ?? 'Error guardando'); return }
    setSavedDomain(d.domain)
    setDomain(d.domain)
    setVerified(false)
    setCnameTarget(d.cname_target ?? DEFAULT_CNAME)
    setSuccess('Dominio guardado. Ahora seguí el paso 3 de la guía: cargá el registro CNAME en tu proveedor de DNS.')
    if (d.vercel_status && d.vercel_status !== 'added') {
      setWarning(
        'El dominio quedó guardado, pero todavía no lo pudimos dar de alta en nuestro servidor' +
        (d.vercel_error ? ` (${d.vercel_error})` : '') +
        '. Escribinos por WhatsApp y lo activamos.'
      )
    }
    setShowGuide(true)
  }

  async function verifyNow() {
    setChecking(true); setCheckMsg(null)
    try {
      const res = await fetch('/api/fidelizacion/custom-domain', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ program_id: selectedProgram }),
      })
      const d = await res.json()
      if (!res.ok) { setCheckMsg({ ok: false, text: d.error ?? 'No se pudo verificar. Probá de nuevo.' }); setChecking(false); return }
      setVerified(!!d.verified)
      if (d.verified) {
        setCheckMsg({ ok: true, text: '¡Listo! El DNS está bien configurado. Tu tarjeta ya se puede abrir desde tu dominio.' })
      } else if (d.reason === 'wrong_target') {
        setCheckMsg({ ok: false, text: `El registro existe pero apunta a "${(d.found ?? []).join(', ')}". Tiene que apuntar a ${cnameTarget}.` })
      } else {
        setCheckMsg({ ok: false, text: 'Todavía no encontramos el registro CNAME. Si lo acabás de cargar, esperá unos minutos y probá de nuevo. Si usás Cloudflare, revisá que la nube esté en gris.' })
      }
    } catch {
      setCheckMsg({ ok: false, text: 'Error de red. Probá de nuevo.' })
    }
    setChecking(false)
  }

  async function remove() {
    if (!confirm('¿Eliminar el dominio personalizado?')) return
    setDeleting(true); setError(''); setSuccess(''); setWarning(''); setCheckMsg(null)
    await fetch(`/api/fidelizacion/custom-domain?program_id=${selectedProgram}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    setDeleting(false)
    setSavedDomain(null); setDomain(''); setVerified(false)
    setSuccess('Dominio eliminado.')
    setShowGuide(true)
  }

  // En casi todos los proveedores el "Nombre/Host" es solo la primera parte (tarjeta), no el dominio completo
  const shownDomain = savedDomain ?? (domain.trim() || 'tarjeta.milocal.com')
  const hostLabel = shownDomain.split('.')[0]

  return (
    <div className="p-4 md:p-8 w-full max-w-3xl">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-1">Dominio personalizado</h1>
      <p className="text-zinc-400 dark:text-gray-500 text-sm mb-6">
        Hacé que tu tarjeta de fidelización se abra desde tu propia dirección — por ejemplo{' '}
        <span className="font-mono text-violet-600 dark:text-violet-400">tarjeta.milocal.com</span>{' '}
        en vez de calificar.com.ar.
      </p>

      {!isUltimate && !loading && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Función Ultimate</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">El dominio personalizado está disponible en el plan Ultimate.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 text-zinc-400 dark:text-gray-500 text-sm">Cargando...</div>
      )}

      {!loading && (
        <>
          {/* Estado actual */}
          {savedDomain && (
            <div className={`rounded-2xl p-4 mb-5 ${
              verified
                ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800'
                : 'bg-zinc-50 dark:bg-gray-900 border border-zinc-200 dark:border-gray-700'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{verified ? '✅' : '⏳'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100 truncate">{savedDomain}</p>
                  <p className="text-xs text-zinc-500 dark:text-gray-400 mt-0.5">
                    {verified ? 'Dominio verificado y activo' : 'Esperando que cargues el registro DNS (paso 3 de la guía)'}
                  </p>
                </div>
                {!verified && (
                  <button
                    onClick={verifyNow}
                    disabled={checking}
                    className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg shrink-0 disabled:opacity-60 transition-colors"
                  >
                    {checking ? 'Verificando...' : 'Verificar ahora'}
                  </button>
                )}
                <button
                  onClick={remove}
                  disabled={deleting}
                  className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold shrink-0"
                >
                  {deleting ? '...' : 'Eliminar'}
                </button>
              </div>
              {checkMsg && (
                <p className={`text-xs mt-3 ${checkMsg.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {checkMsg.text}
                </p>
              )}
              {verified && (
                <p className="text-xs text-zinc-500 dark:text-gray-400 mt-3">
                  Compartí este link con tus clientes (WhatsApp, Instagram, tu carta):{' '}
                  <span className="font-mono text-violet-600 dark:text-violet-400">https://{savedDomain}</span>
                  <CopyButton value={`https://${savedDomain}`} />
                </p>
              )}
            </div>
          )}

          {/* Input */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-200 dark:border-gray-700 rounded-2xl p-5 mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-gray-500 block mb-2">
              Tu dominio
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={domain}
                onChange={e => { setDomain(e.target.value); setError('') }}
                placeholder="tarjeta.milocal.com"
                disabled={!isUltimate}
                className="flex-1 border border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-gray-600 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={save}
                disabled={saving || !isUltimate || !domain.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-xl text-sm disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-gray-500 mt-2">
              Tiene que ser un <strong>subdominio</strong> (con un nombre adelante), por ejemplo tarjeta.milocal.com. No sirve solo milocal.com.
            </p>
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{error}</p>}
            {success && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{success}</p>}
            {warning && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">{warning}</p>}
          </div>

          {/* ── Guía paso a paso ── */}
          <div className="bg-white dark:bg-gray-900 border border-zinc-100 dark:border-gray-800 rounded-2xl p-5">
            <button
              onClick={() => setShowGuide(v => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-bold text-zinc-800 dark:text-gray-100">📘 Guía paso a paso (no hace falta saber de informática)</span>
              <span className="text-zinc-400 dark:text-gray-500 text-xs">{showGuide ? '▲' : '▼'}</span>
            </button>

            {showGuide && (
              <div className="mt-5 space-y-6 text-sm text-zinc-600 dark:text-gray-400">
                {/* Qué es */}
                <div className="bg-violet-50 dark:bg-violet-950/40 rounded-xl p-4 text-[13px] leading-relaxed">
                  <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">¿Qué es esto?</p>
                  Hoy tus clientes abren su tarjeta desde <span className="font-mono">calificar.com.ar</span>. Con un dominio personalizado la abren desde una dirección tuya,
                  como <span className="font-mono">tarjeta.milocal.com</span>. Para eso hay que hacer una sola configuración en el lugar donde compraste tu dominio:
                  crear un &ldquo;registro CNAME&rdquo;, que es como decirle a internet &ldquo;esta dirección es la misma que la de Calificar&rdquo;.
                </div>

                {/* Paso 0 */}
                <Step n="0" title="Necesitás tener un dominio propio">
                  Es la dirección de tu local en internet (por ejemplo <span className="font-mono">milocal.com</span> o <span className="font-mono">milocal.com.ar</span>).
                  Si todavía no tenés, se compra en sitios como Cloudflare, Namecheap, GoDaddy o NIC Argentina (para los .com.ar). El dominio lo pagás ahí, no en Calificar.
                </Step>

                {/* Paso 1 */}
                <Step n="1" title="Elegí un subdominio">
                  Es tu dominio con una palabra adelante. Ejemplos: <span className="font-mono">tarjeta.milocal.com</span>, <span className="font-mono">fidelidad.milocal.com.ar</span> o <span className="font-mono">sellos.milocal.com</span>.
                  No uses solo <span className="font-mono">milocal.com</span> ni <span className="font-mono">www.milocal.com</span>: esos ya los usa tu sitio.
                </Step>

                {/* Paso 2 */}
                <Step n="2" title="Escribilo arriba y tocá Guardar">
                  Ponelo en el campo &ldquo;Tu dominio&rdquo; (sin <span className="font-mono">https://</span>) y tocá <strong>Guardar</strong>. Con eso quedamos avisados de que ese dominio es tuyo.
                </Step>

                {/* Paso 3 */}
                <Step n="3" title="Cargá el registro CNAME en tu proveedor de DNS">
                  Entrá al panel de donde compraste el dominio, buscá la sección <strong>DNS</strong> (a veces se llama &ldquo;Administrar DNS&rdquo; o &ldquo;Zona DNS&rdquo;) y agregá un registro nuevo con estos datos:
                  <div className="mt-3 bg-zinc-50 dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 rounded-xl p-4 font-mono text-xs space-y-2.5">
                    <div className="flex items-center">
                      <span className="text-zinc-400 dark:text-gray-500 w-28 shrink-0">Tipo</span>
                      <span className="font-bold text-zinc-900 dark:text-white">CNAME</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-y-1">
                      <span className="text-zinc-400 dark:text-gray-500 w-28 shrink-0">Nombre / Host</span>
                      <span className="font-bold text-violet-600 dark:text-violet-400">{hostLabel}</span>
                      <CopyButton value={hostLabel} />
                      <span className="w-full pl-28 text-[10px] text-zinc-400 dark:text-gray-500 font-sans">
                        Solo esta primera parte, sin el resto del dominio.
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-zinc-400 dark:text-gray-500 w-28 shrink-0">Valor / Destino</span>
                      <span className="font-bold text-zinc-900 dark:text-white break-all">{cnameTarget}</span>
                      <CopyButton value={cnameTarget} />
                    </div>
                    <div className="flex items-center">
                      <span className="text-zinc-400 dark:text-gray-500 w-28 shrink-0">TTL</span>
                      <span className="text-zinc-600 dark:text-gray-400 font-sans">Automático (o el valor más bajo que te deje)</span>
                    </div>
                  </div>

                  <p className="mt-4 mb-2 text-xs font-semibold text-zinc-500 dark:text-gray-400">¿Dónde se carga? Elegí tu proveedor:</p>
                  <div className="space-y-2">
                    {PROVIDERS.map(p => (
                      <div key={p.name} className="border border-zinc-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenProvider(openProvider === p.name ? null : p.name)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-semibold text-zinc-700 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {p.name}
                          <span className="text-zinc-400 dark:text-gray-500">{openProvider === p.name ? '▲' : '▼'}</span>
                        </button>
                        {openProvider === p.name && (
                          <ol className="px-4 pb-3 pt-1 space-y-1.5 list-decimal list-inside text-xs leading-relaxed">
                            {p.steps.map((st, i) => <li key={i}>{st}</li>)}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                </Step>

                {/* Paso 4 */}
                <Step n="4" title="Esperá un rato y tocá “Verificar ahora”">
                  Los cambios de DNS tardan entre 5 minutos y unas horas (a veces hasta 48). Cuando pase un rato, tocá el botón violeta <strong>Verificar ahora</strong> de arriba:
                  si está todo bien, el estado pasa de ⏳ a ✅.
                </Step>

                {/* Paso 5 */}
                <Step n="5" title="¡Listo! Compartí tu link">
                  Cuando aparezca ✅, tus clientes ya pueden abrir su tarjeta desde <span className="font-mono">https://{shownDomain}</span>. Compartilo por WhatsApp, Instagram o en tu carta.
                  Los QR para sumar sellos que imprimís desde &ldquo;Imprimir y compartir&rdquo; siguen funcionando igual que siempre.
                </Step>

                {/* Problemas comunes */}
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-gray-200 mb-2">Si algo no funciona</p>
                  <ul className="space-y-2 text-[13px] leading-relaxed list-disc list-inside">
                    <li><strong>&ldquo;Todavía no encontramos el registro&rdquo;:</strong> revisá que en <em>Nombre/Host</em> hayas puesto solo <span className="font-mono">{hostLabel}</span> y no el dominio completo. Si recién lo cargaste, esperá un rato.</li>
                    <li><strong>Usás Cloudflare:</strong> la nube de ese registro tiene que estar en gris (&ldquo;DNS only&rdquo;), no naranja.</li>
                    <li><strong>&ldquo;Ya existe un registro con ese nombre&rdquo;:</strong> tu proveedor ya tiene algo cargado en ese subdominio. Borralo o elegí otro subdominio.</li>
                    <li><strong>Se ve un cartel de &ldquo;sitio no seguro&rdquo;:</strong> es normal los primeros minutos mientras se genera el certificado (candadito). Se arregla solo.</li>
                    <li><strong>Seguís trabado:</strong> escribinos por WhatsApp con una captura de tu pantalla de DNS y lo resolvemos.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── un paso numerado de la guía ───────────────────────────────────────────────
function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-zinc-800 dark:text-gray-200 mb-1">{title}</p>
        <div className="text-[13px] leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
