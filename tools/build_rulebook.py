"""Compile the chapters into ONE numbered rulebook: rulebook/Mutagen_Rulebook.md.

The chapter files (chapters/*.md, chapters/03_Trees/*.md) stay the editable source: edit them, then re-run this.
The compiled book adds what a single document needs and the chapters don't:
  - Parts, a title page, "About this book" and a full table of contents
  - section numbers (6.4, 10.5.2 ...) on every heading; a chapter's own "1." style heading numbers are folded in
  - the six tree files inlined as sections of chapter 3
  - every internal link rewritten to the book's own anchors; links to the site/tools become absolute URLs
  - per-file navigation ("← Augment Trees"), chapter-only blocks (<!-- chapters-only --> ... <!-- /chapters-only -->)
    and repeated illustrations dropped
Coherence fixes belong in the chapters, never in the compiled file (it is overwritten).

Run:   python3 tools/build_rulebook.py           -> writes rulebook/Mutagen_Rulebook.md
       python3 tools/build_rulebook.py --check   -> exit 1 if the rulebook (or its PDF) is out of date with the chapters
PDF:   node tools/rulebook_pdf.js                -> rulebook/Mutagen_Rulebook.pdf (headless Chrome)
Used by tools/build_single.py (the Rules tab of the single-file edition renders units()).
"""
import os, re, sys, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda *p: os.path.join(ROOT, *p)
GH = 'https://github.com/xenodorian/BeelzRPG/blob/main/'
GH_TREE = 'https://github.com/xenodorian/BeelzRPG/tree/main/'
SITE = 'https://xenodorian.github.io/BeelzRPG/'
OUT = 'rulebook/Mutagen_Rulebook.md'
PDF_STAMP = 'rulebook/.pdf_source.sha256'
TREES = ['Hide', 'Limbs', 'Senses', 'Glands', 'Wiring', 'Mind']
PARTS = [
    ('Part One: Playing Mutagen', 'Everything a player needs: the core roll, building a freelancer, the Augment trees, Surges, Flux, combat, advancement and gear.',
     ['00_Introduction', '01_Core_Rules', '02_Character_Creation', '02A_Forms_and_Evolution', '03_Augment_Trees',
      '04_Surges', '05_Flux_and_Overload', '06_Combat', '07_Advancement', '08_Gear']),
    ('Part Two: Running Mutagen', 'For the Game Master: running missions, building fair fights from the threat tables, and a first mission to play tonight.',
     ['09_Running_the_Game', '10_Threats', '11_Starter_Mission']),
    ('Part Three: Guides and Reference', 'The one-page summary, a step-by-step building guide, how the web arcade differs from these rules, and the glossary.',
     ['12_Quick_Reference', '13_Character_Building_Guide', '14_Arcade_vs_Tabletop', '15_Glossary']),
]

def slug(h):
    h = re.sub(r'[*_`]', '', h.strip().lower())
    h = re.sub(r'[^\w\- ]', '', h, flags=re.UNICODE)
    return h.replace(' ', '-')

def read(p): return open(R(p), encoding='utf-8').read()

HEAD = re.compile(r'^(#{1,6})\s+(.*?)\s*$')
FENCE = re.compile(r'^\s*```')

def clean(md):
    md = re.sub(r'<!-- chapters-only -->.*?<!-- /chapters-only -->\n?', '', md, flags=re.S)
    md = re.sub(r'^\[← [^\]]*\]\([^)]*\)\s*\n\n?', '', md, flags=re.M)      # per-file navigation
    return md

