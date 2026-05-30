(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var track = hero.querySelector(".hero-track");
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function render() {
            if (track) {
                track.style.transform = "translateX(-" + index * 100 + "%)";
            }
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function go(step) {
            if (!slides.length) {
                return;
            }
            index = (index + step + slides.length) % slides.length;
            render();
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                go(1);
            }, 6200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                go(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                go(1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                index = dotIndex;
                render();
                restart();
            });
        });
        render();
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-year-filter]");
            var container = scope.parentElement;
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");

            function filter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matchText = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var show = matchText && matchYear;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", filter);
            }
            if (year) {
                year.addEventListener("change", filter);
            }
        });
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var trigger = shell.querySelector(".play-layer");
        if (!video || !trigger) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var bound = false;
        var hls = null;

        function bindStream() {
            if (bound || !stream) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }
            video.src = stream;
        }

        function play() {
            bindStream();
            shell.classList.add("is-playing");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        trigger.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
