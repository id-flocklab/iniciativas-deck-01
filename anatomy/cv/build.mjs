// Fig · Iniciativa 01 — Computer Vision.
// Una estación de trabajo: un operario mueve cajas sobre una cinta; una cámara de seguridad ya
// instalada lo observa y una caja de cómputo en el piso mide cada ciclo de la tarea.
// node anatomy/cv/build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../kit/tube.mjs";
import { pageScript } from "../bundle.mjs";
import { CYCLES, SCALE, PHASES } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 640;
const HEIGHT = 430;

// ── Mundo (unidades ≈ px; z arriba, z = 0 es la cara de la placa) ──
const PLATE = { x: -170, y: -116, w: 344, d: 206, r: 10 };
const PLATE_H = 11;
const FOOT_H = 5;

const BELT = { x: -150, y: -6, w: 300, d: 42, r: 3 };
const BELT_Z = 40, BELT_TOP = 44;
const RAIL_FAR = { x: -156, y: -12, w: 312, d: 6, r: 1 };
const RAIL_NEAR = { x: -156, y: 36, w: 312, d: 6, r: 1 };
const RAIL_Z = 33, RAIL_TOP = 46;
const LEGS_X = [-136, 136];
const BOX = { w: 24, d: 26, h: 15 };
const BOX_Y = 2;
const SPACING = 96;

const OP = [-14, -32]; // operario (pies)
const SHOULDER_Z = 81;
const ARM = 25; // largo de brazo y antebrazo

const POST = [156, -96];
const POST_TOP = 196;
const CAM = [126, -84, 184]; // centro del cuerpo de la cámara
const CHEST = [OP[0], OP[1], 72];

