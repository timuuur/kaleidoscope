#!/usr/bin/env node
// Natural Earth → data/russia.js: берёт Россию, переносит Чукотку через 180°,
// убирает Крым (границы — международно признанные) и мелкие острова, упрощает контур.
// Запуск: node dolgota/tools/make-russia.js <путь к ne_50m_admin_0_countries.geojson>
const fs = require('node:fs');
const path = require('node:path');

const [, , input, tolerance = '0.06', minArea = '0.3'] = process.argv;
if (!input) throw new Error('Укажи путь к ne_50m_admin_0_countries.geojson');

const geo = JSON.parse(fs.readFileSync(input, 'utf8'));
const russia = geo.features.find((f) => f.properties.ADM0_A3 === 'RUS');
if (!russia) throw new Error('В файле нет России (ADM0_A3 = RUS)');
const polygons = russia.geometry.type === 'Polygon' ? [russia.geometry.coordinates] : russia.geometry.coordinates;

const SIMFEROPOL = [34.1, 44.95];

const unwrap = (ring) => (ring.every(([lon]) => lon <= 0) ? ring.map(([lon, lat]) => [lon + 360, lat]) : ring);

const area = (ring) => Math.abs(ring.reduce((sum, [x1, y1], i) => {
  const [x2, y2] = ring[(i + 1) % ring.length];
  return sum + x1 * y2 - x2 * y1;
}, 0) / 2);

function inside([x, y], ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Дуглас — Пекер для незамкнутой ломаной.
function simplifyLine(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const len = Math.hypot(bx - ax, by - ay);
    let max = 0;
    let index = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      const d = len === 0 ? Math.hypot(px - ax, py - ay) : Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / len;
      if (d > max) { max = d; index = i; }
    }
    if (max > tol) {
      keep[index] = 1;
      stack.push([a, index], [index, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

// Кольцо режем в самой дальней от начала точке и упрощаем две половины.
function simplifyRing(ring, tol) {
  const open = ring.slice(0, -1);
  let far = 0;
  let best = 0;
  open.forEach(([x, y], i) => {
    const d = Math.hypot(x - open[0][0], y - open[0][1]);
    if (d > best) { best = d; far = i; }
  });
  const first = simplifyLine(open.slice(0, far + 1), tol);
  const second = simplifyLine(open.slice(far).concat([open[0]]), tol);
  return first.concat(second.slice(1));
}

const rings = polygons
  .map((polygon) => unwrap(polygon[0]))
  .filter((ring) => !inside(SIMFEROPOL, ring))
  .filter((ring) => area(ring) >= Number(minArea))
  .map((ring) => simplifyRing(ring, Number(tolerance)))
  .map((ring) => ring.map(([lon, lat]) => [Number(lon.toFixed(2)), Number(lat.toFixed(2))]));

const out = path.join(__dirname, '..', 'data', 'russia.js');
const body = JSON.stringify(rings);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `// Упрощённый контур России: Natural Earth 1:50m, общественное достояние.
// Сгенерировано tools/make-russia.js — руками не править.
(function (root, rings) {
  if (typeof module === 'object' && module.exports) module.exports = rings;
  else (root.Dolgota = root.Dolgota || {}).russia = rings;
})(typeof self !== 'undefined' ? self : this, ${body});
`);
console.log(`${rings.length} контуров, ${rings.reduce((s, r) => s + r.length, 0)} точек, ${Math.round(body.length / 1024)} КБ`);
