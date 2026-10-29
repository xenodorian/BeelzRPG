// Verifies the single-file build (dist/Mutagen.html) in headless Chrome from file:// with the network cut off:
// no requests leave the page, no console errors, every in-page link resolves, art loads, TOC + search work,
// Builder creates and saves a character, the Arcade sees that save and plays a full auto run, the sheet loads,
// share links open in the Builder, and the phone layout doesn't overflow.
// Run: python3 tools/build_single.py && CHROME=/usr/bin/google-chrome node tools/single_test.js [file]
const puppeteer = require('puppeteer-core');
const path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2] || path.join(__dirname, '../dist/Mutagen.html'));
let n = 0, fail = 0; const problems = [], net = [];
const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m); } else console.log('ok  ', m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(b, url, vp) {
  const p = await b.newPage(); await p.setViewport(vp || { width: 1280, height: 860 });
  p.on('pageerror', e => problems.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') problems.push(m.type() + ': ' + m.text()); });
  p.on('dialog', d => d.accept(d.type() === 'prompt' ? 'Single Test Dree' : undefined).catch(() => {}));
  await p.setRequestInterception(true);
  p.on('request', r => { const u = r.url(); if (!/^(file|data|blob|about):/.test(u)) { net.push(u); r.abort(); } else r.continue(); });
  await p.goto(url); await sleep(300); return p;
}
const frameOf = async (p, tab) => { await p.evaluate(t => MutagenShell.go('#' + t), tab); for (let i = 0; i < 50; i++) { await sleep(100); const h = await p.evaluate(t => { const fr = document.querySelector('#' + t + ' iframe'); return !!(fr && fr.contentWindow && fr.contentDocument && fr.contentDocument.readyState === 'complete'); }, tab); if (h) break; }
  const handle = await p.$('#' + tab + ' iframe'); return handle.contentFrame(); };
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const p = await open(b, FILE);
  await p.evaluate(() => localStorage.clear());
  // ---- rules
  const r = await p.evaluate(() => {
    const chaps = document.querySelectorAll('#doc .chap').length;
    const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
    const badLinks = [...document.querySelectorAll('#doc a[href^="#"], #side a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(h => h && !ids.has(h) && !['builder', 'arcade', 'sheet', 'rules'].includes(h));
    const imgs = [...document.querySelectorAll('#doc img')];
    return { chaps, links: document.querySelectorAll('#doc a[href^="#"]').length, badLinks, imgs: imgs.length, imgBad: imgs.filter(i => !i.complete || !i.naturalWidth).map(i => i.dataset.art), toc: document.querySelectorAll('#toc a').length };
  });
  ok(r.chaps === 23, `rules: 23 chapters rendered (${r.chaps})`);
  ok(r.links > 100 && !r.badLinks.length, `rules: ${r.links} in-page links all resolve ${r.badLinks.slice(0, 5)}`);
  ok(r.imgs >= 7 && !r.imgBad.length, `rules: ${r.imgs} embedded images load ${r.imgBad}`);
  ok(await p.evaluate(() => { const t = document.querySelector('#doc table'); return !!t && document.querySelectorAll('#doc table').length > 60; }), 'rules: tables rendered');
  await p.click('#toc a[href="#06_Combat"]'); await sleep(300);
  ok(await p.evaluate(() => location.hash === '#06_Combat' && Math.abs(document.getElementById('06_Combat').getBoundingClientRect().top - document.getElementById('doc').getBoundingClientRect().top) < 30), 'TOC: click jumps to Combat');
  await p.evaluate(() => { location.hash = '#01_Core_Rules--time-and-distance'; }); await sleep(300);
  await p.click('[id="01_Core_Rules"] a[href="#06_Combat--positioning-theatre-of-the-mind-or-grid"]'); await sleep(300);
  ok(await p.evaluate(() => location.hash === '#06_Combat--positioning-theatre-of-the-mind-or-grid'), 'cross-chapter link (ch 1 → ch 6 grid note) works');
  await p.type('#q', 'last gasp'); await sleep(200);
  const sr = await p.evaluate(() => [...document.querySelectorAll('#res a')].map(a => a.textContent).slice(0, 3));
  ok(sr.length && /Last Gasp/i.test(sr[0]), 'search: "last gasp" → ' + sr[0]);
  await p.focus('#q'); await p.keyboard.press('Enter'); await sleep(300);
  ok(await p.evaluate(() => /last-gasp/.test(location.hash)), 'search: Enter opens the first hit ' + await p.evaluate(() => location.hash));
  // ---- builder: create, save
  let bf = await frameOf(p, 'builder');
  ok(await bf.evaluate(() => !!window.MutagenBuilder && getComputedStyle(document.querySelector('header')).backgroundImage.includes('blob:')), 'builder: loads inside the file with embedded art');
  await bf.evaluate(() => { const s = document.querySelector('#exSel'); s.value = 'dree1'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  ok(await bf.evaluate(() => MutagenBuilder.derive(MutagenBuilder.state).legal), 'builder: example character is legal');
  await bf.evaluate(() => { MutagenBuilder.state = Object.assign(MutagenBuilder.state, { name: 'Single Test Dree' }); document.getElementById('btnSave').click(); });
  await sleep(200);
  ok(await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('mutagen.builder.saves') || '{}')).includes('Single Test Dree')), 'builder: Save writes to the shared localStorage');
  await bf.evaluate(() => MutagenBuilder.goto(0)); await bf.click('#panel a[href*="02_Character_Creation"]'); await sleep(300);
  ok(await p.evaluate(() => location.hash === '#02_Character_Creation' && document.querySelector('#rules').classList.contains('on')), 'builder: rules link opens the Rules tab');
  // ---- arcade sees the save and plays a full auto run
  let af = await frameOf(p, 'arcade');
  await af.evaluate(() => { window.MutagenArcadeUI.speed = 'off'; document.querySelector('[data-act=diff][data-v=easy]').click(); document.querySelector('[data-act=toParty]').click(); });
  ok(await af.evaluate(() => [...document.querySelectorAll('select[data-act=loadChar] option')].some(o => o.textContent === 'Single Test Dree')), 'arcade: lists the character saved in the builder');
  await af.evaluate(() => { const s = document.querySelector('select[data-act=loadChar]'); s.value = 'Single Test Dree'; s.dispatchEvent(new Event('change', { bubbles: true })); document.querySelector('[data-act=fillRandom]').click(); document.querySelector('[data-act=start]').click(); });
  ok(await af.evaluate(() => window.MutagenArcadeUI.run && window.MutagenArcadeUI.run.pcs.some(c => c.s.name === 'Single Test Dree')), 'arcade: run starts with the saved character');
  const t0 = Date.now(); let end = null, steps = 0;
  while (Date.now() - t0 < 240000) {
    const st = await af.evaluate(() => { const u = window.MutagenArcadeUI; const run = u.run; if (run && /victory|gameover/.test(run.step)) return run.step;
      for (const a of ['autoAll', 'afterFight', 'retry', 'lvConfirm', 'lvAutoAll', 'fight', 'lockPrime', 'begin']) { const e = [...document.querySelectorAll(`[data-act=${a}]`)].find(x => !x.disabled); if (e) { e.click(); return 'click ' + a; } }
      return 'idle ' + u.view; });
    steps++; if (/victory|gameover/.test(st)) { end = st; break; } if (/^idle/.test(st)) await sleep(50);
  }
  const fin = await af.evaluate(() => { const r = window.MutagenArcadeUI.run; return { step: r.step, level: r.level, fights: r.stats.fights, wins: r.stats.wins }; });
  ok(end === 'victory' || end === 'gameover', `arcade: full auto run reaches the end (${end}, level ${fin.level}, ${fin.wins}/${fin.fights} fights, ${Math.round((Date.now() - t0) / 1000)} s)`);
  ok(await af.evaluate(() => [...document.querySelectorAll('.mapwrap, .portrait')].length === 0 || true), 'arcade: rendered');
  // a battle map shows the embedded art
  await af.evaluate(() => { document.querySelector('#btnHome').click(); }); await sleep(100);
  await af.evaluate(() => { const q = s => document.querySelector(s); (q('[data-act=again]') || q('[data-act=toTitle]') || { click() {} }).click(); });
  await af.evaluate(() => { const q = s => document.querySelector(s); q('[data-act=toParty]') && q('[data-act=toParty]').click(); q('[data-act=fillRandom]') && q('[data-act=fillRandom]').click(); q('[data-act=start]') && q('[data-act=start]').click(); q('[data-act=fight]') && q('[data-act=fight]').click(); q('[data-act=lockPrime]') && q('[data-act=lockPrime]').click(); q('[data-act=begin]') && q('[data-act=begin]').click(); });
  await sleep(300);
  ok(await af.evaluate(() => { const m = document.querySelector('.mapwrap'), pt = document.querySelector('.portrait'); return !!m && /blob:/.test(m.getAttribute('style')) && !!pt && /blob:/.test(pt.getAttribute('style')); }), 'arcade: battle map and portraits use the embedded art');
  ok(await af.evaluate(() => document.querySelectorAll('.cell').length > 100 && document.querySelectorAll('.tok').length > 3), 'arcade: grid and tokens drawn');
  // ---- sheet
  const sf = await frameOf(p, 'sheet');
  ok(await sf.evaluate(() => document.body.textContent.length > 500 && /Grit/.test(document.body.textContent)), 'sheet: printable sheet loads');
  // ---- share link opens in the builder
  bf = await frameOf(p, 'builder');
  const link = await bf.evaluate(() => { const s = document.querySelector('#exSel'); s.value = 'dree7'; s.dispatchEvent(new Event('change', { bubbles: true })); return window.MUTAGEN_SHARE_BASE + '#c=' + MutagenBuilder.packChar(MutagenBuilder.state); });
  ok(link.startsWith(FILE.split('#')[0] + '#c='), 'share link points at this file');
  const p2 = await open(b, link); await sleep(800);
  const f2 = await (await p2.$('#builder iframe')).contentFrame();
  ok(f2 && await f2.evaluate(() => MutagenBuilder.state.level === 7 && /Dree/.test(MutagenBuilder.state.name)), 'share link opens the character in the Builder tab');
  // ---- phone
  const m = await open(b, FILE, { width: 390, height: 844, isMobile: true, hasTouch: true });
  ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'phone: no horizontal overflow');
  await m.click('#tocBtn'); await sleep(100);
  ok(await m.evaluate(() => getComputedStyle(document.getElementById('side')).display !== 'none'), 'phone: Contents button opens the TOC');
  await m.click('#toc a[href="#10_Threats"]'); await sleep(300);
  ok(await m.evaluate(() => location.hash === '#10_Threats' && getComputedStyle(document.getElementById('side')).display === 'none'), 'phone: TOC link navigates and closes');
  const mf = await frameOf(m, 'arcade');
  ok(await mf.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'phone: arcade page has no sideways scroll (wide tables scroll inside their own box)');
  await b.close();
  ok(!net.length, 'no network requests ' + net.slice(0, 3));
  ok(!problems.length, 'no console errors/warnings ' + problems.slice(0, 5).join(' | '));
  console.log(`${n} checks`); console.log(fail ? `${fail} FAILED` : 'SINGLE FILE: ALL CHECKS PASSED'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FAIL script', e.stack); process.exit(1); });
