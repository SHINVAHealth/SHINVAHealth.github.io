/* auto-extracted app bootstrap (was inline in country.html) */
window.addEventListener("error", function(e){
  try { var el=document.getElementById("mapStatus"); if(el) el.textContent="⚠ 初始化错误："+(e.message||e.error||"未知"); } catch(_){}
});
window.addEventListener("unhandledrejection", function(e){
  try { var el=document.getElementById("mapStatus"); if(el) el.textContent="⚠ 异步错误："+((e.reason&&(e.reason.message||e.reason))||"未知"); } catch(_){}
});

  (function(){
    const META = window.COUNTRY_META;
    const $ = id => document.getElementById(id);
    const params = new URLSearchParams(location.search);
    const iso2 = (params.get('c') || '').toLowerCase();
    const _urlHl = params.get('hl');   // 世界地图搜索客户后跳转并自动点亮该行（__id）；实际赋值在下方 let 声明处（避开 TDZ）
    if (!iso2){ var _p=document.createElement('p'); _p.style.cssText='padding:40px;color:#9fb0c3'; _p.textContent='缺少国家参数：country.html?c=iso2'; document.body.appendChild(_p); return; }
    if (iso2 === 'tw'){ window.location.href = 'country.html?c=cn'; return; }  // 台湾是中国不可分割的一部分，不单独成页

    const cn = META.ISO2_TO_CN[iso2] || iso2.toUpperCase();
    const iso3 = META.ISO2_TO_ISO3[iso2] || '';
    const facts = META.FACTS[iso2] || null;
    const cur = META.CURRENCY[iso2] || null;
    const continent = META.ISO2_TO_CONTINENT[iso2] || '—';
    $('countryName').textContent = cn;
    $('countryMeta').textContent = (iso2.toUpperCase()) + (facts ? ' · ' + (facts.capital||'') : '');
    $('custCountry').textContent = cn;
    document.title = cn + ' · 国家详情';
    $('overviewTitle').textContent = '国家概况';
    // 左上角国家名称后：该国实时时间（24小时制）+ 国际区号
    const TZ = (META.TZ && META.TZ[iso2]) ? META.TZ[iso2] : null;
    const CALL = (META.CALLING && META.CALLING[iso2]) ? META.CALLING[iso2] : null;
    function tick(){
      let t;
      try { t = new Intl.DateTimeFormat('zh-CN', { timeZone: TZ || undefined, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).format(new Date()); }
      catch(e){ t = new Intl.DateTimeFormat('zh-CN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).format(new Date()); }
      $('countryClock').textContent = (CALL ? '(+' + CALL + ') ' : '') + t;
    }
    tick();
    setInterval(tick, 1000);
    $('backBtn').onclick = () => location.href = 'worldmap.html';

    function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

    // —— 离线缓存层：IndexedDB 缓存地图边界 JSON，重复访问秒开（任何失败自动回退网络，功能不变）——
    const APP_CACHE_VER = '202607241650';   // 每次部署改动数据/脚本时递增，自动失效旧缓存
    const _IDB_NAME = 'mapCacheDB', _IDB_STORE = 'files';
    function _openIDB(){
      return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) { reject(new Error('no-idb')); return; }
        let req;
        try { req = indexedDB.open(_IDB_NAME, 1); } catch(e){ reject(e); return; }
        req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(_IDB_STORE)) db.createObjectStore(_IDB_STORE); };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    async function _idbGet(key){
      const db = await _openIDB();
      return await new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(_IDB_STORE, 'readonly');
          const rq = tx.objectStore(_IDB_STORE).get(key);
          rq.onsuccess = () => resolve(rq.result);
          rq.onerror = () => reject(rq.error);
        } catch(e){ reject(e); }
      });
    }
    async function _idbPut(key, val){
      const db = await _openIDB();
      return await new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(_IDB_STORE, 'readwrite');
          tx.objectStore(_IDB_STORE).put(val, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        } catch(e){ reject(e); }
      });
    }
    // 带 IndexedDB 缓存的 fetch：version 变化时自动失效旧条目；网络/缓存任意一方可用即返回
    async function fetchCached(url){
      const key = url + '::' + APP_CACHE_VER;
      try {
        const cached = await _idbGet(key);
        if (cached !== undefined) return cached;
      } catch(e){ /* 缓存不可用 → 走网络 */ }
      const r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      _idbPut(key, data).catch(()=>{});   // 异步写回，不阻塞
      return data;
    }

    // —— 1. 国家概况（静态权威数据，永远显示，不依赖外部 API）——
    (function loadFacts(){
      if (!facts){ $('pop').textContent='—'; }
      else {
        const popYi = (facts.pop != null) ? (facts.pop / 1e8).toFixed(2) + ' 亿' : '—';
        $('pop').textContent = popYi;
      }
      if (cur){ $('currency').textContent = `${cur.name}（${cur.code}） ${cur.symbol}`; }
      else { $('currency').textContent = '—'; }
      // 首都：中文 / 英文 同时显示
      const capCn = (window.CAPITAL_CN && window.CAPITAL_CN[iso2]) || null;
      $('capital').textContent = (facts && facts.capital) ? (capCn ? capCn + ' (' + facts.capital + ')' : facts.capital) : '—';
      // 所属地区：大洲 / 子区域（大致方向）
      const sub = (window.SUBREGION && window.SUBREGION[iso2]) || null;
      $('region').textContent = sub ? continent + '/' + sub : continent;
    })();

    // —— 2. 公休日（nager.at；仅显示今天之后；名称翻译为中文）——
    const HOLIDAY_CN = {
      "New Year's Day":"元旦","New Year's Eve":"新年前夜","Labour Day":"劳动节","Labor Day":"劳动节",
      "Christmas Day":"圣诞节","Christmas Eve":"平安夜","Good Friday":"耶稣受难日","Easter Monday":"复活节星期一",
      "Easter Sunday":"复活节","Ascension Day":"耶稣升天节","Whit Monday":"圣灵降临节","Assumption Day":"圣母升天节",
      "All Saints' Day":"万圣节","All Souls' Day":"追思节","Immaculate Conception":"圣母无染原罪节","Epiphany":"主显节",
      "Corpus Christi":"基督圣体节","Saint Stephen's Day":"圣史蒂芬日","Boxing Day":"节礼日","Palm Sunday":"棕枝主日",
      "Independence Day":"独立日","National Day":"国庆日","Republic Day":"共和国日","Constitution Day":"宪法日",
      "Unity Day":"统一日","Revolution Day":"革命日","Liberation Day":"解放日","Freedom Day":"自由日",
      "Statehood Day":"建国日","Sovereignty Day":"主权日","Restoration of Independence Day":"恢复独立日",
      "Day of the Defenders of Ukraine":"乌克兰保卫者日","Reunification Day":"统一日","Victory Day":"胜利日",
      "Victory in Europe Day":"欧洲胜利日","Victory over Japan Day":"对日胜利日","Defender of the Fatherland Day":"祖国保卫者日",
      "Thanksgiving Day":"感恩节","Veterans Day":"退伍军人节","Memorial Day":"阵亡将士纪念日","Juneteenth":"六月节",
      "Bastille Day":"巴士底日","Canada Day":"加拿大国庆日","Australia Day":"澳大利亚国庆日","Anzac Day":"澳新军团日",
      "Gandhi Jayanti":"甘地诞辰","Diwali":"排灯节","Eid al-Fitr":"开斋节","Eid ul-Fitr":"开斋节","Eid al-Fitr Holiday":"开斋节假期",
      "Eid al-Adha":"古尔邦节","Eid ul-Adha":"古尔邦节","Eid al-Adha Holiday":"古尔邦节假期","Mawlid al-Nabi":"圣纪节",
      "Birthday of the Prophet Muhammad":"穆罕默德诞辰","Isra and Mi'raj":"登霄节","Ashura":"阿舒拉节",
      "Chinese New Year":"春节","Spring Festival":"春节","Lunar New Year":"农历新年","Mid-Autumn Festival":"中秋节",
      "Dragon Boat Festival":"端午节","Songkran":"宋干节（泰国新年）","Carnival":"狂欢节","Mardi Gras":"忏悔星期二",
      "King's Birthday":"国王诞辰","Queen's Birthday":"女王诞辰","Coronation Day":"加冕日","Founding Day":"建国日",
      "International Mother Language Day":"国际母语日","Pahela Baishakh":"孟历新年","Victory Day (Bangladesh)":"胜利日",
      "Day of Ashura":"阿舒拉节","Prophet's Birthday":"穆罕默德诞辰","First Day of Ramadan":"斋月开始",
      "Father's Day":"父亲节","Mother's Day":"母亲节","Children's Day":"儿童节","Teacher's Day":"教师节",
      "Inventors' Day":"发明家日","Armed Forces Day":"建军节","Navy Day":"海军节","Army Day":"陆军节",
      "Flag Day":"国旗日","Youth Day":"青年节","Women's Day":"妇女节","International Women's Day":"国际妇女节",
      "May Day":"五一劳动节","Workers' Day":"劳动节","Human Rights Day":"人权日","Environment Day":"环境日",
      "Independence from Spain":"脱离西班牙独立日","Independence from France":"脱离法国独立日","Independence from Britain":"脱离英国独立日",
      "National Independence Day":"国家独立日","Czech Statehood Day":"捷克建国日","St. Cyril and St. Methodius Day":"西里尔与美多德日",
      "St. Wenceslas Day":"圣瓦茨拉夫日","Jan Hus Day":"扬·胡斯日","Open Monument Day":"古迹开放日",
      "Araw ng Kagitingan":"英雄日（菲律宾）","Ninoy Aquino Day":"尼诺·阿基诺日","Bonifacio Day":"博尼法西奥日",
      "Rizal Day":"黎刹日","People Power Anniversary":"人民力量纪念日","Independence Day (Bangladesh)":"独立日",
      "Queen's Official Birthday":"女王官方寿辰","Waitangi Day":"怀唐伊日","King's Official Birthday":"国王官方寿辰",
      /* —— 以下为 7 个外贸跟踪国家 2026 实际公休日名称（按 date.nager.at 真实返回补齐，确保中英文双标） —— */
      "Independence and National Day":"独立与国庆日","Bengali New Year":"孟历新年","July Mass Uprising Day":"七月群众起义日",
      "Democracy Day":"民主日","National Youth Day":"全国青年日","All Saints Day":"万圣节","National Peace Day":"全国和平日",
      "Zanzibar Revolution Day":"桑给巴尔革命日","Karume Day":"卡鲁姆日","Union Day":"联合日","International Workers' Day":"国际劳动节",
      "Saba Saba Day":"萨巴萨巴日","Nane Nane Day":"南内南内日","Nyerere Day":"尼雷尔日",
      "Maundy Thursday":"濯足节","Holy Saturday":"圣周六","Benito Juárez's birthday":"贝尼托·华雷斯诞辰",
      "Feast of the Divina Pastora":"神圣牧羊女节","Saint Joseph's Day":"圣约瑟夫日",
      "Foundation anniversary Day of San Cristóbal, Táchira":"圣克里斯托瓦尔（塔奇拉）建城纪念日",
      "Slavery Abolition Anniversary":"废除奴隶制纪念日","Beginning of the Independence Movement":"独立运动开始日",
      "Festival of the Crosses":"十字架节","Anniversary of the Battle of Carabobo":"卡拉沃沃战役纪念日","Journalists' Day":"记者节",
      "Simón Bolívar's Birthday":"西蒙·玻利瓦尔诞辰","Caracas City Foundation Day":"加拉加斯建城日",
      "Birth of the Blessed Virgin Mary":"圣母诞生日","Feast of the Our Lady of Mercy":"仁慈圣母节",
      "Day of Indigenous Resistance":"原住民抵抗日","Immaculate Conception Day":"圣母无染原罪节"
    };
    function cnName(h){
      return HOLIDAY_CN[h.name] || '';                     // 命中字典 → 中文；否则空（渲染时回退英文，绝不使用当地文字）
    }
    function loadHolidays(){
      const year = new Date().getFullYear();
      $('holidayYear').textContent = year;
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${iso2}`)
        .then(r => r.json()).then(list => {
          if (!Array.isArray(list) || !list.length){ $('holidayList').innerHTML = '<li>今年暂无公休日数据</li>'; return; }
          const today = new Date(); today.setHours(0,0,0,0);
          const future = list.filter(h => { const d = new Date(h.date + 'T00:00:00'); return d >= today; })
                             .sort((a,b) => a.date < b.date ? -1 : 1);
          if (!future.length){ $('holidayList').innerHTML = '<li>今年剩余时间暂无公休日</li>'; return; }
          $('holidayList').innerHTML = future.map(h => {
            const zh = cnName(h);
            const en = h.name || '';
            const label = (zh && zh !== en) ? (zh + ' / ' + en) : en;   // 中文 / 英文 双标
            return `<li><span class="hd-date">${h.date.slice(5)}</span> ${esc(label)}</li>`;
          }).join('');
        }).catch(() => { $('holidayList').innerHTML = '<li class="err">公休日加载失败（网络受限）</li>'; });
    }

    // —— 3. 汇率（er-api，CNY 基准；顺序：人民币→该国 / 当地→人民币 / 人民币→美元 / 美元→该国）——
    function renderFX(j, code){
      if (!code || !j.rates || j.rates[code] == null){ $('fxBody').innerHTML = '<span class="err">该国货币暂无汇率</span>'; return; }
      const cnyToCur = j.rates[code];          // 1 人民币 = ? 该国货币
      const cnyToUsd = j.rates.USD;            // 1 人民币 = ? 美元
      const usdToCur = cnyToCur / cnyToUsd;     // 1 美元 = ? 该国货币
      const curToCny = 1 / cnyToCur;           // 1 该国货币 = ? 人民币
      const usdToCny = 1 / cnyToUsd;           // 1 美元 = ? 人民币
      $('fxBody').innerHTML =
        `<div class="row top"><span>1 元(人民币) ≈</span><b>${fmt(cnyToCur)} ${code}</b></div>` +
        `<div class="row"><span>1 ${code} ≈</span><b>${fmt(curToCny)} 元(人民币)</b></div>` +
        `<div class="row"><span>1 美元 ≈</span><b>${fmt(usdToCny)} 元(人民币)</b></div>` +
        `<div class="row"><span>1 美元 ≈</span><b>${fmt(usdToCur)} ${code}</b></div>` +
        `<span class="fx-update">更新：${j.time_last_update_utc}</span>`;
    }
    function loadFX(){
      const code = cur ? cur.code : null;
      if (!code){ $('fxBody').innerHTML = '<span class="err">该国货币暂无汇率</span>'; return; }
      // 当日汇率缓存（localStorage），重复访问秒开、同日内离线可用
      const dayKey = 'fx_' + code;
      try {
        const cached = JSON.parse(localStorage.getItem(dayKey) || 'null');
        const today = new Date().toISOString().slice(0,10);
        if (cached && cached.date === today && cached.j && cached.j.rates){ renderFX(cached.j, code); return; }
      } catch(e){}
      fetch('https://open.er-api.com/v6/latest/CNY')
        .then(r => r.json()).then(j => {
          try { localStorage.setItem(dayKey, JSON.stringify({ date: new Date().toISOString().slice(0,10), j })); } catch(e){}
          renderFX(j, code);
        }).catch(() => { $('fxBody').innerHTML = '<span class="err">汇率加载失败（网络受限）</span>'; });
    }
    function fmt(n){ return (n==null || isNaN(n)) ? '—' : Number(n).toLocaleString('zh-CN', {maximumFractionDigits:4}); }

    // —— 4. 一级/二级行政区域地图 + 首都★ + 机场✈ ——
    let _topo=null, _topo2=null, PROJ=null, FC1=null, _svg=null, _gProv=null, _gAdm2=null, _gMark=null, _gCust=null, _custEls=[], _custVisible=true, _CUST_R=3.8, _hlIds=new Set(), _multiTrack=false, showAdm2=false, _adm2Loading=false, _adm2Promise=null, _features=null, _path=null, _markEls=[], _provFill=[], _provLine=[], _adm1Total=0, _adm2Paths=[], _pendingHl = (_urlHl != null && _urlHl !== '') ? parseInt(_urlHl, 10) : null;
    // 懒加载名单（方案 A）：这些大国 ADM2 体量大，进图不预载，点击"显示二级行政区域"时才拉（IndexedDB 缓存，二次秒开）
    const LAZY_ADM2 = new Set(['ru', 'au']);
    let _adm2Lazy = LAZY_ADM2.has(iso2);   // 当前国是否启用懒加载
    let _zoom = null;  // 地图 zoom 行为（renderProvinces 内赋值），供点击客户检索行时自动放大定位到一级区域
  let _gEmboss = null, _curK = 1, _curT = null;  // 3D 浮雕层引用与当前缩放比（浮雕高度随缩放反比，保持屏幕高度恒定）；_curT 同处声明，避免泄漏到 window 全局（非严格模式下静默成全局变量，一旦加 'use strict' 即崩）
  let _hoverRegion = null;        // 悬停(瞬时)区域 {feature,type,name} 或 null
  let _staticLock = false;        // 静态锁图：默认关闭。开启 → 禁用悬停高亮/3D浮雕 + 锁住地图(无滚轮缩放/拖拽)
  let _hideUnselected = false;   // 隐藏未选客户：默认关闭。开启 → 仅显示已选中(绿点)客户，隐藏其余所有黄点
  let _routeOn = false;          // 路线规划：默认关闭。开启 → 在可见客户点间以虚线连成一条「闭合最短」路线（Closed TSP）
  let _gRoute = null;            // 路线图层（置于 zoom 组 g 内、客户点之下，随地图同步变换）
  let _gDepot = null, _depotInner = null;  // 路线起点红旗图层 / 内部缩放抵消组
  let _depot = null;             // 用户选取的路线出发点 {geo:[lng,lat]}
  let _selectDepotMode = false;  // 是否正在“选取计划位置”
  let _routePts = [];            // 当前参与路线的客户点（_custEls 元素快照）
  let _routeOrder = [];         // 闭合访问顺序（_routePts 下标数组；含 depot 时 depot 在顺序中排首位/末位）
  let _routeMode = 'ring';      // 路线排序方式：'ring'=逆时针环形（默认）；'tsp'=最短闭合路径
  let _routeListOpen = false;   // 路线规划清单弹窗是否打开
  let _routeSig = null;         // 可见点集签名：点集不变则复用已算顺序，避免每次选中都重跑 TSP（防卡）
  let _lastAdm2Feat = null, _lastAdm2Prov = null;   // ADM2 悬停省归属缓存：仅要素改变时重算 provinceAt
  let _saveT = null;              // 单点模式：点击客户行前的地图 transform（取消选中时恢复，相当于"返回"）
  let _embossRegions = new Map(); // 选中(持久)区域浮雕：key = source|type|name -> {feature,type,name,source}
    const CAP = facts ? {lat:facts.lat, lng:facts.lng, name:facts.capital} : null;
    const AIR = META.AIRPORTS[iso2] || null;

    // 地图说明：统一使用“一级行政区域 / 二级行政区域”表述，不硬编码省/州/市/区
    function setStatus(adm2N){
      const adm1N = _adm1Total || (_features ? _features.length : 0);
      let adm2Str;
      if (typeof adm2N === 'number') adm2Str = adm2N + ' 个';
      else if (adm2N === 'loading') adm2Str = '加载中…';
      else adm2Str = '暂无';
      $('mapStatus').textContent = `该国家有 ${adm1N} 个一级行政区域，${adm2Str}二级行政区域，数据来源 geoBoundaries (CC0)`;
    }

    // 美国海外领地（偏远小岛）：从主体中分离，单独放进右下角小窗（参照中国南海诸岛做法）
    const US_INSULAR = new Set(["Puerto Rico","American Samoa","United States Virgin Islands","Guam","Commonwealth of the Northern Mariana Islands"]);
    function adm1Name(f){ return (f && f.properties && (f.properties.shapeName || f.properties.name)) || ''; }
    function renderProvinces(src){
      _adm2BuildGen++;            // 取消进行中的 ADM2 分帧构建（新 svg 已重建 _gAdm2）
      _adm2ProjKey = null; _adm2Building = false; _adm2BuiltKey = null;   // 投影随尺寸可能变化 → 失效缓存，下次构建重算（含 LOD 带）
      _hoverRegion = null; _embossRegions = new Map();   // 重绘前清空浮雕选中，避免引用过期 feature
      const map = $('map');
      const W = map.clientWidth || 800, H = map.clientHeight || 480;
      const objName = Object.keys(_topo.objects)[0];
      FC1 = topojson.feature(_topo, _topo.objects[objName]);
      const allFeatures = FC1.features;
      _adm1Total = allFeatures.length;
      // 分离主体与偏远海外领地：海外领地单独进小窗，主体只含本土一级区域
      const insular = allFeatures.filter(f => US_INSULAR.has(adm1Name(f)));
      const mainFeatures = allFeatures.filter(f => !US_INSULAR.has(adm1Name(f)));
      _features = mainFeatures;
      const ib = $('inset'); if (ib) ib.style.display = 'none';
      const features = mainFeatures;
      setStatus('loading');
      const svg = d3.select('#map').append('svg').attr('width', W).attr('height', H);
      _svg = svg;
      // 浮雕/渐变定义 + 每个省(ADM1)独立裁剪区：使二级行政区域严格落在所属省轮廓内，不越界交叉
      const defs = svg.append('defs');
      const gCap = defs.append('radialGradient').attr('id','gradCap').attr('cx','38%').attr('cy','32%').attr('r','72%');
      gCap.append('stop').attr('offset','0%').attr('stop-color','#fde9a8');
      gCap.append('stop').attr('offset','50%').attr('stop-color','#fbbf24');
      gCap.append('stop').attr('offset','100%').attr('stop-color','#b45309');
      const f = defs.append('filter').attr('id','relief').attr('x','-80%').attr('y','-80%').attr('width','260%').attr('height','260%');
      f.append('feDropShadow').attr('dx',0).attr('dy',1.5).attr('stdDeviation',1.5).attr('flood-color','#000').attr('flood-opacity',0.5).attr('result','d');
      f.append('feGaussianBlur').attr('in','SourceAlpha').attr('stdDeviation',1).attr('result','b');
      const spec = f.append('feSpecularLighting').attr('in','b').attr('surfaceScale',3).attr('specularConstant',0.85).attr('specularExponent',18).attr('lighting-color','#fff').attr('result','s');
      spec.append('feDistantLight').attr('azimuth',225).attr('elevation',50);
      f.append('feComposite').attr('in','s').attr('in2','SourceAlpha').attr('operator','in').attr('result','sc');
      const fm = f.append('feMerge');
      fm.append('feMergeNode').attr('in','d');
      fm.append('feMergeNode').attr('in','sc');
      // 3D 浮雕：地面投影滤镜（仅柔和阴影、不含国形副本 → 无重影）+ 顶面高光渐变
      const embossShadow = defs.append('filter').attr('id','embossShadow').attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
      embossShadow.append('feGaussianBlur').attr('in','SourceAlpha').attr('stdDeviation',4).attr('result','b');
      embossShadow.append('feOffset').attr('in','b').attr('dx',0).attr('dy',6).attr('result','o');
      embossShadow.append('feComponentTransfer').attr('in','o').append('feFuncA').attr('type','linear').attr('slope',0.5);
      embossShadow.append('feMerge').append('feMergeNode').attr('in','o');
      const embossTopGrad = defs.append('linearGradient').attr('id','embossTopGrad').attr('x1','0').attr('y1','0').attr('x2','0').attr('y2','1');
      embossTopGrad.append('stop').attr('offset','0%').attr('stop-color','#7dd3fc');
      embossTopGrad.append('stop').attr('offset','100%').attr('stop-color','#38bdf8');
      defs.append('clipPath').attr('id','admClip');   // 兜底：省并集裁剪
      PROJ = d3.geoMercator().fitExtent([[14,14],[W-14,H-14]], {type:'FeatureCollection', features: mainFeatures});
      const path = d3.geoPath(PROJ);
      _path = path;
      // 兜底裁剪区：国家（省并集），供未匹配到所属省的市区回退使用
      features.forEach((ft) => {
        defs.select('#admClip').append('path').attr('d', path(ft));
      });
      const g = svg.append('g');   // 统一图层：省填充 + 二级行政区域 + 省轮廓 同属一层
      _gProv = g;
      // 1) 省填充（底层，承载 hover 提示）
      const pf = g.selectAll('path.prov-fill').data(features).enter().append('path')
        .attr('d', path).attr('class','prov-fill')
        .on('mousemove', (e,d) => { showTip(e, d.properties.shapeName || d.properties.name || ''); hoverRegion(d, 'adm1'); })
        .on('mouseleave', (e,d) => { hideTip(e,d); unhoverRegion(); })
        .on('click', (e,d) => setRegionFilter('adm1', d.properties.shapeName || d.properties.name, d.properties.shapeName || d.properties.name, e.currentTarget, d));
      _provFill = pf.nodes();
      // 2) 二级行政区域（中间层，按所属一级区域单独裁剪，避免跨区域交叉）
      _gAdm2 = g.append('g');
      // ADM2 点击容差：小行政区（如 Lagos 州各 LGA 在国家视图下仅数像素）被客户绿点/海洋空隙/邻县局部覆盖时，
      // 点其附近也能精准选中；直接命中行政区仍走各自 handler，hover 客户信息不受影响
      // 统一在 svg 层做二级行政区点击判定：用几何包含(isPointInFill)优先选“点击点真实落入的 LGA”，
      // 相邻/重叠区取面积最小者（最具体的小 LGA，更符合用户意图）；直接命中的 adm2 也走此判定以修正 z 序覆盖。
      // 命中 adm2 时 stopPropagation，避免冒泡干扰 ADM1 省面 handler；未命中则放行由 ADM1 处理。
      svg.on('click', (e) => {
        if (_staticLock) return;   // 静态锁图：禁用区域点击(含二级行政区)交互
        if (!showAdm2) return;
        const el = nearestAdm2At(e.clientX, e.clientY);
        if (el){ e.stopPropagation(); const d = el.__data__; setRegionFilter('adm2', d.properties.shapeName || d.properties.name, d.properties.shapeName || d.properties.name, el, d); }
      });
      // 悬停兜底：鼠标落在客户绿点(显示客户信息，优先保留)、海岸线/州界(pointer-events:none 不产生事件)、
      // 或相邻 LGA 几何缝隙(无直接命中的 adm2 path)时，各自 mousemove 不触发 → 这里用几何判定补上最近区域信息。
      svg.on('mousemove', (e) => {
        if (_staticLock) return;   // 静态锁图：禁用悬停兜底(含二级行政区)高亮
        if (!showAdm2) return;
        const t = e.target;
        // 鼠标已在 adm2 path 上 → 交各自 mousemove handler 处理（已显示区域信息）
        if (t && t.matches && t.matches('path.adm2')) return;
        // 鼠标在客户绿点上 → 绿点 handler 显示客户信息，优先保留，不覆盖
        if (t && t.closest && t.closest('g.cust-pt-g')) return;
        // 缝隙/海洋/边界线等无直接命中的位置 → 几何兜底显示最近 adm2 区域信息
        const el = nearestAdm2At(e.clientX, e.clientY);
        if (el){ const d = el.__data__; showTip(e, d.properties.shapeName || d.properties.name || ''); hoverRegion(d, 'adm2'); }
        else { hideTip(e); unhoverRegion(); }
      });
      // 3) 省轮廓（最上层，描边清晰，市区线不压过省界）
      const pl = g.selectAll('path.prov-line').data(features).enter().append('path')
        .attr('d', path).attr('class','prov-line')
        .on('mousemove', (e,d) => { showTip(e, d.properties.shapeName || d.properties.name || ''); hoverRegion(d, 'adm1'); })
        .on('mouseleave', (e,d) => { hideTip(e,d); unhoverRegion(); });
      _provLine = pl.nodes();
      // 二次构建国家轮廓：由一级行政区域(ADM1)并集溶解内部边界，得到国家外边界；
      // 行政区轮廓即为该并集的子集，天然“在”国家轮廓之内（保证不越界）
      let _countryOutlineD = null;
      try {
        const _mg = topojson.merge(_topo, _topo.objects[objName].geometries.filter(g => !US_INSULAR.has(adm1Name(g))));
        _countryOutlineD = path(_mg);
      } catch(e){ _countryOutlineD = null; }
      if (_countryOutlineD){
        g.append('path').attr('d', _countryOutlineD).attr('class','country-outline');
      }
      // 3D 浮雕突出层：悬停一级/二级行政区域时整块「从平面探出」，置于 g 内最上（随缩放同步）
      const gEmboss = g.append('g').attr('class','emboss-layer');
      _gEmboss = gEmboss;
      _gCust = g.append('g').attr('class','cust-layer');  // 客户点图层（顶层）：置于标志层之上，永不被机场/首都图标遮挡；随地图平移/缩放自动同步，绝不会漂移/消失
      _gMark = g.insert('g', '.cust-layer');  // 标志层（机场/首都）置于客户点之下、省图层之上：不遮挡客户点；随 g 变换自动跟随，尺寸由 updateMarkers 反向 scale 恒定屏幕大小
      reapplyRegionSel();
      drawMarkers();
      updateMarkers(d3.zoomIdentity);
      _curT = d3.zoomIdentity;
      const zoom = d3.zoom().scaleExtent([1, 9]).filter((event) => !_staticLock && (!event.ctrlKey || event.type === 'wheel') && !event.button)
        .on('zoom', ev => {
          g.attr('transform', ev.transform);
          updateCustZoom(ev.transform.k);  // 客户点大小/铺开随缩放动态变化；位置随 g 变换自动跟随（不漂移、不消失）
          updateMarkers(ev.transform);
          updateDepotMarker(ev.transform); // 红旗图标恒定屏幕尺寸
          if (_routeOn) drawRoute(ev.transform.k);   // 路线端点随缩放铺开量同步，仅 O(n) 重拼路径，不重算 TSP 顺序（防卡）
          _curK = ev.transform.k; _curT = ev.transform;
          _updateLod();   // LOD 分级：低缩放仅省界，越过阈值/切换 LOD 带才细化市区（渲染期简化，不入库）
        })
        .on('end', () => {
          // 缩放结束后用「当前视图实际坐标」重算 TSP，保证路线与当前看到的点位置最优匹配，消除因 k=3 与当前缩放不一致导致的视觉交叉。
          if (_routeOn) rebuildRoute();
        });
      svg.call(zoom);
      _zoom = zoom;   // 暴露给 highlightCustomer：点击客户行时自动放大定位一级区域
      applyPendingHl();   // 省份地图就绪，若客户也已加载则自动点亮世界地图跳转带来的 hl 行

      // —— 验证钩子（仅暴露只读/驱动接口，完全不影响生产逻辑；供 jsdom 冒烟测试驱动真实 d3.zoom 路径，
      //     绕开 jsdom 无 SVG 布局导致 wheel 事件崩溃 baseVal 的问题）。——
      window.__countryDebug = {
        zoomTo(k, cx, cy){
          cx = (cx == null) ? 600 : cx; cy = (cy == null) ? 400 : cy;
          _curK = k;
          _curT = d3.zoomIdentity.translate(cx, cy).scale(k).translate(-cx, -cy);
          _updateLod();   // 直接驱动真实 LOD/分块逻辑（绕开 jsdom 无 SVG 布局导致 d3.zoom baseVal 崩溃）
          return this;
        },
        updateChunks(){ if (_adm2Chunked) updateChunks(); return this; },
        isChunked(){ return _adm2Chunked; },
        chunksSize(){ return _adm2Chunks ? _adm2Chunks.size : 0; },
        builtSize(){ return _adm2Chunks ? Array.from(_adm2Chunks.values()).filter(s => s.built).length : 0; },
        curK(){ return _curK; },
        // 验证：在指定经纬度直接放置「计划位置」红旗（中国国旗图标），绕开 jsdom 无 SVG 布局无法做地图点击反投影
        placeDepotAt(lng, lat){ _depot = { geo: [lng, lat] }; drawDepotMarker(); return this; },
        // 路线规划清单验证钩子
        routeMode(){ return _routeMode; },
        setRouteMode(m){ setRouteMode(m); return this; },
        openRouteList(){ openRouteList(); return this; },
        routeInfo(){ return { on:_routeOn, mode:_routeMode, pts:_routePts.length, orderLen:_routeOrder.length, hasDepot:!!_depot }; },
        routeCoords(){
          const hasDepot = !!_depot; const k = _curK || 1;
          return _routeOrder.map(idx => {
            if (hasDepot && idx === 0) return PROJ(_depot.geo);
            const m = _routePts[hasDepot ? idx - 1 : idx];
            return routePos(m, k);
          });
        }
      };

      // 国家地图 LOL 小手（DOM 跟随，与世界地图地球完全一致）：规避 CSS 光标拒载 + d3.zoom 拖拽握拳
      (function(){
        const countryCursor = document.createElement('img');
        countryCursor.className = 'country-cursor';
        countryCursor.alt = '';
        countryCursor.src = 'data:image/png;base64,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';
        countryCursor.setAttribute('draggable','false');
        document.body.appendChild(countryCursor);
        const _mapEl = document.getElementById('map');
        const _setGrab = () => { countryCursor.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAGhUlEQVR42q2WbVBcVxnH/+ece+++L7DssiwsGwgsAiZpSFJawBZsTB1TzGQMTNDp2NF2Oo5OFV/GmTpOGbU6+WC1M2rVj9G2qVM7xjGptRlFIuSFwCRhCeElIQUKZIFc2Le7e+/uuccPWVrKRM0Hn5ln7pkz95zf+Z95Xg7woVEA9rxvnvu/mgvAjwE6zGTrMKB8p7e3TcqDWP4fkh9v9fs+DCWE/JQC4vDBWv7yz58Ruz7mFQB+2NfXuwFTNoCUEjBK734ZASH3qTwYhA3AZb/Xmnv9V21aZuaLxtlXHzHKS5wCIC8+91yNhRGAMQnBcLgcwDYAIQAVAKoA+O6yIOdV39NYPA4KoGNb/fba99OFmLw2J3+p5wBIYo33Dy62j0YyBXrWtArBPxVX1d6mBu8Xyny+TkUkuw7sr+6eXtQed1gxncuJeSGgAOD3BOWv5SuMIhAI+oRRvJ3NX7tJO3YzKpjMzw5Hm8uL5KPd3S0HG6uKtvUcLS7/em9PsLUBwZYaURZdRTgyqbYHfNJwUjNn88rMe4EoIeRwMq7VegMeo/Hxh+SRN95FZi1GODeJ3cJyT7a6zZ+8/Kx56KkOzmJj/OrYLCdaikdvzvDPPOQwVlez/pHpzH6fT+5/4gkzOj4OeasyBoDLsjxuCrNpfT1T4fR69LrmsHRuaAX1lQ3khWM/ox5Xgp55600qmCYd/32EHX/lPPOX2lldY5jF1pfkzs8WZRKxnPf8qGb7eFfD6a72lVx/PygAsRlETNNcAjBgpDONN0auVxKrg4f27KZHvvwNhMsFiVx+l/QeGyIjfWNQ72TR1rYdAhz2IgcKK4KwlxSzg63e3Oq6Xnvit7OF/f3iHABjqyIAkABEFZcykNVzO+cn5qpEJpGz1pTRoVNv4DfHTsNR4IbDYYXLLiHglbGvuQ7MJiMdSyOl2YnT6yJ1dRZ5/Eb64YXF5AVJIpOmCbahagNkAlC4wZcdDse8YWSPSDar4vFJ5uxqjubiSYTcOuaiBmBy7Kj3orS8CI7CQoRCIVy5eg1r0RjxGDE9MrauXJ/PSMEg/h6LQcvnmNic9QAADv6IMEWn0yKZgdIC6qsuI0pCxeL0EiijsNskFLglzM8uY2U5jph6BzarA+4CNzx+xuMpkw1cUqfXYu6/EKKn83sLugnEAXhA5U6f30WD1RX84e6n6e3LM7j8t1H4SlwgIChwyQj5nUilcojH47izvIq5uSWMX3kP0VlVuB2CWBRoQNwwzQ8FbC0d3NQNrWpnGJxn8Y/X/4gHP/comj4ZwspqEsmMCbed4uzFJUxMrcPJJKiqgcptpXigsQpTk3fkc2cWREaQFo9HCVHy0ajbUCQKCgpsup7p8pYWhctCPnPgD+9I4cf2oK7ShcXhCAJlLgR8TgxfW4PFwqDFM1hcToNkdZz86w1Ebum0+/PB3MqyXjxxK611dGBwagocAGGb1BC3W2fpNGmJraztq29u0Nuf6qS3zl0hRmKdWCQZ9SEL1FgWVoUiXGFDQuPgJsGlyBrWsiae/94O2GXK1JHVtExI2+BVscBNMbQVJGkaMpLbFjW07NGVaMJV3bobEpi4MHidMF8Zicc4Zq/PwGG3YPJmCgsrBmwK8IkWF174bg28NgW/fmkG2ytlcujThXxoIl2tJvkAAW5vrrYbY0VRlA7DMJ6lwE6XxxmIqUkAEA+0N5LW5lpM/uk0ZMHh9zA8uNuBkgon+s6rINyOpr1BaNoqujqL9Wd6Jix/vhgfRA32sy3BQACYnPPxQCDwjpbO/iutpZeYxHYxQSyHjxzA+6s6QSaOYqtAcZEVg5EMTr29DKQFFIUiYxgI1zjE7HzWOPH2sqym+Jm9Kk5tjTqRd3lpaUk1TeOf33yp60c8x2eaDuwhhkiZM0OD0At9GFsBqNePRDKL2hon2h8twb49xdi515O7OJ3Sv/bipP1GVP8dgG+NAFnpHq1DAMgCsAghxMlf9rsByJLbknvsyafNQz3fF3O3LmFxYgrJhXV0llpQaU8QnVmE02sXb/Xdlk+cnJV0w/zFrl14fnQUKQBU+i/N1wDA/Fkl/h4hNy+cvrTDxo7D6fMjlVRh8BT0VA4xKYsFRYOaNnBxdAbj0/EIgG/3djX0/+DNcSOfqyb5X++JfB30ANgP4KsAHAAxAYApMqjgnBLhECAjhsFfAzBNCOaF+Mh6kPt4vJBNfcX6H9YQAFly98oh8EEv+qAy/BvCeNigyV2WkgAAAABJRU5ErkJggg=='; };
        const _setGrabbing = () => { countryCursor.src = 'data:image/png;base64,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'; };
        function _updatePos(e){ countryCursor.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 1) + 'px)'; }
        window.addEventListener('mousemove', (e) => {
          if (_mapEl) {
            const r = _mapEl.getBoundingClientRect();
            const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
            if (inside) { countryCursor.style.display = 'block'; _updatePos(e); document.body.classList.add('over-map'); }
            else { countryCursor.style.display = 'none'; document.body.classList.remove('over-map'); }
          }
        });
        // d3.zoom 拖拽期间 legacy mousemove 被 pointer-capture 抑制，故在 zoom 事件里用 sourceEvent 兜底同步位置
        const _z0 = zoom.on('zoom');
        zoom.on('zoom', ev => {
          if (_z0) _z0(ev);
          const se = ev.sourceEvent;
          if (se && typeof se.clientX === 'number' && _mapEl) {
            const r = _mapEl.getBoundingClientRect();
            if (se.clientX >= r.left && se.clientX <= r.right && se.clientY >= r.top && se.clientY <= r.bottom) {
              countryCursor.style.display = 'block'; _updatePos(se); document.body.classList.add('over-map');
            }
          }
        });
        // 按下即握拳：监听范围从 svg 扩到整个地图容器，浮层按钮（二级行政区/客户点/缩放）点击也触发叩击
        // 同时挂 mousedown + pointerdown（覆盖不同浏览器事件模型），确保悬停→点击的握拳反馈必现
        const _grabIfFree = () => { if (!_staticLock) _setGrabbing(); };   // 静态锁图时禁止显示握拳光标（锁定=不可拖拽）
        const _mw = _mapEl.parentElement || document.querySelector('.mapwrap');
        if (_mw) { _mw.addEventListener('mousedown', _grabIfFree, true); _mw.addEventListener('pointerdown', _grabIfFree, true); }
        window.addEventListener('mouseup', _setGrab);
        window.addEventListener('pointerup', _setGrab);
        zoom.on('start', _setGrabbing);
        zoom.on('end', _setGrab);
      })();

      $('zin').onclick = () => { if (_staticLock) return; svg.transition().duration(200).call(zoom.scaleBy, 1.4); };
      $('zout').onclick = () => { if (_staticLock) return; svg.transition().duration(200).call(zoom.scaleBy, 1/1.4); };
      $('zreset').onclick = () => {
        if (_staticLock) return;
        svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
        clearCustomerHighlight();                                       // 重置所有客户黄点 + 行选中
        _embossRegions.clear(); _hoverRegion = null; renderEmboss();    // 清空选中的行政区域 3D 浮雕
        reapplyRegionSel(); applyRegionFilter();                        // 区域筛选随之清空 → 右侧客户检索行同步重置为全部
        _saveT = null;                                                  // 重置地图返回记忆
      };
      $('custtoggle').onclick = function(){
        _custVisible = !_custVisible;
        this.classList.toggle('active', _custVisible);
        this.textContent = _custVisible ? '隐藏客户位点' : '显示客户位点';
        if (_gCust) _gCust.style('display', _custVisible ? null : 'none');
        if (_gRoute) _gRoute.style('display', (_routeOn && _custVisible) ? null : 'none');
        if (!_custVisible){ clearCustomerHighlight(); _embossRemoveBySource('customer'); }
      };
      // [开启/关闭多点追踪]：默认关闭（单点）。开启 → 可同时保留多个客户黄点；关闭 → 点新行即清空上家。
      $('multitrack').onclick = function(){
        _multiTrack = !_multiTrack;
        this.classList.toggle('active', _multiTrack);
        this.textContent = _multiTrack ? '关闭多点追踪' : '开启多点追踪';
        // 由开启 → 关闭：自动重置地图（复位缩放/平移），并清掉开启期遗留的多点黄点 + 多点浮雕，回到单点干净状态
        if (!_multiTrack){
          if (svg && zoom) svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
          clearCustomerHighlight();
          _embossRegions.clear(); _hoverRegion = null; renderEmboss();
          reapplyRegionSel(); applyRegionFilter();
        }
      };
      // [开启/关闭静态锁图]：默认关闭。开启 → 禁用悬停高亮 + 3D浮雕，并锁住地图（无滚轮缩放/拖拽/按钮缩放），冻结当前视图
      $('staticlock').onclick = function(){
        _staticLock = !_staticLock;
        this.classList.toggle('active', _staticLock);
        this.textContent = _staticLock ? '关闭静态锁图' : '开启静态锁图';
        const mapEl = $('map');
        if (mapEl) mapEl.classList.toggle('static-locked', _staticLock);  // CSS：区域 path 置 pointer-events:none → 无悬停高亮/点击
        if (_staticLock){
          _hoverRegion = null; _embossRegions.clear(); renderEmboss();    // 立即清除一切悬停/选中浮雕（光标仍维持 LOL 小手）
        } else {
          renderEmboss();   // 退出锁定：恢复选中区域的浮雕（如有）
        }
      };
      $('hideunsel').onclick = function(){
        _hideUnselected = !_hideUnselected;
        this.classList.toggle('active', _hideUnselected);
        this.textContent = _hideUnselected ? '显示全部客户' : '隐藏未选客户';
        applyHideUnselected();
      };
      // [选取计划位置]：进入选点模式 → 用户在地图上点击任意位置生成一面小红旗，作为路线规划的固定出发点与返回点
      function setSelectDepotMode(active){
        _selectDepotMode = active;
        const btn = $('selectDepot');
        const overlay = $('depotOverlay');
        if (btn){ btn.classList.toggle('active', active); btn.textContent = active ? '放置位置坐标' : (_depot ? '重新选取位置' : '选取计划位置'); }
        if (overlay) overlay.style.display = active ? 'block' : 'none';
      }
      function placeDepot(e){
        if (!_svg || !PROJ) return;
        const overlay = $('depotOverlay'); if (!overlay) return;
        const rect = overlay.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const pt = d3.zoomTransform(_svg.node()).invert([x, y]);
        const [lng, lat] = PROJ.invert(pt);
        if (!isFinite(lng) || !isFinite(lat)) return;
        _depot = { geo: [lng, lat] };
        drawDepotMarker();
        setSelectDepotMode(false);
        if (_routeOn) rebuildRoute();
      }
      if ($('selectDepot')) $('selectDepot').onclick = function(){
        // 当前显示「重新选取位置」(已选过点) → 点击先做重置：当前红旗消失，再进入选点模式
        const reselect = !_selectDepotMode && _depot;
        if (reselect){
          _depot = null;            // 重置：清除出发点，红旗消失
          drawDepotMarker();
          if (_routeOn) rebuildRoute();   // 路线去掉出发点节点（若开启）
        }
        setSelectDepotMode(!_selectDepotMode);
      };
      if ($('depotOverlay')) $('depotOverlay').onclick = placeDepot;
      // [开启/关闭路线规划]：默认关闭。开启 → 按可见客户点 + 红旗（如有）的实际位置，用虚线连成一条闭合最短路线（TSP）
      $('routeplan').onclick = function(){
        _routeOn = !_routeOn;
        this.classList.toggle('active', _routeOn);
        this.textContent = _routeOn ? '关闭路线规划' : '开启路线规划';
        rebuildRoute();   // 重算点集 + 顺序 + 绘制（_gRoute 图层在 rebuildRoute 内自愈，归属当前 zoom 组 g）
        if (_gRoute) _gRoute.style('display', (_routeOn && _custVisible) ? null : 'none');
      };
      // [路线规划清单]：弹出小窗口，按当前路线顺序罗列 起点 → 各客户 → 回到起点
      if ($('routelist')) $('routelist').onclick = function(){ openRouteList(); };
      if ($('routeListClose')) $('routeListClose').onclick = closeRouteList;
      document.querySelectorAll('.rl-mode').forEach(b => { b.onclick = () => setRouteMode(b.dataset.mode); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && _routeListOpen) closeRouteList(); });
      // [返回系统]：回到主系统（新华健康外贸客户管理系统）首页
      $('backSys').onclick = () => { window.location.href = 'index.html'; };
      // ADM2 默认开启时，初次渲染也禁用 ADM1 prov-fill 交互（与 adm2toggle 一致）
      if (showAdm2 && _topo2){ renderAdm2(); _provFill.forEach(n => n.style.pointerEvents = 'none'); }
      if (insular.length) renderInsularInset(insular);
      if (window.__custList) drawCustomerPointsOnMap(window.__custList);  // 省份重绘后重挂客户点
    }

    // —— 3D 浮雕辅助：悬停/选中 一级(ADM1)/二级(ADM2) 行政区域时整块区域「从平面探出」 ——
    // 支持多区域同时浮雕：_hoverRegion(瞬时悬停) + _embossRegions(选中持久，可多区域、可多点追踪累积)
    function lerp(a, b, t){ return Math.round(a + (b - a) * t); }
    function wallColor(t){ const r = lerp(8,14,t), g = lerp(47,116,t), b = lerp(73,178,t); return `rgb(${r},${g},${b})`; }
    // 统一渲染所有需浮雕的区域（悬停 + 选中）。
    // 关键：三个相位「跨全部区域」一次性绘制 —— 先所有地面柔影、再所有侧壁、最后所有顶面 ——
    // 保证多区域选中时所有顶面处于同一高度平面、互不遮挡，绝不出现「一层叠一层」。
    function renderEmboss(){
      if (!_gEmboss || !_path) return;
      if (_staticLock){ _gEmboss.selectAll('*').remove(); return; }  // 静态锁图：强制无浮雕（清除一切悬停/选中浮雕）
      _gEmboss.selectAll('*').remove();
      const k = (_curK && _curK > 0) ? _curK : 1;
      const H = 9 / k;            // 所有区域统一高度（屏幕 ~9px，随缩放反比）
      const LAYERS = 10;
      const sBase = 1.03, sTop = 1.04;
      const regions = [];
      if (_hoverRegion){
        const dup = [..._embossRegions.values()].some(r => r.type === _hoverRegion.type && r.name === _hoverRegion.name);
        if (!dup) regions.push(_hoverRegion);
      }
      _embossRegions.forEach(r => regions.push(r));
      // 无区域：客点落回平面
      if (!regions.length){
        _custEls.forEach(m => { m.lifted = false; m.liftedBase = null; });
        if (_curT){ updateMarkers(_curT); updateCustZoom(_curK || 1); }
        return;
      }
      // 预计算每区域的路径与质心（feature 保留用于客户点 d3.geoContains 判定）
      const items = [];
      regions.forEach(rg => {
        const d = _path(rg.feature); if (!d) return;
        const c = _path.centroid(rg.feature);
        items.push({ feature: rg.feature, d, c });
      });
      // 相位1：所有区域的地面柔影（统一落在平面，互不叠压）
      items.forEach(it => {
        _gEmboss.append('path').attr('class','emboss-shadow').attr('d', it.d)
          .attr('transform', `translate(${it.c[0]},${it.c[1]}) scale(${sBase}) translate(${-it.c[0]},${-it.c[1]})`);
      });
      // 相位2：所有区域的侧壁厚度（从平面逐层抬升到统一高度 H）
      for (let i = 0; i <= LAYERS; i++){
        const t = i / LAYERS, y = -H * t;
        items.forEach(it => {
          _gEmboss.append('path').attr('class','emboss-side').attr('d', it.d)
            .attr('transform', `translate(${it.c[0]},${it.c[1]+y}) scale(${sBase}) translate(${-it.c[0]},${-it.c[1]})`)
            .style('fill', wallColor(t)).style('stroke','none');
        });
      }
      // 相位3：所有区域的顶面（黄边高光，最后绘制 → 全部共面、不被其它区域阴影遮挡）
      items.forEach(it => {
        _gEmboss.append('path').attr('class','emboss-top').attr('d', it.d)
          .attr('transform', `translate(${it.c[0]},${it.c[1]-H}) scale(${sTop}) translate(${-it.c[0]},${-it.c[1]})`);
      });
      // 客户点抬升：先统一复位(仅属性赋值，零 geoContains)，再【仅测落在该区域自己的客户】
      // （按 assignRegions 预分组的 __adm2 → _adm2CustMap），彻底去掉逐区域对全部客户的 geoContains（零精度损失）
      _custEls.forEach(m => { m.lifted = false; m.liftedBase = null; });
      items.forEach(it => {
        const nm = it.feature.properties ? (it.feature.properties.shapeName || it.feature.properties.name) : null;
        const list = (_adm2CustMap && nm) ? (_adm2CustMap.get(nm) || []) : _custEls;
        list.forEach(m => {
          const rec = m.rec;
          if (rec && rec.lng != null && rec.lat != null && d3.geoContains(it.feature, [+rec.lng, +rec.lat])){
            m.lifted = true;
            m.liftedBase = [ it.c[0] + sTop*(m.base[0]-it.c[0]), (it.c[1]-H) + sTop*(m.base[1]-it.c[1]) ];
          }
        });
      });
      if (_curT){ updateMarkers(_curT); updateCustZoom(_curK || 1); }
    }
    // 瞬时悬停：设置悬停区域并刷新（选中区域仍保留）
    let _embossTimer = 0;
    function scheduleEmboss(){   // 快速划过多个二级区域 → 重置计时器，仅在“停下 ~60ms”后才重建 3D 浮雕；扫动中绝不每帧重建（消除 paint 卡顿，零精度损失，仅延迟出现浮雕）
      if (_embossTimer) clearTimeout(_embossTimer);
      _embossTimer = setTimeout(() => { _embossTimer = 0; renderEmboss(); }, 60);
    }
    function hoverRegion(d, type){
      if (_staticLock) return;   // 静态锁图：禁用悬停高亮/浮雕
      const name = (d.properties && (d.properties.shapeName || d.properties.name)) || '';
      // 仅当悬停区域(类型+名称)改变时才重建 3D 浮雕；否则每像素 mousemove 都重画 13+ 路径 +
      // 对全部客户点 d3.geoContains 判定（客户多时极卡），这是国家地图悬停卡顿根因。
      if (_hoverRegion && _hoverRegion.type === type && _hoverRegion.name === name) return;
      _hoverRegion = { feature: d, type, name };
      scheduleEmboss();
    }
    function unhoverRegion(){ if (_staticLock || !_hoverRegion) return; _hoverRegion = null; scheduleEmboss(); }
    function findAdm1Feature(name){
      if (!_features || !name) return null;
      return _features.find(f => (f.properties.shapeName || f.properties.name) === name) || null;
    }
    function findAdm2Feature(name){
      if (!name) return null;
      let found = null;
      if (_gAdm2) _gAdm2.selectAll('path.adm2').each(function(){ if (!found){ const d = this.__data__; const n = d ? (d.properties.shapeName || d.properties.name) : ''; if (n === name) found = d; } });
      return found;
    }
    // 选中区域浮雕：source = 'region'(手动点击区域) / 'customer'(点击客户行联动)
    // 多点追踪开启 → 同 key 再点切换(增/删)，可累积多区域；关闭 → 移除同 source 其它项，仅保留当前(单点替换)
    function _embossAddOrToggle(type, name, feature, source){
      if (!feature) return;
      const key = source + '|' + type + '|' + name;
      if (_multiTrack){
        if (_embossRegions.has(key)) _embossRegions.delete(key);
        else _embossRegions.set(key, { feature, type, name, source });
      } else {
        const sameSelected = _embossRegions.has(key) && _embossRegions.get(key).source === source;
        for (const [k2, v] of [..._embossRegions]){ if (v.source === source && k2 !== key) _embossRegions.delete(k2); }
        if (sameSelected) _embossRegions.delete(key);
        else _embossRegions.set(key, { feature, type, name, source });
      }
      renderEmboss();
    }
    function _embossRemoveBySource(source){
      let removed = false;
      for (const [k, v] of [..._embossRegions]){ if (v.source === source){ _embossRegions.delete(k); removed = true; } }
      if (removed) renderEmboss();
    }
    // 当前选中的「行政区域」集合（source==='region'），单点为一个、多点追踪为多个 —— 客户表筛选/描边/标签统一由此派生
    function _selectedRegions(){ return [..._embossRegions.values()].filter(v => v.source === 'region'); }
    // 由当前黄色客户集合(_hlIds)重建 'customer' 来源的浮雕区域（单点至多一个、多点多个），保持与黄点同步
    function _syncCustomerEmboss(){
      for (const [k, v] of [..._embossRegions]){ if (v.source === 'customer') _embossRegions.delete(k); }
      const list = window.__custList || [];
      const seen = new Set();
      _hlIds.forEach(id => {
        const rec = list.find(x => x.__id === id);
        if (!rec) return;
        const name = rec.__adm1 || rec.__adm2;
        if (!name || seen.has(name)) return;
        seen.add(name);
        const type = rec.__adm1 ? 'adm1' : 'adm2';
        const feat = type === 'adm1' ? findAdm1Feature(name) : findAdm2Feature(name);
        if (feat) _embossRegions.set('customer|' + type + '|' + name, { feature: feat, type, name, source: 'customer' });
      });
      renderEmboss();
    }
    // 偏远海外领地小窗：每个领地用各自投影画在独立小格里并标注名称（参照中国南海诸岛小窗）
    function renderInsularInset(features){
      const box = $('inset');
      if (!box) return;
      box.innerHTML = '';
      box.style.display = 'block';
      const title = document.createElement('div');
      title.className = 'map-inset-title';
      title.textContent = '美国海外领地';
      box.appendChild(title);
      const W = 216, H = 150, pad = 8;
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.setAttribute('class','map-inset-svg');
      box.appendChild(svg);
      const s = d3.select(svg);
      const n = features.length;
      const cols = n <= 3 ? n : 3;
      const rows = Math.ceil(n / cols);
      const cw = W / cols, ch = H / rows;
      features.forEach((feat, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const ox = col * cw, oy = row * ch;
        const proj = d3.geoMercator().fitExtent([[pad, pad+16],[cw-pad, ch-pad-18]], feat);
        const pth = d3.geoPath(proj);
        const g = s.append('g').attr('transform', `translate(${ox},${oy})`);
        g.append('path').attr('d', pth(feat)).attr('class','inset-shape')
          .on('mousemove', (e) => showTip(e, adm1Name(feat)))
          .on('mouseleave', hideTip);
        const nm = adm1Name(feat);
        const words = nm.split(' ');
        const lines = []; let cur = '';
        words.forEach(w => { if ((cur + ' ' + w).trim().length > 15){ if (cur.trim()) lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
        if (cur.trim()) lines.push(cur.trim());
        lines.forEach((ln, k) => {
          g.append('text').attr('class','inset-label')
            .attr('x', cw/2).attr('y', ch - 5 - (lines.length-1-k)*10)
            .text(ln);
        });
      });
    }
    function drawMarkers(){
      if (!_gMark || !PROJ) return;
      _gMark.selectAll('*').remove();
      _markEls = [];
      // 五角星（外半径9，居中原点，机头朝上）
      const STAR = "M0,-9 L2.12,-2.91 L8.56,-2.78 L3.42,1.11 L5.29,7.28 L0,3.6 L-5.29,7.28 L-3.42,1.11 L-8.56,-2.78 L-2.12,-2.91 Z";
      // 飞机（24x24 俯视，机头朝上，rotate(45)后指向东北=东偏北45°）
      const PLANE = "M12 1 L13 9 L22 14 L22 16 L13 13 L13 21 L15 22 L15 23 L12 22 L9 23 L9 22 L11 21 L11 13 L2 16 L2 14 L11 9 Z";
      const capCnName = (window.CAPITAL_CN && window.CAPITAL_CN[iso2]) || null;
      let pCap = null;
      if (CAP && CAP.lat != null){
        pCap = PROJ([CAP.lng, CAP.lat]);
        // outer：定位到投影坐标（k=1）；g 的缩放变换负责平移/缩放位置；
        // inner：反向 scale(1/k) 抵消 g 的缩放，使图标/标签保持恒定屏幕尺寸（不随放大变大）
        const outer = _gMark.append('g').attr('transform', `translate(${pCap[0]},${pCap[1]})`);
        const inner = outer.append('g');
        inner.append('g').attr('class','marker-cap-star').attr('transform','scale(0.95)').attr('filter','url(#relief)')
          .append('path').attr('d', STAR).attr('fill','url(#gradCap)').attr('stroke','#7c4a03').attr('stroke-width','0.8');
        inner.append('text').attr('class','marker-label').attr('x',0).attr('y',-12).text(capCnName || (CAP.name||'首都'));
        _markEls.push({ el: outer, inner, base: pCap });
      }
      if (AIR && AIR.lat != null){
        let p = PROJ([AIR.lon, AIR.lat]);
        // 与首都标志做防重叠错位：两者过近时把机场标志沿径向外推到安全间距
        if (pCap){
          const dx = p[0]-pCap[0], dy = p[1]-pCap[1], dist = Math.hypot(dx,dy), SEP = 22;
          if (dist < SEP){
            let ux, uy;
            if (dist < 0.01){ ux = 0.7071; uy = -0.7071; } else { ux = dx/dist; uy = dy/dist; }
            p = [pCap[0] + ux*SEP, pCap[1] + uy*SEP];
          }
        }
        const outer = _gMark.append('g').attr('class','marker-plane-g').attr('transform', `translate(${p[0]},${p[1]})`);
        const inner = outer.append('g');
        inner.append('g').attr('transform','scale(0.8) rotate(45) translate(-12,-12)').attr('filter','url(#relief)')
          .append('path').attr('d', PLANE).attr('fill','#38bdf8').attr('stroke','#075985').attr('stroke-width','0.9');
        const cnName = AIR.cn || ((META.ISO2_TO_CN[iso2] || '') + (facts && facts.capital ? ' · ' + facts.capital : ''));
        const label = inner.append('text').attr('class','marker-air-label').attr('x',0).attr('y',-14);
        label.append('tspan').attr('x',0).attr('dy',0).text((AIR.iata ? AIR.iata + ' ' : '') + (AIR.name || '机场'));
        label.append('tspan').attr('class','cn').attr('x',0).attr('dy',13).text(cnName);
        outer.on('mouseenter', () => label.style('display','block'))
             .on('mouseleave', () => label.style('display','none'));
        _markEls.push({ el: outer, inner, base: p });
      }
    }
    // 缩放时：标志图标随 g 变换自动平移（outer 已固定在地理坐标，g 负责位置），
    // 仅用 inner 反向 scale(1/k) 抵消 g 的放大，保持图标/标签恒定屏幕尺寸（不随放大变大、且位于客户点下层不遮挡）
    function updateMarkers(t){
      if (!_gMark) return;
      const s = 1 / t.k;
      _markEls.forEach(m => { if (m.inner) m.inner.attr('transform', `scale(${s})`); });
    }
    function provinceAt(lonlat){
      if (!FC1) return null;
      for (const f of FC1.features){ try { if (d3.geoContains(f, lonlat)) return f.properties.shapeName || f.properties.name; } catch(e){} }
      return null;
    }
    // —— ADM2 二级行政区域：增量构建 + 分帧渲染 + 缓存（消除“开启二级区域”瞬时卡顿，零精度/细节损失）——
    // 根因：原 renderAdm2 在点击瞬间同步投影 774 个市区 + 算每个市区所属省(pi：geoCentroid/geoContains 兜底) + 创建 774 个 <path>，
    //       全部挤在单击 handler 的单帧里 → 主线程冻结数百毫秒，表现为卡顿；且每次开启都重算。
    // 修复：① 投影按“投影签名(W×H)”失效，仅在窗口尺寸变化(投影变)时重算；② 774 个 path 分帧(rAF)批量创建，单帧 ≤16ms 不卡；
    //       ③ 首次构建后隐藏只切 display:none 保留 DOM，再次开启瞬时显示；④ 进图后在浏览器空闲(requestIdleCallback)预构建隐藏层，首次点击即开即显。
    let _adm2Fc = null, _adm2ProjKey = null, _adm2BuildGen = 0, _adm2Building = false, _adm2CustMap = null;
    // —— B 级 LOD 分级（仅大体量国，如 mx=2457 市区）：低缩放只显示省界，放大越过阈值才细化市区 ——
    // 简化轮廓在渲染期派生（Douglas-Peucker，容差 = 恒定屏幕误差 / k），绝不入库/改 _topo2，守住“数据保真”铁律。
    let _lodAdm2 = false;            // 当前国是否启用 LOD（ADM2 市区数 > 800 自动启用，按国独立，不牵连他国）
    const _lodZoom = 2.2;           // 放大到此倍率才显示二级行政区域（低缩放仅省界）
    let _adm2BuiltKey = null;       // 已构建层对应的“投影签名|LOD带”键；LOD 带变化即视为需重建
    function _lodBand(k){ if (!_lodAdm2 || k < _lodZoom) return 0; const bands = [3, 4.5, 6.5, 9]; let b = 1; for (const t of bands) if (k >= t) b++; return b; }
    function adm2BuiltKey(){ return adm2ProjKey() + '|' + (_lodAdm2 ? ('lod' + _lodBand(_curK || 1)) : 'full'); }
    // —— C 级矢量瓦片式分块（仅大体量国，如 mx=2457 市区）：整文件不进图，放大到某州才拉该州细节 ——
    // 三层铁律：每国独立(仅 _CHUNKED_ISO，不牵连他国) / 互不污染(州→chunk 一对一映射、州独立卸载) / 数据层保真(chunk 为源数据无损子集，简化仅渲染期派生)。
    const _CHUNKED_ISO = new Set(['mx']);   // 启用分块的国家 ISO2（按需扩展；改数据务必同步生成对应 chunk）
    const _ADM2_CHUNK_VER = '202607271300'; // 分块数据版本戳（与 gen_mx_chunks.js VER 对应）；改动 chunk 数据时 bump
    let _adm2Chunked = false;     // 当前国是否启用矢量瓦片式分块
    let _adm2Index = null;        // 分块索引 {iso2, version, states:[{slug,iso,name,count}]}
    let _stateSlugByName = null;  // ADM1 shapeName -> chunk slug（运行时 join）
    let _stateSlugByIdx = null;   // ADM1 要素下标 -> chunk slug
    let _stateLocalBounds = null; // ADM1 要素屏幕包围盒缓存（投影签名失效时重算）
    let _adm2Chunks = null;       // slug -> {fc, gNode, built, band, loading, pi}
    let _chunkProjKey = null;     // 分块构建对应的投影签名（变化→重建 clip+所有州）
    let _clipBuilt = false;       // clip-path 是否已构建
    const _CHUNK_FETCH_MAX = 4;   // 并发拉取 chunk 上限
    let _fetchInflight = 0; const _fetchWaiters = [];
    // —— 渲染期轮廓简化：解析 d3.geoPath 输出的屏幕坐标 path，逐环 Douglas-Peucker 抽稀（容差=恒定屏幕误差/k）——
    function _parsePts(body){
      const nums = (body.replace(/L/gi, ' ').match(/-?\d*\.?\d+(?:[eE]-?\d+)?/g) || []).map(Number);
      const pts = []; for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]); return pts;
    }
    function _dpPts(pts, eps){
      const n = pts.length; if (n < 3) return pts;
      const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1;
      const stack = [[0, n - 1]];
      while (stack.length){
        const [s, e] = stack.pop();
        let maxD = -1, idx = -1;
        const [x1, y1] = pts[s], [x2, y2] = pts[e];
        const dx = x2 - x1, dy = y2 - y1; const len2 = dx * dx + dy * dy;
        for (let i = s + 1; i < e; i++){
          const [x0, y0] = pts[i]; let d;
          if (len2 === 0) d = Math.hypot(x0 - x1, y0 - y1);
          else { const t = ((x0 - x1) * dx + (y0 - y1) * dy) / len2; const tt = t < 0 ? 0 : (t > 1 ? 1 : t); const px = x1 + tt * dx, py = y1 + tt * dy; d = Math.hypot(x0 - px, y0 - py); }
          if (d > maxD){ maxD = d; idx = i; }
        }
        if (maxD > eps && idx > 0){ keep[idx] = 1; stack.push([s, idx]); stack.push([idx, e]); }
      }
      const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(pts[i]); return out;
    }
    function _simplifyPathD(d, tolPx){
      if (!tolPx || tolPx <= 0) return d;
      const re = /M([^MZ]*)Z/gi; let out = '', mm;
      while ((mm = re.exec(d))){
        const pts = _parsePts(mm[1]); if (!pts.length) continue;
        const s = _dpPts(pts, tolPx);
        out += 'M' + s[0][0].toFixed(1) + ',' + s[0][1].toFixed(1);
        for (let i = 1; i < s.length; i++) out += 'L' + s[i][0].toFixed(1) + ',' + s[i][1].toFixed(1);
        out += 'Z';
      }
      return out || d;
    }
    const _adm2CH = 15;   // 每帧构建的市区数（≈单帧 <16ms，保证不卡顿）
    const _requestIdle = (window.requestIdleCallback ? (cb)=>requestIdleCallback(cb,{timeout:2500}) : (cb)=>setTimeout(cb, 300));
    function adm2ProjKey(){ const m = $('map'); return (m ? m.clientWidth : 0) + 'x' + (m ? m.clientHeight : 0); }
    function adm2IsBuilt(){ return _gAdm2 && _gAdm2.selectAll('path.adm2').size() > 0 && _adm2ProjKey === adm2ProjKey() && _adm2BuiltKey === adm2BuiltKey(); }
    function buildAdm2ClipPaths(){
      const defs = _svg.select('defs');
      defs.selectAll('[id^="clip-"]').remove();   // 清旧的对省裁剪区，避免重复 ID
      _features.forEach((ft, pi) => {
        const cp = defs.append('clipPath').attr('id', 'clip-' + pi);
        cp.append('path').attr('d', _path(ft));   // 真实一级区域边界（屏幕坐标，与二级区域同坐标系）
      });
    }
    function buildAdm2LayerChunked(hidden){
      if (!_topo2 || !_gAdm2 || !PROJ) return;
      if (!_adm2Fc){ _adm2Fc = (_topo2.type === 'Topology') ? topojson.feature(_topo2, _topo2.objects[Object.keys(_topo2.objects)[0]]) : _topo2; }
      _adm2ProjKey = adm2ProjKey();
      buildAdm2ClipPaths();
      _gAdm2.selectAll('*').remove();
      _gAdm2.style('display', hidden ? 'none' : null);   // 预构建隐藏：第一帧起就隐藏，杜绝加载时“闪一下显示又隐藏”
      const gen = ++_adm2BuildGen; _adm2Building = true;
      const _adm2Tol = _lodAdm2 ? Math.min(3.5, Math.max(0.4, 2.2 / (_curK || 1))) : 0;  // 渲染期简化容差=恒定屏幕误差/k（不入库）
      const total = _adm2Fc.features.length; let i = 0;
      const CH = _lodAdm2 ? 40 : _adm2CH;   // LOD 大体量国加大每帧批量，缩短分帧构建时长
      function step(){
        if (gen !== _adm2BuildGen) return;   // 被新构建/隐藏取消
        const end = Math.min(i + CH, total);
        for (; i < end; i++){
          const feat = _adm2Fc.features[i];
          let pi = -1;
          const grp = feat.properties.shapeGroup || feat.properties.parent || null;
          if (grp && _features){ const idx = _features.findIndex(p => (p.properties.shapeName || p.properties.name) === grp); if (idx >= 0) pi = idx; }
          if (pi < 0 && _features){ let c = null; try { c = d3.geoCentroid(feat); } catch(e){} if (c){ for (let j = 0; j < _features.length; j++){ try { if (d3.geoContains(_features[j], c)){ pi = j; break; } } catch(e){} } } }
          feat.__pi = pi;   // 缓存所属省索引，悬停时直接读，免质心+geoContains（零精度损失）
          const clip = (pi >= 0) ? 'url(#clip-' + pi + ')' : 'url(#admClip)';
          _gAdm2.append('path')
            .datum(feat).attr('d', _lodAdm2 ? _simplifyPathD(_path(feat), _adm2Tol) : _path(feat)).attr('class','adm2').attr('clip-path', clip)
            .on('mousemove', (e,d) => {
              // 单市区归属唯一 ADM1：构建时已缓存省索引(__pi)，悬停直接读，免质心+geoContains（零精度损失）
              if (d !== _lastAdm2Feat){
                _lastAdm2Feat = d;
                _lastAdm2Prov = (d.__pi != null && _features[d.__pi]) ? (_features[d.__pi].properties.shapeName || _features[d.__pi].properties.name) : null;
              }
              const city = d.properties.shapeName || d.properties.name || '未命名市区';
              showTip(e, city + (_lastAdm2Prov ? ' / ' + _lastAdm2Prov : ''));
              hoverRegion(d, 'adm2');
            })
            .on('mouseleave', (e,d) => { hideTip(e,d); unhoverRegion(); });
        }
        if (i < total){ setStatus('二级行政区域绘制中… ' + Math.round(i / total * 100) + '%'); (window.requestAnimationFrame || setTimeout)(step, 0); }
        else {
          _adm2Building = false;
          _adm2BuiltKey = adm2BuiltKey();   // 记录本次构建对应的“投影签名|LOD带”，跨带即视为需重建
          if (_gAdm2) _adm2Paths = _gAdm2.selectAll('path.adm2').nodes();  // 缓存用于悬停/点击兜底，免每次遍历 querySelectorAll
          setStatus(total);
          reapplyRegionSel();
          _gAdm2.style('display', (hidden || !showAdm2) ? 'none' : null);   // 预构建隐藏；开启则显示
        }
      }
      step();
    }
    function renderAdm2(){
      if (_adm2Chunked){ updateChunks(); return; }   // 矢量瓦片式分块：委托视口驱动的分块加载/构建
      if (!_topo2 || !_gAdm2 || !PROJ) return;
      // LOD 大体量国：阈值以下不构建二级区域（仅显示省界），避免低缩放渲染 2457 条精细 path 卡顿
      if (_lodAdm2 && (_curK || 1) < _lodZoom){ _gAdm2.style('display', 'none'); return; }
      if (adm2IsBuilt()){ _gAdm2.style('display', null); return; }   // 已构建且投影/LOD带未变 → 仅显示，瞬时（零重建）
      buildAdm2LayerChunked(false);   // 首次/投影变化/跨 LOD 带 → 分帧构建并显示
    }
    // 缩放时驱动 LOD：低于阈值仅省界；越过阈值或切换 LOD 带才重建（渲染期简化，不入库）。跨带重建有上限（4 带），自节流。
    function _updateLod(){
      if (_adm2Chunked){ updateChunks(); return; }   // 分块国：缩放即重算可见州并卸载离屏州
      if (!_lodAdm2 || !showAdm2 || !_gAdm2) return;
      const k = _curK || 1;
      if (k < _lodZoom){ _gAdm2.style('display', 'none'); return; }   // 阈值以下：隐藏二级区域层（仅省界可见）
      const key = adm2BuiltKey();
      if (_adm2BuiltKey !== key){            // 进入阈值 或 切换 LOD 带 → 重建（渲染期简化派生，源数据不动）
        _adm2BuildGen++;                     // 取消可能进行中的分帧构建，避免叠加
        _gAdm2.style('display', null);
        buildAdm2LayerChunked(false);
      } else {
        _gAdm2.style('display', null);
      }
    }
    // —— 矢量瓦片式分块：拉取限流（最多 _CHUNK_FETCH_MAX 并发，避免一次放大拉爆网络）——
    function _chunkFetch(url){
      return new Promise((resolve, reject) => {
        const run = () => {
          if (_fetchInflight >= _CHUNK_FETCH_MAX){ _fetchWaiters.push(run); return; }
          _fetchInflight++;
          fetchCached(url).then(d => { _fetchInflight--; resolve(d); const w = _fetchWaiters.shift(); if (w) w(); },
                                e => { _fetchInflight--; reject(e); const w = _fetchWaiters.shift(); if (w) w(); });
        };
        run();
      });
    }
    // 放大越过阈值时：按视口裁剪可见州 → 懒加载/构建可见州 chunk → 离屏卸载 DOM（数据保留，便于再次进入秒显）
    function updateChunks(){
      if (!_adm2Chunked || !showAdm2 || !_gAdm2 || !PROJ || !_features) return;
      const k = _curK || 1;
      if (k < _lodZoom){ _gAdm2.style('display', 'none'); const ms = $('mapStatus'); if (ms) ms.textContent = '二级行政区域已开启 · 放大地图以查看市区'; return; }
      _gAdm2.style('display', null);
      const mEl = $('map'); const W = mEl ? mEl.clientWidth : 0, H = mEl ? mEl.clientHeight : 0;
      const t = _curT || d3.zoomIdentity;
      // 投影签名变化（窗口尺寸/投影改变）→ 重建 clip + 所有已建州 paths
      const pk = adm2ProjKey();
      if (_chunkProjKey !== pk || !_clipBuilt){
        _chunkProjKey = pk;
        _stateLocalBounds = _features.map(f => _path.bounds(f));
        buildAdm2ClipPaths(); _clipBuilt = true;
        _adm2Chunks.forEach(st => { if (st.gNode){ st.gNode.remove(); st.gNode = null; } st.built = false; });
      }
      const band = _lodBand(k);
      const tol = Math.min(3.5, Math.max(0.4, 2.2 / k));   // 渲染期简化容差=恒定屏幕误差/k（不入库）
      // 1) 计算可见州（州屏幕包围盒与视口相交）
      const vis = new Set();
      for (let pi = 0; pi < _features.length; pi++){
        const b = _stateLocalBounds[pi]; if (!b) continue;
        const x0 = b[0][0]*k + t.x, y0 = b[0][1]*k + t.y, x1 = b[1][0]*k + t.x, y1 = b[1][1]*k + t.y;
        if (x1 >= 0 && x0 <= W && y1 >= 0 && y0 <= H) vis.add(_stateSlugByIdx[pi]);
      }
      // 2) 卸载离屏州 DOM（数据保留，再次进入秒显）
      _adm2Chunks.forEach((st, slug) => { if (!vis.has(slug) && st.built && st.gNode){ st.gNode.remove(); st.gNode = null; st.built = false; } });
      // 3) 加载/构建可见州
      vis.forEach(slug => ensureStateChunk(slug, k, band, tol));
    }
    function ensureStateChunk(slug, k, band, tol){
      let st = _adm2Chunks.get(slug);
      if (!st){ st = { fc:null, gNode:null, built:false, band:0, loading:null, pi:-1 }; _adm2Chunks.set(slug, st); }
      if (st.built && st.band === band) return;          // 已构建且 LOD 带未变 → 不重建（防缩放卡顿）
      if (st.loading) return;                             // 拉取中 → 完成后回调构建
      if (st.fc){ st.pi = _stateSlugByIdx.indexOf(slug); buildStatePaths(slug, st, tol); return; }
      st.loading = _chunkFetch(`provinces/${iso2}_adm2_${slug}.min.json?v=${_ADM2_CHUNK_VER}`).then(chunk => {
        st.loading = null;
        const fc = (chunk && chunk.type === 'Topology') ? topojson.feature(chunk, chunk.objects.adm2) : chunk;
        st.fc = fc; st.pi = _stateSlugByIdx.indexOf(slug);
        ensureAdm2CustForState(slug, fc);                 // 增量补全该州客户 ADM2 归属 + 预分组（零精度损失）
        buildStatePaths(slug, st, tol);
      }).catch(e => { st.loading = null; console.warn('[chunk] 加载失败', slug, e && e.message); });
    }
    function buildStatePaths(slug, st, tol){
      if (st.gNode){ st.gNode.remove(); st.gNode = null; }
      const sg = _gAdm2.append('g').attr('class', 'adm2-state').attr('data-slug', slug);
      st.gNode = sg;
      const pi = st.pi;
      const clip = (pi >= 0) ? 'url(#clip-' + pi + ')' : 'url(#admClip)';
      st.fc.features.forEach(feat => {
        feat.__pi = pi;   // 缓存省索引，悬停直接读，免质心+geoContains
        sg.append('path')
          .datum(feat).attr('d', _simplifyPathD(_path(feat), tol)).attr('class', 'adm2').attr('clip-path', clip)
          .on('mousemove', (e, d) => {
            if (d !== _lastAdm2Feat){ _lastAdm2Feat = d; _lastAdm2Prov = (d.__pi != null && _features[d.__pi]) ? (_features[d.__pi].properties.shapeName || _features[d.__pi].properties.name) : null; }
            const city = d.properties.shapeName || d.properties.name || '未命名市区';
            showTip(e, city + (_lastAdm2Prov ? ' / ' + _lastAdm2Prov : ''));
            hoverRegion(d, 'adm2');
          })
          .on('mouseleave', (e, d) => { hideTip(e, d); unhoverRegion(); });
      });
      st.built = true;
      _adm2Paths = _gAdm2.selectAll('path.adm2').nodes();   // 刷新悬停/点击命中缓存
      reapplyRegionSel();
    }
    // 某州 chunk 加载完成后：增量把该州客户关联到 ADM2（geoContains）+ 预分组，避免整文件一次性 geoContains
    function ensureAdm2CustForState(slug, fc){
      if (!_adm2CustMap) _adm2CustMap = new Map();
      const st0 = (_adm2Index && _adm2Index.states) ? _adm2Index.states.find(s => s.slug === slug) : null;
      const stateName = st0 ? st0.name : null;
      _custEls.forEach(m => {
        const r = m.rec; if (!r || r.lat == null) return;
        if (stateName && r.__adm1 !== stateName) return;   // 仅处理该州客户
        if (!r.__adm2){
          const ll = [+r.lng, +r.lat];
          for (const f of fc.features){ try { if (d3.geoContains(f, ll)){ r.__adm2 = f.properties.shapeName || f.properties.name; break; } } catch(e){} }
        }
        if (r.__adm2){
          if (!_adm2CustMap.has(r.__adm2)) _adm2CustMap.set(r.__adm2, []);
          const arr = _adm2CustMap.get(r.__adm2);
          if (!arr.includes(m)) arr.push(m);
        }
      });
    }
    function loadProvinces(){
      (async () => {
        let topo=null, src='';
        try { topo = await fetchCached(`provinces/${iso2}.json`); src='本地缓存'; } catch(e){}
        if (!topo && iso3){
          try {
            const url = `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/${iso3}/ADM1/geoBoundaries-${iso3}-ADM1.topojson`;
            const r = await fetch(url); if (r.ok){ topo = await r.json(); src='geoBoundaries 实时'; }
          } catch(e){}
        }
        if (!topo){ $('mapStatus').textContent = '该国暂无可用的 一级行政区域 边界数据'; return; }
        _topo = topo; renderProvinces(src);
        // ADM2：默认隐藏；懒加载国（ru/au 等大体量）进图不预载，点击按钮时才拉取（IndexedDB 缓存二次秒开）
        if (_adm2Lazy){
          const b = $('adm2toggle'); b.classList.remove('active'); b.textContent = '点击加载二级行政区域';
          // 进图即显示说明栏的二级行政区域数量须等加载后补全；此处先留 ADM1 说明
        } else {
          // 非懒加载国：默认隐藏，加载完成预载数据（点击按钮即时显示）；无数据则回退按钮
          ensureAdm2().then(() => {
            if (_topo2){
            assignRegions();   // ADM2 就绪后补全客户的 __adm2 归属，供二级行政区点击筛选
            // 兼容 TopoJSON/GeoJSON 两种格式（GRID3 同源 ADM2 为 TopoJSON，无 .features 属性）
            const _fc2cnt = (_topo2.type === 'Topology') ? _topo2.objects[Object.keys(_topo2.objects)[0]].geometries.length : _topo2.features.length;
            setStatus(_fc2cnt);   // 始终在说明栏显示二级行政区域数量（即便默认隐藏）
              if (showAdm2) renderAdm2();
              else { const b = $('adm2toggle'); b.classList.remove('active'); b.textContent = '显示二级行政区域';
                _requestIdle(() => { if (!showAdm2 && !_lodAdm2 && _gAdm2 && _topo2 && !adm2IsBuilt()) buildAdm2LayerChunked(true); });  // 浏览器空闲预构建隐藏层（LOD 大体量国跳过，避免加载即建 2457 path 又隐藏）
              }
            } else if (_adm2Chunked){
              // 分块国：仅索引已载入，整文件不进图。客户先按 ADM1 归属；ADM2 在放大到州、chunk 加载时增量补全。
              assignRegions();
              const total = (_adm2Index && _adm2Index.states) ? _adm2Index.states.reduce((a, s) => a + s.count, 0) : 0;
              setStatus(total);   // 说明栏显示二级行政区域总数（即便尚未拉取）
              const b = $('adm2toggle'); b.classList.remove('active'); b.textContent = '显示二级行政区域';
              if (showAdm2) updateChunks();   // 已默认开启 → 按当前视口拉取可见州细节（否则等放大触发）
              // 注意：分块国不空闲预载整文件（违背矢量瓦片初衷），仅放大到某州才拉该州 chunk
            } else {
              const b = $('adm2toggle'); b.classList.remove('active'); b.textContent = '显示二级行政区域'; showAdm2 = false;
              setStatus('暂无');
            }
          });
        }
      })();
    }
    // 按需加载 ADM2（二级行政区域）边界：本地优先，本地无则运行时拉 geoBoundaries
    function ensureAdm2(){
      if (_topo2 || _adm2Chunked) return Promise.resolve(_topo2);
      if (_adm2Loading) return _adm2Promise;
      _adm2Loading = true;
      if (showAdm2) $('mapStatus').textContent = '二级行政区域边界加载中…';
      _adm2Promise = (async () => {
        // —— 矢量瓦片式分块国：仅拉取 tiny 索引，几何按州懒加载（类 Google Maps 矢量瓦片）——
        if (_CHUNKED_ISO.has(iso2)){
          const idx = await fetchCached(`provinces/${iso2}_adm2_index.json?v=${_ADM2_CHUNK_VER}`);
          _adm2Index = idx;
          _stateSlugByName = new Map();
          _stateSlugByIdx = new Array(_features.length).fill(null);
          _features.forEach((f, pi) => {
            const nm = f.properties.shapeName || f.properties.name;
            const st = (idx.states || []).find(s => s.name === nm);
            const slug = st ? st.slug : null;
            if (slug){ _stateSlugByName.set(nm, slug); _stateSlugByIdx[pi] = slug; }
          });
          _stateLocalBounds = _features.map(f => _path.bounds(f));
          _adm2Chunks = new Map();
          _adm2Chunked = true; _lodAdm2 = true;   // 分块即启用 LOD 阈值（低缩放仅省界）
          _adm2Loading = false;
          return null;   // 无单一 _topo2：几何在放大到州时才按需拉取 chunk
        }
        let fc = null;
        // 1) 优先本地精简 geojson（GRID3 同源 TopoJSON，约1.1MB），IndexedDB 缓存加速重复访问
        try { fc = await fetchCached(`provinces/${iso2}_adm2.min.json?v=202607241650`); } catch(e){}
        // 2) 本地完整 topojson 兜底
        if (!fc){ try { const r2 = await fetch(`provinces/${iso2}_adm2.json`); if (r2.ok){ const t = await r2.json(); fc = (t.type==='Topology') ? topojson.feature(t, t.objects[Object.keys(t.objects)[0]]) : t; } } catch(e){} }
        // 3) 运行时 geoBoundaries 兜底
        if (!fc && iso3){
          try {
            const url2 = `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/${iso3}/ADM2/geoBoundaries-${iso3}-ADM2.topojson`;
            const r2 = await fetch(url2); if (r2.ok){ const t = await r2.json(); fc = (t.type==='Topology') ? topojson.feature(t, t.objects[Object.keys(t.objects)[0]]) : t; }
          } catch(e){}
        }
        _topo2 = fc; _adm2Loading = false;
        // B 级 LOD 自动判定：ADM2 市区数 > 800 的大体量国（如 mx=2457）启用分级，按国独立、不牵连小数目国
        const _cnt = fc && fc.type === 'Topology' ? fc.objects[Object.keys(fc.objects)[0]].geometries.length : (fc && fc.features ? fc.features.length : 0);
        _lodAdm2 = _cnt > 800;
        return fc;
      })();
      return _adm2Promise;
    }
    $('adm2toggle').onclick = async function(){
      showAdm2 = !showAdm2;
      this.classList.toggle('active', showAdm2);
      this.textContent = showAdm2 ? '隐藏二级行政区域' : '显示二级行政区域';
      if (!_gAdm2) return;
      if (showAdm2){
        // ADM2 开启时：禁用 ADM1 prov-fill 的指针事件，杜绝 ADM2 透明内部点击穿透到 ADM1 选中一级行政区域
        _provFill.forEach(n => n.style.pointerEvents = 'none');
        if (_topo2){ renderAdm2(); }
        if (_lodAdm2 && (_curK || 1) < _lodZoom) $('mapStatus').textContent = '二级行政区域已开启 · 放大地图以查看市区';  // LOD：阈值以下仅省界，给提示
        else {
          setStatus('loading');
          await ensureAdm2();
          if (_topo2){
            assignRegions();   // 懒加载国：加载完成后补全客户 __adm2 归属，二级行政区筛选可用
            const _fc2cnt = (_topo2.type === 'Topology') ? _topo2.objects[Object.keys(_topo2.objects)[0]].geometries.length : _topo2.features.length;
            setStatus(_fc2cnt);
            _adm2Lazy = false;   // 已加载，后续按常规模块处理
            renderAdm2();
          }
          else if (_adm2Chunked){
            // 矢量瓦片式分块国：索引已在 ensureAdm2 阶段载入；按当前视口拉取可见州细节
            assignRegions();   // 客户先按 ADM1 归属；ADM2 在 chunk 加载时增量补全
            const total = (_adm2Index && _adm2Index.states) ? _adm2Index.states.reduce((a, s) => a + s.count, 0) : 0;
            setStatus(total);
            _adm2Lazy = false;
            updateChunks();
          }
          else {
            setStatus('暂无');
            showAdm2 = false; this.classList.remove('active'); this.textContent = '显示二级行政区域';
            _provFill.forEach(n => n.style.pointerEvents = '');
          }
        }
      } else {
        _adm2BuildGen++;                  // 取消可能进行中的分帧构建
        _gAdm2.style('display', 'none');  // 仅隐藏二级行政区域图层（保留 DOM，下次开启瞬时显示），地图说明保持不变
        // ADM2 关闭时：恢复 ADM1 prov-fill 的指针事件
        _provFill.forEach(n => n.style.pointerEvents = '');
      }
    };
    let _tipTxt = '', _tipW = 0, _tipH = 0;
    function showTip(e, name){
      const tip = $('mapTip');
      // 仅文案变化时重设 textContent + 测量尺寸；否则每像素 mousemove 强制 reflow（offsetWidth 触发整页布局）
      if (name !== _tipTxt){ tip.textContent = name; _tipTxt = name; _tipW = tip.offsetWidth; _tipH = tip.offsetHeight; }
      tip.style.display = 'block';
      const pad = 14, tw = _tipW, th = _tipH;
      let x = e.clientX + pad, y = e.clientY + pad;
      if (x + tw > window.innerWidth) x = e.clientX - tw - pad;
      if (y + th > window.innerHeight) y = e.clientY - th - pad;
      tip.style.transform = 'translate(' + x + 'px,' + y + 'px)';   // transform 定位→GPU 合成，避免每像素 layout 重排（悬停卡顿来源之一）
    }
    function hideTip(){ $('mapTip').style.display = 'none'; }
    // 仅在地图窗口的像素尺寸【真正变化】时才重绘（避免右侧检索栏内容增减引起的整页高度波动误触发重绘，
    // 导致国家地图看似“随检索栏伸长而变动”）。尺寸锁定为视口固定高度，与右侧栏彻底解耦。
    let _lastW = 0, _lastH = 0;
    function _mapSizeChanged(){
      const m = $('map'); if (!m) return false;
      const w = m.clientWidth, h = m.clientHeight;
      if (w !== _lastW || h !== _lastH){ _lastW = w; _lastH = h; return true; }
      return false;
    }
    let _rt; window.addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(() => {
      if (!_mapSizeChanged()) return;   // 尺寸没变 → 不重绘（核心修复）
      if (_svg) _svg.remove();
      if (_topo){ renderProvinces(''); if (showAdm2 && _topo2){ renderAdm2(); _provFill.forEach(n => n.style.pointerEvents = 'none'); } }
    }, 200); });
    // 初次渲染后记录基准尺寸
    setTimeout(() => { const m = $('map'); if (m){ _lastW = m.clientWidth; _lastH = m.clientHeight; } }, 0);

    // —— 5. 客户检索（customers.json）——
    function loadCustomers(){
      fetch('customers.json').then(r => r.json()).then(data => {
        const all = (data && data.records) || [];
        const key = (iso2 === 'tw') ? 'cn' : iso2;  // 台湾客户并入中国检索
        const list = all.filter(r => (r.iso2 || '').toLowerCase() === key);
        list.forEach((r, i) => { r.__id = i; });   // 稳定 id：关联检索表行 ↔ 地图点
        renderCustomers(list);
        window.__custList = list;
        drawCustomerPointsOnMap(list);  // 在地图上按实际地址绘制绿色像素点
        updateCustStat();               // 右下角：信息总计 / 位置统计
        applyPendingHl();               // 世界地图跳转带 hl 参数时，客户就绪即点亮该行（省份未就绪则由 renderProvinces 兜底触发）
        warnDupCoords(list);            // 自检：坐标撞车会导致圆点叠在一起看不见，立即暴露
        let _custSearchTimer = null;
        $('custSearch').oninput = () => { clearTimeout(_custSearchTimer); _custSearchTimer = setTimeout(() => applyRegionFilter(), 120); };
      }).catch(() => { $('custEmpty').textContent = '客户数据加载失败'; $('custEmpty').style.display = 'block'; });
    }
    function renderCustomers(list){
      const regions = _selectedRegions();
      const tag = regions.length ? ` · 📍 ${regions.map(r => r.label || r.name).join(' / ')}` : '';
      $('custCount').textContent = `共 ${list.length} 条` + tag;
      if (!list.length){ $('custBody').innerHTML = ''; $('custEmpty').style.display = 'block'; $('custEmpty').textContent = regions.length ? '所选区域暂无落点客户（无地址者不计入）' : '尚未导入客户数据 — 将客户清单发我转成 customers.json 重新部署即可在此检索。'; return; }
      $('custEmpty').style.display = 'none';
      $('custBody').innerHTML = list.map(r =>
        `<tr data-id="${r.__id}"><td>${esc(r.company)}</td><td>${esc(r.phone)}</td><td>${esc(r.name)}</td><td>${esc(r.address)}</td></tr>`
      ).join('');
      $('custBody').querySelectorAll('tr').forEach(tr => { tr.onclick = () => highlightCustomer(+tr.dataset.id); });
      // 重绘后恢复黄色选中行
      _hlIds.forEach(id => { const rr = $('custBody').querySelector('tr[data-id="'+id+'"]'); if (rr) rr.classList.add('sel'); });
      applyHideUnselected();   // 重渲染后重新应用「隐藏未选客户」：仅保留选中行
    }

    // —— 客户像素点（customers.json，按经纬度落点）——
    // 设计：_gCust 置于 zoom 组 g 内 → 客户点位置随 g 变换自动跟随，物理上不可能漂移/消失。
    // 每点记录地理基准投影 base（PROJ，k=1 内容坐标），绘制时一次性算恒定屏幕空间偏移 off（去重叠铺开，参考系 k=1）。
    // updateCustZoom(k) 按缩放插值：k=1 时 off·zf=0（像素粒堆叠于真实位置、绝无重叠错觉），半径=GRAIN_R；
    // k→ZOOM_FULL 时 off 全量铺开、半径=DOT_R，圆点逐一可见且不重叠。彻底取代「每帧重松弛」与「手动 layoutCust 易脱节」两类问题。
    const _GA = 2.399963229728653;            // 黄金角：重合点均匀扇开
    // 一次性计算每点恒定屏幕空间偏移 off（参考系 k=1 / t=0 下去重叠），之后不再随缩放重算
    function computeOffsets(){
      const els = _custEls, n = els ? els.length : 0;
      if (!n) return;
      const minDist = _CUST_R * 2 + 2.0;      // 屏幕像素最小间距（含 2px 间隙）
      for (let i = 0; i < n; i++){ els[i].off = [0, 0]; }
      // 1) 按基准坐标分桶：完全/极近重合的点用向日葵螺旋均匀扇开
      const buckets = {};
      for (let i = 0; i < n; i++){
        const b = els[i].base;
        const key = Math.round(b[0]) + '_' + Math.round(b[1]);
        (buckets[key] = buckets[key] || []).push(i);
      }
      for (const key in buckets){
        const grp = buckets[key], m = grp.length;
        if (m <= 1) continue;
        const R = minDist * 0.6 * Math.sqrt(m);   // 螺旋半径，保证整簇互不重叠
        for (let j = 0; j < m; j++){
          const i = grp[j];
          if (j === 0){ els[i].off = [0, 0]; continue; }
          const ang = j * _GA, rad = R * Math.sqrt(j / m);
          els[i].off = [Math.cos(ang) * rad, Math.sin(ang) * rad];
        }
      }
      // 2) 轻量松弛：化解跨桶（相邻城市）重叠，确定性、一次性
      for (let iter = 0; iter < 25; iter++){
        let moved = false;
        for (let i = 0; i < n; i++){
          const xi = els[i].base[0] + els[i].off[0], yi = els[i].base[1] + els[i].off[1];
          for (let j = i + 1; j < n; j++){
            const xj = els[j].base[0] + els[j].off[0], yj = els[j].base[1] + els[j].off[1];
            let dx = xj - xi, dy = yj - yi, d2 = dx * dx + dy * dy;
            if (d2 < minDist * minDist){
              let d = Math.sqrt(d2), ux, uy;
              if (d > 0.01){ ux = dx / d; uy = dy / d; }
              else { const a = i * _GA; ux = Math.cos(a); uy = Math.sin(a); d = 0; }
              const push = (minDist - d) / 2 + 0.05;
              els[i].off[0] -= ux * push; els[i].off[1] -= uy * push;
              els[j].off[0] += ux * push; els[j].off[1] += uy * push;
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
    }
    // —— 客户点缩放动态：颗粒 ↔ 圆点 ——
    // 设计（用户 2026-07-25）：初始(k=1)全图时客户点是「像素粒」(小、坐标绝对准确、同坐标重合点自然堆叠成一粒不可见重叠)；
    // 随放大(k→ZOOM_FULL)逐步变成「清晰圆点」并把去重叠铺开量同步放大，使圆点能代表其准确位置时再铺开。
    // 关键：_gCust 已置于 zoom 组 g 内，坐标随 g 变换自动跟随（不可能漂移/消失）；此函数只调「半径」与「铺开量」。
    const GRAIN_R = 1.4;            // 初始像素粒半径（屏幕 px）
    const DOT_R   = 2.6;            // 放大后清晰圆点半径（屏幕 px）
    const ZOOM_FULL = 3;            // 缩放到此倍率时完全变成圆点 + 完全铺开
    const CUST_HIT_PX = 10;         // 透明命中区：恒定屏幕尺寸(px)，不随缩放放大 → 放大到最大也不会出现超大盲区误触发 hover
    function zoomFactor(k){ return Math.max(0, Math.min(1, (k - 1) / (ZOOM_FULL - 1))); }
    function updateCustZoom(k){
      if (!_gCust || !_custEls || !_custEls.length) return;
      const zf = zoomFactor(k);
      const sepF = Math.min(1, zf * 1.8);                  // 铺开量比半径更快到满：保证任意缩放下都不重叠（半径尚小、铺开已足）
      const rScreen = GRAIN_R + (DOT_R - GRAIN_R) * zf;   // 屏幕半径：k=1 粒 → k=ZOOM_FULL 圆点
      const rContent = rScreen / k;                        // 内容坐标半径（在 g 内被 scale(k) 还原成屏幕 rScreen）
      const sK = sepF / k;                                  // 去重叠偏移系数：屏幕 off * sepF，转内容坐标需 /k（g 变换会再 ×k 还原成屏幕 off·sepF）
      const els = _custEls;
      for (let i = 0; i < els.length; i++){
        const m = els[i]; if (!m.el) continue;
        const b = (m.lifted && m.liftedBase) ? m.liftedBase : m.base;   // 3D 浮雕抬升时改用 liftedBase
        const ox = (m.off ? m.off[0] : 0) * sK;
        const oy = (m.off ? m.off[1] : 0) * sK;
        m.el.attr('transform', `translate(${(b[0] + ox).toFixed(2)},${(b[1] + oy).toFixed(2)})`);
        if (m.ptEl) m.ptEl.attr('r', rContent); else m.el.select('circle.cust-pt').attr('r', rContent);
        // 命中区恒定屏幕尺寸：content 半径 = HIT_PX / k（在 zoom 组被 scale(k) 还原成屏幕 HIT_PX px），任意缩放下都是 10px，放大到最大也不会变成 54px 盲区
        if (m.hitEl) m.hitEl.attr('r', CUST_HIT_PX / k); else m.el.select('circle.cust-hit').attr('r', CUST_HIT_PX / k);
      }
    }
    function drawCustomerPointsOnMap(list){
      // 省份地图（PROJ / _gCust）异步加载，可能晚于客户数据到达；未就绪则短暂重试
      if (!_gCust || !PROJ){
        if (drawCustomerPointsOnMap._tries == null) drawCustomerPointsOnMap._tries = 0;
        if (drawCustomerPointsOnMap._tries < 40){ drawCustomerPointsOnMap._tries++; setTimeout(() => drawCustomerPointsOnMap(list), 200); }
        return;
      }
      drawCustomerPointsOnMap._tries = 0;
      _CUST_R = 2.6;  // 去重叠铺开用半径（=DOT_R）；computeOffsets 据此算恒定屏幕偏移 off（一次性）。实际屏幕半径由 updateCustZoom 按缩放在 GRAIN_R↔DOT_R 间动态插值
      _gCust.selectAll('g.cust-pt-g').remove();
      _custEls = [];
      const pts = (list || []).filter(r => r.lat != null && r.lng != null);
      // 同坐标（如多条客户都落到 Dhaka 市中心）在 k=1 全图时天然堆叠成一粒（像素粒，坐标准确、不可见重叠）；
      // 放大时 updateCustZoom 把去重叠铺开量(off)随 zoomFactor 放大、半径由 GRAIN_R→DOT_R，使圆点逐一可见且不重叠。
      // _gCust 在 zoom 组 g 内，位置随 g 变换自动跟随（不可能漂移/消失）。
      const projAll = pts.map(r => { const p = PROJ([+r.lng, +r.lat]); return p ? { r, p } : null; }).filter(Boolean);
      projAll.forEach((o) => {
        const p = o.p; const r = o.r;
        const g = _gCust.append('g').attr('class','cust-pt-g').attr('data-id', r.__id)
          .on('mouseenter', () => showCustTip(r))
          .on('mouseleave', hideTip)
          .on('click', (e) => { e.stopPropagation(); highlightCustomer(r.__id, { doZoom: false, scroll: true }); });  // 点击黄点→变绿 + 右侧检索栏平滑滚到该行并选中（不强制放大）
        // 可见圆点（纯黄，无发光）
        g.append('circle').attr('class','cust-pt').attr('r', _CUST_R).attr('cx',0).attr('cy',0)
          .attr('fill','#fde047').style('cursor','pointer');
        // 透明大命中区（r=6）提升点击/hover 命中率，视觉无影响
        g.append('circle').attr('class','cust-hit').attr('r', 6).attr('cx',0).attr('cy',0)
          .attr('fill','transparent').style('cursor','pointer')
          .on('mouseenter', () => showCustTip(r)).on('mouseleave', hideTip);
        const ptEl = g.select('circle.cust-pt');   // 缓存子元素引用：避免放大动画每帧重复 d3.select 子查询（性能优化）
        const hitEl = g.select('circle.cust-hit');
        _custEls.push({ el: g, base: p, rec: r, lifted: false, liftedBase: null, off: [0, 0], ptEl, hitEl });
      });
      assignRegions();
      // 分块国：客户晚于某些州 chunk 到达时，回填这些已建州的客户 ADM2 归属 + 预分组（增量，零精度损失）
      if (_adm2Chunked && _adm2Chunks){ _adm2Chunks.forEach((st, slug) => { if (st.built && st.fc) ensureAdm2CustForState(slug, st.fc); }); }
      // 重绘后恢复已有黄/绿选中高亮（仅改 fill，尺寸/位置不变，不影响其他点）
      if (_hlIds.size){
        _gCust.selectAll('g.cust-pt-g').each(function(){
          if (_hlIds.has(+this.getAttribute('data-id'))) this.classList.add('cust-hl');
        });
      }
      _gCust.style('display', _custVisible ? null : 'none');
      computeOffsets();                                  // 一次性算出恒定屏幕空间去重叠偏移
      updateCustZoom(_curK || 1);  // 初始布局（与当前缩放一致：k=1 → 像素粒堆叠于真实位置）
      updateCustStat();   // 点位重绘后刷新右下角统计
    }
    // —— 右下角统计：信息总计(录入客户总数) / 位置统计(地图绿色圆点数量)，用于对比计算空白地址个数 ——
    function updateCustStat(){
      const el = $('custStat'); if (!el) return;
      const list = window.__custList || [];
      const total = list.length;                                   // 信息总计：录入国家地图检索的客户总数
      const located = list.filter(r => r.lat != null && r.lng != null).length;  // 位置统计：地图上有圆点的客户数
      el.innerHTML = `信息总计 <b>${total}</b> 个 · 位置统计 <b>${located}</b> 个`;
    }
    // —— 自检：多个客户共用同一经纬度 → 圆点完全叠在一起"看不见"，属定位数据不准。加载即报警，杜绝此类问题 ——
    function warnDupCoords(list){
      const seen = {};
      list.forEach(r => { if (r.lat != null && r.lng != null){ const k = (+r.lat).toFixed(4) + ',' + (+r.lng).toFixed(4); (seen[k] = seen[k] || []).push(r.company); } });
      const dups = Object.entries(seen).filter(([, v]) => v.length > 1);
      if (dups.length) console.warn('[客户定位自检] 以下客户经纬度完全重合（多为同落 Dhaka 市中心），数据已按真实坐标保留；地图端已做螺旋去重叠(declutter)，每个点仍可独立 hover。如需更精确街道级坐标可单独重编码：\n' + dups.map(([k, v]) => '  ' + k + ' => ' + v.join(' , ')).join('\n'));
    }
    // —— 客户按二级区域(__adm2 名称)预分组：renderEmboss 仅测“该区域自己的客户”，彻底去掉逐区域对全部客户的 geoContains（零精度损失）——
    function buildAdm2CustMap(){
      _adm2CustMap = new Map();
      _custEls.forEach(m => {
        const nm = m.rec && (m.rec.__adm2); if (!nm) return;
        if (!_adm2CustMap.has(nm)) _adm2CustMap.set(nm, []);
        _adm2CustMap.get(nm).push(m);
      });
    }
    // —— 区域筛选：把每个客户关联到所属一级(ADM1)/二级(ADM2)行政区域（按经纬度 geoContains）——
    function assignRegions(){
      const list = window.__custList || [];
      if (!list.length) return;
      // 缓存 ADM2 GeoJSON 反序列化结果：只算一次（774 个多边形反序列化是重活，避免每次调用都重建）
      if (!assignRegions._fc2){
        assignRegions._fc2 = (_topo2 && _topo2.type === 'Topology') ? topojson.feature(_topo2, _topo2.objects[Object.keys(_topo2.objects)[0]]) : (_topo2 || null);
      }
      const fc2 = assignRegions._fc2;
      list.forEach(r => {
        if (r.__adm1 && r.__adm2) return;   // 已算过则跳过（增量）：首次全量后所有客户都有缓存，后续调用零成本
        if (r.lat != null && r.lng != null){
          const ll = [+r.lng, +r.lat];
          if (!r.__adm1 && _features){ for (const f of _features){ try { if (d3.geoContains(f, ll)){ r.__adm1 = f.properties.shapeName || f.properties.name; break; } } catch(e){} } }
          if (!r.__adm2 && fc2 && fc2.features){ for (const f of fc2.features){ try { if (d3.geoContains(f, ll)){ r.__adm2 = f.properties.shapeName || f.properties.name; break; } } catch(e){} } }
        }
      });
      if (!_adm2Chunked) buildAdm2CustMap();   // 非分块国：全量重建预分组；分块国改为增量 ensureAdm2CustForState（避免每次 assignRegions 清空已增量补全的归属）
    }
    function applyRegionFilter(){
      // 注：__adm1/__adm2 已在客户加载(drawCustomerPointsOnMap 内 assignRegions)与省份加载完成时算好并缓存，
      // 此处不再重复 assignRegions()，否则每次搜索按键都要对 102 客户 × 774 个 ADM2 多边形跑约 8 万次 d3.geoContains，造成严重卡顿。
      const list = window.__custList || [];
      let flt = list;
      const regions = _selectedRegions();   // 已选中的全部行政区域（单点 1 个 / 多点追踪多个）
      if (regions.length){
        flt = list.filter(r => regions.some(rg => (rg.type === 'adm1' ? r.__adm1 : r.__adm2) === rg.name));
      }
      const q = ($('custSearch').value || '').trim().toLowerCase();
      if (q) flt = flt.filter(r => [r.company, r.phone, r.name, r.address].some(v => (v||'').toLowerCase().includes(q)));
      renderCustomers(flt);
    }
    // 在点击点附近查找最近的二级行政区 path，解决“区域太小/被局部覆盖/落在相邻 LGA 缝隙导致点不中”
    // 关键修正：旧版用 elementsFromPoint 取“最上层 adm2”，但 adm2 path 之间常存在几何缝隙、且描边与填充分离，
    // 落在缝隙/下层时取不到目标 → 返回 null(选不中)。改为遍历所有 adm2 path 用 isPointInFill 做纯几何包含判定，
    // 不依赖 pointer-events 与 z 序；点击点落在缝隙时再半径采样兜底，取最近含该点的 LGA。
    function nearestAdm2At(px, py){
      // LOD：阈值以下二级区域层隐藏（仅省界），不该命中市区，直接短路避免误选
      if (_lodAdm2 && (!showAdm2 || (_curK || 1) < _lodZoom)) return null;
      const R = 26; // 半径采样最大范围(px)
      // 1) 候选预筛：仅取包围盒覆盖点击点附近(R 内)的 adm2 path，避免遍历全部 774 个，保证点击不卡
      const all = (_adm2Paths && _adm2Paths.length) ? _adm2Paths : document.querySelectorAll('path.adm2');
      const near = [];
      for (const el of all){
        const b = el.getBoundingClientRect();
        if (b.right >= px - R && b.left <= px + R && b.bottom >= py - R && b.top <= py + R) near.push(el);
      }
      if (!near.length) return null;
      // 2) 几何包含判定：某屏幕点是否真实落入某 adm2 几何内（与 pointer-events / z 序无关）
      const containsAt = (x, y) => {
        const p = new DOMPoint(x, y);
        const hit = [];
        for (const el of near){
          try {
            const m = el.getScreenCTM(); if (!m) continue;
            const local = p.matrixTransform(m.inverse());
            if (el.isPointInFill(local)) hit.push(el);
          } catch(e){}
        }
        return hit;
      };
      // 3) 先判定点击点本身
      let inside = containsAt(px, py);
      // 4) 缝隙兜底：点击点落在 LGA 几何之外(相邻 LGA 之间空隙)时，周围做密集网格采样找最近含该点的 adm2。
      //    用网格而非角向圆环采样——角向步长会在极窄缝隙处留下“死区”导致漏选。
      if (!inside.length){
        const STEP = 3, R2 = 28;
        outer:
        for (let dy = -R2; dy <= R2; dy += STEP){
          for (let dx = -R2; dx <= R2; dx += STEP){
            const h = containsAt(px + dx, py + dy);
            if (h.length){ inside = h; break outer; }
          }
        }
      }
      if (!inside.length) return null;
      // 5) 多个命中取面积最小者（最具体的细小 LGA 更可能是用户意图）；同面积量级取离点击点更近的
      let best = null, bestArea = Infinity, bestDist = Infinity;
      inside.forEach(el => {
        const b = el.getBoundingClientRect();
        const area = b.width * b.height;
        const d = Math.hypot(b.x + b.width/2 - px, b.y + b.height/2 - py);
        if (area < bestArea - 0.5 || (Math.abs(area - bestArea) <= 0.5 && d < bestDist)){
          bestArea = area; bestDist = d; best = el;
        }
      });
      return best;
    }
    function setRegionFilter(type, name, label, el, feature){
      // 单点模式：区域点击前清掉客户黄点 + 客户联动浮雕，保持“选中即清空其它”的秩序；多点追踪则保留累积
      if (!_multiTrack){ clearCustomerHighlight(); _embossRemoveBySource('customer'); }
      // 该区域 3D 浮雕显示（增/删切换；单点替换、多点追踪累积）—— 客户表筛选与描边均由 _embossRegions 派生，自动同步多区域
      if (feature) _embossAddOrToggle(type, name, feature, 'region');
      reapplyRegionSel();
      applyRegionFilter();
    }
    function reapplyRegionSel(){
      _provFill.forEach(n => n.classList.remove('prov-sel'));
      _provLine.forEach(n => n.classList.remove('prov-sel'));
      if (_gAdm2) _gAdm2.selectAll('path.adm2').classed('adm2-sel', false);
      _selectedRegions().forEach(rg => {
        if (rg.type === 'adm1'){
          _features && _features.forEach((f, i) => { if ((f.properties.shapeName || f.properties.name) === rg.name){ const nf = _provFill[i], nl = _provLine[i]; if (nf) nf.classList.add('prov-sel'); if (nl) nl.classList.add('prov-sel'); } });
        } else if (_gAdm2){
          _gAdm2.selectAll('path.adm2').each(function(){ const d = this.__data__; const n = d ? (d.properties.shapeName || d.properties.name) : ''; if (n === rg.name) this.classList.add('adm2-sel'); });
        }
      });
    }
    function clearCustomerHighlight(){
      if (_gCust) _gCust.selectAll('g.cust-pt-g.cust-hl').classed('cust-hl', false);
      _hlIds.clear();
      document.querySelectorAll('.cust-table tbody tr.sel').forEach(t => t.classList.remove('sel'));
      applyHideUnselected();
    }
    // 隐藏未选客户：开启后仅显示已选中(绿点)客户点，隐藏其余所有黄点（地图圆点与 hover tooltip 一并失效）；
    // 同时把右侧客户检索栏的信息行一并隐藏，只保留被选中的客户信息行。
    function applyHideUnselected(){
      if (!_gCust || !_custEls.length) return;
      const isSelected = (idv) => _hlIds.has(idv) || _hlIds.has(+idv) || _hlIds.has(String(idv));
      _custEls.forEach(m => {
        if (!m || !m.el || !m.rec) return;
        const isSel = isSelected(m.rec.__id);
        m.el.style('display', (_hideUnselected && !isSel) ? 'none' : null);
      });
      // 检索栏信息行：未选中则隐藏（保留选中行）
      document.querySelectorAll('.cust-table tbody tr').forEach(tr => {
        const idv = tr.getAttribute('data-id');
        const isSel = isSelected(idv);
        tr.style.display = (_hideUnselected && !isSel) ? 'none' : null;
      });
      if (_routeOn) rebuildRoute();   // 点集变化（隐藏/显示）→ 路线需重算
    }
    // —— 路线规划：在可见客户点间连成一条「闭合最短路线」——
    // 用户要求：去掉起终点，把所有点连成一个封闭图形，使总周长最短。
    // 这是经典闭合 TSP（Closed TSP Tour）。坐标用与地图同投影的基坐标 + 去重叠偏移，
    // 距离=地图实际距离；低纬度国家投影畸变小，平面距离≈真实地理距离。

    // 几何交叉兜底：对闭合折线中任意两条不相邻边做定向相交判定，若交叉则执行 2-opt 翻转。
    // 作为 2-opt 精炼后的安全网，确保用户视觉上不会看到虚线互相穿越。
    function uncross(order, coords){
      const n = order.length; if (n < 4) return order;
      const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const onSeg = (a, b, p) => {
        const minx = Math.min(a[0], b[0]) - 1e-9, maxx = Math.max(a[0], b[0]) + 1e-9;
        const miny = Math.min(a[1], b[1]) - 1e-9, maxy = Math.max(a[1], b[1]) + 1e-9;
        return p[0] >= minx && p[0] <= maxx && p[1] >= miny && p[1] <= maxy;
      };
      const segIntersect = (a, b, c, d) => {
        const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
        if (o1 * o2 < 0 && o3 * o4 < 0) return true;
        if (Math.abs(o1) < 1e-12 && onSeg(a, b, c)) return true;
        if (Math.abs(o2) < 1e-12 && onSeg(a, b, d)) return true;
        if (Math.abs(o3) < 1e-12 && onSeg(c, d, a)) return true;
        if (Math.abs(o4) < 1e-12 && onSeg(c, d, b)) return true;
        return false;
      };
      let improved = true, pass = 0;
      while (improved && pass < 100){
        improved = false; pass++;
        for (let i = 0; i < n; i++){
          const a = coords[order[i]], b = coords[order[(i + 1) % n]];
          for (let j = i + 2; j < n; j++){
            if (i === 0 && j === n - 1) continue;   // 整条链反转，无意义
            const c = coords[order[j]], d = coords[order[(j + 1) % n]];
            if (!segIntersect(a, b, c, d)) continue;
            let lo = i + 1, hi = j;
            while (lo < hi){ const t = order[lo]; order[lo] = order[hi]; order[hi] = t; lo++; hi--; }
            improved = true;
          }
        }
      }
      return order;
    }

    function tspOrder(coords){
      const n = coords.length;
      if (n < 2) return coords.map((_, i) => i);
      if (n === 2) return [0, 1];   // 2 点：来回同一条边
      // 预计算真实欧氏距离矩阵（sqrt 不可省：平方和会改变最优解）
      const dist = new Array(n);
      for (let i = 0; i < n; i++){
        const row = new Array(n); dist[i] = row;
        for (let j = 0; j < n; j++){
          const dx = coords[i][0] - coords[j][0], dy = coords[i][1] - coords[j][1];
          row[j] = Math.hypot(dx, dy);
        }
      }
      const tourLen = (ord) => { let s = 0; for (let i = 0; i < n; i++) s += dist[ord[i]][ord[(i + 1) % n]]; return s; };
      // 精确最优（n <= 16）：Held-Karp 动态规划，O(n^2·2^n)。n=16 约 400 万次状态转移，现代浏览器 < 100ms。
      if (n <= 16){
        const N = 1 << n;
        const dp = new Float64Array(N * n).fill(Infinity);
        const parent = new Int16Array(N * n).fill(-1);
        dp[1 * n + 0] = 0;   // 从第 0 点出发
        for (let mask = 1; mask < N; mask++){
          if (!(mask & 1)) continue;       // 只处理包含起点的集合
          const base = mask * n;
          for (let i = 0; i < n; i++){
            if (!(mask & (1 << i))) continue;
            const cur = dp[base + i]; if (cur === Infinity) continue;
            for (let j = 0; j < n; j++){
              if (mask & (1 << j)) continue;
              const nm = mask | (1 << j);
              const idx = nm * n + j;
              const cand = cur + dist[i][j];
              if (cand < dp[idx]){ dp[idx] = cand; parent[idx] = i; }
            }
          }
        }
        const full = N - 1;
        let bestLen = Infinity, bestEnd = -1;
        for (let i = 1; i < n; i++){
          const cand = dp[full * n + i] + dist[i][0];
          if (cand < bestLen){ bestLen = cand; bestEnd = i; }
        }
        const order = [];
        let mask = full, node = bestEnd;
        while (node !== -1){
          order.push(node);
          const p = parent[mask * n + node];
          mask ^= (1 << node);
          node = p;
        }
        order.reverse();
        uncross(order, coords);   // 精确解本不应交叉，但浮点/退化坐标仍可能共线穿越，兜底保证视觉上无交叉
        return order;   // 以第 0 点为起点的最短闭合回路
      }
      // 启发式构造（n > 16）：多起点最近邻 + cheapest insertion + farthest insertion，
      // 再经完整 2-opt + Or-opt 精炼，消除交叉并逼近最优。
      const nn = (start) => {
        const visited = new Uint8Array(n);
        const order = [start]; visited[start] = 1;
        for (let s = 1; s < n; s++){
          const last = order[order.length - 1];
          let best = -1, bd = Infinity;
          for (let j = 0; j < n; j++){
            if (visited[j]) continue;
            const d = dist[last][j];
            if (d < bd){ bd = d; best = j; }
          }
          order.push(best); visited[best] = 1;
        }
        return order;
      };
      const cheapestInsertion = () => {
        if (n < 3) return [0, 1];
        const order = [0, 1];
        const inTour = new Uint8Array(n); inTour[0] = 1; inTour[1] = 1;
        while (order.length < n){
          let bestV = -1, bestInc = Infinity, bestPos = -1;
          for (let v = 0; v < n; v++) if (!inTour[v]){
            for (let i = 0; i < order.length; i++){
              const a = order[i], b = order[(i + 1) % order.length];
              const inc = dist[a][v] + dist[v][b] - dist[a][b];
              if (inc < bestInc){ bestInc = inc; bestV = v; bestPos = i + 1; }
            }
          }
          order.splice(bestPos, 0, bestV); inTour[bestV] = 1;
        }
        return order;
      };
      const farthestInsertion = () => {
        let order = [0];
        const inTour = new Uint8Array(n); inTour[0] = 1;
        while (order.length < n){
          let far = -1, farD = -1;
          for (let v = 0; v < n; v++) if (!inTour[v]){
            let md = Infinity;
            for (let u of order) md = Math.min(md, dist[u][v]);
            if (md > farD){ farD = md; far = v; }
          }
          let bestPos = -1, bestInc = Infinity;
          for (let i = 0; i < order.length; i++){
            const a = order[i], b = order[(i + 1) % order.length];
            const inc = dist[a][far] + dist[far][b] - dist[a][b];
            if (inc < bestInc){ bestInc = inc; bestPos = i + 1; }
          }
          order.splice(bestPos, 0, far); inTour[far] = 1;
        }
        return order;
      };
      const twoOpt = (order) => {
        let improved = true, pass = 0;
        while (improved && pass < 250){
          improved = false; pass++;
          for (let i = 0; i < n; i++){
            for (let j = i + 2; j < n; j++){
              if (i === 0 && j === n - 1) continue;   // 整条链反转，无意义
              const a = order[i], b = order[(i + 1) % n];
              const c = order[j], d = order[(j + 1) % n];
              const before = dist[a][b] + dist[c][d];
              const after  = dist[a][c] + dist[b][d];
              if (after + 1e-9 < before){
                let lo = i + 1, hi = j;
                while (lo < hi){ const t = order[lo]; order[lo] = order[hi]; order[hi] = t; lo++; hi--; }
                improved = true;
              }
            }
          }
        }
        return order;
      };
      const relocateOpt = (order) => {
        let improved = true;
        while (improved){
          improved = false;
          for (let i = 0; i < n; i++){
            const v = order[i];
            const prev = order[(i - 1 + n) % n], next = order[(i + 1) % n];
            const saved = dist[prev][v] + dist[v][next] - dist[prev][next];
            for (let j = 0; j < n; j++){
              if (j === i || j === (i - 1 + n) % n) continue;
              const a = order[j], b = order[(j + 1) % n];
              const cost = dist[a][v] + dist[v][b] - dist[a][b];
              if (saved - cost > 1e-9){
                order.splice(i, 1);
                const insertAt = j < i ? j + 1 : j;
                order.splice(insertAt, 0, v);
                improved = true; break;
              }
            }
            if (improved) break;
          }
        }
        return order;
      };
      const candidates = [cheapestInsertion(), farthestInsertion()];
      // 更多随机化起点 + 全部节点起点，提升跳出局部最优、消除残余交叉的概率。
      const R = Math.min(n, Math.max(40, Math.ceil(n * 0.75)));
      for (let s = 0; s < R; s++) candidates.push(nn(s % n));
      let best = null, bestLen = Infinity;
      for (const cand of candidates){
        const ord = relocateOpt(twoOpt(cand.slice()));
        const len = tourLen(ord);
        if (len < bestLen){ bestLen = len; best = ord.slice(); }
      }
      // 最后做一次几何交叉兜底：若 2-opt/Or-opt 因浮点/局部最优漏掉交叉，在这里强制翻转消除。
      if (best) uncross(best, coords);
      return best || candidates[0];
    }
    // 逆时针环形顺序：以质心为极点，按与质心连线的「屏幕逆时针」角度排序，得到一条不自交的环形闭合路线。
    // 屏幕 y 向下，故 atan2 递减 = 视觉逆时针。depot 固定为下标 0，交由 rebuildRoute 旋转到首位。
    function ringOrder(coords){
      const n = coords.length;
      if (n < 3) return coords.map((_, i) => i);
      let cx = 0, cy = 0;
      for (const p of coords){ cx += p[0]; cy += p[1]; }
      cx /= n; cy /= n;
      const idx = coords.map((p, i) => i);
      idx.sort((a, b) => {
        const aa = Math.atan2(coords[a][1] - cy, coords[a][0] - cx);
        const bb = Math.atan2(coords[b][1] - cy, coords[b][0] - cx);
        return bb - aa;   // 递减 → 视觉逆时针
      });
      return idx;
    }
    // 客户点「当前显示坐标」= 真实基坐标 + 去重叠铺开偏移(与 updateCustZoom 完全一致)，保证虚线端点贴合圆点
    function routePos(m, k){
      const zf = zoomFactor(k);
      const sepF = Math.min(1, zf * 1.8);
      const sK = sepF / k;
      const b = (m.lifted && m.liftedBase) ? m.liftedBase : m.base;
      const ox = (m.off ? m.off[0] : 0) * sK;
      const oy = (m.off ? m.off[1] : 0) * sK;
      return [b[0] + ox, b[1] + oy];
    }
    // 重算参与路线的点集 + TSP 闭合顺序，再绘制（开启隐藏未选时仅用已选中点）
    function rebuildRoute(){
      // 自愈：resize 重绘会重建 zoom 组 g，旧的 _gRoute 节点脱离文档 → route 仍开启时重新挂到当前 g，避免路线在缩放/重绘后消失
      if (_gRoute && (!_gRoute.node() || !_gRoute.node().isConnected)) _gRoute = null;
      if (_routeOn && !_gRoute) _gRoute = _gProv.insert('g', '.cust-layer').attr('class', 'route-layer');
      if (!_gRoute) return;
      if (!_routeOn){ _gRoute.selectAll('*').remove(); if (_routeListOpen) renderRouteList(); return; }
      const pts = [];
      _custEls.forEach(m => {
        if (!m || !m.el || !m.rec) return;
        if (_hideUnselected){
          const idv = m.rec.__id;
          const isSel = _hlIds.has(idv) || _hlIds.has(+idv) || _hlIds.has(String(idv));
          if (!isSel) return;
        }
        if (_custVisible === false) return;            // 整层被隐藏（custtoggle）
        if (m.el.style('display') === 'none') return;  // 被隐藏未选客户隐藏
        pts.push(m);
      });
      const hasDepot = !!_depot;
      const totalNodes = pts.length + (hasDepot ? 1 : 0);
      if (totalNodes < 2){ _routePts = []; _routeOrder = []; _routeSig = null; _gRoute.selectAll('*').remove(); if (_routeListOpen) renderRouteList(); return; }
      // TSP 必须在「当前视图实际绘制坐标」上算：去重叠偏移随缩放变化，k=3 算出的顺序在 k=1 等视图下可能出现视觉交叉。
      // 因此签名包含按 0.3 粒度取整的当前缩放倍率，同一段缩放内复用顺序，缩放结束后自动重算。
      const kForTsp = Math.max(1, _curK || 1);
      const kBand = Math.round(kForTsp * 3.333) / 3.333;   // 约 0.3 倍分段，减少缩放中频繁重算
      const sig = _routeMode + '|' + (hasDepot ? _depot.geo.join(',') + '|' : '') + 'k' + kBand.toFixed(2) + '|' + pts.map(m => m.rec.__id).join('|');
      if (sig !== _routeSig || !_routeOrder.length || _routeOrder.length !== totalNodes){
        _routeSig = sig;
        _routePts = pts;
        // 用当前缩放下的 routePos 作为输入，保证 TSP 顺序与当前看到的点位置一致，消除视觉交叉。
        const dispCoords = pts.map(m => routePos(m, kForTsp));
        if (hasDepot) dispCoords.unshift(PROJ(_depot.geo));   // 红旗固定为节点 0
        const order = (_routeMode === 'tsp') ? tspOrder(dispCoords) : ringOrder(dispCoords);   // 默认逆时针环形；可选最短闭合路径
        // 把红旗旋转到首位，作为视觉上的起点/终点
        if (hasDepot){
          const idx = order.indexOf(0);
          _routeOrder = idx > 0 ? order.slice(idx).concat(order.slice(0, idx)) : order;
        } else {
          _routeOrder = order;
        }
      } else {
        _routePts = pts;   // 顺序引用更新（_custEls 顺序稳定，下标仍对齐）
      }
      drawRoute(_curK || 1);
      if (_routeListOpen) renderRouteList();
    }
    // 按当前缩放绘制闭合虚线路径（仅 O(n) 拼接路径，重算顺序只在 rebuildRoute 做，避免缩放过程卡顿）
    function drawRoute(k){
      if (!_gRoute) return;
      _gRoute.selectAll('*').remove();
      if (!_routeOn) return;
      const hasDepot = !!_depot;
      const totalNodes = _routePts.length + (hasDepot ? 1 : 0);
      if (totalNodes < 2) return;
      const coords = _routeOrder.map(idx => {
        if (hasDepot && idx === 0) return PROJ(_depot.geo);
        const m = _routePts[hasDepot ? idx - 1 : idx];
        return routePos(m, k);
      });
      const d = coords.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' L ');
      _gRoute.append('path')
        .attr('class', 'route-line')
        .attr('d', 'M ' + d + ' Z')   // Z 闭合：最后一点连回第一点，形成封闭图形
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.6)
        .attr('stroke-dasharray', '6 4')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('vector-effect', 'non-scaling-stroke')   // 线宽/虚线不随缩放放大，恒定屏幕尺寸
        .style('pointer-events', 'none');
    }
    // —— 路线规划清单弹窗：按顺序罗列 起点 → 各客户 → 回到起点 ——
    function routeListSeq(){
      const hasDepot = !!_depot;
      const seq = [];
      if (hasDepot){
        seq.push({ role: 'start' });
        _routeOrder.forEach((idx, i) => seq.push({ role: 'cust', oi: idx, n: i + 1 }));
        seq.push({ role: 'end' });
      } else {
        _routeOrder.forEach((idx, i) => seq.push({ role: 'cust', oi: idx, n: i + 1, isStart: i === 0 }));
        seq.push({ role: 'loop', firstIdx: _routeOrder[0] });
      }
      return seq;
    }
    function renderRouteList(){
      const body = $('routeListBody'); if (!body) return;
      const title = $('routeListTitle');
      const hasDepot = !!_depot;
      const totalNodes = _routePts.length + (hasDepot ? 1 : 0);
      if (title) title.textContent = `路线规划清单（${_routePts.length} 个客户站点${hasDepot ? ' · 含计划起点' : ''}）`;
      if (!_routeOn || totalNodes < 2){
        body.innerHTML = '<li class="rl-empty">尚未生成路线 — 请点击「开启路线规划」后查看顺序名单。</li>';
        return;
      }
      const seq = routeListSeq();
      const rows = seq.map(it => {
        if (it.role === 'start'){
          const ll = _depot.geo;
          return `<li class="rl-row rl-start"><span class="rl-badge">起</span><span class="rl-main"><span class="rl-name">计划位置（出发点）</span><span class="rl-sub">坐标 ${ll[0].toFixed(4)}, ${ll[1].toFixed(4)}</span></span></li>`;
        }
        if (it.role === 'end'){
          return `<li class="rl-row rl-end"><span class="rl-badge">回</span><span class="rl-main"><span class="rl-name">回到计划位置（终点）</span><span class="rl-sub">闭合回路终点，与起点重合</span></span></li>`;
        }
        if (it.role === 'loop'){
          const fr = _routePts[it.firstIdx] && _routePts[it.firstIdx].rec;
          return `<li class="rl-row rl-end"><span class="rl-badge">↺</span><span class="rl-main"><span class="rl-name">回到起点（${esc(fr ? (fr.company || '客户') : '客户')}）</span><span class="rl-sub">闭合回路，回到第 1 站</span></span></li>`;
        }
        const m = _routePts[hasDepot ? it.oi - 1 : it.oi];
        const r = m.rec;
        const region = r.__adm2 ? r.__adm2 : (r.__adm1 || '');
        const sub = [r.name, region].filter(Boolean).join(' · ');
        return `<li class="rl-row ${it.isStart ? 'rl-start' : ''}"><span class="rl-idx">${it.n}</span><span class="rl-main"><span class="rl-name">${esc(r.company || '未命名客户')}</span>${sub ? `<span class="rl-sub">${esc(sub)}</span>` : ''}</span></li>`;
      });
      body.innerHTML = rows.join('');
    }
    function openRouteList(){
      const panel = $('routeListPanel'); if (!panel) return;
      _routeListOpen = true;
      panel.style.display = 'flex';
      document.querySelectorAll('.rl-mode').forEach(b => b.classList.toggle('active', b.dataset.mode === _routeMode));
      renderRouteList();
    }
    function closeRouteList(){
      const panel = $('routeListPanel'); if (!panel) return;
      _routeListOpen = false;
      panel.style.display = 'none';
    }
    function setRouteMode(mode){
      if (_routeMode === mode) return;
      _routeMode = mode;
      document.querySelectorAll('.rl-mode').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
      rebuildRoute();   // 重新按新模式算顺序 + 绘制 + 重绘清单
    }
    // 绘制/更新红旗：作为路线规划的固定出发点与返回点
    function drawDepotMarker(){
      if (!_gDepot) _gDepot = _gProv.insert('g', '.cust-layer').attr('class', 'depot-layer');  // 置于客户点层之下，不遮挡客户圆点
      _gDepot.selectAll('*').remove(); _depotInner = null;
      if (!_depot) return;
      const base = PROJ(_depot.geo);
      const outer = _gDepot.append('g').attr('class', 'depot-marker').attr('transform', `translate(${base[0]},${base[1]})`);
      // —— 带旗杆的五星红旗（波浪形 ≈，左高右低）：恒定屏幕尺寸，仅随缩放做反缩放 ——
      const inner = outer.append('g');   // 由 updateDepotMarker 做 scale(1/k)，原点 = 选取点(0,0)
      // 旗杆：从选取点(0,0)竖直向上，顶端略高于旗面，杆顶一颗小黄珠
      inner.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', -26)
        .attr('stroke', '#fff').attr('stroke-width', 1.6).attr('vector-effect', 'non-scaling-stroke');
      inner.append('circle').attr('cx', 0).attr('cy', -26).attr('r', 1.6).attr('fill', '#ffde00');
      // 波浪形旗面（左高右低，≈ 形）：沿旗宽采样正弦波生成闭合路径
      const W = 22, H = 14, x0 = 0, yTop0 = -24, tilt = -7, amp = 0.9, humps = 2, N = 20;
      const flagPoint = (fx, fy) => {
        const x = x0 + fx * W;                       // fx∈[0,1] 沿旗宽
        const yBase = yTop0 + fx * tilt;             // 线性左高右低（右端低 tilt）
        const yWave = Math.sin(fx * Math.PI * 2 * humps) * amp;  // ≈ 形双波起伏
        return [x, yBase + yWave + fy * H];
      };
      let d = '';
      for (let i = 0; i <= N; i++){ const p = flagPoint(i / N, 0); d += (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ',' + p[1].toFixed(2); }
      for (let i = N; i >= 0; i--){ const p = flagPoint(i / N, 1); d += 'L' + p[0].toFixed(2) + ',' + p[1].toFixed(2); }
      d += 'Z';
      inner.append('path').attr('d', d).attr('fill', '#de2910').attr('stroke', '#fff').attr('stroke-width', 0.8).attr('vector-effect', 'non-scaling-stroke');
      // 五角星路径生成器（5 尖，内半径 = R*0.382）
      const starPath = (cx, cy, R, rot) => {
        rot = (rot || 0) * Math.PI / 180; const segs = [];
        for (let i = 0; i < 5; i++){
          const a = rot - Math.PI / 2 + i * 2 * Math.PI / 5;
          segs.push((i === 0 ? 'M' : 'L') + (cx + R * Math.cos(a)).toFixed(2) + ',' + (cy + R * Math.sin(a)).toFixed(2));
          const b = a + Math.PI / 5;
          segs.push('L' + (cx + R * 0.382 * Math.cos(b)).toFixed(2) + ',' + (cy + R * 0.382 * Math.sin(b)).toFixed(2));
        }
        return segs.join('') + 'Z';
      };
      // 中国国旗标准网格 30×20 → fx=gx/30, fy=gy/20；星位置用 flagPoint 贴合波浪面
      const Lc = [3, 3], sc = [[6, 1.2], [7.2, 2.4], [7.2, 4.2], [6, 5.4]];
      const big = flagPoint(Lc[0] / 30, Lc[1] / 20);
      inner.append('path').attr('d', starPath(big[0], big[1], 1.8, 0)).attr('fill', '#ffde00');
      sc.forEach(s => {
        const p = flagPoint(s[0] / 30, s[1] / 20);
        const ang = Math.atan2(Lc[1] - s[1], Lc[0] - s[0]) * 180 / Math.PI + 90;  // 每颗小星一尖指向大星
        inner.append('path').attr('d', starPath(p[0], p[1], 0.6, ang)).attr('fill', '#ffde00');
      });
      // 锚点（精确选取坐标）
      inner.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 2).attr('fill', '#de2910').attr('stroke', '#fff').attr('stroke-width', 0.8).attr('vector-effect', 'non-scaling-stroke');
      _depotInner = inner;
      updateDepotMarker(_curT || d3.zoomIdentity);
    }
    function updateDepotMarker(t){ if (_depotInner) _depotInner.attr('transform', `scale(${1 / t.k})`); }
    // 点击客户检索行 → 自动放大并居中到该客户所在一级行政区域（ADM1）
    // rec：可选，传入客户记录以在「当前已放大更多」时居中其真实坐标点（而非省份质心）
    function zoomToAdm1(name, rec){
      if (!_svg || !_zoom || !_features || !_path) return;
      const feat = _features.find(f => (f.properties.shapeName || f.properties.name) === name);
      if (!feat) return;
      const node = _svg.node();
      const W = node.clientWidth || ($('map') && $('map').clientWidth) || 800;
      const H = node.clientHeight || ($('map') && $('map').clientHeight) || 480;
      const b = _path.bounds(feat);
      const x0 = b[0][0], y0 = b[0][1], x1 = b[1][0], y1 = b[1][1];
      const dx = x1 - x0, dy = y1 - y0;
      if (dx <= 0 || dy <= 0) return;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const pad = 0.82;  // 省份占视口 82%，留出边距
      let scale = pad / Math.max(dx / W, dy / H);
      scale = Math.max(1, Math.min(9, scale));   // 受 zoom.scaleExtent([1,9]) 约束
      const cur = d3.zoomTransform(node);
      const hasPt = !!(rec && rec.lat != null && rec.lng != null);
      // 当前放大倍数已大于本次目标倍数 → 保持当前倍数不变，仅把选中客户真实坐标点平滑居中（不缩小）
      const effScale = (cur.k > scale && hasPt) ? cur.k : scale;
      const fx = (cur.k > scale && hasPt) ? PROJ([+rec.lng, +rec.lat])[0] : cx;
      const fy = (cur.k > scale && hasPt) ? PROJ([+rec.lng, +rec.lat])[1] : cy;
      const t = d3.zoomIdentity.translate(W/2 - effScale * fx, H/2 - effScale * fy).scale(effScale);
      _svg.transition().duration(620).call(_zoom.transform, t);
    }
    // 选中客户但无一级区域(ADM1)归属时（坐标落在行政区外/海上等）：放大并居中到该客户真实坐标点。
    // 兜底，保证“选中后的后续操作（自动放大定位）”对任何有坐标的客户都执行，不会只选中不放大。
    // 若当前放大倍数已大于目标倍数(6)，保持当前倍数、仅平滑居中该客户点（不缩小）。
    function zoomToPoint(lat, lng){
      if (!_svg || !_zoom || !PROJ) return;
      const p = PROJ([+lng, +lat]);
      if (!p) return;
      const node = _svg.node();
      const W = node.clientWidth || ($('map') && $('map').clientWidth) || 800;
      const H = node.clientHeight || ($('map') && $('map').clientHeight) || 480;
      const targetScale = Math.max(1, Math.min(9, 6));   // 固定放大到合适级别，便于看清落点
      const cur = d3.zoomTransform(node);
      const effScale = cur.k > targetScale ? cur.k : targetScale;   // 当前已更放大则保持当前倍数
      const t = d3.zoomIdentity.translate(W/2 - effScale * p[0], H/2 - effScale * p[1]).scale(effScale);
      _svg.transition().duration(620).call(_zoom.transform, t);
    }
    // 需求2：点击检索行 → 仅该客户原绿点变纯黄（同尺寸/位置，无高亮无边框），再点恢复绿；其余绿点不受影响、不清暗。
    // 选中后的“后续操作”：自动放大并居中定位（优先 ADM1，无 ADM1 归属则放大到客户坐标点）——无论地图是否有该圆点，行选中都执行。
    function highlightCustomer(id, opts){
      opts = opts || {};
      const doZoom = (opts.doZoom !== false);   // 默认 true：点击检索行 / 世界地图跳转时自动放大定位；点击地图黄点传 false（仅高亮+滚动，不强制放大）
      if (!_custVisible && _gCust){ _custVisible = true; _gCust.style('display', null); const b=$('custtoggle'); if(b){ b.classList.add('active'); b.textContent='隐藏客户位点'; } }
      // 即便该客户没有地图圆点（无坐标），也允许“行选中”执行；无节点时仅做行高亮、不做圆点切换
      const sel = (_gCust) ? _gCust.selectAll('g.cust-pt-g').filter(function(){ return +this.getAttribute('data-id') === id; }) : d3.select(null);
      const node = sel.node();
      const nowHl = node ? node.classList.contains('cust-hl') : false;
      if (!nowHl){
        // 即将点亮成黄点：单点模式（默认）先清掉其它所有高亮，保证地图上始终只有当前这一个黄点
        if (!_multiTrack) clearCustomerHighlight();
        // 单点模式：记录点击前的地图 transform，取消选中同一行时恢复（"返回"功能，仅 doZoom 时记录/恢复）
        if (!_multiTrack && doZoom) _saveT = d3.zoomTransform(_svg.node());
        const rec = (window.__custList || []).find(x => x.__id === id);
        if (rec && rec.__adm1 == null) assignRegions();   // 仅当该客户区域尚未缓存时增量补算（省份异步加载兜底）；正常已缓存，零成本，杜绝每次选中全量 geoContains 卡顿
        // 后续操作：自动放大并居中定位 —— 优先放大到一级区域(ADM1)，无 ADM1 归属则放大到客户真实坐标点（有坐标就一定放大，杜绝"只选中不放大"）
        if (doZoom && !_staticLock){
          if (rec && rec.__adm1) zoomToAdm1(rec.__adm1, rec);
          else if (rec && rec.lat != null && rec.lng != null) zoomToPoint(rec.lat, rec.lng);
        }
      } else if (!_multiTrack && _saveT) {
        // 单点模式取消选中同一行 → 恢复点击前的地图 transform（"返回"功能）
        if (doZoom && !_staticLock) _svg.transition().duration(620).call(_zoom.transform, _saveT);
        _saveT = null;
      }
      if (node){
        sel.classed('cust-hl', !nowHl);   // 仅在 黄↔绿 之间切换；半径/位置始终不变（绿点尺寸=黄点）
        if (!nowHl) sel.raise();          // 选中(变绿)的客户点置顶：同坐标(达卡 59 家)叠加时，确保绿点始终绘制在最上层，不会被后绘制的邻点黄点覆盖/误认成邻点
      }
      if (!nowHl) _hlIds.add(id); else _hlIds.delete(id);
      // 该客户所属区域（优先 ADM1，无则 ADM2）同步 3D 浮雕显示：黄点所在区域随浮雕一起探出（单点替换/多点追踪累积，与黄点保持同步）
      _syncCustomerEmboss();
      const row = document.querySelector('.cust-table tbody tr[data-id="'+id+'"]');
      if (row){
        row.classList.toggle('sel', !nowHl);   // 行选中态与地图点同步（黄↔绿）
        if (!nowHl && opts.scroll) row.scrollIntoView({ block:'nearest', behavior:'smooth' });  // 点击地图黄点→右侧检索栏平滑滚动到该客户行
      }
      applyHideUnselected();   // 选中态变化后同步“隐藏未选客户”：仅保留绿点，隐藏其余黄点
    }
    // 世界地图搜索客户跳转后，自动点亮对应客户行（变黄 + 放大定位一级区域）：等客户数据+省份地图都就绪再执行，保证只触发一次
    function applyPendingHl(){
      if (_pendingHl == null) return;
      if (!window.__custList || !_features || !_zoom || !_gCust) return;  // 尚未就绪 → 由另一处钩子稍后重试
      const id = _pendingHl; _pendingHl = null;
      highlightCustomer(id);
    }
    function showCustTip(r){
      const tip = $('mapTip');
      tip.innerHTML = '<b style="color:#86efac">' + esc(r.company) + '</b>'
        + (r.city ? '<br><span style="opacity:.85">' + esc(r.city) + '</span>' : '')
        + (r.address ? '<br>' + esc(r.address) : '')
        + (r.phone ? '<br><span style="opacity:.7">' + esc(r.phone) + '</span>' : '');
      tip.style.display = 'block';
    }

    loadHolidays(); loadFX(); loadProvinces(); loadCustomers();

    // —— 看门狗：若地图 SVG 被外部脚本意外移除（如预览平台重写 DOM），自动重建 ——
    (function wd(){
      const m = document.getElementById('map');
      if (m && (!_svg || !_svg.node().isConnected) && _topo){
        try { renderProvinces(''); if (showAdm2 && _topo2){ renderAdm2(); _provFill.forEach(n => n.style.pointerEvents = 'none'); } } catch(e){}
        if (window.__custList) drawCustomerPointsOnMap(window.__custList);
      }
      setTimeout(wd, 1500);
    })();
  })();
  