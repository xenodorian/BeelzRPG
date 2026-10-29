"""Checks every relative Markdown link and #anchor in the repo (GitHub-style heading slugs). Run: python3 tools/check_links.py"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def slug(h):
    h = re.sub(r'[*_`]', '', h.strip().lower())
    h = re.sub(r'[^\w\- ]', '', h, flags=re.UNICODE)
    return h.replace(' ', '-')
anchors = {}; files = []
for d, _, fs in os.walk(ROOT):
    if '.git' in d or 'node_modules' in d: continue
    for f in fs:
        if f.endswith('.md'):
            p = os.path.join(d, f); files.append(p); seen = {}
            a = set()
            for line in open(p, encoding='utf-8'):
                m = re.match(r'^#{1,6}\s+(.*)', line)
                if m:
                    s = slug(m.group(1)); n = seen.get(s, 0); seen[s] = n + 1
                    a.add(s if n == 0 else '%s-%d' % (s, n))
            anchors[os.path.normpath(p)] = a
bad = 0; total = 0
for p in files:
    txt = open(p, encoding='utf-8').read()
    for m in re.finditer(r'\]\(([^)\s]+)\)', txt):
        url = m.group(1)
        if re.match(r'^[a-z]+:', url): continue
        total += 1
        path, _, frag = url.partition('#')
        tgt = os.path.normpath(os.path.join(os.path.dirname(p), path)) if path else os.path.normpath(p)
        if not os.path.exists(tgt): print('MISSING FILE', os.path.relpath(p, ROOT), url); bad += 1; continue
        if frag and tgt.endswith('.md') and frag not in anchors.get(tgt, set()): print('MISSING ANCHOR', os.path.relpath(p, ROOT), url); bad += 1
print('%d links checked, %d broken' % (total, bad)); sys.exit(1 if bad else 0)
