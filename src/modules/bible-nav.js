import { getTopicsByCategory, topicCatalog } from '../data/finance-topics.js';
import { openChatWithPrompt } from '../utils/chat-actions.js';

export function initBibleNav() {
  const topicListEl = document.getElementById('topic-list');
  const tabs = document.querySelectorAll('.bible-tab');

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
      <div class="bible-book-card">
        <div class="bible-book-info">
          <span class="book-name">${topic.title}</span>
          <small style="color: var(--text-secondary);">${topic.level} • ${topic.time}</small>
          <p style="margin-top: 6px; color: var(--text-secondary); line-height: 1.45;">${topic.summary}</p>
        </div>
        <div class="bible-book-actions">
          <button class="book-action-btn read-btn" data-topic="${topic.id}" title="Abrir ${topic.title}">
            <i data-lucide="book-open"></i>
          </button>
          <button class="book-action-btn panorama-btn" data-prompt="${topic.actionPrompt}" title="Conversar sobre ${topic.title}">
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
        window.dispatchEvent(new CustomEvent('open-topic-reader', {
          detail: { topicId: btn.dataset.topic }
        }));
      });
    });

    topicListEl.querySelectorAll('.panorama-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        openChatWithPrompt(btn.dataset.prompt);
      });
    });
  }
}
