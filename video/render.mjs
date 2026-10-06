// Graba un video HTML a MP4 cuadro por cuadro.
// Uso: node video/render.mjs cv            → out/video/cv.mp4
//      node video/render.mjs cv 3 9 15     → solo capturas (PNG) en esos segundos, para revisar
import puppeteer from 'puppeteer-core';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [name = 'cv', ...stills] = process.argv.slice(2);
const FPS = 30;
const outDir = resolve('out/video');
const frames = resolve(`out/video/${name}-frames`);
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(pathToFileURL(resolve(`video/${name}.html`)).href + '?render', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
const stage = await page.$('#stage');

if (stills.length) {
  for (const s of stills) {
    await page.evaluate((t) => window.__seek(t), Number(s));
    await stage.screenshot({ path: `${outDir}/${name}-${s}s.png` });
  }
  console.log('stills ok');
} else {
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const duration = await page.evaluate(() => window.__duration);
  const total = Math.round(duration * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.__seek(t), i / FPS);
    await stage.screenshot({ path: `${frames}/${String(i).padStart(4, '0')}.png` });
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${frames}/%04d.png`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', `${outDir}/${name}.mp4`]);
  rmSync(frames, { recursive: true, force: true });
  console.log(`video ok: out/video/${name}.mp4 (${duration}s)`);
}
await browser.close();
