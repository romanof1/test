// Сцена 002 · 7.0–19.0 · Наклонная карта Европы: три груза кренят Англию к западу, фигурки соскальзывают к побережью.
'use strict';
const S2 = (() => {
  const T0 = 7.0;
  const HITS = [{ t: 9.5, ang: 4, kind: 'post', at: [-3.5, 52.35] }, { t: 11.5, ang: 8, kind: 'note', at: [-0.4, 52.2] }, { t: 14.5, ang: 14, kind: 'spire', at: [-1.9, 51.75] }];
  const SPIRE = HITS[2].at;
  // Фигурки 3-го плана: старт по всей Англии, цель — реальные порты отплытия эмигрантов (Плимут, Бристоль, Саутгемптон)
  const PORTS = [[-4.25, 50.42], [-2.75, 51.42], [-1.45, 50.93]];
  const R = rng(2024); const FIG = [];
  for (let i = 0; i < 27; i++) {
    let lon, lat; do { lon = -3.0 + R() * 3.9; lat = 51.15 + R() * 2.2; } while ((lon < -2.6 && lat < 51.7) || (lon > .3 && lat > 52.9));
    const port = PORTS[i % 3 === 2 ? (R() < .5 ? 1 : 2) : 0];
    const tl = port[0] + (R() - .5) * .55, tt = port[1] + (R() - .3) * .38;
    FIG.push({ lon, lat, tl, tt, ph: R(), lag: R() * .35, v: i, flip: R() < .5 });
  }
  function tiltAt(t) { let a = 0, prev = 0; for (const h of HITS) { if (t > h.t) a += (h.ang - prev) * spring(t - h.t, 7.5, 3.4); prev = h.ang; } return a; }
  function bounceAt(t) { let b = 0; for (const h of HITS) b += kick(t - h.t, 16, 7) * (h.kind === 'spire' ? 1.6 : 1); return b; }
  // прогресс соскальзывания для каждой фигурки: каждая ступень крена сдвигает толпу дальше к краю
  function slide(fg, t) {
    const steps = [[9.5, .22], [11.5, .5], [14.5, 1]]; let p = 0, prev = 0;
    for (const [ti, v] of steps) { const k = seg(t, ti + .15 + fg.lag, ti + 1.5 + fg.lag * 2); p += (v - prev) * easeInOut(k) ; prev = v; }
    return p;
  }
  function view(t) {
    const k = seg(t, T0, 17.3);
    const base = { lon: lerp(0.5, -2.2, easeInOut(k)), lat: lerp(50.6, 52.4, easeInOut(k)), z: lerp(1.28, 1.95, easeInOut(k)) };
    const shake = bounceAt(t);
    const v = { ...base, r: -tiltAt(t) + noise(t * .4, 3) * .6, squash: .24, sy: shake * 10, sx: noise(t * 9, 7) * Math.abs(shake) * 6 };
    // нырок к шпилю: 17.3 → 19.0, ускорение (переход match cut на собор)
    const d = seg(t, 17.3, 19.0); if (d > 0) {
      const e = easeIn(d);
      v.lon = lerp(base.lon, SPIRE[0], easeInOut(Math.min(1, d * 1.6))); v.lat = lerp(base.lat, SPIRE[1] + .02, easeInOut(Math.min(1, d * 1.6)));
      v.z = base.z * Math.pow(7.5, e); v.r = lerp(v.r, 0, easeInOut(d)); v.squash = lerp(.24, 0, easeInOut(d));
    }
    return v;
  }
  // ---------- грузы-пиктограммы (стиль канала: контур + плоская заливка) ----------
  function weight(ctx, kind, s) {
    ctx.save(); ctx.scale(s, s);
    contactShadow(ctx, 0, 2, 46, .3);
    if (kind === 'post') {
      outlined(ctx, rrPath(-16, -118, 32, 120, 6), '#9A7450', 4);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; for (const y of [-90, -60, -30]) { ctx.beginPath(); ctx.moveTo(-16, y); ctx.lineTo(16, y + 6); ctx.stroke(); }
      outlined(ctx, polyPath([[-22, -118], [0, -140], [22, -118]]), '#B9AFA0', 4);
      outlined(ctx, rrPath(10, -100, 56, 34, 4), COL.paper, 3.5); // табличка межи
      ctx.strokeStyle = '#9A8A70'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, -88); ctx.lineTo(56, -88); ctx.moveTo(20, -78); ctx.lineTo(48, -78); ctx.stroke();
    } else if (kind === 'note') {
      ctx.rotate(-.08);
      outlined(ctx, polyPath([[-50, -112], [44, -116], [50, -4], [-46, 0]]), COL.paper, 4);
      ctx.strokeStyle = '#9A8A70'; ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-34, -96 + i * 15); ctx.lineTo(30 - (i === 4 ? 26 : 0), -97 + i * 15); ctx.stroke(); }
      outlined(ctx, circlePath(24, -24, 15), '#A8332C', 3); outlined(ctx, polyPath([[18, -12], [12, 10], [22, 2], [30, 10], [28, -12]]), '#A8332C', 2.5);
    } else if (kind === 'spire') spireIcon(ctx);
    ctx.restore();
  }
  // Шпиль: тот же силуэт, что у собора в сцене 003 (носитель match cut)
  function spireIcon(ctx) {
    outlined(ctx, rrPath(-34, -70, 68, 72, 2), '#C9C0B0', 4);
    ctx.fillStyle = '#5A5048'; ctx.fill(rrPath(-9, -58, 18, 30, 9));
    outlined(ctx, polyPath([[-40, -70], [40, -70], [34, -82], [-34, -82]]), '#B5AC9C', 3.5);
    outlined(ctx, polyPath([[-30, -82], [0, -196], [30, -82]]), '#6E7480', 4);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -190); ctx.lineTo(0, -84); ctx.stroke();
    outlined(ctx, rrPath(-2.5, -216, 5, 22, 1), COL.gold, 2.2); outlined(ctx, rrPath(-9, -210, 18, 4.5, 1), COL.gold, 2.2);
  }
  function drawHit(ctx, h, t, v) {
    const lt = t - (h.t - .45); if (lt < 0) return;
    const [x, y] = mapToScreen(v, h.at[0], h.at[1]);
    // падение с ускорением, касание, отскок с затуханием (вес)
    const fall = clamp(lt / .45); const drop = (1 - fall * fall) * -900;
    const imp = t - h.t; const sq = imp > 0 ? 1 - kick(imp, 18, 8) * .18 : 1;
    let s = .92 * v.z / 1.6 * (h.kind === 'spire' ? 1.1 : 1);
    let px = x, py = y;
    // нырок: шпиль приводится к экранной позиции и масштабу шпиля собора в 003 (match cut)
    const d = seg(t, 17.3, 19.0);
    if (h.kind === 'spire' && d > 0) { const e = easeInOut(d); const s0 = .92 * 1.95 / 1.6 * 1.1; s = lerp(s0, 4.8, Math.pow(d, 1.8)); px = lerp(x, W / 2, e); py = lerp(y, 1100, e); }
    else if (d > 0) s = Math.min(s, 3.2);
    ctx.save(); ctx.translate(px, py + drop); ctx.rotate((v.r || 0) * D2R); ctx.scale(1 / sq, sq);
    weight(ctx, h.kind, s); ctx.restore();
  }
  function draw(ctx, t) {
    const v = view(t);
    const zr = v.z / 1.6;
    drawMap(ctx, v, { colors: { england: COL.england, ireland: '#EE7468', france: COL.france, spain: COL.spain, netherlands: COL.netherlands } });
    // свет на наклонённой плоскости: опускающийся запад темнеет — крен читается как уклон, а не поворот
    const tl = tiltAt(t) / 14;
    if (tl > 0.01) { const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, `rgba(20,14,10,${.32 * tl})`); g.addColorStop(.55, 'rgba(20,14,10,0)'); g.addColorStop(1, `rgba(255,250,240,${.10 * tl})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    // подписи (screen space через проекцию — не дрожат при движении камеры)
    const la = seg(t, 7.5, 8.4) * (1 - seg(t, 17.4, 17.9));
    if (la > 0) {
      ctx.save(); ctx.globalAlpha = la; const rot = v.r;
      const L = (s, lon, lat, size, o = {}) => { const [x, y] = mapToScreen(v, lon, lat); countryLabel(ctx, s, x, y, size * zr, { rot: rot + (o.rot || 0), color: o.color }); };
      L('Франция', 2.4, 46.9, 64); L('Испания', -3.6, 40.6, 64, { rot: -4 });
      L('Нидерланды', 5.7, 52.5, 30, { color: 'rgba(80,50,70,.6)' }); L('Англия', -1.6, 54.25, 46, { rot: -8 }); L('Шотландия', -4.2, 56.9, 34, { color: 'rgba(154,154,154,.6)' });
      const [ox, oy] = mapToScreen(v, -15.5, 48.5); seaLabel(ctx, 'Атлантический океан', ox, oy, 46 * zr, { rot: rot - 76 });
      ctx.restore();
    }
    // фигурки: стоят «на бумаге», при крене соскальзывают; на ударах подпрыгивают
    const figs = FIG.map(fg => { const p = slide(fg, t); const lon = lerp(fg.lon, fg.tl, p), lat = lerp(fg.lat, fg.tt, p); const [x, y] = mapToScreen(v, lon, lat); return { fg, x, y, p }; }).sort((a, b) => a.y - b.y);
    const fa = 1 - seg(t, 17.5, 18.1);
    for (const { fg, x, y, p } of figs) {
      let hop = 0; for (const h of HITS) hop += Math.max(0, kick(t - h.t - fg.lag * .2, 12, 6)) * 22 * (h.kind === 'spire' ? 1.3 : 1);
      const sliding = HITS.some(h => t > h.t + .15 + fg.lag && t < h.t + 1.5 + fg.lag * 2);
      const pose = sliding ? { ...basePose(), armL: { sh: 70, el: 20, hand: 'open' }, armR: { sh: 70, el: 20, hand: 'open' }, legL: { hip: 14, kn: 20 }, legR: { hip: -10, kn: 8 }, torso: 6 } : { ...basePose(), bob: idleBob(t, fg.v) };
      drawChar(ctx, x, y - hop * zr, 14 * zr, { outfit: crowdOutfit(fg.v), view: sliding ? 'q' : 'front', f: -1, pose, alpha: fa, flip: !sliding && fg.flip });
    }
    for (const h of HITS) drawHit(ctx, h, t, v);
    // облака/дымка над картой (ближе к камере): в начале расходятся — вход из сцены 001
    const cp = seg(t, T0, 8.6);
    if (cp < 1) {
      ctx.save(); const k = easeOut(cp);
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + .3; const d = 120 + k * 1100; cloud(ctx, W / 2 + Math.cos(a) * d * 1.3, H / 2 + Math.sin(a) * d * .8, 360 + i * 20, 1 - seg(cp, .55, 1)); }
      ctx.fillStyle = `rgba(250,250,247,${1 - seg(cp, 0, .35)})`; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    // медальон эпохи: прорывается сквозь облака, вес и затухающая реакция; уходит к 11.2
    const ms = popScale(t - T0 - .05) * (1 - easeIn(seg(t, 9.0, 9.3)));
    if (ms > 0) {
      // отклик среды: облака «расходятся» от медальона, лёгкая волна по карте
      medallion(ctx, W / 2 + 360, 300, 190, 'XVII век', ms);
    }
  }
  // быстрые фазы для motion blur: падения грузов и финальный нырок
  const blurWindows = [[9.05, 9.6], [11.05, 11.6], [14.05, 14.6], [17.7, 19.0]];
  return { t0: 7.0, t1: 19.0, draw, blurWindows, view, spireIcon };
})();
