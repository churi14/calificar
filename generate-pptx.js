'use strict';
// Correr con: node generate-pptx.js
// (primero instalar: npm install pptxgenjs)

const pptxgen = require('pptxgenjs');

// ─── PALETA ────────────────────────────────────────────────────────────────
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
};

// ─── HELPERS ───────────────────────────────────────────────────────────────
function ds(pres) {
  const s = pres.addSlide();
  s.background = { color: C.BG };
  return s;
}

function tag(s, txt, x, y) {
  const w = txt.length * 0.1 + 0.5;
  s.addShape('roundRect', { x, y, w, h: 0.3, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 35, pt: 1 } });
  s.addText(txt.toUpperCase(), { x, y, w, h: 0.3, fontSize: 8, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

function title(s, txt, x, y, w, size) {
  s.addText(txt, { x, y, w, h: 1.0, fontSize: size || 30, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
}

function card(s, x, y, w, h, color) {
  s.addShape('rect', { x, y, w, h, fill: { color: color || C.CARD }, line: { color: 'FFFFFF', transparency: 88, pt: 1 } });
}

function circle(s, emoji, cx, cy, r) {
  s.addShape('ellipse', { x: cx, y: cy, w: r, h: r, fill: { color: C.VIO, transparency: 55 }, line: { color: C.VIO_L, transparency: 35, pt: 1 } });
  s.addText(emoji, { x: cx, y: cy, w: r, h: r, fontSize: r * 16, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — PORTADA
// ══════════════════════════════════════════════════════════════════════════
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"

{
  const s = ds(pres);
  s.addShape('ellipse', { x: 6.8, y: -1.5, w: 5.0, h: 5.0, fill: { color: C.VIO, transparency: 83 }, line: { color: C.VIO, transparency: 83, pt: 0 } });
  s.addShape('ellipse', { x: -1.2, y: 3.8, w: 3.0, h: 3.0, fill: { color: C.VIO_L, transparency: 88 }, line: { color: C.VIO_L, transparency: 88, pt: 0 } });

  tag(s, 'Calificar · 2025', 0.6, 1.1);

  s.addText('Sistema de\nFidelización Digital', { x: 0.6, y: 1.55, w: 8.8, h: 2.3, fontSize: 52, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0, lineSpacingMultiple: 1.08 });
  s.addText('Tarjetas digitales · NFC · Geolocalización · Google Wallet · Apple Wallet (próximamente)', { x: 0.6, y: 4.0, w: 8.5, h: 0.45, fontSize: 13, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Presentación interna · Calificar.com.ar', { x: 0.6, y: 5.15, w: 5.0, h: 0.3, fontSize: 10, color: C.SLATE_D, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — EL PROBLEMA
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'El Problema', 0.6, 0.32);
  title(s, 'Los programas de fidelidad\ntradicionales tienen demasiada fricción', 0.6, 0.72, 8.8, 27);

  const items = [
    { e: '🗂️', t: 'Tarjetas de papel', d: 'Se pierden, se mojan, se olvidan en casa. El cliente pierde todos sus puntos.' },
    { e: '📱', t: 'Apps que nadie descarga', d: 'Bajísima tasa de adopción. El cliente no instala una app para cada negocio.' },
    { e: '🔢', t: 'Sistemas complejos', d: 'Puntos, niveles, canjes... Nadie entiende cómo funciona y termina sin usarlo.' },
    { e: '👁️', t: 'Sin visibilidad para el negocio', d: 'El negocio no sabe quién volvió, cuándo ni cuántas veces.' },
  ];

  items.forEach((p, i) => {
    const x = 0.55 + (i % 2) * 4.65;
    const y = 1.95 + Math.floor(i / 2) * 1.65;
    card(s, x, y, 4.4, 1.5);
    circle(s, p.e, x + 0.18, y + 0.52, 0.46);
    s.addText(p.t, { x: x + 0.78, y: y + 0.15, w: 3.45, h: 0.38, fontSize: 13, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(p.d, { x: x + 0.78, y: y + 0.55, w: 3.45, h: 0.82, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — LA SOLUCIÓN (2 columnas)
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'La Solución', 0.6, 0.32);

  s.addText('Calificar\nFidelización', { x: 0.6, y: 0.72, w: 4.3, h: 1.6, fontSize: 42, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });
  s.addText('Un programa de puntos completo que vive en el celular del cliente. Sin apps. Sin papel. Sin fricción.', { x: 0.6, y: 2.45, w: 4.1, h: 0.95, fontSize: 13, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });

  const stats = [{ n: '0', l: 'apps que instalar' }, { n: '30s', l: 'para registrarse' }];
  stats.forEach((st, i) => {
    s.addText(st.n, { x: 0.6 + i * 2.1, y: 3.55, w: 1.9, h: 0.75, fontSize: 46, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(st.l, { x: 0.6 + i * 2.1, y: 4.35, w: 1.9, h: 0.35, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });

  card(s, 5.1, 0.42, 4.35, 4.95, C.CARD);
  s.addText('¿Qué incluye?', { x: 5.3, y: 0.62, w: 3.95, h: 0.42, fontSize: 14, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });

  const feats = ['💳  Tarjeta en Google Wallet', '📡  Sello con NFC o QR', '🏆  Cupones únicos al completar', '🔔  Push notifications al celular', '🎂  Campañas de cumpleaños', '📊  Panel de gestión en tiempo real'];
  feats.forEach((f, i) => {
    s.addText(f, { x: 5.3, y: 1.15 + i * 0.62, w: 3.95, h: 0.55, fontSize: 12.5, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — CÓMO FUNCIONA (4 pasos)
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Cómo Funciona', 0.6, 0.32);
  title(s, 'En 4 pasos simples', 0.6, 0.72, 8.8, 30);

  const steps = [
    { n: '01', t: 'Configurás el programa', d: 'Logo, cantidad de sellos y premio. Listo en 5 minutos.' },
    { n: '02', t: 'El cliente se registra', d: 'Escanea el QR del local, completa nombre y teléfono. La tarjeta aparece en su Wallet.' },
    { n: '03', t: 'Suma sellos', d: 'Acerca el celular al NFC o escanea el QR en cada visita.' },
    { n: '04', t: 'Canjea el premio', d: 'Cupón único al llegar a la meta. Se muestra, se canjea, se reinicia.' },
  ];

  steps.forEach((st, i) => {
    const x = 0.32 + i * 2.35;
    card(s, x, 1.55, 2.2, 3.75);
    s.addText(st.n, { x: x + 0.15, y: 1.68, w: 1.9, h: 0.75, fontSize: 40, bold: true, color: C.VIO, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(st.t, { x: x + 0.15, y: 2.55, w: 1.9, h: 0.55, fontSize: 12, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
    s.addText(st.d, { x: x + 0.15, y: 3.15, w: 1.9, h: 1.95, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
    if (i < 3) {
      s.addShape('rect', { x: x + 2.2, y: 3.3, w: 0.15, h: 0.05, fill: { color: C.VIO, transparency: 35 }, line: { color: C.VIO, transparency: 35, pt: 0 } });
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — REGISTRO DEL CLIENTE
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Registro del Cliente', 0.6, 0.32);
  title(s, 'Registrarse tarda 30 segundos', 0.6, 0.72, 8.8, 30);

  const steps = [
    { e: '📲', n: '1', t: 'Escanea el QR', d: 'Con la cámara del celular. No necesita ninguna app instalada.' },
    { e: '✏️', n: '2', t: 'Completa sus datos', d: 'Solo nombre y teléfono. El formulario es rápido y personalizable.' },
    { e: '💳', n: '3', t: 'Guarda la tarjeta', d: 'Con un toque, la tarjeta aparece directamente en Google Wallet.' },
  ];

  steps.forEach((r, i) => {
    const x = 0.48 + i * 3.08;
    card(s, x, 1.55, 2.88, 3.65);
    circle(s, r.e, x + 1.14, 1.78, 0.62);
    s.addText(`Paso ${r.n}`, { x: x + 0.2, y: 2.6, w: 2.48, h: 0.3, fontSize: 10, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(r.t, { x: x + 0.2, y: 2.95, w: 2.48, h: 0.48, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(r.d, { x: x + 0.2, y: 3.48, w: 2.48, h: 1.55, fontSize: 12, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'top', isTextBox: true, margin: 0 });
  });

  s.addText('✓  Sin descargar ninguna app     ✓  Funciona en cualquier Android     ✓  La tarjeta vive en la nube', { x: 0.5, y: 5.27, w: 9.1, h: 0.28, fontSize: 10.5, color: C.GREEN, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — SELLOS NFC
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Tecnología NFC', 0.6, 0.32);

  title(s, 'Sellos rápidos, seguros\ny sin contacto', 0.6, 0.72, 4.4, 25);

  s.addText('¿Qué es NFC?', { x: 0.6, y: 2.1, w: 4.2, h: 0.38, fontSize: 14, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Near Field Communication — tecnología inalámbrica de corto alcance (≤ 4 cm) incorporada en todos los smartphones modernos. Es la misma que usan los pagos sin contacto.', { x: 0.6, y: 2.55, w: 4.2, h: 1.05, fontSize: 12, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });

  const pts = [
    '📍  El cartelito NFC va en el mostrador del negocio',
    '📲  El cliente acerca el celular — el sello se registra al instante',
    '🔒  Cada sello tiene un token único e irrepetible',
    '⚡  Tiempo de registro: menos de 2 segundos',
    '🚫  No se puede falsificar ni duplicar',
  ];
  pts.forEach((p, i) => {
    s.addText(p, { x: 0.6, y: 3.75 + i * 0.32, w: 4.3, h: 0.3, fontSize: 12, color: i === 0 ? C.WHITE : C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  card(s, 5.25, 0.42, 4.25, 4.95, C.CARD);

  s.addShape('ellipse', { x: 6.38, y: 0.82, w: 2.0, h: 2.0, fill: { color: C.VIO, transparency: 58 }, line: { color: C.VIO_L, transparency: 30, pt: 2 } });
  s.addText('📡', { x: 6.38, y: 0.82, w: 2.0, h: 2.0, fontSize: 52, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  s.addText('El cliente acerca\nsu celular al cartel', { x: 5.45, y: 2.98, w: 3.85, h: 0.68, fontSize: 15, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('↓', { x: 5.45, y: 3.72, w: 3.85, h: 0.32, fontSize: 22, color: C.VIO_L, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('El sello se registra\nen tiempo real', { x: 5.45, y: 4.05, w: 3.85, h: 0.68, fontSize: 15, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Sin tocar nada · Sin internet requerido · Instantáneo', { x: 5.45, y: 4.82, w: 3.85, h: 0.3, fontSize: 10, color: C.SLATE_D, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — SEGURIDAD
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Seguridad', 0.6, 0.32);
  title(s, 'Diseñado para no poder\nser abusado', 0.6, 0.72, 8.8, 28);

  const sec = [
    { e: '🔑', t: 'Cupones únicos irrepetibles', d: 'Cada cupón de canje tiene un código encriptado único. No se puede duplicar, reenviar ni reutilizar.' },
    { e: '🛡️', t: 'Validación en el servidor', d: 'Cada sello y canje se valida en tiempo real. El cliente no puede manipular su puntaje desde el celular.' },
    { e: '⏱️', t: 'Token NFC con timestamp', d: 'Cada sello incluye un token temporal que expira. El mismo toque no registra dos sellos.' },
    { e: '👤', t: 'Identidad vinculada al teléfono', d: 'El cliente se registra con su número de teléfono. Un número = una sola tarjeta activa.' },
  ];

  sec.forEach((f, i) => {
    const x = 0.52 + (i % 2) * 4.68;
    const y = 1.95 + Math.floor(i / 2) * 1.65;
    card(s, x, y, 4.42, 1.52);
    circle(s, f.e, x + 0.18, y + 0.52, 0.46);
    s.addText(f.t, { x: x + 0.78, y: y + 0.15, w: 3.47, h: 0.4, fontSize: 13, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(f.d, { x: x + 0.78, y: y + 0.57, w: 3.47, h: 0.82, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — GEOLOCALIZACIÓN
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Geolocalización', 0.6, 0.32);

  title(s, 'Notificaciones cuando\nel cliente está cerca', 0.6, 0.72, 4.4, 25);

  s.addText('¿Qué es la zona de notificación?', { x: 0.6, y: 2.1, w: 4.2, h: 0.38, fontSize: 13, bold: true, color: C.VIO_L, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Es un radio geográfico virtual alrededor del negocio. Cuando el cliente entra en esa zona, recibe una notificación push recordándole que puede sumar un sello.', { x: 0.6, y: 2.55, w: 4.2, h: 1.0, fontSize: 12, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });

  const geo = [
    '📍  El negocio define el radio: 100m, 300m, 500m...',
    '🔔  El cliente recibe la notif solo si tiene sellos activos',
    '📵  Máximo 1 notificación por día para no saturar',
    '✅  El cliente puede desactivarla desde su celular',
  ];
  geo.forEach((g, i) => {
    s.addText(g, { x: 0.6, y: 3.72 + i * 0.37, w: 4.3, h: 0.34, fontSize: 12, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  card(s, 5.25, 0.42, 4.25, 4.95, C.CARD);

  // Concentric circles (map visualization)
  s.addShape('ellipse', { x: 5.98, y: 0.85, w: 2.8, h: 2.8, fill: { color: C.VIO, transparency: 88 }, line: { color: C.VIO_L, transparency: 60, pt: 1 } });
  s.addShape('ellipse', { x: 6.38, y: 1.25, w: 2.0, h: 2.0, fill: { color: C.VIO, transparency: 80 }, line: { color: C.VIO_L, transparency: 45, pt: 1 } });
  s.addShape('ellipse', { x: 6.78, y: 1.65, w: 1.2, h: 1.2, fill: { color: C.VIO, transparency: 60 }, line: { color: C.VIO_L, transparency: 25, pt: 1 } });
  s.addShape('ellipse', { x: 7.24, y: 2.11, w: 0.28, h: 0.28, fill: { color: C.VIO_L }, line: { color: C.VIO_L, transparency: 0, pt: 0 } });
  s.addText('🏪', { x: 7.1, y: 1.97, w: 0.56, h: 0.56, fontSize: 22, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('🚶', { x: 6.08, y: 1.55, w: 0.46, h: 0.46, fontSize: 20, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  s.addText('Radio personalizable\npor cada local', { x: 5.45, y: 3.85, w: 3.85, h: 0.65, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('"Pasás cerca, acordate que tenés 3 sellos"', { x: 5.45, y: 4.6, w: 3.85, h: 0.48, fontSize: 11, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0, italic: true });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — PANEL DE GESTIÓN
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Panel de Gestión', 0.6, 0.32);
  title(s, 'Todo bajo control, en tiempo real', 0.6, 0.72, 8.8, 30);

  const panel = [
    { e: '👥', t: 'Lista de clientes', d: 'Nombre, teléfono, sellos acumulados y fecha de última visita.' },
    { e: '📊', t: 'Estadísticas', d: 'Quién volvió, cuándo y cuántas veces. Frecuencia por cliente.' },
    { e: '🎫', t: 'Gestión de canjes', d: 'Validá cupones con un click. Historial completo de canjes.' },
    { e: '📤', t: 'Exportación', d: 'Descargá tu base de clientes: nombre y teléfono para campañas.' },
    { e: '🔔', t: 'Push notifications', d: 'Enviá notificaciones a todos o a un segmento de clientes.' },
    { e: '⚙️', t: 'Configuración flexible', d: 'Cambiá sellos, premio, colores y logo cuando quieras.' },
  ];

  panel.forEach((f, i) => {
    const x = 0.48 + (i % 3) * 3.08;
    const y = 1.72 + Math.floor(i / 3) * 1.82;
    card(s, x, y, 2.88, 1.65);
    circle(s, f.e, x + 0.2, y + 0.58, 0.46);
    s.addText(f.t, { x: x + 0.8, y: y + 0.2, w: 1.92, h: 0.42, fontSize: 12, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(f.d, { x: x + 0.8, y: y + 0.65, w: 1.92, h: 0.85, fontSize: 10.5, color: C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'top', isTextBox: true, margin: 0 });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — PRÓXIMAMENTE: APPLE WALLET
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  s.addShape('ellipse', { x: 3.0, y: -0.8, w: 8.0, h: 8.0, fill: { color: C.VIO, transparency: 90 }, line: { color: C.VIO, transparency: 90, pt: 0 } });

  tag(s, 'Próximamente', 0.6, 0.35);

  s.addText('Apple Wallet', { x: 0.6, y: 0.92, w: 9.0, h: 1.25, fontSize: 62, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('La tarjeta de fidelización también disponible para iPhone', { x: 0.6, y: 2.28, w: 9.0, h: 0.52, fontSize: 18, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });

  const apple = [
    { e: '🍎', t: 'Compatible con iPhone 6s en adelante' },
    { e: '💳', t: 'Misma tarjeta, mismo sistema, distinta plataforma' },
    { e: '🔄', t: 'El sello NFC funciona igual en iOS y Android' },
    { e: '📬', t: 'Push notifications nativas en iPhone' },
  ];
  apple.forEach((a, i) => {
    const x = 0.65 + (i % 2) * 4.6;
    const y = 3.08 + Math.floor(i / 2) * 0.75;
    s.addText(`${a.e}  ${a.t}`, { x, y, w: 4.3, h: 0.48, fontSize: 14, color: i < 2 ? C.WHITE : C.SLATE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
  });

  s.addText('En desarrollo · Q1 2026', { x: 0.6, y: 5.22, w: 9.0, h: 0.28, fontSize: 10, color: C.SLATE_D, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 11 — PLANES
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  tag(s, 'Planes y Precios', 0.6, 0.32);
  title(s, 'Empezás gratis, escalás cuando querés', 0.6, 0.72, 8.8, 28);

  const plans = [
    { name: 'Starter', price: '$9.99', sub: 'USD / mes', badge: null, hl: false,
      feats: ['1 programa de fidelidad', 'Notificaciones ilimitadas', 'Cartelito NFC + QR', 'Panel de gestión', 'Exportar clientes'] },
    { name: 'Pro', price: '$19.99', sub: 'USD / mes', badge: 'Más popular', hl: true,
      feats: ['Hasta 3 programas', 'Campañas de cumpleaños', 'Formulario personalizable', 'Cupones únicos', 'Zonas de geolocalización'] },
    { name: 'Ultimate', price: '$49.99', sub: 'USD / mes', badge: null, hl: false,
      feats: ['Programas ilimitados', 'Sucursales ilimitadas', 'Múltiples usuarios', 'Geo-zonas ilimitadas', 'API + integración'] },
  ];

  plans.forEach((p, i) => {
    const x = 0.48 + i * 3.08;
    const bgColor = p.hl ? C.VIO : C.CARD;
    card(s, x, 1.48, 2.88, 3.95, bgColor);

    if (p.badge) {
      s.addShape('roundRect', { x: x + 0.52, y: 1.38, w: 1.82, h: 0.27, fill: { color: C.AMBER }, line: { color: C.AMBER, transparency: 0, pt: 0 } });
      s.addText(p.badge.toUpperCase(), { x: x + 0.52, y: 1.38, w: 1.82, h: 0.27, fontSize: 8, bold: true, color: '000000', fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    }

    s.addText(p.name, { x: x + 0.18, y: 1.62, w: 2.52, h: 0.48, fontSize: 19, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(p.price, { x: x + 0.18, y: 2.15, w: 2.0, h: 0.72, fontSize: 34, bold: true, color: p.hl ? C.WHITE : C.VIO_L, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(p.sub, { x: x + 0.18, y: 2.92, w: 2.52, h: 0.3, fontSize: 10, color: p.hl ? C.VIO_XL : C.SLATE_D, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });

    p.feats.forEach((f, j) => {
      s.addText(`✓  ${f}`, { x: x + 0.18, y: 3.32 + j * 0.39, w: 2.52, h: 0.36, fontSize: 11, color: p.hl ? 'EDE9FE' : C.WHITE, fontFace: 'Calibri', align: 'left', valign: 'middle', isTextBox: true, margin: 0 });
    });
  });

  s.addText('14 días gratis en todos los planes · Sin tarjeta de crédito', { x: 0.5, y: 5.28, w: 9.1, h: 0.28, fontSize: 10.5, color: C.SLATE_D, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════
// SLIDE 12 — CIERRE
// ══════════════════════════════════════════════════════════════════════════
{
  const s = ds(pres);
  s.addShape('ellipse', { x: -1.8, y: -1.2, w: 5.5, h: 5.5, fill: { color: C.VIO, transparency: 85 }, line: { color: C.VIO, transparency: 85, pt: 0 } });
  s.addShape('ellipse', { x: 7.8, y: 2.2, w: 4.2, h: 4.2, fill: { color: C.VIO_L, transparency: 90 }, line: { color: C.VIO_L, transparency: 90, pt: 0 } });

  s.addText('¿Preguntas?', { x: 0.6, y: 0.95, w: 9.0, h: 1.1, fontSize: 56, bold: true, color: C.WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('calificar.com.ar/fidelizacion', { x: 0.6, y: 2.15, w: 9.0, h: 0.58, fontSize: 22, color: C.VIO_L, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Podemos hacer una demo en vivo · 14 días gratis · Sin tarjeta de crédito', { x: 0.6, y: 2.92, w: 9.0, h: 0.48, fontSize: 14, color: C.SLATE, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('💬  Consultas: wa.me/5491123867934', { x: 0.6, y: 3.65, w: 9.0, h: 0.48, fontSize: 15, color: C.GREEN, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  s.addText('Calificar · En Red Consultora · Argentina', { x: 0.6, y: 5.18, w: 9.0, h: 0.28, fontSize: 10, color: C.SLATE_D, fontFace: 'Calibri', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}

// ── GENERAR ────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: 'calificar-fidelizacion.pptx' })
  .then(() => console.log('\n✅  calificar-fidelizacion.pptx generado con éxito\n'))
  .catch(e => { console.error(e); process.exit(1); });
