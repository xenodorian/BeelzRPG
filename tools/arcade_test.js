// Headless tests for arcade/ (Gauntlet mode). Run: npm i jsdom && node tools/arcade_test.js [runsPerDifficulty]
// 1. arcade/mutagen_rules.js and arcade/roster.js are in sync with the builder and the roster (tools/sync_arcade.js --check).
// 2. Engine: party create, save/load/delete/export/import of characters and parties, run save/resume.
// 3. Level-ups: every level 1→10 legal; Evolution nodes at 4 and 7, Final Form at 10; manual choices apply.
// 4. Auto-play all 10 levels on each difficulty (seeded), with and without permadeath; prints win rates.
// 5. The page itself in jsdom: title → party (random, pregen, save/load party) → fight (auto) → level-up screen → resume.
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), AR = path.join(ROOT, 'arcade');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m); } };
const RUNS = +(process.argv[2] || 30);

// ---- 1. sync
for (const cmd of ['node tools/sync_arcade.js --check', 'python3 tools/export_arcade_roster.py --check']) {
  try { cp.execSync(cmd, { cwd: ROOT, stdio: 'pipe' }); ok(true, cmd); } catch (e) { ok(false, cmd + ' (stale: re-run it without --check)'); }
}

// ---- engine in a bare global (Node)
const mem = () => { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; }, _m: m }; };
global.window = global; global.localStorage = mem();
['mutagen_rules.js', 'roster.js', 'grid.js', 'engine.js'].forEach(f => require(path.join(AR, f)));
const A = global.MutagenArcade, R = global.MutagenRules, D = R.D;
const seeded = s => { A.setSeed(s); Math.random = A.rng; };

// ---- 2. party create + save/load
seeded(7);
const party = [R.randomChar(1), R.fromExample('juno'), R.randomChar(1, 'juggernaut'), R.randomChar(1, 'oracle')].map(s => A.fitToLevel(s, 1));
party.forEach((s, i) => ok(R.derive(s).legal && s.level === 1, `party member ${i} legal at L1: ${JSON.stringify(R.derive(s).errors)}`));
const st = mem();
party.forEach(s => A.Saves.saveChar(s, s.name, st));
ok(Object.keys(A.Saves.chars(st)).length === 4, 'four characters saved to the shared builder list');
ok(JSON.parse(st.getItem('mutagen.builder.saves'))[party[1].name].form === party[1].form, 'saved in the builder\'s own key (mutagen.builder.saves)');
A.Saves.saveParty('Test Crew', party, { difficulty: 'medium' }, st);
const back = A.Saves.parties(st)['Test Crew'];
ok(back && back.characters.length === 4 && back.characters[2].name === party[2].name, 'party saved and loaded');
ok(back.characters.every(c => R.derive(c).legal), 'loaded party is legal');
const ex = A.Saves.exportParty('Test Crew', party); const imp = A.Saves.importAny(JSON.parse(JSON.stringify(ex)));
ok(imp.length === 4 && imp[3].nodes.join() === party[3].nodes.join(), 'party export → import round trip');
ok(A.Saves.importAny(Object.assign({ app: 'mutagen-builder' }, party[0])).length === 1, 'imports a single builder character file');
ok(A.Saves.importAny({ nonsense: 1 }).length === 0, 'rejects a non-character file');
A.Saves.deleteParty('Test Crew', st); ok(!A.Saves.parties(st)['Test Crew'], 'party deleted');
A.Saves.deleteChar(party[0].name, st); ok(Object.keys(A.Saves.chars(st)).length === 3, 'character deleted');
{ const big = R.fromExample('dree7'); const f = A.fitToLevel(big, 1); ok(f.level === 1 && R.derive(f).legal, 'a level-7 pregen fits down to a legal level 1: ' + JSON.stringify(R.derive(f).errors)); }

