// Сборка макетов «Долготы»: заменяет <!--MAP {...}-->, <!--TIN {...}-->, <!--PLATE {...}-->
// в src/*.dc.html на готовый SVG и кладёт результат в build/.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RU = [[30.8,69.8],[33,69.4],[36.5,69.1],[40.5,67.8],[41,66.3],[35.5,64.4],[39.8,64.6],[43.8,66.1],[43.3,68.6],[46,67.8],[53.5,68.3],[58.5,69.2],[60.5,69.8],[66.5,69],[68.3,70.8],[69,73.4],[72.5,72],[72.8,66.8],[74.5,70],[76.5,72.5],[80.5,73.6],[87,74.8],[98,76.3],[104.3,77.7],[111,76.5],[113.5,73.7],[120,73],[127,73.6],[131,71.3],[139,71.6],[146,72.3],[152,70.9],[160,69.7],[167,69.9],[175,69.8],[180,68.9],[185,67.4],[190.2,66],[187.5,64.4],[180.5,64.9],[177.3,64.4],[179.5,62.5],[174.5,61.5],[170,60],[163.8,59],[163.2,56.2],[160.2,54.2],[158.7,52.8],[156.7,50.9],[156,52.5],[156.4,55.5],[158.4,57.8],[162,61.8],[155,59.3],[150.8,59.5],[145,59.3],[143.2,59.4],[138.2,56.5],[137.2,54.2],[140.7,53.2],[140.4,50.5],[140.3,48.8],[138,46.4],[135.2,43.8],[132.9,42.8],[130.7,42.3],[131,44],[132.2,45.2],[134,47.4],[134.7,48.3],[131,47.7],[127.5,49.8],[125.3,53.1],[121.2,53.3],[119.5,50.2],[117.8,49.6],[116.3,50],[114,50.2],[108.5,49.3],[106.3,50.3],[102,51.7],[95,50],[91.5,50.5],[88,49.6],[87.3,49.1],[85.8,49.6],[83.5,51],[80,51.2],[77.8,53.3],[76.3,54.2],[73.5,53.7],[71,54.2],[68.7,55.4],[65.5,54.6],[61.9,54],[61.4,51.4],[58,50.9],[55.3,50.6],[52.4,51.5],[50.5,51.3],[48.6,50.5],[46.9,49.3],[47.2,47.8],[49,46.4],[47.8,45.6],[47.3,44.6],[47.5,43],[48.4,41.9],[46.5,41.7],[45.5,42.5],[44.6,42.7],[42.8,43.2],[41.5,43.4],[40,43.4],[39.1,44.1],[37.8,44.7],[36.7,45.2],[38.2,46.2],[38.3,46.8],[39,47.2],[39.9,47.8],[40.1,48.9],[39.7,49.6],[38.2,50.1],[36.3,50.3],[35.3,51.2],[34.2,51.8],[32.5,52.3],[31.8,52.9],[32.1,53.8],[31.5,54.6],[30.9,55.6],[28.2,56.2],[27.6,57.3],[27.8,57.8],[28,59.1],[28.2,59.4],[30.3,59.9],[28.8,60.6],[27.8,60.5],[29.5,61.4],[31.4,62.8],[29.9,63.8],[30.1,65.2],[29.2,66.2],[30,67.6],[28.7,68.5],[28.6,69],[30,69.6]];
const KG = [[19.6,54.4],[22.8,54.4],[22.9,55.1],[21.2,55.3],[20,54.95]];
const NZ = [[52,71.2],[55.5,70.6],[57.5,71.4],[56.3,73],[58.5,74.5],[63.5,75.8],[68.5,76.9],[66.5,77.1],[60,76.3],[55,75],[53.3,73.3],[51.8,72]];
const SH = [[142,46],[143.4,46.6],[143.2,49.2],[144.6,48.7],[143.2,51.6],[143.3,53.3],[142.6,54.4],[141.7,53.3],[141.9,51.5],[142.1,49],[141.9,47.5]];
const POLYS = [RU, KG, NZ, SH];

