import { findTopicById, topicCatalog } from '../data/finance-topics.js';
import { openChatView, openChatWithPrompt } from '../utils/chat-actions.js';

export function initLearningReader() {
  window.addEventListener('open-topic-reader', (event) => {
    showReaderView(event.detail.topicId);
  });

  const firstTopic = topicCatalog[0]?.topics?.[0]?.id;
  if (firstTopic) {
    showReaderView(firstTopic);
  }
}

function showReaderView(topicId) {
  const topic = findTopicById(topicId);
  if (!topic) return;

  const container = document.getElementById('topic-reader-container');
  const chatTitle = document.getElementById('chat-title');
  const chatStatus = document.getElementById('chat-status');
  const viewChat = document.getElementById('view-chat');
  const viewReader = document.getElementById('view-topic-reader');
  const viewStudy = document.getElementById('view-study-hub');

  viewChat.classList.remove('active');
  viewChat.style.display = 'none';
  viewStudy.classList.remove('active');
  viewStudy.style.display = 'none';
  viewReader.classList.add('active');
  viewReader.style.display = 'flex';

  const learnBtn = document.querySelector('.nav-item[data-section="learn"]');
  document.querySelectorAll('.nav-item').forEach((btn) => btn.classList.remove('active'));
  if (learnBtn) learnBtn.classList.add('active');

  if (chatTitle) chatTitle.textContent = topic.title;
  if (chatStatus) chatStatus.innerHTML = `<span class="status-dot"></span> ${topic.categoryLabel} - ${topic.level} - ${topic.time}`;

  container.innerHTML = `
    <article class="learning-reader bible-reader" id="learning-reader">
      <div class="reader-hero">
        <div class="reader-hero-copy">
          <span class="reader-book-badge">${topic.categoryLabel}</span>
          <h2>${topic.title}</h2>
          <p class="reader-summary">${topic.summary}</p>
          <div class="reader-meta-grid">
            <div class="reader-meta-card">
              <span class="reader-meta-label">Nivel</span>
              <strong>${topic.level}</strong>
            </div>
            <div class="reader-meta-card">
              <span class="reader-meta-label">Tempo</span>
              <strong>${topic.time}</strong>
            </div>
            <div class="reader-meta-card">
              <span class="reader-meta-label">Foco</span>
              <strong>${topic.categoryLabel}</strong>
            </div>
          </div>
        </div>
        <div class="reader-actions">
          <button class="reader-study-btn" id="reader-ask-ai">
            <i data-lucide="sparkles"></i>
            Levar para o agente
          </button>
          <button class="reader-back-btn" id="reader-back">
            <i data-lucide="arrow-left"></i>
            Voltar ao agente
          </button>
        </div>
      </div>

      <div class="reader-body">
        <div class="reader-section-intro">
          <span class="reader-section-kicker">Leitura guiada</span>
          <h3>Como esse tema conversa com a vida financeira real</h3>
          <p>Em vez de so apresentar conceito, esta area organiza o assunto em contexto, padrao, impacto e aplicacao pratica.</p>
        </div>

        <div class="reader-sections-grid">
        ${topic.sections.map((section) => `
          <section class="reader-section-card">
            <span class="reader-section-chip">${topic.categoryLabel}</span>
            <h3>${section.title}</h3>
            <p>${section.body}</p>
          </section>
        `).join('')}
        </div>

        <div class="reader-bridge-card">
          <div>
            <span class="reader-section-kicker">Conectar com o agente</span>
            <h3>Transforme essa leitura em conversa aplicada</h3>
            <p>Se esse tema toca sua realidade agora, leve o contexto para o agente e peca uma leitura pratica da sua situacao.</p>
          </div>
          <button class="reader-study-btn" id="reader-ask-ai-bottom">
            <i data-lucide="message-circle-more"></i>
            Conversar sobre este tema
          </button>
        </div>
      </div>
    </article>
  `;

  const studyPrompt = `Tema de estudo: ${topic.title}. Categoria: ${topic.categoryLabel}. Resumo: ${topic.summary} ${topic.actionPrompt}`;

  container.querySelector('#reader-ask-ai')?.addEventListener('click', () => {
    openChatWithPrompt(studyPrompt);
  });

  container.querySelector('#reader-ask-ai-bottom')?.addEventListener('click', () => {
    openChatWithPrompt(studyPrompt);
  });

  container.querySelector('#reader-back')?.addEventListener('click', () => {
    openChatView();
  });

  if (window.lucide) window.lucide.createIcons();
}
