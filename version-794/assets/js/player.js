import { H as Hls } from './hls-vendor-dru42stk.js';

function setMessage(player, text) {
  const message = player.querySelector('[data-player-message]');
  if (message) {
    message.textContent = text;
  }
}

function initializePlayer(player) {
  const video = player.querySelector('video');
  const startButton = player.querySelector('[data-player-start]');
  const source = player.getAttribute('data-src');

  if (!video || !source) {
    setMessage(player, '播放器缺少可用播放源');
    return;
  }

  let hlsInstance = null;

  function attachSource() {
    if (hlsInstance || video.getAttribute('src')) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage(player, '播放源已就绪');
      });
      hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setMessage(player, '视频加载失败，请稍后重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setMessage(player, '播放源已就绪');
    } else {
      setMessage(player, '当前浏览器不支持 HLS 视频播放');
    }
  }

  async function playVideo() {
    attachSource();
    try {
      await video.play();
      player.classList.add('is-playing');
      setMessage(player, '正在播放');
    } catch (error) {
      setMessage(player, '请再次点击播放器开始播放');
    }
  }

  startButton && startButton.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    player.classList.remove('is-playing');
  });
  video.addEventListener('error', function () {
    setMessage(player, '视频加载失败，请检查网络或稍后重试');
  });

  attachSource();
}

document.querySelectorAll('[data-player]').forEach(initializePlayer);
