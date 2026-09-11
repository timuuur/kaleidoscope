# «Долгота» — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать учебный сайт «Долгота» — главную и гербарий, где палитра и солнце на карте-атласе следуют местному времени посетителя.

**Architecture:** Статический сайт без сборки: обычные `<script defer>`, общее пространство имён `window.Dolgota`. Чистая логика (часы, данные, магазин, проекция карты) — в модулях с UMD-хвостом, чтобы их можно было подключить и в браузере, и в тестах Node. Страницы строятся из данных `data.js`; палитра пишется в CSS-переменные.

**Tech Stack:** HTML, CSS, JavaScript (ES2020), Node ≥ 20 только для тестов (`node --test`) и одноразового скрипта карты. Шрифты — Google Fonts. Зависимостей нет.

**Spec:** `docs/superpowers/specs/2026-09-10-dolgota-design.md`. Утверждённый макет: `docs/superpowers/mockups/dolgota/` (исходники артбордов) и https://claude.ai/code/artifact/de601e6f-afdf-4649-b934-355ab4602386.

## Global Constraints

- Всё живёт в `dolgota/`; сборки, `package.json` и зависимостей нет.
- Скрипты подключаются `<script defer src="...">`, без `type="module"`: сайт должен работать по двойному клику (`file://`). Данные — в `.js`, не в JSON.
- Язык интерфейса и текстов — русский; типографика: «ёлочки», „лапки“ внутри, тире «—», неразрывный пробел перед «₽», «%», «°C» и после предлогов в заголовках.
- Шрифты: Manrope 400/500/700, JetBrains Mono 400/500, Cormorant Garamond курсив 500; запасные `system-ui, sans-serif`, `ui-monospace, Consolas, monospace`, `Georgia, serif`. Меньше 12 px текста нет.
- Палитра и её правила — строго по таблице раздела 3.1 спецификации; контраст всех текстовых пар ≥ 4,5 : 1 на каждые 5 минут суток.
- Фазы сборов: «Утро» 05:00–10:30, «День» 10:30–16:30, «Вечер» 16:30–05:00. Тёмная тема 18:30–05:00.
- Цены: банка 690 ₽ (подписка 587 ₽), набор 1 790 ₽ (подписка 1 522 ₽); скидка 15 %, `Math.round`.
- Текст нигде не выходит за рамки контейнера — проверка `?debug=overflow` на 360, 768 и 1280 px при `?time=07:00`, `13:00`, `21:00`.
- Никаких отзывов, логотипов прессы и медицинских обещаний. В подвале: «Учебный проект: магазин вымышленный, заказы не принимаются» и «Не является лекарственным средством».
- Скачивание любых файлов (Natural Earth, гравюры) — только после явного разрешения пользователя с названием, источником и размером.
- Коммиты — только своих файлов (`git add <пути>`), никогда `git add -A`: рядом живёт чужая папка `pyaterochka/`.

## Файлы

```
dolgota/
  index.html              — главная (Task 6)
  herbarium.html          — гербарий (Task 7)
  README.md               — запуск и устройство (Task 8)
  css/tokens.css          — CSS-переменные дневной палитры, шрифты, шкала (Task 5)
  css/base.css            — сброс, типографика, общие компоненты, шапка, подвал (Task 5)
  css/home.css            — блоки главной (Task 6)
  css/herbarium.css       — блоки гербария (Task 7)
  js/clock.js             — часы сайта: фаза, палитра, солнце, контраст (Task 1)
  js/data.js              — сборы, травы, регионы, цены, источники (Task 2)
  js/shop.js              — цены по подписке, счётчик игрушечной корзины (Task 2)
  js/atlas.js             — проекция, геометрия и SVG-карта, перетаскивание солнца (Tasks 3–4)
  js/tin.js               — SVG-банка сбора (Task 5)
  js/fit.js               — подгонка надписей в SVG и режим ?debug=overflow (Task 5)
  js/site.js              — общее для страниц: корзина с тостом, меню, рассылка (Task 6)
  js/home.js              — логика главной (Task 6)
  js/herbarium.js         — логика гербария (Task 7)
  data/russia.js          — упрощённый контур России (Task 3)
  img/herbs/*.jpg         — гравюры (Task 7)
  tools/make-russia.js    — Natural Earth → data/russia.js (Task 3)
  tools/serve.js          — локальный сервер для проверки (Task 6)
  tests/clock.test.js     — Task 1
  tests/data.test.js      — Task 2
  tests/shop.test.js      — Task 2
  tests/atlas.test.js     — Tasks 3–4
  tests/tin.test.js       — Task 5
  tests/images.test.js    — Task 7
```

---

### Task 1: Часы сайта — `clock.js`

**Files:**
- Create: `dolgota/js/clock.js`
- Test: `dolgota/tests/clock.test.js`

**Interfaces:**
- Consumes: ничего.
- Produces: `Dolgota.clock` (в Node — `require('../js/clock.js')`):
  - `PALETTES` — `{ morning, day, sunset, evening }`, каждый `{ bg, ink, mu, card, hero, land, ac, on, sun }` (строки `#RRGGBB` в верхнем регистре);
  - `parseTime(value: string) → number | null` — минуты с полуночи;
  - `timeFromSearch(search: string) → number | null` — из `?time=ЧЧ:ММ`;
  - `formatTime(min: number) → 'ЧЧ:ММ'`;
  - `blendAt(min) → 'morning' | 'day' | 'evening'`;
  - `isDark(min) → boolean`;
  - `paletteAt(min) → { bg, ink, mu, card, hero, land, ac, on, sun }`;
  - `sunAt(min) → { lon: number | null, lat: number | null, visible: boolean }`;
  - `contrast(hexA, hexB) → number` (WCAG);
  - `nowMinutes(date: Date, search: string) → number`;
  - `applyPalette(tokens, el: HTMLElement)` — пишет `--bg`, `--ink`… в `el.style`;
  - `start(onTick: (min: number, overridden: boolean) => void)` — применяет палитру, ставит `data-theme` на `<html>`, зовёт `onTick` сразу и раз в минуту;
  - `setOverride(min: number | null)` — время от перетащенного солнца, `null` — вернуть местное;
  - `current() → number` — текущие минуты с учётом override и `?time=`.

- [ ] **Step 1: Write the failing test**

`dolgota/tests/clock.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const clock = require('../js/clock.js');

test('parseTime понимает ЧЧ:ММ и отвергает мусор', () => {
  assert.equal(clock.parseTime('07:40'), 460);
  assert.equal(clock.parseTime('7:05'), 425);
  assert.equal(clock.parseTime('23:59'), 1439);
  assert.equal(clock.parseTime('24:00'), null);
  assert.equal(clock.parseTime('12:60'), null);
  assert.equal(clock.parseTime('abc'), null);
  assert.equal(clock.parseTime(''), null);
});

test('timeFromSearch читает ?time=', () => {
  assert.equal(clock.timeFromSearch('?time=19:30'), 1170);
  assert.equal(clock.timeFromSearch('?time=oops'), null);
  assert.equal(clock.timeFromSearch(''), null);
});

test('formatTime дополняет нулями', () => {
  assert.equal(clock.formatTime(460), '07:40');
  assert.equal(clock.formatTime(0), '00:00');
});

test('границы фаз сборов', () => {
  assert.equal(clock.blendAt(299), 'evening');
  assert.equal(clock.blendAt(300), 'morning');
  assert.equal(clock.blendAt(629), 'morning');
  assert.equal(clock.blendAt(630), 'day');
  assert.equal(clock.blendAt(989), 'day');
  assert.equal(clock.blendAt(990), 'evening');
});

test('тёмная тема с 18:30 до 05:00', () => {
  assert.equal(clock.isDark(299), true);
  assert.equal(clock.isDark(300), false);
  assert.equal(clock.isDark(1109), false);
  assert.equal(clock.isDark(1110), true);
});

test('палитра в опорных точках', () => {
  assert.deepEqual(clock.paletteAt(300), clock.PALETTES.morning);
  assert.deepEqual(clock.paletteAt(780), clock.PALETTES.day);
  assert.deepEqual(clock.paletteAt(1110), clock.PALETTES.evening);
  assert.deepEqual(clock.paletteAt(120), clock.PALETTES.evening);
});

test('солнце в опорных точках и ночью', () => {
  assert.deepEqual(clock.sunAt(420), { lon: 86.5, lat: 50.5, visible: true });
  assert.deepEqual(clock.sunAt(780), { lon: 43.5, lat: 43.3, visible: true });
  assert.deepEqual(clock.sunAt(1200), { lon: 33, lat: 63, visible: true });
  assert.equal(clock.sunAt(1381).visible, false);
  assert.equal(clock.sunAt(299).visible, false);
});

test('контраст текстовых пар не ниже 4,5 : 1 на каждые 5 минут суток', () => {
  const pairs = [['ink', 'bg'], ['mu', 'bg'], ['ink', 'card'], ['mu', 'card'], ['ink', 'hero'], ['on', 'ac']];
  for (let min = 0; min < 1440; min += 5) {
    const p = clock.paletteAt(min);
    for (const [a, b] of pairs) {
      const c = clock.contrast(p[a], p[b]);
      assert.ok(c >= 4.5, `${clock.formatTime(min)} ${a}/${b}: ${c.toFixed(2)}`);
    }
  }
});

test('nowMinutes предпочитает ?time= часам', () => {
  const d = new Date(2026, 8, 10, 14, 20);
  assert.equal(clock.nowMinutes(d, ''), 860);
  assert.equal(clock.nowMinutes(d, '?time=07:40'), 460);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dolgota/tests/clock.test.js`
Expected: FAIL — `Cannot find module '../js/clock.js'`.

- [ ] **Step 3: Write the implementation**

`dolgota/js/clock.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dolgota/tests/clock.test.js`
Expected: PASS — 9 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add dolgota/js/clock.js dolgota/tests/clock.test.js
git commit -m "feat(dolgota): часы сайта — фазы, палитра «Небо», солнце"
```

### Task 2: Данные и магазин — `data.js`, `shop.js`

**Files:**
- Create: `dolgota/js/data.js`
- Create: `dolgota/js/shop.js`
- Test: `dolgota/tests/data.test.js`, `dolgota/tests/shop.test.js`

**Interfaces:**
- Consumes: ничего.
- Produces:
  - `Dolgota.data` (в Node — `require('../js/data.js')`):
    - `blends` — `[{ id: 'morning' | 'day' | 'evening', name, region, lon, promise, herbs: string[4], brew: { temp, minutes, dose, note }, tin: { body, lid, text, line } }]`;
    - `regions` — `{ altai | caucasus | karelia: { id, name, blend, lon, center: [lon, lat], box: [lonMin, latMin, lonMax, latMax], months, story, label: 'right' | 'below' } }`;
    - `herbs` — `[{ id, name, latin, blend, coords: [lon, lat], months: number[], taste, about, image: 'img/herbs/<id>.jpg', source: { title, url, license } }]`;
    - `prices` — `{ tin: 690, bundle: 1790, discount: 0.15, weight: '50 г' }`;
    - `blendNames` — `{ morning: 'Утро', day: 'День', evening: 'Вечер' }`;
    - `monthNames` — `['январь', …, 'декабрь']`.
  - `Dolgota.shop`:
    - `subscriptionPrice(rub: number, discount = 0.15) → number`;
    - `formatRub(rub: number) → string` — «1 790 ₽» с неразрывными пробелами;
    - `createCart(storage: Storage | null) → { count(): number, add(n = 1): number }`.

- [ ] **Step 1: Write the failing tests**

`dolgota/tests/data.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../js/data.js');

test('три сбора по четыре травы, травы знают свой сбор', () => {
  assert.deepEqual(data.blends.map((b) => b.id), ['morning', 'day', 'evening']);
  for (const blend of data.blends) {
    assert.equal(blend.herbs.length, 4, blend.id);
    for (const id of blend.herbs) {
      const herb = data.herbs.find((h) => h.id === id);
      assert.ok(herb, `${blend.id}: нет травы ${id}`);
      assert.equal(herb.blend, blend.id, id);
    }
  }
});

