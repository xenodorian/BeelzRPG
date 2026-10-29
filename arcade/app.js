/* MUTAGEN ARCADE: the page. All rules live in engine.js (window.MutagenArcade); this file only draws screens and
   forwards clicks. Every control is a real <button>/<select>/<input>, so the whole game is keyboard playable. */
(function () {
"use strict";
const A = window.MutagenArcade, R = window.MutagenRules, D = R.D;
const $ = s => document.querySelector(s), esc = R.esc, sgn = R.sgn;
const scr = $("#screen");
const ui = { view: "title", difficulty: "medium", hardcore: false, party: [], partyName: "The Freelancers", edit: null, run: null, F: null, pendingOpt: null, lvTab: 0, lv: null, autoSpeed: 0 };
window.MutagenArcadeUI = ui;     // for tests

function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); $("#live").textContent = msg; }
function download(name, obj) { const b = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
let fileCb = null;
$("#fileIn").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { let o = null; try { o = JSON.parse(r.result); } catch (x) { toast("That file isn't valid JSON."); } if (o && fileCb) fileCb(o); e.target.value = ""; }; r.readAsText(f); });
function pickFile(cb) { fileCb = cb; $("#fileIn").click(); }
const slug = s => String(s || "party").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase() || "party";
function go(view) { ui.view = view; ui.pendingOpt = null; render(true); }
$("#btnHome").addEventListener("click", () => { if (ui.view === "battle" && ui.F && !/won|lost/.test(ui.F.phase) && !confirm("Leave this fight? Your run is saved; the fight restarts when you continue.")) return; go("title"); });

/* ------------------------------------------------------------------ characters */
const fitL1 = s => { const x = R.normalize(JSON.parse(JSON.stringify(s))); return x.level === 1 ? x : A.fitToLevel(x, 1); };
function charLine(s) { const d = R.derive(s); const f = R.FORM[s.form]; return { d, f, mat: d.material || "bio" }; }
function charCard(s, i) {
  if (!s) return `<div class="card dim"><b>Slot ${i + 1}</b><p class="hint">Empty. Make a freelancer below.</p></div>`;
  const { d, f, mat } = charLine(s);
  return `<b>${esc(s.name || "Unnamed")}</b><div class="small">L${s.level} <span class="${mat}">${esc(d.look ? d.look.name : f ? f.name : "?")}</span> · ${esc(R.ORIGIN[s.origin] ? R.ORIGIN[s.origin].name : "")} · ${esc(R.KIT[s.kit] ? R.KIT[s.kit].name : "")}</div>
  <div class="nums"><div><span>HP</span>${d.hp}</div><div><span>Armor</span>${d.armor}</div><div><span>Flux</span>${d.limit}</div><div><span>Prime</span>${d.prime}×d${d.die}</div></div>
  <div class="small">${R.STAT_IDS.map(k => `${R.STAT_NAME[k].slice(0, 3)} <b>${sgn(d.st[k])}</b>`).join(" · ")}</div>
  <div class="small">Dodge ${sgn(d.def.dodge)} · Endure ${sgn(d.def.endure)} · Resist ${sgn(d.def.resist)}</div>
  <div class="small">Surges: ${d.surges.map(x => esc(x.name)).join(", ") || "—"}${d.sigs.length ? " · Sig: " + d.sigs.map(x => esc(x.name)).join(", ") : ""}</div>
  ${d.legal ? "" : `<ul class="errs">${d.errors.map(e => `<li>${esc(e.m)}</li>`).join("")}</ul>`}`;
}

/* ------------------------------------------------------------------ title */
function viewTitle() {
  const run = A.Saves.run(), rec = A.Saves.records();
  const resumable = run && !["victory", "gameover"].includes(run.step);
  return `<section class="panel"><p class="big">GAUNTLET</p>
  <p>Ten levels of GRAFT contracts back to back. Each level is a <b>minion fight</b>, then a <b>boss fight</b>, then a <b>level-up</b> — until Patient Zero at level 10.
  A <b>Breather</b> follows every minion fight (half HP back, Flux 0); a <b>Lockdown</b> follows every level-up (full heal, injuries cleared, kit restocked).</p>
  ${resumable ? `<div class="card on"><b>Continue: ${esc(run.partyName)}</b> <span class="small">· ${A.DIFFS[run.difficulty].name}${run.hardcore ? " · Permadeath" : ""} · Level ${run.level} · next: ${stepName(run.step)}</span><div class="row" style="margin-top:6px"><button class="pri" data-act="resume" data-focus>Continue run</button><button class="danger" data-act="abandonSaved">Abandon run</button></div></div>` : ""}
  <h3>1. Difficulty</h3><div class="cards" role="radiogroup" aria-label="Difficulty">
  ${Object.keys(A.DIFFS).map(k => { const x = A.DIFFS[k]; return `<button class="card diff ${ui.difficulty === k ? "on" : ""}" role="radio" aria-checked="${ui.difficulty === k}" data-act="diff" data-v="${k}"${!resumable && ui.difficulty === k ? " data-focus" : ""}><b>${x.name}</b><br>${x.size} freelancers<br><span class="small">${k === "easy" ? "A full crew: room for mistakes." : k === "medium" ? "The standard GRAFT squad of four." : "Three against the city. Every Down hurts."} Enemy threat ×${x.threat}.</span></button>`; }).join("")}
  </div>
  <label class="inl"><input type="checkbox" id="hc" ${ui.hardcore ? "checked" : ""}> Permadeath: the dead stay dead and a lost fight ends the run (no retries).</label>
  <div class="row" style="margin-top:10px"><button class="pri" data-act="toParty">2. Build your party →</button></div></section>
  ${rec.length ? `<section class="panel"><h3>Past runs</h3><table class="t"><tr><th>When</th><th>Party</th><th>Difficulty</th><th>Result</th><th>Fights won</th><th>Retries</th></tr>${rec.slice(0, 10).map(r => `<tr><td>${esc(r.when.slice(0, 10))}</td><td>${esc(r.party)}</td><td>${esc(A.DIFFS[r.difficulty].name)}${r.hardcore ? " ☠" : ""}</td><td>${r.result === "victory" ? "★ Victory" : "Fell at level " + r.level}</td><td>${r.stats.wins}/${r.stats.fights}</td><td>${r.stats.retries}</td></tr>`).join("")}</table></section>` : ""}`;
}
const stepName = s => ({ minion: "minion fight", boss: "boss fight", levelup: "level-up", defeat: "defeat (retry?)", victory: "victory", gameover: "game over" })[s] || s;

/* ------------------------------------------------------------------ party */
function partySize() { return A.DIFFS[ui.difficulty].size; }
function ensureSlots() { const n = partySize(); while (ui.party.length < n) ui.party.push(null); }
function viewParty() {
  ensureSlots(); const n = partySize(), chars = R.normalize ? A.Saves.chars() : {}, parties = A.Saves.parties();
  const ready = ui.party.slice(0, n).every(s => s && R.derive(s).legal);
  const extra = ui.party.slice(n).filter(Boolean);
  return `<section class="panel"><h2>Build your party · ${A.DIFFS[ui.difficulty].name} (${n} freelancers)</h2>
  <p class="hint">Everyone starts at level 1 (higher-level imports are fitted down like the builder's "Fit to level"). Characters you save here share the builder's saved list, so anything saved in the <a href="../builder/index.html" target="_blank" rel="noopener">full Character Builder</a> appears under "Load saved".</p>
  <div class="row"><label style="flex:1 1 220px">Party name <input id="pname" value="${esc(ui.partyName)}" maxlength="40"></label>
  <label>Saved parties <select id="partySel"><option value="">Load a party…</option>${Object.keys(parties).map(k => `<option>${esc(k)}</option>`).join("")}</select></label>
  <button data-act="saveParty">Save party</button><button data-act="delParty">Delete party</button><button data-act="exportParty">Export party</button><button data-act="importParty">Import party</button></div>
  <div class="cards">${ui.party.slice(0, n).map((s, i) => `<div class="card ${s && !R.derive(s).legal ? "bad" : ""} ${ui.edit === i ? "on" : ""}">${charCard(s, i)}
    <div class="row" style="margin-top:6px"><button data-act="edit" data-i="${i}" ${s ? "" : "disabled"} aria-label="Edit slot ${i + 1}">Edit</button><button data-act="rand" data-i="${i}" aria-label="Random character in slot ${i + 1}">⚄ Random</button>
    <select data-act="pregen" data-i="${i}" aria-label="Pregen for slot ${i + 1}"><option value="">Pregen…</option>${Object.keys(D.examples).map(k => `<option value="${k}">${esc(D.examples[k].name)}</option>`).join("")}</select>
    <select data-act="loadChar" data-i="${i}" aria-label="Load saved character into slot ${i + 1}"><option value="">Load saved…</option>${Object.keys(chars).map(k => `<option>${esc(k)}</option>`).join("")}</select>
    <button data-act="importChar" data-i="${i}" aria-label="Import character JSON into slot ${i + 1}">Import</button>
    <button data-act="saveChar" data-i="${i}" ${s ? "" : "disabled"} aria-label="Save slot ${i + 1} character">Save</button><button data-act="exportChar" data-i="${i}" ${s ? "" : "disabled"}>Export</button>
    <button data-act="clear" data-i="${i}" ${s ? "" : "disabled"} aria-label="Clear slot ${i + 1}">✕</button></div></div>`).join("")}</div>
  ${extra.length ? `<p class="hint">${extra.length} more character(s) from the loaded party are set aside (this difficulty fields ${n}).</p>` : ""}
  <div class="row"><button data-act="fillRandom">Fill empty slots randomly</button><button data-act="delChar">Manage saved characters…</button></div>
  ${ui.edit != null && ui.party[ui.edit] ? editor(ui.edit) : ""}
  <div class="row" style="margin-top:12px"><button data-act="toTitle">← Back</button><button class="pri" data-act="start" ${ready ? "" : "disabled"}>Start the gauntlet →</button>${ready ? "" : `<span class="hint">Fill every slot with a legal character to start.</span>`}</div></section>
  ${ui.manage ? manageSaved(chars) : ""}`;
}
function manageSaved(chars) {
  return `<section class="panel"><h3>Saved characters (shared with the builder)</h3>${Object.keys(chars).length ? `<table class="t">${Object.keys(chars).map(k => `<tr><td>${esc(k)}</td><td>L${chars[k].level} ${esc(R.FORM[chars[k].form] ? R.FORM[chars[k].form].name : "")}</td><td><button data-act="delSaved" data-k="${esc(k)}">Delete</button></td></tr>`).join("")}</table>` : `<p class="hint">None yet.</p>`}</section>`;
}
// The quick character editor: identity, form, origin, kit, materials and Surges. Nodes are grown automatically (Reroll)
// the way the builder's Random does; for hand-picked nodes use the full builder and load the save here.
function editor(i) {
  const s = ui.party[i], f = R.FORM[s.form], d = R.derive(s), parts = A.surgeParts(s), L = R.lvl(s.level), maxT = D.twistsByRank(L.rank);
  const opt = (arr, cur) => arr.map(x => `<option value="${esc(x.id)}" ${x.id === cur ? "selected" : ""}>${esc(x.name)}</option>`).join("");
  const kit = R.KIT[s.kit];
  const surgeRow = (x, j, sig) => { const sh = R.SHAPE[x.shape];
    return `<div class="card" style="margin:4px 0"><div class="row"><input aria-label="${sig ? "Signature" : "Surge"} ${j + 1} name" data-ed="${sig ? "sgname" : "sname"}" data-j="${j}" value="${esc(x.name)}" style="flex:1 1 140px;width:auto">
      <select aria-label="Shape" data-ed="${sig ? "sgshape" : "sshape"}" data-j="${j}">${opt(parts.shapes, x.shape)}</select><select aria-label="Effect" data-ed="${sig ? "sgeffect" : "seffect"}" data-j="${j}">${opt(parts.effects.filter(e => (e.kind === "infuse") === (sh && sh.kind === "infuse")), x.effect)}</select></div>
      <div class="row small">${D.twists.filter(t => R.twistFits(t, sh)).map(t => `<label class="inl"><input type="checkbox" data-ed="${sig ? "sgtw" : "stw"}" data-j="${j}" data-t="${t.id}" ${x.twists.includes(t.id) ? "checked" : ""} ${!x.twists.includes(t.id) && x.twists.length >= (sig ? 1 : maxT) ? "disabled" : ""}>${esc(t.name)}</label>`).join("")}</div>
      <div class="small">${esc((sig ? d.sigs : d.surges)[j] ? (sig ? d.sigs : d.surges)[j].line : "")}</div></div>`; };
  return `<div class="panel" style="background:var(--pan2)" aria-label="Edit character"><h3>Edit slot ${i + 1}: ${esc(s.name)}</h3>
  <div class="row"><label style="flex:2 1 220px">Name <input data-ed="name" value="${esc(s.name)}" maxlength="60"></label>
  <label>Form <select data-ed="form">${opt(D.forms, s.form)}</select></label>
  <label>Dump stat (0) <select data-ed="dump">${f.dumps.map(k => `<option value="${k}" ${k === s.dumpZero ? "selected" : ""}>${R.STAT_NAME[k]}</option>`).join("")}</select></label>
  <label>Origin <select data-ed="origin">${opt(D.origins, s.origin)}</select></label>
  <label>Kit <select data-ed="kit">${opt(D.kits, s.kit)}</select></label>
  ${kit && kit.weapons.some(w => w && w.choice) ? `<label>Long gun <select data-ed="kitChoice">${["rifle", "shotgun"].map(k => `<option ${s.kitChoice === k ? "selected" : ""}>${k}</option>`).join("")}</select></label>` : ""}</div>
  <p class="small"><i>${esc(f.quote)}</i> ${esc(f.blurb)}</p>
  <div class="row small">Materials: ${f.trees.map(t => `<label class="inl">${esc(R.TREE[t].name)} <select data-ed="mat" data-t="${t}"><option value="bio" ${s.trees[t] !== "chrome" ? "selected" : ""}>Bio</option><option value="chrome" ${s.trees[t] === "chrome" ? "selected" : ""}>Chrome</option></select></label>`).join("")}</div>
  <p class="small">Nodes: ${d.nodes.map(id => esc(R.NODE[id] ? R.NODE[id].name : id)).join(", ")} <button data-act="reroll" data-i="${i}">Reroll nodes</button></p>
  <h3>Surges (${s.surges.length}/${d.known})</h3>${s.surges.map((x, j) => surgeRow(x, j, false)).join("")}
  ${s.signatures.length ? `<h3>Signatures</h3>${s.signatures.map((x, j) => surgeRow(x, j, true)).join("")}` : ""}
  <label>Knacks (comma-separated) <input data-ed="knacks" value="${esc(s.knacks.join(", "))}"></label>
  ${d.legal ? `<p class="small" style="color:var(--acid)">✓ Legal character.</p>` : `<ul class="errs">${d.errors.map(e => `<li>${esc(e.m)}</li>`).join("")}</ul>`}
  ${d.warnings.length ? `<ul class="warns">${d.warnings.map(e => `<li>${esc(e.m)}</li>`).join("")}</ul>` : ""}
  <button data-act="closeEdit">Done</button></div>`;
}
function editField(el) {
  const i = ui.edit, s = ui.party[i]; if (!s) return; const k = el.dataset.ed, j = +el.dataset.j;
  const v = el.type === "checkbox" ? el.checked : el.value;
  switch (k) {
    case "name": s.name = v; return;          // no re-render while typing
    case "knacks": s.knacks = v.split(",").map(x => x.trim()).filter(Boolean); break;
    case "form": { const n = R.randomChar(1, v); n.name = s.name; ui.party[i] = n; break; }
    case "dump": s.dumpZero = v; break;
    case "origin": s.origin = v; { const d = R.derive(s); while (s.surges.length < d.known) s.surges.push(A.autoSurge(s, s.level, false)); while (s.surges.length > d.known) s.surges.pop(); } break;
    case "kit": s.kit = v; break; case "kitChoice": s.kitChoice = v; break;
    case "mat": s.trees[el.dataset.t] = v; break;
    case "sname": s.surges[j].name = v; return; case "sgname": s.signatures[j].name = v; return;
    case "sshape": case "sgshape": { const x = (k === "sshape" ? s.surges : s.signatures)[j]; x.shape = v; const sh = R.SHAPE[v]; const ef = A.surgeParts(s).effects.filter(e => (e.kind === "infuse") === (sh.kind === "infuse")); if (!ef.some(e => e.id === x.effect)) x.effect = ef[0].id; x.twists = x.twists.filter(t => R.twistFits(R.TWIST[t], sh)); break; }
    case "seffect": case "sgeffect": (k === "seffect" ? s.surges : s.signatures)[j].effect = v; break;
    case "stw": case "sgtw": { const x = (k === "stw" ? s.surges : s.signatures)[j]; const t = el.dataset.t; x.twists = v ? x.twists.concat(t) : x.twists.filter(y => y !== t); break; }
  }
  s.scripAdj = R.estimateScrip(s);
  render();
}