const EDGE = { x: 92, y: 60, w: 54, d: 26, r: 3 };
const EDGE_H = 28;
const WIN = { x0: 97, x1: 141, z0: 7, z1: 23, r: 1.6, depth: 1.2 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [POST[0], POST[1], POST_TOP + 6], [OP[0], OP[1], 118]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 38 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const up = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const unit = (v) => { const l = Math.hypot(...v); return v.map((c) => c / l); };

// ── Base ──
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
  // franja de seguridad del puesto de trabajo, en el piso detrás de la cinta
  const zone = { x: OP[0] - 34, y: OP[1] - 24, w: 68, d: 14, r: 1 };
  out.push(S(k.slabOf(zone, 0, 0.5, P, 3), { tone: "lo", crease: "none" }));
  const hatch = [];
  for (let x = zone.x + 4; x < zone.x + zone.w - 2; x += 6) hatch.push(k.lineOnTop([x, zone.y], [x + 4, zone.y + zone.d], 0.5, P));
  out.push(L(hatch.join(""), { tone: "faint" }));
  // regla en el borde delantero
  const strip = { x: -150, y: PLATE.y + PLATE.d - 14, w: 230, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // chapa identificatoria
  const label = { x: -158, y: -104, w: 46, d: 12, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([30, 22, 26].map((w, i) => k.lineOnTop([label.x + 4, label.y + 3 + i * 3], [label.x + 4 + w, label.y + 3 + i * 3], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ── Poste y cámara de seguridad (ya instalada) ──
const CAM_DIR = unit([CHEST[0] - CAM[0], CHEST[1] - CAM[1], CHEST[2] - CAM[2]]);
const CAM_F = G.frameAlong(CAM, CAM_DIR);
function post() {
  const out = [];
  const [x, y] = POST;
  out.push(S(k.slabOf({ x: x - 11, y: y - 11, w: 22, d: 22, r: 2 }, 0, 2.4, P, 3, 0.4), { tone: "lo" }));
  out.push(D(k.corners({ x: x - 11, y: y - 11, w: 22, d: 22, r: 2 }, 3.5).map(([cx, cy]) => at([cx, cy, 2.4])), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, 5.2, 2.4, 4, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 3.6, 6.4, POST_TOP - 6.4, P, 28), { tone: "mid", crease: "none" }));
  out.push(L([60, 120].map((z) => k.sideArc(x, y, 3.6, z, P, 16)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 4.4, POST_TOP, 3, P, 28), { tone: "mid" }));
  return out.join("");
}
function camera() {
  const out = [];
  // brazo: del poste hasta la rótula, apoyado en la tapa del poste
  const knuckle = [CAM[0] + 16, CAM[1] - 6, POST_TOP - 8];
  const armF = G.frameAlong([POST[0], POST[1], POST_TOP - 8], unit([knuckle[0] - POST[0], knuckle[1] - POST[1], 0]));
  const armLen = Math.hypot(knuckle[0] - POST[0], knuckle[1] - POST[1]);
  out.push(S(k.cylinder(POST[0], POST[1], 5.6, POST_TOP - 12, 8, P, 28), { tone: "mid" }));
  out.push(S(G.disc(4.5, armLen - 3, 2.6, armF, P), { tone: "mid" }));
  out.push(S(G.sphereOf(knuckle, 4.2, P), { tone: "mid" }));
  // cuello hasta la abrazadera de la cámara
  const clampAt = G.pointOf(CAM_F, -4, 8.4, Math.PI / 2);
  const neckF = G.frameAlong(knuckle, unit([clampAt[0] - knuckle[0], clampAt[1] - knuckle[1], clampAt[2] - knuckle[2]]));
  const neckLen = Math.hypot(clampAt[0] - knuckle[0], clampAt[1] - knuckle[1], clampAt[2] - knuckle[2]);
  out.push(S(G.disc(3.6, neckLen, 2, neckF, P), { tone: "mid" }));
  // cuerpo tipo bullet: tapa trasera, cuerpo, visera y lente
  const body = [[-22, 0], [-22, 6.4], [-20.5, 7.6, 1], [-18, 8], [10, 8], [10, 8.8], [16, 8.8], [16, 0]];
  out.push(S(G.solidOf(body, CAM_F, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(CAM_F, -6, 8, P), { tone: "faint" }) }));
  out.push(S(G.disc(16, 18, 6.6, CAM_F, P), { tone: "mid" }));
  out.push(`<g class="cv-lens">${S(G.disc(18, 19, 5, CAM_F, P), { tone: "lo" })}</g>`);
  out.push(L(G.circleOf(CAM_F, 19, 3.1, P), { tone: "mid" }));
  out.push(`<circle class="cv-led" data-part="led" cx="${at(G.pointOf(CAM_F, 12, 9, Math.PI / 2))[0].toFixed(1)}" cy="${at(G.pointOf(CAM_F, 12, 9, Math.PI / 2))[1].toFixed(1)}" r="1.25"/>`);
  return out.join("");
}

// ── Cable de la cámara: baja por el poste y va por el piso hasta la caja de cómputo ──
const CABLE_R = 1.15;
const CABLE = G.fillet([
  G.pointOf(CAM_F, -22, 0, 0),
  [POST[0] - 4.8, POST[1] + 5, POST_TOP - 22],
  [POST[0] - 4.8, POST[1] + 5, 12],
  [POST[0] + 8, POST[1] + 16, CABLE_R + 0.2],
  [EDGE.x + EDGE.w + 10, EDGE.y - 12, CABLE_R + 0.2],
  [EDGE.x + EDGE.w + 10, EDGE.y + 15, CABLE_R + 0.2],
  [EDGE.x + EDGE.w + 1.6, EDGE.y + 15, 6],
], 8, 7, { P, tube: CABLE_R });
function cable(filter) {
  return tubePieces(CABLE, CABLE_R, P, { maxLength: 40, caps: [false, true] }).filter(filter).map((piece) => tubeSvg(piece, { tone: "mid" })).join("");
}

// ── Cinta transportadora ──
function conveyorBack() {
  const out = [];
  for (const x of LEGS_X) {
    out.push(S(k.slabOf({ x: x - 3, y: RAIL_FAR.y, w: 6, d: 6, r: 1 }, 2, RAIL_Z - 2, P, 3, 0.4), { tone: "lo" }));
    out.push(S(k.slabOf({ x: x - 5, y: RAIL_FAR.y - 2, w: 10, d: 10, r: 1.4 }, 0, 2, P, 3), { tone: "lo" }));
  }
  out.push(S(k.slabOf(RAIL_FAR, RAIL_Z, RAIL_TOP - RAIL_Z, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(RAIL_FAR, 38, P, 3), { tone: "faint" }) }));
  // banda y tambores en los extremos
  out.push(S(k.slabOf(BELT, BELT_Z, BELT_TOP - BELT_Z, P, 4), { tone: "lo", crease: "faint" }));
  for (const x of [BELT.x + 3, BELT.x + BELT.w - 3]) {
    const F = G.frameAlong([x, BELT.y, BELT_Z + 2], [0, 1, 0]);
    out.push(S(G.disc(0, BELT.d, 4.6, F, P), { tone: "mid" }));
  }
  return out.join("");
}
// marcas de la banda: cada una cruza de borde a borde y se desvanece al llegar a los tambores
const CLEAT_GAP = 20, CLEATS = Math.ceil(BELT.w / CLEAT_GAP) + 1;
function cleats() {
  const one = L(k.lineOnTop([0, BELT.y + 0.6], [0, BELT.y + BELT.d - 0.6], BELT_TOP, P), { tone: "faint" });
  return `<g data-part="cleats">${Array.from({ length: CLEATS }, () => `<g data-part="cleat">${one}</g>`).join("")}</g>`;
}
function box() {
  const plan = { x: -BOX.w / 2, y: BOX_Y, w: BOX.w, d: BOX.d, r: 1 };
  const out = [S(k.slabOf(plan, BELT_TOP, BOX.h, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, BELT_TOP + BOX.h - 3, P, 3), { tone: "faint" }) })];
  out.push(L(k.lineOnTop([0, plan.y], [0, plan.y + plan.d], BELT_TOP + BOX.h, P), { tone: "lo" }));
  out.push(L(k.planOutline({ x: -3, y: plan.y + 4, w: 7, d: 5, r: 0.6 }, BELT_TOP + BOX.h, P, 2), { tone: "faint" }));
  return out.join("");
}
function conveyorFront() {
  const out = [];
  out.push(S(k.slabOf(RAIL_NEAR, RAIL_Z, RAIL_TOP - RAIL_Z, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(RAIL_NEAR, 38, P, 3), { tone: "faint" }) }));
  out.push(D(Array.from({ length: 15 }, (_, i) => at([RAIL_NEAR.x + 10 + i * 21, RAIL_NEAR.y + RAIL_NEAR.d, 40])), { size: 0.45 }));
  for (const x of LEGS_X) {
    out.push(S(k.slabOf({ x: x - 3, y: RAIL_NEAR.y, w: 6, d: 6, r: 1 }, 2, RAIL_Z - 2, P, 3, 0.4), { tone: "mid" }));
    out.push(S(k.slabOf({ x: x - 5, y: RAIL_NEAR.y - 2, w: 10, d: 10, r: 1.4 }, 0, 2, P, 3), { tone: "lo" }));
  }
  out.push(S(k.slabOf({ x: LEGS_X[0] + 3, y: RAIL_NEAR.y + 1, w: LEGS_X[1] - LEGS_X[0] - 6, d: 4, r: 0.8 }, 12, 4, P, 3, 0.3), { tone: "mid" }));
  // motor reductor en el extremo derecho
  const motorF = G.frameAlong([BELT.x + BELT.w - 3, RAIL_NEAR.y + RAIL_NEAR.d, BELT_Z + 2], [0, 1, 0]);
  out.push(S(G.solidOf([[0, 6], [2, 6], [2, 7.2], [11, 7.2], [12, 6.4, 1], [12.8, 0]], motorF, P), { tone: "mid", inner: L(G.arcOf(motorF, 6.5, 7.2, P), { tone: "faint" }) }));
  out.push(D(G.dotsOf(motorF, 12.8, 3, 6, P, { all: true }), { size: 0.4 }));
  return out.join("");
}

