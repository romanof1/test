// Сцена 001 · 0.0–7.0 · «Не за приключениями»: яркая открытка-«приключение» рвётся, за ней — серая гавань Плимута,
// ведущий, очередь людей с узлами. Выход: камера поднимается над мачтой в облака (→ карта 002).
'use strict';
const S1 = (() => {
  const RIP = 3.6;
  function cam(t) {
    let x = 0, y = 0, z = 1, r = 0;
    z = 1 + .06 * kick(t - RIP, 5, 3) * -1 + .02;
    const a = seg(t, 4.0, 6.2); x = 380 * easeInOut(a); y = -40 * easeInOut(a); r = -1.5 * easeInOut(a); z += .06 * easeInOut(a);
    const up = seg(t, 5.9, 7.0); y += -1700 * easeIn(up); r += 2.5 * easeInOut(up);
    return { x, y, z, r };
  }
  // ---------- открытка ----------
  const CW = 1240, CH = 760;
  function postcardArt(ctx) {
    // нарочно «рекламная» тёплая яркая гамма (единственный такой кадр), но без кислотных цветов
    const g = ctx.createLinearGradient(0, -CH / 2, 0, CH / 2); g.addColorStop(0, '#86C6DC'); g.addColorStop(.55, '#F8E2AE'); g.addColorStop(.56, '#4FA3B8'); g.addColorStop(1, '#2F7F96');
    ctx.fillStyle = g; ctx.fillRect(-CW / 2, -CH / 2, CW, CH);
    outlined(ctx, circlePath(330, -200, 70), '#F4C25A', 3);
    ctx.strokeStyle = '#F4C25A'; ctx.lineWidth = 6; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(330 + Math.cos(a) * 92, -200 + Math.sin(a) * 92); ctx.lineTo(330 + Math.cos(a) * 120, -200 + Math.sin(a) * 120); ctx.stroke(); }
    cloud(ctx, -330, -230, 70); cloud(ctx, 60, -280, 50);
    ship(ctx, -40, 70, .5, { t: 0, sails: 1 });
    // остров с пальмой
    outlined(ctx, ellipsePath(400, 200, 190, 50), '#EED39A', 3);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(420, 190); ctx.quadraticCurveTo(440, 60, 400, -40); ctx.stroke(); ctx.strokeStyle = '#9A7450'; ctx.lineWidth = 13; ctx.stroke();
    for (let i = 0; i < 5; i++) { const a = -Math.PI * .95 + i * .45; outlined(ctx, ellipsePath(400 + Math.cos(a) * 70, -40 + Math.sin(a) * 34, 80, 20, a), '#6FA86A', 3); }
    // сундук с золотом
    outlined(ctx, rrPath(-500, 170, 190, 110, 10), '#9A6A44', 3.5); outlined(ctx, rrPath(-506, 140, 202, 46, 14), '#8A5A3A', 3.5);
    for (let i = 0; i < 9; i++) outlined(ctx, ellipsePath(-480 + i * 20, 136 - (i % 3) * 8, 14, 8), '#F2C14E', 2);
    outlined(ctx, rrPath(-420, 186, 30, 36, 4), '#F2C14E', 2.5);
  }
  function tearLine() { const r = rng(77); const pts = []; for (let i = 0; i <= 14; i++) { const k = i / 14; pts.push([lerp(.06, -.04, k) * CW + (r() - .5) * 34, -CH / 2 - 20 + k * (CH + 40)]); } return pts; }
  const TEAR = tearLine();
  function half(ctx, side, crack) {
    const p = new Path2D(); const E = side < 0 ? -CW / 2 - 30 : CW / 2 + 30;
    p.moveTo(E, -CH / 2 - 30); TEAR.forEach(([x, y]) => p.lineTo(x, y)); p.lineTo(E, CH / 2 + 30); p.closePath();
    ctx.save(); ctx.clip(p);
    ctx.fillStyle = 'rgba(43,33,27,.3)'; ctx.fillRect(-CW / 2 + 10, -CH / 2 + 16, CW, CH);
    ctx.fillStyle = '#FBF5EA'; ctx.fillRect(-CW / 2 - 26, -CH / 2 - 26, CW + 52, CH + 52);
    ctx.strokeStyle = COL.frame; ctx.lineWidth = 4; ctx.strokeRect(-CW / 2 - 26, -CH / 2 - 26, CW + 52, CH + 52);
    postcardArt(ctx);
    ctx.lineWidth = 3; ctx.strokeStyle = COL.ink; ctx.strokeRect(-CW / 2, -CH / 2, CW, CH);
    ctx.restore();
    if (crack) { // рваный край: белые волокна бумаги
      const q = new Path2D(); TEAR.forEach(([x, y], i) => i ? q.lineTo(x, y) : q.moveTo(x, y));
      ctx.strokeStyle = '#FFFDF6'; ctx.lineWidth = 9; ctx.stroke(q); ctx.strokeStyle = 'rgba(43,33,27,.55)'; ctx.lineWidth = 2; ctx.stroke(q);
    }
  }
  function postcard(ctx, t) {
    if (t > RIP + 1.6) return;
    const push = 1 + .05 * easeInOut(seg(t, 0, RIP));
    const tremble = t > 3.25 && t < RIP ? noise(t * 40, 2) * 3 * seg(t, 3.25, RIP) : 0;
    ctx.save(); ctx.translate(W / 2 + tremble, 500); ctx.rotate(-2 * D2R); ctx.scale(push, push);
    if (t < RIP) {
      const crackK = seg(t, 3.42, RIP); // надрыв сверху успевает начаться до разрыва
      half(ctx, -1, false); half(ctx, 1, false);
      if (crackK > 0) { const n = Math.max(2, Math.round(crackK * 5)); const q = new Path2D(); TEAR.slice(0, n).forEach(([x, y], i) => i ? q.lineTo(x, y) : q.moveTo(x, y)); ctx.strokeStyle = '#FFFDF6'; ctx.lineWidth = 7; ctx.stroke(q); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke(q); }
    } else {
      const lt = t - RIP;
      for (const sd of [-1, 1]) {
        ctx.save();
        ctx.translate(sd * (lt * 950 + lt * lt * 500), lt * lt * 1100 - lt * 120);
        ctx.rotate(sd * (lt * 1.1 + lt * lt * .4));
        half(ctx, sd, true); ctx.restore();
      }
    }
    ctx.restore();
  }
  // ---------- гавань ----------
  const QUEUE = [0, 1, 2, 3, 4, 5].map(i => ({ x0: -980 + i * 150, v: i + 20, prop: i % 2 ? 'bundle' : 'bag' }));
  function harbor(ctx, t, c) {
    withCam(ctx, c, .08, x => skyGrad(x, '#B9CBD5', '#F0DCC8', -900, 540));
    withCam(ctx, c, .12, x => { cloud(x, -700 + t * 8, -280, 110, .95); cloud(x, 200 + t * 6, -360, 80, .95); cloud(x, 900 + t * 10, -250, 120, .95); cloud(x, -200 + t * 5, -1150, 150); cloud(x, 500 + t * 5, -1300, 170); });
    withCam(ctx, c, .25, x => { townRow(x, -1250, 120, 1.0, 5); });
    withCam(ctx, c, .35, x => { water(x, 110, 300, '#8FA9B0', t, 3); });
    withCam(ctx, c, .55, x => { ship(x, 520, 190, .62, { t, sails: 0, roll: Math.sin(t * .9) * 1.2 }); });
    // чайки
    withCam(ctx, c, .4, x => { for (let i = 0; i < 4; i++) { const gx = -500 + i * 260 + t * 40, gy = -260 - i * 30 + Math.sin(t * 2 + i) * 8, w = Math.sin(t * 9 + i * 2) * 10; x.strokeStyle = COL.ink; x.lineWidth = 3; x.beginPath(); x.moveTo(gx - 18, gy - w); x.quadraticCurveTo(gx - 8, gy - 8, gx, gy); x.quadraticCurveTo(gx + 8, gy - 8, gx + 18, gy - w); x.stroke(); } });
    withCam(ctx, c, 1, x => {
      planks(x, 260, 600);
      barrel(x, -720, 330, 1.1); barrel(x, -650, 340, 1.0); crate(x, 760, 320, 1.1); crate(x, 830, 300, .9);
      // очередь к кораблю (3-й план): мельче, дальше по оси Y, со сдвигом фазы
      QUEUE.forEach((q, i) => { const xx = q.x0 + t * 60; const ph = (xx / 95 + i * .37) % 1;
        const pose = walkPose(ph, .8); pose.armR = { sh: 30, el: 70, hand: 'open', prop: PROPS[q.prop] };
        drawChar(x, xx, 300, 46, { outfit: crowdOutfit(q.v), view: 'side', f: 1, pose }); });
      // ведущий (1-й план)
      const lt = t - RIP;
      const turn = t > 4.55;
      const pose = basePose();
      if (!turn) { pose.armL = { sh: 18, el: 128, hand: 'open' }; pose.armR = { sh: 18, el: 134, hand: 'open' }; } // руки скрещены на груди
      else {
        // указующий жест: замах назад -> выброс -> фиксация с микро-перелётом
        const k = t - 4.55; const g = k < .18 ? -15 * (k / .18) : 85 * spring(k - .18, 14, 6) - 15 * (1 - seg(k, .18, .3));
        pose.armR = { sh: g, el: 8 + 20 * (1 - seg(k, .18, .5)), hand: 'point' }; pose.armL = { sh: 10, el: 18, hand: 'open' };
      }
      pose.neck = t > 3.9 && t < 4.5 ? Math.sin((t - 3.9) * 22) * 7 * (1 - seg(t, 4.2, 4.5)) : 0; // «нет» — покачивание головой
      pose.bob = idleBob(t, 3);
      const view = turn ? 'q' : 'front';
      drawChar(x, -330, 450, 92, { outfit: NARR(), view, f: 1, pose, face: narratorFace(t, { brows: t > 3.8 && t < 5 ? 'sad' : null }) });
    });
    withCam(ctx, c, 1.5, x => { ropeFG(x, -1300, 470, -420, 560, 70); postFG(x, -1320, 560, 70, 240); });
  }
  function draw(ctx, t) {
    const c = cam(t);
    harbor(ctx, t, c);
    // облака при подъёме — носитель перехода в карту
    const cl = seg(t, 6.25, 7.0);
    if (cl > 0) { for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const d = (1 - easeOut(cl)) * 1300 + 60; cloud(ctx, W / 2 + Math.cos(a) * d * 1.3, H / 2 + Math.sin(a) * d * .8 + (1 - cl) * 500, 380 + i * 18, clamp(cl * 2)); }
      ctx.fillStyle = `rgba(250,250,247,${easeIn(seg(t, 6.7, 7.0))})`; ctx.fillRect(0, 0, W, H); }
    // открытка поверх всего (screen space)
    postcard(ctx, t);
  }
  return { t0: 0, t1: 7.0, draw, blurWindows: [[3.58, 4.7], [6.0, 7.0]] };
})();
