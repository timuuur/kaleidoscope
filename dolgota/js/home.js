// Главная «Долготы»: часы → палитра и карта, карточки сборов, три долготы, набор, заваривание.
(function () {
  const { clock, data, shop, atlas, tin, russia } = window.Dolgota;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const herbById = (id) => data.herbs.find((h) => h.id === id);
  const regionOf = (blend) => data.regions[blend.region];

  // Карточки сборов.
  $('[data-blends]').innerHTML = data.blends.map((blend) => {
    const region = regionOf(blend);
    const herbs = blend.herbs.map((id) => herbById(id).name.toLowerCase()).join(', ');
    return `<article class="blend card" data-blend="${blend.id}">
      <span class="badge" data-now-badge hidden>сейчас его время</span>
      <div class="blend__tin">${tin.tinSvg({ name: blend.name, lon: blend.lon, regionName: region.name, tin: blend.tin }, 170)}</div>
      <h3 class="blend__title">${blend.name} · ${region.name}</h3>
      <p class="blend__promise muted">${blend.promise}: ${herbs}</p>
      <p class="blend__price"><span>${shop.formatRub(data.prices.tin)} · ${data.prices.weight}</span><span class="mono muted">${shop.formatRub(shop.subscriptionPrice(data.prices.tin))} по подписке</span></p>
      <button class="btn btn--ink" type="button" data-add="${blend.id}">В корзину</button>
    </article>`;
  }).join('');

  // Три долготы: фрагмент атласа вокруг каждого региона.
  $('[data-longitudes]').innerHTML = data.blends.map((blend) => {
    const region = regionOf(blend);
    return `<article class="longitude">
      <span class="longitude__deg">${region.lon}°</span>
      <span class="cap muted">${region.name} · в.&nbsp;д. · сбор ${region.months}</span>
      <div class="longitude__map"><svg class="atlas" data-fragment="${region.id}" role="img" aria-label="Фрагмент карты: ${region.name}, ${region.lon}° восточной долготы"></svg></div>
      <p>${region.story}</p>
    </article>`;
  }).join('');
  $$('[data-fragment]').forEach((svg) => {
    const region = data.regions[svg.dataset.fragment];
    atlas.createAtlas(svg, { mode: 'fragment', width: 430, height: 260, pad: 0, rings: russia, regions: Object.values(data.regions), box: region.box, meridian: region.lon, clock });
  });

  // Превью гербария.
  $('[data-herb-preview]').innerHTML = ['badan', 'chabrec', 'veresk', 'zveroboy'].map((id) => {
    const herb = herbById(id);
    return `<figure><div class="mat"><img src="${herb.image}" alt="Гравюра: ${herb.name.toLowerCase()}" width="400" height="500" loading="lazy"></div>
      <figcaption><span class="name">${herb.name}</span><br><span class="lat">${herb.latin}</span></figcaption></figure>`;
  }).join('');

  // Набор «Весь день».
  const sizes = [170, 200, 170];
  $('[data-bundle-tins]').innerHTML = data.blends.map((blend, i) => tin.tinSvg({ name: blend.name, lon: blend.lon, regionName: regionOf(blend).name, tin: blend.tin }, sizes[i])).join('');
  function setPlan(plan) {
    $$('[data-plan]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.plan === plan)));
    const sub = plan === 'sub';
    $('[data-bundle-price]').textContent = shop.formatRub(sub ? shop.subscriptionPrice(data.prices.bundle) : data.prices.bundle);
    $('[data-bundle-old]').textContent = sub ? shop.formatRub(data.prices.bundle) : '';
    $('[data-bundle-note]').textContent = sub ? 'раз в месяц · пропустить или отменить можно в любой момент' : 'одна посылка, без подписки';
  }
  $$('[data-plan]').forEach((b) => b.addEventListener('click', () => setPlan(b.dataset.plan)));
  setPlan('sub');

  // Как заваривать.
  $('[data-brew]').innerHTML = data.blends.map(({ name, brew }) => `<article>
      <h3>${name}</h3><span class="temp">${brew.temp}&nbsp;°C · ${brew.minutes}&nbsp;мин</span>
      <span class="dose">${brew.dose}</span><p>${brew.note}</p></article>`).join('');

  // Карта первого экрана и часы.
  const small = window.matchMedia('(max-width: 640px)');
  let heroAtlas = null;
  function buildHero() {
    const size = small.matches ? { width: 366, height: 250, pad: 12 } : { width: 1392, height: 620, pad: 34 };
    heroAtlas = atlas.createAtlas($('[data-hero-atlas]'), {
      mode: 'hero', ...size, rings: russia, regions: Object.values(data.regions), clock, blendNames: data.blendNames,
      onDrag: (min) => clock.setOverride(min),
    });
  }

  function onTick(min, overridden) {
    const blend = clock.blendAt(min);
    const region = data.regions[data.blends.find((b) => b.id === blend).region];
    const sun = clock.sunAt(min);
    $('[data-now-time]').textContent = sun.visible
      ? `${clock.formatTime(min)} · время сбора „${data.blendNames[blend]}“`
      : `${clock.formatTime(min)} · ночь · время сбора „${data.blendNames[blend]}“`;
    $('[data-now-place]').textContent = sun.visible ? `${region.name}, ${region.lon}° в. д.` : '';
    $('[data-reset]').hidden = !overridden;
    $$('.blend').forEach((card) => {
      const now = card.dataset.blend === blend;
      card.classList.toggle('is-now', now);
      $('[data-now-badge]', card).hidden = !now;
    });
    heroAtlas.update(min);
  }

  $('[data-reset]').addEventListener('click', () => clock.setOverride(null));
  small.addEventListener('change', () => { buildHero(); heroAtlas.update(clock.current()); });

  buildHero();
  clock.start(onTick);
})();
