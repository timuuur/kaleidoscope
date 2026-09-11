// SVG-банка сбора «Долготы». Надписи с data-max подгоняет fit.js, если шрифт окажется шире.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).tin = api;
})(typeof self !== 'undefined' ? self : this, function () {
  function tinSvg({ name, lon, regionName, tin }, width = 150) {
    const sans = 'font-family: var(--font-sans); font-weight: 700';
    const mono = 'font-family: var(--font-mono)';
    return `<svg class="tin" viewBox="0 0 130 170" width="${width}" role="img" aria-label="Банка сбора «${name}»">`
      + `<rect x="15" y="30" width="100" height="132" rx="8" fill="${tin.body}"/>`
      + `<rect x="11" y="16" width="108" height="26" rx="6" fill="${tin.lid}"/>`
      + `<line x1="15" y1="62" x2="115" y2="62" stroke="${tin.text}" stroke-opacity="0.45"/>`
      + `<line x1="15" y1="140" x2="115" y2="140" stroke="${tin.text}" stroke-opacity="0.45"/>`
      + `<line x1="100" y1="62" x2="100" y2="140" stroke="${tin.line}" stroke-width="1.2"/>`
      + `<circle cx="100" cy="100" r="3.5" fill="${tin.line}"/>`
      + `<text x="22" y="81" font-size="14" fill="${tin.text}" style="${sans}" data-max="93">${name}</text>`
      + `<text x="19" y="118" font-size="36" fill="${tin.text}" style="${sans}; letter-spacing: -0.04em" data-max="93">${lon}°</text>`
      + `<text x="22" y="134" font-size="12.5" fill="${tin.text}" style="${mono}" data-max="93">${regionName}</text>`
      + `<text x="65" y="155" font-size="12.5" text-anchor="middle" fill="${tin.text}" style="${mono}" data-max="110">долгота</text>`
      + '</svg>';
  }
  return { tinSvg };
});
