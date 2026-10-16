// Persona de planta (operario o experto), compartida por las figuras.
// Cuerpo en dos partes (inferior detrás de lo que tiene adelante, superior después del brazo lejano)
// y brazos de dos tramos que se arman en vivo con IK.
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const up = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

// at: [x, y] de los pies · mira hacia +y · gear: "helmet" (casco + anteojos) o "ar" (casco + gafas de RA, data-part="ar")
export function worker(P, at, { gear = "helmet" } = {}) {
  const [x, y] = at;
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const SHOULDER_Z = 81;
  const HEAD = [x, y, 99.5];
  const lower = [];
  lower.push(`<path class="iso-halo" d="${k.haloOf({ x: x - 16, y: y - 10, w: 32, d: 24, r: 10 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  for (const dx of [-5.2, 5.2]) {
    lower.push(S(k.slabOf({ x: x + dx - 4.2, y: y - 5, w: 8.4, d: 17, r: 3.8 }, 0, 4.6, P, 5, 0.5), { tone: "lo" }));
    const leg = { x: x + dx - 4.5, y: y - 4.6, w: 9, d: 9.4, r: 4.3 };
    lower.push(S(k.slabOf(leg, 4.6, 40, P, 6), { tone: "lo", crease: "none", inner: L(k.sideSeam(leg, 25, P, 6), { tone: "faint" }) }));
  }
  const hips = { x: x - 11, y: y - 6, w: 22, d: 12.5, r: 5.6 };
  lower.push(S(k.slabOf(hips, 42, 11, P, 6), { tone: "lo", inner: L(k.sideSeam(hips, 50.5, P, 6), { tone: "mid" }) }));

  const upper = [];
  const belly = { x: x - 11.6, y: y - 6.6, w: 23.2, d: 13.6, r: 6.2 };
  upper.push(S(k.slabOf(belly, 53, 13, P, 6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(belly, 59, P, 6), { tone: "mid" }) }));
  const chest = { x: x - 14.5, y: y - 7.6, w: 29, d: 15.6, r: 7.4 };
  upper.push(S(k.slabOf(chest, 66, 18, P, 6, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(chest, 73, P, 6), { tone: "mid" }) }));
  upper.push(S(k.cylinder(x, y, 6.4, 84, 1.6, P, 24), { tone: "mid" }));
  for (const dx of [-12.8, 12.8]) upper.push(S(G.sphereOf([x + dx, y + 0.4, SHOULDER_Z], 6, P), { tone: "hi" }));
  upper.push(S(k.cylinder(x, y, 3.8, 85.6, 5.6, P, 20), { tone: "mid" }));
  upper.push(S(G.sphereOf(HEAD, 8.2, P), { tone: "mid" }));
  const face = up([HEAD[0], HEAD[1], HEAD[2] - 0.4]);
  upper.push(L(G.arcOf(face, -4.6, 6.8, P, { from: Math.PI * 0.3, to: Math.PI * 0.7 }), { tone: "lo" }));
  if (gear === "ar") {
    // gafas de RA: visor ancho al frente, banda alrededor de la cabeza y módulo de cámara con LED
    const visor = G.frameAlong([HEAD[0], HEAD[1] + 7.2, HEAD[2] - 0.4], [0, 1, 0]);
    upper.push(`<g data-part="ar">`);
    upper.push(`<g style="stroke-width:3.2">${L(G.arcOf(face, 0, 8.2, P), { tone: "lit" })}</g>`);
    upper.push(S(G.disc(0, 3.2, 2.4, G.frameAlong([HEAD[0] + 6.6, HEAD[1] + 4.6, HEAD[2] + 1.4], [0, 1, 0]), P), { tone: "hi" }));
    upper.push(`<circle class="ar-led" data-part="ar-led" cx="${k.iso([HEAD[0] + 6.6, HEAD[1] + 7.9, HEAD[2] + 1.4], P)[0].toFixed(1)}" cy="${k.iso([HEAD[0] + 6.6, HEAD[1] + 7.9, HEAD[2] + 1.4], P)[1].toFixed(1)}" r="0.9"/>`);
    upper.push(`</g>`);
    void visor;
  } else {
    upper.push(`<g style="stroke-width:2.2">${L(G.arcOf(face, 0, 8.15, P), { tone: "hi" })}</g>`);
  }
  const hat = up([x, y, HEAD[2] + 3.6]);
  upper.push(S(G.disc(0, 1.1, 11, hat, P), { tone: "hi" }));
  upper.push(S(G.solidOf([[1.1, 0], [1.1, 9.2], [3.4, 8.9, 1], [6.4, 7.4, 1], [8.8, 4.5, 1], [10, 0]], hat, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(hat, 4, 8.7, P), { tone: "mid" }) }));
  return { lower: lower.join(""), upper: upper.join(""), head: HEAD, shoulderZ: SHOULDER_Z };
}

// Código de brazos (se usa en el build y se inyecta en la página). Necesita T, G y solidSvg.
// handsAt(p) lo define cada figura: devuelve { right: [x, y, z], left: [x, y, z] }.
export const armsCore = (at, shoulderZ = 81, arm = 25) => `
const OPX = ${at[0]}, OPY = ${at[1]}, SHZ = ${shoulderZ}, ARM = ${arm};
const sub3_ = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const nrm3_ = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
function elbowOf(s, h, side) {
  const d = sub3_(h, s); const len = Math.min(Math.hypot(d[0], d[1], d[2]), ARM * 2 - 0.5); const dir = nrm3_(d);
  const out = [side * 1, -0.2, -0.75]; const dot = out[0] * dir[0] + out[1] * dir[1] + out[2] * dir[2];
  const n = nrm3_([out[0] - dot * dir[0], out[1] - dot * dir[1], out[2] - dot * dir[2]]);
  const r = Math.sqrt(Math.max(0, ARM * ARM - (len / 2) ** 2));
  return [s[0] + dir[0] * len / 2 + n[0] * r, s[1] + dir[1] * len / 2 + n[1] * r, s[2] + dir[2] * len / 2 + n[2] * r];
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
