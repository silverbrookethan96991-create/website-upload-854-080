(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      button.classList.toggle('open');
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var track = carousel.querySelector('[data-hero-track]');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function render(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        render(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        render(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        render(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    render(0);
    start();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search-form'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          window.location.href = form.getAttribute('action') || 'all-movies.html';
        }
      });
    });
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var region = scope.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query) {
        input.value = query;
      }

      function value(node) {
        return node ? node.value.trim().toLowerCase() : '';
      }

      function apply() {
        var q = value(input);
        var y = value(year);
        var r = value(region);
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-category'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchText = !q || text.indexOf(q) !== -1;
          var matchYear = !y || (card.getAttribute('data-year') || '').toLowerCase() === y;
          var matchRegion = !r || (card.getAttribute('data-region') || '').toLowerCase() === r;
          card.classList.toggle('is-hidden', !(matchText && matchYear && matchRegion));
        });
      }

      [input, year, region].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    var shell = document.querySelector('[data-player]');
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-play-button]');
    if (!shell || !video || !button) {
      return;
    }
    var source = video.getAttribute('data-video-url');
    var started = false;
    var hlsInstance = null;

    function attach() {
      if (started) {
        return Promise.resolve();
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 1200);
        });
      }
      video.src = source;
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        shell.classList.add('playing');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            shell.classList.remove('playing');
          });
        }
      });
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayer();
  });
})();
