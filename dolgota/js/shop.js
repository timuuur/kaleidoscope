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
