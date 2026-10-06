// Servidor local con recarga automática: node serve.mjs → http://localhost:5173
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { basename, extname, join, normalize } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname;
const PORT = Number(process.env.PORT) || 5173;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.json': 'application/json' };
const clients = new Set();

const RELOAD = `<script>new EventSource('/__reload').onmessage=()=>{sessionStorage.y=scrollY;location.reload()};addEventListener('load',()=>{if(sessionStorage.y)scrollTo(0,+sessionStorage.y)})</script>`;

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  // Importación: guarda en _import/ lo que se le POSTea (solo desde el navegador local)
  if (path === '/__import') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
    const name = basename(new URL(req.url, 'http://x').searchParams.get('name') || 'file');
    const chunks = [];
    for await (const c of req) chunks.push(c);
    await mkdir(join(ROOT, '_import'), { recursive: true });
    await writeFile(join(ROOT, '_import', name), Buffer.concat(chunks));
    res.writeHead(200).end('ok ' + name);
    return;
  }
  const file = normalize(join(ROOT, path === '/' ? 'index.html' : path));
  if (!file.startsWith(ROOT) || file.includes('node_modules')) { res.writeHead(403).end(); return; }
  try {
    if (!(await stat(file)).isFile()) throw 0;
    let body = await readFile(file);
    if (extname(file) === '.html') body = body.toString().replace('</body>', RELOAD + '</body>');
    const type = TYPES[extname(file)] || 'application/octet-stream';
    // Range requests: los navegadores los usan para reproducir video
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range && extname(file) === '.mp4') {
      const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : body.length - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      res.end(body.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
}).listen(PORT, () => console.log(`Deck en http://localhost:${PORT}`));

let t;
for (const f of ['index.html', 'slides.js', 'render.js', 'styles.css']) {
  watch(join(ROOT, f), () => { clearTimeout(t); t = setTimeout(() => clients.forEach((c) => c.write('data: reload\n\n')), 80); });
}
