# -*- coding: utf-8 -*-
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, 'countries-110m.json'), 'r', encoding='utf-8') as f:
    topo = json.load(f)

# 国家信息映射：key = world-atlas properties.name（英文名）
# 值 = [中文名, 大洲, IANA时区, ISO2]
COUNTRY = {
    'China': ['中国', '亚洲', 'Asia/Shanghai', 'cn'],
    'Bangladesh': ['孟加拉国', '亚洲', 'Asia/Dhaka', 'bd'],
    'India': ['印度', '亚洲', 'Asia/Kolkata', 'in'],
    'Japan': ['日本', '亚洲', 'Asia/Tokyo', 'jp'],
    'South Korea': ['韩国', '亚洲', 'Asia/Seoul', 'kr'],
    'North Korea': ['朝鲜', '亚洲', 'Asia/Pyongyang', 'kp'],
    'Vietnam': ['越南', '亚洲', 'Asia/Ho_Chi_Minh', 'vn'],
    'Thailand': ['泰国', '亚洲', 'Asia/Bangkok', 'th'],
    'Malaysia': ['马来西亚', '亚洲', 'Asia/Kuala_Lumpur', 'my'],
    'Singapore': ['新加坡', '亚洲', 'Asia/Singapore', 'sg'],
    'Indonesia': ['印度尼西亚', '亚洲', 'Asia/Jakarta', 'id'],
    'Philippines': ['菲律宾', '亚洲', 'Asia/Manila', 'ph'],
    'Pakistan': ['巴基斯坦', '亚洲', 'Asia/Karachi', 'pk'],
    'Sri Lanka': ['斯里兰卡', '亚洲', 'Asia/Colombo', 'lk'],
    'Myanmar': ['缅甸', '亚洲', 'Asia/Yangon', 'mm'],
    'Cambodia': ['柬埔寨', '亚洲', 'Asia/Phnom_Penh', 'kh'],
    'Laos': ['老挝', '亚洲', 'Asia/Vientiane', 'la'],
    'Nepal': ['尼泊尔', '亚洲', 'Asia/Kathmandu', 'np'],
    'Bhutan': ['不丹', '亚洲', 'Asia/Thimphu', 'bt'],
    'Mongolia': ['蒙古', '亚洲', 'Asia/Ulaanbaatar', 'mn'],
    'Kazakhstan': ['哈萨克斯坦', '亚洲', 'Asia/Almaty', 'kz'],
    'Uzbekistan': ['乌兹别克斯坦', '亚洲', 'Asia/Tashkent', 'uz'],
    'Turkmenistan': ['土库曼斯坦', '亚洲', 'Asia/Ashgabat', 'tm'],
    'Kyrgyzstan': ['吉尔吉斯斯坦', '亚洲', 'Asia/Bishkek', 'kg'],
    'Tajikistan': ['塔吉克斯坦', '亚洲', 'Asia/Dushanbe', 'tj'],
    'Afghanistan': ['阿富汗', '亚洲', 'Asia/Kabul', 'af'],
    'Iran': ['伊朗', '亚洲', 'Asia/Tehran', 'ir'],
    'Iraq': ['伊拉克', '亚洲', 'Asia/Baghdad', 'iq'],
    'Saudi Arabia': ['沙特阿拉伯', '亚洲', 'Asia/Riyadh', 'sa'],
    'United Arab Emirates': ['阿拉伯联合酋长国', '亚洲', 'Asia/Dubai', 'ae'],
    'Qatar': ['卡塔尔', '亚洲', 'Asia/Qatar', 'qa'],
    'Kuwait': ['科威特', '亚洲', 'Asia/Kuwait', 'kw'],
    'Oman': ['阿曼', '亚洲', 'Asia/Muscat', 'om'],
    'Yemen': ['也门', '亚洲', 'Asia/Aden', 'ye'],
    'Syria': ['叙利亚', '亚洲', 'Asia/Damascus', 'sy'],
    'Jordan': ['约旦', '亚洲', 'Asia/Amman', 'jo'],
    'Lebanon': ['黎巴嫩', '亚洲', 'Asia/Beirut', 'lb'],
    'Israel': ['以色列', '亚洲', 'Asia/Jerusalem', 'il'],
    'Turkey': ['土耳其', '亚洲', 'Europe/Istanbul', 'tr'],
    'Palestine': ['巴勒斯坦', '亚洲', 'Asia/Hebron', 'ps'],
    'Egypt': ['埃及', '非洲', 'Africa/Cairo', 'eg'],
    'Libya': ['利比亚', '非洲', 'Africa/Tripoli', 'ly'],
    'Tunisia': ['突尼斯', '非洲', 'Africa/Tunis', 'tn'],
    'Algeria': ['阿尔及利亚', '非洲', 'Africa/Algiers', 'dz'],
    'Morocco': ['摩洛哥', '非洲', 'Africa/Casablanca', 'ma'],
    'Sudan': ['苏丹', '非洲', 'Africa/Khartoum', 'sd'],
    'South Sudan': ['南苏丹', '非洲', 'Africa/Juba', 'ss'],
    'Ethiopia': ['埃塞俄比亚', '非洲', 'Africa/Addis_Ababa', 'et'],
    'Somalia': ['索马里', '非洲', 'Africa/Mogadishu', 'so'],
    'Kenya': ['肯尼亚', '非洲', 'Africa/Nairobi', 'ke'],
    'Tanzania': ['坦桑尼亚', '非洲', 'Africa/Dar_es_Salaam', 'tz'],
    'Uganda': ['乌干达', '非洲', 'Africa/Kampala', 'ug'],
    'Rwanda': ['卢旺达', '非洲', 'Africa/Kigali', 'rw'],
    'Nigeria': ['尼日利亚', '非洲', 'Africa/Lagos', 'ng'],
    'Ghana': ['加纳', '非洲', 'Africa/Accra', 'gh'],
    "Côte d'Ivoire": ['科特迪瓦', '非洲', 'Africa/Abidjan', 'ci'],
    'Senegal': ['塞内加尔', '非洲', 'Africa/Dakar', 'sn'],
    'Mali': ['马里', '非洲', 'Africa/Bamako', 'ml'],
    'Niger': ['尼日尔', '非洲', 'Africa/Niamey', 'ne'],
    'Chad': ['乍得', '非洲', 'Africa/Ndjamena', 'td'],
    'Cameroon': ['喀麦隆', '非洲', 'Africa/Douala', 'cm'],
    'Dem. Rep. Congo': ['刚果民主共和国', '非洲', 'Africa/Kinshasa', 'cd'],
    'Congo': ['刚果共和国', '非洲', 'Africa/Brazzaville', 'cg'],
    'Zambia': ['赞比亚', '非洲', 'Africa/Lusaka', 'zm'],
    'Zimbabwe': ['津巴布韦', '非洲', 'Africa/Harare', 'zw'],
    'Mozambique': ['莫桑比克', '非洲', 'Africa/Maputo', 'mz'],
    'Angola': ['安哥拉', '非洲', 'Africa/Luanda', 'ao'],
    'Botswana': ['博茨瓦纳', '非洲', 'Africa/Gaborone', 'bw'],
    'Namibia': ['纳米比亚', '非洲', 'Africa/Windhoek', 'na'],
    'South Africa': ['南非', '非洲', 'Africa/Johannesburg', 'za'],
    'Madagascar': ['马达加斯加', '非洲', 'Indian/Antananarivo', 'mg'],
    'Brazil': ['巴西', '南美洲', 'America/Sao_Paulo', 'br'],
    'Argentina': ['阿根廷', '南美洲', 'America/Argentina/Buenos_Aires', 'ar'],
    'Chile': ['智利', '南美洲', 'America/Santiago', 'cl'],
    'Peru': ['秘鲁', '南美洲', 'America/Lima', 'pe'],
    'Colombia': ['哥伦比亚', '南美洲', 'America/Bogota', 'co'],
    'Venezuela': ['委内瑞拉', '南美洲', 'America/Caracas', 've'],
    'Ecuador': ['厄瓜多尔', '南美洲', 'America/Guayaquil', 'ec'],
    'Bolivia': ['玻利维亚', '南美洲', 'America/La_Paz', 'bo'],
    'Paraguay': ['巴拉圭', '南美洲', 'America/Asuncion', 'py'],
    'Uruguay': ['乌拉圭', '南美洲', 'America/Montevideo', 'uy'],
    'Guyana': ['圭亚那', '南美洲', 'America/Guyana', 'gy'],
    'Suriname': ['苏里南', '南美洲', 'America/Paramaribo', 'sr'],
    'Mexico': ['墨西哥', '北美洲', 'America/Mexico_City', 'mx'],
    'United States of America': ['美国', '北美洲', 'America/New_York', 'us'],
    'Canada': ['加拿大', '北美洲', 'America/Toronto', 'ca'],
    'Cuba': ['古巴', '北美洲', 'America/Havana', 'cu'],
    'Haiti': ['海地', '北美洲', 'America/Port-au-Prince', 'ht'],
    'Dominican Republic': ['多米尼加', '北美洲', 'America/Santo_Domingo', 'do'],
    'Jamaica': ['牙买加', '北美洲', 'America/Jamaica', 'jm'],
    'Guatemala': ['危地马拉', '北美洲', 'America/Guatemala', 'gt'],
    'Honduras': ['洪都拉斯', '北美洲', 'America/Tegucigalpa', 'hn'],
    'Nicaragua': ['尼加拉瓜', '北美洲', 'America/Managua', 'ni'],
    'Costa Rica': ['哥斯达黎加', '北美洲', 'America/Costa_Rica', 'cr'],
    'Panama': ['巴拿马', '北美洲', 'America/Panama', 'pa'],
    'France': ['法国', '欧洲', 'Europe/Paris', 'fr'],
    'Germany': ['德国', '欧洲', 'Europe/Berlin', 'de'],
    'Italy': ['意大利', '欧洲', 'Europe/Rome', 'it'],
    'Spain': ['西班牙', '欧洲', 'Europe/Madrid', 'es'],
    'Portugal': ['葡萄牙', '欧洲', 'Europe/Lisbon', 'pt'],
    'Netherlands': ['荷兰', '欧洲', 'Europe/Amsterdam', 'nl'],
    'Belgium': ['比利时', '欧洲', 'Europe/Brussels', 'be'],
    'Switzerland': ['瑞士', '欧洲', 'Europe/Zurich', 'ch'],
    'Austria': ['奥地利', '欧洲', 'Europe/Vienna', 'at'],
    'Sweden': ['瑞典', '欧洲', 'Europe/Stockholm', 'se'],
    'Norway': ['挪威', '欧洲', 'Europe/Oslo', 'no'],
    'Denmark': ['丹麦', '欧洲', 'Europe/Copenhagen', 'dk'],
    'Finland': ['芬兰', '欧洲', 'Europe/Helsinki', 'fi'],
    'Iceland': ['冰岛', '欧洲', 'Atlantic/Reykjavik', 'is'],
    'Ireland': ['爱尔兰', '欧洲', 'Europe/Dublin', 'ie'],
    'United Kingdom': ['英国', '欧洲', 'Europe/London', 'gb'],
    'Poland': ['波兰', '欧洲', 'Europe/Warsaw', 'pl'],
    'Czechia': ['捷克', '欧洲', 'Europe/Prague', 'cz'],
    'Slovakia': ['斯洛伐克', '欧洲', 'Europe/Bratislava', 'sk'],
    'Hungary': ['匈牙利', '欧洲', 'Europe/Budapest', 'hu'],
    'Romania': ['罗马尼亚', '欧洲', 'Europe/Bucharest', 'ro'],
    'Bulgaria': ['保加利亚', '欧洲', 'Europe/Sofia', 'bg'],
    'Greece': ['希腊', '欧洲', 'Europe/Athens', 'gr'],
    'Croatia': ['克罗地亚', '欧洲', 'Europe/Zagreb', 'hr'],
    'Serbia': ['塞尔维亚', '欧洲', 'Europe/Belgrade', 'rs'],
    'Slovenia': ['斯洛文尼亚', '欧洲', 'Europe/Ljubljana', 'si'],
    'Lithuania': ['立陶宛', '欧洲', 'Europe/Vilnius', 'lt'],
    'Latvia': ['拉脱维亚', '欧洲', 'Europe/Riga', 'lv'],
    'Estonia': ['爱沙尼亚', '欧洲', 'Europe/Tallinn', 'ee'],
    'Ukraine': ['乌克兰', '欧洲', 'Europe/Kyiv', 'ua'],
    'Belarus': ['白俄罗斯', '欧洲', 'Europe/Minsk', 'by'],
    'Russia': ['俄罗斯', '欧洲', 'Europe/Moscow', 'ru'],
    'Moldova': ['摩尔多瓦', '欧洲', 'Europe/Chisinau', 'md'],
    'Australia': ['澳大利亚', '大洋洲', 'Australia/Sydney', 'au'],
    'New Zealand': ['新西兰', '大洋洲', 'Pacific/Auckland', 'nz'],
    'Papua New Guinea': ['巴布亚新几内亚', '大洋洲', 'Pacific/Port_Moresby', 'pg'],
    'Fiji': ['斐济', '大洋洲', 'Pacific/Fiji', 'fj'],
}

