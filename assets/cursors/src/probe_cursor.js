const puppeteer = require('puppeteer-core');

(async () => {
  const base = 'http://localhost:8090';
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleMsgs = [];
  const failed = [];
  const responses = {};
  page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
  page.on('requestfailed', r => failed.push(`${r.url()} :: ${r.failure() && r.failure().errorText}`));
  page.on('response', r => {
    const u = r.url();
    if (u.includes('LoL') || u.includes('cursors')) responses[u] = r.status();
  });

  await page.goto(base + '/worldmap.html', { waitUntil: 'networkidle2', timeout: 30000 });

  // Locate globe center
  const box = await page.evaluate(() => {
    const g = document.getElementById('globe');
    const r = g.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
  });
  console.log('Globe box:', JSON.stringify(box));

  async function readCursor(tag) {
    const info = await page.evaluate(() => {
      const svg = document.querySelector('.globe svg');
      if (!svg) return { err: 'no svg' };
      const cs = getComputedStyle(svg);
      return { computed: cs.cursor, inline: svg.style.cursor || '(none)' };
    });
    console.log(`-- ${tag} --> computed: ${info.computed} | inline: ${info.inline}`);
    return info;
  }

  // 1) Hover (move mouse over globe, no button)
  await page.mouse.move(box.x, box.y);
  await new Promise(r => setTimeout(r, 150));
  await readCursor('HOVER (no button)');

  // 2) mousedown, no move
  await page.mouse.down();
  await new Promise(r => setTimeout(r, 100));
  await readCursor('MOUSEDOWN (held, not moving)');

  // 3) drag move
  await page.mouse.move(box.x + 80, box.y + 40, { steps: 8 });
  await new Promise(r => setTimeout(r, 100));
  await readCursor('DRAGGING (mouse held + moving)');

  // 4) release
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 100));
  await readCursor('AFTER MOUSEUP');

  console.log('\n=== Cursor asset responses ===');
  console.log(JSON.stringify(responses, null, 2));
  console.log('\n=== Failed requests ===');
  console.log(failed.length ? failed.join('\n') : '(none)');
  console.log('\n=== Console messages ===');
  console.log(consoleMsgs.length ? consoleMsgs.join('\n') : '(none)');

  await browser.close();
})().catch(e => { console.error('ERR', e.stack || e.message); process.exit(1); });
