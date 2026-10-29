// Engine stress test for the arcade: many seeded auto-played runs with a JSON save/restore of the
// whole run (localStorage-style) after random turns, invariant checks after every turn, softlock and
// performance detection. Usage: node tools/arcade_stress.js [runsPerDifficulty=100] [seedBase=500000]
global.window = globalThis;
['mutagen_rules.js', 'roster.js', 'grid.js', 'engine.js'].forEach(f => require('../arcade/' + f));
const A = window.MutagenArcade, R = window.MutagenRules, G = window.MutagenGrid;
const RUNS = +(process.argv[2] || 100), BASE = +(process.argv[3] || 500000);
const out = { runs: 0, fights: 0, turns: 0, saves: 0, crashes: [], softlocks: [], invariants: [], capHits: 0, slowTurns: 0, maxTurnMs: 0, maxFightMs: 0, maxRounds: 0, wins: {}, levelErrors: [] };
const bad = (kind, m) => { if (out.invariants.length < 50) out.invariants.push(kind + ': ' + m); };
function check(F, where) {
  const pos = new Set();
  for (const x of F.pcs.concat(F.foes)) {
    for (const k of ['hp', 'maxhp']) if (!Number.isFinite(x[k])) bad(where, `${x.name} ${k}=${x[k]}`);
    if (x.hp > x.maxhp + 1e-9 && x.side !== 'pc') bad(where, `${x.name} hp ${x.hp} > max ${x.maxhp}`);
    const alive = x.side === 'pc' ? !x.dead : x.hp > 0 && !x.dead && !x.fled;
    if (!x.pos) { if (alive) bad(where, `${x.name} has no position`); continue; }
    if (!alive) continue;
    if (x.pos.x < 0 || x.pos.y < 0 || x.pos.x >= F.map.w || x.pos.y >= F.map.h) bad(where, `${x.name} off the map ${JSON.stringify(x.pos)}`);
    const k = x.pos.x + ',' + x.pos.y; if (pos.has(k)) bad(where, `two creatures on ${k}`); pos.add(k);
    if (F.map.blocked.has(G.key(x.pos.x, x.pos.y))) { if (!x.fly) bad(where, `${x.name} inside an obstacle`); else out.fliersOnObstacles = (out.fliersOnObstacles || 0) + 1; }
  }
  for (const c of F.pcs) { if (!Number.isFinite(c.flux) || c.flux < 0) bad(where, `${c.name} flux ${c.flux}`); }
}
function playFight(run, seedTag) {
  let F = A.startFight(run); A.autoSetup(F); F.begin(); check(F, 'begin');
  const t0 = Date.now(); let g = 0, lastSig = '', still = 0;
  while (F.phase !== 'won' && F.phase !== 'lost') {
    if (++g > 3000) { out.softlocks.push(`${seedTag}: >3000 steps (phase ${F.phase}, round ${F.round})`); F.phase = 'lost'; F.finish(false); break; }
    if (F.round > 40) { out.capHits++; (out.capTags = out.capTags || []).push(seedTag + ' ' + F.foesAlive().map(e => e.name + (e.fly ? '(fly)' : '') + ' ' + e.hp + 'hp@' + e.pos.x + ',' + e.pos.y).join('; ') + ' | PCs ' + F.pcs.map(c => c.name + ' ' + c.hp + (c.down ? 'D' : '') + (c.dead ? 'X' : '')).join('; ')); F.log('The fight drags past 40 rounds: the freelancers retreat.', 'lose'); F.phase = 'lost'; F.finish(false); break; }
    if (F.phase !== 'player') { out.softlocks.push(`${seedTag}: stuck in phase ${F.phase}`); break; }
    const c = F.pending()[0];
    const a = Date.now();
    if (!c) F.endPlayerPhase(); else A.autoTurn(F, c);
    const ms = Date.now() - a; out.turns++; if (ms > out.maxTurnMs) out.maxTurnMs = ms; if (ms > 250) out.slowTurns++;
    check(F, seedTag + ' r' + F.round);
    const sig = F.round + '|' + F.phase + '|' + (c ? c.id : '-') + '|' + F.pcs.map(p => p.hp + ':' + (p.turn && p.turn.done)).join(',') + F.foes.map(f => f.hp).join(',');
    if (sig === lastSig) { if (++still > 50) { out.softlocks.push(`${seedTag}: no progress for 50 steps in round ${F.round}`); break; } } else { still = 0; lastSig = sig; }
    if (A.rng() < 0.08 && F.phase === 'player') {   // save the run to JSON mid-fight and resume from it, like closing the tab
      A.saveFight(run, F); const json = JSON.stringify(run); const back = JSON.parse(json); Object.keys(run).forEach(k => delete run[k]); Object.assign(run, back);
      const F2 = A.resumeFight(run); if (!F2) { out.crashes.push(`${seedTag}: resume returned null`); break; } F = F2; out.saves++; check(F, seedTag + ' resumed');
    }
  }
  out.maxRounds = Math.max(out.maxRounds, F.round); out.maxFightMs = Math.max(out.maxFightMs, Date.now() - t0); out.fights++;
  return F;
}
for (const diff of ['easy', 'medium', 'hard']) for (const hardcore of [true, false]) {
  const key = diff + (hardcore ? ' permadeath' : ' standard'); out.wins[key] = [0, 0];
  for (let i = 0; i < RUNS; i++) {
    const seed = BASE + i * 7919 + (hardcore ? 1 : 2) + (diff === 'easy' ? 0 : diff === 'medium' ? 100000 : 200000);
    A.setSeed(seed); Math.random = A.rng;
    const chars = []; for (let k = 0; k < A.DIFFS[diff].size; k++) chars.push(R.randomChar(1));
    let run;
    try {
      run = A.newRun({ difficulty: diff, characters: chars, seed, hardcore });
      let g = 0;
      while (g++ < 400) {
        if (run.step === 'minion' || run.step === 'boss') {
          const F = playFight(run, `${key} seed ${seed} L${run.level} ${run.step}`);
          const st = A.completeFight(run, F);
          if (st === 'defeat') { if (!hardcore && run.stats.retries < 20) A.retryFight(run); else { A.abandonRun(run); break; } }
        } else if (run.step === 'levelup') { const r = A.completeLevelUp(run, null); if (!r.ok) { out.levelErrors.push(`${key} seed ${seed}: ${r.errors.join('; ')}`); break; } }
        else break;
        // the run itself must survive a JSON round trip between steps (autosave)
        const back = JSON.parse(JSON.stringify(run)); Object.keys(run).forEach(k => delete run[k]); Object.assign(run, back);
      }
      out.runs++; out.wins[key][1]++; if (run.step === 'victory') out.wins[key][0]++;
    } catch (e) { out.crashes.push(`${key} seed ${seed}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
  }
  console.log(key, `${out.wins[key][0]}/${out.wins[key][1]}`);
}
console.log(JSON.stringify(Object.assign({}, out, { crashes: out.crashes.slice(0, 10), softlocks: out.softlocks.slice(0, 10) }), null, 1));
const fail = out.crashes.length + out.softlocks.length + out.invariants.length + out.levelErrors.length;
console.log(fail ? `STRESS FAILED (${fail} problems)` : 'STRESS PASSED'); process.exit(fail ? 1 : 0);
