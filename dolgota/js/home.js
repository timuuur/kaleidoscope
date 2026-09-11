// Главная «Долготы»: часы → палитра и карта, каталог сборов, концепция, превью гербария, набор, заваривание.
(function () {
  const { clock, data, shop, atlas, tin, russia } = window.Dolgota;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const herbById = (id) => data.herbs.find((h) => h.id === id);
  const regionOf = (blend) => data.regions[blend.region];

  // Каталог: три сбора — когда пить, какое настроение, кому подойдёт.
  $('[data-blends]').innerHTML = data.blends.map((blend) => {
    const region = regionOf(blend);
    const herbs = blend.herbs.map((id) => herbById(id).name.toLowerCase()).join(', ');
    return `<article class="blend card" id="sbor-${blend.id}" data-blend="${blend.id}">
      <div class="blend__visual">
        <div class="blend__tin">${tin.tinSvg({ name: blend.name, lon: blend.lon, regionName: region.name, tin: blend.tin }, 130)}</div>
        <figure class="blend__photo mat">
          <img src="${blend.photo.src}" alt="${blend.photo.alt}" width="640" height="640" loading="lazy">
          <span class="badge" data-now-badge hidden>сейчас его время</span>
        </figure>
      </div>
      <div class="blend__head"><h3 class="blend__title">${blend.name} · ${region.name}</h3><span class="blend__when mono">${blend.when}</span></div>
      <p class="blend__promise">${blend.promise}</p>
      <p class="blend__mood">${blend.mood}</p>
      <dl class="blend__facts"><div><dt>Кому</dt><dd>${blend.forWhom}</dd></div><div><dt>Травы</dt><dd>${herbs}</dd></div></dl>
      <p class="blend__price"><span>${shop.formatRub(data.prices.tin)} · ${data.prices.weight}</span><span class="mono muted">${shop.formatRub(shop.subscriptionPrice(data.prices.tin))} по подписке</span></p>
      <button class="btn btn--ink" type="button" data-add="${blend.id}">В корзину</button>
    </article>`;
  }).join('');

  // Концепция: три шага по долготам — коротко, почему у каждого сбора своё время.
  $('[data-steps]').innerHTML = data.blends.map((blend) => {
    const region = regionOf(blend);
    return `<article class="step">
      <span class="step__deg">${region.lon}°</span>
      <span class="cap muted">${region.name} · ${blend.name.toLowerCase()}</span>
      <p>${region.concept}</p>
    </article>`;
  }).join('');

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

  // Карта первого экрана: строится по реальной ширине колонки, чтобы подписи не мельчали.
  const small = window.matchMedia('(max-width: 640px)');
  const heroSvg = $('[data-hero-atlas]');
  let heroAtlas = null;
  let builtWidth = 0;
  function buildHero() {
    const width = Math.max(320, Math.round(heroSvg.parentElement.clientWidth || 800));
    builtWidth = width;
    heroAtlas = atlas.createAtlas(heroSvg, {
      mode: 'hero', width, height: Math.round(width * (small.matches ? 0.68 : 0.58)), pad: Math.round(width * 0.03),
      rings: russia, regions: Object.values(data.regions), clock, blendNames: data.blendNames,
      onDrag: (min) => clock.setOverride(min),
    });
  }

  function onTick(min, overridden) {
    const blend = clock.blendAt(min);
    const region = data.regions[data.blends.find((b) => b.id === blend).region];
    const sun = clock.sunAt(min);
    const link = $('[data-now-time]');
    link.textContent = sun.visible
      ? `${clock.formatTime(min)} · время сбора „${data.blendNames[blend]}“ →`
      : `${clock.formatTime(min)} · ночь · время сбора „${data.blendNames[blend]}“ →`;
    link.href = `#sbor-${blend}`;
    $('[data-now-place]').textContent = sun.visible ? `${region.name}, ${region.lon}° в. д.` : '';
    $('[data-reset]').hidden = !overridden;
    $('[data-hint]').hidden = overridden;
    $$('.blend').forEach((card) => {
      const now = card.dataset.blend === blend;
      card.classList.toggle('is-now', now);
      $('[data-now-badge]', card).hidden = !now;
    });
    heroAtlas.update(min);
  }

  $('[data-reset]').addEventListener('click', () => clock.setOverride(null));
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const width = Math.round(heroSvg.parentElement.clientWidth);
      if (width && Math.abs(width - builtWidth) > 40) {
        buildHero();
        heroAtlas.update(clock.current());
      }
    }, 200);
  });

  buildHero();
  clock.start(onTick);
})();
