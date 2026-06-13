(function () {
  function setupMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (slides.length === 0) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function getQueryValue(name) {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get(name) || '';
    } catch (error) {
      return '';
    }
  }

  function setupFilters() {
    var zones = Array.prototype.slice.call(document.querySelectorAll('[data-filter-zone]'));
    if (zones.length === 0) {
      return;
    }
    var initialQuery = getQueryValue('q').trim();

    zones.forEach(function (zone) {
      var searchInput = zone.querySelector('.js-card-search');
      var selects = Array.prototype.slice.call(zone.querySelectorAll('.js-select-filter'));
      var sortSelect = zone.querySelector('.js-sort-select');
      var grid = zone.querySelector('.movie-grid');

      if (!grid) {
        return;
      }

      if (searchInput && initialQuery && !searchInput.value) {
        searchInput.value = initialQuery;
      }

      function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var selected = {};
        selects.forEach(function (select) {
          selected[select.getAttribute('data-filter')] = select.value;
        });

        Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var region = card.getAttribute('data-region') || '';
          var type = card.getAttribute('data-type') || '';
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (selected.region && selected.region !== '全部' && selected.region !== region) {
            matched = false;
          }
          if (selected.type && selected.type !== '全部' && selected.type !== type) {
            matched = false;
          }

          card.hidden = !matched;
        });
      }

      function applySort() {
        if (!sortSelect) {
          return;
        }
        var value = sortSelect.value;
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        cards.sort(function (a, b) {
          var ay = parseInt(a.getAttribute('data-year') || '0', 10);
          var by = parseInt(b.getAttribute('data-year') || '0', 10);
          var at = a.textContent.trim();
          var bt = b.textContent.trim();
          if (value === 'year-asc') {
            return ay - by;
          }
          if (value === 'title-asc') {
            return at.localeCompare(bt, 'zh-CN');
          }
          return by - ay;
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
      });
      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          applySort();
          applyFilters();
        });
      }
      applySort();
      applyFilters();
    });
  }

  function setupPlayer() {
    var configNode = document.getElementById('movie-player-config');
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    var button = document.getElementById('player-play-button');

    if (!configNode || !video) {
      return;
    }

    var config = {};
    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }

    var source = config.source || '';
    var instance = null;
    var ready = false;

    function bindVideo() {
      if (ready || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function playVideo() {
      bindVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