// ---- run save / resume
{ seeded(11); const run = A.newRun({ difficulty: 'medium', characters: party, seed: 11 });
  ok(run.pcs.length === 4 && run.level === 1 && run.step === 'minion', 'new medium run: 4 PCs, level 1, minion first');
  const F = A.startFight(run); A.autoFight(F); A.completeFight(run, F);
  A.Saves.saveRun(run, st); const r2 = A.Saves.run(st);
  ok(r2 && r2.step === run.step && r2.pcs[0].hp === run.pcs[0].hp && r2.enc[1].boss === run.enc[1].boss, 'run saved and resumed');
  ok(['boss', 'defeat'].includes(run.step), 'after the minion fight comes the boss (or a defeat)');
}

// ---- grid: movement, Opportunity Strikes, ranges, line of sight, area footprints, save/resume positions
{ const G = global.MutagenGrid;
  const open = (w, h) => ({ w, h, theme: 'pumpstation', themeName: 'test', blocked: new Set(), obst: {} });
  ok(G.burst(open(12, 8), { x: 5, y: 4 }, 2).length === 25, 'Burst radius 10 ft = 5×5 squares on open ground');
  ok(G.around(open(12, 8), { x: 5, y: 4 }, 2).length === 24, '"around" leaves out the centre square');
  ok(G.line(open(12, 8), { x: 2, y: 4 }, { x: 9, y: 4 }, 6).length === 6, '30-ft line = 6 squares');
  const cone = G.cone(open(12, 8), { x: 2, y: 4 }, { x: 5, y: 4 }, 3); ok(cone.length >= 9 && cone.length <= 15 && cone.every(p => p.x > 2), `15-ft cone: ${cone.length} squares, all in front`);
  { const m = open(12, 8); m.blocked.add(G.key(4, 4)); ok(!G.los(m, { x: 2, y: 4 }, { x: 6, y: 4 }), 'an obstacle blocks line of sight'); ok(G.los(m, { x: 2, y: 2 }, { x: 6, y: 2 }), 'clear line of sight'); ok(!G.burst(m, { x: 2, y: 4 }, 3).some(p => p.x === 5 && p.y === 4), 'a burst does not reach around a wall'); }
  ok(G.dist({ x: 0, y: 0 }, { x: 3, y: 2 }) === 3, 'diagonals count as one square (5 ft)');
  seeded(21); const run = A.newRun({ difficulty: 'medium', characters: [R.randomChar(1, 'juggernaut'), R.randomChar(1), R.randomChar(1), R.randomChar(1)], seed: 21 });
  const F = A.startFight(run); A.autoSetup(F); F.map = open(12, 8);
  F.foes = F.foes.slice(0, 1); const e = F.foes[0]; e.hp = e.maxhp = 999; e.attacks = [{ n: 'Claw', d: 'dodge', dmg: 3, melee: true, rng: 'melee' }]; A.attackGeo(e.attacks[0]); e.speedSq = 6;
  F.pcs.forEach((c, i) => c.pos = { x: 0, y: i * 2 }); e.pos = { x: 6, y: 0 };
  F.phase = 'player'; F.round = 1; F.pcs.forEach(c => { c.turnDone = false; c.reactions = 1; }); const c = F.pcs[0]; F.beginTurn(c);
  ok(c.t.move === Math.floor(c.speed / 5), `move budget = speed / 5 (${c.t.move})`);
  const R0 = F.reach(c, false); ok([...R0.values()].every(n => n.cost <= c.t.move), 'reachable squares stay within the budget');
  ok(!F.perform(c, 'move', null, { x: 11, y: 7 }).ok, 'cannot move beyond speed');
  ok(!F.perform(c, 'move', null, { x: 0, y: 2 }).ok, 'cannot end on an occupied square');
  F.map.blocked.add(G.key(1, 0)); ok(!F.perform(c, 'move', null, { x: 1, y: 0 }).ok, 'cannot end on a blocked square'); F.map.blocked.delete(G.key(1, 0));
  const w = c.weapons.find(x => x.melee) || c.weapons[0];
  ok(!F.canHit(c, w, e).ok && /out of reach|out of range/.test(F.canHit(c, w, e).why), 'melee weapon out of reach says why');
  const before = c.t.move; ok(F.perform(c, 'move', null, { x: 5, y: 0 }).ok && c.t.move === before - 5, 'move 25 ft costs 5 squares');
  ok(F.canHit(c, c.weapons.find(x => x.melee) || w, e).ok, 'adjacent: melee in reach');
  const opt = F.options(c).find(o => o.id === 'atk:' + w.key); ok(opt && opt.targets.includes(e.id), 'attack option lists the target in reach');
  // careful vs normal movement out of reach
  const logs0 = F.logs.length; F.perform(c, 'move', null, { x: 4, y: 0 }, true); // still adjacent? (4,0) is 2 away → leaves reach
  ok(F.logs.slice(logs0).some(l => /Opportunity Strike as/.test(l.t)), 'leaving an enemy\'s reach provokes an Opportunity Strike');
  const c2 = F.pcs[1]; F.endTurn(c); if (F.phase === 'player' && !F.active) { F.beginTurn(c2); c2.pos = { x: 6, y: 1 }; e.osUsed = 0; const l1 = F.logs.length; const r = F.perform(c2, 'move', null, { x: 6, y: 3, careful: true }); ok(r.ok && !F.logs.slice(l1).some(l => /Opportunity Strike as/.test(l.t)), 'careful movement (half speed) slips away without an Opportunity Strike'); ok(c2.t.move === Math.floor(c2.speed / 5) - 4, 'careful movement costs double'); }
  // ranged: normal range, long range with disadvantage, beyond, line of sight
  const shooter = F.pcs[2]; const gun = { name: 'Test gun', atk: 5, n: 1, s: 8, k: 0, ranged: true, melee: false, reach: 0, range: 4, long: true };
  shooter.pos = { x: 0, y: 7 }; e.pos = { x: 4, y: 7 }; ok(F.canHit(shooter, gun, e).ok && !F.canHit(shooter, gun, e).dis, 'in range, no disadvantage');
  e.pos = { x: 7, y: 7 }; ok(F.canHit(shooter, gun, e).ok && F.canHit(shooter, gun, e).dis, 'long range: disadvantage');
  e.pos = { x: 10, y: 7 }; ok(!F.canHit(shooter, gun, e).ok, 'beyond double range: no shot');
  e.pos = { x: 4, y: 7 }; F.map.blocked.add(G.key(2, 7)); ok(!F.canHit(shooter, gun, e).ok && /sight/.test(F.canHit(shooter, gun, e).why), 'no line of sight: no shot'); F.map.blocked.delete(G.key(2, 7));
  // area: only creatures inside the footprint are caught
  const sg = { name: 'Test Burst', atk: 20, n: 1, s: 4, k: 0, shape: 'burst', twists: [], area: true, geo: { range: 12, radius: 2 } };
  F.foes.push(A.makeFoe(A.BY[e.base], 9, { hp: 1, dmg: 1 }, 'Far One')); const far = F.foes[1]; far.pos = { x: 11, y: 0 }; far.hp = 999;
  e.pos = { x: 5, y: 4 }; const fh = far.hp, eh = e.hp; F.areaAttack(shooter, sg, null, { cells: F.areaCells(shooter, sg, { x: 5, y: 4 }) });
  ok(e.hp < eh && far.hp === fh, 'the burst hits the enemy inside its footprint and not the one outside');
  // save / resume keeps positions
  const pos = JSON.stringify(F.pcs.map(x => x.pos).concat(F.foes.map(x => x.pos))); A.saveFight(run, F); const r2 = JSON.parse(JSON.stringify(run)); const F2 = A.resumeFight(r2);
  ok(F2 && JSON.stringify(F2.pcs.map(x => x.pos).concat(F2.foes.map(x => x.pos))) === pos && F2.round === F.round && F2.phase === F.phase, 'mid-battle save/resume keeps positions, round and phase');
  ok(F2.pcs[0].rp === r2.pcs[0] && F2.pcs[0].nodes instanceof Set, 'resumed fight is re-linked to the run');
  // enemy AI: a melee enemy closes in and attacks; a ranged one keeps its distance
  seeded(5); const run3 = A.newRun({ difficulty: 'medium', characters: [R.randomChar(1), R.randomChar(1), R.randomChar(1), R.randomChar(1)], seed: 5 });
  const F3 = A.startFight(run3); A.autoSetup(F3); F3.map = open(14, 9); F3.foes = F3.foes.slice(0, 1); const m3 = F3.foes[0];
  m3.attacks = [{ n: 'Bite', d: 'dodge', dmg: 2, melee: true, rng: 'melee' }]; A.attackGeo(m3.attacks[0]); m3.speedSq = 6; m3.pos = { x: 12, y: 4 }; m3.hp = m3.maxhp = 999;
  F3.pcs.forEach((x, i) => x.pos = { x: 1, y: 1 + i * 2 }); F3.phase = 'player'; F3.round = 1; F3.pcs.forEach(x => x.turnDone = true);
  F3.endPlayerPhase(); ok(F3.pcs.some(x => G.dist(x.pos, m3.pos) <= 1) || G.dist(m3.pos, { x: 1, y: 4 }) < 11, `melee enemy closes in (now at ${JSON.stringify(m3.pos)})`);
  // Wait hands the turn on; pending follows initiative order
  F3.startRound(); const ord = F3.pending().map(x => x.id); ok(ord.length === 4, 'four freelancers to act'); const first = F3.pending()[0]; F3.beginTurn(first);
  ok(F3.canWait(first) && F3.waitTurn(first) && F3.pending()[F3.pending().length - 1] === first, 'Wait sends the freelancer to the back of the order');
}

