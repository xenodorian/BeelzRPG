// Headless test for builder/index.html. Run: npm i jsdom && node tools/builder_test.js
// Checks: no JS errors, guide worked example (Dree L1/L5) numbers, 3,000 random characters legal at L1-10, illegal builds rejected, DOM events,
// plus regression tests R1-R14 from the Builder Sanity Check (see Current_Work.md). Browser flows: tools/builder_flows.js (Playwright).
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '../builder/index.html'), 'utf8');
const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(String(e.stack||e))); vc.on('error', e => errs.push('console.error '+e));
const dom = new JSDOM(html, { runScripts: 'dangerously', virtualConsole: vc, url: 'http://localhost/BeelzRPG/builder/index.html', pretendToBeVisual: true });
const w = dom.window; w.alert = () => {}; w.scrollTo = () => {}; w.confirm = () => true; w.prompt = () => 'T';
(async()=>{ await new Promise(r=>{ if (w.document.readyState==='complete') r(); else w.addEventListener('load',()=>r()); });
const B = w.MutagenBuilder; const M = w.MUTAGEN || dom.window.eval('MUTAGEN');
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
// visit every step for every example + random
function visitAll() { for (let i = 0; i < 8; i++) B.goto(i); }
for (const k of ['dree1', 'dree5']) {
  B.state = B.fromExample(k); visitAll();
  const d = B.derive(B.state), x = M.examples[k].expect;
  const got = { hp: d.hp, armor: d.armor, speed: d.speed, dodge: d.def.dodge, endure: d.def.endure, resist: d.def.resist, limit: d.limit, scrip: d.gear.scrip, die: d.die, prime: d.prime, wild: d.wild };
  for (const key in x) ok(got[key] === x[key], `${k} ${key}: got ${got[key]} want ${x[key]}`);
  ok(d.legal, `${k} legal: ${JSON.stringify(d.errors)}`);
  console.log(k, JSON.stringify(got), 'warn:', d.warnings.map(w => w.m));
  d.surges.forEach(s => console.log('  ', s.slot, s.name, s.build, s.flux, s.fw ? 'FW' : '', '|', s.line));
  d.gear.attacks.forEach(a => console.log('   atk', a.name, a.atk, a.dmg, a.crit, a.range, a.notes));
}
// random legality
let n = 0;
for (let L = 1; L <= 10; L++) for (let i = 0; i < 300; i++) {
  const s = B.randomChar(L); const d = B.derive(s); n++;
  if (!d.legal) { fail++; if (fail < 10) console.log('RANDOM ILLEGAL L' + L, JSON.stringify(d.errors)); }
  if (i < 3) { B.state = s; visitAll(); }
}
console.log('random checked', n);
// negative tests
const neg = (desc, mut, re) => { const s = B.fromExample('dree1'); mut(s); const d = B.derive(s); ok(d.errors.some(e => re.test(e.m)), 'neg ' + desc + ' -> ' + JSON.stringify(d.errors.map(e=>e.m))); };
neg('dup stat', s => s.stats.grit = 3, /exactly once/);
neg('apex early', s => { s.nodes = ['quickened', 'blur']; }, /Apex/);
neg('no root', s => { s.nodes = ['quickened', 'thick']; }, /Root/);
neg('too few nodes', s => { s.nodes = ['quickened']; }, /more Augment/);
neg('locked part', s => { s.surges[0].effect = 'glare'; }, /Senses Root/);
neg('infuse dmg', s => { s.surges[0].shape = 'infuse'; }, /Infuse/);
neg('two twists r1', s => { s.surges[0].twists = ['sure', 'hush']; }, /max 1 Twist/);
neg('chain on burst', s => { s.surges[1].twists = ['chain']; }, /Strike or Bolt/);
neg('too many surges', s => { s.surges.push({ name: 'x', shape: 'bolt', effect: 'kinetic', twists: [] }); }, /You know 3/);
neg('scrip', s => { s.buy.damper = 5; }, /Not enough Scrip/);
neg('boost same', s => { s.level = 3; s.nodes.push('overclock', 'purge'); s.boosts = { 3: ['grit', 'grit'] }; }, /different/);
neg('scope melee', s => { s.buyWeapons = [{ frame: 'standard', mod: 'scope' }]; s.scripAdj = 500; }, /only fits ranged/);
neg('no form', s => { delete s.trees.wiring; }, /Bio or Chrome/);
// sample allowed in wild slot
{ const s = B.fromExample('dree1'); s.surges.push({ name: 'Brood Web', shape: 'burst', effect: 'snare', twists: [], sample: true }); s.scripAdj = 100; const d = B.derive(s); ok(d.legal && d.wild === 0, 'sample legal ' + JSON.stringify(d.errors)); }
// lab escapee
{ const s = B.fromExample('dree1'); s.origin = 'escapee'; s.knacks = ['a','b']; const d = B.derive(s); ok(d.known === 4, 'escapee known 4'); }
// splice limit floor: nerve -1 splice
{ const s = B.fromExample('dree1'); s.stats = { nerve: -1, moxie: 3, gumption: 2, grit: 1, chutzpah: 0 }; const d = B.derive(s); ok(d.limit === 3, 'splice floor limit ' + d.limit); }
// thick + level 10 + final form
{ const s = B.randomChar(10); const d = B.derive(s); ok(d.die === 12 && d.prime >= 3, 'l10'); }
// UI interaction: click node checkbox via DOM
B.state = B.blank(); B.goto(3);
const cb = w.document.querySelector('input[data-node="plating"]'); cb.checked = true; cb.dispatchEvent(new w.Event('change', { bubbles: true }));
ok(B.state.nodes.includes('plating') && B.state.trees.hide === 'bio', 'dom node click');
B.goto(1); const st = w.document.querySelector('select[data-k="stats.grit"]'); st.value = '3'; st.dispatchEvent(new w.Event('change', { bubbles: true })); ok(B.state.stats.grit === 3, 'dom stat select');
w.document.getElementById('btnRandom').click(); ok(B.state.name, 'random button');
w.document.getElementById('btnSave').click(); ok(w.document.querySelectorAll('#loadSel option').length === 2, 'save slot');
// ---- Regression tests from the Builder Sanity Check (2026-10-28) ----
// R1 malformed / hostile imports never break rendering
for (const bad of [{ trees: { hide: 'bio" data-x="1' }, nodes: ['plating'] }, { surges: 'abc', nodes: 5, scars: {}, knacks: 'k' }, { armor: 'mithril', kitMods: { 0: 'laser' }, kit: 'gunhand' }, { level: '99', stats: { grit: '9' } }, { surges: [{ shape: 'bolt', effect: 'kinetic', twists: 'sure' }, null, 7] }, { buyWeapons: [{ frame: 'natural' }, { frame: 'nope' }], buy: { stim: -4, fake: 2 }, drive: 5 }]) {
  let threw = false; try { B.state = bad; visitAll(); } catch (e) { threw = e.message; }
  ok(!threw, 'R1 import renders: ' + JSON.stringify(bad).slice(0, 50) + ' ' + threw);
  ok(!w.document.querySelector('[data-x]'), 'R1 no attribute injection');
}
{ let threw = false; try { B.normalize([1, 2]); } catch (e) { threw = true; } ok(threw, 'R1 arrays rejected'); }
{ const n = B.normalize({ level: 99, stats: { grit: 9, moxie: '2' }, trees: { hide: 'steel' } }); ok(n.level === 10 && n.stats.grit === null && n.stats.moxie === 2 && !n.trees.hide, 'R1 coercion'); }
// R2 melee bonus dice apply to Unarmed too (Extra Arm / Capacitor: "a melee attack")
{ const s = B.fromExample('dree1'); s.level = 2; s.nodes = ['quickened', 'spit', 'capacitor']; s.surges.push({ name: 'x', shape: 'strike', effect: 'kinetic', twists: [] }); const d = B.derive(s); ok(/Capacitor/.test(d.gear.attacks.find(a => a.name === 'Unarmed').notes), 'R2 unarmed gets Capacitor'); }
// R3 Deadeye crit shows on ranged Surges; R4 Grapnel reach on Strike Surges
{ const s = B.randomChar(7); s.trees = { senses: 'bio', limbs: 'bio' }; s.nodes = ['keen', 'targetlock', 'analyzer', 'longsight', 'deadeye', 'naturalweapons', 'grapnel', 'springlegs']; s.surges = [{ name: 'a', shape: 'bolt', effect: 'glare', twists: [] }, { name: 'b', shape: 'strike', effect: 'snare', twists: [] }]; const d = B.derive(s);
  ok(/Crit 18/.test(d.surges[0].line) && /120 ft/.test(d.surges[0].line), 'R3 Deadeye + Long Sight on Bolt'); ok(/reach 10 ft/.test(d.surges[1].line), 'R4 Grapnel reach on Strike'); }
// R5 Sample splice costs 100 Scrip
{ const s = B.fromExample('dree1'); s.surges.push({ name: 'Brood Web', shape: 'burst', effect: 'snare', twists: [], sample: true }); ok(B.derive(s).gear.scrip === -75, 'R5 sample splice cost'); }
// R6 Injuries change numbers
{ const s = B.fromExample('dree1'); s.injuries = ['ribs', 'gland', 'tornleg']; const d = B.derive(s); ok(d.hp === 7 && d.limit === 4 && d.speed === 30, 'R6 injuries ' + [d.hp, d.limit, d.speed]); }
// R7 "Fit picks to level" after lowering the level makes the character legal again
for (const L of [1, 2, 3, 4]) { const s = B.fromExample('dree5'); s.level = L; B.state = s; B.trimToLevel(); const d = B.derive(B.state); ok(d.legal || d.errors.every(e => /more Augment/.test(e.m)), 'R7 trim to L' + L + ' ' + JSON.stringify(d.errors.map(e => e.m))); }
{ let bad = []; for (let i = 0; i < 400; i++) { const from = 2 + (i % 9), to = 1 + (i * 7) % (from - 1 || 1); const s = B.randomChar(from); s.level = Math.min(to, from - 1) || 1; B.state = s; B.trimToLevel(); const d = B.derive(B.state); if (!d.legal && !d.errors.every(e => /more Augment/.test(e.m))) bad.push(from + '->' + s.level + ' ' + d.errors.map(e => e.m).join('; ')); } ok(!bad.length, 'R7 trim 400 random level-downs legal ' + bad.slice(0, 3).join(' | ')); }
// R8 armor-cap warning points at the Gear step (5), not Extras
{ const s = B.fromExample('dree5'); s.armor = 'heavy'; s.shield = true; s.scars = ['drainedcell']; s.trees.hide = 'bio'; s.nodes = s.nodes.slice(0, 5).concat('plating'); const d = B.derive(s); const wn = d.warnings.find(x => /capped/.test(x.m)); ok(wn && wn.step === 5, 'R8 armor warning step'); }
// R9 sheet shows every Knack (Blossoms beyond 5)
{ const s = B.fromExample('dree5'); s.knacks = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']; B.state = s; B.goto(7); ok(w.document.querySelector('#printArea').textContent.includes('a6'), 'R9 knacks on sheet'); }
// R10 changing a Surge's Shape keeps Twists that still fit
{ B.state = B.fromExample('dree5'); B.goto(4); const sl = w.document.querySelector('select[data-k="surges.4.shape"]'); sl.value = 'strike'; sl.dispatchEvent(new w.Event('change', { bubbles: true })); ok(B.state.surges[4].twists.join() === 'overcharge', 'R10 twists kept ' + B.state.surges[4].twists); }
// R11 focus survives a re-render (keyboard users)
{ B.goto(1); const sl = w.document.querySelector('select[data-k="stats.grit"]'); sl.focus(); sl.value = '1'; sl.dispatchEvent(new w.Event('change', { bubbles: true })); ok(w.document.activeElement && w.document.activeElement.dataset.k === 'stats.grit', 'R11 focus restored'); }
// R12 step is in the URL hash (refresh/back keep your place)
{ w.document.querySelector('#nextB').click(); ok(/#step-3/.test(w.location.hash), 'R12 hash ' + w.location.hash); }
// R13 storage failure is reported, app keeps working
{ const orig = w.Storage.prototype.setItem; w.Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; B.render(); ok(/Autosave off/.test(w.document.getElementById('saveNote').textContent), 'R13 storage note'); w.Storage.prototype.setItem = orig; B.render(); ok(!w.document.getElementById('saveNote').textContent, 'R13 note clears'); }
// R14 every form control has an accessible name
{ B.state = B.fromExample('dree5'); for (let i = 0; i < 8; i++) { B.goto(i); const n = [...w.document.querySelectorAll('#app input:not([hidden]), #app select, #app textarea, #app button')].filter(e => !e.closest('label') && !e.getAttribute('aria-label') && !e.title && !(e.tagName === 'BUTTON' && e.textContent.trim())); ok(!n.length, 'R14 unlabelled on step ' + i + ': ' + n.map(e => e.dataset.k || e.id)); } }
console.log('JS errors:', errs.length); errs.slice(0, 5).forEach(e => console.log(e));
console.log(fail ? `FAILURES: ${fail}` : 'ALL TESTS PASSED');
process.exit(fail || errs.length ? 1 : 0); })();
