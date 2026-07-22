const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'https://d413d9e806b44831b302566204ddda40.app.codebuddy.work';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR:' + e.message));

  const PAGE = process.argv[3] || 'worldmap.html';
  await page.goto(BASE + '/' + PAGE, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 600));

  const info = await page.evaluate(() => {
    const c = document.querySelector('.globe-cursor');
    if (!c) return { exists: false };
    const g = document.getElementById('globe');
    const r = g ? g.getBoundingClientRect() : null;
    return {
      exists: true,
      naturalWidth: c.naturalWidth,
      naturalHeight: c.naturalHeight,
      display: getComputedStyle(c).display,
      srcPrefix: (c.src || '').slice(0, 22),
      hasGlobe: !!g,
      globeRect: r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null
    };
  });

  let afterMove = null, afterDown = null;
  if (info.globeRect && info.globeRect.w > 0) {
    const gx = info.globeRect.x + info.globeRect.w / 2;
    const gy = info.globeRect.y + info.globeRect.h / 2;
    await page.mouse.move(gx, gy);
    await new Promise(r => setTimeout(r, 250));
    afterMove = await page.evaluate(() => {
      const c = document.querySelector('.globe-cursor');
      return { display: getComputedStyle(c).display, transform: c.style.transform };
    });
    await page.mouse.down();
    await new Promise(r => setTimeout(r, 250));
    afterDown = await page.evaluate(() => {
      const c = document.querySelector('.globe-cursor');
      return { srcPrefix: (c.src || '').slice(0, 22), className: c.className };
    });
    await page.mouse.up();
  }

  console.log(JSON.stringify({ info, afterMove, afterDown, errors: errs }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
