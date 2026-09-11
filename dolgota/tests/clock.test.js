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
