import { dailyInsights } from '../data/finance-topics.js';
import { openChatWithPrompt } from '../utils/chat-actions.js';

export function initDailyInsight() {
  const quoteEl = document.getElementById('daily-insight-quote');
  const referenceEl = document.getElementById('daily-insight-reference');
  const reflectionEl = document.getElementById('daily-insight-reflection');
  const btnExplore = document.getElementById('btn-open-daily-insight');

  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const insight = dailyInsights[dayOfYear % dailyInsights.length];

  if (quoteEl) quoteEl.textContent = `"${insight.quote}"`;
  if (referenceEl) referenceEl.textContent = `${insight.title} - ${insight.reference}`;
  if (reflectionEl) reflectionEl.textContent = `Acao: ${insight.reflection}`;

  if (btnExplore) {
    btnExplore.addEventListener('click', () => {
      openChatWithPrompt(`Insight do dia: ${insight.title}. Ideia central: ${insight.quote} ${insight.prompt}`);
    });
  }
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
