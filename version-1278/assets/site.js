(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    var menuToggle = document.querySelector('[data-menu-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');
    var siteSearch = document.querySelector('[data-site-search]');

    if (menuToggle && siteNav) {
        menuToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
            if (siteSearch) {
                siteSearch.classList.toggle('is-open');
            }
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
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

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
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

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function applyFilters(panel) {
        var list = panel.parentElement.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');
        if (!list) {
            return;
        }
        var keyword = normalize((panel.querySelector('[data-filter-keyword]') || {}).value);
        var year = (panel.querySelector('[data-filter-year]') || {}).value || '';
        var type = (panel.querySelector('[data-filter-type]') || {}).value || '';
        var region = (panel.querySelector('[data-filter-region]') || {}).value || '';
        var category = (panel.querySelector('[data-filter-category]') || {}).value || '';
        var cards = selectAll('[data-search]', list);
        var visible = 0;

        cards.forEach(function (card) {
            var searchText = normalize(card.getAttribute('data-search'));
            var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
            var matchesYear = !year || card.getAttribute('data-year') === year;
            var matchesType = !type || card.getAttribute('data-type') === type;
            var matchesRegion = !region || card.getAttribute('data-region') === region;
            var matchesCategory = !category || card.getAttribute('data-category') === category;
            var matches = matchesKeyword && matchesYear && matchesType && matchesRegion && matchesCategory;
            card.style.display = matches ? '' : 'none';
            if (matches) {
                visible += 1;
            }
        });

        var empty = panel.parentElement.querySelector('[data-filter-empty]');
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    selectAll('[data-filter-panel]').forEach(function (panel) {
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (keywordInput && query) {
            keywordInput.value = query;
        }
        selectAll('input, select', panel).forEach(function (control) {
            control.addEventListener('input', function () {
                applyFilters(panel);
            });
            control.addEventListener('change', function () {
                applyFilters(panel);
            });
        });
        applyFilters(panel);
    });
})();
