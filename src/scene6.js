// Сцена 006 · 39.5–48.5 · «Кто они»: перекличка на палубе. Пять типажей выходят по одному на своё слово,
// у каждого атрибут и бумажная багажная бирка. На «костяк будущей нации» — строй плечом к плечу. Выход: впереди берег.
'use strict';
const S6 = (() => {
  const DECK = 330;
  const TYPES = [
    { word: 'Крестьяне', t: 39.8, x: -820, outfit: crowdOutfit(2, { coat: '#7A5E4A', hat: null, hair: '#8A6A4A' }), prop: 'hoe', arm: 'R' },
    { word: 'Диссиденты', t: 41.3, x: -410, outfit: crowdOutfit(1, { coat: '#3E3E44', hat: 'capotain', collar: '#EFE3CF' }), prop: 'book', arm: 'R' },
    { word: 'Авантюристы', t: 42.8, x: 0, outfit: crowdOutfit(0, { coat: '#3E5C4A', hat: 'cavalier' }), prop: 'sword', arm: 'R' },
    { word: 'Должники', t: 43.9, x: 410, outfit: crowdOutfit(3, { coat: '#6E6A5A', hat: null }), prop: 'note', arm: 'R' },
    { word: 'Преступники', t: 45.0, x: 820, outfit: crowdOutfit(4, { coat: '#4E5566', hat: null, hair: '#2E241C' }), prop: 'chain', arm: 'L' },
  ];
  function cam(t) {
    // боковой трекинг вдоль строя: волны скорости — задержка на типаже, перелёт к следующему
    const xs = TYPES.map(p => [p.t + .1, p.x * .9]);
    const ks = [[39.5, -1100], ...xs.flatMap(([tt, x]) => [[tt - .25, x], [tt + .85, x + 60]]), [46.3, 900], [47.3, 0], [48.5, 900]];
    const c = { x: keysSmooth(t, ks), y: keys(t, [[39.5, 190], [46.3, 190], [47.3, 120], [48.5, 100]]), z: keys(t, [[39.5, 1.0], [46.2, 1.04], [47.3, .66], [48.5, .7]]), r: keys(t, [[39.5, -1], [43, 1], [46, -1], [48.5, 1.5]]) };
    if (t > 47.6) c.x = lerp(0, 1800, easeIn(seg(t, 47.6, 48.5)));
    return c;
  }
  // бумажная бирка на шнурке: раскачивается и затухает
  function tag(ctx, x, y, label, k, t0, t) {
    if (k <= 0) return;
    const sw = kick(t - t0, 6, 2.2) * 26 + Math.sin(t * 1.7 + x) * 2;
    const tw = textWidth(ctx, label, 34) + 46;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw * D2R); ctx.scale(1.2 * easeOutBack(k), 1.2 * easeOutBack(k));
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.stroke();
    ctx.fillStyle = 'rgba(43,33,27,.22)'; ctx.fill(polyPath([[-tw / 2 + 6, 56], [tw / 2 + 6, 56], [tw / 2 + 6, 120], [-tw / 2 + 6, 120], [-tw / 2 - 12 + 6, 88]]));
    outlined(ctx, polyPath([[-tw / 2, 48], [tw / 2, 48], [tw / 2, 112], [-tw / 2, 112], [-tw / 2 - 18, 80]]), COL.paper, 3, COL.frame);
    outlined(ctx, circlePath(-tw / 2 + 4, 80, 6), COL.paper2, 2, COL.frame);
    text(ctx, label, 8, 82, { size: 34, color: COL.ink });
    ctx.restore();
  }
  function scene(ctx, t) {
    // палуба, фальшборт, море и небо
    ctx.fillStyle = '#A68A62'; ctx.fillRect(-4000, DECK, 8000, 1200);
    ctx.strokeStyle = 'rgba(43,33,27,.3)'; ctx.lineWidth = 2; for (let i = -40; i < 40; i++) { ctx.beginPath(); ctx.moveTo(i * 130, DECK); ctx.lineTo(i * 180, DECK + 900); ctx.stroke(); }
    outlined(ctx, rrPath(-4000, DECK - 120, 8000, 120, 0), '#8A5A3A', 4);
    ctx.fillStyle = '#E0A84A'; ctx.fillRect(-4000, DECK - 120, 8000, 8);
    for (let i = -20; i < 20; i++) outlined(ctx, rrPath(i * 240 - 12, DECK - 150, 24, 150, 4), '#7A5A3E', 3);
    const types = TYPES.map((p, i) => {
      const k = seg(t, p.t - .25, p.t + .25);       // шаг вперёд на звучание слова
      const fwd = 30 + 70 * easeOutBack(k, 1.6);
      const line = seg(t, 46.2, 46.9);
      return { p, i, k, y: DECK + 40 + fwd, line };
    });
    // ведущий — у правого края строя, указывает на типажи
    const np = basePose(); const g = t - 40.0; np.armL = { sh: g > 0 ? 75 * spring(g, 11, 6) : 10, el: 10, hand: 'point' }; np.armR = { sh: 10, el: 25 }; np.bob = idleBob(t, 3);
    if (t > 46.3) { np.armL = { sh: lerp(75, 12, seg(t, 46.3, 46.8)), el: 20, hand: 'open' }; }
    const all = [...types.map(o => ({ y: o.y, d: () => {
      const { p, k, y, line } = o;
      const pose = basePose(); pose.bob = idleBob(t, p.x);
      const arm = { sh: 25, el: 70, hand: 'open', prop: PROPS[p.prop] };
      if (p.prop === 'hoe') { arm.sh = 20; arm.el = 25; }
      if (p.prop === 'chain') { arm.sh = 10; arm.el = 20; }
      if (p.arm === 'R') pose.armR = arm; else pose.armL = arm;
      if (k > 0 && k < 1) { pose.legL = { hip: 20 * Math.sin(k * Math.PI), kn: 25 * Math.sin(k * Math.PI) }; pose.bob += .05 * Math.sin(k * Math.PI); }
      const view = line > .5 || k > .9 ? 'front' : 'q';
      drawChar(ctx, p.x, y, 66, { outfit: p.outfit, view, f: 1, pose, face: { blink: blinkAt(t, 50 + o.i) } });
      tag(ctx, p.x + 70, y - 66 * 3.1, p.word, seg(t, p.t - .2, p.t + .15), p.t, t);
    } })),
    { y: DECK + 150, d: () => drawChar(ctx, 1260, DECK + 150, 92, { outfit: NARR(), view: 'q', f: -1, pose: np, face: narratorFace(t) }) }];
    all.sort((a, b) => a.y - b.y).forEach(o => o.d());
  }
  function draw(ctx, t) {
    const c = cam(t);
    withCam(ctx, c, .06, x => { skyGrad(x, '#BFE3EE', '#F6DCC8', -900, 120); for (let i = 0; i < 6; i++) cloud(x, -1500 + i * 600 + t * 12, -420 + (i % 2) * 120, 120 + (i % 3) * 30); });
    withCam(ctx, c, .2, x => {
      water(x, 100, 300, '#7FA3B6', t, 9, -4000, 4000);
      // берег впереди (справа) — показывается к концу сцены: вход в 007
      const sh = seg(t, 46.8, 48.5); if (sh > 0) { x.save(); x.globalAlpha = sh; blobUnion(x, [[3000, 110, 260], [3300, 90, 300], [3650, 120, 240], [3900, 105, 280]], '#8FAFA6', 3); x.restore(); }
    });
    withCam(ctx, c, .55, x => { // мачты и паруса над фальшбортом
      for (const mx of [-1300, 200, 1600]) { outlined(x, rrPath(mx - 18, -1600, 36, 1900, 8), '#7A5A3E', 4);
        const p = new Path2D(); const b = 30 + Math.sin(t * 1.3 + mx) * 10; p.moveTo(mx - 360, -1200); p.lineTo(mx + 360, -1200); p.quadraticCurveTo(mx + 380 + b * .3, -900, mx + 340, -620); p.quadraticCurveTo(mx, -620 + b * 2, mx - 340, -620); p.quadraticCurveTo(mx - 380 - b * .3, -900, mx - 360, -1200); outlined(x, p, '#EFE3CF', 4); }
    });
    withCam(ctx, c, 1, x => scene(x, t));
    withCam(ctx, c, 1.5, x => { ropeFG(x, -2400, -900, -900, 820, 200, 20); ropeFG(x, 1500, -1000, 2600, 800, 160, 18); });
  }
  return { t0: 39.5, t1: 48.5, draw, blurWindows: [[47.7, 48.5]] };
})();
