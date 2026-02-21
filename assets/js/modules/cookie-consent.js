const STORAGE_KEY = 'tls_cookie_consent_v1';
const CONSENT_VERSION = 1;
const GA_MEASUREMENT_ID = window.TLS_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const HIDE_DELAY_MS = 220;
const ACTION_FEEDBACK_MS = 1400;
const PANEL_ID = 'cookie-preferences-panel';

let closeTimer = null;

function getPolicyPrefix() {
  const path = window.location.pathname;
  const isNestedPage = /\/(Agradecimento|BLOG|HTML|INSTAGRAM|landingpages|tools)\//.test(path);
  return isNestedPage ? '../' : './';
}

function getPolicyHref(fileName) {
  return `${getPolicyPrefix()}${fileName}`;
}

function clearCloseTimer() {
  if (!closeTimer) return;
  window.clearTimeout(closeTimer);
  closeTimer = null;
}

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics)
    };
  } catch (error) {
    return null;
  }
}

function writeConsent(analytics) {
  const payload = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    necessary: true,
    analytics: Boolean(analytics)
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Ignore storage restrictions.
  }
}

function canLoadAnalytics(consent) {
  return Boolean(consent && consent.analytics);
}

function initAnalytics() {
  if (window.__tlsAnalyticsLoaded) return;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.includes('XXXX')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    page_path: window.location.pathname
  });

  if (!document.querySelector('[data-ga-script]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.setAttribute('data-ga-script', 'true');
    document.head.append(script);
  }

  window.__tlsAnalyticsLoaded = true;
}

function createBanner() {
  const privacyHref = getPolicyHref('politica-de-privacidade.html');
  const cookiesHref = getPolicyHref('politica-de-cookies.html');

  const banner = document.createElement('section');
  banner.className = 'cookie-consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Consentimento de cookies');
  banner.setAttribute('aria-modal', 'false');
  banner.setAttribute('aria-hidden', 'true');
  banner.setAttribute('data-cookie-banner', 'true');
  banner.hidden = true;

  banner.innerHTML = `
    <div class="cookie-head">
      <span class="cookie-head-icon" aria-hidden="true"><i class="fi fi-rr-cookie"></i></span>
      <div class="cookie-head-content">
        <strong class="cookie-head-title">Preferencias de privacidade</strong>
        <p>
          Utilizamos cookies necessarios e, com sua permissao, cookies analiticos para melhorar o site.
          Leia a <a href="${privacyHref}">Politica de Privacidade</a> e a <a href="${cookiesHref}">Politica de Cookies</a>.
        </p>
      </div>
    </div>
    <p class="cookie-feedback" data-cookie-feedback role="status" aria-live="polite" hidden></p>
    <div class="cookie-actions">
      <button type="button" class="cookie-btn cookie-btn-ghost" data-cookie-reject>
        <i class="fi fi-rr-cross-small" aria-hidden="true"></i>
        <span>Recusar</span>
      </button>
      <button type="button" class="cookie-btn cookie-btn-ghost" data-cookie-toggle aria-controls="${PANEL_ID}" aria-expanded="false">
        <i class="fi fi-rr-settings-sliders" aria-hidden="true"></i>
        <span>Preferencias</span>
      </button>
      <button type="button" class="cookie-btn cookie-btn-primary" data-cookie-accept>
        <i class="fi fi-rr-check" aria-hidden="true"></i>
        <span>Aceitar</span>
      </button>
    </div>
    <div class="cookie-preferences" id="${PANEL_ID}" data-cookie-panel hidden>
      <label class="cookie-check">
        <input type="checkbox" checked disabled>
        <span><strong>Cookies necessarios</strong><small>Essenciais para funcionamento do site.</small></span>
      </label>
      <label class="cookie-check">
        <input type="checkbox" data-cookie-analytics>
        <span><strong>Cookies analiticos</strong><small>Permitem analise de uso para melhorias.</small></span>
      </label>
      <button type="button" class="cookie-btn cookie-btn-primary cookie-save" data-cookie-save>Salvar preferencias</button>
    </div>
  `;

  document.body.append(banner);
  return banner;
}

function createManageButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cookie-manage';
  button.setAttribute('aria-label', 'Gerenciar cookies');
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('data-cookie-manage', 'true');
  button.innerHTML = `
    <i class="fi fi-rr-cookie" aria-hidden="true"></i>
    <span data-cookie-manage-label>Configurar cookies</span>
  `;
  document.body.append(button);
  return button;
}

function getManageButtonText(consent) {
  if (!consent) return 'Configurar cookies';
  return consent.analytics ? 'Cookies aceitos' : 'Cookies minimos';
}

function getManageButtonAria(consent) {
  if (!consent) return 'Gerenciar cookies';
  if (consent.analytics) return 'Gerenciar cookies. Analytics ativado.';
  return 'Gerenciar cookies. Apenas cookies necessarios ativos.';
}

