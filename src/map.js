// Карта по §7: тёмное море с сеткой (только по воде), белая суша, гладкие векторные границы,
// мягкая внутренняя тень у берега, подписи и маркеры привязаны к проекции точки.
'use strict';
const MAPK = 40; // px на градус долготы при zoom=1
const mercY = lat => Math.log(Math.tan(Math.PI / 4 + lat * D2R / 2)) / D2R;
function proj(lon, lat) { return [lon * MAPK, -mercY(lat) * MAPK]; }
let MAP = null;
function mapInit() {
  if (MAP) return MAP;
  const all = new Path2D(), states = new Path2D(), lakes = new Path2D(), byClass = {};
  for (const f of window.GEO) {
    const p = new Path2D(); f.r.forEach((q, i) => { const [x, y] = proj(q[0], q[1]); i ? p.lineTo(x, y) : p.moveTo(x, y); }); p.closePath();
    if (f.c === 'lake') { lakes.addPath(p); continue; }
    all.addPath(p); if (f.c !== 'land') states.addPath(p);
    (byClass[f.c] = byClass[f.c] || new Path2D()).addPath(p);
  }
  // маска моря из объединённой береговой линии: перекрытия исходных полигонов не превращаются в «воду»
  const sea = new Path2D(); sea.rect(-20000, -20000, 40000, 40000);
  for (const r of window.COAST) r.forEach((q, i) => { const [x, y] = proj(q[0], q[1]); i ? sea.lineTo(x, y) : sea.moveTo(x, y); }), sea.closePath();
  MAP = { all, states, byClass, sea, lakes };
  return MAP;
}
// view: {lon, lat, z, r(°), squash(0..1 2.5D-наклон), sx, sy}
function mapTransform(ctx, v) {
  const [cx, cy] = proj(v.lon, v.lat);
  ctx.translate(W / 2 + (v.sx || 0), H / 2 + (v.sy || 0));
  if (v.squash) ctx.scale(1, 1 - v.squash);
  ctx.rotate((v.r || 0) * D2R);
  ctx.scale(v.z, v.z);
  ctx.translate(-cx, -cy);
}
// экранная точка для lon/lat при данном виде (для подписей в screen space и привязок)
function mapToScreen(v, lon, lat) {
  const [x, y] = proj(lon, lat), [cx, cy] = proj(v.lon, v.lat);
  let dx = (x - cx) * v.z, dy = (y - cy) * v.z; const r = (v.r || 0) * D2R;
  const rx = dx * Math.cos(r) - dy * Math.sin(r), ry = dx * Math.sin(r) + dy * Math.cos(r);
  return [W / 2 + (v.sx || 0) + rx, H / 2 + (v.sy || 0) + ry * (1 - (v.squash || 0))];
}
function drawMap(ctx, v, o = {}) {
  const M = mapInit(); const z = v.z;
  ctx.save();
  ctx.fillStyle = o.sea || COL.sea; ctx.fillRect(-W, -H, W * 3, H * 3);
  mapTransform(ctx, v);
  // градусная сетка (шаг 10°) — суша поверх её закроет
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 2 / z; ctx.beginPath();
  for (let lon = -180; lon <= 180; lon += 10) { const [x] = proj(lon, 0); ctx.moveTo(x, proj(0, 80)[1]); ctx.lineTo(x, proj(0, -10)[1]); }
  for (let lat = -10; lat <= 80; lat += 10) { const y = proj(0, lat)[1]; ctx.moveTo(proj(-180, 0)[0], y); ctx.lineTo(proj(180, 0)[0], y); }
  ctx.stroke();
  // береговой контур (внешняя половина толстой линии) + заливка суши поверх
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = COL.border; ctx.lineWidth = 3.2 / z; ctx.stroke(M.all);
  ctx.fillStyle = COL.white; ctx.fill(M.all);
  // заливки государств
  const colors = o.colors || {};
  for (const c in colors) if (M.byClass[c]) { ctx.fillStyle = colors[c]; ctx.fill(M.byClass[c]); }
  if (o.extra) o.extra(ctx, z);
  // крупные озёра (Великие озёра) — вода, с береговой линией
  ctx.fillStyle = o.sea || COL.sea; ctx.fill(M.lakes); ctx.strokeStyle = COL.border; ctx.lineWidth = 1.6 / z; ctx.stroke(M.lakes);          // колонии, волны перекраски — до внутренней тени
  // мягкая внутренняя тень у суши со стороны моря
  if (!o.noShadow) {
    // только со стороны моря: размытая заливка моря (even-odd), обрезанная по суше — внутренние границы тени не дают
    ctx.save(); ctx.clip(M.all); ctx.filter = 'blur(7px)'; ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill(M.sea, 'evenodd'); ctx.restore();
  }
  // границы государств: общие рёбра обводятся одной линией одного цвета — без «двойных» линий
  ctx.strokeStyle = COL.border; ctx.lineWidth = 2.4 / z; ctx.stroke(M.states);
  if (o.after) o.after(ctx, z);
  ctx.restore();
}
// Подпись страны: крупно, разреженный трекинг, полупрозрачно, лёгкий наклон
function countryLabel(ctx, s, x, y, size, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot || 0) * D2R); ctx.globalAlpha *= (o.alpha == null ? 1 : o.alpha);
  text(ctx, s, 0, 0, { size, family: FONT.sans, weight: 800, track: size * .06, color: o.color || 'rgba(255,255,255,.55)' });
  ctx.restore();
}
function seaLabel(ctx, s, x, y, size, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot || 0) * D2R); ctx.globalAlpha *= (o.alpha == null ? 1 : o.alpha);
  text(ctx, s.toUpperCase(), 0, 0, { size, family: FONT.sans, weight: 800, track: size * .12, color: 'rgba(170,170,170,.55)' });
  ctx.restore();
}
// Маркер города/столицы: pop-in с перелётом, подпись вытягивается от маркера
function cityMarker(ctx, x, y, k, o = {}) {
  if (k <= 0) return; const sc = spring(k * .6, 12, 6) ;
  const size = o.size || 'large'; const r = size === 'large' ? 11 : size === 'medium' ? 8 : 5.5; const lw = size === 'large' ? 4 : size === 'medium' ? 3 : 2.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  if (o.capital) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 14; i ? p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } p.closePath(); outlined(ctx, p, COL.white, 3.5, '#000'); }
  else outlined(ctx, circlePath(0, 0, r), COL.white, lw, '#000');
  ctx.restore();
  if (o.label) {
    const lk = seg(k, .25, .7); if (lk <= 0) return;
    ctx.save(); ctx.globalAlpha *= lk;
    const dx = (o.dx == null ? 0 : o.dx), dy = (o.dy == null ? -34 : o.dy);
    text(ctx, o.label, x + dx * easeOut(lk), y + dy * easeOut(lk), { size: o.fs || 34, family: FONT.sans, weight: 700, color: '#FFFFFF', stroke: 5, strokeColor: 'rgba(0,0,0,.6)', align: o.align || 'center' });
    if (o.sub) text(ctx, o.sub, x + dx * easeOut(lk), y + dy * easeOut(lk) + (o.fs || 34) * .95, { size: (o.fs || 34) * .7, family: FONT.serif, weight: 700, color: COL.gold, stroke: 4, strokeColor: 'rgba(0,0,0,.6)', align: o.align || 'center' });
    ctx.restore();
  }
}