/* ------------------------------------------------------------------ the gauntlet map */
function saveRun() { if (ui.run) A.Saves.saveRun(ui.run); }
function ladder(run) {
  let h = `<div class="ladder" role="list" aria-label="Gauntlet progress">`;
  for (let L = 1; L <= 10; L++) {
    const done = L < run.level || run.step === "victory", cur = L === run.level && run.step !== "victory";
    const e = run.enc[L];
    h += `<div role="listitem" class="rung ${done ? "done" : ""} ${cur ? "cur" : ""}"><b>${L}</b>${L === 10 ? "Patient Zero" : L === 5 ? "Krell" : L === 1 ? "Matriarch" : e ? esc(e.boss.replace(/^The /, "")) : "?"}${cur ? `<br><span class="small">${stepName(run.step)}</span>` : done ? "<br>✓" : ""}</div>`;
  }
  return h + `</div>`;
}
function partyStatus(run) {
  return `<div class="cards">${run.pcs.map(rp => { const d = R.derive(rp.s); const hp = rp.dead ? 0 : rp.hp; return `<div class="card ${rp.dead ? "bad dim" : ""}"><b>${esc(rp.s.name)}</b> <span class="small">L${rp.s.level} ${esc(d.look ? d.look.name : "")}</span>
    ${rp.dead ? `<div class="tag bad">DEAD${ui.run.hardcore ? "" : " · GRAFT recovers the body at the next Lockdown"}</div>` : ""}
    <div class="bar ${hp < d.hp / 3 ? "low" : ""}" role="img" aria-label="HP ${hp} of ${d.hp}"><i style="width:${Math.max(0, 100 * hp / d.hp)}%"></i></div><div class="small">HP ${hp}/${d.hp} · Juice ${rp.juice} · Kit: ${Object.keys(rp.kit).filter(k => rp.kit[k]).map(k => `${k} ${rp.kit[k]}`).join(", ") || "—"}</div>
    ${(rp.s.injuries || []).length ? `<div class="small">Injuries: ${rp.s.injuries.map(x => esc(R.INJ[x] ? R.INJ[x].name : x)).join(", ")}</div>` : ""}${rp.s.scars.length ? `<div class="small">Scars/Faults: ${rp.s.scars.map(x => esc(R.SCAR[x] ? R.SCAR[x].name : x)).join(", ")}</div>` : ""}</div>`; }).join("")}</div>`;
}
function viewMap() {
  const run = ui.run, enc = A.ensureEncounters(run);
  const counts = {}; enc.minion.forEach(n => counts[n] = (counts[n] || 0) + 1);
  const next = run.step === "minion" ? `Minions: ${Object.keys(counts).map(n => `${counts[n]} × ${esc(n)}`).join(", ")}` : `${A.BY[enc.boss].role === "boss" ? "Boss" : "Centrepiece"}: ${esc(enc.boss)}`;
  return `<section class="panel"><h2>${esc(run.partyName)} · Level ${run.level}</h2><p class="small">${A.DIFFS[run.difficulty].name}${run.hardcore ? " · Permadeath" : ""} · fights won ${run.stats.wins}/${run.stats.fights} · retries ${run.stats.retries}</p>
  ${ladder(run)}
  <div class="card on"><b>Next: ${stepName(run.step)}</b><p>${next}</p>${run.step === "boss" ? `<p class="small">${esc(A.BY[enc.boss].look || "")}</p>` : ""}
  <div class="row"><button class="pri" data-act="fight" data-focus>Fight →</button><button data-act="saveQuit">Save &amp; quit</button><button class="danger" data-act="abandon">Abandon run</button></div></div>
  <h3>The party</h3>${partyStatus(run)}</section>`;
}

