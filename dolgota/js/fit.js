// Подгонка надписей в SVG и проверка переполнения: ?debug=overflow обводит нарушителей красным.
(function (root) {
  function fitSvgText(scope = document) {
    scope.querySelectorAll('svg text[data-max]').forEach((text) => {
      if (!text.dataset.fs0) text.dataset.fs0 = text.getAttribute('font-size');
      let size = Number(text.dataset.fs0);
      text.setAttribute('font-size', size);
      let box = text.getBBox();
      for (let i = 0; i < 30 && box.x + box.width > Number(text.dataset.max); i++) {
        size -= 0.5;
        text.setAttribute('font-size', size);
        box = text.getBBox();
      }
    });
  }

  function findOverflow() {
    const problems = [];
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1) problems.push({ el: doc, reason: `страница шире окна: ${doc.scrollWidth} > ${doc.clientWidth}` });
    for (const el of document.body.querySelectorAll('*')) {
      if (el instanceof SVGElement || el.clientWidth === 0) continue;
      const { overflowX } = getComputedStyle(el);
      if (overflowX === 'hidden' || overflowX === 'clip') continue;
      if (el.scrollWidth > el.clientWidth + 1) problems.push({ el, reason: `содержимое ${el.scrollWidth} > ${el.clientWidth}` });
    }
    return problems;
  }

  function debugOverflow() {
    if (new URLSearchParams(location.search).get('debug') !== 'overflow') return;
    const run = () => {
      const problems = findOverflow();
      problems.forEach(({ el }) => { if (el !== document.documentElement) el.style.outline = '2px solid red'; });
      root.__overflow = problems.map(({ el, reason }) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}: ${reason}`);
      console.info('[overflow]', root.__overflow.length ? root.__overflow : 'переполнений нет');
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(run, 300));
  }

  (root.Dolgota = root.Dolgota || {}).fit = { fitSvgText, findOverflow, debugOverflow };
})(typeof self !== 'undefined' ? self : this);