// ── Pallet con cajas terminadas (fondo derecho) ──
function pallet() {
  const base = { x: 40, y: -106, w: 64, d: 48, r: 1 };
  const out = [`<path class="iso-halo" d="${k.haloOf(base, 0, 9, P)}"/>`];
  for (const y of [base.y + 2, base.y + base.d / 2 - 3, base.y + base.d - 8]) out.push(S(k.slabOf({ x: base.x, y, w: base.w, d: 6, r: 0.6 }, 0, 5, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf(base, 5, 3, P, 2, 0.3), { tone: "lo" }));
  for (let x = base.x + 8; x < base.x + base.w - 2; x += 8) out.push(L(k.lineOnTop([x, base.y], [x, base.y + base.d], 8, P), { tone: "faint" }));
  const cell = { w: 28, d: 21, h: 15 };
  const slots = [];
  for (let layer = 0; layer < 2; layer++) for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (!(layer === 1 && i === 1 && j === 1)) slots.push([base.x + 3 + i * (cell.w + 1), base.y + 2 + j * (cell.d + 1), 8 + layer * cell.h]);
  slots.sort((a, b) => a[2] - b[2] || k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y, z] of slots) {
    const plan = { x, y, w: cell.w, d: cell.d, r: 0.8 };
    out.push(S(k.slabOf(plan, z, cell.h, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(plan, z + cell.h - 3, P, 2), { tone: "faint" }) }));
    out.push(L(k.lineOnTop([x + cell.w / 2, y], [x + cell.w / 2, y + cell.d], z + cell.h, P), { tone: "lo" }));
  }
  return out.join("");
}

