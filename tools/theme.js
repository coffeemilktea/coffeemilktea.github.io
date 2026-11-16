/* Shared theme controller: dark (Tokyo Night) or light (Tokyo Night Day hues).
   Loaded as a plain, non-deferred <script> in <head>, so <html data-theme> is
   set before first paint and there is no flash of the wrong theme.

   Choice order: an explicit choice saved in localStorage "hl7-tools-theme"
   ("light" | "dark"), else the system's prefers-color-scheme. The key and
   values are the ones the Mirth Transformer Builder (same origin) already
   uses, so one choice follows the visitor between the two. This file used to
   delete that key on every load, silently resetting the builder's setting.

   window.toggleTheme() flips and saves the choice and returns the new theme.
   The palettes themselves live in /assets/tokens.css. */
(function () {
  var KEY = 'hl7-tools-theme';
  var BAR = { dark: '#1a1b26', light: '#e1e2e7' };   /* = --bg, for the browser UI */
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; }
    catch (e) { return null; }   /* storage blocked: follow the system */
  }
  function system() { return mq && mq.matches ? 'light' : 'dark'; }

  function apply(theme, forced) {
    root.setAttribute('data-theme', theme);
    /* <meta name=theme-color media=...> pairs follow the system on their own;
       an explicit choice has to override both. */
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var m = metas[i], media = m.getAttribute('media') || '';
      m.setAttribute('content', forced ? BAR[theme] : (media.indexOf('light') > -1 ? BAR.light : BAR.dark));
    }
    try { root.dispatchEvent(new CustomEvent('themechange', { detail: theme })); } catch (e) { /* old browser */ }
  }
  function sync() { var s = saved(); apply(s || system(), !!s); }

  sync();
  if (mq) {
    var onSystem = function () { if (!saved()) apply(system(), false); };
    if (mq.addEventListener) mq.addEventListener('change', onSystem);
    else if (mq.addListener) mq.addListener(onSystem);
  }
  /* another tab (or the Mirth builder) changed the choice */
  window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) sync(); });

  window.toggleTheme = function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, next); } catch (e) { /* not fatal: applies to this page only */ }
    apply(next, true);
    return next;
  };
})();

/* Shared UX helpers used by every tool and page.
   - window.uxAnnounce(msg, isError): one polite live region + toast, so copy,
     load and error feedback is visible and announced the same way everywhere.
   - Clipboard writes announce "Copied to clipboard" (or the failure).
   - Click-to-open drop zones and div tabs get keyboard support
     (role, tabindex, Enter/Space), and tabs keep aria-selected in sync. */
(function () {
  var toast, timer;
  window.uxAnnounce = function (msg, isError) {
    if (!document.body) return;
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'ux-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.toggle('err', !!isError);
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  };

  var cb = navigator.clipboard;
  if (cb && cb.writeText && !cb.__ux) {
    var orig = cb.writeText.bind(cb);
    try {
      cb.writeText = function (t) {
        return orig(t).then(function (r) { if (typeof window.showToast !== 'function') window.uxAnnounce('Copied to clipboard'); return r; },
          function (e) { window.uxAnnounce('Copy failed: select the text and press Ctrl/Cmd+C', true); throw e; });
      };
      cb.__ux = true;
    } catch (e) { /* read-only in some browsers: tools keep their own feedback */ }
  }

  function activateOnKeys(el) {
    el.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); el.click(); }
    });
  }
  function enhance() {
    document.querySelectorAll('.drop-zone[onclick], .upload-zone[onclick], .reader-drop[onclick]').forEach(function (el) {
      if (el.hasAttribute('tabindex')) return;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      var t = el.querySelector('[class*="title"], [class*="text"]');
      if (t) el.setAttribute('aria-label', t.textContent.trim());
      activateOnKeys(el);
    });
    document.querySelectorAll('div.tab[onclick], div.log-tab[onclick]').forEach(function (el) {
      if (el.hasAttribute('tabindex')) return;
      if (el.parentElement) el.parentElement.setAttribute('role', 'tablist');
      el.setAttribute('role', 'tab');
      el.setAttribute('tabindex', '0');
      var sync = function () { el.setAttribute('aria-selected', el.classList.contains('active') ? 'true' : 'false'); };
      sync();
      new MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ['class'] });
      activateOnKeys(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance);
  else enhance();
})();

/* Mobile: a table wider than its container scrolls inside its own
   .tn-scroll box instead of widening the whole page. Only tables that
   actually overflow and have no scrolling ancestor are wrapped; tables
   rendered later (results, tag lists) are picked up by a MutationObserver. */
(function () {
  function scrolls(el) {
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      var o = getComputedStyle(p).overflowX;
      if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true;
    }
    return false;
  }
  function wrapWide() {
    var vw = document.documentElement.clientWidth;
    document.querySelectorAll('table').forEach(function (t) {
      if (t.parentElement && t.parentElement.classList.contains('tn-scroll')) return;
      var r = t.getBoundingClientRect();
      if (r.width === 0 || r.right <= vw + 1 || scrolls(t)) return;
      var w = document.createElement('div');
      w.className = 'tn-scroll';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }
  var pending = false;
  function schedule() {
    if (pending) return; pending = true;
    requestAnimationFrame(function () { pending = false; wrapWide(); });
  }
  function start() {
    wrapWide();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
