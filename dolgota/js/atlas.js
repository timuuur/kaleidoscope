// Карта-атлас «Долготы»: коническая проекция, геометрия и SVG-отрисовка.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).atlas = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const RAD = Math.PI / 180;
  const CONE = 0.62;
  const CENTER = 100;

  function project([lon, lat]) {
    const theta = CONE * (lon - CENTER) * RAD;
    const r = 90 - lat;
    return [r * Math.sin(theta), r * Math.cos(theta)];
  }

  function projector(width, height, pad, fitPoints) {
    let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity;
    for (const point of fitPoints) {
      const [x, y] = project(point);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    const scale = Math.min((width - 2 * pad) / (x1 - x0), (height - 2 * pad) / (y1 - y0));
    const ox = (width - (x1 - x0) * scale) / 2 - x0 * scale;
    const oy = (height - (y1 - y0) * scale) / 2 - y0 * scale;
    return (point) => {
      const [x, y] = project(point);
      return [ox + x * scale, oy + y * scale];
    };
  }

  function insideRing([x, y], ring) {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  function inside(point, rings) {
    return rings.some((ring) => insideRing(point, ring));
  }

  const xy = (toXY, point) => toXY(point).map((v) => v.toFixed(1)).join(',');

  function lineD(points, toXY) {
    return 'M' + points.map((p) => xy(toXY, p)).join('L');
  }

  function pathD(rings, toXY) {
    return rings.map((ring) => lineD(ring, toXY) + 'Z').join('');
  }

  function nearestMinute(samples, x, y) {
    let best = samples[0];
    let bestDistance = Infinity;
    for (const sample of samples) {
      const d = (sample.x - x) ** 2 + (sample.y - y) ** 2;
      if (d < bestDistance) { bestDistance = d; best = sample; }
    }
    return best.min;
  }

  function meridianPoints(lon) {
    const points = [];
    for (let lat = 38; lat <= 82; lat += 2) points.push([lon, lat]);
    return points;
  }

  function graticule(toXY) {
    let out = '';
    for (let lon = 30; lon <= 180; lon += 15) out += `<path class="atlas-grid" d="${lineD(meridianPoints(lon), toXY)}"/>`;
    for (const lat of [50, 60, 70, 80]) {
      const points = [];
      for (let lon = 15; lon <= 195; lon += 3) points.push([lon, lat]);
      out += `<path class="atlas-grid" d="${lineD(points, toXY)}"/>`;
    }
    return out;
  }

  function createAtlas(svg, options) {
    const { mode = 'hero', width, height, pad = 24, rings, regions = [], herbs = [], box, meridian, clock, blendNames = {}, onDrag, onPick } = options;
    const fitPoints = box
      ? [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]], [(box[0] + box[2]) / 2, box[1]]]
      : rings.flat();
    const toXY = projector(width, height, pad, fitPoints);
    const at = (point) => toXY(point).map((v) => v.toFixed(1));
    const labelLat = box ? box[1] + 0.6 : 36.6;
    const visibleRegions = box
      ? regions.filter(({ center: [lon, lat] }) => lon >= box[0] && lon <= box[2] && lat >= box[1] && lat <= box[3])
      : regions;

    let html = `<rect class="atlas-sea" width="${width}" height="${height}"/>`;
    html += `<path class="atlas-land" d="${pathD(rings, toXY)}"/>` + graticule(toXY);
    if (mode !== 'mini') html += '<path class="atlas-meridian" d=""/><text class="atlas-meridian-label" text-anchor="middle"></text>';

    const samples = [];
    if (mode === 'hero') {
      for (let min = 300; min <= 1380; min += 5) {
        const sun = clock.sunAt(min);
        const [x, y] = toXY([sun.lon, sun.lat]);
        samples.push({ min, x, y });
      }
      html += `<path class="atlas-sun-path" d="M${samples.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`).join('L')}"/>`;
    }
    for (const herb of herbs) {
      const [x, y] = at(herb.coords);
      html += `<circle class="atlas-herb" data-herb="${herb.id}" cx="${x}" cy="${y}" r="5"><title>${herb.name}</title></circle>`;
    }
    for (const region of visibleRegions) {
      const [x, y] = toXY(region.center);
      if (!herbs.length) html += `<circle class="atlas-region" data-blend="${region.blend}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/>`;
      const below = region.label === 'below';
      html += `<text class="atlas-region-label" x="${(x + (below ? 0 : 12)).toFixed(1)}" y="${(y + (below ? 26 : 5)).toFixed(1)}" text-anchor="${below ? 'middle' : 'start'}">${region.name}</text>`;
    }
    if (mode === 'hero') {
      html += '<g class="atlas-sun" tabindex="0" role="slider" aria-label="Солнце: время суток" aria-valuemin="300" aria-valuemax="1380">'
        + '<circle class="atlas-sun-halo" r="26"/><circle class="atlas-sun-disc" r="16"/></g>';
    }
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = html;

    const meridianEl = svg.querySelector('.atlas-meridian');
    const meridianLabel = svg.querySelector('.atlas-meridian-label');
    const regionEls = [...svg.querySelectorAll('.atlas-region')];
    const regionLabelEls = [...svg.querySelectorAll('.atlas-region-label')];
    const herbEls = [...svg.querySelectorAll('.atlas-herb')];
    const sunEl = svg.querySelector('.atlas-sun');

    // Задевает ли подпись меридиана название региона (getBBox есть только у отрисованной карты).
    function overlapsRegionLabel() {
      try {
        const a = meridianLabel.getBBox();
        return regionLabelEls.some((el) => {
          const b = el.getBBox();
          return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        });
      } catch (e) {
        return false;
      }
    }

    function setMeridian(lon) {
      if (!meridianEl) return;
      if (lon === null) {
        meridianEl.setAttribute('d', '');
        meridianLabel.textContent = '';
        return;
      }
      meridianEl.setAttribute('d', lineD(meridianPoints(lon), toXY));
      meridianLabel.textContent = `${lon}° в. д.`;
      // Подпись ставим у нижнего конца меридиана и прижимаем внутрь рамки (13px моноширинный ≈ 7,8px на знак).
      // Если на маленькой карте она задевает название региона, переносим её к верхнему концу.
      const half = meridianLabel.textContent.length * 3.9 + 8;
      const placeLabel = (lat) => {
        const [x, y] = toXY([lon, lat]);
        meridianLabel.setAttribute('x', Math.min(Math.max(x, half), width - half).toFixed(1));
        meridianLabel.setAttribute('y', Math.min(Math.max(y, 22), height - 10).toFixed(1));
      };
      placeLabel(labelLat);
      if (overlapsRegionLabel()) placeLabel(83);
      meridianLabel.style.visibility = overlapsRegionLabel() ? 'hidden' : '';
    }

    if (mode === 'fragment') setMeridian(meridian);

    if (herbEls.length && onPick) {
      herbEls.forEach((el) => el.addEventListener('click', () => onPick(el.dataset.herb)));
    }

    if (sunEl && onDrag) {
      const toSvgPoint = (event) => {
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
      };
      let dragging = false;
      sunEl.addEventListener('pointerdown', (event) => {
        dragging = true;
        sunEl.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      // На телефоне страница не должна прокручиваться, пока палец тянет солнце.
      sunEl.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
      sunEl.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        const p = toSvgPoint(event);
        onDrag(nearestMinute(samples, p.x, p.y));
      });
      const stop = () => { dragging = false; };
      sunEl.addEventListener('pointerup', stop);
      sunEl.addEventListener('pointercancel', stop);
      sunEl.addEventListener('keydown', (event) => {
        const now = Number(sunEl.getAttribute('aria-valuenow'));
        const steps = { ArrowRight: 15, ArrowUp: 15, ArrowLeft: -15, ArrowDown: -15 };
        let next = null;
        if (event.key in steps) next = now + steps[event.key];
        if (event.key === 'Home') next = 300;
        if (event.key === 'End') next = 1380;
        if (next === null) return;
        event.preventDefault();
        onDrag(Math.max(300, Math.min(1380, next)));
      });
    }

    function update(min) {
      if (mode !== 'hero') return;
      const sun = clock.sunAt(min);
      const blend = clock.blendAt(min);
      regionEls.forEach((el) => el.classList.toggle('is-active', el.dataset.blend === blend));
      // Ночью солнце не прячем: оно ждёт бледным у конца пути, чтобы его всегда можно было потянуть.
      const shown = sun.visible ? sun : clock.sunAt(min < 300 ? 300 : 1380);
      const [x, y] = at([shown.lon, shown.lat]);
      sunEl.setAttribute('transform', `translate(${x} ${y})`);
      sunEl.classList.toggle('is-night', !sun.visible);
      setMeridian(sun.visible ? Math.round(sun.lon / 15) * 15 : null);
      sunEl.setAttribute('aria-valuenow', String(Math.max(300, Math.min(1380, min))));
      sunEl.setAttribute('aria-valuetext', `${clock.formatTime(min)}, время сбора «${blendNames[blend] || blend}»`);
    }

    function highlight(herbId) {
      herbEls.forEach((el) => el.classList.toggle('is-active', el.dataset.herb === herbId));
    }

    return { update, highlight };
  }

  return { project, projector, inside, pathD, lineD, nearestMinute, createAtlas };
});