def units():
    """The book as a list of units (one per source file), in reading order.
    Each unit: key, file, kind ('chapter'|'tree'), part, number, title, md.
    md keeps the source's links (relative to the chapter) and heading levels, but headings are numbered and carry
    their original slug as a trailing {#slug} marker so callers can keep old anchors working."""
    out = []; seen_img = set()
    for pi, (ptitle, pblurb, chs) in enumerate(PARTS):
        for ch in chs:
            files = [(ch, 'chapter')] + ([('03_Trees/' + t, 'tree') for t in TREES] if ch == '03_Augment_Trees' else [])
            for f, kind in files:
                md = clean(read('chapters/%s.md' % f)).rstrip() + '\n'
                if kind == 'chapter':
                    m = re.match(r'#\s+(\d+[A-Z]?)\.\s', md); num = m.group(1).lstrip('0') or '0'
                    if num.startswith('A'): num = '0' + num
                    sec = 0
                else:
                    sec = out[-1]['last_sec']
                lines = []; infence = False; seen = {}; c = [sec, 0, 0, 0]
                for line in md.split('\n'):
                    if FENCE.match(line): infence = not infence
                    img = re.match(r'^!\[[^\]]*\]\(([^)\s]+)\)\s*$', line)
                    if img and not infence:
                        if img.group(1) in seen_img: continue
                        seen_img.add(img.group(1))
                    h = HEAD.match(line) if not infence else None
                    if not h: lines.append(line); continue
                    lv, text = len(h.group(1)), h.group(2)
                    s0 = slug(text); n = seen.get(s0, 0); seen[s0] = n + 1
                    orig = s0 if n == 0 else '%s-%d' % (s0, n)
                    if kind == 'chapter':
                        if lv == 1: title = text; lines.append('# %s {#%s}' % (text, orig)); continue
                        depth = lv - 2
                    else:
                        depth = lv - 1        # tree title = a section of chapter 3
                        if lv == 1: title = text
                    if depth < 0 or depth > 3: lines.append(line); continue
                    c[depth] += 1
                    for k in range(depth + 1, 4): c[k] = 0
                    label = '.'.join([num] + [str(x) for x in c[:depth + 1]])
                    text = re.sub(r'^\d+\.\s+', '', text)
                    lines.append('%s %s %s {#%s}' % (h.group(1), label, text, orig))
                out.append(dict(key=f.replace('/', '-'), file='chapters/%s.md' % f, kind=kind, part=pi, number=num,
                                title=title, md='\n'.join(lines), last_sec=c[0]))
    return out

def front(book_sha):
    return '\n'.join([
        '# Mutagen',
        '',
        '![Mutagen](../art/cover.jpg)',
        '',
        '**The Rulebook.** *A tabletop roleplaying game about freelancers who rebuild their own bodies to survive a city that is rebuilding itself.*',
        '',
        '## About This Book',
        '',
        'This is the complete game in one document: every rule, the six Augment trees, the threat builder and roster, the starter mission, the Quick Reference, the building guide and a glossary. Chapters keep the numbers used everywhere else (the [Character Builder](%sbuilder/), the [arcade](%sarcade/), the design notes), and every heading is numbered so you can cite a rule as, say, *§6.4* (positioning) or *§10.5* (building an encounter).' % (SITE, SITE),
        '',
        '- **New player?** Read chapters 0, 1, 2A and 12, take a pregenerated freelancer from chapter 11, and play.',
        '- **Making a character?** Chapter 2, then chapter 13 walks you through every box, or use the [Character Builder](%sbuilder/).' % SITE,
        '- **Running the game?** Part Two. Fights are built from the budget in §10.5; the starter mission is chapter 11.',
        '- **Theatre of the mind or a grid?** Both are full rules ([§6.4](#64-positioning-theatre-of-the-mind-or-grid)). The web arcade plays the grid; [chapter 14](#14-appendix-arcade-vs-tabletop) lists the few places it differs from this book.',
        '',
        '*This book is compiled from the chapter files in [the repository](%s) by `tools/build_rulebook.py`; the chapters are the source, and a test keeps the two in step. Print edition: [Mutagen_Rulebook.pdf](Mutagen_Rulebook.pdf).*' % GH_TREE.replace('/tree/main/', ''),
        ''])

