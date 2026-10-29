// Cross-checks the MUTAGEN data block in builder/index.html against the rules chapters.
// Run: node tools/check_builder_data.js   (no dependencies). Exit code 1 on any mismatch.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'builder/index.html'), 'utf8');
const block = html.match(/<script>\s*(\/\* =+\s*MUTAGEN GAME DATA[\s\S]*?END OF GAME DATA =+ \*\/)/)[1];
const D = new Function(block + '; return MUTAGEN;')();
const chFiles = fs.readdirSync(path.join(root, 'chapters')).filter(f => f.endsWith('.md'));
const ch = n => fs.readFileSync(path.join(root, 'chapters', chFiles.find(f => f.startsWith(n + '_')) || chFiles.find(f => f.startsWith(n))), 'utf8');
let bad = 0, checks = 0;
const eq = (a, b, what) => { checks++; if (String(a) !== String(b)) { bad++; console.log(`MISMATCH ${what}: builder=${JSON.stringify(a)} rules=${JSON.stringify(b)}`); } };
const strip = s => s.replace(/\*\*|\*/g, '').trim();
const rows = (md, header) => { const i = md.indexOf(header); if (i < 0) throw new Error('missing table ' + header); const lines = md.slice(i).split('\n'); const out = []; for (let j = 2; j < lines.length && lines[j].startsWith('|'); j++) out.push(lines[j].split('|').slice(1, -1).map(strip)); return out; };
// v0.2 node picks per level (mirrors picks() in the app)
const picks = L => { const want = L + 2, prim = Math.min(10, want); return { prim, secTert: want + (want - prim) }; };
const evoN = L => (L >= 7 ? 2 : L >= 4 ? 1 : 0);
const stageName = L => (L >= 10 ? 'Final' : L >= 7 ? 'Evolution II' : L >= 4 ? 'Evolution I' : 'Base');
// Ch 7 level table
rows(ch('07'), '| Level | Rank | Stage |').forEach(r => { const lv = +r[0], L = D.levels[lv - 1], p = picks(lv);
  eq([L.rank, stageName(lv), `${p.prim} + ${p.secTert}${evoN(lv) ? ` (+${evoN(lv)})` : ''} = ${p.prim + p.secTert + evoN(lv)}`, L.surges, 'd' + L.die, L.prime, L.sigs || '—'].join(), [r[1], r[2], r[4], r[5], r[6], r[7], r[8]].join(), 'ch7 level ' + lv); });
