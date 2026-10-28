// Headless test for builder/index.html. Run: npm i jsdom && node tools/builder_test.js
// Checks: no JS errors, guide worked example (Dree L1/L5) numbers, 3,000 random characters legal at L1-10, illegal builds rejected, DOM events.
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '../builder/index.html'), 'utf8');
const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(String(e.stack||e))); vc.on('error', e => errs.push('console.error '+e));
const dom = new JSDOM(html, { runScripts: 'dangerously', virtualConsole: vc, url: 'http://localhost/BeelzRPG/builder/index.html', pretendToBeVisual: true });
const w = dom.window; w.alert = () => {}; w.confirm = () => true; w.prompt = () => 'T';
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
{ const s = B.fromExample('dree1'); s.surges.push({ name: 'Brood Web', shape: 'burst', effect: 'snare', twists: [], sample: true }); const d = B.derive(s); ok(d.legal && d.wild === 0, 'sample legal ' + JSON.stringify(d.errors)); }
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
console.log('JS errors:', errs.length); errs.slice(0, 5).forEach(e => console.log(e));
console.log(fail ? `FAILURES: ${fail}` : 'ALL TESTS PASSED');
process.exit(fail || errs.length ? 1 : 0); })();
