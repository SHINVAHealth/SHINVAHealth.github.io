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
    const c = document.querySelector('.globe-cursor');
    if (!g || !c) return { err: 'missing' };
    const r = g.getBoundingClientRect();
    const samples = [];
    const cols = 9, rows = 9;
    for (let i = 1; i < cols; i++) {
      for (let j = 1; j < rows; j++) {
        const x = r.left + (r.width * i / cols);
        const y = r.top + (r.height * j / rows);
        const el = document.elementFromPoint(x, y);
        const inGlobe = g.contains(el);
        samples.push({ x: Math.round(x), y: Math.round(y), inGlobe,
          tag: el ? (el.tagName + (el.id ? '#' + el.id : '') + (el.getAttribute('class') ? '.' + el.getAttribute('class') : '')) : 'null' });
      }
    }
    return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, samples };
  });

  let oceanTotal = 0, oceanShown = 0, landTotal = 0, landShown = 0;
  const detail = [];
  for (const s of pre.samples) {
    await page.mouse.move(s.x, s.y);
    await new Promise(r => setTimeout(r, 12));
    const disp = await page.evaluate(() => getComputedStyle(document.querySelector('.globe-cursor')).display);
    s.display = disp;
    if (!s.inGlobe) { oceanTotal++; if (disp === 'block') oceanShown++; }
    else { landTotal++; if (disp === 'block') landShown++; }
    detail.push(s);
  }

  console.log(JSON.stringify({
    summary: { oceanTotal, oceanShown, landTotal, landShown },
    penetratingSamples: detail.filter(s => !s.inGlobe)
  }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
