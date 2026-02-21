export function initYear() {
  const yearNodes = document.querySelectorAll('[data-year]');
  const year = String(new Date().getFullYear());
  yearNodes.forEach((node) => {
    node.textContent = year;
  });
}
