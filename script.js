// --- ESTADO GLOBAL ---
let currentProblemIndex = 0;
let currentStepStates = [];
let currentCombinedReaction = {};
let currentTargetReaction = {};
const tolerance = 0.01; // Tolerância para coeficientes e Delta H

// --- FUNÇÕES AUXILIARES DE FORMATAÇÃO ---

// Formata um coeficiente para exibição com destaque
function formatCoefficient(coeff) {
    const absCoeff = Math.abs(coeff);
    let displayCoeff = '';
    let className = 'coeff-highlight'; // Classe padrão para destaque

    if (Math.abs(absCoeff - 1) < tolerance) {
        return ''; // Coeficiente 1 não é mostrado
    } else if (Math.abs(absCoeff - 0.5) < tolerance) {
        displayCoeff = '&frac12;';
        className += ' fraction'; // Classe adicional para fração
    } else {
        const roundedCoeff = Number(coeff.toFixed(2));
        displayCoeff = Number.isInteger(roundedCoeff) ? roundedCoeff.toString() : roundedCoeff.toString();
    }
    // Retorna o span com o coeficiente formatado e a classe de destaque
    return `<span class="${className}">${displayCoeff}</span>`;
}

// Formata um lado da reação (reagentes ou produtos)
function formatSide(sideObject) {
    return Object.entries(sideObject)
        .map(([formula, coeff]) => {
            if (Math.abs(coeff) < tolerance) return '';
            const formattedFormula = formula
                .replace(/(\d+)/g, '<sub>$1</sub>')
                .replace(/\((\w)\)/g, '($1)');
            const displayCoeff = formatCoefficient(coeff);
            // Adiciona espaço fino para fração ou espaço normal para outros
            const space = displayCoeff.includes('fraction') ? '&thinsp;' : (displayCoeff ? ' ' : '');
            return `${displayCoeff}${space}${formattedFormula}`;
        })
        .filter(term => term !== '')
        .sort()
        .join(' + ');
}

// Formata uma reação completa como string HTML, com estrutura para alinhamento
function formatReactionToString(reactionObject) {
    const reactantsStr = formatSide(reactionObject.reactants);
    const productsStr = formatSide(reactionObject.products);
    // Estrutura com spans para flexbox tentar alinhar
    return `<span class="reaction-side">${reactantsStr || ' '}</span> <span class="reaction-arrow">&rarr;</span> <span class="reaction-side">${productsStr || ' '}</span>`;
}

 // Calcula o objeto de reação manipulado (APENAS reagentes e produtos)
 function getManipulatedStepReaction(state, originalData) {
    const manipulated = { reactants: {}, products: {} };
    const current = state.current;
    const factor = current.factor;
    const inverted = current.inverted;
    const sourceReactants = inverted ? originalData.products : originalData.reactants;
    const sourceProducts = inverted ? originalData.reactants : originalData.products;

    for (const formula in sourceReactants) {
        manipulated.reactants[formula] = (manipulated.reactants[formula] || 0) + sourceReactants[formula] * factor;
    }
    for (const formula in sourceProducts) {
        manipulated.products[formula] = (manipulated.products[formula] || 0) + sourceProducts[formula] * factor;
    }
    return manipulated;
}

// Calcula o Delta H manipulado
function getManipulatedStepDeltaH(state, originalData) {
     const displayFactor = state.current.factor * (state.current.inverted ? -1 : 1);
     return originalData.deltaH * displayFactor;
}

// --- FUNÇÕES DE RENDERIZAÇÃO ---

