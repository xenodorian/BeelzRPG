// Real-Chrome random-click fuzz for arcade/index.html (puppeteer-core, file://).
// Plays whole runs by clicking random visible controls, map squares and tokens, pressing random keys,
// reloading the page mid-fight (resume), and switching animation speed. Fails on any page error,
// console error, blank screen or softlock (no state change for a long stretch).
// Usage: CHROME=/usr/bin/google-chrome node tools/arcade_fuzz.js [actionsPerDifficulty=6000] [url] [viewport=desktop|mobile]
const puppeteer = require('puppeteer-core');
const path = require('path');
const N = +(process.argv[2] || 6000);
const URL = process.argv[3] || 'file://' + path.join(__dirname, '../arcade/index.html');
const MOBILE = (process.argv[4] || 'desktop') === 'mobile';
const problems = [];
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const report = [];
  for (const [diff, speed, hc] of [['easy', 'off', false], ['medium', 'fast', false], ['hard', 'off', true]]) {
    const p = await b.newPage();
    if (MOBILE) await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); else await p.setViewport({ width: 1280, height: 860 });
    p.on('pageerror', e => problems.push(`${diff} pageerror: ${e.message}`));
    p.on('console', m => { if (m.type() === 'error') problems.push(`${diff} console: ${m.text()}`); });
    p.on('dialog', d => d.accept().catch(() => {}));
    await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('mutagen.arcade.ui.speed', JSON.stringify(s)); }, speed); await p.reload();
    // set up: party of the right size, then start
    await p.evaluate((diff, hc) => { const q = s => document.querySelector(s); q('[data-act=diff][data-v=' + diff + ']') && q('[data-act=diff][data-v=' + diff + ']').click();
      const hcBox = document.querySelector('#hc'); if (hcBox && hcBox.checked !== hc) hcBox.click();
      q('[data-act=toParty]').click(); q('[data-act=fillRandom]').click(); q('[data-act=start]').click(); }, diff, hc);
    let last = '', still = 0, maxStill = 0, reloads = 0, keys = 0, clicks = 0, done = '', fightsSeen = new Set();
    for (let i = 0; i < N; i++) {
      if (i && i % 400 === 0) { await p.reload(); reloads++; await p.evaluate(() => { const r = document.querySelector('[data-act=resume]'); if (r) r.click(); }); }
      const r = await p.evaluate(() => {
        const ui = window.MutagenArcadeUI, run = ui.run, F = ui.F;
        const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.disabled && !e.closest('[hidden]'); };
        let c = [...document.querySelectorAll('#screen button, #screen [data-act], #screen .cell, #screen .tok, #screen select, #screen input[type=checkbox]')].filter(vis);
        c = c.filter(e => !/^(importChar|importParty|exportChar|exportParty|delChar|delParty|delSaved)$/.test(e.dataset.act || ''));
        const sig = [ui.view, run && run.level, run && run.step, F && F.round, F && F.phase, F && F.active && F.active.id, F && F.pcs.map(x => x.hp + '/' + x.pos.x + ',' + x.pos.y + (x.turn ? x.turn.action + '' + x.turn.move : '')).join(';'), F && F.foes.map(x => x.hp).join(','), ui.menu && ui.menu.lv].join('|');
        const blank = !document.querySelector('#screen').textContent.trim();
        const end = run && (run.step === 'victory' || run.step === 'gameover') ? run.step : '';
        if (!c.length) return { sig, blank, end, n: 0, key: true };
        // weights: battle controls and progress buttons more often than "leave" buttons
        const w = c.map(e => { const a = e.dataset.act || ''; if (/^(toTitle|abandon|giveUp|saveQuit|clear)$/.test(a) || e.id === 'btnHome') return 0.05; if (/^(fight|begin|lockPrime|lvAutoAll|lvConfirm|afterFight|retry|again|resume|start)$/.test(a)) return 6; if (/^(autoAll)$/.test(a)) return 0.2; if (/^(autoTurn|autoRound)$/.test(a)) return 0.6; if (e.classList.contains('cell')) return 0.5; return 1; });
        let t = Math.random() * w.reduce((a, b) => a + b, 0), k = 0; while ((t -= w[k]) > 0 && k < w.length - 1) k++;
        const e = c[k];
        if (e.tagName === 'SELECT') { const o = e.options; if (o.length) { e.selectedIndex = Math.floor(Math.random() * o.length); e.dispatchEvent(new Event('change', { bubbles: true })); } }
        else e.click();
        return { sig, blank, end, n: c.length, what: (e.dataset.act || e.className || e.tagName).slice(0, 30) };
      });
      clicks++;
      if (Math.random() < 0.1) { const k = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', ' ', '1', '2', '3', 't', 'c'][Math.floor(Math.random() * 12)]; await p.keyboard.press(k); keys++; }
      if (r.blank) problems.push(`${diff}: blank screen at action ${i}`);
      if (r.sig.split('|')[3]) fightsSeen.add(r.sig.split('|').slice(1, 3).join(''));
      if (r.sig === last) { still++; maxStill = Math.max(maxStill, still); if (still === 600) problems.push(`${diff}: no state change for 600 actions (${r.sig.slice(0, 120)})`); } else { still = 0; last = r.sig; }
      if (r.end) { done = r.end; break; }
    }
    const st = await p.evaluate(() => { const u = window.MutagenArcadeUI; return u.run ? { level: u.run.level, step: u.run.step, retries: u.run.stats.retries } : null; });
    report.push({ diff, speed, permadeath: hc, actions: clicks, keys, reloads, fights: fightsSeen.size, end: done || 'budget', state: st, maxStill });
    await p.close();
  }
  await b.close();
  console.log(JSON.stringify(report, null, 1));
  console.log(problems.length ? 'FUZZ PROBLEMS:\n' + [...new Set(problems)].slice(0, 30).join('\n') : 'FUZZ PASSED: no page errors, console errors, blank screens or softlocks');
  process.exit(problems.length ? 1 : 0);
})();
