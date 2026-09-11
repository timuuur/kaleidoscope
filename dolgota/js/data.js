// Данные «Долготы»: сборы, регионы, травы, цены. Отсюда строятся главная и гербарий.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.Dolgota = root.Dolgota || {}).data = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const PD = 'общественное достояние';
  const lindman = (n, file) => ({
    title: `C. A. M. Lindman, «Bilder ur Nordens Flora», 1901–1905, № ${n}`,
    url: `https://commons.wikimedia.org/wiki/File:${file}`,
    license: PD,
  });

  const blends = [
    {
      id: 'morning', name: 'Утро', region: 'altai', lon: 86, promise: 'Бодрость без кофеина',
      herbs: ['badan', 'rodiola', 'zveroboy', 'myata'],
      brew: { temp: 95, minutes: 7, dose: '1 ч. л. на 250 мл', note: 'Бадану нужна горячая вода и время, чтобы раскрыться.' },
      tin: { body: '#F4C4A1', lid: '#D9704A', text: '#3A2420', line: '#B4502A' },
    },
    {
      id: 'day', name: 'День', region: 'caucasus', lon: 43, promise: 'Ясность и тонус',
      herbs: ['chabrec', 'dushica', 'shipovnik', 'melissa'],
      brew: { temp: 90, minutes: 5, dose: '1 ч. л. на 200 мл', note: 'Чабрец и душица горчат, если передержать.' },
      tin: { body: '#F3D27A', lid: '#C99A12', text: '#2A1F00', line: '#8A6A00' },
    },
    {
      id: 'evening', name: 'Вечер', region: 'karelia', lon: 33, promise: 'Покой и сон',
      herbs: ['ivanchay', 'veresk', 'tavolga', 'brusnika'],
      brew: { temp: 85, minutes: 6, dose: '2 ч. л. на 300 мл', note: 'Иван-чай можно заварить второй раз.' },
      tin: { body: '#3B3F6B', lid: '#232644', text: '#F1E9DC', line: '#F09A4E' },
    },
  ];

  const regions = {
    altai: {
      id: 'altai', name: 'Алтай', blend: 'morning', lon: 86, center: [86.5, 50.5], box: [76, 45, 98, 57], months: 'июнь–август', label: 'right',
      story: 'Бадан берут перезимовавшим: тёмный лист и есть старинный «чигирский чай». Родиолу копают высоко в горах.',
    },
    caucasus: {
      id: 'caucasus', name: 'Кавказ', blend: 'day', lon: 43, center: [43.5, 43.3], box: [36, 40, 50, 48], months: 'июнь–июль', label: 'below',
      story: 'Чабрец и душицу срезают в пору цветения на южных склонах Приэльбрусья, пока солнце стоит высоко.',
    },
    karelia: {
      id: 'karelia', name: 'Карелия', blend: 'evening', lon: 33, center: [33, 63], box: [26, 59, 41, 67], months: 'июль–сентябрь', label: 'right',
      story: 'Иван-чай ферментируют по старому копорскому способу. Вереск собирают в конце лета, когда сопки становятся лиловыми.',
    },
  };

  const herbs = [
    {
      id: 'badan', name: 'Бадан', latin: 'Bergenia crassifolia', blend: 'morning', coords: [87.7, 51.6], months: [4, 5],
      taste: 'терпкий, с древесной ноткой',
      about: 'Крупные кожистые листья зимуют под снегом и темнеют — такой лист и называют «чигирским чаем». Собирают его весной, как только сойдёт снег.',
      image: 'img/herbs/badan.jpg',
      source: { title: '«The Botanical Magazine», т. 6, табл. 196, 1793', url: 'https://commons.wikimedia.org/wiki/File:The_Botanical_magazine,_or,_Flower-garden_displayed_(Plate_196)_(8559506873).jpg', license: PD },
    },
    {
      id: 'rodiola', name: 'Родиола', latin: 'Rhodiola rosea', blend: 'morning', coords: [86.6, 49.8], months: [8],
      taste: 'с лёгким ароматом розы',
      about: 'Растёт высоко в горах, у ручьёв и на каменистых склонах. Корень на срезе пахнет розой, отсюда латинское rosea.',
      image: 'img/herbs/rodiola.jpg',
      source: { title: '«Atlas der Alpenflora», 1882', url: 'https://commons.wikimedia.org/wiki/File:Atlas_der_Alpenflora_(1882)_(20317664056).jpg', license: PD },
    },
    {
      id: 'zveroboy', name: 'Зверобой', latin: 'Hypericum perforatum', blend: 'morning', coords: [86.0, 51.4], months: [7],
      taste: 'травяной, чуть горьковатый',
      about: 'Солнечно-жёлтые цветки собирают в разгар лета. Если посмотреть лист на просвет, видны светлые точки — масляные железки.',
      image: 'img/herbs/zveroboy.jpg', source: lindman(230, '230_Hypericum_perforatum.jpg'),
    },
    {
      id: 'myata', name: 'Мята', latin: 'Mentha arvensis', blend: 'morning', coords: [85.6, 50.3], months: [7, 8],
      taste: 'свежий, мягко холодящий',
      about: 'Полевая мята мягче садовой и не забивает остальные травы. Растёт по сырым лугам и берегам рек.',
      image: 'img/herbs/myata.jpg', source: lindman(88, '88_Mentha_arvensis.jpg'),
    },
    {
      id: 'chabrec', name: 'Чабрец', latin: 'Thymus serpyllum', blend: 'day', coords: [42.5, 43.3], months: [6, 7],
      taste: 'пряный, смолистый',
      about: 'Низкий кустарничек с тёплым смолистым запахом. На южных склонах Приэльбрусья его срезают в пору цветения.',
      image: 'img/herbs/chabrec.jpg', source: lindman(90, '90_Thymus_serpyllum.jpg'),
    },
    {
      id: 'dushica', name: 'Душица', latin: 'Origanum vulgare', blend: 'day', coords: [41.3, 43.6], months: [7],
      taste: 'пряный, с горчинкой',
      about: 'Родственница средиземноморского орегано. Лиловые соцветия собирают в июле, когда запах самый сильный.',
      image: 'img/herbs/dushica.jpg', source: lindman(91, '91_Origanum_vulgare.jpg'),
    },
    {
      id: 'shipovnik', name: 'Шиповник', latin: 'Rosa cinnamomea', blend: 'day', coords: [42.7, 43.9], months: [9],
      taste: 'кисловатый, фруктовый',
      about: 'Плоды собирают в сентябре, когда они становятся тёмно-красными. Они дают сбору кислинку и цвет.',
      image: 'img/herbs/shipovnik.jpg', source: lindman(293, '293_Rosa_cinnamomea.jpg'),
    },
    {
      id: 'melissa', name: 'Мелисса', latin: 'Melissa officinalis', blend: 'day', coords: [41.6, 43.3], months: [6, 7],
      taste: 'лимонный, мягкий',
      about: 'Листья пахнут лимоном, особенно если растереть их в пальцах. Собирают до цветения, пока аромат не ушёл.',
      image: 'img/herbs/melissa.jpg',
      source: { title: 'F. E. Köhler, «Köhler’s Medizinal-Pflanzen», 1887', url: 'https://commons.wikimedia.org/wiki/File:Melissa_officinalis_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-094.jpg', license: PD },
    },
    {
      id: 'ivanchay', name: 'Иван-чай', latin: 'Chamaenerion angustifolium', blend: 'evening', coords: [34.3, 62.2], months: [7],
      taste: 'мягкий, с медовой ноткой',
      about: 'Лист ферментируют по старому копорскому способу: скручивают, выдерживают и сушат. Так он становится тёмным и ароматным.',
      image: 'img/herbs/ivanchay.jpg',
      source: { title: 'O. W. Thomé, «Flora von Deutschland, Österreich und der Schweiz», 1885', url: 'https://commons.wikimedia.org/wiki/File:Illustration_Epilobium_angustifolium0.jpg', license: PD },
    },
    {
      id: 'veresk', name: 'Вереск', latin: 'Calluna vulgaris', blend: 'evening', coords: [34.3, 63.7], months: [8, 9],
      taste: 'медовый, чуть терпкий',
      about: 'В конце лета вереск окрашивает карельские сопки в лиловый. Собирают цветущие веточки.',
      image: 'img/herbs/veresk.jpg', source: lindman(147, '147_Calluna_vulgaris.jpg'),
    },
    {
      id: 'tavolga', name: 'Таволга', latin: 'Filipendula ulmaria', blend: 'evening', coords: [33.0, 61.0], months: [7],
      taste: 'медовый, с миндальной ноткой',
      about: 'Кремовые соцветия пахнут мёдом и миндалём. Растёт по сырым лугам и берегам озёр.',
      image: 'img/herbs/tavolga.jpg', source: lindman(288, '288_Filipendula_ulmaria.jpg'),
    },
    {
      id: 'brusnika', name: 'Брусника', latin: 'Vaccinium vitis-idaea', blend: 'evening', coords: [34.6, 64.9], months: [5],
      taste: 'терпкий, освежающий',
      about: 'Лист собирают весной, до цветения. Он кожистый и долго хранит вкус.',
      image: 'img/herbs/brusnika.jpg', source: lindman(143, '143_Vaccinium_vitis_idaea.jpg'),
    },
  ];

  const prices = { tin: 690, bundle: 1790, discount: 0.15, weight: '50 г' };
  const blendNames = { morning: 'Утро', day: 'День', evening: 'Вечер' };
  const monthNames = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

  return { blends, regions, herbs, prices, blendNames, monthNames };
});
