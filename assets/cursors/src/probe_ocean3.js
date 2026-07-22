const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'https://d413d9e806b44831b302566204ddda40.app.codebuddy.work';
const PAGE = process.argv[3] || 'worldmap.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(BASE + '/' + PAGE, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 600));

  const pre = await page.evaluate(() => {
    const g = document.getElementById('globe');
    const r = g.getBoundingClientRect();
    const samples = [];
    const cols = 18, rows = 11;
    for (let i = 1; i < cols; i++) {
      for (let j = 1; j < rows; j++) {
        const x = r.left + (r.width * i / cols);
        const y = r.top + (r.height * j / rows);
        const el = document.elementFromPoint(x, y);
        const cls = el && el.getAttribute ? (el.getAttribute('class') || '') : '';
        samples.push({ x: Math.round(x), y: Math.round(y), inGlobe: g.contains(el), isOcean: cls.indexOf('sphere-ocean') >= 0, cls });
      }
    }
    return samples;
  });

  const detail = [];
  let oceanTotal = 0, oceanShown = 0;
  for (const s of pre) {
    await page.mouse.move(s.x, s.y);
    await new Promise(r => setTimeout(r, 10));
    const disp = await page.evaluate(() => getComputedStyle(document.querySelector('.globe-cursor')).display);
    s.display = disp;
    if (s.isOcean) { oceanTotal++; if (disp === 'block') oceanShown++; }
    detail.push(s);
  }

  console.log(JSON.stringify({
    oceanTotal,
    oceanShown,
    oceanSamples: detail.filter(d => d.isOcean)
  }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
