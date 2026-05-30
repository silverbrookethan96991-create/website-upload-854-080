(function () {
  function toggleMobileNav() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupBackTop() {
    var buttons = document.querySelectorAll("[data-back-top]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var empty = document.querySelector("[data-empty-state]");
    var activeFilter = "all";

    if (!cards.length) {
      return;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var category = card.getAttribute("data-category") || "";
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var categoryMatched = activeFilter === "all" || category === activeFilter;
        var visible = keywordMatched && categoryMatched;
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });
  }

  window.setupMoviePlayer = function (url) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    var attached = false;

    if (!video || !cover || !url) {
      return;
    }

    function attachVideo() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attachVideo();
      cover.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    cover.addEventListener("click", play);
    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    toggleMobileNav();
    setupBackTop();
    setupHero();
    setupFilters();
  });
})();