// Renderiza uma reação (intermediária, combinada ou alvo)
function renderReaction(renderData, containerId, isTarget = false, isCombined = false, stepState = null, originalData = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let reactionToDisplay = {};
    let currentDeltaH = null;
    let reactionHtml = '';
    let controlsHtml = '';

    // Define os dados da reação e Delta H a serem exibidos
    if (isTarget || isCombined) {
        reactionToDisplay = { reactants: renderData.reactants, products: renderData.products };
        currentDeltaH = renderData.deltaH;
    } else if (stepState && originalData) {
        reactionToDisplay = getManipulatedStepReaction(stepState, originalData);
        currentDeltaH = getManipulatedStepDeltaH(stepState, originalData);
    } else {
        console.error("Erro ao renderizar reação: dados insuficientes", containerId); container.innerHTML = 'Erro'; return;
    }

    // Formata a string da reação e do Delta H
    const reactionString = formatReactionToString(reactionToDisplay);
    const deltaHStr = currentDeltaH !== null ? currentDeltaH.toFixed(1) : '???';
    reactionHtml = `<div class="reaction-formula">${reactionString}</div>`;
    if (currentDeltaH !== null) {
        reactionHtml += `<div class="delta-h">&Delta;H = ${deltaHStr} kJ</div>`;
    }

    // Adiciona controles para reações intermediárias
    if (!isTarget && !isCombined && stepState && originalData) {
        const reactionId = stepState.id;
        const current = stepState.current;
        // Ícones Font Awesome
        const iconInvert = '<i class="fas fa-exchange-alt"></i>';
        const iconReset = '<i class="fas fa-undo"></i>';
        const iconMinus = '<i class="fas fa-minus"></i>';
        const iconPlus = '<i class="fas fa-plus"></i>';

        controlsHtml = `<div class="reaction-controls-area">`; // Nova div para área de controle
        controlsHtml += `<div class="controls">`; // Mantém a classe 'controls'
        controlsHtml += `<div class="btn-group" role="group" aria-label="Controles da Reação ${reactionId}">`;
        controlsHtml += `<button class="btn btn-sm btn-outline-primary" onclick="invertReaction('${reactionId}')">${iconInvert} Inverter</button>`;
        controlsHtml += `<div class="multiplier-controls input-group input-group-sm">
                            <button class="btn btn-sm btn-outline-secondary btn-multiplier" onclick="decreaseMultiplier('${reactionId}')">${iconMinus}</button>
                            <input type="number" step="0.5" min="0.5" value="${current.factor}" class="form-control form-control-sm" id="multiplier-${reactionId}" style="max-width: 70px;" aria-label="Fator de multiplicação" onchange="multiplyReactionWrapper('${reactionId}', this.value)">
                            <button class="btn btn-sm btn-outline-secondary btn-multiplier" onclick="increaseMultiplier('${reactionId}')">${iconPlus}</button>
                          </div>`;
        controlsHtml += `<button class="btn btn-sm btn-outline-danger" onclick="resetReaction('${reactionId}')">${iconReset} Resetar</button>`;
        controlsHtml += `</div>`; // fim btn-group
        const factorDisplay = formatCoefficient(current.factor) || '1'; // Mostra '1' se o coef for 1 (sem span)
        controlsHtml += `<div class="feedback">Estado: ${current.inverted ? 'Inv.' : 'Norm.'}, x ${factorDisplay.includes('span') ? factorDisplay : `<span class="coeff-highlight">1</span>`}</div>`; // Feedback usa span também
        controlsHtml += `</div>`; // fim controls
        controlsHtml += `</div>`; // fim reaction-controls-area
    }

    // Atualiza o HTML do container
    if (isTarget || isCombined) {
        if (isCombined && !Object.keys(reactionToDisplay.reactants).length && !Object.keys(reactionToDisplay.products).length) {
            container.innerHTML = `<div class="p-3 text-muted">Manipule as reações intermediárias...</div>`;
        } else {
            container.innerHTML = reactionHtml;
        }
        // A classe de cor da combinada é aplicada em calculateAndRenderCombined
    } else {
        // Reação intermediária - estrutura simplificada, controle abaixo
         container.innerHTML = reactionHtml + controlsHtml; // Concatena reação e controles
    }
}


// Renderiza todas as reações intermediárias
function renderStepReactions() {
    const container = document.getElementById('step-reactions');
    container.innerHTML = ''; // Limpa container
    const problemSteps = problems[currentProblemIndex].steps;

    if (currentStepStates.length !== problemSteps.length) {
        initializeStepStates();
    }

    currentStepStates.forEach(state => {
        const originalData = problemSteps.find(pStep => pStep.id === state.id)?.original;
        if (!originalData) { console.error(`Dados originais não encontrados para ${state.id}`); return; }

        const card = document.createElement('div');
        // Adiciona a nova classe para estilização específica
        card.className = 'reaction-card reaction-intermediate mb-3 p-3'; // Adiciona padding aqui
        card.id = state.id;
        container.appendChild(card);
        // Chama renderReaction que agora colocará os controles dentro do card
        renderReaction(null, state.id, false, false, state, originalData);
    });
}

 // Renderiza a reação alvo
 function renderTargetReaction() {
     renderReaction(currentTargetReaction, 'target-reaction', true);
 }

