// Screenshots + a real-Chrome click-through of arcade/ (puppeteer-core drives real mouse clicks and keys).
// Run: NODE_PATH=<dir with puppeteer-core> node tools/arcade_shots.js [outDir]   (default /workspace)
// Writes arcade_start/party/levelup.png and the battle-map shots arcade_grid_{move,attack,aoe,menu,enemy,mobile}.png.
const puppeteer = require('puppeteer-core'); const path = require('path');
const out = process.argv[2] || '/workspace'; const url = 'file://' + path.join(__dirname, '../arcade/index.html');
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); }); p.on('dialog', d => d.accept(d.defaultValue()));
  await p.setViewport({ width: 1440, height: 1000 });
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { let s = 4242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const click = async sel => { const el = await p.$(sel); if (!el) throw new Error('missing ' + sel); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click(); };
  const idle = async () => { for (let i = 0; i < 400; i++) { if (!(await p.evaluate(() => !!window.MutagenArcadeUI.anim))) return; await sleep(50); } };
  const shot = async name => { await sleep(150); await p.screenshot({ path: `${out}/${name}.png`, fullPage: false }); console.log('wrote', `${out}/${name}.png`); };
  const ui = fn => p.evaluate(fn);
  await shot('arcade_start');
  await click('[data-act=diff][data-v=medium]'); await click('[data-act=toParty]');
  for (const [i, k] of [[0, 'ozzie'], [1, 'rook'], [2, 'dree1'], [3, 'juno']]) await p.select(`[data-act=pregen][data-i="${i}"]`, k);
  await p.evaluate(() => { const i = document.querySelector('#pname'); i.value = 'Night Shift'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await click('[data-act=saveParty]'); await shot('arcade_party');
  await click('[data-act=start]'); await click('[data-act=fight]');
  // Prime: spend Ozzie's Juice to set a die to the Burst slot so the area preview can be shown
  const sel = await p.$('[data-act=setDie][data-id="p0"][data-j="0"]'); if (sel) await p.select('[data-act=setDie][data-id="p0"][data-j="0"]', '2');
  await click('[data-act=lockPrime]'); await p.evaluate(() => { window.MutagenArcadeUI.speed = 'normal'; });
  await click('[data-act=begin]'); await idle();
  // first freelancer: Move overlay, then walk toward the enemies with a real click
  const st = await ui(() => { const U = window.MutagenArcadeUI; return { phase: U.F.phase, who: U.F.active && U.F.active.short }; }); console.log('turn:', st);
  await click('[data-act=root][data-g=move]');
  const target = await ui(() => { const U = window.MutagenArcadeUI, F = U.F, c = F.active, G = window.MutagenGrid; let best = null; F.reach(c, false).forEach(n => { if (!n.cost) return; const d = Math.min(...F.foesAlive().map(e => G.dist(n, e.pos))); if (!best || d < best.d || (d === best.d && n.cost < best.n.cost)) best = { n, d }; }); return best && { x: best.n.x, y: best.n.y }; });
  if (target) await p.hover(`.cell[data-x="${target.x}"][data-y="${target.y}"]`);
  await shot('arcade_grid_move');
  if (target) { await click(`.cell[data-x="${target.x}"][data-y="${target.y}"]`); await idle(); }
  // menu + HUDs: open the Attack submenu
  if (await p.$('[data-act=root][data-g=attack]:not([aria-disabled=true])')) { await click('[data-act=root][data-g=attack]'); await shot('arcade_grid_menu');
    const opt = await p.$('.dock [data-act=opt]:not([aria-disabled=true])');
    if (opt) { await opt.click(); if (await ui(() => window.MutagenArcadeUI.menu.lv === 'target')) { await shot('arcade_grid_attack'); await click('.dock [data-act=target]:not([aria-disabled])'); await idle(); } else if (await p.$('[data-act=back]')) await click('[data-act=back]'); }
  } else await shot('arcade_grid_menu');
  // keyboard: the map cursor and Escape
  await p.focus('#map'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Escape');
  // play on: Ozzie unleashes the Burst when it's her turn (area preview), everyone else uses "Auto: this turn"
  let aoe = false, enemyShot = false, attackShot = await ui(() => !!document.querySelector('.tok.tgt')) || false; let g = 0;
  while (g++ < 60) {
    const s = await ui(() => { const U = window.MutagenArcadeUI, F = U.F; return { phase: F.phase, who: F.active && F.active.id, pend: F.pending().length, area: F.active ? F.options(F.active).filter(o => o.target === 'area' && /^(un|sig):/.test(o.id) && F.autoAim(F.active, o)).map(o => o.id) : [] }; });
    if (s.phase === 'won' || s.phase === 'lost') break;
    if (s.phase !== 'player' || !s.who) { await sleep(100); continue; }
    if (!aoe && s.area.length) {
      await click('[data-act=root][data-g=surge]'); await click(`.dock [data-act=opt][data-o="${s.area[0]}"]`);
      await shot('arcade_grid_aoe'); aoe = true; await click('[data-act=confirmAim]'); await idle(); continue;
    }
    const last = s.pend === 1;
    await click('[data-act=autoTurn]');
    if (last && !enemyShot) { await sleep(700); if (await ui(() => !!window.MutagenArcadeUI.anim)) { await shot('arcade_grid_enemy'); enemyShot = true; } }
    await idle();
    if (aoe && enemyShot && g > 12) break;
  }
  console.log({ aoe, enemyShot, attackShot });
  // finish the fight and the level with Auto-battle, to the level-up screen
  g = 0;
  while (g++ < 40) {
    const v = await ui(() => window.MutagenArcadeUI.view); if (v === 'levelup' || v === 'end') break;
    await p.evaluate(() => { const q = s => document.querySelector(s); if (q('[data-act=retry]')) q('[data-act=retry]').click(); else if (q('[data-act=fight]')) q('[data-act=fight]').click(); if (q('[data-act=autoAll]')) q('[data-act=autoAll]').click(); if (q('[data-act=afterFight]')) q('[data-act=afterFight]').click(); });
    await idle();
  }
  await shot('arcade_levelup');
  await p.evaluate(() => { const q = document.querySelector('[data-act=lvConfirm]'); if (q) q.click(); });
  // mobile: the battle map scrolls, the command menu docks at the bottom
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });      // reloads the page: the saved run resumes
  await p.evaluate(() => { const q = s => document.querySelector(s); q('[data-act=resume]').click(); q('[data-act=fight]').click(); q('[data-act=lockPrime]').click(); window.MutagenArcadeUI.speed = 'off'; q('[data-act=begin]').click(); });
  await sleep(300); const tapCell = await p.$('.cell.mv'); if (tapCell) { await p.evaluate(() => document.querySelector('[data-act=root][data-g=move]') && document.querySelector('[data-act=root][data-g=move]').click()); }
  await shot('arcade_grid_mobile');
  const mv = await p.$('.cell.mv'); if (mv) { await mv.tap(); }
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.join('\n') : 'no page errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
