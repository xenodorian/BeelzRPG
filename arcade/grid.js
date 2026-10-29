/* MUTAGEN ARCADE GRID: battle-map geometry with no DOM. 1 square = 5 ft (ch 1, "Time and Distance").
   Distance is counted in squares with diagonals = 1 (Chebyshev), the optional grid rule in ch 6.
   Used by engine.js (rules) and app.js (drawing); tested by tools/arcade_test.js. */
(function (root) {
"use strict";
const key = (x, y) => x + "," + y;
const unkey = k => { const [x, y] = k.split(",").map(Number); return { x, y }; };
const dist = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const inB = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;
const isBlocked = (m, x, y) => !inB(m, x, y) || m.blocked.has(key(x, y));
const sq = ft => Math.max(1, Math.round(ft / 5));
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

// Line of sight/effect: the cells strictly between a and b (Bresenham) must be clear of obstacles.
function los(m, a, b) {
  let x = a.x, y = a.y; const dx = Math.abs(b.x - x), dy = Math.abs(b.y - y), sx = x < b.x ? 1 : -1, sy = y < b.y ? 1 : -1; let err = dx - dy;
  while (true) { if (x === b.x && y === b.y) return true; const e2 = 2 * err; if (e2 > -dy) { err -= dy; x += sx; } if (e2 < dx) { err += dx; y += sy; } if (x === b.x && y === b.y) return true; if (m.blocked.has(key(x, y))) return false; }
}
// Breadth-first movement. pass(x,y) → may move through; stop(x,y) → may end there; cost per square = step (2 = careful/half speed).
function reachable(m, from, budget, pass, stop, step) {
  step = step || 1; const out = new Map(); const q = [{ x: from.x, y: from.y, cost: 0, prev: null }]; const seen = new Map([[key(from.x, from.y), q[0]]]);
  for (let i = 0; i < q.length; i++) {
    const c = q[i]; if (c.cost === 0 || stop(c.x, c.y)) out.set(key(c.x, c.y), c);
    if (c.cost + step > budget) continue;
    for (const [dx, dy] of DIRS) { const x = c.x + dx, y = c.y + dy; if (!inB(m, x, y)) continue; const k = key(x, y); if (seen.has(k)) continue; if (!pass(x, y)) continue; const n = { x, y, cost: c.cost + step, prev: c }; seen.set(k, n); q.push(n); }
  }
  return out;
}
function pathOf(node) { const p = []; for (let n = node; n; n = n.prev) p.unshift({ x: n.x, y: n.y }); return p; }
// Shortest path ignoring the move budget (used to walk toward a target that is out of reach this turn).
function pathToward(m, from, goalFn, pass, maxCost) {
  const r = reachable(m, from, maxCost || 99, pass, () => true); let best = null;
  r.forEach(n => { if (goalFn(n.x, n.y) && (!best || n.cost < best.cost)) best = n; });
  return best ? pathOf(best) : null;
}
/* ---- area footprints (lists of {x,y}) ---- */
function burst(m, c, r) { const out = []; for (let y = c.y - r; y <= c.y + r; y++) for (let x = c.x - r; x <= c.x + r; x++) if (inB(m, x, y) && !m.blocked.has(key(x, y)) && los(m, c, { x, y })) out.push({ x, y }); return out; }
function around(m, o, r) { return burst(m, o, r).filter(p => p.x !== o.x || p.y !== o.y); }
function cone(m, o, aim, len) {               // a 90° wedge from the origin toward the aim square
  const vx = aim.x - o.x, vy = aim.y - o.y, vl = Math.hypot(vx, vy) || 1, out = [];
  for (let y = o.y - len; y <= o.y + len; y++) for (let x = o.x - len; x <= o.x + len; x++) {
    if (!inB(m, x, y) || (x === o.x && y === o.y) || m.blocked.has(key(x, y))) continue; const dx = x - o.x, dy = y - o.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > len) continue; if ((dx * vx + dy * vy) / (Math.hypot(dx, dy) * vl) < 0.7071 - 1e-6) continue;
    if (los(m, o, { x, y })) out.push({ x, y });
  }
  return out;
}
function line(m, o, aim, len) {                // a 5-ft-wide line from the origin through the aim square, stopped by walls
  const out = []; if (aim.x === o.x && aim.y === o.y) return out; const vx = aim.x - o.x, vy = aim.y - o.y, steps = Math.max(Math.abs(vx), Math.abs(vy));
  for (let i = 1; i <= len; i++) { const x = o.x + Math.round(vx * i / steps), y = o.y + Math.round(vy * i / steps); if (!inB(m, x, y) || m.blocked.has(key(x, y))) break; out.push({ x, y }); }
  return out;
}
const inCells = (cells, p) => cells.some(c => c.x === p.x && c.y === p.y);

/* ---- maps ---- */
// Backdrops by level (Halcyon locations from ch 0/9/11). Obstacle kinds are drawn by app.js.
const THEMES = {
  pumpstation: { name: "Pumpstation 9 · Pump Hall", obst: ["pipe", "valve", "pipe", "crate"] },
  streets: { name: "The Wards · Flooded Street", obst: ["car", "barrel", "crate", "rubble"] },
  camp: { name: "Ostrander Lockdown Camp", obst: ["barricade", "crate", "barricade", "tower"] },
  clinic: { name: "GRAFT Clinic · Vat Lab", obst: ["vat", "console", "vat", "gurney"] },
  rustyard: { name: "Rust Yard · Drowned Docks", obst: ["container", "rubble", "barrel", "container"] },
  bloom: { name: "The Bloom · Patient Zero's Nest", obst: ["growth", "pod", "growth", "rubble"] }
};
const themeFor = L => (L <= 2 ? "pumpstation" : L <= 4 ? "streets" : L === 5 ? "camp" : L <= 7 ? "clinic" : L <= 9 ? "rustyard" : "bloom");
// rng: () => [0,1). nPC/nFoe size the map: 12×8 base, wider/taller for big fights.
function makeMap(rng, L, nPC, nFoe, boss) {
  const n = nPC + nFoe, w = 14 + (n > 8 ? 2 : 0) + (boss ? 2 : 0), h = 9 + (n > 10 ? 2 : n > 8 ? 1 : 0) + (boss ? 1 : 0), theme = themeFor(L);
  for (let tries = 0; tries < 40; tries++) {
    const m = { w, h, theme, themeName: THEMES[theme].name, blocked: new Set(), obst: {} };
    const blobs = 4 + Math.floor(rng() * 3) + (w > 14 ? 1 : 0);
    for (let b = 0; b < blobs; b++) {
      const kind = THEMES[theme].obst[Math.floor(rng() * THEMES[theme].obst.length)];
      let x = 3 + Math.floor(rng() * (w - 6)), y = Math.floor(rng() * h); const size = 1 + Math.floor(rng() * 3);
      for (let s = 0; s < size; s++) { if (inB(m, x, y) && x >= 3 && x <= w - 4) { m.blocked.add(key(x, y)); m.obst[key(x, y)] = kind; } if (rng() < 0.5) x += rng() < 0.5 ? 1 : -1; else y += rng() < 0.5 ? 1 : -1; }
    }
    // the two deployment zones must be connected for walkers
    const r = reachable(m, { x: 0, y: h >> 1 }, 999, (x, y) => !m.blocked.has(key(x, y)), () => true);
    let ok = true; for (let y = 0; y < h; y++) { if (!r.has(key(w - 1, y)) || !r.has(key(0, y))) { ok = false; break; } }
    if (ok) return m;
  }
  return { w, h, theme, themeName: THEMES[theme].name, blocked: new Set(), obst: {} };
}
// Deployment: freelancers on the left two columns, enemies on the right (ranged and Bosses further back).
function deploy(m, list, side) {
  const mid = m.h >> 1, used = new Set(); const out = [];
  const colsPC = [1, 0, 2], colsFoe = [m.w - 3, m.w - 2, m.w - 4, m.w - 1, m.w - 5];
  list.forEach((who, i) => {
    let pref;
    if (side === "pc") { const off = [0, -2, 2, -1, 1, -3, 3][i] || 0; pref = { x: i < 3 ? 1 : 0, y: mid + off }; }
    else { const ranged = who.ranged, off = [0, -2, 2, -1, 1, -3, 3, -4, 4][i % 9] || 0; pref = { x: ranged ? m.w - 2 : m.w - 3, y: mid + off - (i >= 9 ? 1 : 0) }; }
    let best = null;
    const cols = side === "pc" ? colsPC : colsFoe;
    for (const x of cols) for (let y = 0; y < m.h; y++) { const k = key(x, y); if (used.has(k) || m.blocked.has(k)) continue; const d = Math.abs(x - pref.x) * 2 + Math.abs(y - pref.y); if (!best || d < best.d) best = { x, y, d }; }
    if (!best) for (let y = 0; y < m.h && !best; y++) for (let x = 0; x < m.w; x++) { const k = key(x, y); if (!used.has(k) && !m.blocked.has(k)) { best = { x, y }; break; } }
    used.add(key(best.x, best.y)); out.push({ x: best.x, y: best.y });
  });
  return out;
}
function serialize(m) { return { w: m.w, h: m.h, theme: m.theme, themeName: m.themeName, blocked: [...m.blocked], obst: m.obst }; }
function restore(o) { return { w: o.w, h: o.h, theme: o.theme, themeName: o.themeName, blocked: new Set(o.blocked), obst: o.obst || {} }; }
root.MutagenGrid = { key, unkey, dist, inB, isBlocked, sq, los, reachable, pathOf, pathToward, burst, around, cone, line, inCells, THEMES, themeFor, makeMap, deploy, serialize, restore, DIRS };
})(typeof window !== "undefined" ? window : globalThis);
