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

/* ------------------------------------------------------------------ battle */
function startFight() {
  const run = ui.run; ui.F = A.startFight(run); run.inFight = true; saveRun();
  ui.pendingOpt = null; ui.view = "battle"; render(true);
}
const pct = (a, b) => Math.max(0, Math.min(100, 100 * a / Math.max(1, b)));
function condTags(cond, foe) { return Object.keys(cond).filter(k => cond[k] && A.COND_NAME[k] && k !== "shieldused").map(k => `<span class="tag ${foe ? "foe" : ["veiled", "linked", "shell", "braced", "helped", "spotted", "adrenal"].includes(k) ? "" : "bad"}">${A.COND_NAME[k]}</span>`).join(""); }
function pcCard(F, c) {
  const act = F.active === c || (F.haste && F.haste.to === c.id);
  return `<div class="card pcard ${act ? "act" : ""} ${c.down ? "down" : ""} ${c.dead ? "dim" : ""}" aria-label="${esc(c.name)}"><b>${esc(c.short)}</b> <span class="small">L${c.level} ${esc(c.stageName)}${c.ffActive ? " · ★ FINAL FORM" : ""}</span>
  ${c.dead ? `<div class="tag bad">DEAD</div>` : c.down ? `<div class="tag bad">DOWN · Death marks ${c.marks}/3</div>` : ""}
  <div class="bar ${c.hp < c.maxhp / 3 ? "low" : ""}" role="img" aria-label="HP ${c.hp} of ${c.maxhp}${c.tmp ? ", " + c.tmp + " temporary" : ""}"><i style="width:${pct(c.hp, c.maxhp)}%"></i>${c.tmp ? `<i class="tmp" style="left:${pct(c.hp, c.maxhp)}%;width:${pct(c.tmp, c.maxhp)}%"></i>` : ""}</div>
  <div class="small">HP <b>${c.hp}</b>/${c.maxhp}${c.tmp ? ` (+${c.tmp})` : ""} · Armor ${c.armor + (c.cond.shell ? 1 : 0)} · Juice ${"●".repeat(c.juice)}${"○".repeat(Math.max(0, 3 - c.juice))}</div>
  <div class="bar flux" role="img" aria-label="Flux ${c.flux} of ${c.limit}"><i style="width:${pct(c.flux, c.limit)}%"></i></div><div class="small">Flux <b>${c.flux}</b>/${c.limit} · Dodge ${sgn(c.def.dodge)} Endure ${sgn(c.def.endure)} Resist ${sgn(c.def.resist)}</div>
  <div>${condTags(c.cond)}</div>
  <div class="small">Primed: ${c.primed.map(p => `<span class="tag ${p.amped ? "amp" : ""}">${esc(p.sg.name)}${p.amped ? " ★" : ""}</span>`).join("") || "—"}${c.sigs.length ? ` · Sig: ${c.sigs.map(s => `<span class="tag ${c.sigUsed[s.key] ? "dim" : ""}">${esc(s.name)}</span>`).join("")}` : ""}</div>
  ${F.phase === "player" && !F.active && !F.haste && !c.turnDone && F.canAct(c) ? `<button class="pri" data-act="turn" data-id="${c.id}" style="margin-top:4px">Take ${esc(c.short)}'s turn</button>` : c.turnDone && F.phase === "player" ? `<div class="small">✓ acted</div>` : ""}</div>`;
}
function foeCard(F, e) {
  return `<div class="card ecard ${e.dead || e.fled ? "dead" : ""}"><b>${esc(e.name)}</b> <span class="tag foe">${esc(e.boss ? "BOSS" : e.role)}</span>${e.machine ? `<span class="tag dim">machine</span>` : ""}${e.dominated ? `<span class="tag">on your side</span>` : ""}${e.shifted ? `<span class="tag foe">Shifted</span>` : ""}
  ${e.dead ? `<div class="small">✝ down</div>` : e.fled ? `<div class="small">surrendered</div>` : `<div class="bar foe" role="img" aria-label="HP ${e.hp} of ${e.maxhp}"><i style="width:${pct(e.hp, e.maxhp)}%"></i></div>
  <div class="small">HP <b>${e.hp}</b>/${e.maxhp} · Guard ${F.guardOf(e)} · TN ${e.tn} · Armor ${e.armor}${e.actions > 1 ? ` · ${e.actions} actions` : ""}${e.interrupts ? ` · ${e.interrupts} Interrupt` : ""}</div>
  <div class="small">${e.attacks.map(a => `${esc(a.n)}${a.summon ? "" : ` (${a.dmg}${a.area ? ", Area" : ""}${a.rider ? ", " + esc(a.rider) : ""})`}${a.recharge && !e.charge[a.n] ? " ⟳" : ""}`).join(" · ")}</div>
  <div>${condTags(e.cond, true)}</div>`}</div>`;
}
function optButton(o, i) {
  const k = o.kind === "quick" ? "Quick" : o.kind === "free" ? "Free" : "Action";
  return `<button class="opt ${o.over ? "over" : ""}" data-act="opt" data-o="${esc(o.id)}" ${i < 9 ? `aria-keyshortcuts="${i + 1}"` : ""}><span>${i < 9 ? `<span class="k">[${i + 1}]</span> ` : ""}${esc(o.label)}${o.detail ? `<small>${esc(o.detail)}</small>` : ""}${o.over ? `<small style="color:var(--warn)">⚠ This pushes you past your Flux Limit: you will Overload.</small>` : ""}</span><span><span class="fx">${o.flux != null && o.flux !== undefined ? o.flux + " Flux" : ""}</span><br><span class="k">${k}</span></span></button>`;
}
function centerPanel(F) {
  const run = ui.run;
  if (F.phase === "won" || F.phase === "lost") {
    const won = F.phase === "won";
    return `<div class="card ${won ? "on" : "bad"}"><p class="big">${won ? "VICTORY" : "DEFEAT"}</p><p>${esc(F.title)} · ${F.stats.rounds} rounds · dealt ${F.stats.dealt}, took ${F.stats.taken}${F.stats.downs ? ` · ${F.stats.downs} Down` : ""}${F.stats.deaths ? ` · ${F.stats.deaths} dead` : ""}</p>
    <button class="pri" data-act="afterFight" data-focus>${won ? (F.kind === "minion" ? "Take a Breather →" : run.level >= 10 ? "Claim victory →" : "Level up →") : "Continue →"}</button></div>`;
  }
  if (F.phase === "prime") {
    return `<h3>Prime</h3><p class="small">Every freelancer rolls their Sequence die Prime times. Doubles make that Surge Amped (0 Flux). You may spend Juice to set a die to any face before locking in.</p>
    ${F.pcs.filter(c => c.primeDice && !c.dead).map(c => `<div class="card"><b>${esc(c.short)}</b> <span class="small">d${c.die} × ${c.prime} · Juice ${c.juice}</span><div class="dice">${c.primeDice.map((v, j) => { const sg = F.slotOf(c, v); return `<span class="die" title="${esc(sg ? sg.name : "Wild")}">${v}</span>${c.juice > 0 ? `<select aria-label="${esc(c.short)} die ${j + 1}: spend Juice to set" data-act="setDie" data-id="${c.id}" data-j="${j}"><option value="">Juice…</option>${Array.from({ length: c.die }, (_, x) => `<option value="${x + 1}">${x + 1}: ${esc((F.slotOf(c, x + 1) || { name: "Wild" }).name)}</option>`).join("")}</select>` : ""}`; }).join(" ")}</div>
    <div class="small">${c.primeDice.map(v => esc((F.slotOf(c, v) || { name: "Wild slot" }).name)).join(" · ")}</div></div>`).join("")}
    <div class="row"><button class="pri" data-act="lockPrime" data-focus>Lock in Prime →</button><button data-act="autoAll">Auto-battle</button></div>`;
  }
  if (F.phase === "setup") {
    return `<h3>Ready</h3><p class="small">Primed Surges are shown on each card.${F.pcs.some(c => F.canFinalForm(c)) ? " Level 10: a freelancer can enter Final Form now (once per Lockdown)." : ""}</p>
    ${F.pcs.filter(c => F.canFinalForm(c)).map(c => `<button data-act="final" data-id="${c.id}">★ ${esc(c.short)}: FINAL FORM</button>`).join(" ")}
    ${F.pcs.filter(c => F.firmwareOptions(c)).map(c => `<div class="row small"><span>${esc(c.short)}'s Firmware: swap</span><select data-fw="p" data-id="${c.id}">${c.primed.map((p, j) => `<option value="${j}">${esc(p.sg.name)}</option>`).join("")}</select><span>for</span><select data-fw="s" data-id="${c.id}">${F.firmwareOptions(c).map(s => `<option value="${s.key}">${esc(s.name)}</option>`).join("")}</select><button data-act="fw" data-id="${c.id}">Swap</button></div>`).join("")}
    <p class="small">${F.playersFirst ? "Initiative: the freelancers go first." : "Initiative: the enemies go first!"}</p><div class="row"><button class="pri" data-act="begin" data-focus>Begin the fight →</button><button data-act="autoAll">Auto-battle</button></div>`;
  }
  if (F.phase === "player") {
    const hc = F.haste ? F.pc(F.haste.to) : null; const c = hc || F.active;
    if (!c) return `<h3>Round ${F.round} · your move</h3><p class="small">Pick who acts next (any order). Down allies can be Patched or healed back up.</p>
      <div class="opts">${F.pending().map((x, i) => `<button class="opt" data-act="turn" data-id="${x.id}" ${i === 0 ? "data-focus" : ""}><span>${esc(x.short)} <small>HP ${x.hp}/${x.maxhp} · Flux ${x.flux}/${x.limit} · ${x.primed.length} Primed</small></span></button>`).join("")}</div>
      <div class="row" style="margin-top:8px"><button data-act="autoRound">Auto: rest of round</button><button data-act="autoAll">Auto-battle</button><button data-act="endPhase">End Player Phase</button></div>`;
    const opts = F.options(c);
    if (ui.pendingOpt) { const o = opts.find(x => x.id === ui.pendingOpt); if (o) return `<h3>${esc(c.short)}: ${esc(o.label)}</h3><p class="small">Choose a target.</p><div class="opts">${o.targets.map((id, i) => { const t = F.byId(id); return `<button class="opt" data-act="target" data-t="${id}" ${i === 0 ? "data-focus" : ""}><span>${i < 9 ? `<span class="k">[${i + 1}]</span> ` : ""}${esc(t.name)} <small>HP ${t.hp}/${t.maxhp}${t.side === "foe" ? ` · Guard ${F.guardOf(t)} · TN ${t.tn}` : ""}</small></span></button>`; }).join("")}</div><button data-act="cancelOpt" style="margin-top:6px">← Back (Esc)</button>`; ui.pendingOpt = null; }
    const groups = { action: [], quick: [], free: [] }; opts.forEach(o => groups[o.kind].push(o));
    let n = 0; const list = arr => arr.map(o => optButton(o, n++)).join("");
    return `<h3>${hc ? `${esc(c.short)} is Hasted` : `${esc(c.short)}'s turn`}</h3><p class="small">${hc ? "One immediate Action (not Unleash) with advantage." : `Action ${c.t.actions > 0 ? "ready" : "used"} · Quick ${c.t.quick > 0 && !c.cond.dazed ? "ready" : "used"}${c.t.churned ? " · Churned (no Unleash)" : ""} · Flux ${c.flux}/${c.limit}`}</p>
    <div class="opts">${groups.action.length ? `<div class="grp">Action</div>${list(groups.action)}` : ""}${groups.quick.length ? `<div class="grp">Quick action</div>${list(groups.quick)}` : ""}${groups.free.length ? `<div class="grp">Free</div>${list(groups.free)}` : ""}</div>
    ${hc ? `<button data-act="skipHaste" style="margin-top:6px">Skip the Haste action</button>` : `<div class="row" style="margin-top:8px"><button data-act="autoTurn">Auto this turn</button><button data-act="autoAll">Auto-battle</button></div>`}`;
  }
  return `<p>…</p>`;
}
function viewBattle() {
  const F = ui.F;
  return `<section class="panel"><h2>Level ${F.level} · ${esc(F.title)}</h2><p class="small">${F.phase === "player" ? `Round ${F.round} · Player Phase` : F.phase === "prime" ? "Prime" : F.phase === "setup" ? "Before the first round" : ""} · ${esc(ui.run.partyName)} · ${A.DIFFS[ui.run.difficulty].name}</p>
  <div class="battle"><div class="side"><h3>Freelancers</h3>${F.pcs.map(c => pcCard(F, c)).join("")}</div>
  <div class="center">${centerPanel(F)}<h3>Combat log</h3><div id="log" role="log" aria-label="Combat log" tabindex="0">${F.logs.slice(-400).map(l => `<div class="${esc(l.cls)}">${esc(l.t)}</div>`).join("")}</div></div>
  <div class="side"><h3>Enemies</h3>${F.foes.filter(e => !e.dominated || true).map(e => foeCard(F, e)).join("")}</div></div></section>`;
}
let lastLogLen = 0;
function announce() { const F = ui.F; if (!F) return; const fresh = F.logs.slice(lastLogLen).map(l => l.t); lastLogLen = F.logs.length; if (fresh.length) $("#live").textContent = fresh.slice(-4).join(" "); }
function doOpt(id, target) {
  const F = ui.F; const c = F.haste ? F.pc(F.haste.to) : F.active; if (!c) return;
  const o = F.options(c).find(x => x.id === id); if (!o) return;
  if ((o.target === "enemy" || o.target === "ally") && !target) { if (o.targets.length === 0) { toast("No valid target."); return; } if (o.targets.length > 1) { ui.pendingOpt = id; render(true); return; } target = o.targets[0]; }
  if (o.over && !confirm(`${o.label}: this pushes ${c.short} past their Flux Limit and they will Overload. Do it anyway?`)) return;
  ui.pendingOpt = null; const r = F.perform(c, id, target); if (!r.ok) toast(r.msg);
  afterAction();
}
function afterAction() { announce(); if (ui.F.phase === "won" || ui.F.phase === "lost") { ui.run.inFight = false; } render(true); }
function autoRest(all) {
  const F = ui.F; let g = 0;
  if (F.phase === "prime") { A.autoSetup(F); }
  if (F.phase === "setup") { A.autoSetup(F); F.begin(); }
  const round = F.round;
  while (F.phase === "player" && g++ < 500) {
    if (F.haste) { const a = F.pc(F.haste.to); const ch = A.aiChoose(F, a, F.options(a).filter(o => o.kind === "action")); if (!ch || ch.id === "end") F.haste = null; else F.perform(a, ch.id, ch.target); continue; }
    if (F.active) { const c = F.active; const ch = A.aiChoose(F, c, F.options(c)); const r = F.perform(c, ch.id, ch.target); if (!r.ok) F.perform(c, "end"); continue; }
    if (!all && F.round !== round) break;
    const c = F.pending()[0]; if (!c) { F.endPlayerPhase(); continue; }
    A.autoTurn(F, c);
    if (!all && F.round !== round) break;
    if (all && F.round > 60) { F.phase = "lost"; F.finish(false); break; }
  }
  afterAction();
}
function autoThisTurn() {
  const F = ui.F; let g = 0;
  while (g++ < 20 && F.phase === "player" && (F.haste || F.active)) {
    if (F.haste) { const a = F.pc(F.haste.to); const ch = A.aiChoose(F, a, F.options(a).filter(o => o.kind === "action")); if (!ch || ch.id === "end") F.haste = null; else F.perform(a, ch.id, ch.target); continue; }
    const c = F.active; const ch = A.aiChoose(F, c, F.options(c)); const r = F.perform(c, ch.id, ch.target); if (!r.ok) F.perform(c, "end");
  }
  afterAction();
}
function afterFight() {
  const run = ui.run, F = ui.F; const st = A.completeFight(run, F); run.inFight = false; ui.F = null; lastLogLen = 0;
  if (st === "levelup") { initLevelUp(); }
  if (st === "victory" || st === "gameover") A.Saves.addRecord(run);
  saveRun(); go(st === "levelup" ? "levelup" : st === "victory" || st === "gameover" ? "end" : st === "defeat" ? "defeat" : "map");
  if (st === "boss") toast("Breather: everyone recovers half their HP, Flux resets to 0.");
}

/* ------------------------------------------------------------------ level-up */
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
  const v = ui.view;
  scr.innerHTML = v === "title" ? viewTitle() : v === "party" ? viewParty() : v === "map" ? viewMap() : v === "battle" ? viewBattle() : v === "levelup" ? viewLevelUp() : v === "defeat" ? viewDefeat() : v === "end" ? viewEnd() : "";
  const log = $("#log"); if (log) log.scrollTop = log.scrollHeight;
  if (focus) { const f = scr.querySelector("[data-focus]") || scr.querySelector(".center .opt") || scr.querySelector("h2"); if (f && f.focus) { if (!f.hasAttribute("tabindex") && f.tagName === "H2") f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: v !== "battle" }); } }
}
function resume() {
  const run = A.Saves.run(); if (!run) return;
  ui.run = run; ui.difficulty = run.difficulty;
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
    case "lockPrime": F.resolvePrime(); afterAction(); break;
    case "final": F.finalForm(F.pc(b.dataset.id)); afterAction(); break;
    case "fw": { const c = F.pc(b.dataset.id); const p = +scr.querySelector(`[data-fw=p][data-id="${c.id}"]`).value, k = scr.querySelector(`[data-fw=s][data-id="${c.id}"]`).value; F.firmware(c, p, k); afterAction(); break; }
    case "begin": F.begin(); afterAction(); break;
    case "turn": F.beginTurn(F.pc(b.dataset.id)); afterAction(); break;
    case "opt": doOpt(b.dataset.o); break;
    case "target": { const id = ui.pendingOpt; ui.pendingOpt = null; doOpt(id, b.dataset.t); break; }
    case "cancelOpt": ui.pendingOpt = null; render(true); break;
    case "skipHaste": F.haste = null; afterAction(); break;
    case "autoTurn": autoThisTurn(); break;
    case "autoRound": autoRest(false); break;
    case "autoAll": autoRest(true); break;
    case "endPhase": if (confirm("End the Player Phase? Freelancers who haven't acted lose their turn.")) { F.pcs.forEach(c => c.turnDone = true); F.endPlayerPhase(); afterAction(); } break;
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
scr.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.ed) return editField(el);
  if (el.dataset.lv) return lvField(el);
  const act = el.dataset.act, i = +el.dataset.i;
  if (act === "pregen" && el.value) loadIntoSlot(i, R.fromExample(el.value));
  else if (act === "loadChar" && el.value) loadIntoSlot(i, A.Saves.chars()[el.value]);
  else if (act === "setDie" && el.value) { const F = ui.F; F.setPrimeDie(F.pc(el.dataset.id), +el.dataset.j, +el.value); afterAction(); }
  else if (el.id === "partySel" && el.value) { const p = A.Saves.parties()[el.value]; if (p) { ui.party = p.characters.map(fitL1); ui.partyName = p.name; ensureSlots(); ui.edit = null; render(); toast(`Loaded party "${p.name}".`); } }
  else if (el.id === "pname") ui.partyName = el.value;
  else if (el.id === "hc") ui.hardcore = el.checked;
});
scr.addEventListener("input", e => { const el = e.target; if (el.dataset.ed === "name" || el.dataset.ed === "sname" || el.dataset.ed === "sgname") editField(el); else if (el.dataset.lv && /name$|knack/.test(el.dataset.lv)) lvField(el); else if (el.id === "pname") ui.partyName = el.value; });
// keyboard: 1-9 pick an option/target in battle, Esc backs out of target selection
document.addEventListener("keydown", e => {
  if (ui.view !== "battle" || e.altKey || e.ctrlKey || e.metaKey) return; const tg = e.target.tagName; if (tg === "INPUT" || tg === "SELECT" || tg === "TEXTAREA") return;
  if (e.key === "Escape" && ui.pendingOpt) { ui.pendingOpt = null; render(true); return; }
  if (/^[1-9]$/.test(e.key)) { const bs = scr.querySelectorAll(".center .opts button"); const b = bs[+e.key - 1]; if (b) { e.preventDefault(); b.click(); } }
});
render(true);
})();
