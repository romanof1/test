// Сцена 004 · 25.5–31.5 · «Земля за океаном»: портовая стена, вербовочный лист «Вирджиния»; камера входит в гравюру —
// внутри листа раскрывается карта, перелёт через Атлантику, маркеры Джеймстауна и Плимута. Выход: нырок в океан.
'use strict';
const S4 = (() => {
  const GROUND = 520;
  const POSTER = { x: -40, y: 70, w: 440, h: 580 };       // мир сцены
  const ENG = { x: POSTER.x - 150, y: POSTER.y - 40, w: 300, h: 190 };  // окно гравюры внутри листа (носитель маски)
  function cam(t) {
    const arrive = easeOut(seg(t, 25.5, 26.3));
    const c = { x: lerp(1500, 120, arrive), y: 170, z: 1.05, r: lerp(-2, 0, arrive) };
    c.x += 40 * easeInOut(seg(t, 26.3, 27.5)) * -1;
    // наезд в гравюру
    const p = seg(t, 27.4, 28.35); const e = easeIn(p);
    if (p > 0) { const cx = ENG.x + ENG.w / 2, cy = ENG.y + ENG.h / 2; c.x = lerp(c.x, cx, easeInOut(p)); c.y = lerp(c.y, cy, easeInOut(p)); c.z = lerp(1.05, 1920 / ENG.w * 1.02, e); c.r = 0; }
    return c;
  }
  function brickWall(ctx) {
    ctx.fillStyle = '#B8735A'; ctx.fillRect(-3000, -1400, 6000, GROUND + 1400);
    ctx.strokeStyle = 'rgba(43,33,27,.28)'; ctx.lineWidth = 2;
    for (let r = 0; r < 40; r++) { const y = -1400 + r * 46; ctx.beginPath(); ctx.moveTo(-3000, y); ctx.lineTo(3000, y); ctx.stroke(); for (let k = 0; k < 60; k++) { const x = -3000 + k * 100 + (r % 2) * 50; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 46); ctx.stroke(); } }
    outlined(ctx, rrPath(-1500, -1450, 160, GROUND + 1450, 4), '#7A5A3E', 4); outlined(ctx, rrPath(1300, -1450, 160, GROUND + 1450, 4), '#7A5A3E', 4); // балки фахверка
    outlined(ctx, rrPath(560, -360, 360, 280, 6), '#4E6A80', 4); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(740, -360); ctx.lineTo(740, -80); ctx.moveTo(560, -220); ctx.lineTo(920, -220); ctx.stroke();  // окно таверны
  }
  // гравюра: побережье, корабль, компас — тонкими линиями на бумаге
  function engraving(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = '#EFE3CF'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#6E5A44'; ctx.lineWidth = 2;
    const coast = [[.0, .2], [.12, .28], [.2, .42], [.18, .55], [.3, .66], [.28, .82], [.4, 1]];
    ctx.beginPath(); coast.forEach(([a, b], i) => i ? ctx.lineTo(x + a * w, y + b * h) : ctx.moveTo(x + a * w, y + b * h)); ctx.stroke();
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x + w * .5 + i * 14, y + h * .8); ctx.lineTo(x + w * .58 + i * 14, y + h * .8); ctx.stroke(); }
    ship(ctx, x + w * .66, y + h * .55, .2, { sails: 1 });
    ctx.restore(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, h);
  }
  function poster(ctx, t) {
    const P = POSTER;
    ctx.fillStyle = 'rgba(43,33,27,.28)'; ctx.fill(rrPath(P.x - P.w / 2 + 10, P.y - P.h / 2 + 14, P.w, P.h, 4));
    outlined(ctx, polyPath([[P.x - P.w / 2, P.y - P.h / 2 + 6], [P.x + P.w / 2, P.y - P.h / 2], [P.x + P.w / 2 - 4, P.y + P.h / 2], [P.x - P.w / 2 + 3, P.y + P.h / 2 + 4]]), COL.paper, 3.5);
    text(ctx, 'ВИРДЖИНИЯ', P.x, P.y - P.h / 2 + 70, { size: 54, color: COL.ink, track: 4 });
    ctx.strokeStyle = '#9A8A70'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P.x - 150, P.y - P.h / 2 + 110); ctx.lineTo(P.x + 150, P.y - P.h / 2 + 110); ctx.stroke();
    engraving(ctx, ENG.x, ENG.y, ENG.w, ENG.h);
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(P.x - 160, P.y + 170 + i * 20); ctx.lineTo(P.x + 160 - (i === 4 ? 120 : 0), P.y + 170 + i * 20); ctx.stroke(); }
    outlined(ctx, circlePath(P.x, P.y - P.h / 2 + 18, 9), '#8C8F94', 2.5); // гвоздь
  }
  // ---------- карта и перелёт ----------
  function mapView(t) {
    const k = seg(t, 28.05, 29.95), e = easeInOut(k);
    const lift = Math.sin(Math.PI * e);
    const v = { lon: lerp(-3, -73.6, e), lat: lerp(51.2, 39.6, e) + lift * 3, z: lerp(2.6, 1.55, e) * (1 - .5 * lift), r: lerp(0, 0, e), squash: .2 * lift };
    v.lon += noise(t * .5, 4) * .3 * (1 - k);
    // дрейф в фазе чтения
    const d = seg(t, 29.95, 31.15); v.lon += .7 * d; v.z *= 1 + .05 * d;
    // нырок в воду: 31.15 → 31.5
    const dv = seg(t, 31.15, 31.5); if (dv > 0) { v.lon = lerp(v.lon, -62, easeIn(dv)); v.lat = lerp(v.lat, 37.5, easeIn(dv)); v.z *= Math.pow(9, easeIn(dv)); }
    return v;
  }
  const JAM = [-76.78, 37.21], PLY = [-70.67, 41.96];
  function drawMapPart(ctx, t) {
    const v = mapView(t);
    drawMap(ctx, v, { colors: { england: COL.england, ireland: '#EE7468', france: COL.france, spain: COL.spain, netherlands: COL.netherlands } });
    // пунктир маршрута, прорисовывается за камерой
    const rk = seg(t, 28.1, 29.9);
    if (rk > 0) { ctx.save(); ctx.setLineDash([16, 14]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i <= 60 * rk; i++) { const k = i / 60; const lon = lerp(-4.2, -70.4, k), lat = lerp(50.4, 41.9, k) + Math.sin(k * Math.PI) * 7; const [x, y] = mapToScreen(v, lon, lat); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore(); }
    const zr = Math.min(1.6, v.z / 1.4);
    const sa = seg(t, 28.5, 29.0) * (1 - seg(t, 31.0, 31.3));
    if (sa > 0) { const [x, y] = mapToScreen(v, -40, 44); seaLabel(ctx, 'Атлантический океан', x, y, 56 * zr, { alpha: sa, rot: -6 }); }
    const ma = 1 - seg(t, 31.15, 31.4);
    if (ma > 0) { ctx.save(); ctx.globalAlpha = ma;
      let [x, y] = mapToScreen(v, JAM[0], JAM[1]); cityMarker(ctx, x, y, seg(t, 29.55, 30.3), { size: 'large', label: 'Джеймстаун', sub: '1607', dx: -20, dy: 46, fs: 40, align: 'right' });
      [x, y] = mapToScreen(v, PLY[0], PLY[1]); cityMarker(ctx, x, y, seg(t, 29.8, 30.55), { size: 'large', label: 'Плимут', sub: '1620', dx: 26, dy: -58, fs: 40, align: 'left' });
      ctx.restore(); }
    // нырок: темнеет до ночного моря сцены 005, радиальный blur как акцент
    const dv = seg(t, 31.15, 31.5); if (dv > 0) { ctx.fillStyle = `rgba(44,53,80,${easeIn(dv)})`; ctx.fillRect(0, 0, W, H); }
  }
  function people(ctx, t) {
    // вербовщик (2-й план) указывает на лист; двое слушателей (3-й план)
    const rk = t - 26.9; const rp = basePose(); rp.armR = { sh: rk < .15 ? 10 : 10 + 70 * spring(rk - .15, 12, 6), el: 15, hand: 'point' }; rp.armL = { sh: 10, el: 40, hand: 'open' }; rp.bob = idleBob(t, 8);
    drawChar(ctx, -440, GROUND + 30, 70, { outfit: OUTFIT.recruiter, view: 'q', f: 1, pose: rk > 0 ? rp : { ...basePose(), bob: idleBob(t, 8) } });
    drawChar(ctx, -720, GROUND + 10, 50, { outfit: crowdOutfit(3), view: 'q', f: 1, pose: { ...basePose(), bob: idleBob(t, 21), neck: 4 } });
    drawChar(ctx, -860, GROUND + 0, 48, { outfit: crowdOutfit(2), view: 'q', f: 1, pose: { ...basePose(), bob: idleBob(t, 22) } });
    // ведущий входит справа (продолжая движение из 003), останавливается у листа, оборачивается к нам
    const k = seg(t, 25.5, 26.6); const x = lerp(900, 340, easeOut(k));
    let pose, view, f = -1;
    if (k < 1) { pose = walkPose((t * 1.6) % 1, .9 * (1 - k * .6)); view = 'side'; }
    else { const g = t - 27.15; pose = basePose(); pose.armL = { sh: g > 0 ? 55 * spring(g, 11, 6) : 10, el: 20, hand: 'open' }; pose.armR = { sh: 8, el: 25, hand: 'open' }; view = 'q'; pose.bob = idleBob(t, 3); }
    drawChar(ctx, x, GROUND + 90, 96, { outfit: NARR(), view, f, pose, face: narratorFace(t, { mouth: 'smile' }) });
  }
  function draw(ctx, t) {
    const c = cam(t);
    const mapOn = t > 27.75;
    const cover = seg(t, 27.75, 28.35);   // доля экрана, занятая окном гравюры
    if (cover < 1) {
      withCam(ctx, c, 1, x => {
        brickWall(x);
        x.fillStyle = '#A89C88'; x.fillRect(-3000, GROUND, 6000, 800); x.strokeStyle = COL.ink; x.lineWidth = 4; x.beginPath(); x.moveTo(-3000, GROUND); x.lineTo(3000, GROUND); x.stroke();
        barrel(x, 760, GROUND + 40, 1.3); crate(x, -1150, GROUND + 50, 1.2);
        poster(x, t); people(x, t);
      });
      withCam(ctx, c, 1.4, x => { ropeFG(x, 1200, -700, 2200, -500, 120, 18); });
    }
    if (mapOn) {
      // маска: карта раскрывается внутри окна гравюры, окно растёт вместе с наездом камеры
      ctx.save();
      if (cover < 1) {
        const [a, b] = [[ENG.x, ENG.y], [ENG.x + ENG.w, ENG.y + ENG.h]].map(([wx, wy]) => [(wx - c.x) * c.z + W / 2, (wy - c.y) * c.z + H / 2]);
        ctx.beginPath(); ctx.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]); ctx.clip(); ctx.globalAlpha = easeOut(seg(t, 27.75, 28.1));
      }
      drawMapPart(ctx, t); ctx.restore();
    }
  }
  return { t0: 25.5, t1: 31.5, draw, blurWindows: [[25.5, 26.1], [28.15, 29.8], [31.15, 31.5]] };
})();
