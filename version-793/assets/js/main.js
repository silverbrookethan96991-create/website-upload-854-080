(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-menu]");
        if (menuButton && menu) {
            menuButton.addEventListener("click", function () {
                menu.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === active);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(active - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(active + 1);
                    restart();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });
            show(0);
            restart();
        }

        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var empty = document.querySelector("[data-empty-result]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var activeFilter = "all";

        function getQueryFromUrl() {
            try {
                return new URLSearchParams(window.location.search).get("q") || "";
            } catch (error) {
                return "";
            }
        }

        function applyFilter() {
            if (!cards.length) {
                return;
            }
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var typeText = text;
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || type.indexOf(activeFilter) !== -1 || typeText.indexOf(activeFilter.toLowerCase()) !== -1;
                var matches = matchesQuery && matchesFilter;
                card.hidden = !matches;
                if (matches) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.value = getQueryFromUrl();
            input.addEventListener("input", applyFilter);
        }
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilter();
            });
        });
        applyFilter();
    });
})();