// --- FUNÇÕES DE CÁLCULO E VERIFICAÇÃO ---

// Compara duas reações (objetos com reactants/products)
function compareReactions(reactionA, reactionB) {
    const allFormulas = new Set([
        ...Object.keys(reactionA.reactants), ...Object.keys(reactionA.products),
        ...Object.keys(reactionB.reactants), ...Object.keys(reactionB.products)
    ]);

    for (const formula of allFormulas) {
        const coeffA_r = reactionA.reactants[formula] || 0;
        const coeffA_p = reactionA.products[formula] || 0;
        const coeffB_r = reactionB.reactants[formula] || 0;
        const coeffB_p = reactionB.products[formula] || 0;

        if (Math.abs(coeffA_r - coeffB_r) > tolerance || Math.abs(coeffA_p - coeffB_p) > tolerance) {
            return false;
        }
    }
    return true;
}

// Calcula e renderiza a reação combinada atual
 function calculateAndRenderCombined() {
    const combined = { reactants: {}, products: {}, deltaH: 0 };
    const problemSteps = problems[currentProblemIndex].steps;

    currentStepStates.forEach(state => {
        const originalData = problemSteps.find(pStep => pStep.id === state.id)?.original;
        if (!originalData) return;
        combined.deltaH += getManipulatedStepDeltaH(state, originalData);
        const stepReaction = getManipulatedStepReaction(state, originalData);
        for (const formula in stepReaction.reactants) {
            combined.reactants[formula] = (combined.reactants[formula] || 0) + stepReaction.reactants[formula];
        }
        for (const formula in stepReaction.products) {
            combined.products[formula] = (combined.products[formula] || 0) + stepReaction.products[formula];
        }
    });

    // Cancelamento
    const allFormulas = new Set([...Object.keys(combined.reactants), ...Object.keys(combined.products)]);
    allFormulas.forEach(formula => {
        const reactantCoeff = combined.reactants[formula] || 0;
        const productCoeff = combined.products[formula] || 0;
        if (reactantCoeff > tolerance / 2 && productCoeff > tolerance / 2) {
            const minCoeff = Math.min(reactantCoeff, productCoeff);
            combined.reactants[formula] -= minCoeff;
            combined.products[formula] -= minCoeff;
        }
    });

    // Limpeza de coeficientes zero
    for (const formula in combined.reactants) {
        if (Math.abs(combined.reactants[formula]) < tolerance) delete combined.reactants[formula];
    }
    for (const formula in combined.products) {
        if (Math.abs(combined.products[formula]) < tolerance) delete combined.products[formula];
    }

    // Atualiza estado global e renderiza
    currentCombinedReaction = combined;
    renderReaction(currentCombinedReaction, 'combined-reaction', false, true);

    // Aplica a classe de cor (verde/vermelho)
    const combinedContainer = document.getElementById('combined-reaction');
    const reactionMatch = compareReactions(currentCombinedReaction, currentTargetReaction);
    // Garante que a classe base esteja presente (definida no HTML agora, mas redundância não faz mal)
    combinedContainer.classList.add('reaction-combined-base');
    if (reactionMatch) {
        combinedContainer.classList.remove('reaction-combined-incorrect');
        combinedContainer.classList.add('reaction-combined-correct');
    } else {
        combinedContainer.classList.remove('reaction-combined-correct');
        combinedContainer.classList.add('reaction-combined-incorrect');
    }
}

