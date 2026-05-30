(function () {
  function attach(video, source) {
    if (video.getAttribute('data-ready') === 'true') {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.setAttribute('data-ready', 'true');
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      video.setAttribute('data-ready', 'true');
      return Promise.resolve();
    }
    video.src = source;
    video.setAttribute('data-ready', 'true');
    return Promise.resolve();
  }

  window.setupPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    if (!video || !overlay || !options.source) {
      return;
    }
    var start = function () {
      attach(video, options.source).then(function () {
        overlay.classList.add('is-hidden');
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {});
        }
      });
    };
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
