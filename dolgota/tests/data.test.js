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
