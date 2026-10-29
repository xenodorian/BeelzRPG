// Headless test for builder/index.html (rules v0.2). Run: npm i jsdom && node tools/builder_test.js
// Checks: no JS errors; the 8 examples (Dree L1/L4/L7 from ch 13, five pregens from ch 11) match their expected numbers;
// 3,000 random characters are legal at L1-10; illegal builds are rejected (Form, dump, gates, pick counts, Signatures...);
// Evolution numbers (stats, die, Prime, Signatures, exclusive nodes); v0.1 save migration; DOM events;
// regression tests R1-R14 from the Builder Sanity Check (Current_Work.md). Browser flows: tools/builder_flows.js (Playwright).
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '../builder/index.html'), 'utf8');
const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(String(e.stack || e))); vc.on('error', e => errs.push('console.error ' + e));
const dom = new JSDOM(html, { runScripts: 'dangerously', virtualConsole: vc, url: 'http://localhost/BeelzRPG/builder/index.html', pretendToBeVisual: true });
const w = dom.window; w.alert = () => {}; w.scrollTo = () => {}; w.confirm = () => true; w.prompt = () => 'T';
(async () => { await new Promise(r => { if (w.document.readyState === 'complete') r(); else w.addEventListener('load', () => r()); });
const B = w.MutagenBuilder; const M = dom.window.eval('MUTAGEN');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m); } };
const change = (sel, val) => { const el = w.document.querySelector(sel); if (!el) { ok(false, 'missing ' + sel); return; } if (el.type === 'checkbox' || el.type === 'radio') el.checked = val !== false; else el.value = val; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
function visitAll() { for (let i = 0; i < 8; i++) B.goto(i); }
const ex = k => B.fromExample(k);
// ---- Examples ----
for (const k of Object.keys(M.examples)) {
  B.state = ex(k); visitAll();
  const d = B.derive(B.state), x = M.examples[k].expect;
  const got = { hp: d.hp, armor: d.armor, speed: d.speed, dodge: d.def.dodge, endure: d.def.endure, resist: d.def.resist, limit: d.limit, scrip: d.gear.scrip, die: d.die, prime: d.prime, wild: d.wild, sigs: d.sigs.length };
  for (const key in x) ok(got[key] === x[key], `${k} ${key}: got ${got[key]} want ${x[key]}`);
  ok(d.legal, `${k} legal: ${JSON.stringify(d.errors)}`);
  ok(!d.warnings.length, `${k} no warnings: ${JSON.stringify(d.warnings)}`);
}
{ const d = B.derive(ex('dree7')); const sp = d.gear.attacks.find(a => a.name === 'Mind Spike');
  ok(sp.atk === 12 && sp.dmg === '4d8+8', 'Dree L7 Mind Spike +12 4d8+8 (ch 13): ' + sp.atk + ' ' + sp.dmg);
  ok(/^\+12 \(Chutzpah\) · 5d6 Psychic/.test(d.sigs[0].line), 'Broadcast +12 5d6 (ch 13): ' + d.sigs[0].line);
  ok(/^\+12 \(Chutzpah\) · 7d8\+8/.test(d.surges[8].line), 'Blackout +12 7d8+8 (ch 13)'); }
{ const d = B.derive(ex('dree4')); ok(/^\+5 \(Moxie\) · 5d8\+3 Shock/.test(d.surges[5].line), 'Overvolt +5 5d8+3 (ch 13): ' + d.surges[5].line); }
// ---- Random legality ----
let rn = 0;
for (let L = 1; L <= 10; L++) for (let i = 0; i < 300; i++) {
  const s = B.randomChar(L); const d = B.derive(s); rn++;
  if (!d.legal) { fail++; if (fail < 10) console.log('RANDOM ILLEGAL L' + L, s.form, JSON.stringify(d.errors)); }
  if (d.nodes.length !== 2 * L + 4 + (L >= 7 ? 2 : L >= 4 ? 1 : 0)) { fail++; console.log('RANDOM node total L' + L, d.nodes.length); }
  if (i < 2) { B.state = s; visitAll(); }
}
for (const f of M.forms) for (const L of [1, 4, 7, 10]) { const d = B.derive(B.randomChar(L, f.id)); ok(d.legal && d.form.id === f.id, `random ${f.id} L${L}`); }
console.log('random checked', rn);
// ---- Negative tests ----
const neg = (desc, base, mut, re) => { const s = ex(base); mut(s); const d = B.derive(s); ok(d.errors.some(e => re.test(e.m)), 'neg ' + desc + ' -> ' + JSON.stringify(d.errors.map(e => e.m))); };
neg('no form', 'dree1', s => { s.form = ''; }, /Choose a Base Form/);
neg('no dump', 'dree1', s => { s.dumpZero = ''; }, /dump stat gets \+0/);
neg('tier II at L3', 'dree1', s => { s.level = 3; s.nodes.push('psychicscream', 'ironwill', 'wallrun', 'springlegs'); }, /Tier II: level 4/);
neg('tier II with 2 nodes', 'dree4', s => { s.nodes = s.nodes.filter(x => !['wallrun'].includes(x)); s.nodes.push('grapnel'); s.nodes = s.nodes.filter(x => x !== 'slipstream'); s.nodes.push('lashtail'); }, /Tier II: needs 3/);
neg('apex early', 'dree4', s => { s.nodes = s.nodes.filter(x => x !== 'psychicscream'); s.nodes.push('hivemind'); }, /Apex: level 7/);
neg('apex in tertiary', 'dree7', s => { s.nodes = s.nodes.filter(x => !['arcjump', 'afterimage', 'overclock', 'wallrun'].includes(x)); s.nodes.push('extraarm', 'lashtail', 'crushergrip', 'flurry'); }, /Apex: only in your primary or secondary/);
neg('apex needs 6', 'dree7', s => { s.nodes = s.nodes.filter(x => !['puppet', 'glamour', 'psychicscream'].includes(x)); s.nodes.push('extraarm', 'lashtail', 'crushergrip'); }, /Apex: needs 6/);
neg('foreign tree', 'dree1', s => { s.nodes[1] = 'plating'; }, /primary/);
neg('too few primary', 'dree1', s => { s.nodes = s.nodes.filter(x => x !== 'intrude'); }, /more Mind \(primary\)/);
neg('too many primary', 'dree1', s => { s.nodes.push('ironwill'); }, /Too many primary/);
neg('secondary < 2', 'dree1', s => { s.nodes = s.nodes.filter(x => x !== 'slipstream'); s.nodes.push('springlegs'); }, /secondary tree \(Wiring\) needs at least 2/);
neg('tertiary root missing', 'dree1', s => { s.nodes = s.nodes.filter(x => x !== 'naturalweapons'); s.nodes.push('wallrun'); }, /tertiary tree \(Limbs\) needs at least 1/);
neg('no root', 'dree1', s => { s.nodes = s.nodes.filter(x => x !== 'quickened'); s.nodes.push('wallrun'); }, /Root/);
neg('no material', 'dree1', s => { delete s.trees.wiring; }, /Bio or Chrome/);
neg('locked part', 'dree1', s => { s.surges[0].effect = 'glare'; }, /Senses Root/);
neg('infuse dmg', 'dree1', s => { s.surges[0].shape = 'infuse'; }, /Infuse/);
neg('two twists r1', 'dree1', s => { s.surges[0].twists = ['sure', 'hush']; }, /max 1 Twist/);
neg('chain on wave', 'dree1', s => { s.surges[0].twists = ['chain']; }, /Strike or Bolt/);
neg('too many surges', 'dree1', s => { s.surges.push({ name: 'x', shape: 'bolt', effect: 'kinetic', twists: [] }); }, /You know 3/);
neg('scrip', 'dree1', s => { s.buy.damper = 5; }, /Not enough Scrip/);
neg('scope melee', 'dree1', s => { s.buyWeapons = [{ frame: 'standard', mod: 'scope' }]; s.scripAdj = 500; }, /only fits ranged/);
neg('signature at L1', 'dree1', s => { s.signatures = [{ name: 'x', shape: 'bolt', effect: 'dread', twists: [] }]; }, /1 Signature|0 Signature/);
neg('2nd signature at L4', 'dree4', s => { s.signatures.push({ name: 'x', shape: 'bolt', effect: 'dread', twists: [] }); }, /1 Signature/);
ok(B.normalize({ signatures: [1, 2, 3].map(() => ({ shape: 'bolt', effect: 'kinetic' })) }).signatures.length === 2, 'normalize caps Signatures at 2');
neg('signature locked part', 'dree4', s => { s.signatures[0].effect = 'toxin'; }, /Signature 1.*Glands Root/);
// ---- Evolution and v0.2 rules ----
for (const f of M.forms) {
  const s = B.randomChar(1, f.id); const st = L => { s.level = L; return B.derive(s).st; };
  const a = st(3), b = st(4), c = st(7), z = s.dumpZero, m = f.dumps.find(x => x !== z);
  ok([a[f.primary], a[f.secondary], a[f.tertiary], a[z], a[m]].join() === '3,2,1,0,-1', f.id + ' base stats');
  ok([b[f.primary], b[f.secondary], b[f.tertiary], b[z], b[m]].join() === '5,3,2,1,0', f.id + ' Evo I stats (+2 primary, +1 others)');
  ok([c[f.primary], c[f.secondary], c[f.tertiary], c[z], c[m]].join() === '8,4,3,2,1', f.id + ' Evo II stats (+3 primary, +1 others)');
}
{ const P = L => B.derive(B.randomChar(L)); const t = [1, 3, 4, 6, 7, 10].map(L => { const d = P(L); return [L, d.die, d.prime, d.sigMax, d.evo.length].join(':'); }).join(' ');
  ok(t === '1:4:2:0:0 3:6:2:0:0 4:8:3:1:1 6:8:3:1:1 7:12:4:2:2 10:12:4:2:2', 'die/Prime/Signatures/Evolution nodes by level: ' + t); }
{ const p = [8, 9, 10].map(L => { const x = B.picks(L); return x.prim + '+' + x.secTert; }).join(); ok(p === '10+10,10+12,10+14', 'overflow picks L8-10: ' + p); }
{ const s = ex('rook'); s.level = 4; s.nodes.push('anchor', 'shouldercheck', 'adaptive', 'grapnel', 'springlegs', 'regenerate'); s.armor = 'heavy'; s.shield = true; s.scripAdj = 2000; const d = B.derive(s);
  ok(d.legal, 'Rook L4 legal ' + JSON.stringify(d.errors.map(e => e.m))); ok(d.nodes.includes('siegehide') && d.armorMax === 6 && d.armor === 5, 'Siege Hide armor +1, max 6: ' + d.armor + '/' + d.armorMax); }
{ const s = ex('juno'); s.level = 7; s.nodes.push('analyzer', 'echolocation', 'longsight', 'weakspot', 'spotter', 'deadeye', 'commandingvoice', 'readtheroom', 'slipstream', 'wallrun', 'capacitor', 'intrude'); const d = B.derive(s);
  ok(d.legal, 'Juno L7 legal ' + JSON.stringify(d.errors.map(e => e.m))); const r = d.gear.attacks.find(a => a.name === 'Rifle');
  ok(r.crit === '17–20' && d.nodes.includes('thousandeyes') && d.nodes.includes('foresight'), 'Deadeye + Thousand Eyes crit 17-20: ' + r.crit);
  ok(/Crit 17–20/.test(d.surges[0].line), 'ranged Surge crit 17-20'); }
{ const s = ex('vex'); s.level = 4; s.nodes.push('reflexspike', 'wallrun', 'overclock', 'grapnel', 'rend', 'targetlock'); s.nodes = s.nodes.filter(x => x !== 'targetlock'); s.nodes.push('lashtail'); const d = B.derive(s);
  const nw = d.gear.attacks.find(a => a.name === 'Natural weapons'); ok(nw.dmg === '2d10+5', 'Rend d10 at Rank 2: ' + nw.dmg + ' ' + JSON.stringify(d.errors.map(e => e.m))); }
{ const s = ex('ozzie'); s.level = 4; s.nodes.push('regenerate', 'adrenaldump', 'catalyst', 'barbs', 'anchor', 'intrude'); const d = B.derive(s); ok(d.legal && /d8 Corrode/.test(d.surges[1].line), 'Catalyst Burst d8: ' + d.surges[1].line); }
{ const d = B.derive(ex('dree1')); ok(d.surges[1].stat === 'moxie', 'Bolt + Shock may use Moxie (Wiring tree stat)'); ok(d.surges[2].stat === 'chutzpah', 'Bolt + Dread uses Chutzpah (Mind)'); }
{ const s = ex('rook'); s.surges[0] = { name: 'k', shape: 'bolt', effect: 'kinetic', twists: [] }; const d = B.derive(s); ok(d.surges[0].stat === 'nerve', 'Kinetic uses the Shape stat only'); }
{ const s = ex('dree4'); s.origin = 'escapee'; s.knacks = s.knacks.slice(0, 3); const d = B.derive(s); ok(d.known === 7 && d.sigMax === 1, 'Lab Escapee +1 known, no extra Signature'); }
{ const s = ex('dree4'); s.trees.mind = 'chrome'; const d = B.derive(s); ok(d.sigs[0].fw === false && d.surges[2].fw === true, 'Firmware never swaps Signatures'); }
{ const d = B.derive(ex('dree7')); ok(d.known === 9 && d.wild === 3, 'Signatures do not count toward known or Wild'); }
{ const s = ex('dree1'); s.trees.mind = 'chrome'; const d = B.derive(s); ok(d.material === 'splice' && d.limit === 4, 'Splice Limit floor stays 4 then -1? ' + d.limit); }
// ---- v0.1 migration ----
{ const old = { v: 1, name: 'Old Dree', level: 5, stats: { moxie: 3, nerve: 2, gumption: 1, grit: 0, chutzpah: -1 }, boosts: { 3: ['nerve', 'grit'] }, origin: 'militia', knacks: ['A', 'B'], trees: { wiring: 'chrome', glands: 'bio' }, nodes: ['quickened', 'overclock', 'spit'], surges: [{ name: 'Jolt', shape: 'bolt', effect: 'shock', twists: [] }], kit: 'gunhand', drive: { why: 'w' } };
  const m = B.normalize(old); ok(m.migrated && !m.form && !m.nodes.length && !Object.keys(m.trees).length && m.surges.length === 1 && m.name === 'Old Dree' && m.kit === 'gunhand' && m.level === 5 && m.drive.why === 'w', 'v0.1 migrate keeps identity/gear/Surges, resets nodes');
  B.state = old; B.goto(1); ok(/Imported from v0.1/.test(w.document.getElementById('panel').textContent), 'migration banner'); ok(B.derive(B.state).warnings.some(x => /v0.1/.test(x.m)), 'migration warning');
  change('input[data-k="form"][value="skitter"]'); ok(B.state.form === 'skitter' && !B.state.migrated, 'choosing a Form clears the migration flag');
  ok(B.normalize(JSON.parse(JSON.stringify(B.state))).form === 'skitter', 'v0.2 save round-trips'); }
// ---- DOM flows ----
B.state = B.blank(); B.goto(1);
change('input[data-k="form"][value="juggernaut"]'); ok(B.state.form === 'juggernaut', 'dom Form radio');
change('input[data-k="dumpZero"][value="moxie"]'); ok(B.state.dumpZero === 'moxie' && B.derive(B.state).st.gumption === -1, 'dom dump radio');
B.goto(3); change('input[data-node="plating"]'); ok(B.state.nodes.includes('plating') && B.state.trees.hide === 'bio', 'dom node click');
ok(!w.document.querySelector('input[data-node="keen"]'), 'only the Form\'s trees are shown');
ok(w.document.querySelector('input[data-node="adaptive"]').disabled, 'Tier II disabled at L1');
B.goto(1); change('input[data-k="form"][value="alembic"]'); ok(B.state.nodes.includes('plating') && B.state.trees.hide === 'bio', 'Form change keeps shared-tree nodes');
B.goto(1); change('input[data-k="form"][value="skitter"]'); ok(!B.state.nodes.length && !B.state.trees.hide, 'Form change drops foreign-tree nodes');
B.state = ex('dree4'); B.goto(4); w.document.querySelector('[data-act="delsig"]').click(); ok(!B.state.signatures.length, 'dom remove Signature');
w.document.querySelector('[data-act="addsig"]').click(); ok(B.state.signatures.length === 1, 'dom add Signature');
change('select[data-k="signatures.0.shape"]', 'bolt'); change('select[data-k="signatures.0.effect"]', 'dread'); change('input[data-twist="s0"][value="sure"]'); ok(B.state.signatures[0].effect === 'dread' && B.state.signatures[0].twists.join() === 'sure', 'dom Signature parts + Twist');
B.goto(3); ok(w.document.querySelectorAll('.node.evo.on').length === 1 && /Siren Song/.test(w.document.querySelector('.node.evo.on').textContent), 'Evolution node shown as granted');
B.goto(7); const sheetTxt = w.document.getElementById('printArea').textContent; ok(/Diva/.test(sheetTxt) && /Signature Surges/.test(sheetTxt) && /Siren Song/.test(sheetTxt), 'sheet shows stage, Signatures, Evolution node');
{ B.state = ex('dree7'); const s = B.state; s.level = 10; s.nodes.push('precog', 'blur', 'manyhands', 'pounce', 'lashtail', 'extraarm'); B.state = s; B.goto(7); const t = w.document.getElementById('printArea').textContent; ok(/Final Form \(Crowned\)/.test(t) && /Chutzpah becomes \+10/.test(t), 'L10 sheet Final Form'); ok(B.derive(B.state).legal, 'Dree L10 legal ' + JSON.stringify(B.derive(B.state).errors.map(e => e.m))); }
ok(w.document.querySelectorAll('#exSel option').length === Object.keys(M.examples).length + 1, 'example menu lists every example');
w.document.getElementById('btnRandom').click(); ok(B.state.name && B.derive(B.state).legal, 'random button');
w.document.getElementById('btnSave').click(); ok(w.document.querySelectorAll('#loadSel option').length === 2, 'save slot');
// ---- Regression tests from the Builder Sanity Check (2026-10-28), adapted to v0.2 ----
for (const bad of [{ form: 'siren', trees: { mind: 'bio" data-x="1' }, nodes: ['uplink'] }, { surges: 'abc', nodes: 5, scars: {}, knacks: 'k', signatures: 'x' }, { armor: 'mithril', kitMods: { 0: 'laser' }, kit: 'gunhand' }, { level: '99', form: 'dragon', dumpZero: 'grit' }, { form: 'oracle', surges: [{ shape: 'bolt', effect: 'kinetic', twists: 'sure' }, null, 7], signatures: [null, { shape: 'nope' }] }, { buyWeapons: [{ frame: 'natural' }, { frame: 'nope' }], buy: { stim: -4, fake: 2 }, drive: 5 }]) {
  let threw = false; try { B.state = bad; visitAll(); } catch (e) { threw = e.message; }
  ok(!threw, 'R1 import renders: ' + JSON.stringify(bad).slice(0, 50) + ' ' + threw);
  ok(!w.document.querySelector('[data-x]'), 'R1 no attribute injection');
}
{ let threw = false; try { B.normalize([1, 2]); } catch (e) { threw = true; } ok(threw, 'R1 arrays rejected'); }
{ const x = B.normalize({ v: 2, level: 99, form: 'oracle', dumpZero: 'moxie', trees: { hide: 'bio', senses: 'steel', mind: 'chrome' }, nodes: ['keen', 'plating', 'foresight'] }); ok(x.level === 10 && x.dumpZero === '' && !x.trees.hide && !x.trees.senses && x.trees.mind === 'chrome' && x.nodes.join() === 'keen', 'R1 coercion (foreign trees, Evolution nodes, bad dump dropped)'); }
{ const s = ex('vex'); const d = B.derive(s); ok(/Capacitor/.test(d.gear.attacks.find(a => a.name === 'Unarmed').notes), 'R2 unarmed gets Capacitor'); }
{ const s = ex('juno'); s.level = 7; s.nodes.push('analyzer', 'echolocation', 'longsight', 'weakspot', 'spotter', 'deadeye', 'commandingvoice', 'readtheroom', 'slipstream', 'wallrun', 'capacitor', 'intrude'); const d = B.derive(s); ok(/240 ft/.test(d.surges[0].line) || /120 ft/.test(d.surges[0].line), 'R3 Long Sight on Bolt: ' + d.surges[0].line); }
{ const d = B.derive(ex('dree7')); ok(/reach 10 ft/.test(d.gear.attacks.find(a => a.name === 'Natural weapons').range), 'R4 Grapnel reach'); }
{ const s = ex('dree1'); s.surges.push({ name: 'Brood Web', shape: 'burst', effect: 'snare', twists: [], sample: true }); const d = B.derive(s); ok(d.gear.scrip === -25 && d.wild === 0, 'R5 sample splice cost 100 + fills Wild'); }
{ const s = ex('dree1'); s.injuries = ['ribs', 'gland', 'tornleg']; const d = B.derive(s); ok(d.hp === 5 && d.limit === 2 && d.speed === 30, 'R6 injuries ' + [d.hp, d.limit, d.speed]); }
for (const [from, L] of [['dree7', 1], ['dree7', 4], ['dree7', 6], ['dree4', 3], ['dree4', 1]]) { const s = ex(from); s.level = L; B.state = s; B.trimToLevel(); const d = B.derive(B.state); ok(d.legal || d.errors.every(e => /more/.test(e.m)), `R7 trim ${from} to L${L} ` + JSON.stringify(d.errors.map(e => e.m))); }
{ let bad = []; for (let i = 0; i < 400; i++) { const from = 2 + (i % 9); const s = B.randomChar(from); s.level = 1 + (i * 7) % (from - 1); B.state = s; B.trimToLevel(); const d = B.derive(B.state); if (!d.legal && !d.errors.every(e => /more/.test(e.m))) bad.push(from + '->' + s.level + ' ' + d.errors.map(e => e.m).join('; ')); } ok(!bad.length, 'R7 trim 400 random level-downs ' + bad.slice(0, 3).join(' | ')); }
{ const s = ex('rook'); s.armor = 'heavy'; s.shield = true; s.scars = ['drainedcell']; s.scripAdj = 500; const d = B.derive(s); const wn = d.warnings.find(x => /capped/.test(x.m)); ok(wn && wn.step === 5, 'R8 armor warning step'); }
{ const s = ex('dree4'); s.knacks = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']; B.state = s; B.goto(7); ok(w.document.querySelector('#printArea').textContent.includes('a7'), 'R9 knacks on sheet'); }
{ B.state = ex('dree4'); B.goto(4); const sl = w.document.querySelector('select[data-k="surges.5.shape"]'); sl.value = 'strike'; sl.dispatchEvent(new w.Event('change', { bubbles: true })); ok(B.state.surges[5].twists.join() === 'overcharge', 'R10 twists kept ' + B.state.surges[5].twists); }
{ B.goto(0); const sl = w.document.querySelector('select[data-k="level"]'); sl.focus(); sl.value = '5'; sl.dispatchEvent(new w.Event('change', { bubbles: true })); ok(w.document.activeElement && w.document.activeElement.dataset.k === 'level', 'R11 focus restored'); }
{ B.goto(1); w.document.querySelector('#nextB').click(); ok(/#step-3/.test(w.location.hash), 'R12 hash ' + w.location.hash); }
{ const orig = w.Storage.prototype.setItem; w.Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; B.render(); ok(/Autosave off/.test(w.document.getElementById('saveNote').textContent), 'R13 storage note'); w.Storage.prototype.setItem = orig; B.render(); ok(!w.document.getElementById('saveNote').textContent, 'R13 note clears'); }
{ for (const k of ['dree7', 'dree1']) { B.state = ex(k); for (let i = 0; i < 8; i++) { B.goto(i); const u = [...w.document.querySelectorAll('#app input:not([hidden]), #app select, #app textarea, #app button')].filter(e => !e.closest('label') && !e.getAttribute('aria-label') && !e.title && !(e.tagName === 'BUTTON' && e.textContent.trim())); ok(!u.length, `R14 unlabelled on ${k} step ${i}: ` + u.map(e => e.dataset.k || e.id)); } } }
console.log('JS errors:', errs.length); errs.slice(0, 5).forEach(e => console.log(e));
console.log(`${n} checks`); console.log(fail ? `FAILURES: ${fail}` : 'ALL TESTS PASSED');
process.exit(fail || errs.length ? 1 : 0); })();
