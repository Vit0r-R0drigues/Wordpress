import { initNavigation } from './modules/navigation.js';
import { initYear } from './modules/year.js';
import { initReveal } from './modules/reveal.js';
import { initTextRotator } from './modules/text-rotator.js';
import { initWhatsAppFloat } from './modules/wa-float.js';
import { initContactForm } from './modules/contact-form.js';
import { initCalculators } from './modules/calculadoras.js';
import { initTheme } from './modules/theme.js';
import { initCookieConsent } from './modules/cookie-consent.js';

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCookieConsent();
  initNavigation();
  initYear();
  initReveal();
  initTextRotator();
  initWhatsAppFloat();
  initContactForm();
  initCalculators();
});
