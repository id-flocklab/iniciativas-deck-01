// Fig · Iniciativa 03 — Capacitación desde el trabajo real (RA + video + IA multimodal).
// Una estación de válvula: el experto la opera con las dos manos y unas gafas de RA graban lo que
// hace y dice; en una tablet la IA arma el borrador del curso, que el experto valida.
// node anatomy/ra/build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../kit/tube.mjs";
import { pageScript } from "../bundle.mjs";
import { EMBED_CSS, stepsHtml, LOOP_JS } from "../shared/frame.mjs";
import { worker, armsCore } from "../shared/worker.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 640, HEIGHT = 430;

const PLATE = { x: -150, y: -104, w: 296, d: 190, r: 10 };
const PLATE_H = 11, FOOT_H = 5;
const EX = [-6, -32]; // experto (pies)
const PIPE_Y = 6, PIPE_Z = 22, PIPE_R = 5;
const PIPE_X0 = -118, PIPE_X1 = 50;
const VALVE_X = EX[0];
const WHEEL = [VALVE_X, PIPE_Y, 62], WHEEL_R = 13; // volante horizontal sobre el bonete
const TAB = { x: 82, y: 58, w: 50, d: 5, r: 2 }; // tablet (cara frontal y = TAB.y + TAB.d)
const TAB_Z = 34, TAB_H = 38;

