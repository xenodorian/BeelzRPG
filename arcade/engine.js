/* MUTAGEN ARCADE ENGINE: runs, encounters, combat and level-ups. No DOM: the UI (app.js) and the tests (tools/arcade_*.js)
   drive it through the same API. Rules: chapters 01, 04, 05, 06, 07, 10. Character numbers come from the builder's own
   derive() (arcade/mutagen_rules.js, synced from builder/index.html); enemies from arcade/roster.js (tools/encounter_roster.py).
   Simplifications are listed in Current_Work.md, "Arcade Mode". */
(function (root) {
"use strict";
const RULES = root.MutagenRules, ROS = root.MUTAGEN_ROSTER, G = root.MutagenGrid;
const D = RULES.D;
const VERSION = "2.0.0";   // 2.x: battle map (grid.js)

/* ------------------------------------------------------------------ dice */
let _seed = null, _rs = 0;
function setSeed(n) { if (n == null) { _seed = null; return; } _seed = n >>> 0; _rs = _seed || 1; }
function rng() {
  if (_seed === null) return Math.random();
  _rs = (_rs + 0x6D2B79F5) >>> 0; let t = _rs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const die = s => 1 + Math.floor(rng() * s);
function roll(n, s) { const r = []; for (let i = 0; i < Math.max(0, n); i++) r.push(die(s)); return { t: r.reduce((a, b) => a + b, 0), r }; }
function d20(adv) { const a = die(20); if (!adv) return { v: a, txt: String(a) }; const b = die(20); const v = adv > 0 ? Math.max(a, b) : Math.min(a, b); return { v, txt: `${a}/${b}${adv > 0 ? " adv" : " dis"}→${v}` }; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const advOf = (up, down) => (up && !down ? 1 : down && !up ? -1 : 0);
function pick(a) { return a[Math.floor(rng() * a.length)]; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function parseDice(s) { const m = /(\d+)d(\d+)\s*(?:([+\u2212-])\s*(\d+))?/.exec(String(s || "")); if (!m) return { n: 0, s: 0, k: 0 }; return { n: +m[1], s: +m[2], k: m[4] ? (m[3] === "+" ? 1 : -1) * +m[4] : 0 }; }
const sgn = n => (n >= 0 ? "+" + n : "\u2212" + Math.abs(n));
const clone = o => JSON.parse(JSON.stringify(o));

/* ------------------------------------------------------------------ tables */
// Difficulty = party size (the request) plus a threat factor on top of the book's budgets (calibrated by tools/arcade_test.js).
const DIFFS = { easy: { name: "Easy", size: 5, threat: 1.0 }, medium: { name: "Medium", size: 4, threat: 1.22 }, hard: { name: "Hard", size: 3, threat: 1.38 } };
const HARD_BUDGET = { 1: 1, 2: 1.75, 3: 2.75, 4: 4, 5: 5.5, 6: 7 };          // ch 10 §5
const UNITS_MR = { "-3": 1 / 3, "-2": 0.5, "-1": 0.75, "0": 1, "1": 1.5, "2": 2, "3": 3 };
// Grid ranges (1 square = 5 ft; see Current_Work.md "Arcade grid"): ch 4 Shapes and ch 6/8 weapon ranges in squares.
const SHAPE_GEO = { strike: { reach: 1 }, bolt: { range: 12 }, burst: { range: 12, radius: 2 }, wave: { cone: 3, line: 6 }, pulse: { radius: 2 }, infuse: { range: 6 } };
const TOUCH = 1, NEAR = 6, FAR = 12;          // touch / 30 ft / 60 ft
const RIDER = { blaze: "burning", shock: "dazed", toxin: "poisoned", corrode: "exposed", snare: "held", quake: "prone", glare: "blinded", dread: "shaken" };
const COND_NAME = { burning: "Burning", dazed: "Dazed", poisoned: "Poisoned", exposed: "Exposed", held: "Held", prone: "Prone", blinded: "Blinded", shaken: "Shaken", veiled: "Veiled", linked: "Linked", shell: "Shell", braced: "Braced", helped: "Helped", cocoon: "Cocoon", redmist: "Red Mist", reboot: "Hard Reboot", targeterr: "Targeting Error", ospike: "Overclock Spike", ravenous: "Ravenous", spotted: "Spotted", adrenal: "Adrenal", safemode: "Safe Mode", molt: "Molt", analyzed: "Analyzed", weakspot: "Weak Spot", locked: "Target Lock" };
const BLOOM = [null, "Scar", "Seizure", "Ravenous", "Overgrowth", "Red Mist", "Fever", "Molt", "Twitch", "Adrenal Flood", "Cocoon", "Blossom", "Flowering"];
const GLITCH = [null, "Fault", "Hard Reboot", "Short", "Joint Lock", "Targeting Error", "Blackout", "Heat Vent", "Log Dump", "Safe Mode", "Overclock Spike", "Patch Applied", "Root Access"];
// How much a freelancer wants each result (used to pick for Splices and Bloom Converts): higher is better.
const BLOOM_PREF = [0, -5, -4, -1, 0, -3, -2, 2, 3, 2, 1, 4, 5], GLITCH_PREF = [0, -5, -4, -2, 0, -2, -3, 1, 3, 1, 2, 4, 5];
const WILD = [null, "Misfire", "Spore Bloom", "Arc Storm", "Hardening", "Blood Price", "Echo", "Mitosis", "Phase Step", "Gravity Knot", "Feedback", "Flush", "Perfect Expression"];
const INJURY = [null, "ribs", "concussion", "torn", "gland", "shellshock", "lucky"];
const KNACK_FOR = { patch: /medic|medicine|surg|first aid|biolog|clinic|chemist/i, rally: /crowd|preach|command|squad|tactic|lead|perform/i };

/* ------------------------------------------------------------------ roster helpers */
const BY = {}; ROS.roster.forEach(b => BY[b.name] = b); Object.keys(ROS.summons).forEach(k => BY[k] = BY[k] || ROS.summons[k]);
const stageOfT = T => (T >= 7 ? 2 : T >= 4 ? 1 : 0);
const stageOfL = L => (L >= 7 ? 2 : L >= 4 ? 1 : 0);
const rating = (b, k) => { const v = b.ratings && b.ratings[k]; return v == null ? null : v; };
// Units a creature costs in a group (ch 10 §5 step 3-4 + §6), from its party-of-4 MR.
function unitsFor(b, L, P) {
  const mr = rating(b, "m4"); if (mr == null || mr >= 12) return null;
  let diff = Math.round(mr) - L;
  const cs = stageOfT(b.T), ps = stageOfL(L);
  if (cs > ps) return null;                     // next stage: we never field these as minions
  if (cs < ps) diff -= 1;                       // previous stage: one step lower
  if (diff < -3 || diff > 3) return null;
  let u = UNITS_MR[String(diff)];
  if (b.kind === "aoe" && P >= 5) u *= 1.5;
  return u;
}
// Minion encounter: one or two creature types from the roster, worth the Hard budget for the party size.
function buildMinions(L, P, mult) {
  const budget = (HARD_BUDGET[P] || P) * (mult || 1);
  const pool = ROS.roster.filter(b => b.role !== "boss").map(b => ({ b, u: unitsFor(b, L, P) })).filter(x => x.u && x.u <= budget);
  let best = null;
  for (let tries = 0; tries < 60; tries++) {
    const a = pick(pool); const comp = []; let spent = 0, n = 0;
    const two = rng() < 0.5 ? pool.filter(x => x !== a && x.b.faction === a.b.faction) : [];
    const b2 = two.length ? pick(two) : null;
    // main type first (2+ of it if it's a Pack), then fill with the second type or more of the first
    while (spent + a.u <= budget + 0.01 && n < 8 && (!b2 || comp.filter(x => x === a.b.name).length < Math.max(2, Math.ceil(budget / a.u / 2)))) { comp.push(a.b.name); spent += a.u; n++; }
    const fill = b2 || a;
    while (spent + fill.u <= budget + 0.01 && n < 8) { comp.push(fill.b.name); spent += fill.u; n++; }
    if (b2) while (spent + a.u <= budget + 0.01 && n < 8) { comp.push(a.b.name); spent += a.u; n++; }
    if (!comp.length) continue;
    const score = Math.abs(budget - spent) + (comp.length < 2 ? 1 : 0) + (comp.length > 7 ? 0.5 : 0);
    if (!best || score < best.score) best = { comp, spent, score };
    if (score < 0.15) break;
  }
  return { names: best ? best.comp : ["Ward Tough"], units: best ? best.spent : 1, budget };
}
// Boss fight: the real Bosses at levels 1, 5 and 10; otherwise a centrepiece whose party-of-4 BR is closest to the level.
const BOSS_AT = { 1: ["The Brood Matriarch"], 5: ["Warden Krell"], 10: ["Patient Zero"] };
function bossFor(L) {
  if (BOSS_AT[L]) return BOSS_AT[L][0];
  const c = ROS.roster.filter(b => b.role !== "boss" && stageOfT(b.T) <= stageOfL(L) && rating(b, "b4") != null && Math.abs(rating(b, "b4") - L) <= 0.75 && ["elite", "brute", "controller", "artillery", "soldier"].includes(b.role));
  const ok = c.length ? c : ROS.roster.filter(b => b.role !== "boss").sort((x, y) => Math.abs(rating(x, "b4") - L) - Math.abs(rating(y, "b4") - L)).slice(0, 2);
  return pick(ok).name;
}

/* ------------------------------------------------------------------ runs */
const LS = { run: "mutagen.arcade.run", parties: "mutagen.arcade.parties", chars: "mutagen.builder.saves", best: "mutagen.arcade.records" };
function newRun(opts) {
  const diff = DIFFS[opts.difficulty] ? opts.difficulty : "medium";
  const chars = opts.characters.map(c => RULES.normalize(c));
  const run = { v: 1, app: "mutagen-arcade", rules: D.version, engine: VERSION, id: "run" + Date.now().toString(36), seed: opts.seed != null ? opts.seed : Math.floor(Math.random() * 1e9),
    difficulty: diff, threat: opts.threat != null ? opts.threat : DIFFS[diff].threat, size: chars.length, hardcore: !!opts.hardcore, partyName: opts.partyName || "The Freelancers", level: 1, step: "minion",
    pcs: chars.map((s, i) => newRunPC(s, i)), enc: {}, stats: { fights: 0, wins: 0, losses: 0, retries: 0, rounds: 0, downs: 0, deaths: 0, overloads: 0, kills: 0, startedAt: Date.now(), endedAt: null },
    history: [], snapshot: null, startLevel: chars[0] ? chars[0].level : 1 };
  run.level = run.startLevel;
  ensureEncounters(run);
  return run;
}
function newRunPC(s, i) {
  const rp = { i, s, hp: null, juice: D.juiceStart || 1, dead: false, lockdown: {}, breather: {}, kit: null, emerge: 0, stats: { dmg: 0, taken: 0, kills: 0, downs: 0, deaths: 0, overloads: 0, surges: 0, crits: 0, heals: 0 }, log: [] };
  restock(rp); rp.hp = RULES.derive(s).hp;
  return rp;
}
function restock(rp) {
  const d = RULES.derive(rp.s), it = d.gear.items || {};
  const launcher = d.gear.attacks.some(a => /^Launcher/.test(a.name)) ? 3 : 0;
  rp.kit = { medkit: 3 * (it.medkit || 0), stim: it.stim || 0, damper: it.damper || 0, frag: it.frag || 0, flashbang: it.flashbang || 0, emp: it.emp || 0, ration: it.ration || 0, launcher };
}
function ensureEncounters(run) {
  const L = run.level; if (run.enc[L]) return run.enc[L];
  const save = _seed, saveRs = _rs; setSeed((run.seed + L * 7919) >>> 0);
  const P = run.pcs.filter(p => !p.dead).length || run.size;
  const m = buildMinions(L, P, threatAt(run, L)), boss = bossFor(L);
  if (save === null) _seed = null; else { _seed = save; _rs = saveRs; }
  run.enc[L] = { minion: m.names, units: m.units, budget: m.budget, boss };
  return run.enc[L];
}
// Threat ramps in over the first levels: level-1 sheets are fragile, so L1 gets half the extra threat and L2 three quarters.
function threatAt(run, L) { const t = run.threat || 1; return 1 + (t - 1) * Math.min(1, (L + 1) / 4); }
function partySize(run) { return run.pcs.filter(p => !p.dead).length; }
// Rests (ch 1): a Breather after each minion fight; level-up + Lockdown after each boss.
function breather(run) {
  run.pcs.forEach(rp => {
    if (rp.dead) return;
    const d = RULES.derive(rp.s);
    rp.hp = Math.min(d.hp, Math.max(0, rp.hp) + Math.floor(d.hp / 2) + d.knit);
    rp.breather = {};
    rp.marks = 0;
    if (rp.ravenous && rp.kit.ration > 0) { rp.kit.ration--; rp.ravenous = false; }
    delete rp.overgrowth; delete rp.molt;
  });
}
function lockdown(run) {
  run.pcs.forEach(rp => {
    if (rp.dead && !run.hardcore) {          // GRAFT drags the body to a clinic vat: back, but changed (a permanent Scar/Fault)
      rp.dead = false; const d0 = RULES.derive(rp.s); const t = d0.material === "chrome" ? "fault" : d0.material === "bio" ? "scar" : pick(["scar", "fault"]);
      const x = permanentMark(rp, t); rp.log.push(`Recovered by GRAFT after death: ${x}.`); rp.revived = (rp.revived || 0) + 1;
    }
    if (rp.dead) return;
    rp.s.injuries = []; rp.lockdown = {}; rp.breather = {}; rp.marks = 0; rp.ravenous = false; delete rp.overgrowth; delete rp.molt;
    rp.juice = clamp(rp.juice, 1, D.juiceMax || 3);
    restock(rp); rp.hp = RULES.derive(rp.s).hp;
  });
}
// A Scar like Sticky Sequence can shrink the Sequence: the last Surges drop off so the sheet stays legal.
function tidy(s) { let d = RULES.derive(s), g = 0; while (g++ < 6 && (s.surges.length > d.slots || s.surges.filter(x => !x.sample).length > d.known)) { const i = s.surges.map(x => !!x.sample).lastIndexOf(true); s.surges.splice(i >= 0 && s.surges.length > d.slots ? i : s.surges.length - 1, 1); d = RULES.derive(s); } return s; }
function permanentMark(rp, kind) {
  const list = kind === "fault" ? D.faults : D.scars; const x = list[die(6) - 1];
  if (!rp.s.scars.includes(x.id)) rp.s.scars.push(x.id);
  tidy(rp.s);
  return `${kind === "fault" ? "Fault" : "Scar"}: ${x.name}`;
}

/* ------------------------------------------------------------------ level-up */
// The choices one level needs, computed from the builder's own pick counts (ch 7, "Each Level").
function levelPlan(s, toLevel) {
  const f = RULES.FORM[s.form], P = RULES.picks(toLevel), c = RULES.countRoles(s.nodes, f), L = RULES.lvl(toLevel), Lp = RULES.lvl(toLevel - 1);
  const origin = RULES.ORIGIN[s.origin];
  const dk = RULES.derive(Object.assign({}, s, { level: toLevel })), known = dk.known != null ? Math.min(dk.known, dk.slots != null ? dk.slots : 99) : Math.min(L.die, L.surges + (origin && origin.extraSurge ? origin.extraSurge : 0));
  let kn = 0; for (const k in D.knackLevels) if (+k === toLevel) kn += D.knackLevels[k];
  return { level: toLevel, prim: Math.max(0, P.prim - c.primary), secTert: Math.max(0, P.secTert - c.secondary - c.tertiary), surges: Math.max(0, known - s.surges.filter(x => !x.sample).length),
    sigs: Math.max(0, L.sigs - s.signatures.length), knacks: kn, evolve: toLevel === 4 || toLevel === 7, final: toLevel === 10, rankUp: L.rank > Lp.rank, maxTwists: D.twistsByRank(L.rank),
    evoNode: f.evo[toLevel] || null, dieFrom: Lp.die, dieTo: L.die, primeFrom: Lp.prime, primeTo: L.prime };
}
function eligibleNodes(s, level, roles) {
  const f = RULES.FORM[s.form]; const out = [];
  f.trees.forEach(t => { const role = RULES.roleOf(f, t); if (!roles.includes(role)) return;
    RULES.TREE[t].nodes.forEach(n => { if (n.tier === 4 || s.nodes.includes(n.id)) return; if (!RULES.gate(n.id, s.nodes, f, level)) out.push({ id: n.id, name: n.name, tree: t, role, tier: n.tier, text: n.text }); }); });
  return out;
}
// Partsthis character can build Surges from.
function surgeParts(s) {
  const owned = RULES.FORM[s.form] ? RULES.FORM[s.form].trees.filter(t => s.nodes.includes(RULES.TREE[t].nodes[0].id)) : [];
  const ok = p => !p.unlock || owned.includes(p.unlock);
  return { shapes: D.shapes.filter(ok), effects: D.effects.filter(ok), twists: D.twists, owned };
}
// A sensible automatic build (auto-play and the "Suggest" button): node by tier/value, Surges by role.
const NODE_VALUE = { plating: 9, thick: 8, naturalweapons: 8, extraarm: 7, capacitor: 7, rend: 8, flurry: 9, targetlock: 7, deadeye: 9, longsight: 2, catalyst: 7, regenerate: 6, stimgland: 6, adrenaldump: 6,
  livingpharmacy: 8, quickened: 5, slipstream: 6, kineticbattery: 5, blur: 7, uplink: 7, ironwill: 6, commandingvoice: 6, psychicscream: 7, hivemind: 6, unbreakable: 8, livingwall: 6, menace: 6, bulwark: 5, barbs: 6,
  spit: 6, keen: 3, analyzer: 5, threatsense: 6, weakspot: 5, spotter: 5, hairtrigger: 5, antibodies: 4, purge: 3, overclock: 6, reflexspike: 5, precog: 6, puppet: 5, glamour: 5, crushergrip: 5, pounce: 5, manyhands: 3,
  grapnel: 3, springlegs: 3, lashtail: 3, anchor: 4, adaptive: 4, sporecloud: 4, mutagentap: 3, arcjump: 3, afterimage: 3, wallrun: 1, intrude: 3, readtheroom: 1, echolocation: 2 };
function autoNode(list) { if (!list.length) return null; return list.slice().sort((a, b) => (NODE_VALUE[b.id] || 3) + b.tier - (NODE_VALUE[a.id] || 3) - a.tier + (rng() - 0.5))[0]; }
function autoSurge(s, level, sig) {
  const parts = surgeParts(s), d = RULES.derive(Object.assign({}, s, { level })), st = d.st;
  const best = (opts) => opts.reduce((a, b) => (st[b] > st[a] ? b : a), opts[0]);
  const choices = [];
  parts.shapes.filter(x => x.kind === "damage").forEach(sh => parts.effects.filter(e => e.kind === "damage").forEach(ef => {
    let stats = sh.stats.slice(); if (ef.unlock && D.treeStats[ef.unlock]) stats = stats.concat(D.treeStats[ef.unlock]);
    const stat = best(stats), dice = (d.R + 1 + (ef.extraDice || 0)) * ((sh.die + 1) / 2) * (sh.area ? 1.6 : 1) + (sh.addStat ? st[stat] : 0);
    const riderV = { dazed: 4, shaken: 3, blinded: 3, exposed: 3, poisoned: 3, held: 1, prone: 1, burning: 2 }[RIDER[ef.id]] || 0;
    choices.push({ shape: sh.id, effect: ef.id, v: dice + 2 * (st[stat] + d.R) + riderV + rng() * 3 });
  }));
  const hasMend = parts.effects.some(e => e.id === "mend");
  const already = (s.surges || []).concat(s.signatures || []);
  if (hasMend && !already.some(x => x.effect === "mend")) choices.push({ shape: "infuse", effect: "mend", v: 999 });
  choices.sort((a, b) => b.v - a.v);
  const pickC = choices.find(c => !already.some(x => x.shape === c.shape && x.effect === c.effect)) || choices[0];
  const L = RULES.lvl(level), maxT = D.twistsByRank(L.rank), tw = [];
  if (sig || rng() < 0.5) { const sh = RULES.SHAPE[pickC.shape];
    const pref = sh.kind === "infuse" ? ["sure"] : sh.area ? ["overcharge", "sure"] : ["sure", "overcharge", "chain"];
    for (const t of pref) if (tw.length < (sig ? 1 : maxT) && RULES.twistFits(RULES.TWIST[t], sh)) tw.push(t); }
  const words = D.surgeWords[pickC.shape] || ["Surge"];
  return { name: (sig ? "Signature " : "") + RULES.EFFECT[pickC.effect].name + " " + pick(words), shape: pickC.shape, effect: pickC.effect, twists: tw };
}
// Apply a level-up. choices: {nodes:[ids], surges:[surge], sigs:[surge], knacks:[text], rewrite:{i, surge}}. Returns {ok, errors, s}.
function applyLevelUp(s0, choices) {
  const s = clone(s0); s.level = Math.min(10, s.level + 1);
  (choices.nodes || []).forEach(id => { if (!s.nodes.includes(id)) s.nodes.push(id); });
  (choices.nodes || []).forEach(id => { const n = RULES.NODE[id]; if (n && n.root && !s.trees[RULES.NODE_TREE[id]]) s.trees[RULES.NODE_TREE[id]] = "bio"; });
  if (choices.materials) Object.assign(s.trees, choices.materials);
  (choices.surges || []).forEach(x => s.surges.push(x));
  (choices.sigs || []).forEach(x => s.signatures.push(x));
  (choices.knacks || []).forEach(k => { if (k && k.trim()) s.knacks.push(k.trim().slice(0, 80)); });
  if (choices.rewrite && s.surges[choices.rewrite.i]) s.surges[choices.rewrite.i] = choices.rewrite.surge;
  if (choices.rebuildSig && s.signatures[choices.rebuildSig.i]) s.signatures[choices.rebuildSig.i] = choices.rebuildSig.surge;
  tidy(s); s.scripAdj = RULES.estimateScrip(s);
  const d = RULES.derive(s);
  return { ok: d.legal, errors: d.errors.map(e => e.m), warnings: d.warnings.map(w => w.m), s, d };
}
function autoLevelChoices(s) {
  const to = s.level + 1, plan = levelPlan(s, to), ch = { nodes: [], surges: [], sigs: [], knacks: [] };
  const tmp = clone(s); tmp.level = to;
  for (let i = 0; i < plan.prim; i++) { const n = autoNode(eligibleNodes(tmp, to, ["primary"])); if (n) { ch.nodes.push(n.id); tmp.nodes.push(n.id); } }
  for (let i = 0; i < plan.secTert; i++) {
    const c = RULES.countRoles(tmp.nodes, RULES.FORM[tmp.form]);
    const roles = c.secondary < 2 ? ["secondary"] : c.tertiary < 1 ? ["tertiary"] : ["secondary", "tertiary"];
    const n = autoNode(eligibleNodes(tmp, to, roles)); if (n) { ch.nodes.push(n.id); tmp.nodes.push(n.id); }
  }
  for (let i = 0; i < plan.surges; i++) { const x = autoSurge(tmp, to, false); ch.surges.push(x); tmp.surges.push(x); }
  for (let i = 0; i < plan.sigs; i++) { const x = autoSurge(tmp, to, true); ch.sigs.push(x); tmp.signatures.push(x); }
  const pool = D.knackExamples.filter(k => !s.knacks.includes(k));
  for (let i = 0; i < plan.knacks; i++) ch.knacks.push(pick(pool));
  return ch;
}
// Bring a character to a level: down (drop picks, like the builder's "Fit to level") or up (auto level-ups).
function fitToLevel(s0, level) {
  let s = RULES.normalize(clone(s0));
  if (s.level > level) {
    const f = RULES.FORM[s.form]; s.level = level; const P = RULES.picks(level), L = RULES.lvl(level);
    let guard = 0;
    while (guard++ < 80) {
      const bad = s.nodes.slice().reverse().find(id => RULES.gate(id, s.nodes, f, level) && !RULES.NODE[id].root);
      if (bad) { s.nodes = s.nodes.filter(x => x !== bad); continue; }
      const c = RULES.countRoles(s.nodes, f);
      const drop = test => { for (let j = s.nodes.length - 1; j >= 0; j--) if (!RULES.NODE[s.nodes[j]].root && test(RULES.roleOf(f, RULES.NODE_TREE[s.nodes[j]]))) { s.nodes.splice(j, 1); return true; } return false; };
      if (c.primary > P.prim && drop(r => r === "primary")) continue;
      if (c.secondary + c.tertiary > P.secTert && drop(r => (r === "secondary" && c.secondary > 2) || (r === "tertiary" && c.tertiary > 1))) continue;
      break;
    }
    const maxT = D.twistsByRank(L.rank), d = RULES.derive(s);
    s.surges = s.surges.filter(x => !x.sample).slice(0, d.known).map(x => Object.assign(x, { twists: x.twists.slice(0, maxT) }));
    s.signatures = s.signatures.slice(0, L.sigs).map(x => Object.assign(x, { twists: x.twists.slice(0, maxT) }));
    let kn = 0; for (const k in D.knackLevels) if (+k <= level) kn += D.knackLevels[k]; s.knacks = s.knacks.slice(0, Math.max(0, kn - 1));
    s.scripAdj = RULES.estimateScrip(s);
  }
  while (s.level < level) { const r = applyLevelUp(s, autoLevelChoices(s)); s = r.s; }
  return s;
}

/* ------------------------------------------------------------------ combatants */
function weaponOf(a, i, pc) {
  const dd = parseDice(a.dmg), melee = /melee/i.test(a.range), mod = (/\(([^)]+)\)/.exec(a.name) || [])[1] || "";
  const type = /Shock Coil/.test(mod) ? "shock" : /Incendiary/.test(mod) ? "blaze" : /Venom/.test(mod) ? "toxin" : /Acid/.test(mod) ? "corrode" : /^Spit/.test(a.name) ? "corrode" : /Mind Spike/.test(a.name) ? "psychic" : "kinetic";
  const critRider = /Shock Coil/.test(mod) ? "dazed" : /Incendiary/.test(mod) ? "burning" : /Venom/.test(mod) ? "poisoned" : /Acid/.test(mod) ? "exposed" : /Weighted/.test(mod) ? "prone" : null;
  const rg = String(a.range || ""), reachM = /reach (\d+) ft/i.exec(rg), thrown = /thrown (\d+) ft/i.exec(rg), ft = /^(\d+)(?:\/\d+)* ft/.exec(rg) || /or (\d+) ft/.exec(rg);
  const reach = melee ? (reachM ? G.sq(+reachM[1]) : 1) + (pc && pc.grapnel && !reachM ? 1 : 0) : 0;
  let range = thrown ? G.sq(+thrown[1]) : ft ? G.sq(+ft[1]) : /^Launcher/.test(a.name) ? 12 : 0; if (range && pc && pc.longsight) range *= 2;
  return { key: "w" + i, name: a.name, atk: a.atk, n: dd.n, s: dd.s, k: dd.k, crit: parseInt(a.crit, 10) || 20, melee, ranged: !melee, reach, range, thrown: !!thrown, psy: /Psychic/.test(a.notes || "") || /Mind Spike/.test(a.name),
    type, critRider, natural: /^Natural weapons/.test(a.name), launcher: /^Launcher/.test(a.name), unarmed: /^Unarmed/.test(a.name), dmgTxt: a.dmg, rangeTxt: a.range };
}
function surgeOf(x, sg, i, pc, sig) {
  const sh = RULES.SHAPE[sg.shape] || {}, ef = RULES.EFFECT[sg.effect] || {};
  const dd = parseDice(x.dmg);
  return { key: (sig ? "g" : "s") + i, name: sg.name || x.build || "Surge", build: x.build, shape: sg.shape, effect: sg.effect, twists: (sg.twists || []).slice(), flux: x.flux, atk: x.atk, stat: x.stat,
    n: dd.n, s: dd.s, k: dd.k, area: !!sh.area, melee: sg.shape === "strike" || sg.shape === "pulse", ranged: sg.shape === "bolt", infuse: sh.kind === "infuse", rider: RIDER[sg.effect] || null, psy: sg.effect === "dread",
    type: (ef.type || "").toLowerCase(), sig: !!sig, line: x.line, fw: !!x.fw, crit: sh.ranged ? pc.critR : 20, geo: surgeGeo(sg.shape, sg.twists || [], pc) };
}
// A Surge's footprint in squares. Reach doubles range or area (ch 4); Long Sight doubles ranged range; Grapnel gives 10-ft melee.
function surgeGeo(shape, twists, pc) {
  const g = Object.assign({}, SHAPE_GEO[shape] || { range: 12 }), reach = twists.includes("reach");
  if (shape === "strike") g.reach = reach ? 3 : pc && pc.grapnel ? 2 : 1;
  if (shape === "bolt") g.range = 12 * (reach ? 2 : 1) * (pc && pc.longsight ? 2 : 1);
  if (shape === "burst") { g.range = 12 * (pc && pc.longsight ? 2 : 1); if (reach) g.radius = 4; }
  if (shape === "wave" && reach) { g.cone = 6; g.line = 12; }
  if (shape === "pulse" && reach) g.radius = 4;
  if (shape === "infuse" && reach) g.range = 12;
  return g;
}
function makePC(rp, idx, run) {
  const s = rp.s, d = RULES.derive(s);
  const nodes = new Set(d.nodes);
  const pc = { side: "pc", id: "p" + idx, idx, name: s.name || "Freelancer " + (idx + 1), short: (s.name || "F" + (idx + 1)).replace(/".*?"\s*/, "").split(" ")[0], form: s.form, formName: d.form ? d.form.name : "",
    stageName: d.look ? d.look.name : "", level: s.level, R: d.R, st: Object.assign({}, d.st), maxhp: d.hp, hp: rp.hp == null ? d.hp : clamp(rp.hp, 0, d.hp), tmp: 0, armor: d.armor, armorMax: d.armorMax, def: Object.assign({}, d.def),
    limit: d.limit, flux: 0, prime: d.prime, maxPrimed: d.maxPrimed, die: d.die, known: d.surges.length, slots: d.slots, sticky: d.sticky, critR: d.critR, material: d.material, bioN: d.bioN, chromeN: d.chromeN,
    nodes, knacks: d.knacks, primary: d.form ? d.form.primary : "grit", down: rp.hp != null && rp.hp <= 0 && !rp.dead, dead: !!rp.dead, marks: rp.marks || 0, cond: {}, primed: [], sigUsed: {}, turnNo: 0, acted: false,
    rp, juice: rp.juice, kit: rp.kit, reactions: 1, rf: {}, flags: {}, lock: null, charges: 0, omen: null, mitosis: false, everDown: false };
  pc.critR = d.critR; pc.speed = d.speed || 30; pc.grapnel = nodes.has("grapnel"); pc.longsight = nodes.has("longsight"); pc.pos = null;
  pc.weapons = d.gear.attacks.map((a, i) => weaponOf(a, i, pc));
  pc.surges = d.surges.map((x, i) => surgeOf(x, s.surges[i], i, pc, false));
  pc.sigs = d.sigs.map((x, i) => surgeOf(x, s.signatures[i], i, pc, true));
  pc.chrome = d.chromeN > 0; pc.bio = d.bioN > 0;
  pc.scars = d.scars.slice();
  if (rp.overgrowth) pc.flags.overgrowth = true;
  if (rp.molt) { pc.armor = Math.max(0, pc.armor - 1); }
  return pc;
}
// An enemy attack's reach/range/area in squares, parsed from its stat block text (ch 10).
function attackGeo(a) {
  if (a.summon) return a;
  const rg = String(a.rng || ""), sh = String(a.shape || "");
  const reachM = /reach (\d+) ft/.exec(rg), rangeM = /(\d+) ft$/.exec(rg) || (/(?:or|^)\s*(\d+) ft/.exec(rg));
  a.reach = !rg || /melee|reach/.test(rg) ? (reachM ? G.sq(+reachM[1]) : 1) : 0;
  a.range = rangeM && !/^reach \d+ ft$/.test(rg) ? G.sq(+rangeM[1]) : 0;
  if (a.area) {
    const around = /(\d+) ft around/.exec(sh), bursts = /(\d+)-ft burst/.exec(sh), cone = /(\d+)-ft cone/.exec(sh);
    a.geo = around ? { type: "around", r: G.sq(+around[1]) } : bursts ? { type: "burst", r: G.sq(+bursts[1]), range: a.range || 12 } : cone ? { type: "cone", len: G.sq(+cone[1]) } : { type: "around", r: { s: 2, m: 4, l: 6 }[a.area] || 2 };
    a.reach = 0;
  }
  return a;
}
function makeFoe(spec, idx, scale, label) {
  const b = clone(spec);
  const f = { side: "foe", id: "e" + idx, idx, name: label || b.name, base: b.name, spec: b, T: b.T, role: b.role, kind: b.kind, guard: b.guard, tn: b.tn, maxhp: Math.max(1, Math.round(b.hp * scale.hp)), armor: b.armor || 0,
    actions: b.actions || 1, interrupts: b.interrupts || 0, tr: b.traits || {}, attacks: b.attacks.map(a => Object.assign({}, a, { dmg: a.summon ? a.dmg : Math.max(1, Math.round(a.dmg * scale.dmg)), extra: a.extra ? Math.max(1, Math.round(a.extra * scale.dmg)) : 0 })),
    cond: {}, charge: {}, shifted: false, gated: false, enrage: 0, stagger: false, dominated: false, taunt: null, dmgbonus: 0, boss: b.role === "boss", centre: !!scale.centre, mimicked: false, machine: !!b.machine, scale, used: 0, linger: null, revealed: false, dead: false, fled: false };
  f.hp = f.maxhp;
  f.attacks.forEach(a => f.charge[a.n] = true);
  const sp = String(b.speed == null ? "30" : b.speed); f.speedTxt = sp; f.fly = /fly/.test(sp) && !/after Shift/.test(sp); f.flyAfterShift = /fly after Shift/.test(sp);
  const nums = (sp.match(/\d+/g) || ["30"]).map(Number); f.speedSq = Math.floor(nums[0] / 5); f.speedAfterShift = /after Shift/.test(sp) && nums.length > 1 ? Math.floor(nums[1] / 5) : f.speedSq;
  f.attacks.forEach(attackGeo); f.ranged = f.attacks.some(a => a.range && !a.reach) && !f.attacks.some(a => a.reach && !a.area && !a.summon);
  f.pos = null;
  if (f.tr.leader) f.tr.leader = Math.round(f.tr.leader * scale.dmg);
  if (f.tr.explode) f.tr.explode = Math.round(f.tr.explode * scale.dmg);
  return f;
}

/* ------------------------------------------------------------------ the fight */
class Fight {
  constructor(run, kind) {
    this.run = run; this.kind = kind; this.level = run.level; this.round = 0; this.phase = "prime"; this.logs = []; this.active = null; this.haste = null; this.lingers = [];
    this.pcs = run.pcs.map((rp, i) => makePC(rp, i, run));
    this.pcs.forEach(c => { if (this.pcs.some(o => o !== c && o.short === c.short)) { const nick = (/"([^"]+)"/.exec(c.name) || [])[1]; c.short = nick || c.short + " " + (c.idx + 1); } });
    const P = this.pcs.filter(c => !c.dead).length || 1; this.P = P;
    const enc = ensureEncounters(run);
    // Mercy (standard mode): each retry of the same fight takes 6% off enemy HP and 4% off their damage, up to ten retries.
    const mc = Math.min(10, run.mercy || 0); this.mercy = { n: mc, hp: 1 - 0.06 * mc, dmg: 1 - 0.04 * mc };
    this.foes = [];
    if (kind === "boss") {
      const th = threatAt(run, this.level), sc = { hp: P / 4 * th * this.mercy.hp, dmg: P / 4 * (1 + (th - 1) / 2) * this.mercy.dmg, centre: true };
      const f = makeFoe(BY[enc.boss], 0, sc); f.centre = true;
      f.attacks.forEach(a => { if (a.tmpl) a.tmpl = scaledSummon(a.tmpl, sc); });
      this.foes.push(f); this.title = (f.boss ? "Boss: " : "Centrepiece: ") + f.name;
    } else {
      const counts = {}; enc.minion.forEach(n => counts[n] = (counts[n] || 0) + 1); const seen = {};
      enc.minion.forEach((n, i) => { seen[n] = (seen[n] || 0) + 1; this.foes.push(makeFoe(BY[n], i, { hp: this.mercy.hp, dmg: this.mercy.dmg }, counts[n] > 1 ? `${n} ${seen[n]}` : n)); });
      this.title = "Minions: " + Object.keys(counts).map(n => counts[n] > 1 ? `${counts[n]} × ${n}` : n).join(", ");
    }
    this.nextFoe = this.foes.length;
    // the battle map: seeded per run, level and fight so a retry is fought on the same ground
    { const sv = _seed, svr = _rs; setSeed((run.seed + this.level * 7919 + (kind === "boss" ? 104729 : 0)) >>> 0);
      this.map = G.makeMap(rng, this.level, this.pcs.length, this.foes.length, kind === "boss");
      const pp = G.deploy(this.map, this.pcs, "pc"); this.pcs.forEach((c, i) => c.pos = pp[i]);
      const fp = G.deploy(this.map, this.foes, "foe"); this.foes.forEach((e, i) => e.pos = fp[i]);
      if (sv === null) _seed = null; else { _seed = sv; _rs = svr; } }
    this.events = [];
    this.stats = { rounds: 0, dealt: 0, taken: 0, downs: 0, deaths: 0, overloads: 0 };
    this.log(`— Level ${this.level} ${kind === "boss" ? "BOSS" : "minion"} fight: ${this.title} —`, "sys");
    if (mc) this.log(`Retry ${mc}: the enemies are worn down (HP −${6 * mc}%, damage −${4 * mc}%).`, "sys");
    this.foes.forEach(f => f.tr.mimic ? this.log(`Something in the room is not what it seems… (${f.name} is hidden: Mimic)`, "foe") : null);
    this.initiative();
    this.pcs.forEach(c => { if (this.canAct(c) || c.down) this.rollPrimeDice(c); });
  }
  log(t, cls) { this.logs.push({ t, cls: cls || "" }); if (this.events) this.ev({ t: "log", text: t, cls: cls || "" }); if (this.onLog) this.onLog(t, cls); }
  // ---------------- mid-battle save: everything but the links back into the run (re-made by Fight.restore)
  toJSON() {
    const pcs = this.pcs.map(c => { const o = Object.assign({}, c); delete o.rp; delete o.kit; o.nodes = [...c.nodes]; const own = c.surges.concat(c.sigs);
      o.primed = c.primed.map(p => own.includes(p.sg) ? { amped: p.amped, key: p.sg.key } : { amped: p.amped, sg: p.sg }); return o; });
    const o = {}; for (const k of Object.keys(this)) if (!["run", "pcs", "map", "active", "events", "onLog", "lastInterrupt"].includes(k) && typeof this[k] !== "function") o[k] = this[k];
    return Object.assign(o, { v: 2, pcs, map: G.serialize(this.map), active: this.active ? this.active.id : null, logs: this.logs.slice(-300) });
  }
  static restore(run, o) {
    const F = Object.create(Fight.prototype); Object.assign(F, clone(o)); F.run = run; F.map = G.restore(o.map); F.events = [];
    F.pcs = F.pcs.map(c => { c.rp = run.pcs[c.idx]; c.kit = c.rp.kit; c.nodes = new Set(c.nodes); const own = c.surges.concat(c.sigs); c.primed = c.primed.map(p => ({ amped: p.amped, sg: p.sg || own.find(x => x.key === p.key) })).filter(p => p.sg); return c; });
    F.active = o.active ? F.pc(o.active) : null; return F;
  }
  get standing() { return this.pcs.filter(c => !c.down && !c.dead); }
  canAct(c) { return !c.down && !c.dead; }
  foesAlive() { return this.foes.filter(e => !e.dead && !e.fled && e.hp > 0 && !e.dominated); }
  foesAll() { return this.foes.filter(e => !e.dead && !e.fled && e.hp > 0); }
  pc(id) { return this.pcs.find(c => c.id === id); }
  foe(id) { return this.foes.find(e => e.id === id); }
  byId(id) { return this.pc(id) || this.foe(id); }
  // freelancers within r squares of c (default: adjacent)
  neighbours(c, r) { r = r || 1; return this.pcs.filter(x => x !== c && !x.dead && x.pos && c.pos && G.dist(x.pos, c.pos) <= r); }
  ev(e) { if (!this.events) return; this.events.push(e); if (this.events.length > 4000) this.events.splice(0, 2000); }
  /* ---------------- the grid */
  at(x, y) { return this.pcs.find(c => !c.dead && c.pos && c.pos.x === x && c.pos.y === y) || this.foes.find(e => !e.dead && !e.fled && e.hp > 0 && e.pos && e.pos.x === x && e.pos.y === y) || null; }
  free(x, y) { return G.inB(this.map, x, y) && !this.map.blocked.has(G.key(x, y)) && !this.at(x, y); }
  los(a, b) { return G.los(this.map, a.pos || a, b.pos || b); }
  dist(a, b) { return G.dist(a.pos || a, b.pos || b); }
  adjFoes(c) { return this.foesAll().filter(e => !e.dominated && G.dist(e.pos, c.pos) <= Math.max(1, this.foeReach(e))); }
  foeReach(e) { return Math.max(0, ...e.attacks.filter(a => !a.area && !a.summon).map(a => a.reach || 0)); }
  // movement budget in squares (ch 6: speed; Held/Joint Lock 0; Overgrowth half; Torn Limb (legs) −10 ft)
  speedSq(c) {
    if (c.side === "foe") return c.cond.held ? 0 : c.speedSq;
    if (c.cond.held || c.flags.jointlock || c.cond.cocoon) return 0;
    let ft = c.speed - ((c.rp.s.injuries || []).includes("tornleg") ? 10 : 0); if (c.flags.overgrowth) ft = Math.floor(ft / 2);
    return Math.max(0, Math.floor(ft / 5));
  }
  passFor(c) {
    const m = this.map, slip = c.side === "pc" && c.nodes.has("slipstream"), fly = c.side === "foe" && c.fly;
    return (x, y) => { if (!fly && m.blocked.has(G.key(x, y))) return false; const o = this.at(x, y); return !o || o.side === c.side || slip || o.dominated; };
  }
  // squares c can reach now: Map key → node {x,y,cost,prev}. careful = half speed (no Opportunity Strikes).
  reach(c, careful, budget) {
    if (!c.pos) return new Map(); const b = budget != null ? budget : c.side === "pc" ? (c.t ? c.t.move : this.speedSq(c)) : this.speedSq(c);
    return G.reachable(this.map, c.pos, b, this.passFor(c), (x, y) => this.free(x, y) && !(c.side === "foe" && c.fly === false && this.map.blocked.has(G.key(x, y))), careful ? 2 : 1);
  }
  // Move a freelancer (ch 6). Leaving an enemy's reach provokes an Opportunity Strike unless careful (half speed) or Slipstream.
  movePC(c, x, y, careful) {
    if (!c.t || c.t.move <= 0) return { ok: false, msg: "No movement left this turn." };
    const r = this.reach(c, careful); const n = r.get(G.key(x, y)); if (!n || n.cost === 0) return { ok: false, msg: "That square is out of reach." };
    const path = G.pathOf(n); c.t.move -= n.cost; c.t.moved = (c.t.moved || 0) + path.length - 1;
    const start = c.pos; this.log(`${c.short} moves ${(path.length - 1) * 5} ft${careful ? " carefully (half speed)" : ""}.`, "pc move");
    this.ev({ t: "move", id: c.id, path });
    if (!careful && !c.nodes.has("slipstream")) this.provoke(c, path);
    if (!c.down && !c.dead) c.pos = { x, y }; else c.pos = path[path.length - 1];
    if (start && c.t.lockStart == null) c.t.lockStart = start;
    return { ok: true };
  }
  // enemies whose reach the path leaves get one free attack each (ch 6 "Enemy Opportunity Strikes")
  provoke(c, path) {
    for (const e of this.foesAlive()) {
      if (e.cond.dazed || e.osUsed === this.round) continue; const a = e.attacks.find(x => !x.area && !x.summon && x.reach); if (!a) continue; const R = a.reach;
      let inside = G.dist(path[0], e.pos) <= R; let where = null;
      for (let i = 1; i < path.length; i++) { const now = G.dist(path[i], e.pos) <= R; if (inside && !now) { where = path[i - 1]; break; } inside = now; }
      if (!where) continue; e.osUsed = this.round;
      this.log(`${e.name} gets an Opportunity Strike as ${c.short} breaks away!`, "foe big"); const keep = c.pos; c.pos = where; this.ev({ t: "atk", id: e.id, to: [c.id] }); this.hitPC(e, c, a, { os: true }); c.pos = keep;
      if (c.down || c.dead) break;
    }
  }
  // a freelancer's Opportunity Strike when an enemy leaves its melee reach (Lash Tail: also when it enters)
  pcStrikes(e, path) {
    for (const c of this.standing) {
      if (c.reactions <= 0 || c.cond.dazed || e.dead) continue; const w = c.weapons.filter(x => x.melee).sort((a, b) => b.n * b.s - a.n * a.s)[0]; if (!w) continue;
      const R = w.reach || 1; let fire = false;
      for (let i = 1; i < path.length && !fire; i++) { const was = G.dist(path[i - 1], c.pos) <= R, now = G.dist(path[i], c.pos) <= R; if (was && !now) fire = true; if (!was && now && c.nodes.has("lashtail")) fire = true; }
      if (!fire) continue; c.reactions--; this.log(`${c.short} takes an Opportunity Strike at ${e.name}!`, "pc");
      const r = this.attack(c, w, e, { os: true }); if (r.hit && c.nodes.has("lashtail") && !e.dead && !e.tr.huge) { this.condFoe(e, "prone"); this.log(`  Lash Tail: ${e.name} is knocked Prone.`, "pc"); }
    }
  }
  moveFoe(e, path) {
    if (!path || path.length < 2) return;
    this.ev({ t: "move", id: e.id, path }); const end = path[path.length - 1];
    this.pcStrikes(e, path);
    if (!e.dead) e.pos = { x: end.x, y: end.y };
  }
  /* ---------------- ranges: can c use opt on tgt from square "from"? → {ok, dis, why} */
  geoOf(c, opt) {
    if (opt.geo) return opt.geo;
    if (opt.reach || opt.range) return { reach: opt.reach || 0, range: opt.range || 0, long: !!opt.range && !opt.launcher };
    return { range: FAR };
  }
  canHit(c, opt, tgt, from) {
    from = from || c.pos; if (!tgt || !tgt.pos || !from) return { ok: false, why: "not on the map" };
    const g = this.geoOf(c, opt), d = G.dist(from, tgt.pos);
    if (g.reach && d <= g.reach) return { ok: true, dis: false, melee: true };
    if (g.range) {
      if (!G.los(this.map, from, tgt.pos)) return { ok: false, why: "no line of sight" };
      const adj = this.foesAll().some(e => !e.dominated && e !== tgt && G.dist(e.pos, from) <= 1) || (tgt.side === "foe" && d <= 1 && !g.reach);
      if (d <= g.range) return { ok: true, dis: adj && c.side === "pc", why: adj ? "enemy adjacent: disadvantage" : "" };
      if (g.long && d <= 2 * g.range) return { ok: true, dis: true, why: "long range: disadvantage" };
      return { ok: false, why: `out of range (${d * 5} ft, max ${(g.long ? 2 : 1) * g.range * 5} ft)` };
    }
    return { ok: false, why: `out of reach (${d * 5} ft, reach ${(g.reach || 1) * 5} ft)` };
  }
  // within r squares (and line of sight for anything beyond touch)
  within(c, tgt, r, from) { from = from || c.pos; if (!tgt.pos) return false; const d = G.dist(from, tgt.pos); return d <= r && (d <= 1 || G.los(this.map, from, tgt.pos)); }
  // the squares an Area covers. sg.geo + aim square; mode "cone" | "line" for Waves.
  areaCells(c, sg, aim, mode, from) {
    from = from || c.pos; const g = sg.geo || { radius: 2 }, m = this.map;
    if (sg.shape === "burst" || sg.itemBurst) return G.burst(m, aim, g.radius || 2);
    if (sg.shape === "wave") return mode === "line" ? G.line(m, from, aim, g.line || 6) : G.cone(m, from, aim, g.cone || 3);
    if (sg.shape === "pulse") return G.around(m, from, g.radius || 2);
    return G.burst(m, aim, g.radius || 2);
  }
  // is this aim legal for that Area from that square?
  aimOk(c, sg, aim, from) {
    from = from || c.pos; const g = sg.geo || {};
    if (!aim || !G.inB(this.map, aim.x, aim.y)) return { ok: false, why: "off the map" };
    if (sg.shape === "pulse") return { ok: true };
    if (sg.shape === "wave") return aim.x === from.x && aim.y === from.y ? { ok: false, why: "pick a direction" } : { ok: true };
    if (this.map.blocked.has(G.key(aim.x, aim.y))) return { ok: false, why: "a wall is in the way" };
    const d = G.dist(from, aim), r = g.range || NEAR; if (d > r) return { ok: false, why: `out of range (${d * 5} ft, max ${r * 5} ft)` };
    if (!G.los(this.map, from, aim)) return { ok: false, why: "no line of sight" };
    return { ok: true };
  }
  // ---------------- initiative (ch 6): Moxie group check vs the enemies' highest TN
  initiative() {
    const tn = Math.max(...this.foes.map(e => e.tn)); const quick = this.standing.some(c => c.nodes.has("quickened"));
    let ok = 0; const parts = [];
    this.standing.forEach(c => { const r = d20(quick ? 1 : 0); const bonus = c.rp.s.origin === "militia" ? 2 : 0; const tot = r.v + c.st.moxie + bonus; c.init = tot + c.st.moxie / 100; if (r.v !== 1 && tot >= tn) ok++; parts.push(`${c.short} ${r.txt}${sgn(c.st.moxie + bonus)}=${tot}`); });
    this.playersFirst = ok * 2 >= this.standing.length;
    this.log(`Initiative (Moxie group check vs TN ${tn}${quick ? ", Quickened: advantage" : ""}): ${parts.join(", ")} → ${this.playersFirst ? "freelancers go first" : "enemies go first"}.`, "sys");
  }
  // ---------------- Prime (ch 4)
  rollPrimeDice(c) { c.primeDice = []; for (let i = 0; i < c.prime; i++) c.primeDice.push(die(c.die)); }
  slotOf(c, r) { if (r > c.known || (c.sticky && r === c.die)) return null; return c.surges[r - 1] || null; }
  setPrimeDie(c, i, v) { if (c.juice < 1 || !c.primeDice || i >= c.primeDice.length) return false; v = clamp(v | 0, 1, c.die); c.juice--; c.rp.juice = c.juice; c.primeDice[i] = v; c.juiceDice = (c.juiceDice || 0) + 1; this.log(`${c.short} spends 1 Juice: Sequence die set to ${v}.`, "pc"); return true; }
  addPrimed(c, sg, why) {
    if (!sg) return;
    const have = c.primed.find(p => p.sg.key === sg.key && !sg.wild);
    if (have) { have.amped = true; this.log(`${c.short}: ${sg.name} rolled again → Amped (0 Flux)${why ? " " + why : ""}.`, "pc"); return; }
    c.primed.push({ sg, amped: false });
    if (c.primed.length > c.maxPrimed + (c.ffActive ? 2 : 0)) {
      const drop = c.primed.filter(p => !p.amped).sort((a, b) => this.surgeValue(c, a.sg) - this.surgeValue(c, b.sg))[0] || c.primed[0];
      c.primed.splice(c.primed.indexOf(drop), 1); this.log(`${c.short} can hold only ${c.maxPrimed} Primed Surges: ${drop.sg.name} fades.`, "pc");
    }
  }
  primeRoll(c, r, how) {
    const sg = this.slotOf(c, r);
    if (sg) { this.addPrimed(c, sg); return sg.name; }
    const w = die(12);
    if (w === 1) { if (how === "misfire") { this.log(`${c.short}: Wild (${r}) → Misfire again: nothing.`, "pc"); return "Misfire"; } const r2 = die(c.die); this.log(`${c.short}: Wild slot ${r} → Misfire (d12 1): free Churn, rolls ${r2}.`, "pc"); this.primeRoll(c, r2, "misfire"); return "Misfire"; }
    const ws = wildSurge(c, w); c.primed.push({ sg: ws, amped: false }); this.log(`${c.short}: Wild slot ${r} → d12 ${w}: ${ws.name}.`, "pc"); return ws.name;
  }
  resolvePrime() {
    if (this.phase !== "prime") return;
    this.pcs.forEach(c => {
      if (c.dead || !c.primeDice) return;
      const counts = {}; c.primeDice.forEach(r => { const sg = this.slotOf(c, r); if (sg) counts[sg.key] = (counts[sg.key] || 0) + 1; });
      this.log(`${c.short} Primes d${c.die} ×${c.prime}: [${c.primeDice.join(", ")}]`, "pc");
      const done = {};
      c.primeDice.forEach(r => { const sg = this.slotOf(c, r); if (sg) { if (done[sg.key]) return; done[sg.key] = 1; c.primed.push({ sg, amped: counts[sg.key] > 1 }); if (counts[sg.key] > 1) this.log(`  doubles: ${sg.name} is Amped (0 Flux).`, "pc"); } else this.primeRoll(c, r); });
      if (c.primed.length > c.maxPrimed) c.primed.length = c.maxPrimed;
      if (c.scars.includes("hunger") || c.scars.includes("feedbackloop")) { c.flux += 1; c.firstFree = true; this.log(`${c.short}: ${c.scars.includes("hunger") ? "Hunger for Change" : "Feedback Loop"}: +1 Flux; first Surge this fight is Amped.`, "pc"); }
    });
    const hm = this.standing.find(c => c.nodes.has("hivemind"));
    if (hm) { const t = this.standing.filter(x => x !== hm).sort((a, b) => a.primed.length - b.primed.length)[0] || hm; this.log(`${hm.short}'s Hive Mind: ${t.short} Primes one extra Surge.`, "pc"); this.primeRoll(t, die(t.die)); }
    this.phase = "setup";
  }
  firmwareOptions(c) { if (!c.chrome || c.flags.fwUsed || this.phase !== "setup") return null; const fw = c.surges.filter(s => s.fw); return fw.length && c.primed.length ? fw : null; }
  firmware(c, primedIdx, key) {
    const fw = this.firmwareOptions(c); if (!fw) return false; const sg = fw.find(x => x.key === key); const p = c.primed[primedIdx]; if (!sg || !p) return false;
    c.flags.fwUsed = true; this.log(`${c.short}'s Firmware swaps ${p.sg.name} for ${sg.name}.`, "pc"); p.sg = sg; p.amped = false; return true;
  }
  canFinalForm(c) { return c.level >= 10 && !c.rp.lockdown.finalForm && !c.ffActive && this.canAct(c) && (this.phase === "setup"); }
  finalForm(c) {
    if (!this.canFinalForm(c)) return false;
    c.rp.lockdown.finalForm = true; c.ffActive = true; boostStat(c, c.primary, D.finalFormBonus || 2);
    const fname = RULES.FORM[c.form].stages[3].name;
    this.log(`★ ${c.short} enters FINAL FORM: ${fname}! ${RULES.STAT_NAME[c.primary]} +2, two extra Surges Primed, every Surge Amped this fight.`, "crit");
    this.primeRoll(c, die(c.die)); this.primeRoll(c, die(c.die)); return true;
  }
  begin() {
    if (this.phase === "prime") this.resolvePrime();
    if (this.phase !== "setup") return;
    this.phase = "begin";
    this.standing.forEach(c => { if (c.nodes.has("hairtrigger")) { const w = this.bestWeapon(c, true); const t = w && this.foesAlive().filter(e => this.canHit(c, w, e).ok).sort((a, b) => a.hp - b.hp)[0]; if (w && t) { this.log(`${c.short}'s Hair Trigger: a shot before anyone moves.`, "pc"); this.attack(c, w, t, {}); } } });
    if (this.checkEnd()) return;
    if (!this.playersFirst) { this.round = 1; this.startRound(true); this.enemyPhase(); if (this.phase === "won" || this.phase === "lost") return; this.round = 1; this.playerPhase(true); }
    else { this.round = 0; this.startRound(); }
  }
  // ---------------- rounds
  startRound(enemyFirst) {
    if (!enemyFirst) this.round++;
    this.stats.rounds = this.round;
    this.log(`Round ${this.round}`, "round");
    this.pcs.forEach(c => { c.turnDone = false; c.reactions = c.nodes.has("mantisreflex") ? 2 : 1; c.rf = {}; c.omen = null;
      if (c.nodes.has("foresight") && this.canAct(c)) { c.omen = die(20); this.log(`${c.short}'s Omen this round: ${c.omen}.`, "pc"); } });
    this.foes.forEach(e => { e.used = 0; e.cond.shieldused = false; e.osUsed = 0; });
    this.lingers = this.lingers.filter(l => l.until >= this.round);
    this.pcs.forEach(c => { for (const k in c.cond) { const x = c.cond[k]; if (x && x.round != null && x.round < this.round) delete c.cond[k]; } });
    this.phase = "player";
    if (!enemyFirst) this.autoSkipDown();
  }
  playerPhase() { this.phase = "player"; this.pcs.forEach(c => c.turnDone = false); this.autoSkipDown(); }
  autoSkipDown() { this.pcs.forEach(c => { if (!this.canAct(c)) { c.turnDone = true; c.skipped = true; } else c.skipped = false; }); if (this.phase === "player" && this.pcs.every(c => c.turnDone)) this.endPlayerPhase(); }
  // freelancers still to act this Player Phase, in initiative order (a freelancer who Waits goes to the back)
  pending() { return this.pcs.filter(c => !c.turnDone && this.canAct(c)).sort((a, b) => ((a.waited === this.round) - (b.waited === this.round)) || ((b.init || 0) - (a.init || 0)) || a.idx - b.idx); }
  order() { return this.pcs.slice().sort((a, b) => ((b.init || 0) - (a.init || 0)) || a.idx - b.idx); }
  // Wait: hand the turn to someone else before doing anything (the Player Phase may go in any order, ch 6)
  canWait(c) { const t = c && c.t; return !!t && this.active === c && !this.haste && t.actions >= 1 && !t.moved && !t.unleashed && !t.churned && !t.qspent && this.pending().length > 1; }
  waitTurn(c) { if (!this.canWait(c)) return false; c.waitT = c.t; this.active = null; c.waited = this.round; this.log(`${c.short} waits.`, "turn"); return true; }
  // ---------------- turns
  beginTurn(c) {
    if (this.phase !== "player" || this.active || c.turnDone || !this.canAct(c)) return false;
    if (c.waitT && c.waited === this.round) { this.active = c; c.t = c.waitT; c.waitT = null; this.log(`${c.short}'s turn.`, "turn"); return true; }
    this.active = c; c.turnNo++; c.t = { actions: 1, quick: c.cond.dazed ? 0 : 1, unleashed: false, churned: false, used: {}, move: this.speedSq(c), moved: 0 };
    this.log(`${c.short}'s turn.`, "turn"); this.ev({ t: "turn", id: c.id });
    c.sigUsed = {}; delete c.cond.braced;
    if (c.cond.burning) { const b = c.cond.burning.v || 2; delete c.cond.burning; this.log(`${c.short} burns for ${b} Blaze, then douses the flames.`, "pc"); this.harmPC(c, b, { raw: true, src: "Burning" }); if (!this.canAct(c)) return this.endTurn(c), true; }
    if (c.cond.prone) { delete c.cond.prone; c.t.move = Math.max(0, c.t.move - Math.ceil(this.speedSq(c) / 2)); this.log(`${c.short} stands up (half their speed).`, "pc"); }
    if ((c.nodes.has("regenerate") || c.scars.includes("brittleshell")) && c.hp <= c.maxhp / 2) { const h = c.nodes.has("regenerate") ? c.R + 1 : Math.ceil((c.R + 1) / 2); this.heal(c, c, h, "Regenerate"); }
    if (c.rp.emerge && !c.emerged) this.emerge(c);
    if (c.cond.reboot) { c.t.actions = 0; delete c.cond.reboot; this.log(`${c.short}: Hard Reboot — no Action this turn.`, "pc"); }
    if (c.cond.ospike) { c.t.actions++; c.t.ospike = true; delete c.cond.ospike; this.log(`${c.short}: Overclock Spike — an extra Action (Dazed afterwards).`, "pc"); }
    if (c.cond.cocoon) this.log(`${c.short} is still encased in the Cocoon (Held, no damage).`, "pc");
    return true;
  }
  emerge(c) {
    c.emerged = true; const L = c.rp.emerge; c.rp.emerge = 0;
    const st = RULES.FORM[c.form].stages[L >= 7 ? 2 : 1], mat = c.rp.s.trees[RULES.FORM[c.form].trees[0]] === "chrome" ? "chrome" : "bio";
    this.log(`✶ ${c.short} EMERGES as a ${st.name}! ${st[mat]}`, "crit");
    const t = 2 * c.level; if (t > c.tmp) c.tmp = t; this.log(`  ${c.short} gains ${t} temporary HP; enemies who see it are Shaken (not Bosses); the new Signature is Amped on its first use.`, "pc");
    this.foesAlive().forEach(e => { if (!e.boss) this.condFoe(e, "shaken"); });
    c.emergeSig = c.sigs.length - 1;
  }
  endTurn(c) {
    if (!c || this.active !== c) return;
    if (c.mitosis && this.canAct(c)) { const w = this.bestWeapon(c); const t = w && this.pickTarget(c, w, this.foesAlive().filter(e => this.canHit(c, w, e).ok)); if (w && t) { this.log(`${c.short}'s Mitosis copy attacks.`, "pc"); this.attack(c, w, t, {}); } }
    if (c.t && c.t.ospike && this.condPC(c, "dazed")) { c.cond.dazed.keep = 1; }
    for (const k in c.cond) { const x = c.cond[k]; if (x && x.keep) { delete x.keep; continue; } if (x && x.at != null && x.round == null && x.at < c.turnNo) delete c.cond[k]; }
    c.turnDone = true; this.active = null; this.haste = null;
    if (this.checkEnd()) return;
    this.interrupt();
    if (this.checkEnd()) return;
    if (this.pending().length === 0) this.endPlayerPhase();
  }
  endPlayerPhase() {
    if (this.phase !== "player") return;
    if (this.active) { const a = this.active; this.endTurn(a); return; }
    this.pcs.forEach(c => c.turnDone = true);
    this.enemyPhase();
    if (this.phase === "won" || this.phase === "lost") return;
    this.startRound();
  }
  // ---------------- conditions
  // A condition lasts until the end of the affected freelancer's next turn (ch 6): stamped with its turn counter, cleared at
  // the end of the first turn that started after it. {round: N} conditions (Veil, Shell, Link, Help) last until the end of round N.
  condPC(c, k, x) { if (c.dead || c.down) return false; if (k === "poisoned" && c.nodes.has("antibodies")) return false; if (k === "shaken" && c.nodes.has("ironwill")) return false;
    if (k === "blinded" && (c.nodes.has("echolocation") || this.standing.some(p => p.nodes.has("thousandeyes")))) return false;
    if ((k === "prone" || k === "held") && c.nodes.has("anchor")) return false; if (k === "prone" && c.nodes.has("siegehide")) return false;
    c.cond[k] = Object.assign({ at: c.turnNo }, typeof x === "object" && x ? x : x === true || x == null ? {} : { v: x }); return true; }
  condFoe(e, k, v) { if (e.dead) return; if (k === "prone" && e.tr.huge) return; e.cond[k] = v == null ? true : v; }
  // ---------------- checkEnd
  checkEnd() {
    if (this.phase === "won" || this.phase === "lost") return true;
    if (!this.foesAlive().length) { this.phase = "won"; this.active = null; this.log(`Victory! ${this.title.replace(/^.*?: /, "")} — cleared in ${this.round} round${this.round === 1 ? "" : "s"}.`, "win"); this.finish(true); return true; }
    if (!this.standing.length) { this.phase = "lost"; this.active = null; this.log(`Defeat. Every freelancer is Down or dead.`, "lose"); this.finish(false); return true; }
    return false;
  }
  finish(won) {
    this.foes.forEach(e => { if (e.dominated) e.dominated = false; });
    this.pcs.forEach(c => {
      const rp = c.rp;
      if (won && this.canAct(c) && c.bioN) { const k = c.R * c.bioN; c.hp = Math.min(c.maxhp, c.hp + k); this.log(`${c.short}'s Knit: +${k} HP.`, "pc"); }
      rp.hp = c.dead ? 0 : c.hp; rp.dead = c.dead; rp.marks = c.marks; rp.juice = c.juice;
      if (c.flags.overgrowth) rp.overgrowth = true; if (c.flags.molt) rp.molt = true;
    });
  }
  // ---------------- freelancer attacks
  guardOf(e) { let g = e.guard - (e.cond.exposed ? 2 : 0); if (e.tr.shieldwall) { const sw = e.tr.shieldwall; g += Math.min(sw[1], sw[0] * this.foesAlive().filter(x => x !== e && x.tr.shieldwall).length); } return g; }
  advFor(c, opt, tgt, o) {
    let up = !!o.adv, down = false; const why = [];
    if (c.cond.veiled && !c.cond.veiled.atkUsed) { up = true; c.cond.veiled.atkUsed = true; why.push("Veiled"); }
    if (c.cond.linked) { up = true; delete c.cond.linked; why.push("Link"); }
    if (c.cond.helped) { up = true; delete c.cond.helped; why.push("Help"); }
    if (c.cond.spotted) { up = true; delete c.cond.spotted; why.push("Spotter"); }
    if (c.cond.adrenal) { up = true; delete c.cond.adrenal; why.push("Adrenal Dump"); }
    if (o.dis) { down = true; why.push(o.disWhy || "long range"); }
    if (opt.twists && opt.twists.includes("sure")) { up = true; why.push("Sure"); }
    if (tgt) { if (tgt.cond.prone && opt.melee) { up = true; why.push("target Prone"); } if (tgt.cond.prone && !opt.melee) { down = true; why.push("target Prone (ranged)"); } if (tgt.cond.blinded) { up = true; why.push("target Blinded"); } }
    if (c.cond.shaken) { down = true; why.push("Shaken"); } if (c.cond.blinded) { down = true; why.push("Blinded"); }
    if (opt.melee && !opt.sg && (c.rp.s.injuries || []).includes("tornarm")) { down = true; why.push("Torn Limb"); }
    return { adv: advOf(up, down), why };
  }
  extraDice(c, opt, tgt, hit) {
    if (!hit) return { n: 0, why: [] }; let n = 0; const why = [];
    const u = c.t ? c.t.used : {};
    if (opt.melee && c.nodes.has("extraarm") && !u.extraarm) { n++; u.extraarm = 1; why.push("Extra Arm"); }
    if (opt.melee && c.nodes.has("capacitor") && !u.capacitor) { n++; u.capacitor = 1; why.push("Capacitor"); }
    if (c.lock && tgt && c.lock.includes(tgt.id) && c.nodes.has("targetlock") && !u.lockdie) { n++; u.lockdie = 1; why.push("Target Lock"); }
    if (c.charges && c.nodes.has("kineticbattery")) { n += c.charges; why.push(`Battery ×${c.charges}`); c.charges = 0; }
    return { n, why };
  }
  attack(c, opt, tgt, o) {
    o = o || {};
    if (c.cond.targeterr && !o.forced) { delete c.cond.targeterr; const all = this.foesAlive().concat(this.standing.filter(x => x !== c)); tgt = pick(all); this.log(`${c.short}'s Targeting Error: the shot goes at ${tgt.name}!`, "pc"); if (tgt.side === "pc") return this.attackAlly(c, opt, tgt); }
    const a = this.advFor(c, opt, tgt, o);
    const g = this.guardOf(tgt);
    let r = d20(a.adv), tot = r.v + opt.atk, note = "";
    const critAt = opt.crit || 20;
    let hit = r.v !== 1 && (tot >= g || r.v >= critAt);
    if (!hit && r.v !== 1) {
      const om = this.omenHolder(v => v + opt.atk >= g, c);
      if (om && (opt.sg || tgt.boss || tgt.centre)) { note = ` · ${om.short}'s Omen ${om.omen} replaces it`; r = { v: om.omen, txt: r.txt }; tot = om.omen + opt.atk; om.omen = null; hit = true; }
      else if (opt.ranged && c.nodes.has("deadeye") && !c.rf.deadeye && c.flux + 1 <= c.limit) { c.rf.deadeye = 1; this.gainFlux(c, 1, "Deadeye Push"); const r2 = d20(a.adv); note = ` · Deadeye reroll ${r2.txt}`; r = r2; tot = r2.v + opt.atk; hit = r2.v !== 1 && (tot >= g || r2.v >= critAt); }
    }
    const crit = hit && r.v >= critAt;
    const label = o.label || opt.name;
    if (!hit) { this.log(`${c.short} → ${tgt.name}: ${label} ${r.txt}${sgn(opt.atk)}=${tot} vs Guard ${g}${a.why.length ? " (" + a.why.join(", ") + ")" : ""}${note} — miss.`, "pc miss"); return { hit: false }; }
    const ex = this.extraDice(c, opt, tgt, hit);
    let n = opt.n + ex.n; if (o.half) n = Math.ceil(n / 2);
    const d1 = roll(n, opt.s), d2 = crit ? roll(n, opt.s) : { t: 0, r: [] };
    let dm = Math.max(1, d1.t + d2.t + opt.k + (o.bonus || 0));
    if (c.cond.poisoned) dm = Math.max(1, Math.floor(dm / 2));
    if (crit) c.rp.stats.crits++;
    const dealt = this.damageFoe(tgt, dm, { psy: opt.psy, type: opt.type, src: c });
    this.log(`${c.short} → ${tgt.name}: ${label} ${r.txt}${sgn(opt.atk)}=${tot} vs Guard ${g}${a.why.length ? " (" + a.why.join(", ") + ")" : ""}${note} — ${crit ? "CRIT! " : "hit · "}${n}d${opt.s}${crit ? "×2" : ""} [${d1.r.concat(d2.r).join(",")}]${opt.k ? sgn(opt.k) : ""}${ex.why.length ? " (+" + ex.why.join(", ") + ")" : ""}${c.cond.poisoned ? " ½ Poisoned" : ""} = ${dealt} ${opt.psy ? "Psychic" : opt.type || ""}.`, crit ? "pc crit" : "pc hit");
    if (!tgt.dead) {
      if (opt.rider && !o.noRider) this.riderFoe(c, opt.rider, tgt, opt.effect);
      if (crit && opt.critRider) this.riderFoe(c, opt.critRider, tgt);
      if (opt.natural && c.nodes.has("crushergrip") && !(c.t && c.t.used.crusher)) { if (c.t) c.t.used.crusher = 1; if (!(tgt.tr.huge || tgt.boss) || (c.flux + 1 <= c.limit && (this.gainFlux(c, 1, "Crusher Grip Push"), true))) { this.condFoe(tgt, "held"); this.log(`  Crusher Grip: ${tgt.name} is Held.`, "pc"); } }
      if (opt.melee && c.nodes.has("pounce") && c.t && c.t.moved >= 3 && !c.t.used.pounce && !tgt.tr.huge) { if (c.t) c.t.used.pounce = 1; this.condFoe(tgt, "prone"); this.log(`  Pounce: ${tgt.name} is knocked Prone.`, "pc"); }
    }
    if (opt.twists && opt.twists.includes("leech")) this.heal(c, c, Math.floor(dealt / 2), "Leech");
    return { hit: true, crit, dealt };
  }
  attackAlly(c, opt, ally) {   // Red Mist / Targeting Error: the ally defends with Dodge against the attack total
    const r = d20(0), tot = r.v + opt.atk, dr = d20(0), dd = dr.v + ally.def.dodge;
    if (dr.v !== 1 && dd >= tot) { this.log(`  ${ally.short} Dodges (${dr.txt}${sgn(ally.def.dodge)}=${dd} vs ${tot}).`, "pc"); return { hit: false }; }
    const dm = Math.max(1, roll(opt.n, opt.s).t + opt.k - (opt.psy ? 0 : ally.armor));
    this.log(`  ${ally.short} fails to Dodge (${dr.txt}${sgn(ally.def.dodge)}=${dd} vs ${tot}) and takes ${dm}.`, "pc bad"); this.harmPC(ally, dm, { src: c.short }); return { hit: true };
  }
  // Area attack (ch 4/6): one attack roll against every creature in the footprint. Miss = half damage, no rider.
  // o.cells (squares) or o.aim + o.mode; o.foesOnly (Pulse, Scream: you choose who); o.excludeSelf (Spore Bloom).
  areaAttack(c, sg, tgt, o) {
    o = o || {};
    let cells = o.cells || (o.aim ? this.areaCells(c, sg, o.aim, o.mode) : null);
    if (!cells) { const t = tgt && !tgt.dead ? tgt : this.foesAlive()[0]; if (!t) return { hit: false, dealt: 0 }; cells = sg.shape === "pulse" ? this.areaCells(c, sg, c.pos, null) : G.burst(this.map, t.pos, (sg.geo && sg.geo.radius) || 2); }
    const caught = this.foesAll().filter(e => G.inCells(cells, e.pos));
    const allies = o.foesOnly || sg.shape === "pulse" ? [] : this.pcs.filter(x => !x.dead && G.inCells(cells, x.pos) && !(x === c && o.excludeSelf));
    this.ev({ t: "area", id: c.id, cells });
    if (!caught.length && !allies.length) { this.log(`${c.short}: ${o.label || sg.name} (Area) catches nobody.`, "pc miss"); return { hit: false, dealt: 0 }; }
    const a = this.advFor(c, sg, null, o);
    const r = d20(a.adv), tot = r.v + sg.atk; const crit = r.v >= 20;
    const n = sg.n; const d1 = roll(n, sg.s), d2 = crit ? roll(n, sg.s) : { t: 0, r: [] };
    let base = d1.t + d2.t + sg.k; if (c.cond.poisoned) base = Math.floor(base / 2);
    this.log(`${c.short}: ${o.label || sg.name} (Area, ${cells.length} squares) ${r.txt}${sgn(sg.atk)}=${tot}${a.why.length ? " (" + a.why.join(", ") + ")" : ""} · ${n}d${sg.s}${crit ? "×2" : ""} [${d1.r.concat(d2.r).join(",")}]${sg.k ? sgn(sg.k) : ""} = ${base} · catches ${caught.concat(allies).map(e => e.short || e.name).join(", ")}.`, crit ? "pc crit" : "pc hit");
    let total = 0;
    caught.forEach(e => {
      const g = this.guardOf(e), hit = r.v !== 1 && (tot >= g || crit);
      const dm = hit ? base : Math.floor(base / 2);
      const dealt = sg.noDamage ? 0 : this.damageFoe(e, Math.max(1, dm), { psy: sg.psy, type: sg.type, area: true, src: c, quiet: true });
      total += dealt;
      this.log(`  ${e.name} (Guard ${g}): ${hit ? "hit" : "miss, half"}${sg.noDamage ? "" : " → " + dealt}${e.dead ? " ✝" : ""}.`, "pc");
      if (hit && !e.dead) { (o.riders || (sg.rider ? [sg.rider] : [])).forEach(rd => this.riderFoe(c, rd, e, sg.effect)); if (o.onHit) o.onHit(e); }
    });
    if (sg.twists && sg.twists.includes("linger") && caught.length) { this.lingers.push({ cells, dmg: 2 * c.R, rider: sg.rider, until: this.round + 1, src: c.id, name: sg.name, psy: sg.psy }); this.log(`  ${sg.name} lingers until the end of next round.`, "pc"); }
    // allies inside your Burst/Wave Dodge your roll: success = half (ch 4)
    allies.forEach(al => {
      const dr = d20(0), dd = dr.v + al.def.dodge, ok = dr.v !== 1 && dd >= tot; const dm = ok ? Math.floor(base / 2) : base;
      this.log(`  ${al.short} is inside the ${sg.shape || "area"}! Dodge ${dr.txt}${sgn(al.def.dodge)}=${dd} vs ${tot}: ${ok ? "half" : "full"}.`, "pc bad");
      if (sg.noDamage) { if (!ok && (o.riders || []).length) o.riders.forEach(rd => this.condPC(al, rd)); return; }
      if (dm > 0) this.harmPC(al, Math.max(1, sg.psy ? dm : dm - al.armor), { src: c.short }); if (!ok && sg.rider) this.condPC(al, sg.rider);
    });
    if (sg.twists && sg.twists.includes("leech")) this.heal(c, c, Math.floor(total / Math.max(1, caught.length) / 2), "Leech");
    return { hit: true, dealt: total, caught: caught.length, allies: allies.length };
  }
  riderFoe(c, rd, e, effect) {
    if (!rd || e.dead) return;
    if (rd === "burning") this.condFoe(e, "burning", c.R); else this.condFoe(e, rd);
    if (rd === "burning" || rd === "exposed") e.cond.noregen = true;
    if (c.nodes.has("transmute") && (effect === "toxin" || effect === "corrode")) { this.condFoe(e, "poisoned"); this.condFoe(e, "exposed"); }
  }
  damageFoe(e, dm, o) {
    if (!e || e.dead) return 0; o = o || {}; if (dm > 0) this.lastHarm = this.round;
    if (o.src && o.src.side === "pc" && e.dominated) { e.dominated = false; this.log(`${e.name} snaps out of ${o.src.short}'s control!`, "foe"); }
    if (!o.psy && !e.cond.weakspot) dm = Math.max(1, dm - e.armor);
    if (e.tr.vuln && o.type === e.tr.vuln) dm *= 2;
    if (e.tr.swarm) dm = o.area ? dm * 2 : Math.floor(dm / 2);
    if (e.tr.shielded && !e.cond.shieldused) { dm = Math.floor(dm / 2); e.cond.shieldused = true; }
    if (o.type === "blaze" || o.type === "corrode") e.cond.noregen = true;
    if (e.tr.link) {
      const ls = this.foesAll().filter(x => x !== e && x.tr.link);
      if (ls.length) { const share = Math.floor(dm / (ls.length + 1)); ls.forEach(x => { x.hp -= share; this.afterHit(x, o.src); }); dm -= share * ls.length; if (!o.quiet) this.log(`  (Linked: the wound spreads, ${share} to each of ${ls.length} other${ls.length > 1 ? "s" : ""})`, "foe"); }
    }
    e.hp -= dm; this.ev({ t: "dmg", id: e.id, n: dm });
    if (o.src && o.src.rp) { o.src.rp.stats.dmg += dm; this.stats.dealt += dm; }
    this.afterHit(e, o.src);
    if (e.dead) this.ev({ t: "die", id: e.id });
    return dm;
  }
  afterHit(e, src) {
    if (e.dead) return;
    if (e.tr.gate && !e.gated && e.hp < Math.floor(e.maxhp / 2)) { e.hp = Math.floor(e.maxhp / 2); e.gated = true; this.log(`${e.name}'s Damage Gate holds at half HP!`, "foe"); this.shift(e); }
    else if (e.boss && !e.shifted && e.hp <= Math.floor(e.maxhp / 2) && e.hp > 0) this.shift(e);
    if (e.hp <= 0) this.foeDies(e, src);
  }
  shift(e) {
    if (e.shifted) return; e.shifted = true; const sh = e.spec.shift || {}; const sc = e.scale || { dmg: 1 };
    e.guard += sh.guard || 0; e.armor += sh.armor || 0; e.dmgbonus += Math.round((sh.dmg || 0) * sc.dmg); e.interrupts += sh.interrupts || 0; e.actions += sh.actions || 0;
    if (sh.attacks) { e.attacks = sh.attacks.map(a => Object.assign({}, a, { dmg: a.summon ? a.dmg : Math.max(1, Math.round(a.dmg * sc.dmg)), extra: a.extra ? Math.max(1, Math.round(a.extra * sc.dmg)) : 0, tmpl: a.tmpl ? scaledSummon(a.tmpl, sc) : undefined })); e.charge = {}; e.attacks.forEach(a => e.charge[a.n] = true); }
    if (sh.attacks) e.attacks.forEach(attackGeo);
    if (e.speedAfterShift !== e.speedSq) { e.speedSq = e.speedAfterShift; this.log(`  ${e.name} tears free and can move (speed ${e.speedSq * 5} ft).`, "foe"); }
    if (e.flyAfterShift) e.fly = true;
    if (sh.cleanse) e.cond = {};
    this.log(`⚠ ${e.name} SHIFTS at half HP!${sh.guard ? ` +${sh.guard} Guard.` : ""}${sh.armor ? ` +${sh.armor} Armor.` : ""}${sh.dmg ? " Hits harder." : ""}${sh.interrupts ? " +1 Interrupt." : ""}${sh.attacks ? " New attacks: " + sh.attacks.filter(a => !a.summon).map(a => a.n + (a.multi ? ` (×${a.multi} targets)` : "")).join(", ") + "." : ""}`, "foe big");
    if (sh.shake) this.standing.forEach(c => { const r = d20(c.nodes.has("ironwill") ? 1 : 0); const tot = r.v + c.def.resist; if (r.v === 1 || tot < e.tn) { if (this.condPC(c, "shaken")) this.log(`  ${c.short} is Shaken (Resist ${r.txt}${sgn(c.def.resist)}=${tot} vs ${e.tn}).`, "foe"); } });
  }
  foeDies(e, src) {
    if (e.dead) return; e.dead = true; e.hp = 0;
    this.log(`✝ ${e.name} is down${src && src.short ? ` (${src.short})` : ""}.`, "kill");
    if (src && src.rp) { src.rp.stats.kills++; this.run.stats.kills++; }
    this.foesAlive().forEach(x => { if (x.tr.enrage) { x.enrage = Math.min(x.enrage + 1, x.tr.enrage[1]); this.log(`  ${x.name} goes into a Frenzy (+${x.tr.enrage[0] * x.enrage} damage).`, "foe"); } });
    if (e.tr.explode) { this.log(`  ${e.name} EXPLODES!`, "foe big"); this.ev({ t: "area", id: e.id, cells: G.burst(this.map, e.pos, 2) }); this.pcs.filter(c => !c.dead && this.within(e, c, 2)).forEach(c => this.hitPC(e, c, { n: "Explosion", d: "endure", dmg: e.tr.explode, area: "s", melee: false }, { area: true })); }
  }
  heal(src, c, amt, label) {
    if (!c || c.dead || amt <= 0) return 0;
    const wasDown = c.down; if (c.down) { c.down = false; c.hp = 0; }
    const before = c.hp; c.hp = Math.min(c.maxhp, c.hp + amt); const got = c.hp - before; if (got) this.ev({ t: "heal", id: c.id, n: got });
    if (src && src.rp) src.rp.stats.heals += got;
    this.log(`  ${c.short} regains ${got} HP${label ? " (" + label + ")" : ""}${wasDown ? " and stands up!" : ""} → ${c.hp}/${c.maxhp}.`, "heal");
    if (wasDown && this.phase === "player" && c.skipped) { c.turnDone = false; c.skipped = false; }
    return got;
  }
  omenHolder(pred, who) { return this.standing.find(p => p.omen != null && pred(p.omen) && (!who || !who.pos || G.dist(p.pos, who.pos) <= 12)) || null; }
  // ---------------- damage to freelancers
  harmPC(c, dm, o) {
    o = o || {}; if (c.dead || dm <= 0) return 0; this.lastHarm = this.round;
    if (c.cond.cocoon && !o.overload) { this.log(`  The Cocoon absorbs it: ${c.short} takes no damage.`, "pc"); return 0; }
    if (c.tmp && !o.noTemp) { const x = Math.min(c.tmp, dm); c.tmp -= x; dm -= x; if (x) this.log(`  (${x} soaked by temporary HP)`, "pc"); }
    if (dm <= 0) return 0;
    if (o.floor1) { const was = c.hp; c.hp = Math.max(1, c.hp - dm); return was - c.hp; }
    c.rp.stats.taken += dm; this.stats.taken += dm; this.ev({ t: "dmg", id: c.id, n: dm });
    const was = c.hp; c.hp -= dm;
    if (c.hp > 0) {
      if (c.nodes.has("adrenaldump") && !c.flags.adrenal && c.hp <= c.maxhp / 2) { c.flags.adrenal = true; const t = 2 * c.R + c.st.grit; if (t > c.tmp) c.tmp = t; c.cond.adrenal = { at: c.turnNo + 1 }; this.log(`  ${c.short}'s Adrenal Dump: ${t} temporary HP and advantage on the next attack.`, "pc"); }
      return dm;
    }
    // would drop to 0
    if (!c.rp.lockdown.lastGasp && c.rp.lastGasp !== false && !o.noGasp) {
      c.rp.lockdown.lastGasp = true; c.hp = 1; this.log(`☠→ ${c.short} refuses to fall: LAST GASP! Overloads on purpose and stays at 1 HP.`, "crit"); this.overload(c, true); return was - 1;
    }
    c.hp = 0; c.down = true; c.everDown = true; c.cond = {}; c.tmp = 0; c.rp.stats.downs++; this.run.stats.downs++; this.stats.downs++;
    const inj = die(6); const id = INJURY[inj]; let injName = "Lucky Break (no effect)";
    if (id !== "lucky") { const real = id === "torn" ? (c.st.moxie > c.st.grit ? "tornleg" : "tornarm") : id; const I = RULES.INJ[real]; injName = I.name; if (!c.rp.s.injuries.includes(real)) c.rp.s.injuries.push(real); }
    this.log(`▼ ${c.short} is DOWN! Injury (d6 ${inj}): ${injName}.`, "down");
    if (this.active === c && this.phase === "player") { this.active = null; c.turnDone = true; this.afterForcedEnd = true; }
    return dm;
  }
  gainFlux(c, x, why) {
    if (x <= 0 || c.dead) return;
    if (c.nodes.has("mutagentap") && !c.rf.tap && c.flux + x > c.limit && c.hp > (c.R + 1) * x + 2 && !c.down) { c.rf.tap = 1; const h = (c.R + 1) * x; c.hp = Math.max(1, c.hp - h); this.log(`  ${c.short}'s Mutagen Tap: takes ${h} damage instead of ${x} Flux.`, "pc"); return; }
    c.flux += x;
    if (c.flux > c.limit) this.overload(c, false, why);
  }
  overload(c, purposeful, why) {
    c.rp.stats.overloads++; this.run.stats.overloads++; this.stats.overloads++;
    let txt = `⚡ ${c.short} OVERLOADS${why ? " (" + why + ")" : ""}!`;
    if (!purposeful && !c.down) { const d = roll(c.R, 6); const lost = Math.min(d.t, c.hp - 1); c.hp = Math.max(1, c.hp - d.t); txt += ` ${c.R}d6 [${d.r.join(",")}] → −${lost} HP (can't drop below 1).`; }
    c.flux = 0;
    const tables = c.material === "splice" ? ["bloom", "glitch"] : c.material === "chrome" ? ["glitch"] : ["bloom"];
    let best = null;
    tables.forEach(t => { const r = die(12); const pref = (t === "bloom" ? BLOOM_PREF : GLITCH_PREF)[r]; if (!best || pref > best.pref) best = { t, r, pref }; });
    if (c.rp.s.origin === "convert" && best.pref < 0 && !c.rp.lockdown.bloomLore) { c.rp.lockdown.bloomLore = true; const r2 = die(12), p2 = (best.t === "bloom" ? BLOOM_PREF : GLITCH_PREF)[r2]; txt += ` Bloom Lore reroll ${r2}.`; if (p2 > best.pref) best = { t: best.t, r: r2, pref: p2 }; }
    const name = (best.t === "bloom" ? BLOOM : GLITCH)[best.r];
    this.log(`${txt} ${best.t === "bloom" ? "Bloom" : "Glitch"} d12 ${best.r}${tables.length > 1 ? " (Splice: best of both)" : ""}: ${name}.`, "over");
    this.applyOverload(c, best.t, best.r);
  }
  applyOverload(c, t, r) {
    const L = m => this.log("  " + m, "over");
    if (t === "bloom") switch (r) {
      case 1: L(permanentMark(c.rp, "scar") + " (from the next fight)."); break;
      case 2: this.condPC(c, "prone"); this.condPC(c, "dazed"); L(`${c.short} seizes: Prone and Dazed.`); break;
      case 3: c.rp.ravenous = true; L(`${c.short} is Ravenous: disadvantage on checks until they eat a ration.`); break;
      case 4: c.flags.overgrowth = true; L(`Overgrowth: speed halved until the next Breather.`); break;
      case 5: this.condPC(c, "redmist"); L(`Red Mist: next turn ${c.short} must attack the nearest creature, friend or foe.`); break;
      case 6: this.condPC(c, "poisoned"); L(`Fever: ${c.short} is Poisoned.`); break;
      case 7: c.armor = Math.max(0, c.armor - 1); c.flags.molt = true; this.heal(c, c, roll(c.R, 8).t, "Molt"); L(`Molt: Armor −1 until the next Breather.`); break;
      case 8: { const rr = die(c.die); const sg = this.slotOf(c, rr); if (sg) { this.addPrimed(c, sg); L(`Twitch: ${sg.name} is Primed.`); } else L(`Twitch: rolled a Wild slot, nothing happens.`); break; }
      case 9: { const tt = 2 * c.R; if (tt > c.tmp) c.tmp = tt; this.condPC(c, "shaken"); L(`Adrenal Flood: ${tt} temporary HP, and Shaken.`); break; }
      case 10: this.condPC(c, "held"); this.condPC(c, "cocoon"); L(`Cocoon: Held until the end of the next turn, but immune to damage.`); break;
      case 11: { const k = "Blossom: " + pick(["Bioluminescent", "Smells Like Rain", "Petal Hair", "Singing Bones", "Glass Freckles", "Moth Wings"]); c.rp.s.knacks.push(k); L(`Blossom: a beautiful change. New Knack "${k}".`); break; }
      case 12: { const p = c.primed.filter(x => !x.amped).sort((a, b) => this.surgeValue(c, b.sg) - this.surgeValue(c, a.sg))[0]; if (p) p.amped = true; c.juice = Math.min(3, c.juice + 1); L(`Flowering: ${p ? p.sg.name + " is Amped; " : ""}+1 Juice.`); break; }
    } else switch (r) {
      case 1: L(permanentMark(c.rp, "fault") + " (from the next fight)."); break;
      case 2: this.condPC(c, "reboot"); L(`Hard Reboot: ${c.short} loses their next Action.`); break;
      case 3: { const d = roll(c.R, 6); const was = c.hp; c.hp = Math.max(1, c.hp - d.t); L(`Short: ${c.R}d6 [${d.r.join(",")}] Shock → −${was - c.hp} HP.`); break; }
      case 4: c.flags.jointlock = true; L(`Joint Lock: speed 0 (can't Dash this fight).`); break;
      case 5: this.condPC(c, "targeterr"); L(`Targeting Error: the next attack goes at a random creature.`); break;
      case 6: this.condPC(c, "blinded"); L(`Blackout: ${c.short} is Blinded.`); break;
      case 7: { const d = roll(c.R, 6); L(`Heat Vent: ${d.t} Blaze to everything within 10 ft.`); this.foesAlive().filter(e => this.within(c, e, 2)).forEach(e => { const x = this.damageFoe(e, d.t, { type: "blaze", area: true, src: c, quiet: true }); L(`${e.name} takes ${x}.`); });
        this.neighbours(c, 2).filter(x => this.canAct(x)).forEach(a => { const dr = d20(0); if (dr.v === 1 || dr.v + a.def.dodge < 12 + c.R) { this.harmPC(a, Math.max(1, d.t - a.armor), { src: "Heat Vent" }); L(`${a.short} fails to Dodge (${dr.v}${sgn(a.def.dodge)}) and is scorched.`); } }); break; }
      case 8: { const e = this.foesAlive().sort((a, b) => b.hp - a.hp)[0]; if (e) { this.condFoe(e, "exposed"); e.revealed = true; L(`Log Dump: free Analyze: ${e.name} is Exposed.`); } break; }
      case 9: c.armor = Math.min(c.armorMax, c.armor + 1); c.flags.safemode = true; L(`Safe Mode: +1 Armor, Surges cost +1 Flux, until the fight ends.`); break;
      case 10: this.condPC(c, "ospike"); L(`Overclock Spike: an extra Action next turn, then Dazed.`); break;
      case 11: { const f = c.rp.s.scars.find(x => D.faults.some(y => y.id === x)); if (f) { c.rp.s.scars = c.rp.s.scars.filter(x => x !== f); L(`Patch Applied: Fault removed.`); } else if (!c.rp.s.patchApplied) { c.rp.s.patchApplied = true; c.limit++; L(`Patch Applied: Flux Limit +1 permanently.`); } else L(`Patch Applied: nothing left to patch.`); break; }
      case 12: c.flags.rootAccess = true; c.juice = Math.min(3, c.juice + 1); L(`Root Access: choose the result of the next Churn; +1 Juice.`); break;
    }
    c.rp.juice = c.juice;
  }
  // ---------------- enemies attack
  leaderBonus(e) { let b = 0; this.foesAlive().forEach(x => { if (x !== e && x.tr.leader) b = Math.max(b, x.tr.leader); }); return b; }
  alone(e) { return this.foesAlive().filter(x => x !== e).length === 0; }
  hitPC(e, c, a, o) {
    o = o || {}; if (c.dead) return 0;
    // Bulwark: a neighbour steps into a Single attack
    if (!o.area && !c.down && !o.noBulwark) {
      const bw = this.neighbours(c, 2).find(x => this.canAct(x) && x.nodes.has("bulwark") && x.reactions > 0 && !x.cond.dazed && x.hp / x.maxhp >= 0.5 && x.hp / x.maxhp > c.hp / c.maxhp);
      if (bw) { bw.reactions--; let adv = 0; if (bw.flux + 1 <= bw.limit) { this.gainFlux(bw, 1, "Bulwark Push"); adv = 1; } this.log(`${bw.short}'s Bulwark: steps in front of ${c.short}${adv ? " (Push: advantage)" : ""}.`, "pc"); c = bw; o = Object.assign({}, o, { bwAdv: adv }); }
    }
    const dfn = a.d === "mix" ? pick(["dodge", "endure", "resist"]) : a.d || "dodge";
    let stat = c.def[dfn], up = !!o.bwAdv, down = !!o.adv; const why = [];
    const lw = Math.max(0, ...this.neighbours(c).filter(x => this.canAct(x) && x.nodes.has("livingwall")).map(x => (x.R >= 4 ? 2 : 1))); if (lw) { stat += lw; why.push("Living Wall +" + lw); }
    if (dfn === "resist" && this.standing.some(x => x !== c && x.nodes.has("ironwill"))) { stat += 1; why.push("Iron Will +1"); }
    if (dfn === "resist" && c.nodes.has("ironwill")) { up = true; why.push("Iron Will"); }
    if (c.nodes.has("menace") && e.taunt === c.id) { stat += 2; why.push("Menace +2"); }
    if (c.cond.exposed) { stat -= 2; why.push("Exposed −2"); }
    if (c.cond.braced) { up = true; why.push("Brace"); }
    if (c.cond.veiled) { up = true; why.push("Veiled"); }
    if (c.cond.linked) { up = true; delete c.cond.linked; why.push("Link"); }
    if (c.cond.helped) { up = true; delete c.cond.helped; why.push("Help"); }
    if (dfn === "dodge" && c.nodes.has("blur") && !c.rf.blur) { c.rf.blur = 1; up = true; why.push("Blur"); }
    if (c.nodes.has("anchor") && a.rider === "held") { up = true; why.push("Anchor"); }
    if (c.cond.prone && a.melee !== false) { down = true; why.push("Prone"); }
    if (!o.area && a.melee === false && !o.os && e.pos && this.pcs.some(x => this.canAct(x) && G.dist(x.pos, e.pos) <= 1)) { up = true; why.push("shooter in melee"); }
    if (c.cond.blinded) { down = true; why.push("Blinded"); }
    if (e.cond.shaken || e.cond.blinded) { up = true; why.push(e.cond.shaken ? "attacker Shaken" : "attacker Blinded"); }
    if (dfn === "resist" && (c.rp.s.injuries || []).includes("shellshock")) { down = true; why.push("Shell Shock"); }
    if (c.chrome && (a.rider === "dazed" || /shock|arc|lance|null/i.test(a.n))) { down = true; why.push("Chrome vs Shock"); }
    if (o.adv) why.push(o.advWhy || "attacker advantage");
    let tn = e.tn + (o.tnb || 0);
    if (e.tr.apex && this.alone(e)) tn += 2;
    if (e.songTaunt && e.taunt === c.id) tn -= 2;
    let dmg = a.dmg + e.dmgbonus + e.enrage * (e.tr.enrage ? e.tr.enrage[0] : 0) + this.leaderBonus(e);
    if (e.tr.apex && this.alone(e)) dmg = Math.floor(dmg * 1.5);
    dmg += (o.extra || 0); if (e.cond.poisoned) dmg = Math.floor(dmg / 2);
    const big = dmg >= 0.25 * c.maxhp;
    // Precog / Threat Sense are declared before the roll
    if (!c.down && big && !up) { const pg = this.standing.find(x => x.nodes.has("precog") && G.dist(x.pos, c.pos) <= 6 && x.reactions > 0 && !x.cond.dazed && x.flux + 1 <= x.limit); if (pg) { pg.reactions--; this.gainFlux(pg, 1, "Precog Push"); up = true; why.push(`${pg.short}'s Precog`); } }
    if (!c.down && big) { const ts = this.standing.find(x => x !== c && x.nodes.has("threatsense") && G.dist(x.pos, c.pos) <= 6 && x.reactions > 0 && !x.cond.dazed); if (ts && ts.st.nerve > 0) { ts.reactions--; stat += ts.st.nerve; why.push(`${ts.short}'s Threat Sense +${ts.st.nerve}`); } }
    const adv = advOf(up, down);
    let r = d20(adv), tot = r.v + stat, ok = r.v !== 1 && tot >= tn, omen = "";
    if (!ok && !c.down && r.v !== 1 && dmg >= 0.2 * c.maxhp) { const om = this.omenHolder(v => v + stat >= tn, c); if (om) { omen = ` · ${om.short}'s Omen ${om.omen}`; tot = om.omen + stat; om.omen = null; ok = true; } }
    const nat20 = r.v === 20;
    const lab = `${e.name} → ${c.short}: ${a.n}${o.area ? " (Area)" : ""} — ${dfn[0].toUpperCase() + dfn.slice(1)} ${r.txt}${sgn(stat)}=${tot} vs TN ${tn}${why.length ? " (" + why.join(", ") + ")" : ""}${omen}`;
    if (c.down) {
      if (o.area || !ok) { const m = e.boss && !ok ? 2 : 1; c.marks += m; this.log(`${lab} — hits ${c.short} while Down: ${m} Death mark${m > 1 ? "s" : ""} (${c.marks}/3).`, "foe bad"); if (c.marks >= 3) this.die(c); }
      else this.log(`${lab} — avoided.`, "foe");
      return 0;
    }
    if (nat20) { this.condFoe(e, "exposed"); this.log(`${lab} — natural 20! Avoided entirely; ${e.name} is Exposed.`, "foe good"); this.onDodge(c, e, a, dfn); return 0; }
    if (ok && !o.area) { this.log(`${lab} — defended.`, "foe good"); this.onDodge(c, e, a, dfn); return 0; }
    let note = "";
    if (ok && o.area) { if (dfn === "dodge" && c.nodes.has("slipstream")) { this.log(`${lab} — Slipstream: no damage.`, "foe good"); this.onDodge(c, e, a, dfn); return 0; } dmg = Math.floor(dmg / 2); note += " half"; if (dfn === "dodge") this.onDodge(c, e, a, dfn, true); }
    if (o.area && this.neighbours(c, 2).some(x => this.canAct(x) && x.nodes.has("fortress"))) { dmg = Math.floor(dmg / 2); note += " · Fortress half"; }
    let ignoreRider = false;
    if (!ok && c.nodes.has("unbreakable") && !c.rf.unbreak && big && c.flux + 1 <= c.limit) { c.rf.unbreak = 1; this.gainFlux(c, 1, "Unbreakable Push"); dmg = Math.floor(dmg / 2); ignoreRider = true; note += " · Unbreakable half, no rider"; }
    const arm = a.psy ? 0 : c.armor + (c.cond.shell ? 1 : 0);
    dmg = a.psy ? dmg : Math.max(1, dmg - arm);
    if (dmg >= c.hp + c.tmp) {
      const fo = this.standing.find(x => x !== c && x.nodes.has("fortress") && G.dist(x.pos, c.pos) <= 6 && !x.rf.fort && x.reactions > 0 && x.hp > dmg + 0.3 * x.maxhp);
      if (fo) { fo.rf.fort = 1; fo.reactions--; const fd = a.psy ? dmg : Math.max(1, dmg + arm - fo.armor); this.log(`${lab} — ${dmg} would drop ${c.short}: ${fo.short}'s Fortress takes it instead (${fd}).`, "foe"); this.harmPC(fo, fd, { src: e.name }); return 0; }
    }
    this.log(`${lab} — ${ok ? "partly defended" : "HIT"}: ${dmg}${a.psy ? " Psychic" : ""}${arm && !a.psy ? ` (Armor ${arm})` : ""}${note}${!ok && a.rider && !ignoreRider ? ", " + riderName(a.rider) : ""}.`, "foe bad");
    this.harmPC(c, dmg, { src: e.name });
    if (!c.dead && !ok && !ignoreRider) this.riderPC(e, c, a);
    if (!c.dead && !ok && e.tr.mutagenic && !c.down) this.gainFlux(c, e.tr.mutagenic, `Mutagenic ${e.name}`);
    if (!c.dead && !ok && e.tr.purger) this.losePrimed(c, "Purger");
    if (c.nodes.has("barbs") && a.melee !== false && !o.area && !e.dead) { const b = this.damageFoe(e, 2 * c.R, { src: c, quiet: true }); this.log(`  ${c.short}'s Barbs: ${e.name} takes ${b}.`, "pc"); }
    return dmg;
  }
  onDodge(c, e, a, dfn, area) {
    if (dfn !== "dodge" || c.down) return;
    if (c.nodes.has("kineticbattery") && c.charges < 3) c.charges++;
    if (!area && a.melee !== false && c.nodes.has("reflexspike") && c.reactions > 0 && !c.cond.dazed && c.flux + 1 <= c.limit && !e.dead) {
      const w = c.weapons.filter(x => this.canHit(c, x, e).ok).sort((a, b) => b.n * b.s - a.n * a.s)[0]; if (!w) return; c.reactions--; this.gainFlux(c, 1, "Reflex Spike Push"); if (w) { this.log(`  ${c.short}'s Reflex Spike!`, "pc"); this.attack(c, w, e, { half: !c.nodes.has("mantisreflex") }); }
    }
  }
  riderPC(e, c, a) {
    const rd = a.rider; if (!rd) return;
    if (rd === "purge") return this.losePrimed(c, a.n);
    if (rd === "flux2") return this.gainFlux(c, 2, a.n);
    if (rd === "burning") this.condPC(c, "burning", { v: 2 * Math.ceil(e.T / 2) }); else this.condPC(c, rd);
  }
  losePrimed(c, why) { if (!c.primed.length) return; const p = c.primed.slice().sort((x, y) => this.surgeValue(c, x.sg) - this.surgeValue(c, y.sg))[0]; c.primed.splice(c.primed.indexOf(p), 1); this.log(`  ${why}: ${c.short} loses Primed ${p.sg.name}.`, "foe"); }
  die(c) { c.dead = true; c.down = false; c.hp = 0; c.rp.stats.deaths++; this.run.stats.deaths++; this.stats.deaths++; this.log(`✝ ${c.short} DIES.${this.run.hardcore ? "" : " (GRAFT will try to recover the body at the next Lockdown.)"}`, "dead"); if (this.active === c) { this.active = null; c.turnDone = true; } }
  // ---------------- the Enemy Phase (ch 6 + ch 10 traits; targeting and tactics follow tools/encounter_sim.py)
  enemyPhase() {
    if (this.phase === "won" || this.phase === "lost") return;
    this.phase = "enemy"; this.focus = {};
    this.log(`Enemy Phase`, "round");
    this.lingers.forEach(l => this.foesAll().filter(e => G.inCells(l.cells, e.pos)).forEach(e => { const src = this.pc(l.src); if (e && !e.dead && src) { const x = this.damageFoe(e, l.dmg, { src, psy: l.psy, area: true, quiet: true }); this.log(`${e.name} is still inside ${l.name}: ${x} damage${l.rider ? " and " + riderName(l.rider) : ""}.`, "pc"); if (l.rider && !e.dead) this.riderFoe(src, l.rider, e); } }));
    for (const e of this.foes.slice()) {
      if (e.dead || e.fled || e.hp <= 0) continue;
      if (!this.standing.length) break;
      if (e.boss) { for (const k of ["dazed", "held", "shaken", "blinded", "poisoned", "exposed", "prone", "burning"]) if (e.cond[k]) { delete e.cond[k]; this.log(`${e.name} shrugs off ${COND_NAME[k]}.`, "foe"); break; } }
      if (e.cond.burning) { const x = this.damageFoe(e, 2 * e.cond.burning, { area: true, type: "blaze", quiet: true }); this.log(`${e.name} burns for ${x}.`, "foe"); if (e.dead) continue; }
      if (e.tr.regen && !e.cond.noregen && e.hp < e.maxhp) { const h = Math.min(e.maxhp - e.hp, Math.round(e.tr.regen * (e.scale ? e.scale.hp : 1))); e.hp += h; if (h) this.log(`${e.name} regenerates ${h} HP.`, "foe"); }
      if (e.tr.surrender && e.hp <= e.maxhp / 2) { const r = die(6); if (r >= 4) { e.fled = true; this.log(`${e.name} throws down its weapon and surrenders (d6 ${r}).`, "kill"); continue; } }
      if (e.stagger) { e.stagger = false; this.log(`${e.name} is still recovering from its last blast.`, "foe"); continue; }
      e.moveLeft = this.speedSq(e);
      for (let i = 0; i < e.actions; i++) {
        if (e.cond.dazed && e.boss && i > 0) break;
        if (e.dead) break;
        this.enemyAction(e);
        if (!this.standing.length) break;
      }
      e.attacks.forEach(a => { if (a.recharge && !e.charge[a.n] && die(6) >= a.recharge) e.charge[a.n] = true; });
    }
    this.foes.forEach(e => { e.taunt = null; e.songTaunt = false; const keep = { shieldused: e.cond.shieldused }; if (e.cond.dominatedUntil) keep.dominatedUntil = e.cond.dominatedUntil; e.cond = keep; if (e.cond.dominatedUntil && e.cond.dominatedUntil <= this.round) { e.dominated = false; delete e.cond.dominatedUntil; } });
    // Down freelancers: Endure DC 10 at the end of each Enemy Phase
    this.pcs.forEach(c => { if (!c.down || c.dead) return; const r = d20(0), tot = r.v + c.def.endure;
      if (r.v === 20) { c.down = false; c.hp = 1; this.log(`${c.short} (Down) rolls a natural 20 and gets up with 1 HP!`, "heal"); }
      else if (r.v === 1 || tot < 10) { c.marks++; this.log(`${c.short} (Down) Endure ${r.v}${sgn(c.def.endure)}=${tot} vs 10: a Death mark (${c.marks}/3).`, "down"); if (c.marks >= 3) this.die(c); }
      else this.log(`${c.short} (Down) Endure ${r.v}${sgn(c.def.endure)}=${tot} vs 10: holding on.`, "pc"); });
    this.checkEnd();
  }
  interrupt() {
    for (const e of this.foesAlive()) {
      if (e.interrupts && !e.cond.nointerrupt && !e.cond.dazed && e.used < e.interrupts && this.standing.length) { const ev0 = this.events.length; e.moveLeft = 0; if (!this.planFoe(e, true)) continue; e.used++; this.ev({ t: "interrupt", id: e.id }); this.log(`${e.name} INTERRUPTS!`, "foe big"); this.enemyAction(e, true); this.lastInterrupt = this.events.slice(ev0); }
    }
  }
  enemyTarget(e) {
    const st = this.standing; if (!st.length) return null;
    if (e.taunt) { const t = this.pc(e.taunt); if (t && this.canAct(t)) return t; }
    if (e.tr.pack || e.tr.overwhelm || e.tr.flank) {
      let ft = this.focus.pack && this.pc(this.focus.pack);
      if (!ft || !this.canAct(ft)) { ft = rng() < 0.6 ? st.slice().sort((a, b) => a.hp + rng() * 10 - b.hp - rng() * 10)[0] : pick(st); this.focus.pack = ft.id; }
      return ft;
    }
    if ((e.boss || e.tr.smart) && rng() < 0.5) return st.slice().sort((a, b) => a.hp - b.hp)[0];
    return pick(st);
  }
  // can foe e use attack a on freelancer t from square n?
  foeCan(e, a, n, t) { const d = G.dist(n, t.pos); if (a.reach && d <= a.reach) return true; return !!a.range && d <= a.range && G.los(this.map, n, t.pos); }
  // the squares a foe's Area covers from square n aimed at square p
  foeArea(e, a, n, p) { const g = a.geo; if (g.type === "around") return G.burst(this.map, n, g.r); if (g.type === "burst") return G.burst(this.map, p, g.r); if (g.type === "cone") return G.cone(this.map, n, p, g.len); return G.burst(this.map, n, g.r || 2); }
  // where to stand and what to do this action (enemy tactics on the grid: engage, area attackers seek clusters,
  // packs flank, ranged keep their distance). Returns {a, t, n, aim, cells, path} or {path} (just close in) or null.
  planFoe(e, interrupt) {
    const up = this.standing; if (!up.length || !e.pos) return null;
    let ats = e.attacks.filter(a => !a.summon && !(a.recharge && !e.charge[a.n])); if (e.cond.dazed) ats = ats.filter(a => !a.special);
    const budget = interrupt ? 0 : Math.max(0, e.moveLeft || 0);
    const R = budget > 0 ? this.reach(e, false, budget) : new Map([[G.key(e.pos.x, e.pos.y), { x: e.pos.x, y: e.pos.y, cost: 0, prev: null }]]);
    const cells = [...R.values()], m = this.map;
    const single = ats.filter(a => !a.area), area = ats.filter(a => a.area);
    const pref = this.enemyTarget(e); const taunted = e.taunt && this.pc(e.taunt) && this.canAct(this.pc(e.taunt));
    const adjPC = n => up.filter(c => G.dist(c.pos, n) <= 1).length;
    let best = null; const consider = p => { if (!best || p.score > best.score) best = p; };
    // Areas: most freelancers caught, fewest friends
    for (const a of area) {
      if (e.tr.interference && this.focus.interf) continue;
      const g = a.geo;
      for (const n of cells) {
        const aims = g.type === "around" ? [n] : up.filter(t => g.type === "burst" ? G.dist(n, t.pos) <= (g.range || 12) && G.los(m, n, t.pos) : G.dist(n, t.pos) <= g.len).map(t => t.pos);
        for (const p of aims) {
          const fp = g.type === "cone" ? this.foeArea(e, a, n, p) : null;
          const inA = q => fp ? G.inCells(fp, q) : (G.dist(g.type === "around" ? n : p, q) <= g.r && G.los(m, g.type === "around" ? n : p, q));
          const caught = up.filter(c => inA(c.pos)); if (!caught.length) continue;
          const friends = this.foesAlive().filter(x => x !== e && x.pos && inA(x.pos));
          if (e.tr.bulky && friends.some(x => x.role !== "mook")) continue;
          if (caught.length < 2 && single.length) continue;
          consider({ a, n, aim: p, score: 10 * caught.length + 3 + (taunted && caught.some(c => c.id === e.taunt) ? 4 : 0) - (a.ff ? 4 * friends.length : 0) - 0.1 * n.cost });
        }
      }
    }
    // Single attacks
    const tg = taunted ? [this.pc(e.taunt)] : up;
    for (const a of single) for (const t of tg) {
      const val = a.dmg * (a.multi || 1) + (t === pref ? 6 : 0);
      for (const n of cells) {
        if (!this.foeCan(e, a, n, t)) continue;
        let sc = val - 0.1 * n.cost;
        if (a.reach === 0 || (!a.reach && a.range)) sc -= 3 * adjPC(n) - (n.cost === 0 ? 1 : 0);   // ranged: keep away from melee
        if (e.tr.flank && this.foesAlive().some(x => x !== e && x.pos && G.dist(x.pos, t.pos) <= 1)) sc += 1;
        consider({ a, t, n, score: sc });
      }
    }
    if (best) { const node = R.get(G.key(best.n.x, best.n.y)); best.path = node && node.cost ? G.pathOf(node) : null; best.cost = node ? node.cost : 0; if (best.a.area) best.cells = this.foeArea(e, best.a, best.n, best.aim); return best; }
    if (interrupt || this.speedSq(e) <= 0) return null;
    // nobody in reach: close in on the preferred target (or the nearest)
    const t = pref || up[0]; const want = Math.max(1, ...ats.map(a => a.reach || a.range || 1));
    const full = G.pathToward(m, e.pos, (x, y) => (this.free(x, y) || (x === e.pos.x && y === e.pos.y)) && G.dist({ x, y }, t.pos) <= want, this.passFor(e), 60);
    return { path: full, t, far: true };
  }
  // cut a path to what a mover can afford, ending on a free square
  trimPath(e, path, budget) {
    if (!path) return null; let p = path.slice(0, Math.min(path.length, budget + 1));
    while (p.length > 1 && !this.free(p[p.length - 1].x, p[p.length - 1].y)) p.pop();
    return p.length > 1 ? p : null;
  }
  summonAround(e, f) {
    const opts = []; for (let r = 1; r <= 4 && !opts.length; r++) for (let y = e.pos.y - r; y <= e.pos.y + r; y++) for (let x = e.pos.x - r; x <= e.pos.x + r; x++) if (this.free(x, y)) opts.push({ x, y });
    f.pos = opts.length ? opts.sort((a, b) => G.dist(a, e.pos) - G.dist(b, e.pos))[0] : null;
  }
  enemyAction(e, interrupt) {
    if (e.dead || !this.standing.length) return;
    if (e.dominated) {
      const o = this.foesAlive().filter(x => x !== e); if (!o.length) return; const a = e.attacks.find(x => !x.summon && !x.area) || e.attacks[0];
      const t = o.sort((p, q) => G.dist(p.pos, e.pos) - G.dist(q.pos, e.pos))[0];
      if (!interrupt && G.dist(t.pos, e.pos) > Math.max(1, a.reach || a.range || 1)) { const path = this.trimPath(e, G.pathToward(this.map, e.pos, (x, y) => this.free(x, y) && G.dist({ x, y }, t.pos) <= 1, this.passFor(e), 60), e.moveLeft || 0); if (path) { this.moveFoe(e, path); e.moveLeft -= path.length - 1; } }
      if (G.dist(t.pos, e.pos) <= Math.max(1, a.reach || a.range || 1)) { this.ev({ t: "atk", id: e.id, to: [t.id] }); const x = this.damageFoe(t, a.dmg, {}); this.log(`${e.name} (controlled) attacks ${t.name}: ${x} damage.`, "pc"); }
      else this.log(`${e.name} (controlled) closes on ${t.name}.`, "pc"); return;
    }
    if (e.tr.heal && !interrupt) { const hurt = this.foesAlive().filter(x => x !== e && x.role !== "mook" && x.hp < 0.6 * x.maxhp && G.dist(x.pos, e.pos) <= 6); if (hurt.length) { const t = hurt.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]; const h = Math.min(t.maxhp - t.hp, e.tr.heal); t.hp += h; this.ev({ t: "heal", id: t.id, n: h }); this.log(`${e.name} (Mender) knits ${t.name}'s wounds: +${h} HP.`, "foe"); return; } }
    if (e.tr.territorial && !interrupt) { const rv = this.foesAlive().filter(x => x !== e && x.tr.territorial && G.dist(x.pos, e.pos) <= 3); if (rv.length && rng() < e.tr.territorial) { const sa = e.attacks.filter(x => !x.area && !x.summon); const t = pick(rv); this.ev({ t: "atk", id: e.id, to: [t.id] }); const x = this.damageFoe(t, (sa[0] || e.attacks[0]).dmg, {}); this.log(`${e.name} turns on its rival ${t.name} (Territorial): ${x} damage.`, "foe"); return; } }
    const summ = !interrupt && !e.cond.dazed && e.attacks.find(a => a.summon && !(a.recharge && !e.charge[a.n]));
    if (summ) {
      const [tm, cnt, mx] = summ.summon; const cur = this.foesAll().filter(x => x.base === tm).length;
      if (cur < (summ.below || 2) && cur < mx && rng() < 0.6) {
        if (summ.recharge) e.charge[summ.n] = false;
        const k = Math.min(cnt, mx - cur); const tmpl = summ.tmpl || BY[tm]; let placed = 0;
        for (let i = 0; i < k; i++) { const f = makeFoe(tmpl, this.nextFoe++, { hp: 1, dmg: 1 }, `${tm} ${this.nextFoe}`); f.summoned = true; this.summonAround(e, f); if (!f.pos) break; this.foes.push(f); placed++; this.ev({ t: "summon", id: f.id }); }
        this.log(`${e.name} uses ${summ.n}: ${placed} ${tm}${placed === 1 ? "" : "s"} join${placed === 1 ? "s" : ""} the fight!`, "foe big"); return;
      }
    }
    const plan = this.planFoe(e, interrupt);
    if (!plan) { this.log(`${e.name} can't reach anyone.`, "foe dim"); return; }
    if (plan.far) {      // spend the move and this action (a Dash) closing in
      const path = this.trimPath(e, plan.path, (e.moveLeft || 0) + this.speedSq(e)); e.moveLeft = 0;
      if (path) { this.moveFoe(e, path); this.log(`${e.name} closes in on ${plan.t.short}${path.length - 1 > this.speedSq(e) ? " (Dash)" : ""}.`, "foe dim"); }
      else this.log(`${e.name} has no way through.`, "foe dim");
      return;
    }
    if (plan.path) { this.moveFoe(e, plan.path); e.moveLeft -= plan.cost; if (e.dead || !this.standing.length) return; }
    const a = plan.a;
    if (a.area) {
      if (a.recharge) e.charge[a.n] = false;
      if (e.tr.interference) this.focus.interf = true;
      const cells = this.foeArea(e, a, e.pos, plan.aim);
      const caught = this.pcs.filter(c => !c.dead && G.inCells(cells, c.pos)); if (!caught.length) { this.log(`${e.name}'s ${a.n} catches nobody.`, "foe dim"); return; }
      const extra = (a.extra || 0) * Math.min(2, caught.filter(c => this.canAct(c)).length - 1);
      this.ev({ t: "area", id: e.id, cells, to: caught.map(c => c.id) });
      this.log(`${e.name} unleashes ${a.n} (${a.shape || "Area"}${a.rng ? ", " + a.rng : ""}): ${caught.map(c => c.short).join(", ")} caught${extra ? ` · Engulf +${extra}` : ""}!`, "foe big");
      caught.forEach(c => this.hitPC(e, c, a, { area: true, extra }));
      if (a.ff) this.foesAlive().filter(x => x !== e && G.inCells(cells, x.pos)).forEach(x => { const d = this.damageFoe(x, a.dmg, { area: true }); this.log(`  Friendly fire: ${x.name} takes ${d}.`, "foe"); });
      if (a.stagger) e.stagger = true;
      return;
    }
    const tgt = plan.t; if (!this.canAct(tgt)) return;
    let adv = false, advWhy = "";
    if (e.tr.mimic && !e.mimicked) { adv = true; e.mimicked = true; advWhy = "Mimic ambush"; this.log(`${e.name} was never what it looked like — it strikes from hiding!`, "foe big"); }
    if (e.tr.flank && this.foesAlive().some(x => x !== e && x.tr.flank && G.dist(x.pos, tgt.pos) <= 1) && G.dist(e.pos, tgt.pos) <= 1) { adv = true; advWhy = advWhy || "Flanking"; }
    let extra = 0, tnb = 0;
    if (e.tr.pack) { const key = "pk" + tgt.id; const k = this.focus[key] || 0; const b = Math.min(k, e.tr.pack[2]); extra += e.tr.pack[1] * b; tnb = e.tr.pack[0] * b; this.focus[key] = k + 1; }
    if (e.tr.crowd) extra += Math.min(e.tr.crowd[1], e.tr.crowd[0] * this.foesAlive().filter(x => x !== e && G.dist(x.pos, tgt.pos) <= 2).length);
    this.ev({ t: "atk", id: e.id, to: [tgt.id] });
    if (tgt.mitosis && rng() < 0.35) { const r = d20(0), tot = r.v + tgt.def.dodge; if (r.v !== 1 && tot >= e.tn) this.log(`${e.name} lunges at ${tgt.short}'s Mitosis copy — it slips away (Dodge ${r.v}${sgn(tgt.def.dodge)}=${tot}).`, "foe"); else { tgt.mitosis = false; this.log(`${e.name} tears ${tgt.short}'s Mitosis copy apart.`, "foe"); } return; }
    this.hitPC(e, tgt, a, { adv, advWhy, extra, tnb });
    if (a.multi) this.standing.filter(c => c !== tgt && this.foeCan(e, a, e.pos, c)).sort((p, q) => G.dist(p.pos, e.pos) - G.dist(q.pos, e.pos)).slice(0, a.multi - 1).forEach(c => this.hitPC(e, c, a, { adv, advWhy }));
    if (e.tr.overwhelm && this.canAct(tgt)) { const key = "ow" + tgt.id; const k = (this.focus[key] || 0) + 1; this.focus[key] = k; if (k >= e.tr.overwhelm) { if (this.condPC(tgt, "prone")) { this.condPC(tgt, "held"); this.log(`  Overwhelmed: ${tgt.short} is dragged down (Prone and Held).`, "foe bad"); } } }
  }
  // ---------------- options a freelancer has right now (the UI and the auto-player both use this)
  jam() { return this.foesAlive().some(e => e.tr.jammer) ? 1 : 0; }
  costOf(c, sg, amped) {
    if (sg.wild === 11 || sg.wild === 12) return 0;
    if (amped || c.ffActive) return 0;
    if (sg.sig && c.emergeSig === c.sigs.indexOf(sg)) return 0;
    if (c.firstFree) return 0;
    if (sg.effect === "mend" && c.nodes.has("livingpharmacy")) return 0;
    return sg.flux + this.jam() + (c.flags.safemode ? 1 : 0);
  }
  bestWeapon(c, rangedOnly) { const w = c.weapons.filter(x => !x.launcher && (!rangedOnly || x.ranged)); return w.sort((a, b) => (b.atk * 1.5 + b.n * (b.s + 1) / 2 + b.k) - (a.atk * 1.5 + a.n * (a.s + 1) / 2 + a.k))[0] || null; }
  pickTarget(c, opt, list) { const fs = list || this.foesAlive(); if (!fs.length) return null; const avg = opt ? opt.n * (opt.s + 1) / 2 + opt.k : 5; const kill = fs.filter(e => e.hp <= avg); if (kill.length) return kill.sort((a, b) => (b.boss - a.boss) || b.hp - a.hp)[0]; return fs.slice().sort((a, b) => (a.tr.link ? a.hp * 3 : a.hp) - (b.tr.link ? b.hp * 3 : b.hp))[0]; }
  surgeValue(c, sg) { if (!sg) return 0; if (sg.infuse) return sg.effect === "mend" ? 12 : 8; return (sg.n || 0) * ((sg.s || 6) + 1) / 2 * (sg.area ? 1.6 : 1) + (sg.k || 0) + (sg.atk || 0) * 1.5 + (sg.rider ? 3 : 0) + (sg.wild ? 2 : 0); }
  // targets for an option: every candidate with ok / why, so the UI can grey out the ones out of range and say why
  tgtList(cands, test) { const all = cands.map(x => { const r = test(x) || { ok: false }; return { id: x.id, ok: !!r.ok, why: r.why || "", dis: !!r.dis }; }); return { all, targets: all.filter(x => x.ok).map(x => x.id) }; }
  inRange(c, r, los) { return x => { if (!x.pos || !c.pos) return { ok: false, why: "not on the map" }; const d = G.dist(c.pos, x.pos); if (d > r) return { ok: false, why: `out of range (${d * 5} ft, max ${r * 5} ft)` }; if (los !== false && d > 1 && !G.los(this.map, c.pos, x.pos)) return { ok: false, why: "no line of sight" }; return { ok: true }; }; }
  meleeReach(c) { return Math.max(1, ...c.weapons.filter(w => w.melee).map(w => w.reach || 1)); }
  // the Area spec for an option (shape + geo), or null
  areaOf(c, opt) {
    if (opt.sg && opt.sg.area) return opt.sg;
    if (opt.w && opt.w.launcher) return { name: opt.w.name, atk: opt.w.atk, n: opt.w.n, s: opt.w.s, k: opt.w.k, shape: "burst", type: "kinetic", twists: [], itemBurst: true, geo: { range: opt.w.range || 12, radius: 2 } };
    if (opt.item) return { name: RULES.ITEM[opt.item].name, atk: c.st.nerve + c.R, n: c.R, s: 6, k: 0, shape: "burst", twists: [], itemBurst: true, type: opt.item === "emp" ? "shock" : "kinetic", noDamage: opt.item === "flashbang", geo: { range: 6, radius: 2 } };
    if (opt.id === "scream") return { name: "Psychic Scream", atk: c.st.chutzpah + c.R, n: c.R + 1, s: 6, k: 0, shape: "pulse", twists: [], psy: true, rider: "shaken", type: "psychic", geo: { radius: 6 } };
    return null;
  }
  // the squares an Area option covers when aimed at "aim" (mode: cone | line for Waves) from square "from"
  optionCells(c, opt, aim, mode, from) {
    const sg = this.areaOf(c, opt); if (!sg) return []; from = from || c.pos;
    if (sg.geo && sg.geo.self) return G.burst(this.map, from, sg.geo.radius || 2);
    if (sg.shape === "pulse") return G.around(this.map, from, (sg.geo && sg.geo.radius) || 2);
    return this.areaCells(c, sg, aim, mode, from);
  }
  aimCheck(c, opt, aim, from) { const sg = this.areaOf(c, opt); if (!sg) return { ok: false, why: "not an Area" }; if (sg.geo && sg.geo.self) return { ok: true }; return this.aimOk(c, sg, aim, from); }
  // best aim for an Area from a square: most enemies, fewest friends (allies only Dodge for half, so they still count against)
  autoAim(c, opt, from) {
    from = from || c.pos; const sg = this.areaOf(c, opt); if (!sg) return null;
    const foes = this.foesAlive(), fixed = (sg.geo && sg.geo.self) || sg.shape === "pulse";
    const aims = []; if (fixed) aims.push({ aim: from });
    else if (sg.shape === "wave") foes.forEach(e => { if (G.dist(from, e.pos) <= ((sg.geo && sg.geo.line) || 6)) { aims.push({ aim: e.pos, mode: "cone" }); aims.push({ aim: e.pos, mode: "line" }); } });
    else foes.forEach(e => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) aims.push({ aim: { x: e.pos.x + dx, y: e.pos.y + dy } }); });
    let best = null; const seen = new Set();
    for (const a of aims) {
      const k = a.aim.x + "," + a.aim.y + (a.mode || ""); if (seen.has(k)) continue; seen.add(k);
      if (!fixed && !this.aimCheck(c, opt, a.aim, from).ok) continue;
      if (sg.shape === "wave" && !(a.mode === "line" ? G.dist(from, a.aim) <= ((sg.geo && sg.geo.line) || 6) : G.dist(from, a.aim) <= ((sg.geo && sg.geo.cone) || 3))) continue;
      const cells = this.optionCells(c, opt, a.aim, a.mode, from);
      const nf = foes.filter(e => G.inCells(cells, e.pos)), na = sg.shape === "pulse" || opt.id === "scream" ? [] : this.pcs.filter(x => !x.dead && x !== c && G.inCells(cells, x.pos)).concat(!(sg.geo && sg.geo.self) && G.inCells(cells, from) ? [c] : []);
      if (!nf.length) continue;
      const sc = nf.reduce((t, e) => t + 1 + (e.boss ? 0.5 : 0) + (e.hp < 8 ? 0.3 : 0), 0) - 0.9 * na.length;
      if (!best || sc > best.score) best = { aim: a.aim, mode: a.mode, cells, foes: nf, allies: na, score: sc };
    }
    return best;
  }
  options(c) {
    const out = []; if (!c || c.dead) return out;
    const hasteMode = this.haste && this.haste.to === c.id;
    if (!hasteMode && (this.phase !== "player" || this.active !== c)) return out;
    const t = hasteMode ? { actions: 1, quick: 0, unleashed: true, churned: true, used: {}, move: 0 } : c.t;
    const foes = this.foesAlive(), standing = this.standing, living = this.pcs.filter(x => !x.dead), notMe = standing.filter(x => x !== c);
    const E = (test) => this.tgtList(foes, test), Al = (list, r) => this.tgtList(list, x => x === c ? { ok: true } : this.inRange(c, r)(x));
    const A = (id, label, o) => out.push(Object.assign({ id, label, kind: "action", target: "enemy" }, o.target === "none" || o.target === "area" ? { targets: [], all: [] } : {}, o));
    const canA = t.actions > 0, canQ = t.quick > 0 && !c.cond.dazed;
    const sgOpt = sg => { const tg = surgeTarget(sg);
      if (sg.area) return { target: "area", geo: Object.assign({ shape: sg.shape }, sg.geo) };
      if (tg === "enemy") { if (sg.wild === 8) return Object.assign({ target: "enemy", geo: { teleport: 12 } }, E(e => { const d = G.dist(c.pos, e.pos); if (d > 13) return { ok: false, why: `out of range (${d * 5} ft, Phase Step 60 ft)` }; return this.phaseSpot(c, e) ? { ok: true } : { ok: false, why: "no free square beside it" }; }));
        return Object.assign({ target: "enemy", geo: Object.assign({}, sg.geo) }, E(e => this.canHit(c, sg, e))); }
      if (tg === "ally") { const r = (sg.geo && sg.geo.range) || 6; if (sg.wild === 6) return Object.assign({ target: "ally" }, Al(notMe.filter(a => a.primed.some(p => !p.sg.wild)), 99)); return Object.assign({ target: "ally", geo: { range: r } }, Al(sg.effect === "mend" ? living : sg.effect === "haste" ? notMe : standing, r)); }
      return { target: "none" };
    };
    if (c.cond.redmist && canA && !hasteMode) { const w = this.bestWeapon(c); A("redmist", `Red Mist: attack the nearest creature with ${w ? w.name : "fists"}`, { target: "none", detail: "Overload (Bloom 5): you must attack the nearest creature, friend or foe." }); A("end", "End turn", { kind: "free", target: "none" }); return out; }
    if (!hasteMode && t.move > 0 && this.speedSq(c) > 0) out.push({ id: "move", label: `Move (${t.move * 5} ft left)`, kind: "move", target: "move", targets: [], all: [], group: "Move", detail: `Speed ${c.speed} ft (${this.speedSq(c)} squares, diagonals count 1). Leaving an enemy's reach provokes an Opportunity Strike — move carefully (half speed) to slip away.${c.nodes.has("slipstream") ? " Slipstream: no Opportunity Strikes; you can move through enemies." : ""}` });
    if (canA) {
      c.weapons.forEach(w => { if (w.unarmed && c.weapons.length > 1) return; if (w.launcher && !(c.kit.launcher > 0)) return;
        const rangeTxt = w.melee ? `reach ${(w.reach || 1) * 5} ft${w.range ? ` or ${w.range * 5} ft` : ""}` : `${w.range * 5} ft (long ${w.range * 10} ft, disadvantage)`;
        const base = { w, group: "Attack", detail: `${sgn(w.atk)} · ${w.dmgTxt}${w.crit < 20 ? ` · Crit ${w.crit}–20` : ""} · ${rangeTxt}${w.launcher ? ` · Area · ${c.kit.launcher} shots left` : ""}${w.psy ? " · ignores Armor" : ""}`, geo: { reach: w.reach || 0, range: w.range || 0, long: !!w.range && !w.launcher } };
        if (w.launcher) A("atk:" + w.key, `Attack: ${w.name}`, Object.assign(base, { target: "area", geo: { shape: "burst", range: w.range || 12, radius: 2 } }));
        else A("atk:" + w.key, `Attack: ${w.name}`, Object.assign(base, E(e => this.canHit(c, w, e)))); });
      if (!hasteMode && !t.churned) {
        c.primed.forEach((p, i) => { const sg = p.sg; if (sg.wild === 12) return; const cost = this.costOf(c, sg, p.amped);
          A("un:" + i, `Unleash: ${sg.name}${p.amped ? " (Amped)" : ""}`, Object.assign({ group: "Surge", flux: cost, detail: surgeDetail(sg), over: c.flux + cost > c.limit, sg, amped: p.amped }, sgOpt(sg))); });
        c.sigs.forEach((sg, i) => { const cost = this.costOf(c, sg, false); if (c.sigUsed[sg.key]) return;
          A("sig:" + i, `Signature: ${sg.name}${cost === 0 ? " (free)" : ""}`, Object.assign({ group: "Surge", flux: cost, detail: surgeDetail(sg), over: c.flux + cost > c.limit, sg, signature: true }, sgOpt(sg))); });
      }
      if (!hasteMode && this.speedSq(c) > 0) A("dash", c.nodes.has("afterimage") ? "Dash (Afterimage)" : "Dash", { target: "none", group: "Move", detail: `Move again: +${this.speedSq(c) * 5} ft this turn.${c.nodes.has("afterimage") ? " Afterimage: Veiled until your next turn." : ""}` });
      if (!hasteMode) A("brace", "Brace", { target: "none", group: "Other", detail: "Advantage on every defense roll until your next turn." });
      A("help", "Help an ally", Object.assign({ target: "ally", group: "Other", geo: { range: 6 }, detail: "Within 30 ft: their next roll before your next turn has advantage." }, Al(notMe, 6)));
      if (c.kit.medkit > 0) A("patch", `Patch (Medkit: ${c.kit.medkit} charges)`, Object.assign({ target: "ally", group: "Items", geo: { range: 1 }, detail: `Touch. Gumption DC 10: Rank d6 + Gumption HP${c.rp.s.origin === "clinicrat" ? " + Rank" : ""}; stands a Down ally up.` }, Al(living, 1)));
      A("analyze", "Analyze", Object.assign({ group: "Other", geo: { range: 12 }, detail: `Within 60 ft, in sight. Gumption + Rank vs TN: learn its stats; it is Exposed${c.nodes.has("weakspot") ? " and its Armor stops working (Weak Spot)" : ""}.` }, E(this.inRange(c, 12))));
      A("taunt", "Taunt", Object.assign({ group: "Other", geo: { range: 12 }, detail: "Within 60 ft, in sight. Chutzpah + Rank vs TN: it must attack you in the next Enemy Phase." }, E(this.inRange(c, 12))));
      if (!c.flags.rallied) A("rally", "Rally", { target: "none", group: "Other", detail: `Chutzpah DC 13: every ally within 60 ft gains ${c.R + c.st.chutzpah} temporary HP. Once per combat.` });
      const mr = this.meleeReach(c);
      A("shove", "Shove (Prone)", Object.assign({ group: "Other", geo: { reach: mr }, detail: "Within reach. Grit + Rank vs Guard: knocked Prone (not Huge)." }, E(this.inRange(c, mr, false))));
      A("grapple", "Grapple (Held)", Object.assign({ group: "Other", geo: { reach: mr }, detail: "Within reach. Grit + Rank vs Guard: Held (speed 0)." }, E(this.inRange(c, mr, false))));
      ["frag", "flashbang", "emp"].forEach(k => { if (c.kit[k] > 0) A("item:" + k, `Throw ${RULES.ITEM[k].name} (${c.kit[k]})`, { item: k, group: "Items", target: "area", geo: { shape: "burst", range: 6, radius: 2 }, detail: RULES.ITEM[k].text + " (10-ft radius, within 30 ft)" }); });
      if (c.nodes.has("stimgland") && (c.rp.breather.stimgland || 0) < 2) A("stimgland", `Stim Gland${c.nodes.has("livingpharmacy") ? " (Living Pharmacy: + allies within 15 ft)" : ""}`, Object.assign({ target: "ally", group: "Items", geo: { range: 1 }, detail: `Touch. Rank d6 + Gumption HP, ends Burning/Poisoned. ${2 - (c.rp.breather.stimgland || 0)} left this Breather.` }, Al(living, 1)));
      if (c.nodes.has("panacea") && !c.flags.panacea) A("panacea", "Panacea", { target: "none", group: "Other", detail: "Once per combat: you and every ally within 30 ft regain (Rank+1)d8 + Gumption HP, end all conditions, lose 2 Flux. Down allies stand." });
      if (c.nodes.has("crownofwill") && !c.flags.crown) A("crown", "Crown of Will (Push)", Object.assign({ flux: 1, group: "Other", geo: { range: 12 }, detail: "Within 60 ft. Chutzpah + Rank vs TN: a non-Boss fights for you this combat; a Boss loses its next Interrupt and is Dazed." }, E(this.inRange(c, 12))));
      if (c.nodes.has("psychicscream") && !c.flags.scream) A("scream", "Psychic Scream", { target: "area", group: "Other", geo: { shape: "pulse", radius: 6 }, detail: `Once per combat: Chutzpah Area attack on every enemy within 30 ft: (Rank+1)d6 Psychic and Shaken.` });
      if (c.nodes.has("puppet")) A("puppet", "Puppet (Push)", Object.assign({ flux: 1, group: "Other", geo: { range: 12 }, detail: "Within 60 ft. Chutzpah + Rank vs TN of a non-Boss: it attacks another enemy in its reach." }, this.tgtList(foes, e => e.boss ? { ok: false, why: "Bosses can't be Puppeted" } : this.inRange(c, 12)(e))));
      if (c.nodes.has("intrude")) A("intrude", "Intrude", Object.assign({ group: "Other", geo: { range: 12 }, detail: "Within 60 ft. Gumption or Chutzpah + Rank vs TN: a Mook machine obeys you until the end of next round; any other machine is Dazed." }, this.tgtList(foes, e => !e.machine ? { ok: false, why: "not a machine" } : this.inRange(c, 12)(e))));
      if (c.nodes.has("sporecloud") && !c.flags.spore) A("sporecloud", "Spore Cloud (Push)", { flux: 1, target: "none", group: "Other", detail: "Once per combat: you and allies within 15 ft are Veiled until the end of next round." });
    }
    if (!hasteMode) {
      if (canQ) {
        const Q_ = (id, label, o) => out.push(Object.assign({ id, label, kind: "quick", target: "none", targets: [], all: [], group: "Quick" }, o));
        if (!t.unleashed) Q_("churn", `Churn${c.flags.rootAccess ? " (Root Access: choose the result)" : ""}`, { flux: 1, group: "Churn", detail: `Roll your d${c.die}: that Surge is Primed (doubles → Amped). No Unleash this turn.` });
        c.primed.forEach((p, i) => { if (p.sg.wild === 12) Q_("un:" + i, `Perfect Expression (Quick, 0 Flux)`, { detail: "Prime any two of your Surges as Amped.", sg: p.sg, group: "Surge" }); });
        if (c.kit.stim > 0) Q_("stim", `Stim (${c.kit.stim})`, { group: "Items", detail: `Regain Rank d6 HP.` });
        if (c.kit.damper > 0 && !c.flags.damper && c.flux > 0) Q_("damper", "Damper", { group: "Items", detail: "Lose 2 Flux. One per combat." });
        if (c.nodes.has("targetlock")) Q_("lock", "Target Lock", Object.assign({ target: "enemy", geo: { range: 24 }, detail: `Mark a creature you can see${c.nodes.has("thousandeyes") ? " (up to three)" : ""}: +1 damage die against it once per turn.` }, E(this.inRange(c, 24))));
        if (c.nodes.has("sirensong") && !c.rf.song) Q_("song", "Siren Song (mass Taunt)", Object.assign({ target: "ally", geo: { range: 6 }, detail: "Enemies within 30 ft: one Chutzpah + Rank roll vs each TN; they must attack the ally you name within 30 ft (or you), at −2 TN against them." }, Al(standing, 6)));
        if (c.nodes.has("menace")) Q_("menace", "Menace (Taunt with Grit)", Object.assign({ target: "enemy", geo: { range: 12 }, detail: "Within 60 ft. Grit + Rank vs TN; +2 to your defenses against it." }, E(this.inRange(c, 12))));
        if (c.nodes.has("commandingvoice") && !c.flags.rallied) Q_("rally", "Rally (Commanding Voice)", { detail: `Chutzpah DC 13: every ally within 60 ft gains ${c.R + c.st.chutzpah} temporary HP.` });
        if (c.nodes.has("analyzer") && !t.used.analyzer) Q_("analyze", "Analyze (Analyzer)", Object.assign({ target: "enemy", geo: { range: 12 } }, E(this.inRange(c, 12))));
        if (c.nodes.has("glamour")) Q_("glamour", "Glamour (Push)", { flux: 1, detail: "Veiled until the end of next round." });
        if (c.nodes.has("purge") && !c.flags.purge && c.flux > 0) Q_("purge", "Purge", { detail: `Lose ${c.R + 1} Flux and take that much damage. Once per combat.` });
        if (c.nodes.has("spotter") && !c.rf.spot) Q_("spotter", "Spotter", Object.assign({ target: "ally", geo: { range: 12 }, detail: "An ally within 60 ft has advantage on its next attack." }, Al(notMe, 12)));
        if (c.nodes.has("manyhands")) Q_("help", "Help (Many Hands)", Object.assign({ target: "ally", geo: { range: 6 } }, Al(notMe, 6)));
        const mr = this.meleeReach(c);
        if (c.nodes.has("shouldercheck") && !t.used.shoulder) { Q_("shove", "Shoulder Check: Shove", Object.assign({ target: "enemy", geo: { reach: mr } }, E(this.inRange(c, mr, false)))); Q_("grapple", "Shoulder Check: Grapple", Object.assign({ target: "enemy", geo: { reach: mr } }, E(this.inRange(c, mr, false)))); }
        if (c.nodes.has("antibodies") && !c.rp.breather.antibodies) Q_("antibodies", "Antibodies", Object.assign({ target: "ally", geo: { range: 1 }, detail: "End one condition on a creature you touch. Once per Breather." }, Al(standing, 1)));
        if (c.nodes.has("stimgland") && (c.rp.breather.stimgland || 0) < 2) Q_("stimgland", "Stim Gland (Push: Quick)", Object.assign({ flux: 1, target: "ally", geo: { range: 1 } }, Al(living, 1)));
        if (c.nodes.has("lightningstep") && t.unleashed && !t.used.lstep) { const w = this.bestWeapon(c); if (w) Q_("lstep", "Lightning Step", Object.assign({ target: "enemy", w, geo: { reach: w.reach || 0, range: w.range || 0 }, detail: "A weapon attack with half its damage dice." }, E(e => this.canHit(c, w, e)))); }
        if (c.rp.ravenous && c.kit.ration > 0) Q_("ration", "Eat a ration (cures Ravenous)", { group: "Items" });
      }
      if (c.nodes.has("overclock") && !c.rp.breather.overclock) out.push({ id: "overclock", label: "Overclock: take an extra Action (+1 Flux)", kind: "free", target: "none", targets: [], all: [], group: "Other", detail: "Once per Breather." });
      const bad = Object.keys(c.cond).filter(k => ["dazed", "held", "prone", "blinded", "shaken", "poisoned", "exposed", "burning", "redmist", "targeterr"].includes(k));
      if (c.juice > 0 && bad.length) out.push({ id: "shrug", label: `Shrug (1 Juice): end ${COND_NAME[bad[0]]}`, kind: "free", target: "none", targets: [], all: [], group: "Other" });
      out.push({ id: "end", label: "End turn", kind: "free", target: "none", targets: [], all: [], group: "End" });
    }
    return out;
  }
  // a free square next to e for Phase Step (closest to c)
  phaseSpot(c, e) { let best = null; for (const [dx, dy] of G.DIRS) { const x = e.pos.x + dx, y = e.pos.y + dy; if (!this.free(x, y)) continue; const d = G.dist(c.pos, { x, y }); if (d <= 12 && (!best || d < best.d)) best = { x, y, d }; } return best; }
  // ---------------- doing things
  check(c, stat, dc, knack, label) {
    let down = !!c.cond.shaken || !!c.rp.ravenous || (stat === "gumption" && (c.rp.s.injuries || []).includes("concussion"));
    let up = false; if (c.cond.helped) { up = true; delete c.cond.helped; } if (c.cond.linked) { up = true; delete c.cond.linked; }
    const r = d20(advOf(up, down)); const kn = knack && c.knacks.some(k => knack.test(k)) ? c.R : 0;
    const tot = r.v + c.st[stat] + kn, ok = r.v !== 1 && tot >= dc;
    this.log(`${c.short}: ${label} — ${RULES.STAT_NAME[stat]} ${r.txt}${sgn(c.st[stat])}${kn ? " +" + kn + " Knack" : ""}=${tot} vs ${dc}: ${ok ? "success" : "failure"}.`, "pc");
    return ok;
  }
  contest(c, stat, vs, label, tgt) {
    let down = !!c.cond.shaken, up = false; if (c.cond.helped) { up = true; delete c.cond.helped; } if (c.cond.linked) { up = true; delete c.cond.linked; }
    const r = d20(advOf(up, down)); const tot = r.v + c.st[stat] + c.R; const ok = r.v !== 1 && tot >= vs;
    this.log(`${c.short} → ${tgt ? tgt.name : ""}: ${label} — ${RULES.STAT_NAME[stat]} ${r.txt}${sgn(c.st[stat] + c.R)}=${tot} vs ${vs}: ${ok ? "success" : "failure"}.`, "pc");
    return ok;
  }
  perform(c, id, targetId, extra) {
    if (typeof c === "string") c = this.pc(c);
    const opts = this.options(c); const opt = opts.find(o => o.id === id);
    if (!opt) return { ok: false, msg: "That option isn't available right now." };
    const hasteMode = this.haste && this.haste.to === c.id;
    let tgt = null; extra = extra || {};
    if (opt.target === "move") { const r = this.movePC(c, extra.x, extra.y, !!extra.careful); if (r.ok) this.afterAct(c, c.t); return r; }
    if (opt.target === "enemy" || opt.target === "ally") {
      if (!targetId && opt.targets.length === 1) targetId = opt.targets[0];
      if (!opt.targets.includes(targetId)) { const w = (opt.all || []).find(x => x.id === targetId); return { ok: false, msg: w ? `Can't target that: ${w.why}.` : opt.targets.length ? "Choose a valid target." : "No target in range — move closer first." }; }
      tgt = this.byId(targetId);
      const w = (opt.all || []).find(x => x.id === targetId); if (w && w.dis) extra.dis = true;
    }
    if (opt.target === "area") {
      if (extra.aim) { const k = this.aimCheck(c, opt, extra.aim); if (!k.ok) return { ok: false, msg: `Can't aim there: ${k.why}.` }; extra.cells = this.optionCells(c, opt, extra.aim, extra.mode); }
      else { const b = this.autoAim(c, opt); if (b) { extra.aim = b.aim; extra.mode = b.mode; extra.cells = b.cells; } else extra.cells = this.optionCells(c, opt, c.pos, "cone"); }
    }
    const t = hasteMode ? { actions: 1, quick: 0, used: {}, unleashed: true, churned: true } : c.t;
    if (opt.kind === "action") t.actions--; else if (opt.kind === "quick") t.quick--;
    const adv = Object.assign(hasteMode ? { adv: true } : {}, extra.dis ? { dis: true, disWhy: ((opt.all || []).find(x => x.id === targetId) || {}).why || "long range" } : {});
    const ar = { cells: extra.cells, aim: extra.aim, mode: extra.mode };
    if (hasteMode) this.haste = null;
    const [verb, arg] = id.split(":");
    switch (verb) {
      case "atk": { const w = c.weapons.find(x => x.key === arg);
        if (w.launcher) { c.kit.launcher--; this.areaAttack(c, this.areaOf(c, opt), null, Object.assign({}, ar, adv)); break; }
        this.ev({ t: "atk", id: c.id, to: [tgt.id] });
        this.attack(c, w, tgt, adv);
        if (w.natural && c.nodes.has("flurry")) { const t2 = tgt.dead ? this.pickTarget(c, w, this.foesAlive().filter(e => this.canHit(c, w, e).ok)) : tgt; if (t2) { this.log(`  ${c.short}'s Flurry: a second strike.`, "pc"); this.attack(c, w, t2, { half: true }); } }
        break; }
      case "redmist": { delete c.cond.redmist; const w = c.weapons.filter(x => x.melee)[0] || this.bestWeapon(c) || c.weapons[0]; const all = this.foesAlive().concat(this.standing.filter(x => x !== c)).sort((a, b) => G.dist(a.pos, c.pos) - G.dist(b.pos, c.pos)); const tg = all[0]; if (!tg) break;
        if (G.dist(tg.pos, c.pos) > (w.reach || 1) && t.move > 0) { const p = G.pathToward(this.map, c.pos, (x, y) => this.free(x, y) && G.dist({ x, y }, tg.pos) <= 1, this.passFor(c), t.move); if (p && p.length > 1) { const e2 = p[p.length - 1]; this.movePC(c, e2.x, e2.y, false); } }
        if (c.down || c.dead) break; if (G.dist(tg.pos, c.pos) > Math.max(w.reach || 1, w.range || 0)) { this.log(`${c.short} sees red but can't reach ${tg.name || tg.short}.`, "over"); break; }
        this.log(`${c.short} sees red and attacks ${tg.name}!`, "over"); if (tg.side === "pc") this.attackAlly(c, w, tg); else this.attack(c, w, tg, { forced: true }); break; }
      case "un": case "sig": {
        const entry = verb === "un" ? c.primed[+arg] : { sg: c.sigs[+arg], amped: false, sig: true };
        this.unleash(c, entry, tgt, adv, ar); break; }
      case "brace": this.condPC(c, "braced"); this.log(`${c.short} braces (advantage on defense rolls until their next turn).`, "pc"); break;
      case "help": tgt.cond.helped = { round: this.round + 1 }; this.log(`${c.short} helps ${tgt.short}: advantage on their next roll.`, "pc"); break;
      case "patch": { c.kit.medkit--; const ok = this.check(c, "gumption", 10, KNACK_FOR.patch, `Patch ${tgt.short}`); const amt = ok ? roll(c.R, 6).t + c.st.gumption + (c.rp.s.origin === "clinicrat" ? c.R : 0) + (c.nodes.has("transmute") ? c.st.gumption : 0) : 1; this.heal(c, tgt, Math.max(1, amt), "Patch"); break; }
      case "analyze": { if (verb === "analyze" && opt.kind === "quick") t.used.analyzer = 1; if (this.contest(c, "gumption", tgt.tn, "Analyze", tgt)) { this.condFoe(tgt, "exposed"); tgt.revealed = true; if (c.nodes.has("weakspot")) { this.condFoe(tgt, "weakspot"); this.log(`  Weak Spot: ${tgt.name}'s Armor doesn't apply until its next turn ends.`, "pc"); } this.log(`  ${tgt.name}: Guard ${tgt.guard}, TN ${tgt.tn}, HP ${tgt.hp}/${tgt.maxhp}, Armor ${tgt.armor}. It is Exposed.`, "pc"); } break; }
      case "taunt": if (this.contest(c, "chutzpah", tgt.tn, "Taunt", tgt)) { tgt.taunt = c.id; this.log(`  ${tgt.name} must attack ${c.short} next Enemy Phase.`, "pc"); } break;
      case "menace": if (this.contest(c, "grit", tgt.tn, "Menace", tgt)) { tgt.taunt = c.id; this.log(`  ${tgt.name} must attack ${c.short} (+2 to ${c.short}'s defenses against it).`, "pc"); } break;
      case "rally": { c.flags.rallied = true; if (this.check(c, "chutzpah", 13, KNACK_FOR.rally, "Rally")) { const v = c.R + c.st.chutzpah; this.standing.filter(a => G.dist(a.pos, c.pos) <= 12).forEach(a => { if (a.flags.gotRally) return; a.flags.gotRally = true; if (v > a.tmp) a.tmp = v; }); this.log(`  Everyone who hears it gains ${v} temporary HP.`, "heal"); } break; }
      case "shove": case "grapple": { if (opt.kind === "quick") t.used.shoulder = 1; if (this.contest(c, "grit", this.guardOf(tgt), verb === "shove" ? "Shove" : "Grapple", tgt)) { const k = verb === "shove" ? "prone" : "held"; if (k === "prone" && tgt.tr.huge) this.log(`  ${tgt.name} is Huge: it doesn't go down.`, "pc"); else { this.condFoe(tgt, k); this.log(`  ${tgt.name} is ${COND_NAME[k]}.`, "pc"); } } break; }
      case "item": { c.kit[arg]--; const sg = this.areaOf(c, opt);
        this.areaAttack(c, sg, null, Object.assign({}, ar, { riders: arg === "flashbang" ? ["blinded"] : [], onHit: arg === "emp" ? (e => { if (e.machine) { this.condFoe(e, "dazed"); this.log(`  ${e.name}'s circuits seize: Dazed.`, "pc"); } }) : null })); break; }
      case "stimgland": { c.rp.breather.stimgland = (c.rp.breather.stimgland || 0) + 1; if (opt.kind === "quick") this.gainFlux(c, 1, "Stim Gland Push");
        const who = c.nodes.has("livingpharmacy") ? [c].concat(this.neighbours(c, 3), tgt).filter((x, i, a) => x && !x.dead && a.indexOf(x) === i) : [tgt];
        who.forEach(a => { this.heal(c, a, roll(c.R, 6).t + c.st.gumption + (c.nodes.has("transmute") ? c.st.gumption : 0), "Stim Gland"); delete a.cond.burning; delete a.cond.poisoned; }); break; }
      case "panacea": { c.flags.panacea = true; this.log(`${c.short}'s blood turns to medicine: PANACEA.`, "heal"); this.pcs.filter(a => !a.dead && (a === c || this.within(c, a, 6))).forEach(a => { this.heal(c, a, roll(c.R + 1, 8).t + c.st.gumption, "Panacea"); a.cond = {}; a.flux = Math.max(0, a.flux - 2); }); break; }
      case "crown": { c.flags.crown = true; this.gainFlux(c, 1, "Crown of Will Push"); if (this.contest(c, "chutzpah", tgt.tn, "Crown of Will", tgt)) { if (tgt.boss) { tgt.cond.nointerrupt = true; this.condFoe(tgt, "dazed"); this.log(`  ${tgt.name} reels: loses its next Interrupt and is Dazed.`, "pc"); } else { tgt.dominated = true; this.log(`  ${tgt.name} now fights for the freelancers.`, "crit"); } } break; }
      case "scream": { c.flags.scream = true; this.areaAttack(c, this.areaOf(c, opt), null, Object.assign({}, ar, { foesOnly: true })); break; }
      case "puppet": { this.gainFlux(c, 1, "Puppet Push"); if (this.contest(c, "chutzpah", tgt.tn, "Puppet", tgt)) { const a2 = tgt.attacks.find(x => !x.summon && !x.area) || tgt.attacks.find(x => !x.summon); const o2 = a2 && this.foesAlive().filter(x => x !== tgt && G.dist(x.pos, tgt.pos) <= Math.max(1, a2.reach || 0, a2.range || 0)).sort((a, b) => a.hp - b.hp)[0]; if (o2 && a2) { const x = this.damageFoe(o2, a2.dmg, { src: c }); this.log(`  ${tgt.name} turns and hits ${o2.name} with ${a2.n}: ${x}.`, "pc"); } else this.log(`  ${tgt.name} has nobody else to hit.`, "pc"); } break; }
      case "intrude": { const st = c.st.gumption >= c.st.chutzpah ? "gumption" : "chutzpah"; if (this.contest(c, st, tgt.tn, "Intrude", tgt)) { if (tgt.role === "mook") { tgt.dominated = true; tgt.cond.dominatedUntil = this.round + 1; this.log(`  ${tgt.name} obeys ${c.short} until the end of next round.`, "pc"); } else { this.condFoe(tgt, "dazed"); this.log(`  ${tgt.name} is Dazed.`, "pc"); } } break; }
      case "sporecloud": { c.flags.spore = true; this.gainFlux(c, 1, "Spore Cloud Push"); this.standing.filter(a => G.dist(a.pos, c.pos) <= 3).forEach(a => a.cond.veiled = { round: this.round + 1 }); this.log(`${c.short} exhales a Spore Cloud: everyone within 15 ft is Veiled until the end of next round.`, "pc"); break; }
      case "dash": t.move += this.speedSq(c); if (c.nodes.has("afterimage")) { c.cond.veiled = { at: c.turnNo + 1 }; this.log(`${c.short} Dashes and leaves an Afterimage (Veiled until their next turn).`, "pc"); } else this.log(`${c.short} Dashes (+${this.speedSq(c) * 5} ft).`, "pc"); break;
      case "churn": this.churn(c, extra && extra.slot); break;
      case "stim": { c.kit.stim--; this.heal(c, c, roll(c.R, 6).t, "Stim"); break; }
      case "damper": { c.kit.damper--; c.flags.damper = true; c.flux = Math.max(0, c.flux - 2); this.log(`${c.short} uses a Damper: Flux ${c.flux}/${c.limit}.`, "pc"); break; }
      case "lock": { const max = c.nodes.has("thousandeyes") ? 3 : 1; c.lock = (c.lock || []).filter(x => x !== tgt.id && this.foe(x) && !this.foe(x).dead); c.lock.push(tgt.id); if (c.lock.length > max) c.lock.shift(); this.log(`${c.short} Target Locks ${tgt.name}.`, "pc"); break; }
      case "song": { c.rf.song = 1; const named = tgt; const r = d20(c.cond.shaken ? -1 : 0), tot = r.v + c.st.chutzpah + c.R; this.log(`${c.short}'s Siren Song (${r.txt}${sgn(c.st.chutzpah + c.R)}=${tot}): enemies within 30 ft must go for ${named.short}.`, "pc");
        this.foesAlive().filter(e => this.within(c, e, 6)).forEach(e => { if (r.v !== 1 && tot >= e.tn) { e.taunt = named.id; e.songTaunt = true; this.log(`  ${e.name} (TN ${e.tn}) is Taunted.`, "pc"); } else this.log(`  ${e.name} (TN ${e.tn}) resists.`, "pc"); }); break; }
      case "glamour": this.gainFlux(c, 1, "Glamour Push"); c.cond.veiled = { round: this.round + 1 }; this.log(`${c.short} is Veiled (Glamour).`, "pc"); break;
      case "purge": { c.flags.purge = true; const x = Math.min(c.flux, c.R + 1); c.flux -= x; this.log(`${c.short} Purges ${x} Flux and takes ${x} damage.`, "pc"); this.harmPC(c, x, { noTemp: true }); break; }
      case "spotter": c.rf.spot = 1; tgt.cond.spotted = { round: this.round + 1 }; this.log(`${c.short} spots for ${tgt.short}: advantage on their next attack.`, "pc"); break;
      case "antibodies": { c.rp.breather.antibodies = true; const k = ["dazed", "poisoned", "blinded", "shaken", "held", "burning", "exposed", "prone"].find(x => tgt.cond[x]); if (k) { delete tgt.cond[k]; this.log(`${c.short}'s Antibodies end ${tgt.short}'s ${COND_NAME[k]}.`, "pc"); } else this.log(`${c.short}'s Antibodies: nothing to cure.`, "pc"); break; }
      case "lstep": { t.used.lstep = 1; const w = opt.w; if (w) { this.log(`${c.short}'s Lightning Step:`, "pc"); this.attack(c, w, tgt, Object.assign({ half: true }, adv)); } break; }
      case "ration": c.kit.ration--; c.rp.ravenous = false; this.log(`${c.short} wolfs down a ration. No longer Ravenous.`, "pc"); break;
      case "overclock": c.rp.breather.overclock = true; t.actions++; this.gainFlux(c, 1, "Overclock"); this.log(`${c.short} Overclocks: one extra Action this turn.`, "pc"); break;
      case "shrug": { const k = Object.keys(c.cond).find(x => ["dazed", "held", "prone", "blinded", "shaken", "poisoned", "exposed", "burning", "redmist", "targeterr"].includes(x)); c.juice--; c.rp.juice = c.juice; delete c.cond[k]; if (k === "dazed" && t.quick === 0 && !t.qspent) t.quick = 1; this.log(`${c.short} spends 1 Juice to shrug off ${COND_NAME[k]}.`, "pc"); break; }
      case "end": this.endTurn(c); return { ok: true };
    }
    if (opt.kind === "quick") t.qspent = true;
    if (this.checkEnd()) return { ok: true };
    if (hasteMode) return { ok: true };
    if (c.down || c.dead) { if (this.active === c || c.turnDone) { this.active = c; this.endTurn(c); } return { ok: true }; }
    this.afterAct(c, t);
    return { ok: true };
  }
  // a turn ends by itself once nothing is left (no Action, no Quick, no movement)
  afterAct(c, t) {
    if (this.checkEnd()) return;
    if (c.down || c.dead) { if (this.active === c) this.endTurn(c); return; }
    if (this.active === c && !this.haste && t.actions <= 0 && (t.quick <= 0 || c.cond.dazed) && (t.move <= 0 || this.speedSq(c) <= 0) && !this.options(c).some(o => o.id === "overclock" || o.id === "shrug")) this.endTurn(c);
  }
  churn(c, slot) {
    c.t.churned = true; this.gainFlux(c, 1, "Churn");
    let r = die(c.die); if (c.flags.rootAccess) { c.flags.rootAccess = false; if (slot) r = clamp(slot | 0, 1, c.die); else { const best = c.surges.map((s, i) => [this.surgeValue(c, s), i + 1]).sort((a, b) => b[0] - a[0])[0]; if (best) r = best[1]; } this.log(`${c.short} uses Root Access to choose ${r}.`, "pc"); }
    this.log(`${c.short} Churns: d${c.die} → ${r}.`, "pc"); this.primeRoll(c, r);
  }
  unleash(c, entry, tgt, adv, extra) {
    const sg = entry.sg, amped = entry.amped, cost = this.costOf(c, sg, amped);
    const sigIdx = entry.sig ? c.sigs.indexOf(sg) : -1;
    if (entry.sig) { c.sigUsed[sg.key] = true; if (c.emergeSig === sigIdx) c.emergeSig = null; }
    else c.primed.splice(c.primed.indexOf(entry), 1);
    if (c.firstFree && !amped) c.firstFree = false;
    if (c.t) c.t.unleashed = true;
    c.rp.stats.surges++;
    this.log(`${c.short} Unleashes ${sg.name}${entry.sig ? " (Signature)" : ""}${amped ? " — Amped" : ""}: ${cost} Flux (${c.flux + cost}/${c.limit}).`, "pc surge");
    this.gainFlux(c, cost, sg.name);
    if (c.down || c.dead) return;
    if (sg.wild) return this.unleashWild(c, sg, tgt, adv, extra);
    if (sg.infuse) return this.infuse(c, sg, tgt);
    if (sg.area) return this.areaAttack(c, sg, tgt, Object.assign({}, extra || {}, adv));
    this.ev({ t: "atk", id: c.id, to: [tgt.id] });
    const res = this.attack(c, sg, tgt, adv);
    if (!res.hit && (sg.shape === "strike" || sg.shape === "bolt") && !entry.sig) { c.primed.push({ sg, amped }); this.log(`  ${sg.name} missed but stays Primed${amped ? " (still Amped)" : ""}.`, "pc"); }
    if (res.hit && sg.twists.includes("chain")) { const o2 = this.foesAlive().filter(e => e !== tgt && tgt.pos && G.dist(e.pos, tgt.pos) <= 3 && G.los(this.map, tgt.pos, e.pos)); if (o2.length) { const t2 = this.pickTarget(c, sg) === tgt ? pick(o2) : (o2.includes(this.pickTarget(c, sg)) ? this.pickTarget(c, sg) : pick(o2)); this.log(`  Chain → ${t2.name}:`, "pc"); this.attack(c, sg, t2, { half: true, label: sg.name + " (Chain)" }); } }
  }
  infuse(c, sg, tgt) {
    tgt = tgt || c; const extraT = sg.twists.includes("sure") ? this.standing.filter(a => a !== tgt && (sg.effect !== "haste" || a !== c) && G.dist(a.pos, c.pos) <= ((sg.geo && sg.geo.range) || 6)).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] : null;
    const targets = [tgt].concat(extraT ? [extraT] : []);
    targets.forEach(a => {
      switch (sg.effect) {
        case "mend": this.heal(c, a, roll(c.R + 1, 8).t + c.st.gumption + (c.nodes.has("transmute") ? c.st.gumption : 0), "Mend"); delete a.cond.burning; delete a.cond.poisoned; break;
        case "shell": { const v = roll(c.R + 1, 6).t + c.st.grit; if (v > a.tmp) a.tmp = v; a.cond.shell = { round: this.round + 1 }; this.log(`  ${a.short} gains ${v} temporary HP and +1 Armor (Shell) until the end of next round.`, "heal"); break; }
        case "veil": a.cond.veiled = { round: this.round + 1 }; this.log(`  ${a.short} is Veiled until the end of next round.`, "pc"); break;
        case "link": { const grp = [a].concat(this.standing.filter(x => x !== a && G.dist(x.pos, a.pos) <= 6).slice(0, c.R)); grp.forEach(x => x.cond.linked = { round: this.round + 1 }); this.log(`  Linked: ${grp.map(x => x.short).join(", ")} get advantage on their next d20.`, "pc"); break; }
        case "haste": if (a !== c && this.canAct(a)) { this.haste = { from: c.id, to: a.id }; this.log(`  ${a.short} is Hasted: an immediate Action (not Unleash) with advantage.`, "pc"); } break;
      }
    });
  }
  unleashWild(c, sg, tgt, adv, extra) {
    extra = extra || {};
    switch (sg.wild) {
      case 2: return this.areaAttack(c, sg, tgt, Object.assign({ cells: G.burst(this.map, c.pos, 2), excludeSelf: true }, adv));
      case 3: { const ts = [tgt].concat(shuffle(this.foesAlive().filter(e => e !== tgt && this.canHit(c, sg, e).ok)).slice(0, 2)); ts.forEach(e => { if (!e.dead) this.attack(c, sg, e, adv); }); this.condPC(c, "dazed"); this.log(`  ${c.short} is Dazed by the backlash.`, "pc"); return; }
      case 4: [c].concat(this.neighbours(c, 2).filter(x => this.canAct(x))).forEach(a => { const v = roll(c.R + 1, 6).t + c.st.grit; if (v > a.tmp) a.tmp = v; a.cond.shell = { round: this.round + 1 }; this.log(`  ${a.short} hardens: ${v} temporary HP, +1 Armor.`, "heal"); }); return;
      case 5: { this.attack(c, sg, tgt, adv); const d = roll(c.R, 6); this.log(`  Blood Price: ${c.short} pays ${d.t} HP.`, "pc bad"); this.harmPC(c, d.t, { noTemp: true }); return; }
      case 6: { const al = tgt && tgt.side === "pc" ? tgt : this.standing.find(a => a !== c && a.primed.some(p => !p.sg.wild)); const p = al && al.primed.filter(x => !x.sg.wild).sort((a, b) => this.surgeValue(al, b.sg) - this.surgeValue(al, a.sg))[0];
        if (!p) { this.log(`  Echo: no ally has a Surge Primed to copy. It fizzles.`, "pc"); return; }
        const cp = Object.assign({}, p.sg, { name: "Echo of " + p.sg.name }); this.log(`  Echo copies ${al.short}'s ${p.sg.name}.`, "pc");
        if (cp.infuse) return this.infuse(c, cp, cp.effect === "mend" ? this.pcs.filter(x => !x.dead).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] : c === al ? this.standing.find(x => x !== c) : al);
        if (cp.area) { const b = this.autoAim(c, { sg: cp }); if (!b) { this.log(`  Echo: nothing in reach of ${cp.name}.`, "pc"); return; } return this.areaAttack(c, cp, null, Object.assign({ cells: b.cells }, adv)); }
        const ft = this.pickTarget(c, cp, this.foesAlive().filter(e => this.canHit(c, cp, e).ok)); if (!ft) { this.log(`  Echo: nobody in range of ${cp.name}.`, "pc"); return; } return void this.attack(c, cp, ft, adv); }
      case 7: c.mitosis = true; this.log(`  A shuddering copy of ${c.short} peels away and joins the fight.`, "pc"); return;
      case 8: { const sp = this.phaseSpot(c, tgt); if (sp) { this.ev({ t: "move", id: c.id, path: [c.pos, { x: sp.x, y: sp.y }], blink: true }); c.pos = { x: sp.x, y: sp.y }; } this.log(`  ${c.short} blinks across the room.`, "pc"); return void this.attack(c, sg, tgt, adv); }
      case 9: return this.areaAttack(c, sg, tgt, Object.assign({}, extra, { riders: ["prone", "held"] }, adv));
      case 10: return this.areaAttack(c, sg, tgt, Object.assign({ cells: G.around(this.map, c.pos, 4) }, adv));
      case 11: { c.flux = 0; this.heal(c, c, roll(c.R, 8).t, "Flush"); this.log(`  Flux flushed to 0.`, "pc"); return; }
      case 12: { const best = c.surges.slice().sort((a, b) => this.surgeValue(c, b) - this.surgeValue(c, a)).slice(0, 2); best.forEach(s2 => { const have = c.primed.find(p => p.sg.key === s2.key); if (have) have.amped = true; else c.primed.push({ sg: s2, amped: true }); }); this.log(`  Perfect Expression: ${best.map(x => x.name).join(" and ")} Primed and Amped.`, "crit"); return; }
    }
  }
}

/* ------------------------------------------------------------------ helpers used by the Fight */
function scaledSummon(t, sc) { const y = clone(t); y.hp = Math.max(1, Math.round(y.hp * 1)); y.attacks.forEach(a => a.dmg = Math.max(1, Math.round(a.dmg * sc.dmg))); return y; }
function riderName(r) { return { purge: "loses a Primed Surge", flux2: "+2 Flux" }[r] || COND_NAME[r] || r; }
function surgeTarget(sg) { if (sg.wild === 4 || sg.wild === 7 || sg.wild === 11 || sg.wild === 12) return "none"; if (sg.wild === 6) return "ally"; if (sg.infuse) return "ally"; return "enemy"; }
function surgeDetail(sg) {
  if (sg.wild) return sg.text;
  if (sg.infuse) return (RULES.EFFECT[sg.effect] || {}).name + " · " + (sg.line || "");
  return `${sgn(sg.atk)} · ${sg.n}d${sg.s}${sg.k ? sgn(sg.k) : ""} ${sg.psy ? "Psychic" : sg.type}${sg.rider ? " · " + COND_NAME[sg.rider] : ""}${sg.area ? " · Area (" + sg.shape + ")" : sg.melee ? " · melee" : " · ranged"}${sg.twists.length ? " · " + sg.twists.map(t => RULES.TWIST[t].name).join(", ") : ""}`;
}
let _wid = 0;
function wildSurge(c, w) {
  const R = c.R, st = c.st, best = (...k) => Math.max(...k.map(x => st[x]));
  const base = { key: "W" + (++_wid), wild: w, name: "Wild: " + WILD[w], twists: [], flux: 1, area: false, melee: false, infuse: false, rider: null, psy: false, type: "kinetic", crit: 20 };
  const T = {
    2: { shape: "burst", effect: "toxin", area: true, atk: best("nerve", "gumption") + R, n: R + 3, s: c.nodes.has("catalyst") ? 8 : 6, k: 0, rider: "poisoned", type: "toxin", text: "Burst + Toxin with +2 dice centred on you (you're unaffected); neighbours Dodge." },
    3: { shape: "bolt", effect: "shock", atk: best("nerve", "moxie") + R, n: R + 1, s: 8, k: best("nerve", "moxie"), rider: "dazed", type: "shock", crit: c.critR, text: "Bolt + Shock at up to three targets, full damage. You're Dazed afterwards." },
    4: { shape: "infuse", infuse: true, text: "Shell on you and your neighbours." },
    5: { shape: "strike", effect: "kinetic", melee: true, atk: best("grit", "moxie") + R, n: R + 4, s: 10, k: best("grit", "moxie"), text: "Strike + Kinetic with +2 more dice. You take Rank d6 (ignores Armor)." },
    6: { shape: "echo", text: "Copy an ally's Primed Surge (choose the ally)." },
    7: { shape: "infuse", infuse: true, text: "A copy of you makes a weapon attack at the end of each of your turns this fight." },
    8: { shape: "strike", effect: "kinetic", melee: true, atk: best("grit", "moxie") + R, n: R + 2, s: 10, k: best("grit", "moxie"), text: "Teleport, then Strike + Kinetic." },
    9: { shape: "burst", effect: "quake", area: true, atk: st.nerve + R, n: R + 1, s: c.nodes.has("catalyst") ? 8 : 6, k: 0, type: "kinetic", text: "Burst with both Prone and Held riders." },
    10: { shape: "pulse", effect: "dread", area: true, atk: best("grit", "chutzpah") + R, n: R + 1, s: 6, k: 0, rider: "shaken", psy: true, type: "psychic", flux: 2, text: "Pulse + Dread with a 20-ft radius. 2 Flux." },
    11: { shape: "infuse", infuse: true, flux: 0, text: "0 Flux: Flux to 0, regain Rank d8 HP." },
    12: { shape: "infuse", infuse: true, flux: 0, text: "Quick, 0 Flux: Prime your two best Surges as Amped." }
  }[w];
  const o = Object.assign(base, T);
  o.geo = w === 2 ? { self: true, radius: 2 } : w === 10 ? { radius: 4 } : w === 8 ? { teleport: 12, reach: 1 } : w === 3 ? { range: 12 } : surgeGeo(o.shape, [], c);
  return o;
}
function boostStat(c, stat, by) {
  c.st[stat] += by;
  const upd = o => { if (o.stat === stat || (o.atk != null && o.statGuess === stat)) { o.atk += by; if (o.k != null && (o.shape === "strike" || o.shape === "bolt" || !o.shape)) o.k += by; } };
  c.weapons.forEach(w => { const d = RULES.derive(c.rp.s).gear.attacks.find(a => a.name === w.name); if (d && d.stat === stat) { w.atk += by; w.k += by; } });
  c.surges.concat(c.sigs).forEach(s => { if (s.stat === stat && s.atk != null) { s.atk += by; if (s.shape === "strike" || s.shape === "bolt") s.k += by; } });
  if (stat === "moxie") c.def.dodge += by; if (stat === "grit") { c.def.endure += by; c.maxhp += 2 * by; c.hp += 2 * by; } if (stat === "nerve") { c.def.resist += by; c.limit += by; }
}

/* ------------------------------------------------------------------ auto-play (tests, "Auto" button, and "Auto-battle") */
// Heuristics follow tools/encounter_sim.py: heal the fallen, spend Flux only below the Limit, Amped first, Areas into crowds.
function hitP(atk, guard) { return clamp((21 - (guard - atk)) / 20, 0.05, 0.95); }
function aiChoose(F, c, opts) {
  const has = id => opts.find(o => o.id === id);
  if (has("redmist")) return { id: "redmist" };
  const sh = has("shrug"); if (sh && (c.cond.dazed || c.cond.held || c.cond.blinded || c.cond.redmist || c.cond.targeterr)) return { id: "shrug" };
  const foes = F.foesAlive(); if (!foes.length) return { id: "end" };
  const fits = o => !o.over;
  const low = F.pcs.filter(x => !x.dead && (x.down || x.hp / x.maxhp < 0.35)).sort((a, b) => (b.down - a.down) || a.hp / a.maxhp - b.hp / b.maxhp);
  const action = opts.filter(o => o.kind === "action"), quick = opts.filter(o => o.kind === "quick");
  const okT = (o, t) => t && o.targets.includes(t.id);
  const inR = o => (o.targets || []).map(id => F.foe(id)).filter(e => e && !e.dead);
  // 1. healing
  if (low.length) {
    for (const o of action.concat(quick)) { if (o.sg && o.sg.effect === "mend" && fits(o) && okT(o, low[0])) return { id: o.id, target: low[0].id }; }
    const sgl = action.find(o => o.id === "stimgland") || quick.find(o => o.id === "stimgland" && c.flux + 1 < c.limit); if (sgl && okT(sgl, low[0])) return { id: sgl.id, target: low[0].id };
    const pn = has("panacea"); if (pn && low.length >= 2) return { id: "panacea" };
    const pt = has("patch"); if (pt && (low[0].down || low[0].hp / low[0].maxhp < 0.25) && okT(pt, low[0])) return { id: "patch", target: low[0].id };
  }
  // 2. quick actions
  if (quick.length) {
    const pe = quick.find(o => o.sg && o.sg.wild === 12); if (pe) return { id: pe.id };
    const goodPrimed = c.primed.some(p => !p.sg.infuse && F.costOf(c, p.sg, p.amped) + c.flux <= c.limit) || c.sigs.some(s => !c.sigUsed[s.key] && !s.infuse && F.costOf(c, s, false) + c.flux <= c.limit);
    if (has("churn") && !goodPrimed && c.flux + 2 <= c.limit && c.surges.length) return { id: "churn" };
    if (has("stim") && c.hp / c.maxhp < 0.5) return { id: "stim" };
    if (has("damper") && c.flux >= c.limit - 1) return { id: "damper" };
    if (has("ration")) return { id: "ration" };
    const lk = has("lock"); if (lk && !(c.lock || []).some(id => F.foe(id) && !F.foe(id).dead)) { const t = F.pickTarget(c, F.bestWeapon(c), inR(lk)); if (t) return { id: "lock", target: t.id }; }
    const mn = has("menace"); if (mn && c.hp / c.maxhp > 0.6) { const t = inR(mn).sort((a, b) => b.hp - a.hp)[0]; if (t && !t.taunt) return { id: "menace", target: t.id }; }
    const sg = has("song"); if (sg && foes.length >= 2) { const tank = F.standing.slice().sort((a, b) => (b.hp + 6 * b.armor) - (a.hp + 6 * a.armor))[0]; if (okT(sg, tank)) return { id: "song", target: tank.id }; }
    const rl = quick.find(o => o.id === "rally"); if (rl && F.standing.length >= 3) return { id: "rally" };
    const az = quick.find(o => o.id === "analyze"); if (az && inR(az).some(e => e.boss || e.centre)) return { id: "analyze", target: inR(az).find(e => e.boss || e.centre).id };
    const sp = has("spotter"); if (sp && sp.targets.length) { const t = F.standing.filter(x => x !== c && sp.targets.includes(x.id)).sort((a, b) => (F.bestWeapon(b) || { atk: 0 }).atk - (F.bestWeapon(a) || { atk: 0 }).atk)[0]; if (t) return { id: "spotter", target: t.id }; }
    const ls = has("lstep"); if (ls) { const t = F.pickTarget(c, ls.w, inR(ls)); if (t) return { id: "lstep", target: t.id }; }
  }
  if (!action.length) { if (has("overclock") && foes.length && c.flux + 2 <= c.limit && c.t && c.t.unleashed === false) return { id: "overclock" }; return { id: "end" }; }
  // 3. the best Action by a rough expected-damage score
  let best = null; const consider = (o, target, v) => { if (!best || v > best.v) best = { id: o.id, target: target ? target.id : undefined, v }; };
  const n = foes.length;
  action.forEach(o => {
    if (o.id.startsWith("atk:")) { const w = o.w;
      if (w.launcher) { const b = F.autoAim(c, o); if (!b || b.score < 1.5) return; consider(o, null, (w.n * (w.s + 1) / 2 + w.k) * 0.6 * b.score - 3); return; }
      const t = F.pickTarget(c, w, inR(o)); if (!t) return; const dis = (o.all.find(x => x.id === t.id) || {}).dis;
      const v = (w.n * (w.s + 1) / 2 + w.k) * hitP(w.atk - (dis ? 4 : 0), F.guardOf(t)); consider(o, t, v); return; }
    if (o.sg) { const sg = o.sg; if (o.over) return; const cost = o.flux || 0; const room = c.limit - c.flux;
      const pen = cost * (room - cost <= 1 ? 3 : 1.2);
      if (sg.wild === 6) { if (F.standing.some(a => a !== c && a.primed.some(p => !p.sg.wild))) consider(o, F.standing.find(a => a !== c && a.primed.some(p => !p.sg.wild)), 8 - pen); return; }
      if (sg.wild === 7) return consider(o, null, 6 - pen);
      if (sg.wild === 11) return consider(o, null, c.flux >= c.limit - 2 ? 10 : 2);
      if (sg.wild === 4) return consider(o, null, (low.length ? 8 : 3) - pen);
      if (sg.infuse) { if (sg.effect === "mend") return; let t = null, v = 0;
        if (sg.effect === "shell") { t = F.standing.slice().sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]; v = t.hp / t.maxhp < 0.6 ? 9 : 4; }
        else if (sg.effect === "veil") { t = F.standing.slice().sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]; v = 5; }
        else if (sg.effect === "link") { t = c; v = 3 + F.standing.length; }
        else if (sg.effect === "haste") { t = F.standing.filter(a => a !== c).sort((a, b) => ((F.bestWeapon(b) || { atk: 0 }).atk) - ((F.bestWeapon(a) || { atk: 0 }).atk))[0]; v = t ? 9 : 0; }
        if (t && okT(o, t)) consider(o, t, v - pen + (o.flux === 0 ? 2 : 0)); return; }
      let t, mult = 1;
      if (sg.area) { const b = F.autoAim(c, o); if (!b) return; t = b.foes[0]; mult = Math.max(0.2, b.score) * 0.85; }
      else { t = F.pickTarget(c, sg, inR(o)); if (!t) return; if (sg.wild === 3) mult = Math.min(3, inR(o).length); }
      let v = ((sg.n || 0) * ((sg.s || 6) + 1) / 2 + (sg.k || 0)) * hitP(sg.atk, F.guardOf(t)) * mult + (sg.rider ? 2 : 0) - pen;
      if (sg.wild === 5) v -= c.R * 3.5 * (c.hp / c.maxhp < 0.5 ? 2 : 0.6);
      if (F.foesAlive().every(e => e.hp < 6) && cost > 0) v -= 4;
      consider(o, sg.area ? null : t, v); return; }
    if (o.id === "item:frag" && n >= 2) { const b = F.autoAim(c, o); if (b && b.score >= 2) consider(o, null, c.R * 3.5 * b.score * 0.8); return; }
    if (o.id === "item:emp") { const b = F.autoAim(c, o); if (b && b.foes.filter(e => e.machine).length >= 2) consider(o, null, 10); return; }
    if (o.id === "scream" && n >= 2) { const b = F.autoAim(c, o); if (b && b.foes.length >= 2) consider(o, null, (c.R + 1) * 3.5 * b.foes.length * 0.7); return; }
    if (o.id === "crown") { const t = inR(o).filter(e => !e.boss).sort((a, b) => b.hp - a.hp)[0] || inR(o)[0]; if (t && n >= 2 && c.flux + 2 <= c.limit) consider(o, t, 12); return; }
    if (o.id === "intrude" && o.targets.length) return consider(o, F.foe(o.targets[0]), 7);
    if (o.id === "puppet" && o.targets.length && n >= 2 && c.flux + 2 <= c.limit) return consider(o, F.foe(o.targets[0]), 6);
    if (o.id === "sporecloud" && F.standing.length >= 3 && foes.some(e => e.boss)) return consider(o, null, 7);
    if (o.id === "rally" && F.standing.length >= 3) return consider(o, null, (c.R + c.st.chutzpah) * F.standing.length * 0.45 * 0.6);
    if (o.id === "analyze" && inR(o).some(e => e.boss || e.centre) && !foes.some(e => e.cond.exposed)) return consider(o, inR(o).find(e => e.boss || e.centre), 3);
    if (o.id === "dash") { if (foes.length && aiCanReachNothing(F, c, action)) consider(o, null, 0.8); return; }
    if (o.id === "brace") return consider(o, null, c.hp / c.maxhp < 0.3 ? 2.5 : 0.5);
  });
  if (best) return best;
  return { id: "end" };
}
function aiCanReachNothing(F, c, action) { return !action.some(o => (o.targets && o.targets.length && (o.w || (o.sg && !o.sg.infuse))) || (o.target === "area" && F.autoAim(c, o))); }
/* ---- positioning on the grid: score every square the freelancer can reach this turn */
function avgOf(x) { return (x.n || 0) * ((x.s || 6) + 1) / 2 + (x.k || 0); }
function aiThreats(F) {
  return F.foesAlive().map(e => { const single = e.attacks.filter(a => !a.area && !a.summon); const mr = Math.max(0, ...single.map(a => a.reach || 0));
    const ar = e.attacks.filter(a => a.area && a.geo && !(a.recharge && !e.charge[a.n]));
    const aro = ar.filter(a => a.geo.type === "around"), oth = ar.filter(a => a.geo.type !== "around");
    return { e, mr, sp: F.speedSq(e), dmg: Math.max(0, ...single.map(a => a.dmg * (a.multi ? 1.5 : 1))) + e.dmgbonus, area: oth.length > 0, areaR: Math.max(0, ...oth.map(a => a.geo.type === "cone" ? Math.ceil(a.geo.len / 2) : a.geo.r || 2)), areaDmg: Math.max(0, ...oth.map(a => a.dmg)) + e.dmgbonus,
      aroR: aro.length ? Math.max(...aro.map(a => a.geo.r)) : -1, aroDmg: Math.max(0, ...aro.map(a => a.dmg)) + e.dmgbonus }; });
}
// what being on that square is worth to c this turn: the best attack it could make from there
function aiCellValue(F, c, cell, opts, low) {
  let best = 0; const foes = F.foesAlive();
  for (const o of opts) {
    if (o.over) continue;
    if (o.w && !o.w.launcher) { for (const e of foes) { const h = F.canHit(c, o.w, e, cell); if (!h.ok) continue; const v = avgOf(o.w) * hitP(o.w.atk - (h.dis ? 4 : 0), F.guardOf(e)) + (e.hp <= avgOf(o.w) ? 2 : 0); if (v > best) best = v; } continue; }
    if (o.sg && !o.sg.infuse && !o.sg.area && o.sg.wild !== 6 && o.sg.wild !== 8) { const pen = (o.flux || 0) * 1.2; for (const e of foes) { const h = F.canHit(c, o.sg, e, cell); if (!h.ok) continue; const v = avgOf(o.sg) * hitP(o.sg.atk, F.guardOf(e)) + (o.sg.rider ? 2 : 0) - pen; if (v > best) best = v; } continue; }
    if ((o.sg && o.sg.area) || o.target === "area") {
      const sg = F.areaOf(c, o); if (!sg) continue; const g = sg.geo || {}; let cnt = 0;
      if (g.self || sg.shape === "pulse") cnt = foes.filter(e => G.dist(cell, e.pos) <= (g.radius || 2) && G.los(F.map, cell, e.pos)).length;
      else if (sg.shape === "wave") cnt = Math.max(0, ...foes.map(a => foes.filter(e => G.dist(cell, e.pos) <= (g.cone || 3) && G.dist(cell, a.pos) <= (g.cone || 3) && ((e.pos.x - cell.x) * (a.pos.x - cell.x) + (e.pos.y - cell.y) * (a.pos.y - cell.y)) > 0).length));
      else cnt = Math.max(0, ...foes.filter(a => G.dist(cell, a.pos) <= (g.range || 6) && G.los(F.map, cell, a.pos)).map(a => foes.filter(e => G.dist(a.pos, e.pos) <= (g.radius || 2)).length - F.standing.filter(x => x !== c && G.dist(a.pos, x.pos) <= (g.radius || 2)).length * 0.9));
      if (cnt >= (o.w || o.item ? 2 : 1)) { const v = avgOf(sg) * 0.6 * cnt - (o.flux || 0) * 1.2 - (o.w || o.item ? 3 : 0); if (v > best) best = v; }
      continue;
    }
  }
  if (low && low.length) for (const o of opts) {
    const heal = (o.sg && o.sg.effect === "mend" && !o.over) || o.id === "patch" || o.id === "stimgland"; if (!heal) continue;
    const r = o.sg ? ((o.sg.geo && o.sg.geo.range) || 6) : 1; const L = low[0];
    if (G.dist(cell, L.pos) <= r && (r <= 1 || G.los(F.map, cell, L.pos))) best = Math.max(best, L.down ? 22 : 14);
  }
  return best;
}
function aiRisk(F, c, cell, th, path, careful) {
  const frag = 0.12 + 0.5 * (1 - c.hp / c.maxhp) + (c.armor < 2 ? 0.1 : 0);
  let r = 0; th.forEach(t => { const d = G.dist(cell, t.e.pos); if (t.mr > 0 && d <= t.sp + t.mr) r += t.dmg * frag; if (t.aroR >= 0 && d <= t.sp + t.aroR) r += t.aroDmg * frag * 0.8; });
  th.forEach(t => { if (t.area) r += t.areaDmg * 0.3 * F.standing.filter(x => x !== c && G.dist(x.pos, cell) <= Math.max(2, Math.min(4, t.areaR))).length; });
  if (path && !careful && !c.nodes.has("slipstream")) for (const t of th) {     // Opportunity Strikes on the way out
    if (t.mr <= 0 || t.e.cond.dazed || t.e.osUsed === F.round) continue; let inside = G.dist(path[0], t.e.pos) <= t.mr;
    for (let i = 1; i < path.length; i++) { const now = G.dist(path[i], t.e.pos) <= t.mr; if (inside && !now) { r += t.dmg * 0.6; break; } inside = now; }
  }
  return r;
}
// move c to its best square: retreat = only safety counts (after acting)
function aiMove(F, c, retreat) {
  if (!c.t || c.t.move <= 0 || F.speedSq(c) <= 0 || F.active !== c) return false;
  const foes = F.foesAlive(); if (!foes.length) return false;
  const th = aiThreats(F), opts = retreat ? [] : F.options(c).filter(o => o.kind === "action");
  const low = F.pcs.filter(x => !x.dead && x !== c && (x.down || x.hp / x.maxhp < 0.35)).sort((a, b) => (b.down - a.down) || a.hp / a.maxhp - b.hp / b.maxhp);
  const R = F.reach(c, false), RC = F.reach(c, true);
  const myRange = Math.max(1, ...c.weapons.map(w => Math.max(w.reach || 0, w.range || 0)), ...c.surges.concat(c.sigs).filter(s => !s.infuse).map(s => s.geo ? (s.geo.reach || s.geo.range || 1) : 1));
  const near = cell => Math.min(...foes.map(e => G.dist(cell, e.pos)));
  // stalemate breaker: if nobody has been hurt for 3 rounds (rooted boss, hovering drones, both sides waiting), stop playing safe
  const bold = F.round - (F.lastHarm || 1) >= 3;
  if (bold && retreat) return false;
  let best = null; const here = R.get(G.key(c.pos.x, c.pos.y));
  const score = (n, careful) => {
    const path = G.pathOf(n); let v = retreat ? 0 : aiCellValue(F, c, n, opts, low);
    // nothing worth doing from here: close the distance (the small last term breaks ties when foes are "in range" but out of sight)
    if (!retreat && v <= 0) v = -(bold ? 2 : 0.5) * Math.max(0, near(n) - myRange) - (bold ? 0.6 : 0) * near(n);
    return v - aiRisk(F, c, n, th, path, careful) * (bold ? 0.15 : 1) - 0.03 * n.cost;
  };
  R.forEach(n => { const v = score(n, false); if (!best || v > best.v + 1e-9) best = { n, v, careful: false }; });
  RC.forEach(n => { if (n.cost === 0) return; const v = score(n, true); if (v > best.v + 1e-9) best = { n, v, careful: true }; });
  const stay = score(here, false);
  if (!best || best.n.cost === 0 || best.v <= stay + (retreat ? 1 : 0.2)) return false;
  const r = F.perform(c, "move", null, { x: best.n.x, y: best.n.y, careful: best.careful });
  return r.ok;
}
function autoHaste(F) {
  let g = 0;
  while (F.haste && g++ < 3) { const a = F.pc(F.haste.to); const opts = F.options(a).filter(o => o.kind === "action"); const ch = aiChoose(F, a, opts.concat([{ id: "end", kind: "free", targets: [] }]));
    if (ch.id === "end" || !opts.find(o => o.id === ch.id)) { F.haste = null; break; } F.perform(a, ch.id, ch.target); }
}
function autoTurn(F, c) {
  if (!F.beginTurn(c)) return;
  autoTurnRest(F, c);
}
// finish c's turn automatically: move into position, act, then step back to safety with any movement left
function autoTurnRest(F, c) {
  let g = 0, moved = false, retreated = false;
  while (F.active === c && g++ < 16 && F.phase === "player") {
    if (!moved && c.t.actions > 0) { moved = true; aiMove(F, c, false); if (F.active !== c) break; }
    const opts = F.options(c).filter(o => o.id !== "move"); const ch = aiChoose(F, c, opts);
    if (ch.id === "end" && !retreated && c.t.move > 0) { retreated = true; aiMove(F, c, true); continue; }
    const r = F.perform(c, ch.id, ch.target, ch.extra);
    if (!r.ok) { F.perform(c, "end"); break; }
    if (ch.id === "dash") aiMove(F, c, false);
    if (F.haste) autoHaste(F);
  }
  if (F.active === c) F.perform(c, "end");
}
function autoSetup(F) {
  if (F.phase === "prime") F.resolvePrime();
  F.pcs.forEach(c => { if (F.kind === "boss" && F.level >= 10 && F.canFinalForm(c)) F.finalForm(c); });
}
function autoFight(F, maxRounds) {
  maxRounds = maxRounds || 40;
  autoSetup(F); F.begin();
  let g = 0;
  while (F.phase !== "won" && F.phase !== "lost" && g++ < 2000) {
    if (F.round > maxRounds) { F.log(`The fight drags past ${maxRounds} rounds: the freelancers retreat.`, "lose"); F.phase = "lost"; F.finish(false); break; }
    if (F.phase === "player") { const c = F.pending()[0]; if (!c) { F.endPlayerPhase(); continue; } autoTurn(F, c); }
    else break;
  }
  return F.phase === "won";
}