// ── Estante con bandejas de piezas (detrás del operario) ──
function rack() {
  const R = { x: -158, y: -62, w: 46, d: 28, r: 1 };
  const out = [`<path class="iso-halo" d="${k.haloOf(R, 0, 4, P)}"/>`];
  const legs = k.corners(R, 2.5);
  for (const [x, y] of byDepth(legs)) out.push(S(k.slabOf({ x: x - 1.6, y: y - 1.6, w: 3.2, d: 3.2, r: 0.5 }, 0, 36, P, 2), { tone: "mid" }));
  for (const z of [12, 34]) {
    out.push(S(k.slabOf(R, z, 2, P, 2, 0.3), { tone: "mid" }));
    for (const x of [R.x + 2, R.x + R.w / 2 + 1]) {
      const tote = { x, y: R.y + 3, w: R.w / 2 - 3, d: R.d - 6, r: 1.2 };
      out.push(S(k.slabOf(tote, z + 2, 9, P, 3, 0.4), { tone: z > 20 ? "hi" : "mid", crease: "lo" }));
      const hole = k.insetPlan(tote, 1.4);
      out.push(`<path class="iso-shade" data-shade="0" d="${k.pathOf(k.roundedPlan(hole, 3).map(([px, py]) => at([px, py, z + 11])), true)}"/>`);
      out.push(L(k.planOutline(hole, z + 11, P, 3), { tone: "lo" }));
      out.push(D(k.dotGrid(hole.x + 3, hole.y + 3, 3, 2, 4, z + 11, P), { size: 0.55, tone: "mid" }));
    }
  }
  return out.join("");
}

// ── Operario (cuerpo estático detrás de la cinta) ──
const HEAD = [OP[0], OP[1], 99.5];
function operator(part) {
  const out = [];
  const lower = part === "lower";
  const [x, y] = OP;
  if (lower) {
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - 16, y: y - 10, w: 32, d: 24, r: 10 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  // botines con puntera y piernas del pantalón
  for (const dx of [-5.2, 5.2]) {
    out.push(S(k.slabOf({ x: x + dx - 4.2, y: y - 5, w: 8.4, d: 17, r: 3.8 }, 0, 4.6, P, 5, 0.5), { tone: "lo" }));
    const leg = { x: x + dx - 4.5, y: y - 4.6, w: 9, d: 9.4, r: 4.3 };
    out.push(S(k.slabOf(leg, 4.6, 40, P, 6), { tone: "lo", crease: "none", inner: L(k.sideSeam(leg, 25, P, 6), { tone: "faint" }) }));
  }
  // cadera con cinturón
  const hips = { x: x - 11, y: y - 6, w: 22, d: 12.5, r: 5.6 };
  out.push(S(k.slabOf(hips, 42, 11, P, 6), { tone: "lo", inner: L(k.sideSeam(hips, 50.5, P, 6), { tone: "mid" }) }));
  return out.join("");
  }
  // abdomen y pecho con chaleco reflectivo
  const belly = { x: x - 11.6, y: y - 6.6, w: 23.2, d: 13.6, r: 6.2 };
  out.push(S(k.slabOf(belly, 53, 13, P, 6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(belly, 59, P, 6), { tone: "mid" }) }));
  const chest = { x: x - 14.5, y: y - 7.6, w: 29, d: 15.6, r: 7.4 };
  out.push(S(k.slabOf(chest, 66, 18, P, 6, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(chest, 73, P, 6), { tone: "mid" }) }));
  // cuello del chaleco y hombros redondeados
  out.push(S(k.cylinder(x, y, 6.4, 84, 1.6, P, 24), { tone: "mid" }));
  for (const dx of [-12.8, 12.8]) out.push(S(G.sphereOf([x + dx, y + 0.4, SHOULDER_Z], 6, P), { tone: "hi" }));
  out.push(S(k.cylinder(x, y, 3.8, 85.6, 5.6, P, 20), { tone: "mid" }));
  // cabeza con anteojos de seguridad y casco con ala
  out.push(S(G.sphereOf(HEAD, 8.2, P), { tone: "mid" }));
  const face = up([HEAD[0], HEAD[1], HEAD[2] - 0.4]);
  out.push(`<g style="stroke-width:2.2">${L(G.arcOf(face, 0, 8.15, P), { tone: "hi" })}</g>`);
  out.push(L(G.arcOf(face, -4.6, 6.8, P, { from: Math.PI * 0.3, to: Math.PI * 0.7 }), { tone: "lo" }));
  const hat = up([x, y, HEAD[2] + 3.6]);
  out.push(S(G.disc(0, 1.1, 11, hat, P), { tone: "hi" }));
  out.push(S(G.solidOf([[1.1, 0], [1.1, 9.2], [3.4, 8.9, 1], [6.4, 7.4, 1], [8.8, 4.5, 1], [10, 0]], hat, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(hat, 4, 8.7, P), { tone: "mid" }) }));
  return out.join("");
}

