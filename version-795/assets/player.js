(function () {
  window.initializePlayer = function (url) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playerOverlay');
    var attached = false;

    if (!video || !url) {
      return;
    }

    var attach = function () {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      attached = true;
    };

    var play = function () {
      attach();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };
})();