// Verifica a resposta
function checkAnswer() {
    const feedbackEl = document.getElementById('problem-feedback');
    const checkBtn = document.getElementById('check-button');
    feedbackEl.innerHTML = '';

    const reactionMatch = compareReactions(currentCombinedReaction, currentTargetReaction);
    const deltaHMatch = Math.abs(currentCombinedReaction.deltaH - currentTargetReaction.deltaH) < tolerance * 10; // Tolerância maior para Delta H

    if (reactionMatch) {
        let feedbackMsg = `<div class="alert alert-success d-flex align-items-center" role="alert">
                             <i class="fas fa-check-circle fa-2x me-3"></i>
                             <div>
                               <strong>Correto!</strong> A reação combinada corresponde à reação alvo.`;
        if (!deltaHMatch) {
             feedbackMsg += `<br><small>(Atenção: O valor de &Delta;H calculado (${currentCombinedReaction.deltaH.toFixed(1)} kJ) está um pouco diferente do alvo (${currentTargetReaction.deltaH.toFixed(1)} kJ)).</small>`;
        }
        feedbackMsg += `</div></div>`;
        feedbackEl.innerHTML = feedbackMsg;

        checkBtn.disabled = true;
        disableManipulationButtons(true);
        generateSummary(); // Gera o resumo

        const nextBtn = document.getElementById('next-problem-button');
         if (currentProblemIndex >= problems.length - 1) {
             nextBtn.disabled = true;
             feedbackEl.innerHTML += `<div class="alert alert-info mt-2" role="alert"><i class="fas fa-trophy me-2"></i>Parabéns! Você completou todos os problemas!</div>`;
         } else {
            nextBtn.disabled = false;
         }
    } else {
        const combinedStr = formatReactionToString(currentCombinedReaction); // Usa a formatação atualizada
        const targetStr = formatReactionToString(currentTargetReaction);
        const errorMsg = `<div class="alert alert-danger d-flex align-items-center" role="alert">
                            <i class="fas fa-times-circle fa-2x me-3"></i>
                            <div>
                                <strong>Incorreto.</strong> A reação combinada atual não corresponde à reação alvo. Verifique suas manipulações.<br>
                                <small><b>Calculada:</b> ${combinedStr}<br><b>Alvo:</b> ${targetStr}</small><br>
                                <small><b>&Delta;H:</b> ${currentCombinedReaction.deltaH?.toFixed(1)} kJ (Alvo: ${currentTargetReaction.deltaH?.toFixed(1)} kJ)</small>
                            </div>
                          </div>`;
        feedbackEl.innerHTML = errorMsg;
    }
}

// Gera o resumo HTML
function generateSummary() {
    const feedbackEl = document.getElementById('problem-feedback');
    let summaryHtml = '<div class="summary-section"><h5>Resumo da Resolução:</h5>';
    const problemSteps = problems[currentProblemIndex].steps;

    currentStepStates.forEach(state => {
        const originalData = problemSteps.find(pStep => pStep.id === state.id)?.original;
        if (!originalData) return;

        const manipulatedStepReaction = getManipulatedStepReaction(state, originalData);
        const stepDeltaH = getManipulatedStepDeltaH(state, originalData);
        const reactionStr = formatReactionToString(manipulatedStepReaction); // Usa formatação atualizada

        let manipulationDesc = '';
        if (state.current.inverted) manipulationDesc += 'Invertida';
        // Usa formatCoefficient para pegar o span formatado ou o número
        const factorFormatted = formatCoefficient(state.current.factor);
        if (Math.abs(state.current.factor - 1) > tolerance) {
            if (manipulationDesc) manipulationDesc += ', ';
            // Se formatCoefficient retornou algo (span), usa. Senão, usa o número.
            manipulationDesc += `x ${factorFormatted || state.current.factor}`;
        }
        if (!manipulationDesc) manipulationDesc = '(Original)';

        summaryHtml += `<div class="summary-line">
                            <span class="summary-reaction">${reactionStr}</span>
                            <span class="summary-delta-h">&Delta;H = ${stepDeltaH.toFixed(1)} kJ</span>
                            <span class="summary-manipulation">${manipulationDesc}</span>
                        </div>`;
    });

    const targetReactionStr = formatReactionToString(currentTargetReaction);
     summaryHtml += `<div class="summary-line summary-target">
                        <span class="summary-reaction">${targetReactionStr}</span>
                        <span class="summary-delta-h">&Delta;H = ${currentTargetReaction.deltaH.toFixed(1)} kJ</span>
                        <span class="summary-manipulation">(Reação Alvo)</span>
                     </div>`;
    summaryHtml += '</div>';
    feedbackEl.innerHTML += summaryHtml; // Adiciona o resumo ao feedback existente
}


// --- FUNÇÕES DE MANIPULAÇÃO ---

// Função wrapper para lidar com a multiplicação (chamada pelo onchange do input)
// Renomeada para evitar conflito com nome de variável global potencial
window.multiplyReactionWrapper = function(id, factorStr) {
    const stepState = currentStepStates.find(s => s.id === id);
    if (!stepState) return;
    const factor = parseFloat(factorStr);

    if (isNaN(factor) || factor <= 0 || Math.abs(factor) < tolerance / 10) { // Verifica se não é zero ou negativo
         alert("Fator inválido. Use um número positivo maior que zero (ex: 0.5, 1, 2).");
         document.getElementById(`multiplier-${id}`).value = stepState.current.factor; // Restaura valor
         return;
    }

    stepState.current.factor = factor;
    const originalData = problems[currentProblemIndex].steps.find(pStep => pStep.id === id)?.original;
    renderReaction(null, id, false, false, stepState, originalData);
    calculateAndRenderCombined();
    clearFeedbackAndEnableCheck();
}