// ── Caja de cómputo en el piso, con display en la cara frontal ──
const planeOf = (y) => k.sideMatrix([0, y], 0, P, "left");
const flat = (x0, z0, x1, z1, r, steps = 4) => k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);
function edgeBox() {
  const out = [`<path class="iso-halo" d="${k.haloOf(EDGE, 0, EDGE_H, P)}"/>`];
  const front = EDGE.y + EDGE.d;
  out.push(S(k.slabOf(EDGE, 0, EDGE_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(EDGE, EDGE_H - 4, P, 4), { tone: "faint" }) }));
  // tapa con ranuras de ventilación cerradas y dos tornillos
  for (let i = 0; i < 5; i++) out.push(L(k.planOutline({ x: EDGE.x + 8 + i * 6, y: EDGE.y + 6, w: 2.4, d: 14, r: 1.1 }, EDGE_H, P, 3), { tone: "lo" }));
  out.push(D([at([EDGE.x + 4, EDGE.y + 4, EDGE_H]), at([EDGE.x + EDGE.w - 4, EDGE.y + EDGE.d - 4, EDGE_H])], { size: 0.45 }));
  // conector del cable en la cara lateral
  const plugF = G.frameAlong([EDGE.x + EDGE.w, EDGE.y + 15, 6], [1, 0, 0]);
  out.push(S(G.disc(0, 1.6, 2.4, plugF, P), { tone: "mid" }));
  // display: ventana empotrada en la cara frontal
  const id = "cv-win";
  const shape = flat(WIN.x0, WIN.z0, WIN.x1, WIN.z1, WIN.r);
  const bars = Array.from({ length: 8 }, (_, i) => `<rect data-part="bar" x="${WIN.x0 + 27.5 + i * 1.8}" y="${-WIN.z0 - 2}" width="1.2" height="0" />`).join("");
  out.push(
    `<clipPath id="${id}"><path transform="${planeOf(front)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})"><g transform="${planeOf(front - WIN.depth)}">`,
    `<path class="cv-screen" d="${shape}"/>`,
    `<text class="cv-digits" data-part="digits" x="${WIN.x0 + 2.4}" y="${-WIN.z0 - 3.4}">--,-</text>`,
    `<text class="cv-unit" x="${WIN.x0 + 2.6}" y="${-WIN.z1 + 4}">CICLO · s</text>`,
    `<g class="cv-bars">${bars}</g>`,
    `</g></g>`,
    `<g transform="${planeOf(front)}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  );
  const led = at([EDGE.x + EDGE.w - 7, EDGE.y + EDGE.d - 6, EDGE_H]);
  out.push(L(k.ring(EDGE.x + EDGE.w - 7, EDGE.y + EDGE.d - 6, 2, EDGE_H, P, 16), { tone: "lo" }));
  out.push(`<circle class="cv-led" data-part="led2" cx="${led[0].toFixed(1)}" cy="${led[1].toFixed(1)}" r="1"/>`);
  return out.join("");
}

// ── Brazos: se arman en vivo (IK de dos tramos), mismo código en build y página ──
const ARMS = `
const OPX = ${OP[0]}, OPY = ${OP[1]}, SHZ = ${SHOULDER_Z}, ARM = ${ARM};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
function elbowOf(s, h, side) {
  const d = sub(h, s); const len = Math.min(Math.hypot(d[0], d[1], d[2]), ARM * 2 - 0.5); const dir = nrm(d);
  const out = [side * 1, -0.2, -0.75]; const dot = out[0] * dir[0] + out[1] * dir[1] + out[2] * dir[2];
  const n = nrm([out[0] - dot * dir[0], out[1] - dot * dir[1], out[2] - dot * dir[2]]);
  const r = Math.sqrt(Math.max(0, ARM * ARM - (len / 2) ** 2));
  return [s[0] + dir[0] * len / 2 + n[0] * r, s[1] + dir[1] * len / 2 + n[1] * r, s[2] + dir[2] * len / 2 + n[2] * r];
}
// mano derecha: empuja la caja a lo largo de la cinta; mano izquierda: sostiene el borde
function handsAt(p) {
  const e = (x) => x * x * (3 - 2 * x);
  let x, z;
  if (p < 0.3) { const q = e(p / 0.3); x = OPX + 30 - q * 34; z = 70 - Math.sin(q * Math.PI) * -4; }
  else if (p < 0.38) { const q = e((p - 0.3) / 0.08); x = OPX - 4; z = 70 - q * 7.4; }
  else if (p < 0.78) { const q = e((p - 0.38) / 0.4); x = OPX - 4 + q * 34; z = 62.6; }
  else { const q = e((p - 0.78) / 0.22); x = OPX + 30; z = 62.6 + q * 7.4; }
  return { right: [x + 16, 6, z], left: [OPX - 16, -9 + Math.sin(p * Math.PI * 2) * 0.6, 50.4] };
}
function armsAt(p) {
  const h = handsAt(p);
  const sR = [OPX + 12.8, OPY + 0.4, SHZ], sL = [OPX - 12.8, OPY + 0.4, SHZ];
  return { sR, sL, eR: elbowOf(sR, h.right, 1), eL: elbowOf(sL, h.left, -1), hR: h.right, hL: h.left };
}
function armsSvg(p, P, side) {
  const a = armsAt(p);
  const one = (s, e, h) => T.tubePieces(G.fillet([s, e, h], 8, 7), (t) => 5 - 1.4 * Math.max(0, t - 0.4) / 0.6, P, { maxLength: 80, caps: [false, false] }).map((piece) => T.tubeSvg(piece, { tone: "hi" })).join("") + solidSvg(G.sphereOf(h, 4.4, P), { tone: "mid" });
  return side === "left" ? one(a.sL, a.eL, a.hL) : one(a.sR, a.eR, a.hR);
}
`;
const ARMS_FN = new Function("T", "G", "solidSvg", ARMS + "return { armsAt, armsSvg };")({ tubePieces, tubeSvg }, G, k.solidSvg);

// ── Escena ──
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Una estación de trabajo: un operario empuja cajas sobre una cinta transportadora. Una cámara de seguridad montada en un poste lo observa y una caja de cómputo en el piso mide la duración de cada ciclo de la tarea.",
  body: [
    plate(),
    rack(),
    pallet(),
    post(),
    cable((p) => p.mid[2] > 3 && p.mid[1] < POST[1] + 14),
    operator("lower"),
    conveyorBack(),
    cleats(),
    `<g data-part="arm-left">${ARMS_FN.armsSvg(0.5, P, "left")}</g>`,
    operator("upper"),
    `<g data-part="boxes">${[0, 1, 2, 3].map((i) => `<g data-part="box" transform="${k.translateAlong(P, [-150 + i * SPACING, 0, 0])}">${box()}</g>`).join("")}</g>`,
    `<g data-part="arm-right">${ARMS_FN.armsSvg(0.5, P, "right")}</g>`,
    `<g data-part="pose" class="cv-pose"></g>`,
    conveyorFront(),
    cable((p) => !(p.mid[2] > 3 && p.mid[1] < POST[1] + 14)),
    edgeBox(),
    camera(),
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const CYCLES = ${JSON.stringify(CYCLES)}, SCALE = ${SCALE}, PHASES = ${JSON.stringify(PHASES)};
const SPACING = ${SPACING}, CLEATS = ${CLEATS}, BELT_X0 = ${BELT.x}, BELT_X1 = ${BELT.x + BELT.w}, HEAD = ${JSON.stringify(HEAD)}, OP = ${JSON.stringify(OP)};
${ARMS}
const q = new URLSearchParams(location.search);
if (q.has("embed")) document.body.classList.add("embed");
if (q.get("accent")) document.body.style.setProperty("--accent", "#" + q.get("accent").replace(/[^0-9a-f]/gi, ""));
const root = document.querySelector(".iso-stage");
const svg = root.querySelector("svg");
const $ = (sel) => svg.querySelector(sel);
const boxes = [...svg.querySelectorAll('[data-part="box"]')];
const cleatEls = [...svg.querySelectorAll('[data-part="cleat"]')], armL = $('[data-part="arm-left"]'), armR = $('[data-part="arm-right"]'), pose = $('[data-part="pose"]');
const digits = $('[data-part="digits"]'), bars = [...svg.querySelectorAll('[data-part="bar"]')];
const leds = [$('[data-part="led"]'), $('[data-part="led2"]')];
const readout = document.querySelector("[data-readout]");
const steps = [...document.querySelectorAll("[data-step]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");

// línea de tiempo: cada ciclo dura lo que mide (escalado), así lo que se ve y lo que se mide coinciden
const starts = []; let acc = 0; for (const c of CYCLES) { starts.push(acc); acc += c * SCALE; }
const LOOP = acc;
const cycleAt = (t) => { const u = ((t % LOOP) + LOOP) % LOOP; let i = 0; while (i + 1 < starts.length && starts[i + 1] <= u) i++; return { i, p: (u - starts[i]) / (CYCLES[i] * SCALE), n: Math.floor(t / LOOP) * CYCLES.length + i }; };
const phaseAt = (t) => { const u = t % PHASES.loop; return u < PHASES.detect ? 0 : u < PHASES.measure ? 1 : 2; };

let clock = 0, last = 0, frame = 0, visible = false, held = null, idle = 0;
const fmt = (s) => s.toFixed(1).replace(".", ",");
function draw() {
  const { i, p, n } = cycleAt(clock);
  const phase = held ?? phaseAt(clock);
  // cinta: una caja por ciclo
  const shift = SPACING * (n + p);
  boxes.forEach((b, j) => {
    let x = -150 + ((j * SPACING + shift) % (SPACING * 4)) - SPACING * 0.5;
    const fade = Math.min(1, Math.max(0, (x + 160) / 22), Math.max(0, (160 - x) / 22));
    b.setAttribute("transform", translateAlong(P, [x, 0, 0]));
    b.style.opacity = fade.toFixed(3);
  });
  cleatEls.forEach((c, j) => {
    const x = BELT_X0 + ((j * 20 + shift) % (CLEATS * 20));
    const fade = Math.max(0, Math.min(1, (x - BELT_X0 - 6) / 14, (BELT_X1 - 6 - x) / 14));
    c.setAttribute("transform", translateAlong(P, [x, 0, 0]));
    c.style.opacity = fade.toFixed(3);
  });
  armL.innerHTML = armsSvg(p, P, "left");
  armR.innerHTML = armsSvg(p, P, "right");
  // detección: puntos en las articulaciones visibles
  const a = armsAt(p);
  const on = phase >= 1;
  pose.innerHTML = on ? dotsSvg([HEAD, a.sL, a.sR, a.eL, a.eR, a.hL, a.hR].map((q) => iso(q, P)), { size: 1.25, tone: "lit" }) : "";
  leds.forEach((l) => l && l.setAttribute("data-on", on ? "1" : "0"));
  // display y lectura
  const done = n; // ciclos completos medidos
  if (phase < 2) {
    digits.textContent = phase === 1 ? "· · ·" : "--,-";
    bars.forEach((b) => b.setAttribute("height", "0"));
  } else {
    const prev = CYCLES[(i - 1 + CYCLES.length) % CYCLES.length];
    digits.textContent = fmt(prev);
    bars.forEach((b, j) => { const c = CYCLES[(i - 8 + j + CYCLES.length * 4) % CYCLES.length]; const h = (c - 30) / 30 * 9; b.setAttribute("height", h.toFixed(2)); b.setAttribute("y", (-${WIN.z0 + 2} - h).toFixed(2)); b.setAttribute("data-hot", c > 50 ? "1" : "0"); });
  }
  const text = phase === 0 ? "ciclo en curso · sin medir" : phase === 1 ? "cámara · detectando al operario" : "ciclo " + (done + 1) + " · último " + fmt(CYCLES[(i - 1 + CYCLES.length) % CYCLES.length]) + " s";
  if (readout.textContent !== text) readout.textContent = text;
  steps.forEach((s, j) => s.toggleAttribute("data-on", j === phase));
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += still.matches ? 0 : dt;
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(root);
const pick = (j) => { held = j; clearTimeout(idle); idle = setTimeout(() => { held = null; }, 6000); draw(); };
steps.forEach((s, j) => s.addEventListener("click", () => pick(j)));
root.addEventListener("keydown", (e) => {
  const now = held ?? phaseAt(clock);
  if (e.key === "ArrowRight") { e.preventDefault(); pick(Math.min(2, now + 1)); }
  if (e.key === "ArrowLeft") { e.preventDefault(); pick(Math.max(0, now - 1)); }
});
if (still.matches || q.has("still")) { clock = PHASES.measure + 1.2; }
draw();
`;

const CSS = `
.cv-led { fill: var(--anatomy-faint); transition: fill .4s; }
.cv-led[data-on="1"] { fill: var(--anatomy-lit); filter: drop-shadow(0 0 2px var(--anatomy-lit)); }
.cv-screen { fill: var(--anatomy-paper); }
.cv-digits { font: 600 6.6px/1 ui-monospace, Menlo, monospace; fill: var(--anatomy-hi); letter-spacing: .02em; }
.cv-unit { font: 600 2.6px/1 ui-monospace, Menlo, monospace; fill: var(--anatomy-lo); letter-spacing: .12em; }
.cv-bars rect { fill: var(--anatomy-mid); }
.cv-bars rect[data-hot="1"] { fill: var(--anatomy-lit); }
/* Modo embebido en el deck (?embed&accent=ec00ff): fondo del deck, sin marco, acento de la iniciativa */
body.embed { --anatomy-page: #000; background: #000; }
body.embed .iso-page { width: 100%; margin: 0; }
body.embed .iso-plate { --anatomy-card: #000; background: #000; box-shadow: none; padding: 0 0 44px; }
body.embed .iso-plate-corner[data-corner="fig"], body.embed .iso-plate-corner[data-corner="title"] { display: none; }
body.embed .iso-plate-corners { inset: auto 0 0 0; height: 30px; }
body.embed .iso-plate-corner { font-size: 16px; }
body.embed .iso-plate-corner[data-corner="readout"] { color: var(--anatomy-strong); }
body.embed .iso-legend, body.embed .iso-caption { display: none; }
body.embed .iso-stage svg { display: block; width: 100%; height: auto; max-height: calc(100vh - 235px); }
body.embed .steps { font-size: 22px; gap: 10px; margin-top: 18px; }
body.embed .iso-caption { font-size: 14px; }
body.embed { --anatomy-lit: var(--accent, #fff); }
.steps { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 6px; font: 13px/1.4 system-ui, sans-serif; }
.steps li { display: flex; gap: 10px; color: var(--anatomy-lo); cursor: pointer; transition: color .3s; }
.steps li b { font-weight: 500; min-width: 16px; }
.steps li[data-on] { color: var(--anatomy-hi); }
`;

const steps = ["El operario repite la tarea sobre la cinta", "La cámara instalada detecta inicio y fin de cada ciclo", "Cada ciclo queda medido, sin intervenir al operario"];
const card = k.plateHtml({
  fig: "Fig 1",
  title: "Medición de ciclos",
  hint: "Hacé clic en un paso o usá las flechas",
  readout: "ciclo en curso · sin medir",
  keys: [
    { mark: "lit", label: "Puntos de detección y lectura en vivo" },
    { mark: "raised", label: "Cámara existente y caja de cómputo en planta" },
  ],
  caption: "Simulación: cada ciclo dura en la animación lo mismo que mide (escalado). Los tiempos son ilustrativos.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Medición de ciclos con Computer Vision: flechas para pasar de un paso a otro">${svg}</div><ol class="steps">${steps.map((s, i) => `<li data-step="${i}"><b>${i + 1}.</b>${s}</li>`).join("")}</ol>`,
});

const out = join(HERE, theme === "light" ? "cv-light.html" : "cv.html");
writeFileSync(out, k.pageHtml({ title: "Medición de ciclos", theme, body: `<style>${CSS}</style>${card}`, script: pageScript(live) }));
console.log("wrote", out);
