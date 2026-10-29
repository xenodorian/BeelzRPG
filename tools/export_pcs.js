// Exports a library of legal v0.2 characters from the builder for tools/encounter_sim.py.
// Run: NODE_PATH=<dir with jsdom> node tools/export_pcs.js [perCell=10]
// For each Form x level 1-10: the ch 11 / ch 13 example if one matches, plus the better half of
// 2*perCell random legal characters (builder randomChar), scored by best attack and HP.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../builder/index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'file:///x/builder/index.html',pretendToBeVisual:true});
const B=dom.window.MutagenBuilder; const per=+(process.argv[2]||10);
const FORMS=['juggernaut','skitter','oracle','alembic','siren'];
function avg(dmg){ if(!dmg) return 0; let m=String(dmg).match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/); if(!m) return 0; return +m[1]*(+m[2]+1)/2+(+(m[3]||0)); }
function surge(x){ const [shape,effect]=(x.build||'').toLowerCase().split(' + ');
  return {name:x.name,shape:shape||'',effect:effect||'',twists:(x.twists||[]),flux:x.flux,atk:x.atk,stat:x.stat,dmg:x.dmg||'',range:x.range||'',line:x.line||''}; }
function pack(c,src){ const d=B.derive(c); if(!d.legal) return null;
  const tw=(c.surges||[]).map(s=>s.twists||[]); const stw=(c.signatures||[]).map(s=>s.twists||[]);
  const surges=d.surges.map((x,i)=>Object.assign(surge(x),{twists:tw[i]||[]}));
  const sigs=(d.sigs||[]).map((x,i)=>Object.assign(surge(x),{twists:stw[i]||[]}));
  const atks=d.gear.attacks.map(a=>({name:a.name,atk:a.atk,dmg:a.dmg,range:a.range,crit:a.crit,melee:/Melee/.test(a.range),psychic:/Psychic/.test(a.notes||'')}));
  return {src,form:c.form,level:c.level,rank:d.R,stats:d.st,hp:d.hp,armor:d.armor,def:d.def,limit:d.limit,prime:d.prime,maxPrimed:d.maxPrimed,
    die:d.die,known:d.surges.length,wild:d.wild,crit:+String(d.critR).split(/[–-]/)[0]||20,speed:d.speed,nodes:d.nodes,
    medkit:(d.gear.items||{}).medkit||0,stim:(d.gear.items||{}).stim||0,surges,sigs,attacks:atks}; }
function score(p){ let best=0; for(const s of p.surges.concat(p.sigs)) if(s.atk!=null) best=Math.max(best,s.atk*3+avg(s.dmg)*(/burst|wave|pulse/.test(s.shape)?1.4:1));
  for(const a of p.attacks) best=Math.max(best,(a.atk*3+avg(a.dmg))*0.8); return best+p.hp/4+p.armor*3; }
const out=[]; const ex=['dree1','dree4','dree7','vex','juno','ozzie','rook','mags'];
for(const e of ex){ try{ const c=B.fromExample(e); const p=pack(c,'example:'+e); if(p) out.push(p);}catch(err){} }
for(const f of FORMS) for(let L=1;L<=10;L++){ const pool=[]; let tries=0;
  while(pool.length<2*per && tries<20*per){ tries++; const p=pack(B.randomChar(L,f),'random'); if(p) pool.push(p); }
  pool.sort((a,b)=>score(b)-score(a)); out.push(...pool.slice(0,per)); }
fs.writeFileSync(path.join(__dirname,'sim_data/pcs.json'),JSON.stringify(out));
console.log('exported',out.length,'characters');