test('12 трав с уникальными id и заполненными полями', () => {
  assert.equal(data.herbs.length, 12);
  assert.equal(new Set(data.herbs.map((h) => h.id)).size, 12);
  for (const h of data.herbs) {
    assert.match(h.id, /^[a-z]+$/, h.id);
    for (const key of ['name', 'latin', 'taste', 'about']) assert.ok(h[key] && h[key].length > 2, `${h.id}.${key}`);
    assert.ok(h.coords.length === 2 && h.coords.every(Number.isFinite), `${h.id}.coords`);
    assert.ok(h.months.length > 0 && h.months.every((m) => m >= 1 && m <= 12), `${h.id}.months`);
    assert.equal(h.image, `img/herbs/${h.id}.jpg`);
    assert.match(h.source.url, /^https:\/\/commons\.wikimedia\.org\//, `${h.id}.source.url`);
    assert.ok(h.source.title && h.source.license, `${h.id}.source`);
  }
});

test('регионы связаны со сборами', () => {
  for (const blend of data.blends) {
    const region = data.regions[blend.region];
    assert.ok(region, blend.id);
    assert.equal(region.blend, blend.id);
    assert.equal(region.lon, blend.lon);
  }
});

test('цены и названия', () => {
  assert.deepEqual(data.prices, { tin: 690, bundle: 1790, discount: 0.15, weight: '50 г' });
  assert.deepEqual(data.blendNames, { morning: 'Утро', day: 'День', evening: 'Вечер' });
  assert.equal(data.monthNames.length, 12);
});
```

`dolgota/tests/shop.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const shop = require('../js/shop.js');

const fakeStorage = () => {
  const store = new Map();
  return {
    store,
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
};

test('цена по подписке округляется до рубля', () => {
  assert.equal(shop.subscriptionPrice(690), 587);
  assert.equal(shop.subscriptionPrice(1790), 1522);
});

test('formatRub ставит неразрывные пробелы', () => {
  assert.equal(shop.formatRub(1790), '1 790 ₽');
  assert.equal(shop.formatRub(587), '587 ₽');
});

test('корзина хранит счётчик в хранилище', () => {
  const storage = fakeStorage();
  const cart = shop.createCart(storage);
  assert.equal(cart.count(), 0);
  cart.add();
  assert.equal(cart.add(2), 3);
  assert.equal(storage.store.get('dolgota-cart'), '3');
  assert.equal(shop.createCart(storage).count(), 3);
});

test('без хранилища корзина живёт в памяти', () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  const cart = shop.createCart(broken);
  assert.equal(cart.add(), 1);
  assert.equal(cart.count(), 1);
  assert.equal(shop.createCart(null).add(), 1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test dolgota/tests/data.test.js dolgota/tests/shop.test.js`
Expected: FAIL — `Cannot find module '../js/data.js'` и `'../js/shop.js'`.

- [ ] **Step 3: Write `dolgota/js/data.js`**

```js
// Данные «Долготы»: сборы, регионы, травы, цены. Отсюда строятся главная и гербарий.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).data = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const PD = 'общественное достояние';
  const lindman = (n, file) => ({
    title: `C. A. M. Lindman, «Bilder ur Nordens Flora», 1901–1905, № ${n}`,
    url: `https://commons.wikimedia.org/wiki/File:${file}`,
    license: PD,
  });

  const blends = [
    {
      id: 'morning', name: 'Утро', region: 'altai', lon: 86, promise: 'Бодрость без кофеина',
      herbs: ['badan', 'rodiola', 'zveroboy', 'myata'],
      brew: { temp: 95, minutes: 7, dose: '1 ч. л. на 250 мл', note: 'Бадану нужна горячая вода и время, чтобы раскрыться.' },
      tin: { body: '#F4C4A1', lid: '#D9704A', text: '#3A2420', line: '#B4502A' },
    },
    {
      id: 'day', name: 'День', region: 'caucasus', lon: 43, promise: 'Ясность и тонус',
      herbs: ['chabrec', 'dushica', 'shipovnik', 'melissa'],
      brew: { temp: 90, minutes: 5, dose: '1 ч. л. на 200 мл', note: 'Чабрец и душица горчат, если передержать.' },
      tin: { body: '#F3D27A', lid: '#C99A12', text: '#2A1F00', line: '#8A6A00' },
    },
    {
      id: 'evening', name: 'Вечер', region: 'karelia', lon: 33, promise: 'Покой и сон',
      herbs: ['ivanchay', 'veresk', 'tavolga', 'brusnika'],
      brew: { temp: 85, minutes: 6, dose: '2 ч. л. на 300 мл', note: 'Иван-чай можно заварить второй раз.' },
      tin: { body: '#3B3F6B', lid: '#232644', text: '#F1E9DC', line: '#F09A4E' },
    },
  ];

  const regions = {
    altai: {
      id: 'altai', name: 'Алтай', blend: 'morning', lon: 86, center: [86.5, 50.5], box: [76, 45, 98, 57], months: 'июнь–август', label: 'right',
      story: 'Бадан берут перезимовавшим: тёмный лист и есть старинный «чигирский чай». Родиолу копают высоко в горах.',
    },
    caucasus: {
      id: 'caucasus', name: 'Кавказ', blend: 'day', lon: 43, center: [43.5, 43.3], box: [36, 40, 50, 48], months: 'июнь–июль', label: 'below',
      story: 'Чабрец и душицу срезают в пору цветения на южных склонах Приэльбрусья, пока солнце стоит высоко.',
    },
    karelia: {
      id: 'karelia', name: 'Карелия', blend: 'evening', lon: 33, center: [33, 63], box: [26, 59, 41, 67], months: 'июль–сентябрь', label: 'right',
      story: 'Иван-чай ферментируют по старому копорскому способу. Вереск собирают в конце лета, когда сопки становятся лиловыми.',
    },
  };

  const herbs = [
    {
      id: 'badan', name: 'Бадан', latin: 'Bergenia crassifolia', blend: 'morning', coords: [87.7, 51.6], months: [4, 5],
      taste: 'терпкий, с древесной ноткой',
      about: 'Крупные кожистые листья зимуют под снегом и темнеют — такой лист и называют «чигирским чаем». Собирают его весной, как только сойдёт снег.',
      image: 'img/herbs/badan.jpg',
      source: { title: '«The Botanical Magazine», т. 6, табл. 196, 1793', url: 'https://commons.wikimedia.org/wiki/File:The_Botanical_magazine,_or,_Flower-garden_displayed_(Plate_196)_(8559506873).jpg', license: PD },
    },
    {
      id: 'rodiola', name: 'Родиола', latin: 'Rhodiola rosea', blend: 'morning', coords: [86.6, 49.8], months: [8],
      taste: 'с лёгким ароматом розы',
      about: 'Растёт высоко в горах, у ручьёв и на каменистых склонах. Корень на срезе пахнет розой, отсюда латинское rosea.',
      image: 'img/herbs/rodiola.jpg',
      source: { title: '«Atlas der Alpenflora», 1882', url: 'https://commons.wikimedia.org/wiki/Category:Rhodiola_rosea_-_botanical_illustrations', license: PD },
    },
    {
      id: 'zveroboy', name: 'Зверобой', latin: 'Hypericum perforatum', blend: 'morning', coords: [86.0, 51.4], months: [7],
      taste: 'травяной, чуть горьковатый',
      about: 'Солнечно-жёлтые цветки собирают в разгар лета. Если посмотреть лист на просвет, видны светлые точки — масляные железки.',
      image: 'img/herbs/zveroboy.jpg', source: lindman(230, '230_Hypericum_perforatum.jpg'),
    },
    {
      id: 'myata', name: 'Мята', latin: 'Mentha arvensis', blend: 'morning', coords: [85.6, 50.3], months: [7, 8],
      taste: 'свежий, мягко холодящий',
      about: 'Полевая мята мягче садовой и не забивает остальные травы. Растёт по сырым лугам и берегам рек.',
      image: 'img/herbs/myata.jpg', source: lindman(88, '88_Mentha_arvensis.jpg'),
    },
    {
      id: 'chabrec', name: 'Чабрец', latin: 'Thymus serpyllum', blend: 'day', coords: [42.5, 43.3], months: [6, 7],
      taste: 'пряный, смолистый',
      about: 'Низкий кустарничек с тёплым смолистым запахом. На южных склонах Приэльбрусья его срезают в пору цветения.',
      image: 'img/herbs/chabrec.jpg', source: lindman(90, '90_Thymus_serpyllum.jpg'),
    },
    {
      id: 'dushica', name: 'Душица', latin: 'Origanum vulgare', blend: 'day', coords: [41.3, 43.6], months: [7],
      taste: 'пряный, с горчинкой',
      about: 'Родственница средиземноморского орегано. Лиловые соцветия собирают в июле, когда запах самый сильный.',
      image: 'img/herbs/dushica.jpg', source: lindman(91, '91_Origanum_vulgare.jpg'),
    },
    {
      id: 'shipovnik', name: 'Шиповник', latin: 'Rosa cinnamomea', blend: 'day', coords: [42.7, 43.9], months: [9],
      taste: 'кисловатый, фруктовый',
      about: 'Плоды собирают в сентябре, когда они становятся тёмно-красными. Они дают сбору кислинку и цвет.',
      image: 'img/herbs/shipovnik.jpg', source: lindman(293, '293_Rosa_cinnamomea.jpg'),
    },
    {
      id: 'melissa', name: 'Мелисса', latin: 'Melissa officinalis', blend: 'day', coords: [41.6, 43.3], months: [6, 7],
      taste: 'лимонный, мягкий',
      about: 'Листья пахнут лимоном, особенно если растереть их в пальцах. Собирают до цветения, пока аромат не ушёл.',
      image: 'img/herbs/melissa.jpg',
      source: { title: 'F. E. Köhler, «Köhler’s Medizinal-Pflanzen», 1887', url: 'https://commons.wikimedia.org/wiki/File:Melissa_officinalis_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-094.jpg', license: PD },
    },
    {
      id: 'ivanchay', name: 'Иван-чай', latin: 'Chamaenerion angustifolium', blend: 'evening', coords: [34.3, 62.2], months: [7],
      taste: 'мягкий, с медовой ноткой',
      about: 'Лист ферментируют по старому копорскому способу: скручивают, выдерживают и сушат. Так он становится тёмным и ароматным.',
      image: 'img/herbs/ivanchay.jpg',
      source: { title: 'O. W. Thomé, «Flora von Deutschland, Österreich und der Schweiz», 1885', url: 'https://commons.wikimedia.org/wiki/File:Illustration_Epilobium_angustifolium0.jpg', license: PD },
    },
    {
      id: 'veresk', name: 'Вереск', latin: 'Calluna vulgaris', blend: 'evening', coords: [34.3, 63.7], months: [8, 9],
      taste: 'медовый, чуть терпкий',
      about: 'В конце лета вереск окрашивает карельские сопки в лиловый. Собирают цветущие веточки.',
      image: 'img/herbs/veresk.jpg', source: lindman(147, '147_Calluna_vulgaris.jpg'),
    },
    {
      id: 'tavolga', name: 'Таволга', latin: 'Filipendula ulmaria', blend: 'evening', coords: [33.0, 61.0], months: [7],
      taste: 'медовый, с миндальной ноткой',
      about: 'Кремовые соцветия пахнут мёдом и миндалём. Растёт по сырым лугам и берегам озёр.',
      image: 'img/herbs/tavolga.jpg', source: lindman(288, '288_Filipendula_ulmaria.jpg'),
    },
    {
      id: 'brusnika', name: 'Брусника', latin: 'Vaccinium vitis-idaea', blend: 'evening', coords: [34.6, 64.9], months: [5],
      taste: 'терпкий, освежающий',
      about: 'Лист собирают весной, до цветения. Он кожистый и долго хранит вкус.',
      image: 'img/herbs/brusnika.jpg', source: lindman(143, '143_Vaccinium_vitis_idaea.jpg'),
    },
  ];

  const prices = { tin: 690, bundle: 1790, discount: 0.15, weight: '50 г' };
  const blendNames = { morning: 'Утро', day: 'День', evening: 'Вечер' };
  const monthNames = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

  return { blends, regions, herbs, prices, blendNames, monthNames };
});
```

- [ ] **Step 4: Write `dolgota/js/shop.js`**

```js
// Магазин «Долготы»: цены по подписке и игрушечная корзина (заказы не принимаются).
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).shop = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const NBSP = ' ';

  function subscriptionPrice(rub, discount = 0.15) {
    return Math.round(rub * (1 - discount));
  }

  function formatRub(rub) {
    return String(rub).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + NBSP + '₽';
  }

  function createCart(storage) {
    const KEY = 'dolgota-cart';
    let usable = false;
    try {
      storage.setItem(KEY + '-probe', '1');
      storage.removeItem(KEY + '-probe');
      usable = true;
    } catch (e) {
      usable = false;
    }
    let count = usable ? parseInt(storage.getItem(KEY) || '0', 10) || 0 : 0;
    return {
      count: () => count,
      add(n = 1) {
        count += n;
        if (usable) {
          try { storage.setItem(KEY, String(count)); } catch (e) { usable = false; }
        }
        return count;
      },
    };
  }

  return { subscriptionPrice, formatRub, createCart };
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test dolgota/tests/data.test.js dolgota/tests/shop.test.js`
Expected: PASS — 8 tests.

- [ ] **Step 6: Commit**

```bash
git add dolgota/js/data.js dolgota/js/shop.js dolgota/tests/data.test.js dolgota/tests/shop.test.js
git commit -m "feat(dolgota): данные о сборах и травах, цены и игрушечная корзина"
```

### Task 3: Контур России и геометрия карты

**Files:**
- Create: `dolgota/tools/make-russia.js`
- Create: `dolgota/data/russia.js` (генерируется скриптом)
- Create: `dolgota/js/atlas.js` (геометрическая часть; отрисовка — Task 4)
- Test: `dolgota/tests/atlas.test.js`

**Interfaces:**
- Consumes: `require('../js/data.js').herbs` (Task 2) — поле `coords: [lon, lat]`.
- Produces:
  - `Dolgota.russia` (в Node — `require('../data/russia.js')`) — массив колец `[[lon, lat], …]`, долготы 0–360;
  - `Dolgota.atlas.project([lon, lat]) → [x, y]` — коническая проекция без масштаба;
  - `Dolgota.atlas.projector(width, height, pad, fitPoints) → ([lon, lat]) => [x, y]` — вписывает `fitPoints` в прямоугольник с отступом `pad`;
  - `Dolgota.atlas.inside([lon, lat], rings) → boolean`;
  - `Dolgota.atlas.pathD(rings, toXY) → string` — атрибут `d` для замкнутых колец;
  - `Dolgota.atlas.lineD(points, toXY) → string` — атрибут `d` для незамкнутой линии.

- [ ] **Step 1: Спросить разрешение и скачать Natural Earth**

Узнать размер файла:

```bash
curl -sIL https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson | grep -i content-length
```

Спросить пользователя: «Скачать `ne_50m_admin_0_countries.geojson` (Natural Earth 1:50m, общественное достояние) с raw.githubusercontent.com/nvkelso/natural-earth-vector, <размер> МБ, во временную папку? В репозиторий попадёт только упрощённый результат `dolgota/data/russia.js`». После «да»:

```bash
curl -sL -o "$TMPDIR/ne_50m_admin_0_countries.geojson" https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
```

- [ ] **Step 2: Написать скрипт `dolgota/tools/make-russia.js`**

```js
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
```

- [ ] **Step 3: Сгенерировать контур**

Run: `node dolgota/tools/make-russia.js "$TMPDIR/ne_50m_admin_0_countries.geojson"`
Expected: строка вида `14 контуров, 1900 точек, 40 КБ`. Если точек больше 3 000 или файл больше 80 КБ — повторить с допуском `0.1` третьим аргументом.

- [ ] **Step 4: Write the failing test**

`dolgota/tests/atlas.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const atlas = require('../js/atlas.js');
const rings = require('../data/russia.js');
const { herbs } = require('../js/data.js');

test('проекция без разрыва через 180°', () => {
  const [x1, y1] = atlas.project([179.9, 66]);
  const [x2, y2] = atlas.project([180.1, 66]);
  assert.ok(Math.hypot(x2 - x1, y2 - y1) < 0.5);
});

test('города по разные стороны границы', () => {
  assert.equal(atlas.inside([38.98, 45.04], rings), true, 'Краснодар');
  assert.equal(atlas.inside([20.5, 54.7], rings), true, 'Калининград');
  assert.equal(atlas.inside([34.1, 44.95], rings), false, 'Симферополь');
  assert.equal(atlas.inside([27.56, 53.9], rings), false, 'Минск');
});

test('все точки сбора трав внутри контура', () => {
  for (const herb of herbs) assert.equal(atlas.inside(herb.coords, rings), true, herb.id);
});

test('projector вписывает контур в прямоугольник', () => {
  const toXY = atlas.projector(1200, 600, 20, rings.flat());
  for (const point of rings.flat()) {
    const [x, y] = toXY(point);
    assert.ok(x >= 19.99 && x <= 1180.01 && y >= 19.99 && y <= 580.01, `${point} → ${x},${y}`);
  }
});

test('pathD и lineD строят атрибут d', () => {
  const toXY = ([lon, lat]) => [lon, lat];
  assert.equal(atlas.pathD([[[0, 0], [1, 0], [1, 1]]], toXY), 'M0.0,0.0L1.0,0.0L1.0,1.0Z');
  assert.equal(atlas.lineD([[0, 0], [2, 3]], toXY), 'M0.0,0.0L2.0,3.0');
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `node --test dolgota/tests/atlas.test.js`
Expected: FAIL — `Cannot find module '../js/atlas.js'`.

- [ ] **Step 6: Write the geometry part of `dolgota/js/atlas.js`**

```js
// Карта-атлас «Долготы»: коническая проекция, геометрия и SVG-отрисовка.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).atlas = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const RAD = Math.PI / 180;
  const CONE = 0.62;
  const CENTER = 100;

  function project([lon, lat]) {
    const theta = CONE * (lon - CENTER) * RAD;
    const r = 90 - lat;
    return [r * Math.sin(theta), r * Math.cos(theta)];
  }

  function projector(width, height, pad, fitPoints) {
    let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity;
    for (const point of fitPoints) {
      const [x, y] = project(point);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    const scale = Math.min((width - 2 * pad) / (x1 - x0), (height - 2 * pad) / (y1 - y0));
    const ox = (width - (x1 - x0) * scale) / 2 - x0 * scale;
    const oy = (height - (y1 - y0) * scale) / 2 - y0 * scale;
    return (point) => {
      const [x, y] = project(point);
      return [ox + x * scale, oy + y * scale];
    };
  }

  function insideRing([x, y], ring) {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  function inside(point, rings) {
    return rings.some((ring) => insideRing(point, ring));
  }

  const xy = (toXY, point) => toXY(point).map((v) => v.toFixed(1)).join(',');

  function lineD(points, toXY) {
    return 'M' + points.map((p) => xy(toXY, p)).join('L');
  }

  function pathD(rings, toXY) {
    return rings.map((ring) => lineD(ring, toXY) + 'Z').join('');
  }

  return { project, projector, inside, pathD, lineD };
});
```

- [ ] **Step 7: Run test to verify it passes**

Run: `node --test dolgota/tests/atlas.test.js`
Expected: PASS — 5 tests. Если «все точки сбора внутри контура» падает на какой-то траве, сдвинуть её `coords` в `data.js` на 0,1–0,3° вглубь региона (побережье упрощено) и перезапустить.

- [ ] **Step 8: Commit**

```bash
git add dolgota/tools/make-russia.js dolgota/data/russia.js dolgota/js/atlas.js dolgota/tests/atlas.test.js
git commit -m "feat(dolgota): контур России из Natural Earth и геометрия карты"
```

### Task 4: Отрисовка карты и перетаскивание солнца

**Files:**
- Modify: `dolgota/js/atlas.js` — добавить `nearestMinute` и `createAtlas`
- Test: `dolgota/tests/atlas.test.js` — добавить тест `nearestMinute`

**Interfaces:**
- Consumes: `project`, `projector`, `pathD`, `lineD` (Task 3); `Dolgota.clock.sunAt`, `blendAt`, `formatTime` (Task 1); регионы и травы из `data.js` (Task 2).
- Produces:
  - `Dolgota.atlas.nearestMinute(samples: {min, x, y}[], x, y) → number`;
  - `Dolgota.atlas.createAtlas(svg: SVGSVGElement, options) → { update(min: number), highlight(herbId: string | null) }`, где `options`:
    - `mode: 'hero' | 'mini' | 'fragment'`, `width`, `height`, `pad`;
    - `rings` — контур (`Dolgota.russia`);
    - `regions` — `[{ id, name, blend, center: [lon, lat], label: 'right' | 'below' }]`;
    - `herbs` — `[{ id, name, coords }]` (режим `mini`);
    - `box: [lonMin, latMin, lonMax, latMax]` — вписать не всю страну, а этот прямоугольник (любой режим); `meridian: number` — неподвижный меридиан (режим `fragment`);
    - `clock` — `Dolgota.clock`; `blendNames` — `{ morning: 'Утро', day: 'День', evening: 'Вечер' }`;
    - `onDrag(min)` — солнце перетащили или сдвинули стрелками (`hero`);
    - `onPick(herbId)` — клик по точке травы (`mini`).
  - CSS-классы для стилей (Task 5): `atlas-sea`, `atlas-land`, `atlas-grid`, `atlas-meridian`, `atlas-meridian-label`, `atlas-sun-path`, `atlas-region`, `atlas-region-label`, `atlas-herb`, `atlas-sun`, `atlas-sun-halo`, `atlas-sun-disc`; состояние — класс `is-active`.

- [ ] **Step 1: Write the failing test** — дописать в конец `dolgota/tests/atlas.test.js`:

```js
test('nearestMinute выбирает ближайшую точку пути солнца', () => {
  const samples = [{ min: 300, x: 0, y: 0 }, { min: 305, x: 10, y: 0 }, { min: 310, x: 20, y: 0 }];
  assert.equal(atlas.nearestMinute(samples, 11, 3), 305);
  assert.equal(atlas.nearestMinute(samples, -50, 0), 300);
  assert.equal(atlas.nearestMinute(samples, 99, 99), 310);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dolgota/tests/atlas.test.js`
Expected: FAIL — `atlas.nearestMinute is not a function`.

- [ ] **Step 3: Implement** — в `dolgota/js/atlas.js` перед строкой `return { project, projector, inside, pathD, lineD };` вставить код ниже, а саму строку заменить на `return { project, projector, inside, pathD, lineD, nearestMinute, createAtlas };`:

```js
  function nearestMinute(samples, x, y) {
    let best = samples[0];
    let bestDistance = Infinity;
    for (const sample of samples) {
      const d = (sample.x - x) ** 2 + (sample.y - y) ** 2;
      if (d < bestDistance) { bestDistance = d; best = sample; }
    }
    return best.min;
  }

  function meridianPoints(lon) {
    const points = [];
    for (let lat = 38; lat <= 82; lat += 2) points.push([lon, lat]);
    return points;
  }

  function graticule(toXY) {
    let out = '';
    for (let lon = 30; lon <= 180; lon += 15) out += `<path class="atlas-grid" d="${lineD(meridianPoints(lon), toXY)}"/>`;
    for (const lat of [50, 60, 70, 80]) {
      const points = [];
      for (let lon = 15; lon <= 195; lon += 3) points.push([lon, lat]);
      out += `<path class="atlas-grid" d="${lineD(points, toXY)}"/>`;
    }
    return out;
  }

  function createAtlas(svg, options) {
    const { mode = 'hero', width, height, pad = 24, rings, regions = [], herbs = [], box, meridian, clock, blendNames = {}, onDrag, onPick } = options;
    const fitPoints = box
      ? [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]], [(box[0] + box[2]) / 2, box[1]]]
      : rings.flat();
    const toXY = projector(width, height, pad, fitPoints);
    const at = (point) => toXY(point).map((v) => v.toFixed(1));
    const labelLat = box ? box[1] + 0.6 : 36.6;
    const visibleRegions = box
      ? regions.filter(({ center: [lon, lat] }) => lon >= box[0] && lon <= box[2] && lat >= box[1] && lat <= box[3])
      : regions;

    let html = `<rect class="atlas-sea" width="${width}" height="${height}"/>`;
    html += `<path class="atlas-land" d="${pathD(rings, toXY)}"/>` + graticule(toXY);
    if (mode !== 'mini') html += '<path class="atlas-meridian" d=""/><text class="atlas-meridian-label" text-anchor="middle"></text>';

    const samples = [];
    if (mode === 'hero') {
      for (let min = 300; min <= 1380; min += 5) {
        const sun = clock.sunAt(min);
        const [x, y] = toXY([sun.lon, sun.lat]);
        samples.push({ min, x, y });
      }
      html += `<path class="atlas-sun-path" d="M${samples.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`).join('L')}"/>`;
    }
    for (const herb of herbs) {
      const [x, y] = at(herb.coords);
      html += `<circle class="atlas-herb" data-herb="${herb.id}" cx="${x}" cy="${y}" r="5"><title>${herb.name}</title></circle>`;
    }
    for (const region of visibleRegions) {
      const [x, y] = toXY(region.center);
      if (!herbs.length) html += `<circle class="atlas-region" data-blend="${region.blend}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/>`;
      const below = region.label === 'below';
      html += `<text class="atlas-region-label" x="${(x + (below ? 0 : 12)).toFixed(1)}" y="${(y + (below ? 26 : 5)).toFixed(1)}" text-anchor="${below ? 'middle' : 'start'}">${region.name}</text>`;
    }
    if (mode === 'hero') {
      html += '<g class="atlas-sun" tabindex="0" role="slider" aria-label="Солнце: время суток" aria-valuemin="300" aria-valuemax="1380">'
        + '<circle class="atlas-sun-halo" r="26"/><circle class="atlas-sun-disc" r="16"/></g>';
    }
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = html;

    const meridianEl = svg.querySelector('.atlas-meridian');
    const meridianLabel = svg.querySelector('.atlas-meridian-label');
    const regionEls = [...svg.querySelectorAll('.atlas-region')];
    const herbEls = [...svg.querySelectorAll('.atlas-herb')];
    const sunEl = svg.querySelector('.atlas-sun');

    function setMeridian(lon) {
      if (!meridianEl) return;
      if (lon === null) {
        meridianEl.setAttribute('d', '');
        meridianLabel.textContent = '';
        return;
      }
      meridianEl.setAttribute('d', lineD(meridianPoints(lon), toXY));
      const [x, y] = at([lon, labelLat]);
      meridianLabel.setAttribute('x', x);
      meridianLabel.setAttribute('y', y);
      meridianLabel.textContent = `${lon}° в. д.`;
    }

    if (mode === 'fragment') setMeridian(meridian);

    if (herbEls.length && onPick) {
      herbEls.forEach((el) => el.addEventListener('click', () => onPick(el.dataset.herb)));
    }

    if (sunEl && onDrag) {
      const toSvgPoint = (event) => {
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
      };
      let dragging = false;
      sunEl.addEventListener('pointerdown', (event) => {
        dragging = true;
        sunEl.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      sunEl.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        const p = toSvgPoint(event);
        onDrag(nearestMinute(samples, p.x, p.y));
      });
      const stop = () => { dragging = false; };
      sunEl.addEventListener('pointerup', stop);
      sunEl.addEventListener('pointercancel', stop);
      sunEl.addEventListener('keydown', (event) => {
        const now = Number(sunEl.getAttribute('aria-valuenow'));
        const steps = { ArrowRight: 15, ArrowUp: 15, ArrowLeft: -15, ArrowDown: -15 };
        let next = null;
        if (event.key in steps) next = now + steps[event.key];
        if (event.key === 'Home') next = 300;
        if (event.key === 'End') next = 1380;
        if (next === null) return;
        event.preventDefault();
        onDrag(Math.max(300, Math.min(1380, next)));
      });
    }

    function update(min) {
      if (mode !== 'hero') return;
      const sun = clock.sunAt(min);
      const blend = clock.blendAt(min);
      regionEls.forEach((el) => el.classList.toggle('is-active', el.dataset.blend === blend));
      sunEl.style.display = sun.visible ? '' : 'none';
      if (sun.visible) {
        const [x, y] = at([sun.lon, sun.lat]);
        sunEl.setAttribute('transform', `translate(${x} ${y})`);
        setMeridian(Math.round(sun.lon / 15) * 15);
      } else {
        setMeridian(null);
      }
      sunEl.setAttribute('aria-valuenow', String(Math.max(300, Math.min(1380, min))));
      sunEl.setAttribute('aria-valuetext', `${clock.formatTime(min)}, время сбора «${blendNames[blend] || blend}»`);
    }

    function highlight(herbId) {
      herbEls.forEach((el) => el.classList.toggle('is-active', el.dataset.herb === herbId));
    }

    return { update, highlight };
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dolgota/tests/atlas.test.js`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add dolgota/js/atlas.js dolgota/tests/atlas.test.js
git commit -m "feat(dolgota): SVG-карта, солнце тянется мышью, пальцем и стрелками"
```

Проверка в браузере — в Task 6, когда карта встанет на главную.

### Task 5: Визуальная система — токены, общие компоненты, банка, подгонка надписей

**Files:**
- Create: `dolgota/css/tokens.css`, `dolgota/css/base.css`
- Create: `dolgota/js/tin.js`, `dolgota/js/fit.js`
- Test: `dolgota/tests/tin.test.js`

**Interfaces:**
- Consumes: цвета банок из `Dolgota.data.blends[].tin` (Task 2); классы карты из Task 4.
- Produces:
  - CSS-переменные `--bg --ink --mu --card --hero --land --ac --on --sun` (их перезаписывает `clock.applyPalette`), `--paper --paper-ink --paper-mu`, `--line`, `--font-sans --font-mono --font-serif`, `--radius-card --radius-hero --page-pad`, `--theme-transition`;
  - классы: `.page .section .section-head .h1 .h2 .lead .mono .cap .lat .muted .pill .pill--outline .btn .btn--accent .btn--ink .btn--ghost .marquee .marquee__track .ticker .site-header .logo .nav .header-actions .nav-toggle .cart-pill .visually-hidden .card .badge .toast .sticky-pill .site-footer .site-footer__top .newsletter .newsletter__row .newsletter__note .footer-links .footer-legal` и все `atlas-*`; на телефоне (≤ 640 px) меню `.nav` прячется и открывается классом `is-open`;
  - `Dolgota.tin.tinSvg({ name, lon, regionName, tin }, width = 150) → string`;
  - `Dolgota.fit.fitSvgText(scope = document)`, `Dolgota.fit.findOverflow() → {el, reason}[]`, `Dolgota.fit.debugOverflow()` — при `?debug=overflow` обводит нарушителей красным и кладёт отчёт в `window.__overflow`.

- [ ] **Step 1: Write the failing test** — `dolgota/tests/tin.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { tinSvg } = require('../js/tin.js');
const { blends, regions } = require('../js/data.js');

test('банка содержит сбор, долготу и регион и не течёт undefined', () => {
  for (const blend of blends) {
    const svg = tinSvg({ name: blend.name, lon: blend.lon, regionName: regions[blend.region].name, tin: blend.tin }, 170);
    assert.match(svg, /^<svg class="tin" viewBox="0 0 130 170" width="170"/);
    for (const part of [blend.name, `${blend.lon}°`, regions[blend.region].name, 'долгота']) assert.ok(svg.includes(part), part);
    assert.equal(/undefined|NaN/.test(svg), false);
    assert.equal((svg.match(/data-max=/g) || []).length, 4);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dolgota/tests/tin.test.js`
Expected: FAIL — `Cannot find module '../js/tin.js'`.

- [ ] **Step 3: Write `dolgota/js/tin.js`** — геометрия и размеры надписей точно как в утверждённом макете (замер: самая длинная надпись «Карелия» кончается на x = 74,5 при пределе 93):

```js
// SVG-банка сбора «Долготы». Надписи с data-max подгоняет fit.js, если шрифт окажется шире.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).tin = api;
})(typeof self !== 'undefined' ? self : this, function () {
  function tinSvg({ name, lon, regionName, tin }, width = 150) {
    const sans = 'font-family: var(--font-sans); font-weight: 700';
    const mono = 'font-family: var(--font-mono)';
    return `<svg class="tin" viewBox="0 0 130 170" width="${width}" role="img" aria-label="Банка сбора «${name}»">`
      + `<rect x="15" y="30" width="100" height="132" rx="8" fill="${tin.body}"/>`
      + `<rect x="11" y="16" width="108" height="26" rx="6" fill="${tin.lid}"/>`
      + `<line x1="15" y1="62" x2="115" y2="62" stroke="${tin.text}" stroke-opacity="0.45"/>`
      + `<line x1="15" y1="140" x2="115" y2="140" stroke="${tin.text}" stroke-opacity="0.45"/>`
      + `<line x1="100" y1="62" x2="100" y2="140" stroke="${tin.line}" stroke-width="1.2"/>`
      + `<circle cx="100" cy="100" r="3.5" fill="${tin.line}"/>`
      + `<text x="22" y="81" font-size="14" fill="${tin.text}" style="${sans}" data-max="93">${name}</text>`
      + `<text x="19" y="118" font-size="36" fill="${tin.text}" style="${sans}; letter-spacing: -0.04em" data-max="93">${lon}°</text>`
      + `<text x="22" y="134" font-size="12.5" fill="${tin.text}" style="${mono}" data-max="93">${regionName}</text>`
      + `<text x="65" y="155" font-size="12.5" text-anchor="middle" fill="${tin.text}" style="${mono}" data-max="110">долгота</text>`
      + '</svg>';
  }
  return { tinSvg };
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dolgota/tests/tin.test.js`
Expected: PASS — 1 test.

- [ ] **Step 5: Write `dolgota/js/fit.js`**

```js
// Подгонка надписей в SVG и проверка переполнения: ?debug=overflow обводит нарушителей красным.
(function (root) {
  function fitSvgText(scope = document) {
    scope.querySelectorAll('svg text[data-max]').forEach((text) => {
      if (!text.dataset.fs0) text.dataset.fs0 = text.getAttribute('font-size');
      let size = Number(text.dataset.fs0);
      text.setAttribute('font-size', size);
      let box = text.getBBox();
      for (let i = 0; i < 30 && box.x + box.width > Number(text.dataset.max); i++) {
        size -= 0.5;
        text.setAttribute('font-size', size);
        box = text.getBBox();
      }
    });
  }

  function findOverflow() {
    const problems = [];
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1) problems.push({ el: doc, reason: `страница шире окна: ${doc.scrollWidth} > ${doc.clientWidth}` });
    for (const el of document.body.querySelectorAll('*')) {
      if (el instanceof SVGElement || el.clientWidth === 0) continue;
      const { overflowX } = getComputedStyle(el);
      if (overflowX === 'hidden' || overflowX === 'clip') continue;
      if (el.scrollWidth > el.clientWidth + 1) problems.push({ el, reason: `содержимое ${el.scrollWidth} > ${el.clientWidth}` });
    }
    return problems;
  }

  function debugOverflow() {
    if (new URLSearchParams(location.search).get('debug') !== 'overflow') return;
    const run = () => {
      const problems = findOverflow();
      problems.forEach(({ el }) => { if (el !== document.documentElement) el.style.outline = '2px solid red'; });
      root.__overflow = problems.map(({ el, reason }) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}: ${reason}`);
      console.info('[overflow]', root.__overflow.length ? root.__overflow : 'переполнений нет');
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(run, 300));
  }

  (root.Dolgota = root.Dolgota || {}).fit = { fitSvgText, findOverflow, debugOverflow };
})(typeof self !== 'undefined' ? self : this);
```

- [ ] **Step 6: Write `dolgota/css/tokens.css`**

```css
/* Токены «Долготы». По умолчанию — дневная палитра; clock.js перезаписывает цвета по времени суток. */
:root {
  --bg: #F8F8F5;
  --ink: #121212;
  --mu: #666661;
  --card: #ECECE7;
  --hero: #D6E6F0;
  --land: #F7F5EE;
  --ac: #EDB723;
  --on: #2A1F00;
  --sun: #F5C23A;
  --paper: #F4EFE4;
  --paper-ink: #2A2520;
  --paper-mu: #6B6457;
  --line: color-mix(in srgb, var(--ink) 16%, transparent);
  --font-sans: Manrope, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Consolas, monospace;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --radius-card: 20px;
  --radius-hero: 28px;
  --page-pad: clamp(16px, 3.4vw, 48px);
  --theme-transition: background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease, fill 0.6s ease, stroke 0.6s ease;
}

