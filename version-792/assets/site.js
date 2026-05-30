(function () {
  var assetRoot = './assets/';
  var mainScript = document.currentScript || document.querySelector('script[src$="site.js"]');

  if (mainScript && mainScript.src) {
    assetRoot = mainScript.src.slice(0, mainScript.src.lastIndexOf('/') + 1);
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showMessage(player, message) {
    var box = player.querySelector('[data-player-message]');
    if (!box) {
      return;
    }
    box.textContent = message;
    box.classList.add('is-visible');
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (window.Hls) {
          resolve();
        } else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function beginPlayback(player) {
    var video = player.querySelector('video');
    var stream = player.getAttribute('data-stream');

    if (!video || !stream) {
      showMessage(player, '播放暂时不可用，请稍后重试。');
      return;
    }

    player.classList.add('is-playing');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {
        showMessage(player, '点击视频画面可继续播放。');
      });
      return;
    }

    var startWithHls = function () {
      if (!window.Hls || !window.Hls.isSupported()) {
        showMessage(player, '播放暂时不可用，请稍后重试。');
        return;
      }

      if (!player.__hlsInstance) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        player.__hlsInstance = hls;
      }

      video.play().catch(function () {
        showMessage(player, '点击视频画面可继续播放。');
      });
    };

    if (window.Hls) {
      startWithHls();
      return;
    }

    loadScript(assetRoot + 'hls-vendor-dru42stk.js')
      .then(startWithHls)
      .catch(function () {
        showMessage(player, '播放暂时不可用，请稍后重试。');
      });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var button = player.querySelector('[data-play-button]');
      var onClick = function (event) {
        event.preventDefault();
        beginPlayback(player);
      };

      if (button) {
        button.addEventListener('click', onClick);
      }

      player.addEventListener('click', function (event) {
        if (!player.classList.contains('is-playing')) {
          onClick(event);
        }
      });
    });
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initBackTop() {
    document.querySelectorAll('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function initImageHandling() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        activate(index + 1);
      }, 5800);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        schedule();
      });
    });

    schedule();
  }

  function initLocalFilter() {
    document.querySelectorAll('[data-local-filter]').forEach(function (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
      input.addEventListener('input', function () {
        var query = text(input.value).trim();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
          ].map(text).join(' ');
          card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card compact-card">',
      '<a class="poster-shell" href="./' + escapeHtml(movie.url) + '">',
      '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="score-badge">' + escapeHtml(movie.score) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><a href="./category-' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.categoryName) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
      '<h2><a href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p>' + escapeHtml(movie.oneLine || movie.genre || '') + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function initGlobalSearch() {
    var form = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-search-results]');

    if (!form || !results || !window.MOVIES) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var category = form.querySelector('select[name="category"]');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q')) {
      input.value = params.get('q');
    }

    function render() {
      var query = text(input.value).trim();
      var selected = category.value;
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.categoryName,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].map(text).join(' ');

        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okCategory = !selected || movie.categorySlug === selected;
        return okQuery && okCategory;
      }).slice(0, 80);

      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        return;
      }

      results.innerHTML = '<div class="movie-grid small-grid">' + matches.map(movieCard).join('') + '</div>';
      initImageHandling();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener('input', render);
    category.addEventListener('change', render);

    if (input.value) {
      render();
    }
  }

  ready(function () {
    initMenu();
    initBackTop();
    initImageHandling();
    initHero();
    initLocalFilter();
    initGlobalSearch();
    initPlayers();
  });
})();
