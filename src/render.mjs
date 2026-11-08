// Рендер кадров: каждый кадр i вычисляется по времени i / FPS (без записи realtime-playback).
// usage: node src/render.mjs <outDir> [startSec] [endSec] [workers] [step]
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const [outDir = 'out/frames', s0 = '0', s1 = '58', nw = '4', st = '1'] = process.argv.slice(2);
const FPS = 60; const a = Math.round(+s0 * FPS), b = Math.round(+s1 * FPS), step = +st;
fs.mkdirSync(outDir, { recursive: true });
const page_url = url.pathToFileURL(path.resolve('src/index.html')).href;
const frames = []; for (let i = a; i < b; i += step) frames.push(i);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
const t0 = Date.now(); let done = 0;
const workers = Array.from({ length: +nw }, async (_, w) => {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(page_url); await page.evaluate(() => window.READY);
  for (let j = w; j < frames.length; j += +nw) {
    const i = frames[j];
    await page.evaluate(t => window.frame(t), i / FPS);
    await page.locator('#c').screenshot({ path: path.join(outDir, `f${String(i).padStart(5, '0')}.png`) });
    if (++done % 120 === 0) console.log(`${done}/${frames.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
  }
  if (w === 0) { const log = await page.evaluate(() => RIG_LOG); fs.writeFileSync(path.join(outDir, 'rig_log.json'), JSON.stringify(log)); }
  await page.close();
});
await Promise.all(workers); await browser.close();
console.log(`done ${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
