/**
 * main.js
 * Ponto de entrada principal do WebApp Bíblico — Logos.
 * Inicializa todos os módulos e gerencia a navegação/layout global.
 */

import '../style.css';
import { initChat } from './modules/chat.js';
import { initDevotional } from './modules/devotional.js';
import { initBibleNav } from './modules/bible-nav.js';
import { initBibleReader } from './modules/bible-reader.js';
import { initStudyPanel } from './modules/study-panel.js';
import { initStudyHub } from './modules/study-hub.js';

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar ícones Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // ---- Inicializar módulos ----
    const chatModule = initChat();       // Retorna { aiService }
    initDevotional();                    // Versículo do dia
    initBibleNav();                      // Navegação por livros
    initBibleReader();                   // Leitor bíblico
    initStudyPanel();                    // Painel de estudo
    initStudyHub();                      // Hub de Estudos Central

    // ============================================
    // NAVEGAÇÃO DA SIDEBAR
    // ============================================
    const navItems = document.querySelectorAll('.nav-item');
    const bibleNavPanel = document.getElementById('bible-nav-panel');
    const quickActions = document.getElementById('quick-actions');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Atualizar estado ativo
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const section = item.dataset.section;

            // Atualizar visibilidade das main-views
            const viewChat = document.getElementById('view-chat');
            const viewBible = document.getElementById('view-bible-reader');
            const viewStudy = document.getElementById('view-study-hub');
            const chatTitle = document.getElementById('chat-title');
            const chatStatus = document.getElementById('chat-status');

            // Resetar views
            if (viewChat) { viewChat.classList.remove('active'); viewChat.style.display = 'none'; }
            if (viewBible) { viewBible.classList.remove('active'); viewBible.style.display = 'none'; }
            if (viewStudy) { viewStudy.classList.remove('active'); viewStudy.style.display = 'none'; }

            // Mostrar/esconder painéis com base na seção
            switch (section) {
                case 'chat':
                    if (viewChat) { viewChat.classList.add('active'); viewChat.style.display = 'flex'; }
                    if (chatTitle) chatTitle.textContent = 'Assistente Bíblico';
                    if (chatStatus) chatStatus.innerHTML = '<span class="status-dot"></span> Online — Pronto para ajudar';

                    // Mostrar atalhos rápidos, esconder livros
                    bibleNavPanel.classList.add('hidden');
                    quickActions.style.display = 'flex';
                    if (window.innerWidth <= 1024) closeSidebar();
                    break;
                case 'bible':
                    if (viewBible) { viewBible.classList.add('active'); viewBible.style.display = 'flex'; }
                    // Não reescrever o título da bíblia se já houver um capítulo carregado
                    if (chatTitle && chatTitle.textContent === 'Assistente Bíblico' || chatTitle.textContent === 'Hub de Estudos') {
                        chatTitle.textContent = 'Leitura Bíblica';
                        if (chatStatus) chatStatus.innerHTML = 'Selecione um capítulo na barra lateral';
                    }

                    // Mostrar lista de livros, esconder atalhos
                    bibleNavPanel.classList.remove('hidden');
                    quickActions.style.display = 'none';
                    if (window.innerWidth <= 1024) closeSidebar(); // No mobile, se abriu 'Bíblia', talvez ele deva ver os livros antes de ler?
                    // Retirado closeSidebar() para ele poder clicar nos livros.
                    break;
                case 'study':
                    if (viewStudy) { viewStudy.classList.add('active'); viewStudy.style.display = 'flex'; }
                    if (chatTitle) chatTitle.textContent = 'Hub de Estudos';
                    if (chatStatus) chatStatus.innerHTML = 'Explore e mergulhe fundo na Palavra';

                    // Abrir painel de estudo lateral (se for o caso)
                    const studyPanel = document.getElementById('study-panel');
                    studyPanel.classList.remove('hidden');
                    studyPanel.classList.add('visible');

                    document.getElementById('app').classList.remove('panel-closed');
                    if (window.innerWidth <= 1024) {
                        const panelBackdrop = document.querySelector('.panel-backdrop');
                        if (panelBackdrop) panelBackdrop.classList.add('visible');
                    }
                    // Manter atalhos
                    bibleNavPanel.classList.add('hidden');
                    quickActions.style.display = 'flex';
                    if (window.innerWidth <= 1024) closeSidebar();
                    break;
            }
        });
    });

    // Função global para mobile/tablet fechar a sidebar
    function closeSidebar() {
        sidebar.classList.remove('visible');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('visible');
    }

    // ============================================
    // MOBILE — Toggle Sidebar
    // ============================================
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');

    // Criar backdrop para mobile
    const sidebarBackdrop = document.createElement('div');
    sidebarBackdrop.className = 'sidebar-backdrop';
    document.body.appendChild(sidebarBackdrop);

    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('visible');
            sidebarBackdrop.classList.toggle('visible');
        });
    }

    // Fechar sidebar ao clicar no backdrop
    sidebarBackdrop.addEventListener('click', closeSidebar);

    // ============================================
    // MODAL DE CONFIGURAÇÕES
    // ============================================
    const btnSettings = document.getElementById('btn-settings');
    const settingsModal = document.getElementById('settings-modal');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const modalBackdrop = settingsModal?.querySelector('.modal-backdrop');
    const apiKeyInput = document.getElementById('api-key-input');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const modeIndicator = document.getElementById('mode-indicator');

    // Abrir modal
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            // Preencher campo com a chave salva (se existir)
            const savedKey = localStorage.getItem('groq_api_key') || '';
            if (apiKeyInput) apiKeyInput.value = savedKey;
            updateModeIndicator(savedKey);
        });
    }

    // Fechar modal
    const closeModal = () => settingsModal.classList.add('hidden');
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // Salvar configurações
    if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', () => {
            const key = apiKeyInput?.value?.trim() || '';
            chatModule.aiService.setApiKey(key);
            updateModeIndicator(key);
            closeModal();
        });
    }

    // Atualizar input em tempo real para indicar o modo
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', () => {
            updateModeIndicator(apiKeyInput.value.trim());
        });
    }

    /**
     * Atualiza o indicador de modo (Demo/API) no modal.
     * @param {string} key - Chave da API
     */
    function updateModeIndicator(key) {
        if (!modeIndicator) return;
        if (key && key.length > 10) {
            modeIndicator.innerHTML = '<span class="mode-badge api">API Groq Ativa</span>';
        } else {
            modeIndicator.innerHTML = '<span class="mode-badge demo">Demonstração</span>';
        }
    }

    // ============================================
    // RESPONSIVIDADE — Ajustar layout ao redimensionar
    // ============================================
    window.addEventListener('resize', () => {
        const studyPanel = document.getElementById('study-panel');
        const panelBackdrop = document.querySelector('.panel-backdrop');

        if (window.innerWidth <= 1024) {
            // Mobile/Tablet — Painel lateral vira overlay
            if (studyPanel && !studyPanel.classList.contains('visible')) {
                studyPanel.classList.add('hidden');
                document.getElementById('app').classList.add('panel-closed');
            }
        }

        if (window.innerWidth > 1024) {
            // Esconder backdrop overlay se virar monitor grande
            if (panelBackdrop) panelBackdrop.classList.remove('visible');
            // Fechar sidebar esquerda overlay state (desktop já mostra a sidebar perfeitamente alinhada)
            closeSidebar();
            // Mostrar painel de estudo permanentemente no desktop
            if (studyPanel) {
                studyPanel.classList.remove('hidden');
                studyPanel.classList.add('visible');
                document.getElementById('app').classList.remove('panel-closed');
            }
        }
    });

    // Verificar modo ao iniciar e atualizar indicador de status
    const chatStatus = document.getElementById('chat-status');
    if (chatStatus && chatModule.aiService.isApiMode()) {
        chatStatus.innerHTML = '<span class="status-dot"></span> Online — API Groq ativa';
    }

    console.log('✨ Logos — Assistente Bíblico Digital inicializado com sucesso!');
});
