// Сцена 005 · 31.5–39.5 · «Смертельно опасно»: корабль в разрезе в ночной шторм — трюм с больными, тусклый фонарь,
// пустое место со шляпой. На «Но их это не останавливало» камера поднимается на палубу, шторм стихает, светлеет.
'use strict';
const S5 = (() => {
  const SS = 2.9;  // масштаб корабля
  function calm(t) { return easeInOut(seg(t, 36.3, 38.6)); }
  function cam(t) {
    const k = seg(t, 31.5, 36.2);
    const c = { x: keys(t, [[31.5, 250], [32.2, 280], [36.2, -260], [37.4, 380], [39.5, 520]]), y: keys(t, [[31.5, 80], [32.2, 70], [36.2, 90], [37.4, -330], [39.5, -300]]), z: keys(t, [[31.5, 2.2], [32.3, 1.02], [36.2, 1.08], [37.4, 1.0], [39.5, .92]], easeInOut), r: 0 };
    c.r = Math.sin(t * 1.1) * 2.2 * (1 - calm(t)) + .5;
    return c;
  }
  function roll(t) { return Math.sin(t * 1.1 + .4) * 4 * (1 - calm(t) * .8); }
  function interior(ctx, t) {
    // окно разреза в ship-local координатах
    const x0 = -235, x1 = 235, y0 = -40, y1 = 58;
    const cut = rrPath(x0, y0, x1 - x0, y1 - y0, 10);
    ctx.save(); ctx.clip(cut);
    ctx.fillStyle = '#5A3E2C'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = 'rgba(20,12,8,.5)'; ctx.lineWidth = 1.2; for (let y = y0 + 8; y < y1; y += 9) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
    // фонарь качается (инерция против крена), тёплое пятно света
    const sw = -roll(t) * 2.2 + Math.sin(t * 2.2) * 6; const flick = .78 + .1 * noise(t * 6, 3) * (1 - seg(t, 34.5, 36)) - .25 * seg(t, 34.3, 35.8);
    const lx = 10 + Math.sin(sw * D2R) * 16, ly = -36 + Math.cos(sw * D2R) * 16;
    const g = ctx.createRadialGradient(lx, ly, 2, lx, ly, 150); g.addColorStop(0, `rgba(255,200,120,${.55 * flick})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    // балки
    for (let bx = x0 + 60; bx < x1; bx += 95) outlined(ctx, rrPath(bx, y0, 8, y1 - y0, 1), '#3B2A20', 1.2);
    outlined(ctx, rrPath(x0, 8, x1 - x0, 5, 1), '#3B2A20', 1.2); // средняя палуба (твиндек)
    // пассажиры (3-й план): лежат вповалку, укрываются; одно место пустое — только шляпа
    const lying = [[-200, 2, 0], [-160, 2, 1], [-118, 2, 2], [60, 2, 4], [130, 2, 0], [-205, 53, 3], [-150, 53, 1], [-60, 53, 2], [90, 53, 4], [160, 53, 1]];
    lying.forEach(([px, py, v], i) => { ctx.save(); ctx.translate(px, py); ctx.rotate(-Math.PI / 2 + .02 * Math.sin(t + i)); const br = Math.sin(t * 2 + i) * .01;
      drawChar(ctx, 0, 0, 9, { outfit: crowdOutfit(v), view: 'front', noShadow: true, pose: { ...basePose(), bob: br, armL: { sh: 5, el: 100 }, armR: { sh: 5, el: 100 } }, face: { eyes: i % 3 ? 'closed' : null } }); ctx.restore();
      if (i % 2 === 0) { outlined(ctx, rrPath(px - 4, py - 13, 30, 9, 3), '#8A7A5E', 1); } });   // одеяла
    // кашляющий больной (лежит, вздрагивает от кашля); мать лежит рядом с ребёнком, укрывая его рукой
    const cough = Math.max(0, Math.sin(t * 7)) * (seg(t, 32.6, 33.2) - seg(t, 34.2, 34.6));
    ctx.save(); ctx.translate(-20, 2 - cough * 2); ctx.rotate(-Math.PI / 2 + cough * .12); drawChar(ctx, 0, 0, 9, { outfit: crowdOutfit(0), view: 'front', noShadow: true, pose: { ...basePose(), armR: { sh: 10, el: 140 } }, face: { eyes: 'closed' } }); ctx.restore();
    ctx.save(); ctx.translate(10, 53); ctx.rotate(-Math.PI / 2); drawChar(ctx, 0, 0, 9, { outfit: crowdOutfit(2, { hat: 'coif' }), view: 'front', noShadow: true, pose: { ...basePose(), armR: { sh: 95, el: 30 } }, face: { eyes: 'closed' } }); ctx.restore();
    ctx.save(); ctx.translate(18, 46); ctx.rotate(-Math.PI / 2); drawChar(ctx, 0, 0, 6, { outfit: crowdOutfit(4, { hat: null }), view: 'front', noShadow: true, pose: { ...basePose(), bob: Math.sin(t * 2) * .01 }, face: { eyes: 'closed' } }); ctx.restore();
    // пустое место на нарах: шляпа (смерть показана условно)
    outlined(ctx, rrPath(-92, -6, 30, 8, 3), '#8A7A5E', 1.2);
    ctx.save(); ctx.translate(-78, -3); ctx.scale(.55, .55); drawHat(ctx, 'capotain', 0, 0, 14, 'front', 1, 2, 3); ctx.restore();
    // бочка с водой и последний сухарь
    barrel(ctx, 205, 2, .28); outlined(ctx, rrPath(196, -22, 10, 5, 2), '#C9A46A', 1);
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(lx, y0); ctx.lineTo(lx, ly - 6); ctx.lineWidth = 1; ctx.stroke();
    outlined(ctx, rrPath(lx - 5, ly - 6, 10, 13, 2), `rgba(255,${190 + 40 * flick},110,1)`, 1.4);
    ctx.restore();
    ctx.lineWidth = 2.6; ctx.strokeStyle = COL.ink; ctx.stroke(cut);
    ctx.strokeStyle = '#E8D9BE'; ctx.lineWidth = 1.2; ctx.stroke(rrPath(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4, 11)); // кромка разреза
  }
  function waves(ctx, t, y, amp, col, speed, ph, alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha; const p = new Path2D(); p.moveTo(-3000, 2000);
    for (let x = -3000; x <= 3000; x += 40) p.lineTo(x, y + Math.sin(x * .004 + t * speed + ph) * amp + Math.sin(x * .011 - t * speed * 1.3 + ph * 2) * amp * .35);
    p.lineTo(3000, 2000); p.closePath(); outlined(ctx, p, col, 4); ctx.restore();
  }
  function draw(ctx, t) {
    const c = cam(t); const k = calm(t);
    const top = k < 1 ? `rgb(${lerp(44, 191, k)},${lerp(53, 210, k)},${lerp(80, 225, k)})` : '#BFD2E1';
    const bot = `rgb(${lerp(70, 246, k)},${lerp(82, 220, k)},${lerp(110, 200, k)})`;
    withCam(ctx, c, .08, x => { skyGrad(x, top, bot, -1500, 500);
      for (let i = 0; i < 6; i++) cloud(x, -1200 + i * 520 + t * (30 - k * 22), -700 + (i % 2) * 180, 220, .9, k < .5 ? '#4A5470' : '#FAFAF7'); });
    withCam(ctx, c, .3, x => { waves(x, t, 300, 40 * (1 - k * .7), k < .5 ? '#3A4A66' : '#7FA3B6', .9, 0); });
    // дождь — косые штрихи, стихает вместе со штормом (без вспышек)
    const ra = (1 - k) * .5; if (ra > 0.02) { ctx.strokeStyle = `rgba(200,210,230,${ra})`; ctx.lineWidth = 2; const r = rng(Math.floor(t * 20)); ctx.beginPath(); for (let i = 0; i < 90; i++) { const x0 = r() * W * 1.2, y0 = r() * H; ctx.moveTo(x0, y0); ctx.lineTo(x0 - 18, y0 + 48); } ctx.stroke(); }
    withCam(ctx, c, 1, x => {
      waves(x, t, 260, 60 * (1 - k * .7), k < .5 ? '#33425E' : '#6E97AD', 1.3, 2);
      x.save(); x.translate(0, 120 + Math.sin(t * 1.1) * 14 * (1 - k * .7)); x.rotate(roll(t) * D2R);
      x.save(); x.scale(SS, SS);
      ship(x, 0, 0, 1, { t, sails: lerp(.45, 1, k), roll: 0 });
      interior(x, t);
      x.restore();
      // капитан у штурвала (2-й план) на корме; ведущий на носу — появляется, когда камера поднимается на палубу
      drawChar(x, -650, -322, 40, { outfit: OUTFIT.captain, view: 'side', f: 1, pose: { ...basePose(), armL: { sh: 60, el: 30 }, armR: { sh: 70, el: 25 }, torso: -roll(t) } });
      outlined(x, circlePath(-600, -355, 26), 'rgba(0,0,0,0)', 5, '#7A5A3E');
      const np = basePose(); np.armR = { sh: 20 + 6 * Math.sin(t), el: 30 }; np.armL = { sh: 10, el: 20 }; np.torso = -roll(t) * .6; np.bob = idleBob(t, 3);
      drawChar(x, 560, -150, 62, { outfit: NARR(), view: t > 37.6 ? 'q' : 'side', f: 1, pose: np, face: narratorFace(t, { brows: t < 37 ? 'sad' : null }) });
      x.restore();
      waves(x, t, 330, 55 * (1 - k * .7), k < .5 ? '#2C3A55' : '#5E8AA2', 1.6, 4);
    });
    // вход: выход из нырка — затемнение рассеивается
    const fin = 1 - seg(t, 31.5, 31.78); if (fin > 0) { ctx.fillStyle = `rgba(44,53,80,${.9 * easeIn(fin)})`; ctx.fillRect(0, 0, W, H); }
  }
  return { t0: 31.5, t1: 39.5, draw, blurWindows: [[31.5, 32.3], [36.3, 37.4]] };
})();