def book():
    us = units()
    # 1) assign rulebook slugs to every heading, remember (file, orig) -> new
    amap = {}; used = {}; heads = []   # heads: (level_in_book, text, slug)
    def uniq(s):
        n = used.get(s, 0); used[s] = n + 1
        return s if n == 0 else '%s-%d' % (s, n)
    for s in ('mutagen', 'about-this-book', 'contents'): uniq(s)
    parts_seen = set()
    for u in us:
        if u['part'] not in parts_seen:
            parts_seen.add(u['part']); t = PARTS[u['part']][0]; u['part_slug'] = uniq(slug(t))
        u['heads'] = []
        for line in u['md'].split('\n'):
            m = re.match(r'^(#{1,6}) (.*) \{#([^}]*)\}$', line)
            if not m: continue
            lv = len(m.group(1)) + (1 if u['kind'] == 'chapter' else 2)   # book: part=#, chapter=##, section=###
            s = uniq(slug(m.group(2)))
            amap[(u['file'], m.group(3))] = s
            u['heads'].append((lv, m.group(2), s))
        amap[(u['file'], '')] = u['heads'][0][2]
    amap[('chapters/03_Trees', '')] = amap[('chapters/03_Augment_Trees.md', '')]

    def relink(u, md):
        d = os.path.dirname(u['file'])
        def rep(m):
            text, url = m.group(1), m.group(2)
            if re.match(r'^[a-z]+:', url): return m.group(0)
            path, _, frag = url.partition('#')
            tgt = os.path.normpath(os.path.join(d, path)).replace('\\', '/') if path else u['file']
            if text.startswith('!'): return m.group(0)   # images: ../art/ resolves from rulebook/ too
            if (tgt, frag) in amap: return '%s](#%s)' % (text, amap[(tgt, frag)])
            if tgt.startswith('chapters/'): raise SystemExit('unresolved link in %s: %s' % (u['file'], url))
            if tgt.endswith('.html') or tgt in ('builder', 'arcade') or tgt.startswith(('builder/', 'arcade/')):
                return '%s](%s%s%s)' % (text, SITE, tgt + ('/' if '.' not in os.path.basename(tgt) else ''), '#' + frag if frag else '')
            if os.path.isdir(R(tgt)): return '%s](%s%s)' % (text, GH_TREE, tgt)
            return '%s](%s%s%s)' % (text, GH, tgt, '#' + frag if frag else '')
        # images first (keep), then links
        return re.sub(r'(!?\[[^\]]*)\]\(([^)\s]+)\)', rep, md)

    body = []; toc = []
    cur_part = None
    for u in us:
        if u['part'] != cur_part:
            cur_part = u['part']; t, blurb, _ = PARTS[cur_part]
            body += ['', '---', '', '# %s' % t, '', '*%s*' % blurb, '']
            toc.append('- **[%s](#%s)**' % (t, u['part_slug']))
        md = relink(u, u['md'])
        hi = 0
        for line in md.split('\n'):
            m = re.match(r'^(#{1,6}) (.*) \{#([^}]*)\}$', line)
            if m:
                lv, text, s = u['heads'][hi]; hi += 1
                body.append('#' * min(lv, 6) + ' ' + text)
                if lv <= 4 and not (u['kind'] == 'tree' and lv == 4):
                    toc.append('  ' * (lv - 1) + '- [%s](#%s)' % (re.sub(r'[*_]', '', text), s))
            else:
                body.append(line)
        body.append('')
    text = front('') + '\n## Contents\n\n' + '\n'.join(toc) + '\n' + '\n'.join(body)
    text = re.sub(r'\n{3,}', '\n\n', text).strip() + '\n'
    hdr = '<!-- GENERATED by tools/build_rulebook.py from chapters/*.md. Do not edit: edit the chapters and re-run. -->\n'
    return hdr + text

