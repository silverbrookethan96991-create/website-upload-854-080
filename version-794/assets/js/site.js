(function () {
  const mobileButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const backTopButtons = document.querySelectorAll('[data-back-top]');
  backTopButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  const filterForm = document.querySelector('[data-filter-form]');
  const cards = Array.from(document.querySelectorAll('.movie-card[data-search]'));

  if (filterForm && cards.length) {
    const keywordInput = filterForm.querySelector('[data-filter-keyword]');
    const categorySelect = filterForm.querySelector('[data-filter-category]');
    const yearSelect = filterForm.querySelector('[data-filter-year]');
    const regionSelect = filterForm.querySelector('[data-filter-region]');
    const result = document.querySelector('[data-filter-result]');
    const query = new URLSearchParams(window.location.search).get('q');

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function updateResult(visibleCount) {
      if (result) {
        result.textContent = '当前显示 ' + visibleCount + ' / ' + cards.length + ' 部影片';
      }
    }

    function applyFilter() {
      const keyword = normalize(keywordInput && keywordInput.value);
      const category = normalize(categorySelect && categorySelect.value);
      const year = normalize(yearSelect && yearSelect.value);
      const region = normalize(regionSelect && regionSelect.value);
      let visibleCount = 0;

      cards.forEach(function (card) {
        const searchText = normalize(card.getAttribute('data-search'));
        const cardCategory = normalize(card.getAttribute('data-category'));
        const cardYear = normalize(card.getAttribute('data-year'));
        const cardRegion = normalize(card.getAttribute('data-region'));
        const matched = (!keyword || searchText.indexOf(keyword) !== -1) &&
          (!category || cardCategory === category) &&
          (!year || cardYear === year) &&
          (!region || cardRegion === region);

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visibleCount += 1;
        }
      });

      updateResult(visibleCount);
    }

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);
    filterForm.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });
    applyFilter();
  }
})();
