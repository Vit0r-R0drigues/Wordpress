const WHATSAPP_NUMBER = '5511999115387';

const FIELD_LIMITS = {
  nome: 80,
  telefone: 24,
  email: 120,
  servico: 80,
  mensagem: 800
};

function getFieldValue(form, name) {
  const field = form.elements[name];
  return field ? String(field.value || '').trim() : '';
}

function sanitizeSingleLine(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeMultiline(value, maxLength) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D+/g, '');

  if (digits.length >= 12 && digits.length <= 13 && digits.startsWith('55')) {
    return digits.slice(2);
  }

  return digits;
}

function isValidPhone(phoneDigits) {
  return /^\d{10,11}$/.test(phoneDigits);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email);
}

function formatPhone(phoneDigits) {
  if (phoneDigits.length === 11) {
    return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7)}`;
  }

  if (phoneDigits.length === 10) {
    return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 6)}-${phoneDigits.slice(6)}`;
  }

  return phoneDigits;
}

function setStatus(statusNode, message, kind) {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.className = kind ? `form-status ${kind}` : 'form-status';
}

function resetValidity(form) {
  ['telefone', 'email'].forEach((name) => {
    const field = form.elements[name];
    if (field && typeof field.setCustomValidity === 'function') {
      field.setCustomValidity('');
    }
  });
}

export function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  const statusNode = document.querySelector('[data-form-status]');

  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    resetValidity(form);

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus(statusNode, 'Revise os campos obrigatorios e tente novamente.', 'error');
      return;
    }

    const nome = sanitizeSingleLine(getFieldValue(form, 'nome'), FIELD_LIMITS.nome);
    const telefoneDigitado = sanitizeSingleLine(getFieldValue(form, 'telefone'), FIELD_LIMITS.telefone);
    const telefone = normalizePhone(telefoneDigitado);
    const email = sanitizeSingleLine(getFieldValue(form, 'email'), FIELD_LIMITS.email).toLowerCase();
    const servico = sanitizeSingleLine(getFieldValue(form, 'servico'), FIELD_LIMITS.servico);
    const mensagem = sanitizeMultiline(getFieldValue(form, 'mensagem'), FIELD_LIMITS.mensagem);

    const phoneField = form.elements.telefone;
    const emailField = form.elements.email;

    if (!isValidPhone(telefone)) {
      if (phoneField && typeof phoneField.setCustomValidity === 'function') {
        phoneField.setCustomValidity('Informe um telefone valido com DDD.');
        phoneField.reportValidity();
      }
      setStatus(statusNode, 'Telefone invalido. Use DDD, por exemplo: (11) 99999-9999.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      if (emailField && typeof emailField.setCustomValidity === 'function') {
        emailField.setCustomValidity('Informe um e-mail valido.');
        emailField.reportValidity();
      }
      setStatus(statusNode, 'E-mail invalido. Revise e tente novamente.', 'error');
      return;
    }

    if (mensagem.length < 8) {
      setStatus(statusNode, 'Descreva um pouco mais a necessidade no campo de mensagem.', 'error');
      return;
    }

    form.elements.nome.value = nome;
    form.elements.telefone.value = formatPhone(telefone);
    form.elements.email.value = email;
    form.elements.servico.value = servico;
    form.elements.mensagem.value = mensagem;

    const payload = [
      `Nome: ${nome}`,
      `Telefone: ${formatPhone(telefone)}`,
      `Email: ${email}`,
      `Servico: ${servico}`,
      `Mensagem: ${mensagem}`
    ].join('\n');

    const url = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(payload)}`;
    const popup = window.open(url, '_blank', 'noopener,noreferrer');

    if (!popup) {
      setStatus(statusNode, 'Nao foi possivel abrir o WhatsApp automaticamente. Tente novamente.', 'error');
      return;
    }

    form.reset();
    setStatus(statusNode, 'Solicitacao preparada. Finalize o envio no WhatsApp aberto em nova aba.', 'success');
  });
}
