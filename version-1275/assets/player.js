(function () {
  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-player-overlay]');
  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hls = null;

  function showError() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
      overlay.innerHTML = '<span>▶</span>';
    }
  }

  function attachSource() {
    if (!source) {
      showError();
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError();
        }
      });
      return;
    }
    showError();
  }

  function startPlayback() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  attachSource();

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