const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [EX[0], EX[1], 118], [TAB.x + TAB.w, TAB.y, TAB_Z + TAB_H + 4]], WIDTH, HEIGHT, { pad: 26, azimuth: 38 });

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const up = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const dot = (p, cls, r, part) => { const [x, y] = at(p); return `<circle class="${cls}"${part ? ` data-part="${part}"` : ""} cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`; };

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 7.5, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.6, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // franja de seguridad frente a la válvula
  const zone = { x: EX[0] - 30, y: EX[1] - 20, w: 60, d: 12, r: 1 };
  out.push(S(k.slabOf(zone, 0, 0.5, P, 3), { tone: "lo", crease: "none" }));
  const hatch = [];
  for (let x = zone.x + 4; x < zone.x + zone.w - 2; x += 6) hatch.push(k.lineOnTop([x, zone.y], [x + 4, zone.y + zone.d], 0.5, P));
  out.push(L(hatch.join(""), { tone: "faint" }));
  const strip = { x: -132, y: PLATE.y + PLATE.d - 14, w: 190, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const label = { x: -138, y: -94, w: 46, d: 12, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([30, 22, 26].map((w, i) => k.lineOnTop([label.x + 4, label.y + 3 + i * 3], [label.x + 4 + w, label.y + 3 + i * 3], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ── Caja de herramientas en el piso (detrás del experto) ──
function toolbox() {
  const plan = { x: -104, y: -84, w: 34, d: 18, r: 1.6 };
  const out = [`<path class="iso-halo" d="${k.haloOf(plan, 0, 14, P)}"/>`];
  out.push(S(k.slabOf(plan, 0, 13, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, 9, P, 3), { tone: "faint" }) }));
  for (const x of [plan.x + 6, plan.x + plan.w - 6]) out.push(S(k.slabOf({ x: x - 1.2, y: plan.y + 7, w: 2.4, d: 4, r: 0.6 }, 13, 5, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: plan.x + 4, y: plan.y + 7.4, w: plan.w - 8, d: 3.2, r: 1.2 }, 17, 2.2, P, 2), { tone: "hi" }));
  return out.join("");
}

// ── Cañería con soportes, válvula de volante y manómetro ──
const PIPE_F = G.frameAlong([PIPE_X0, PIPE_Y, PIPE_Z], [1, 0, 0]);
function supports(which) {
  const out = [];
  for (const x of [-92, 32]) {
    if ((which === "back") !== (x < 0)) continue;
    const plan = { x: x - 4, y: PIPE_Y - 6, w: 8, d: 12, r: 1 };
    out.push(S(k.slabOf({ x: x - 9, y: PIPE_Y - 10, w: 18, d: 20, r: 1.4 }, 0, 2.4, P, 3, 0.4), { tone: "lo" }));
    out.push(D(k.corners({ x: x - 9, y: PIPE_Y - 10, w: 18, d: 20, r: 1.4 }, 2.6).map(([cx, cy]) => at([cx, cy, 2.4])), { size: 0.4 }));
    out.push(S(k.slabOf(plan, 2.4, PIPE_Z - PIPE_R - 2.4 - 1.2, P, 2, 0.4), { tone: "mid" }));
    out.push(S(k.slabOf({ x: x - 5, y: PIPE_Y - 7, w: 10, d: 14, r: 1 }, PIPE_Z - PIPE_R - 1.2, 1.2, P, 2), { tone: "mid" }));
  }
  return out.join("");
}
function pipe() {
  const out = [];
  const len = PIPE_X1 - PIPE_X0;
  const v = VALVE_X - PIPE_X0;
  const route = [[PIPE_X0, PIPE_Y, PIPE_Z], [PIPE_X1, PIPE_Y, PIPE_Z]];
  out.push(tubePieces(route, PIPE_R, P, { maxLength: 60, gaps: [[v - 9, v + 9], [20, 23], [len - 30, len - 27]] }).map((piece) => tubeSvg(piece, { tone: "hi" })).join(""));
  // bridas
  for (const s of [20, len - 30]) out.push(S(G.disc(s, s + 3, 7.4, PIPE_F, P), { tone: "mid" }), D(G.dotsOf(PIPE_F, s + 3, 6, 8, P, { fade: [0.04, 0.42] }), { size: 0.4 }));
  // cuerpo de la válvula y castillo
  const VF = G.frameAlong([VALVE_X, PIPE_Y, PIPE_Z], [1, 0, 0]);
  out.push(S(G.solidOf([[-9, 7.4], [-7.6, 7.4], [-7.6, 6], [-4, 8.6, 1], [0, 9.6, 1], [4, 8.6, 1], [7.6, 6], [7.6, 7.4], [9, 7.4]], VF, P, { smooth: true }), { tone: "hi", crease: "lo" }));
  out.push(D(G.dotsOf(VF, 9, 6, 8, P, { fade: [0.04, 0.42] }), { size: 0.4 }));
  // bonete vertical con brida y yugo, y el vástago hasta el volante
  const B = up([VALVE_X, PIPE_Y, PIPE_Z + 8.6]);
  out.push(S(G.disc(0, 2.4, 7.2, B, P), { tone: "mid" }), D(G.dotsOf(B, 2.4, 6, 8, P, { all: true }), { size: 0.4 }));
  out.push(S(G.solidOf([[2.4, 5.4], [16, 4.6], [18, 5.6], [21, 5.6], [21, 0]], B, P), { tone: "mid", crease: "lo" }));
  out.push(S(G.disc(21, WHEEL[2] - B.o[2] - 1.4, 1.5, B, P), { tone: "hi" }));
  return out.join("");
}
function stem() {
  // vástago hacia el experto (−y) con un yugo, del cuerpo al volante
  const F = G.frameAlong([VALVE_X, PIPE_Y - 9.4, PIPE_Z + 6], [0, -1, 0.85]);
  const out = [S(G.disc(0, 4, 4.4, F, P), { tone: "mid" })];
  const reach = Math.hypot(PIPE_Y - 9.4 - WHEEL[1], WHEEL[2] - PIPE_Z - 6);
  out.push(S(G.disc(4, reach + 1.2, 1.6, F, P), { tone: "mid" }));
  return out.join("");
}
function gauge() {
  const base = [14, PIPE_Y, PIPE_Z + PIPE_R];
  const out = [S(k.cylinder(base[0], base[1], 1.4, base[2], 8, P, 12), { tone: "mid" })];
  const F = G.frameAlong([base[0], base[1] - 1.5, base[2] + 15], [0, 1, 0]);
  out.push(S(G.disc(0, 3, 7, F, P), { tone: "hi", crease: "lo" }));
  out.push(L(G.circleOf(F, 3, 5.8, P), { tone: "lo" }));
  const c = at(G.pointOf(F, 3, 0, 0)), tip = at(G.pointOf(F, 3, 4.6, -0.6));
  out.push(`<path class="iso-line" data-tone="lit" data-free="end" d="M${c[0].toFixed(1)} ${c[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}"/>`);
  out.push(D([c], { size: 0.6, tone: "hi" }));
  return out.join("");
}

// ── Tablet en su soporte: la IA arma el curso ──
function tablet() {
  const out = [];
  const cx = TAB.x + TAB.w / 2;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: cx - 14, y: TAB.y - 8, w: 28, d: 20, r: 8 }, 0, 0.1, P)}"/>`);
  out.push(S(k.slabOf({ x: cx - 14, y: TAB.y - 8, w: 28, d: 20, r: 6 }, 0, 2.4, P, 5, 0.5), { tone: "lo" }));
  out.push(S(k.cylinder(cx, TAB.y + 2, 2.4, 2.4, TAB_Z - 2.4, P, 16), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf(TAB, TAB_Z, TAB_H, P, 4, 0.6), { tone: "mid" }));
  const face = TAB.y + TAB.d;
  const plane = k.sideMatrix([0, face], 0, P, "left");
  const r = (x0, z0, x1, z1, rr = 1.2) => k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r: rr }, 3).map(([u, z]) => [u, -z]), true);
  const X0 = TAB.x + 3, X1 = TAB.x + TAB.w - 3, Z0 = TAB_Z + 3, Z1 = TAB_Z + TAB_H - 3;
  const W = r(X0, Z0, X1, Z1, 1.4);
  const rows = [0, 1, 2].map((i) => {
    const z = Z1 - 11 - i * 5.6;
    return `<g data-part="row" style="opacity:0"><rect class="ra-chk" x="${X0 + 2.4}" y="${-z - 1.6}" width="3.2" height="3.2" rx=".6"/><text class="ra-txt" x="${X0 + 6.8}" y="${-z + 0.9}">${["Cerrar la válvula principal", "Verificar presión en cero", "Colocar bloqueo y tarjeta"][i]}</text></g>`;
  }).join("");
  const wave = Array.from({ length: 22 }, (_, i) => `<rect data-part="wave" x="${X0 + 3 + i * 1.75}" y="${-(Z0 + 9)}" width="1" height="0"/>`).join("");
  out.push(`<clipPath id="ra-win"><path transform="${plane}" d="${W}"/></clipPath><g clip-path="url(#ra-win)"><g transform="${plane}">`,
    `<path class="ra-screen" d="${W}"/>`,
    `<text class="ra-title" x="${X0 + 2.4}" y="${-(Z1 - 4.4)}">Cierre de válvula</text>`,
    `<g data-part="rec" style="opacity:0"><circle class="ra-rec" cx="${X1 - 9.6}" cy="${-(Z1 - 3.4)}" r="1.1"/><text class="ra-txt" x="${X1 - 7.6}" y="${-(Z1 - 4.4)}">REC</text></g>`,
    `<g data-part="waves" style="opacity:0">${wave}</g>`,
    rows,
    `<g data-part="ok" style="opacity:0"><rect class="ra-ok" x="${X1 - 17}" y="${-(Z0 + 6.2)}" width="15" height="4.4" rx="1"/><text class="ra-okt" x="${X1 - 15.6}" y="${-(Z0 + 3)}">VALIDADO</text></g>`,
    `</g></g><g transform="${plane}"><path class="iso-line" data-tone="lo" d="${W}"/></g>`);
  out.push(dot([TAB.x + TAB.w - 3, face, TAB_Z + 1.5], "fx-led", 0.9, "led-tab"));
  return out.join("");
}