@media (prefers-reduced-motion: reduce) {
  :root { --theme-transition: none; }
}
```

- [ ] **Step 7: Write `dolgota/css/base.css`**

```css
/* Общие стили «Долготы»: сброс, типографика, компоненты, карта, шапка и подвал. */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 400 17px/1.55 var(--font-sans); transition: var(--theme-transition); }
img, svg { display: block; max-width: 100%; }
a { color: inherit; }
h1, h2, h3, p { margin: 0; }
:focus-visible { outline: 2px solid var(--ac); outline-offset: 3px; }

.page { max-width: 1440px; margin: 0 auto; }
.section { padding: clamp(64px, 8vw, 120px) var(--page-pad) 0; }
.section-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px 48px; margin-bottom: 40px; }
.section-head .lead { max-width: 560px; }

.h1 { font-size: clamp(40px, 6vw, 76px); font-weight: 700; letter-spacing: -0.035em; line-height: 1; text-wrap: balance; }
.h2 { font-size: clamp(28px, 3.5vw, 44px); font-weight: 700; letter-spacing: -0.035em; line-height: 1.05; text-wrap: balance; }
.lead { font-size: 18px; line-height: 1.55; color: var(--mu); text-wrap: pretty; }
.mono { font-family: var(--font-mono); }
.cap { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
.lat { font-family: var(--font-serif); font-style: italic; font-weight: 500; }
.muted { color: var(--mu); }

.pill { display: inline-flex; align-items: center; min-height: 40px; padding: 0 16px; border: 1px solid transparent; border-radius: 999px; background: none; color: inherit; font: 500 14px/1 var(--font-sans); white-space: nowrap; text-decoration: none; cursor: pointer; transition: var(--theme-transition); }
.pill--outline { border-color: var(--line); }
.pill[aria-pressed="true"], .pill.is-current { background: var(--ink); color: var(--bg); }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 26px; border: 1.5px solid transparent; border-radius: 999px; font: 700 16px/1 var(--font-sans); white-space: nowrap; text-decoration: none; cursor: pointer; transition: var(--theme-transition); }
.btn--accent { background: var(--ac); color: var(--on); }
.btn--ink { background: var(--ink); color: var(--bg); }
.btn--ghost { background: none; color: var(--ink); border-color: var(--ink); }

