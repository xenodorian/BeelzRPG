// Grid vs book budget: does a ch 10 "Hard" (fair) encounter stay fair when it's played on a battle map?
// Plays single fights in the arcade engine (grid, real ranges and templates) with fresh, fully rested random
// parties at every level, at the book's Hard budget (threat x1, no arcade difficulty factor), Last Gasp,
// Emergence and Final Form OFF (as in tools/encounter_sim.py), and reports the ch 10 fair-band measures.
// Usage: node tools/grid_budget.js [fightsPerLevelAndKind=60] [party=4] [threat=1] [seed=7000]
global.window = globalThis;
['mutagen_rules.js', 'roster.js', 'grid.js', 'engine.js'].forEach(f => require('../arcade/' + f));
const A = window.MutagenArcade, R = window.MutagenRules, RO = window.MUTAGEN_ROSTER;
const N = +(process.argv[2] || 60), P = +(process.argv[3] || 4), TH = +(process.argv[4] || 1), SEED = +(process.argv[5] || 7000);
const FORMS = ['juggernaut', 'skitter', 'oracle', 'alembic', 'siren'];
const BY = {}; RO.roster.forEach(b => BY[b.name] = b);
const isHeavy = n => (BY[n] || {}).kind === 'aoe';
function fight(L, kind, seed) {
  A.setSeed(seed);
  const forms = FORMS.slice().sort(() => A.rng() - 0.5);
  const chars = []; for (let i = 0; i < P; i++) chars.push(R.randomChar(L, forms[i % 5]));
  const run = A.newRun({ difficulty: 'medium', threat: TH, characters: chars, seed });
  run.pcs.forEach(rp => { rp.lastGasp = false; rp.emerge = 0; });
  run.step = kind;
  const F = A.startFight(run); F.resolvePrime();
  const areas = { n: 0, caught: 0 };
  F.begin(); let g = 0;
  while (F.phase !== 'won' && F.phase !== 'lost' && g++ < 3000) {
    if (F.round > 40) { F.phase = 'lost'; F.finish(false); break; }
    if (F.phase !== 'player') break;
    const c = F.pending()[0]; if (!c) F.endPlayerPhase(); else A.autoTurn(F, c);
  }
  for (const e of F.events || []) if (e.t === 'area' && e.to && F.foes.some(x => x.id === e.id)) { areas.n++; areas.caught += e.to.length; }
  const tot = F.pcs.reduce((t, c) => t + c.maxhp, 0), left = F.pcs.reduce((t, c) => t + (c.dead || c.down ? 0 : Math.max(0, c.hp)), 0);
  const names = kind === 'boss' ? [run.enc[L].boss] : run.enc[L].minion;
  return { names: [...new Set(names)], win: F.phase === 'won', down: F.pcs.some(c => c.everDown), death: F.pcs.some(c => c.dead), rounds: F.round, lost: 1 - left / tot, heavy: names.some(isHeavy), areas };
}
const rows = [], all = { heavy: [], other: [] };
for (let L = 1; L <= 10; L++) for (const kind of ['minion', 'boss']) {
  const rs = []; for (let i = 0; i < N; i++) { try { rs.push(fight(L, kind, SEED + L * 1000 + (kind === 'boss' ? 500 : 0) + i)); } catch (e) { console.error('crash', L, kind, i, e.message); } }
  rs.forEach(r => all[r.heavy ? 'heavy' : 'other'].push(r));
  rows.push({ L, kind, rs });
}
const pct = (rs, f) => rs.length ? Math.round(100 * rs.filter(f).length / rs.length) : NaN;
const avg = (rs, f) => rs.length ? rs.reduce((t, r) => t + f(r), 0) / rs.length : NaN;
const sum = rs => { const a = rs.reduce((t, r) => ({ n: t.n + r.areas.n, c: t.c + r.areas.caught }), { n: 0, c: 0 }); return `win ${pct(rs, r => r.win)}% · Down ${pct(rs, r => r.down)}% · death ${pct(rs, r => r.death)}% · rounds ${avg(rs, r => r.rounds).toFixed(1)} · HP lost ${Math.round(100 * avg(rs, r => r.lost))}%${a.n ? ` · enemy Areas catch ${(a.c / a.n).toFixed(2)} freelancers` : ''} (n=${rs.length})`; };
console.log(`Grid fights at the book's Hard budget × ${TH}, party of ${P}, ${N} fights per level and kind (fair band: win 90%+, Down 40–60%, death ≤5%, 3–7 rounds)`);
console.log('| Level | Group fight (MR budget) | Centrepiece fight (BR) |'); console.log('|---|---|---|');
for (let L = 1; L <= 10; L++) { const m = rows.find(r => r.L === L && r.kind === 'minion').rs, b = rows.find(r => r.L === L && r.kind === 'boss').rs; console.log(`| ${L} | ${sum(m)} | ${sum(b)} |`); }
const flat = rows.flatMap(r => r.rs);
console.log(`\nAll: ${sum(flat)}`); console.log(`With a Heavy: ${sum(all.heavy)}`); console.log(`Without a Heavy: ${sum(all.other)}`);
// by creature: every fight it appears in (worst first), to spot the creatures that run hot on a grid
const byC = {}; flat.forEach(r => r.names.forEach(n => (byC[n] = byC[n] || []).push(r)));
console.log('\n| Creature | Kind | Fights | Win | Down | Death | Areas catch |'); console.log('|---|---|---|---|---|---|---|');
Object.entries(byC).sort((a, b) => pct(a[1], r => r.win) - pct(b[1], r => r.win)).forEach(([n, rs]) => { const a = rs.reduce((t, r) => ({ n: t.n + r.areas.n, c: t.c + r.areas.caught }), { n: 0, c: 0 }); console.log(`| ${n} | ${(BY[n] || {}).kind || ''} | ${rs.length} | ${pct(rs, r => r.win)}% | ${pct(rs, r => r.down)}% | ${pct(rs, r => r.death)}% | ${a.n ? (a.c / a.n).toFixed(2) : '–'} |`); });