const W = worker(P, EX, { gear: "ar" });
// las manos sostienen el volante y lo giran
const HANDS = `
const WC = ${JSON.stringify(WHEEL)}, WR = ${WHEEL_R};
// el experto trabaja el volante con un vaivén de ±28°: las manos acompañan al aro
function wheelAngle(p) { return Math.sin(p * Math.PI * 2) * 0.49; }
function handsAt(p) {
  const a = wheelAngle(p);
  const on = (t) => [WC[0] + Math.cos(t) * WR, WC[1] + Math.sin(t) * WR, WC[2] + 1.6];
  return { right: on(-Math.PI / 2 + 0.75 + a), left: on(-Math.PI / 2 - 0.75 + a) };
}
function handsSvg(p, P) { const h = handsAt(p); return solidSvg(G.sphereOf(h.left, 4.4, P), { tone: "mid" }) + solidSvg(G.sphereOf(h.right, 4.4, P), { tone: "mid" }); }
`;
const ARMS = HANDS + armsCore(EX, W.shoulderZ);
const ARMS_FN = new Function("T", "G", "solidSvg", ARMS + "return { armsSvg, handsSvg, wheelAngle };")({ tubePieces, tubeSvg }, G, k.solidSvg);
const WHEEL_JS = `
function wheelSvg(a, P) {
  const F = G.frameOf(WC, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const rim = T.tubePieces(G.arcPoints(F, 0, WR, 0, Math.PI * 2, 48), 1.3, P, { closed: true, maxLength: 400 }).map((piece) => T.tubeSvg(piece, { tone: "hi" })).join("");
  const spokes = lineSvg(G.spokesOf(F, 0, 2, WR - 1, 3, P, { phase: a }), { tone: "hi" });
  return spokes + solidSvg(G.disc(-1.2, 1.4, 2.6, F, P), { tone: "mid" }) + rim;
}
`;
const WHEEL_FN = new Function("T", "G", "solidSvg", "lineSvg", `const WC = ${JSON.stringify(WHEEL)}, WR = ${WHEEL_R};` + WHEEL_JS + "return { wheelSvg };")({ tubePieces, tubeSvg }, G, k.solidSvg, k.lineSvg);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Una estación de válvula: un experto con casco y gafas de realidad aumentada gira con las dos manos el volante de una válvula sobre una cañería con manómetro. Las gafas graban video y voz, y en una tablet la IA arma el borrador del curso con sus pasos, que el experto valida.",
  body: [
    plate(),
    toolbox(),
    supports("back"),
    W.lower,
    pipe(),
    supports("front"),
    gauge(),
    `<g data-part="arm-left">${ARMS_FN.armsSvg(0.1, P, "left")}</g>`,
    W.upper,
    `<g data-part="arm-right">${ARMS_FN.armsSvg(0.1, P, "right")}</g>`,
    `<g data-part="wheel">${WHEEL_FN.wheelSvg(0, P)}</g>`,
    `<g data-part="hands">${ARMS_FN.handsSvg(0.1, P)}</g>`,
    tablet(),
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const PHASES = { starts: [0, 5, 10], loop: 18, still: 15.5 };
${ARMS}
${WHEEL_JS}
${LOOP_JS}
const armL = $('[data-part="arm-left"]'), armR = $('[data-part="arm-right"]'), wheel = $('[data-part="wheel"]'), hands = $('[data-part="hands"]');
const ar = $('[data-part="ar"]'), arLed = $('[data-part="ar-led"]'), led = $('[data-part="led-tab"]');
const rec = $('[data-part="rec"]'), waves = $('[data-part="waves"]'), bars = $$('[data-part="wave"]'), rows = $$('[data-part="row"]'), ok = $('[data-part="ok"]');
const ramp = (x) => Math.max(0, Math.min(1, x));
const mmss = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0");
function draw(clock, phase) {
  const t = clock % PHASES.loop;
  // el experto trabaja el volante mientras graba; al armar el curso, la válvula ya quedó cerrada
  const turning = phase < 2;
  const p = turning ? (t / 2.6) % 1 : 0;
  armL.innerHTML = armsSvg(p, P, "left");
  armR.innerHTML = armsSvg(p, P, "right");
  wheel.innerHTML = wheelSvg(wheelAngle(p), P);
  hands.innerHTML = handsSvg(p, P);
  const recording = phase >= 1;
  arLed.setAttribute("class", recording ? "ar-led on" : "ar-led");
  ar.setAttribute("data-on", recording ? "1" : "0");
  led.setAttribute("data-on", recording ? "1" : "0");
  rec.style.opacity = phase === 1 ? (0.6 + 0.4 * Math.sin(t * 6)).toFixed(2) : "0";
  waves.style.opacity = phase === 1 ? "1" : "0";
  if (phase === 1) bars.forEach((b, i) => { const h = 1 + 5 * Math.abs(Math.sin(t * 7 + i * 0.9) * Math.sin(t * 2.3 + i * 0.37)); b.setAttribute("height", h.toFixed(2)); b.setAttribute("y", (-${TAB_Z + 3 + 9} - h / 2).toFixed(2)); });
  let shown = 0;
  rows.forEach((r, i) => { const a = phase === 2 ? ramp((t - PHASES.starts[2] - 0.6 - i * 1.1) / 0.4) : 0; r.style.opacity = a.toFixed(2); if (a > 0.5) shown++; });
  const valid = phase === 2 ? ramp((t - PHASES.starts[2] - 4.6) / 0.4) : 0;
  ok.style.opacity = valid.toFixed(2);
  const recSecs = phase === 1 ? 84 + (t - PHASES.starts[1]) * 9 : 0;
  say(phase === 0 ? "experto · cierre de válvula principal" : phase === 1 ? "gafas de RA · grabando " + mmss(recSecs) + " de video y voz" : "curso · " + shown + " de 3 pasos" + (valid > 0.5 ? " · validado" : ""));
}
`;

const CSS = `
${EMBED_CSS}
.ar-led { fill: var(--anatomy-faint); }
.ar-led.on { fill: #ff4d4d; filter: drop-shadow(0 0 2px #ff4d4d); }
[data-part="ar"] .iso-line[data-tone="lit"] { transition: stroke .4s; }
[data-part="ar"][data-on="0"] .iso-line[data-tone="lit"] { stroke: var(--anatomy-hi); }
.ra-screen { fill: var(--anatomy-paper); }
.ra-title { font: 600 3px/1 system-ui, sans-serif; fill: var(--anatomy-hi); }
.ra-txt { font: 500 2.25px/1 system-ui, sans-serif; fill: var(--anatomy-hi); }
.ra-chk { fill: var(--anatomy-lit); }
.ra-rec { fill: #ff4d4d; }
[data-part="wave"] { fill: var(--anatomy-lit); }
.ra-ok { fill: var(--anatomy-lit); }
.ra-okt { font: 700 2.2px/1 system-ui, sans-serif; fill: #000; letter-spacing: .06em; }
`;

const card = k.plateHtml({
  fig: "Fig 3",
  title: "Curso desde el trabajo",
  hint: "Hacé clic en un paso o usá las flechas",
  readout: "experto · cierre de válvula principal",
  keys: [
    { mark: "lit", label: "Gafas de RA y el curso que arma la IA" },
    { mark: "raised", label: "Estación de válvula con manómetro y tablet" },
  ],
  caption: "Simulación del flujo: el experto trabaja con las manos ocupadas, las gafas graban video y voz, y la IA arma el borrador del curso.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Curso desde el trabajo real: flechas para pasar de un paso a otro">${svg}</div>${stepsHtml(["El experto trabaja con las manos ocupadas", "Las gafas de RA graban video y voz", "La IA arma el curso y el experto lo valida"])}`,
});

const file = join(HERE, theme === "light" ? "ra-light.html" : "ra.html");
writeFileSync(file, k.pageHtml({ title: "Curso desde el trabajo", theme, body: `<style>${CSS}</style>${card}`, script: pageScript(live) }));
console.log("wrote", file);
