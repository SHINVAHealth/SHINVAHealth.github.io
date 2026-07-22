const puppeteer = require('puppeteer-core');
const path = require('path');

const BASE = process.argv[2] || 'https://d413d9e806b44831b302566204ddda40.app.codebuddy.work';
const PAGE = process.argv[3] || 'worldmap.html';
const OUT = 'c:/Users/Administrator/WorkBuddy/2026-07-14-09-19-47/webapp/assets/cursors/src';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE + '/' + PAGE, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 800));

  // 1) 检查外部 PNG 光标文件是否 404
  const pngStatus = await page.evaluate(async () => {
    const files = ['LoLNormal.png','LoLHover.png','LoLGrab.png','LoGGrabbing.png'];
    const out = {};
    for (const f of files) {
      try {
        const r = await fetch('assets/cursors/' + f, { cache: 'no-store' });
        out[f] = r.status;
      } catch (e) { out[f] = 'ERR:' + e.message; }
    }
    return out;
  });

  // 2) 在 #globe 矩形内扫描，找海洋点和陆地点
  const pts = await page.evaluate(() => {
    const g = document.getElementById('globe');
    const r = g.getBoundingClientRect();
    const ocean = [], land = [];
    for (let gy = r.top + 20; gy < r.bottom - 20; gy += 18) {
      for (let gx = r.left + 20; gx < r.right - 20; gx += 18) {
        const el = document.elementFromPoint(gx, gy);
        if (!el) continue;
        if (el.closest && el.closest('.country')) { if (land.length < 1) land.push([gx, gy, el.getAttribute('class')]); }
        else if (el.classList && el.classList.contains('sphere-ocean')) { if (ocean.length < 1) ocean.push([gx, gy, 'sphere-ocean']); }
        if (ocean.length && land.length) break;
      }
      if (ocean.length && land.length) break;
    }
    return { ocean, land, rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom } };
  });

  async function shoot(kind, p) {
    if (!p) return { kind, found: false };
    await page.mouse.move(p[0], p[1]);
    await new Promise(r => setTimeout(r, 250));
    const info = await page.evaluate((px, py) => {
      const gc = document.querySelector('.globe-cursor');
      const cs = gc ? getComputedStyle(gc) : null;
      const rect = gc ? gc.getBoundingClientRect() : null;
      const r = document.getElementById('globe').getBoundingClientRect();
      // 在光标位置取下方元素，看它生效的 cursor
      const elUnder = document.elementFromPoint(px, py);
      const curCS = elUnder ? getComputedStyle(elUnder).cursor : null;
      const elCN = elUnder ? (elUnder.className && elUnder.className.baseVal !== undefined ? elUnder.className.baseVal : elUnder.className) : null;
      return {
        gcDisplay: cs ? cs.display : null,
        gcOpacity: cs ? cs.opacity : null,
        gcVisibility: cs ? cs.visibility : null,
        gcTransform: cs ? cs.transform : null,
        gcZ: cs ? cs.zIndex : null,
        gcNatural: gc ? gc.naturalWidth : null,
        gcRect: rect ? { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) } : null,
        cursorUnder: curCS,
        elUnderClass: elCN
      };
    }, p[0], p[1]);
    const f = path.join(OUT, 'shot_' + kind + '.png');
    await page.screenshot({ path: f });
    return { kind, found: true, point: p, info, shot: f };
  }

  const oceanRes = await shoot('ocean', pts.ocean[0]);
  const landRes = await shoot('land', pts.land[0]);

  console.log(JSON.stringify({ pngStatus, pts: { oceanCount: pts.ocean.length, landCount: pts.land.length }, oceanRes, landRes, errors }, null, 2));
  await browser.close();
})();