.marquee { display: flex; align-items: center; min-height: 36px; overflow: hidden; background: var(--ink); color: var(--bg); transition: var(--theme-transition); }
.marquee__track { display: flex; flex-shrink: 0; gap: 28px; padding-right: 28px; white-space: nowrap; animation: marquee 40s linear infinite; }
@keyframes marquee { to { transform: translateX(-100%); } }
.ticker { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 28px; margin-top: 48px; padding: 16px var(--page-pad); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }

.site-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 20px var(--page-pad); }
.logo { font-size: 22px; font-weight: 700; letter-spacing: 0.06em; text-decoration: none; }
.nav { display: flex; gap: 6px; padding: 5px; border-radius: 999px; background: var(--card); transition: var(--theme-transition); }
.cart-pill { background: var(--card); }
.header-actions { display: flex; gap: 6px; }
.nav-toggle { display: none; background: var(--card); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.card { background: var(--card); border-radius: var(--radius-card); transition: var(--theme-transition); }
.badge { align-self: flex-start; padding: 6px 10px; border-radius: 999px; background: var(--ac); color: var(--on); font: 12px/1 var(--font-mono); letter-spacing: 0.04em; text-transform: uppercase; }
.toast { position: fixed; left: 50%; bottom: 24px; z-index: 10; max-width: calc(100vw - 32px); padding: 14px 20px; border-radius: 999px; background: var(--ink); color: var(--bg); font-size: 14px; text-align: center; transform: translateX(-50%); }
.sticky-pill { position: fixed; right: 20px; bottom: 20px; z-index: 5; background: var(--ink); color: var(--bg); }

.atlas { display: block; width: 100%; height: auto; }
.atlas * { transition: var(--theme-transition); }
.atlas-sea { fill: var(--hero); }
.atlas-land { fill: var(--land); stroke: var(--ink); stroke-opacity: 0.55; stroke-width: 1; }
.atlas-grid { fill: none; stroke: var(--mu); stroke-opacity: 0.35; stroke-width: 0.8; }
.atlas-meridian { fill: none; stroke: var(--ac); stroke-width: 2; }
.atlas-meridian-label { fill: var(--ink); font: 13px var(--font-mono); }
.atlas-sun-path { fill: none; stroke: var(--mu); stroke-width: 1.2; stroke-dasharray: 5 6; }
.atlas-region { fill: var(--mu); stroke: var(--hero); stroke-width: 2; }
.atlas-region.is-active { fill: var(--ac); }
.atlas-region-label { fill: var(--ink); font: 500 15px var(--font-sans); }
.atlas-herb { fill: var(--mu); stroke: var(--hero); stroke-width: 2; cursor: pointer; }
.atlas-herb.is-active { fill: var(--ac); r: 7px; }
.atlas-sun { cursor: grab; touch-action: none; outline: none; }
.atlas-sun:active { cursor: grabbing; }
.atlas-sun:focus-visible .atlas-sun-halo { stroke-opacity: 1; stroke-width: 4; }
.atlas-sun-halo { fill: none; stroke: var(--sun); stroke-opacity: 0.45; stroke-width: 2; }
.atlas-sun-disc { fill: var(--sun); }

.site-footer { margin: clamp(64px, 8vw, 120px) clamp(12px, 1.7vw, 24px) clamp(12px, 1.7vw, 24px); padding: clamp(28px, 4vw, 56px); border-radius: var(--radius-hero); background: var(--ink); color: var(--bg); display: flex; flex-direction: column; gap: 40px; transition: var(--theme-transition); }
.site-footer__top { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 40px; }
.newsletter { display: flex; flex-direction: column; gap: 14px; }
.newsletter__row { display: flex; flex-wrap: wrap; gap: 10px; }
.newsletter input { flex: 1 1 220px; min-height: 52px; padding: 0 22px; border: 1px solid color-mix(in srgb, var(--bg) 35%, transparent); border-radius: 999px; background: none; color: var(--bg); font: inherit; }
.newsletter .btn { background: var(--bg); color: var(--ink); }
.newsletter__note { font: 12px/1.5 var(--font-mono); color: color-mix(in srgb, var(--bg) 60%, transparent); }
.footer-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.footer-links div { display: flex; flex-direction: column; gap: 10px; }
.footer-links a { text-decoration: none; }
.footer-legal { display: flex; flex-direction: column; gap: 8px; padding-top: 24px; border-top: 1px solid color-mix(in srgb, var(--bg) 20%, transparent); font: 12px/1.5 var(--font-mono); color: color-mix(in srgb, var(--bg) 60%, transparent); }

@media (prefers-reduced-motion: reduce) {
  .marquee__track { animation: none; }
}

@media (max-width: 640px) {
  .nav-toggle { display: inline-flex; }
  .nav { display: none; order: 3; flex-basis: 100%; flex-direction: column; border-radius: 20px; }
  .nav.is-open { display: flex; }
}
```

Контраст подвала: `--bg` на `--ink` — та же пара, что `ink/bg`, только наоборот; полупрозрачный текст подвала проверяется замером в Task 8.

- [ ] **Step 8: Commit**

```bash
git add dolgota/css/tokens.css dolgota/css/base.css dolgota/js/tin.js dolgota/js/fit.js dolgota/tests/tin.test.js
git commit -m "feat(dolgota): токены, общие компоненты, банка и подгонка надписей"
```

### Task 6: Главная — `index.html`, `home.css`, `home.js`, общий `site.js`

**Files:**
- Create: `dolgota/index.html`, `dolgota/css/home.css`, `dolgota/js/home.js`
- Create: `dolgota/js/site.js` — общее для обеих страниц: корзина с тостом, меню на телефоне, рассылка, подгонка надписей
- Create: `dolgota/tools/serve.js` — локальный сервер для проверки в браузере
- Modify: `.claude/launch.json` (не коммитится) — добавить конфигурацию `dolgota`

**Interfaces:**
- Consumes: `Dolgota.clock` (Task 1), `Dolgota.data`, `Dolgota.shop` (Task 2), `Dolgota.russia`, `Dolgota.atlas` (Tasks 3–4), `Dolgota.tin`, `Dolgota.fit`, классы из `base.css` (Task 5).
- Produces: главную страницу; разметку шапки, подвала, тоста и плавающей плашки, которую Task 7 копирует в гербарий; `js/site.js`, который Task 7 подключает как есть; якоря `#sbory`, `#dolgoty`, `#nabor`, `#zavarivanie`.

- [ ] **Step 1: Write `dolgota/index.html`**

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Долгота — чай, который идёт за солнцем</title>
  <meta name="description" content="Учебный проект: три сбора диких трав с Алтая, Кавказа и Карелии — по одному на каждое время суток.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=JetBrains+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@1,500&display=swap">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/home.css">
  <script defer src="js/clock.js"></script>
  <script defer src="js/data.js"></script>
  <script defer src="js/shop.js"></script>
  <script defer src="data/russia.js"></script>
  <script defer src="js/atlas.js"></script>
  <script defer src="js/tin.js"></script>
  <script defer src="js/fit.js"></script>
  <script defer src="js/site.js"></script>
  <script defer src="js/home.js"></script>
</head>
<body>
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track cap"><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span></div>
    <div class="marquee__track cap"><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span></div>
  </div>

  <header class="site-header">
    <a class="logo" href="index.html">долгота</a>
    <nav class="nav" id="nav" aria-label="Разделы">
      <a class="pill" href="#sbory">Сборы</a>
      <a class="pill" href="#zavarivanie">Как заваривать</a>
      <a class="pill" href="herbarium.html">Гербарий</a>
    </nav>
    <div class="header-actions">
      <button class="pill nav-toggle" type="button" aria-expanded="false" aria-controls="nav" data-nav-toggle>Меню</button>
      <button class="pill cart-pill" type="button" data-cart>Корзина (<span data-cart-count>0</span>)</button>
    </div>
  </header>

  <main class="page">
    <section class="hero">
      <div class="hero__text">
        <h1 class="h1">Чай, который идёт за&nbsp;солнцем</h1>
        <p class="lead">Три сбора диких трав с Алтая, Кавказа и Карелии — по одному на каждое время суток. Солнце на карте подсказывает, какой заварить сейчас.</p>
        <div class="hero__actions">
          <a class="btn btn--accent" href="#sbory">Выбрать сбор</a>
          <a class="btn btn--ghost" href="#dolgoty">Как это устроено</a>
        </div>
      </div>
      <div class="hero__now mono" aria-live="polite">
        <span data-now-time></span>
        <span class="muted" data-now-place></span>
        <button class="pill pill--outline" type="button" data-reset hidden>Вернуться к моему времени</button>
      </div>
    </section>

    <div class="hero__map">
      <svg class="atlas" data-hero-atlas role="group" aria-label="Карта России: солнце показывает, чей сейчас сбор"></svg>
      <p class="hero__hint mono muted">потяни солнце, чтобы увидеть другое время суток</p>
    </div>

    <div class="ticker cap" aria-label="Свойства сборов">
      <span>дикий сбор</span><span>ручная сушка</span><span>без ароматизаторов</span><span>12 трав</span><span>3 региона</span>
    </div>

    <section class="section" id="sbory">
      <div class="section-head">
        <h2 class="h2">Три сбора — три времени суток</h2>
        <p class="lead">В каждом четыре травы одного региона. Ничего, кроме трав.</p>
      </div>
      <div class="blends" data-blends></div>
    </section>

    <section class="section" id="dolgoty">
      <div class="section-head">
        <h2 class="h2">Три долготы</h2>
        <p class="lead">Солнце встаёт над Алтаем, в полдень стоит над Кавказом и садится над Карелией. Каждую траву собирают там, где в её час светит солнце.</p>
      </div>
      <div class="longitudes" data-longitudes></div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="h2">Гербарий</h2>
        <p class="lead">12 трав из трёх регионов. Гравюры взяты из ботанических атласов XIX и начала XX века.</p>
      </div>
      <div class="herb-preview" data-herb-preview></div>
      <a class="btn btn--ghost" href="herbarium.html">Открыть гербарий →</a>
    </section>

    <section class="section" id="nabor">
      <div class="bundle card">
        <div class="bundle__tins" data-bundle-tins></div>
        <div class="bundle__body">
          <h2 class="h2">Набор «Весь день»</h2>
          <p class="lead">Три банки — утро, день и вечер. Хватает примерно на месяц, если заваривать каждый сбор в его время.</p>
          <div class="segmented" role="group" aria-label="Как покупать">
            <button class="pill" type="button" data-plan="once" aria-pressed="false">Разово</button>
            <button class="pill" type="button" data-plan="sub" aria-pressed="true">Подписка −15&nbsp;%</button>
          </div>
          <p class="bundle__price"><span data-bundle-price></span><s class="muted" data-bundle-old></s></p>
          <p class="mono muted" data-bundle-note></p>
          <button class="btn btn--accent" type="button" data-add="bundle">В корзину</button>
        </div>
      </div>
    </section>

    <section class="section" id="zavarivanie">
      <div class="section-head"><h2 class="h2">Как заваривать</h2></div>
      <div class="brew" data-brew></div>
    </section>

    <section class="section faq">
      <h2 class="h2">Вопросы</h2>
      <div class="faq__list">
        <details><summary>Как устроена подписка?</summary><p>Раз в месяц приходит набор «Весь день» со скидкой 15&nbsp;%. Пропустить месяц или отменить подписку можно в любой момент.</p></details>
        <details><summary>Что входит в сбор?</summary><p>Только травы, по четыре в каждом сборе. Без ароматизаторов и чайного листа.</p></details>
        <details><summary>Есть ли противопоказания?</summary><p>Травы действуют мягко, но это не лекарство. Если вы беременны, кормите грудью или принимаете лекарства, посоветуйтесь с врачом.</p></details>
        <details><summary>Сколько идёт доставка?</summary><p>Нисколько: это учебный проект, и заказы не принимаются. В настоящем магазине здесь были бы сроки и цены доставки.</p></details>
        <details open><summary>Это настоящий магазин?</summary><p>Нет. «Долгота» — учебный проект для портфолио: бренд вымышленный, заказы не принимаются.</p></details>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="site-footer__top">
      <form class="newsletter" data-newsletter novalidate>
        <h2 class="h2">Письмо раз в сезон</h2>
        <p>О новом урожае и о том, как меняется свет.</p>
        <div class="newsletter__row">
          <label class="visually-hidden" for="email">Почта</label>
          <input id="email" name="email" type="email" required placeholder="почта@пример.рф" autocomplete="email">
          <button class="btn" type="submit">Подписаться</button>
        </div>
        <p class="newsletter__note" data-newsletter-message aria-live="polite">Демо: форма проверяет адрес, но ничего не отправляет.</p>
      </form>
      <div class="footer-links">
        <div><span class="cap">Магазин</span><a href="#sbory">Сборы</a><a href="#nabor">Набор «Весь день»</a><a href="#zavarivanie">Как заваривать</a></div>
        <div><span class="cap">Гербарий</span><a href="herbarium.html">Все травы</a><a href="herbarium.html#istochniki">Источники</a></div>
      </div>
    </div>
    <div class="footer-legal">
      <span>Учебный проект: магазин вымышленный, заказы не принимаются · Не является лекарственным средством</span>
      <span>Гравюры: Lindman, Köhler, Thomé, «The Botanical Magazine», «Atlas der Alpenflora» — общественное достояние · Карта: Natural Earth · Шрифты: Google Fonts</span>
    </div>
  </footer>

  <a class="pill sticky-pill" href="#nabor">Подписка −15&nbsp;%</a>
  <div class="toast" role="status" data-toast hidden></div>
</body>
</html>
```

- [ ] **Step 2: Write `dolgota/css/home.css`** — значения сняты с утверждённого макета `docs/superpowers/mockups/dolgota/Main.dc.html` и `HomeMobile.dc.html`:

```css
/* Главная «Долготы»: первый экран с картой, сборы, три долготы, превью гербария, набор, заваривание, вопросы. */
.hero { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 24px 48px; padding: 28px var(--page-pad) 0; }
.hero__text { display: flex; flex-direction: column; gap: 22px; max-width: 780px; }
.hero__text .lead { max-width: 580px; }
.hero__actions { display: flex; flex-wrap: wrap; gap: 12px; }
.hero__now { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; font-size: 14px; }
.hero__map { position: relative; margin: 28px clamp(12px, 1.7vw, 24px) 0; overflow: hidden; border-radius: var(--radius-hero); }
.hero__hint { position: absolute; left: 24px; bottom: 20px; font-size: 13px; }

.blends { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 20px; }
.blend { position: relative; display: flex; flex-direction: column; gap: 14px; padding: 28px; }
.blend.is-now { outline: 2px solid var(--ac); outline-offset: -2px; }
.blend .badge { position: absolute; top: 20px; left: 20px; }
.blend__tin { display: flex; justify-content: center; padding: 12px 0 8px; }
.blend__title { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
.blend__promise { font-size: 16px; }
.blend__price { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 6px 12px; font-size: 18px; font-weight: 700; }
.blend__price .mono { font-size: 13px; font-weight: 400; }

.longitudes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 40px 20px; }
.longitude { display: flex; flex-direction: column; gap: 16px; }
.longitude__deg { font-size: clamp(72px, 7vw, 104px); font-weight: 700; letter-spacing: -0.05em; line-height: 0.9; }
.longitude__map { overflow: hidden; border-radius: var(--radius-card); }
.longitude p { font-size: 16px; color: var(--mu); }

.herb-preview { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-bottom: 32px; }
.herb-preview figure { display: flex; flex-direction: column; gap: 10px; margin: 0; }
.herb-preview img { width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: contain; border-radius: 16px; background: var(--paper); }
.herb-preview .name { font-size: 18px; font-weight: 700; }
.herb-preview .lat { font-size: 20px; color: var(--mu); }

.bundle { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 40px; align-items: center; padding: clamp(24px, 4vw, 56px); border-radius: var(--radius-hero); }
.bundle__tins { display: flex; justify-content: center; align-items: flex-end; }
.bundle__tins > :first-child { margin-right: -34px; }
.bundle__tins > :nth-child(2) { position: relative; z-index: 1; }
.bundle__tins > :last-child { margin-left: -34px; }
.bundle__body { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; }
.segmented { display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--bg); }
.segmented .pill[aria-pressed="false"] { color: var(--mu); }
.bundle__price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 14px; font-size: clamp(36px, 3.5vw, 44px); font-weight: 700; letter-spacing: -0.03em; }
.bundle__price s { font-size: 20px; font-weight: 400; letter-spacing: 0; }

