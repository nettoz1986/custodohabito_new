import { initChat } from './modules/chat.js';
import { initDailyInsight } from './modules/daily-insight.js';
import { initLearningNav } from './modules/learning-nav.js';
import { initLearningReader } from './modules/learning-reader.js';
import { initDiagnostic } from './modules/diagnostic.js';
import { initStudyPanel } from './modules/study-panel.js';
import { initStudyHub } from './modules/study-hub.js';
import { initBudgetTools } from './modules/budget-tools.js';
import { openChatView } from './utils/chat-actions.js';

const DESKTOP_MIN_WIDTH = 1024;

document.addEventListener('DOMContentLoaded', () => {
  hydrateBrandMarks();

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }

  const chatModule = initChat();
  initDailyInsight();
  initLearningNav();
  const learningReader = initLearningReader();
  initDiagnostic();
  initStudyPanel();
  initStudyHub();
  initBudgetTools();

  const refs = {
    app: document.getElementById('app'),
    body: document.body,
    sidebar: document.getElementById('sidebar'),
    overlayBackdrop: document.getElementById('overlay-backdrop'),
    catalogNavPanel: document.getElementById('catalog-nav-panel'),
    quickActions: document.getElementById('quick-actions'),
    chatTitle: document.getElementById('chat-title'),
    chatStatus: document.getElementById('chat-status'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnTogglePanel: document.getElementById('btn-toggle-panel'),
    btnClosePanel: document.getElementById('btn-close-panel'),
    btnSettings: document.getElementById('btn-settings'),
    openPrivacyLink: document.getElementById('open-privacy-link'),
    studyPanel: document.getElementById('study-panel'),
    utilityContainer: document.getElementById('utility-view-content'),
    utilitySettingsTemplate: document.getElementById('template-utility-settings'),
    utilityPrivacyTemplate: document.getElementById('template-utility-privacy'),
    navItems: Array.from(document.querySelectorAll('.nav-item')),
    mobNavBtns: Array.from(document.querySelectorAll('.mob-nav-btn')),
    views: {
      chat: document.getElementById('view-chat'),
      diagnostic: document.getElementById('view-diagnostic'),
      learn: document.getElementById('view-topic-reader'),
      planning: document.getElementById('view-study-hub'),
      tools: document.getElementById('view-tools'),
      utility: document.getElementById('view-utility')
    },
    scrollTargets: {
      chat: document.getElementById('chat-messages'),
      diagnostic: document.getElementById('view-diagnostic'),
      learn: document.getElementById('topic-reader-container'),
      planning: document.getElementById('view-study-hub'),
      tools: document.getElementById('view-tools'),
      utility: document.getElementById('view-utility')
    }
  };

  const overlayState = {
    sidebar: false,
    panel: false
  };

  let currentState = normalizeState(parseHash());
  let lastNonUtilityState = currentState.section === 'utility'
    ? normalizeState({ section: 'chat' })
    : currentState;

  bindChromeEvents();
  applyState(currentState, { replace: true });

  if (chatModule.aiService.isApiMode()) {
    refs.chatStatus.innerHTML = '<span class="status-dot"></span> Online • API Groq ativa';
  }

  if (!location.hash) {
    openChatView({ replace: true });
  }

  console.log('Custo do Hábito inicializado com sucesso.');

  function bindChromeEvents() {
    refs.navItems.forEach((item) => {
      item.addEventListener('click', () => {
        navigateTo({ section: item.dataset.section });
      });
    });

    refs.mobNavBtns.forEach((button) => {
      button.addEventListener('click', () => {
        navigateTo({ section: button.dataset.mobSection });
      });
    });

    refs.btnToggleSidebar?.addEventListener('click', () => {
      toggleOverlay('sidebar');
    });

    refs.btnTogglePanel?.addEventListener('click', () => {
      toggleOverlay('panel');
    });

    refs.btnClosePanel?.addEventListener('click', () => {
      closeOverlay('panel');
    });

    refs.overlayBackdrop?.addEventListener('click', () => {
      closeAllOverlays();
    });

    refs.btnSettings?.addEventListener('click', () => {
      navigateTo({ section: 'utility', utilityView: 'settings' });
    });

    refs.openPrivacyLink?.addEventListener('click', (event) => {
      event.preventDefault();
      navigateTo({ section: 'utility', utilityView: 'privacy' });
    });

    window.addEventListener('app:navigate', (event) => {
      navigateTo(event.detail || {});
    });

    window.addEventListener('app:close-overlay', (event) => {
      const target = event.detail?.target;
      if (target) {
        closeOverlay(target);
        return;
      }

      closeAllOverlays();
    });

    window.addEventListener('popstate', (event) => {
      navigateTo(event.state || parseHash(), { replace: true, fromPopState: true });
    });

    window.addEventListener('resize', () => {
      closeAllOverlays();
      syncOverlayUI();
      syncShellState(currentState.section);
    });
  }

  function navigateTo(nextInput, options = {}) {
    const { replace = Boolean(nextInput?.replace), fromPopState = false } = options;
    const nextState = normalizeState(nextInput, currentState);

    if (currentState.section !== 'utility') {
      lastNonUtilityState = currentState;
    }

    currentState = nextState;

    if (currentState.section !== 'utility') {
      lastNonUtilityState = currentState;
    }

    applyState(currentState, { replace, fromPopState });
  }

  function applyState(nextState, options = {}) {
    const { replace = false, fromPopState = false } = options;
    let activeTopic = null;

    if (nextState.section === 'learn') {
      activeTopic = learningReader.renderTopic(nextState.topicId || learningReader.getDefaultTopicId());
    }

    if (nextState.section === 'utility') {
      renderUtilityView(nextState.utilityView);
    }

    activateMainView(nextState.section);
    updateNavigation(nextState.section);
    updateHeader(nextState, activeTopic);
    syncShellState(nextState.section);

    if (!isDesktopViewport()) {
      closeAllOverlays();
    } else {
      syncOverlayUI();
    }

    scrollToTop(nextState.section);

    if (!fromPopState) {
      history[replace ? 'replaceState' : 'pushState'](nextState, '', buildHash(nextState));
    }
  }

  function activateMainView(section) {
    Object.entries(refs.views).forEach(([key, view]) => {
      if (!view) return;
      const isActive = key === section;
      view.classList.toggle('active', isActive);
      view.classList.toggle('hidden', !isActive);
      view.setAttribute('aria-hidden', String(!isActive));
    });
  }

  function updateNavigation(section) {
    refs.navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    refs.mobNavBtns.forEach((button) => {
      button.classList.toggle('active', button.dataset.mobSection === section);
    });
  }

  function updateHeader(state, topic) {
    if (state.section === 'utility') {
      const utilityMeta = state.utilityView === 'privacy'
        ? {
            title: 'Pol\u00edtica de privacidade',
            status: 'Entenda como os dados do diagn\u00f3stico s\u00e3o utilizados e protegidos'
          }
        : {
            title: 'Configura\u00e7\u00f5es',
            status: 'Ajuste a chave da API e acompanhe o modo de funcionamento do app'
          };

      refs.chatTitle.textContent = utilityMeta.title;
      refs.chatStatus.innerHTML = `<span class="status-dot"></span> ${utilityMeta.status}`;
      return;
    }

    if (state.section === 'learn' && topic) {
      refs.chatTitle.textContent = topic.title;
      refs.chatStatus.innerHTML = `<span class="status-dot"></span> ${topic.categoryLabel} • ${topic.level} • ${topic.time}`;
      return;
    }

    const metaBySection = {
      chat: {
        title: 'Agente financeiro',
        status: 'Online • pronto para educar, organizar e orientar'
      },
      diagnostic: {
        title: 'Diagn\u00f3stico de h\u00e1bito',
        status: 'Descubra o personagem financeiro que mais se aproxima do seu padr\u00e3o'
      },
      learn: {
        title: 'Aprender com clareza',
        status: 'Leituras guiadas, conceitos essenciais e conex\u00e3o direta com o agente'
      },
      tools: {
        title: 'Ferramentas',
        status: 'Painel de gastos e lista do mercado para leitura pr\u00e1tica do m\u00eas'
      },
      planning: {
        title: 'Planejamento financeiro',
        status: 'Trilhas, ferramentas e pr\u00f3ximos passos'
      }
    };

    const meta = metaBySection[state.section] || metaBySection.chat;
    refs.chatTitle.textContent = meta.title;
    refs.chatStatus.innerHTML = `<span class="status-dot"></span> ${meta.status}`;
  }

  function renderUtilityView(type = 'settings') {
    if (!refs.utilityContainer) return;

    const template = type === 'privacy'
      ? refs.utilityPrivacyTemplate
      : refs.utilitySettingsTemplate;

    refs.utilityContainer.innerHTML = template?.innerHTML || '';

    refs.utilityContainer.querySelectorAll('[data-utility-back]').forEach((button) => {
      button.addEventListener('click', () => {
        navigateTo(lastNonUtilityState.section === 'utility' ? { section: 'chat' } : lastNonUtilityState);
      });
    });

    if (type === 'settings') {
      bindSettingsView();
    }

    if (type === 'privacy') {
      refs.utilityContainer.querySelectorAll('[data-open-settings]').forEach((button) => {
        button.addEventListener('click', () => {
          navigateTo({ section: 'utility', utilityView: 'settings' });
        });
      });
    }

    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  function bindSettingsView() {
    const apiKeyInput = refs.utilityContainer.querySelector('#utility-api-key-input');
    const saveButton = refs.utilityContainer.querySelector('#utility-save-settings');
    const modeIndicator = refs.utilityContainer.querySelector('#utility-mode-indicator');
    const privacyLink = refs.utilityContainer.querySelector('#utility-open-privacy');

    const updateModeIndicator = (key) => {
      if (!modeIndicator) return;
      modeIndicator.innerHTML = key && key.length > 10
        ? '<span class="mode-badge api">API Groq ativa</span>'
        : '<span class="mode-badge demo">Demonstração</span>';
    };

    const savedKey = localStorage.getItem('groq_api_key') || '';
    if (apiKeyInput) {
      apiKeyInput.value = savedKey;
      apiKeyInput.addEventListener('input', () => updateModeIndicator(apiKeyInput.value.trim()));
    }

    updateModeIndicator(savedKey);

    saveButton?.addEventListener('click', () => {
      const key = apiKeyInput?.value?.trim() || '';
      chatModule.aiService.setApiKey(key);
      updateModeIndicator(key);
      refs.utilityContainer.querySelector('.utility-save-feedback')?.classList.add('visible');

      window.setTimeout(() => {
        refs.utilityContainer.querySelector('.utility-save-feedback')?.classList.remove('visible');
      }, 1800);
    });

    privacyLink?.addEventListener('click', (event) => {
      event.preventDefault();
      navigateTo({ section: 'utility', utilityView: 'privacy' });
    });
  }

  function toggleOverlay(target) {
    if (isDesktopViewport()) return;

    const isOpen = overlayState[target];
    overlayState.sidebar = false;
    overlayState.panel = false;
    overlayState[target] = !isOpen;
    syncOverlayUI();
  }

  function closeOverlay(target) {
    if (!(target in overlayState)) return;
    overlayState[target] = false;
    syncOverlayUI();
  }

  function closeAllOverlays() {
    overlayState.sidebar = false;
    overlayState.panel = false;
    syncOverlayUI();
  }

  function syncShellState(section) {
    const isLearn = section === 'learn';
    const showQuickActions = section === 'chat' || section === 'learn' || section === 'planning';
    const forcePanelVisible = isDesktopViewport();

    refs.catalogNavPanel?.classList.toggle('hidden', !isLearn);
    refs.quickActions?.classList.toggle('hidden', !showQuickActions);

    refs.app?.classList.toggle('panel-closed', !forcePanelVisible && !overlayState.panel);
    refs.studyPanel?.classList.toggle('desktop-visible', forcePanelVisible);
    refs.body?.classList.toggle('has-mob-nav', !forcePanelVisible);
  }

  function syncOverlayUI() {
    const desktop = isDesktopViewport();
    const anyOverlayOpen = !desktop && (overlayState.sidebar || overlayState.panel);

    refs.sidebar?.classList.toggle('visible', !desktop && overlayState.sidebar);
    refs.studyPanel?.classList.toggle('visible', desktop || overlayState.panel);
    refs.studyPanel?.classList.toggle('hidden', !desktop && !overlayState.panel);
    refs.overlayBackdrop?.classList.toggle('visible', anyOverlayOpen);
    refs.body.classList.toggle('is-overlay-active', anyOverlayOpen);
    refs.app?.classList.toggle('panel-closed', !desktop && !overlayState.panel);

    refs.btnToggleSidebar?.setAttribute('aria-expanded', String(!desktop && overlayState.sidebar));
    refs.btnTogglePanel?.setAttribute('aria-expanded', String(desktop || overlayState.panel));
  }

  function scrollToTop(section) {
    const target = refs.scrollTargets[section];
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }
});

function hydrateBrandMarks() {
  const resolvedSrc = resolvePublicAssetPath('assets/logo_custodohabito.jpg');

  document.querySelectorAll('.brand-mark').forEach((image) => {
    image.src = resolvedSrc;
  });
}

function resolvePublicAssetPath(assetPath) {
  const normalizedPath = String(assetPath || '').replace(/^\/+/, '');
  const baseUrl = import.meta.env?.BASE_URL;

  if (baseUrl) {
    return `${baseUrl.replace(/\/?$/, '/')}${normalizedPath}`;
  }

  return new URL(`../public/${normalizedPath}`, import.meta.url).href;
}

function normalizeState(input, previousState = {}) {
  const resolved = typeof input === 'string' ? { section: input } : { ...(input || {}) };
  const requestedSection = resolved.utilityView ? 'utility' : (resolved.section || previousState.section || 'chat');

  if (requestedSection === 'utility') {
    return {
      section: 'utility',
      topicId: null,
      utilityView: resolved.utilityView === 'privacy' ? 'privacy' : 'settings'
    };
  }

  if (requestedSection === 'learn') {
    return {
      section: 'learn',
      topicId: resolved.topicId ?? null,
      utilityView: null
    };
  }

  return {
    section: ['chat', 'diagnostic', 'planning', 'tools'].includes(requestedSection) ? requestedSection : 'chat',
    topicId: null,
    utilityView: null
  };
}

function buildHash(state) {
  if (state.section === 'utility') {
    return state.utilityView === 'privacy' ? '#privacy' : '#settings';
  }

  if (state.section === 'learn') {
    return state.topicId ? `#learn/${state.topicId}` : '#learn';
  }

  return `#${state.section}`;
}

function parseHash() {
  const rawHash = window.location.hash.replace(/^#/, '').trim();
  if (!rawHash) return { section: 'chat' };

  if (rawHash === 'settings') {
    return { section: 'utility', utilityView: 'settings' };
  }

  if (rawHash === 'privacy') {
    return { section: 'utility', utilityView: 'privacy' };
  }

  if (rawHash.startsWith('learn/')) {
    return {
      section: 'learn',
      topicId: decodeURIComponent(rawHash.slice('learn/'.length))
    };
  }

  if (['chat', 'diagnostic', 'learn', 'planning', 'tools'].includes(rawHash)) {
    return { section: rawHash };
  }

  return { section: 'chat' };
}

function isDesktopViewport() {
  return window.innerWidth >= DESKTOP_MIN_WIDTH;
}
