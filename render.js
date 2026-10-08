// Componentes del deck. Cada función devuelve el HTML interno de una slide.

const LOGO = (fill) => `<svg viewBox="0 0 45 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.55147 4.27573C8.55147 1.91431 6.63715 0 4.27573 0C1.91431 0 0 1.91431 0 4.27573V36.2874C0 38.6488 1.91431 40.5631 4.27573 40.5631C6.63715 40.5631 8.55147 38.6488 8.55147 36.2874V4.27573Z" fill="${fill}"/>
<path d="M21.5906 1.54191C19.3549 -0.252191 16.0882 0.10573 14.2941 2.34135C12.5 4.57696 12.8579 7.84369 15.0936 9.63779L33.5374 24.4391C35.773 26.2332 39.0398 25.8752 40.8339 23.6396C42.628 21.404 42.27 18.1373 40.0344 16.3432L21.5906 1.54191Z" fill="${fill}"/>
<path d="M15.1334 30.9174C12.8794 32.6884 12.4879 35.9512 14.2588 38.2052C16.0298 40.4592 19.2927 40.8507 21.5466 39.0798L40.142 24.4693C42.396 22.6983 42.7875 19.4354 41.0166 17.1814C39.2456 14.9275 35.9827 14.5359 33.7287 16.3069L15.1334 30.9174Z" fill="${fill}"/>
<path d="M38.5846 41.2008C41.6244 41.2008 44.0887 38.7072 44.0887 35.6311C44.0887 32.5551 41.6244 30.0614 38.5846 30.0614C35.5448 30.0614 33.0806 32.5551 33.0806 35.6311C33.0806 38.7072 35.5448 41.2008 38.5846 41.2008Z" fill="${fill}"/>
</svg>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// *texto* → cursiva Newsreader
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em class="it">$1</em>');
const nn = (i) => String(i + 1).padStart(2, '0');

function header(s) {
  return `<div class="header">
    <div class="kicker-row"><div class="kicker">${rich(s.kicker)}</div>${LOGO('white')}</div>
    <div class="titles">
      <div class="h-title">${rich(s.title)}</div>
      ${s.subtitle ? `<div class="h-sub">${rich(s.subtitle)}</div>` : ''}
    </div>
  </div>`;
}

const withBody = (s, inner) => `<div class="body">${header(s)}<div class="content">${inner}</div></div><div class="sep"></div>`;
const secTitle = (s) => (s.section ? `<div class="sec-title">${rich(s.section)}</div>` : '');

// Fila con cinta. item: 'texto' | ['texto', 'tag'] | { t: 'título', d: 'descripción', tag }
const row = (item) => {
  const o = typeof item === 'string' ? { t: item } : Array.isArray(item) ? { t: item[0], tag: item[1] } : item;
  const body = o.d
    ? `<div class="step-body"><div class="step-title">${rich(o.t)}</div><div class="step-desc">${rich(o.d)}</div></div>`
    : `<div class="row-title">${rich(o.t)}</div>`;
  return `<div class="row"><div class="ribbon"></div>${body}${o.tag ? `<div class="row-tag">${rich(o.tag)}</div>` : ''}</div>`;
};

// Paso numerado (Method Step)
const step = ([t, d], i) => `<div class="step"><div class="badge">${nn(i)}</div><div class="step-body"><div class="step-title">${rich(t)}</div>${d ? `<div class="step-desc">${rich(d)}</div>` : ''}</div></div>`;

const T = {
  cover: (s) => `
    <div class="cover-left" style="left:64px;width:1114.47px">
      <div class="cover-kicker it">${rich(s.kicker).replace(/<\/?em[^>]*>/g, '')}</div>
      <div class="cover-title">${rich(s.title)}</div>
    </div>
    <div class="cover-foot" style="left:64px">${rich(s.foot)}</div>
    <img class="abs bleed-r" src="assets/cover-shader.png" style="--x:1242.47px">
    <div class="abs" style="left:1418.36px;top:390.52px;width:324.82px;height:303.54px">${LOGO('black').replace('<svg', '<svg width="100%" height="100%"')}</div>`,

  section: (s) => {
    const [x, y, w, h] = s.logoBox;
    return `
    <div class="cover-left" style="left:78px;width:1200px">
      <div class="cover-kicker it">${rich(s.kicker).replace(/<\/?em[^>]*>/g, '')}</div>
      <div class="cover-title">${rich(s.title)}</div>
    </div>
    <div class="cover-foot" style="left:78px">${rich(s.foot)}</div>
    <img class="abs" src="assets/${s.logo}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">`;
  },

  list: (s) => withBody(s, `${secTitle(s)}<div class="rows" style="gap:${s.gap ?? 24}px">${s.items.map(row).join('')}</div>`),

  cards: (s) => {
    const rows = [];
    for (let i = 0; i < s.items.length; i += 2) rows.push(`<div class="grid-row">${s.items.slice(i, i + 2).map(row).join('')}</div>`);
    const grid = `<div class="grid">${rows.join('')}</div>`;
    const inner = s.section ? `<div style="display:flex;flex-direction:column;gap:8px">${secTitle(s)}${grid}</div>` : grid;
    // box: replica un contenedor de alto fijo del original (contenido anclado arriba dentro de una caja centrada)
    return withBody(s, s.box ? `<div class="fixed-box" style="height:${s.box}px">${inner}</div>` : inner);
  },

  // cols: 2 → grilla de dos columnas
  steps: (s) => withBody(s, `${secTitle(s)}<div class="steps${s.cols === 2 ? ' two' : ''}" style="gap:${s.gap ?? 24}px">${s.items.map(step).join('')}</div>`),

  // Logos de clientes + filas con cinta
  clients: (s) => withBody(s, `${secTitle(s)}
    <div class="logos">${s.logos.map(([file, alt]) => `<div class="logo-card"><img src="assets/logos/${file}" alt="${esc(alt)}"></div>`).join('')}</div>
    <div class="rows" style="gap:24px;margin-top:16px">${s.items.map(row).join('')}</div>`),

  quote: (s) => withBody(s, `<div class="quote"><div class="quote-row"><div class="ribbon"></div><div class="quote-text">${rich(s.text)}</div></div></div>`),

  gantt: (s) => {
    const W = 175; // px por semana
    const weeks = Array.from({ length: 8 }, (_, i) => `<div class="g-week">S${i + 1}</div>`).join('');
    const lines = '<i></i>'.repeat(9);
    const rows = s.rows.map(([name, start, len, op, big], i) => `
      <div class="g-row">
        <div class="g-label"><div class="g-n">${nn(i)}</div><div class="g-t">${rich(name)}</div></div>
        <div class="g-track"><div class="g-bar${big ? ' big' : ''}" style="left:${start * W}px;width:${len * W}px;opacity:${op ?? 1}"></div></div>
      </div>`).join('');
    // bands: [{ from, len, label, text }] → franjas sombreadas (ej. participación del cliente)
    const bands = (s.bands || []).map((b) => `<div class="g-band" style="left:${320 + b.from * W}px;width:${b.len * W}px"></div>`).join('');
    const bandRow = s.bands ? `
      <div class="g-row g-client">
        <div class="g-label"><div class="g-k">${rich(s.bandsLabel || '')}</div></div>
        <div class="g-track">${s.bands.map((b) => `<div class="g-band-txt" style="left:${b.from * W}px;width:${b.len * W}px"><div class="g-k w">${rich(b.label)}</div><div class="g-t">${rich(b.text)}</div></div>`).join('')}</div>
      </div>` : '';
    return withBody(s, `${s.note ? `<div class="note">${rich(s.note)}</div>` : ''}
      <div class="gantt">
        <div class="g-months"><div class="lbl"></div>${s.months.map((m) => `<div class="g-month">${rich(m)}</div>`).join('')}</div>
        <div class="g-weeks"><div class="lbl"></div>${weeks}</div>
        <div class="g-body">${bands}<div class="g-lines">${lines}</div><div class="g-rows">${rows}${bandRow}</div></div>
      </div>`);
  },

  // Cierre de cada iniciativa: espacio de preguntas + decisión (avanzamos / no avanzamos)
  decision: (s) => withBody(s, `
    <div class="facts">${s.facts.map(([k, v]) => `<div class="fact"><div class="fact-k">${rich(k)}</div><div class="fact-v">${rich(v)}</div></div>`).join('')}</div>
    <div class="choices">
      <div class="choice yes"><div class="choice-i">✓</div><div><div class="choice-t">Avanzamos</div><div class="choice-d">${rich(s.yes)}</div></div></div>
      <div class="choice no"><div class="choice-i">✕</div><div><div class="choice-t">No avanzamos</div><div class="choice-d">${rich(s.no)}</div></div></div>
    </div>`),

  // Video explicativo a pantalla completa. En el PDF se muestra el cuadro final (poster).
  video: (s) => document.body.classList.contains('print')
    ? `<img class="vid" src="assets/video/${s.src}-poster.jpg" alt="">`
    : `<video class="vid" src="out/video/${s.src}.mp4" poster="assets/video/${s.src}-poster.jpg" muted playsinline preload="auto"></video>
       <button class="replay" type="button">↻ Ver de nuevo</button>
       <div class="sep"></div>`,

  closing: (s) => `
    <img class="abs" src="assets/logo-close.png" style="left:872.5px;top:458px;width:175px;height:164px">
    <div class="closing-text"><div class="it">${rich(s.kicker).replace(/<\/?em[^>]*>/g, '')}</div><div class="b">${rich(s.title)}</div></div>`,
};

const total = () => window.SLIDES.length;

function renderDeck() {
  const deck = document.getElementById('deck');
  deck.innerHTML = window.SLIDES.map((s, i) => `
    <div class="screen">
      <div class="frame" id="s${i + 1}">
        <section class="slide theme-${s.theme || 'deck'}"><div class="stage">${T[s.type](s)}</div></section>
      </div>
    </div>`).join('');
  // Lo que debe llegar a los bordes de la pantalla (franja inferior, panel de portada) sale del lienzo 16:9
  deck.querySelectorAll('.stage > .sep, .stage > .bleed-r').forEach((el) => el.closest('.slide').prepend(el)); // detrás del contenido
  fit();
  setupVideos();
  setupNav();
}

// Los videos arrancan desde el principio cada vez que se entra a su slide y se pausan al salir
function setupVideos() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.6 });
  document.querySelectorAll('video.vid').forEach((v) => {
    io.observe(v);
    const btn = v.parentElement.querySelector('.replay');
    v.addEventListener('ended', () => btn.classList.add('show'));
    v.addEventListener('play', () => btn.classList.remove('show'));
    btn.onclick = () => { v.currentTime = 0; v.play(); };
  });
}

// Cada slide ocupa la pantalla entera: el contenido 16:9 se escala para entrar completo
// y el lienzo se extiende en la dirección que sobra (fondo y franjas llegan a los bordes).
function fit() {
  if (document.body.classList.contains('print')) return;
  const { clientWidth: w, clientHeight: h } = document.documentElement; // sin la barra de scroll
  const scale = Math.min(w / 1920, h / 1080);
  document.querySelectorAll('.frame').forEach((f) => {
    f.style.setProperty('--scale', scale);
    f.style.setProperty('--cw', `${w / scale}px`);
    f.style.setProperty('--ch', `${h / scale}px`);
  });
}

// Navegación: barra flotante (anterior / contador / siguiente / pantalla completa) + teclado
const current = () => Math.round(window.scrollY / window.innerHeight);
let navUpdate = () => {};
const go = (i) => { window.scrollTo({ top: Math.max(0, Math.min(total() - 1, i)) * window.innerHeight, behavior: 'instant' }); navUpdate(); };

function setupNav() {
  if (document.body.classList.contains('print') || document.querySelector('.nav')) return;
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `<button class="prev" aria-label="Slide anterior">‹</button><span class="count"></span><button class="next" aria-label="Slide siguiente">›</button><button class="fs" aria-label="Pantalla completa">⤢</button>`;
  document.body.appendChild(nav);
  const count = nav.querySelector('.count');
  const update = navUpdate = () => {
    const i = current();
    count.textContent = `${i + 1} / ${total()}`;
    nav.querySelector('.prev').disabled = i === 0;
    nav.querySelector('.next').disabled = i === total() - 1;
  };
  nav.querySelector('.prev').onclick = () => go(current() - 1);
  nav.querySelector('.next').onclick = () => go(current() + 1);
  nav.querySelector('.fs').onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  window.addEventListener('scroll', update, { passive: true });
  update();
  // Se oculta sola tras unos segundos sin mover el mouse
  let idle;
  const wake = () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2500); };
  ['mousemove', 'pointerdown', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
  wake();
}

window.addEventListener('keydown', (e) => {
  if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(current() + 1); }
  if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current() - 1); }
  if (e.key === 'Home') { e.preventDefault(); go(0); }
  if (e.key === 'End') { e.preventDefault(); go(total() - 1); }
  if (e.key === 'f') document.querySelector('.nav .fs')?.click();
});

if (new URLSearchParams(location.search).has('print')) document.body.classList.add('print');
renderDeck();
window.addEventListener('resize', fit);