/* ------------------------------------------------------------------ run progression */
function startFight(run) {
  if (run.step !== "minion" && run.step !== "boss") return null;
  delete run.fight; const snap = clone(run); delete snap.snapshot; run.snapshot = snap;
  return new Fight(run, run.step);
}
function completeFight(run, F) {
  delete run.fight; const won = F.phase === "won"; run.stats.fights++; run.stats.rounds += F.stats.rounds;
  run.history.push({ level: run.level, kind: F.kind, title: F.title, won, rounds: F.stats.rounds, dealt: F.stats.dealt, taken: F.stats.taken, downs: F.stats.downs, deaths: F.stats.deaths, overloads: F.stats.overloads, attempt: run.stats.retries });
  if (!won) {
    run.stats.losses++;
    run.step = run.hardcore ? "gameover" : "defeat";
    if (run.hardcore) run.stats.endedAt = Date.now();
    return run.step;
  }
  run.stats.wins++; run.mercy = 0;
  if (run.hardcore && !run.pcs.some(p => !p.dead)) { run.step = "gameover"; return run.step; }
  if (F.kind === "minion") { breather(run); run.step = "boss"; }
  else if (run.level >= 10) { run.step = "victory"; run.stats.endedAt = Date.now(); }
  else run.step = "levelup";
  return run.step;
}
// save / resume a battle in progress (positions, turn, logs) inside the run
function saveFight(run, F) { if (F && F.phase !== "won" && F.phase !== "lost") run.fight = F.toJSON(); else delete run.fight; return run; }
function resumeFight(run) { if (!run.fight || (run.step !== "minion" && run.step !== "boss")) return null; try { return Fight.restore(run, run.fight); } catch (e) { delete run.fight; return null; } }
function retryFight(run) {
  if (run.hardcore || !run.snapshot) return false;
  const mercy = run.mercy || 0; const keep = { retries: run.stats.retries + 1, losses: run.stats.losses, fights: run.stats.fights, rounds: run.stats.rounds }, hist = run.history, snap = run.snapshot;
  const s = clone(snap); Object.keys(run).forEach(k => delete run[k]); Object.assign(run, s); run.snapshot = snap;
  Object.assign(run.stats, keep); run.history = hist; run.mercy = mercy + 1; return true;
}
// choices: array (one per party slot) of applyLevelUp choices, or null for an automatic pick.
function completeLevelUp(run, choices) {
  if (run.step !== "levelup") return { ok: false, errors: ["Not at a level-up."] };
  const next = [], errors = [];
  run.pcs.forEach((rp, i) => {
    if (rp.dead && run.hardcore) { next.push(null); return; }
    const ch = choices && choices[i] ? choices[i] : autoLevelChoices(rp.s);
    const r = applyLevelUp(rp.s, ch);
    if (!r.ok) errors.push(`${rp.s.name || "Freelancer " + (i + 1)}: ${r.errors.join("; ")}`);
    next.push(r.s);
  });
  if (errors.length) return { ok: false, errors };
  run.pcs.forEach((rp, i) => { if (!next[i]) return; const from = rp.s.level; rp.s = next[i]; if (rp.s.level === 4 || rp.s.level === 7) rp.emerge = rp.s.level; rp.log.push(`Level ${from} → ${rp.s.level}.`); });
  run.level++; lockdown(run);
  run.step = "minion"; ensureEncounters(run);
  return { ok: true };
}
function abandonRun(run) { run.step = "gameover"; run.abandoned = true; run.stats.endedAt = Date.now(); }
// whole automatic run (tests and win-rate measurement)
function autoRun(opts) {
  if (opts.seed != null) setSeed(opts.seed);
  const run = newRun(opts); const maxRetries = opts.maxRetries == null ? 0 : opts.maxRetries; let g = 0;
  const firstTry = { fights: 0, wins: 0 }; let lastKey = null;
  while (g++ < 400) {
    if (run.step === "minion" || run.step === "boss") {
      const key = run.level + run.step; const F = startFight(run); if (opts.onFight) opts.onFight(F); autoFight(F, opts.maxRounds);
      if (key !== lastKey) { firstTry.fights++; if (F.phase === "won") firstTry.wins++; lastKey = key; }
      const st = completeFight(run, F); if (opts.onFightDone) opts.onFightDone(F, run);
      if (st === "defeat") { if (run.stats.retries < maxRetries) retryFight(run); else { abandonRun(run); break; } }
    } else if (run.step === "levelup") { const r = completeLevelUp(run, null); if (!r.ok) { run.levelErrors = r.errors; break; } if (opts.onLevel) opts.onLevel(run); }
    else break;
  }
  run.firstTry = firstTry;
  return run;
}

