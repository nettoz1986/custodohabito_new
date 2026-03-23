import { glossaryTerms } from '../data/finance-topics.js';

export function initStudyPanel() {
  const studyPanel = document.getElementById('study-panel');
  const btnTogglePanel = document.getElementById('btn-toggle-panel');
  const btnClosePanel = document.getElementById('btn-close-panel');
  const glossaryContent = document.getElementById('glossary-content');
  const notesContent = document.getElementById('study-notes-content');
  const appLayout = document.getElementById('app');

  if (window.innerWidth > 1024) {
    appLayout.classList.remove('panel-closed');
    studyPanel.classList.remove('hidden');
    studyPanel.classList.add('visible');
  } else {
    appLayout.classList.add('panel-closed');
    studyPanel.classList.add('hidden');
  }

  let panelBackdrop = document.querySelector('.panel-backdrop');
  if (!panelBackdrop) {
    panelBackdrop = document.createElement('div');
    panelBackdrop.className = 'panel-backdrop';
    document.body.appendChild(panelBackdrop);
  }

  const closePanel = () => {
    studyPanel.classList.add('hidden');
    studyPanel.classList.remove('visible');
    appLayout.classList.add('panel-closed');
    panelBackdrop.classList.remove('visible');
  };

  if (btnTogglePanel) {
    btnTogglePanel.addEventListener('click', () => {
      const isHidden = studyPanel.classList.contains('hidden');
      if (isHidden) {
        studyPanel.classList.remove('hidden');
        studyPanel.classList.add('visible');
        appLayout.classList.remove('panel-closed');
        if (window.innerWidth <= 1080) {
          panelBackdrop.classList.add('visible');
        }
      } else {
        closePanel();
      }
    });
  }

  if (btnClosePanel) btnClosePanel.addEventListener('click', closePanel);
  panelBackdrop.addEventListener('click', closePanel);

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
}
