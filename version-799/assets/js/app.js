(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var track = carousel.querySelector(".hero-track");
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function render() {
            track.style.transform = "translateX(-" + index * 100 + "%)";
            slides.forEach(function (slide, current) {
                slide.classList.toggle("active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("active", current === index);
            });
        }

        function go(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            render();
        }

        function start() {
            stop();
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    go(index + 1);
                }, 5000);
            }
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                go(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                go(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                go(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        render();
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
            var list = panel.nextElementSibling;
            while (list && !list.classList.contains("movie-grid") && !list.classList.contains("rank-list")) {
                list = list.nextElementSibling;
            }
            if (!list) {
                return;
            }
            var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item"));
            var empty = panel.querySelector(".empty-state");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selected = {};
                selects.forEach(function (select) {
                    selected[select.getAttribute("data-filter")] = select.value;
                });
                var visible = 0;
                items.forEach(function (item) {
                    var text = item.getAttribute("data-search") || "";
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesSelects = Object.keys(selected).every(function (key) {
                        return !selected[key] || item.getAttribute("data-" + key) === selected[key];
                    });
                    var show = matchesQuery && matchesSelects;
                    item.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var loading = shell.querySelector(".player-loading");
        var started = false;
        var hls = null;

        function hideLoading() {
            if (loading) {
                loading.hidden = true;
            }
        }

        function showLoading() {
            if (loading) {
                loading.hidden = false;
            }
        }

        function attachStream() {
            if (started || !video) {
                return;
            }
            started = true;
            showLoading();
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", hideLoading, { once: true });
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hideLoading();
                    }
                });
                return;
            }
            video.src = streamUrl;
            video.load();
            hideLoading();
        }

        function playVideo() {
            attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    video.muted = true;
                    video.play().catch(function () {});
                });
            }
        }

        function toggleVideo() {
            if (!started) {
                playVideo();
                return;
            }
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }
        if (video) {
            video.addEventListener("click", toggleVideo);
            video.addEventListener("canplay", hideLoading);
            video.addEventListener("waiting", showLoading);
            video.addEventListener("playing", hideLoading);
        }
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupCarousel();
        setupFilters();
    });
})();
