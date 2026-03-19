// Dark Mode Toggle Script
(function() {
  // Check if user has a saved preference
  const prefersDark = localStorage.getItem('darkMode') === 'true';
  const prefersLight = localStorage.getItem('darkMode') === 'false';
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Set initial mode
  if (prefersLight) {
    document.body.classList.remove('dark-mode');
  } else if (prefersDark || (!prefersLight && systemPrefersDark)) {
    document.body.classList.add('dark-mode');
  }

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'dark-mode-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
  toggleBtn.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  toggleBtn.type = 'button';

  // Add to page when DOM is ready
  if (document.body) {
    document.body.appendChild(toggleBtn);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(toggleBtn);
    });
  }

  // Toggle handler
  toggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    toggleBtn.innerHTML = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark.toString());
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('darkMode')) {
      if (e.matches) {
        document.body.classList.add('dark-mode');
        toggleBtn.innerHTML = '☀️';
      } else {
        document.body.classList.remove('dark-mode');
        toggleBtn.innerHTML = '🌙';
      }
    }
  });
})();
