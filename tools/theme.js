/* Healthcare Data Tools — shared theme controller
   Pairs with tools/theme.css. Sets data-theme on <html>, defaults to dark,
   exposes window.toggleTheme(), and wires a #btn-theme button if the page
   has one. The choice persists in localStorage under "hl7-tools-theme",
   a key shared with the tools in the hl7-dicom-tools repo so a visitor's
   preference follows them between the two.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  const STORAGE_KEY = 'hl7-tools-theme';

  /* localStorage throws outright when a browser blocks site data, so every
     access is guarded — a page that can't remember the choice must still
     get a working toggle rather than a dead button. */
  function read() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ignore */ }
  }

  /* Apply the saved theme immediately — before paint — to prevent a flash */
  if (read() === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function syncBtn(btn, theme) {
    if (!btn) return;
    const icon  = btn.querySelector('.theme-icon');
    const label = btn.querySelector('.theme-label');
    if (icon)  icon.textContent  = theme === 'dark' ? '☀️' : '🌙';
    if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    btn.setAttribute('aria-label', btn.title);
  }

  window.toggleTheme = function () {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    write(next);
    syncBtn(document.getElementById('btn-theme'), next);
  };

  function wire() {
    const btn = document.getElementById('btn-theme');
    if (!btn) return;
    btn.addEventListener('click', window.toggleTheme);
    syncBtn(btn, getTheme());
  }

  /* The script is loaded in <head>, so the button usually isn't parsed yet —
     but guard against a late include too, where the event already fired. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
