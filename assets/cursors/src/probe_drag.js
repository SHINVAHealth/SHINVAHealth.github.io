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

  // 注入捕获阶段监听，记录每次 mousemove 的真实 e.target（含拖拽时 d3.zoom 的 pointer capture 影响）
  await page.evaluate(() => {
    window.__log = [];
    window.addEventListener('mousemove', (e) => {
      const g = document.getElementById('globe');
      window.__log.push({
        inGlobe: g.contains(e.target),
        tag: e.target && e.target.tagName,
        cls: e.target && e.target.getAttribute && e.target.getAttribute('class')
      });
    }, true);
  });

  const rect = await page.evaluate(() => {
    const r = document.getElementById('globe').getBoundingClientRect();
    return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
  });

  await page.mouse.move(rect.cx, rect.cy);
  await new Promise(r => setTimeout(r, 80));
  const hover = await page.evaluate(() => ({
    display: getComputedStyle(document.querySelector('.globe-cursor')).display,
    cls: document.querySelector('.globe-cursor').className
  }));

  await page.mouse.down();
  await new Promise(r => setTimeout(r, 60));
  const dragPts = [
    { x: rect.cx - 120, y: rect.cy + 60 },
    { x: rect.cx - 240, y: rect.cy + 120 },
    { x: rect.cx + 200, y: rect.cy - 40 }
  ];
  const drag = [];
  for (const p of dragPts) {
    await page.mouse.move(p.x, p.y);
    await new Promise(r => setTimeout(r, 60));
    const st = await page.evaluate(() => {
      const c = document.querySelector('.globe-cursor');
      const last = window.__log[window.__log.length - 1];
      return { display: getComputedStyle(c).display, cls: c.className, lastTarget: last };
    });
    drag.push({ at: p, ...st });
  }
  await page.mouse.up();

  console.log(JSON.stringify({ hover, drag }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
