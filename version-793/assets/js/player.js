(function () {
    function initializeMoviePlayer(videoId, sourceUrl, buttonId, title) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hasLoaded = false;
        var hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function loadSource() {
            if (hasLoaded) {
                return;
            }
            hasLoaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function startPlayback() {
            loadSource();
            hideButton();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", hideButton);
        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.initializeMoviePlayer = initializeMoviePlayer;
})();
