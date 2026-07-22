const puppeteer = require('puppeteer-core');

(async () => {
  const base = 'http://localhost:8090';
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 800 });

  const consoleMsgs = [];
  page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
  page.on('requestfailed', r => consoleMsgs.push(`[reqfail] ${r.url()} :: ${r.failure() && r.failure().errorText}`));

  const html = `<!doctype html><html><head><style>
    body{margin:0}
    .box{width:50%;height:50%;float:left;display:flex;align-items:center;justify-content:center;font:20px sans-serif}
    #b1{cursor:url('assets/cursors/src/does_not_exist.png'), auto}
    #b2{cursor:url('assets/cursors/src/oversized.png') 100 100, auto}
    #b3{cursor:url('assets/cursors/LoLGrab.png') 12 8, grab}
    #b4{cursor:url('assets/cursors/LoGGrabbing.png') 12 8, grabbing}
  </style></head><body>
    <div class="box" id="b1">broken</div>
    <div class="box" id="b2">oversized</div>
    <div class="box" id="b3">LoLGrab</div>
    <div class="box" id="b4">LoGGrabbing</div>
  </body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle2' });

  for (const id of ['b1','b2','b3','b4']) {
    const box = await page.evaluate((sel) => {
      const r = document.getElementById(sel).getBoundingClientRect();
      return { x: r.x + r.width/2, y: r.y + r.height/2 };
    }, id);
    await page.mouse.move(box.x, box.y);
    await new Promise(r => setTimeout(r, 200));
    const cur = await page.evaluate((sel) => getComputedStyle(document.getElementById(sel)).cursor, id);
    console.log(`${id}: ${cur}`);
  }

  console.log('\n=== CONSOLE (cursor warnings?) ===');
  console.log(consoleMsgs.length ? consoleMsgs.join('\n') : '(none)');

  await browser.close();
})().catch(e => { console.error('ERR', e.stack || e.message); process.exit(1); });