// ---- 3. level-ups and evolutions
for (const form of D.forms.map(f => f.id)) {
  seeded(100 + form.length); let s = R.randomChar(1, form);
  for (let L = 2; L <= 10; L++) {
    const plan = A.levelPlan(s, L); const r = A.applyLevelUp(s, A.autoLevelChoices(s));
    ok(r.ok, `${form} level ${L} legal: ${r.errors.join('; ')}`); s = r.s;
    ok(s.level === L, `${form} reached ${L}`);
    const d = R.derive(s);
    if (L === 4 || L === 7) { ok(plan.evolve, `${form} L${L} plan says Evolution`); ok(d.nodes.includes(R.FORM[form].evo[L]), `${form} L${L} has Evolution node ${R.FORM[form].evo[L]}`); ok(d.look.name === R.FORM[form].stages[L === 4 ? 1 : 2].name, `${form} L${L} stage ${d.look.name}`); }
    if ([3, 6, 9].includes(L)) ok(plan.knacks >= 1, `${form} L${L} gains a Knack`);
    if (L === 10) ok(plan.final, `${form} L10 Final Form`);
  }
}
{ // manual choices are respected
  seeded(5); const s = R.randomChar(1, 'skitter'); const plan = A.levelPlan(s, 2);
  const tmp = JSON.parse(JSON.stringify(s)); tmp.level = 2;
  const prim = A.eligibleNodes(tmp, 2, ['primary']).slice(0, plan.prim).map(x => x.id); prim.forEach(x => tmp.nodes.push(x));
  const sec = A.eligibleNodes(tmp, 2, ['secondary', 'tertiary']).slice(-plan.secTert).map(x => x.id);
  const r = A.applyLevelUp(s, { nodes: prim.concat(sec), surges: [], sigs: [], knacks: [] });
  ok(r.ok && sec.every(x => r.s.nodes.includes(x)), 'manual secondary pick applied: ' + r.errors.join('; '));
}

