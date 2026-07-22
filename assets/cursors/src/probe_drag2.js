const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'https://d413d9e806b44831b302566204ddda40.app.codebuddy.work';
const PAGE = process.argv[3] || 'worldmap.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(BASE + '/' + PAGE, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 600));

  // 找一个陆地点
  const land = await page.evaluate(() => {
    const g = document.getElementById('globe'); const r = g.getBoundingClientRect();
    for (let gy = r.top+30; gy < r.bottom-30; gy += 12)
      for (let gx = r.left+30; gx < r.right-30; gx += 12) {
        const el = document.elementFromPoint(gx, gy);
        if (el && el.closest && el.closest('.country')) return [gx, gy];
      }
    return null;
  });
  if (!land) { console.log('NO LAND'); return; }

  function snap(label){
    return page.evaluate((label) => {
      const gc = document.querySelector('.globe-cursor');
      const rect = gc.getBoundingClientRect();
      return {
        label,
        display: getComputedStyle(gc).display,
        natural: gc.naturalWidth,
        src40: gc.src.slice(0, 40),
        rectX: Math.round(rect.x), rectY: Math.round(rect.y)
      };
    }, label);
  }

  const log = [];
  await page.mouse.move(land[0], land[1]); await new Promise(r=>setTimeout(r,150));
  log.push(await snap('hover'));
  await page.mouse.down(); await new Promise(r=>setTimeout(r,150));
  log.push(await snap('mousedown'));
  // 拖动：连续移动并记录手的位置
  const path = [[land[0]+40, land[1]+30],[land[0]+90, land[1]+60],[land[0]+150, land[1]+90]];
  for (const p of path) {
    await page.mouse.move(p[0], p[1], { steps: 5 });
    await new Promise(r=>setTimeout(r,120));
    log.push(await snap('drag->'+p[0]+','+p[1]));
  }
  await page.mouse.up(); await new Promise(r=>setTimeout(r,150));
  log.push(await snap('mouseup'));

  console.log(JSON.stringify({ land, log }, null, 2));
  await browser.close();
})();
