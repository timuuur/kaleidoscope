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
