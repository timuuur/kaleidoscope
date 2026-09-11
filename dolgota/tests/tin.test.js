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
