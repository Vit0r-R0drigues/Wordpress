export function initNavigation() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (!toggle || !nav) return;

  const updateToggleIcon = (isOpen) => {
    const icon = toggle.querySelector('.fi');
    if (!icon) return;
    icon.classList.remove('fi-rr-menu-burger', 'fi-rr-cross');
    icon.classList.add(isOpen ? 'fi-rr-cross' : 'fi-rr-menu-burger');
  };

  const updateState = (isOpen) => {
    nav.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', isOpen);
    updateToggleIcon(isOpen);
  };

  updateState(false);

  toggle.addEventListener('click', () => {
    const isOpen = !nav.classList.contains('open');
    updateState(isOpen);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (nav.contains(target) || toggle.contains(target)) return;
    updateState(false);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => updateState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    updateState(false);
    toggle.focus();
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 64rem)').matches) {
      updateState(false);
    }
  });
}
