"""Build ONE self-contained offline HTML file with the whole game: rules (every chapter, rendered from the
Markdown, with a table of contents and search), the Character Builder, the Arcade battle simulator and the
printable character sheet. All JS/CSS is inlined and the art is embedded (downscaled JPEG, base64).
No network needed; works from file://. Builder and Arcade share saves through localStorage, as on the site.

Run:   python3 tools/build_single.py            -> dist/Mutagen.html and ./Mutagen.html (published by Pages)
Needs: Python 3.8+. Pillow is optional (without it the art is embedded at full size).
"""
import base64, html, io, json, os, re, sys, datetime, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda *p: os.path.join(ROOT, *p)
read = lambda p: open(R(p), encoding='utf-8').read()
GH = 'https://github.com/xenodorian/BeelzRPG/blob/main/'
SITE = 'https://xenodorian.github.io/BeelzRPG/'

# The Rules tab is the compiled rulebook (tools/build_rulebook.py): same order, numbering, Parts and glossary.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_rulebook
UNITS = build_rulebook.units()
CHAPTERS = [u['file'][len('chapters/'):-3] for u in UNITS]
key_of = lambda ch: ch.replace('/', '-')

# ------------------------------------------------------------------ art
def art_data():
    out = {}
    try:
        from PIL import Image
    except ImportError:
        Image = None
    for f in sorted(os.listdir(R('art'))):
        if not f.lower().endswith(('.jpg', '.jpeg', '.png')): continue
        raw = open(R('art', f), 'rb').read()
        if Image:
            im = Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((900, 900), Image.LANCZOS)
            b = io.BytesIO(); im.save(b, 'JPEG', quality=70, optimize=True, progressive=True); data = b.getvalue()
            if len(data) < len(raw): raw = data
        out[f] = 'data:image/jpeg;base64,' + base64.b64encode(raw).decode()
    return out

# ------------------------------------------------------------------ markdown (the subset these chapters use)
def slug(h):
    h = re.sub(r'[*_`]', '', h.strip().lower())
    h = re.sub(r'[^\w\- ]', '', h, flags=re.UNICODE)
    return h.replace(' ', '-')