.brew { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 20px; }
.brew article { display: flex; flex-direction: column; gap: 12px; padding: 28px; border: 1px solid var(--line); border-radius: var(--radius-card); }
.brew h3 { font-size: 24px; font-weight: 700; }
.brew .temp { font: 20px var(--font-mono); }
.brew .dose { font: 14px var(--font-mono); color: var(--mu); }
.brew p { font-size: 16px; color: var(--mu); }

.faq { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 20px 40px; }
.faq details { border-top: 1px solid var(--line); }
.faq details:last-child { border-bottom: 1px solid var(--line); }
.faq summary { display: flex; justify-content: space-between; gap: 16px; padding: 22px 0; font-size: 20px; font-weight: 500; list-style: none; cursor: pointer; }
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after { content: '+'; }
.faq details[open] summary::after { content: '−'; }
.faq details p { max-width: 640px; padding-bottom: 22px; color: var(--mu); }

@media (max-width: 900px) {
  .faq { grid-template-columns: minmax(0, 1fr); }
}

@media (max-width: 640px) {
  .hero__now { align-items: flex-start; }
  .hero__actions .btn { flex: 1 1 100%; }
  .hero__hint { position: static; padding: 10px 12px 12px; }
  .blend { padding: 24px; }
  .herb-preview { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .herb-preview .lat { font-size: 17px; }
  .bundle__tins svg:nth-child(odd) { width: 100px; }
  .bundle__tins svg:nth-child(2) { width: 120px; }
  .faq summary { font-size: 17px; }
}
```

- [ ] **Step 3: Write `dolgota/js/home.js`**

```js
// Главная «Долготы»: часы → палитра и карта, карточки сборов, три долготы, набор, заваривание.
(function () {
  const { clock, data, shop, atlas, tin, russia } = window.Dolgota;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const herbById = (id) => data.herbs.find((h) => h.id === id);
  const regionOf = (blend) => data.regions[blend.region];

  // Карточки сборов.
  $('[data-blends]').innerHTML = data.blends.map((blend) => {
    const region = regionOf(blend);
    const herbs = blend.herbs.map((id) => herbById(id).name.toLowerCase()).join(', ');
    return `<article class="blend card" data-blend="${blend.id}">
      <span class="badge" data-now-badge hidden>сейчас его время</span>
      <div class="blend__tin">${tin.tinSvg({ name: blend.name, lon: blend.lon, regionName: region.name, tin: blend.tin }, 170)}</div>
      <h3 class="blend__title">${blend.name} · ${region.name}</h3>
      <p class="blend__promise muted">${blend.promise}: ${herbs}</p>
      <p class="blend__price"><span>${shop.formatRub(data.prices.tin)} · ${data.prices.weight}</span><span class="mono muted">${shop.formatRub(shop.subscriptionPrice(data.prices.tin))} по подписке</span></p>
      <button class="btn btn--ink" type="button" data-add="${blend.id}">В корзину</button>
    </article>`;
  }).join('');

  // Три долготы: фрагмент атласа вокруг каждого региона.
  $('[data-longitudes]').innerHTML = data.blends.map((blend) => {
    const region = regionOf(blend);
    return `<article class="longitude">
      <span class="longitude__deg">${region.lon}°</span>
      <span class="cap muted">${region.name} · в.&nbsp;д. · сбор ${region.months}</span>
      <div class="longitude__map"><svg class="atlas" data-fragment="${region.id}" role="img" aria-label="Фрагмент карты: ${region.name}, ${region.lon}° восточной долготы"></svg></div>
      <p>${region.story}</p>
    </article>`;
  }).join('');
  $$('[data-fragment]').forEach((svg) => {
    const region = data.regions[svg.dataset.fragment];
    atlas.createAtlas(svg, { mode: 'fragment', width: 430, height: 260, pad: 0, rings: russia, regions: Object.values(data.regions), box: region.box, meridian: region.lon, clock });
  });

  // Превью гербария.
  $('[data-herb-preview]').innerHTML = ['badan', 'chabrec', 'veresk', 'zveroboy'].map((id) => {
    const herb = herbById(id);
    return `<figure><img src="${herb.image}" alt="Гравюра: ${herb.name.toLowerCase()}" width="400" height="500" loading="lazy">
      <figcaption><span class="name">${herb.name}</span><br><span class="lat">${herb.latin}</span></figcaption></figure>`;
  }).join('');

  // Набор «Весь день».
  const sizes = [170, 200, 170];
  $('[data-bundle-tins]').innerHTML = data.blends.map((blend, i) => tin.tinSvg({ name: blend.name, lon: blend.lon, regionName: regionOf(blend).name, tin: blend.tin }, sizes[i])).join('');
  function setPlan(plan) {
    $$('[data-plan]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.plan === plan)));
    const sub = plan === 'sub';
    $('[data-bundle-price]').textContent = shop.formatRub(sub ? shop.subscriptionPrice(data.prices.bundle) : data.prices.bundle);
    $('[data-bundle-old]').textContent = sub ? shop.formatRub(data.prices.bundle) : '';
    $('[data-bundle-note]').textContent = sub ? 'раз в месяц · пропустить или отменить можно в любой момент' : 'одна посылка, без подписки';
  }
  $$('[data-plan]').forEach((b) => b.addEventListener('click', () => setPlan(b.dataset.plan)));
  setPlan('sub');

  // Как заваривать.
  $('[data-brew]').innerHTML = data.blends.map(({ name, brew }) => `<article>
      <h3>${name}</h3><span class="temp">${brew.temp}&nbsp;°C · ${brew.minutes}&nbsp;мин</span>
      <span class="dose">${brew.dose}</span><p>${brew.note}</p></article>`).join('');

  // Карта первого экрана и часы.
  const small = window.matchMedia('(max-width: 640px)');
  let heroAtlas = null;
  function buildHero() {
    const size = small.matches ? { width: 366, height: 250, pad: 12 } : { width: 1392, height: 620, pad: 34 };
    heroAtlas = atlas.createAtlas($('[data-hero-atlas]'), {
      mode: 'hero', ...size, rings: russia, regions: Object.values(data.regions), clock, blendNames: data.blendNames,
      onDrag: (min) => clock.setOverride(min),
    });
  }

  function onTick(min, overridden) {
    const blend = clock.blendAt(min);
    const region = data.regions[data.blends.find((b) => b.id === blend).region];
    const sun = clock.sunAt(min);
    $('[data-now-time]').textContent = sun.visible
      ? `${clock.formatTime(min)} · время сбора „${data.blendNames[blend]}“`
      : `${clock.formatTime(min)} · ночь · время сбора „${data.blendNames[blend]}“`;
    $('[data-now-place]').textContent = sun.visible ? `${region.name}, ${region.lon}° в. д.` : '';
    $('[data-reset]').hidden = !overridden;
    $$('.blend').forEach((card) => {
      const now = card.dataset.blend === blend;
      card.classList.toggle('is-now', now);
      $('[data-now-badge]', card).hidden = !now;
    });
    heroAtlas.update(min);
  }

  $('[data-reset]').addEventListener('click', () => clock.setOverride(null));
  small.addEventListener('change', () => { buildHero(); heroAtlas.update(clock.current()); });

  buildHero();
  clock.start(onTick);
})();
```

- [ ] **Step 4: Write `dolgota/js/site.js`** — общее для обеих страниц; подключается перед скриптом страницы:

```js
// Общее для страниц «Долготы»: игрушечная корзина с тостом, меню на телефоне, рассылка, подгонка надписей.
(function () {
  const { shop, fit } = window.Dolgota;
  const $ = (selector) => document.querySelector(selector);

  function safeStorage() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  const cart = shop.createCart(safeStorage());
  const toast = $('[data-toast]');
  let toastTimer = null;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
  }
  const counter = $('[data-cart-count]');
  const renderCart = () => { if (counter) counter.textContent = String(cart.count()); };
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-add]')) {
      cart.add();
      renderCart();
      showToast('Учебный проект: заказы не принимаются');
    } else if (event.target.closest('[data-cart]')) {
      showToast('Учебный проект: заказы не принимаются');
    }
  });
  renderCart();

  const navToggle = $('[data-nav-toggle]');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = $('#nav').classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const form = $('[data-newsletter]');
  if (form) {
    const message = $('[data-newsletter-message]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = form.elements.email;
      if (!email.value.trim() || !email.checkValidity()) {
        message.textContent = 'Проверь адрес: нужны @ и домен, например почта@пример.рф.';
        email.focus();
        return;
      }
      message.textContent = 'Спасибо! Это демо: письмо никуда не отправлено.';
      form.reset();
    });
  }

  // DOMContentLoaded наступает после всех defer-скриптов, так что банки страницы уже в DOM.
  document.addEventListener('DOMContentLoaded', () => {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => fit.fitSvgText());
    fit.debugOverflow();
  });
})();
```

- [ ] **Step 5: Write the local server `dolgota/tools/serve.js`**

```js
#!/usr/bin/env node
// Локальный сервер «Долготы» для проверки в браузере: node dolgota/tools/serve.js [порт]
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2]) || 8732;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(port, () => console.log(`Долгота: http://localhost:${port}`));
```

В `.claude/launch.json` добавить в массив `configurations` (файл не коммитим, чужие записи не трогаем):

```json
{ "name": "dolgota", "runtimeExecutable": "node", "runtimeArgs": ["dolgota/tools/serve.js", "8732"], "port": 8732 }
```

- [ ] **Step 6: Проверить в браузере**

Запустить предпросмотр `dolgota` (`preview_start`), открыть `http://localhost:8732/index.html?time=13:00&debug=overflow` и выполнить в странице:

