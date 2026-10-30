// Print 5e/Mutagen_5e.md to 5e/Mutagen_5e.pdf with headless Chrome in a two-column, Homebrewery-like style.
// Run: python3 5e/tools/build_5e.py && NODE_PATH=<dir with puppeteer-core and marked> CHROME=/usr/bin/google-chrome node 5e/tools/pdf_5e.js
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require('puppeteer-core');
const { marked } = require('marked');
const HERE = path.resolve(__dirname, '..');
const MD = path.join(HERE, 'Mutagen_5e.md'), PDF = path.join(HERE, 'Mutagen_5e.pdf');

const CSS = `
@page { size: Letter; margin: 0.6in 0.55in 0.65in 0.55in; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 9.6pt/1.32 'Alegreya', 'Libre Baskerville', 'DejaVu Serif', serif; color: #1d211c; background: #f4efdf; }
.page-flow { column-count: 2; column-gap: 0.32in; column-fill: auto; }
section.chap { break-before: page; }
h1, h2, h3, h4, h5 { font-family: 'Alegreya SC', 'Alegreya', serif; color: #1f5135; break-after: avoid; line-height: 1.1; }
h1 { font-size: 26pt; margin: 0 0 6pt; column-span: all; border-bottom: 2.5pt solid #7aa33d; padding-bottom: 3pt; }
h2 { font-size: 17pt; margin: 12pt 0 4pt; border-bottom: 1.4pt solid #b9c98f; }
h3 { font-size: 12.5pt; margin: 9pt 0 3pt; border-bottom: 0.8pt solid #c9b36c; }
h4 { font-size: 11pt; margin: 8pt 0 2pt; }
h5 { font-size: 10pt; margin: 6pt 0 2pt; }
p { margin: 0 0 5pt; text-align: justify; hyphens: auto; }
p + p { text-indent: 0; }
ul { margin: 2pt 0 5pt; padding-left: 13pt; }
li { margin: 0 0 1.5pt; }
em { color: inherit; }
a { color: #1f5135; text-decoration: none; }
img { max-width: 100%; display: block; margin: 4pt auto 8pt; border-radius: 3pt; box-shadow: 0 1pt 4pt rgba(0,0,0,.35); }
table { width: 100%; border-collapse: collapse; margin: 4pt 0 8pt; font: 8.1pt/1.25 'Alegreya Sans', 'DejaVu Sans', sans-serif; break-inside: avoid; }
th { text-align: left; font-weight: 800; color: #1f5135; padding: 2pt 3pt; border-bottom: 1pt solid #7aa33d; }
td { padding: 2pt 3pt; vertical-align: top; }
tbody tr:nth-child(odd) { background: #e2e8c8; }
blockquote { margin: 6pt 0 9pt; padding: 5pt 8pt; background: #e3ebd0; border-top: 2pt solid #31593b; border-bottom: 2pt solid #31593b; box-shadow: 0 1pt 3pt rgba(0,0,0,.25); break-inside: avoid; font-family: 'Alegreya Sans', sans-serif; font-size: 8.8pt; }
blockquote h5 { margin-top: 0; font-size: 10.5pt; }
blockquote p { text-align: left; }
.classTable { column-span: all; margin: 4pt 0 10pt; }
.classTable table { font-size: 7.8pt; }
.classTable h5 { font-size: 13pt; margin-bottom: 2pt; }
.mon { background: #fbf0d6; border-top: 4pt solid #c47a27; border-bottom: 4pt solid #c47a27; padding: 4pt 8pt 2pt; margin: 6pt 0 10pt; box-shadow: 0 1pt 4pt rgba(0,0,0,.3); font-family: 'Alegreya Sans', sans-serif; font-size: 8.6pt; }
.mon h4 { color: #6b1c0d; font-size: 15pt; margin: 2pt 0 0; font-variant: small-caps; }
.mon h5 { color: #6b1c0d; border-bottom: 1pt solid #6b1c0d; font-size: 11pt; margin: 6pt 0 3pt; }
.mon ul { list-style: none; padding: 0; margin: 4pt 0; border-top: 1.5pt solid #b5552b; padding-top: 3pt; }
.mon table { margin: 3pt 0; border-top: 1.5pt solid #b5552b; border-bottom: 1.5pt solid #b5552b; }
.mon th, .mon td { text-align: center; color: #6b1c0d; }
.mon tbody tr:nth-child(odd) { background: transparent; }
.mon p { text-align: left; }
.cover { height: 9.75in; position: relative; break-after: page; overflow: hidden; margin: -0.6in -0.55in 0; }
.cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; margin: 0; border-radius: 0; box-shadow: none; }
.cover .t { position: absolute; left: 0; right: 0; bottom: 0.9in; text-align: center; color: #f4efdf; text-shadow: 0 2pt 8pt #000; }
.cover h1 { color: #e6f2c6; border: none; font-size: 50pt; letter-spacing: 3pt; margin: 0; }
.cover .sub { font: 20pt 'Alegreya SC', serif; }
.cover .tag { font: italic 11pt 'Alegreya', serif; max-width: 5.6in; margin: 8pt auto 0; }
nav.toc { column-count: 2; font-size: 8.8pt; }
nav.toc ul { padding-left: 10pt; margin: 0; } nav.toc > ul > li { margin-top: 3pt; font-weight: 700; } nav.toc li li { font-weight: 400; }
.front p { text-align: left; }
`;

