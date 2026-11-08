// Ядро: константы, математика, кривые, детерминированный шум, камера, слои, текст.
// Всё детерминировано по времени t (секунды): renderAt(t) не хранит состояние между кадрами.
'use strict';
const W = 1920, H = 1080, FPS = 60, DURATION = 58.0;
const SAFE = { x: 96, y: 54 };
const COL = {
  ink: '#2B211B', paper: '#F3E9D8', paper2: '#EADBC2', frame: '#C9B79C', accent: '#8A2E2A', gold: '#E0A84A',
  skin: '#FBF6EC', white: '#FFFFFF', sea: '#5E5E5E', grid: '#4A4A4A', border: '#111111',
  england: '#D9443B', colony: '#FF6A5E', france: '#E8D27A', spain: '#9BC59B', netherlands: '#D9A7C7', scotland: '#FFFFFF',
  ground: '#B5A47E', night: '#2C3550',
};
const FONT = { serif: '"PT Serif"', sans: '"Montserrat"' };

// ---------- математика ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = k => k * k * (3 - 2 * k);
const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;
const easeOutBack = (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const D2R = Math.PI / 180;
// затухающая пружина: 0 -> 1 с перелётом (вес и вторичная реакция)
function spring(t, freq = 9, damp = 5) { if (t <= 0) return 0; return 1 - Math.exp(-damp * t) * Math.cos(freq * t); }
// импульс отклика: 0 -> пик -> 0 (встряска, прогиб)
function kick(t, freq = 14, damp = 7) { if (t <= 0) return 0; return Math.exp(-damp * t) * Math.sin(freq * t); }
// кусочная кривая по ключам [[t, v], ...] с easeInOut между ключами
function keys(t, ks, ease = easeInOut) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
    const [t0, v0] = ks[i - 1], [t1, v1] = ks[i]; const k = ease((t - t0) / (t1 - t0));
    return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k);
  }
  return ks[ks.length - 1][1];
}
// ---------- детерминированный случай ----------
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(n) { const r = rng(n * 7919 + 13); r(); return r(); }
function noise(x, seed = 0) { const i = Math.floor(x), f = x - i; const a = hash(i + seed * 1013), b = hash(i + 1 + seed * 1013); return lerp(a, b, smooth(f)) * 2 - 1; }
// моргание: случайный интервал 3–6 с, детерминировано по seed
function blinkAt(t, seed) {
  let tt = hash(seed) * 3; let i = 0;
  while (tt < t + 0.2 && i < 200) { if (t >= tt && t < tt + 0.14) return 1 - Math.abs((t - tt) / 0.07 - 1); tt += 3 + hash(seed * 31 + i) * 3; i++; }
  return 0;
}