/* ------------------------------------------------------------------ saving */
function store(st) { return st || (typeof localStorage !== "undefined" ? localStorage : null); }
function readJSON(st, k, dflt) { try { const v = store(st).getItem(k); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; } }
function writeJSON(st, k, v) { try { store(st).setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
const Saves = {
  chars: st => readJSON(st, LS.chars, {}),
  saveChar(s, name, st) { const all = this.chars(st); all[name || s.name || "Unnamed"] = RULES.normalize(clone(s)); return writeJSON(st, LS.chars, all); },
  deleteChar(name, st) { const all = this.chars(st); delete all[name]; return writeJSON(st, LS.chars, all); },
  parties: st => readJSON(st, LS.parties, {}),
  saveParty(name, chars, meta, st) { const all = this.parties(st); all[name] = Object.assign({ app: "mutagen-arcade-party", rules: D.version, name, saved: new Date().toISOString(), characters: chars.map(c => RULES.normalize(clone(c))) }, meta || {}); return writeJSON(st, LS.parties, all); },
  deleteParty(name, st) { const all = this.parties(st); delete all[name]; return writeJSON(st, LS.parties, all); },
  exportParty(name, chars, meta) { return Object.assign({ app: "mutagen-arcade-party", rules: D.version, name, characters: chars.map(c => Object.assign({ app: "mutagen-builder", rules: D.version }, RULES.normalize(clone(c)))) }, meta || {}); },
  importAny(obj) {      // a party file, a builder character, or a list of characters → array of characters
    if (!obj) return [];
    if (Array.isArray(obj)) return obj.filter(RULES.looksLikeCharacter).map(c => RULES.normalize(c));
    if (Array.isArray(obj.characters)) return obj.characters.filter(RULES.looksLikeCharacter).map(c => RULES.normalize(c));
    if (Array.isArray(obj.party)) return obj.party.filter(RULES.looksLikeCharacter).map(c => RULES.normalize(c));
    if (RULES.looksLikeCharacter(obj)) return [RULES.normalize(obj)];
    return [];
  },
  run: st => readJSON(st, LS.run, null),
  saveRun(run, st) { return writeJSON(st, LS.run, run); },
  clearRun(st) { try { store(st).removeItem(LS.run); } catch (e) { } },
  records: st => readJSON(st, LS.best, []),
  addRecord(run, st) { const r = this.records(st); r.unshift({ when: new Date().toISOString(), party: run.partyName, difficulty: run.difficulty, hardcore: run.hardcore, result: run.step, level: run.level, names: run.pcs.map(p => p.s.name), stats: run.stats }); return writeJSON(st, LS.best, r.slice(0, 25)); }
};

root.MutagenArcade = { VERSION, DIFFS, LS, BY, ROSTER: ROS, setSeed, rng, die, roll, d20, newRun, ensureEncounters, buildMinions, bossFor, unitsFor, breather, lockdown, levelPlan, eligibleNodes, surgeParts, autoNode, autoSurge,
  applyLevelUp, autoLevelChoices, fitToLevel, makePC, makeFoe, Fight, aiChoose, autoTurn, autoSetup, autoFight, startFight, completeFight, retryFight, completeLevelUp, abandonRun, autoRun, Saves, surgeDetail, surgeTarget,
  COND_NAME, BLOOM, GLITCH, threatAt, WILD, HARD_BUDGET, partySize, wildSurge, saveFight, resumeFight, aiMove, autoTurnRest, aiCellValue, aiThreats, aiRisk, attackGeo, SHAPE_GEO };
})(typeof window !== "undefined" ? window : globalThis);
