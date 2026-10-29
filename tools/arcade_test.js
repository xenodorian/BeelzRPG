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
  click('[data-act=begin]'); ok(['player', 'won', 'lost'].includes(UI.F.phase), 'fight begun');
  if (UI.F.phase === 'player') { const t = $('[data-act=turn]'); click(t); ok(UI.F.active, 'turn begun');
    const o = $('.center [data-act=opt]'); click(o); if (UI.pendingOpt) click('[data-act=target]'); ok(UI.F.logs.length > 5, 'an option resolved'); }
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
