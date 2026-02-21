export function initTextRotator() {
  const el = document.querySelector('[data-dynamic-text]');
  if (!el) return;

  const words = ['seguranca', 'autonomia', 'qualidade de vida', 'reabilitacao'];
  let index = 0;

  const swap = () => {
    el.textContent = words[index];
    index = (index + 1) % words.length;
  };

  swap();
  setInterval(swap, 2200);
}
