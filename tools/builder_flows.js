// Real-browser flow tests for builder/index.html (Playwright + Chrome/Chromium, from file://).
// Run: npm i playwright-core && CHROME=/usr/bin/google-chrome node tools/builder_flows.js   (rules v0.2)
const { chromium } = require('playwright-core');
const path = require('path');
const URL = process.env.URL || 'file://' + path.join(__dirname, '../builder/index.html');
let fail = 0; const problems = [];
const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } else console.log('ok  ', m); };
async function page(b, opts = {}) {
  const ctx = await b.newContext(opts); const p = await ctx.newPage();
  p.on('pageerror', e => problems.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') problems.push(m.type() + ': ' + m.text()); });
  p.on('dialog', d => d.accept('Flow test'));
  return p;
}
const derive = p => p.evaluate(() => { const d = MutagenBuilder.derive(MutagenBuilder.state); return { legal: d.legal, errors: d.errors.map(e => e.m), material: d.material, limit: d.limit, upkeep: d.upkeep, fw: d.surges.filter(s => s.fw).length }; });

async function flows(b) {
  const p = await page(b); await p.goto(URL);
  // Keyboard: arrowing through the dump-stat radios keeps focus on them
  await p.selectOption('#exSel', 'dree1'); await p.click('button[data-step="1"]');
  await p.focus('input[data-k="dumpZero"][value="nerve"]'); await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => document.activeElement.dataset.k === 'dumpZero' && MutagenBuilder.state.dumpZero === 'grit'), 'keyboard focus survives re-render (dump radio)');
  // Choosing a Form from scratch
  await p.click('#btnNew'); await p.click('button[data-step="1"]'); await p.check('input[data-k="form"][value="oracle"]'); await p.check('input[data-k="dumpZero"][value="gumption"]');
  ok(await p.evaluate(() => { const d = MutagenBuilder.derive(MutagenBuilder.state); return d.st.nerve === 3 && d.st.grit === -1 && !d.errors.some(e => e.step === 1); }), 'pick Oracle + dump: stats set, step 2 clean');
  // Level down flags stale picks; Fit button repairs; back up is legal again
  await p.selectOption('#exSel', 'dree7'); await p.selectOption('#lvlTop', '2');
  let d = await derive(p); ok(!d.legal && d.errors.some(e => /Too many|Tier II|Apex|Signature/.test(e)), 'level 7->2 flags extra picks');
  await p.click('button[data-act="trim"]'); d = await derive(p); ok(d.legal, 'Fit picks to level makes it legal ' + d.errors);
  await p.selectOption('#exSel', 'dree7'); await p.selectOption('#lvlTop', '2'); await p.selectOption('#lvlTop', '7');
  ok((await derive(p)).legal, 'level 7->2->7 without trimming is legal again');
  // Removing a Root removes its nodes and flags Surges that used its parts
  await p.selectOption('#exSel', 'dree4'); await p.click('button[data-step="3"]'); await p.uncheck('input[data-node="quickened"]');
  d = await derive(p); ok(await p.evaluate(() => !MutagenBuilder.state.nodes.some(n => ['slipstream', 'overclock'].includes(n))) && d.errors.some(e => /needs the Wiring Root/.test(e)), 'removing a Root drops its nodes and flags Surges');
  // Bio/Chrome switch turns Splice off and updates Limit / Upkeep / Firmware
  await p.selectOption('#exSel', 'dree4'); await p.click('button[data-step="3"]'); await p.check('input[name="mat_wiring"][value="bio"]');
  d = await derive(p); ok(d.material === 'bio' && d.limit === 7 && d.upkeep === 0 && d.fw === 0, 'Splice off: Bio, Limit 7, no Upkeep, no Firmware ' + JSON.stringify(d));
  for (const t of ['mind', 'wiring', 'limbs']) await p.check(`input[name="mat_${t}"][value="chrome"]`);
  d = await derive(p); ok(d.material === 'chrome' && d.upkeep === 75 && d.fw > 0, 'all Chrome: Upkeep 75, Firmware marks shown');
  // Reorder
  await p.selectOption('#exSel', 'dree4'); await p.click('button[data-step="4"]'); await p.click('button[data-act="down"][data-i="0"]');
  ok((await p.evaluate(() => MutagenBuilder.state.surges[1].name)) === 'Sizzle Line', 'reorder moves slot 1 down');
  // Signature: add after removing
  await p.click('button[data-act="delsig"][data-i="0"]'); await p.click('button[data-act="addsig"]');
  ok(await p.evaluate(() => MutagenBuilder.state.signatures.length === 1), 'Signature remove + add');
  // Overspend
  await p.click('button[data-step="5"]'); await p.fill('input[data-k="buy.damper"]', '99'); await p.dispatchEvent('input[data-k="buy.damper"]', 'change');
  ok((await derive(p)).errors.some(e => /Not enough Scrip/.test(e)), 'overspending is flagged');
  // v0.1 save import migrates
  await p.setInputFiles('#importFile', { name: 'old.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'mutagen-builder', rules: '0.1.1', v: 1, name: 'Old Timer', level: 3, stats: { grit: 3, moxie: 2, nerve: 1, gumption: 0, chutzpah: -1 }, boosts: { 3: ['moxie', 'nerve'] }, origin: 'militia', trees: { hide: 'bio' }, nodes: ['plating', 'thick', 'barbs', 'adaptive'], surges: [{ name: 'Slam', shape: 'strike', effect: 'kinetic', twists: [] }], kit: 'bruiser' })) });
  await p.waitForTimeout(150); await p.click('button[data-step="1"]');
  ok(await p.evaluate(() => MutagenBuilder.state.name === 'Old Timer' && MutagenBuilder.state.migrated && /Imported from v0.1/.test(document.getElementById('panel').textContent)), 'v0.1 import migrates with a banner');
  // Hostile / malformed imports
  for (const bad of ['[1,2]', 'null', 'not json', '{"form":"juggernaut","trees":{"hide":"bio\\" data-x=\\"1"},"nodes":["plating"]}', '{"surges":"abc","nodes":5,"scars":{},"knacks":"k"}', '{"surges":[{"shape":"bolt","effect":"kinetic","twists":"sure"}]}', '{"armor":"mithril","kitMods":{"0":"laser"},"kit":"gunhand"}']) {
    await p.setInputFiles('#importFile', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from(bad) }); await p.waitForTimeout(100);
    for (let i = 0; i < 8; i++) await p.evaluate(i => MutagenBuilder.goto(i), i);
    ok(await p.evaluate(() => !document.querySelector('[data-x]') && document.querySelector('#panel h2') !== null), 'import survives ' + bad.slice(0, 40));
  }
  // Reload keeps character and step; Back goes to the previous step
  await p.selectOption('#exSel', 'dree4'); await p.click('button[data-step="4"]'); await p.click('button[data-step="5"]'); await p.reload();
  ok(await p.evaluate(() => MutagenBuilder.state.name.startsWith('Dree') && document.querySelector('.stp.on').dataset.step === '5'), 'reload keeps character and step');
  await p.goBack(); ok(await p.evaluate(() => document.querySelector('.stp.on').dataset.step === '4'), 'Back button returns to previous step');
  // Long text
  await p.click('button[data-step="0"]'); await p.fill('input[data-k="name"]', 'X'.repeat(300)); await p.fill('input[data-k="concept"]', 'Y'.repeat(400));
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.getElementById('summary').scrollWidth <= document.getElementById('summary').clientWidth + 1), 'long name/concept wrap, no overflow');
  // Random then edit
  await p.click('#btnRandom'); await p.click('button[data-step="2"]'); await p.fill('input[data-k="knacks.0"]', 'Edited Knack');
  ok(await p.evaluate(() => MutagenBuilder.state.knacks[0] === 'Edited Knack' && MutagenBuilder.derive(MutagenBuilder.state).legal), 'random then edit stays legal');
  // Unlabelled controls
  await p.selectOption('#exSel', 'dree7'); let unl = [];
  for (let i = 0; i < 8; i++) { await p.evaluate(i => MutagenBuilder.goto(i), i); unl = unl.concat(await p.evaluate(() => [...document.querySelectorAll('#app input:not([hidden]), #app select, #app textarea, #app button')].filter(e => !e.closest('label') && !e.getAttribute('aria-label') && !e.title && !(e.tagName === 'BUTTON' && e.textContent.trim())).map(e => e.dataset.k || e.id))); }
  ok(!unl.length, 'every control has an accessible name ' + unl.join(' '));
  // Print page counts
  for (const [L, max] of [[1, 2], [4, 2], [7, 2], [10, 2]]) {
    await p.evaluate(L => { MutagenBuilder.state = L === 1 ? MutagenBuilder.fromExample('dree1') : L === 4 ? MutagenBuilder.fromExample('dree4') : L === 7 ? MutagenBuilder.fromExample('dree7') : MutagenBuilder.randomChar(L); }, L);
    await p.emulateMedia({ media: 'print' }); const pdf = await p.pdf({ format: 'Letter' }); await p.emulateMedia({ media: 'screen' });
    const n = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length; ok(n >= 1 && n <= max, `print L${L}: ${n} page(s) (max ${max})`);
  }
  const ms = await p.evaluate(() => { const t = performance.now(); for (let i = 0; i < 50; i++) MutagenBuilder.render(); return (performance.now() - t) / 50; });
  ok(ms < 30, 'render time ' + ms.toFixed(1) + ' ms');
}
async function mobileAndStorage(b) {
  const m = await page(b, { viewport: { width: 375, height: 800 }, isMobile: true });
  await m.goto(URL); await m.selectOption('#exSel', 'dree7'); let wide = [];
  for (let i = 0; i < 8; i++) { await m.evaluate(i => MutagenBuilder.goto(i), i); if (await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) wide.push(i); }
  ok(!wide.length, '375px: no horizontal overflow on any step ' + wide);
  const s = await page(b); await s.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }); });
  await s.goto(URL); await s.selectOption('#exSel', 'dree1');
  ok(await s.evaluate(() => /Autosave off/.test(document.getElementById('saveNote').textContent) && !!document.querySelector('#panel h2')), 'storage disabled: app works and warns');
  const q = await page(b); await q.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); }; });
  await q.goto(URL); await q.selectOption('#exSel', 'dree1');
  ok(await q.evaluate(() => /Autosave off/.test(document.getElementById('saveNote').textContent)), 'storage full: autosave warning shown');
}
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  try { await flows(b); await mobileAndStorage(b); } catch (e) { fail++; console.log('FAIL script', e.message.split('\n')[0]); }
  await b.close();
  const real = problems.filter(x => !/denied|QuotaExceeded|full/.test(x));
  ok(!real.length, 'no console errors/warnings ' + real.slice(0, 5).join(' | '));
  console.log(fail ? fail + ' FAILED' : 'ALL FLOWS PASSED'); process.exit(fail ? 1 : 0);
})();