eq(Object.entries(D.knackLevels).map(e => e.join(':')).join(), '1:3,3:1,6:1,9:1', 'Knack levels');
// Ch 2 Origins
const org = rows(ch('02'), '| d6 | Origin |');
org.forEach((r, i) => { eq(D.origins[i].name, r[1].split(' — ')[0], 'origin ' + i); eq(D.origins[i].knack, r[2], 'origin knack ' + i); });
const c2 = ch('02');
eq(/12 \+ \(2 × Grit\) \+ 5 per level/.test(c2), true, 'HP formula text (ch 2)'); eq([D.baseHP, D.hpPerGrit, D.hpPerLevel].join(), '12,2,5', 'HP constants');
eq(/4 \+ Rank \+ Nerve \(minimum 4/.test(c2), true, 'Flux formula text'); eq([D.fluxBase, D.fluxMin, D.spliceFlux].join(), '4,4,-1', 'Flux constants');
eq(/\*\*50 Scrip\*\*/.test(c2), true, 'start Scrip text'); eq(D.startScrip, 50, 'start Scrip');
// Ch 2A Forms, stages, looks
const c2a = ch('02A');
const SN = id => D.stats.find(x => x.id === id).name, TN = id => D.trees.find(x => x.id === id).name;
rows(c2a, '| Form | Primary +3 |').forEach(r => { const f = D.forms.find(x => x.name === r[0].replace(/^\[|\]\(.*$/g, '')); eq(!!f, true, 'form ' + r[0]); if (!f) return;
  eq([SN(f.primary), SN(f.secondary), SN(f.tertiary), f.dumps.map(SN).join(', '), TN(f.trees[0]), TN(f.trees[1]), TN(f.trees[2]), '"' + f.quote + '"'].join('|'), r.slice(1, 9).join('|'), f.name + ' row'); });
eq(D.forms.length, 5, 'five Forms');
['primary', 'secondary', 'tertiary'].forEach(k => eq(D.forms.map(f => f[k]).sort().join(), D.stats.map(x => x.id).sort().join(), `each stat is ${k} once`));
const stg = rows(c2a, '| Stage | Levels | Primary |');
D.stages.forEach((g, i) => eq(g.vals.map(v => (v < 0 ? '−' + -v : '+' + v)).join(), stg[i].slice(2, 7).join(), 'stage ' + g.name));
eq(D.stages.map(g => g.from).join(), '1,4,7', 'stage levels'); eq(+stg[3][2].replace('+', '') - D.stages[2].vals[0], D.finalFormBonus, 'Final Form bonus');
D.forms.forEach(f => { const sec = c2a.split(new RegExp('\\n### ' + f.name + '\\b'))[1]; eq(!!sec, true, f.name + ' section'); if (!sec) return;
  const lk = rows(sec, '| Stage | Name | Bio | Chrome |'); f.stages.forEach((g, i) => eq([g.name, g.bio, g.chrome].join('|'), lk[i].slice(1, 4).join('|'), `${f.name} stage ${i} look`)); });
// Ch 3 trees summary, gates, Evolution nodes
const c3 = ch('03_A');
rows(c3, '| Tree | Stat | Role | Unlocks |').forEach(r => { const name = r[0].replace(/^\[|\]\(.*$/g, ''); const t = D.trees.find(x => x.name === name); eq(!!t, true, 'tree ' + name); if (!t) return; eq(t.stats, r[1], t.name + ' stats'); eq(t.role, r[2], t.name + ' role');
  const names = r[3].replace(/\(shape\)/gi, '').split(',').map(s => s.trim().toLowerCase()); eq(t.unlocks.join(), names.join(), t.name + ' unlocks');
  ['primary', 'secondary', 'tertiary'].forEach((k, i) => eq(D.forms.filter(f => f.trees[i] === t.id).map(f => f.name).join(', ') || '—', r[4 + i], `${t.name} ${k} of`)); });
eq(/\*\*Level 4\+\*\* and \*\*3 nodes\*\*/.test(c3), true, 'Tier II gate text'); eq([D.tier2Level, D.tier2Needs].join(), '4,3', 'Tier II constants');
eq(/\*\*Level 7\+\*\*, \*\*6 other nodes\*\*/.test(c3), true, 'Apex gate text'); eq([D.apexLevel, D.apexNeeds].join(), '7,6', 'Apex constants');
eq(/25 Scrip per Chrome tree/.test(c3), true, 'Upkeep text'); eq(D.upkeepPerChrome, 25, 'Upkeep');
rows(c3, '| Form | Primary tree | Level 4: Evolution I |').forEach(r => { const f = D.forms.find(x => x.name === r[0]); eq(!!f, true, 'evo form ' + r[0]); if (!f) return; eq(TN(f.trees[0]), r[1], f.name + ' evo tree');
  [4, 7].forEach((lv, i) => eq(D.trees.flatMap(t => t.nodes).find(n => n.id === f.evo[lv]).name, r[2 + i].split(':')[0], `${f.name} level ${lv} node`)); });
// Ch 3 tree files: node order, tiers, Push flags, Evolution nodes
const tierOf = h => /^Root/.test(h) ? 0 : /^Tier II/.test(h) ? 2 : /^Tier I/.test(h) ? 1 : /^Apex/.test(h) ? 3 : /^Evolution/.test(h) ? 4 : -1;
D.trees.forEach(t => {
  const md = fs.readFileSync(path.join(root, 'chapters/03_Trees', t.name + '.md'), 'utf8'); let tier = -1; const got = [];
  md.split('\n').forEach(line => { if (line.startsWith('## ')) { tier = tierOf(line.slice(3)); return; }
    const m = line.match(/^- \*\*(.+?)(?:\.\*\*|\*\* \*\(level (\d), Evolution I+\)\.\*)(.*)$/); if (m && tier >= 0) got.push(`${m[1]}:${tier}${m[2] ? '@' + m[2] : ''}:${/Push/.test(m[3])}`); });
  eq(t.nodes.map(n => `${n.name}:${n.tier}${n.evo ? '@' + n.evo : ''}:${!!n.push}`).join(), got.join(), t.name + ' nodes (name:tier:Push)');
  eq(t.nodes.filter(n => n.tier < 4).length, 10, t.name + ' has 10 standard nodes');
  t.nodes.filter(n => n.tier === 4).forEach(n => { const f = D.forms.find(x => x.id === n.form); eq(f && f.trees[0], t.id, n.name + ' is on its Form\'s primary tree'); eq(f && f.evo[n.evo], n.id, n.name + ' Form link'); });
});
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
const ats = rows(c4, '| Effect\'s tree | Hide |')[0];
['hide', 'limbs', 'senses', 'glands', 'wiring', 'mind'].forEach((t, i) => eq(D.treeStats[t].map(SN).join(' or '), ats[i + 1], 'Surge stat for ' + t));
eq(D.effects.some(e => e.altStat), false, 'no per-Effect altStat (tree rule replaces it)');
const seq = rows(c4, '| Level | 1 | 2–3 |'); const cols = [1, 2, 4, 7];
eq(cols.map(l => 'd' + D.levels[l - 1].die).join(), seq[0].slice(1, 5).join(), 'ch4 Sequence die'); eq(cols.map(l => D.levels[l - 1].prime).join(), seq[2].slice(1, 5).join(), 'ch4 Prime');
eq(cols.map(l => D.levels[l - 1].sigs || '—').join(), seq[3].slice(1, 5).join(), 'ch4 Signatures');
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
// Ch 13 level table vs builder
rows(ch('13'), '| Level | Rank | Stage | Nodes').forEach(r => { const lv = +r[0], L = D.levels[lv - 1], p = picks(lv);
  eq([L.rank, `${p.prim} + ${p.secTert}${evoN(lv) ? ' + ' + evoN(lv) : ''}`, L.surges, 'd' + L.die, L.die - L.surges, L.prime, L.sigs || '—'].join(), [r[1], r[3], r[4], r[5], r[6], r[7], r[8]].join(), 'ch13 level ' + lv); });
// Ch 11 pregens vs builder examples (expected numbers)
const c11 = ch('11');
['vex', 'juno', 'ozzie', 'rook', 'mags'].forEach(k => { const x = D.examples[k]; const sec = c11.split('### ' + x.name + ' — ')[1]; eq(!!sec, true, 'pregen ' + x.name); if (!sec) return;
  const part = sec.split('\n### ')[0], num = re => { const m = part.match(re); return m ? +m[1].replace('−', '-') : NaN; };
  const e = x.expect;
  eq([e.hp, e.armor, e.speed, e.limit, e.dodge, e.endure, e.resist].join(), [num(/\*\*HP\*\* (\d+)/), num(/\*\*Armor\*\* (\d+)/), num(/\*\*Speed\*\* (\d+)/), num(/\*\*Flux Limit\*\* (\d+)/), num(/Dodge \+?([−\d]+)/), num(/Endure \+?([−\d]+)/), num(/Resist \+?([−\d]+)/)].join(), x.name + ' numbers');
  eq(D.forms.find(f => f.id === x.form).name, part.split(' ')[0].trim(), x.name + ' Form');
  x.nodes.forEach(n => { const nm = D.trees.flatMap(t => t.nodes).find(y => y.id === n).name; checks++; if (!part.includes('*' + nm + '*')) { bad++; console.log(`MISMATCH ${x.name}: node ${nm} not in ch 11`); } });
  x.surges.forEach(sg => { checks++; if (!part.includes('*' + sg[0] + '*')) { bad++; console.log(`MISMATCH ${x.name}: Surge ${sg[0]} not in ch 11`); } });
});
console.log(`${checks} checks, ${bad} mismatches`);
process.exit(bad ? 1 : 0);