# 已配置专属板块的国家（点击直接进系统对应板块，其余显示建设中提示）
CONFIGURED = {'bd': '孟加拉客户文件'}

HTML = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>世界地图 · 客户分布 | 新华健康外贸业务信息查询</title>
<style>
  :root{
    --bg1:#0b1220; --bg2:#0f1c33; --brand:#0ea5e9; --brand2:#0d9488;
    --ink:#e2e8f0; --muted:#94a3b8;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;height:100%;}
  body{
    font-family:-apple-system,'Segoe UI','Microsoft YaHei',sans-serif;
    color:var(--ink);
    background:
      radial-gradient(1200px 700px at 70% -10%, rgba(14,165,233,.18), transparent 60%),
      radial-gradient(900px 600px at 10% 110%, rgba(13,148,136,.16), transparent 55%),
      linear-gradient(160deg, var(--bg1), var(--bg2));
    min-height:100vh;
    display:flex; flex-direction:column;
  }
  header.top{
    display:flex; align-items:center; gap:14px;
    padding:16px 22px; border-bottom:1px solid rgba(255,255,255,.08);
    background:rgba(11,18,32,.55); backdrop-filter:blur(8px);
  }
  header.top .logo{ height:34px; width:auto; }
  header.top h1{ font-size:18px; margin:0; letter-spacing:1px; font-weight:700; }
  header.top .sub{ color:var(--muted); font-size:12px; margin-left:6px; }
  header.top .spacer{ flex:1; }
  .back{ position:fixed; top:16px; right:16px; z-index:60; display:inline-flex; align-items:center; gap:6px; height:36px; color:#fff; text-decoration:none; font-size:13px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Source Han Sans SC','Noto Sans CJK SC',Roboto,Helvetica,Arial,sans-serif; font-weight:600; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); padding:0 14px; border-radius:10px; transition:.18s; white-space:nowrap; box-sizing:border-box; }
  .back:hover{ background:rgba(255,255,255,.2); transform:translateY(-1px); }

  .layout{ flex:1; position:relative; }
  /* 整体轻微透明度 + 层次感 */
  .globe{
    position:absolute; inset:0;
    opacity:.94;
  }
  .globe svg{ width:100%; height:100%; display:block; }
  .country{
    fill:rgba(56,189,248,.26);
    stroke:rgba(8,15,30,.85); stroke-width:.5;
    transition:fill .15s ease, stroke .15s ease;
    cursor:pointer;
  }
  .country:hover{
    fill:rgba(56,189,248,.95);
    stroke:#fff; stroke-width:1;
  }
  .country.active{
    fill:rgba(13,148,136,.95); stroke:#fff; stroke-width:1;
  }
  .sphere{ fill:rgba(8,15,30,.35); stroke:rgba(255,255,255,.08); stroke-width:1; }

  /* 顶部占位提示（国家板块建设中） */
  .banner{
    position:absolute; left:50%; top:14px; transform:translateX(-50%);
    background:rgba(13,148,136,.92); color:#fff; padding:10px 18px; border-radius:12px;
    font-size:14px; box-shadow:0 10px 30px rgba(0,0,0,.35); z-index:5;
    display:none; pointer-events:none;
  }
  .banner b{ font-weight:700; }

  /* 信息框 tooltip */
  .tip{
    position:fixed; z-index:20; pointer-events:none;
    min-width:180px; max-width:260px;
    background:rgba(15,23,42,.86); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,.16); border-radius:12px;
    padding:12px 14px; color:var(--ink);
    box-shadow:0 16px 40px rgba(0,0,0,.45);
    opacity:0; transform:translateY(6px); transition:opacity .12s ease, transform .12s ease;
    font-size:13px; line-height:1.7;
  }
  .tip.show{ opacity:1; transform:translateY(0); }
  .tip .cn{ font-size:15px; font-weight:700; }
  .tip .en{ color:var(--muted); font-size:12px; margin-bottom:6px; }
  .tip .row{ display:flex; justify-content:space-between; gap:12px; }
  .tip .row .k{ color:var(--muted); }
  .tip .row .v{ color:#fff; font-variant-numeric:tabular-nums; }
  .tip .hint{ margin-top:7px; font-size:11px; color:var(--brand); }
  .hintbar{ position:absolute; left:22px; bottom:16px; color:var(--muted); font-size:12px; z-index:4; }
</style>
</head>
<body>
  <header class="top">
    <img src="shinva_logo.png" alt="SHINVA Health" class="logo">
    <h1>世界地图<span class="sub">· 客户分布</span></h1>
    <span class="spacer"></span>
  </header>
  <a class="back" href="index.html">← 返回综合索引</a>
  <div class="layout">
    <div class="banner" id="banner"></div>
    <div class="globe" id="globe"></div>
    <div class="hintbar">悬停查看国家信息 · 点击进入该国专属板块</div>
  </div>
  <div class="tip" id="tip">
    <div class="cn" id="tipCn"></div>
    <div class="en" id="tipEn"></div>
    <div class="row"><span class="k">中文名称</span><span class="v" id="tipCn2"></span></div>
    <div class="row"><span class="k">英文名称</span><span class="v" id="tipEn2"></span></div>
    <div class="row"><span class="k">所属大洲</span><span class="v" id="tipCont"></span></div>
    <div class="row"><span class="k">当地时间</span><span class="v" id="tipTime"></span></div>
    <div class="hint" id="tipHint"></div>
  </div>

  <script src="d3.v7.min.js"></script>
  <script src="topojson-client.min.js"></script>
  <script>
  const WORLD = __TOPO__;
  const COUNTRY = __COUNTRY__;
  const CONFIGURED = __CONFIGURED__;

  const tip = document.getElementById('tip');
  const tipCn = document.getElementById('tipCn');
  const tipEn = document.getElementById('tipEn');
  const tipCn2 = document.getElementById('tipCn2');
  const tipEn2 = document.getElementById('tipEn2');
  const tipCont = document.getElementById('tipCont');
  const tipTime = document.getElementById('tipTime');
  const tipHint = document.getElementById('tipHint');
  const banner = document.getElementById('banner');

  function fmtTime(tz){
    try{
      return new Intl.DateTimeFormat('zh-CN',{timeZone:tz, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false}).format(new Date());
    }catch(e){ return '—'; }
  }
  let curTz = null;
  setInterval(()=>{ if(curTz){ tipTime.textContent = fmtTime(curTz); } }, 1000);

  function infoOf(d){
    const name = d.properties && d.properties.name;
    return COUNTRY[name] || [name||'未知地区', '—', null, null];
  }

  const features = topojson.feature(WORLD, WORLD.objects.countries).features;
  const width = () => document.getElementById('globe').clientWidth;
  const height = () => document.getElementById('globe').clientHeight;

  const svg = d3.select('#globe').append('svg')
    .attr('preserveAspectRatio','xMidYMid meet');
  const g = svg.append('g');
  const sphere = g.append('path').attr('class','sphere');
  const paths = g.selectAll('path.country').data(features).enter()
    .append('path').attr('class','country');

  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);

  function resize(){
    const w = width(), h = height();
    svg.attr('viewBox', `0 0 ${w} ${h}`);
    projection.fitExtent([[8,8],[w-8,h-8]], {type:'Sphere'});
    sphere.attr('d', path({type:'Sphere'}));
    paths.attr('d', path);
  }
  window.addEventListener('resize', resize);
  resize();

  paths
    .on('mousemove', function(e, d){
      const [cn, cont, tz, iso2] = infoOf(d);
      curTz = tz;
      tipCn.textContent = cn; tipEn.textContent = (d.properties&&d.properties.name)||'';
      tipCn2.textContent = cn;
      tipEn2.textContent = (d.properties&&d.properties.name)||'';
      tipCont.textContent = cont;
      tipTime.textContent = tz ? fmtTime(tz) : '—';
      const configured = iso2 && CONFIGURED[iso2];
      tipHint.textContent = configured ? ('点击进入「'+configured+'」') : '点击进入该国专属板块（建设中）';
      tip.classList.add('show');
      const pad = 16, tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = e.clientX + pad, y = e.clientY + pad;
      if (x + tw > window.innerWidth) x = e.clientX - tw - pad;
      if (y + th > window.innerHeight) y = e.clientY - th - pad;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    })
    .on('mouseleave', function(){
      tip.classList.remove('show'); curTz = null;
    })
    .on('click', function(e, d){
      const [cn, cont, tz, iso2] = infoOf(d);
      const target = (iso2 && CONFIGURED[iso2]) ? ('index.html#sec='+iso2) : ('index.html#country='+ (iso2||''));
      window.location.href = target;
    });

  // 进入时若带 ?c=ISO2 / #country=ISO2 高亮并提示
  function readParam(){
    const qs = new URLSearchParams(location.search);
    const hash = location.hash.replace('#','');
    let iso2 = qs.get('c') || (hash.startsWith('country=') ? hash.slice(8) : (hash.startsWith('sec=') ? hash.slice(4) : ''));
    if (!iso2) return;
    const entry = Object.entries(COUNTRY).find(([k,v]) => v[3] === iso2);
    const cn = entry ? entry[1][0] : iso2;
    banner.innerHTML = '正在建设：<b>'+cn+'</b> 国家专属板块（即将上线）';
    banner.style.display = 'block';
    paths.classed('active', d => { const v = COUNTRY[(d.properties&&d.properties.name)]; return v && v[3] === iso2; });
  }
  readParam();
  </script>
</body>
</html>
'''

out = HTML.replace('__TOPO__', json.dumps(topo, ensure_ascii=False, separators=(',', ':')))
out = out.replace('__COUNTRY__', json.dumps(COUNTRY, ensure_ascii=False, separators=(',', ':')))
out = out.replace('__CONFIGURED__', json.dumps(CONFIGURED, ensure_ascii=False, separators=(',', ':')))

with open(os.path.join(HERE, 'worldmap.html'), 'w', encoding='utf-8') as f:
    f.write(out)

print('worldmap.html generated, size =', len(out), 'bytes')
print('countries in map:', len(features))
