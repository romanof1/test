// Риг персонажа в стиле канала (чиби ≈ 2.6 головы). Иерархия: root -> pelvis -> torso -> neck -> head;
// shoulder -> upper_arm -> forearm -> hand; thigh -> shin -> foot. Углы в градусах.
// Ограничения суставов (§5.3) — clamp + журнал нарушений для QA.
'use strict';
const JOINT = { elbow: [0, 145], knee: [0, 140], shoulder: [-60, 170], neck: [-30, 30], wrist: [-40, 40], torso: [-15, 15] };
const RIG_LOG = { violations: 0, samples: [] };
function J(name, v) {
  const [a, b] = JOINT[name]; if (v < a - 1e-6 || v > b + 1e-6) { RIG_LOG.violations++; if (RIG_LOG.samples.length < 20) RIG_LOG.samples.push(`${name}=${v.toFixed(1)}`); }
  return clamp(v, a, b);
}
// Наборы одежды
const OUTFIT = {
  // Ведущий: канонический облик концепта №3 (волосы, лицо, пропорции, палитра), костюм перенесён в XVII в.:
  // дублет с баской вместо камзола XVIII в., отложной воротник-«фолинг бэнд» вместо жабо, бриджи и сапоги с отворотом.
  narrator: { tier: 1, hair: '#6E4A32', hairStyle: 'curly', coat: '#2E3530', vest: '#8A2E2A', trim: '#E0A84A', collar: '#EFE3CF', legs: '#3B2A20', boots: '#3B2A20', style: 'doublet' },
  king: { tier: 2, hair: '#8A6A4A', hairStyle: 'short', coat: '#7A3B2A', belt: '#E0A84A', collar: '#EFE3CF', legs: '#3B2A20', boots: '#3B2A20', style: 'robe', hat: 'crown' },
  bishop: { tier: 2, hair: '#D8D0C0', hairStyle: 'short', coat: '#EFE3CF', belt: '#7A3B2A', legs: '#3B2A20', boots: '#3B2A20', style: 'robe', hat: 'mitre' },
  guard: { tier: 3, hair: '#4A3A2E', hairStyle: 'short', coat: '#7A3B2A', belt: '#4A3A2E', legs: '#4A3A2E', boots: '#3B2A20', style: 'tunic', hat: 'morion' },
  captain: { tier: 2, hair: '#4A3A2E', hairStyle: 'short', coat: '#3E4A5C', belt: '#3B2A20', legs: '#3B2A20', boots: '#3B2A20', style: 'tunic', hat: 'capotain', beard: '#4A3A2E' },
  recruiter: { tier: 2, hair: '#3B2A20', hairStyle: 'short', coat: '#7A3B2A', belt: '#3B2A20', legs: '#3B2A20', boots: '#3B2A20', style: 'tunic', hat: 'cavalier' },
};
// Вариации 3-го плана (толпа): холодная приглушённая палитра, 5 вариантов
const CROWD = [
  { coat: '#5E6E8A', hair: '#4A3A2E', hat: null },
  { coat: '#6E6A5A', hair: '#6E4A32', hat: 'capotain' },
  { coat: '#7A5E4A', hair: '#3B2A20', hat: 'coif' },
  { coat: '#5A6A5E', hair: '#8A6A4A', hat: null },
  { coat: '#4E5566', hair: '#2E241C', hat: 'capotain' },
].map(o => ({ tier: 3, hairStyle: 'short', belt: '#4A3A2E', legs: '#4A3A2E', boots: '#3B2A20', style: 'tunic', collar: '#E9D8BE', ...o }));
function crowdOutfit(i, extra = {}) { return { ...CROWD[((i % 5) + 5) % 5], ...extra }; }

// Поза по умолчанию
function basePose() {
  return { armL: { sh: 8, el: 10, hand: 'open' }, armR: { sh: 8, el: 10, hand: 'open' }, legL: { hip: 0, kn: 0 }, legR: { hip: 0, kn: 0 }, torso: 0, neck: 0, bob: 0 };
}
// Цикл ходьбы: противофаза рук и ног, колено гнётся только назад; ph — фаза 0..1
function walkPose(ph, amp = 1) {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  const p = basePose();
  p.legL.hip = 24 * s * amp; p.legR.hip = -24 * s * amp;
  p.legL.kn = Math.max(0, 38 * -c * amp) + 4; p.legR.kn = Math.max(0, 38 * c * amp) + 4;
  p.armL.sh = -22 * s * amp + 4; p.armR.sh = 22 * s * amp + 4; p.armL.el = 18; p.armR.el = 18;
  p.bob = Math.abs(Math.cos(ph * Math.PI * 2)) * 0.06 * amp; return p;
}
function idleBob(t, seed) { return Math.sin((t + hash(seed) * 2) * 2.1) * 0.012; }

