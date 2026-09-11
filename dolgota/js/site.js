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
