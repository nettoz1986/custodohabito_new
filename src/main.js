import { initChat } from './modules/chat.js';
import { initDailyInsight } from './modules/daily-insight.js';
import { initLearningNav } from './modules/learning-nav.js';
import { initLearningReader } from './modules/learning-reader.js';
import { initDiagnostic } from './modules/diagnostic.js';
import { initStudyPanel } from './modules/study-panel.js';
import { initStudyHub } from './modules/study-hub.js';
import { openChatView } from './utils/chat-actions.js';

document.addEventListener('DOMContentLoaded', () => {
  const brandMark = document.querySelector('.brand-mark');
  if (brandMark) {
    const baseUrl = import.meta.env?.BASE_URL;
    brandMark.src = baseUrl
      ? `${baseUrl.replace(/\/?$/, '/')}assets/logo_custodohabito.jpg`
      : '/public/assets/logo_custodohabito.jpg';
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const chatModule = initChat();
  initDailyInsight();
  initLearningNav();
  initLearningReader();
  initDiagnostic();
  initStudyPanel();
  initStudyHub();

  const app = document.getElementById('app');
  const sidebar = document.getElementById('sidebar');
  const navItems = document.querySelectorAll('.nav-item');
  const catalogNavPanel = document.getElementById('catalog-nav-panel');
  const quickActions = document.getElementById('quick-actions');
  const viewChat = document.getElementById('view-chat');
  const viewDiagnostic = document.getElementById('view-diagnostic');
  const viewReader = document.getElementById('view-topic-reader');
  const viewStudy = document.getElementById('view-study-hub');
  const chatTitle = document.getElementById('chat-title');
  const chatStatus = document.getElementById('chat-status');
  const studyPanel = document.getElementById('study-panel');

  const sidebarBackdrop = document.createElement('div');
  sidebarBackdrop.className = 'sidebar-backdrop';
  document.body.appendChild(sidebarBackdrop);

  const closeSidebar = () => {
    sidebar.classList.remove('visible');
    sidebarBackdrop.classList.remove('visible');
  };

  const setView = (section) => {
    [viewChat, viewDiagnostic, viewReader, viewStudy].forEach((view) => {
      if (!view) return;
      view.classList.remove('active');
      view.style.display = 'none';
    });

    navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    switch (section) {
      case 'chat':
        viewChat.classList.add('active');
        viewChat.style.display = 'flex';
        chatTitle.textContent = 'Agente financeiro';
        chatStatus.innerHTML = '<span class="status-dot"></span> Online - pronto para educar, organizar e orientar';
        catalogNavPanel.classList.add('hidden');
        quickActions.style.display = 'flex';
        break;
      case 'diagnostic':
        viewDiagnostic.classList.add('active');
        viewDiagnostic.style.display = 'flex';
        chatTitle.textContent = 'Diagnostico de habito';
        chatStatus.innerHTML = '<span class="status-dot"></span> Descubra o personagem financeiro que mais se aproxima do seu padrao';
        catalogNavPanel.classList.add('hidden');
        quickActions.style.display = 'none';
        break;
      case 'learn':
        viewReader.classList.add('active');
        viewReader.style.display = 'flex';
        chatTitle.textContent = 'Aprender com clareza';
        chatStatus.innerHTML = '<span class="status-dot"></span> Leituras guiadas, conceitos essenciais e conexao direta com o agente';
        catalogNavPanel.classList.remove('hidden');
        quickActions.style.display = 'flex';
        break;
      case 'planning':
        viewStudy.classList.add('active');
        viewStudy.style.display = 'flex';
        chatTitle.textContent = 'Planejamento financeiro';
        chatStatus.innerHTML = '<span class="status-dot"></span> Trilhas, ferramentas e proximos passos';
        catalogNavPanel.classList.add('hidden');
        quickActions.style.display = 'flex';
        studyPanel.classList.remove('hidden');
        studyPanel.classList.add('visible');
        app.classList.remove('panel-closed');
        break;
      default:
        break;
    }

    if (window.innerWidth <= 1024) {
      closeSidebar();
    }
  };

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      setView(item.dataset.section);
    });
  });

  window.addEventListener('app:navigate', (event) => {
    const section = event.detail?.section;
    if (section) setView(section);
  });

  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('visible');
      sidebarBackdrop.classList.toggle('visible');
    });
  }

  sidebarBackdrop.addEventListener('click', closeSidebar);

  const btnSettings = document.getElementById('btn-settings');
  const settingsModal = document.getElementById('settings-modal');
  const privacyModal = document.getElementById('privacy-modal');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnClosePrivacy = document.getElementById('btn-close-privacy');
  const modalBackdrop = settingsModal?.querySelector('.modal-backdrop');
  const privacyBackdrop = privacyModal?.querySelector('.modal-backdrop');
  const openPrivacyLink = document.getElementById('open-privacy-link');
  const apiKeyInput = document.getElementById('api-key-input');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const modeIndicator = document.getElementById('mode-indicator');

  const updateModeIndicator = (key) => {
    if (!modeIndicator) return;
    modeIndicator.innerHTML = key && key.length > 10
      ? '<span class="mode-badge api">API Groq ativa</span>'
      : '<span class="mode-badge demo">Demonstracao</span>';
  };

  const closeModal = () => settingsModal.classList.add('hidden');
  const closePrivacyModal = () => privacyModal?.classList.add('hidden');

  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
      const savedKey = localStorage.getItem('groq_api_key') || '';
      if (apiKeyInput) apiKeyInput.value = savedKey;
      updateModeIndicator(savedKey);
    });
  }

  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (btnClosePrivacy) btnClosePrivacy.addEventListener('click', closePrivacyModal);
  if (privacyBackdrop) privacyBackdrop.addEventListener('click', closePrivacyModal);
  if (openPrivacyLink) {
    openPrivacyLink.addEventListener('click', (event) => {
      event.preventDefault();
      privacyModal?.classList.remove('hidden');
    });
  }

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const key = apiKeyInput?.value?.trim() || '';
      chatModule.aiService.setApiKey(key);
      updateModeIndicator(key);
      closeModal();
    });
  }

  if (apiKeyInput) {
    apiKeyInput.addEventListener('input', () => updateModeIndicator(apiKeyInput.value.trim()));
  }

  window.addEventListener('resize', () => {
    const panelBackdrop = document.querySelector('.panel-backdrop');

    if (window.innerWidth <= 1024) {
      if (studyPanel && !studyPanel.classList.contains('visible')) {
        studyPanel.classList.add('hidden');
        app.classList.add('panel-closed');
      }
    }

    if (window.innerWidth > 1024) {
      if (panelBackdrop) panelBackdrop.classList.remove('visible');
      closeSidebar();
      if (studyPanel) {
        studyPanel.classList.remove('hidden');
        studyPanel.classList.add('visible');
        app.classList.remove('panel-closed');
      }
    }
  });

  if (chatStatus && chatModule.aiService.isApiMode()) {
    chatStatus.innerHTML = '<span class="status-dot"></span> Online - API Groq ativa';
  }

  openChatView();
  console.log('Custo do Habito inicializado com sucesso.');
});
