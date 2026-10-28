// Cross-checks the MUTAGEN data block in builder/index.html against the rules chapters.
// Run: node tools/check_builder_data.js   (no dependencies). Exit code 1 on any mismatch.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'builder/index.html'), 'utf8');
const block = html.match(/<script>\s*(\/\* =+\s*MUTAGEN GAME DATA[\s\S]*?END OF GAME DATA =+ \*\/)/)[1];
const D = new Function(block + '; return MUTAGEN;')();
const ch = n => fs.readFileSync(path.join(root, 'chapters', fs.readdirSync(path.join(root, 'chapters')).find(f => f.startsWith(n))), 'utf8');
let bad = 0, checks = 0;
const eq = (a, b, what) => { checks++; if (String(a) !== String(b)) { bad++; console.log(`MISMATCH ${what}: builder=${JSON.stringify(a)} rules=${JSON.stringify(b)}`); } };
const strip = s => s.replace(/\*\*|\*/g, '').trim();
const rows = (md, header) => { const i = md.indexOf(header); if (i < 0) throw new Error('missing table ' + header); const lines = md.slice(i).split('\n'); const out = []; for (let j = 2; j < lines.length && lines[j].startsWith('|'); j++) out.push(lines[j].split('|').slice(1, -1).map(strip)); return out; };
// Ch 7 level table
rows(ch('07'), '| Level | Rank |').forEach(r => { const L = D.levels[+r[0] - 1]; eq([L.rank, L.nodes, L.surges, 'd' + L.die, L.prime].join(), [r[1], r[2], r[3], r[4], r[5]].join(), 'level ' + r[0]); });
// Ch 2 Origins
const org = rows(ch('02'), '| d6 | Origin |');
org.forEach((r, i) => { eq(D.origins[i].name, r[1].split(' — ')[0], 'origin ' + i); eq(D.origins[i].knack, r[2], 'origin knack ' + i); });
const c2 = ch('02');
eq(/12 \+ \(2 × Grit\) \+ 5 per level/.test(c2), true, 'HP formula text (ch 2)'); eq([D.baseHP, D.hpPerGrit, D.hpPerLevel].join(), '12,2,5', 'HP constants');
eq(/\+3, \+2, \+1, \+0, −1/.test(c2), true, 'stat array text'); eq(D.statArray.join(), '3,2,1,0,-1', 'stat array');
eq(/4 \+ Rank \+ Nerve \(minimum 4/.test(c2), true, 'Flux formula text'); eq([D.fluxBase, D.fluxMin, D.spliceFlux].join(), '4,4,-1', 'Flux constants');
eq(/\*\*50 Scrip\*\*/.test(c2), true, 'start Scrip text'); eq(D.startScrip, 50, 'start Scrip');
// Ch 3 trees: node names, root/apex, unlocks
const c3 = ch('03');
rows(c3, '| Tree | Stats | Role | Unlocks |').forEach(r => { const t = D.trees.find(x => x.name === r[0]); eq(!!t, true, 'tree ' + r[0]); if (!t) return; eq(t.stats, r[1], t.name + ' stats'); eq(t.role, r[2], t.name + ' role');
  const names = r[3].replace(/\(shape\)/g, '').split(',').map(s => s.trim().toLowerCase()); eq(t.unlocks.join(), names.join(), t.name + ' unlocks'); });
D.trees.forEach(t => {
  const sec = c3.split('## ' + t.name.toUpperCase())[1].split('\n## ')[0];
  const ns = [...sec.matchAll(/^- \*\*(Root — |Apex — )?([^.*]+)\.\*\*/gm)].map(m => (m[1] ? m[1][0] : '') + m[2]);
  eq(t.nodes.map(n => (n.root ? 'R' : n.apex ? 'A' : '') + n.name).join(), ns.join(), t.name + ' nodes');
  const pushRules = [...sec.matchAll(/^- \*\*(?:Root — |Apex — )?([^.*]+)\.\*\*(.*)$/gm)].map(m => m[1] + ':' + /Push/.test(m[2]));
  eq(t.nodes.map(n => n.name + ':' + !!n.push).join(), pushRules.join(), t.name + ' Push flags');
});
eq(/level 7\+\*\* and \*\*three other nodes/.test(c3), true, 'Apex rule text'); eq([D.apexLevel, D.apexNeeds].join(), '7,3', 'Apex constants');
eq(/25 Scrip per Chrome tree/.test(c3), true, 'Upkeep text'); eq(D.upkeepPerChrome, 25, 'Upkeep');
// Ch 4 Surge parts
const c4 = ch('04');
rows(c4, '| Shape | Unlock | Target |').forEach(r => { const s = D.shapes.find(x => x.name === r[0]); eq(!!s, true, 'shape ' + r[0]); if (!s) return; eq(s.unlock ? D.trees.find(t => t.id === s.unlock).name : 'base', r[1], s.name + ' unlock'); eq(s.target, r[2], s.name + ' target');
  const st = r[3] === '— (no roll)' ? [] : r[3].split(' or ').map(x => x.toLowerCase()); eq(s.stats.join(), st.join(), s.name + ' stats');
  const m = r[4].match(/d(\d+)/); if (m) { eq(s.die, m[1], s.name + ' die'); eq(s.addStat, /\+ stat/.test(r[4]), s.name + ' adds stat'); } });
const unl = s => s === 'base' ? null : D.trees.find(t => t.name === s).id;
rows(c4, '| Effect | Unlock | Damage type |').forEach(r => { const e = D.effects.find(x => x.name === r[0]); eq(!!e, true, 'effect ' + r[0]); if (!e) return; eq(e.unlock, unl(r[1]), e.name + ' unlock'); eq(e.type, r[2], e.name + ' type'); });
rows(c4, '| Effect | Unlock | What happens |').forEach(r => { const e = D.effects.find(x => x.name === r[0]); eq(!!e && e.kind, 'infuse', 'infuse effect ' + r[0]); if (e) eq(e.unlock, unl(r[1]), e.name + ' unlock'); });
const tw = rows(c4, '| Twist | Works with |'); eq(D.twists.map(t => t.name).join(), tw.map(r => r[0]).join(), 'twist names');
const worksMap = { 'Strike, Bolt': 'strikebolt', 'Burst, Wave, Pulse': 'area', 'Any damage': 'damage', 'Any': 'any' };
tw.forEach(r => eq(D.twists.find(t => t.name === r[0]).works, worksMap[r[1]], r[0] + ' works with'));
const wild = rows(c4, '| d12 | Wild Surge |'); eq(D.wildTable.length, 12, 'wild count'); wild.forEach((r, i) => eq(D.wildTable[i].split(':')[0], r[1].split('.')[0], 'wild ' + (i + 1)));
eq(D.sampleSurges.map(s => s[0]).join(), rows(c4, '| Name | Build | Flux |').map(r => r[0]).join(), 'sample Surge names');
rows(c4, '| Name | Build | Flux |').forEach(r => { const s = D.sampleSurges.find(x => x[0] === r[0]); const build = r[1].replace(/ \(.*\)/, '').split(' + ').map(x => x.toLowerCase()); eq([s[1], s[2]].concat(s[3]).join(), build.join(), r[0] + ' build'); eq(1 + s[3].length, r[2], r[0] + ' flux'); });
// Ch 8 gear
const c8 = ch('08');
rows(c8, '| Frame | Die |').forEach(r => { const name = r[0].replace(/ \(.*\)/, ''); const f = D.frames.find(x => x.name === name); eq(!!f, true, 'frame ' + name); if (!f) return; eq('d' + f.die, r[1], name + ' die');
  eq(f.stats.map(s => s[0].toUpperCase() + s.slice(1)).sort().join(), r[2].split(' or ').sort().join(), name + ' stats'); eq(/^\d+$/.test(r[6]) ? f.cost : '-', /^\d+$/.test(r[6]) ? r[6] : '-', name + ' cost');
  const rn = parseInt(r[3], 10); if (!isNaN(rn)) eq(f.range, rn, name + ' range'); });
eq(D.mods.map(m => m.name).join(), rows(c8, '| Mod | Effect |').map(r => r[0]).join(), 'mod names');
eq(/one per weapon, 100 Scrip each/.test(c8), true, 'mod cost text'); eq(D.modCost, 100, 'mod cost');
rows(c8, '| Armor | Armor | Notes | Cost |').forEach(r => { const n = r[0].replace(/ \(.*\)/, ''); if (n === 'Shield') { eq(D.shield.cost, r[3], 'shield cost'); return; } const a = D.armors.find(x => x.name.startsWith(n)); eq(a && a.armor, r[1], n + ' armor'); eq(a && a.cost, r[3], n + ' cost'); });
const itemRows = rows(c8, '| Item | Effect | Cost |'); itemRows.forEach(r => { const it = D.items.find(x => x.name === r[0]); if (['Clinic visit', 'Sample splice'].includes(r[0])) return; eq(!!it, true, 'item ' + r[0]); if (it) eq(it.cost, r[2], r[0] + ' cost'); });
const kitRows = rows(c8, '| Kit | Contents |');
const fname = id => D.frames.find(f => f.id === id).name.toLowerCase();
kitRows.forEach(r => { const k = D.kits.find(x => x.name === r[0]); eq(!!k, true, 'kit ' + r[0]); if (!k) return;
  const ws = k.weapons.map(w => typeof w === 'string' ? fname(w) : w.choice ? w.choice.map(fname).join(' or ') : fname(w.frame) + ' with ' + D.mods.find(m => m.id === w.mod).name.toLowerCase());
  const its = Object.entries(k.items).map(([id, q]) => (q > 1 ? q + ' ' : '') + D.items.find(i => i.id === id).name.toLowerCase());
  const txt = r[1].toLowerCase().replace(/ weapons?/g, '').replace(/medkits/, 'medkit').replace(/stims/, 'stim');
  const want = ws.concat(its).concat(k.scrip ? ['+' + k.scrip + ' scrip'] : []);
  want.forEach(w => { const key = w.replace(/^2 /, '').replace(/ weapon/, '').replace(/ & 50 ft line/, ''); checks++; if (!txt.includes(key.replace(/^light melee$/, 'light melee'))) { bad++; console.log(`MISMATCH kit ${k.name}: "${key}" not in "${r[1]}"`); } }); });
eq(/Light armor\*\*, GRAFT ID, radio, flashlight, 2 rations, 1 Damper/.test(c8), true, 'common kit text');
// Ch 5 Scars/Faults
const sf = rows(ch('05'), '| d6 | Bio Scar | Chrome Fault |');
sf.forEach((r, i) => { eq(D.scars[i].name, r[1].split('.')[0], 'scar ' + (i + 1)); eq(D.faults[i].name, r[2].split('.')[0], 'fault ' + (i + 1)); });
// Ch 1 Juice, Ch 7 pay, Final Form
eq(/start each session with \*\*1 Juice\*\* and can hold \*\*3\*\*/.test(ch('01')), true, 'Juice text'); eq([D.juiceStart, D.juiceMax].join(), '1,3', 'Juice');
eq(/200 \+ \(100 × mission level\)/.test(ch('07')), true, 'pay text'); eq(D.missionPay(3), 500, 'pay L3');
eq(/two extra Surges/.test(ch('07')) && /two extra/.test(D.finalForm), true, 'Final Form');
// Ch 13 level table vs builder (Wild column)
rows(ch('13'), '| Level | Rank | Nodes | Surges | Die | Wild slots |').forEach(r => { const L = D.levels[+r[0] - 1]; eq([L.rank, L.nodes, L.surges, 'd' + L.die, L.die - L.surges, L.prime].join(), r.slice(1, 7).join().replace(/\*/g, ''), 'ch13 level ' + r[0]); });
console.log(`${checks} checks, ${bad} mismatches`);
process.exit(bad ? 1 : 0);