```js
await new Promise((r) => setTimeout(r, 1500));
({
  overflow: window.__overflow,
  theme: document.documentElement.dataset.theme,
  bg: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
  now: document.querySelector('[data-now-time]').textContent,
  nowCard: document.querySelector('.blend.is-now')?.dataset.blend,
  sunVisible: document.querySelector('.atlas-sun').style.display !== 'none',
  meridian: document.querySelector('[data-hero-atlas] .atlas-meridian-label').textContent,
  tinsOk: [...document.querySelectorAll('.tin text[data-max]')].every((t) => { const b = t.getBBox(); return b.x + b.width <= Number(t.dataset.max) + 0.5; }),
})
```

Expected: `overflow: []`, `theme: 'light'`, `bg: '#F8F8F5'`, `now: '13:00 · время сбора „День“'`, `nowCard: 'day'`, `sunVisible: true`, `meridian: '45° в. д.'`, `tinsOk: true`. Затем `?time=21:00` → `theme: 'dark'`, `nowCard: 'evening'`; `?time=02:10` → текст «02:10 · ночь · время сбора „Вечер“», `sunVisible: false`. Ошибки консоли (`read_console_messages`, `onlyErrors: true`) — пусто, кроме 404 гравюр, пока их нет (Task 7).

Интерактив: фокус на солнце (`document.querySelector('.atlas-sun').focus()`), нажать `ArrowRight` четыре раза — время в строке сдвигается на час, появляется «Вернуться к моему времени»; клик по ней возвращает местное время. «В корзину» — счётчик растёт, появляется тост. «Разово» — цена `1 790 ₽` без зачёркивания.