function updateManageButton(manage, consent) {
  const labelNode = manage.querySelector('[data-cookie-manage-label]');
  if (labelNode) labelNode.textContent = getManageButtonText(consent);
  manage.setAttribute('aria-label', getManageButtonAria(consent));
}

function setFeedback(banner, message, tone) {
  const feedback = banner.querySelector('[data-cookie-feedback]');
  if (!feedback) return;

  const isInfo = tone === 'info';
  const iconClass = isInfo ? 'fi fi-rr-info' : 'fi fi-rr-badge-check';

  feedback.classList.remove('is-success', 'is-info');
  feedback.classList.add(isInfo ? 'is-info' : 'is-success');
  feedback.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i><span>${message}</span>`;
  feedback.hidden = false;
}

function clearFeedback(banner) {
  const feedback = banner.querySelector('[data-cookie-feedback]');
  if (!feedback) return;
  feedback.hidden = true;
  feedback.textContent = '';
  feedback.classList.remove('is-success', 'is-info');
}

function showBanner(banner) {
  clearCloseTimer();
  clearFeedback(banner);
  banner.hidden = false;
  banner.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => banner.classList.add('is-visible'));
}

function hideBanner(banner) {
  clearCloseTimer();
  banner.classList.remove('is-visible');
  banner.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    if (!banner.classList.contains('is-visible')) banner.hidden = true;
  }, HIDE_DELAY_MS);
}

function setPanelState(panel, toggle, isOpen) {
  panel.hidden = !isOpen;
  if (toggle) toggle.setAttribute('aria-expanded', String(isOpen));
}

function syncAnalyticsInput(input, consent) {
  input.checked = Boolean(consent && consent.analytics);
}

function saveAndClose({ banner, manage, analyticsEnabled, message }) {
  writeConsent(analyticsEnabled);
  if (analyticsEnabled) initAnalytics();
  const consent = readConsent() || {
    necessary: true,
    analytics: Boolean(analyticsEnabled)
  };
  updateManageButton(manage, consent);
  setFeedback(banner, message, analyticsEnabled ? 'success' : 'info');
  closeTimer = window.setTimeout(() => {
    hideBanner(banner);
  }, ACTION_FEEDBACK_MS);
}

export function initCookieConsent() {
  const consent = readConsent();
  if (canLoadAnalytics(consent)) initAnalytics();

  const banner = document.querySelector('[data-cookie-banner]') || createBanner();
  const manage = document.querySelector('[data-cookie-manage]') || createManageButton();

  const reject = banner.querySelector('[data-cookie-reject]');
  const accept = banner.querySelector('[data-cookie-accept]');
  const toggle = banner.querySelector('[data-cookie-toggle]');
  const save = banner.querySelector('[data-cookie-save]');
  const panel = banner.querySelector('[data-cookie-panel]');
  const analyticsInput = banner.querySelector('[data-cookie-analytics]');

  if (!(reject && accept && toggle && save && panel && analyticsInput)) return;

  updateManageButton(manage, consent);
  syncAnalyticsInput(analyticsInput, consent);
  if (!consent) showBanner(banner);

  reject.addEventListener('click', () => {
    saveAndClose({
      banner,
      manage,
      analyticsEnabled: false,
      message: 'Preferencia salva: apenas cookies necessarios ativos.'
    });
    setPanelState(panel, toggle, false);
  });

  accept.addEventListener('click', () => {
    saveAndClose({
      banner,
      manage,
      analyticsEnabled: true,
      message: 'Preferencia salva: cookies analiticos ativados.'
    });
    setPanelState(panel, toggle, false);
    analyticsInput.checked = true;
  });

  toggle.addEventListener('click', () => {
    const shouldOpen = panel.hidden;
    setPanelState(panel, toggle, shouldOpen);
  });

  save.addEventListener('click', () => {
    const analyticsEnabled = analyticsInput.checked;
    saveAndClose({
      banner,
      manage,
      analyticsEnabled,
      message: analyticsEnabled
        ? 'Preferencias salvas com analytics habilitado.'
        : 'Preferencias salvas com apenas cookies necessarios.'
    });
    setPanelState(panel, toggle, false);
  });

  manage.addEventListener('click', () => {
    showBanner(banner);
    setPanelState(panel, toggle, false);
    syncAnalyticsInput(analyticsInput, readConsent());
    accept.focus();
  });

  document.querySelectorAll('[data-open-cookie-settings]').forEach((node) => {
    node.addEventListener('click', (event) => {
      event.preventDefault();
      showBanner(banner);
      setPanelState(panel, toggle, true);
      syncAnalyticsInput(analyticsInput, readConsent());
      analyticsInput.focus();
    });
  });

  banner.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!readConsent()) return;
    setPanelState(panel, toggle, false);
    hideBanner(banner);
  });
}