export const PAL = {
  morning: { bg: '#F7E9DF', ink: '#3A2420', mu: '#7A5A50', card: '#F0DCCF', hero: '#F3CDB5', land: '#FAE3D3', ac: '#D9704A', on: '#35170C', sun: '#F29A6B' },
  day:     { bg: '#F8F8F5', ink: '#121212', mu: '#666661', card: '#ECECE7', hero: '#D6E6F0', land: '#F7F5EE', ac: '#EDB723', on: '#2A1F00', sun: '#F5C23A' },
  evening: { bg: '#1B2034', ink: '#F1E9DC', mu: '#A9A3B5', card: '#272D45', hero: '#2E2A4A', land: '#3D3860', ac: '#F09A4E', on: '#2B1403', sun: '#F09A4E' },
};
const REGIONS = [['Алтай', [86.5, 50.5]], ['Кавказ', [43.5, 43.3]], ['Карелия', [33, 63]]];
const SUN = [[5, 150, 55], [7, 86.5, 50.5], [13, 43.5, 43.3], [20, 33, 63], [23, 31, 67.5]];
export const HERBS = { badan: [87.7, 51.6], rodiola: [86.6, 49.8], zveroboy: [86.0, 51.4], myata: [85.6, 50.3], chabrec: [42.5, 43.3], dushica: [41.3, 43.6], shipovnik: [42.7, 43.9], melissa: [41.6, 43.3], ivanchay: [34.3, 62.2], veresk: [34.3, 63.7], tavolga: [33.0, 61.0], brusnika: [34.6, 64.9] };
const MONO = "font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace";
const SANS = "font-family: Manrope, system-ui, sans-serif";

const RAD = Math.PI / 180;
const raw = ([lo, la]) => { const t = 0.62 * (lo - 100) * RAD, r = 90 - la; return [r * Math.sin(t), r * Math.cos(t)]; };

function projector(w, h, pad, box) {
  const pts = box
    ? [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]], [(box[0] + box[2]) / 2, box[1]]]
    : POLYS.flat();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const q of pts) { const [x, y] = raw(q); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const s = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
  const ox = (w - (x1 - x0) * s) / 2 - x0 * s, oy = (h - (y1 - y0) * s) / 2 - y0 * s;
  return (q) => { const [x, y] = raw(q); return [ox + x * s, oy + y * s]; };
}

function sunLL(h) {
  for (let i = 0; i < SUN.length - 1; i++) {
    const a = SUN[i], b = SUN[i + 1];
    if (h <= b[0]) { const t = Math.max(0, (h - a[0]) / (b[0] - a[0])); return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  }
  return [SUN.at(-1)[1], SUN.at(-1)[2]];
}

export function mapSvg(o) {
  const { w, h, pal = 'day', mode = 'hero', time = 13, pad = 24, box, herbs = false, hl, meridian, labelSize = 14 } = o;
  const p = PAL[pal], pr = projector(w, h, pad, box);
  const pt = (q) => pr(q).map((v) => v.toFixed(1)).join(',');
  const path = (pts, close) => 'M' + pts.map(pt).join('L') + (close ? 'Z' : '');
  const line = (pts, attrs) => `<path d="${path(pts)}" fill="none" ${attrs}/>`;
  const mer = (lo) => { const a = []; for (let la = 38; la <= 82; la += 2) a.push([lo, la]); return a; };
  const par = (la) => { const a = []; for (let lo = 15; lo <= 195; lo += 3) a.push([lo, la]); return a; };
  let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display: block" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect width="${w}" height="${h}" fill="${p.hero}"/>`;
  s += `<path d="${POLYS.map((q) => path(q, true)).join('')}" fill="${p.land}" stroke="${p.ink}" stroke-opacity="0.55" stroke-width="1"/>`;
  for (let lo = 30; lo <= 180; lo += 15) s += line(mer(lo), `stroke="${p.mu}" stroke-opacity="0.35" stroke-width="0.8"`);
  for (const la of [50, 60, 70, 80]) s += line(par(la), `stroke="${p.mu}" stroke-opacity="0.35" stroke-width="0.8"`);
  const sun = sunLL(time), m = meridian ?? (mode === 'hero' ? Math.round(sun[0] / 15) * 15 : null);
  if (m != null) {
    s += line(mer(m), `stroke="${p.ac}" stroke-width="2"`);
    const [lx, ly] = pr([m, box ? box[1] + 0.6 : 36.6]);
    s += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="${labelSize - 1}" fill="${p.ink}" style="${MONO}">${m}° в. д.</text>`;
  }
  if (mode === 'hero') {
    const a = []; for (let t = 5; t <= 23.001; t += 0.25) a.push(sunLL(t));
    s += line(a, `stroke="${p.mu}" stroke-width="1.2" stroke-dasharray="5 6"`);
  }
  if (herbs) {
    for (const [id, q] of Object.entries(HERBS)) {
      const [x, y] = pr(q), on = id === hl;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 7 : 4.5}" fill="${on ? p.ac : p.mu}" stroke="${p.hero}" stroke-width="2"/>`;
    }
  }
  const act = time < 10.5 ? 0 : time < 16.5 ? 1 : 2;
  REGIONS.forEach(([n, q], i) => {
    const [x, y] = pr(q);
    if (x < 0 || x > w || y < 0 || y > h) return;
    const lit = mode === 'hero' && i === act;
    if (!herbs) s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${lit ? p.ac : p.mu}" stroke="${p.hero}" stroke-width="2"/>`;
    const dy = i === 1 ? labelSize + 12 : 5, dx = i === 1 ? 0 : 12, anchor = i === 1 ? 'middle' : 'start';
    s += `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}" font-size="${labelSize}" fill="${p.ink}" style="${SANS}">${n}</text>`;
  });
  if (mode === 'hero' && time >= 5 && time <= 23) {
    const [x, y] = pr(sun);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="none" stroke="${p.sun}" stroke-opacity="0.45" stroke-width="2"/>`;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="${p.sun}"/>`;
  }
  return s + '</svg>';
}

