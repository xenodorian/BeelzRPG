// Print the compiled rulebook to rulebook/Mutagen_Rulebook.pdf with headless Chrome, then verify it.
// Run: python3 tools/build_rulebook.py && CHROME=/usr/bin/google-chrome node tools/rulebook_pdf.js
// Needs: puppeteer-core (npm i puppeteer-core), Python 3 with the repo's tools/ (no extra packages).
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const puppeteer = require('puppeteer-core');
const ROOT = path.resolve(__dirname, '..');
const MD = path.join(ROOT, 'rulebook/Mutagen_Rulebook.md'), PDF = path.join(ROOT, 'rulebook/Mutagen_Rulebook.pdf');
(async () => {
  // the PDF must come from an up-to-date Markdown book
  const chk = execFileSync('python3', [path.join(ROOT, 'tools/build_rulebook.py')], { encoding: 'utf8' }); process.stdout.write(chk);
  const htmlFile = path.join(os.tmpdir(), 'mutagen_rulebook_print.html');
  execFileSync('python3', [path.join(ROOT, 'tools/build_rulebook.py'), '--html', htmlFile]);
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('requestfailed', r => errs.push('failed: ' + r.url()));
  await p.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
  const v = await p.evaluate(() => {
    const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
    const imgs = [...document.images];
    return {
      imgs: imgs.length, badImgs: imgs.filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
      links: document.querySelectorAll('a[href^="#"]').length,
      badLinks: [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(h => !ids.has(h)),
      chaps: document.querySelectorAll('section.chap').length, parts: document.querySelectorAll('section.part').length,
    };
  });
  await p.pdf({
    path: PDF, format: 'Letter', printBackground: true, preferCSSPageSize: true, outline: true, tagged: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font:7.5pt Helvetica,Arial,sans-serif;color:#7a8a7e;width:100%;padding:0 0.65in;text-align:right">MUTAGEN · The Rulebook</div>',
    footerTemplate: '<div style="font:8pt Helvetica,Arial,sans-serif;color:#555;width:100%;text-align:center"><span class="pageNumber"></span></div>',
  });
  await b.close();
  const pdf = fs.readFileSync(PDF);
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`PDF ${path.relative(ROOT, PDF)}: ${(pdf.length / 1e6).toFixed(2)} MB, ${pages} pages; ${v.parts} parts, ${v.chaps} chapters; ${v.imgs} images (${v.badImgs.length} broken); ${v.links} internal links (${v.badLinks.length} broken)`);
  const bad = v.badImgs.length || v.badLinks.length || errs.length || pages < 40;
  if (bad) { console.log('PROBLEMS', JSON.stringify({ badImgs: v.badImgs, badLinks: v.badLinks.slice(0, 20), errs }, null, 1)); process.exit(1); }
  const sha = crypto.createHash('sha256').update(fs.readFileSync(MD)).digest('hex');
  fs.writeFileSync(path.join(ROOT, 'rulebook/.pdf_source.sha256'), sha + '\n');
  console.log('stamped rulebook/.pdf_source.sha256');
})().catch(e => { console.error(e); process.exit(1); });
