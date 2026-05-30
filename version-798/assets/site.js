
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    qsa('[data-hero]').forEach(function (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            if (slides.length <= 1) {
                return;
            }

            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function applyLocalFilters() {
        var searchInput = qs('[data-local-search]');
        var typeSelect = qs('[data-local-type]');
        var grid = qs('[data-filter-grid]') || qs('.movie-grid');
        var empty = qs('[data-empty-state]');

        if (!grid) {
            return;
        }

        var cards = qsa('.movie-card', grid);
        var text = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value.trim() : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-genre') || ''
            ].join(' ').toLowerCase();
            var cardType = card.getAttribute('data-type') || '';
            var matched = (!text || haystack.indexOf(text) !== -1) && (!type || cardType === type);

            card.style.display = matched ? '' : 'none';

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    qsa('[data-local-search], [data-local-type]').forEach(function (control) {
        control.addEventListener('input', applyLocalFilters);
        control.addEventListener('change', applyLocalFilters);
    });

    function attachPlayer(video, source) {
        if (!video || !source || video.getAttribute('data-ready') === '1') {
            return;
        }

        video.setAttribute('data-ready', '1');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    qsa('[data-play-target]').forEach(function (button) {
        var id = button.getAttribute('data-play-target');
        var video = document.getElementById(id);

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-stream');

        function play() {
            attachPlayer(video, source);
            button.classList.add('is-hidden');
            var action = video.play();

            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            attachPlayer(video, source);
        });
    });
})();