window.increaseMultiplier = function(id) {
    const input = document.getElementById(`multiplier-${id}`);
    const currentValue = parseFloat(input.value) || 1;
    const newValue = currentValue + 0.5;
    input.value = newValue;
    multiplyReactionWrapper(id, newValue.toString()); // Chama o wrapper
}

window.decreaseMultiplier = function(id) {
    const input = document.getElementById(`multiplier-${id}`);
    const currentValue = parseFloat(input.value) || 1;
    const newValue = Math.max(0.5, currentValue - 0.5); // Mínimo 0.5
    input.value = newValue;
    multiplyReactionWrapper(id, newValue.toString()); // Chama o wrapper
}

window.invertReaction = function(id) {
    const stepState = currentStepStates.find(s => s.id === id);
    if (!stepState) return;
    stepState.current.inverted = !stepState.current.inverted;

    const originalData = problems[currentProblemIndex].steps.find(pStep => pStep.id === id)?.original;
    renderReaction(null, id, false, false, stepState, originalData);
    calculateAndRenderCombined();
    clearFeedbackAndEnableCheck();
}

 window.resetReaction = function(id) {
    const stepState = currentStepStates.find(s => s.id === id);
    if (!stepState) return;
    stepState.current = { factor: 1, inverted: false };

    const inputElement = document.getElementById(`multiplier-${id}`);
    if (inputElement) inputElement.value = 1;

    const originalData = problems[currentProblemIndex].steps.find(pStep => pStep.id === id)?.original;
    renderReaction(null, id, false, false, stepState, originalData);
    calculateAndRenderCombined();
    clearFeedbackAndEnableCheck();
}

function disableManipulationButtons(disable = true) {
    currentStepStates.forEach(state => {
        const card = document.getElementById(state.id);
        if (card) {
            const buttons = card.querySelectorAll('.controls button, .controls input');
            buttons.forEach(btn => btn.disabled = disable);
        }
    });
}

// --- FUNÇÕES DE CONTROLE DO PROBLEMA ---

function initializeStepStates() {
     const problemSteps = problems[currentProblemIndex].steps;
     currentStepStates = problemSteps.map(step => ({
         id: step.id,
         current: { factor: 1, inverted: false }
     }));
}

function loadProblem(index) {
    if (index >= problems.length || index < 0) {
        index = index >= problems.length ? problems.length - 1 : 0;
    }
    currentProblemIndex = index;
    const problem = problems[currentProblemIndex];
    currentTargetReaction = problem.targetReaction;

    document.getElementById('problem-title').textContent = `Problema ${index + 1} de ${problems.length}: ${problem.description}`;

    initializeStepStates();
    renderTargetReaction();
    renderStepReactions();
    calculateAndRenderCombined(); // Calcula e RENDERIZA a combinada, aplicando a cor inicial
    clearFeedbackAndEnableCheck();

    const nextBtn = document.getElementById('next-problem-button');
    nextBtn.disabled = (currentProblemIndex >= problems.length - 1);

    disableManipulationButtons(false);
}

function clearFeedbackAndEnableCheck() {
    document.getElementById('problem-feedback').innerHTML = '';
    document.getElementById('check-button').disabled = false;
}

function resetCurrentProblem() {
     loadProblem(currentProblemIndex);
}

 function goToNextProblem() {
     if (currentProblemIndex < problems.length - 1) {
        loadProblem(currentProblemIndex + 1);
     }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona listeners aos botões principais (verifica se existem primeiro)
    const checkButton = document.getElementById('check-button');
    const nextButton = document.getElementById('next-problem-button');
    const resetButton = document.getElementById('reset-problem-button');

    if (checkButton) checkButton.addEventListener('click', checkAnswer);
    if (nextButton) nextButton.addEventListener('click', goToNextProblem);
    if (resetButton) resetButton.addEventListener('click', resetCurrentProblem);

    loadProblem(0); // Carrega o primeiro problema
});