// ---------- холсты, слои, DOF ----------
const _pool = [];
function scratch(i) { if (!_pool[i]) { const c = document.createElement('canvas'); c.width = W; c.height = H; _pool[i] = c; } const c = _pool[i]; const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); return c; }
let _layerDepth = 0;
// Слой с размытием (DOF): рисуем в отдельный холст и накладываем через blur
function layer(ctx, blur, fn) {
  if (!blur || blur < 0.35) { fn(ctx); return; }
  const c = scratch(4 + (_layerDepth++)); const x = c.getContext('2d');
  fn(x);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${blur.toFixed(2)}px)`; ctx.drawImage(c, 0, 0); ctx.restore();
  _layerDepth--;
}
// Камера: cam = {x, y, z, r}. Слой с коэффициентом параллакса p.
function camApply(ctx, cam, p = 1) {
  const z = 1 + (cam.z - 1) * p;
  ctx.translate(W / 2 + (cam.sx || 0), H / 2 + (cam.sy || 0));
  ctx.rotate((cam.r || 0) * D2R * Math.min(1, p));
  ctx.scale(z, z);
  ctx.translate(-cam.x * p, -cam.y * p);
}
function withCam(ctx, cam, p, fn) { ctx.save(); camApply(ctx, cam, p); fn(ctx); ctx.restore(); }

// ---------- рисование ----------
function outlined(ctx, path, fill, lw = 3.5, stroke = COL.ink) {
  ctx.fillStyle = fill; ctx.fill(path); if (lw > 0) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(path); }
}
function circlePath(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; }
function ellipsePath(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rot, 0, Math.PI * 2); return p; }
function rrPath(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
function polyPath(pts, close = true) { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); return p; }
// сглаженный замкнутый контур через квадратичные кривые по серединам
function smoothPath(pts, close = true) {
  const p = new Path2D(); const n = pts.length; if (n < 3) return polyPath(pts, close);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (close) { let m = mid(pts[n - 1], pts[0]); p.moveTo(m[0], m[1]); for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; const mm = mid(a, b); p.quadraticCurveTo(a[0], a[1], mm[0], mm[1]); } p.closePath(); }
  else { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n - 1; i++) { const mm = mid(pts[i], pts[i + 1]); p.quadraticCurveTo(pts[i][0], pts[i][1], mm[0], mm[1]); } p.lineTo(pts[n - 1][0], pts[n - 1][1]); }
  return p;
}
// объединение кругов с единым внешним контуром (волосы, кроны, облака)
function blobUnion(ctx, circles, fill, lw = 3.5, stroke = COL.ink) {
  const p = new Path2D(); circles.forEach(([x, y, r]) => { p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); });
  if (lw > 0) { ctx.lineWidth = lw * 2; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.stroke(p); }
  ctx.fillStyle = fill; ctx.fill(p);
}
function contactShadow(ctx, x, y, rx, a = .22) { ctx.fillStyle = `rgba(43,33,27,${a})`; ctx.fill(ellipsePath(x, y, rx, rx * .22)); }

// ---------- облака (плоские, с «барашковой» кромкой) ----------
function cloud(ctx, x, y, s, alpha = 1, fill = '#FAFAF7') {
  ctx.save(); ctx.globalAlpha *= alpha;
  const c = [[-1.2, .1, .42], [-.65, -.18, .55], [0, -.36, .66], [.6, -.2, .52], [1.15, .08, .4], [-.3, .15, .45], [.35, .15, .45]].map(([a, b, r]) => [x + a * s, y + b * s, r * s]);
  blobUnion(ctx, c, fill, 1.6, '#9FB4C2');
  ctx.restore();
}

// ---------- текст ----------
function setFont(ctx, size, family = FONT.serif, weight = 700) { ctx.font = `${weight} ${size}px ${family}`; }
// трекинг через letterSpacing (Chromium поддерживает ctx.letterSpacing)
function text(ctx, s, x, y, o = {}) {
  setFont(ctx, o.size || 40, o.family || FONT.serif, o.weight || 700);
  ctx.letterSpacing = (o.track || 0) + 'px'; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || 'rgba(0,0,0,.6)'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.shadowBlur || 6; ctx.shadowOffsetY = o.shadowY || 2; }
  ctx.fillStyle = o.color || COL.ink; ctx.fillText(s, x, y);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.letterSpacing = '0px';
}
function textWidth(ctx, s, size, family = FONT.serif, weight = 700, track = 0) { setFont(ctx, size, family, weight); ctx.letterSpacing = track + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }

// Бумажная плашка-свиток: разворачивается по ширине (k 0..1), контактная тень
function paperPlaque(ctx, cx, cy, w, h, k, drawContent) {
  if (k <= 0) return;
  const ww = w * easeOut(k);
  ctx.save();
  ctx.fillStyle = 'rgba(43,33,27,.22)'; ctx.fill(rrPath(cx - ww / 2 + 6, cy - h / 2 + 10, ww, h, 14));
  outlined(ctx, rrPath(cx - ww / 2, cy - h / 2, ww, h, 14), COL.paper, 3, COL.frame);
  ctx.strokeStyle = COL.paper2; ctx.lineWidth = 2; ctx.stroke(rrPath(cx - ww / 2 + 8, cy - h / 2 + 8, ww - 16, h - 16, 9));
  // рулоны по краям свитка
  for (const sx of [-1, 1]) outlined(ctx, rrPath(cx + sx * ww / 2 - 9, cy - h / 2 - 8, 18, h + 16, 9), COL.paper2, 3, COL.frame);
  ctx.beginPath(); ctx.rect(cx - ww / 2 + 12, cy - h / 2, ww - 24, h); ctx.clip();
  drawContent(ctx, k);
  ctx.restore();
}
// Медальон эпохи (§4.1): радиальный градиент, обводка, белый жирный текст
function medallion(ctx, x, y, d, label, sc = 1) {
  if (sc <= 0.001) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const r = d / 2;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill(ellipsePath(6, 10, r, r));
  const g = ctx.createRadialGradient(-r * .2, -r * .25, r * .1, 0, 0, r);
  g.addColorStop(0, '#C08A3E'); g.addColorStop(1, '#6B3F14');
  ctx.fillStyle = g; ctx.fill(circlePath(0, 0, r));
  ctx.lineWidth = 6; ctx.strokeStyle = '#120C08'; ctx.stroke(circlePath(0, 0, r));
  const fs = Math.min(d * .25, d * .25 * (d * .76) / Math.max(1, textWidth(ctx, label, d * .25)));
  text(ctx, label, 0, 3, { size: fs, color: '#FFFFFF', shadow: 'rgba(0,0,0,.55)', shadowBlur: 6, shadowY: 2, family: FONT.serif, weight: 700 });
  ctx.restore();
}
// Медальон: подготовка (сжатие) -> pop 0 -> 1.08 -> 1 -> затухание
function popScale(t) { if (t <= 0) return 0; if (t < .12) return .0001; const k = t - .12; return Math.max(0, spring(k, 13, 6.5)); }
