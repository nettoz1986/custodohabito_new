import { diagnosticProfileImages, diagnosticProfiles, diagnosticQuestions } from '../data/diagnostic-data.js';
import { openChatWithPrompt } from '../utils/chat-actions.js';

export function initDiagnostic() {
  const container = document.getElementById('diagnostic-container');
  if (!container) return;

  let currentQuestion = 0;
  let scores = resetScores();

  renderStart();

  function renderStart() {
    container.innerHTML = `
      <div class="diagnostic-shell">
        <div class="diagnostic-hero">
          <img src="/public/assets/logo_custodohabito.jpg" alt="Logo Custo do Hábito" class="diagnostic-logo" />
          <div>
            <span class="diagnostic-kicker">Diagnóstico de hábito</span>
            <h2>Qual personagem financeiro mora em você?</h2>
            <p>Dez escolhas do cotidiano para revelar seu padrão de hábito sem moralismo e sem culpa.</p>
          </div>
        </div>

        <div class="diagnostic-profiles">
          ${Object.entries(diagnosticProfiles).map(([key, profile]) => `
            <article class="diagnostic-profile-card">
              <img src="${diagnosticProfileImages[key]}" alt="${profile.name}" />
              <h3>${profile.name}</h3>
              <p>${profile.reading}</p>
            </article>
          `).join('')}
        </div>

        <div class="diagnostic-actions">
          <button class="btn-primary" id="diagnostic-start-btn">
            <i data-lucide="play"></i>
            Começar diagnóstico
          </button>
        </div>
      </div>
    `;

    container.querySelector('#diagnostic-start-btn')?.addEventListener('click', () => {
      currentQuestion = 0;
      scores = resetScores();
      renderQuestion();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function renderQuestion() {
    const question = diagnosticQuestions[currentQuestion];
    const progress = ((currentQuestion) / diagnosticQuestions.length) * 100;

    container.innerHTML = `
      <div class="diagnostic-shell">
        <div class="progress-container"><div id="progress-bar" style="width:${progress}%"></div></div>
        <div class="diagnostic-question-card">
          <span class="diagnostic-kicker">Pergunta ${currentQuestion + 1} de ${diagnosticQuestions.length}</span>
          <h3>${question.q}</h3>
          <div class="diagnostic-options">
            ${question.options.map((option, index) => `
              <button class="diagnostic-option" data-profile="${option.p}" data-index="${index}">
                ${option.t}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.diagnostic-option').forEach((button) => {
      button.addEventListener('click', () => {
        scores[button.dataset.profile] += 1;
        currentQuestion += 1;

        if (currentQuestion < diagnosticQuestions.length) {
          renderQuestion();
        } else {
          renderResult();
        }
      });
    });
  }

  function renderResult() {
    const winner = Object.keys(scores).reduce((best, current) => (
      scores[current] > scores[best] ? current : best
    ));

    const profile = diagnosticProfiles[winner];

    container.innerHTML = `
      <div class="diagnostic-shell">
        <div class="diagnostic-result">
          <img src="${diagnosticProfileImages[winner]}" alt="${profile.name}" class="diagnostic-result-image" />
          <span class="badge">Perfil predominante</span>
          <h2 class="diagnostic-result-name">${profile.name}</h2>
          <p class="diagnostic-result-reading">${profile.reading}</p>

          <div class="report-section strength">
            <div class="report-section-label">Sua principal força</div>
            <p>${profile.strength}</p>
          </div>
          <div class="report-section warning">
            <div class="report-section-label">Ponto de atenção</div>
            <p>${profile.warning}</p>
          </div>
          <div class="report-section action">
            <div class="report-section-label">Mini conselho</div>
            <p>${profile.counsel}</p>
          </div>

          <div class="diagnostic-actions">
            <button class="btn-primary" id="diagnostic-agent-btn">
              <i data-lucide="sparkles"></i>
              Levar este perfil para o agente
            </button>
            <button class="btn-secondary" id="diagnostic-restart-btn">
              Refazer teste
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#diagnostic-agent-btn')?.addEventListener('click', () => {
      openChatWithPrompt(profile.agentPrompt);
    });

    container.querySelector('#diagnostic-restart-btn')?.addEventListener('click', renderStart);

    if (window.lucide) window.lucide.createIcons();
  }
}

function resetScores() {
  return { lia: 0, heitor: 0, bia: 0, valen: 0 };
}
