/* HL7 Tools — shared theme controller
   Persists theme choice across msgparser, dicom-generator, and hl7-diff
   via localStorage key "hl7-tools-theme".
   ───────────────────────────────────────────────────────────────────── */
(function () {
  const STORAGE_KEY = 'hl7-tools-theme';

  /* Apply saved theme immediately — before paint — to prevent flash */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light') {
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
  }

  window.toggleTheme = function () {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    syncBtn(document.getElementById('btn-theme'), next);
  };

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('btn-theme');
    if (btn) {
      btn.addEventListener('click', window.toggleTheme);
      syncBtn(btn, getTheme());
    }
  });
})();
