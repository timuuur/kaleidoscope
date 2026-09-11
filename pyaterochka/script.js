/* Что покупать в Пятёрочке — логика страницы.
   Без зависимостей и fetch: всё работает и при открытии index.html с диска (file://). */
(() => {
  'use strict';

  // ---------- Данные (как в брифе) ----------

  const PRODUCTS = [
    { category: 'Белок', name: 'Бедро куриное охлаждённое', brand: 'Пятёрочка', weight: '1 кг', price: 219.99, url: 'https://catalog-ceny.ru/bedro-kurinoe-ohlazhdennoe-1kg-3191296-5ka' },
    { category: 'Белок', name: 'Яйцо куриное С0', brand: 'Роскар Экстра', weight: '10 шт', price: 117.99, url: 'https://catalog-ceny.ru/pyaterochka/vse-dlya-vypechki-1/yayco' },
    { category: 'Белок', name: 'Творог 5% БЗМЖ', brand: 'Простоквашино', weight: '200 г', price: 103.99, url: 'https://catalog-ceny.ru/bzmzh-prostokvashino-tvorog-5-200g-obram-gk6-4121613-5ka' },
    { category: 'Белок', name: 'Йогурт греческий 2%', brand: 'Савушкин Teos', weight: '250 г', price: 77.99, url: 'https://catalog-ceny.ru/jogurt-savushkin-grecheskij-teos-2--250-g-3697856-5ka' },
    { category: 'Белок', name: 'Тунец рубленый в собственном соку', brand: 'Fish House', weight: '185 г', price: 179.99, url: 'https://catalog-ceny.ru/pyaterochka/konservy-i-solenya/konservy-iz-ryby-i-moreproduktov' },
    { category: 'Белок', name: 'Филе минтая без кожи, замороженное', brand: 'Fish House', weight: '600 г', price: 279.99, url: 'https://catalog-ceny.ru/fish-house-mintaj-file-morozhenfas-600-g-3628683-5ka' },
    { category: 'Белок', name: 'Чечевица красная', brand: 'Пятёрочка', weight: '450 г', price: 124.99, url: 'https://catalog-ceny.ru/chechevica-krasnaya-450gr-4002383-5ka' },
    { category: 'Белок', name: 'Кефир (ориентир по цене)', brand: 'Простоквашино/Авида', weight: '900 мл', price: 90, url: null },
    { category: 'Крупы и углеводы', name: 'Гречка ядрица, высший сорт', brand: 'Алтайская', weight: '800 г', price: 119.99, url: 'https://catalog-ceny.ru/pyaterochka/makorony-i-krupy/grechka-1' },
    { category: 'Крупы и углеводы', name: 'Рис для плова, шлифованный', brand: 'Агро-Альянс', weight: '900 г', price: 154.99, url: 'https://catalog-ceny.ru/ris-agro-alyans-dlya-plova-shlifovannij-900g-3422668-5ka' },
    { category: 'Крупы и углеводы', name: 'Хлебцы 5 злаков с семенами льна', brand: 'Щедрые', weight: '200 г', price: 119.99, url: 'https://catalog-ceny.ru/pyaterochka/hleb-i-vypechka-1-1/hlebcy-1-1' },
    { category: 'Крупы и углеводы', name: 'Овсяные хлопья (ориентир по цене)', brand: 'Геркулес/Мистраль', weight: '400-500 г', price: 90, url: null },
    { category: 'Молочка и сыр', name: 'Молоко УВТ 3.2%', brand: 'С нашей фермы', weight: '925 мл', price: 99.99, url: 'https://catalog-ceny.ru/moloko-s-nashej-fermi-ultrapasterizovannoe-32-925-ml-3485660-5ka' },
    { category: 'Молочка и сыр', name: 'Сыр Гауда 45% (фасовка ~200 г)', brand: 'LiebenDorf', weight: '1 кг = 999.99₽', price: 200, url: 'https://catalog-ceny.ru/pyaterochka/syry-1/tverdye-syry' },
    { category: 'Жиры и перекусы', name: 'Масло подсолнечное рафинированное', brand: 'Селяночка', weight: '1 л', price: 119.99, url: 'https://catalog-ceny.ru/pyaterochka/maslo-i-specii/podsolnechnoe-maslo-1' },
    { category: 'Жиры и перекусы', name: 'Масло подсолнечное нерафинированное', brand: 'БЛАГО', weight: '0.65 л', price: 134.99, url: 'https://catalog-ceny.ru/pyaterochka/maslo-i-specii/podsolnechnoe-maslo-1' },
    { category: 'Жиры и перекусы', name: 'Орех грецкий сушёный', brand: 'MIXBAR', weight: '100 г', price: 149.99, url: 'https://catalog-ceny.ru/pyaterochka/zdorovyy-vybor/orehi-suhofrukty-smesi' },
    { category: 'Жиры и перекусы', name: 'Финики', brand: 'MIXBAR', weight: '200 г', price: 84.99, url: 'https://catalog-ceny.ru/pyaterochka/zdorovyy-vybor/orehi-suhofrukty-smesi' },
    { category: 'Овощи', name: 'Смесь овощная 8 овощей, замороженная', brand: 'Global Village', weight: '400 г', price: 135.99, url: 'https://catalog-ceny.ru/pyaterochka/zamorozhennye-produkty-1-1-1/ovoschi-i-griby-zamorozhennye' },
    { category: 'Овощи', name: 'Капуста брокколи, быстрозамороженная', brand: 'Hortex', weight: '400 г', price: 179.99, url: 'https://catalog-ceny.ru/pyaterochka/zamorozhennye-produkty-1-1-1/ovoschi-i-griby-zamorozhennye' },
  ];

  // Фото упаковок, скачанные с catalog-ceny.ru в img/.
  // Нет ссылки или файл не открылся — вместо фото крупная эмодзи.
  const PHOTOS = {
    'Бедро куриное охлаждённое': 'img/bedro.jpg',
    'Яйцо куриное С0': 'img/yajca.jpg',
    'Творог 5% БЗМЖ': 'img/tvorog.jpg',
    'Йогурт греческий 2%': 'img/jogurt.jpg',
    'Тунец рубленый в собственном соку': 'img/tunec.jpg',
    'Филе минтая без кожи, замороженное': 'img/mintaj.jpg',
    'Чечевица красная': 'img/chechevica.jpg',
    'Гречка ядрица, высший сорт': 'img/grechka.jpg',
    'Рис для плова, шлифованный': 'img/ris.jpg',
    'Хлебцы 5 злаков с семенами льна': 'img/hlebcy.jpg',
    'Молоко УВТ 3.2%': 'img/moloko.jpg',
    'Сыр Гауда 45% (фасовка ~200 г)': 'img/syr.jpg',
    'Масло подсолнечное рафинированное': 'img/maslo-raf.jpg',
    'Масло подсолнечное нерафинированное': 'img/maslo-neraf.jpg',
    'Орех грецкий сушёный': 'img/oreh.jpg',
    'Финики': 'img/finiki.jpg',
    'Смесь овощная 8 овощей, замороженная': 'img/ovoshi.jpg',
    'Капуста брокколи, быстрозамороженная': 'img/brokkoli.jpg',
  };

  const CATEGORY_EMOJI = {
    'Белок': '🍗',
    'Крупы и углеводы': '🥣',
    'Молочка и сыр': '🧀',
    'Жиры и перекусы': '🥜',
    'Овощи': '🥦',
  };

  // Заглушка точнее категории — по слову в названии (первое совпадение).
  const ITEM_EMOJI = [
    [/яйц/i, '🥚'], [/бедро/i, '🍗'], [/тунец|минта/i, '🐟'], [/кефир|молоко|творог/i, '🥛'],
    [/йогурт|овсян/i, '🥣'], [/чечевиц/i, '🍲'], [/гречк/i, '🌾'], [/^рис/i, '🍚'], [/хлебц/i, '🍞'],
    [/сыр/i, '🧀'], [/масло/i, '🌻'], [/орех/i, '🌰'], [/финик/i, '🌴'], [/брокколи/i, '🥦'], [/овощ/i, '🥕'],
  ];

  const STORE_KEY = 'pyaterochka-cheatsheet:v1';

  // ---------- Помощники ----------

  const NBSP = '\u00A0';
  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function decorative(node) {
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  const store = {
    load() {
      try {
        const list = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
        return new Set(Array.isArray(list) ? list : []);
      } catch {
        return new Set();
      }
    },
    save(set) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify([...set]));
      } catch {
        // приватный режим или запрет хранилища — отметки живут до перезагрузки
      }
    },
  };

  const nf0 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fixSpaces = (s) => s.replace(/[\u202F\u2009]/g, NBSP);

  // 21999 → «219,99 ₽», 9000 → «90 ₽»
  const money = (cents) => fixSpaces((cents % 100 ? nf2 : nf0).format(cents / 100)) + NBSP + '₽';
  // всегда два знака — для колонки цен в чеке
  const money2 = (cents) => fixSpaces(nf2.format(cents / 100));

  function plural(n, one, few, many) {
    const n10 = n % 10;
    const n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  }

  // Типографика для строк из данных: запятая в дробях, тире в диапазонах,
  // неразрывные пробелы у чисел, ₽ и однобуквенных предлогов.
  function typo(s) {
    let out = s
      .replace(/(\d)\.(\d)/g, '$1,$2')
      .replace(/(\d)-(\d)/g, '$1—$2')
      .replace(/(\d)\s*₽/g, '$1' + NBSP + '₽')
      .replace(/(\d) (?=[A-Za-zА-Яа-яЁё])/g, '$1' + NBSP)
      .replace(/ =/g, NBSP + '=');
    for (let i = 0; i < 2; i++) {
      out = out.replace(/(^|[\s(])([ВКСОУАИЯвксоуаия]) /g, '$1$2' + NBSP);
    }
    return out;
  }

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Для поиска: регистр, ё/е, пробелы, запятая/точка, тире/дефис не важны.
  // Замены один-в-один по длине — иначе сломается подсветка совпадений.
  const norm = (s) => s.toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/,/g, '.')
    .replace(/[—–]/g, '-');

  const tokenize = (q) => norm(q).trim().split(/\s+/).filter(Boolean);

  // Текст с <mark> вокруг найденных кусочков — без innerHTML.
  function paint(node, text, tokens) {
    const ranges = [];
    if (tokens.length) {
      const hay = norm(text);
      for (const t of tokens) {
        const at = hay.indexOf(t);
        if (at >= 0) ranges.push([at, at + t.length]);
      }
    }
    if (!ranges.length) {
      node.textContent = text;
      return;
    }
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push(r.slice());
    }
    node.textContent = '';
    let pos = 0;
    for (const [from, to] of merged) {
      if (from > pos) node.append(text.slice(pos, from));
      node.append(el('mark', null, text.slice(from, to)));
      pos = to;
    }
    if (pos < text.length) node.append(text.slice(pos));
  }

  function svg(markup) {
    const wrap = document.createElement('span');
    wrap.innerHTML = markup; // статичная разметка иконки, не данные
    return decorative(wrap.firstElementChild);
  }

  const ICON_EXTERNAL = '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24"><path pathLength="20" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  // ---------- Модель ----------

  const categories = [...new Set(PRODUCTS.map((p) => p.category))];

  const items = PRODUCTS.map((p, i) => {
    const parts = p.name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    const title = typo(parts ? parts[1] : p.name);
    const meta = typo(p.brand) + ', ' + typo(p.weight);
    const emojiRule = ITEM_EMOJI.find(([re]) => re.test(p.name));
    return {
      ...p,
      id: 'p' + i,
      key: p.name,
      title,
      note: parts ? capitalize(typo(parts[2])) : '',
      meta,
      cents: Math.round(p.price * 100),
      approx: !p.url,
      hay: norm(title + ' ' + meta), // название + бренд и вес

      emoji: emojiRule ? emojiRule[1] : CATEGORY_EMOJI[p.category] || '🛒',
      photo: PHOTOS[p.name] || null,
    };
  });

  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  const known = new Set(items.map((it) => it.key));
  const checked = new Set([...store.load()].filter((key) => known.has(key)));

  const state = { cat: 'all', q: '' };

  // ---------- Узлы ----------

  const shelf = $('#shelf');
  const chipsBar = $('#chips-bar');
  const chipsEl = $('#chips');
  const search = $('#q');
  const searchClear = $('#q-clear');
  const statusEl = $('#status');
  const emptyBox = $('#empty');
  const emptyText = $('#empty-text');
  const emptyAction = $('#empty-action');

  const barButton = $('#bar-button');
  const barFill = $('#bar-fill');
  const barLabel = $('#bar-label');
  const barHint = $('#bar-hint');
  const barTotal = $('#bar-total');

  const receipt = $('#receipt');
  const receiptSheet = $('#receipt-sheet');
  const receiptDate = $('#receipt-date');
  const receiptLines = $('#receipt-lines');
  const receiptEmpty = $('#receipt-empty');
  const receiptTotal = $('#receipt-total');
  const receiptCount = $('#receipt-count');
  const resetButton = $('#reset');
  const closeButton = $('#receipt-close');

  // ---------- Отрисовка ----------

  function renderCard(item) {
    const li = el('li');
    const card = el('article', 'card');
    card.dataset.id = item.id;

    const thumb = decorative(el('div', 'thumb'));
    thumb.append(el('span', 'thumb-emoji', item.emoji));
    if (item.photo) {
      const img = new Image();
      img.alt = '';
      img.width = 500;
      img.height = 500;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => thumb.classList.add('is-loaded'), { once: true });
      img.addEventListener('error', () => img.remove(), { once: true });
      img.src = item.photo;
      thumb.append(img);
    }

    const info = el('div', 'info');
    const name = el('h3', 'name', item.title);
    info.append(name);
    if (item.note) info.append(el('p', 'note', item.note));
    const meta = el('p', 'meta', item.meta);
    info.append(meta);
    if (item.url) {
      const link = el('a', 'src');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const tail = el('span', 'nowrap', 'сайте'); // иконка не отрывается от последнего слова
      tail.append(svg(ICON_EXTERNAL));
      link.append('Фото и' + NBSP + 'цена на' + NBSP, tail,
        el('span', 'visually-hidden', ' (откроется в новой вкладке)'));
      info.append(link);
    }

    const foot = el('div', 'foot');
    const price = el('p', 'price', (item.approx ? '≈' + NBSP : '') + money(item.cents));
    const got = el('label', 'got');
    const input = el('input');
    input.type = 'checkbox';
    input.checked = checked.has(item.key);
    input.setAttribute('aria-label', 'Куплено: ' + item.title);
    const box = decorative(el('span', 'got-box'));
    box.append(svg(ICON_CHECK));
    got.append(input, box, el('span', 'got-text', 'Куплено'));
    foot.append(price, got);

    card.append(thumb, info, foot);
    card.classList.toggle('is-got', input.checked);
    li.append(card);

    Object.assign(item, { li, card, input, got, nameEl: name, metaEl: meta });
    return li;
  }

  const groups = categories.map((cat, i) => {
    const section = el('section', 'group');
    const title = el('h2', 'group-title');
    title.id = 'cat-' + i;
    section.setAttribute('aria-labelledby', title.id);
    const count = el('span', 'group-count');
    title.append(decorative(el('span', 'group-emoji', CATEGORY_EMOJI[cat] || '🛒')), cat, count);

    const list = el('ul', 'cards');
    list.setAttribute('role', 'list');
    const groupItems = items.filter((it) => it.category === cat);
    for (const it of groupItems) list.append(renderCard(it));

    section.append(title, list);
    shelf.append(section);
    return { cat, section, count, items: groupItems };
  });

  const chipRefs = {};
  for (const value of ['all', ...categories]) {
    const chip = el('label', 'chip');
    const input = el('input');
    input.type = 'radio';
    input.name = 'cat';
    input.value = value;
    input.checked = value === 'all';
    const face = el('span', 'chip-face');
    if (value !== 'all') face.append(decorative(el('span', 'chip-emoji', CATEGORY_EMOJI[value] || '🛒')));
    face.append(value === 'all' ? 'Все' : value);
    const count = el('span', 'chip-count');
    face.append(count);
    chip.append(input, face);
    chipsEl.append(chip);
    chipRefs[value] = { chip, count };
  }

  const totalCents = items.reduce((sum, it) => sum + it.cents, 0);
  $('#facts').textContent = `${items.length} ${plural(items.length, 'продукт', 'продукта', 'продуктов')} в${NBSP}${categories.length}${NBSP}разделах. `
    + `Весь список${NBSP}— около${NBSP}${money(Math.round(totalCents / 100) * 100)}`;

  // ---------- Фильтр и поиск ----------

  let statusTimer = 0;
  function announce(text) {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.textContent = text; }, 600);
  }

  function applyFilter({ quiet = false } = {}) {
    const tokens = tokenize(state.q);
    const matches = Object.fromEntries(categories.map((c) => [c, 0]));
    let found = 0;
    let shown = 0;

    for (const it of items) {
      const match = tokens.every((t) => it.hay.includes(t));
      const visible = match && (state.cat === 'all' || state.cat === it.category);
      if (match) { matches[it.category]++; found++; }
      if (visible) shown++;
      it.li.hidden = !visible;
      paint(it.nameEl, it.title, visible ? tokens : []);
      paint(it.metaEl, it.meta, visible ? tokens : []);
    }

    for (const g of groups) {
      const visibleCount = g.items.filter((it) => !it.li.hidden).length;
      g.section.hidden = visibleCount === 0;
      g.count.textContent = visibleCount;
    }

    chipRefs.all.count.textContent = found;
    for (const c of categories) {
      chipRefs[c].count.textContent = matches[c];
      chipRefs[c].chip.classList.toggle('is-empty', matches[c] === 0);
    }

    const q = state.q.trim();
    emptyBox.hidden = shown > 0;
    if (!shown) {
      if (found && state.cat !== 'all') {
        emptyText.textContent = `В${NBSP}разделе «${state.cat}» по${NBSP}запросу «${q}» пусто, в${NBSP}других нашлось: ${found}.`;
        emptyAction.textContent = 'Искать во всех разделах';
        emptyAction.onclick = () => selectCategory('all');
      } else {
        emptyText.textContent = `По${NBSP}запросу «${q}» ничего нет. Проверь написание или попробуй бренд.`;
        emptyAction.textContent = 'Сбросить поиск';
        emptyAction.onclick = clearSearch;
      }
    }

    if (!quiet) {
      announce(shown
        ? `Показано: ${shown} ${plural(shown, 'продукт', 'продукта', 'продуктов')}`
        : emptyText.textContent);
    }
  }

  function scrollToShelf() {
    const top = shelf.getBoundingClientRect().top - chipsBar.offsetHeight - 8;
    if (top < 0) {
      window.scrollTo({ top: window.scrollY + top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
  }

  function selectCategory(value) {
    const input = chipsEl.querySelector(`input[value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
    state.cat = value;
    applyFilter();
    scrollToShelf();
  }

  function clearSearch() {
    search.value = '';
    state.q = '';
    searchClear.hidden = true;
    applyFilter();
    search.focus();
  }

  chipsEl.addEventListener('change', (e) => {
    if (e.target.name !== 'cat') return;
    state.cat = e.target.value;
    applyFilter();
    e.target.closest('.chip').scrollIntoView({ block: 'nearest', inline: 'nearest' });
    scrollToShelf();
  });

  search.addEventListener('input', () => {
    state.q = search.value;
    searchClear.hidden = !search.value;
    applyFilter();
  });

  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && search.value) {
      e.preventDefault();
      clearSearch();
    } else if (e.key === 'Enter') {
      search.blur(); // спрятать клавиатуру на телефоне
    }
  });

  searchClear.addEventListener('click', clearSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || receipt.open) return;
    if (e.target.closest('input[type="search"], input[type="text"], textarea, [contenteditable]')) return;
    e.preventDefault();
    search.focus();
    search.select();
  });

  new IntersectionObserver(([entry]) => {
    chipsBar.classList.toggle('is-stuck', !entry.isIntersecting);
  }).observe($('.controls'));

  // ---------- Отметки «куплено» и сумма ----------

  let shownCents = 0;
  let tween = 0;
  let tweenTimer = 0;

  const totalText = (cents) => (cents ? '≈' + NBSP : '') + money(cents);

  function showTotal(cents, animate) {
    cancelAnimationFrame(tween);
    clearTimeout(tweenTimer);
    const finish = () => {
      cancelAnimationFrame(tween);
      shownCents = cents;
      barTotal.textContent = totalText(cents);
    };
    if (!animate || reduceMotion.matches || document.hidden) {
      finish();
      return;
    }
    // requestAnimationFrame засыпает в фоновой вкладке — итог всё равно дописываем
    tweenTimer = setTimeout(finish, 450);
    const from = shownCents;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 380);
      shownCents = Math.round(from + (cents - from) * (1 - (1 - k) ** 3));
      barTotal.textContent = totalText(shownCents);
      if (k < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
    barTotal.classList.remove('is-bumped');
    void barTotal.offsetWidth; // перезапуск анимации
    barTotal.classList.add('is-bumped');
  }

  function updateTotals(animate) {
    const got = items.filter((it) => checked.has(it.key));
    const cents = got.reduce((sum, it) => sum + it.cents, 0);

    barFill.style.setProperty('--progress', (got.length / items.length).toFixed(4));
    barLabel.textContent = got.length ? `${got.length} из${NBSP}${items.length}` : 'Чек пуст';
    barHint.textContent = got.length ? 'Открыть чек' : 'Отмечай, что взял';
    barButton.setAttribute('aria-label', got.length
      ? `Открыть чек: ${got.length} из ${items.length}, примерно ${money(cents)}`
      : 'Открыть чек: пока пусто');
    showTotal(cents, animate);
    resetButton.disabled = got.length === 0;
    if (receipt.open) renderReceipt();
  }

  function setGot(item, on) {
    if (on) checked.add(item.key);
    else checked.delete(item.key);
    item.input.checked = on;
    item.card.classList.toggle('is-got', on);
    store.save(checked);
    updateTotals(true);
  }

  shelf.addEventListener('change', (e) => {
    const input = e.target.closest('.got input');
    if (!input) return;
    const item = byId[input.closest('.card').dataset.id];
    setGot(item, input.checked);
    if (input.checked && !reduceMotion.matches) {
      item.got.classList.remove('is-popping');
      void item.got.offsetWidth;
      item.got.classList.add('is-popping');
    }
  });

  shelf.addEventListener('animationend', (e) => {
    const got = e.target.closest('.got');
    if (got) got.classList.remove('is-popping');
  });

  // Тап по любому месту карточки тоже ставит отметку — удобно одной рукой у полки.
  shelf.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || e.target.closest('a, label, input, button')) return;
    if (String(window.getSelection()).length) return; // выделяли текст, а не тапали
    const item = byId[card.dataset.id];
    item.input.checked = !item.input.checked;
    item.input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // ---------- Чек ----------

  function renderReceipt() {
    const got = items.filter((it) => checked.has(it.key));
    const cents = got.reduce((sum, it) => sum + it.cents, 0);

    receiptLines.textContent = '';
    got.forEach((it, i) => {
      const line = el('li', 'paper-line');
      line.style.setProperty('--i', i);
      line.append(el('span', 'paper-name', it.title), decorative(el('span', 'paper-dots')),
        el('span', 'paper-price', money2(it.cents)));
      receiptLines.append(line);
    });
    receiptLines.hidden = got.length === 0;
    receiptEmpty.hidden = got.length > 0;
    receiptTotal.textContent = (cents ? '≈' + NBSP : '') + money2(cents) + NBSP + '₽';
    receiptCount.textContent = got.length
      ? `${got.length} ${plural(got.length, 'позиция', 'позиции', 'позиций')} из${NBSP}${items.length}`
      : '';
    receiptDate.textContent = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  }

  let armTimer = 0;
  function disarmReset() {
    clearTimeout(armTimer);
    resetButton.classList.remove('is-armed');
    resetButton.textContent = 'Снять отметки';
  }

  resetButton.addEventListener('click', () => {
    if (!checked.size) return;
    if (!resetButton.classList.contains('is-armed')) {
      resetButton.classList.add('is-armed');
      resetButton.textContent = 'Точно снять?';
      armTimer = setTimeout(disarmReset, 4000);
      return;
    }
    disarmReset();
    checked.clear();
    store.save(checked);
    for (const it of items) {
      it.input.checked = false;
      it.card.classList.remove('is-got');
    }
    updateTotals(true);
  });

  function openReceipt() {
    renderReceipt();
    disarmReset();
    receipt.showModal();
    closeButton.focus();
  }

  function closeReceipt() {
    if (!receipt.open || receipt.classList.contains('is-closing')) return;
    const done = () => {
      if (!receipt.classList.contains('is-closing')) return;
      receipt.classList.remove('is-closing');
      receipt.close();
    };
    if (reduceMotion.matches) {
      receipt.close();
      return;
    }
    receipt.classList.add('is-closing');
    receiptSheet.addEventListener('animationend', done, { once: true });
    setTimeout(done, 400); // если анимация не случилась
  }

  barButton.addEventListener('click', openReceipt);
  closeButton.addEventListener('click', closeReceipt);
  receipt.addEventListener('cancel', (e) => { // Esc
    e.preventDefault();
    closeReceipt();
  });
  receipt.addEventListener('click', (e) => { // клик по затемнению
    if (e.target === receipt) closeReceipt();
  });
  receipt.addEventListener('close', disarmReset);

  // ---------- Старт ----------

  applyFilter({ quiet: true });
  updateTotals(false);
})();