/* ------------------------------------------------------------------ battle: virtual-tabletop map + JRPG command menu + HUDs */
const G = window.MutagenGrid;
const store = (k, d) => { try { const v = localStorage.getItem("mutagen.arcade.ui." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const keep = (k, v) => { try { localStorage.setItem("mutagen.arcade.ui." + k, JSON.stringify(v)); } catch (e) { } };
Object.assign(ui, { menu: { lv: "root" }, cur: null, careful: false, aimMode: "cone", zoom: store("zoom", typeof innerWidth !== "undefined" && innerWidth < 640 ? 36 : 46), speed: store("speed", "normal"), autoSwitch: store("autoSwitch", true), selFoe: null, hover: null, logOpen: store("logOpen", false), anim: null });
const COND_ABBR = { prone: "Pr", held: "Hd", dazed: "Dz", blinded: "Bl", shaken: "Sh", poisoned: "Po", exposed: "Ex", burning: "Bu", veiled: "Ve", linked: "Li", shell: "+A", braced: "Br", helped: "He", spotted: "Sp", adrenal: "Ad", redmist: "RM", targeterr: "TE", cocoon: "Co", weakspot: "WS" };
const THEME_ART = { pumpstation: "setting_halcyon.jpg", streets: "cover.jpg", camp: "setting_halcyon.jpg", clinic: "clinic.jpg", rustyard: "threat_drainbeast.jpg", bloom: "surge.jpg" };
const colName = x => String.fromCharCode(65 + x), sqName = p => p ? colName(p.x) + (p.y + 1) : "—";
const ft = n => n * 5 + " ft";
function startFight() {
  const run = ui.run; ui.F = A.startFight(run); run.inFight = true; persist();
  resetMenu(); ui.view = "battle"; render(true);
}
function persist() { if (ui.run && ui.F) A.saveFight(ui.run, ui.F); saveRun(); }
function resetMenu() { ui.menu = { lv: "root" }; const c = actor(); if (c && c.pos) ui.cur = { x: c.pos.x, y: c.pos.y }; }
const pct = (a, b) => Math.max(0, Math.min(100, 100 * a / Math.max(1, b)));
function condTags(cond, foe) { return Object.keys(cond).filter(k => cond[k] && A.COND_NAME[k] && k !== "shieldused").map(k => `<span class="tag ${foe ? "foe" : ["veiled", "linked", "shell", "braced", "helped", "spotted", "adrenal"].includes(k) ? "" : "bad"}">${A.COND_NAME[k]}</span>`).join(""); }
function actor() { const F = ui.F; if (!F) return null; return F.haste ? F.pc(F.haste.to) : F.active; }
function foeFocus() { const F = ui.F, c = actor(); const id = ui.hover && F.foe(ui.hover) ? ui.hover : ui.selFoe; let e = id && F.foe(id); if (e && (e.dead || e.fled)) e = null;
  if (!e) { const live = F.foesAll(); e = c && c.pos ? live.slice().sort((a, b) => G.dist(a.pos, c.pos) - G.dist(b.pos, c.pos))[0] : live[0]; } return e || null; }
// the per-mode overlays on the map
function overlays() {
  const F = ui.F, c = actor(), m = ui.menu, out = { cls: {}, mark: {}, tok: {}, info: "" };
  const add = (p, k) => { const key = p.x + "," + p.y; out.cls[key] = (out.cls[key] ? out.cls[key] + " " : "") + k; };
  if (!c || !c.pos || F.phase !== "player" || ui.anim) return out;
  const reachCells = careful => { const r = F.reach(c, careful); const res = []; r.forEach(n => { if (n.cost > 0) res.push(n); }); return res; };
  if ((m.lv === "root" || m.lv === "move") && c.t && c.t.move > 0 && !F.haste) {
    const careful = m.lv === "move" && ui.careful;
    reachCells(careful).forEach(n => { add(n, m.lv === "move" ? "mv" : "mv faint"); if (m.lv === "move" && !careful && !c.nodes.has("slipstream") && osOnPath(F, c, G.pathOf(n))) out.mark[n.x + "," + n.y] = "⚠"; });
    if (m.lv === "move" && ui.cur) { const n = F.reach(c, careful).get(G.key(ui.cur.x, ui.cur.y)); if (n && n.cost) G.pathOf(n).forEach(p => add(p, "path")); }
  }
  const o = m.opt && F.options(c).find(x => x.id === m.opt);
  if (o && (m.lv === "target" || m.lv === "aim")) {
    const g = o.geo || {};
    const R = g.range || g.reach || 0, long = g.long ? 2 * g.range : 0;
    if (R && R < 40) for (let y = 0; y < F.map.h; y++) for (let x = 0; x < F.map.w; x++) { const d = G.dist(c.pos, { x, y }); if (d === 0 || F.map.blocked.has(G.key(x, y))) continue;
      if (d <= R && (d <= 1 || G.los(F.map, c.pos, { x, y }))) add({ x, y }, "rng"); else if (long && d <= long && G.los(F.map, c.pos, { x, y })) add({ x, y }, "rng long"); }
    if (m.lv === "target") (o.all || []).forEach(t => { out.tok[t.id] = t.ok ? (t.dis ? "tgt dis" : "tgt") : "no"; });
    if (m.lv === "aim") {
      const aim = ui.cur || c.pos, chk = F.aimCheck(c, o, aim);
      const cells = F.optionCells(c, o, aim, ui.aimMode); cells.forEach(p => add(p, chk.ok ? "aoe" : "aoe bad"));
      const foes = F.foesAlive().filter(e => G.inCells(cells, e.pos)), al = F.pcs.filter(x => !x.dead && G.inCells(cells, x.pos) && !(o.sg && o.sg.geo && o.sg.geo.self && x === c) && !(o.sg && o.sg.shape === "pulse") && o.id !== "scream");
      foes.forEach(e => out.tok[e.id] = "tgt"); al.forEach(x => out.tok[x.id] = "ally-hit");
      out.info = chk.ok ? `Catches ${foes.length ? foes.map(e => e.name).join(", ") : "no enemies"}${al.length ? ` — and ${al.map(x => x.short).join(", ")} (allies Dodge for half)` : ""}.` : `Can't aim there: ${chk.why}.`;
      out.aimOk = chk.ok && foes.length + al.length > 0;
    }
  }
  return out;
}
function osOnPath(F, c, path) {
  return F.foesAlive().some(e => { if (e.cond.dazed || e.osUsed === F.round) return false; const a = e.attacks.find(x => !x.area && !x.summon && x.reach); if (!a) return false;
    let inside = G.dist(path[0], e.pos) <= a.reach; for (let i = 1; i < path.length; i++) { const now = G.dist(path[i], e.pos) <= a.reach; if (inside && !now) return true; inside = now; } return false; });
}
function tokenHTML(F, x, ov, pos) {
  const isPC = x.side === "pc", p = pos || x.pos; if (!p) return "";
  const hp = isPC ? x.hp : Math.max(0, x.hp), max = x.maxhp, act = actor() === x;
  const conds = Object.keys(x.cond || {}).filter(k => x.cond[k] && COND_ABBR[k]);
  const state = x.dead ? "dead" : x.down ? "down" : x.fled ? "fled" : "";
  const mat = isPC ? (x.material === "chrome" ? "chrome" : x.material === "splice" ? "splice" : "bio") : "";
  const num = !isPC && /\s(\d+)$/.exec(x.name); const ini = num ? x.name[0].toUpperCase() + num[1] : (isPC ? x.short : x.name).replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const label = `${x.name}${isPC ? "" : x.boss ? " (boss)" : ""}, ${sqName(p)}, HP ${hp} of ${max}${state ? ", " + state : ""}${conds.length ? ", " + conds.map(k => A.COND_NAME[k]).join(", ") : ""}${ov.tok[x.id] === "no" ? ", out of reach" : ov.tok[x.id] ? ", target" : ""}`;
  return `<button type="button" class="tok ${isPC ? "pc " + mat : "foe"} ${x.boss || x.centre ? "big" : ""} ${state} ${act ? "act" : ""} ${x.dominated ? "dom" : ""} ${ov.tok[x.id] || ""} ${ui.selFoe === x.id ? "sel" : ""}" data-tok="${x.id}" data-fkey="tok-${x.id}" style="--x:${p.x};--y:${p.y};--hp:${pct(hp, max)}" aria-label="${esc(label)}" title="${esc(label)}">
    <span class="ring"></span><span class="face">${esc(ini)}</span>${x.dead ? `<span class="st">✝</span>` : x.down ? `<span class="st">✚</span>` : ""}${ov.tok[x.id] === "no" ? `<span class="st">✕</span>` : ov.tok[x.id] && ov.tok[x.id] !== "ally-hit" ? `<span class="st tg">◎</span>` : ov.tok[x.id] === "ally-hit" ? `<span class="st">!</span>` : ""}
    ${conds.length ? `<span class="cb">${conds.slice(0, 3).map(k => COND_ABBR[k]).join(" ")}</span>` : ""}</button>`;
}
function mapHTML(F, posOverride) {
  const m = F.map, ov = overlays(); let cells = "";
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const k = x + "," + y, ob = m.obst[G.key(x, y)], cur = ui.cur && ui.cur.x === x && ui.cur.y === y;
    cells += `<div class="cell ${ob ? "ob ob-" + ob : ""} ${ov.cls[k] || ""} ${cur ? "cur" : ""}" data-x="${x}" data-y="${y}">${ov.mark[k] ? `<b class="mk">${ov.mark[k]}</b>` : ""}</div>`;
  }
  const toks = F.pcs.concat(F.foes).filter(x => !(x.fled) && (!x.dead || x.side === "pc" || (posOverride && posOverride[x.id] && !posOverride[x.id].dead))).map(x => tokenHTML(F, x, ov, posOverride && posOverride[x.id] ? posOverride[x.id] : null)).join("");
  const cc = ui.cur ? F.at(ui.cur.x, ui.cur.y) : null;
  return { html: `<div class="mapwrap theme-${m.theme}" style="--art:url(../art/${THEME_ART[m.theme] || "cover.jpg"})"><div class="mapscroll" id="mapScroll">
    <div id="map" class="map theme-${m.theme}" role="application" tabindex="0" data-fkey="map" aria-roledescription="battle map" aria-label="Battle map, ${m.w} by ${m.h} squares, 5 feet each. ${esc(m.themeName)}. Arrow keys move the cursor, Enter acts on the cursor square, Escape goes back." style="--cs:${ui.zoom}px;--w:${m.w};--h:${m.h}">
    <div class="cells">${cells}</div>${toks}<div id="fx"></div></div></div>
    <div class="maptools"><span class="small">${esc(m.themeName)} · ${m.w}×${m.h} squares · 1 square = 5 ft</span><span class="small" id="curInfo" aria-live="polite">${ui.cur ? `Cursor ${sqName(ui.cur)}${cc ? ": " + esc(cc.name) : ""}` : ""}</span>
    <span class="row"><button type="button" data-act="zoom" data-v="-1" aria-label="Zoom out">−</button><button type="button" data-act="zoom" data-v="1" aria-label="Zoom in">+</button></span></div></div>`, ov };
}
function pcHUD(F, c) {
  if (!c) { const n = F.pending()[0]; c = n || F.pcs.find(x => !x.dead); }
  if (!c) return `<div class="hud"><p class="small">No freelancer standing.</p></div>`;
  const t = c.t && F.active === c ? c.t : null, mat = c.material === "chrome" ? "chrome" : c.material === "splice" ? "splice" : "bio";
  return `<div class="hud pchud" aria-label="Active freelancer">
  <div class="hrow"><div class="portrait ${mat}" style="background-image:url(../art/char_${mat}.jpg)" role="img" aria-label="${esc(c.formName)} portrait"></div>
  <div><b class="nm">${esc(c.name)}</b><div class="small">L${c.level} ${esc(c.formName)} · ${esc(c.stageName)}${c.ffActive ? " · ★ FINAL FORM" : ""}</div>${F.active === c ? `<span class="tag">ACTIVE · ${sqName(c.pos)}</span>` : `<span class="tag dim">${c.turnDone ? "acted" : "waiting"}</span>`}</div></div>
  ${c.dead ? `<div class="tag bad">DEAD</div>` : c.down ? `<div class="tag bad">DOWN · Death marks ${c.marks}/3</div>` : ""}
  <div class="lbl">HP <b>${c.hp}</b>/${c.maxhp}${c.tmp ? ` <span class="tmpv">+${c.tmp} temp</span>` : ""}</div>
  <div class="bar ${c.hp < c.maxhp / 3 ? "low" : ""}" role="img" aria-label="HP ${c.hp} of ${c.maxhp}"><i style="width:${pct(c.hp, c.maxhp)}%"></i>${c.tmp ? `<i class="tmp" style="left:${pct(c.hp, c.maxhp)}%;width:${pct(c.tmp, c.maxhp)}%"></i>` : ""}</div>
  <div class="lbl">Flux <b>${c.flux}</b> / Limit ${c.limit}${c.flux >= c.limit - 1 ? ` <span class="warnv">⚠ near Overload</span>` : ""}</div>
  <div class="bar flux" role="img" aria-label="Flux ${c.flux} of limit ${c.limit}"><i style="width:${pct(c.flux, c.limit)}%"></i></div>
  <div class="nums"><div><span>Seq. die</span>d${c.die}</div><div><span>Dodge</span>${sgn(c.def.dodge)}</div><div><span>Endure</span>${sgn(c.def.endure)}</div><div><span>Resist</span>${sgn(c.def.resist)}</div><div><span>Armor</span>${c.armor + (c.cond.shell ? 1 : 0)}</div><div><span>Speed</span>${F.speedSq(c) * 5} ft</div><div><span>Juice</span>${"●".repeat(c.juice)}${"○".repeat(Math.max(0, 3 - c.juice))}</div><div><span>Reaction</span>${c.reactions > 0 ? "ready" : "used"}</div></div>
  ${t ? `<div class="acts" aria-label="Actions remaining"><span class="${t.actions > 0 ? "on" : ""}">${t.actions > 0 ? "◆" : "◇"} Action${t.actions > 1 ? " ×" + t.actions : ""}</span><span class="${t.quick > 0 && !c.cond.dazed ? "on" : ""}">${t.quick > 0 && !c.cond.dazed ? "◆" : "◇"} Quick</span><span class="${t.move > 0 ? "on" : ""}">${t.move > 0 ? "◆" : "◇"} Move ${t.move * 5} ft</span>${t.churned ? `<span>Churned</span>` : ""}</div>` : ""}
  <div class="small"><b>Primed:</b> ${c.primed.map(p => `<span class="tag ${p.amped ? "amp" : ""}">${esc(p.sg.name)}${p.amped ? " ★Amped" : ""}</span>`).join("") || "—"}${c.sigs.length ? `<br><b>Signature:</b> ${c.sigs.map(s => `<span class="tag ${c.sigUsed[s.key] ? "dim" : ""}">${esc(s.name)}${c.sigUsed[s.key] ? " (used)" : ""}</span>`).join("")}` : ""}</div>
  <div>${condTags(c.cond)}</div></div>`;
}
function foeHUD(F, e) {
  if (!e) return `<div class="hud foehud"><p class="small">No enemy targeted.</p></div>`;
  const P = F.P, rt = e.spec.ratings || {}, c = actor();
  const traits = Object.keys(e.tr).filter(k => e.tr[k]).map(k => k[0].toUpperCase() + k.slice(1));
  const d = c && c.pos && e.pos ? G.dist(c.pos, e.pos) : null;
  return `<div class="hud foehud" aria-label="Targeted enemy">
  <div class="hrow"><div class="portrait foe ${e.boss ? "boss" : ""}" role="img" aria-label="enemy"><span>${esc(e.name.split(" ").map(w => w[0]).join("").slice(0, 2))}</span></div>
  <div><b class="nm">${esc(e.name)}</b><div class="small">${esc(e.boss ? "BOSS" : e.role)} · Tier ${e.T}${rt["b" + P] != null ? ` · BR ${rt["b" + P]}` : ""}${rt["m" + P] != null ? ` · MR ${rt["m" + P]}` : ""}</div>
  <span class="tag foe">${sqName(e.pos)}${d != null ? ` · ${d * 5} ft away` : ""}</span>${e.dominated ? `<span class="tag">on your side</span>` : ""}${e.shifted ? `<span class="tag foe">Shifted</span>` : ""}</div></div>
  ${e.dead ? `<div class="small">✝ down</div>` : `<div class="lbl">HP <b>${Math.max(0, e.hp)}</b>/${e.maxhp}</div><div class="bar foe" role="img" aria-label="HP ${e.hp} of ${e.maxhp}"><i style="width:${pct(e.hp, e.maxhp)}%"></i></div>
  <div class="nums"><div><span>Guard</span>${F.guardOf(e)}</div><div><span>TN</span>${e.tn}</div><div><span>Armor</span>${e.armor}</div><div><span>Speed</span>${esc(e.speedTxt)}</div></div>
  <div class="small">${e.actions > 1 ? `${e.actions} actions · ` : ""}${e.interrupts ? `${e.interrupts} Interrupt · ` : ""}${traits.length ? "Traits: " + esc(traits.join(", ")) : "No special traits"}</div>
  <ul class="atks">${e.attacks.map(a => `<li><b>${esc(a.n)}</b>${a.summon ? " (summons)" : ` · ${a.dmg} dmg · ${a.area ? `Area: ${esc(a.area === true ? "" : String(a.shape || a.rng || a.area))}` : a.reach ? `reach ${a.reach * 5} ft` : a.range ? `${a.range * 5} ft` : ""}${a.d ? " vs " + esc(a.d) : ""}${a.rider ? " · " + esc(A.COND_NAME[a.rider] || a.rider) : ""}`}${a.recharge && !e.charge[a.n] ? " ⟳ recharging" : ""}</li>`).join("")}</ul>
  <div>${condTags(e.cond, true)}</div>${e.spec.tactics ? `<p class="small tac">${esc(e.spec.tactics)}</p>` : ""}`}</div>`;
}
function orderBar(F) {
  const ord = F.order(); const c = actor();
  const chip = x => `<li class="oc ${x.side} ${x === c ? "now" : ""} ${x.turnDone || x.dead || x.down ? "done" : ""}" title="${esc(x.name)}"><span>${esc(x.short || x.name)}</span>${x.dead ? " ✝" : x.down ? " ✚" : x.turnDone ? " ✓" : x === c ? " ◀" : ""}</li>`;
  const foes = F.foesAll();
  return `<ol class="order" aria-label="Turn order, round ${F.round}"><li class="oc lab">Round ${F.round || 1}</li>${!F.playersFirst && F.round <= 1 && F.phase !== "player" ? `<li class="oc foe">Enemy Phase (${foes.length})</li>` : ""}${ord.map(chip).join("")}<li class="oc foe ${F.phase === "enemy" ? "now" : ""}">Enemy Phase · ${foes.map(e => esc(e.name)).slice(0, 4).join(", ")}${foes.length > 4 ? ` +${foes.length - 4}` : ""}</li></ol>`;
}
// ---- the JRPG command menu
const ROOTS = [["move", "Move"], ["attack", "Attack"], ["surge", "Surges"], ["churn", "Churn"], ["items", "Items / Kit"], ["other", "Defend / Other"], ["wait", "Wait"], ["end", "End Turn"]];
function groupOf(o) { if (o.id === "move") return "move"; if (o.id === "end") return "end"; if (o.id === "churn") return "churn"; if (o.id.startsWith("atk:")) return "attack"; if (/^(un|sig):/.test(o.id)) return "surge"; if (o.group === "Items") return "items"; return "other"; }
function targetSummary(F, o) {
  if (o.target === "enemy" || o.target === "ally") { if (o.targets.length) return `${o.targets.length} in range`; const w = (o.all || [])[0]; return w ? "none in range" : "no targets"; }
  if (o.target === "area") { const b = F.autoAim(actor(), o); return b ? `best aim: ${b.foes.length} enem${b.foes.length === 1 ? "y" : "ies"}` : "nothing in reach"; }
  return "";
}
function optRow(F, o, i) {
  const kind = o.kind === "quick" ? "Quick" : o.kind === "free" ? "Free" : o.kind === "move" ? "Move" : "Action";
  const blocked = (o.target === "enemy" || o.target === "ally") && !o.targets.length;
  const why = blocked ? ((o.all || []).find(x => !x.ok) || {}).why || "no valid target" : "";
  return `<button type="button" class="cmd opt ${o.over ? "over" : ""}" data-act="opt" data-o="${esc(o.id)}" ${blocked ? `aria-disabled="true" data-why="${esc(why)}"` : ""} data-fkey="opt-${esc(o.id)}"><span>${i < 9 ? `<span class="k">${i + 1}</span>` : ""}${esc(o.label)}${o.detail ? `<small>${esc(o.detail)}</small>` : ""}${blocked ? `<small class="why">✕ ${esc(why)}${/range|reach|sight/.test(why) ? " — move first" : ""}</small>` : (o.target !== "none" && o.target !== "move" ? `<small class="ok">${esc(targetSummary(F, o))}</small>` : "")}${o.over ? `<small class="warnv">⚠ past your Flux Limit: you will Overload</small>` : ""}</span><span class="meta">${o.flux != null ? `<span class="fx">${o.flux} Flux</span>` : ""}<span class="k">${kind}</span></span></button>`;
}
function menuHTML(F) {
  const run = ui.run;
  if (ui.anim) return `<div class="menu" role="region" aria-label="Enemy turn"><h3>${F.phase === "enemy" || ui.anim.enemy ? "Enemy Phase" : "Resolving…"}</h3><p id="banner" class="banner" aria-live="polite">…</p><div class="row"><button type="button" data-act="skipAnim" data-focus data-fkey="skip">Skip ▶▶ (Space)</button></div></div>`;
  if (F.phase === "won" || F.phase === "lost") {
    const won = F.phase === "won";
    return `<div class="menu"><div class="card ${won ? "on" : "bad"}"><p class="big">${won ? "VICTORY" : "DEFEAT"}</p><p>${esc(F.title)} · ${F.stats.rounds} rounds · dealt ${F.stats.dealt}, took ${F.stats.taken}${F.stats.downs ? ` · ${F.stats.downs} Down` : ""}${F.stats.deaths ? ` · ${F.stats.deaths} dead` : ""}</p>
    <button class="pri" data-act="afterFight" data-focus>${won ? (F.kind === "minion" ? "Take a Breather →" : run.level >= 10 ? "Claim victory →" : "Level up →") : "Continue →"}</button></div></div>`;
  }
  if (F.phase === "prime") {
    return `<div class="menu"><h3>Prime</h3><p class="small">Every freelancer rolls their Sequence die Prime times. Doubles make that Surge Amped (0 Flux). You may spend Juice to set a die to any face before locking in.</p>
    <div class="cards">${F.pcs.filter(c => c.primeDice && !c.dead).map(c => `<div class="card"><b>${esc(c.short)}</b> <span class="small">d${c.die} × ${c.prime} · Juice ${c.juice}</span><div class="dice">${c.primeDice.map((v, j) => { const sg = F.slotOf(c, v); return `<span class="die" title="${esc(sg ? sg.name : "Wild")}">${v}</span>${c.juice > 0 ? `<select aria-label="${esc(c.short)} die ${j + 1}: spend Juice to set" data-act="setDie" data-id="${c.id}" data-j="${j}"><option value="">Juice…</option>${Array.from({ length: c.die }, (_, x) => `<option value="${x + 1}">${x + 1}: ${esc((F.slotOf(c, x + 1) || { name: "Wild" }).name)}</option>`).join("")}</select>` : ""}`; }).join(" ")}</div>
    <div class="small">${c.primeDice.map(v => esc((F.slotOf(c, v) || { name: "Wild slot" }).name)).join(" · ")}</div></div>`).join("")}</div>
    <div class="row"><button class="pri" data-act="lockPrime" data-focus>Lock in Prime →</button><button data-act="autoAll">Auto-battle</button></div></div>`;
  }
  if (F.phase === "setup") {
    return `<div class="menu"><h3>Ready</h3><p class="small">The freelancers deploy on the left, the enemies on the right. Primed Surges show in each HUD.${F.pcs.some(c => F.canFinalForm(c)) ? " Level 10: a freelancer can enter Final Form now (once per Lockdown)." : ""}</p>
    ${F.pcs.filter(c => F.canFinalForm(c)).map(c => `<button data-act="final" data-id="${c.id}">★ ${esc(c.short)}: FINAL FORM</button>`).join(" ")}
    ${F.pcs.filter(c => F.firmwareOptions(c)).map(c => `<div class="row small"><span>${esc(c.short)}'s Firmware: swap</span><select data-fw="p" data-id="${c.id}">${c.primed.map((p, j) => `<option value="${j}">${esc(p.sg.name)}</option>`).join("")}</select><span>for</span><select data-fw="s" data-id="${c.id}">${F.firmwareOptions(c).map(s => `<option value="${s.key}">${esc(s.name)}</option>`).join("")}</select><button data-act="fw" data-id="${c.id}">Swap</button></div>`).join("")}
    <p class="small">${F.playersFirst ? "Initiative: the freelancers go first." : "Initiative: the enemies go first!"}</p><div class="row"><button class="pri" data-act="begin" data-focus>Begin the fight →</button><button data-act="autoAll">Auto-battle</button></div></div>`;
  }
  if (F.phase !== "player") return `<div class="menu"><p>…</p></div>`;
  const c = actor();
  if (!c) return `<div class="menu"><h3>Round ${F.round} · Player Phase</h3><p class="small">Pick who acts next (any order).</p><div class="cmds">${F.pending().map((x, i) => `<button type="button" class="cmd" data-act="turn" data-id="${x.id}" ${i === 0 ? "data-focus" : ""} data-fkey="turn-${x.id}"><span><span class="k">${i + 1}</span>${esc(x.short)} <small>HP ${x.hp}/${x.maxhp} · Flux ${x.flux}/${x.limit}</small></span></button>`).join("")}</div>${autoRow(F)}</div>`;
  const opts = F.options(c), m = ui.menu, hc = F.haste && F.haste.to === c.id;
  const head = `<div class="mhead"><b>${hc ? `${esc(c.short)} is Hasted — one Action (not Unleash) with advantage` : `${esc(c.short)}'s turn`}</b>${m.lv !== "root" ? `<button type="button" class="back" data-act="back" data-fkey="back">← Back (Esc)</button>` : ""}</div>`;
  if (m.lv === "move") {
    return `<div class="menu" role="region" aria-label="Move">${head}<p class="small">Move ${c.t.move * 5} ft left (diagonals count as 5 ft). Click a lit square, or move the cursor with the arrow keys and press Enter. ⚠ marks squares whose path leaves an enemy's reach and provokes an Opportunity Strike.</p>
    <label class="inl"><input type="checkbox" id="careful" ${ui.careful ? "checked" : ""}> Move carefully: half speed, no Opportunity Strikes (C)</label>
    <div class="row"><button type="button" class="pri" data-act="moveHere" data-focus data-fkey="moveHere">Move to ${sqName(ui.cur)} (Enter)</button></div></div>`;
  }
  const o = m.opt && opts.find(x => x.id === m.opt);
  if (m.lv === "target" && o) {
    const list = (o.all || []).slice().sort((a, b) => b.ok - a.ok);
    return `<div class="menu" role="region" aria-label="Choose a target">${head}<p class="small"><b>${esc(o.label)}</b> — choose a target (↑/↓, Enter, or click a token on the map). Range is lit on the map; long range shown fainter.</p>
    <div class="cmds">${list.map((t, i) => { const x = F.byId(t.id); return `<button type="button" class="cmd" data-act="target" data-t="${t.id}" ${t.ok ? "" : `aria-disabled="true" data-why="${esc(t.why)}"`} ${i === 0 && t.ok ? "data-focus" : ""} data-fkey="tg-${t.id}"><span><span class="k">${i + 1}</span>${esc(x.name)} <small>${sqName(x.pos)} · HP ${Math.max(0, x.hp)}/${x.maxhp}${x.side === "foe" ? ` · Guard ${F.guardOf(x)}` : ""}${c.pos && x.pos ? ` · ${G.dist(c.pos, x.pos) * 5} ft` : ""}</small>${t.ok ? (t.dis ? `<small class="warnv">disadvantage: ${esc(t.why)}</small>` : "") : `<small class="why">✕ ${esc(t.why)}</small>`}</span></button>`; }).join("") || `<p class="small">No targets.</p>`}</div></div>`;
  }
  if (m.lv === "aim" && o) {
    const ov = overlays(); const wave = (o.sg && o.sg.shape === "wave");
    return `<div class="menu" role="region" aria-label="Aim the area">${head}<p class="small"><b>${esc(o.label)}</b> — ${o.geo && (o.geo.self || o.geo.shape === "pulse") ? "centred on you." : "place the template: click a square or move the cursor (arrows), Enter to confirm."}${wave ? " T switches cone / line." : ""}</p>
    <p class="banner" aria-live="polite">${esc(ov.info || "")}</p>
    <div class="row"><button type="button" class="pri" data-act="confirmAim" ${ov.aimOk ? "" : `aria-disabled="true"`} data-focus data-fkey="confirmAim">Confirm (Enter)</button><button type="button" data-act="bestAim">Best aim</button>${wave ? `<button type="button" data-act="aimMode">${ui.aimMode === "cone" ? "15-ft cone → line" : "30-ft line → cone"} (T)</button>` : ""}</div></div>`;
  }
  if (m.lv === "list") {
    const list = opts.filter(x => groupOf(x) === m.grp);
    return `<div class="menu" role="region" aria-label="${esc(m.grp)}">${head}<div class="cmds">${list.map((x, i) => optRow(F, x, i)).join("") || `<p class="small">Nothing here right now.</p>`}</div></div>`;
  }
  // root
  const roots = ROOTS.filter(([g]) => !(hc && (g === "move" || g === "wait" || g === "churn")));
  const rows = roots.map(([g, label], i) => {
    let en = false, sub = "";
    if (g === "wait") { en = F.canWait(c); sub = en ? "let someone else go first" : "only before you act"; }
    else if (g === "end") { en = !hc; sub = hc ? "" : "end " + c.short + "'s turn"; }
    else { const L = opts.filter(x => groupOf(x) === g); en = L.length > 0; sub = g === "move" ? (en ? `${c.t.move * 5} ft left` : c.t.move > 0 ? "can't move" : "no movement left") : g === "churn" ? (en ? `d${c.die}, +1 Flux (Quick)` : c.t.unleashed ? "you Unleashed this turn" : "Quick used") : en ? `${L.length} option${L.length > 1 ? "s" : ""}` : g === "surge" ? (c.t.churned ? "Churned: no Unleash" : c.t.actions > 0 ? "nothing Primed" : "no Action left") : "none available"; }
    return `<button type="button" class="cmd root" data-act="root" data-g="${g}" ${en ? "" : `aria-disabled="true"`} ${i === 0 ? "" : ""} data-fkey="root-${g}"><span><span class="k">${i + 1}</span>${label}</span><small>${esc(sub)}</small></button>`;
  }).join("");
  return `<div class="menu" role="region" aria-label="Commands">${head}<div class="cmds rootcmds">${rows}</div>${hc ? `<button data-act="skipHaste">Skip the Haste action</button>` : ""}${autoRow(F)}</div>`;
}
function autoRow(F) {
  return `<div class="row autorow"><button type="button" data-act="autoTurn">Auto: this turn</button><button type="button" data-act="autoRound">Auto: round</button><button type="button" data-act="autoAll">Auto: battle</button>
  <label class="inl small">Enemy turns <select id="animSpeed" aria-label="Enemy turn animation speed">${["normal", "fast", "off"].map(s => `<option value="${s}" ${ui.speed === s ? "selected" : ""}>${s === "off" ? "instant" : s}</option>`).join("")}</select></label>
  <label class="inl small"><input type="checkbox" id="autoSwitch" ${ui.autoSwitch ? "checked" : ""}> Auto-switch turns</label></div>`;
}
function viewBattle(posOverride) {
  const F = ui.F, c = actor(), mp = mapHTML(F, posOverride);
  return `<section class="panel bpanel"><div class="bhead"><h2>Level ${F.level} · ${esc(F.title)}</h2><span class="small">${F.phase === "player" ? `Round ${F.round} · Player Phase` : F.phase === "prime" ? "Prime" : F.phase === "setup" ? "Before the first round" : F.phase === "enemy" ? "Enemy Phase" : ""} · ${esc(ui.run.partyName)} · ${A.DIFFS[ui.run.difficulty].name}${ui.run.hardcore ? " · Permadeath" : ""}</span></div>
  ${orderBar(F)}
  <div class="vtt"><aside class="hudcol left">${pcHUD(F, c)}</aside><div class="mapcol">${mp.html}</div><aside class="hudcol right" id="foeHud">${foeHUD(F, foeFocus())}</aside></div>
  <div class="dock" id="dock">${menuHTML(F)}</div>
  <details class="logbox" ${ui.logOpen ? "open" : ""}><summary>Dice log (${F.logs.length})</summary><div id="log" role="log" aria-label="Combat log" tabindex="0">${F.logs.slice(-400).map(l => `<div class="${esc(l.cls)}">${esc(l.t)}</div>`).join("")}</div></details></section>`;
}
let lastLogLen = 0;
function announce() { const F = ui.F; if (!F) return; const fresh = F.logs.slice(lastLogLen).map(l => l.t); lastLogLen = F.logs.length; if (fresh.length) $("#live").textContent = fresh.slice(-4).join(" "); }
// begin the next freelancer's turn automatically (initiative order)
function autoSwitch() {
  const F = ui.F; if (!ui.autoSwitch) return; let g = 0;
  while (F.phase === "player" && !F.active && !F.haste && g++ < 12) { const n = F.pending()[0]; if (!n) { F.endPlayerPhase(); continue; } F.beginTurn(n); if (F.active === n) { resetMenu(); ui.selFoe = null; break; } }
}
function snap(F) { const o = {}; F.pcs.concat(F.foes).forEach(x => { if (x.pos) o[x.id] = { x: x.pos.x, y: x.pos.y, hp: x.hp, dead: !!x.dead || !!x.fled }; }); return o; }
// run something against the engine, then animate what happened (enemy turns, moves, hits) and re-render
function doAct(fn, opts) {
  const F = ui.F; if (!F || ui.anim) return; const before = snap(F); F.events = [];
  fn(); if (!(opts && opts.noSwitch)) autoSwitch();
  const evs = F.events; F.events = []; announce(); persist();
  if (F.phase === "won" || F.phase === "lost") ui.run.inFight = false;
  const anim = evs.filter(e => ["move", "atk", "area", "dmg", "heal", "die", "summon"].includes(e.t));
  if (ui.speed !== "off" && anim.length && !(opts && opts.instant)) play(before, evs, opts && opts.focus);
  else { if (!actor()) resetMenu(); render(true); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function play(before, evs, focusKey) {
  const F = ui.F; const k = ui.speed === "fast" ? 0.35 : 1; const enemy = evs.some(e => e.t === "log" && /^Enemy Phase/.test(e.text));
  ui.anim = { skip: false, enemy }; const pos = JSON.parse(JSON.stringify(before));
  render(false); const skipBtn = scr.querySelector("[data-act=skipAnim]"); if (skipBtn) skipBtn.focus({ preventScroll: true });
  const map = $("#map"), fx = $("#fx"), banner = () => $("#banner");
  const tok = id => map && map.querySelector(`[data-tok="${id}"]`);
  const float = (id, txt, cls) => { const t = tok(id); if (!t || !fx) return; const p = pos[id] || {}; const d = document.createElement("div"); d.className = "float " + cls; d.textContent = txt; d.style.setProperty("--x", p.x); d.style.setProperty("--y", p.y); fx.appendChild(d); setTimeout(() => d.remove(), 1100 * k + 200); };
  try {
    for (const e of evs) {
      if (ui.anim.skip) break;
      if (e.t === "log") { const b = banner(); if (b && !/^\s/.test(e.text)) b.textContent = e.text; continue; }
      if (e.t === "move") { const t = tok(e.id); if (!t) continue; for (const p of e.path.slice(1)) { if (ui.anim.skip) break; t.style.setProperty("--x", p.x); t.style.setProperty("--y", p.y); pos[e.id] = Object.assign(pos[e.id] || {}, { x: p.x, y: p.y }); await sleep((e.blink ? 60 : 140) * k); } continue; }
      if (e.t === "atk") { const a = tok(e.id); if (a) a.classList.add("flash"); (e.to || []).forEach(id => { const t = tok(id); if (t) t.classList.add("hit"); }); await sleep(320 * k); if (a) a.classList.remove("flash"); (e.to || []).forEach(id => { const t = tok(id); if (t) t.classList.remove("hit"); }); continue; }
      if (e.t === "area") { const els = (e.cells || []).map(p => map.querySelector(`.cell[data-x="${p.x}"][data-y="${p.y}"]`)).filter(Boolean); els.forEach(x => x.classList.add("blast")); const a = tok(e.id); if (a) a.classList.add("flash"); await sleep(420 * k); els.forEach(x => x.classList.remove("blast")); if (a) a.classList.remove("flash"); continue; }
      if (e.t === "dmg") { float(e.id, "−" + e.n, "dmg"); const t = tok(e.id); const x = F.byId(e.id); if (t && x && pos[e.id]) { pos[e.id].hp -= e.n; t.style.setProperty("--hp", pct(pos[e.id].hp, x.maxhp)); } await sleep(160 * k); continue; }
      if (e.t === "heal") { float(e.id, "+" + e.n, "heal"); const t = tok(e.id); const x = F.byId(e.id); if (t && x && pos[e.id]) { pos[e.id].hp = Math.min(x.maxhp, pos[e.id].hp + e.n); t.style.setProperty("--hp", pct(pos[e.id].hp, x.maxhp)); } await sleep(140 * k); continue; }
      if (e.t === "die") { const t = tok(e.id); if (t) t.classList.add("dead"); await sleep(200 * k); continue; }
    }
  } catch (err) { /* animation is cosmetic */ }
  ui.anim = null; if (!actor()) resetMenu(); render(true);
  if (focusKey) { const f = scr.querySelector(`[data-fkey="${focusKey}"]`); if (f) f.focus(); }
}
// ---- doing things from the menu or the map
function chooseOpt(id) {
  const F = ui.F, c = actor(); if (!c) return; const o = F.options(c).find(x => x.id === id); if (!o) return;
  if (o.id === "move") { ui.menu = { lv: "move" }; ui.cur = { x: c.pos.x, y: c.pos.y }; render(); focusMap(); return; }
  if (o.id === "end") { doAct(() => F.perform(c, "end")); return; }
  if (o.target === "enemy" || o.target === "ally") {
    if (!o.targets.length) { const w = (o.all || []).find(x => !x.ok); toast(w ? `No target in range: ${w.why}. Move closer first.` : "No valid target."); return; }
    ui.menu = { lv: "target", opt: id }; const t = F.byId(o.targets[0]); if (t && t.pos) ui.cur = { x: t.pos.x, y: t.pos.y }; if (t && t.side === "foe") ui.selFoe = t.id; render(true); return;
  }
  if (o.target === "area") { ui.menu = { lv: "aim", opt: id }; const b = F.autoAim(c, o); ui.cur = b ? { x: b.aim.x, y: b.aim.y } : { x: c.pos.x, y: c.pos.y }; if (b && b.mode) ui.aimMode = b.mode; render(); focusMap(); return; }
  if (o.over && !confirm(`${o.label}: this pushes ${c.short} past their Flux Limit and they will Overload. Do it anyway?`)) return;
  doPerform(c, id, null, {});
}
function doPerform(c, id, target, extra) {
  const F = ui.F; const o = F.options(c).find(x => x.id === id);
  if (o && o.over && (o.target === "enemy" || o.target === "ally" || o.target === "area") && !confirm(`${o.label}: this pushes ${c.short} past their Flux Limit and they will Overload. Do it anyway?`)) return;
  let res = null; doAct(() => { res = F.perform(c, id, target, extra); if (res && res.ok && F.active === c) ui.menu = { lv: "root" }; });
  if (res && !res.ok) toast(res.msg);
}
function pickTarget(id) {
  const F = ui.F, c = actor(), o = F.options(c).find(x => x.id === ui.menu.opt); if (!o) return;
  const t = (o.all || []).find(x => x.id === id); if (!t) return toast("That isn't a target for " + o.label + ".");
  if (!t.ok) return toast(`${F.byId(id).name}: ${t.why}.`);
  doPerform(c, o.id, id, {});
}
function confirmAim() {
  const F = ui.F, c = actor(), o = F.options(c).find(x => x.id === ui.menu.opt); if (!o) return;
  const chk = F.aimCheck(c, o, ui.cur || c.pos); if (!chk.ok) return toast(`Can't aim there: ${chk.why}.`);
  doPerform(c, o.id, null, { aim: ui.cur || c.pos, mode: ui.aimMode });
}
function moveTo(x, y) {
  const F = ui.F, c = actor(); if (!c) return;
  const n = F.reach(c, ui.menu.lv === "move" && ui.careful).get(G.key(x, y)); if (!n || !n.cost) return toast(F.map.blocked.has(G.key(x, y)) ? "That square is blocked." : F.at(x, y) ? "That square is occupied." : "Out of reach this turn.");
  const careful = ui.menu.lv === "move" && ui.careful;
  let res = null; doAct(() => { res = F.perform(c, "move", null, { x, y, careful }); if (F.active === c) ui.menu = { lv: c.t.move > 0 && ui.menu.lv === "move" ? "move" : "root" }; }, { focus: "map" });
  if (res && !res.ok) toast(res.msg);
}
function focusMap() { const m = $("#map"); if (m) m.focus({ preventScroll: true }); }
function back() {
  const m = ui.menu, c = actor();
  if ((m.lv === "target" || m.lv === "aim") && c) { const o = ui.F.options(c).find(x => x.id === m.opt); ui.menu = o ? { lv: "list", grp: groupOf(o) } : { lv: "root" }; }
  else ui.menu = { lv: "root" };
  if (c && c.pos) ui.cur = { x: c.pos.x, y: c.pos.y }; render(true);
}
function cellClick(x, y) {
  const F = ui.F, c = actor(), m = ui.menu; if (!F || ui.anim) return;
  ui.cur = { x, y }; const who = F.at(x, y);
  if (m.lv === "target") { if (who) return pickTarget(who.id); return render(); }
  if (m.lv === "aim") { const o = F.options(c).find(z => z.id === m.opt); if (o && F.aimCheck(c, o, { x, y }).ok && ui.lastAim && ui.lastAim.x === x && ui.lastAim.y === y) { ui.lastAim = null; return confirmAim(); } ui.lastAim = { x, y }; return render(); }
  if ((m.lv === "move" || m.lv === "root") && c && c.t && c.t.move > 0 && !who && F.phase === "player" && !F.haste) { const n = F.reach(c, m.lv === "move" && ui.careful).get(G.key(x, y)); if (n && n.cost) return moveTo(x, y); }
  if (who && who.side === "foe") ui.selFoe = who.id;
  render();
}
function moveCursor(dx, dy) {
  const F = ui.F; if (!ui.cur) { const c = actor(); ui.cur = c && c.pos ? { x: c.pos.x, y: c.pos.y } : { x: 0, y: 0 }; }
  ui.cur = { x: Math.max(0, Math.min(F.map.w - 1, ui.cur.x + dx)), y: Math.max(0, Math.min(F.map.h - 1, ui.cur.y + dy)) };
  const w = F.at(ui.cur.x, ui.cur.y); if (w && w.side === "foe") ui.selFoe = w.id;
  render(); focusMap();
  const cc = F.at(ui.cur.x, ui.cur.y); $("#live").textContent = `${sqName(ui.cur)}${cc ? ": " + cc.name + ", HP " + Math.max(0, cc.hp) + " of " + cc.maxhp : F.map.blocked.has(G.key(ui.cur.x, ui.cur.y)) ? ": blocked" : ""}`;
}
function cursorEnter() {
  const F = ui.F, m = ui.menu; if (!ui.cur) return;
  if (m.lv === "aim") return confirmAim();
  if (m.lv === "target") { const w = F.at(ui.cur.x, ui.cur.y); if (w) return pickTarget(w.id); return toast("No creature on that square."); }
  cellClick(ui.cur.x, ui.cur.y);
}
function autoRest(all) {
  doAct(() => {
    const F = ui.F; let g = 0;
    if (F.phase === "prime") A.autoSetup(F);
    if (F.phase === "setup") { A.autoSetup(F); F.begin(); }
    const round = F.round;
    while (F.phase === "player" && g++ < 600) {
      if (F.haste) { const a = F.pc(F.haste.to); const ch = A.aiChoose(F, a, F.options(a).filter(o => o.kind === "action")); if (!ch || ch.id === "end") F.haste = null; else F.perform(a, ch.id, ch.target, ch.extra); continue; }
      if (F.active) { A.autoTurnRest(F, F.active); continue; }
      if (!all && F.round !== round) break;
      const c = F.pending()[0]; if (!c) { F.endPlayerPhase(); continue; }
      A.autoTurn(F, c);
      if (!all && F.round !== round) break;
      if (all && F.round > 60) { F.phase = "lost"; F.finish(false); break; }
    }
  }, { instant: all });
}
function autoThisTurn() {
  doAct(() => {
    const F = ui.F; let g = 0;
    while (g++ < 6 && F.phase === "player" && F.haste) { const a = F.pc(F.haste.to); const ch = A.aiChoose(F, a, F.options(a).filter(o => o.kind === "action")); if (!ch || ch.id === "end") F.haste = null; else F.perform(a, ch.id, ch.target, ch.extra); }
    if (F.active) A.autoTurnRest(F, F.active);
  });
}
function afterFight() {
  const run = ui.run, F = ui.F; const st = A.completeFight(run, F); run.inFight = false; ui.F = null; lastLogLen = 0;
  if (st === "levelup") { initLevelUp(); }
  if (st === "victory" || st === "gameover") A.Saves.addRecord(run);
  saveRun(); go(st === "levelup" ? "levelup" : st === "victory" || st === "gameover" ? "end" : st === "defeat" ? "defeat" : "map");
  if (st === "boss") toast("Breather: everyone recovers half their HP, Flux resets to 0.");
}

function initLevelUp() {
  const run = ui.run;
  ui.lv = run.pcs.map(rp => { if (rp.dead && run.hardcore) return null; const s = rp.s, plan = A.levelPlan(s, s.level + 1), auto = A.autoLevelChoices(s);
    return { plan, prim: auto.nodes.slice(0, plan.prim), sec: auto.nodes.slice(plan.prim), surges: auto.surges, sigs: auto.sigs, knacks: auto.knacks, materials: {} }; });
  ui.lvTab = ui.lv.findIndex(Boolean);
}
const lvChoices = lv => ({ nodes: lv.prim.concat(lv.sec), surges: lv.surges, sigs: lv.sigs, knacks: lv.knacks, materials: lv.materials });
function viewLevelUp() {
  const run = ui.run; if (!ui.lv) initLevelUp();
  const results = run.pcs.map((rp, i) => ui.lv[i] ? A.applyLevelUp(rp.s, lvChoices(ui.lv[i])) : null);
  const allOk = results.every(r => !r || r.ok);
  const i = ui.lvTab, rp = run.pcs[i], lv = ui.lv[i], res = results[i];
  return `<section class="panel"><h2>Level up! ${run.level} → ${run.level + 1}</h2><p class="small">Then a Lockdown: full HP, injuries cleared, Juice back to at least 1, kit restocked${run.hardcore ? "" : ", and anyone who died is recovered by GRAFT with a permanent Scar or Fault"}.</p>
  <div class="tabs" role="tablist">${run.pcs.map((p, j) => `<button role="tab" aria-selected="${j === i}" data-act="lvTab" data-i="${j}" ${ui.lv[j] ? "" : "disabled"}>${esc(p.s.name.replace(/".*?"\s*/, ""))}${results[j] ? results[j].ok ? " ✓" : " ⚠" : " ✝"}</button>`).join("")}</div>
  ${lv ? levelPanel(rp, lv, res, i) : ""}
  <div class="row" style="margin-top:10px"><button data-act="lvAutoAll">Suggest picks for everyone</button><button class="pri" data-act="lvConfirm" ${allOk ? "" : "disabled"}>Confirm level-ups &amp; Lockdown →</button>${allOk ? "" : `<span class="hint">Fix the ⚠ sheets first.</span>`}</div></section>`;
}
function levelPanel(rp, lv, res, i) {
  const s = rp.s, p = lv.plan, f = R.FORM[s.form], to = p.level;
  const tmp = JSON.parse(JSON.stringify(s)); tmp.level = to; lv.prim.forEach(id => tmp.nodes.push(id));
  const secCands = A.eligibleNodes(Object.assign({}, tmp, { nodes: tmp.nodes.concat(lv.sec) }), to, ["secondary", "tertiary"]);
  const chosen = lv.sec.map(id => ({ id, name: R.NODE[id].name, tree: R.NODE_TREE[id], role: R.roleOf(f, R.NODE_TREE[id]), tier: R.NODE[id].tier, text: R.NODE[id].text }));
  const newRoots = lv.prim.concat(lv.sec).filter(id => R.NODE[id] && R.NODE[id].root && !s.trees[R.NODE_TREE[id]]);
  const dNew = res.d, stageNew = dNew.look ? dNew.look.name : "";
  const parts = A.surgeParts(tmp), maxT = p.maxTwists;
  const surgeEd = (x, j, kind) => { const sh = R.SHAPE[x.shape]; const opt = (arr, cur) => arr.map(y => `<option value="${y.id}" ${y.id === cur ? "selected" : ""}>${esc(y.name)}</option>`).join("");
    return `<div class="card" style="margin:4px 0"><div class="row"><input aria-label="New ${kind} name" data-lv="${kind}name" data-j="${j}" value="${esc(x.name)}" style="flex:1 1 150px;width:auto"><select aria-label="Shape" data-lv="${kind}shape" data-j="${j}">${opt(parts.shapes, x.shape)}</select><select aria-label="Effect" data-lv="${kind}effect" data-j="${j}">${opt(parts.effects.filter(e => (e.kind === "infuse") === (sh && sh.kind === "infuse")), x.effect)}</select></div>
    <div class="row small">${D.twists.filter(t => R.twistFits(t, sh)).map(t => `<label class="inl"><input type="checkbox" data-lv="${kind}tw" data-j="${j}" data-t="${t.id}" ${x.twists.includes(t.id) ? "checked" : ""} ${!x.twists.includes(t.id) && x.twists.length >= (kind === "sig" ? 1 : maxT) ? "disabled" : ""}>${esc(t.name)}</label>`).join("")}</div></div>`; };
  return `<div class="card"><b>${esc(s.name)}</b> <span class="small">${esc(f.name)} · level ${s.level} → ${to}${p.rankUp ? ` · <b>Rank ${R.lvl(to).rank}</b>` : ""}${p.dieTo !== p.dieFrom ? ` · Sequence d${p.dieFrom} → d${p.dieTo}` : ""}${p.primeTo !== p.primeFrom ? ` · Prime ${p.primeFrom} → ${p.primeTo}` : ""}</span>
  ${p.evolve ? `<div class="card on" style="margin:6px 0"><b>✶ EVOLUTION: ${esc(stageNew)}</b><p class="small">${esc(R.NODE[p.evoNode] ? R.NODE[p.evoNode].name + ": " + R.NODE[p.evoNode].text : "")}</p><p class="small">You Emerge at the start of your first turn next fight: temporary HP, enemies Shaken, and your new Signature is Amped on its first use.</p></div>` : ""}
  ${p.final ? `<div class="card on" style="margin:6px 0"><b>★ FINAL FORM unlocked: ${esc(f.stages[3].name)}</b><p class="small">${esc(D.finalForm || "")} Use it from the Ready screen before a fight (once per Lockdown).</p></div>` : ""}
  ${p.prim ? `<h3>Primary node (automatic)</h3>${lv.prim.map(id => `<div class="choice on">${esc(R.NODE[id].name)} <span class="tag">${esc(R.TREE[R.NODE_TREE[id]].name)}</span><small>${esc(R.NODE[id].text)}</small></div>`).join("") || `<p class="hint">No primary node is available.</p>`}` : ""}
  ${p.secTert ? `<h3>Secondary / tertiary: pick ${p.secTert} (${lv.sec.length} chosen)</h3><div role="group" aria-label="Secondary and tertiary nodes">${chosen.concat(secCands).map(n => `<button class="choice ${lv.sec.includes(n.id) ? "on" : ""}" aria-pressed="${lv.sec.includes(n.id)}" data-act="lvNode" data-n="${n.id}">${esc(n.name)} <span class="tag">${esc(R.TREE[n.tree].name)} · ${n.role} · ${R.TIER_NAME ? esc(R.TIER_NAME[n.tier] || "") : ""}</span><small>${esc(n.text)}</small></button>`).join("")}</div>` : ""}
  ${newRoots.length ? `<h3>Material for new trees</h3>${newRoots.map(id => { const t = R.NODE_TREE[id]; return `<label class="inl">${esc(R.TREE[t].name)} <select data-lv="mat" data-t="${t}"><option value="bio" ${lv.materials[t] !== "chrome" ? "selected" : ""}>Bio</option><option value="chrome" ${lv.materials[t] === "chrome" ? "selected" : ""}>Chrome</option></select></label>`; }).join(" ")}` : ""}
  ${lv.surges.length ? `<h3>New Surge${lv.surges.length > 1 ? "s" : ""}</h3>${lv.surges.map((x, j) => surgeEd(x, j, "s")).join("")}` : ""}
  ${lv.sigs.length ? `<h3>New Signature</h3>${lv.sigs.map((x, j) => surgeEd(x, j, "sig")).join("")}` : ""}
  ${lv.knacks.length ? `<h3>New Knack${lv.knacks.length > 1 ? "s" : ""}</h3>${lv.knacks.map((k, j) => `<input list="knackList" aria-label="New Knack ${j + 1}" data-lv="knack" data-j="${j}" value="${esc(k)}">`).join("")}<datalist id="knackList">${D.knackExamples.map(k => `<option value="${esc(k)}">`).join("")}</datalist>` : ""}
  <h3>After the level-up</h3><div class="nums"><div><span>HP</span>${dNew.hp}</div><div><span>Armor</span>${dNew.armor}</div><div><span>Flux Limit</span>${dNew.limit}</div><div><span>Prime</span>${dNew.prime}×d${dNew.die}</div></div>
  ${res.ok ? `<p class="small" style="color:var(--acid)">✓ Legal at level ${to}.</p>` : `<ul class="errs">${res.errors.map(e => `<li>${esc(e)}</li>`).join("")}</ul>`}
  <button data-act="lvAuto" data-i="${i}">Suggest picks</button></div>`;
}
function lvField(el) {
  const lv = ui.lv[ui.lvTab]; const k = el.dataset.lv, j = +el.dataset.j, v = el.type === "checkbox" ? el.checked : el.value;
  const arr = k.startsWith("sig") ? lv.sigs : lv.surges, x = arr[j];
  if (k === "knack") { lv.knacks[j] = v; return; }
  if (k === "mat") { lv.materials[el.dataset.t] = v; render(); return; }
  if (/name$/.test(k)) { x.name = v; return; }
  if (/shape$/.test(k)) { x.shape = v; const sh = R.SHAPE[v]; const tmp = JSON.parse(JSON.stringify(ui.run.pcs[ui.lvTab].s)); lv.prim.concat(lv.sec).forEach(id => tmp.nodes.push(id)); const ef = A.surgeParts(tmp).effects.filter(e => (e.kind === "infuse") === (sh.kind === "infuse")); if (!ef.some(e => e.id === x.effect)) x.effect = ef[0].id; x.twists = x.twists.filter(t => R.twistFits(R.TWIST[t], sh)); }
  if (/effect$/.test(k)) x.effect = v;
  if (/tw$/.test(k)) { const t = el.dataset.t; x.twists = v ? x.twists.concat(t) : x.twists.filter(y => y !== t); }
  render();
}

/* ------------------------------------------------------------------ defeat / end */
function viewDefeat() {
  const run = ui.run;
  return `<section class="panel"><p class="big">DEFEAT</p><p>The ${stepName(run.step === "defeat" ? (run.snapshot ? run.snapshot.step : "") : run.step)} at level ${run.level} went badly. Retry it from the moment before it started (HP, Flux, kit and Juice as they were), or call it a run.</p>
  <div class="row"><button class="pri" data-act="retry" data-focus>Retry the fight</button><button class="danger" data-act="giveUp">Give up the run</button></div></section>`;
}
function viewEnd() {
  const run = ui.run, won = run.step === "victory", s = run.stats, mins = Math.round(((s.endedAt || Date.now()) - s.startedAt) / 60000);
  return `<section class="panel"><p class="big">${won ? "★ GAUNTLET CLEARED ★" : "GAME OVER"}</p><p>${won ? `Patient Zero is down. ${esc(run.partyName)} walks out of the gauntlet at level 10.` : `${esc(run.partyName)} fell at level ${run.level}${run.abandoned ? " (run abandoned)" : ""}.`} ${A.DIFFS[run.difficulty].name}${run.hardcore ? " · Permadeath" : ""}.</p>
  <table class="t"><tr><th>Fights won</th><th>Retries</th><th>Rounds</th><th>Enemies downed</th><th>Times Down</th><th>Deaths</th><th>Overloads</th><th>Time</th></tr><tr><td>${s.wins}/${s.fights}</td><td>${s.retries}</td><td>${s.rounds}</td><td>${s.kills}</td><td>${s.downs}</td><td>${s.deaths}</td><td>${s.overloads}</td><td>${mins} min</td></tr></table>
  <h3>The freelancers</h3><table class="t"><tr><th>Name</th><th>Form</th><th>Level</th><th>Damage dealt</th><th>Taken</th><th>Healed</th><th>Kills</th><th>Crits</th><th>Surges</th><th>Downs</th><th>Deaths</th></tr>
  ${run.pcs.map(rp => { const d = R.derive(rp.s), x = rp.stats; return `<tr><td>${esc(rp.s.name)}${rp.dead ? " ✝" : ""}</td><td>${esc(d.look ? d.look.name : "")}</td><td>${rp.s.level}</td><td>${x.dmg}</td><td>${x.taken}</td><td>${x.heals}</td><td>${x.kills}</td><td>${x.crits}</td><td>${x.surges}</td><td>${x.downs}</td><td>${x.deaths}</td></tr>`; }).join("")}</table>
  <h3>Fight history</h3><table class="t"><tr><th>Level</th><th>Fight</th><th>Result</th><th>Rounds</th></tr>${run.history.map(h => `<tr><td>${h.level}</td><td>${esc(h.title)}</td><td>${h.won ? "won" : "lost"}</td><td>${h.rounds}</td></tr>`).join("")}</table>
  <div class="row"><button class="pri" data-act="again" data-focus>Run it again with the same party</button><button data-act="saveFinal">Save the level-${run.pcs[0].s.level} characters</button><button data-act="toTitle">Title</button></div></section>`;
}

/* ------------------------------------------------------------------ render + events */
function render(focus) {
  const v = ui.view; const ae = document.activeElement, fk = ae && ae.dataset ? ae.dataset.fkey : null;
  const ms = $("#mapScroll"), sx = ms ? ms.scrollLeft : 0, sy = ms ? ms.scrollTop : 0, lg = $("#log"), lgAtEnd = !lg || lg.scrollTop + lg.clientHeight >= lg.scrollHeight - 8;
  scr.innerHTML = v === "title" ? viewTitle() : v === "party" ? viewParty() : v === "map" ? viewMap() : v === "battle" ? viewBattle() : v === "levelup" ? viewLevelUp() : v === "defeat" ? viewDefeat() : v === "end" ? viewEnd() : "";
  const log = $("#log"); if (log && lgAtEnd) log.scrollTop = log.scrollHeight;
  const ms2 = $("#mapScroll"); if (ms2) { ms2.scrollLeft = sx; ms2.scrollTop = sy; }
  if (v === "battle" && ui.cur && ms2) { const cs = ui.zoom, x = ui.cur.x * cs, y = ui.cur.y * cs; if (x < ms2.scrollLeft || x + cs > ms2.scrollLeft + ms2.clientWidth) ms2.scrollLeft = x - ms2.clientWidth / 2; if (y < ms2.scrollTop || y + cs > ms2.scrollTop + ms2.clientHeight) ms2.scrollTop = y - ms2.clientHeight / 2; }
  const keepEl = fk && scr.querySelector(`[data-fkey="${fk}"]`);
  if (keepEl && !focus) { keepEl.focus({ preventScroll: true }); return; }
  if (focus) { const f = scr.querySelector("[data-focus]") || scr.querySelector(".dock .cmd:not([aria-disabled])") || scr.querySelector("h2"); if (f && f.focus) { if (!f.hasAttribute("tabindex") && f.tagName === "H2") f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); } }
}
function resume() {
  const run = A.Saves.run(); if (!run) return;
  ui.run = run; ui.difficulty = run.difficulty;
  if (run.inFight && run.fight) { const F = A.resumeFight(run); if (F) { ui.F = F; lastLogLen = F.logs.length; resetMenu(); autoSwitch(); ui.view = "battle"; render(true); toast(`Battle resumed: round ${F.round}, positions as you left them.`); return; } }
  if (run.inFight && run.snapshot) { const snap = run.snapshot; Object.keys(run).forEach(k => { if (!["snapshot", "history", "stats"].includes(k)) delete run[k]; }); Object.assign(run, JSON.parse(JSON.stringify(Object.assign({}, snap, { stats: run.stats, history: run.history })))); run.inFight = false; run.snapshot = snap; toast("The interrupted fight restarts from the beginning."); }
  go(run.step === "levelup" ? (initLevelUp(), "levelup") : run.step === "defeat" ? "defeat" : ["victory", "gameover"].includes(run.step) ? "end" : "map");
}
function startRun() {
  const n = partySize(); const chars = ui.party.slice(0, n).map(fitL1);
  ui.run = A.newRun({ difficulty: ui.difficulty, characters: chars, hardcore: ui.hardcore, partyName: ui.partyName || "The Freelancers" });
  saveRun(); go("map");
}
function loadIntoSlot(i, s) { if (!s) return; const x = fitL1(s); ui.party[i] = x; ui.edit = null; render(); toast(`${x.name} joins slot ${i + 1}${s.level > 1 ? " (fitted to level 1)" : ""}.`); }
scr.addEventListener("click", e => {
  if (ui.view === "battle" && ui.F) { const tk = e.target.closest("[data-tok]"), ce = e.target.closest(".cell");
    if (tk) { const x = ui.F.byId(tk.dataset.tok); if (x && x.pos) cellClick(x.pos.x, x.pos.y); return; }
    if (ce) { cellClick(+ce.dataset.x, +ce.dataset.y); return; } }
  const b = e.target.closest("[data-act]"); if (!b || b.tagName === "SELECT") return;
  const act = b.dataset.act, i = +b.dataset.i, F = ui.F, run = ui.run;
  switch (act) {
    case "diff": ui.difficulty = b.dataset.v; render(); scr.querySelector(`[data-v="${b.dataset.v}"]`).focus(); break;
    case "toParty": ui.hardcore = $("#hc").checked; go("party"); break;
    case "toTitle": go("title"); break;
    case "resume": resume(); break;
    case "abandonSaved": if (confirm("Abandon the saved run? It is recorded as a loss.")) { const r = A.Saves.run(); if (r) { A.abandonRun(r); A.Saves.addRecord(r); } A.Saves.clearRun(); render(true); } break;
    case "rand": loadIntoSlot(i, R.randomChar(1)); break;
    case "edit": ui.edit = ui.edit === i ? null : i; render(); { const x = scr.querySelector("[data-ed=name]"); if (x) x.focus(); } break;
    case "closeEdit": { const k = ui.edit; ui.edit = null; render(); const x = scr.querySelector(`[data-act=edit][data-i="${k}"]`); if (x) x.focus(); } break;
    case "reroll": { const s = ui.party[i]; s.nodes = []; R.growNodes(s, R.FORM[s.form]); const parts = A.surgeParts(s); s.surges = s.surges.map(x => parts.shapes.some(p => p.id === x.shape) && parts.effects.some(p => p.id === x.effect) ? x : A.autoSurge(s, s.level, false)); render(); break; }
    case "clear": ui.party[i] = null; if (ui.edit === i) ui.edit = null; render(); break;
    case "importChar": pickFile(o => { const cs = A.Saves.importAny(o); if (!cs.length) return toast("No character found in that file."); loadIntoSlot(i, cs[0]); }); break;
    case "saveChar": { const s = ui.party[i]; const name = prompt("Save as:", s.name); if (name) { A.Saves.saveChar(s, name); toast(`Saved "${name}" (also visible in the builder).`); render(); } break; }
    case "exportChar": download(slug(ui.party[i].name) + ".json", Object.assign({ app: "mutagen-builder", rules: D.version }, ui.party[i])); break;
    case "fillRandom": ensureSlots(); for (let j = 0; j < partySize(); j++) if (!ui.party[j]) ui.party[j] = R.randomChar(1); render(); break;
    case "delChar": ui.manage = !ui.manage; render(); break;
    case "delSaved": if (confirm(`Delete saved character "${b.dataset.k}"? This also removes it from the builder's list.`)) { A.Saves.deleteChar(b.dataset.k); render(); } break;
    case "saveParty": { const name = ($("#pname").value || "").trim() || "The Freelancers"; ui.partyName = name; const cs = ui.party.filter(Boolean); if (!cs.length) return toast("The party is empty."); A.Saves.saveParty(name, cs, { difficulty: ui.difficulty }); toast(`Party "${name}" saved (${cs.length} characters).`); render(); break; }
    case "delParty": { const k = $("#partySel").value || ui.partyName; if (!A.Saves.parties()[k]) return toast("Pick a saved party in the list first."); if (confirm(`Delete saved party "${k}"? The characters themselves stay saved.`)) { A.Saves.deleteParty(k); render(); } break; }
    case "exportParty": { const cs = ui.party.filter(Boolean); if (!cs.length) return toast("The party is empty."); download(slug(ui.partyName) + ".party.json", A.Saves.exportParty(ui.partyName, cs, { difficulty: ui.difficulty })); break; }
    case "importParty": pickFile(o => { const cs = A.Saves.importAny(o); if (!cs.length) return toast("No characters in that file."); ui.party = cs.map(fitL1); if (o.name) ui.partyName = String(o.name).slice(0, 40); ensureSlots(); render(); toast(`Imported ${cs.length} character(s).`); }); break;
    case "start": startRun(); break;
    case "fight": startFight(); break;
    case "saveQuit": saveRun(); toast("Run saved."); go("title"); break;
    case "abandon": if (confirm("Abandon this run? It is recorded as a loss.")) { A.abandonRun(run); A.Saves.addRecord(run); A.Saves.clearRun(); go("end"); } break;
    case "lockPrime": doAct(() => F.resolvePrime(), { noSwitch: true }); break;
    case "final": doAct(() => F.finalForm(F.pc(b.dataset.id)), { noSwitch: true }); break;
    case "fw": { const c = F.pc(b.dataset.id); const p = +scr.querySelector(`[data-fw=p][data-id="${c.id}"]`).value, k = scr.querySelector(`[data-fw=s][data-id="${c.id}"]`).value; doAct(() => F.firmware(c, p, k), { noSwitch: true }); break; }
    case "begin": doAct(() => F.begin()); break;
    case "turn": doAct(() => { F.beginTurn(F.pc(b.dataset.id)); resetMenu(); }, { noSwitch: true }); break;
    case "root": { if (b.getAttribute("aria-disabled") === "true") { toast(b.querySelector("small") ? b.querySelector("small").textContent : "Not available."); break; } const g = b.dataset.g, c = actor();
      if (g === "wait") { doAct(() => { F.waitTurn(c); }); break; }
      if (g === "end") { doAct(() => F.perform(c, "end")); break; }
      if (g === "move") { chooseOpt("move"); break; }
      if (g === "churn") { chooseOpt("churn"); break; }
      const L = F.options(c).filter(x => groupOf(x) === g); if (L.length === 1 && g !== "surge" && g !== "attack" && g !== "other" && g !== "items") { chooseOpt(L[0].id); break; }
      ui.menu = { lv: "list", grp: g }; render(true); break; }
    case "opt": if (b.getAttribute("aria-disabled") === "true") { toast(b.dataset.why ? `Can't: ${b.dataset.why}.` : "Not available."); break; } chooseOpt(b.dataset.o); break;
    case "target": if (b.getAttribute("aria-disabled") === "true") { toast(`Can't target that: ${b.dataset.why}.`); break; } pickTarget(b.dataset.t); break;
    case "back": back(); break;
    case "moveHere": if (ui.cur) moveTo(ui.cur.x, ui.cur.y); break;
    case "confirmAim": confirmAim(); break;
    case "bestAim": { const c = actor(), o = F.options(c).find(x => x.id === ui.menu.opt); const bst = o && F.autoAim(c, o); if (bst) { ui.cur = { x: bst.aim.x, y: bst.aim.y }; if (bst.mode) ui.aimMode = bst.mode; } else toast("Nothing in reach of that template."); render(); break; }
    case "aimMode": ui.aimMode = ui.aimMode === "cone" ? "line" : "cone"; render(); break;
    case "zoom": ui.zoom = Math.max(26, Math.min(80, ui.zoom + 8 * +b.dataset.v)); keep("zoom", ui.zoom); render(); break;
    case "skipAnim": if (ui.anim) ui.anim.skip = true; break;
    case "skipHaste": doAct(() => { F.haste = null; }); break;
    case "autoTurn": autoThisTurn(); break;
    case "autoRound": autoRest(false); break;
    case "autoAll": autoRest(true); break;
    case "endPhase": if (confirm("End the Player Phase? Freelancers who haven't acted lose their turn.")) doAct(() => { F.pcs.forEach(c => c.turnDone = true); F.endPlayerPhase(); }); break;
    case "afterFight": afterFight(); break;
    case "lvTab": ui.lvTab = i; render(); scr.querySelector(`[role=tab][data-i="${i}"]`).focus(); break;
    case "lvNode": { const lv = ui.lv[ui.lvTab], id = b.dataset.n; if (lv.sec.includes(id)) lv.sec = lv.sec.filter(x => x !== id); else { if (lv.sec.length >= lv.plan.secTert) lv.sec.shift(); lv.sec.push(id); } render(); const x = scr.querySelector(`[data-n="${id}"]`); if (x) x.focus(); break; }
    case "lvAuto": { const s = run.pcs[i].s, plan = A.levelPlan(s, s.level + 1), auto = A.autoLevelChoices(s); ui.lv[i] = { plan, prim: auto.nodes.slice(0, plan.prim), sec: auto.nodes.slice(plan.prim), surges: auto.surges, sigs: auto.sigs, knacks: auto.knacks, materials: {} }; render(); break; }
    case "lvAutoAll": initLevelUp(); render(); break;
    case "lvConfirm": { const r = A.completeLevelUp(run, ui.lv.map(lv => lv ? lvChoices(lv) : null)); if (!r.ok) return toast(r.errors.join(" ")); ui.lv = null; saveRun(); toast(`Level ${run.level}! Lockdown: everyone is back to full.`); go("map"); break; }
    case "retry": A.retryFight(run); saveRun(); startFight(); break;
    case "giveUp": A.abandonRun(run); A.Saves.addRecord(run); saveRun(); go("end"); break;
    case "again": { ui.party = run.pcs.map(rp => rp.s); ui.difficulty = run.difficulty; ui.hardcore = run.hardcore; ui.partyName = run.partyName; A.Saves.clearRun(); ui.party = ui.party.map(fitL1); startRun(); break; }
    case "saveFinal": run.pcs.forEach(rp => A.Saves.saveChar(rp.s, `${rp.s.name} (L${rp.s.level} gauntlet)`)); toast("Saved to the shared character list."); break;
  }
});
const act2 = fn => doAct(fn, { noSwitch: true });
scr.addEventListener("toggle", e => { if (e.target.classList && e.target.classList.contains("logbox")) { ui.logOpen = e.target.open; keep("logOpen", ui.logOpen); const l = $("#log"); if (l) l.scrollTop = l.scrollHeight; } }, true);
// hovering a token shows it in the enemy HUD; hovering squares moves the aim / move preview
let hoverT = 0;
scr.addEventListener("mouseover", e => {
  if (ui.view !== "battle" || !ui.F || ui.anim) return; const tk = e.target.closest("[data-tok]");
  if (tk && ui.F.foe(tk.dataset.tok) && ui.hover !== tk.dataset.tok) { ui.hover = tk.dataset.tok; const h = $("#foeHud"); if (h) h.innerHTML = foeHUD(ui.F, foeFocus()); }
  const ce = e.target.closest(".cell") || (tk && ui.F.byId(tk.dataset.tok) && { dataset: { x: ui.F.byId(tk.dataset.tok).pos.x, y: ui.F.byId(tk.dataset.tok).pos.y } });
  if (ce && (ui.menu.lv === "aim" || ui.menu.lv === "move") && (!ui.cur || ui.cur.x !== +ce.dataset.x || ui.cur.y !== +ce.dataset.y)) { const now = Date.now(); if (now - hoverT < 40) return; hoverT = now; ui.cur = { x: +ce.dataset.x, y: +ce.dataset.y }; render(); }
});
scr.addEventListener("mouseleave", () => { ui.hover = null; }, true);
scr.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.ed) return editField(el);
  if (el.dataset.lv) return lvField(el);
  const act = el.dataset.act, i = +el.dataset.i;
  if (act === "pregen" && el.value) loadIntoSlot(i, R.fromExample(el.value));
  else if (act === "loadChar" && el.value) loadIntoSlot(i, A.Saves.chars()[el.value]);
  else if (act === "setDie" && el.value) { const F = ui.F; act2(() => F.setPrimeDie(F.pc(el.dataset.id), +el.dataset.j, +el.value)); }
  else if (el.id === "careful") { ui.careful = el.checked; render(); }
  else if (el.id === "animSpeed") { ui.speed = el.value; keep("speed", ui.speed); }
  else if (el.id === "autoSwitch") { ui.autoSwitch = el.checked; keep("autoSwitch", ui.autoSwitch); if (ui.autoSwitch && ui.F && !actor()) doAct(() => { }); }
  else if (el.id === "partySel" && el.value) { const p = A.Saves.parties()[el.value]; if (p) { ui.party = p.characters.map(fitL1); ui.partyName = p.name; ensureSlots(); ui.edit = null; render(); toast(`Loaded party "${p.name}".`); } }
  else if (el.id === "pname") ui.partyName = el.value;
  else if (el.id === "hc") ui.hardcore = el.checked;
});
scr.addEventListener("input", e => { const el = e.target; if (el.dataset.ed === "name" || el.dataset.ed === "sname" || el.dataset.ed === "sgname") editField(el); else if (el.dataset.lv && /name$|knack/.test(el.dataset.lv)) lvField(el); else if (el.id === "pname") ui.partyName = el.value; });
// keyboard: arrows move the map cursor (map focused) or walk the menu; Enter acts; Esc backs out; 1-9 pick a command
document.addEventListener("keydown", e => {
  if (ui.view !== "battle" || !ui.F || e.altKey || e.ctrlKey || e.metaKey) return; const tg = e.target.tagName; if (tg === "INPUT" || tg === "SELECT" || tg === "TEXTAREA") return;
  if (ui.anim) { if (e.key === " " || e.key === "Escape" || e.key === "Enter") { e.preventDefault(); ui.anim.skip = true; } return; }
  const onMap = e.target.id === "map", dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (e.key === "Escape") { if (ui.menu.lv !== "root") { e.preventDefault(); back(); } return; }
  if (onMap && dirs[e.key]) { e.preventDefault(); moveCursor(...dirs[e.key]); return; }
  if (onMap && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cursorEnter(); return; }
  if ((e.key === "t" || e.key === "T") && ui.menu.lv === "aim") { ui.aimMode = ui.aimMode === "cone" ? "line" : "cone"; render(); return; }
  if ((e.key === "c" || e.key === "C") && ui.menu.lv === "move") { ui.careful = !ui.careful; render(); return; }
  if (!onMap && (e.key === "ArrowDown" || e.key === "ArrowUp") && e.target.closest && e.target.closest(".dock")) {
    const bs = [...scr.querySelectorAll(".dock .cmds .cmd, .dock .row button")]; const k = bs.indexOf(e.target); if (k >= 0) { e.preventDefault(); const nx = bs[(k + (e.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length]; nx.focus(); const t = nx.dataset.t && ui.F.byId(nx.dataset.t); if (t && t.pos) { ui.cur = { x: t.pos.x, y: t.pos.y }; if (t.side === "foe") ui.selFoe = t.id; const fk = nx.dataset.fkey; render(); const f = scr.querySelector(`[data-fkey="${fk}"]`); if (f) f.focus(); } } return; }
  if (/^[1-9]$/.test(e.key)) { const bs = scr.querySelectorAll(".dock .cmds .cmd"); const b = bs[+e.key - 1]; if (b) { e.preventDefault(); b.click(); } }
});
render(true);
})();
