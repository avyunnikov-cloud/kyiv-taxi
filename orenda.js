/* ==========================================================================
   Каталог оренди авто: рендер карток із cars.json + фільтри та сортування.
   Дані всіх авто зберігаються у файлі cars.json (один блок = одне оголошення).
   ========================================================================== */
(function () {
  var listEl, countEl, allCars = [], currentSort = 'popular';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    listEl = document.getElementById('cars-list');
    countEl = document.getElementById('cars-count');
    if (!listEl) return;

    // Сортування
    document.querySelectorAll('.sort-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.sort-opt').forEach(function (o) { o.classList.remove('is-active'); });
        btn.classList.add('is-active');
        currentSort = btn.dataset.sort || 'popular';
        render();
      });
    });

    // Фільтри (будь-який чекбокс у сайдбарі)
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', render);
    });

    // Перемикання фото в картці (делегування)
    listEl.addEventListener('click', function (e) {
      var arrow = e.target.closest('.car-arrows button');
      if (arrow) cyclePhoto(arrow);
    });

    // Поп-ап «Здати авто в оренду»: закриття кліком по фону
    var rentout = document.getElementById('rentout-modal');
    if (rentout) {
      rentout.addEventListener('click', function (e) { if (e.target === rentout) closeRentOut(); });
    }

    loadCars();
  }

  // Глобальні функції для кнопки в hero (onclick)
  window.openRentOut = function () {
    var m = document.getElementById('rentout-modal');
    if (m) m.classList.add('on');
  };
  window.closeRentOut = function () {
    var m = document.getElementById('rentout-modal');
    if (m) m.classList.remove('on');
  };

  function loadCars() {
    listEl.innerHTML = '<p class="cars-msg">Завантаження авто…</p>';
    fetch('cars.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        allCars = Array.isArray(data) ? data : [];
        render();
      })
      .catch(function (err) {
        listEl.innerHTML = '<p class="cars-msg cars-msg-err">Не вдалося завантажити список авто. ' +
          'Перевірте файл <b>cars.json</b> (можливо, десь пропущено кому чи дужку).<br><small>' +
          esc(String(err.message || err)) + '</small></p>';
        if (countEl) countEl.textContent = '';
      });
  }

  /* ---- Читання активних фільтрів із DOM ---- */
  function readFilters() {
    var f = { category: new Set(), brand: new Set(), fuel: new Set(),
              gearbox: new Set(), feature: new Set(), price: [] };
    document.querySelectorAll('.filters input[type="checkbox"]:checked').forEach(function (cb) {
      var type = cb.dataset.filter;
      if (type === 'price') {
        f.price.push({ min: +cb.dataset.min || 0, max: +cb.dataset.max || Infinity });
      } else if (f[type]) {
        f[type].add(cb.dataset.value);
      }
    });
    return f;
  }

  /* ---- Чи проходить авто активні фільтри ----
     У межах групи АБО (напр. Toyota або Peugeot).
     Між групами І. «Особливості» авто мусить мати ВСІ обрані. */
  function matches(car, f) {
    if (f.category.size && !f.category.has(car.category)) return false;
    if (f.brand.size && !f.brand.has(car.brand)) return false;
    if (f.gearbox.size && !f.gearbox.has(car.gearbox)) return false;

    if (f.fuel.size) {
      var tags = car.fuelTags || [];
      var okFuel = false;
      f.fuel.forEach(function (v) { if (tags.indexOf(v) !== -1) okFuel = true; });
      if (!okFuel) return false;
    }
    if (f.feature.size) {
      var feats = car.features || [];
      var okFeat = true;
      f.feature.forEach(function (v) { if (feats.indexOf(v) === -1) okFeat = false; });
      if (!okFeat) return false;
    }
    if (f.price.length) {
      var p = car.pricePerWeek;
      var okPrice = false;
      f.price.forEach(function (r) { if (p >= r.min && p <= r.max) okPrice = true; });
      if (!okPrice) return false;
    }
    return true;
  }

  function sortCars(cars) {
    var arr = cars.slice();
    if (currentSort === 'cheap') {
      arr.sort(function (a, b) { return a.pricePerWeek - b.pricePerWeek; });
    } else if (currentSort === 'name') {
      arr.sort(function (a, b) {
        return (a.brand + ' ' + a.model).localeCompare(b.brand + ' ' + b.model, 'uk');
      });
    }
    // 'popular' залишаємо порядок із cars.json
    return arr;
  }

  function render() {
    var f = readFilters();
    var cars = sortCars(allCars.filter(function (c) { return matches(c, f); }));

    if (countEl) {
      countEl.textContent = cars.length
        ? 'Знайдено авто: ' + cars.length
        : '';
    }

    if (!cars.length) {
      listEl.innerHTML = '<p class="cars-msg">За обраними фільтрами авто не знайдено. ' +
        'Спробуйте зняти частину фільтрів.</p>';
      return;
    }
    listEl.innerHTML = cars.map(cardHtml).join('');
  }

  /* ---- Розмітка однієї картки (повторює верстку .car-card) ---- */
  function cardHtml(car) {
    var photos = car.photos && car.photos.length ? car.photos : ['car-rental.png'];
    var alt = esc(car.brand + ' ' + car.model);
    var arrows = photos.length > 1
      ? '<div class="car-arrows"><button type="button" data-dir="-1" aria-label="Попереднє фото">‹</button>' +
        '<button type="button" data-dir="1" aria-label="Наступне фото">›</button></div>'
      : '';
    var reqs = (car.requirements || []).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('');
    var reqBlock = reqs
      ? '<button class="btn-req" onclick="toggleReq(this)">Умови</button>' +
        '<div class="car-req"><h4>Вимоги до водія:</h4><ul>' + reqs + '</ul>' +
        '<button class="btn-close-req" onclick="toggleReq(this)">Закрити</button></div>'
      : '';

    return '' +
      '<article class="car-card">' +
        '<div class="car-photo">' +
          '<span class="car-badge">✓</span>' +
          '<img src="' + esc(photos[0]) + '" alt="' + alt + '" loading="lazy" ' +
               'data-photos=\'' + esc(JSON.stringify(photos)) + '\' data-idx="0" ' +
               'onerror="this.style.display=\'none\'">' +
          arrows +
        '</div>' +
        '<div class="car-brand">' + esc(car.brand) + '</div>' +
        '<div class="car-name"><h3>' + esc(car.model) + '</h3>' +
          (car.year ? '<span class="yr">' + esc(car.year) + '</span>' : '') + '</div>' +
        '<div class="car-specs">' +
          '<div><div class="lbl">Тип палива:</div><div class="val">' + esc(car.fuel) + '</div></div>' +
          '<div><div class="lbl">Коробка:</div><div class="val">' + esc(car.gearbox) + '</div></div>' +
        '</div>' +
        '<div class="car-price">' +
          '<div><div class="lbl">Тиждень:</div><b>' + fmt(car.pricePerWeek) + ' грн</b></div>' +
          '<div><div class="lbl">Депозит:</div><b>' + fmt(car.deposit) + ' грн</b></div>' +
        '</div>' +
        '<button class="btn-book" onclick="openModal()"><span class="bs-ic">↘</span>Забронювати</button>' +
        reqBlock +
      '</article>';
  }

  function cyclePhoto(btn) {
    var photoBox = btn.closest('.car-photo');
    var img = photoBox && photoBox.querySelector('img');
    if (!img) return;
    var photos;
    try { photos = JSON.parse(img.dataset.photos || '[]'); } catch (e) { photos = []; }
    if (photos.length < 2) return;
    var idx = (+img.dataset.idx || 0) + (+btn.dataset.dir);
    idx = (idx + photos.length) % photos.length;
    img.dataset.idx = idx;
    img.src = photos[idx];
    img.style.display = '';
  }

  /* ---- Утиліти ---- */
  function fmt(n) {
    if (typeof n !== 'number') return esc(String(n == null ? '' : n));
    return n.toLocaleString('uk-UA');
  }
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
