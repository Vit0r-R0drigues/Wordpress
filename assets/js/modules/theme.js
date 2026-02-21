const STORAGE_KEY = 'tls-theme';
const DARK = 'dark';
const LIGHT = 'light';

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    // Ignore storage restrictions.
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function updateToggleButton(button, theme) {
  const isDark = theme === DARK;
  const icon = button.querySelector('[data-theme-icon]');

  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
  button.title = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';

  if (icon) icon.textContent = isDark ? 'L' : 'D';
}

function buildToggleButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.dataset.themeToggle = 'true';
  button.innerHTML =
    '<span class="theme-toggle-icon" data-theme-icon aria-hidden="true">L</span>' +
    '<span class="theme-toggle-text">Tema</span>';
  return button;
}

function mountToggle(button) {
  button.classList.add('theme-toggle-floating');
  document.body.append(button);
}

export function initTheme() {
  const storedTheme = getStoredTheme();
  const initialTheme = storedTheme === DARK || storedTheme === LIGHT ? storedTheme : DARK;
  applyTheme(initialTheme);

  if (document.querySelector('[data-theme-toggle]')) return;
  const toggle = buildToggleButton();
  updateToggleButton(toggle, initialTheme);
  mountToggle(toggle);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === DARK ? DARK : LIGHT;
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    storeTheme(next);
    updateToggleButton(toggle, next);
  });
}
