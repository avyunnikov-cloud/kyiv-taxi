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

  /* ---- Розмітка однієї картки (повторює верстку .post-card) ---- */
  function cardHtml(post) {
    var title = esc(post.title || '');
    var img = esc(post.image || 'car-rental.png');
    var hasLink = post.link && post.link !== '#';
    var href = hasLink ? esc(post.link) : '#';
    var attrs = hasLink ? ' target="_blank" rel="noopener"' : ' onclick="return false;"';

    return '' +
      '<article class="post-card">' +
        '<a class="post-photo" href="' + href + '"' + attrs + '>' +
          '<img src="' + img + '" alt="' + title + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        '</a>' +
        '<div class="post-body">' +
          '<span class="post-cat">' + esc(post.category || '') + '</span>' +
          '<h3>' + title + '</h3>' +
          '<p>' + esc(post.excerpt || '') + '</p>' +
          '<div class="post-foot">' +
            '<span>' + esc(formatDate(post.date)) + '</span>' +
            '<a class="read" href="' + href + '"' + attrs + '>Читати →</a>' +
          '</div>' +
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
