import { financeTools, learningTracks, userProfiles } from '../data/finance-topics.js';
import { openChatWithPrompt } from '../utils/chat-actions.js';

export function initStudyHub() {
  const container = document.getElementById('study-hub-container');
  if (!container) return;

  renderHub();

  function renderHub() {
    container.innerHTML = `
      <div class="study-hub-header">
        <div class="study-hub-icon">
          <i data-lucide="target"></i>
        </div>
        <h2>Planejamento financeiro guiado</h2>
        <p>Escolha uma trilha, ferramenta ou nivel de profundidade para transformar aprendizado em pratica.</p>
      </div>

      <div class="study-cards-grid">
        ${learningTracks.map((track) => `
          <button class="study-card" data-prompt="Trilha: ${track.title}. Duracao: ${track.duration}. Contexto: ${track.description} ${track.prompt}">
            <div class="study-card-icon"><i data-lucide="map"></i></div>
            <div class="study-card-info">
              <h3>${track.title}</h3>
              <p>${track.description}</p>
              <small>${track.duration}</small>
            </div>
          </button>
        `).join('')}

        ${financeTools.map((tool) => `
          <button class="study-card" data-prompt="Ferramenta: ${tool.title}. Contexto: ${tool.description} Me ajude de forma aplicada, com perguntas curtas e proximo passo objetivo.">
            <div class="study-card-icon"><i data-lucide="calculator"></i></div>
            <div class="study-card-info">
              <h3>${tool.title}</h3>
              <p>${tool.description}</p>
              <small>Ferramenta assistida</small>
            </div>
          </button>
        `).join('')}
      </div>

      <div class="study-subview-header" style="margin-top: 36px;">
        <i data-lucide="users"></i>
        <h2>Perfis de profundidade</h2>
      </div>
      <div class="study-cards-grid">
        ${userProfiles.map((profile) => `
          <button class="study-card" data-prompt="Perfil de profundidade: ${profile.title}. Contexto: ${profile.description} Explique educacao financeira nesse nivel e monte proximos passos praticos.">
            <div class="study-card-icon"><i data-lucide="layers-3"></i></div>
            <div class="study-card-info">
              <h3>${profile.title}</h3>
              <p>${profile.description}</p>
            </div>
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.study-card').forEach((card) => {
      card.addEventListener('click', () => {
        openChatWithPrompt(card.dataset.prompt);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
}
