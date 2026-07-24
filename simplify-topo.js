// 几何抽稀脚本 v2：逐要素简化 + 退化/过度简化要素保留原几何（兜底），根治缩放卡顿
const fs = require('fs');
const path = require('path');
const NM = 'C:/Users/Administrator/.workbuddy/binaries/node/workspace/node_modules';
const topojson = require(path.join(NM, 'topojson-client'));
const { geoContains, geoCentroid } = require(path.join(NM, 'd3-geo'));
const { topology } = require(path.join(NM, 'topojson-server'));
let simplifyFn = require(path.join(NM, '@turf/simplify'));
if (simplifyFn && simplifyFn.default) simplifyFn = simplifyFn.default;
const DIR = 'C:/Users/Administrator/WorkBuddy/2026-07-14-09-19-47/webapp/provinces';

function ringValid(f) {
  const g = f.geometry; if (!g) return false;
  const polys = g.type === 'Polygon' ? [g.coordinates] : (g.type === 'MultiPolygon' ? g.coordinates : []);
  for (const poly of polys) for (const ring of poly) if (!ring || ring.length < 4) return false;
  return true;
}
// 逐要素简化；退化或质心校验失败的要素回退保留原几何
function simplifyFC(fc, tol) {
  const out = { type: 'FeatureCollection', features: [] };
  let kept = 0;
  fc.features.forEach(f => {
    let s;
    try { s = simplifyFn(f, { tolerance: tol, highQuality: false, mutate: false }); }
    catch (e) { s = f; kept++; return out.features.push(f); }
    let ok = false;
    try { const c = geoCentroid(s); ok = ringValid(s) && geoContains(s, c); } catch (e) { ok = false; }
    if (ok) out.features.push(s); else { out.features.push(f); kept++; }
  });
  return { fc: out, kept };
}
function countPts(topo) { let n = 0; (topo.arcs || []).forEach(a => n += a.length); return n; }
function countPtsGeo(fc) {
  let n = 0;
  fc.features.forEach(f => {
    const g = f.geometry; if (!g) return;
    const polys = g.type === 'Polygon' ? [g.coordinates] : (g.type === 'MultiPolygon' ? g.coordinates : []);
    polys.forEach(poly => poly.forEach(ring => n += ring.length));
  });
  return n;
}
function simplifyTopo(file, tol) {
  const abs = path.join(DIR, file);
  const raw = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const beforeSize = Buffer.byteLength(JSON.stringify(raw));
  let fc, beforePts;
  if (raw.type === 'Topology') { const obj = Object.keys(raw.objects)[0]; fc = topojson.feature(raw, raw.objects[obj]); beforePts = countPts(raw); }
  else { fc = raw; beforePts = countPtsGeo(raw); }
  const { fc: simp, kept } = simplifyFC(fc, tol);
  let out;
  if (raw.type === 'Topology') { const obj = Object.keys(raw.objects)[0]; const q = raw.quantization || 1e5; out = topology({ [obj]: simp }, q); }
  else { out = simp; }
  const afterPts = (out.type === 'Topology') ? countPts(out) : countPtsGeo(out);
  const afterSize = Buffer.byteLength(JSON.stringify(out));
  fs.writeFileSync(abs, JSON.stringify(out));
  console.log(
    file.padEnd(20), 'tol=' + tol,
    'pts', String(beforePts).padStart(7), '->', String(afterPts).padStart(7),
    '(' + (afterPts / beforePts * 100).toFixed(1) + '%)',
    'size', (beforeSize / 1048576).toFixed(2) + 'M ->', (afterSize / 1048576).toFixed(2) + 'M',
    'keptOriginal=' + kept
  );
}
console.log('=== 几何抽稀 v2（逐要素 + 兜底）===');
simplifyTopo('us.json', 0.005);
simplifyTopo('mx.json', 0.005);
simplifyTopo('mx_adm2.min.json', 0.002);
console.log('OK: 所有要素质心校验通过（退化/过度简化要素已保留原几何）');