class Doc:
    def __init__(self, ch):
        self.ch = ch; self.key = key_of(ch); self.dir = os.path.dirname('chapters/' + ch + '.md'); self.seen = {}; self.heads = []

    def link(self, url):
        """Rewrite a Markdown link for the single page. Returns (href, external)."""
        if url.startswith(SITE + 'builder'): return '#builder', False
        if url.startswith(SITE + 'arcade'): return '#arcade', False
        if re.match(r'^[a-z]+:', url): return url, True
        path, _, frag = url.partition('#')
        if not path: return '#' + self.key + ('--' + frag if frag else ''), False
        tgt = os.path.normpath(os.path.join(self.dir, path)).replace('\\', '/')
        if tgt.startswith('chapters/') and tgt.endswith('.md'):
            k = key_of(tgt[len('chapters/'):-3])
            return '#' + k + ('--' + frag if frag else ''), False
        if tgt in ('chapters/03_Trees',): return '#03_Augment_Trees', False
        if tgt.startswith('builder'): return '#builder', False
        if tgt.startswith('arcade'): return '#arcade', False
        if tgt.startswith('sheets'): return '#sheet', False
        return GH + tgt + ('#' + frag if frag else ''), True

    def inline(self, t):
        keep = []
        def stash(s): keep.append(s); return '\x00%d\x00' % (len(keep) - 1)
        t = t.replace('\\*', stash('*')).replace('\\|', stash('|')).replace('\\_', stash('_'))
        t = re.sub(r'`([^`]+)`', lambda m: stash('<code>' + html.escape(m.group(1)) + '</code>'), t)
        def img(m):
            src = m.group(2); name = os.path.basename(src)
            return stash('<img data-art="%s" alt="%s">' % (html.escape(name), html.escape(m.group(1))))
        t = re.sub(r'!\[([^\]]*)\]\(([^)\s]+)\)', img, t)
        def lnk(m):
            href, ext = self.link(m.group(2))
            return stash('<a href="%s"%s>' % (html.escape(href), ' target="_blank" rel="noopener"' if ext else '')) + m.group(1) + stash('</a>')
        t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lnk, t)
        t = html.escape(t, quote=False)
        t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
        t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<![\s*])\*(?![\w*])', r'<i>\1</i>', t)
        t = re.sub(r'~~(.+?)~~', r'<del>\1</del>', t)
        for _ in range(3): t = re.sub('\x00(\\d+)\x00', lambda m: keep[int(m.group(1))], t)
        return t

    def heading(self, level, text):
        m = re.match(r'^(.*) \{#([^}]*)\}$', text)
        if m:   # compiled rulebook heading: numbered text, original anchor kept so old links still work
            text, s = m.group(1), m.group(2)
        else:
            s = slug(text); n = self.seen.get(s, 0); self.seen[s] = n + 1
            s = s if n == 0 else '%s-%d' % (s, n)
        hid = self.key + '--' + s
        plain = re.sub(r'<[^>]+>', '', self.inline(text))
        self.heads.append((level, hid, html.unescape(plain)))
        return '<h%d id="%s">%s<a class="hl" href="#%s" aria-label="Link to this section">#</a></h%d>' % (level, hid, self.inline(text), hid, level)

    def table(self, rows):
        def cells(r):
            r = r.strip()
            if r.startswith('|'): r = r[1:]
            if r.endswith('|'): r = r[:-1]
            return [c.strip() for c in r.split('|')]
        head = cells(rows[0]); body = [cells(r) for r in rows[2:]]
        h = '<div class="tw"><table><thead><tr>' + ''.join('<th>%s</th>' % self.inline(c) for c in head) + '</tr></thead><tbody>'
        for r in body: h += '<tr>' + ''.join('<td>%s</td>' % self.inline(c) for c in r) + '</tr>'
        return h + '</tbody></table></div>'

    def lists(self, lines):
        # lines: [(indent, ordered, text)] -> nested html
        out = []; i = 0
        def walk(i, ind):
            ordered = lines[i][1]; h = ['<ol>' if ordered else '<ul>']
            while i < len(lines) and lines[i][0] >= ind:
                if lines[i][0] > ind: sub, i = walk(i, lines[i][0]); h[-1] = h[-1][:-5] + sub + '</li>'; continue
                h.append('<li>' + self.inline(lines[i][2]) + '</li>'); i += 1
            h.append('</ol>' if ordered else '</ul>'); return ''.join(h), i
        while i < len(lines):
            s, i = walk(i, lines[i][0]); out.append(s)
        return ''.join(out)

    def render(self, md):
        L = md.split('\n'); out = []; i = 0; para = []
        def flush():
            if para:
                txt = '\n'.join(para)
                txt = self.inline(txt).replace('  \n', '<br>\n')
                if re.fullmatch(r'\s*<img [^>]+>\s*', txt): out.append('<figure>%s</figure>' % txt)
                else: out.append('<p>%s</p>' % txt)
                para.clear()
        while i < len(L):
            line = L[i]
            if not line.strip(): flush(); i += 1; continue
            m = re.match(r'^(#{1,6})\s+(.*?)\s*#*\s*$', line)
            if m: flush(); out.append(self.heading(len(m.group(1)), m.group(2))); i += 1; continue
            if re.match(r'^\s*\|', line) and i + 1 < len(L) and re.match(r'^\s*\|?\s*:?-{2,}', L[i + 1]):
                flush(); rows = []
                while i < len(L) and re.match(r'^\s*\|', L[i]): rows.append(L[i]); i += 1
                out.append(self.table(rows)); continue
            if re.match(r'^\s*(-{3,}|\*{3,})\s*$', line): flush(); out.append('<hr>'); i += 1; continue
            if line.startswith('>'):
                flush(); q = []
                while i < len(L) and L[i].startswith('>'): q.append(re.sub(r'^>\s?', '', L[i])); i += 1
                out.append('<blockquote>%s</blockquote>' % self.render('\n'.join(q))); continue
            m = re.match(r'^(\s*)([-*+]|\d+\.)\s+(.*)$', line)
            if m:
                flush(); items = []
                while i < len(L):
                    m = re.match(r'^(\s*)([-*+]|\d+\.)\s+(.*)$', L[i])
                    if m: items.append([len(m.group(1).replace('\t', '    ')), m.group(2)[-1] == '.', m.group(3)]); i += 1; continue
                    if L[i].strip() and L[i].startswith('  ') and items: items[-1][2] += ' ' + L[i].strip(); i += 1; continue
                    break
                out.append(self.lists(items)); continue
            para.append(line); i += 1
        flush()
        return '\n'.join(out)