// ---------- основная функция ----------
// x,y — точка опоры (между стопами на земле), R — радиус головы в px
// o: {outfit, view:'front'|'q'|'side'|'back', f:±1, pose, face:{mouth, brows, blink, talk}, prop, alpha}
function drawChar(ctx, x, y, R, o) {
  const of = o.outfit, tier = of.tier || 1, view = o.view || 'front', f = o.f || 1;
  const pose = o.pose || basePose(); const face = o.face || {};
  const LW = tier === 1 ? Math.max(2, R * .085) : Math.max(1.4, R * .075);   // внешний контур
  const lw = LW * .55;                                                       // внутренние линии
  ctx.save(); ctx.translate(x, y);
  if (o.flip) ctx.scale(-1, 1);      // отражается вся иерархия целиком
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  // контактная тень
  contactShadow(ctx, 0, 0, R * 1.05, .2);
  const bob = (pose.bob || 0) * R;
  ctx.translate(0, -bob);
  const hipY = -1.45 * R, neckY = -3.15 * R;
  const tor = J('torso', pose.torso || 0);
  // ракурс: смещение деталей и порядок слоёв
  const turn = view === 'front' ? 0 : view === 'q' ? .55 : view === 'side' ? 1 : 0;
  const isBack = view === 'back';
  const shW = .72 * R * (1 - turn * .32);
  const legSpread = .36 * R * (1 - turn * .55);
  // стороны: s = -1 (экранно-левая), +1 (правая); дальняя сторона в 3/4/профиль = +f
  const sides = [-1, 1];
  const far = s => turn > 0 && s === f;
  const limbs = { L: -1, R: 1 };
  const arm = s => (s === -1 ? pose.armL : pose.armR);
  const leg = s => (s === -1 ? pose.legL : pose.legR);

  // ---- ноги ----
  const drawLeg = (s) => {
    const lg = leg(s); const hx = s * legSpread + (turn ? -f * .05 * R : 0);
    const fwd = turn > 0 ? f : 0;
    const hip = clamp(lg.hip || 0, -60, 100); const kn = J('knee', lg.kn || 0);
    const L1 = .72 * R, L2 = .66 * R;
    const a1 = hip * D2R, a2 = (hip - kn) * D2R;           // голень назад — колено вперёд
    const kx = hx + Math.sin(a1) * L1 * (fwd ? f : 1), ky = hipY + Math.cos(a1) * L1;
    const ax = kx + Math.sin(a2) * L2 * (fwd ? f : 1), ay = ky + Math.cos(a2) * L2;
    const w = tier === 1 ? .36 * R : .38 * R;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pth = new Path2D(); pth.moveTo(hx, hipY); pth.lineTo(kx, ky); pth.lineTo(ax, ay);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = w + LW * 2; ctx.stroke(pth);
    ctx.strokeStyle = of.legs; ctx.lineWidth = w; ctx.stroke(pth);
    // сапог: голенище + стопа по направлению ракурса
    const bt = new Path2D(); bt.moveTo(kx + (ax - kx) * .35, ky + (ay - ky) * .35); bt.lineTo(ax, ay);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = w * 1.12 + LW * 2; ctx.stroke(bt);
    ctx.strokeStyle = of.boots; ctx.lineWidth = w * 1.12; ctx.stroke(bt);
    const footDir = turn > 0 ? f : s * .35;
    const foot = ellipsePath(ax + footDir * R * .16, ay + R * .02, R * (turn > 0 ? .3 : .22), R * .14, 0);
    outlined(ctx, foot, of.boots, LW);
    if (tier === 1 && of.style === 'doublet') { // отворот сапога
      const cx0 = kx + (ax - kx) * .38, cy0 = ky + (ay - ky) * .38;
      outlined(ctx, ellipsePath(cx0, cy0, w * .78, R * .09), '#4E3A2C', lw);
    }
  };
  // ---- руки ----
  const drawArm = (s, behind) => {
    const am = arm(s); if (!am) return;
    const sx = s * shW + (turn ? -f * .04 * R : 0), sy = neckY + .22 * R;
    const sh = J('shoulder', am.sh || 0), el = J('elbow', am.el || 0);
    const out = turn > 0 ? f : s;                 // направление подъёма: вперёд (профиль) или наружу (анфас)
    const bendSign = turn > 0 ? 1 : -1;           // локоть: вперёд-вверх (профиль) или внутрь (анфас)
    const a1 = sh * D2R, a2 = (sh + bendSign * el) * D2R;
    const L1 = .7 * R, L2 = .62 * R;
    const ex = sx + Math.sin(a1) * L1 * out, ey = sy + Math.cos(a1) * L1;
    const wx = ex + Math.sin(a2) * L2 * out, wy = ey + Math.cos(a2) * L2;
    const w = .3 * R;
    const sleeve = of.coat;
    const pth = new Path2D(); pth.moveTo(sx, sy); pth.lineTo(ex, ey); pth.lineTo(wx, wy);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = COL.ink; ctx.lineWidth = w + LW * 2; ctx.stroke(pth);
    ctx.strokeStyle = sleeve; ctx.lineWidth = w; ctx.stroke(pth);
    if (tier === 1 && of.trim) { // галун на манжете
      const cx0 = ex + (wx - ex) * .78, cy0 = ey + (wy - ey) * .78, cx1 = ex + (wx - ex) * .9, cy1 = ey + (wy - ey) * .9;
      ctx.strokeStyle = of.trim; ctx.lineWidth = w * .92; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(cx1, cy1); ctx.stroke(); ctx.lineCap = 'round';
    }
    // кисть: «рукавичка» с большим пальцем; указательный жест — отдельный спрайт
    const dx = wx - ex, dy = wy - ey, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
    const hx = wx + ux * R * .14, hy = wy + uy * R * .14;
    const hr = R * .2;
    if (am.hand === 'point') {
      const fp = new Path2D(); fp.moveTo(hx, hy); fp.lineTo(hx + ux * R * .34, hy + uy * R * .34);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = R * .11 + LW * 2; ctx.stroke(fp); ctx.strokeStyle = COL.white; ctx.lineWidth = R * .11; ctx.stroke(fp);
    }
    outlined(ctx, circlePath(hx, hy, hr), COL.white, LW * .9);
    if (tier === 1) outlined(ctx, ellipsePath(hx - uy * hr * .8 * out, hy + ux * hr * .8 * out, hr * .38, hr * .28, Math.atan2(uy, ux)), COL.white, lw);
    if (am.prop) am.prop(ctx, hx, hy, ux, uy, R);
  };
  // ---- корпус ----
  const drawTorso = () => {
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(tor * D2R); ctx.translate(0, -hipY);
    const hemY = of.style === 'robe' ? -.25 * R : of.style === 'doublet' ? -1.15 * R : -1.05 * R;
    const hemW = of.style === 'robe' ? .95 * R : of.style === 'doublet' ? .82 * R : .74 * R;
    const sh = shW + .06 * R;
    const body = smoothPath([[-sh * .92, neckY - .05 * R], [-sh, neckY + .25 * R], [-shW * .86, -2.2 * R], [-hemW, hemY], [hemW, hemY], [shW * .86, -2.2 * R], [sh, neckY + .25 * R], [sh * .92, neckY - .05 * R]]);
    outlined(ctx, body, of.coat, LW);
    const cxo = turn * f * .22 * R; // центр груди смещается в 3/4
    if (!isBack) {
      if (of.style === 'doublet') {
        // жилет-вставка, пуговицы, галун по подолу (детализация 1-го плана)
        outlined(ctx, smoothPath([[cxo - .2 * R, neckY + .25 * R], [cxo + .2 * R, neckY + .25 * R], [cxo + .18 * R, -1.3 * R], [cxo - .18 * R, -1.3 * R]]), of.vest, lw);
        for (let i = 0; i < 4; i++) outlined(ctx, circlePath(cxo + .07 * R, neckY + .5 * R + i * .36 * R, .05 * R), of.trim, lw * .7);
        ctx.strokeStyle = of.trim; ctx.lineWidth = R * .06; ctx.beginPath(); ctx.moveTo(-hemW * .95, hemY - .06 * R); ctx.lineTo(hemW * .95, hemY - .06 * R); ctx.stroke();
        ctx.strokeStyle = COL.ink; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(cxo - .2 * R, neckY + .3 * R); ctx.lineTo(cxo - .24 * R, hemY); ctx.moveTo(cxo + .2 * R, neckY + .3 * R); ctx.lineTo(cxo + .24 * R, hemY); ctx.stroke();
      }
      if (of.belt) { ctx.strokeStyle = COL.ink; ctx.lineWidth = R * .16 + lw * 2; ctx.beginPath(); ctx.moveTo(-shW * .84, -1.75 * R); ctx.lineTo(shW * .84, -1.75 * R); ctx.stroke(); ctx.strokeStyle = of.belt; ctx.lineWidth = R * .16; ctx.stroke(); }
      if (of.style === 'robe' && of.hat === 'crown') { // горностаевая опушка мантии
        ctx.strokeStyle = COL.ink; ctx.lineWidth = R * .2 + lw * 2; ctx.beginPath(); ctx.moveTo(-hemW + .05 * R, hemY - .08 * R); ctx.lineTo(hemW - .05 * R, hemY - .08 * R); ctx.stroke(); ctx.strokeStyle = '#F4EFE6'; ctx.lineWidth = R * .2; ctx.stroke();
        ctx.fillStyle = COL.ink; for (let i = -3; i <= 3; i++) ctx.fill(circlePath(i * .25 * R, hemY - .08 * R, .025 * R));
      }
      if (of.style === 'robe' && of.hat === 'mitre') { ctx.strokeStyle = '#C9A94A'; ctx.lineWidth = R * .14; ctx.beginPath(); ctx.moveTo(cxo, neckY + .2 * R); ctx.lineTo(cxo, hemY); ctx.stroke(); }
    }
    ctx.restore();
  };
  // воротник (отложной, XVII в.)
  const drawCollar = () => {
    if (!of.collar || isBack) return;
    const cxo = turn * f * .2 * R;
    const cw = tier === 1 ? .55 * R : .38 * R;
    const c = smoothPath([[cxo - cw, neckY - .02 * R], [cxo + cw, neckY - .02 * R], [cxo + cw * .9, neckY + .3 * R], [cxo + .05 * R, neckY + .42 * R], [cxo - .05 * R, neckY + .42 * R], [cxo - cw * .9, neckY + .3 * R]]);
    outlined(ctx, c, of.collar, lw * 1.2);
    if (tier === 1) { ctx.strokeStyle = COL.ink; ctx.lineWidth = lw * .8; ctx.beginPath(); ctx.moveTo(cxo, neckY); ctx.lineTo(cxo, neckY + .4 * R); ctx.stroke(); }
  };
  // ---- голова ----
  const drawHead = () => {
    const neck = J('neck', pose.neck || 0);
    const hcY = neckY - .9 * R;
    ctx.save(); ctx.translate(0, neckY); ctx.rotate((neck + tor * .5) * D2R); ctx.translate(0, -neckY);
    const hx = turn * f * .04 * R;
    const hair = of.hair, style = of.hairStyle;
    // волосы сзади (за головой)
    if (!isBack) {
      if (style === 'curly') {
        const back = [];
        const bx = -f * turn * .3 * R;
        for (let i = 0; i < 9; i++) { const a = (200 + i * 17.5) * D2R; back.push([hx + bx + Math.cos(a) * .9 * R, hcY + .15 * R + Math.sin(a) * .55 * R + .35 * R, .34 * R]); }
        back.push([hx + bx - .82 * R * (turn ? f : 1), hcY + .38 * R, .36 * R], [hx + bx + .82 * R * (turn ? -f * .2 : 1), hcY + .38 * R, .36 * R]);
        blobUnion(ctx, back, hair, LW * .7);
      }
    }
    // лицо
    outlined(ctx, circlePath(hx, hcY, R), COL.skin, LW);
    if (of.beard && !isBack) { const bx0 = hx + turn * f * .3 * R; blobUnion(ctx, [[bx0, hcY + .72 * R, .32 * R], [bx0 - .22 * R, hcY + .58 * R, .2 * R], [bx0 + .22 * R, hcY + .58 * R, .2 * R]], of.beard, lw); }
    if (!isBack) {
      const fx = hx + (view === 'front' ? 0 : view === 'q' ? .34 * R * f : .58 * R * f);
      const sp = view === 'front' ? .33 * R : view === 'q' ? .26 * R : 0;
      const ey = hcY + .06 * R;
      const bl = face.blink || 0;
      const eyesClosed = face.eyes === 'closed' || bl > .5;
      const eyeR = tier === 1 ? [.075 * R, .13 * R] : [.07 * R, .07 * R];
      const eyeList = view === 'side' ? [fx] : [fx - sp, fx + sp];
      eyeList.forEach((ex, i) => {
        const shrink = view === 'q' && ((i === 0 && f > 0) || (i === 1 && f < 0)) ? .85 : 1;
        if (eyesClosed) { ctx.strokeStyle = COL.ink; ctx.lineWidth = lw * 1.2; ctx.beginPath(); ctx.arc(ex, ey, eyeR[0] * 1.4, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
        else { ctx.fillStyle = '#1A1410'; ctx.fill(ellipsePath(ex, ey, eyeR[0] * shrink, eyeR[1] * (1 - bl * .9))); }
      });
      // брови — только при эмоции
      if (face.brows && tier === 1) {
        ctx.strokeStyle = COL.ink; ctx.lineWidth = lw * 1.4; ctx.lineCap = 'round';
        eyeList.forEach((ex, i) => { const side = view === 'side' ? -f : (i === 0 ? -1 : 1); const inner = face.brows === 'angry' ? .06 : face.brows === 'sad' ? -.06 : 0;
          ctx.beginPath(); ctx.moveTo(ex - side * .1 * R, ey - .2 * R - inner * R); ctx.lineTo(ex + side * .1 * R, ey - .2 * R + inner * R); ctx.stroke(); });
      }
      // рот (у 2-го/3-го плана обычно отсутствует)
      if (tier === 1) {
        const mx = fx + (view === 'side' ? .1 * R * f : 0), my = hcY + .44 * R;
        const talk = face.talk || 0; const m = face.mouth || 'neutral';
        ctx.strokeStyle = COL.ink; ctx.lineWidth = lw * 1.2; ctx.lineCap = 'round';
        if (talk > .08 || m === 'open' || m === 'shout') {
          const oh = m === 'shout' ? .16 * R : (.04 + talk * .1) * R;
          outlined(ctx, ellipsePath(mx, my + oh * .3, .09 * R, oh), '#5A2A22', lw);
          ctx.fillStyle = '#C8605A'; ctx.fill(ellipsePath(mx, my + oh * .8, .05 * R, oh * .35));
        } else if (m === 'smile') { ctx.beginPath(); ctx.arc(mx, my - .06 * R, .1 * R, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
        else if (m === 'frown') { ctx.beginPath(); ctx.arc(mx, my + .08 * R, .09 * R, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
        else { ctx.beginPath(); ctx.moveTo(mx - .06 * R, my); ctx.lineTo(mx + .06 * R, my); ctx.stroke(); }
      }
    }
    // волосы спереди / сверху
    const hc = [];
    const shift = isBack ? 0 : -f * turn * .2 * R;
    if (isBack) { hc.push([hx, hcY + .05 * R, R * 1.02]); for (let i = 0; i < 10; i++) { const a = (180 + i * 20) * D2R; hc.push([hx + Math.cos(a) * .85 * R, hcY + Math.sin(a) * .85 * R + .2 * R, .32 * R]); } }
    else if (style === 'curly') {
      // линия роста волос выше глаз: лоб и глаза открыты, как на каноническом листе
      for (let i = 0; i < 8; i++) { const a = (196 + i * 21.1) * D2R; hc.push([hx + shift + Math.cos(a) * .86 * R, hcY + Math.sin(a) * .8 * R - .2 * R, .35 * R]); }
      hc.push([hx + shift, hcY - .72 * R, .52 * R]);
      // боковые локоны — со стороны затылка крупнее (в 3/4 закрывают ухо)
      for (const s of [-1, 1]) { const back = turn && s === -f; const k = back ? 1.25 : (turn ? .6 : 1);
        if (turn >= 1 && !back) continue;   // в профиль локон со стороны лица не рисуется — глаз открыт
        hc.push([hx + s * .9 * R * (back ? 1 : 1 - turn * .2), hcY + .12 * R, .27 * R * k], [hx + s * .86 * R * (back ? 1 : 1 - turn * .2), hcY + .42 * R, .22 * R * k]); }
    } else {
      for (let i = 0; i < 7; i++) { const a = (200 + i * 23) * D2R; hc.push([hx + shift + Math.cos(a) * .84 * R, hcY + Math.sin(a) * .78 * R - .18 * R, .3 * R]); }
      hc.push([hx + shift, hcY - .66 * R, .5 * R]);
      for (const s of [-1, 1]) { const back = turn && s === -f; if (!turn || back) hc.push([hx + s * .86 * R, hcY + .05 * R, .22 * R * (back ? 1.3 : 1)]); }
    }
    if (!(of.hat === 'coif')) blobUnion(ctx, hc, hair, LW * .75);
    drawHat(ctx, of.hat, hx + (isBack ? 0 : turn * f * .08 * R), hcY, R, view, f, LW, tier);
    ctx.restore();
  };

  // порядок слоёв (z-order): дальние конечности за корпусом, ближние — перед ним
  const legOrder = turn > 0 ? [f, -f] : [-1, 1];
  if (isBack) { // со спины: руки за корпусом не видны целиком — рисуем до корпуса
    sides.forEach(s => drawLeg(s)); sides.forEach(s => drawArm(s, true)); drawTorso(); drawHead();
  } else {
    if (turn > 0) drawArm(f, true);
    legOrder.forEach(s => drawLeg(s));
    drawTorso(); drawCollar();
    if (turn === 0) sides.forEach(s => drawArm(s)); else drawArm(-f);
    drawHead();
    if (o.front) o.front(ctx, R);
  }
  ctx.restore();
}

// Головные уборы: привязаны к кости head и ракурсу (§5.3)
function drawHat(ctx, hat, x, hcY, R, view, f, LW, tier) {
  if (!hat) return;
  const top = hcY - R * .78;
  if (hat === 'crown') {
    // корона ровно и по центру головы
    const w = R * .78, h = R * .55;
    const p = polyPath([[x - w, top + h * .2], [x - w * .95, top - h * .55], [x - w * .5, top - h * .05], [x, top - h * .75], [x + w * .5, top - h * .05], [x + w * .95, top - h * .55], [x + w, top + h * .2]]);
    outlined(ctx, p, COL.gold, LW * .9);
    outlined(ctx, rrPath(x - w, top + h * .05, w * 2, h * .32, 4), '#C98A2E', LW * .7);
    [[-w * .5, top + h * .2, '#8A2E2A'], [0, top + h * .2, '#3E5C8A'], [w * .5, top + h * .2, '#8A2E2A']].forEach(([dx, yy, c]) => outlined(ctx, circlePath(x + dx, yy, R * .07), c, LW * .4));
    outlined(ctx, circlePath(x, top - h * .75, R * .07), COL.gold, LW * .5);
  } else if (hat === 'capotain') {
    // высокая шляпа с полями, без пряжки (пряжка — миф XIX в.)
    const bw = R * 1.25, bh = R * .2, cw = R * .62, ch = R * .95;
    outlined(ctx, ellipsePath(x, top + R * .08, bw, bh), '#2E2A26', LW * .8);
    outlined(ctx, smoothPath([[x - cw, top + R * .05], [x - cw * .85, top - ch], [x + cw * .85, top - ch], [x + cw, top + R * .05]]), '#2E2A26', LW * .8);
    ctx.strokeStyle = '#5A4A3A'; ctx.lineWidth = R * .1; ctx.beginPath(); ctx.moveTo(x - cw * .97, top - R * .08); ctx.lineTo(x + cw * .97, top - R * .08); ctx.stroke();
  } else if (hat === 'coif') {
    // чепец (женская фигура толпы)
    blobUnion(ctx, [[x, hcY - R * .25, R * .95], [x - R * .8, hcY + R * .2, R * .35], [x + R * .8, hcY + R * .2, R * .35]], '#EFE3CF', LW * .7);
  } else if (hat === 'mitre') {
    const p = polyPath([[x - R * .55, top + R * .15], [x - R * .45, top - R * .8], [x, top - R * 1.15], [x + R * .45, top - R * .8], [x + R * .55, top + R * .15]]);
    outlined(ctx, p, '#EFE3CF', LW * .8); ctx.strokeStyle = '#C9A94A'; ctx.lineWidth = R * .12; ctx.beginPath(); ctx.moveTo(x, top + R * .1); ctx.lineTo(x, top - R * 1.05); ctx.stroke();
  } else if (hat === 'morion') {
    // шлем-морион: гребень по центру, поля симметричны
    outlined(ctx, ellipsePath(x, top + R * .12, R * 1.15, R * .22), '#8C8F94', LW * .8);
    outlined(ctx, ellipsePath(x, top - R * .12, R * .7, R * .55), '#A4A7AC', LW * .8);
    outlined(ctx, ellipsePath(x, top - R * .55, R * .12, R * .3), '#8C8F94', LW * .6);
  } else if (hat === 'cavalier') {
    // широкополая шляпа с пером; перо — всегда с задней стороны относительно лица
    outlined(ctx, ellipsePath(x, top + R * .05, R * 1.3, R * .24), '#3B2A20', LW * .8);
    outlined(ctx, ellipsePath(x, top - R * .25, R * .62, R * .42), '#3B2A20', LW * .8);
    const fx = x - (view === 'front' ? .4 : .55 * f) * R;
    outlined(ctx, ellipsePath(fx, top - R * .45, R * .18, R * .5, -.6 * (view === 'front' ? 1 : f)), '#EFE3CF', LW * .5);
  }
}

// ---------- предметы в руках (привязаны к кости hand) ----------
const PROPS = {
  book: (ctx, x, y, ux, uy, R) => { outlined(ctx, rrPath(x - R * .22, y - R * .3, R * .44, R * .5, 3), '#3B2A20', R * .05); ctx.strokeStyle = COL.gold; ctx.lineWidth = R * .04; ctx.beginPath(); ctx.moveTo(x, y - R * .22); ctx.lineTo(x, y + R * .1); ctx.moveTo(x - R * .1, y - R * .1); ctx.lineTo(x + R * .1, y - R * .1); ctx.stroke(); },
  bundle: (ctx, x, y, ux, uy, R) => { ctx.strokeStyle = COL.ink; ctx.lineWidth = R * .08; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - R * .9, y - R * .9); ctx.stroke(); blobUnion(ctx, [[x - R * .95, y - R * .75, R * .32], [x - R * .75, y - R * .85, R * .25]], '#C9B79C', R * .05); },
  hoe: (ctx, x, y, ux, uy, R) => { ctx.strokeStyle = COL.ink; ctx.lineWidth = R * .14; ctx.beginPath(); ctx.moveTo(x, y + R * .6); ctx.lineTo(x, y - R * 1.6); ctx.stroke(); ctx.strokeStyle = '#8A6A4A'; ctx.lineWidth = R * .08; ctx.stroke(); outlined(ctx, polyPath([[x, y - R * 1.6], [x + R * .45, y - R * 1.5], [x + R * .45, y - R * 1.3], [x, y - R * 1.42]]), '#8C8F94', R * .05); },
  sword: (ctx, x, y, ux, uy, R) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-.5); outlined(ctx, rrPath(-R * .05, -R * 1.6, R * .1, R * 1.5, 2), '#C8CCD2', R * .04); outlined(ctx, rrPath(-R * .25, -R * .12, R * .5, R * .09, 2), COL.gold, R * .04); ctx.restore(); },
  note: (ctx, x, y, ux, uy, R) => { ctx.save(); ctx.translate(x, y - R * .25); ctx.rotate(.15); outlined(ctx, rrPath(-R * .3, -R * .35, R * .6, R * .55, 2), COL.paper, R * .04); ctx.strokeStyle = '#9A8A70'; ctx.lineWidth = R * .03; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-R * .2, -R * .22 + i * R * .12); ctx.lineTo(R * .2, -R * .22 + i * R * .12); ctx.stroke(); } outlined(ctx, circlePath(R * .14, R * .1, R * .08), '#A8332C', R * .03); ctx.restore(); },
  chain: (ctx, x, y, ux, uy, R) => { ctx.strokeStyle = '#6E7176'; ctx.lineWidth = R * .05; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x - ux * R * .1 + i * R * .06, y + R * .1 + i * R * .14, R * .07, R * .045, .4, 0, Math.PI * 2); ctx.stroke(); } },
  scroll: (ctx, x, y, ux, uy, R) => { outlined(ctx, rrPath(x - R * .28, y - R * .34, R * .56, R * .62, 4), COL.paper, R * .04); },
  bag: (ctx, x, y, ux, uy, R) => { blobUnion(ctx, [[x, y + R * .35, R * .32], [x, y + R * .1, R * .16]], '#B8A07A', R * .04); },
};
