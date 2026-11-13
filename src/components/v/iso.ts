// Tiny build-time isometric (dimetric) line-art engine for Version 4.
// Draws boxes, scaffolds, cylinders and paths as SVG strings. No runtime dependency.

export type Pt = [number, number];
export type Proj = (x: number, y: number, z: number) => Pt;

const rad = (d: number) => (d * Math.PI) / 180;
/** Projection with the x axis at `ax`° below horizontal and the y axis at `ay`° (to the left). */
export const projection = (ax = 30, ay = 30, s = 1): Proj => {
  const cx = Math.cos(rad(ax)), sx = Math.sin(rad(ax));
  const cy = Math.cos(rad(ay)), sy = Math.sin(rad(ay));
  return (x, y, z) => [(x * cx - y * cy) * s, (x * sx + y * sy - z) * s];
};

const f = (n: number) => Math.round(n * 100) / 100;
const pts = (a: Pt[]) => a.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");
const seg = (a: Pt, b: Pt) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
export const line = (P: Proj, a: [number, number, number], b: [number, number, number]) => seg(P(...a), P(...b));
export const poly = (P: Proj, a: [number, number, number][]) => "M" + a.map((p) => P(...p).map(f).join(" ")).join("L") + "Z";
export const path3 = (P: Proj, a: [number, number, number][]) => "M" + a.map((p) => P(...p).map(f).join(" ")).join("L");

/** 12 edges of a box. Hidden (back) edges are returned separately so they can be styled lighter. */
export const boxEdges = (P: Proj, x: number, y: number, z: number, w: number, d: number, h: number) => {
  const c = (i: number, j: number, k: number): [number, number, number] => [x + i * w, y + j * d, z + k * h];
  const vis = [
    [c(0, 1, 0), c(1, 1, 0)], [c(1, 0, 0), c(1, 1, 0)], [c(0, 1, 0), c(0, 1, 1)], [c(1, 1, 0), c(1, 1, 1)], [c(1, 0, 0), c(1, 0, 1)],
    [c(0, 0, 1), c(1, 0, 1)], [c(0, 1, 1), c(1, 1, 1)], [c(0, 0, 1), c(0, 1, 1)], [c(1, 0, 1), c(1, 1, 1)],
  ];
  const hid = [[c(0, 0, 0), c(1, 0, 0)], [c(0, 0, 0), c(0, 1, 0)], [c(0, 0, 0), c(0, 0, 1)]];
  return { vis: vis.map(([a, b]) => line(P, a, b)).join(""), hid: hid.map(([a, b]) => line(P, a, b)).join("") };
};

/** Shaded faces (top, front +y, right +x) — the AIRCO look. */
export const boxFaces = (P: Proj, x: number, y: number, z: number, w: number, d: number, h: number) => ({
  top: poly(P, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]),
  front: poly(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]),
  right: poly(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]),
});

/** A solid box: three filled faces plus outline. */
export const solid = (P: Proj, x: number, y: number, z: number, w: number, d: number, h: number, cls = "") => {
  const F = boxFaces(P, x, y, z, w, d, h);
  const E = boxEdges(P, x, y, z, w, d, h);
  return `<g class="solid ${cls}"><path class="ft" d="${F.top}"/><path class="ff" d="${F.front}"/><path class="fr" d="${F.right}"/><path class="ed" d="${E.vis}"/></g>`;
};

/** Scaffold lattice: a box subdivided into a frame grid (the Aligned look). */
export const scaffold = (P: Proj, x: number, y: number, z: number, w: number, d: number, h: number, nx = 3, ny = 2, nz = 3) => {
  let s = "";
  for (let k = 0; k <= nz; k++) {
    const zz = z + (h * k) / nz;
    for (let i = 0; i <= nx; i++) s += line(P, [x + (w * i) / nx, y, zz], [x + (w * i) / nx, y + d, zz]);
    for (let j = 0; j <= ny; j++) s += line(P, [x, y + (d * j) / ny, zz], [x + w, y + (d * j) / ny, zz]);
  }
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) s += line(P, [x + (w * i) / nx, y + (d * j) / ny, z], [x + (w * i) / nx, y + (d * j) / ny, z + h]);
  return s;
};

/** Ground plate with a grid. */
export const plate = (P: Proj, x: number, y: number, w: number, d: number, step = 10) => {
  let g = "";
  for (let i = 0; i <= w; i += step) g += line(P, [x + i, y, 0], [x + i, y + d, 0]);
  for (let j = 0; j <= d; j += step) g += line(P, [x, y + j, 0], [x + w, y + j, 0]);
  return { grid: g, edge: poly(P, [[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]]) };
};

/** Circle in a horizontal plane, as a polygon path. */
export const ring = (P: Proj, cx: number, cy: number, z: number, r: number, n = 48) =>
  "M" + Array.from({ length: n + 1 }, (_, i) => P(cx + r * Math.cos((i / n) * 2 * Math.PI), cy + r * Math.sin((i / n) * 2 * Math.PI), z).map(f).join(" ")).join("L") + "Z";

/** Vertical cylinder with shaded side and top ellipse. */
export const cylinder = (P: Proj, cx: number, cy: number, z: number, r: number, h: number, cls = "") => {
  const n = 40;
  const at = (zz: number) => Array.from({ length: n }, (_, i) => P(cx + r * Math.cos((i / n) * 2 * Math.PI), cy + r * Math.sin((i / n) * 2 * Math.PI), zz));
  const b = at(z), t = at(z + h);
  let li = 0, ri = 0;
  b.forEach((p, i) => { if (p[0] < b[li][0]) li = i; if (p[0] > b[ri][0]) ri = i; });
  // front half of the bottom ellipse: points with larger screen y between the extremes
  const front: Pt[] = [];
  for (let k = 0, i = ri; k <= n; k++, i = (i + 1) % n) { front.push(b[i]); if (i === li) break; }
  const side = "M" + [t[ri], ...front.map((p) => p), t[li]].map((p) => p.map(f).join(" ")).join("L") + "Z";
  const top = "M" + t.map((p) => p.map(f).join(" ")).join("L") + "Z";
  return `<g class="solid ${cls}"><path class="ff" d="${side}"/><path class="ft" d="${top}"/><path class="ed" d="${side}${top}"/></g>`;
};

/** Deterministic scatter of points on/around a box, for the point-cloud speckle. */
export const speckle = (P: Proj, x: number, y: number, z: number, w: number, d: number, h: number, n: number, seed = 1) => {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => P(x + rnd() * w, y + rnd() * d, z + rnd() * h).map(f) as Pt);
};

export const bounds = (P: Proj, corners: [number, number, number][], pad = 20) => {
  const p = corners.map((c) => P(...c));
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
  return { x: f(x0), y: f(y0), w: f(Math.max(...xs) - x0 + pad), h: f(Math.max(...ys) - y0 + pad) };
};

export { pts, seg, f };
