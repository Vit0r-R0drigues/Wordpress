function asNumber(value) {
  const normalized = String(value).replace(',', '.').trim();
  return Number(normalized);
}

function setResult(node, message, isError = false) {
  if (!node) return;
  node.textContent = message;
  node.classList.toggle('error', isError);
}

export function initCalculators() {
  const imcForm = document.querySelector('[data-imc-form]');
  const imcResult = document.querySelector('[data-imc-result]');

  if (imcForm) {
    imcForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const peso = asNumber(imcForm.elements.peso.value);
      const alturaCm = asNumber(imcForm.elements.altura.value);

      if (peso <= 0 || alturaCm <= 0 || Number.isNaN(peso) || Number.isNaN(alturaCm)) {
        setResult(imcResult, 'Informe peso e altura validos.', true);
        return;
      }

      const alturaM = alturaCm / 100;
      const imc = peso / (alturaM * alturaM);
      let faixa = 'Peso adequado';

      if (imc < 18.5) faixa = 'Abaixo do peso';
      else if (imc >= 25 && imc < 30) faixa = 'Sobrepeso';
      else if (imc >= 30) faixa = 'Obesidade';

      setResult(imcResult, `IMC estimado: ${imc.toFixed(1)} (${faixa}).`);
    });
  }

  const hydrationForm = document.querySelector('[data-hidratacao-form]');
  const hydrationResult = document.querySelector('[data-hidratacao-result]');

  if (hydrationForm) {
    hydrationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const peso = asNumber(hydrationForm.elements.peso.value);
      const fator = asNumber(hydrationForm.elements.fator.value);

      if (peso <= 0 || fator <= 0 || Number.isNaN(peso) || Number.isNaN(fator)) {
        setResult(hydrationResult, 'Informe valores validos.', true);
        return;
      }

      const totalMl = peso * fator;
      const totalLitros = totalMl / 1000;

      setResult(hydrationResult, `Ingestao diaria estimada: ${totalLitros.toFixed(2)} litros de agua.`);
    });
  }
}
