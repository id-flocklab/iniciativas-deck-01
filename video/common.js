// Runtime compartido: reproducción, "seek" determinístico para renderizar, y piezas gráficas.

window.LOGO_SVG = '<svg viewBox="0 0 45 42"><g fill="#fff"><path d="M8.55 4.28a4.28 4.28 0 0 0-8.55 0v32a4.28 4.28 0 0 0 8.55 0v-32Z"/><path d="M21.59 1.54a5.16 5.16 0 0 0-6.5 8.1l18.45 14.8a5.16 5.16 0 0 0 6.5-8.1L21.59 1.54Z"/><path d="M15.13 30.92a5.16 5.16 0 1 0 6.41 8.16l18.6-14.61a5.16 5.16 0 1 0-6.41-8.16l-18.6 14.61Z"/><circle cx="38.58" cy="35.63" r="5.5"/></g></svg>';

// Operario de perfil (mirando a la derecha). Brazos animados con clases arm-f / arm-b.
// opts.glasses: dibuja gafas de RA (clase "glasses" para animarlas aparte)
window.workerSVG = (opts = {}) => `
  <defs>
    <linearGradient id="gTorso" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#2c2c2c"/></linearGradient>
    <linearGradient id="gLimb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#424242"/><stop offset="1" stop-color="#2e2e2e"/></linearGradient>
  </defs>
  <g class="worker-dim">
    <ellipse cx="282" cy="606" rx="120" ry="12" fill="#121212"/>
    <path d="M274 388 L256 494 L250 586" stroke="#262626" stroke-width="40"/>
    <rect x="232" y="580" width="62" height="22" rx="10" fill="#161616"/>
    <g class="arm-b"><path d="M262 210 L300 294 L384 318" stroke="#272727" stroke-width="30"/><circle cx="388" cy="318" r="15" fill="#272727"/></g>
    <path d="M290 388 L302 494 L306 586" stroke="url(#gLimb)" stroke-width="42"/>
    <rect x="290" y="580" width="68" height="22" rx="10" fill="#1c1c1c"/>
    <path d="M238 196 Q228 270 236 398 L316 398 Q324 300 320 200 Q304 174 278 174 Q252 174 238 196 Z" fill="url(#gTorso)"/>
    <path d="M244 300 L314 300 L313 318 L242 318 Z" fill="#5a5a5a"/>
    <path d="M240 352 L316 352 L316 366 L239 366 Z" fill="#5a5a5a"/>
    <rect x="264" y="146" width="24" height="34" rx="8" fill="#363636"/>
    <circle cx="276" cy="124" r="34" fill="#3c3c3c"/>
    <path d="M240 118 A36 36 0 0 1 312 112 L326 116 Q328 122 320 122 L238 124 Z" fill="#d6d6d6"/>
    <g class="arm-f"><path d="M292 208 L332 300" stroke="#454545" stroke-width="34"/><path d="M332 300 L420 330" stroke="#3f3f3f" stroke-width="30"/><circle cx="426" cy="331" r="17" fill="#454545"/></g>
  </g>
  ${opts.glasses ? `<g class="glasses"><rect x="282" y="116" width="34" height="16" rx="6" fill="#111" stroke="var(--accent)" stroke-width="3"/><path d="M282 124 L250 122" stroke="#111" stroke-width="5"/><circle cx="310" cy="112" r="5" fill="var(--accent)"/></g>` : ''}`;

// Proyección isométrica: (x, y, z) en unidades de mundo → pantalla
window.iso = (x, y, z, s = 1) => [(x - y) * 0.866 * s, (x + y) * 0.5 * s - z * s];
// Caja isométrica como 3 polígonos (techo, frente izq., frente der.)
window.isoBox = (x, y, z, w, d, h, color, s = 1) => {
  const P = (a, b, c) => iso(a, b, c, s).join(',');
  const shade = (c, k) => { const n = parseInt(c.slice(1), 16); const f = (v) => Math.round(Math.min(255, v * k)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  return `<polygon points="${P(x, y, z + h)} ${P(x + w, y, z + h)} ${P(x + w, y + d, z + h)} ${P(x, y + d, z + h)}" fill="${shade(color, 1.15)}"/>
    <polygon points="${P(x, y + d, z)} ${P(x + w, y + d, z)} ${P(x + w, y + d, z + h)} ${P(x, y + d, z + h)}" fill="${shade(color, .8)}"/>
    <polygon points="${P(x + w, y, z)} ${P(x + w, y + d, z)} ${P(x + w, y + d, z + h)} ${P(x + w, y, z + h)}" fill="${shade(color, .6)}"/>`;
};

// Reproductor + seek determinístico. onSeek(t) para cosas que no son animaciones CSS (contadores, etc.)
window.setupVideo = (DURATION, onSeek = () => {}) => {
  const anims = () => document.getAnimations();
  window.__seek = (t) => { anims().forEach((a) => { a.pause(); a.currentTime = t * 1000; }); onSeek(t); };
  window.__duration = DURATION;
  if (new URLSearchParams(location.search).has('render')) { document.body.classList.add('render'); window.__seek(0); return; }
  const stage = document.getElementById('stage');
  const fit = () => { const s = Math.min((innerWidth - 40) / 1920, (innerHeight - 90) / 1080); stage.style.transform = `scale(${s})`; stage.style.marginBottom = `${-1080 * (1 - s)}px`; stage.style.marginRight = `${-1920 * (1 - s)}px`; };
  fit(); addEventListener('resize', fit);
  const bar = document.createElement('div'); bar.className = 'controls';
  bar.innerHTML = '<button>▶ Reproducir</button><span>0.0 s</span>'; document.body.appendChild(bar);
  const [btn, label] = bar.children;
  let start = null, raf;
  const loop = (ts) => { if (start === null) start = ts; const t = (ts - start) / 1000; window.__seek(Math.min(t, DURATION)); label.textContent = t.toFixed(1) + ' s'; if (t < DURATION) raf = requestAnimationFrame(loop); };
  btn.onclick = () => { cancelAnimationFrame(raf); start = null; raf = requestAnimationFrame(loop); };
  window.__seek(0);
  document.fonts.ready.then(() => btn.click());
};
