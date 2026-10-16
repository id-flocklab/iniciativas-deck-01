// Piezas comunes de las figuras del deck: modo embebido, pasos y bucle de animación por fases.
export const EMBED_CSS = `
body.embed { --anatomy-page: #000; background: #000; --anatomy-lit: var(--accent, #fff); }
body.embed .iso-page { width: 100%; margin: 0; }
body.embed .iso-plate { --anatomy-card: #000; background: #000; box-shadow: none; padding: 0 0 44px; }
body.embed .iso-plate-corner[data-corner="fig"], body.embed .iso-plate-corner[data-corner="title"] { display: none; }
body.embed .iso-plate-corners { inset: auto 0 0 0; height: 30px; }
body.embed .iso-plate-corner { font-size: 16px; }
body.embed .iso-plate-corner[data-corner="readout"] { color: var(--anatomy-strong); }
body.embed .iso-legend, body.embed .iso-caption { display: none; }
body.embed .iso-stage svg { display: block; width: 100%; height: auto; max-height: calc(100vh - 235px); }
body.embed .steps { font-size: 22px; gap: 10px; margin-top: 18px; }
.steps { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 6px; font: 13px/1.4 system-ui, sans-serif; }
.steps li { display: flex; gap: 10px; color: var(--anatomy-lo); cursor: pointer; transition: color .3s; }
.steps li b { font-weight: 500; min-width: 16px; }
.steps li[data-on] { color: var(--anatomy-hi); }
.fx-led { fill: var(--anatomy-faint); transition: fill .4s; }
.fx-led[data-on="1"] { fill: var(--anatomy-lit); filter: drop-shadow(0 0 2px var(--anatomy-lit)); }
`;

export const stepsHtml = (steps) => `<ol class="steps">${steps.map((s, i) => `<li data-step="${i}"><b>${i + 1}.</b>${s}</li>`).join("")}</ol>`;

// Bucle de la página: reloj, visibilidad, fases (por tiempo o elegidas), embebido y modo quieto.
// La figura define draw(clock, phase). PHASES = { starts: [0, a, b], loop, still }.
export const LOOP_JS = `
const q = new URLSearchParams(location.search);
if (q.has("embed")) document.body.classList.add("embed");
if (q.get("accent")) document.body.style.setProperty("--accent", "#" + q.get("accent").replace(/[^0-9a-f]/gi, ""));
const root = document.querySelector(".iso-stage");
const svg = root.querySelector("svg");
const $ = (sel) => svg.querySelector(sel);
const $$ = (sel) => [...svg.querySelectorAll(sel)];
const readout = document.querySelector("[data-readout]");
const steps = [...document.querySelectorAll("[data-step]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const phaseAt = (t) => { const u = t % PHASES.loop; let p = 0; PHASES.starts.forEach((s, i) => { if (u >= s) p = i; }); return p; };
let clock = 0, last = 0, frame = 0, visible = false, held = null, idle = 0;
const say = (text) => { if (readout.textContent !== text) readout.textContent = text; };
function frameNow() {
  // con un paso elegido, el reloj se mueve dentro de ese paso
  const phase = held ?? phaseAt(clock);
  draw(clock, phase);
  steps.forEach((s, j) => s.toggleAttribute("data-on", j === phase));
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (!still.matches && !q.has("still")) clock += dt;
  frameNow();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(root);
const pick = (j) => { held = j; clock = PHASES.starts[j] + 0.01 + Math.floor(clock / PHASES.loop) * PHASES.loop; clearTimeout(idle); idle = setTimeout(() => { held = null; }, 8000); frameNow(); };
steps.forEach((s, j) => s.addEventListener("click", () => pick(j)));
root.addEventListener("keydown", (e) => {
  const now = held ?? phaseAt(clock);
  if (e.key === "ArrowRight") { e.preventDefault(); pick(Math.min(PHASES.starts.length - 1, now + 1)); }
  if (e.key === "ArrowLeft") { e.preventDefault(); pick(Math.max(0, now - 1)); }
});
if (still.matches || q.has("still")) clock = PHASES.still;
queueMicrotask(frameNow); // la figura termina de declarar sus referencias antes del primer cuadro
`;
