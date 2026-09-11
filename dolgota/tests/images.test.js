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
