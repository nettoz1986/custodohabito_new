import { dailyInsights } from '../data/finance-topics.js';
import { openChatWithPrompt } from '../utils/chat-actions.js';

export function initDevotional() {
  const quoteEl = document.getElementById('devotional-verse');
  const referenceEl = document.getElementById('devotional-reference');
  const reflectionEl = document.getElementById('devotional-reflection');
  const btnExplore = document.getElementById('btn-study-devotional');

  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const insight = dailyInsights[dayOfYear % dailyInsights.length];

  if (quoteEl) quoteEl.textContent = `"${insight.quote}"`;
  if (referenceEl) referenceEl.textContent = `${insight.title} — ${insight.reference}`;
  if (reflectionEl) reflectionEl.textContent = `Ação: ${insight.reflection}`;

  if (btnExplore) {
    btnExplore.addEventListener('click', () => {
      openChatWithPrompt(insight.prompt);
    });
  }
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