PRINT_CSS = """
@page { size: Letter; margin: 0.7in 0.65in 0.75in 0.65in; }
@page :first { margin: 0; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font: 10.2pt/1.42 "Georgia", "DejaVu Serif", serif; color: #1b1d1a; margin: 0; }
a { color: #1f6b4f; text-decoration: none; }
h1, h2, h3, h4, h5 { font-family: "Helvetica Neue", "DejaVu Sans", Arial, sans-serif; color: #12251c; line-height: 1.2; break-after: avoid; }
h1 { font-size: 30pt; } h2 { font-size: 21pt; } h3 { font-size: 14pt; margin: 1.1em 0 .35em; border-bottom: 1.5px solid #8fcf3c; padding-bottom: 2px; }
h4 { font-size: 11.5pt; margin: 1em 0 .3em; color: #2b5d43; } h5 { font-size: 10.5pt; margin: .8em 0 .2em; }
.hl { display: none; }
p { margin: .35em 0 .55em; orphans: 3; widows: 3; }
ul, ol { margin: .3em 0 .6em; padding-left: 1.4em; } li { margin: .12em 0; }
table { border-collapse: collapse; width: 100%; margin: .5em 0 .8em; font: 8.6pt/1.3 "Helvetica Neue", "DejaVu Sans", Arial, sans-serif; break-inside: auto; }
thead { display: table-header-group; } tr { break-inside: avoid; }
th { background: #12251c; color: #e9f7d6; text-align: left; padding: 3px 5px; font-weight: 600; }
td { border-bottom: 1px solid #d5dccf; padding: 3px 5px; vertical-align: top; } tbody tr:nth-child(even) td { background: #f3f7ee; }
blockquote { margin: .6em 0; padding: .45em .8em; background: #eef6e4; border-left: 4px solid #8fcf3c; break-inside: avoid; }
code { font: 8.8pt "DejaVu Sans Mono", monospace; background: #eef1ea; padding: 0 2px; }
figure { margin: .6em 0 .9em; text-align: center; break-inside: avoid; }
figure img { max-width: 100%; max-height: 3.4in; border-radius: 4px; box-shadow: 0 1px 6px #0004; }
hr { display: none; }
.cover { height: 11in; width: 8.5in; position: relative; background: #0b130e; color: #e9f7d6; overflow: hidden; break-after: page; }
.cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .85; }
.cover .t { position: absolute; left: .7in; right: .7in; bottom: .9in; text-shadow: 0 2px 12px #000; }
.cover h1 { color: #b8f35a; font-size: 64pt; letter-spacing: .12em; margin: 0; }
.cover .sub { font: 600 20pt "Helvetica Neue", Arial, sans-serif; margin: .1em 0 .4em; color: #fff; }
.cover .tag { font-style: italic; font-size: 13pt; max-width: 5.4in; }
.cover .ver { font: 10pt "Helvetica Neue", Arial, sans-serif; opacity: .8; margin-top: 1.2em; }
section.front { break-after: page; }
nav.toc { columns: 2; column-gap: .35in; font: 8.6pt/1.35 "Helvetica Neue", "DejaVu Sans", Arial, sans-serif; }
nav.toc ul { list-style: none; padding-left: 0; margin: 0; } nav.toc ul ul { padding-left: 1.1em; }
nav.toc > ul > li { break-inside: avoid-column; } nav.toc > ul > li > a { font-weight: 700; font-size: 10pt; display: block; margin-top: .5em; }
nav.toc ul ul ul ul { display: none; }
.part { break-before: page; break-after: page; height: 9in; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.part h1 { font-size: 34pt; color: #12251c; margin: 0 0 .3em; } .part p { font-style: italic; font-size: 13pt; max-width: 5in; margin: 0 auto; color: #3c4a40; }
.part .rule { width: 2in; height: 4px; background: #8fcf3c; margin: .4in auto; }
section.chap { break-before: page; }
section.chap > h2:first-child { border-bottom: 4px solid #8fcf3c; padding-bottom: 6px; margin-top: 0; }
section.tree { break-before: page; }
"""