- [ ] **Step 7: Commit**

```bash
git add dolgota/index.html dolgota/css/home.css dolgota/js/home.js dolgota/js/site.js dolgota/tools/serve.js
git commit -m "feat(dolgota): главная — карта с солнцем, сборы, долготы, набор, вопросы"
```

### Task 7: Гербарий — гравюры, `herbarium.html`, `herbarium.css`, `herbarium.js`

**Files:**
- Create: `dolgota/img/herbs/<id>.jpg` × 12
- Create: `dolgota/herbarium.html`, `dolgota/css/herbarium.css`, `dolgota/js/herbarium.js`
- Modify: `dolgota/js/data.js` — ссылка на файл гравюры родиолы
- Test: `dolgota/tests/images.test.js`

**Interfaces:**
- Consumes: `Dolgota.clock`, `Dolgota.data` (`herbs`, `blends`, `regions`, `blendNames`, `monthNames`), `Dolgota.atlas.createAtlas` (режим `mini`, опция `box`, метод `highlight`), `Dolgota.russia`, `js/site.js`, разметка шапки и подвала из Task 6, классы из `base.css`.
- Produces: страницу гербария; адреса `herbarium.html#<id>` и якорь `#istochniki`.

- [ ] **Step 1: Write the failing test** — `dolgota/tests/images.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { herbs } = require('../js/data.js');

test('у каждой травы есть гравюра не тяжелее 400 КБ', () => {
  for (const herb of herbs) {
    const file = path.join(__dirname, '..', herb.image);
    assert.ok(fs.existsSync(file), `нет ${herb.image}`);
    const kb = fs.statSync(file).size / 1024;
    assert.ok(kb > 5 && kb < 400, `${herb.image}: ${Math.round(kb)} КБ`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test dolgota/tests/images.test.js`
Expected: FAIL — `нет img/herbs/badan.jpg`.

- [ ] **Step 3: Спросить разрешение и скачать гравюры**

Файлы — страницы из `source.url` в `data.js`. Для родиолы `source.url` ведёт на категорию: взять в ней файл, имя которого начинается с `Atlas der Alpenflora`. Уменьшенные копии шириной 800 px отдаёт `Special:FilePath`; сначала узнать размеры:

```bash
for f in "The_Botanical_magazine,_or,_Flower-garden_displayed_(Plate_196)_(8559506873).jpg" "230_Hypericum_perforatum.jpg" "88_Mentha_arvensis.jpg" "90_Thymus_serpyllum.jpg" "91_Origanum_vulgare.jpg" "293_Rosa_cinnamomea.jpg" "Melissa_officinalis_-_Köhler–s_Medizinal-Pflanzen-094.jpg" "Illustration_Epilobium_angustifolium0.jpg" "147_Calluna_vulgaris.jpg" "288_Filipendula_ulmaria.jpg" "143_Vaccinium_vitis_idaea.jpg"; do
  printf '%s ' "$f"; curl -sIL "https://commons.wikimedia.org/wiki/Special:FilePath/$f?width=800" | grep -i '^content-length' | tail -1
done
```

Показать пользователю список из 12 файлов (11 выше и файл родиолы) с источником «Викисклад, общественное достояние» и суммарным размером, спросить разрешение. После «да» скачать по схеме `id → файл`:

```bash
mkdir -p dolgota/img/herbs
get() { curl -sL -o "dolgota/img/herbs/$1.jpg" "https://commons.wikimedia.org/wiki/Special:FilePath/$2?width=800"; }
get badan "The_Botanical_magazine,_or,_Flower-garden_displayed_(Plate_196)_(8559506873).jpg"
get zveroboy "230_Hypericum_perforatum.jpg"
get myata "88_Mentha_arvensis.jpg"
get chabrec "90_Thymus_serpyllum.jpg"
get dushica "91_Origanum_vulgare.jpg"
get shipovnik "293_Rosa_cinnamomea.jpg"
get melissa "Melissa_officinalis_-_Köhler–s_Medizinal-Pflanzen-094.jpg"
get ivanchay "Illustration_Epilobium_angustifolium0.jpg"
get veresk "147_Calluna_vulgaris.jpg"
get tavolga "288_Filipendula_ulmaria.jpg"
get brusnika "143_Vaccinium_vitis_idaea.jpg"
```

Для родиолы — тот же `get rodiola "<имя файла из категории>"`, а в `data.js` у родиолы заменить `source.url` на страницу этого файла (`https://commons.wikimedia.org/wiki/File:<имя>`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test dolgota/tests/images.test.js`
Expected: PASS. Если какой-то файл больше 400 КБ — скачать его с `?width=640`.

- [ ] **Step 5: Write `dolgota/herbarium.html`** — шапка и подвал такие же, как в `index.html` (Task 6), но пункт «Гербарий» отмечен, а ссылки ведут на главную:

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Гербарий — Долгота</title>
  <meta name="description" content="Учебный проект: 12 трав из трёх регионов с гравюрами из ботанических атласов XIX и начала XX века.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=JetBrains+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@1,500&display=swap">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/herbarium.css">
  <script defer src="js/clock.js"></script>
  <script defer src="js/data.js"></script>
  <script defer src="js/shop.js"></script>
  <script defer src="data/russia.js"></script>
  <script defer src="js/atlas.js"></script>
  <script defer src="js/fit.js"></script>
  <script defer src="js/site.js"></script>
  <script defer src="js/herbarium.js"></script>
</head>
<body>
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track cap"><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span></div>
    <div class="marquee__track cap"><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span><span>доставка по всей России</span><span>·</span><span>подписка −15&nbsp;%</span><span>·</span><span>урожай 2026 года</span><span>·</span></div>
  </div>

  <header class="site-header">
    <a class="logo" href="index.html">долгота</a>
    <nav class="nav" id="nav" aria-label="Разделы">
      <a class="pill" href="index.html#sbory">Сборы</a>
      <a class="pill" href="index.html#zavarivanie">Как заваривать</a>
      <a class="pill is-current" href="herbarium.html" aria-current="page">Гербарий</a>
    </nav>
    <div class="header-actions">
      <button class="pill nav-toggle" type="button" aria-expanded="false" aria-controls="nav" data-nav-toggle>Меню</button>
      <button class="pill cart-pill" type="button" data-cart>Корзина (<span data-cart-count>0</span>)</button>
    </div>
  </header>

  <main class="page">
    <section class="intro">
      <h1 class="h1">Гербарий</h1>
      <p class="lead">12 трав из трёх регионов. Гравюры взяты из ботанических атласов XIX и начала XX века.</p>
    </section>

    <div class="mini-map">
      <svg class="atlas" data-mini-atlas role="group" aria-label="Карта мест сбора трав"></svg>
      <p class="mini-map__note mono muted">точки сбора условные</p>
    </div>

    <div class="filters" role="group" aria-label="Фильтр по сбору">
      <button class="pill pill--outline" type="button" data-filter="all" aria-pressed="true">Все</button>
      <button class="pill pill--outline" type="button" data-filter="morning" aria-pressed="false">Утро · Алтай</button>
      <button class="pill pill--outline" type="button" data-filter="day" aria-pressed="false">День · Кавказ</button>
      <button class="pill pill--outline" type="button" data-filter="evening" aria-pressed="false">Вечер · Карелия</button>
    </div>

    <div class="herb-grid" data-herb-grid></div>

    <section class="sources" id="istochniki">
      <h2 class="cap muted">Источники</h2>
      <ul data-sources></ul>
      <p class="muted">Карта — Natural Earth, общественное достояние.</p>
    </section>
  </main>

  <dialog class="herb-dialog" data-herb-dialog aria-labelledby="herb-title">
    <button class="herb-dialog__close" type="button" data-herb-close aria-label="Закрыть">×</button>
    <div data-herb-body></div>
  </dialog>

  <footer class="site-footer">
    <div class="site-footer__top">
      <form class="newsletter" data-newsletter novalidate>
        <h2 class="h2">Письмо раз в сезон</h2>
        <p>О новом урожае и о том, как меняется свет.</p>
        <div class="newsletter__row">
          <label class="visually-hidden" for="email">Почта</label>
          <input id="email" name="email" type="email" required placeholder="почта@пример.рф" autocomplete="email">
          <button class="btn" type="submit">Подписаться</button>
        </div>
        <p class="newsletter__note" data-newsletter-message aria-live="polite">Демо: форма проверяет адрес, но ничего не отправляет.</p>
      </form>
      <div class="footer-links">
        <div><span class="cap">Магазин</span><a href="index.html#sbory">Сборы</a><a href="index.html#nabor">Набор «Весь день»</a><a href="index.html#zavarivanie">Как заваривать</a></div>
        <div><span class="cap">Гербарий</span><a href="herbarium.html">Все травы</a><a href="#istochniki">Источники</a></div>
      </div>
    </div>
    <div class="footer-legal">
      <span>Учебный проект: магазин вымышленный, заказы не принимаются · Не является лекарственным средством</span>
      <span>Гравюры: Lindman, Köhler, Thomé, «The Botanical Magazine», «Atlas der Alpenflora» — общественное достояние · Карта: Natural Earth · Шрифты: Google Fonts</span>
    </div>
  </footer>

  <a class="pill sticky-pill" href="index.html#nabor">Подписка −15&nbsp;%</a>
  <div class="toast" role="status" data-toast hidden></div>
</body>
</html>
```

- [ ] **Step 6: Write `dolgota/css/herbarium.css`** — по артбордам `Herbarium.dc.html` и `HerbDialog.dc.html`:

```css
/* Гербарий «Долготы»: мини-карта, фильтры, листы гербария, окно травы, источники. */
.intro { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px 48px; padding: 36px var(--page-pad) 0; }
.intro .lead { max-width: 520px; }
.mini-map { position: relative; margin: 32px clamp(12px, 1.7vw, 24px) 0; overflow: hidden; border-radius: var(--radius-hero); }
.mini-map__note { position: absolute; left: 24px; bottom: 18px; font-size: 13px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; padding: 32px var(--page-pad) 0; }

.herb-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; padding: 24px var(--page-pad) 0; }
.sheet { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-width: 0; padding: 16px 16px 20px; border: 0; border-radius: var(--radius-card); background: var(--paper); color: var(--paper-ink); font: inherit; text-align: left; cursor: pointer; }
.sheet[hidden] { display: none; }
.sheet:hover, .sheet:focus-visible { outline: 2px solid var(--ac); outline-offset: -2px; }
.sheet img { width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: contain; border-radius: 12px; }
.sheet__name { font-size: 20px; font-weight: 700; }
.sheet__lat { font-size: 20px; color: var(--paper-mu); overflow-wrap: anywhere; }
.sheet__meta { font-size: 12px; line-height: 1.5; color: var(--paper-mu); }
.tag { padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; }
.tag--morning { background: #F4C4A1; color: #3A2420; }
.tag--day { background: #F3D27A; color: #2A1F00; }
.tag--evening { background: #3B3F6B; color: #F1E9DC; }

.sources { margin: 64px var(--page-pad) 0; padding-top: 24px; border-top: 1px solid var(--line); }
.sources ul { margin: 12px 0; padding-left: 18px; font-size: 15px; line-height: 1.6; color: var(--mu); }

.herb-dialog { width: min(1080px, calc(100vw - 32px)); max-height: calc(100vh - 32px); padding: clamp(20px, 3vw, 40px); border: 0; border-radius: var(--radius-hero); background: var(--paper); color: var(--paper-ink); }
.herb-dialog::backdrop { background: rgba(18, 18, 18, 0.55); }
.herb-dialog__close { position: absolute; top: 16px; right: 16px; width: 44px; height: 44px; border: 0; border-radius: 999px; background: color-mix(in srgb, var(--paper-ink) 10%, transparent); color: var(--paper-ink); font-size: 22px; cursor: pointer; }
.herb-dialog__grid { display: grid; grid-template-columns: minmax(0, 400px) minmax(0, 1fr); gap: clamp(20px, 3vw, 44px); }
.herb-dialog__grid img { width: 100%; height: auto; border-radius: 18px; }
.herb-dialog__body { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.herb-dialog h2 { padding-right: 52px; font-size: clamp(34px, 4vw, 48px); font-weight: 700; letter-spacing: -0.035em; line-height: 1; }
.herb-dialog .lat { font-size: 26px; color: var(--paper-mu); }
.herb-dialog .mono { font-size: 14px; color: var(--paper-mu); }
.months { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; }
.month { display: flex; align-items: center; justify-content: center; height: 34px; border-radius: 8px; background: color-mix(in srgb, var(--paper-ink) 10%, transparent); color: var(--paper-ink); font: 12px var(--font-mono); }
.month.is-on { background: #EDB723; color: #2A1F00; font-weight: 500; }
.herb-dialog__map { overflow: hidden; border-radius: 16px; }
.herb-dialog__link { font-weight: 700; }
.herb-dialog__source { font: 12px/1.5 var(--font-mono); color: var(--paper-mu); }

@media (max-width: 1023px) {
  .herb-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 800px) {
  .herb-dialog__grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 599px) {
  .herb-grid { grid-template-columns: minmax(0, 1fr); }
  .mini-map__note { position: static; padding: 8px 12px 12px; }
}
```

- [ ] **Step 7: Write `dolgota/js/herbarium.js`**

```js
// Гербарий «Долготы»: сетка листов, фильтры, мини-карта, окно травы с адресом #id, источники.
(function () {
  const { clock, data, atlas, russia } = window.Dolgota;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const regionOf = (herb) => data.regions[data.blends.find((b) => b.id === herb.blend).region];
  const decimal = (n) => n.toFixed(1).replace('.', ',');
  const coordsText = ([lon, lat]) => `${decimal(lat)}° с. ш. ${decimal(lon)}° в. д.`;
  const monthsText = (months) => {
    const names = months.map((m) => data.monthNames[m - 1]);
    return names.length > 1 ? `${names[0]}–${names[names.length - 1]}` : names[0];
  };

  const grid = $('[data-herb-grid]');
  grid.innerHTML = data.herbs.map((herb) => `<button class="sheet" type="button" data-herb="${herb.id}" data-blend="${herb.blend}">
      <img src="${herb.image}" alt="" width="400" height="500" loading="lazy">
      <span class="sheet__name">${herb.name}</span>
      <span class="lat sheet__lat">${herb.latin}</span>
      <span class="mono sheet__meta">${regionOf(herb).name} · ${coordsText(herb.coords)}<br>${monthsText(herb.months)}</span>
      <span class="tag tag--${herb.blend}">${data.blendNames[herb.blend]}</span>
    </button>`).join('');

  const small = window.matchMedia('(max-width: 640px)');
  const mini = atlas.createAtlas($('[data-mini-atlas]'), {
    mode: 'mini', ...(small.matches ? { width: 366, height: 300, pad: 12 } : { width: 1392, height: 440, pad: 26 }),
    rings: russia, regions: Object.values(data.regions), herbs: data.herbs, clock, onPick: (id) => open(id),
  });

  $$('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    $$('.sheet').forEach((sheet) => { sheet.hidden = filter !== 'all' && sheet.dataset.blend !== filter; });
  }));

  grid.addEventListener('pointerover', (event) => {
    const sheet = event.target.closest('.sheet');
    mini.highlight(sheet ? sheet.dataset.herb : null);
  });
  grid.addEventListener('pointerleave', () => mini.highlight(null));
  grid.addEventListener('focusin', (event) => {
    const sheet = event.target.closest('.sheet');
    if (sheet) mini.highlight(sheet.dataset.herb);
  });
  grid.addEventListener('click', (event) => {
    const sheet = event.target.closest('.sheet');
    if (sheet) open(sheet.dataset.herb);
  });

  const dialog = $('[data-herb-dialog]');
  const body = $('[data-herb-body]');
  let opener = null;

  function render(herb) {
    const blend = data.blends.find((b) => b.id === herb.blend);
    const months = data.monthNames.map((name, i) => `<span class="month${herb.months.includes(i + 1) ? ' is-on' : ''}" title="${name}">${name[0]}</span>`).join('');
    return `<div class="herb-dialog__grid">
      <img src="${herb.image}" alt="Гравюра: ${herb.name.toLowerCase()}" width="400" height="500">
      <div class="herb-dialog__body">
        <div><h2 id="herb-title">${herb.name}</h2><span class="lat">${herb.latin}</span></div>
        <span class="mono">${regionOf(herb).name} · ${coordsText(herb.coords)}</span>
        <p>${herb.about} Вкус — ${herb.taste}.</p>
        <div><span class="cap">месяцы сбора</span><div class="months">${months}</div></div>
        <div class="herb-dialog__map"><svg class="atlas" data-dialog-atlas role="img" aria-label="Место сбора: ${regionOf(herb).name}"></svg></div>
        <a class="herb-dialog__link" href="index.html#sbory">Входит в сбор „${blend.name}“ →</a>
        <span class="herb-dialog__source">Гравюра: <a href="${herb.source.url}">${herb.source.title}</a> · ${herb.source.license}</span>
      </div>
    </div>`;
  }

  function open(id) {
    const herb = data.herbs.find((h) => h.id === id);
    if (!herb) return;
    opener = document.activeElement;
    body.innerHTML = render(herb);
    atlas.createAtlas($('[data-dialog-atlas]', body), {
      mode: 'mini', width: 556, height: 170, pad: 0, rings: russia, regions: Object.values(data.regions),
      herbs: data.herbs.filter((h) => h.blend === herb.blend), box: regionOf(herb).box, clock,
    }).highlight(herb.id);
    if (!dialog.open) dialog.showModal();
    history.replaceState(null, '', `#${herb.id}`);
  }

  dialog.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    if (opener && document.contains(opener)) opener.focus();
  });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  $('[data-herb-close]').addEventListener('click', () => dialog.close());

  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (data.herbs.some((h) => h.id === id)) open(id);
  };
  window.addEventListener('hashchange', fromHash);

  const sources = new Map(data.herbs.map((h) => [h.source.title, h.source]));
  $('[data-sources]').innerHTML = [...sources.values()].map((s) => `<li><a href="${s.url}">${s.title}</a> — ${s.license}</li>`).join('');

  clock.start(() => {});
  fromHash();
})();
```

- [ ] **Step 8: Проверить в браузере** — `http://localhost:8732/herbarium.html?time=13:00&debug=overflow`:

```js
await new Promise((r) => setTimeout(r, 1500));
const sheets = [...document.querySelectorAll('.sheet')];
document.querySelector('[data-filter="evening"]').click();
const visibleEvening = sheets.filter((s) => !s.hidden).map((s) => s.dataset.herb);
document.querySelector('[data-filter="all"]').click();
sheets.find((s) => s.dataset.herb === 'chabrec').click();
({
  overflow: window.__overflow,
  sheets: sheets.length,
  broken: [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src),
  visibleEvening,
  dialogOpen: document.querySelector('[data-herb-dialog]').open,
  hash: location.hash,
  monthsOn: [...document.querySelectorAll('.month.is-on')].map((m) => m.title),
})
```

Expected: `overflow: []`, `sheets: 12`, `broken: []`, `visibleEvening: ['ivanchay', 'veresk', 'tavolga', 'brusnika']`, `dialogOpen: true`, `hash: '#chabrec'`, `monthsOn: ['июнь', 'июль']`. Затем нажать Esc: окно закрыто, `location.hash === ''`, фокус на карточке чабреца. Открыть `herbarium.html#veresk` — окно вереска открыто сразу.

- [ ] **Step 9: Commit**

```bash
git add dolgota/img/herbs dolgota/herbarium.html dolgota/css/herbarium.css dolgota/js/herbarium.js dolgota/tests/images.test.js dolgota/js/data.js
git commit -m "feat(dolgota): гербарий — 12 гравюр, фильтры, окно травы, мини-карта"
```

### Task 8: Финальная проверка, README, PR

**Files:**
- Create: `dolgota/README.md`
- Modify: `docs/superpowers/specs/2026-09-10-dolgota-design.md` — статус и источники гравюр

**Interfaces:**
- Consumes: всё из Tasks 1–7.
- Produces: готовый сайт в ветке `feat/dolgota` и PR в `main`.

- [ ] **Step 1: Все автотесты**

Run: `node --test dolgota/tests/*.test.js`
Expected: PASS — все тесты, 0 failures.

- [ ] **Step 2: Матрица переполнения** — для ширины 360, 768 и 1280 px (`resize_window`) и времени 07:00, 13:00, 21:00 открыть обе страницы с `&debug=overflow` и через 1,5 с после загрузки прочитать отчёт:

```js
await new Promise((r) => setTimeout(r, 1500));
({ page: location.pathname + location.search, width: innerWidth, overflow: window.__overflow })
```

Expected: `overflow: []` во всех 18 комбинациях. Любое нарушение чинится в CSS той страницы, после чего матрица прогоняется заново. В конце — `resize_window` с `preset: 'desktop'`.

- [ ] **Step 3: Контраст полупрозрачного текста подвала** — при `?time=07:00`, `13:00`, `21:00`:

```js
const toRgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const footer = document.querySelector('.site-footer');
const note = document.querySelector('.footer-legal');
ratio(toRgb(getComputedStyle(note).color), toRgb(getComputedStyle(footer).backgroundColor)).toFixed(2)
```

Expected: не меньше `4.50`. Если меньше — в `base.css` поднять долю `var(--bg)` в `color-mix` у `.newsletter__note` и `.footer-legal` с 60 % до 72 % и перемерить.

- [ ] **Step 4: Клавиатура и движение**
  - Tab по главной: меню → корзина → кнопки первого экрана → солнце (обводка вокруг ореола) → карточки. Стрелки двигают солнце, Home и End ставят 05:00 и 23:00.
  - Гербарий: Tab до фильтров и листов, Enter открывает окно, Esc закрывает, фокус возвращается на лист.
  - `prefers-reduced-motion`: `grep -n "animation\|transition" dolgota/css/*.css` — каждая анимация либо отменяется внутри `@media (prefers-reduced-motion: reduce)`, либо идёт через `var(--theme-transition)`, которая в этом режиме равна `none`.

- [ ] **Step 5: Двойной клик** — открыть `dolgota/index.html` и `dolgota/herbarium.html` прямо из проводника (`file://`): страницы собираются, солнце стоит, гербарий фильтруется. Это проверка отказа от модулей и `fetch`.

- [ ] **Step 6: README** — `dolgota/README.md`:

```markdown
# Долгота

Учебный сайт в стиле noon.world: три сбора травяного чая, по одному на каждое время суток. Солнце на карте-атласе идёт по местному времени посетителя, вместе с ним меняется палитра всего сайта. Магазин вымышленный, заказы не принимаются.

## Запуск

Открой `index.html` в браузере — сборка не нужна. Для проверки с сервером: `node dolgota/tools/serve.js` и http://localhost:8732.

Полезные параметры адреса:

| Параметр | Что делает |
| --- | --- |
| `?time=19:30` | показать сайт в заданное время |
| `?debug=overflow` | обвести красным всё, что вылезает за рамки |

## Устройство

| Файл | Что внутри |
| --- | --- |
| `js/clock.js` | часы сайта: фаза сбора, палитра «Небо», положение солнца |
| `js/atlas.js` | коническая проекция и SVG-карта, перетаскивание солнца |
| `js/data.js` | сборы, регионы, 12 трав, цены |
| `js/shop.js` | цены по подписке и игрушечная корзина |
| `js/tin.js`, `js/fit.js` | банка сбора и подгонка надписей |
| `js/site.js` | общее для страниц: корзина, меню, рассылка |
| `js/home.js`, `js/herbarium.js` | логика страниц |
| `data/russia.js` | контур России из Natural Earth, собирается `tools/make-russia.js` |

## Тесты

`node --test dolgota/tests/*.test.js` — встроенный раннер Node, без зависимостей.

## Источники

Гравюры — общественное достояние (Викисклад): C. A. M. Lindman «Bilder ur Nordens Flora», F. E. Köhler «Köhler’s Medizinal-Pflanzen», O. W. Thomé «Flora von Deutschland», «The Botanical Magazine», «Atlas der Alpenflora». Карта — Natural Earth. Шрифты — Manrope, JetBrains Mono, Cormorant Garamond (Google Fonts).
```

- [ ] **Step 7: Обновить спецификацию** — в `docs/superpowers/specs/2026-09-10-dolgota-design.md`:
  - строку статуса заменить на ``- **Статус:** утверждена, реализована в ветке `feat/dolgota` ``;
  - в таблице 2.1 источник гравюры бадана — «The Botanical Magazine, т. 6, табл. 196 (1793)», родиолы — «Atlas der Alpenflora (1882)», иван-чая — «Thomé, Flora von Deutschland (1885)»;
  - в разделе 7 пункт про гравюры родиолы и иван-чая заменить на «Решено: гравюры найдены, см. 2.1».

- [ ] **Step 8: Commit**

```bash
git add dolgota/README.md docs/superpowers/specs/2026-09-10-dolgota-design.md
git commit -m "docs(dolgota): README и итоговая спецификация"
```

- [ ] **Step 9: Push и PR** — перед пушем коротко спросить пользователя. После «да»:

```bash
git push -u origin feat/dolgota
gh pr create --base main --head feat/dolgota --title "«Долгота»: учебный сайт травяного чая в стиле noon.world" --body "$(cat <<'EOF'
## Что сделано
- Главная: карта-атлас, где солнце идёт по местному времени посетителя, палитра «Небо», три сбора, три долготы, набор «Весь день», как заваривать, вопросы.
- Гербарий: 12 трав с гравюрами из общественного достояния, фильтры, окно травы с адресом `#id`, мини-карта мест сбора.
- Чистые HTML, CSS и JS без сборки; тесты на встроенном раннере Node.

## Как проверить
- `node --test dolgota/tests/*.test.js`
- Открыть `dolgota/index.html`; `?time=07:00`, `?time=21:00` — утро и вечер; `?debug=overflow` — проверка переполнения.

Спецификация: `docs/superpowers/specs/2026-09-10-dolgota-design.md`, план: `docs/superpowers/plans/2026-09-10-dolgota-site.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
