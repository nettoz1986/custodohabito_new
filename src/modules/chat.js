/**
 * chat.js
 * Módulo do Chat — Interface conversacional principal.
 * Gerencia envio/recebimento de mensagens, renderização e auto-scroll.
 */

import { AIService } from '../services/ai-service.js';
import { parseMarkdown } from '../utils/markdown.js';

/**
 * Inicializa o módulo de chat.
 * Conecta eventos de UI e gerencia a comunicação com o serviço de IA.
 */
export function initChat() {
    // Elementos do DOM
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const welcomeScreen = document.getElementById('welcome-screen');
    const btnNewChat = document.getElementById('btn-new-chat');

    // Instância do serviço de IA
    const aiService = new AIService();

    // Flag para saber se o chat já foi iniciado
    let chatStarted = false;
    // Flag para evitar envio duplo de mensagens
    let isSending = false;

    // ---- Ajuste automático da altura do textarea ----
    chatInput.addEventListener('input', () => {
        // Resetar altura para calcular corretamente
        chatInput.style.height = 'auto';
        // Ajustar até o max-height definido no CSS
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';

        // Habilitar/desabilitar botão de envio
        btnSend.disabled = chatInput.value.trim() === '';
    });

    // ---- Enviar com Enter (Shift+Enter para nova linha) ----
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!btnSend.disabled && !isSending) {
                sendMessage();
            }
        }
    });

    // ---- Clique no botão de envio ----
    btnSend.addEventListener('click', () => {
        if (!isSending) {
            sendMessage();
        }
    });

    // ---- Botão "Nova Conversa" ----
    btnNewChat.addEventListener('click', () => {
        // Fechar a sidebar no mobile/tablet
        if (window.innerWidth <= 1024) {
            const sidebar = document.getElementById('sidebar');
            const sidebarBackdrop = document.querySelector('.sidebar-backdrop');
            if (sidebar) sidebar.classList.remove('visible');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('visible');
        }

        // Limpar histórico
        aiService.clearHistory();
        chatStarted = false;

        // Remover todas as mensagens
        const messages = chatMessages.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());

        // Mostrar boas-vindas novamente
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
        }

        // Limpar e focar no input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        btnSend.disabled = true;
        chatInput.focus();
    });

    // ---- Cards de boas-vindas (clique para enviar prompt sugerido) ----
    const welcomeCards = document.querySelectorAll('.welcome-card');
    welcomeCards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.dataset.prompt;
            if (prompt) {
                chatInput.value = prompt;
                btnSend.disabled = false;
                sendMessage();
            }
        });
    });

    // ---- Botões de atalho rápido na sidebar ----
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            if (prompt) {
                // Fechar sidebar no mobile/tablet ao clicar no atalho
                if (window.innerWidth <= 1024) {
                    const sidebar = document.getElementById('sidebar');
                    const sidebarBackdrop = document.querySelector('.sidebar-backdrop');
                    if (sidebar) sidebar.classList.remove('visible');
                    if (sidebarBackdrop) sidebarBackdrop.classList.remove('visible');
                }

                chatInput.value = prompt;
                btnSend.disabled = false;
                sendMessage();
            }
        });
    });

    /**
     * Envia a mensagem do usuário e obtém resposta do assistente.
     */
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || isSending) return;

        isSending = true;

        // Esconder boas-vindas na primeira mensagem
        if (!chatStarted && welcomeScreen) {
            welcomeScreen.style.display = 'none';
            chatStarted = true;
        }

        // Renderizar mensagem do usuário
        appendMessage('user', text);

        // Limpar input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        btnSend.disabled = true;

        // Mostrar indicador de carregamento
        const typingEl = showTypingIndicator();

        try {
            // Chamar serviço de IA
            const response = await aiService.sendMessage(text);

            // Remover indicador de carregamento
            typingEl.remove();

            // Renderizar resposta do assistente
            appendMessage('assistant', response);

            // Disparar evento para que outros módulos possam reagir
            window.dispatchEvent(new CustomEvent('assistant-response', {
                detail: { question: text, answer: response }
            }));
        } catch (error) {
            typingEl.remove();
            appendMessage('assistant', '❌ Desculpe, houve um erro ao processar sua pergunta. Tente novamente.');
            console.error('Erro no chat:', error);
        }

        isSending = false;
        chatInput.focus();
    }

    /**
     * Adiciona uma mensagem ao chat.
     * @param {string} role - 'user' ou 'assistant'
     * @param {string} text - Conteúdo da mensagem
     */
    function appendMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        // Avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        // Ícone do avatar: livro para assistente, usuário para humano
        const iconName = role === 'assistant' ? 'book-open-text' : 'user';
        avatarDiv.innerHTML = `<i data-lucide="${iconName}"></i>`;

        // Bolha de conteúdo
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';

        if (role === 'assistant') {
            // Converter Markdown para HTML nas respostas do assistente
            bubbleDiv.innerHTML = parseMarkdown(text);
        } else {
            // Mensagem do usuário — texto puro com quebras de linha
            bubbleDiv.textContent = text;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(messageDiv);

        // Re-inicializar ícones Lucide para os novos elementos
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Auto-scroll suave para a última mensagem
        scrollToBottom();
    }

    /**
     * Exibe o indicador de "digitando..." do assistente.
     * @returns {HTMLElement} Elemento do indicador (para remoção posterior)
     */
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';

        typingDiv.innerHTML = `
      <div class="message-avatar">
        <i data-lucide="book-open-text"></i>
      </div>
      <div class="message-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;

        chatMessages.appendChild(typingDiv);

        // Re-inicializar ícones
        if (window.lucide) {
            window.lucide.createIcons();
        }

        scrollToBottom();
        return typingDiv;
    }

    /**
     * Rola o chat suavemente para baixo.
     */
    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    // ---- Retornar referência ao serviço de IA (para configurações) ----
    return { aiService };
}