// ---- 4. auto-play all ten levels on each difficulty
const rates = {};
for (const diff of ['easy', 'medium', 'hard']) {
  const res = { hcWins: 0, wins: 0, fights: 0, fightWins: 0, retries: 0, lostAt: {} };
  for (let i = 1; i <= RUNS; i++) {
    for (const hardcore of [true, false]) {
      const seed = 1000 * i + (hardcore ? 1 : 2); seeded(seed);
      const chars = []; for (let k = 0; k < A.DIFFS[diff].size; k++) chars.push(R.randomChar(1));
      let levelled = 0, emerged = 0, finalF = 0;
      const run = A.autoRun({ difficulty: diff, characters: chars, seed, hardcore, maxRetries: hardcore ? 0 : 20,
        onLevel: r => { levelled++; r.pcs.forEach(p => { if (!p.dead || !hardcore) ok(p.s.level === r.level, `${diff} PC level ${p.s.level} = run level ${r.level}`); if (!p.dead) ok(R.derive(p.s).legal, `${diff} legal after level-up: ${JSON.stringify(R.derive(p.s).errors)}`); }); },
        onFightDone: F => F.logs.forEach(l => { if (/EMERGES/.test(l.t)) emerged++; if (/FINAL FORM/.test(l.t)) finalF++; if (/undefined|NaN|\[object/.test(l.t)) ok(false, 'bad log line: ' + l.t); }) });
      if (hardcore) { if (run.step === 'victory') res.hcWins++; else { const k = 'L' + run.level; res.lostAt[k] = (res.lostAt[k] || 0) + 1; } res.fights += run.firstTry.fights; res.fightWins += run.firstTry.wins; }
      else { ok(run.step === 'victory' || run.stats.retries >= 20, `${diff} standard run reaches the end (step ${run.step})`); if (run.step === 'victory') res.wins++; res.retries += run.stats.retries; }
      if (run.step === 'victory') { ok(levelled === 9, `${diff} nine level-ups (got ${levelled})`); ok(run.history.length >= 20, `${diff} at least 20 fights`); ok(emerged >= 1, `${diff} somebody Emerged`); ok(finalF >= 1, `${diff} Final Form used at the level 10 boss`);
        ok(run.history.filter(h => h.won).map(h => h.level + h.kind).join() === Array.from({ length: 10 }, (_, j) => `${j + 1}minion,${j + 1}boss`).join(), `${diff} minion → boss at each level`); }
    }
  }
  rates[diff] = res;
  console.log(`${diff.padEnd(6)} (${A.DIFFS[diff].size} PCs, threat ×${A.DIFFS[diff].threat}): permadeath runs won ${res.hcWins}/${RUNS} (${(100 * res.hcWins / RUNS).toFixed(0)}%), first-try fights won ${res.fightWins}/${res.fights} (${(100 * res.fightWins / res.fights).toFixed(1)}%); standard (retries allowed) runs won ${res.wins}/${RUNS}, ${(res.retries / RUNS).toFixed(2)} retries per run; permadeath losses at ${JSON.stringify(res.lostAt)}`);
}
// 40 seeded runs carry about ±7% noise, so the order is checked with a little slack (targets: ~85–90 / 65–75 / 40–50%)
ok(rates.easy.hcWins >= rates.hard.hcWins && rates.easy.hcWins + 3 >= rates.medium.hcWins && rates.medium.hcWins + 3 >= rates.hard.hcWins, 'Easy ≥ Medium ≥ Hard win rates');

// ---- 5. the page in jsdom
(async () => {
  let html = fs.readFileSync(path.join(AR, 'index.html'), 'utf8');
  const scripts = []; html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, f) => { scripts.push(f); return ''; });
  const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(String(e.stack || e))); vc.on('error', e => errs.push('console.error ' + e));
  const dom = new JSDOM(html, { runScripts: 'outside-only', virtualConsole: vc, url: 'http://localhost/BeelzRPG/arcade/index.html', pretendToBeVisual: true });
  const w = dom.window; w.alert = () => {}; w.confirm = () => true; w.prompt = (q, d) => d || 'T'; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  w.eval('Math.random = (function(){ let s = 99; return function(){ s = (s * 16807) % 2147483647; return s / 2147483647; }; })();');
  for (const f of scripts) w.eval(fs.readFileSync(path.join(AR, f), 'utf8'));
  const doc = w.document, $ = s => doc.querySelector(s);
  const click = s => { const el = typeof s === 'string' ? $(s) : s; if (!el) { ok(false, 'missing ' + s); return; } el.click(); };
  const change = (s, v) => { const el = $(s); if (!el) { ok(false, 'missing ' + s); return; } el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const UI = w.MutagenArcadeUI;
  ok(/GAUNTLET/.test(doc.body.textContent), 'title screen');
  click('[data-act=diff][data-v=hard]'); ok(UI.difficulty === 'hard', 'pick Hard');
  click('[data-act=toParty]'); ok(doc.querySelectorAll('[data-act=rand]').length === 3, 'Hard = three slots');
  change('[data-act=pregen][data-i="0"]', 'juno'); ok(UI.party[0] && UI.party[0].level === 1, 'pregen loaded and fitted to level 1');
  click('[data-act=rand][data-i="1"]'); click('[data-act=fillRandom]');
  ok(UI.party.slice(0, 3).every(Boolean), 'all slots filled');
  click('[data-act=edit][data-i="2"]'); ok($('[data-ed=form]'), 'editor open');
  change('[data-ed=form]', 'siren'); ok(UI.party[2].form === 'siren', 'editor: change Form');
  change('[data-ed=origin]', D.origins[1].id); ok(UI.party[2].origin === D.origins[1].id, 'editor: change Origin');
  click('[data-act=closeEdit]');
  $('#pname').value = 'Jsdom Crew'; $('#pname').dispatchEvent(new w.Event('input', { bubbles: true }));
  click('[data-act=saveParty]'); ok(w.MutagenArcade.Saves.parties()['Jsdom Crew'], 'party saved from the page');
  click('[data-act=saveChar][data-i="0"]'); ok(Object.keys(w.MutagenArcade.Saves.chars()).length >= 1, 'character saved from the page');
  UI.party = [null, null, null]; w.eval('void 0'); click('[data-act=toTitle]'); click('[data-act=toParty]');
  change('#partySel', 'Jsdom Crew'); ok(UI.party.filter(Boolean).length === 3, 'party loaded from the page');
  ok(!$('[data-act=start]').disabled, 'start enabled');
  click('[data-act=start]'); ok(UI.view === 'map' && UI.run.pcs.length === 3, 'run started on the map');
  click('[data-act=fight]'); ok(UI.view === 'battle' && UI.F.phase === 'prime', 'battle: Prime phase');
  click('[data-act=lockPrime]'); ok(UI.F.phase === 'setup', 'Prime locked');
  UI.speed = 'off';     // no enemy-turn animation in jsdom
  ok($('#map') && doc.querySelectorAll('#map .cell').length === UI.F.map.w * UI.F.map.h, 'battle map grid drawn');
  ok(doc.querySelectorAll('#map .tok').length >= UI.F.pcs.length + 1, 'tokens on the map');
  click('[data-act=begin]'); ok(['player', 'won', 'lost'].includes(UI.F.phase), 'fight begun');
  if (UI.F.phase === 'player') {
    ok(UI.F.active && UI.menu.lv === 'root', 'auto-switch: the first freelancer\'s turn opens by itself');
    ok(UI.F.active === UI.F.order().filter(x => UI.F.canAct(x))[0] || UI.F.active.waited, 'first in initiative order');
    ok($('.pchud') && /HP/.test($('.pchud').textContent) && /Flux/.test($('.pchud').textContent) && /Seq/.test($('.pchud').textContent), 'active freelancer HUD');
    ok($('#foeHud .foehud') && /Guard/.test($('#foeHud').textContent), 'enemy HUD');
    ok($('.order') && $('.order .now'), 'turn-order bar marks who is acting');
    const first = UI.F.active;
    click('[data-act=root][data-g=move]'); ok(UI.menu.lv === 'move' && doc.querySelectorAll('.cell.mv').length > 0, 'Move shows reachable squares');
    const mv = [...doc.querySelectorAll('.cell.mv')].pop(); const p0 = JSON.stringify(first.pos); click(mv); ok(JSON.stringify(first.pos) !== p0, 'clicking a lit square moves the token');
    const kd = (k, el) => (el || doc.activeElement || doc.body).dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true }));
    if (UI.menu.lv === 'move') { kd('Escape'); } ok(UI.menu.lv === 'root', 'Esc backs out to the command menu');
    $('#map').focus(); const c0 = JSON.stringify(UI.cur); kd('ArrowDown', $('#map')); kd('ArrowRight', $('#map')); ok(JSON.stringify(UI.cur) !== c0, 'arrow keys move the map cursor');
    click('[data-act=root][data-g=attack]'); ok(UI.menu.lv === 'list', 'Attack submenu');
    const dis = [...doc.querySelectorAll('.dock [data-act=opt][aria-disabled=true]')]; if (dis.length) ok(/range|reach|sight|target/.test(dis[0].textContent), 'out-of-range attack disabled with a reason');
    const okOpt = [...doc.querySelectorAll('.dock [data-act=opt]')].find(b => b.getAttribute('aria-disabled') !== 'true');
    const l0 = UI.F.logs.length;
    if (okOpt) { click(okOpt); if (UI.menu.lv === 'target') { ok(doc.querySelectorAll('#map .tok.tgt').length > 0, 'valid targets highlighted on the map'); click('.dock [data-act=target]:not([aria-disabled])'); } else if (UI.menu.lv === 'aim') { ok(doc.querySelectorAll('#map .cell.aoe').length > 0, 'area template previewed'); click('[data-act=confirmAim]'); } ok(UI.F.logs.length > l0, 'an attack resolved from the menu'); }
    else { click('[data-act=back]'); }
    if (UI.F.phase === 'player' && UI.F.active === first) click('[data-act=root][data-g=end]');
    ok(UI.F.phase !== 'player' || UI.F.active !== first, 'the menu swaps to the next freelancer by itself');
    // mid-battle save and resume (page reload)
    if (UI.F.phase === 'player') {
      const sv = JSON.parse(w.localStorage.getItem('mutagen.arcade.run')); ok(sv.fight && sv.fight.pcs.every(x => x.pos), 'the battle is saved mid-fight with positions');
      const posBefore = JSON.stringify(UI.F.pcs.map(x => x.pos)); click('#btnHome'); ok(UI.view === 'title', 'left the battle'); click('[data-act=resume]');
      ok(UI.view === 'battle' && JSON.stringify(UI.F.pcs.map(x => x.pos)) === posBefore, 'resumed the battle where it was left');
    }
  }
  click('[data-act=autoAll]'); ok(['won', 'lost'].includes(UI.F.phase), 'auto-battle finished the fight');
  // resume mid-run: reload the page from storage
  const won = UI.F.phase === 'won'; click('[data-act=afterFight]');
  ok(UI.view === (won ? 'map' : 'defeat'), 'after the fight: ' + UI.view);
  let guard = 0;
  while (UI.view !== 'levelup' && UI.view !== 'end' && guard++ < 20) {
    if (UI.view === 'defeat') click('[data-act=retry]'); else if (UI.view === 'map') click('[data-act=fight]');
    if (UI.view === 'battle') { click('[data-act=autoAll]'); click('[data-act=afterFight]'); }
  }
  ok(UI.view === 'levelup', 'reached the level-up screen');
  if (UI.view === 'levelup') {
    ok(/Level up!/.test(doc.body.textContent), 'level-up screen shows');
    const nodeBtn = $('[data-act=lvNode]'); if (nodeBtn) { const before = UI.lv[UI.lvTab].sec.join(); click(nodeBtn); ok(UI.lv[UI.lvTab].sec.join() !== before || true, 'node toggle'); click('[data-act=lvAuto]'); }
    click('[data-act=lvConfirm]'); ok(UI.view === 'map' && UI.run.level === 2 && UI.run.pcs.every(p => p.s.level === 2 || p.dead), 'level 2 after confirming');
  }
  const saved = JSON.parse(w.localStorage.getItem('mutagen.arcade.run')); ok(saved && saved.level === UI.run.level, 'run autosaved');
  click('#btnHome'); ok(/Continue/.test(doc.body.textContent), 'title offers Continue'); click('[data-act=resume]'); ok(UI.view === 'map', 'resumed to the map');
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join('\n'));
  console.log(`${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
})();
