/**
 * bible-nav.js
 * Módulo de Navegação Bíblica — Exibe livros do AT/NT na sidebar
 * organizados por categoria, com opções de "Ler" e "Panorama".
 */

import { oldTestament, newTestament, deuterocanonicalBooks } from '../data/bible-books.js';

/**
 * Inicializa o módulo de navegação bíblica.
 * Renderiza lista de livros e gerencia abas AT/NT/Apócrifos.
 */
export function initBibleNav() {
    const booksListEl = document.getElementById('bible-books-list');
    const bibleTabs = document.querySelectorAll('.bible-tab');

    // Renderizar AT por padrão
    renderBooks('AT');

    // ---- Trocar entre abas AT/NT/DC ----
    bibleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Atualizar estado ativo
            bibleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Renderizar livros do testamento selecionado
            const testament = tab.dataset.testament;
            renderBooks(testament);
        });
    });

    /**
     * Renderiza a lista de livros organizada por categoria.
     * Cada livro tem botões "Ler" e "Panorama".
     * @param {string} testament - 'AT', 'NT' ou 'DC'
     */
    function renderBooks(testament) {
        let books;
        switch (testament) {
            case 'NT': books = newTestament; break;
            case 'DC': books = deuterocanonicalBooks; break;
            default: books = oldTestament; break;
        }
        let html = '';
        let currentCategory = '';

        books.forEach(book => {
            // Adicionar cabeçalho de categoria quando muda
            if (book.category !== currentCategory) {
                currentCategory = book.category;
                html += `<div class="bible-category">${currentCategory}</div>`;
            }

            // Card do livro com botões de ação
            html += `
        <div class="bible-book-card">
          <div class="bible-book-info">
            <span class="book-abbr">${book.abbr}</span>
            <div class="book-details">
              <span class="book-name">${book.name}</span>
              <span class="book-chapters-count">${book.chapters} capítulo${book.chapters > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="bible-book-actions">
            <button class="book-action-btn read-btn" data-book="${book.name}" data-chapters="${book.chapters}" title="Ler ${book.name}">
              <i data-lucide="book-open"></i>
              <span>Ler</span>
            </button>
            <button class="book-action-btn panorama-btn" data-book="${book.name}" title="Panorama de ${book.name}">
              <i data-lucide="scan"></i>
              <span>Panorama</span>
            </button>
          </div>
        </div>
      `;
        });

        booksListEl.innerHTML = html;

        // Inicializar ícones Lucide nos novos elementos
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // ---- Eventos: Botão "Ler" — abre o leitor bíblico ----
        const readBtns = booksListEl.querySelectorAll('.read-btn');
        readBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const bookName = btn.dataset.book;
                const chapters = parseInt(btn.dataset.chapters);

                // Disparar evento para o bible-reader
                window.dispatchEvent(new CustomEvent('open-bible-reader', {
                    detail: { bookName, chapters }
                }));

                // Fechar sidebar em mobile
                closeMobileSidebar();
            });
        });

        // ---- Eventos: Botão "Panorama" — envia para o chat ----
        const panoramaBtns = booksListEl.querySelectorAll('.panorama-btn');
        panoramaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const bookName = btn.dataset.book;
                const chatInput = document.getElementById('chat-input');
                const btnSend = document.getElementById('btn-send');

                if (chatInput) {
                    chatInput.value = `Me dê um resumo panorâmico do livro de ${bookName}.`;
                    btnSend.disabled = false;
                    btnSend.click();
                }

                // Fechar sidebar em mobile
                closeMobileSidebar();
            });
        });
    }

    /**
     * Fecha a sidebar em dispositivos mobile.
     */
    function closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 1024 && sidebar) {
            sidebar.classList.remove('visible');
            const backdrop = document.querySelector('.sidebar-backdrop');
            if (backdrop) backdrop.classList.remove('visible');
        }
    }
}
