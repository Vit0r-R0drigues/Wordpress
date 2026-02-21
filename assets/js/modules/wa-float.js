export function initWhatsAppFloat() {
  const widget = document.querySelector('[data-wa-float]');
  if (!widget) return;

  widget.classList.add('active');
  setTimeout(() => widget.classList.remove('active'), 3200);
}