# ------------------------------------------------------------------ apps
def inline_scripts(page, base):
    def rep(m):
        js = read(os.path.join(base, m.group(1)))
        return '<script>/* %s */\n%s\n</script>' % (m.group(1), js.replace('</script', '<\\/script'))
    return re.sub(r'<script src="([^"]+)"></script>', rep, page)

BRIDGE = '''<script>/* single-file bridge: art, links and share links come from the shell page */
(function () { var P = null; try { P = parent.MutagenShell; } catch (e) {} if (!P) return;
  var st = document.createElement("style"); st.textContent = "header > h1{display:none}"; document.head.appendChild(st); window.MUTAGEN_EMBEDDED = true;
  window.MUTAGEN_ART = P.art; window.MUTAGEN_SHARE_BASE = P.base(); window.MUTAGEN_HASH = P.takeHash();
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var r = P.route(a.getAttribute("href")); if (r) { e.preventDefault(); P.go(r); } else if (/^https?:/.test(a.getAttribute("href"))) a.target = "_blank"; }, true);
})();
</script>'''
def app_src(page):
    return page.replace('<head>', '<head>\n' + BRIDGE, 1)

# ------------------------------------------------------------------ shell
CSS = r'''
:root{--bg:#0d1110;--pan:#161c1a;--pan2:#1e2623;--ink:#dfe8e2;--dim:#8fa39a;--acid:#b6ff2e;--acid2:#4cc300;--chrome:#62d7ff;--splice:#ff5fd2;--line:#2c3833;--hh:52px}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--acid)}a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--acid);outline-offset:2px}
#top{position:fixed;top:0;left:0;right:0;height:var(--hh);z-index:20;display:flex;align-items:center;gap:10px;padding:0 12px;background:linear-gradient(90deg,#0d1110 0%,rgba(13,17,16,.94) 60%,rgba(13,17,16,.8)),var(--cover) center/cover;border-bottom:2px solid var(--acid2)}
#top h1{margin:0;font-size:20px;letter-spacing:.18em;color:var(--acid);text-shadow:0 0 8px rgba(182,255,46,.35);white-space:nowrap}
#top h1 small{display:block;font-size:10px;letter-spacing:.05em;color:var(--dim)}
#tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}#tabs::-webkit-scrollbar{display:none}
#tabs button{background:var(--pan2);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px 12px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}
#tabs button[aria-selected=true]{border-color:var(--acid);color:#061;background:var(--acid)}
#top .sp{flex:1}
.view{position:fixed;top:var(--hh);left:0;right:0;bottom:0;display:none}.view.on{display:block}
.view iframe{border:0;width:100%;height:100%;display:block;background:var(--bg)}
#rules.on{display:grid;grid-template-columns:290px minmax(0,1fr)}
#side{border-right:1px solid var(--line);background:var(--pan);overflow:auto;padding:10px}
#side input{width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--pan2);color:var(--ink);font:inherit}
#side nav a{display:block;padding:3px 6px;border-radius:5px;text-decoration:none;color:var(--ink);font-size:14px}
#side nav a:hover,#side nav a.cur{background:var(--pan2);color:var(--acid)}
#side nav .sub{margin:0 0 4px 12px;border-left:1px solid var(--line);display:none}#side nav .sub a{font-size:12.5px;color:var(--dim)}
#side nav .open .sub{display:block}
#side nav .grp{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--dim);margin:10px 6px 2px}
#res{margin:6px 0 10px}#res a{display:block;padding:5px 6px;border-radius:6px;text-decoration:none;color:var(--ink);border-bottom:1px solid var(--line)}
#res a b{color:var(--acid);font-weight:600}#res a span{display:block;font-size:12px;color:var(--dim)}#res mark{background:#4c6a12;color:#fff;border-radius:2px}
#res .none{color:var(--dim);font-size:13px;padding:4px}
#doc{overflow:auto;padding:0 28px 60px;scroll-padding-top:12px}
#doc .chap{max-width:900px;margin:0 auto;padding-top:14px;border-bottom:2px solid var(--line);padding-bottom:20px}
#doc h1{color:var(--acid);font-size:30px;margin:18px 0 10px}#doc h2{color:var(--acid);border-bottom:1px solid var(--line);padding-bottom:3px;margin-top:28px}
#doc h3{color:#d6ff8a}#doc h4{color:var(--chrome)}
#doc .hl{margin-left:8px;color:var(--line);text-decoration:none;font-size:.7em;opacity:0}#doc :is(h1,h2,h3,h4):hover .hl{opacity:1}
#doc img{max-width:100%;border-radius:10px;border:1px solid var(--line);display:block;margin:6px auto}
#doc figure{margin:8px 0}
#doc .tw{overflow-x:auto;margin:10px 0}
#doc table{border-collapse:collapse;font-size:14px;min-width:50%}
#doc th,#doc td{border:1px solid var(--line);padding:5px 8px;vertical-align:top;text-align:left}
#doc th{background:var(--pan2);color:var(--acid)}#doc tr:nth-child(even) td{background:rgba(255,255,255,.02)}
#doc blockquote{margin:10px 0;padding:8px 14px;border-left:4px solid var(--acid2);background:var(--pan);border-radius:0 8px 8px 0}
#doc code{background:var(--pan2);padding:1px 5px;border-radius:4px;font-size:.9em}
#doc hr{border:0;border-top:1px dashed var(--line);margin:22px 0}
#doc .flash{animation:fl 1.6s ease-out}@keyframes fl{0%{background:#4c6a12}100%{background:transparent}}
#doc .home{max-width:900px;margin:16px auto 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
#doc .home a{display:block;background:var(--pan);border:1px solid var(--line);border-radius:10px;padding:12px;text-decoration:none;color:var(--ink)}
#doc .home a b{color:var(--acid);font-size:17px;display:block}#doc .home a:hover{border-color:var(--acid)}
#doc .meta{max-width:900px;margin:8px auto;color:var(--dim);font-size:12.5px}
#tocBtn{display:none}
@media (max-width:820px){:root{--hh:96px}#top{flex-wrap:wrap;height:auto;min-height:var(--hh);padding:6px 10px;row-gap:4px}#top .sp{display:none}#tabs{order:3;width:100%}
 #rules.on{display:block}#side{position:absolute;inset:0 15% 0 0;z-index:5;display:none;box-shadow:4px 0 20px #000}#rules.toc #side{display:block}
 #tocBtn{display:inline-block;background:var(--pan2);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px 10px;font:inherit}
 #doc{height:100%;padding:0 12px 60px}#doc h1{font-size:24px}}
@media print{#top,#side{display:none}.view{position:static}#rules.on{display:block}#doc{overflow:visible}}
@media (prefers-reduced-motion:reduce){#doc .flash{animation:none}}
'''

