// Скриншот одной HTML-страницы проекта: node src/tools/shot.mjs src/refsheet.html out.png
import { chromium } from 'playwright'; import path from 'node:path'; import url from 'node:url';
const [src, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(url.pathToFileURL(path.resolve(src)).href); await p.evaluate(() => window.READY); await p.locator('canvas').screenshot({ path: out }); await b.close();
