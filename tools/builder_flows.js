// Real-browser flow tests for builder/index.html (Playwright + Chrome/Chromium, from file://).
// Run: npm i playwright-core && CHROME=/usr/bin/google-chrome node tools/builder_flows.js
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
const derive = p => p.evaluate(() => { const d = MutagenBuilder.derive(MutagenBuilder.state); return { legal: d.legal, errors: d.errors.map(e => e.m), form: d.form, limit: d.limit, upkeep: d.upkeep, fw: d.surges.filter(s => s.fw).length }; });

async function flows(b) {
  const p = await page(b); await p.goto(URL);
  // Keyboard: changing a select keeps focus on it
  await p.selectOption('#exSel', 'dree1'); await p.click('button[data-step="1"]');
  await p.focus('select[data-k="stats.grit"]'); await p.keyboard.press('ArrowDown');
  ok(await p.evaluate(() => document.activeElement.dataset.k === 'stats.grit'), 'keyboard focus survives re-render');
  // Level down flags stale picks; Fit button repairs; back up is legal again
  await p.selectOption('#exSel', 'dree5'); await p.selectOption('#lvlTop', '2');
  let d = await derive(p); ok(!d.legal && d.errors.some(e => /Too many nodes/.test(e)), 'level 5->2 flags extra nodes');
  await p.click('button[data-act="trim"]'); d = await derive(p); ok(d.legal, 'Fit picks to level makes it legal ' + d.errors);
  await p.selectOption('#exSel', 'dree5'); await p.selectOption('#lvlTop', '2'); await p.selectOption('#lvlTop', '5');
  ok((await derive(p)).legal, 'level 5->2->5 without trimming is legal again');
  // Removing a Root removes its nodes and flags Surges that used its parts
  await p.click('button[data-step="3"]'); await p.uncheck('input[data-node="spit"]');
  d = await derive(p); ok(await p.evaluate(() => !MutagenBuilder.state.nodes.some(n => ['purge', 'stimgland'].includes(n))) && d.errors.some(e => /needs the Glands Root/.test(e)), 'removing a Root drops its nodes and flags Surges');
  // Bio/Chrome switch turns Splice off and updates Limit / Upkeep / Firmware
  await p.selectOption('#exSel', 'dree5'); await p.click('button[data-step="3"]'); await p.check('input[name="form_wiring"][value="bio"]');
  d = await derive(p); ok(d.form === 'bio' && d.limit === 10 && d.upkeep === 0 && d.fw === 0, 'Splice off: Bio, Limit 10, no Upkeep, no Firmware');
  await p.check('input[name="form_glands"][value="chrome"]'); await p.check('input[name="form_wiring"][value="chrome"]');
  d = await derive(p); ok(d.form === 'chrome' && d.upkeep === 50 && d.fw > 0, "all Chrome: Upkeep 50, Firmware marks shown");
  // Reorder
  await p.selectOption('#exSel', 'dree5'); await p.click('button[data-step="4"]'); await p.click('button[data-act="down"][data-i="0"]');
  ok((await p.evaluate(() => MutagenBuilder.state.surges[1].name)) === 'Sizzle Spit', 'reorder moves slot 1 down');
  // Overspend
  await p.click('button[data-step="5"]'); await p.fill('input[data-k="buy.damper"]', '99'); await p.dispatchEvent('input[data-k="buy.damper"]', 'change');
  ok((await derive(p)).errors.some(e => /Not enough Scrip/.test(e)), 'overspending is flagged');
  // Hostile / malformed imports
  for (const bad of ['[1,2]', 'null', 'not json', '{"trees":{"hide":"bio\\" data-x=\\"1"},"nodes":["plating"]}', '{"surges":"abc","nodes":5,"scars":{},"knacks":"k"}', '{"surges":[{"shape":"bolt","effect":"kinetic","twists":"sure"}]}', '{"armor":"mithril","kitMods":{"0":"laser"},"kit":"gunhand"}']) {
    await p.setInputFiles('#importFile', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from(bad) }); await p.waitForTimeout(100);
    for (let i = 0; i < 8; i++) await p.evaluate(i => MutagenBuilder.goto(i), i);
    ok(await p.evaluate(() => !document.querySelector('[data-x]') && document.querySelector('#panel h2') !== null), 'import survives ' + bad.slice(0, 40));
  }
  // Reload keeps character and step; Back goes to the previous step
  await p.selectOption('#exSel', 'dree5'); await p.click('button[data-step="4"]'); await p.click('button[data-step="5"]'); await p.reload();
  ok(await p.evaluate(() => MutagenBuilder.state.name.startsWith('Dree') && document.querySelector('.stp.on').dataset.step === '5'), 'reload keeps character and step');
  await p.goBack(); ok(await p.evaluate(() => document.querySelector('.stp.on').dataset.step === '4'), 'Back button returns to previous step');
  // Long text
  await p.click('button[data-step="0"]'); await p.fill('input[data-k="name"]', 'X'.repeat(300)); await p.fill('input[data-k="concept"]', 'Y'.repeat(400));
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.getElementById('summary').scrollWidth <= document.getElementById('summary').clientWidth + 1), 'long name/concept wrap, no overflow');
  // Random then edit
  await p.click('#btnRandom'); await p.click('button[data-step="2"]'); await p.fill('input[data-k="knacks.0"]', 'Edited Knack');
  ok(await p.evaluate(() => MutagenBuilder.state.knacks[0] === 'Edited Knack' && MutagenBuilder.derive(MutagenBuilder.state).legal), 'random then edit stays legal');
  // Unlabelled controls
  await p.selectOption('#exSel', 'dree5'); let unl = [];
  for (let i = 0; i < 8; i++) { await p.evaluate(i => MutagenBuilder.goto(i), i); unl = unl.concat(await p.evaluate(() => [...document.querySelectorAll('#app input:not([hidden]), #app select, #app textarea, #app button')].filter(e => !e.closest('label') && !e.getAttribute('aria-label') && !e.title && !(e.tagName === 'BUTTON' && e.textContent.trim())).map(e => e.dataset.k || e.id))); }
  ok(!unl.length, 'every control has an accessible name ' + unl.join(' '));
  // Print page counts
  for (const [L, max] of [[1, 1], [5, 2], [10, 2]]) {
    await p.evaluate(L => { MutagenBuilder.state = L === 1 ? MutagenBuilder.fromExample('dree1') : MutagenBuilder.randomChar(L); }, L);
    await p.emulateMedia({ media: 'print' }); const pdf = await p.pdf({ format: 'Letter' }); await p.emulateMedia({ media: 'screen' });
    const n = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length; ok(n >= 1 && n <= max, `print L${L}: ${n} page(s) (max ${max})`);
  }
  const ms = await p.evaluate(() => { const t = performance.now(); for (let i = 0; i < 50; i++) MutagenBuilder.render(); return (performance.now() - t) / 50; });
  ok(ms < 30, 'render time ' + ms.toFixed(1) + ' ms');
}
async function mobileAndStorage(b) {
  const m = await page(b, { viewport: { width: 375, height: 800 }, isMobile: true });
  await m.goto(URL); await m.selectOption('#exSel', 'dree5'); let wide = [];
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