JS = r'''
(function () {
"use strict";
const $ = s => document.querySelector(s);
const ART = {};
for (const k in ART_DATA) { try { const b64 = ART_DATA[k].split(",")[1], bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); ART[k] = URL.createObjectURL(new Blob([u], { type: "image/jpeg" })); } catch (e) { ART[k] = ART_DATA[k]; } }
document.documentElement.style.setProperty("--cover", `url(${ART["cover.jpg"]})`);
document.querySelectorAll("img[data-art]").forEach(i => { i.src = ART[i.dataset.art] || ""; });
const TABS = ["rules", "builder", "arcade", "sheet"];
const frames = {};
let pendingHash = "";
// called from inside the app frames (same origin: srcdoc)
window.MutagenShell = {
  art: ART,
  base: () => location.href.split("#")[0],
  takeHash: () => { const h = pendingHash; pendingHash = ""; return h; },
  route(href) {
    if (!href || href[0] === "#") return null;
    let m;
    if (/(^|\/)builder(\/|\/index\.html)?($|[?#])/.test(href) || href.startsWith(SITE + "builder")) return "#builder";
    if (/(^|\/)arcade(\/|\/index\.html)?($|[?#])/.test(href) || href.startsWith(SITE + "arcade")) return "#arcade";
    if (/sheets\//.test(href)) return "#sheet";
    if ((m = /chapters\/([\w\/]+)\.md(?:#([\w-]+))?/.exec(href))) return "#" + m[1].replace("/", "-") + (m[2] ? "--" + m[2] : "");
    if (/BeelzRPG#readme$/.test(href)) return "#rules";
    return null;
  },
  go(h) { if (location.hash === h) show(h); else location.hash = h; }
};
function frame(name) {
  if (frames[name]) return frames[name];
  const f = document.createElement("iframe"); f.title = { builder: "Character Builder", arcade: "Arcade: Gauntlet mode", sheet: "Character sheet" }[name];
  f.setAttribute("allow", "clipboard-write");
  f.srcdoc = APPS[name].replace(/\.\.\/art\/([\w.-]+)/g, (m, n) => ART[n] || m);
  $("#" + name).appendChild(f); frames[name] = f; return f;
}
function show(hash) {
  let tab = "rules", target = null;
  const h = (hash || "").slice(1);
  if (/^c=[\w-]+$/.test(h)) { tab = "builder"; if (frames.builder) { frames.builder.remove(); delete frames.builder; } pendingHash = "#" + h; }
  else if (TABS.includes(h)) tab = h;
  else if (h) target = document.getElementById(h);
  TABS.forEach(t => { const on = t === tab; $("#" + t).classList.toggle("on", on); const b = $(`#tabs [data-tab=${t}]`); b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  document.title = { rules: "Mutagen — Rules", builder: "Mutagen — Character Builder", arcade: "Mutagen — Arcade", sheet: "Mutagen — Character Sheet" }[tab];
  if (tab !== "rules") { frame(tab); return; }
  $("#rules").classList.remove("toc");
  if (target) { target.scrollIntoView({ block: "start" }); target.classList.remove("flash"); void target.offsetWidth; target.classList.add("flash"); markToc(target); }
  else if (h === "rules" || !h) $("#doc").scrollTop = 0;
}
// table of contents
const toc = $("#toc");
function markToc(el) {
  const chap = el.closest(".chap"); if (!chap) return;
  toc.querySelectorAll(".open").forEach(x => x.classList.remove("open")); toc.querySelectorAll("a.cur").forEach(x => x.classList.remove("cur"));
  const g = toc.querySelector(`[data-chap="${chap.id}"]`); if (g) { g.classList.add("open"); const a = g.querySelector(`a[href="#${el.id}"]`) || g.querySelector("a"); a.classList.add("cur"); }
}
let spyT = 0;
$("#doc").addEventListener("scroll", () => { clearTimeout(spyT); spyT = setTimeout(() => {
  const top = $("#doc").getBoundingClientRect().top + 40; let cur = null;
  for (const h of HEADS) { const r = h.getBoundingClientRect(); if (r.top <= top) cur = h; else break; }
  if (cur) markToc(cur);
}, 80); });
const HEADS = [...document.querySelectorAll("#doc h1[id], #doc h2[id]")];
// search
const tmp = document.createElement("textarea");
const idx = [...document.querySelectorAll("#doc .chap")].flatMap(ch => {
  const out = []; let cur = null; const title = ch.querySelector("h1") ? ch.querySelector("h1").textContent.replace(/#$/, "") : ch.id;
  for (const el of ch.children) {
    if (/^H[1-4]$/.test(el.tagName) && el.id) { cur = { id: el.id, head: el.textContent.replace(/#$/, ""), chap: title, text: "" }; out.push(cur); }
    else if (cur) { tmp.innerHTML = el.innerHTML.replace(/<[^>]+>/g, " "); cur.text += " " + tmp.textContent; }
  }
  return out;
});
const escH = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function search(q) {
  const res = $("#res"); q = q.trim();
  if (q.length < 2) { res.innerHTML = ""; return; }
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = [];
  for (const s of idx) {
    const H = s.head.toLowerCase(), T = s.text.toLowerCase(); let score = 0;
    if (!words.every(w => H.includes(w) || T.includes(w))) continue;
    for (const w of words) { if (H.includes(w)) score += 10; score += Math.min(5, T.split(w).length - 1); }
    hits.push([score, s]);
  }
  hits.sort((a, b) => b[0] - a[0]);
  const re = new RegExp("(" + words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");
  res.innerHTML = hits.length ? hits.slice(0, 40).map(([, s]) => { const T = s.text.replace(/\s+/g, " "), i = Math.max(0, T.toLowerCase().indexOf(words[0]) - 50);
    const snip = (i ? "…" : "") + T.slice(i, i + 140) + "…"; return `<a href="#${s.id}"><b>${escH(s.head).replace(re, "<mark>$1</mark>")}</b><span>${escH(s.chap)} · ${escH(snip).replace(re, "<mark>$1</mark>")}</span></a>`; }).join("")
    : `<div class="none">No matches for “${escH(q)}”.</div>`;
}
$("#q").addEventListener("input", e => search(e.target.value));
$("#q").addEventListener("keydown", e => { if (e.key === "Enter") { const a = $("#res a"); if (a) { location.hash = a.getAttribute("href"); } } if (e.key === "Escape") { e.target.value = ""; search(""); } });
$("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) MutagenShell.go("#" + b.dataset.tab); });
$("#tabs").addEventListener("keydown", e => { const i = TABS.indexOf(document.activeElement.dataset.tab); if (i < 0) return; let j = null;
  if (e.key === "ArrowRight") j = (i + 1) % TABS.length; if (e.key === "ArrowLeft") j = (i + TABS.length - 1) % TABS.length;
  if (j !== null) { e.preventDefault(); const b = $(`#tabs [data-tab=${TABS[j]}]`); b.focus(); b.click(); } });
$("#tocBtn").addEventListener("click", () => $("#rules").classList.toggle("toc"));
$("#side").addEventListener("click", e => { if (e.target.closest("a")) $("#rules").classList.remove("toc"); });
document.addEventListener("keydown", e => { if (e.key === "/" && $("#rules").classList.contains("on") && document.activeElement.tagName !== "INPUT") { e.preventDefault(); if (innerWidth <= 820) $("#rules").classList.add("toc"); $("#q").focus(); } });
window.addEventListener("hashchange", () => show(location.hash));
show(location.hash);
})();
'''

