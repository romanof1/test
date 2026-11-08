// Общие элементы фонов и ведущего: небо, вода, город, корабль, пирс, речевые окна.
'use strict';
// Окна речи (оценка по тексту; пересчитать по voiceover.wav) — рот ведущего синхронизирован с ними
const SPEECH = [[0.3, 3.1], [3.4, 6.7], [7.2, 18.7], [19.2, 25.2], [25.7, 31.2], [31.7, 36.0], [36.3, 39.2], [39.7, 48.2], [48.7, 55.4]];
function talkAt(t) {
  for (const [a, b] of SPEECH) if (t > a && t < b) { const env = seg(t, a, a + .1) * (1 - seg(t, b - .1, b)); return env * clamp(.45 + .55 * noise(t * 10.5, 5) + .25 * noise(t * 23, 9)); }
  return 0;
}
function narratorFace(t, extra = {}) { return { talk: talkAt(t), blink: blinkAt(t, 11), ...extra }; }
const NARR = () => OUTFIT.narrator;

function skyGrad(ctx, top, bottom, y0 = 0, y1 = H) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(-W, y0 - H * 2, W * 3, (y1 - y0) + H * 4); }
// водная полоса с рябью (фазы различаются)
function water(ctx, y, h, col, t, seed = 1, x0 = -W, x1 = W * 2) {
  ctx.fillStyle = col; ctx.fillRect(x0, y, x1 - x0, h);
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  const r = rng(seed);
  for (let i = 0; i < 70; i++) { const yy = y + 10 + r() * (h - 20); const xx = x0 + r() * (x1 - x0); const w = 18 + r() * 40 * (yy - y) / h + 10; const ph = Math.sin(t * 1.4 + i);
    ctx.beginPath(); ctx.moveTo(xx + ph * 6, yy); ctx.lineTo(xx + w + ph * 6, yy); ctx.stroke(); }
}
// Силуэт английского портового города начала XVII в.: фахверк, черепица, церковная башня
function townRow(ctx, x0, yBase, s, seed, col = '#B9B3A6', roof = '#8C6E5E') {
  const r = rng(seed); let x = x0;
  for (let i = 0; i < 14; i++) {
    const w = (60 + r() * 50) * s, h = (70 + r() * 60) * s;
    if (i === 6) { // башня церкви с зубцами
      outlined(ctx, rrPath(x, yBase - h * 2.1, w * .8, h * 2.1, 2), '#A9A396', 2.4);
      for (let k = 0; k < 4; k++) outlined(ctx, rrPath(x + k * w * .2, yBase - h * 2.1 - 10 * s, w * .12, 12 * s, 1), '#A9A396', 2);
      x += w * .8 + 4; continue;
    }
    outlined(ctx, rrPath(x, yBase - h, w, h, 2), col, 2.4);
    outlined(ctx, polyPath([[x - 6 * s, yBase - h], [x + w / 2, yBase - h - 40 * s], [x + w + 6 * s, yBase - h]]), roof, 2.4);
    ctx.strokeStyle = 'rgba(43,33,27,.5)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, yBase - h * .5); ctx.lineTo(x + w, yBase - h * .5); ctx.moveTo(x + w * .3, yBase - h); ctx.lineTo(x + w * .3, yBase); ctx.moveTo(x + w * .7, yBase - h); ctx.lineTo(x + w * .7, yBase); ctx.stroke();
    ctx.fillStyle = '#5A4A3A'; ctx.fill(rrPath(x + w * .4, yBase - h * .4, w * .2, h * .3, 2));
    x += w + 2;
  }
}
// Торговый трёхмачтовый корабль начала XVII в. (вид сбоку). o: {sails:0..1 (раскрытие), t, roll(°), flag}
function ship(ctx, x, y, s, o = {}) {
  const t = o.t || 0, sails = o.sails == null ? 1 : o.sails;
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.roll || 0) * D2R); ctx.scale(s, s);
  // мачты и такелаж
  const masts = [[-120, 380], [20, 470], [150, 360]];
  ctx.strokeStyle = 'rgba(43,33,27,.7)'; ctx.lineWidth = 1.6;
  masts.forEach(([mx, mh]) => { ctx.beginPath(); ctx.moveTo(mx, -mh); ctx.lineTo(mx - 110, -40); ctx.moveTo(mx, -mh); ctx.lineTo(mx + 110, -40); ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(150, -360); ctx.lineTo(330, -60); ctx.stroke();
  masts.forEach(([mx, mh]) => { outlined(ctx, rrPath(mx - 7, -mh, 14, mh, 4), '#7A5A3E', 3); });
  // паруса: прямые, кремовые, надуты ветром
  masts.forEach(([mx, mh], i) => {
    for (let k = 0; k < 2; k++) {
      const top = -mh + 40 + k * mh * .42, hh = mh * .34 * (k ? 1 : .85); const ww = (i === 1 ? 120 : 100) * (k ? 1 : .8);
      outlined(ctx, rrPath(mx - ww - 6, top - 8, (ww + 6) * 2, 12, 5), '#7A5A3E', 2.5);
      if (sails > 0.02) { const hs = hh * sails; const bulge = 18 + 6 * Math.sin(t * 1.3 + i + k);
        const p = new Path2D(); p.moveTo(mx - ww, top); p.lineTo(mx + ww, top); p.quadraticCurveTo(mx + ww + bulge * .4, top + hs / 2, mx + ww * .92, top + hs); p.quadraticCurveTo(mx, top + hs + bulge, mx - ww * .92, top + hs); p.quadraticCurveTo(mx - ww - bulge * .4, top + hs / 2, mx - ww, top); outlined(ctx, p, '#EFE3CF', 3);
        ctx.strokeStyle = 'rgba(43,33,27,.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(mx, top); ctx.lineTo(mx, top + hs + bulge * .7); ctx.stroke(); }
      else { outlined(ctx, rrPath(mx - ww, top - 2, ww * 2, 14, 7), '#E3D5BC', 2.4); }
    }
  });
  // флаг Святого Георгия (английский торговый флаг)
  const fx = 20, fy = -470; const wv = Math.sin(t * 4) * 5;
  const fp = new Path2D(); fp.moveTo(fx, fy); fp.quadraticCurveTo(fx + 30, fy - 6 + wv, fx + 64, fy + wv); fp.lineTo(fx + 64, fy + 40 + wv); fp.quadraticCurveTo(fx + 30, fy + 34 - wv, fx, fy + 40); fp.closePath();
  outlined(ctx, fp, '#FFFFFF', 2.5); ctx.save(); ctx.clip(fp); ctx.fillStyle = '#C8352E'; ctx.fillRect(fx + 26, fy - 10, 11, 70); ctx.fillRect(fx, fy + 14 + wv * .5, 70, 11); ctx.restore();
  // корпус: подъём кормы (ахтеркастль) слева, бак справа
  const hull = smoothPath([[-300, -110], [-290, -40], [-250, 40], [-120, 75], [120, 72], [250, 35], [330, -60], [300, -70], [200, -50], [-160, -50], [-220, -110]]);
  outlined(ctx, hull, '#8A5A3A', 4);
  ctx.save(); ctx.clip(hull);
  ctx.fillStyle = '#6E4630'; ctx.fillRect(-320, 20, 700, 80);
  ctx.strokeStyle = 'rgba(43,33,27,.45)'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-320, -30 + k * 26); ctx.quadraticCurveTo(0, -12 + k * 26, 340, -50 + k * 26); ctx.stroke(); }
  ctx.fillStyle = '#E0A84A'; ctx.fillRect(-320, -48, 700, 7);
  ctx.restore();
  for (let k = 0; k < 4; k++) outlined(ctx, circlePath(-110 + k * 70, -18, 8), '#3B2A20', 2);
  outlined(ctx, rrPath(-290, -150, 90, 46, 4), '#9A6A44', 3.5); // кормовая надстройка
  ctx.restore();
}
// бочка и ящик для пирса
function barrel(ctx, x, y, s) { outlined(ctx, rrPath(x - 28 * s, y - 70 * s, 56 * s, 70 * s, 18 * s), '#9A7450', 3); ctx.strokeStyle = '#4E3A2C'; ctx.lineWidth = 4 * s; for (const k of [.2, .8]) { ctx.beginPath(); ctx.moveTo(x - 28 * s, y - 70 * s * k); ctx.lineTo(x + 28 * s, y - 70 * s * k); ctx.stroke(); } contactShadow(ctx, x, y, 34 * s, .2); }
function crate(ctx, x, y, s) { contactShadow(ctx, x, y, 44 * s, .2); outlined(ctx, rrPath(x - 40 * s, y - 70 * s, 80 * s, 70 * s, 3), '#B08A5E', 3); ctx.strokeStyle = '#4E3A2C'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 70 * s); ctx.lineTo(x + 40 * s, y); ctx.moveTo(x - 40 * s, y - 35 * s); ctx.lineTo(x + 40 * s, y - 35 * s); ctx.stroke(); }
// доски пирса (земная полоса — сцена для персонажей)
function planks(ctx, y, h, col = '#A68A62') {
  ctx.fillStyle = col; ctx.fillRect(-W, y, W * 3, h);
  ctx.strokeStyle = 'rgba(43,33,27,.35)'; ctx.lineWidth = 2; for (let k = 1; k < 6; k++) { const yy = y + h * k / 6 * (k / 6); ctx.beginPath(); ctx.moveTo(-W, yy); ctx.lineTo(W * 2, yy); ctx.stroke(); }
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-W, y); ctx.lineTo(W * 2, y); ctx.stroke();
}
// канат-передний план (самый быстрый слой параллакса)
function ropeFG(ctx, x0, y0, x1, y1, sag, w = 14) { const p = new Path2D(); p.moveTo(x0, y0); p.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1); ctx.lineCap = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = w + 6; ctx.stroke(p); ctx.strokeStyle = '#B49A6A'; ctx.lineWidth = w; ctx.stroke(p); ctx.strokeStyle = 'rgba(43,33,27,.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 10]); ctx.stroke(p); ctx.setLineDash([]); }
function postFG(ctx, x, y, w, h) { outlined(ctx, rrPath(x - w / 2, y - h, w, h + 40, 8), '#7A5A3E', 4); ctx.strokeStyle = 'rgba(43,33,27,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - w * .2, y - h + 20); ctx.lineTo(x - w * .2, y); ctx.stroke(); }
