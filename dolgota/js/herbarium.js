// Гербарий «Долготы»: сетка листов, фильтры, мини-карта, окно травы с адресом #id, источники.
(function () {
  const { clock, data, atlas, russia } = window.Dolgota;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const regionOf = (herb) => data.regions[data.blends.find((b) => b.id === herb.blend).region];
  const decimal = (n) => n.toFixed(1).replace('.', ',');
  const coordsText = ([lon, lat]) => `${decimal(lat)}° с. ш. ${decimal(lon)}° в. д.`;
  const monthsText = (months) => {
    const names = months.map((m) => data.monthNames[m - 1]);
    return names.length > 1 ? `${names[0]}–${names[names.length - 1]}` : names[0];
  };

  const grid = $('[data-herb-grid]');
  grid.innerHTML = data.herbs.map((herb) => `<button class="sheet" type="button" data-herb="${herb.id}" data-blend="${herb.blend}">
      <img src="${herb.image}" alt="" width="400" height="500" loading="lazy">
      <span class="sheet__name">${herb.name}</span>
      <span class="lat sheet__lat">${herb.latin}</span>
      <span class="mono sheet__meta">${regionOf(herb).name} · ${coordsText(herb.coords)}<br>${monthsText(herb.months)}</span>
      <span class="tag tag--${herb.blend}">${data.blendNames[herb.blend]}</span>
    </button>`).join('');

  const small = window.matchMedia('(max-width: 640px)');
  const mini = atlas.createAtlas($('[data-mini-atlas]'), {
    mode: 'mini', ...(small.matches ? { width: 366, height: 300, pad: 12 } : { width: 1392, height: 440, pad: 26 }),
    rings: russia, regions: Object.values(data.regions), herbs: data.herbs, clock, onPick: (id) => open(id),
  });

  $$('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    $$('.sheet').forEach((sheet) => { sheet.hidden = filter !== 'all' && sheet.dataset.blend !== filter; });
  }));

  grid.addEventListener('pointerover', (event) => {
    const sheet = event.target.closest('.sheet');
    mini.highlight(sheet ? sheet.dataset.herb : null);
  });
  grid.addEventListener('pointerleave', () => mini.highlight(null));
  grid.addEventListener('focusin', (event) => {
    const sheet = event.target.closest('.sheet');
    if (sheet) mini.highlight(sheet.dataset.herb);
  });
  grid.addEventListener('click', (event) => {
    const sheet = event.target.closest('.sheet');
    if (sheet) open(sheet.dataset.herb);
  });

  const dialog = $('[data-herb-dialog]');
  const body = $('[data-herb-body]');
  let opener = null;

  function render(herb) {
    const blend = data.blends.find((b) => b.id === herb.blend);
    const months = data.monthNames.map((name, i) => `<span class="month${herb.months.includes(i + 1) ? ' is-on' : ''}" title="${name}">${name[0]}</span>`).join('');
    return `<div class="herb-dialog__grid">
      <img src="${herb.image}" alt="Гравюра: ${herb.name.toLowerCase()}" width="400" height="500">
      <div class="herb-dialog__body">
        <div><h2 id="herb-title">${herb.name}</h2><span class="lat">${herb.latin}</span></div>
        <span class="mono">${regionOf(herb).name} · ${coordsText(herb.coords)}</span>
        <p>${herb.about} Вкус — ${herb.taste}.</p>
        <div><span class="cap">месяцы сбора</span><div class="months">${months}</div></div>
        <div class="herb-dialog__map"><svg class="atlas" data-dialog-atlas role="img" aria-label="Место сбора: ${regionOf(herb).name}"></svg></div>
        <a class="herb-dialog__link" href="index.html#sbory">Входит в сбор „${blend.name}“ →</a>
        <span class="herb-dialog__source">Гравюра: <a href="${herb.source.url}">${herb.source.title}</a> · ${herb.source.license}</span>
      </div>
    </div>`;
  }

  function open(id) {
    const herb = data.herbs.find((h) => h.id === id);
    if (!herb) return;
    opener = document.activeElement;
    body.innerHTML = render(herb);
    atlas.createAtlas($('[data-dialog-atlas]', body), {
      mode: 'mini', width: 556, height: 170, pad: 0, rings: russia, regions: Object.values(data.regions),
      herbs: data.herbs.filter((h) => h.blend === herb.blend), box: regionOf(herb).box, clock,
    }).highlight(herb.id);
    if (!dialog.open) dialog.showModal();
    history.replaceState(null, '', `#${herb.id}`);
  }

  // Событие close приходит асинхронно (и не во всех условиях), поэтому свои способы закрытия
  // убирают #id и возвращают фокус сразу; close остаётся для Esc.
  function afterClose() {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    if (opener && document.contains(opener)) opener.focus();
  }
  function closeDialog() {
    if (dialog.open) dialog.close();
    afterClose();
  }
  dialog.addEventListener('close', afterClose);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
  $('[data-herb-close]').addEventListener('click', closeDialog);

  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (data.herbs.some((h) => h.id === id)) open(id);
  };
  window.addEventListener('hashchange', fromHash);

  const sources = new Map(data.herbs.map((h) => [h.source.title, h.source]));
  $('[data-sources]').innerHTML = [...sources.values()].map((s) => `<li><a href="${s.url}">${s.title}</a> — ${s.license}</li>`).join('');

  clock.start(() => {});
  fromHash();
})();