def build():
    art = art_data()
    docs = []; body = []; toc = []
    groups = {}
    for u in UNITS:
        if u['part'] not in groups.values(): groups[u['file'][len('chapters/'):-3]] = u['part']
    groups = {k: build_rulebook.PARTS[v][0] for k, v in groups.items()}
    for u in UNITS:
        ch = u['file'][len('chapters/'):-3]
        d = Doc(ch); h = d.render(u['md']); docs.append(d)
        first = d.heads[0] if d.heads else (1, d.key, ch)
        # the chapter's own id: the key itself points at its first heading's section
        body.append('<section class="chap" id="%s">%s</section>' % (d.key, h))
        if ch in groups: toc.append('<div class="grp">%s</div>' % groups[ch])
        subs = ''.join('<a href="#%s">%s</a>' % (hid, html.escape(t)) for lv, hid, t in d.heads if lv == 2)
        indent = ' style="padding-left:16px"' if ch.startswith('03_Trees/') else ''
        toc.append('<div data-chap="%s"><a href="#%s"%s>%s</a><div class="sub">%s</div></div>' % (d.key, d.key, indent, html.escape(first[2]), subs))
    rev = subprocess.run(['git', '-C', ROOT, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip() or 'local'
    home = '''<div class="home">
<a href="#00_Introduction"><b>📖 Read the rules</b>Start with the Introduction, or search with the box on the left (press /).</a>
<a href="#12_Quick_Reference"><b>⚡ Quick Reference</b>Everything on one page.</a>
<a href="#builder"><b>🧬 Character Builder</b>Click through creation and levelling; it checks legality and prints a sheet.</a>
<a href="#arcade"><b>⚔ Arcade</b>Run a party through ten levels of grid battles. Uses the builder's saved characters.</a>
<a href="#sheet"><b>📝 Character Sheet</b>Printable blank sheet.</a>
<a href="%srulebook/Mutagen_Rulebook.pdf" target="_blank" rel="noopener"><b>📕 Rulebook PDF</b>The same rules as a print-ready book (online).</a>
</div><p class="meta">Single-file edition built %s from commit %s. Works offline; saves stay in this browser (localStorage) and are shared by the Builder and the Arcade. Online: <a href="%s" target="_blank" rel="noopener">%s</a></p>''' % (SITE, datetime.date.today().isoformat(), rev, SITE, SITE)
    apps = {
        'builder': app_src(read('builder/index.html')),
        'arcade': app_src(inline_scripts(read('arcade/index.html'), 'arcade')),
        'sheet': app_src(read('sheets/Character_Sheet.html')),
    }
    def js_str(o): return json.dumps(o, ensure_ascii=False).replace('</', '<\\/').replace('<!--', '<\\!--')
    page = '''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mutagen — Rules, Builder & Arcade</title><link rel="icon" href="data:,">
<meta name="description" content="Mutagen tabletop RPG: full rules, character builder and arcade battle simulator in one offline file.">
<style>%s</style></head><body>
<header id="top"><h1>MUTAGEN<small>Rules · Builder · Arcade</small></h1>
<button id="tocBtn" aria-label="Contents and search">☰ Contents</button>
<span class="sp"></span>
<div id="tabs" role="tablist" aria-label="Sections">
<button role="tab" data-tab="rules" aria-controls="rules">📖 Rules</button><button role="tab" data-tab="builder" aria-controls="builder">🧬 Builder</button><button role="tab" data-tab="arcade" aria-controls="arcade">⚔ Arcade</button><button role="tab" data-tab="sheet" aria-controls="sheet">📝 Sheet</button>
</div></header>
<div id="rules" class="view" role="tabpanel" aria-label="Rules">
<aside id="side"><input id="q" type="search" placeholder="Search the rules  ( / )" aria-label="Search the rules" autocomplete="off"><div id="res" aria-live="polite"></div><nav id="toc" aria-label="Chapters">%s</nav></aside>
<main id="doc" tabindex="-1">%s%s</main></div>
<div id="builder" class="view" role="tabpanel" aria-label="Character Builder"></div>
<div id="arcade" class="view" role="tabpanel" aria-label="Arcade"></div>
<div id="sheet" class="view" role="tabpanel" aria-label="Character Sheet"></div>
<script>const ART_DATA = %s;
const APPS = %s;
const SITE = %s;</script>
<script>%s</script>
</body></html>''' % (CSS, ''.join(toc), home, '\n'.join(body), js_str(art), js_str(apps), json.dumps(SITE), JS)
    os.makedirs(R('dist'), exist_ok=True)
    for p in (R('dist', 'Mutagen.html'), R('Mutagen.html')):
        open(p, 'w', encoding='utf-8').write(page)
    print('wrote dist/Mutagen.html and Mutagen.html: %.2f MB (art %.2f MB, %d chapters, %d headings)' % (
        len(page.encode()) / 1e6, sum(len(v) for v in art.values()) / 1e6, len(docs), sum(len(d.heads) for d in docs)))

if __name__ == '__main__':
    build()
