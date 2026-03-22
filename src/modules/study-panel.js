/**
 * study-panel.js
 * Módulo do Painel de Estudo — Exibe glossário, notas contextuais
 * e gerencia visibilidade do painel lateral direito.
 */

import { glossaryTerms } from '../data/bible-books.js';

/**
 * Inicializa o módulo do painel de estudo.
 * Preenche glossário e configura listeners para notas contextuais.
 */
export function initStudyPanel() {
    const studyPanel = document.getElementById('study-panel');
    const btnTogglePanel = document.getElementById('btn-toggle-panel');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const glossaryContent = document.getElementById('glossary-content');
    const studyNotesContent = document.getElementById('study-notes-content');
    const appLayout = document.getElementById('app');

    // Iniciar painel lateral aberto se for PC, caso contrário fechado para mobile/tablet
    if (window.innerWidth > 1024) {
        appLayout.classList.remove('panel-closed');
        studyPanel.classList.remove('hidden');
        studyPanel.classList.add('visible');
    } else {
        appLayout.classList.add('panel-closed');
        studyPanel.classList.add('hidden');
    }

    // Criar backdrop para mobile
    let panelBackdrop = document.querySelector('.panel-backdrop');
    if (!panelBackdrop) {
        panelBackdrop = document.createElement('div');
        panelBackdrop.className = 'panel-backdrop';
        document.body.appendChild(panelBackdrop);
    }

    // ---- Renderizar glossário ----
    renderGlossary();

    // ---- Toggle do painel lateral ----
    if (btnTogglePanel) {
        btnTogglePanel.addEventListener('click', () => {
            const isHidden = studyPanel.classList.contains('hidden');
            if (isHidden) {
                studyPanel.classList.remove('hidden');
                studyPanel.classList.add('visible');
                appLayout.classList.remove('panel-closed');
                // Backdrop apenas aparece se for telainha menor que desktop (abaixo de 1080px vai depender de css pra backdrop display block)
                if (window.innerWidth <= 1080) {
                    panelBackdrop.classList.add('visible');
                }
            } else {
                closeSidebarPanel();
            }
        });
    }

    function closeSidebarPanel() {
        studyPanel.classList.add('hidden');
        studyPanel.classList.remove('visible');
        appLayout.classList.add('panel-closed');
        if (panelBackdrop) panelBackdrop.classList.remove('visible');
    }

    // ---- Fechar painel ----
    if (btnClosePanel) {
        btnClosePanel.addEventListener('click', closeSidebarPanel);
    }

    // ---- Fechar painel ao clicar fora em overlay (Mobile/Tablet) ----
    if (panelBackdrop) {
        panelBackdrop.addEventListener('click', closeSidebarPanel);
    }

    // ---- Escutar respostas do assistente para gerar notas contextuais ----
    window.addEventListener('assistant-response', (e) => {
        const { question, answer } = e.detail;
        addStudyNote(question, answer);
    });

    /**
     * Renderiza os termos do glossário no painel.
     */
    function renderGlossary() {
        if (!glossaryContent) return;

        let html = '';
        glossaryTerms.forEach(item => {
            html += `
        <div class="glossary-item">
          <div class="glossary-term">${item.term}</div>
          <div class="glossary-def">${item.definition}</div>
        </div>
      `;
        });

        glossaryContent.innerHTML = html;
    }

    /**
     * Adiciona uma nota de estudo baseada na pergunta e resposta do chat.
     * @param {string} question - Pergunta do usuário
     * @param {string} answer - Resposta do assistente
     */
    function addStudyNote(question, answer) {
        if (!studyNotesContent) return;

        // Remover estado vazio se existir
        const emptyState = studyNotesContent.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // Extrair um resumo curto da resposta (primeiros 100 caracteres significativos)
        const cleanAnswer = answer.replace(/[#*_`>|]/g, '').trim();
        const summary = cleanAnswer.substring(0, 120) + (cleanAnswer.length > 120 ? '...' : '');

        // Criar nota
        const noteEl = document.createElement('div');
        noteEl.className = 'glossary-item';
        noteEl.innerHTML = `
      <div class="glossary-term">${truncate(question, 50)}</div>
      <div class="glossary-def">${summary}</div>
    `;

        // Inserir no topo
        studyNotesContent.insertBefore(noteEl, studyNotesContent.firstChild);

        // Limitar a 10 notas
        const notes = studyNotesContent.querySelectorAll('.glossary-item');
        if (notes.length > 10) {
            notes[notes.length - 1].remove();
        }
    }

    /**
     * Trunca texto longo e adiciona reticências.
     * @param {string} text - Texto original
     * @param {number} maxLength - Comprimento máximo
     * @returns {string} Texto truncado
     */
    function truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}
