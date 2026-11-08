// Сцена 007 · 48.5–58.0 · «Основали выброшенные»: высадка на берег → камера поднимается в карту, каждая фигурка
// падает на побережье каплей краски, капли сливаются в заливку колоний. Отъезд: Европа и колонии в одной рамке.
// Надпись «Отвергнутые — основатели» выписывается пером.
'use strict';
const S7 = (() => {
  const SAND = 380;
  const JAM = [-76.78, 37.21], PLY = [-70.67, 41.96];
  // схема роста английских колоний вдоль побережья (условно, до XVIII в.) — допущение в notes сцены
  const REGION = [[-66.8, 44.9], [-69.2, 47.4], [-71.5, 45.3], [-73.4, 45.0], [-74.6, 42.8], [-78.2, 42.3], [-80.3, 42.1], [-80.6, 39.8], [-79.6, 38.4], [-81.6, 36.6], [-83.7, 35.0], [-84.6, 34.2], [-82.2, 31.0], [-81.0, 30.4], [-75.0, 34.0], [-69.0, 40.5], [-66.0, 43.5]];
  const DROPS = (() => { const r = rng(1607); const a = []; for (let i = 0; i < 26; i++) { const s = i % 2 ? JAM : PLY; a.push({ lon: s[0] + (r() - .5) * 2.4 - (i % 2 ? .6 : .9), lat: s[1] + (r() - .5) * 2.2, t: 51.0 + i * .045 + r() * .2 }); } return a; })();
  function mapView(t) {
    const k = seg(t, 50.7, 52.6), e = easeOut(k);
    const v = { lon: -72.6, lat: 40.6, z: lerp(7.5, 2.2, e), r: 0, squash: 0 };
    const p = seg(t, 53.4, 56.4), pe = easeInOut(p);
    v.lon = lerp(v.lon, -39, pe); v.lat = lerp(v.lat, 44.0, pe); v.z = lerp(v.z, .47, pe); v.squash = .2 * pe; v.r = -4 * pe;   // та же наклонная карта, что в 002
    v.lon += .4 * seg(t, 56.4, 58); v.z *= 1 + .02 * seg(t, 56.4, 58);   // финальный медленный дрейф
    return v;
  }
  function colonyFill(ctx, z, t) {
    const grow = seg(t, 51.2, 54.6);
    if (grow <= 0) return;
    const reg = smoothPath(REGION.map(q => proj(q[0], q[1])));
    ctx.save(); ctx.clip(MAP.all); ctx.clip(reg);
    // волна заливки расходится от двух первых поселений, капли сливаются
    const rr = easeInOut(grow) * 14;
    ctx.fillStyle = COL.colony; const p = new Path2D();
    for (const s of [JAM, PLY]) { const [x, y] = proj(s[0], s[1]); p.moveTo(x + rr * MAPK, y); p.arc(x, y, rr * MAPK, 0, Math.PI * 2); }
    DROPS.forEach(d => { const k = seg(t, d.t + .25, d.t + .9); if (k > 0) { const [x, y] = proj(d.lon, d.lat); const r = easeOut(k) * 1.1 * MAPK; p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); } });
    ctx.fill(p);
    ctx.restore();
    // контур колоний прорисовывается вслед за волной
    ctx.save(); ctx.clip(MAP.all); ctx.globalAlpha = seg(t, 53.6, 54.6); ctx.strokeStyle = COL.border; ctx.lineWidth = 2.4 / z; ctx.stroke(reg); ctx.restore();
  }
  function shore(ctx, t) {
    const c = { x: keys(t, [[48.5, -900], [49.4, -260], [50.3, -150]]), y: keys(t, [[48.5, -40], [50.2, -40], [51.0, -900]]), z: keys(t, [[48.5, .95], [50.2, 1.0], [51.0, 1.25]]), r: keys(t, [[48.5, 1.5], [49.5, 0], [51, -2]]) };
    withCam(ctx, c, .08, x => { skyGrad(x, '#BFE3EE', '#F6DCC8', -1500, 200); cloud(x, -900, -350, 120); cloud(x, 300, -500, 150); cloud(x, 1200, -300, 110); cloud(x, -300, -1100, 170); });
    withCam(ctx, c, .25, x => { blobUnion(x, [[-200, 120, 380], [400, 140, 320], [900, 130, 360], [1500, 150, 300]], '#8FAFA6', 3); });
    withCam(ctx, c, .45, x => { water(x, 120, 260, '#7FA3B6', t, 11, -3000, -100);
      ship(x, -1300, 200, .7, { t, sails: 0, roll: Math.sin(t) * 1 });
      // лес на берегу: округлые кроны, тёмный контур, одна тень
      for (let i = 0; i < 9; i++) { const tx = -100 + i * 260, ty = 200 + (i % 2) * 20; outlined(x, rrPath(tx - 12, ty - 20, 24, 90, 4), '#6E4A32', 3); blobUnion(x, [[tx, ty - 90, 90], [tx - 60, ty - 50, 60], [tx + 60, ty - 50, 60]], i % 2 ? '#7FAF84' : '#6E9E76', 3.5); }
    });
    withCam(ctx, c, 1, x => {
      x.fillStyle = '#E3CFA0'; x.fillRect(-4000, SAND - 60, 8000, 1400);
      x.strokeStyle = COL.ink; x.lineWidth = 4; x.beginPath(); x.moveTo(-4000, SAND - 60); x.lineTo(4000, SAND - 60); x.stroke();
      // кромка прибоя слева
      x.fillStyle = '#9DBBC6'; x.beginPath(); x.moveTo(-4000, SAND - 60); x.lineTo(-900 + Math.sin(t * 1.5) * 30, SAND - 60); x.quadraticCurveTo(-700, SAND + 200, -1100 + Math.sin(t * 1.5) * 30, 1500); x.lineTo(-4000, 1500); x.closePath(); x.fill(); x.stroke();
      // высадка: колонисты выходят из воды на песок (ходьба вправо со сдвигом фазы)
      const ppl = [];
      for (let i = 0; i < 7; i++) { const st = 48.5 + i * .18; const xx = -1100 + (t - st) * 260 + i * 40; if (xx < -1150) continue;
        ppl.push({ y: SAND + 20 + (i % 3) * 30, d: () => drawChar(x, Math.min(xx, 700 + i * 70), SAND + 20 + (i % 3) * 30, 46, { outfit: crowdOutfit(i, i === 2 ? { hat: 'coif' } : {}), view: 'side', f: 1, pose: xx < 700 + i * 70 ? walkPose(((t - st) * 1.5 + i * .3) % 1, .9) : { ...basePose(), bob: idleBob(t, i) } }) }); }
      // ведущий выходит последним и оборачивается назад — к Европе
      const nk = seg(t, 48.6, 49.8); const nx = lerp(-700, -80, easeOut(nk));
      ppl.push({ y: SAND + 140, d: () => { const turned = t > 49.9; const pose = turned ? { ...basePose(), armL: { sh: 20, el: 30 }, armR: { sh: 15, el: 110 }, bob: idleBob(t, 3) } : walkPose((t * 1.5) % 1, .9);
        drawChar(x, nx, SAND + 140, 96, { outfit: NARR(), view: turned ? 'q' : 'side', f: turned ? -1 : 1, pose, face: narratorFace(t, { mouth: turned ? 'smile' : 'neutral' }) }); } });
      ppl.sort((a, b) => a.y - b.y).forEach(p => p.d());
    });
  }
  function drawMapPart(ctx, t) {
    const v = mapView(t);
    drawMap(ctx, v, { colors: { england: COL.england, ireland: '#EE7468', france: COL.france, spain: COL.spain, netherlands: COL.netherlands }, extra: (x, z) => colonyFill(x, z, t) });
    // капли краски: падают на побережье, каждая — один из высадившихся
    DROPS.forEach((d, i) => { const k = seg(t, d.t, d.t + .3); if (k <= 0 || k >= 1.0001) return; const [x, y] = mapToScreen(v, d.lon, d.lat);
      if (k < 1) { const yy = y - (1 - k * k) * 260; ctx.fillStyle = COL.colony; ctx.beginPath(); ctx.moveTo(x, yy - 22); ctx.quadraticCurveTo(x + 13, yy - 2, x, yy + 9); ctx.quadraticCurveTo(x - 13, yy - 2, x, yy - 22); ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.stroke(); } });
    // маршрут Плимут (Англия) → колонии: пунктир прорисовывается на отъезде
    const rk = seg(t, 54.2, 55.8);
    if (rk > 0) { ctx.save(); ctx.setLineDash([14, 12]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); for (let i = 0; i <= 60 * rk; i++) { const k = i / 60; const lon = lerp(-4.2, -70.4, k), lat = lerp(50.4, 41.9, k) + Math.sin(k * Math.PI) * 7; const [x, y] = mapToScreen(v, lon, lat); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
    const la = seg(t, 54.6, 55.3);
    if (la > 0) { ctx.save(); ctx.globalAlpha = la; const zr = clamp(v.z / .5, .6, 1.4);
      let [x, y] = mapToScreen(v, -76.0, 39.6); countryLabel(ctx, 'Колонии', x, y, 40 * zr, { rot: v.r - 52, color: 'rgba(255,255,255,.75)' });
      [x, y] = mapToScreen(v, -2, 52.6); countryLabel(ctx, 'Англия', x, y, 30 * zr, { rot: v.r - 8 });
      [x, y] = mapToScreen(v, -38, 41); seaLabel(ctx, 'Атлантический океан', x, y, 46 * zr, { rot: v.r - 4 });
      ctx.restore(); }
    // переход с берега: затемнение-вход
  }
  function draw(ctx, t) {
    const toMap = seg(t, 50.3, 51.0);
    if (toMap < 1) shore(ctx, t);
    if (toMap > 0) { ctx.save(); ctx.globalAlpha = easeInOut(toMap); drawMapPart(ctx, t); ctx.restore(); }
    // надпись выписывается пером на бумажной ленте
    const wk = seg(t, 55.2, 56.6);
    const pk = seg(t, 54.9, 55.3);
    if (pk > 0) paperPlaque(ctx, W / 2, 150, 960, 130, pk, (x) => {
      const s = 'Отвергнутые — основатели'; const fs = 62; const tw = textWidth(x, s, fs); const x0 = W / 2 - tw / 2;
      x.save(); x.beginPath(); x.rect(x0 - 10, 80, (tw + 20) * wk, 140); x.clip(); text(x, s, W / 2, 152, { size: fs, color: COL.ink }); x.restore();
      if (wk > 0 && wk < 1) { const px = x0 + tw * wk, py = 152 + Math.sin(wk * 60) * 8; x.save(); x.translate(px, py - 30); x.rotate(.5); outlined(x, ellipsePath(0, -40, 12, 56, 0), '#F4EFE6', 2.5); x.strokeStyle = COL.ink; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 30); x.stroke(); x.restore(); }  // гусиное перо
    });
  }
  return { t0: 48.5, t1: 58.01, draw, blurWindows: [[48.5, 49.0], [50.3, 51.0]] };
})();
