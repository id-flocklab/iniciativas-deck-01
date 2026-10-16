// Fig · Iniciativa 02 — VR con IA generativa.
// Una mesa de maqueta: a partir de un procedimiento escrito, la IA genera pieza por pieza una
// planta industrial (wireframe → sólido) y un visor de VR la deja lista para practicar.
// node anatomy/vr/build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../kit/tube.mjs";
import { pageScript } from "../bundle.mjs";
import { EMBED_CSS, stepsHtml, LOOP_JS } from "../shared/frame.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 640, HEIGHT = 430;

const PLATE = { x: -176, y: -120, w: 352, d: 214, r: 10 };
const PLATE_H = 11, FOOT_H = 5;
const PL = { x: -62, y: -80, w: 154, d: 128, r: 6 }; // base de la maqueta
const Z = 12; // cara superior de la base
const TOWER = { x: 112, y: -108, w: 36, d: 30, r: 3 };
const TOWER_H = 58;
const DESK = { x: -160, y: 6, w: 64, d: 46, r: 2 };
const DESK_H = 30;
const HS = [-56, 76]; // soporte del visor
const HS_Z = 24;

const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [TOWER.x, TOWER.y, TOWER_H + 4], [-30, -50, Z + 70]], WIDTH, HEIGHT, { pad: 26, azimuth: 38 });

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
  const strip = { x: -154, y: PLATE.y + PLATE.d - 14, w: 230, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const label = { x: -164, y: -108, w: 46, d: 12, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([30, 22, 26].map((w, i) => k.lineOnTop([label.x + 4, label.y + 3 + i * 3], [label.x + 4 + w, label.y + 3 + i * 3], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ── Servidor de cómputo con display ──
const tplane = (x) => k.sideMatrix([x, 0], 0, P, "right");
function tower() {
  const out = [`<path class="iso-halo" d="${k.haloOf(TOWER, 0, TOWER_H, P)}"/>`];
  out.push(S(k.slabOf(TOWER, 0, TOWER_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(TOWER, 6, P, 4), { tone: "faint" }) }));
  for (let i = 0; i < 6; i++) out.push(L(k.planOutline({ x: TOWER.x + 6 + i * 4.4, y: TOWER.y + 5, w: 2, d: 20, r: 0.9 }, TOWER_H, P, 3), { tone: "lo" }));
  // ventana en la cara frontal (+y)
  const front = TOWER.y + TOWER.d;
  const plane = k.sideMatrix([0, front], 0, P, "left");
  const win = (x0, z0, x1, z1, r) => k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 3).map(([u, z]) => [u, -z]), true);
  const W = win(TOWER.x + 5, 34, TOWER.x + TOWER.w - 5, 50, 1.4);
  out.push(`<g transform="${plane}"><path class="vr-screen" d="${W}"/><text class="vr-digits" data-part="obj" x="${TOWER.x + 7.5}" y="-39.5">OBJ 0/8</text><text class="vr-unit" x="${TOWER.x + 7.5}" y="-46">ESCENA</text><path class="iso-line" data-tone="lo" d="${W}"/></g>`);
  out.push(`<g transform="${plane}">${[14, 20, 26].map((z) => `<path class="iso-line" data-tone="lo" d="${win(TOWER.x + 5, z, TOWER.x + TOWER.w - 5, z + 3, 1.2)}"/>`).join("")}</g>`);
  out.push(dot([TOWER.x + TOWER.w - 7, front, 8], "fx-led", 1.1, "led-tower"));
  void tplane;
  return out.join("");
}

// ── Cable del servidor a la base de la maqueta ──
const CABLE = G.fillet([[TOWER.x + 8, TOWER.y + TOWER.d, 6], [TOWER.x + 8, TOWER.y + TOWER.d + 10, 1.4], [TOWER.x + 8, -54, 1.4], [PL.x + PL.w + 1.6, -54, 6]], 8, 7, { P, tube: 1.1 });
const cable = () => tubePieces(CABLE, 1.1, P, { maxLength: 60, caps: [false, true] }).map((piece) => tubeSvg(piece, { tone: "mid" })).join("") + S(G.disc(0, 1.6, 2.4, G.frameAlong([PL.x + PL.w, -54, 6], [1, 0, 0]), P), { tone: "mid" });

// ── Base de la maqueta con grilla ──
function plinth() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PL, 0, Z, P)}"/>`];
  out.push(S(k.slabOf(PL, 0, Z, P, 6, 1.2), { tone: "mid", inner: L(k.sideSeam(PL, 4, P, 6), { tone: "faint" }) }));
  const grid = k.insetPlan(PL, 5);
  out.push(L(k.planOutline(grid, Z, P, 4), { tone: "lo" }));
  const lines = [];
  for (let x = grid.x + 12; x < grid.x + grid.w - 4; x += 12) lines.push(k.lineOnTop([x, grid.y], [x, grid.y + grid.d], Z, P));
  for (let y = grid.y + 12; y < grid.y + grid.d - 4; y += 12) lines.push(k.lineOnTop([grid.x, y], [grid.x + grid.w, y], Z, P));
  out.push(L(lines.join(""), { tone: "faint" }));
  return out.join("");
}

