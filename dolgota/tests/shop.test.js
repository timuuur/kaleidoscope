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
