'use strict';
// node generate-pptx-v3.js

const pptxgen = require('pptxgenjs');

const C = {
  BG:     '070A14',
  CARD:   '0F1628',
  CARD2:  '111827',
  VIO:    '7C3AED',
  VIO_L:  'A78BFA',
  VIO_XL: 'DDD6FE',
  WHITE:  'FFFFFF',
  SLATE:  '94A3B8',
  SLATE_D:'64748B',
  GREEN:  '4ADE80',
  AMBER:  'F59E0B',
  RED:    'F87171',
  BLUE:   '38BDF8',
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"

// ── helpers ────────────────────────────────────────────────────────────────
function ds() {
  const s = pres.addSlide();
  s.background = { color: C.BG };
  return s;
}
function tag(s, txt, x, y) {
  const w = Math.max(txt.length * 0.092 + 0.5, 1.0);
  s.addShape('roundRect', { x, y, w, h: 0.27, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 35, pt: 1 } });
  s.addText(txt.toUpperCase(), { x, y, w, h: 0.27, fontSize: 7.5, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}
function card(s, x, y, w, h, col) {
  s.addShape('rect', { x, y, w, h, fill: { color: col || C.CARD }, line: { color: 'FFFFFF', transparency: 90, pt: 1 } });
}
function circle(s, emoji, cx, cy, r) {
  s.addShape('ellipse', { x: cx, y: cy, w: r, h: r, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 35, pt: 1 } });
  s.addText(emoji, { x: cx, y: cy, w: r, h: r, fontSize: r * 16, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}
function txt(s, text, x, y, w, h, size, color, bold, align) {
  s.addText(text, { x, y, w, h, fontSize: size || 12, bold: !!bold, color: color || C.WHITE, fontFace: 'Calibri', align: align || 'left', valign: 'middle', isTextBox: true, margin: 0 });
}
// Phone frame — devuelve area interior
function phone(s, px, py, pw, ph, bg) {
  s.addShape('roundRect', { x: px - 0.06, y: py - 0.06, w: pw + 0.12, h: ph + 0.12,
    fill: { color: '1E293B' }, line: { color: '475569', pt: 2 } });
  s.addShape('rect', { x: px, y: py, w: pw, h: ph, fill: { color: bg || C.BG }, line: { color: '000000', transparency: 100, pt: 0 } });
  s.addShape('roundRect', { x: px + pw / 2 - 0.3, y: py + 0.04, w: 0.6, h: 0.12,
    fill: { color: '0F172A' }, line: { color: '0F172A', pt: 0 } });
  return { x: px, y: py + 0.2, w: pw, h: ph - 0.28 };
}

// ══════════════════════════════════════════════════════════════════════════
// 01 · PORTADA
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  s.addShape('ellipse', { x: 6.2, y: -2, w: 6.5, h: 6.5, fill: { color: C.VIO, transparency: 85 }, line: { color: C.VIO, transparency: 85, pt: 0 } });
  s.addShape('ellipse', { x: -1.8, y: 3.8, w: 4.0, h: 4.0, fill: { color: C.VIO_L, transparency: 90 }, line: { color: C.VIO_L, transparency: 90, pt: 0 } });
  tag(s, 'Calificar · Sistema de Fidelización', 0.6, 1.0);
  txt(s, 'Cómo funciona\ntodo el sistema', 0.6, 1.42, 9.0, 2.5, 52, C.WHITE, true);
  txt(s, 'Google Wallet · Apple Wallet · NFC · PWA · Geolocalización · Push Notifications', 0.6, 4.08, 9.0, 0.42, 12.5, C.SLATE, false, 'left');
  txt(s, 'Presentación técnica · Calificar.com.ar', 0.6, 5.18, 5.0, 0.28, 9.5, C.SLATE_D);
}

// ══════════════════════════════════════════════════════════════════════════
// 02 · MAPA DEL SISTEMA
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Visión General', 0.6, 0.3);
  txt(s, 'El ecosistema Calificar', 0.6, 0.65, 9.0, 0.55, 28, C.WHITE, true);

  const nodes = [
    { e: '🏪', t: 'Negocio',   d: 'Configura\nel programa' },
    { e: '📡', t: 'NFC / QR',  d: 'Dispara\nel sello' },
    { e: '📱', t: 'Cliente',   d: 'Toca o escanea\ndesde su celular' },
    { e: '💳', t: 'Wallet',    d: 'Tarjeta en\nGoogle/Apple Wallet' },
    { e: '🏆', t: 'Premio',    d: 'Cupón único\nal completar' },
  ];

  nodes.forEach((n, i) => {
    const x = 0.35 + i * 1.94;
    card(s, x, 1.45, 1.82, 2.65);
    circle(s, n.e, x + 0.6, 1.62, 0.62);
    txt(s, n.t, x + 0.05, 2.38, 1.72, 0.35, 13, C.WHITE, true, 'center');
    txt(s, n.d, x + 0.05, 2.75, 1.72, 0.8, 10.5, C.SLATE, false, 'center');
    if (i < 4) txt(s, '→', x + 1.82, 2.55, 0.12, 0.35, 16, C.VIO_L, false, 'center');
  });

  card(s, 0.35, 4.22, 9.55, 0.98, C.CARD2);
  txt(s, 'Detrás de cada sello:', 0.55, 4.32, 2.2, 0.28, 11, C.VIO_L, true);
  txt(s, 'Supabase registra la transacción  →  Servidor genera token único de seguridad  →  Detecta si se alcanzó un hito o la meta final  →  Actualiza la tarjeta en Wallet', 0.55, 4.62, 9.1, 0.42, 11, C.SLATE, false, 'left');
}

// ══════════════════════════════════════════════════════════════════════════
// 03 · QUÉ ES GOOGLE WALLET
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Google Wallet', 0.5, 0.3);
  txt(s, 'Qué es Google Wallet\ny cómo lo usamos', 0.5, 0.65, 5.0, 1.1, 26, C.WHITE, true);

  txt(s, 'Google Wallet es la billetera digital de Google, preinstalada en todos los teléfonos Android modernos. Permite guardar tarjetas de crédito, pases de embarque, entradas a eventos y — en nuestro caso — tarjetas de fidelidad.', 0.5, 1.82, 4.5, 1.0, 11.5, C.SLATE, false, 'left');

  const items = [
    { e: '☁️', t: 'Siempre disponible', d: 'La tarjeta vive en la nube de Google. El cliente no puede perderla aunque cambie de celular.' },
    { e: '🔔', t: 'Notificaciones propias', d: 'Google Wallet puede enviar alertas desde la tarjeta sin necesitar ninguna app nuestra.' },
    { e: '✏️', t: 'Se actualiza en tiempo real', d: 'Cuando el cliente suma un sello, la tarjeta se actualiza sola sin que el cliente haga nada.' },
    { e: '🔒', t: 'Firmada por Google', d: 'Cada tarjeta es un JWT firmado con nuestra clave privada. Imposible de falsificar.' },
  ];
  items.forEach((f, i) => {
    const y = 2.95 + i * 0.65;
    circle(s, f.e, 0.5, y + 0.1, 0.42);
    txt(s, f.t, 1.06, y + 0.04, 1.5, 0.3, 12, C.WHITE, true);
    txt(s, f.d, 2.6, y + 0.04, 2.35, 0.58, 10.5, C.SLATE, false, 'left');
  });

  // Phone con Google Wallet
  const { x: px, y: py, w: pw } = phone(s, 5.45, 0.22, 4.1, 5.22, '1C1C1E');
  txt(s, 'Google Wallet', px, py + 0.08, pw, 0.3, 10, C.WHITE, true, 'center');

  // Tarjeta violeta
  s.addShape('roundRect', { x: px + 0.18, y: py + 0.48, w: pw - 0.36, h: 1.88,
    fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addShape('ellipse', { x: px + pw - 1.0, y: py + 0.32, w: 1.5, h: 1.5,
    fill: { color: 'FFFFFF', transparency: 90 }, line: { color: 'FFFFFF', transparency: 90, pt: 0 } });

  txt(s, '🍕', px + 0.28, py + 0.62, 0.55, 0.55, 22, C.WHITE, false, 'center');
  txt(s, 'La Trattoria', px + 0.9, py + 0.66, pw - 1.1, 0.3, 12.5, C.WHITE, true);
  txt(s, 'Tarjeta de Fidelidad', px + 0.9, py + 0.98, pw - 1.1, 0.24, 9, C.VIO_XL);
  txt(s, '⭐⭐⭐⭐⭐⭐☆☆☆☆', px + 0.28, py + 1.38, pw - 0.36, 0.3, 13.5, 'FCD34D', false, 'left');
  txt(s, '6/10 · Te falta 1 pizza gratis 🍕', px + 0.28, py + 1.72, pw - 0.36, 0.22, 8.5, 'EDE9FE');

  // Barcode area
  s.addShape('rect', { x: px + 0.28, y: py + 2.5, w: pw - 0.56, h: 0.68, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', pt: 0 } });
  for (let i = 0; i < 26; i++) {
    const bw = [0.06, 0.1, 0.04, 0.08, 0.06][i % 5];
    const bx = px + 0.34 + i * 0.126;
    s.addShape('rect', { x: bx, y: py + 2.54, w: bw, h: 0.58,
      fill: { color: i % 3 === 0 ? '111827' : '374151' }, line: { color: 'FFFFFF', transparency: 100, pt: 0 } });
  }
  txt(s, 'Mostrá este código para canjear', px, py + 3.24, pw, 0.24, 8, '9CA3AF', false, 'center');

  // Otra tarjeta abajo
  card(s, px + 0.18, py + 3.55, pw - 0.36, 0.52, '1F2937');
  txt(s, '➕  Agregar otra tarjeta', px + 0.18, py + 3.55, pw - 0.36, 0.52, 10, C.SLATE, false, 'center');
}

// ══════════════════════════════════════════════════════════════════════════
// 04 · QUÉ ES APPLE WALLET
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Apple Wallet · Próximamente', 0.5, 0.3);
  txt(s, 'Qué es Apple Wallet\ny cuándo llega', 0.5, 0.65, 5.0, 1.1, 26, C.WHITE, true);

  txt(s, 'Apple Wallet (antes Passbook) es la billetera digital nativa de iPhone e integrada en el Apple Watch. Al igual que Google Wallet, permite almacenar tarjetas de crédito, pases y tarjetas de fidelidad.', 0.5, 1.82, 4.5, 0.9, 11.5, C.SLATE);

  txt(s, 'Estado actual:', 0.5, 2.82, 1.5, 0.28, 11, C.VIO_L, true);
  card(s, 0.5, 3.08, 4.5, 0.98, '1A1200');
  txt(s, '⚠️  En desarrollo — Q1 2026', 0.68, 3.12, 4.12, 0.3, 12, C.AMBER, true);
  txt(s, 'Hoy los usuarios iPhone pueden registrarse y ver su progreso desde Safari, pero aún no tienen la tarjeta nativa en Wallet.', 0.68, 3.44, 4.12, 0.56, 10.5, C.SLATE);

  const diff = [
    { titulo: 'Google Wallet (disponible ahora)', ok: true,  items: ['Android 6.0+', 'Tarjeta nativa en Wallet', 'Push desde la tarjeta', 'NFC sello sin app'] },
    { titulo: 'Apple Wallet (próximamente)',       ok: false, items: ['iPhone 6s+', 'PassKit firmado por Apple', 'Push notifications nativas', 'NFC igual que en Android'] },
  ];
  diff.forEach((col, i) => {
    const x = 0.5 + i * 2.35;
    const colW = 2.15;
    card(s, x, 4.15, colW, 1.35, col.ok ? '0A1A0A' : '0A0A1A');
    txt(s, col.titulo, x + 0.12, 4.2, colW - 0.2, 0.28, 9, col.ok ? C.GREEN : C.VIO_L, true);
    col.items.forEach((it, j) => {
      txt(s, (col.ok ? '✓ ' : '🔜 ') + it, x + 0.12, 4.52 + j * 0.24, colW - 0.2, 0.22, 9.5, col.ok ? C.GREEN : C.SLATE);
    });
  });

  // iPhone mockup — Apple Wallet
  const { x: px, y: py, w: pw } = phone(s, 5.45, 0.22, 4.1, 5.22, 'F2F2F7');
  txt(s, 'Wallet', px, py + 0.08, pw, 0.32, 17, '000000', true, 'center');

  // Apple Wallet card
  s.addShape('roundRect', { x: px + 0.18, y: py + 0.52, w: pw - 0.36, h: 2.1,
    fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addShape('ellipse', { x: px + pw - 1.05, y: py + 0.38, w: 1.55, h: 1.55,
    fill: { color: 'FFFFFF', transparency: 90 }, line: { color: 'FFFFFF', transparency: 90, pt: 0 } });

  txt(s, '🍕  La Trattoria', px + 0.3, py + 0.68, pw - 0.46, 0.38, 12.5, C.WHITE, true);
  txt(s, 'Tarjeta de Fidelidad', px + 0.3, py + 1.08, pw - 0.46, 0.26, 9, C.VIO_XL);
  txt(s, '⭐⭐⭐⭐⭐⭐☆☆☆☆', px + 0.3, py + 1.42, pw - 0.46, 0.3, 14, 'FCD34D');
  txt(s, '6 / 10 · Pizza gratis al completar', px + 0.3, py + 1.78, pw - 0.46, 0.24, 9, 'EDE9FE');

  // NFC tap indicator
  s.addShape('ellipse', { x: px + pw / 2 - 0.28, y: py + 2.75, w: 0.56, h: 0.56,
    fill: { color: 'E5E7EB' }, line: { color: 'E5E7EB', pt: 0 } });
  txt(s, '📡', px + pw / 2 - 0.28, py + 2.75, 0.56, 0.56, 20, C.WHITE, false, 'center');

  // Otras tarjetas apiladas
  s.addShape('roundRect', { x: px + 0.28, y: py + 3.42, w: pw - 0.56, h: 0.62, fill: { color: 'D1FAE5' }, line: { color: 'D1FAE5', pt: 0 } });
  txt(s, '💳  Visa ···· 4521', px + 0.4, py + 3.52, pw - 0.64, 0.38, 9.5, '064E3B', true);
  s.addShape('roundRect', { x: px + 0.28, y: py + 4.08, w: pw - 0.56, h: 0.62, fill: { color: 'FEF3C7' }, line: { color: 'FEF3C7', pt: 0 } });
  txt(s, '✈️  American Airlines', px + 0.4, py + 4.18, pw - 0.64, 0.38, 9.5, '78350F', true);

  // Coming soon badge
  s.addShape('roundRect', { x: px + 0.4, y: py + 4.78, w: pw - 0.8, h: 0.3, fill: { color: C.AMBER }, line: { color: C.AMBER, pt: 0 } });
  txt(s, 'Calificar · En desarrollo 2026', px + 0.4, py + 4.78, pw - 0.8, 0.3, 9, '000000', true, 'center');
}

// ══════════════════════════════════════════════════════════════════════════
// 05 · REGISTRO DEL CLIENTE
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Registro del Cliente', 0.5, 0.3);
  txt(s, 'De cero a tarjeta digital\nen 30 segundos', 0.5, 0.65, 4.6, 1.0, 25, C.WHITE, true);

  const steps = [
    { n: '1', t: 'Escanea el QR', d: 'Con la cámara nativa del celular — sin descargar ninguna app.' },
    { n: '2', t: 'Completa nombre y teléfono', d: 'Formulario breve, personalizable por cada negocio.' },
    { n: '3', t: 'Guarda la tarjeta en Wallet', d: 'Un toque y la tarjeta aparece en Google Wallet (o Apple Wallet próximamente).' },
  ];
  steps.forEach((st, i) => {
    const y = 1.82 + i * 1.12;
    circle(s, st.n, 0.5, y + 0.08, 0.44);
    txt(s, st.t, 1.08, y + 0.06, 3.7, 0.3, 13, C.WHITE, true);
    txt(s, st.d, 1.08, y + 0.4, 3.7, 0.62, 11, C.SLATE);
  });

  card(s, 0.48, 5.22, 4.55, 0.38, C.CARD2);
  txt(s, '✓ Sin app   ✓ Funciona en Android y iPhone   ✓ La tarjeta queda en la nube', 0.62, 5.26, 4.28, 0.3, 10.5, C.GREEN);

  // Phone mockup — formulario
  const { x: px, y: py, w: pw } = phone(s, 5.45, 0.22, 4.1, 5.22, 'FFFFFF');

  s.addShape('rect', { x: px, y: py, w: pw, h: 0.8, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  circle(s, '🍕', px + 0.18, py + 0.1, 0.58);
  txt(s, 'La Trattoria', px + 0.85, py + 0.14, pw - 0.95, 0.3, 12, C.WHITE, true);
  txt(s, 'Sumate al programa de fidelidad', px + 0.85, py + 0.46, pw - 0.95, 0.24, 8.5, 'DDD6FE');

  txt(s, 'Nombre', px + 0.2, py + 0.95, pw - 0.36, 0.22, 8, '6B7280', true);
  s.addShape('roundRect', { x: px + 0.2, y: py + 1.19, w: pw - 0.36, h: 0.38, fill: { color: 'F9FAFB' }, line: { color: 'E5E7EB', pt: 1 } });
  txt(s, 'Ej: María García', px + 0.32, py + 1.22, pw - 0.52, 0.3, 9, 'D1D5DB');

  txt(s, 'Teléfono (WhatsApp)', px + 0.2, py + 1.68, pw - 0.36, 0.22, 8, '6B7280', true);
  s.addShape('roundRect', { x: px + 0.2, y: py + 1.92, w: pw - 0.36, h: 0.38, fill: { color: 'F9FAFB' }, line: { color: C.VIO, pt: 2 } });
  txt(s, '11 2345-6789', px + 0.32, py + 1.95, pw - 0.52, 0.3, 9, '111827');

  s.addShape('roundRect', { x: px + 0.2, y: py + 2.45, w: pw - 0.36, h: 0.44, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  txt(s, 'Registrarme gratis →', px + 0.2, py + 2.45, pw - 0.36, 0.44, 10.5, C.WHITE, true, 'center');

  s.addShape('roundRect', { x: px + 0.2, y: py + 3.02, w: pw - 0.36, h: 0.56, fill: { color: '1C1C1E' }, line: { color: '3A3A3C', pt: 1 } });
  txt(s, 'G', px + 0.32, py + 3.08, 0.42, 0.44, 13, '4285F4', true, 'center');
  txt(s, 'Guardar en Google Wallet', px + 0.78, py + 3.1, pw - 0.98, 0.38, 9.5, C.WHITE, true);

  txt(s, '¿Tenés iPhone? También funciona desde Safari ↗', px, py + 3.72, pw, 0.24, 8, C.SLATE_D, false, 'center');
}

// ══════════════════════════════════════════════════════════════════════════
// 06 · SELLO NFC
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Tecnología NFC', 0.5, 0.3);
  txt(s, 'El sello: apoyás el celular\ny listo en 2 segundos', 0.5, 0.65, 4.6, 1.0, 25, C.WHITE, true);

  const pasos = [
    { e: '📍', t: 'Cartel NFC en el mostrador', d: 'Un chip NFC encapsulado. No necesita batería ni internet.', col: C.VIO },
    { e: '📲', t: 'Cliente apoya su celular', d: 'Radio de alcance menor a 4 cm. Compatible con Android y iPhone.', col: C.BLUE },
    { e: '⚡', t: 'Servidor registra el sello', d: 'La validación ocurre en el servidor — el cliente no puede manipularla.', col: C.GREEN },
    { e: '💳', t: 'La tarjeta se actualiza sola', d: 'Google Wallet recibe el nuevo puntaje automáticamente.', col: C.AMBER },
  ];
  pasos.forEach((p, i) => {
    const y = 1.82 + i * 0.88;
    circle(s, p.e, 0.5, y + 0.1, 0.42);
    txt(s, p.t, 1.06, y + 0.08, 3.7, 0.28, 12.5, C.WHITE, true);
    txt(s, p.d, 1.06, y + 0.38, 3.7, 0.44, 10.5, C.SLATE);
  });
  card(s, 0.5, 5.42, 4.5, 0.38, C.CARD2);
  txt(s, '¿Sin NFC? El mismo proceso funciona escaneando el QR del cartel', 0.65, 5.46, 4.2, 0.3, 10, C.SLATE);

  // Phone — pantalla de sello exitoso
  const { x: px, y: py, w: pw } = phone(s, 5.45, 0.22, 4.1, 5.22, 'FFFFFF');

  s.addShape('ellipse', { x: px + pw / 2 - 0.68, y: py + 0.42, w: 1.36, h: 1.36,
    fill: { color: '7C3AED', transparency: 88 }, line: { color: C.VIO, transparency: 50, pt: 2 } });
  txt(s, '✅', px + pw / 2 - 0.68, py + 0.42, 1.36, 1.36, 44, C.WHITE, false, 'center');

  txt(s, '¡Sello sumado!', px + 0.1, py + 1.92, pw - 0.2, 0.48, 20, '111827', true, 'center');
  txt(s, '7', px + 0.1, py + 2.48, pw - 0.2, 0.72, 52, C.VIO, true, 'center');
  txt(s, 'sellos acumulados', px + 0.1, py + 3.18, pw - 0.2, 0.3, 12, '6B7280', false, 'center');

  s.addShape('rect', { x: px + 0.2, y: py + 3.58, w: pw - 0.4, h: 0.16, fill: { color: 'F3F4F6' }, line: { color: 'F3F4F6', pt: 0 } });
  s.addShape('rect', { x: px + 0.2, y: py + 3.58, w: (pw - 0.4) * 0.7, h: 0.16, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  txt(s, 'Te faltan 3 sellos para tu pizza gratis 🔥', px + 0.1, py + 3.82, pw - 0.2, 0.3, 9, '6B7280', false, 'center');

  s.addShape('roundRect', { x: px + 0.2, y: py + 4.2, w: pw - 0.4, h: 0.4, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  txt(s, 'Ver mi tarjeta →', px + 0.2, py + 4.2, pw - 0.4, 0.4, 10.5, C.WHITE, true, 'center');
}

// ══════════════════════════════════════════════════════════════════════════
// 07 · QUÉ ES UNA PWA
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Tecnología · PWA', 0.5, 0.3);
  txt(s, 'Qué es una PWA y\npor qué Calificar la usa', 0.5, 0.65, 9.0, 1.0, 26, C.WHITE, true);

  card(s, 0.5, 1.72, 9.12, 1.05, C.CARD2);
  txt(s, 'PWA = Progressive Web App', 0.68, 1.78, 5.0, 0.32, 14, C.VIO_L, true);
  txt(s, 'Una PWA es una página web que se comporta como una app nativa. Se instala desde el navegador, aparece en la pantalla de inicio del celular, puede funcionar sin internet y recibir notificaciones — todo sin pasar por el App Store ni Google Play.', 0.68, 2.12, 8.74, 0.55, 11, C.SLATE);

  const vs = [
    {
      t: '📱  App nativa (tradicional)',
      items: [
        'Requiere publicar en App Store y Google Play',
        'El usuario tiene que descargarla (fricción alta)',
        'Actualizaciones manuales para el usuario',
        'Proceso de aprobación de Apple/Google (semanas)',
        'Costo alto de desarrollo (iOS + Android por separado)',
      ],
      col: '7F1D1D', bg: '1A0808',
    },
    {
      t: '✅  PWA (Calificar)',
      items: [
        'Se instala directo desde el navegador con un click',
        'El usuario no tiene que "descargar" nada',
        'Se actualiza automáticamente (el dueño publica y listo)',
        'Funciona en Android e iPhone sin dos proyectos separados',
        'Acceso a NFC, push notifications y geolocalización',
      ],
      col: '14532D', bg: '081A0A',
    },
  ];
  vs.forEach((col, i) => {
    const x = 0.5 + i * 4.62;
    card(s, x, 2.85, 4.42, 2.72, col.bg);
    s.addShape('rect', { x, y: 2.85, w: 4.42, h: 0.44, fill: { color: col.col, transparency: 40 }, line: { color: col.col, transparency: 40, pt: 0 } });
    txt(s, col.t, x + 0.15, 2.89, 4.12, 0.36, 12, i === 0 ? C.RED : C.GREEN, true);
    col.items.forEach((it, j) => {
      txt(s, (i === 0 ? '✗  ' : '✓  ') + it, x + 0.18, 3.38 + j * 0.44, 4.08, 0.4, 11, i === 0 ? C.RED : C.GREEN);
    });
  });

  card(s, 0.5, 5.65, 9.12, 0.42, C.CARD2);
  txt(s, 'Resultado: el cliente de Calificar instala la tarjeta desde el navegador → queda en su Wallet → recibe notificaciones → puede sellar con NFC. Sin app store. Sin fricción.', 0.68, 5.69, 8.74, 0.34, 10.5, C.SLATE);
}

// ══════════════════════════════════════════════════════════════════════════
// 08 · PANEL DEL NEGOCIO
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Panel del Negocio', 0.5, 0.3);
  txt(s, 'El negocio tiene control total\ndesde el panel web', 0.5, 0.65, 4.5, 1.0, 25, C.WHITE, true);

  const menu = [
    { e: '📊', t: 'Hoy',       d: 'Sellos y visitas del día' },
    { e: '👥', t: 'Clientes',  d: 'Lista, búsqueda y detalle' },
    { e: '💳', t: 'Tarjeta',   d: 'Logo, colores, hitos y premio' },
    { e: '📤', t: 'Exportar',  d: 'Descargar base con nombre y tel.' },
    { e: '🔔', t: 'Notifs',    d: 'Push a todos o por segmento' },
  ];
  menu.forEach((m, i) => {
    const y = 1.82 + i * 0.72;
    circle(s, m.e, 0.5, y + 0.12, 0.38);
    txt(s, m.t, 1.02, y + 0.06, 1.15, 0.28, 12, C.WHITE, true);
    txt(s, m.d, 2.22, y + 0.06, 2.28, 0.28, 10.5, C.SLATE);
  });

  // Desktop mockup
  const DX = 4.72, DY = 0.22, DW = 5.22, DH = 5.42;
  s.addShape('rect', { x: DX, y: DY, w: DW, h: DH, fill: { color: C.CARD }, line: { color: '334155', pt: 2 } });
  // Barra del browser
  s.addShape('rect', { x: DX, y: DY, w: DW, h: 0.3, fill: { color: '1E293B' }, line: { color: '1E293B', pt: 0 } });
  ['EF4444','F59E0B','22C55E'].forEach((col, i) => {
    s.addShape('ellipse', { x: DX + 0.1 + i * 0.2, y: DY + 0.09, w: 0.1, h: 0.1, fill: { color: col }, line: { color: col, pt: 0 } });
  });
  txt(s, 'calificar.com.ar/negocio', DX + 0.8, DY + 0.04, DW - 1.0, 0.22, 7.5, '64748B', false, 'center');

  // Sidebar
  s.addShape('rect', { x: DX, y: DY + 0.3, w: 1.15, h: DH - 0.3, fill: { color: '080E1C' }, line: { color: '080E1C', pt: 0 } });
  const navItems = [['📊', 'Hoy'], ['👥', 'Clientes'], ['💳', 'Tarjeta'], ['📤', 'Exportar'], ['🔔', 'Notifs']];
  navItems.forEach(([e, t], i) => {
    if (i === 0) s.addShape('rect', { x: DX, y: DY + 0.3 + i * 0.58, w: 1.15, h: 0.52, fill: { color: C.VIO, transparency: 70 }, line: { color: C.VIO, transparency: 70, pt: 0 } });
    txt(s, `${e} ${t}`, DX + 0.08, DY + 0.38 + i * 0.58, 1.0, 0.36, 8.5, i === 0 ? C.WHITE : C.SLATE);
  });

  // Stats
  const stats = [{ l: 'SELLOS HOY', v: '24' }, { l: 'CLIENTES', v: '138' }, { l: 'PREMIOS', v: '12' }];
  stats.forEach((st, i) => {
    const bx = DX + 1.28 + i * 1.3;
    s.addShape('roundRect', { x: bx, y: DY + 0.38, w: 1.2, h: 0.82, fill: { color: '0A0F1E' }, line: { color: '1E293B', pt: 1 } });
    txt(s, st.l, bx + 0.08, DY + 0.42, 1.04, 0.24, 6.5, C.SLATE_D, true);
    txt(s, st.v, bx + 0.08, DY + 0.66, 1.04, 0.46, 28, C.VIO_L, true);
  });

  // Gráfico de barras
  s.addShape('rect', { x: DX + 1.28, y: DY + 1.32, w: 3.86, h: 1.32, fill: { color: '0A0F1E' }, line: { color: '1E293B', pt: 1 } });
  txt(s, 'Sellos por día — últimos 7 días', DX + 1.4, DY + 1.36, 3.62, 0.24, 7.5, C.SLATE, true);
  [0.52, 0.72, 0.44, 0.88, 0.62, 0.95, 0.78].forEach((h2, i) => {
    const bh = h2 * 0.75;
    s.addShape('roundRect', { x: DX + 1.42 + i * 0.52, y: DY + 2.36 - bh, w: 0.36, h: bh,
      fill: { color: C.VIO, transparency: 30 }, line: { color: C.VIO, transparency: 30, pt: 0 } });
  });

  // Tabla clientes
  s.addShape('rect', { x: DX + 1.28, y: DY + 2.75, w: 3.86, h: 2.58, fill: { color: '0A0F1E' }, line: { color: '1E293B', pt: 1 } });
  txt(s, 'Clientes recientes', DX + 1.4, DY + 2.8, 3.62, 0.24, 7.5, C.SLATE, true);
  [['María G.','7 sellos','HOY'], ['Carlos R.','3 sellos','AYER'], ['Ana P.','10 ⭐ Premio','HOY'], ['Lucas M.','0 sellos','AGO']].forEach((c2, i) => {
    const cy = DY + 3.1 + i * 0.52;
    if (i % 2 === 0) s.addShape('rect', { x: DX + 1.28, y: cy, w: 3.86, h: 0.48, fill: { color: '0F1628', transparency: 0 }, line: { color: '0F1628', pt: 0 } });
    txt(s, c2[0], DX + 1.4, cy + 0.08, 1.3, 0.32, 9, C.WHITE, true);
    txt(s, c2[1], DX + 2.72, cy + 0.08, 1.3, 0.32, 9, i === 2 ? C.AMBER : C.SLATE);
    txt(s, c2[2], DX + 4.0, cy + 0.08, 1.0, 0.32, 9, i === 0 || i === 2 ? C.GREEN : C.SLATE_D, false, 'right');
  });
  s.addShape('roundRect', { x: DX + 2.92, y: DY + 5.1, w: 2.0, h: 0.3, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 35, pt: 1 } });
  txt(s, '📤 Exportar CSV', DX + 2.92, DY + 5.1, 2.0, 0.3, 8.5, C.WHITE, true, 'center');
}

// ══════════════════════════════════════════════════════════════════════════
// 09 · GEOLOCALIZACIÓN — solo en PWA + Wallet
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Geolocalización', 0.5, 0.3);
  txt(s, 'Notificaciones cuando\nel cliente está cerca del local', 0.5, 0.65, 9.0, 1.0, 26, C.WHITE, true);

  // Explicación izquierda
  txt(s, '¿Cómo funciona?', 0.5, 1.72, 4.5, 0.3, 13, C.VIO_L, true);
  txt(s, 'El negocio define un radio virtual alrededor del local (100m, 300m, 500m…). Cuando el cliente entra en esa zona con la PWA instalada, el Service Worker detecta la ubicación y envía automáticamente una notificación push.', 0.5, 2.06, 4.5, 0.88, 11, C.SLATE);

  // Alerta importante
  card(s, 0.5, 3.05, 4.5, 1.02, '1A1200');
  s.addShape('rect', { x: 0.5, y: 3.05, w: 4.5, h: 0.35, fill: { color: C.AMBER, transparency: 55 }, line: { color: C.AMBER, transparency: 55, pt: 0 } });
  txt(s, '⚠️  Requisito importante', 0.68, 3.09, 4.14, 0.27, 11, C.AMBER, true);
  txt(s, 'La geolocalización en background SOLO funciona con la PWA instalada (ícono en la pantalla de inicio) o con la tarjeta nativa en Google Wallet / Apple Wallet. Desde el navegador web convencional, el sistema operativo bloquea el acceso a la ubicación cuando la página está cerrada.', 0.68, 3.44, 4.14, 0.58, 10, C.SLATE);

  const fqs = [
    { e: '📵', t: 'Máx. 1 notif por día por cliente', col: C.GREEN },
    { e: '✅', t: 'El cliente puede desactivarla', col: C.GREEN },
    { e: '🎂', t: 'También se envía en cumpleaños', col: C.VIO_L },
  ];
  fqs.forEach((f, i) => {
    txt(s, `${f.e}  ${f.t}`, 0.5, 4.22 + i * 0.38, 4.5, 0.34, 11, f.col);
  });

  // Visualización geo
  card(s, 5.2, 0.5, 4.5, 4.72, C.CARD);
  txt(s, 'Zona de notificación activa', 5.4, 0.6, 4.1, 0.3, 11, C.VIO_L, true, 'center');

  const cx = 7.45, cy = 2.52;
  s.addShape('ellipse', { x: cx - 1.88, y: cy - 1.88, w: 3.76, h: 3.76, fill: { color: C.VIO, transparency: 92 }, line: { color: C.VIO_L, transparency: 65, pt: 1 } });
  s.addShape('ellipse', { x: cx - 1.38, y: cy - 1.38, w: 2.76, h: 2.76, fill: { color: C.VIO, transparency: 86 }, line: { color: C.VIO_L, transparency: 52, pt: 1 } });
  s.addShape('ellipse', { x: cx - 0.9, y: cy - 0.9, w: 1.8, h: 1.8, fill: { color: C.VIO, transparency: 75 }, line: { color: C.VIO_L, transparency: 38, pt: 1 } });
  s.addShape('ellipse', { x: cx - 0.42, y: cy - 0.42, w: 0.84, h: 0.84, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 18, pt: 1 } });
  txt(s, '🏪', cx - 0.32, cy - 0.32, 0.64, 0.64, 24, C.WHITE, false, 'center');
  txt(s, '🚶', cx - 1.55, cy - 0.25, 0.48, 0.48, 20, C.WHITE, false, 'center');
  txt(s, '📱', cx - 1.52, cy + 0.22, 0.42, 0.42, 18, C.WHITE, false, 'center');

  txt(s, '500 m', 5.32, cy - 0.08, 0.9, 0.24, 8, C.SLATE_D, false, 'center');
  txt(s, '300 m', 5.82, cy - 0.08, 0.9, 0.24, 8, C.SLATE_D, false, 'center');

  // Notif bubble
  s.addShape('roundRect', { x: 5.3, y: 4.4, w: 4.3, h: 0.68, fill: { color: 'FFFFFF' }, line: { color: 'E5E7EB', pt: 1 } });
  circle(s, '🍕', 5.42, 4.48, 0.5);
  txt(s, 'La Trattoria', 6.02, 4.5, 3.45, 0.22, 9, '111827', true);
  txt(s, 'Pasás cerca 👀 Tenés 7 sellos — ¡vení a buscar tu premio!', 6.02, 4.72, 3.45, 0.28, 8.5, '6B7280');
}

// ══════════════════════════════════════════════════════════════════════════
// 10 · POR QUÉ NO FUNCIONA EN EL NAVEGADOR
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Navegador vs PWA', 0.5, 0.3);
  txt(s, 'Por qué ciertas funciones\nNO funcionan en el navegador', 0.5, 0.65, 9.0, 1.0, 26, C.WHITE, true);

  const cols = [
    {
      t: '🌐  Navegador común (Chrome/Safari sin instalar)',
      ok: false,
      items: [
        'Geolocalización bloqueada cuando la página está en background',
        'Sin geofencing (no detecta "entrada a zona")',
        'Push notifications limitadas o nulas en iOS Safari',
        'No corre código cuando el usuario cierra el navegador',
        'Sin acceso al lector NFC en iPhone',
      ],
    },
    {
      t: '✅  PWA instalada + Google/Apple Wallet (Calificar)',
      ok: true,
      items: [
        'Service Worker corre en background aunque cierre el browser',
        'Geolocation API + SW = geofencing sin App Store',
        'Web Push API funciona en Android Chrome natively',
        'NFC en Android Chrome vía Web NFC API',
        'Tarjeta en Wallet envía sus propias notificaciones nativas',
      ],
    },
  ];
  cols.forEach((col, i) => {
    const x = 0.48 + i * 4.82;
    const w = 4.58;
    card(s, x, 1.72, w, 3.95, i === 0 ? '180808' : '081808');
    s.addShape('rect', { x, y: 1.72, w, h: 0.44, fill: { color: i === 0 ? '7F1D1D' : '14532D', transparency: 40 }, line: { color: i === 0 ? '7F1D1D' : '14532D', transparency: 40, pt: 0 } });
    txt(s, col.t, x + 0.15, 1.76, w - 0.28, 0.36, 10.5, i === 0 ? C.RED : C.GREEN, true);
    col.items.forEach((item, j) => {
      txt(s, (i === 0 ? '✗  ' : '✓  ') + item, x + 0.18, 2.28 + j * 0.62, w - 0.32, 0.56, 11, i === 0 ? C.RED : C.GREEN);
    });
  });

  card(s, 0.48, 5.75, 9.62, 0.38, C.CARD2);
  txt(s, 'Por eso Calificar usa PWA + Service Worker: el cliente instala la tarjeta una sola vez y el sistema puede notificarlo, localizarlo y registrar sellos NFC — sin publicar en ningún store.', 0.68, 5.79, 9.22, 0.3, 10.5, C.SLATE);
}

// ══════════════════════════════════════════════════════════════════════════
// 11 · SEGURIDAD
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Seguridad', 0.5, 0.3);
  txt(s, 'No se puede hacer trampa:\n6 capas de protección', 0.5, 0.65, 9.0, 1.0, 26, C.WHITE, true);

  const sec = [
    { e: '🔑', t: 'Token de sello único',         d: 'JWT firmado con clave privada. El mismo toque nunca puede sellar dos veces.' },
    { e: '🛡️', t: 'Validación 100% server-side',  d: 'El cliente no puede modificar su puntaje. Todo se valida en el servidor.' },
    { e: '⏱️', t: 'Cooldown de 24 horas',          d: '1 sello máximo por día por cliente. El sistema bloquea el segundo intento.' },
    { e: '🎫', t: 'Cupones de uso único',          d: 'Código encriptado que se invalida al canjearse. No se puede reutilizar.' },
    { e: '👤', t: 'Un teléfono = una tarjeta',     d: 'No se pueden crear dos tarjetas con el mismo número de teléfono.' },
    { e: '🔒', t: 'Solo empleados pueden sellar',  d: 'La URL de sello requiere login del negocio. El cliente no puede autosellarse.' },
  ];
  sec.forEach((f, i) => {
    const x = 0.45 + (i % 2) * 4.82;
    const y = 1.72 + Math.floor(i / 2) * 1.32;
    card(s, x, y, 4.58, 1.18);
    circle(s, f.e, x + 0.16, y + 0.36, 0.44);
    txt(s, f.t, x + 0.74, y + 0.12, 3.66, 0.36, 12, C.WHITE, true);
    txt(s, f.d, x + 0.74, y + 0.5, 3.66, 0.62, 10.5, C.SLATE);
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 12 · PLANES
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  tag(s, 'Planes y Precios', 0.5, 0.3);
  txt(s, 'Empezás gratis,\nescalás cuando querés', 0.5, 0.65, 9.0, 1.0, 26, C.WHITE, true);

  const plans = [
    { name: 'Starter', price: '$9.99', sub: 'USD / mes', hl: false,
      feats: ['1 programa de fidelidad', 'Notificaciones push ilimitadas', 'Cartel NFC + QR para el mostrador', 'Panel con estadísticas en tiempo real', 'Exportar clientes (nombre + teléfono)', 'Soporte en español'] },
    { name: 'Pro', price: '$19.99', sub: 'USD / mes', hl: true,
      feats: ['Hasta 3 programas de fidelidad', 'Campañas de cumpleaños automáticas', 'Formulario de registro personalizable', 'Cupones únicos al completar la tarjeta', 'Zonas de geo-notificación', 'Soporte prioritario'] },
    { name: 'Ultimate', price: '$49.99', sub: 'USD / mes', hl: false,
      feats: ['Programas ilimitados', 'Sucursales ilimitadas', 'Múltiples usuarios por negocio', 'Geo-zonas ilimitadas', 'Acceso a API + integraciones', 'Soporte dedicado'] },
  ];
  plans.forEach((p, i) => {
    const x = 0.48 + i * 3.1;
    card(s, x, 1.72, 2.95, 4.05, p.hl ? C.VIO : C.CARD);
    if (p.hl) {
      s.addShape('roundRect', { x: x + 0.55, y: 1.62, w: 1.84, h: 0.26, fill: { color: C.AMBER }, line: { color: C.AMBER, pt: 0 } });
      txt(s, 'MÁS POPULAR', x + 0.55, 1.62, 1.84, 0.26, 7.5, '000000', true, 'center');
    }
    txt(s, p.name, x + 0.18, 1.86, 2.6, 0.4, 18, C.WHITE, true);
    txt(s, p.price, x + 0.18, 2.3, 1.8, 0.65, 32, p.hl ? C.WHITE : C.VIO_L, true);
    txt(s, p.sub, x + 0.18, 3.0, 2.6, 0.26, 9.5, p.hl ? 'EDE9FE' : C.SLATE_D);
    p.feats.forEach((f, j) => {
      txt(s, `✓  ${f}`, x + 0.18, 3.34 + j * 0.38, 2.6, 0.34, 10.5, p.hl ? 'EDE9FE' : C.WHITE);
    });
  });
  txt(s, '14 días gratis en todos los planes · Sin tarjeta de crédito', 0.5, 5.85, 9.12, 0.28, 11, C.SLATE_D, false, 'center');
}

// ══════════════════════════════════════════════════════════════════════════
// 13 · CIERRE
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds();
  s.addShape('ellipse', { x: -2.2, y: -1.8, w: 6.5, h: 6.5, fill: { color: C.VIO, transparency: 88 }, line: { color: C.VIO, transparency: 88, pt: 0 } });
  s.addShape('ellipse', { x: 7.5, y: 2.2, w: 5.0, h: 5.0, fill: { color: C.VIO_L, transparency: 92 }, line: { color: C.VIO_L, transparency: 92, pt: 0 } });

  txt(s, '¿Demo en vivo?', 0.5, 1.02, 9.0, 1.05, 56, C.WHITE, true, 'center');
  txt(s, 'calificar.com.ar/fidelizacion', 0.5, 2.22, 9.0, 0.54, 22, C.VIO_L, false, 'center');
  txt(s, '14 días gratis · Sin tarjeta de crédito · Soporte en español', 0.5, 2.9, 9.0, 0.42, 14, C.SLATE, false, 'center');
  txt(s, '💬  WhatsApp: wa.me/5491123867934', 0.5, 3.68, 9.0, 0.48, 15, C.GREEN, true, 'center');

  const tech = ['Next.js 15', 'Supabase', 'Google Wallet API', 'Web Push API', 'Web NFC API', 'PWA / Service Worker'];
  const totalW = tech.reduce((a, t2) => a + t2.length * 0.092 + 0.72, 0);
  let tX = (10 - totalW) / 2;
  tech.forEach(t2 => {
    const w = t2.length * 0.092 + 0.72;
    s.addShape('roundRect', { x: tX, y: 4.62, w, h: 0.28, fill: { color: C.SLATE_D, transparency: 60 }, line: { color: C.SLATE, transparency: 50, pt: 1 } });
    txt(s, t2, tX, 4.62, w, 0.28, 9, C.SLATE, false, 'center');
    tX += w + 0.12;
  });
  txt(s, 'Calificar · En Red Consultora · Argentina', 0.5, 5.22, 9.0, 0.28, 10, C.SLATE_D, false, 'center');
}

// ── OUTPUT ─────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: 'calificar-fidelizacion-v3.pptx' })
  .then(() => console.log('\n✅  calificar-fidelizacion-v3.pptx generado\n'))
  .catch(e => { console.error(e); process.exit(1); });
