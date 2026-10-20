/* Landing page interactions (vanilla, no dependencies):
   filter chips, card tilt, the screenshot lightbox and the typing sample panel.
   Everything degrades: without JS all cards show and screenshots are plain images. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    var cards = $$('.card');

    /* ── Filter chips ── */
    var filters = $('.filters');
    if (filters) {
      filters.hidden = false;
      $$('[data-count]', filters).forEach(function (n) {
        var k = n.getAttribute('data-count');
        n.textContent = k === 'all' ? cards.length : cards.filter(function (c) { return c.dataset.cat.split(' ').indexOf(k) > -1; }).length;
      });
      var status = $('.filter-status');
      filters.addEventListener('click', function (e) {
        var b = e.target.closest('.chip'); if (!b) return;
        var k = b.getAttribute('data-filter');
        $$('.chip', filters).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        var shown = 0;
        cards.forEach(function (c) {
          var on = k === 'all' || c.dataset.cat.split(' ').indexOf(k) > -1;
          c.hidden = !on;
          c.classList.remove('is-filtered-in');
          if (on) { shown++; c.classList.add('is-in'); if (!reduce) { void c.offsetWidth; c.classList.add('is-filtered-in'); } }
        });
        if (status) status.textContent = shown + ' of ' + cards.length + ' shown';
      });
    }

    /* ── Card tilt (mouse only, off for reduced motion) ── */
    if (fine && !reduce) {
      cards.forEach(function (c) {
        var inner = $('.card-in', c), raf = 0;
        inner.addEventListener('pointermove', function (e) {
          var r = inner.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(function () {
            inner.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg');
            inner.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
          });
        });
        inner.addEventListener('pointerleave', function () {
          cancelAnimationFrame(raf);
          inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg');
        });
      });
    }

    /* ── Lightbox ── */
    var lb = $('#lightbox');
    if (lb && typeof lb.showModal === 'function') {
      var img = $('.lb-img', lb), cap = $('.lb-cap', lb), title = $('#lb-title', lb), uses = $('.lb-uses', lb);
      var open = $('.lb-open', lb), src = $('.lb-src', lb);
      var idx = 0, view = 'desktop', opener = null;
      var visible = function () { return cards.filter(function (c) { return !c.hidden; }); };
      var show = function () {
        var list = visible(); if (!list.length) return;
        idx = (idx + list.length) % list.length;
        var c = list[idx], slug = c.dataset.slug;
        var name = $('h3 a', c).textContent, desk = $('.shot-desk', c);
        title.textContent = name;
        img.classList.add('is-loading');
        img.onload = function () { img.classList.remove('is-loading'); };
        if (view === 'mobile') { img.width = 780; img.height = 1688; img.classList.add('is-mobile'); }
        else { img.width = 1280; img.height = 800; img.classList.remove('is-mobile'); }
        img.src = '/assets/screenshots/' + slug + '-' + view + '.webp';
        img.alt = desk.alt + (view === 'mobile' ? ' (phone layout)' : '');
        cap.textContent = desk.alt + (view === 'mobile' ? ', on a 390px-wide phone screen.' : ', on a 1280px desktop window.');
        var t = $('.card-uses', c);
        uses.innerHTML = '<strong>Use cases</strong>';
        if (t) uses.appendChild(t.content.cloneNode(true));
        var links = $$('.card-actions a', c);
        open.href = links[0].href; src.href = links[1].href;
        open.innerHTML = open.innerHTML.replace(/^[^<]*/, 'Open ' + name + ' ');
        $$('.lb-views button', lb).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false'); });
        var many = list.length > 1;
        $$('.lb-nav', lb).forEach(function (b) { b.hidden = !many; });
      };
      document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-open]'); if (!b) return;
        var c = b.closest('.card');
        opener = b; view = 'desktop'; idx = visible().indexOf(c);
        show(); lb.showModal(); document.documentElement.classList.add('lb-lock');
        $('.lb-close', lb).focus();
      });
      lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.closest('[data-close]')) lb.close();
        var s = e.target.closest('[data-step]'); if (s) { idx += +s.dataset.step; show(); }
        var v = e.target.closest('[data-view]'); if (v) { view = v.dataset.view; show(); }
      });
      lb.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { idx++; show(); }
        else if (e.key === 'ArrowLeft') { idx--; show(); }
      });
      lb.addEventListener('close', function () {
        document.documentElement.classList.remove('lb-lock');
        if (opener) opener.focus();
      });
    }

    /* ── Sample panel: tabs + typing ── */
    var tabs = $$('.term-tabs [role=tab]');
    var timer = 0;
    function type(pre) {
      clearTimeout(timer);
      if (reduce) return;
      var nodes = [], walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push({ n: walker.currentNode, t: walker.currentNode.nodeValue });
      if (!pre.dataset.typed) {
        pre.dataset.typed = '1';
        nodes.forEach(function (o) { o.n.nodeValue = ''; });
        pre.classList.add('typing');
        var i = 0, j = 0;
        (function step() {
          if (i >= nodes.length) { pre.classList.remove('typing'); return; }
          var o = nodes[i], take = Math.min(o.t.length - j, 3);
          o.n.nodeValue += o.t.substr(j, take); j += take;
          if (j >= o.t.length) { i++; j = 0; }
          timer = setTimeout(step, o.t.charAt(j - 1) === '\n' ? 140 : 16);
        })();
        pre.addEventListener('click', function finish() {
          clearTimeout(timer); nodes.forEach(function (o) { o.n.nodeValue = o.t; }); pre.classList.remove('typing');
        }, { once: true });
      }
    }
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
      var pane = document.getElementById(tab.getAttribute('aria-controls'));
      if (pane) type(pane);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length], true); }
      });
    });
    if (tabs.length) {
      var first = document.getElementById(tabs[0].getAttribute('aria-controls'));
      /* start typing once the panel is on screen */
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); type(first); } });
        io.observe(first);
      } else type(first);
    }
  });
})();
