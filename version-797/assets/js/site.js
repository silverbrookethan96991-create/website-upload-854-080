(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var change = function (next) {
      if (!slides.length) return;
      slides[active].classList.remove('is-active');
      if (dots[active]) dots[active].classList.remove('is-active');
      active = (next + slides.length) % slides.length;
      slides[active].classList.add('is-active');
      if (dots[active]) dots[active].classList.add('is-active');
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        change(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        change(active + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var genre = panel.querySelector('[data-filter-genre]');
    var year = panel.querySelector('[data-filter-year]');
    var scope = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-state]');
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var g = genre ? genre.value.trim().toLowerCase() : '';
      var y = year ? year.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) ok = false;
        if (g && text.indexOf(g) === -1) ok = false;
        if (y && text.indexOf(y) === -1) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    if (input) input.addEventListener('input', apply);
    if (genre) genre.addEventListener('change', apply);
    if (year) year.addEventListener('change', apply);
  });
})();