const TINS = {
  morning: { n: 'Утро', deg: '86°', reg: 'Алтай', body: '#F4C4A1', lid: '#D9704A', tx: '#3A2420', ln: '#B4502A' },
  day: { n: 'День', deg: '43°', reg: 'Кавказ', body: '#F3D27A', lid: '#C99A12', tx: '#2A1F00', ln: '#8A6A00' },
  evening: { n: 'Вечер', deg: '33°', reg: 'Карелия', body: '#3B3F6B', lid: '#232644', tx: '#F1E9DC', ln: '#F09A4E' },
};

export function tin({ k, width = 150 }) {
  const t = TINS[k];
  return `<svg viewBox="0 0 130 170" width="${width}" style="display: block" xmlns="http://www.w3.org/2000/svg">`
    + `<rect x="15" y="30" width="100" height="132" rx="8" fill="${t.body}"/><rect x="11" y="16" width="108" height="26" rx="6" fill="${t.lid}"/>`
    + `<line x1="15" y1="62" x2="115" y2="62" stroke="${t.tx}" stroke-opacity="0.45"/><line x1="15" y1="140" x2="115" y2="140" stroke="${t.tx}" stroke-opacity="0.45"/>`
    + `<line x1="100" y1="62" x2="100" y2="140" stroke="${t.ln}" stroke-width="1.2"/><circle cx="100" cy="100" r="3.5" fill="${t.ln}"/>`
    + `<text x="22" y="81" font-size="14" fill="${t.tx}" style="${SANS}; font-weight: 700">${t.n}</text>`
    + `<text x="19" y="118" font-size="36" fill="${t.tx}" style="${SANS}; font-weight: 700; letter-spacing: -0.04em">${t.deg}</text>`
    + `<text x="22" y="134" font-size="12.5" fill="${t.tx}" style="${MONO}">${t.reg}</text>`
    + `<text x="65" y="155" font-size="12.5" text-anchor="middle" fill="${t.tx}" style="${MONO}">долгота</text></svg>`;
}

export function plate({ seed = 1, w = 240, h = 300, flower = '#C9A0C8' }) {
  let r = seed * 7919 + 13;
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const cx = w / 2, base = h - 34, top = 46;
  let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display: block" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#F4EFE4"/>`;
  s += `<path d="M${cx},${base} C${cx - 12},${(base + top) / 2} ${cx + 14},${top + 40} ${cx},${top}" fill="none" stroke="#5B6B45" stroke-width="2"/>`;
  for (let i = 0; i < 9; i++) {
    const y = base - (base - top) * (0.14 + i * 0.09), side = i % 2 ? 1 : -1, len = 24 + rnd() * 22, ang = side * (30 + rnd() * 25), lx = cx + side * len * 0.55;
    s += `<ellipse cx="${lx.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(len * 0.55).toFixed(1)}" ry="${(5 + rnd() * 4).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${lx.toFixed(1)} ${y.toFixed(1)})" fill="#8FA36B" fill-opacity="0.85" stroke="#4E5E3A" stroke-width="0.8"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const a = rnd() * Math.PI * 2, d = rnd() * 15;
    s += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(top + Math.sin(a) * d).toFixed(1)}" r="${(4 + rnd() * 3).toFixed(1)}" fill="${flower}" stroke="#6E4A6C" stroke-width="0.6"/>`;
  }
  return s + `<text x="12" y="${h - 12}" font-size="11" fill="#8A8170" style="${MONO}">заглушка гравюры</text></svg>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const here = dirname(fileURLToPath(import.meta.url)), src = join(here, 'src'), out = join(here, 'build');
  mkdirSync(out, { recursive: true });
  const fns = { MAP: mapSvg, TIN: tin, PLATE: plate };
  for (const f of readdirSync(src)) {
    if (f === 'canvas.json') { copyFileSync(join(src, f), join(out, f)); continue; }
    if (!f.endsWith('.dc.html')) continue;
    const t = readFileSync(join(src, f), 'utf8').replace(/<!--(MAP|TIN|PLATE) (\{.*?\})-->/g, (_, k, j) => fns[k](JSON.parse(j)));
    writeFileSync(join(out, f), t);
    console.log(`built ${f} ${Math.round(t.length / 1024)} KB`);
  }
}
