// verify_cursor_fix.js — 验证 LOL 小手修复：消除"额外系统小手"、确认指尖点击
const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false, args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const BASE = 'https://a61085674b0a4c5e82ea5116f8aea9d1.app.codebuddy.work';
  let pass = true;

  // ========== 世界地图 ==========
  console.log('\n=== 世界地图 (worldmap.html) ===');
  try {
    await page.goto(BASE + '/worldmap.html', { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));

    // 1) CSS 规则存在
    const css = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const s of sheets) {
        if (s.cssRules) {
          for (let i = 0; i < s.cssRules.length; i++) {
            if (s.cssRules[i].selectorText && s.cssRules[i].selectorText.includes('over-globe'))
              return s.cssRules[i].cssText;
          }
        }
      }
    });
    console.log('CSS over-globe:', css ? '✅ 存在' : '❌ 缺失');
    pass = pass && !!css;

    // 2) mousemove 进入 globe → body 加 over-globe 类
    const globeRect = await page.evaluate(() => {
      const el = document.getElementById('globe');
      return el ? el.getBoundingClientRect() : null;
    });
    if (globeRect) {
      const cx = Math.round(globeRect.left + globeRect.width / 2);
      const cy = Math.round(globeRect.top + globeRect.height / 2);
      await page.mouse.move(cx, cy);
      await new Promise(r => setTimeout(r, 100));
      const hasClass = await page.evaluate(() => document.body.classList.contains('over-globe'));
      console.log('进入 globe → body.over-globe:', hasClass ? '✅ 已加' : '❌ 未加');
      pass = pass && hasClass;
    }

    // 3) DOM 小手显示且 src 包含真实 LOL base64
    const cursorInfo = await page.evaluate(() => {
      const img = document.querySelector('.globe-cursor');
      return { display: img ? getComputedStyle(img).display : 'none',
               srcLen: img && img.src ? (img.src.length - 'data:image/png;base64,'.length) : 0,
               visible: img ? getComputedStyle(img).display !== 'none' : false };
    });
    console.log('DOM 小手可见:', cursorInfo.visible ? '✅' : '❌', '| base64长度:', cursorInfo.srcLen);

    // 4) mousedown → 握拳（src 切换到 LoGGrabbing）
    if (globeRect) {
      const cx = Math.round(globeRect.left + globeRect.width / 3);
      const cy = Math.round(globeRect.top + globeRect.height / 3);
      await page.mouse.down(cx, cy);
      await new Promise(r => setTimeout(r, 150));
      const fistSrc = await page.evaluate(() => {
        const img = document.querySelector('.globe-cursor');
        return img ? img.src.substring(0, 80) : '';
      });
      // LoGGrabbing base64 starts with specific prefix — check length matches 1700 bytes
      const fistLen = await page.evaluate(() => {
        const img = document.querySelector('.globe-cursor');
        return img ? (img.src.length - 'data:image/png;base64,'.length) : 0;
      });
      console.log('mousedown → 握拳图 base64 长度:', fistLen, fistLen > 1650 ? '(≈LoGGrabbing ✅)' : '❌ 不是真握拳');
      pass = pass && (fistLen > 1650); // LoGGrabbing is ~1700 bytes

      // 关键检查：body 仍然有 over-globe（拖拽期间不丢失）
      const stillOverGlobe = await page.evaluate(() => document.body.classList.contains('over-globe'));
      console.log('mousedown 期间 body.over-globe:', stillOverGlobe ? '✅ 保持' : '❌ 丢失');

      // 检查 body 的计算 cursor 是否为 none（全局屏蔽生效）
      const bodyCursor = await page.evaluate(() => window.getComputedStyle(document.body).cursor);
      console.log('mousedown 期间 body cursor:', bodyCursor === 'none' ? '✅ none（无系统光标）' : `⚠️ ${bodyCursor}（可能有系统光标穿透）`);

      await page.mouse.up(cx, cy);
      await new Promise(r => setTimeout(r, 100));
    }

    // 5) 移出 globe → 移除类
    await page.mouse.move(10, 10);
    await new Promise(r => setTimeout(r, 100));
    const classRemoved = await page.evaluate(() => !document.body.classList.contains('over-globe'));
    console.log('移出 globe → over-globe 移除:', classRemoved ? '✅' : '❌ 未移除');
    pass = pass && classRemoved;

  } catch(e) {
    console.error('世界地图验证异常:', e.message);
    pass = false;
  }

  // ========== 国家地图 ==========
  console.log('\n=== 国家地图 (country.html?c=ng) ===');
  try {
    await page.goto(BASE + '/country.html?c=ng', { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));

    // 1) CSS over-map 存在
    const css2 = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const s of sheets) {
        if (s.cssRules) {
          for (let i = 0; i < s.cssRules.length; i++) {
            if (s.cssRules[i].selectorText && s.cssRules[i].selectorText.includes('over-map'))
              return s.cssRules[i].cssText;
          }
        }
      }
    });
    console.log('CSS over-map:', css2 ? '✅ 存在' : '❌ 缺失');
    pass = pass && !!css2;

    // 2) 进入 map → body.over-map
    const mapRect = await page.evaluate(() => {
      const el = document.getElementById('map');
      return el ? el.getBoundingClientRect() : null;
    });
    if (mapRect) {
      const cx = Math.round(mapRect.left + mapRect.width / 2);
      const cy = Math.round(mapRect.top + mapRect.height / 2);
      await page.mouse.move(cx, cy);
      await new Promise(r => setTimeout(r, 100));
      const hasClass2 = await page.evaluate(() => document.body.classList.contains('over-map'));
      console.log('进入 map → body.over-map:', hasClass2 ? '✅ 已加' : '❌ 未加');
      pass = pass && hasClass2;
    }

    // 3) mousedown → 握拳
    if (mapRect) {
      const cx = Math.round(mapRect.left + mapRect.width / 3);
      const cy = Math.round(mapRect.top + mapRect.height / 3);
      await page.mouse.down(cx, cy);
      await new Promise(r => setTimeout(r, 150));
      const fistLen2 = await page.evaluate(() => {
        const img = document.querySelector('.country-cursor');
        return img ? (img.src.length - 'data:image/png;base64,'.length) : 0;
      });
      console.log('mousedown → 握拳图 base64 长度:', fistLen2, fistLen2 > 1650 ? '(≈LoGGrabbing ✅)' : '❌ 不是真握拳');
      pass = pass && (fistLen2 > 1650);

      const bodyCursor2 = await page.evaluate(() => window.getComputedStyle(document.body).cursor);
      console.log('mousedown 期间 body cursor:', bodyCursor2 === 'none' ? '✅ none' : `⚠️ ${bodyCursor2}`);

      await page.mouse.up(cx, cy);
    }
  } catch(e) {
    console.error('国家地图验证异常:', e.message);
    pass = false;
  }

  console.log('\n=============================');
  console.log(pass ? '🎉 全部通过！' : '⚠️ 有项目未通过，请检查');
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
