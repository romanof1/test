// Сцена 003 · 19.0–25.5 · «Церковь короля»: match cut по шпилю → камера отъезжает, за собором — король-великан,
// его рука лежит на крыше «как на своём». На «подавляла» двери распахиваются, стража выталкивает пуритан.
'use strict';
const S3 = (() => {
  const T0 = 19.0, SP = 4.8;           // масштаб шпиля = финальный масштаб иконки в сцене 002 (match cut)
  const GROUND = 1300, DOOR_T = 22.15;
  function cam(t) {
    let c = { x: keys(t, [[19.0, 0], [21.5, 260], [22.05, 260], [22.9, -150], [24.2, -260], [25.5, -1300]]), y: keys(t, [[19.0, -560], [21.5, -230], [22.05, -230], [22.9, 960], [25.5, 960]]), z: keys(t, [[19.0, 1], [21.5, .43], [22.05, .43], [22.9, .92], [24.2, .94], [25.5, .94]]), r: 0 };
    // нарастающий проезд влево (whip) в конце — склейка со сценой 004 внутри смаза
    if (t > 24.2) c.x = lerp(-260, -1700, easeIn(seg(t, 24.2, 25.5)));
    c.r = keys(t, [[19, 0], [21.5, -1.5], [22.9, 1], [25.5, -2]]);
    return c;
  }
  // ---------- собор (английская готика) ----------
  function cathedral(ctx, t) {
    const stone = '#C9C0B0', stoneD = '#B5AC9C', roof = '#6E7480';
    // неф слева и справа
    for (const s of [-1, 1]) {
      const x0 = s * 163, x1 = s * 1250;
      outlined(ctx, polyPath([[x0, 560], [x1, 560], [x1, GROUND], [x0, GROUND]]), stone, 4);
      outlined(ctx, polyPath([[x0, 560], [x1, 560], [x1 - s * 20, 440], [x0, 300]]), roof, 4);
      for (let k = 0; k < 4; k++) { const wx = x0 + s * (190 + k * 250); // стрельчатые окна
        const wp = new Path2D(); wp.moveTo(wx - 50, 1150); wp.lineTo(wx - 50, 760); wp.quadraticCurveTo(wx - 50, 660, wx, 630); wp.quadraticCurveTo(wx + 50, 660, wx + 50, 760); wp.lineTo(wx + 50, 1150); wp.closePath();
        outlined(ctx, wp, '#7C8C9A', 3.5); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx, 650); ctx.lineTo(wx, 1150); ctx.moveTo(wx - 50, 900); ctx.lineTo(wx + 50, 900); ctx.stroke();
        outlined(ctx, rrPath(wx + 95, 600, 34, GROUND - 600, 3), stoneD, 3); }  // контрфорсы
    }
    // центральная башня
    outlined(ctx, rrPath(-163, 0, 326, GROUND, 2), stone, 4);
    ctx.strokeStyle = 'rgba(43,33,27,.25)'; ctx.lineWidth = 2; for (let y = 120; y < GROUND; y += 110) { ctx.beginPath(); ctx.moveTo(-163, y); ctx.lineTo(163, y); ctx.stroke(); }
    for (const y of [180, 520]) { const wp = new Path2D(); wp.moveTo(-40, y + 200); wp.lineTo(-40, y + 60); wp.quadraticCurveTo(-40, y, 0, y - 20); wp.quadraticCurveTo(40, y, 40, y + 60); wp.lineTo(40, y + 200); wp.closePath(); outlined(ctx, wp, '#5A5048', 3); }
    // шпиль — тот же силуэт, что у иконки в 002
    ctx.save(); ctx.scale(SP, SP); S2.spireIcon(ctx); ctx.restore();
  }
  // двери: распахиваются на «подавляла»
  function doors(ctx, t) {
    const k = easeOutBack(seg(t, DOOR_T, DOOR_T + .35), 2.2);
    const dp = new Path2D(); dp.moveTo(-120, GROUND); dp.lineTo(-120, 1080); dp.quadraticCurveTo(-120, 990, 0, 960); dp.quadraticCurveTo(120, 990, 120, 1080); dp.lineTo(120, GROUND); dp.closePath();
    outlined(ctx, dp, '#2A211B', 4);
    ctx.save(); ctx.clip(dp);
    for (const s of [-1, 1]) { const w = 120 * (1 - k * .82); outlined(ctx, rrPath(s < 0 ? -120 : 120 - w, 950, w, 360, 0), '#7A5A3E', 3); ctx.strokeStyle = '#3B2A20'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(s < 0 ? -120 : 120 - w, 1110); ctx.lineTo(s < 0 ? -120 + w : 120, 1110); ctx.stroke(); }
    ctx.restore();
  }
  // король-великан за собором (2-й план, обобщённый монарх: корона, мантия с горностаем)
  function king(ctx, t) {
    const pose = basePose(); pose.armL = { sh: 60, el: 20, hand: 'open' }; pose.armR = { sh: 15, el: 60, hand: 'open' }; pose.bob = Math.sin(t * 1.3) * .01;
    pose.neck = -6 + Math.sin(t * .9) * 2;
    ctx.save(); ctx.beginPath(); ctx.rect(-4000, -4000, 8000, 4000 + GROUND - 4); ctx.clip();   // король за собором: ниже карниза не виден
    drawChar(ctx, 840, GROUND + 260, 380, { outfit: OUTFIT.king, view: 'front', pose, face: { blink: blinkAt(t, 41) } });
    ctx.restore();
  }
  // кисть короля поверх крыши — «держит» церковь
  function kingHand(ctx, t) {
    const press = Math.sin(t * 1.3) * 6;
    ctx.lineCap = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 104; ctx.beginPath(); ctx.moveTo(560, 250); ctx.lineTo(420, 320 + press); ctx.stroke(); ctx.strokeStyle = '#7A3B2A'; ctx.lineWidth = 88; ctx.stroke();
    outlined(ctx, circlePath(395, 345 + press, 66), COL.white, 6); outlined(ctx, ellipsePath(345, 322 + press, 25, 19, -.5), COL.white, 4);
  }
  // пуритане (3-й план) и стража
  const PUR = [0, 1, 2, 3].map(i => ({ i, out: DOOR_T + .15 + i * .32, v: [1, 4, 2, 1][i] }));
  function people(ctx, t) {
    const ppl = [];
    PUR.forEach(p => { const lt = t - p.out; if (lt < 0) return;
      // вытолкнули: рывок вперёд, спотыкание, затем уходят влево к порту
      const x = -40 - 220 * easeOut(clamp(lt / .5)) - Math.max(0, lt - .5) * 330 - p.i * 30;
      const y = GROUND + 40 + p.i * 14;
      ppl.push({ y, d: () => { const pose = walkPose((lt * 1.8 + p.i * .3) % 1, 1.1); pose.torso = -10; if (p.i === 1) { pose.armR = { sh: 40, el: 60, hand: 'open', prop: lt < .35 ? PROPS.book : null }; }
        drawChar(ctx, x, y, 60, { outfit: crowdOutfit(p.v, { coat: ['#3A3A3E', '#4A4642', '#3E4048', '#45403A'][p.i], hat: p.i === 2 ? 'coif' : 'capotain', collar: '#EFE3CF' }), view: 'side', f: -1, pose }); } });
    });
    // упавшая книга
    const bt = t - (PUR[1].out + .35); if (bt > 0) { const fx = -40 - 220 * .9 - 60, fall = Math.min(1, bt / .3); ppl.push({ y: GROUND + 62, d: () => { ctx.save(); ctx.translate(fx - 20, GROUND - 40 + fall * fall * 100); ctx.rotate(fall * 1.6); PROPS.book(ctx, 0, 0, 0, 1, 70); ctx.restore(); } }); }
    // стражники в дверях: толкающий жест
    for (const s of [-1, 1]) { const push = t > DOOR_T ? Math.max(0, Math.sin(clamp((t - DOOR_T - .1) / .45) * Math.PI)) : 0;
      ppl.push({ y: GROUND + 20, d: () => { const pose = basePose(); pose.armL = { sh: 20 + push * 60, el: 15, hand: 'open' }; pose.armR = { sh: 20 + push * 60, el: 15, hand: 'open' };
        drawChar(ctx, s * 75 - 20 * push, GROUND + 20, 56, { outfit: OUTFIT.guard, view: 'q', f: -1, pose }); } }); }
    // ведущий: стоит слева, указывает на двери, затем уходит влево вместе с изгнанными
    ppl.push({ y: GROUND + 110, d: () => {
      const walkK = seg(t, 24.0, 25.5); const x = 460 - Math.pow(walkK, 1.3) * 1500;
      let pose, view = 'q', f = -1;
      if (t < 22.35) { pose = basePose(); pose.armR = { sh: 10, el: 30, hand: 'open' }; pose.armL = { sh: 12, el: 20, hand: 'open' }; view = 'front'; }
      else if (t < 24.0) { const k = t - 22.35; pose = basePose(); pose.armL = { sh: k < .15 ? -12 * k / .15 : 80 * spring(k - .15, 13, 6) - 12 * (1 - seg(k, .15, .28)), el: 10, hand: 'point' }; pose.armR = { sh: 8, el: 25, hand: 'open' }; }
      else { pose = walkPose((t * 1.6) % 1, .9); view = 'side'; }
      pose.bob = (pose.bob || 0) + idleBob(t, 3);
      drawChar(ctx, x, GROUND + 110, 96, { outfit: NARR(), view, f, pose, face: narratorFace(t, { brows: t > 22.3 && t < 24 ? 'angry' : null, mouth: 'frown' }) });
    } });
    ppl.sort((a, b) => a.y - b.y).forEach(p => p.d());
  }
  function draw(ctx, t) {
    const c = cam(t);
    withCam(ctx, c, .1, x => { skyGrad(x, '#A9B5C0', '#E2DCD0', -1600, 900); cloud(x, -900 + t * 6, -500, 160, .9, '#ECEDEA'); cloud(x, 400 + t * 8, -800, 200, .9, '#ECEDEA'); cloud(x, 1300 + t * 5, -300, 140, .9, '#ECEDEA'); });
    withCam(ctx, c, .4, x => { townRow(x, -2400, 1150, 2.2, 9, '#B0AA9D', '#7E6656'); townRow(x, 600, 1150, 2.2, 13, '#B0AA9D', '#7E6656'); });
    withCam(ctx, c, 1, x => {
      x.fillStyle = '#A89C88'; x.fillRect(-4000, GROUND, 8000, 1200);
      x.strokeStyle = 'rgba(43,33,27,.25)'; x.lineWidth = 2; for (let i = -40; i < 40; i++) { x.beginPath(); x.moveTo(i * 120, GROUND + 30 + (i % 3) * 30); x.lineTo(i * 120 + 60, GROUND + 30 + (i % 3) * 30); x.stroke(); }
      x.strokeStyle = COL.ink; x.lineWidth = 4; x.beginPath(); x.moveTo(-4000, GROUND); x.lineTo(4000, GROUND); x.stroke();
      // DOF: при спуске к дверям король на заднем плане мягчеет
      const kb = 3 * seg(t, 22.1, 22.8);
      layer(x, kb, y => { y.setTransform(x.getTransform()); king(y, t); });
      cathedral(x, t); kingHand(x, t); doors(x, t);
      people(x, t);
    });
    // плашка: «Англиканская церковь» / «глава — монарх» — разворачивается свитком, уходит на 23.5
    const pk = seg(t, 19.4, 20.0) * (1 - seg(t, 23.3, 23.7));
    if (pk > 0) paperPlaque(ctx, 470, 150, 700, 150, pk, (x, k) => {
      text(x, 'Англиканская церковь', 470, 128, { size: 50, color: COL.ink });
      x.globalAlpha = seg(t, 19.9, 20.3); text(x, 'глава — монарх', 470, 182, { size: 32, weight: 400, color: COL.accent, family: FONT.serif }); x.globalAlpha = 1;
    });
  }
  return { t0: 19.0, t1: 25.5, draw, blurWindows: [[19.0, 19.35], [22.05, 22.9], [24.9, 25.5]] };
})();
