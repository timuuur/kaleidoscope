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

  return { project, projector, inside, pathD, lineD };
});
