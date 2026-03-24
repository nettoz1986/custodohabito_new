import { glossaryTerms } from '../data/finance-topics.js';

export function initStudyPanel() {
  const glossaryContent = document.getElementById('glossary-content');
  const notesContent = document.getElementById('study-notes-content');

  renderGlossary();

  window.addEventListener('assistant-response', (event) => {
    const { question, answer } = event.detail;
    addInsight(question, answer);
  });

  function renderGlossary() {
    if (!glossaryContent) return;

    glossaryContent.innerHTML = glossaryTerms
      .map((item) => `
        <div class="glossary-item">
          <div class="glossary-term">${item.term}</div>
          <div class="glossary-def">${item.definition}</div>
        </div>
      `)
      .join('');
  }

  function addInsight(question, answer) {
    if (!notesContent) return;

    const emptyState = notesContent.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const cleanAnswer = answer.replace(/[#*_`>|]/g, '').trim();
    const summary = cleanAnswer.slice(0, 140) + (cleanAnswer.length > 140 ? '...' : '');

    const noteEl = document.createElement('div');
    noteEl.className = 'glossary-item';
    noteEl.innerHTML = `
      <div class="glossary-term">${truncate(question, 54)}</div>
      <div class="glossary-def">${summary}</div>
    `;

    notesContent.insertBefore(noteEl, notesContent.firstChild);

    const notes = notesContent.querySelectorAll('.glossary-item');
    if (notes.length > 10) {
      notes[notes.length - 1].remove();
    }
  }

  function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  }

  return {
    focusPanel() {
      document.getElementById('study-panel')?.focus?.();
    }
  };
}
