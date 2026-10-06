// Uso:
//   node build.mjs            → renderiza cada slide a out/png/NN.png
//   node build.mjs pdf        → además exporta out/IyD-Flock-Labs-2026.pdf
//   node build.mjs 3 7        → solo esas slides (útil al iterar)
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const wantPdf = args.includes('pdf');
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const url = pathToFileURL(resolve('index.html')).href + '?print';
mkdirSync('out/png', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);

const n = await page.$$eval('.frame', (els) => els.length);
for (let i = 1; i <= n; i++) {
  if (only.length && !only.includes(i)) continue;
  const el = await page.$(`#s${i} > .slide`);
  await el.screenshot({ path: `out/png/${String(i).padStart(2, '0')}.png` });
}
console.log(`render ok: ${only.length || n} slides`);

if (wantPdf) {
  await page.pdf({ path: 'out/IyD-Flock-Labs-2026.pdf', width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  console.log('pdf ok: out/IyD-Flock-Labs-2026.pdf');
}
await browser.close();
