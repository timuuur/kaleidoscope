const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { herbs, blends } = require('../js/data.js');

test('у каждой травы есть гравюра не тяжелее 400 КБ', () => {
  for (const herb of herbs) {
    const file = path.join(__dirname, '..', herb.image);
    assert.ok(fs.existsSync(file), `нет ${herb.image}`);
    const kb = fs.statSync(file).size / 1024;
    assert.ok(kb > 5 && kb < 400, `${herb.image}: ${Math.round(kb)} КБ`);
  }
});

test('у каждого сбора есть фото чая не тяжелее 250 КБ, с автором и ссылкой на Unsplash', () => {
  for (const blend of blends) {
    const { src, alt, author, url } = blend.photo;
    assert.equal(src, `img/teas/${blend.id}.jpg`);
    assert.ok(alt && author && url.startsWith('https://unsplash.com/photos/'), blend.id);
    const file = path.join(__dirname, '..', src);
    assert.ok(fs.existsSync(file), `нет ${src}`);
    const kb = fs.statSync(file).size / 1024;
    assert.ok(kb > 5 && kb < 250, `${src}: ${Math.round(kb)} КБ`);
  }
});
