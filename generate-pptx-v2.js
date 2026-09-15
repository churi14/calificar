'use strict';
// node generate-pptx-v2.js
// npm install pptxgenjs   (si no está)

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
pres.layout = 'LAYOUT_16x9';

// ── helpers ────────────────────────────────────────────────────────────────
function ds(p) {
  const s = p.addSlide();
  s.background = { color: C.BG };
  return s;
}
function tag(s, txt, x, y) {
  const w = txt.length * 0.095 + 0.5;
  s.addShape('roundRect', { x, y, w, h: 0.28, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 35, pt: 1 } });
  s.addText(txt.toUpperCase(), { x, y, w, h: 0.28, fontSize: 7.5, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}
function h1(s, txt, x, y, w, size) {
  s.addText(txt, { x, y, w, h: 1.5, fontSize: size || 30, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
}
function card(s, x, y, w, h, col) {
  s.addShape('rect', { x, y, w, h, fill: { color: col || C.CARD }, line: { color: 'FFFFFF', transparency: 88, pt: 1 } });
}
function pill(s, txt, x, y, col) {
  const w = txt.length * 0.092 + 0.42;
  s.addShape('roundRect', { x, y, w, h: 0.26, fill: { color: col || C.GREEN, transparency: 70 }, line: { color: col || C.GREEN, transparency: 40, pt: 1 } });
  s.addText(txt, { x, y, w, h: 0.26, fontSize: 8, bold: true, color: col || C.GREEN, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// Dibuja un phone frame y devuelve el area interior {x,y,w,h}
function phone(s, px, py, pw, ph, bkgColor) {
  const r = 0.22;
  s.addShape('roundRect', { x: px - 0.04, y: py - 0.04, w: pw + 0.08, h: ph + 0.08,
    fill: { color: '1E293B' }, line: { color: '334155', pt: 2 } });
  s.addShape('rect', { x: px, y: py, w: pw, h: ph, fill: { color: bkgColor || C.BG }, line: { color: bkgColor || C.BG, pt: 0 } });
  // notch
  s.addShape('roundRect', { x: px + pw/2 - 0.32, y: py + 0.04, w: 0.64, h: 0.13,
    fill: { color: '0F172A' }, line: { color: '0F172A', pt: 0 } });
  return { x: px, y: py + 0.22, w: pw, h: ph - 0.3 };
}

// ══════════════════════════════════════════════════════════════════════════
// 01 · PORTADA
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  s.addShape('ellipse', { x: 6.5, y: -1.8, w: 6, h: 6, fill: { color: C.VIO, transparency: 85 }, line: { color: C.VIO, transparency: 85, pt: 0 } });
  s.addShape('ellipse', { x: -1.5, y: 4, w: 3.5, h: 3.5, fill: { color: C.VIO_L, transparency: 90 }, line: { color: C.VIO_L, transparency: 90, pt: 0 } });
  tag(s, 'Calificar · Sistema de Fidelización', 0.6, 1.0);
  s.addText('Cómo funciona\ntodo el sistema', { x: 0.6, y: 1.42, w: 9.0, h: 2.5, fontSize: 54, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });
  s.addText('Google Wallet · NFC · Geolocalización · Push Notifications · Panel de Admin', { x: 0.6, y: 4.08, w: 9.0, h: 0.42, fontSize: 13, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Presentación técnica · Calificar.com.ar', { x: 0.6, y: 5.18, w: 5.0, h: 0.28, fontSize: 9.5, color: C.SLATE_D, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// 02 · MAPA DEL SISTEMA (overview)
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Visión General', 0.6, 0.32);
  h1(s, 'El ecosistema Calificar', 0.6, 0.68, 9.0, 28);

  const nodes = [
    { e: '🏪', t: 'Negocio', d: 'Configura el\nprograma', x: 0.4,  y: 2.1  },
    { e: '📡', t: 'NFC / QR', d: 'Dispara el\nsello',     x: 2.55, y: 2.1  },
    { e: '📱', t: 'Cliente', d: 'Toca o escanea\ndesde su celular', x: 4.7, y: 2.1 },
    { e: '💳', t: 'Wallet', d: 'Tarjeta en\nGoogle Wallet', x: 6.85, y: 2.1 },
    { e: '🏆', t: 'Premio', d: 'Cupón único\nal completar',   x: 8.9, y: 2.1 },
  ];
  nodes.forEach((n, i) => {
    card(s, n.x, n.y, 1.85, 2.42);
    s.addShape('ellipse', { x: n.x + 0.62, y: n.y + 0.18, w: 0.62, h: 0.62, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 30, pt: 1 } });
    s.addText(n.e, { x: n.x + 0.62, y: n.y + 0.18, w: 0.62, h: 0.62, fontSize: 20, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(n.t, { x: n.x + 0.1, y: n.y + 0.92, w: 1.65, h: 0.38, fontSize: 13, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(n.d, { x: n.x + 0.1, y: n.y + 1.32, w: 1.65, h: 0.95, fontSize: 10.5, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'top', isTextBox: true, margin: 0 });
    if (i < 4) s.addText('→', { x: n.x + 1.85, y: n.y + 1.0, w: 0.7, h: 0.42, fontSize: 20, color: C.VIO_L, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  });

  const tags2 = [
    { t: 'Servidor valida', x: 3.3, y: 4.72 },
    { t: 'Token único', x: 5.5, y: 4.72 },
    { t: 'Push notification', x: 7.6, y: 4.72 },
  ];
  tags2.forEach(t2 => pill(s, t2.t, t2.x, t2.y, C.VIO_L));

  card(s, 0.4, 4.55, 9.52, 0.85, C.CARD2);
  s.addText('Detrás de cada sello: Supabase registra la transacción · Servidor genera token de seguridad · Se detecta si se alcanzó un hito o la meta final', {
    x: 0.6, y: 4.62, w: 9.12, h: 0.7, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 03 · REGISTRO DEL CLIENTE (mockup celular)
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Registro del Cliente', 0.5, 0.32);
  h1(s, 'De 0 a tarjeta digital\nen 30 segundos', 0.5, 0.68, 4.6, 24);

  const steps = [
    { n: '1', t: 'Escanea el QR', d: 'Con la cámara nativa del celular. Sin descargar ninguna app.' },
    { n: '2', t: 'Completa sus datos', d: 'Nombre y teléfono. El formulario es personalizable por negocio.' },
    { n: '3', t: 'Guarda en Wallet', d: 'Un toque y la tarjeta queda en Google Wallet (o Apple Wallet próximamente).' },
  ];
  steps.forEach((st, i) => {
    const y = 1.95 + i * 1.08;
    s.addShape('ellipse', { x: 0.5, y: y + 0.08, w: 0.42, h: 0.42, fill: { color: C.VIO, transparency: 30 }, line: { color: C.VIO_L, transparency: 20, pt: 1 } });
    s.addText(st.n, { x: 0.5, y: y + 0.08, w: 0.42, h: 0.42, fontSize: 13, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(st.t, { x: 1.05, y: y + 0.06, w: 3.7, h: 0.3, fontSize: 13, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(st.d, { x: 1.05, y: y + 0.38, w: 3.7, h: 0.6, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });

  // Phone mockup — pantalla de registro
  const { x: px, y: py, w: pw } = phone(s, 5.55, 0.22, 3.8, 5.22, 'FFFFFF');

  // Header negocio
  s.addShape('rect', { x: px, y: py, w: pw, h: 0.72, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addShape('ellipse', { x: px + pw/2 - 0.28, y: py + 0.12, w: 0.56, h: 0.56, fill: { color: 'FFFFFF', transparency: 20 }, line: { color: 'FFFFFF', transparency: 20, pt: 0 } });
  s.addText('🍕', { x: px + pw/2 - 0.28, y: py + 0.12, w: 0.56, h: 0.56, fontSize: 18, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('La Trattoria', { x: px + 0.62, y: py + 0.18, w: pw - 0.72, h: 0.35, fontSize: 11, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Programa de fidelidad', { x: px + 0.62, y: py + 0.49, w: pw - 0.72, h: 0.22, fontSize: 8, color: 'EDE9FE', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });

  // Form fields
  s.addText('Tu nombre', { x: px + 0.18, y: py + 0.85, w: pw - 0.36, h: 0.22, fontSize: 8, bold: true, color: '6B7280', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addShape('roundRect', { x: px + 0.18, y: py + 1.08, w: pw - 0.36, h: 0.36, fill: { color: 'F9FAFB' }, line: { color: 'E5E7EB', pt: 1 } });
  s.addText('Ej: María García', { x: px + 0.28, y: py + 1.1, w: pw - 0.56, h: 0.3, fontSize: 9, color: 'D1D5DB', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Teléfono (WhatsApp)', { x: px + 0.18, y: py + 1.55, w: pw - 0.36, h: 0.22, fontSize: 8, bold: true, color: '6B7280', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addShape('roundRect', { x: px + 0.18, y: py + 1.78, w: pw - 0.36, h: 0.36, fill: { color: 'F9FAFB' }, line: { color: C.VIO, pt: 1 } });
  s.addText('11 2345-6789', { x: px + 0.28, y: py + 1.8, w: pw - 0.56, h: 0.3, fontSize: 9, color: '111827', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addShape('roundRect', { x: px + 0.18, y: py + 2.32, w: pw - 0.36, h: 0.42, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addText('Registrarme gratis →', { x: px + 0.18, y: py + 2.32, w: pw - 0.36, h: 0.42, fontSize: 10, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  // Wallet badge
  s.addShape('roundRect', { x: px + 0.18, y: py + 2.92, w: pw - 0.36, h: 0.55, fill: { color: '1C1C1E' }, line: { color: '3A3A3C', pt: 1 } });
  s.addText('G Pay', { x: px + 0.3, y: py + 2.96, w: 0.55, h: 0.44, fontSize: 10, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Guardar en Google Wallet', { x: px + 0.88, y: py + 2.96, w: pw - 1.06, h: 0.44, fontSize: 9, color: 'FFFFFF', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });

  s.addText('✓  Sin descargar apps   ✓  Android y iPhone', { x: px, y: py + 3.62, w: pw, h: 0.28, fontSize: 9, color: C.GREEN, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// 04 · GOOGLE WALLET — tarjeta digital
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Google Wallet', 0.5, 0.32);
  h1(s, 'La tarjeta vive en el\ncelular del cliente', 0.5, 0.68, 4.5, 24);

  const info = [
    { e: '☁️', t: 'Siempre disponible', d: 'La tarjeta está en la nube. Nunca se pierde aunque cambie de celular.' },
    { e: '🔔', t: 'Notificaciones nativas', d: 'Google Wallet puede enviar notifs desde la propia tarjeta, sin app.' },
    { e: '✏️', t: 'Actualizable en tiempo real', d: 'Cuando el cliente suma sellos, la tarjeta se actualiza sola.' },
    { e: '🔒', t: 'Firmada por Google', d: 'JWT firmado con clave privada. No se puede falsificar.' },
  ];
  info.forEach((f, i) => {
    const y = 1.92 + i * 0.88;
    s.addShape('ellipse', { x: 0.5, y: y + 0.16, w: 0.36, h: 0.36, fill: { color: C.VIO, transparency: 60 }, line: { color: C.VIO_L, transparency: 40, pt: 1 } });
    s.addText(f.e, { x: 0.5, y: y + 0.16, w: 0.36, h: 0.36, fontSize: 13, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(f.t, { x: 1.0, y: y + 0.06, w: 3.7, h: 0.32, fontSize: 12.5, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(f.d, { x: 1.0, y: y + 0.4, w: 3.7, h: 0.42, fontSize: 10.5, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });

  // Phone + Wallet card mockup
  const { x: px, y: py, w: pw } = phone(s, 5.5, 0.22, 3.9, 5.22, '1C1C1E');

  // Google Wallet UI
  s.addText('Google Wallet', { x: px + 0.12, y: py + 0.08, w: pw - 0.24, h: 0.32, fontSize: 10, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  // Tarjeta de fidelidad (como se ve en Wallet)
  s.addShape('roundRect', { x: px + 0.18, y: py + 0.48, w: pw - 0.36, h: 1.72,
    fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addShape('ellipse', { x: px + pw - 0.85, y: py + 0.38, w: 1.4, h: 1.4,
    fill: { color: 'FFFFFF', transparency: 88 }, line: { color: 'FFFFFF', transparency: 88, pt: 0 } });
  s.addText('🍕', { x: px + 0.28, y: py + 0.58, w: 0.56, h: 0.56, fontSize: 22, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('La Trattoria', { x: px + 0.88, y: py + 0.62, w: pw - 1.1, h: 0.32, fontSize: 12, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Tarjeta de Fidelidad', { x: px + 0.88, y: py + 0.96, w: pw - 1.1, h: 0.24, fontSize: 8.5, color: 'DDD6FE', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });

  // Sellos
  s.addText('TUS SELLOS', { x: px + 0.28, y: py + 1.28, w: pw - 0.56, h: 0.2, fontSize: 7.5, bold: true, color: 'C4B5FD', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  const selloEmojis = ['⭐','⭐','⭐','⭐','⭐','⭐','☆','☆','☆','☆'];
  selloEmojis.forEach((e, i) => {
    s.addText(e, { x: px + 0.28 + i * 0.31, y: py + 1.48, w: 0.28, h: 0.28, fontSize: 14, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  });
  s.addText('6 / 10 · Te faltan 4 para tu pizza gratis 🍕', { x: px + 0.18, y: py + 1.9, w: pw - 0.36, h: 0.22, fontSize: 8, color: 'EDE9FE', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  // Barcode
  s.addShape('rect', { x: px + 0.48, y: py + 2.35, w: pw - 0.96, h: 0.62, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', pt: 0 } });
  for (let i = 0; i < 28; i++) {
    const bw = [0.04, 0.08, 0.06, 0.04, 0.1][i % 5];
    const bx = px + 0.52 + i * 0.1;
    if (bx + bw < px + pw - 0.52) {
      s.addShape('rect', { x: bx, y: py + 2.38, w: bw, h: 0.52, fill: { color: i % 3 === 0 ? '111827' : '1F2937' }, line: { color: 'FFFFFF', transparency: 100, pt: 0 } });
    }
  }
  s.addText('Mostrá este código para canjear tu premio', { x: px + 0.18, y: py + 3.05, w: pw - 0.36, h: 0.28, fontSize: 8, color: '9CA3AF', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  pill(s, 'Funciona sin internet', 5.72, 5.35, C.GREEN);
  pill(s, 'Se actualiza solo', 7.4, 5.35, C.VIO_L);
}

// ══════════════════════════════════════════════════════════════════════════
// 05 · SELLO NFC (cómo se sella con el celular)
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Tecnología NFC', 0.5, 0.32);
  h1(s, 'El sello: cliente apoya\nel celular y listo', 0.5, 0.68, 4.5, 24);

  const pasos = [
    { e: '📍', t: 'El cartel NFC está en el mostrador', col: C.VIO },
    { e: '📲', t: 'El cliente apoya su celular (< 4 cm)', col: C.BLUE },
    { e: '⚡', t: 'El servidor registra el sello al instante', col: C.GREEN },
    { e: '🎫', t: 'Se genera un token único e irrepetible', col: C.AMBER },
  ];
  pasos.forEach((p, i) => {
    const y = 1.92 + i * 0.88;
    s.addShape('rect', { x: 0.72, y: y + 0.62, w: 0.02, h: 0.28, fill: { color: p.col, transparency: 55 }, line: { color: p.col, transparency: 55, pt: 0 } });
    s.addShape('ellipse', { x: 0.5, y: y + 0.13, w: 0.42, h: 0.42, fill: { color: p.col, transparency: 55 }, line: { color: p.col, transparency: 30, pt: 1 } });
    s.addText(p.e, { x: 0.5, y: y + 0.13, w: 0.42, h: 0.42, fontSize: 14, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(p.t, { x: 1.05, y: y + 0.18, w: 3.9, h: 0.36, fontSize: 13, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  card(s, 0.5, 5.0, 4.5, 0.48, C.CARD2);
  s.addText('También funciona con QR si el celular no tiene NFC', { x: 0.62, y: 5.04, w: 4.25, h: 0.38, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });

  // Phone mockup — pantalla de stamp exitoso
  const { x: px, y: py, w: pw } = phone(s, 5.5, 0.22, 3.9, 5.22, 'FFFFFF');

  s.addShape('ellipse', { x: px + pw/2 - 0.58, y: py + 0.5, w: 1.16, h: 1.16,
    fill: { color: '7C3AED', transparency: 88 }, line: { color: C.VIO, transparency: 50, pt: 2 } });
  s.addText('✅', { x: px + pw/2 - 0.58, y: py + 0.5, w: 1.16, h: 1.16, fontSize: 38, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  s.addText('¡Sello sumado!', { x: px + 0.1, y: py + 1.82, w: pw - 0.2, h: 0.48, fontSize: 18, bold: true, color: '111827', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('7 sellos', { x: px + 0.1, y: py + 2.38, w: pw - 0.2, h: 0.55, fontSize: 36, bold: true, color: C.VIO, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Meta: 10', { x: px + 0.1, y: py + 2.95, w: pw - 0.2, h: 0.28, fontSize: 11, color: '6B7280', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  s.addShape('rect', { x: px + 0.18, y: py + 3.38, w: pw - 0.36, h: 0.16, fill: { color: 'F3F4F6' }, line: { color: 'F3F4F6', pt: 0 } });
  s.addShape('rect', { x: px + 0.18, y: py + 3.38, w: (pw - 0.36) * 0.7, h: 0.16, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addText('Te faltan 3 sellos para tu pizza gratis 🔥', { x: px + 0.1, y: py + 3.62, w: pw - 0.2, h: 0.3, fontSize: 9, color: '6B7280', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addShape('roundRect', { x: px + 0.18, y: py + 4.02, w: pw - 0.36, h: 0.38, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addText('Ver mi tarjeta →', { x: px + 0.18, y: py + 4.02, w: pw - 0.36, h: 0.38, fontSize: 10, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// 06 · PANEL DE ADMIN — overview
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Panel del Negocio', 0.5, 0.32);
  h1(s, 'El negocio tiene\ncontrol total', 0.5, 0.68, 4.5, 24);

  const menu = [
    { e: '📊', t: 'Hoy', d: 'Sellos y visitas del día actual' },
    { e: '👥', t: 'Clientes', d: 'Lista, búsqueda y detalle de cada cliente' },
    { e: '💳', t: 'Tarjeta', d: 'Configurar logo, colores, hitos y premio' },
    { e: '📤', t: 'Exportar', d: 'Descargar base de datos de clientes' },
    { e: '🔔', t: 'Notifs', d: 'Enviar push a todos o por segmento' },
  ];
  menu.forEach((m, i) => {
    const y = 1.92 + i * 0.68;
    s.addShape('ellipse', { x: 0.5, y: y + 0.1, w: 0.38, h: 0.38, fill: { color: C.VIO, transparency: 60 }, line: { color: C.VIO_L, transparency: 40, pt: 1 } });
    s.addText(m.e, { x: 0.5, y: y + 0.1, w: 0.38, h: 0.38, fontSize: 13, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(m.t, { x: 1.02, y: y + 0.05, w: 1.2, h: 0.3, fontSize: 12, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(m.d, { x: 2.26, y: y + 0.06, w: 2.2, h: 0.3, fontSize: 10.5, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  // Desktop mockup del admin panel
  s.addShape('rect', { x: 4.75, y: 0.22, w: 5.15, h: 3.65, fill: { color: C.CARD }, line: { color: '334155', pt: 2 } });
  s.addShape('rect', { x: 4.75, y: 0.22, w: 5.15, h: 0.28, fill: { color: '1E293B' }, line: { color: '1E293B', pt: 0 } });
  ['EF4444','F59E0B','22C55E'].forEach((col, i) => {
    s.addShape('ellipse', { x: 4.88 + i * 0.22, y: 0.28, w: 0.1, h: 0.1, fill: { color: col }, line: { color: col, pt: 0 } });
  });
  s.addText('calificar.com.ar/negocio', { x: 5.2, y: 0.23, w: 3.5, h: 0.24, fontSize: 7.5, color: '64748B', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  // Sidebar
  s.addShape('rect', { x: 4.75, y: 0.5, w: 1.1, h: 3.37, fill: { color: '0A0F1E' }, line: { color: '0A0F1E', pt: 0 } });
  const navItems = ['📊 Hoy','👥 Clientes','💳 Tarjeta','📤 Exportar','🔔 Notifs'];
  navItems.forEach((n, i) => {
    if (i === 0) s.addShape('rect', { x: 4.75, y: 0.5 + i * 0.6, w: 1.1, h: 0.52, fill: { color: C.VIO, transparency: 70 }, line: { color: C.VIO, transparency: 70, pt: 0 } });
    s.addText(n, { x: 4.78, y: 0.54 + i * 0.6, w: 1.0, h: 0.42, fontSize: 8.5, color: i === 0 ? C.WHITE : C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  // Stats cards
  const stats2 = [{ l: 'SELLOS HOY', v: '24' }, { l: 'CLIENTES', v: '138' }, { l: 'PREMIOS', v: '12' }];
  stats2.forEach((st, i) => {
    const bx = 5.98 + i * 1.28;
    s.addShape('roundRect', { x: bx, y: 0.55, w: 1.18, h: 0.75, fill: { color: '0F1628' }, line: { color: '1E293B', pt: 1 } });
    s.addText(st.l, { x: bx + 0.06, y: 0.6, w: 1.06, h: 0.22, fontSize: 6.5, bold: true, color: C.SLATE_D, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(st.v, { x: bx + 0.06, y: 0.84, w: 1.06, h: 0.4, fontSize: 26, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  // Grafico de barras simple
  s.addShape('rect', { x: 5.88, y: 1.42, w: 3.9, h: 1.28, fill: { color: '0F1628' }, line: { color: '1E293B', pt: 1 } });
  s.addText('Actividad últimos 7 días', { x: 5.92, y: 1.46, w: 3.82, h: 0.22, fontSize: 7.5, bold: true, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  const bars = [0.55, 0.72, 0.48, 0.85, 0.62, 0.92, 0.78];
  bars.forEach((h2, i) => {
    const bx2 = 5.96 + i * 0.52;
    const bh2 = h2 * 0.7;
    s.addShape('roundRect', { x: bx2, y: 2.44 - bh2, w: 0.34, h: bh2, fill: { color: C.VIO, transparency: 30 }, line: { color: C.VIO, transparency: 30, pt: 0 } });
  });

  // Tabla clientes
  s.addShape('rect', { x: 5.88, y: 2.82, w: 3.9, h: 1.28, fill: { color: '0F1628' }, line: { color: '1E293B', pt: 1 } });
  s.addText('Clientes recientes', { x: 5.92, y: 2.86, w: 3.82, h: 0.22, fontSize: 7.5, bold: true, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  const clientes = [['María G.','7 sellos','Hoy'],['Carlos R.','3 sellos','Ayer'],['Ana P.','10 ⭐','Hoy']];
  clientes.forEach((c2, i) => {
    const cy = 3.12 + i * 0.3;
    s.addText(c2[0], { x: 5.96, y: cy, w: 1.2, h: 0.28, fontSize: 8, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(c2[1], { x: 7.2, y: cy, w: 1.3, h: 0.28, fontSize: 8, color: i === 2 ? C.AMBER : C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(c2[2], { x: 8.52, y: cy, w: 1.2, h: 0.28, fontSize: 8, color: C.GREEN, fontFace: 'Calibri', align: 'right', valign: 'middle', isTextBox: true, margin: 0 });
  });

  // Pie del desktop
  s.addShape('rect', { x: 4.75, y: 3.87, w: 5.15, h: 0.28, fill: { color: '0A0F1E' }, line: { color: '0A0F1E', pt: 0 } });
  s.addShape('rect', { x: 4.75, y: 4.15, w: 5.15, h: 0.72, fill: { color: '0A0F1E' }, line: { color: '0A0F1E', pt: 0 } });
  s.addShape('roundRect', { x: 5.8, y: 4.25, w: 3.1, h: 0.52, fill: { color: '101010' }, line: { color: '333333', pt: 2 } });
  s.addText('Monitor / soporte del escritorio', { x: 5.8, y: 4.25, w: 3.1, h: 0.52, fontSize: 8, color: '555555', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// 07 · PANEL ADMIN — clientes detalle
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Panel del Negocio · Clientes', 0.5, 0.32);
  h1(s, 'Vista completa\nde cada cliente', 0.5, 0.68, 4.5, 24);

  const cols = [
    { t: 'CLIENTE',   w: 1.8 },
    { t: 'TELÉFONO',  w: 1.4 },
    { t: 'SELLOS',    w: 0.9 },
    { t: 'ÚLTIMA VISITA', w: 1.3 },
    { t: 'ESTADO',    w: 0.9 },
  ];
  const rows = [
    ['María García',   '11 2345-6789', '7 / 10', '15 Sep 2026', '🟢 Activo'],
    ['Carlos Ruiz',    '11 9876-5432', '3 / 10', '14 Sep 2026', '🟢 Activo'],
    ['Ana Pérez',      '11 5555-1234', '10 / 10','13 Sep 2026', '🏆 Premio'],
    ['Lucas Moreno',   '11 1111-2222', '0 / 10', '02 Ago 2026', '⚪ Inactivo'],
    ['Sofía López',    '11 3333-4444', '5 / 10', '10 Sep 2026', '🟢 Activo'],
  ];

  card(s, 0.45, 1.82, 9.6, 3.75, C.CARD);
  // Header tabla
  s.addShape('rect', { x: 0.45, y: 1.82, w: 9.6, h: 0.4, fill: { color: C.CARD2 }, line: { color: C.CARD2, pt: 0 } });
  let cx = 0.6;
  cols.forEach(col => {
    s.addText(col.t, { x: cx, y: 1.86, w: col.w, h: 0.3, fontSize: 8, bold: true, color: C.SLATE_D, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    cx += col.w + 0.2;
  });
  rows.forEach((row, ri) => {
    const ry = 2.32 + ri * 0.6;
    if (ri % 2 === 0) s.addShape('rect', { x: 0.45, y: ry, w: 9.6, h: 0.56, fill: { color: '0A0F1E', transparency: 50 }, line: { color: '0A0F1E', transparency: 50, pt: 0 } });
    let rx = 0.6;
    row.forEach((cell, ci) => {
      const colW = cols[ci].w;
      const isStatus = ci === 4;
      const isPremio = cell.includes('Premio');
      s.addText(cell, { x: rx, y: ry + 0.1, w: colW + 0.15, h: 0.34, fontSize: 10.5,
        color: isPremio ? C.AMBER : (ci === 2 ? C.VIO_L : isStatus ? C.GREEN : C.WHITE),
        fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0,
        bold: ci === 0,
      });
      rx += colW + 0.2;
    });
  });

  // Barra acciones
  card(s, 0.45, 5.65, 9.6, 0.42, C.CARD2);
  s.addText('138 clientes totales · 94 activos · 12 premios canjeados', { x: 0.65, y: 5.7, w: 6.0, h: 0.32, fontSize: 10.5, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addShape('roundRect', { x: 7.8, y: 5.68, w: 2.1, h: 0.35, fill: { color: C.VIO, transparency: 60 }, line: { color: C.VIO_L, transparency: 40, pt: 1 } });
  s.addText('📤  Exportar CSV', { x: 7.8, y: 5.68, w: 2.1, h: 0.35, fontSize: 9.5, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// 08 · PUSH NOTIFICATIONS + GEOLOCALIZACIÓN
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Notificaciones & Geolocalización', 0.5, 0.32);
  h1(s, 'Llegar al cliente\nantes de entrar al local', 0.5, 0.68, 4.6, 24);

  const items = [
    { e: '🔔', t: 'Push Notifications', d: 'El negocio puede enviar promos a todos sus clientes o a un segmento. Llegan como notificación del celular.' },
    { e: '📍', t: 'Geo-zona', d: 'Se define un radio alrededor del local. Cuando el cliente entra en esa zona recibe "Pasás cerca, ¡tenés 3 sellos acumulados!"' },
    { e: '🎂', t: 'Cumpleaños', d: 'El sistema manda automáticamente una notificación de feliz cumpleaños con el nombre del negocio.' },
  ];
  items.forEach((m, i) => {
    const y = 1.88 + i * 1.12;
    card(s, 0.48, y, 4.5, 0.98);
    s.addShape('ellipse', { x: 0.62, y: y + 0.26, w: 0.46, h: 0.46, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 30, pt: 1 } });
    s.addText(m.e, { x: 0.62, y: y + 0.26, w: 0.46, h: 0.46, fontSize: 16, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(m.t, { x: 1.22, y: y + 0.1, w: 3.5, h: 0.32, fontSize: 12.5, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(m.d, { x: 1.22, y: y + 0.44, w: 3.5, h: 0.48, fontSize: 10.5, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });

  // Geo viz (mapa simplificado)
  card(s, 5.4, 0.5, 4.3, 5.0, C.CARD);
  s.addText('Zona de notificación', { x: 5.55, y: 0.6, w: 4.0, h: 0.32, fontSize: 11, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  s.addShape('ellipse', { x: 5.88, y: 1.05, w: 3.62, h: 3.62, fill: { color: C.VIO, transparency: 92 }, line: { color: C.VIO_L, transparency: 65, pt: 1 } });
  s.addShape('ellipse', { x: 6.32, y: 1.49, w: 2.74, h: 2.74, fill: { color: C.VIO, transparency: 85 }, line: { color: C.VIO_L, transparency: 50, pt: 1 } });
  s.addShape('ellipse', { x: 6.78, y: 1.95, w: 1.82, h: 1.82, fill: { color: C.VIO, transparency: 75 }, line: { color: C.VIO_L, transparency: 35, pt: 1 } });
  s.addShape('ellipse', { x: 7.24, y: 2.41, w: 0.9, h: 0.9, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 20, pt: 1 } });
  s.addText('🏪', { x: 7.35, y: 2.52, w: 0.68, h: 0.68, fontSize: 26, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('🚶', { x: 6.1, y: 2.28, w: 0.56, h: 0.56, fontSize: 22, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('📱', { x: 6.12, y: 2.85, w: 0.46, h: 0.46, fontSize: 18, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  // Notif bubble
  s.addShape('roundRect', { x: 5.55, y: 4.8, w: 3.98, h: 0.58, fill: { color: 'FFFFFF' }, line: { color: 'E5E7EB', pt: 1 } });
  s.addText('🍕', { x: 5.65, y: 4.84, w: 0.42, h: 0.48, fontSize: 18, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('La Trattoria', { x: 6.1, y: 4.86, w: 3.3, h: 0.2, fontSize: 8, bold: true, color: '111827', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Pasás cerca 👀 Tenés 7 sellos acumulados', { x: 6.1, y: 5.06, w: 3.3, h: 0.22, fontSize: 8, color: '6B7280', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// 09 · POR QUÉ NO FUNCIONA EN NAVEGADOR
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Técnica Importante', 0.5, 0.32);
  h1(s, 'Por qué la geolocalización\nNO funciona en el navegador', 0.5, 0.68, 9.0, 24);

  const comparar = [
    {
      titulo: '🌐  Navegador (Chrome/Safari)',
      ok: false,
      items: [
        'Geolocalización bloqueada si la página está en background',
        'Sin acceso a eventos de "entrada a zona" (geofencing)',
        'Push notifications limitadas en iOS Safari',
        'No puede ejecutar código cuando la app está cerrada',
        'Sin acceso al NFC reader en iOS',
      ],
    },
    {
      titulo: '✅  PWA + Service Worker (Calificar)',
      ok: true,
      items: [
        'Service Worker corre en background aunque cierre el navegador',
        'Web Push API funciona en Android (Chrome) correctamente',
        'Geofencing vía Geolocation API combinada con SW',
        'NFC en Android Chrome vía Web NFC API',
        'Se instala como app nativa en el celular (sin app store)',
      ],
    },
  ];

  comparar.forEach((col, i) => {
    const x = 0.48 + i * 4.82;
    const colW = 4.52;
    card(s, x, 1.88, colW, 3.8, i === 0 ? '1A0A0A' : '0A1A0A');
    s.addShape('rect', { x, y: 1.88, w: colW, h: 0.5, fill: { color: i === 0 ? '7F1D1D' : '14532D', transparency: 50 }, line: { color: i === 0 ? '7F1D1D' : '14532D', transparency: 50, pt: 0 } });
    s.addText(col.titulo, { x: x + 0.18, y: 1.92, w: colW - 0.36, h: 0.42, fontSize: 12, bold: true, color: i === 0 ? C.RED : C.GREEN, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    col.items.forEach((item, j) => {
      const prefix = i === 0 ? '✗  ' : '✓  ';
      s.addText(prefix + item, { x: x + 0.2, y: 2.5 + j * 0.6, w: colW - 0.36, h: 0.54, fontSize: 11, color: i === 0 ? C.RED : C.GREEN, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    });
  });

  card(s, 0.48, 5.78, 9.52, 0.42, C.CARD2);
  s.addText('Calificar usa PWA (Progressive Web App) + Service Worker para superar las limitaciones del navegador sin necesitar publicar en App Store', {
    x: 0.65, y: 5.82, w: 9.15, h: 0.34, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 10 · APPLE WALLET — próximamente
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  s.addShape('ellipse', { x: 5.0, y: -1.5, w: 7.5, h: 7.5, fill: { color: C.VIO, transparency: 90 }, line: { color: C.VIO, transparency: 90, pt: 0 } });

  tag(s, 'Próximamente', 0.5, 0.32);
  h1(s, 'Apple Wallet\npara iPhone', 0.5, 0.68, 4.6, 36);

  s.addText('Actualmente la tarjeta funciona en Google Wallet (Android). La integración con Apple Wallet (iOS) está en desarrollo y traerá la misma experiencia a los usuarios de iPhone.', {
    x: 0.5, y: 2.55, w: 4.5, h: 1.1, fontSize: 12, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0,
  });

  const apple = [
    { e: '🍎', t: 'iPhone 6s en adelante' },
    { e: '💳', t: 'Mismo sistema, distinta plataforma' },
    { e: '📡', t: 'NFC funciona igual en iOS y Android' },
    { e: '🔔', t: 'Push notifications nativas en iPhone' },
    { e: '🔒', t: 'PassKit firmado por Apple' },
  ];
  apple.forEach((a, i) => {
    s.addText(`${a.e}  ${a.t}`, { x: 0.5, y: 3.8 + i * 0.38, w: 4.5, h: 0.34, fontSize: 12, color: i < 2 ? C.WHITE : C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  // iPhone mockup con Apple Wallet
  const { x: px, y: py, w: pw } = phone(s, 5.62, 0.22, 3.9, 5.22, 'F2F2F7');

  s.addShape('rect', { x: px, y: py, w: pw, h: 0.5, fill: { color: 'F2F2F7' }, line: { color: 'F2F2F7', pt: 0 } });
  s.addText('Wallet', { x: px, y: py + 0.08, w: pw, h: 0.32, fontSize: 16, bold: true, color: '000000', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  // Apple Wallet card
  s.addShape('roundRect', { x: px + 0.18, y: py + 0.58, w: pw - 0.36, h: 2.0, fill: { color: C.VIO }, line: { color: C.VIO, pt: 0 } });
  s.addShape('ellipse', { x: px + pw - 0.98, y: py + 0.48, w: 1.4, h: 1.4, fill: { color: 'FFFFFF', transparency: 90 }, line: { color: 'FFFFFF', transparency: 90, pt: 0 } });
  s.addText('🍕  La Trattoria', { x: px + 0.3, y: py + 0.72, w: pw - 0.46, h: 0.38, fontSize: 12, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Tarjeta de Fidelidad', { x: px + 0.3, y: py + 1.12, w: pw - 0.46, h: 0.26, fontSize: 9, color: 'DDD6FE', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('⭐⭐⭐⭐⭐⭐☆☆☆☆', { x: px + 0.3, y: py + 1.42, w: pw - 0.46, h: 0.3, fontSize: 13, color: 'FCD34D', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('6 / 10 · Pizza gratis al completar', { x: px + 0.3, y: py + 1.75, w: pw - 0.46, h: 0.24, fontSize: 9, color: 'EDE9FE', fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });

  // Apple logo (aproximado)
  s.addShape('ellipse', { x: px + pw/2 - 0.22, y: py + 2.72, w: 0.44, h: 0.44, fill: { color: 'E5E7EB' }, line: { color: 'E5E7EB', pt: 0 } });
  s.addText('🍎', { x: px + pw/2 - 0.22, y: py + 2.72, w: 0.44, h: 0.44, fontSize: 16, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Wallet', { x: px, y: py + 3.22, w: pw, h: 0.28, fontSize: 10, color: '6B7280', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  pill(s, 'En desarrollo · 2026', 5.95, 5.35, C.AMBER);

  s.addText('Los clientes con iPhone hoy pueden registrarse desde Safari y ver su progreso en web. La tarjeta nativa de Wallet llegará en la próxima versión.', {
    x: 0.5, y: 5.2, w: 4.5, h: 0.62, fontSize: 10, color: C.SLATE_D, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 11 · SEGURIDAD DEL SISTEMA
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Seguridad', 0.5, 0.32);
  h1(s, 'No se puede hacer trampa:\ncómo lo garantizamos', 0.5, 0.68, 9.0, 26);

  const sec = [
    { e: '🔑', t: 'Token de sello único',        d: 'Cada sello genera un JWT firmado con clave privada. El mismo toque no puede sellar dos veces.' },
    { e: '🛡️', t: 'Validación 100% server-side', d: 'El cliente nunca modifica su puntaje desde el celular. Todo pasa por el servidor Supabase.' },
    { e: '⏱️', t: 'Cooldown de 24 horas',         d: 'Un cliente no puede sumar más de un sello por día (configurable). El sistema bloquea el intento.' },
    { e: '🎫', t: 'Cupones de un solo uso',       d: 'Cada cupón de canje tiene un código encriptado único que se invalida al canjearse.' },
    { e: '👤', t: 'Identidad por teléfono',       d: 'Un número de teléfono = una tarjeta activa por programa. No se pueden duplicar.' },
    { e: '🔒', t: 'Solo empleados pueden sellar', d: 'La página de sello requiere login del negocio. El cliente no puede autosellarse.' },
  ];

  sec.forEach((f, i) => {
    const x = 0.45 + (i % 2) * 4.82;
    const y = 1.88 + Math.floor(i / 2) * 1.42;
    card(s, x, y, 4.52, 1.28);
    s.addShape('ellipse', { x: x + 0.16, y: y + 0.38, w: 0.46, h: 0.46, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 30, pt: 1 } });
    s.addText(f.e, { x: x + 0.16, y: y + 0.38, w: 0.46, h: 0.46, fontSize: 16, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(f.t, { x: x + 0.76, y: y + 0.12, w: 3.58, h: 0.38, fontSize: 12, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(f.d, { x: x + 0.76, y: y + 0.52, w: 3.58, h: 0.68, fontSize: 10.5, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 12 · PLANES
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Planes y Precios', 0.5, 0.32);
  h1(s, 'Empezás gratis,\nescalás cuando querés', 0.5, 0.68, 9.0, 26);

  const plans = [
    { name: 'Starter', price: '$9.99', sub: 'USD / mes', hl: false,
      feats: ['1 programa de fidelidad', 'Notificaciones push ilimitadas', 'Cartel NFC + QR para el mostrador', 'Panel con estadísticas', 'Exportar clientes (nombre + tel)', 'Soporte en español'] },
    { name: 'Pro', price: '$19.99', sub: 'USD / mes', hl: true,
      feats: ['Hasta 3 programas de fidelidad', 'Campañas de cumpleaños automáticas', 'Formulario de registro personalizable', 'Cupones únicos al completar', 'Zonas de notificación por geolocalización', 'Soporte prioritario'] },
    { name: 'Ultimate', price: '$49.99', sub: 'USD / mes', hl: false,
      feats: ['Programas ilimitados', 'Sucursales ilimitadas', 'Múltiples usuarios por negocio', 'Geo-zonas ilimitadas', 'Acceso a API + integraciones', 'Soporte dedicado'] },
  ];

  plans.forEach((p, i) => {
    const x = 0.48 + i * 3.1;
    card(s, x, 1.72, 2.92, 4.12, p.hl ? C.VIO : C.CARD);
    if (p.hl) {
      s.addShape('roundRect', { x: x + 0.56, y: 1.62, w: 1.78, h: 0.26, fill: { color: C.AMBER }, line: { color: C.AMBER, pt: 0 } });
      s.addText('MÁS POPULAR', { x: x + 0.56, y: 1.62, w: 1.78, h: 0.26, fontSize: 7.5, bold: true, color: '000000', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    }
    s.addText(p.name, { x: x + 0.18, y: 1.85, w: 2.56, h: 0.42, fontSize: 18, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(p.price, { x: x + 0.18, y: 2.3, w: 1.8, h: 0.65, fontSize: 32, bold: true, color: p.hl ? C.WHITE : C.VIO_L, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(p.sub, { x: x + 0.18, y: 3.0, w: 2.56, h: 0.26, fontSize: 9.5, color: p.hl ? 'EDE9FE' : C.SLATE_D, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    p.feats.forEach((f, j) => {
      s.addText(`✓  ${f}`, { x: x + 0.18, y: 3.35 + j * 0.38, w: 2.56, h: 0.34, fontSize: 10.5, color: p.hl ? 'EDE9FE' : C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    });
  });

  s.addText('14 días gratis en todos los planes · Sin tarjeta de crédito', { x: 0.5, y: 5.9, w: 9.1, h: 0.28, fontSize: 11, color: C.SLATE_D, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// 13 · CIERRE
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  s.addShape('ellipse', { x: -2.0, y: -1.5, w: 6.0, h: 6.0, fill: { color: C.VIO, transparency: 88 }, line: { color: C.VIO, transparency: 88, pt: 0 } });
  s.addShape('ellipse', { x: 7.8, y: 2.5, w: 4.5, h: 4.5, fill: { color: C.VIO_L, transparency: 92 }, line: { color: C.VIO_L, transparency: 92, pt: 0 } });

  s.addText('¿Demo en vivo?', { x: 0.5, y: 1.05, w: 9.0, h: 1.1, fontSize: 56, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('calificar.com.ar/fidelizacion', { x: 0.5, y: 2.28, w: 9.0, h: 0.55, fontSize: 22, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('14 días gratis · Sin tarjeta de crédito · Soporte en español', { x: 0.5, y: 2.98, w: 9.0, h: 0.42, fontSize: 14, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('💬  WhatsApp: wa.me/5491123867934', { x: 0.5, y: 3.72, w: 9.0, h: 0.48, fontSize: 15, color: C.GREEN, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  const tech = ['Next.js 15', 'Supabase', 'Google Wallet API', 'Web Push API', 'Web NFC API', 'PWA'];
  tech.forEach((t2, i) => pill(s, t2, 1.35 + i * 1.48, 4.62, C.SLATE));

  s.addText('Calificar · En Red Consultora · Argentina', { x: 0.5, y: 5.22, w: 9.0, h: 0.28, fontSize: 10, color: C.SLATE_D, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ── OUTPUT ─────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: 'calificar-fidelizacion-v2.pptx' })
  .then(() => console.log('\n✅  calificar-fidelizacion-v2.pptx generado\n'))
  .catch(e => { console.error(e); process.exit(1); });
