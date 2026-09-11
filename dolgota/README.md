# Долгота

Учебный сайт в стиле noon.world: три сбора травяного чая, по одному на каждое время суток. Солнце на карте-атласе идёт по местному времени посетителя, вместе с ним меняется палитра всего сайта. Магазин вымышленный, заказы не принимаются.

## Запуск

Открой `index.html` в браузере — сборка не нужна. Для проверки с сервером: `node dolgota/tools/serve.js` и http://localhost:8732.

Полезные параметры адреса:

| Параметр | Что делает |
| --- | --- |
| `?time=19:30` | показать сайт в заданное время |
| `?debug=overflow` | обвести красным всё, что вылезает за рамки |

## Устройство

| Файл | Что внутри |
| --- | --- |
| `js/clock.js` | часы сайта: фаза сбора, палитра «Небо», положение солнца |
| `js/atlas.js` | коническая проекция и SVG-карта, перетаскивание солнца |
| `js/data.js` | сборы, регионы, 12 трав, цены |
| `js/shop.js` | цены по подписке и игрушечная корзина |
| `js/tin.js`, `js/fit.js` | банка сбора и подгонка надписей |
| `js/site.js` | общее для страниц: корзина, меню, рассылка |
| `js/home.js`, `js/herbarium.js` | логика страниц |
| `data/russia.js` | контур России из Natural Earth, собирается `tools/make-russia.js` |

## Тесты

`node --test dolgota/tests/*.test.js` — встроенный раннер Node, без зависимостей.

## Источники

Гравюры — общественное достояние (Викисклад): C. A. M. Lindman «Bilder ur Nordens Flora», F. E. Köhler «Köhler’s Medizinal-Pflanzen», O. W. Thomé «Flora von Deutschland», «The Botanical Magazine», «Atlas der Alpenflora». Карта — Natural Earth. Шрифты — Manrope, JetBrains Mono, Cormorant Garamond (Google Fonts).
