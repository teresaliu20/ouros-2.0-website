
      // Powder → form. Grains drift as loose powder, then consolidate into rotating
      // line-art ceramic forms, hold, and release back to powder. Pure canvas, no video.
      export type PowderOpts = {
  canvas?: string; bg?: string; grain?: [number, number, number]; accent?: boolean; marks?: boolean; alpha?: number;
  desk?: { x: number; y: number; s: number }; mob?: { x: number; y: number; s: number };
  onPhase?: (info: { n: number; total: number; name: string; phase: string }) => void;
  onProgress?: (u: number) => void;
};
export function startPowder(o: PowderOpts = {}) {
      let BG = o.bg ?? "#0B0C0D", G = o.grain ?? [214, 218, 220], AL = o.alpha ?? 1;
      const D = o.desk ?? { x: 0.7, y: 0.5, s: 0.3 }, M = o.mob ?? { x: 0.5, y: 0.34, s: 0.22 };
      const cv = document.getElementById(o.canvas ?? "field") as HTMLCanvasElement;
      const ctx = cv.getContext("2d")!;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

      type V3 = [number, number, number];
      type Seg = [V3, V3];

      // ---- Shape library (unit space, roughly -1..1) ------------------------
      function box(cx: number, cy: number, cz: number, w: number, h: number, d: number): Seg[] {
        const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, z0 = cz - d / 2, z1 = cz + d / 2;
        const p: V3[] = [[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
        const e = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
        return e.map(([a, b]) => [p[a], p[b]] as Seg);
      }
      function ring(r: number, y: number, n = 48): Seg[] {
        const s: Seg[] = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
          s.push([[Math.cos(a) * r, y, Math.sin(a) * r], [Math.cos(b) * r, y, Math.sin(b) * r]]);
        }
        return s;
      }
      const tile = (): Seg[] => {
        const s = box(0, 0, 0, 1.7, 0.16, 1.7);
        for (let i = 1; i < 6; i++) { const t = -0.85 + (i / 6) * 1.7; s.push([[t, 0.08, -0.85], [t, 0.08, 0.85]], [[-0.85, 0.08, t], [0.85, 0.08, t]]); }
        return s;
      };
      const tube = (): Seg[] => {
        let s: Seg[] = [];
        for (let k = 0; k <= 6; k++) s = s.concat(ring(0.62, -0.72 + (k / 6) * 1.44, 56));
        s = s.concat(ring(0.42, -0.72, 40), ring(0.42, 0.72, 40));
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; s.push([[Math.cos(a) * 0.62, -0.72, Math.sin(a) * 0.62], [Math.cos(a) * 0.62, 0.72, Math.sin(a) * 0.62]]); }
        return s;
      };
      const honeycomb = (): Seg[] => {
        const s = box(0, 0, 0, 1.9, 0.22, 1.5);
        const r = 0.17, w = Math.sqrt(3) * r, y = 0.11;
        for (let row = -4; row <= 4; row++) for (let col = -5; col <= 5; col++) {
          const cx = col * w + (row & 1 ? w / 2 : 0), cz = row * 1.5 * r;
          if (Math.abs(cx) > 0.8 || Math.abs(cz) > 0.6) continue;
          for (let i = 0; i < 6; i++) {
            const a = Math.PI / 6 + (i * Math.PI) / 3, b = a + Math.PI / 3;
            s.push([[cx + Math.cos(a) * r * 0.92, y, cz + Math.sin(a) * r * 0.92], [cx + Math.cos(b) * r * 0.92, y, cz + Math.sin(b) * r * 0.92]]);
          }
        }
        return s;
      };
      const beam = (): Seg[] => {
        // I-profile extruded along z.
        const prof: [number, number][] = [[-.55,-.6],[.55,-.6],[.55,-.44],[.1,-.44],[.1,.44],[.55,.44],[.55,.6],[-.55,.6],[-.55,.44],[-.1,.44],[-.1,-.44],[-.55,-.44]];
        const s: Seg[] = [];
        const zs = [-1, -0.5, 0, 0.5, 1];
        for (const z of zs) for (let i = 0; i < prof.length; i++) { const a = prof[i], b = prof[(i + 1) % prof.length]; s.push([[a[0], a[1], z], [b[0], b[1], z]]); }
        for (const p of prof) s.push([[p[0], p[1], -1], [p[0], p[1], 1]]);
        return s;
      };
      const SHAPES = [
        { name: "Tile", segs: tile() },
        { name: "Tube", segs: tube() },
        { name: "Honeycomb panel", segs: honeycomb() },
        { name: "Structural beam", segs: beam() },
      ];

      // Sample N points along segments, weighted by length.
      function sample(segs: Seg[], n: number): V3[] {
        const len = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
        const total = len.reduce((x, y) => x + y, 0);
        const out: V3[] = [];
        segs.forEach(([a, b], i) => {
          const k = Math.max(1, Math.round((len[i] / total) * n));
          for (let j = 0; j < k; j++) {
            const t = Math.random(), jit = 0.006;
            out.push([a[0] + (b[0] - a[0]) * t + (Math.random() - .5) * jit, a[1] + (b[1] - a[1]) * t + (Math.random() - .5) * jit, a[2] + (b[2] - a[2]) * t + (Math.random() - .5) * jit]);
          }
        });
        while (out.length < n) out.push(out[(Math.random() * out.length) | 0]);
        out.length = n;
        // Shuffle so particles travel to random places on the form.
        for (let i = out.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [out[i], out[j]] = [out[j], out[i]]; }
        return out;
      }

      // ---- Particles ---------------------------------------------------------
      let W = 0, H = 0, DPR = 1, N = 0, cx = 0, cy = 0, S = 0;
      let hx: Float32Array, hy: Float32Array, px: Float32Array, py: Float32Array, vx: Float32Array, vy: Float32Array, delay: Float32Array, acc: Uint8Array;
      let targets: V3[][] = [];

      function resize() {
        DPR = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        cv.width = W * DPR; cv.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const mobile = W < 761;
        cx = mobile ? W * M.x : W * D.x;
        cy = mobile ? H * M.y : H * D.y;
        S = mobile ? Math.min(W * 0.36, H * M.s) : Math.min(W * 0.2 * (D.s / 0.3), H * D.s);
        const n = mobile ? 1500 : 2800;
        if (n !== N) init(n);
      }
      function init(n: number) {
        N = n;
        hx = new Float32Array(n); hy = new Float32Array(n); px = new Float32Array(n); py = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
        delay = new Float32Array(n); acc = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
          hx[i] = Math.cos(a) * r * 2.3; hy[i] = Math.sin(a) * r * 1.5;
          px[i] = cx + hx[i] * S; py[i] = cy + hy[i] * S;
          delay[i] = Math.random(); acc[i] = Math.random() < 0.018 ? 1 : 0;
        }
        targets = SHAPES.map((s) => sample(s.segs, n));
      }

      // ---- Timeline ----------------------------------------------------------
      const T_DISP = 1.2, T_FORM = 3.2, T_HOLD = 3.4, T_REL = 1.6;
      const CYCLE = T_DISP + T_FORM + T_HOLD + T_REL;
      const TILT = -0.52;
      const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));

      let start = performance.now(), last = start, lastPhase = "";
      function frame(now: number) {
        const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
        const t = Math.max(0, (now - start) / 1000);
        const k = Math.floor(t / CYCLE), u = t - k * CYCLE;
        const si = reduce ? 0 : k % SHAPES.length;
        const tg = targets[si];

        let phase: string, pull: number;
        if (reduce) { phase = "Formed"; pull = 1; }
        else if (u < T_DISP) { phase = "Dispersed"; pull = 0; }
        else if (u < T_DISP + T_FORM) { phase = "Consolidating"; pull = (u - T_DISP) / T_FORM; }
        else if (u < T_DISP + T_FORM + T_HOLD) { phase = "Formed"; pull = 1; }
        else { phase = "Releasing"; pull = -1; }

        if (phase !== lastPhase) {
          o.onPhase?.({ n: si + 1, total: SHAPES.length, name: SHAPES[si].name, phase });
          if (phase === "Releasing") {
            for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, m = 40 + Math.random() * 140; vx[i] += Math.cos(a) * m * 0.02; vy[i] += Math.sin(a) * m * 0.02; }
          }
          lastPhase = phase;
        }
        o.onProgress?.(reduce ? 1 : u / CYCLE);

        // Rotation of the form.
        const ry = t * 0.22 + si * 0.9, cyR = Math.cos(ry), syR = Math.sin(ry), cxR = Math.cos(TILT), sxR = Math.sin(TILT);

        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, H);

        // Faint registration marks around the forming zone.
        ctx.strokeStyle = `rgba(${G[0]},${G[1]},${G[2]},${o.marks === false ? 0 : 0.12})`; ctx.lineWidth = 1;
        const m = S * 1.45, L = 12;
        ctx.beginPath();
        for (const [sx, sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
          const x = cx + sx * m, y = cy + sy * m;
          ctx.moveTo(x, y); ctx.lineTo(x - sx * L, y); ctx.moveTo(x, y); ctx.lineTo(x, y - sy * L);
        }
        ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
        ctx.stroke();

        for (let i = 0; i < N; i++) {
          let x = px[i], y = py[i];
          // Loose-powder drift (cheap flow field).
          const fx = Math.sin(y * 0.006 + t * 0.4 + delay[i] * 6) + Math.cos(t * 0.3 + i), fy = Math.cos(x * 0.006 - t * 0.35) * 0.8;

          if (pull > 0) {
            // Per-grain stagger so the form builds from the bottom up.
            const p3 = tg[i];
            let X = p3[0] * cyR - p3[2] * syR, Z = p3[0] * syR + p3[2] * cyR, Y = p3[1];
            const Y2 = Y * cxR - Z * sxR, Z2 = Y * sxR + Z * cxR;
            const persp = 3.2 / (3.2 + Z2);
            const tx = cx + X * S * persp, ty = cy - Y2 * S * persp;
            const order = (1 - (p3[1] + 1) / 2) * 0.55 + delay[i] * 0.45;
            const w = phase === "Formed" ? 1 : ease((pull - order * 0.6) / 0.4);
            vx[i] += (tx - x) * 0.07 * w + fx * 0.04 * (1 - w);
            vy[i] += (ty - y) * 0.07 * w + fy * 0.04 * (1 - w);
            vx[i] *= 0.72 + 0.2 * (1 - w); vy[i] *= 0.72 + 0.2 * (1 - w);
          } else {
            // Loose powder: each grain drifts around its own spot in a wide cloud.
            const hxp = cx + (hx[i] + Math.sin(t * 0.25 + delay[i] * 9) * 0.12) * S, hyp = cy + (hy[i] + Math.cos(t * 0.2 + delay[i] * 7) * 0.1) * S;
            vx[i] += fx * 0.03 + (hxp - x) * 0.004; vy[i] += fy * 0.03 + (hyp - y) * 0.004;
            vx[i] *= 0.93; vy[i] *= 0.93;
          }
          x += vx[i] * dt * 60; y += vy[i] * dt * 60;
          px[i] = x; py[i] = y;

          if (acc[i] && o.accent !== false) { ctx.fillStyle = "rgba(214,242,92,.9)"; ctx.fillRect(x, y, 1.6, 1.6); }
          else { ctx.fillStyle = `rgba(${G[0]},${G[1]},${G[2]},${(0.38 + delay[i] * 0.45) * AL})`; ctx.fillRect(x, y, 1.35, 1.35); }
        }
        if (!reduce) requestAnimationFrame(frame);
      }

      addEventListener("resize", () => { resize(); if (reduce) requestAnimationFrame(frame); });
      resize();
      if (reduce) {
        // Static: snap grains onto the first form.
        for (let i = 0; i < 400; i++) frame(performance.now() + i * 16);
      } else requestAnimationFrame(frame);
      document.addEventListener("visibilitychange", () => { if (!document.hidden) last = performance.now(); });
      return {
        setColors(bg: string, grain: [number, number, number], alpha?: number) {
          BG = bg; G = grain; if (alpha !== undefined) AL = alpha;
          if (reduce) for (let i = 0; i < 2; i++) frame(performance.now());
        },
      };
}
