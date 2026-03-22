/**
 * devotional.js
 * Módulo do Devocional Diário — Exibe versículo do dia
 * no painel lateral, selecionado com base na data atual.
 */

import { devotionalVerses } from '../data/bible-books.js';

/**
 * Inicializa o módulo devocional.
 * Seleciona o versículo do dia com base na data e preenche o card.
 */
export function initDevotional() {
    const verseEl = document.getElementById('devotional-verse');
    const referenceEl = document.getElementById('devotional-reference');
    const reflectionEl = document.getElementById('devotional-reflection');
    const btnStudy = document.getElementById('btn-study-devotional');

    // Selecionar versículo baseado no dia do ano
    // (garante que troca a cada dia e é consistente no mesmo dia)
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const verseIndex = dayOfYear % devotionalVerses.length;
    const todayVerse = devotionalVerses[verseIndex];

    // Preencher o card
    if (verseEl && todayVerse) {
        verseEl.textContent = `"${todayVerse.text}"`;
        referenceEl.textContent = `— ${todayVerse.reference} (NVT)`;
        reflectionEl.textContent = `💡 ${todayVerse.reflection}`;
    }

    // Botão "Estudar este versículo" — envia para o chat
    if (btnStudy && todayVerse) {
        btnStudy.addEventListener('click', () => {
            const chatInput = document.getElementById('chat-input');
            const btnSend = document.getElementById('btn-send');

            if (chatInput) {
                chatInput.value = `Explique ${todayVerse.reference} de forma prática para minha vida hoje.`;
                btnSend.disabled = false;
                // Simular clique no envio
                btnSend.click();
            }
        });
    }
}

/**
 * Calcula o dia do ano (1-366) para uma data.
 * @param {Date} date - Data para calcular
 * @returns {number} Dia do ano
 */
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}
