/* ==========================================================================
   Блог: рендер карток новин із posts.json.
   Дані всіх новин зберігаються у файлі posts.json (один блок = одна новина).
   Сортування автоматичне: за датою, найновіша зверху. Фільтрів немає.
   ========================================================================== */
(function () {
  var listEl;
  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
                'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

  document.addEventListener('DOMContentLoaded', function () {
    listEl = document.getElementById('posts-list');
    if (!listEl) return;
    loadPosts();
  });

  function loadPosts() {
    listEl.innerHTML = '<p class="posts-msg">Завантаження новин…</p>';
    fetch('posts.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var posts = Array.isArray(data) ? data : [];
        // Сортуємо за датою: найновіша зверху. При додаванні нової
        // з новішою датою вона автоматично стає першою, решта — нижче.
        posts.sort(function (a, b) {
          return String(b.date || '').localeCompare(String(a.date || ''));
        });
        if (!posts.length) {
          listEl.innerHTML = '<p class="posts-msg">Новин поки немає.</p>';
          return;
        }
        listEl.innerHTML = posts.map(cardHtml).join('');
      })
      .catch(function (err) {
        listEl.innerHTML = '<p class="posts-msg posts-msg-err">Не вдалося завантажити новини. ' +
          'Перевірте файл <b>posts.json</b> (можливо, десь пропущено кому чи дужку).<br><small>' +
          esc(String(err.message || err)) + '</small></p>';
      });
  }

  /* ---- SVG-іконки для мета-рядка ---- */
  var IC_CAL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zM5 9h14v10H5V9z"/></svg>';
  var IC_EYE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 5c-5 0-9 4-10 7 1 3 5 7 10 7s9-4 10-7c-1-3-5-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>';
  var IC_CLK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6V6h-2v7l5 3 1-1.7-4-2.7z"/></svg>';

  /* ---- Розмітка однієї картки (повторює верстку .post-card) ---- */
  function cardHtml(post) {
    var title = esc(post.title || '');
    var img = esc(post.image || 'car-rental.png');
    var hasLink = post.link && post.link !== '#';
    var href = hasLink ? esc(post.link) : '#';
    // Зовнішні посилання (http…) відкриваємо в новій вкладці,
    // внутрішні сторінки статей у поточній.
    var external = /^https?:\/\//i.test(post.link || '');
    var attrs = hasLink
      ? (external ? ' target="_blank" rel="noopener"' : '')
      : ' onclick="return false;"';

    var meta = '' +
      '<span class="pm-item">' + IC_CAL + esc(formatDate(post.date)) + '</span>';
    if (post.views != null && post.views !== '') {
      meta += '<span class="pm-dot">•</span>' +
        '<span class="pm-item">' + IC_EYE + esc(String(post.views)) + '</span>';
    }
    if (post.read != null && post.read !== '') {
      meta += '<span class="pm-dot">•</span>' +
        '<span class="pm-item">' + IC_CLK + esc(String(post.read)) + ' хв</span>';
    }

    return '' +
      '<article class="post-card">' +
        '<a class="post-photo" href="' + href + '"' + attrs + '>' +
          '<img src="' + img + '" alt="' + title + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        '</a>' +
        '<div class="post-body">' +
          '<span class="post-cat">' + esc(post.category || '') + '</span>' +
          '<h3><a href="' + href + '"' + attrs + '>' + title + '</a></h3>' +
          '<div class="post-meta">' + meta + '</div>' +
          '<p>' + esc(post.excerpt || '') + '</p>' +
          '<a class="post-read" href="' + href + '"' + attrs + '>Читати</a>' +
        '</div>' +
      '</article>';
  }

  /* ---- Дата "2026-07-24" -> "24 липня 2026" ---- */
  function formatDate(iso) {
    if (!iso) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
    if (!m) return String(iso);
    var y = m[1], mon = +m[2], day = +m[3];
    var name = MONTHS[mon - 1] || '';
    return day + ' ' + name + ' ' + y;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