// ── Objetos de la planta (cada uno se genera: wireframe → sólido) ──
const TANK_A = [-30, -50], TANK_B = [-32, -12];
const HEADER_Z = 30;
const PUMP = { x: 44, y: 14, w: 34, d: 20 };
function tank([x, y], r, h) {
  const F = up([x, y, Z]);
  const out = [S(G.disc(0, 2, r + 1.6, F, P), { tone: "lo" })];
  out.push(S(G.solidOf([[2, r], [h - 6, r], [h - 3.5, r - 1.8, 1], [h - 1.2, r - 6, 1], [h, 0]], F, P), { tone: "hi", crease: "lo", inner: [h * 0.35, h * 0.68].map((s) => L(G.arcOf(F, s, r, P), { tone: "mid" })).join("") }));
  out.push(S(G.disc(h - 1.5, h + 1.5, 2.6, F, P), { tone: "mid" }));
  return out.join("");
}
const headerRoute = [[TANK_A[0] + 17, TANK_A[1], HEADER_Z], [PUMP.x + 8, TANK_A[1], HEADER_Z], [PUMP.x + 8, PUMP.y - 1, HEADER_Z], [PUMP.x + 8, PUMP.y - 1, 24]];
const HEADER = G.fillet(headerRoute, 9, 7, { P, tube: 2.6 });
const VALVE_X = 14;
function pipe() {
  const out = [];
  // soporte de cañería
  out.push(S(k.slabOf({ x: -6, y: TANK_A[1] - 2.5, w: 5, d: 5, r: 0.8 }, Z, HEADER_Z - Z - 2.6, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -9, y: TANK_A[1] - 4, w: 11, d: 8, r: 0.8 }, Z, 1.6, P, 2), { tone: "lo" }));
  const gap = [[VALVE_X + 30 - 6, VALVE_X + 30 + 6]];
  out.push(tubePieces(HEADER, 2.6, P, { maxLength: 40, gaps: gap }).map((piece) => tubeSvg(piece, { tone: "hi" })).join(""));
  // brida en el tanque
  out.push(S(G.disc(0, 1.6, 4.4, G.frameAlong([TANK_A[0] + 16.4, TANK_A[1], HEADER_Z], [1, 0, 0]), P), { tone: "mid" }));
  return out.join("");
}
function valve() {
  const F = G.frameAlong([VALVE_X, TANK_A[1], HEADER_Z], [1, 0, 0]);
  const out = [S(G.solidOf([[-6, 3.6], [-5, 4.4], [-2, 5.6, 1], [0, 6, 1], [2, 5.6, 1], [5, 4.4], [6, 3.6]], F, P, { smooth: true }), { tone: "hi", crease: "lo" })];
  out.push(S(k.cylinder(VALVE_X, TANK_A[1], 1.2, HEADER_Z + 5, 6, P, 12), { tone: "mid" }));
  const W = up([VALVE_X, TANK_A[1], HEADER_Z + 11]);
  out.push(L(G.circleOf(W, 0, 6.5, P) + G.circleOf(W, 0, 5.4, P), { tone: "hi" }));
  out.push(L(k.lineOnTop([VALVE_X - 6, TANK_A[1]], [VALVE_X + 6, TANK_A[1]], HEADER_Z + 11, P) + k.lineOnTop([VALVE_X, TANK_A[1] - 6], [VALVE_X, TANK_A[1] + 6], HEADER_Z + 11, P), { tone: "mid" }));
  return out.join("");
}
function pump() {
  const out = [];
  const base = { x: PUMP.x, y: PUMP.y, w: PUMP.w, d: PUMP.d, r: 1 };
  out.push(S(k.slabOf(base, Z, 3, P, 2, 0.4), { tone: "lo" }));
  const F = G.frameAlong([PUMP.x + 4, PUMP.y + PUMP.d / 2, Z + 12], [1, 0, 0]);
  out.push(S(G.solidOf([[0, 7], [2, 8.4, 1], [8, 9, 1], [11, 8], [11, 6], [14, 6]], F, P), { tone: "hi", crease: "lo" }));
  out.push(S(G.solidOf([[14, 7.4], [30, 7.4], [31, 6.4, 1], [31.6, 0]], F, P), { tone: "mid", inner: G.ribsOf(F, 16, 29, 7.4, 18, P, { fade: [0.1, 0.55] }).length ? k.fadedSvg(G.ribsOf(F, 16, 29, 7.4, 18, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" }) : "" }));
  // brida de entrada arriba
  out.push(S(G.disc(-1.6, 0, 4, G.frameAlong([PUMP.x + 8, PUMP.y - 1, 24], [0, 0, -1]), P), { tone: "mid" }));
  return out.join("");
}
function panel() {
  const plan = { x: 54, y: -72, w: 24, d: 10, r: 1 };
  const out = [S(k.slabOf(plan, Z, 36, P, 2, 0.6), { tone: "mid", inner: L(k.sideSeam(plan, Z + 30, P, 2), { tone: "faint" }) })];
  const plane = k.sideMatrix([0, plan.y + plan.d], 0, P, "left");
  const r = (x0, z0, x1, z1) => k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r: 0.8 }, 2).map(([u, z]) => [u, -z]), true);
  out.push(`<g transform="${plane}"><path class="iso-line" data-tone="lo" d="${r(57, Z + 18, 75, Z + 27)}"/></g>`);
  out.push(D([at([60, plan.y + plan.d, Z + 12]), at([64, plan.y + plan.d, Z + 12]), at([68, plan.y + plan.d, Z + 12])], { size: 0.9, tone: "mid" }));
  return out.join("");
}
function barrels() {
  const out = [];
  for (const [x, y] of byDepth([[-44, 26], [-30, 32]])) {
    out.push(S(k.cylinder(x, y, 6, Z, 16, P, 28, 0.5), { tone: "mid", inner: L(k.sideArc(x, y, 6, Z + 5, P, 20) + k.sideArc(x, y, 6, Z + 11, P, 20), { tone: "lo" }) }));
    out.push(L(k.ring(x, y, 1.4, Z + 16, P, 12), { tone: "lo" }));
  }
  return out.join("");
}
function cones() {
  const out = [];
  for (const [x, y] of byDepth([[82, 24], [82, 40]])) {
    const F = up([x, y, Z]);
    out.push(S(k.slabOf({ x: x - 5, y: y - 5, w: 10, d: 10, r: 1 }, Z, 1.2, P, 2), { tone: "lo" }));
    out.push(S(G.solidOf([[1.2, 4], [6, 2.8], [11, 1.2], [11.5, 0]], F, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(F, 5, 3.05, P, { slope: -0.25 }), { tone: "mid" }) }));
  }
  return out.join("");
}
// orden de dibujo = orden de generación (de atrás hacia adelante)
const OBJECTS = [
  ["Panel de control", panel()],
  ["Tanque de almacenamiento", tank(TANK_A, 16, 62)],
  ["Cañería y soporte", pipe()],
  ["Válvula", valve()],
  ["Tanque de servicio", tank(TANK_B, 13, 46)],
  ["Bomba con motor", pump()],
  ["Tambores", barrels()],
  ["Conos de seguridad", cones()],
];
// riesgos para practicar (escena 3): válvula sin bloqueo, pérdida en la cañería, bomba sin protección
const HAZARDS = [[VALVE_X, TANK_A[1], HEADER_Z + 11], [-12 + 30, TANK_A[1], HEADER_Z - 3], [PUMP.x + 26, PUMP.y + PUMP.d / 2, Z + 20]];

// ── Atril con el procedimiento escrito ──
function desk() {
  const out = [`<path class="iso-halo" d="${k.haloOf(DESK, 0, DESK_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(DESK, 3))) out.push(S(k.slabOf({ x: x - 1.6, y: y - 1.6, w: 3.2, d: 3.2, r: 0.5 }, 0, DESK_H - 2, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf(DESK, DESK_H - 2, 2, P, 3, 0.4), { tone: "mid" }));
  const board = { x: DESK.x + 10, y: DESK.y + 6, w: 32, d: 38, r: 1.5 };
  out.push(S(k.slabOf(board, DESK_H, 1.2, P, 3), { tone: "lo" }));
  const sheet = { x: board.x + 2, y: board.y + 4, w: 28, d: 32, r: 0.6 };
  out.push(`<g data-part="sheet">${S(k.slabOf(sheet, DESK_H + 1.2, 0.5, P, 2), { tone: "hi", crease: "none" })}</g>`);
  out.push(L([0, 1, 2, 3, 4, 5, 6].map((i) => k.lineOnTop([sheet.x + 3, sheet.y + 4 + i * 4], [sheet.x + 3 + [20, 16, 22, 12, 18, 21, 9][i], sheet.y + 4 + i * 4], DESK_H + 1.7, P)).join(""), { tone: "mid", free: true }));
  out.push(S(k.slabOf({ x: board.x + 10, y: board.y + 1, w: 12, d: 4, r: 1 }, DESK_H + 1.2, 2.4, P, 2), { tone: "mid" }));
  return out.join("");
}

// ── Visor de VR en su soporte ──
function headset() {
  const [x, y] = HS;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 13, y: y - 13, w: 26, d: 26, r: 13 }, 0, 0.1, P)}"/>`];
  out.push(S(k.cylinder(x, y, 12, 0, 2.4, P, 40, 0.5), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 2.2, 2.4, HS_Z - 2.4, P, 16), { tone: "mid", crease: "none" }));
  const body = { x: x - 16, y: y - 8, w: 32, d: 16, r: 6 };
  // banda trasera
  const strap = G.arcPoints(up([x, y - 2, HS_Z + 7]), 0, 15, Math.PI * 0.95, Math.PI * 2.05, 28).map(([px, py, pz]) => [px, py - 4, pz]);
  out.push(tubePieces(strap, 1.6, P, { maxLength: 200 }).map((piece) => tubeSvg(piece, { tone: "lo" })).join(""));
  out.push(S(k.slabOf(body, HS_Z, 14, P, 6, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(body, HS_Z + 4, P, 6), { tone: "mid" }) }));
  // lentes en la cara frontal y LED
  const face = y + 8;
  for (const dx of [-7, 7]) {
    const F = G.frameAlong([x + dx, face, HS_Z + 7.4], [0, 1, 0]);
    out.push(S(G.disc(0, 0.8, 4.4, F, P), { tone: "lo" }));
  }
  out.push(dot([x + 12, face, HS_Z + 11.5], "fx-led", 1, "led-vr"));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Una mesa de maqueta: a partir de un procedimiento escrito, un servidor de IA genera pieza por pieza una planta industrial (tanques, cañería, válvula, bomba, panel, tambores y conos) y un visor de VR la deja lista para practicar con sus riesgos marcados.",
  body: [
    plate(),
    tower(),
    cable(),
    plinth(),
    `<g data-part="plant">${OBJECTS.map(([name, s], i) => `<g data-obj="${i}" aria-label="${name}"><g class="vr-wire">${s}</g><g class="vr-solid">${s}</g></g>`).join("")}</g>`,
    `<g data-part="drops" class="vr-drops"></g>`,
    `<g data-part="hazards"></g>`,
    desk(),
    headset(),
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const PHASES = { starts: [0, 4, 11.5], loop: 19, still: 17 };
const GEN_AT = 4.6, GEN_EVERY = 0.8, N = ${OBJECTS.length};
const HAZARDS = ${JSON.stringify(HAZARDS)}, HAZ_AT = [12.3, 13.6, 14.9];
const LEAK = ${JSON.stringify([18, TANK_A[1], HEADER_Z - 3])};
${LOOP_JS}
const objs = $$("[data-obj]"), sheet = $('[data-part="sheet"]'), counter = $('[data-part="obj"]');
const hazards = $('[data-part="hazards"]'), drops = $('[data-part="drops"]');
const ledT = $('[data-part="led-tower"]'), ledV = $('[data-part="led-vr"]');
const ramp = (x) => Math.max(0, Math.min(1, x));
function draw(clock, phase) {
  const t = clock % PHASES.loop;
  const out = t > PHASES.loop - 0.8 ? ramp((PHASES.loop - t) / 0.8) : 1; // la escena se desarma al final del recorrido
  let built = 0;
  objs.forEach((o, i) => {
    const t0 = GEN_AT + i * GEN_EVERY;
    const wire = ramp((t - t0) / 0.25) * (1 - ramp((t - t0 - 0.55) / 0.35));
    const solid = ramp((t - t0 - 0.4) / 0.4) * out;
    o.children[0].style.opacity = wire.toFixed(3);
    o.children[1].style.opacity = solid.toFixed(3);
    if (solid > 0.5) built++;
  });
  sheet.setAttribute("data-on", phase === 0 ? "1" : "0");
  counter.textContent = "OBJ " + built + "/" + N;
  ledT.setAttribute("data-on", phase === 1 && built < N ? "1" : "0");
  ledV.setAttribute("data-on", phase === 2 ? "1" : "0");
  let found = 0;
  hazards.innerHTML = phase === 2 ? HAZARDS.map((h, i) => {
    const a = ramp((t - HAZ_AT[i]) / 0.4) * out; if (a > 0.5) found++;
    const [x, y] = iso(h, P); const pulse = 1 + 0.35 * Math.sin((t - HAZ_AT[i]) * 5);
    return a ? '<g style="opacity:' + a.toFixed(2) + '"><circle class="vr-haz-ring" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (5 * pulse).toFixed(2) + '"/><circle class="vr-haz" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.8"/></g>' : '';
  }).join("") : "";
  drops.innerHTML = phase === 2 && t > HAZ_AT[1] ? [0, 1, 2].map((j) => { const f = ((t * 0.9 + j / 3) % 1); const [x, y] = iso([LEAK[0], LEAK[1], LEAK[2] - 2 - f * (LEAK[2] - 14)], P); return '<circle class="vr-drop" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="0.9" style="opacity:' + (1 - f).toFixed(2) + '"/>'; }).join("") : "";
  say(phase === 0 ? "procedimiento · inspección de bomba y válvula" : phase === 1 ? "generando escena · " + built + " de " + N + " objetos" : "práctica en VR · riesgos detectados " + found + " de 3");
}
`;

const CSS = `
${EMBED_CSS}
.vr-wire * { fill: none !important; stroke: var(--anatomy-lit) !important; stroke-width: .7px !important; }
.vr-wire .iso-halo { display: none; }
.vr-screen { fill: var(--anatomy-paper); }
.vr-digits { font: 600 5.4px/1 ui-monospace, Menlo, monospace; fill: var(--anatomy-hi); }
.vr-unit { font: 600 2.4px/1 ui-monospace, Menlo, monospace; fill: var(--anatomy-lo); letter-spacing: .12em; }
[data-part="sheet"][data-on="1"] .iso-edge { stroke: var(--anatomy-lit); }
.vr-haz { fill: var(--anatomy-lit); }
.vr-haz-ring { fill: none; stroke: var(--anatomy-lit); stroke-width: .9; }
.vr-drop { fill: var(--anatomy-lit); }
`;

const card = k.plateHtml({
  fig: "Fig 2",
  title: "Escenario generado",
  hint: "Hacé clic en un paso o usá las flechas",
  readout: "procedimiento · inspección de bomba y válvula",
  keys: [
    { mark: "lit", label: "Lo que la IA está generando y los riesgos a practicar" },
    { mark: "raised", label: "Maqueta de planta, servidor de cómputo y visor de VR" },
  ],
  caption: "Simulación del flujo: procedimiento escrito → objetos 3D generados → escena lista para practicar en VR.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Escenario de VR generado con IA: flechas para pasar de un paso a otro">${svg}</div>${stepsHtml(["Partimos de un procedimiento escrito", "La IA genera los objetos 3D y arma la escena", "El operario practica en VR y detecta los riesgos"])}`,
});

const file = join(HERE, theme === "light" ? "vr-light.html" : "vr.html");
writeFileSync(file, k.pageHtml({ title: "Escenario generado", theme, body: `<style>${CSS}</style>${card}`, script: pageScript(live) }));
console.log("wrote", file);
