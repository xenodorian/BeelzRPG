// Screenshots + a real-browser smoke test of arcade/ (Chrome via puppeteer-core).
// Run: NODE_PATH=<dir with puppeteer-core> node tools/arcade_shots.js [outDir]   (default /workspace)
const puppeteer = require('puppeteer-core'); const path = require('path');
const out = process.argv[2] || '/workspace'; const url = 'file://' + path.join(__dirname, '../arcade/index.html');
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('dialog', d => d.accept(d.defaultValue()));
  await p.setViewport({ width: 1366, height: 900 });
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { let s = 4242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  const click = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s); e.click(); }, sel);
  await p.screenshot({ path: out + '/arcade_start.png', fullPage: false });
  await click('[data-act=toParty]');
  await p.evaluate(() => { const s = document.querySelector('[data-act=pregen][data-i="0"]'); s.value = 'juno'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await click('[data-act=fillRandom]'); await click('[data-act=edit][data-i="1"]');
  await p.evaluate(() => { const i = document.querySelector('#pname'); i.value = 'Night Shift'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await click('[data-act=saveParty]');
  await p.screenshot({ path: out + '/arcade_party.png', fullPage: true });
  await click('[data-act=closeEdit]'); await click('[data-act=start]'); await click('[data-act=fight]'); await click('[data-act=lockPrime]'); await click('[data-act=begin]');
  // play two turns by hand, then auto the rest of the round so the log has dice in it
  for (let k = 0; k < 2; k++) await p.evaluate(() => { const t = document.querySelector('.center [data-act=turn]'); if (!t) return; t.click(); const o = document.querySelector('.center [data-act=opt]'); if (o) o.click(); const tg = document.querySelector('[data-act=target]'); if (tg) tg.click(); const e = [...document.querySelectorAll('.center [data-act=opt]')].find(x => x.dataset.o === 'end'); if (e) e.click(); });
  await p.evaluate(() => { const t = document.querySelector('.center [data-act=turn]'); if (t) t.click(); });
  await p.screenshot({ path: out + '/arcade_battle.png', fullPage: false });
  let g = 0;
  while (g++ < 30) {
    const v = await p.evaluate(() => window.MutagenArcadeUI.view);
    if (v === 'levelup' || v === 'end') break;
    await p.evaluate(() => { const q = s => document.querySelector(s); if (q('[data-act=retry]')) q('[data-act=retry]').click(); else if (q('[data-act=fight]')) q('[data-act=fight]').click(); if (q('[data-act=autoAll]')) q('[data-act=autoAll]').click(); if (q('[data-act=afterFight]')) q('[data-act=afterFight]').click(); });
  }
  await p.screenshot({ path: out + '/arcade_levelup.png', fullPage: true });
  await p.evaluate(() => { const q = document.querySelector('[data-act=lvConfirm]'); if (q) q.click(); });
  await p.setViewport({ width: 390, height: 844, isMobile: true });      // reloads the page: the saved run resumes
  await p.evaluate(() => { const q = s => document.querySelector(s); q('[data-act=resume]').click(); q('[data-act=fight]').click(); q('[data-act=lockPrime]').click(); q('[data-act=begin]').click(); });
  await p.screenshot({ path: out + '/arcade_mobile.png', fullPage: false });
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.join('\n') : 'no page errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
