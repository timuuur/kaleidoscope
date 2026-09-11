// Часы сайта «Долгота»: время посетителя → фаза сбора, палитра «Небо» и положение солнца.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).clock = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const DAWN = 5 * 60;
  const NOON = 13 * 60;
  const DUSK = 18 * 60 + 30;

  const PALETTES = {
    morning: { bg: '#F7E9DF', ink: '#3A2420', mu: '#7A5A50', card: '#F0DCCF', hero: '#F3CDB5', land: '#FAE3D3', ac: '#D9704A', on: '#35170C', sun: '#F29A6B' },
    day: { bg: '#F8F8F5', ink: '#121212', mu: '#666661', card: '#ECECE7', hero: '#D6E6F0', land: '#F7F5EE', ac: '#EDB723', on: '#2A1F00', sun: '#F5C23A' },
    sunset: { bg: '#F7E6E0', ink: '#3A2226', mu: '#6E5054', card: '#F0D8D2', hero: '#F0C2B8', land: '#FAE2DC', ac: '#D9704A', on: '#35170C', sun: '#EE8A5C' },
    evening: { bg: '#1B2034', ink: '#F1E9DC', mu: '#A9A3B5', card: '#272D45', hero: '#2E2A4A', land: '#3D3860', ac: '#F09A4E', on: '#2B1403', sun: '#F09A4E' },
  };

  // Путь солнца: минуты суток, долгота, широта.
  const SUN_PATH = [[300, 150, 55], [420, 86.5, 50.5], [780, 43.5, 43.3], [1200, 33, 63], [1380, 31, 67.5]];

  function parseTime(value) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? '').trim());
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    return h < 24 && min < 60 ? h * 60 + min : null;
  }

  function timeFromSearch(search) {
    const value = new URLSearchParams(search || '').get('time');
    return value === null ? null : parseTime(value);
  }

  function formatTime(min) {
    return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  }

  function blendAt(min) {
    if (min >= 300 && min < 630) return 'morning';
    if (min >= 630 && min < 990) return 'day';
    return 'evening';
  }

  function isDark(min) {
    return min < DAWN || min >= DUSK;
  }

  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const toHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  const mix = (a, b, t) => {
    const A = rgb(a);
    const B = rgb(b);
    return toHex(A.map((v, i) => v + (B[i] - v) * t));
  };

  // Светлая фаза плавно течёт «утро → день → закат»; на границе с тёмной фазой — переключение.
  function paletteAt(min) {
    if (isDark(min)) return { ...PALETTES.evening };
    const [from, to, t] = min < NOON
      ? [PALETTES.morning, PALETTES.day, (min - DAWN) / (NOON - DAWN)]
      : [PALETTES.day, PALETTES.sunset, (min - NOON) / (DUSK - NOON)];
    const out = {};
    for (const key of Object.keys(from)) out[key] = mix(from[key], to[key], t);
    return out;
  }

  function sunAt(min) {
    const last = SUN_PATH.length - 1;
    if (min < SUN_PATH[0][0] || min > SUN_PATH[last][0]) return { lon: null, lat: null, visible: false };
    const i = SUN_PATH.findIndex(([m]) => m >= min);
    const [m1, lon1, lat1] = SUN_PATH[i];
    if (m1 === min) return { lon: lon1, lat: lat1, visible: true };
    const [m0, lon0, lat0] = SUN_PATH[i - 1];
    const t = (min - m0) / (m1 - m0);
    return { lon: lon0 + (lon1 - lon0) * t, lat: lat0 + (lat1 - lat0) * t, visible: true };
  }

  function luminance(hex) {
    const [r, g, b] = rgb(hex).map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrast(a, b) {
    const x = luminance(a);
    const y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }

  function nowMinutes(date, search) {
    const fromUrl = timeFromSearch(search);
    return fromUrl !== null ? fromUrl : date.getHours() * 60 + date.getMinutes();
  }

  function applyPalette(tokens, el) {
    for (const [key, value] of Object.entries(tokens)) el.style.setProperty('--' + key, value);
  }

  // Дальше — только браузер: живые часы и время от перетащенного солнца.
  let override = null;
  let listener = null;

  function current() {
    return override !== null ? override : nowMinutes(new Date(), location.search);
  }

  function emit() {
    const min = current();
    const html = document.documentElement;
    applyPalette(paletteAt(min), html);
    html.dataset.theme = isDark(min) ? 'dark' : 'light';
    if (listener) listener(min, override !== null);
  }

  function start(onTick) {
    listener = onTick;
    emit();
    setInterval(() => { if (override === null) emit(); }, 60 * 1000);
  }

  function setOverride(min) {
    override = min === null ? null : Math.max(0, Math.min(1439, Math.round(min)));
    emit();
  }

  return { PALETTES, parseTime, timeFromSearch, formatTime, blendAt, isDark, paletteAt, sunAt, contrast, nowMinutes, applyPalette, start, setOverride, current };
});
