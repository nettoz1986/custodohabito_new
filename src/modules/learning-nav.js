import { getTopicsByCategory, topicCatalog } from '../data/finance-topics.js';
import { openChatWithPrompt, openTopicView } from '../utils/chat-actions.js';

export function initLearningNav() {
  const topicListEl = document.getElementById('topic-list');
  const tabs = document.querySelectorAll('.learning-tab');

  if (!topicListEl || !tabs.length) return;

  let currentCategory = topicCatalog[0]?.id || 'fundamentos';
  renderCategory(currentCategory);

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderCategory(currentCategory);
    });
  });

  function renderCategory(categoryId) {
    const topics = getTopicsByCategory(categoryId);

    topicListEl.innerHTML = topics.map((topic) => `
      <div class="learning-topic-card bible-book-card">
        <div class="learning-topic-info bible-book-info">
          <span class="book-name">${topic.title}</span>
          <small style="color: var(--text-secondary);">${topic.level} - ${topic.time}</small>
          <p style="margin-top: 6px; color: var(--text-secondary); line-height: 1.45;">${topic.summary}</p>
        </div>
        <div class="learning-topic-actions bible-book-actions">
          <button class="book-action-btn read-btn" data-topic="${topic.id}" title="Abrir ${topic.title}" aria-label="Abrir tema ${topic.title}">
            <i data-lucide="book-open"></i>
          </button>
          <button class="book-action-btn panorama-btn" data-prompt="Tema de estudo: ${topic.title}. Resumo: ${topic.summary} ${topic.actionPrompt}" title="Levar ${topic.title} para o agente" aria-label="Levar tema ${topic.title} para o agente">
            <i data-lucide="message-circle-more"></i>
          </button>
        </div>
      </div>
    `).join('');

    bindEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    topicListEl.querySelectorAll('.read-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        openTopicView(btn.dataset.topic);
      });
    });

    topicListEl.querySelectorAll('.panorama-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        openChatWithPrompt(btn.dataset.prompt);
      });
    });
  }
}