def print_html():
    """The book as one HTML page for printing (images as file:// URLs). Uses the single-file renderer."""
    import html as H
    import build_single as BS
    md_book = book()
    class PDoc(BS.Doc):
        def link(self, url):
            if url.startswith('#'): return url, False
            return url, True
        def heading(self, level, text):
            s = slug(text); n = self.seen.get(s, 0); self.seen[s] = n + 1
            s = s if n == 0 else '%s-%d' % (s, n)
            self.heads.append((level, s, text))
            return '<h%d id="%s">%s</h%d>' % (level, s, self.inline(text), level)
        def inline(self, t):
            out = super().inline(t)
            return re.sub(r'<img data-art="([^"]+)" alt="([^"]*)">', lambda m: '<img src="file://%s" alt="%s">' % (R('art', H.unescape(m.group(1))), m.group(2)), out)
    d = PDoc('rulebook'); d.seen = {}
    # split into front / parts / chapters so each can start a page
    chunks = re.split(r'(?m)^(?=# |## \d|### \d+\.\d+ [A-Z][a-z]+ — )', md_book.split('\n', 1)[1])
    out = []
    for c in chunks:
        if not c.strip(): continue
        if c.startswith('# Mutagen\n'):
            tag = re.search(r'\*A tabletop[^*]+\*', c).group(0).strip('*')
            out.append('<section class="cover"><img src="file://%s" alt=""><div class="t"><h1 id="mutagen">MUTAGEN</h1><div class="sub">The Rulebook</div><div class="tag">%s</div><div class="ver">Version 0.2 · compiled from the chapter files · xenodorian.github.io/BeelzRPG</div></div></section>' % (R('art', 'cover.jpg'), H.escape(tag)))
            d.seen['mutagen'] = 1
            rest = c.split('## About This Book', 1)[1]
            about, toc = rest.split('## Contents', 1)
            out.append('<section class="front">' + d.render('## About This Book' + about) + '</section>')
            tl = d.render('## Contents\n')
            body = d.render(toc)
            out.append('<section class="front">%s<nav class="toc">%s</nav></section>' % (tl, body))
        elif c.startswith('# '):
            title, _, rest = c.partition('\n')
            s = slug(title[2:]); d.seen[s] = d.seen.get(s, 0) + 1
            blurb = re.search(r'\*([^*]+)\*', rest).group(1)
            out.append('<section class="part"><h1 id="%s">%s</h1><div class="rule"></div><p>%s</p></section>' % (s, H.escape(title[2:]), H.escape(blurb)))
        elif c.startswith('## '):
            out.append('<section class="chap">' + d.render(c) + '</section>')
        else:
            out.append('<section class="tree">' + d.render(c) + '</section>')
    return ('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Mutagen — The Rulebook</title><style>%s</style></head><body>%s</body></html>'
            % (PRINT_CSS, '\n'.join(out)))

def main():
    if '--html' in sys.argv:
        p = sys.argv[sys.argv.index('--html') + 1]
        open(p, 'w', encoding='utf-8').write(print_html()); print('wrote', p); return
    text = book()
    if '--check' in sys.argv:
        bad = 0
        cur = open(R(OUT), encoding='utf-8').read() if os.path.exists(R(OUT)) else ''
        if cur != text: print('OUT OF DATE: %s (run python3 tools/build_rulebook.py)' % OUT); bad = 1
        sha = hashlib.sha256(text.encode()).hexdigest()
        st = open(R(PDF_STAMP)).read().strip() if os.path.exists(R(PDF_STAMP)) else ''
        if st != sha: print('OUT OF DATE: rulebook/Mutagen_Rulebook.pdf (run node tools/rulebook_pdf.js)'); bad = 1
        if not bad: print('rulebook in sync with chapters (%d lines, PDF stamp ok)' % text.count('\n'))
        sys.exit(bad)
    os.makedirs(R('rulebook'), exist_ok=True)
    open(R(OUT), 'w', encoding='utf-8').write(text)
    print('wrote %s: %d lines, %d words, %d headings' % (OUT, text.count('\n'), len(text.split()), len(re.findall(r'^#', text, re.M))))

if __name__ == '__main__':
    main()