(async () => {
  let md = fs.readFileSync(MD, 'utf8').replace(/<!--[^]*?-->\n?/, '');
  // headings get GitHub-style ids so the contents links work
  const seen = {};
  const slug = t => { let s = t.replace(/[*_`]/g, '').trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'); const n = seen[s] || 0; seen[s] = n + 1; return n ? `${s}-${n}` : s; };
  const renderer = new marked.Renderer();
  renderer.heading = function (tok) { const text = this.parser.parseInline(tok.tokens); return `<h${tok.depth} id="${slug(tok.text)}">${text}</h${tok.depth}>\n`; };
  marked.use({ renderer, gfm: true });
  // split: front (title + intro), contents, then one section per H1
  const [frontAll, ...rest] = md.split(/\n(?=# )/);
  const [front, contents] = frontAll.split(/\n(?=## Contents)/);
  const fTitle = front.match(/^# (.+)/m)[1], fTag = front.match(/^\*(.+)\*$/m)[1];
  slug(fTitle);
  const frontBody = front.replace(/^# .+\n/, '').replace(/^\*.+\*\n/m, '');
  let html = `<section class="cover"><img src="../art/cover.jpg" alt=""><div class="t"><h1 id="mutagen-5e">MUTAGEN 5e</h1><div class="sub">The Mutant · a Fifth-Edition Class</div><div class="tag">${fTag}</div></div></section>`;
  html += `<section class="front">${marked.parse(frontBody)}<nav class="toc">${marked.parse(contents)}</nav></section>`;
  for (const c of rest) html += `<section class="chap"><div class="page-flow">${marked.parse(c)}</div></section>`;
  const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><base href="file://${HERE}/"><title>Mutagen 5e</title><style>${CSS}</style></head><body>${html}</body></html>`;
  const htmlFile = path.join(os.tmpdir(), 'mutagen_5e_print.html'); fs.writeFileSync(htmlFile, doc);
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('requestfailed', r => errs.push('failed: ' + r.url()));
  await p.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
  await p.evaluateHandle('document.fonts.ready');
  const v = await p.evaluate(() => {
    const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
    const imgs = [...document.images];
    return { imgs: imgs.length, badImgs: imgs.filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
      links: document.querySelectorAll('a[href^="#"]').length,
      badLinks: [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(h => !ids.has(h)),
      fonts: [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))],
      mons: document.querySelectorAll('.mon').length };
  });
  await p.pdf({ path: PDF, format: 'Letter', printBackground: true, preferCSSPageSize: true, outline: true, tagged: true, displayHeaderFooter: true,
    headerTemplate: '<div style="font:7.5pt Helvetica,Arial,sans-serif;color:#6d7f5f;width:100%;padding:0 0.55in;text-align:right">MUTAGEN 5e · The Mutant</div>',
    footerTemplate: '<div style="font:8pt Helvetica,Arial,sans-serif;color:#555;width:100%;text-align:center"><span class="pageNumber"></span></div>' });
  await b.close();
  const pdf = fs.readFileSync(PDF);
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`PDF ${path.basename(PDF)}: ${(pdf.length / 1e6).toFixed(2)} MB, ${pages} pages; ${v.imgs} images (${v.badImgs.length} broken); ${v.links} internal links (${v.badLinks.length} broken); ${v.mons} stat blocks`);
  if (v.badImgs.length || v.badLinks.length || errs.length) { console.log('PROBLEMS', JSON.stringify({ badImgs: v.badImgs, badLinks: v.badLinks.slice(0, 20), errs }, null, 1)); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
