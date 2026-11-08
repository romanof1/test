// Таймлайн ролика и renderAt(t): выбор сцены, субкадровый motion blur (накопление подкадров).
'use strict';
const SCENE_LIST = () => ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'].map(n => { try { return eval(n); } catch (e) { return null; } }).filter(Boolean);
function sceneAt(t) { const L = SCENE_LIST(); for (const s of L) if (t >= s.t0 && t < s.t1) return s; return L[L.length - 1]; }
function drawPlain(ctx, t) {
  const s = sceneAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  s.draw(ctx, t);
}
function blurSamples(t) {
  const s = sceneAt(t); const w = s.blurWindows || [];
  for (const [a, b] of w) if (t >= a && t <= b) return 5;
  return 1;
}
// 180° shutter: подкадры в пределах половины длительности кадра
function renderAt(ctx, t) {
  const n = blurSamples(t);
  if (n === 1) { drawPlain(ctx, t); return n; }
  const acc = scratch(1), ax = acc.getContext('2d'); const sub = scratch(2), sx = sub.getContext('2d');
  const sc = sceneAt(t);
  for (let k = 0; k < n; k++) {
    // подкадры не выходят за границы текущей сцены — склейка остаётся чистой
    const tt = clamp(t + (k / (n - 1) - .5) * (0.5 / FPS), sc.t0, sc.t1 - 1e-4);
    sx.setTransform(1, 0, 0, 1, 0, 0); drawPlain(sx, tt);
    ax.globalAlpha = 1 / (k + 1); ax.drawImage(sub, 0, 0);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(acc, 0, 0);
  return n;
}
window.renderAt = renderAt;
