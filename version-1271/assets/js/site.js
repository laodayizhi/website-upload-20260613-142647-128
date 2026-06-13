(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return String(text || '').toLowerCase().replace(/\s+/g, '');
    }

    var menuButton = qs('[data-menu-toggle]');
    var nav = qs('[data-main-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');

    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var filterPanel = qs('[data-filter-panel]');

    if (filterPanel) {
        var cards = qsa('[data-search-card]');
        var input = qs('[data-filter-input]', filterPanel);
        var selects = qsa('[data-filter-select]', filterPanel);
        var noResult = qs('[data-no-result]');
        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get('q');

        if (input && urlQuery) {
            input.value = urlQuery;
        }

        function matchSelect(card, select) {
            var value = select.value;
            var field = select.getAttribute('data-filter-select');
            if (!value || !field) {
                return true;
            }
            return normalize(card.getAttribute('data-' + field)).indexOf(normalize(value)) !== -1;
        }

        function applyFilters() {
            var query = input ? normalize(input.value) : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var ok = !query || text.indexOf(query) !== -1;
                selects.forEach(function (select) {
                    if (!matchSelect(card, select)) {
                        ok = false;
                    }
                });
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (noResult) {
                noResult.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
        applyFilters();
    }
})();
