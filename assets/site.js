/* Site chrome behaviour shared by every page (vanilla, no dependencies):
   - the sticky header shrinks once the page scrolls
   - [data-reveal] elements fade up as they enter the viewport
   - the phone menu closes after a link is chosen or on Escape
   Smooth anchor scrolling is CSS (scroll-behavior), off under reduced motion. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    var header = document.querySelector('.sx-header');
    if (header) {
      var ticking = false;
      var update = function () { ticking = false; header.classList.toggle('is-scrolled', window.scrollY > 12); };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }

    var menu = document.querySelector('.sx-menu');
    if (menu) {
      menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.removeAttribute('open'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.hasAttribute('open')) { menu.removeAttribute('open'); menu.querySelector('summary').focus(); }
      });
      document.addEventListener('click', function (e) { if (!menu.contains(e.target)) menu.removeAttribute('open'); });
    }

    var items = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  });
})();
