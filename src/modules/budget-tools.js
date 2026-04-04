import { shareContent } from '../share.js';

const STORAGE_KEY_BUDGET = 'custodohabito_budget_v2';
const STORAGE_KEY_GROCERY = 'custodohabito_grocery_v2';
const STORAGE_KEY_GROCERY_LEGACY = 'custodohabito_grocery_v1';
const STORAGE_KEY_GROCERY_HISTORY = 'custodohabito_grocery_history_v1';
const STORAGE_KEY_GROCERY_PREV_TOTAL = 'custodohabito_grocery_prev_total_v1';

const CATEGORIES = [
  {
    id: 'moradia',
    icon: 'house',
    label: 'Moradia',
    ref: 27,
    tip: 'Aluguel, financiamento, condominio, contas da casa e internet.'
  },
  {
    id: 'alimentacao',
    icon: 'utensils-crossed',
    label: 'Alimentacao',
    ref: 22,
    tip: 'Mercado, restaurantes, delivery, padaria e feira.'
  },
  {
    id: 'transporte',
    icon: 'car',
    label: 'Transporte',
    ref: 17,
    tip: 'Combustivel, app, transporte publico, estacionamento e manutencao.'
  },
  {
    id: 'saude_edu',
    icon: 'heart-pulse',
    label: 'Saude e educacao',
    ref: 12,
    tip: 'Plano, farmacia, academia, escola, cursos e estudos.'
  }
];

const OTHER_CATEGORY = {
  id: 'outros',
  icon: 'package',
  label: 'Outros',
  ref: 22,
  tip: 'Lazer, assinaturas, roupas, presentes e o que nao entrou acima.'
};

const STATUS_META = {
  over: { label: 'Acima da media', color: '#ef9a9a' },
  'slightly-over': { label: 'Levemente acima', color: '#ffd54f' },
  ok: { label: 'Dentro da media', color: '#7dd9b0' },
  under: { label: 'Abaixo da media', color: '#90caf9' },
  empty: { label: 'Nao preenchido', color: 'rgba(255,255,255,0.35)' }
};

export function initBudgetTools() {
  const container = document.getElementById('budget-tools-container');
  if (!container) return;

  let activeTab = 'budget';
  let budgetData = loadBudget();
  let groceryList = loadGrocery();
  let groceryHistory = loadGroceryHistory();
  let groceryModalItemId = null;
  let groceryChartInstance = null;
  let groceryChartLoader = null;
  let groceryToastTimer = null;
  let groceryQrLoader = null;
  let groceryImportText = '';
  let groceryScannerOpen = false;
  let groceryScannerMode = 'camera';
  let groceryScannerStatus = 'Iniciando câmera...';
  let groceryScannerLiveText = 'Posicione o QR Code no quadro';
  let groceryScannerError = '';
  let groceryScannerDetectedUrl = '';
  let groceryScannerStream = null;
  let groceryScannerRaf = null;
  let groceryUiState = {
    loadingAll: false,
    loadingIds: new Set(),
    searchResults: {},
    expandedIds: new Set()
  };

  function render() {
    container.innerHTML = `
      <section class="tools-shell">
        <header class="tools-header">
          <div class="tools-header-icon"><i data-lucide="layout-dashboard"></i></div>
          <div>
            <h2>Ferramentas</h2>
            <p>Preencha os blocos olhando para o extrato e acompanhe o espelho do seu mes.</p>
          </div>
        </header>

        <div class="tools-tabs" role="tablist" aria-label="Abas de ferramentas">
          <button class="tools-tab ${activeTab === 'budget' ? 'active' : ''}" type="button" role="tab" data-tab="budget" aria-selected="${String(activeTab === 'budget')}">
            <i data-lucide="bar-chart-3"></i>
            <span>Painel de gastos</span>
          </button>
          <button class="tools-tab ${activeTab === 'grocery' ? 'active' : ''}" type="button" role="tab" data-tab="grocery" aria-selected="${String(activeTab === 'grocery')}">
            <i data-lucide="shopping-cart"></i>
            <span>Lista do mercado</span>
          </button>
        </div>

        <div class="tools-content">
          ${activeTab === 'budget' ? renderBudget() : renderGrocery()}
        </div>
      </section>
    `;

    bindEvents();
    window.lucide?.createIcons();
  }

  function renderBudget() {
    const income = toNumber(budgetData.income);
    const totalExp = toNumber(budgetData.totalExp);
    const spending = budgetData.spending || {};
    const mainSum = CATEGORIES.reduce((sum, category) => sum + toNumber(spending[category.id]), 0);
    const otherValue = totalExp > 0 ? Math.max(0, totalExp - mainSum) : toNumber(spending.outros);
    const combinedSpending = { ...spending, outros: otherValue };
    const totalUsed = mainSum + otherValue;
    const distortionIndex = calcDistortionIndex(income, combinedSpending);

    return `
      <div class="budget-tab">
        <section class="budget-income-card">
          <div class="budget-income-grid">
            <label class="budget-income-field" for="budget-income">
              <span class="budget-income-label">
                <i data-lucide="banknote"></i>
                Renda liquida do mes
              </span>
              <div class="budget-income-row">
                <span class="budget-currency">R$</span>
                <input id="budget-income" class="budget-income-input" type="number" inputmode="decimal" min="0" step="50" placeholder="0" value="${income > 0 ? income : ''}" />
              </div>
              <small class="budget-income-hint">O que entrou na conta no mes.</small>
            </label>

            <label class="budget-income-field" for="budget-total-exp">
              <span class="budget-income-label">
                <i data-lucide="receipt"></i>
                Total gasto no mes
                <span class="budget-optional-tag">opcional</span>
              </span>
              <div class="budget-income-row">
                <span class="budget-currency">R$</span>
                <input id="budget-total-exp" class="budget-income-input" type="number" inputmode="decimal" min="0" step="50" placeholder="0" value="${totalExp > 0 ? totalExp : ''}" />
              </div>
              <small class="budget-income-hint">Se preencher, o campo Outros vira residuo automatico.</small>
            </label>
          </div>

          ${income > 0
            ? renderBudgetSummary(income, totalUsed, distortionIndex)
            : `
              <p class="budget-start-hint">
                <i data-lucide="arrow-up"></i>
                Digite sua renda para ativar a leitura das categorias.
              </p>
            `}
        </section>

        <div class="budget-cats-label">
          <i data-lucide="layers-3"></i>
          <span>4 blocos principais + Outros</span>
          <span class="budget-cats-ref-legend">
            <span class="legend-dot legend-you"></span> voce
            <span class="legend-dot legend-ibge"></span> media Brasil
          </span>
        </div>

        <div class="budget-categories">
          ${CATEGORIES.map((category) => renderCategoryCard(category, toNumber(spending[category.id]), income)).join('')}
          ${renderOtherCard(otherValue, income, totalExp > 0)}
        </div>

        ${income > 0 && totalUsed > 0 ? renderDistortionCard(income, combinedSpending, distortionIndex) : ''}

        <p class="budget-footnote">
          <i data-lucide="info"></i>
          Referencia: <strong>POF/IBGE adaptada</strong>. O objetivo aqui e espelhar o padrao, sem julgamento.
        </p>
      </div>
    `;
  }

  function renderBudgetSummary(income, totalUsed, distortionIndex) {
    const usedPct = Math.min(calcPct(totalUsed, income), 100);
    const balance = income - totalUsed;
    const fillClass = balance < 0 ? 'fill-danger' : balance < income * 0.05 ? 'fill-warn' : 'fill-ok';
    const pillClass = balance < 0 ? 'pill-danger' : balance < income * 0.05 ? 'pill-warn' : 'pill-ok';

    return `
      <div class="budget-summary-bar-wrap">
        <div class="budget-bar-total-track">
          <div class="budget-bar-total-fill ${fillClass}" style="width:${usedPct}%"></div>
        </div>

        <div class="budget-summary-pills">
          <span class="budget-pill">Comprometido: <strong>${formatCurrency(totalUsed)}</strong></span>
          <span class="budget-pill ${pillClass}">
            ${balance < 0 ? `Estouro: ${formatCurrency(Math.abs(balance))}` : `Saldo: ${formatCurrency(balance)}`}
          </span>
          ${typeof distortionIndex === 'number' ? `<span class="budget-pill pill-index">Distorcao: <strong>${distortionIndex} pts</strong></span>` : ''}
        </div>
      </div>
    `;
  }

  function renderCategoryCard(category, value, income) {
    const userPct = calcPct(value, income);
    const refPct = category.ref;
    const deltaValue = income > 0 ? value - (income * refPct / 100) : 0;
    const status = income > 0 ? getStatus(userPct, refPct) : 'empty';
    const statusMeta = STATUS_META[status];

    return `
      <article class="budget-cat-card status-${status}">
        <div class="budget-cat-header">
          <div class="budget-cat-title">
            <span class="budget-cat-icon"><i data-lucide="${category.icon}"></i></span>
            <div class="budget-cat-labels">
              <strong>${category.label}</strong>
              <small>${category.tip}</small>
            </div>
          </div>

          <label class="budget-cat-input-wrap" for="budget-cat-${category.id}">
            <span class="budget-currency-small">R$</span>
            <input id="budget-cat-${category.id}" class="budget-cat-input" type="number" data-cat="${category.id}" inputmode="decimal" min="0" step="10" placeholder="0" value="${value > 0 ? value : ''}" />
          </label>
        </div>

        ${income > 0 ? renderBarSection(userPct, refPct, deltaValue, status, statusMeta) : ''}
      </article>
    `;
  }

  function renderOtherCard(value, income, isAutomatic) {
    const userPct = calcPct(value, income);
    const refPct = OTHER_CATEGORY.ref;
    const deltaValue = income > 0 ? value - (income * refPct / 100) : 0;
    const status = income > 0 && value > 0 ? getStatus(userPct, refPct) : 'empty';
    const statusMeta = STATUS_META[status];

    return `
      <article class="budget-cat-card budget-outros-card status-${status}">
        <div class="budget-cat-header">
          <div class="budget-cat-title">
            <span class="budget-cat-icon"><i data-lucide="${OTHER_CATEGORY.icon}"></i></span>
            <div class="budget-cat-labels">
              <strong>
                ${OTHER_CATEGORY.label}
                ${isAutomatic ? '<span class="outros-auto-tag">automatico</span>' : ''}
              </strong>
              <small>${OTHER_CATEGORY.tip}</small>
            </div>
          </div>

          ${isAutomatic
            ? `
              <div class="outros-value-display">
                <span class="budget-currency-small">R$</span>
                <span class="outros-value-number">${value > 0 ? formatPlainNumber(value) : '0'}</span>
              </div>
            `
            : `
              <label class="budget-cat-input-wrap" for="budget-cat-outros">
                <span class="budget-currency-small">R$</span>
                <input id="budget-cat-outros" class="budget-cat-input" type="number" data-cat="outros" inputmode="decimal" min="0" step="10" placeholder="0" value="${value > 0 ? value : ''}" />
              </label>
            `}
        </div>

        ${income > 0 && value > 0 ? renderBarSection(userPct, refPct, deltaValue, status, statusMeta) : ''}
      </article>
    `;
  }

  function renderBarSection(userPct, refPct, deltaValue, status, statusMeta) {
    const userBarWidth = toBarWidth(userPct);
    const refBarWidth = toBarWidth(refPct);

    return `
      <div class="budget-bar-section">
        <div class="budget-bars-double">
          <div class="budget-bar-row">
            <span class="bar-row-label">Voce</span>
            <div class="budget-bar-track">
              <div class="budget-bar-fill status-fill-${status}" style="width:${userBarWidth}%"></div>
            </div>
            <span class="bar-row-pct">${userPct > 0 ? `${userPct}%` : '--'}</span>
          </div>

          <div class="budget-bar-row">
            <span class="bar-row-label bar-row-label-ref">Media</span>
            <div class="budget-bar-track bar-track-ref">
              <div class="budget-bar-fill bar-ref" style="width:${refBarWidth}%"></div>
            </div>
            <span class="bar-row-pct bar-row-pct-ref">${refPct}%</span>
          </div>
        </div>

        <div class="budget-status-row">
          <span class="budget-status-badge" style="color:${statusMeta.color}">${statusMeta.label}</span>
          <span class="budget-delta ${deltaValue > 0 ? 'delta-over' : 'delta-under'}">
            ${deltaValue > 0 ? '+' : ''}${formatCurrency(deltaValue)} vs media
          </span>
        </div>
      </div>
    `;
  }

  function renderDistortionCard(income, spending, distortionIndex) {
    const allCategories = [...CATEGORIES, OTHER_CATEGORY]
      .map((category) => {
        const value = toNumber(spending[category.id]);
        const userPct = calcPct(value, income);
        const deltaPct = userPct - category.ref;

        return {
          ...category,
          userPct,
          deltaPct,
          absDelta: Math.abs(deltaPct)
        };
      })
      .filter((category) => category.userPct > 0)
      .sort((left, right) => right.absDelta - left.absDelta);

    const topDeviation = allCategories[0];
    const level = distortionIndex <= 5 ? 'Muito alinhado' : distortionIndex <= 12 ? 'Desvio moderado' : 'Desvio alto';
    const levelColor = distortionIndex <= 5 ? '#7dd9b0' : distortionIndex <= 12 ? '#ffd54f' : '#ef9a9a';

    return `
      <section class="distortion-card">
        <div class="distortion-header">
          <i data-lucide="activity"></i>
          <h3>Indice de distorcao</h3>
          <span class="distortion-badge" style="color:${levelColor}">${distortionIndex} pts - ${level}</span>
        </div>

        <p class="distortion-desc">Media dos desvios absolutos por categoria comparando seu padrao com a referencia nacional.</p>

        ${topDeviation
          ? `
            <div class="distortion-insight">
              <i data-lucide="zap"></i>
              <div>
                <strong>Maior desvio:</strong> ${topDeviation.label} (${topDeviation.deltaPct > 0 ? '+' : ''}${topDeviation.deltaPct} p.p.).
                ${topDeviation.deltaPct > 0
                  ? ` Ajustar esse excesso poderia liberar ${formatCurrency(income * (topDeviation.absDelta / 100))} por mes.`
                  : ' O peso esta abaixo da media; so vale revisar se nao houve corte essencial.'}
              </div>
            </div>
          `
          : `
            <div class="distortion-insight">
              <i data-lucide="check-circle-2"></i>
              <div>Preencha pelo menos uma categoria para gerar um destaque de desvio.</div>
            </div>
          `}
      </section>
    `;
  }

  function renderGrocery() {
    const total = getGroceryTotal(groceryList);
    const checked = groceryList.filter((item) => item.checked).length;
    const priced = groceryList.filter((item) => hasGroceryPrice(item)).length;
    const trendMeta = getGroceryTrendMeta(total);
    const modalItem = groceryModalItemId ? groceryList.find((item) => item.id === groceryModalItemId) : null;

    return `
      <div class="grocery-tab grocery-tab-advanced" id="grocery-share-card">
        <section class="grocery-total-banner">
          <div>
            <span class="grocery-banner-label">Total estimado</span>
            <strong class="grocery-banner-total">${formatCurrency(total)}</strong>
            <span class="grocery-banner-meta">
              ${groceryList.length} ${groceryList.length === 1 ? 'item' : 'itens'}
              ${priced > 0 ? ` - ${priced} com preco` : ''}
              ${checked > 0 ? ` - ${checked} marcado${checked > 1 ? 's' : ''}` : ''}
            </span>
          </div>

          <div class="grocery-banner-actions">
            <span class="grocery-total-trend ${trendMeta.className}">${trendMeta.label}</span>
          </div>
        </section>

        <section class="grocery-add-form grocery-add-form-advanced">
          <div class="grocery-form-row">
            <input id="grocery-name" class="grocery-input grocery-name-input" type="text" maxlength="60" placeholder="Item (ex: arroz 5kg)" aria-label="Nome do item" />
            <div class="grocery-number-row">
              <div class="grocery-qty-wrap">
                <label class="grocery-label-small" for="grocery-qty">Qtd</label>
                <input id="grocery-qty" class="grocery-input grocery-qty-input" type="number" inputmode="decimal" min="0.1" step="0.5" value="1" />
              </div>
              <div class="grocery-price-wrap">
                <label class="grocery-label-small" for="grocery-price">R$ inicial</label>
                <input id="grocery-price" class="grocery-input grocery-price-input" type="number" inputmode="decimal" min="0" step="0.01" placeholder="Opcional" />
              </div>
            </div>
          </div>

          <div class="grocery-add-actions">
            <button id="grocery-add-btn" class="btn-primary grocery-add-btn" type="button">
              <i data-lucide="plus"></i>
              Adicionar
            </button>
            <p class="grocery-add-hint">Depois voce pode salvar um preco manual ou buscar no Mercado Livre por item.</p>
          </div>
        </section>

        <section class="grocery-import-card">
          <div class="grocery-import-header">
            <div>
              <span class="grocery-import-kicker">Importador de nota</span>
              <h3>Colar texto da NFC-e</h3>
              <p>Cole o texto copiado da nota fiscal. A extração preserva o regex validado e consolida itens repetidos por codigo.</p>
            </div>

            <div class="grocery-import-actions">
              <button id="grocery-open-scanner-btn" class="btn-secondary grocery-import-btn" type="button">
                <i data-lucide="camera"></i>
                Escanear NFC-e
              </button>
              <button id="grocery-import-btn" class="btn-secondary grocery-import-btn" type="button">
                <i data-lucide="receipt-text"></i>
                Processar nota
              </button>
            </div>
          </div>

          <label class="grocery-import-field" for="grocery-import-text">
            <span class="grocery-label-small">Texto da NFC-e</span>
            <textarea
              id="grocery-import-text"
              class="grocery-input grocery-import-textarea"
              placeholder="Cole aqui o texto completo copiado da pagina da nota fiscal..."
            >${escapeHtml(groceryImportText)}</textarea>
          </label>
        </section>

        ${groceryList.length === 0
          ? `
            <div class="grocery-empty grocery-empty-advanced">
              <i data-lucide="shopping-basket"></i>
              <p>Sua lista esta vazia. Adicione um item para testar preco manual, busca no Mercado Livre e historico.</p>
            </div>
          `
          : `
            <div class="grocery-list-advanced">
              ${groceryList.map((item) => renderGroceryCard(item)).join('')}
            </div>

            <div class="grocery-actions-bar">
              <button id="grocery-clear-checked" class="btn-secondary grocery-action-btn" type="button" ${checked === 0 ? 'disabled' : ''}>
                <i data-lucide="check-check"></i>
                Limpar marcados (${checked})
              </button>
              <button id="grocery-clear-all" class="btn-secondary grocery-action-btn grocery-danger" type="button">
                <i data-lucide="trash-2"></i>
                Limpar tudo
              </button>
              <button id="grocery-share-btn" class="btn-secondary grocery-action-btn" type="button" ${groceryList.length === 0 ? 'disabled' : ''}>
                <i data-lucide="share-2"></i>
                Compartilhar lista
              </button>
            </div>
          `}

        <p class="budget-footnote grocery-footnote">
          <i data-lucide="lightbulb"></i>
          Use a pesquisa externa para conferir preco no Google, depois copie o valor e salve manualmente no item.
        </p>

        <div id="grocery-history-overlay" class="grocery-modal-overlay ${modalItem ? 'open' : ''}" aria-hidden="${String(!modalItem)}">
          <div class="grocery-modal-card" role="dialog" aria-modal="true" aria-labelledby="grocery-history-title">
            <div class="grocery-modal-header">
              <div>
                <span class="grocery-modal-kicker">Historico</span>
                <h3 id="grocery-history-title">${modalItem ? escapeHtml(modalItem.name) : 'Historico de preco'}</h3>
                <p>${renderGroceryHistorySubtitle(modalItem)}</p>
              </div>
              <button class="grocery-modal-close" type="button" data-close-history aria-label="Fechar historico">
                <i data-lucide="x"></i>
              </button>
            </div>

            <div class="grocery-history-chart-wrap">
              <canvas id="grocery-history-chart" height="200"></canvas>
            </div>

            <div class="grocery-history-table-wrap">
              ${renderGroceryHistoryTable(modalItem)}
            </div>

            <button class="btn-primary grocery-modal-close-btn" type="button" data-close-history>Fechar</button>
          </div>
        </div>

        <div id="grocery-scanner-overlay" class="grocery-modal-overlay ${groceryScannerOpen ? 'open' : ''}" aria-hidden="${String(!groceryScannerOpen)}">
          <div class="grocery-modal-card grocery-scanner-card" role="dialog" aria-modal="true" aria-labelledby="grocery-scanner-title">
            <div class="grocery-modal-header">
              <div>
                <span class="grocery-modal-kicker">Importador de nota</span>
                <h3 id="grocery-scanner-title">Escanear NFC-e</h3>
                <p>Aponte a câmera para o QR Code da nota fiscal.</p>
              </div>
              <button class="grocery-modal-close" type="button" data-close-scanner aria-label="Fechar importador NFC-e">
                <i data-lucide="x"></i>
              </button>
            </div>

            <div class="grocery-scanner-view ${groceryScannerMode === 'camera' ? '' : 'hidden'}">
              <div class="grocery-scanner-wrap">
                <video id="grocery-scanner-video" autoplay playsinline muted></video>
                <canvas id="grocery-scanner-canvas" class="hidden"></canvas>
                <div class="grocery-scanner-overlay-ui">
                  <div class="grocery-scanner-frame"></div>
                  <div class="grocery-scanner-live">${escapeHtml(groceryScannerLiveText)}</div>
                </div>
              </div>
              <p class="grocery-scanner-status">${escapeHtml(groceryScannerStatus)}</p>
              ${groceryScannerError ? `<div class="grocery-scanner-error">${escapeHtml(groceryScannerError)}</div>` : ''}
            </div>

            <div class="grocery-scanner-paste ${groceryScannerMode === 'paste' ? '' : 'hidden'}">
              <div class="grocery-paste-steps">
                <p>Como importar a nota:</p>
                <ol>
                  <li>Toque em "Abrir nota no browser"</li>
                  <li>Na pagina da nota, selecione tudo e copie</li>
                  <li>Volte aqui e cole o texto no campo da NFC-e</li>
                </ol>
              </div>

              <div class="grocery-detected-url">
                <span>${escapeHtml(trimText(groceryScannerDetectedUrl, 72))}</span>
                <a href="${escapeHtml(groceryScannerDetectedUrl || '#')}" target="_blank" rel="noopener noreferrer">Abrir nota no browser</a>
              </div>
            </div>

            <div class="grocery-scanner-actions">
              ${groceryScannerMode === 'paste'
                ? '<button id="grocery-scanner-use-text" class="btn-primary" type="button">Usar texto colado abaixo</button>'
                : ''}
              <button class="btn-secondary" type="button" data-close-scanner>Fechar</button>
            </div>
          </div>
        </div>

        <div id="grocery-toast" class="grocery-toast" aria-live="polite"></div>
      </div>
    `;
  }

  function renderGroceryCard(item) {
    const price = getGroceryItemPrice(item);
    const subtotal = price === null ? null : getGroceryItemQty(item) * price;
    const history = getGroceryItemHistory(item.id);
    const previous = history.length >= 2 ? history[history.length - 2] : null;
    const diff = previous && price !== null ? price - toNumber(previous.price) : 0;
    const isExpanded = groceryUiState.expandedIds.has(item.id);
    const sourceClass = item.priceSource === 'ml'
      ? 'source-ml'
      : item.priceSource === 'nfce'
        ? 'source-nfce'
      : item.priceSource === 'manual'
        ? 'source-manual'
        : 'source-none';
    const sourceLabel = item.priceSource === 'ml'
      ? 'Mercado Livre'
      : item.priceSource === 'nfce'
        ? 'NFC-e'
      : item.priceSource === 'manual'
        ? 'Manual'
        : 'Sem preco';

    return `
      <article class="grocery-market-card ${item.checked ? 'item-checked' : ''} ${isExpanded ? 'is-expanded' : 'is-collapsed'}" data-item-id="${item.id}">
        <div class="grocery-market-top">
          <button class="grocery-check-btn grocery-check-btn-card" type="button" data-check="${item.id}" aria-label="${item.checked ? 'Desmarcar item' : 'Marcar item'}">
            <i data-lucide="${item.checked ? 'check-circle-2' : 'circle'}"></i>
          </button>

          <div class="grocery-market-main">
            <div class="grocery-market-header" role="button" tabindex="0" data-toggle-expand="${item.id}" aria-expanded="${String(isExpanded)}">
              <div class="grocery-market-title-row">
                <div>
                  <h3 class="grocery-market-name">${escapeHtml(item.name)}</h3>
                  <div class="grocery-market-tags">
                    <span class="grocery-item-tag">Qtd ${formatPlainNumber(getGroceryItemQty(item))}</span>
                    <span class="grocery-item-tag ${sourceClass}">${sourceLabel}</span>
                    ${item.mlTitle ? `<span class="grocery-item-tag grocery-item-tag-muted">${escapeHtml(trimText(item.mlTitle, 48))}</span>` : ''}
                  </div>
                </div>

                <div class="grocery-market-actions">
                  <button class="grocery-card-icon" type="button" data-history="${item.id}" aria-label="Abrir historico">
                    <i data-lucide="chart-line"></i>
                  </button>
                  <button class="grocery-card-icon grocery-remove-btn" type="button" data-remove="${item.id}" aria-label="Remover item">
                    <i data-lucide="x"></i>
                  </button>
                </div>
              </div>

              <div class="grocery-market-summary">
                <span class="grocery-market-summary-value ${subtotal === null ? 'is-empty' : ''}">${subtotal === null ? 'Sem preco' : formatCurrency(subtotal)}</span>
                <span class="grocery-market-summary-label">${price === null ? 'Adicione um valor' : `${formatPlainNumber(getGroceryItemQty(item))} x ${formatCurrency(price)}`}</span>
                <span class="grocery-market-expand-hint">
                  <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}"></i>
                </span>
              </div>
            </div>

            ${isExpanded ? `
              <div class="grocery-market-body">
                <div class="grocery-market-price-row">
                  <div>
                    <span class="grocery-price-caption">Preco unitario</span>
                    <strong class="grocery-price-value ${price === null ? 'is-empty' : ''}">${price === null ? 'Sem preco' : formatCurrency(price)}</strong>
                  </div>
                  <div class="grocery-price-subtotal">
                    <span class="grocery-price-caption">Subtotal</span>
                    <strong>${subtotal === null ? '--' : formatCurrency(subtotal)}</strong>
                  </div>
                </div>

                <div class="grocery-market-trend">
                  ${previous && price !== null && Math.abs(diff) > 0.009
                    ? `
                      <span class="grocery-price-trend ${diff > 0 ? 'up' : 'down'}">
                        <i data-lucide="${diff > 0 ? 'trending-up' : 'trending-down'}"></i>
                        ${formatSignedCurrency(diff)}
                      </span>
                    `
                    : '<span class="grocery-price-trend neutral">Sem variacao registrada</span>'}
                </div>

                <div class="grocery-market-controls">
                  <label class="grocery-inline-price">
                    <span>Preco manual</span>
                    <input
                      class="grocery-input grocery-inline-input"
                      type="text"
                      inputmode="decimal"
                      autocomplete="off"
                      placeholder="R$ 0,00"
                      data-manual-input="${item.id}"
                      value="${item.priceSource === 'manual' && price !== null ? formatCurrencyInput(price) : ''}"
                    />
                  </label>

                  <div class="grocery-inline-actions">
                    <button class="btn-secondary grocery-inline-btn" type="button" data-manual-save="${item.id}">
                      <i data-lucide="save"></i>
                      Salvar
                    </button>

                    <button class="btn-secondary grocery-inline-btn grocery-search-btn" type="button" data-ml-search="${item.id}">
                      <i data-lucide="search"></i>
                      Pesquisar no Google
                    </button>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function renderGroceryHistorySubtitle(item) {
    if (!item) return 'Sem item selecionado.';
    const history = getGroceryItemHistory(item.id);
    return history.length === 0
      ? 'Nenhum registro de preco ainda.'
      : `${history.length} registro${history.length > 1 ? 's' : ''} salvo${history.length > 1 ? 's' : ''}.`;
  }

  function renderGroceryHistoryTable(item) {
    const history = item ? [...getGroceryItemHistory(item.id)].reverse() : [];

    if (history.length === 0) {
      return '<div class="grocery-history-empty">Nenhum registro ainda.</div>';
    }

    return `
      <table class="grocery-history-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Preco</th>
            <th>Fonte</th>
          </tr>
        </thead>
        <tbody>
          ${history.map((entry) => `
            <tr>
              <td>${formatHistoryDate(entry.date)}</td>
              <td>${formatCurrency(entry.price)}</td>
              <td>${entry.source === 'ml' ? 'Mercado Livre' : entry.source === 'nfce' ? 'NFC-e' : 'Manual'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function bindEvents() {
    container.querySelectorAll('.tools-tab').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.tab !== 'grocery') {
          stopGroceryScanner();
          groceryScannerOpen = false;
          resetGroceryScannerState();
        }
        activeTab = button.dataset.tab;
        render();
      });
    });

    if (activeTab === 'budget') {
      bindBudgetEvents();
    } else {
      bindGroceryEvents();
      renderGroceryHistoryChart();
    }
  }

  function bindBudgetEvents() {
    const incomeInput = container.querySelector('#budget-income');
    const totalExpInput = container.querySelector('#budget-total-exp');

    const persistAndRender = () => {
      saveBudget(budgetData);
      render();
    };

    bindNumericField(incomeInput, 'income', persistAndRender);
    bindNumericField(totalExpInput, 'totalExp', persistAndRender);

    container.querySelectorAll('.budget-cat-input').forEach((input) => {
      input.addEventListener('change', () => {
        if (!budgetData.spending) budgetData.spending = {};
        budgetData.spending[input.dataset.cat] = toNumber(input.value);
        persistAndRender();
      });

      input.addEventListener('blur', () => {
        if (!budgetData.spending) budgetData.spending = {};
        budgetData.spending[input.dataset.cat] = toNumber(input.value);
        persistAndRender();
      });
    });
  }

  function bindNumericField(input, key, callback) {
    if (!input) return;

    const sync = () => {
      budgetData[key] = toNumber(input.value);
      callback();
    };

    input.addEventListener('change', sync);
    input.addEventListener('blur', sync);
  }

  function bindGroceryEvents() {
    const nameInput = container.querySelector('#grocery-name');
    const qtyInput = container.querySelector('#grocery-qty');
    const priceInput = container.querySelector('#grocery-price');
    const importTextarea = container.querySelector('#grocery-import-text');

    container.querySelector('#grocery-add-btn')?.addEventListener('click', addGroceryItem);
    container.querySelector('#grocery-open-scanner-btn')?.addEventListener('click', openGroceryScanner);
    container.querySelector('#grocery-import-btn')?.addEventListener('click', importGroceryFromNfceText);

    [nameInput, qtyInput, priceInput].forEach((input) => {
      input?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          addGroceryItem();
        }
      });
    });

    importTextarea?.addEventListener('input', () => {
      groceryImportText = importTextarea.value;
    });

    importTextarea?.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        importGroceryFromNfceText();
      }
    });

    container.querySelectorAll('[data-check]').forEach((button) => {
      button.addEventListener('click', () => toggleGroceryChecked(button.dataset.check));
    });

    container.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => removeGroceryItem(button.dataset.remove));
    });

    container.querySelectorAll('[data-history]').forEach((button) => {
      button.addEventListener('click', () => openGroceryHistory(button.dataset.history));
    });

    container.querySelectorAll('[data-toggle-expand]').forEach((toggle) => {
      toggle.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        toggleGroceryExpanded(toggle.dataset.toggleExpand);
      });

      toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleGroceryExpanded(toggle.dataset.toggleExpand);
        }
      });
    });

    bindCurrencyInput(priceInput);

    container.querySelectorAll('[data-manual-save]').forEach((button) => {
      button.addEventListener('click', () => saveGroceryManualPrice(button.dataset.manualSave));
    });

    container.querySelectorAll('[data-manual-input]').forEach((input) => {
      bindCurrencyInput(input);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          saveGroceryManualPrice(input.dataset.manualInput);
        }
      });
    });

    container.querySelectorAll('[data-ml-search]').forEach((button) => {
      button.addEventListener('click', () => openGooglePriceSearch(button.dataset.mlSearch));
    });

    container.querySelector('#grocery-clear-checked')?.addEventListener('click', () => {
      rememberPreviousGroceryTotal();
      groceryList = groceryList.filter((item) => !item.checked);
      cleanupGroceryHistory();
      saveGrocery(groceryList);
      render();
      showGroceryToast('Itens marcados removidos.');
    });

    container.querySelector('#grocery-clear-all')?.addEventListener('click', () => {
      if (!window.confirm('Limpar toda a lista?')) return;
      rememberPreviousGroceryTotal();
      groceryList = [];
      groceryHistory = {};
      groceryModalItemId = null;
      saveGrocery(groceryList);
      saveGroceryHistory(groceryHistory);
      render();
      showGroceryToast('Lista limpa.');
    });

    container.querySelector('#grocery-share-btn')?.addEventListener('click', () => {
      const items = groceryList.map((item) => `- ${item.name} (${item.qty || 1}x)`).join('\n');
      const total = formatCurrency(getGroceryTotal(groceryList));

      shareContent({
        title: 'Minha lista do mercado',
        text: `Lista do mercado - Total estimado: ${total}\n\n${items}`,
        context: 'grocery',
        elementId: 'grocery-share-card'
      });
    });

    container.querySelectorAll('[data-close-history]').forEach((button) => {
      button.addEventListener('click', closeGroceryHistory);
    });

    container.querySelectorAll('[data-close-scanner]').forEach((button) => {
      button.addEventListener('click', closeGroceryScanner);
    });

    container.querySelector('#grocery-history-overlay')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) {
        closeGroceryHistory();
      }
    });

    container.querySelector('#grocery-scanner-overlay')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) {
        closeGroceryScanner();
      }
    });

    container.querySelector('#grocery-scanner-use-text')?.addEventListener('click', () => {
      closeGroceryScanner({ focusTextarea: true });
    });
  }

  function addGroceryItem() {
    const nameInput = container.querySelector('#grocery-name');
    const qtyInput = container.querySelector('#grocery-qty');
    const priceInput = container.querySelector('#grocery-price');
    const name = nameInput?.value.trim();

    if (!name) {
      nameInput?.focus();
      return;
    }

    const initialPrice = parseCurrencyInput(priceInput?.value);
    const item = {
      id: createId(),
      name,
      qty: Math.max(0.1, toNumber(qtyInput?.value) || 1),
      price: initialPrice > 0 ? initialPrice : null,
      checked: false,
      priceSource: initialPrice > 0 ? 'manual' : null,
      mlTitle: null
    };

    rememberPreviousGroceryTotal();
    groceryList.push(item);
    saveGrocery(groceryList);

    if (initialPrice > 0) {
      recordGroceryHistory(item.id, initialPrice, 'manual', item.name);
    }

    if (nameInput) nameInput.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (priceInput) priceInput.value = '';

    render();
    container.querySelector('#grocery-name')?.focus();
    showGroceryToast(`"${name}" adicionado.`);
  }

  function toggleGroceryChecked(itemId) {
    const item = groceryList.find((entry) => entry.id === itemId);
    if (!item) return;

    item.checked = !item.checked;
    saveGrocery(groceryList);
    render();
  }

  function removeGroceryItem(itemId) {
    const item = groceryList.find((entry) => entry.id === itemId);
    if (!item) return;

    rememberPreviousGroceryTotal();
    groceryList = groceryList.filter((entry) => entry.id !== itemId);
    delete groceryHistory[itemId];
    if (groceryModalItemId === itemId) groceryModalItemId = null;
    saveGrocery(groceryList);
    saveGroceryHistory(groceryHistory);
    render();
    showGroceryToast(`"${item.name}" removido.`);
  }

  function saveGroceryManualPrice(itemId) {
    const input = container.querySelector(`[data-manual-input="${itemId}"]`);
    const price = parseCurrencyInput(input?.value);
    const item = groceryList.find((entry) => entry.id === itemId);

    if (!item) return;
    if (price <= 0) {
      showGroceryToast('Insira um preco manual valido.');
      input?.focus();
      return;
    }

    setGroceryPrice(itemId, price, 'manual', item.name);
    render();
    showGroceryToast('Preco manual salvo.');
  }

  function importGroceryFromNfceText() {
    const textarea = container.querySelector('#grocery-import-text');
    const rawText = textarea?.value?.trim() || groceryImportText.trim();

    if (!rawText || rawText.length < 20) {
      showGroceryToast('Cole o texto da nota para importar.');
      textarea?.focus();
      return;
    }

    const parsedItems = parseSefazText(rawText);
    if (parsedItems.length === 0) {
      showGroceryToast('Nenhum item encontrado na nota colada.');
      textarea?.focus();
      return;
    }

    rememberPreviousGroceryTotal();

    parsedItems.forEach((parsedItem) => {
      const item = {
        id: createId(),
        name: parsedItem.name,
        qty: Math.max(0.1, parsedItem.qty || 1),
        price: parsedItem.unitPrice > 0 ? parsedItem.unitPrice : null,
        checked: false,
        priceSource: parsedItem.unitPrice > 0 ? 'nfce' : null,
        mlTitle: null
      };

      groceryList.push(item);

      if (parsedItem.unitPrice > 0) {
        recordGroceryHistory(item.id, parsedItem.unitPrice, 'nfce', parsedItem.name);
      }
    });

    groceryImportText = '';
    saveGrocery(groceryList);
    render();
    showGroceryToast(`${parsedItems.length} ${parsedItems.length === 1 ? 'item importado' : 'itens importados'} da NFC-e.`);
  }

  async function openGroceryScanner() {
    resetGroceryScannerState();
    groceryScannerOpen = true;
    render();
    await startGroceryScanner();
  }

  function closeGroceryScanner(options = {}) {
    const { focusTextarea = false } = options;
    stopGroceryScanner();
    resetGroceryScannerState();
    groceryScannerOpen = false;
    render();

    if (focusTextarea) {
      container.querySelector('#grocery-import-text')?.focus();
    }
  }

  function resetGroceryScannerState() {
    groceryScannerMode = 'camera';
    groceryScannerStatus = 'Iniciando câmera...';
    groceryScannerLiveText = 'Posicione o QR Code no quadro';
    groceryScannerError = '';
    groceryScannerDetectedUrl = '';
  }

  async function startGroceryScanner() {
    const video = container.querySelector('#grocery-scanner-video');
    if (!video || !groceryScannerOpen) return;

    try {
      const jsQR = await ensureGroceryQrScanner();
      if (!jsQR) throw new Error('Leitor de QR indisponivel.');

      groceryScannerStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 1280 }
        }
      });

      video.srcObject = groceryScannerStream;
      await video.play();
      groceryScannerStatus = 'Câmera ativa — aponte para o QR Code';
      groceryScannerLiveText = 'Posicione o QR Code no quadro';
      updateGroceryScannerText();
      groceryScannerRaf = window.requestAnimationFrame(() => scanGroceryQrFrame(jsQR));
    } catch (error) {
      groceryScannerError = 'Não foi possível acessar a câmera. Verifique a permissão do navegador.';
      groceryScannerStatus = '';
      updateGroceryScannerText();
      console.error(error);
    }
  }

  function stopGroceryScanner() {
    if (groceryScannerRaf) {
      window.cancelAnimationFrame(groceryScannerRaf);
      groceryScannerRaf = null;
    }

    if (groceryScannerStream) {
      groceryScannerStream.getTracks().forEach((track) => track.stop());
      groceryScannerStream = null;
    }

    const video = container.querySelector('#grocery-scanner-video');
    if (video) {
      video.srcObject = null;
    }
  }

  function updateGroceryScannerText() {
    const status = container.querySelector('.grocery-scanner-status');
    const live = container.querySelector('.grocery-scanner-live');
    const error = container.querySelector('.grocery-scanner-error');

    if (status) status.textContent = groceryScannerStatus;
    if (live) live.textContent = groceryScannerLiveText;
    if (error) error.textContent = groceryScannerError;
  }

  function scanGroceryQrFrame(jsQR) {
    if (!groceryScannerOpen || !groceryScannerStream) return;

    const video = container.querySelector('#grocery-scanner-video');
    const canvas = container.querySelector('#grocery-scanner-canvas');
    if (!video || !canvas) return;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      groceryScannerRaf = window.requestAnimationFrame(() => scanGroceryQrFrame(jsQR));
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });

    if (code?.data) {
      handleGroceryQrDetected(code.data);
      return;
    }

    groceryScannerRaf = window.requestAnimationFrame(() => scanGroceryQrFrame(jsQR));
  }

  function handleGroceryQrDetected(url) {
    stopGroceryScanner();

    if (!/sefaz|nfe|nfce/i.test(url)) {
      groceryScannerError = `QR Code nao reconhecido como NFC-e. URL: ${trimText(url, 100)}`;
      groceryScannerStatus = '';
      groceryScannerLiveText = 'Posicione o QR Code no quadro';
      updateGroceryScannerText();
      return;
    }

    groceryScannerDetectedUrl = url;
    groceryScannerMode = 'paste';
    groceryScannerStatus = '';
    groceryScannerLiveText = 'QR Code detectado';
    render();
  }

  function ensureGroceryQrScanner() {
    if (window.jsQR) {
      return Promise.resolve(window.jsQR);
    }

    if (groceryQrLoader) {
      return groceryQrLoader;
    }

    groceryQrLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-jsqr-loader="grocery"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.jsQR), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
      script.async = true;
      script.dataset.jsqrLoader = 'grocery';
      script.onload = () => resolve(window.jsQR);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return groceryQrLoader;
  }

  function openGooglePriceSearch(itemId) {
    const item = groceryList.find((entry) => entry.id === itemId);
    if (!item) return;

    const query = `${item.name} preco mercado`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const popup = window.open(url, `grocery_search_${item.id}`, buildPopupFeatures(560, 760));

    if (!popup) {
      window.open(url, '_blank', 'noopener,noreferrer');
      showGroceryToast('Pop-up bloqueado. Busca aberta em nova aba.');
      return;
    }

    popup.focus();
    showGroceryToast('Pesquisa aberta em janela utilitaria.');
  }

  function toggleGroceryExpanded(itemId) {
    if (!itemId) return;

    if (groceryUiState.expandedIds.has(itemId)) {
      groceryUiState.expandedIds.delete(itemId);
    } else {
      groceryUiState.expandedIds.add(itemId);
    }

    render();
  }

  function setGroceryPrice(itemId, priceValue, source, title) {
    const item = groceryList.find((entry) => entry.id === itemId);
    const price = toNumber(priceValue);

    if (!item || price <= 0) return false;

    const currentPrice = getGroceryItemPrice(item);
    const nextTitle = source === 'ml' ? (title || item.name) : null;
    const isSamePrice = currentPrice !== null && Math.abs(currentPrice - price) < 0.009;
    const isSameSource = item.priceSource === source;
    const isSameTitle = (item.mlTitle || null) === nextTitle;

    if (isSamePrice && isSameSource && isSameTitle) {
      return false;
    }

    rememberPreviousGroceryTotal();
    item.price = price;
    item.priceSource = source;
    item.mlTitle = source === 'ml' ? nextTitle : null;
    saveGrocery(groceryList);
    recordGroceryHistory(item.id, price, source, title || item.name);
    return true;
  }

  function recordGroceryHistory(itemId, price, source, title) {
    const history = getGroceryItemHistory(itemId);
    const lastEntry = history[history.length - 1];

    if (
      lastEntry
      && Math.abs(toNumber(lastEntry.price) - toNumber(price)) < 0.009
      && lastEntry.source === source
      && (lastEntry.title || '') === (title || '')
    ) {
      return;
    }

    if (!groceryHistory[itemId]) {
      groceryHistory[itemId] = [];
    }

    groceryHistory[itemId].push({
      date: new Date().toISOString(),
      price: toNumber(price),
      source,
      title: title || ''
    });

    saveGroceryHistory(groceryHistory);
  }

  function getGroceryItemHistory(itemId) {
    return Array.isArray(groceryHistory[itemId]) ? groceryHistory[itemId] : [];
  }

  function cleanupGroceryHistory() {
    const ids = new Set(groceryList.map((item) => item.id));
    groceryHistory = Object.fromEntries(Object.entries(groceryHistory).filter(([itemId]) => ids.has(itemId)));
    saveGroceryHistory(groceryHistory);
  }

  function openGroceryHistory(itemId) {
    groceryModalItemId = itemId;
    render();
  }

  function closeGroceryHistory() {
    groceryModalItemId = null;
    destroyGroceryChart();
    render();
  }

  async function renderGroceryHistoryChart() {
    if (!groceryModalItemId) {
      destroyGroceryChart();
      return;
    }

    const item = groceryList.find((entry) => entry.id === groceryModalItemId);
    const canvas = container.querySelector('#grocery-history-chart');
    const history = item ? getGroceryItemHistory(item.id) : [];

    if (!item || !canvas) {
      destroyGroceryChart();
      return;
    }

    if (history.length === 0) {
      destroyGroceryChart();
      drawGroceryHistoryFallback(canvas, 'Sem historico ainda');
      return;
    }

    try {
      const Chart = await ensureGroceryChartJs();
      const context = canvas.getContext('2d');
      if (!context) return;

      destroyGroceryChart();
      groceryChartInstance = new Chart(context, {
        type: 'line',
        data: {
          labels: history.map((entry) => formatHistoryAxis(entry.date)),
          datasets: [{
            data: history.map((entry) => toNumber(entry.price)),
            borderColor: '#c9a84c',
            backgroundColor: 'rgba(201,168,76,0.16)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label(context) {
                  return formatCurrency(context.parsed.y);
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: 'rgba(255,255,255,0.65)' }
            },
            y: {
              ticks: {
                color: 'rgba(255,255,255,0.65)',
                callback(value) {
                  return formatCurrency(value);
                }
              },
              grid: { color: 'rgba(255,255,255,0.08)' }
            }
          }
        }
      });
    } catch {
      destroyGroceryChart();
      drawGroceryHistoryFallback(canvas, 'Nao foi possivel carregar o grafico');
    }
  }

  function destroyGroceryChart() {
    if (!groceryChartInstance) return;
    groceryChartInstance.destroy();
    groceryChartInstance = null;
  }

  function drawGroceryHistoryFallback(canvas, message) {
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(255,255,255,0.65)';
    context.font = '14px DM Sans, sans-serif';
    context.textAlign = 'center';
    context.fillText(message, canvas.width / 2, Math.max(80, canvas.height / 2));
  }

  function ensureGroceryChartJs() {
    if (window.Chart) {
      return Promise.resolve(window.Chart);
    }

    if (groceryChartLoader) {
      return groceryChartLoader;
    }

    groceryChartLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-chartjs-loader="grocery"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Chart), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.async = true;
      script.dataset.chartjsLoader = 'grocery';
      script.onload = () => resolve(window.Chart);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return groceryChartLoader;
  }

  function showGroceryToast(message) {
    const toast = container.querySelector('#grocery-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(groceryToastTimer);
    groceryToastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function bindCurrencyInput(input) {
    if (!input) return;

    input.addEventListener('input', () => {
      input.value = normalizeCurrencyInput(input.value);
    });

    input.addEventListener('blur', () => {
      const parsed = parseCurrencyInput(input.value);
      input.value = parsed > 0 ? formatCurrencyInput(parsed) : '';
    });
  }

  function buildPopupFeatures(width, height) {
    const left = Math.max(0, Math.round(window.screenX + ((window.outerWidth - width) / 2)));
    const top = Math.max(0, Math.round(window.screenY + ((window.outerHeight - height) / 2)));

    return `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
  }

  function rememberPreviousGroceryTotal() {
    localStorage.setItem(STORAGE_KEY_GROCERY_PREV_TOTAL, String(getGroceryTotal(groceryList)));
  }

  function getGroceryTrendMeta(total) {
    const previousTotal = toNumber(localStorage.getItem(STORAGE_KEY_GROCERY_PREV_TOTAL));

    if (previousTotal <= 0 || total <= 0) {
      return {
        className: 'neutral',
        label: total > 0 ? 'Sem comparacao anterior' : 'Adicione itens para estimar'
      };
    }

    const diff = total - previousTotal;
    if (Math.abs(diff) < 0.009) {
      return {
        className: 'neutral',
        label: 'Mesmo total da alteracao anterior'
      };
    }

    return {
      className: diff > 0 ? 'up' : 'down',
      label: `${diff > 0 ? '+' : '-'}${formatCurrency(Math.abs(diff))} vs ultima alteracao`
    };
  }

  function getGroceryTotal(items) {
    return items.reduce((sum, item) => {
      const price = getGroceryItemPrice(item);
      return price === null ? sum : sum + (getGroceryItemQty(item) * price);
    }, 0);
  }

  function getGroceryItemQty(item) {
    return Math.max(0.1, toNumber(item?.qty) || 1);
  }

  function getGroceryItemPrice(item) {
    const price = toNumber(item?.price);
    return price > 0 ? price : null;
  }

  function hasGroceryPrice(item) {
    return getGroceryItemPrice(item) !== null;
  }

  render();
}

function loadBudget() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_BUDGET) || '{}');
  } catch {
    return {};
  }
}

function saveBudget(data) {
  localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(data));
}

function loadGrocery() {
  try {
    return normalizeGroceryItems(
      JSON.parse(localStorage.getItem(STORAGE_KEY_GROCERY) || localStorage.getItem(STORAGE_KEY_GROCERY_LEGACY) || '[]')
    );
  } catch {
    return [];
  }
}

function saveGrocery(data) {
  localStorage.setItem(STORAGE_KEY_GROCERY, JSON.stringify(data));
}

function loadGroceryHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY_GROCERY_HISTORY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveGroceryHistory(data) {
  localStorage.setItem(STORAGE_KEY_GROCERY_HISTORY, JSON.stringify(data));
}

function normalizeGroceryItems(data) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      const price = toNumber(item?.price);
      return {
        id: item?.id || createId(),
        name: String(item?.name || '').trim(),
        qty: Math.max(0.1, toNumber(item?.qty) || 1),
        price: price > 0 ? price : null,
        checked: Boolean(item?.checked),
        priceSource: item?.priceSource === 'ml' || item?.priceSource === 'manual' || item?.priceSource === 'nfce'
          ? item.priceSource
          : price > 0
            ? 'manual'
            : null,
        mlTitle: typeof item?.mlTitle === 'string' && item.mlTitle.trim()
          ? item.mlTitle.trim()
          : null
      };
    })
    .filter((item) => item.name);
}

function calcPct(value, total) {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function getStatus(userPct, refPct) {
  if (userPct === 0) return 'empty';

  const delta = userPct - refPct;

  if (delta > refPct * 0.25) return 'over';
  if (delta > refPct * 0.08) return 'slightly-over';
  if (delta < -refPct * 0.15) return 'under';
  return 'ok';
}

function calcDistortionIndex(income, spending) {
  if (!income) return null;

  const allCategories = [...CATEGORIES, OTHER_CATEGORY];
  const deviations = allCategories.map((category) => {
    return Math.abs(calcPct(toNumber(spending[category.id]), income) - category.ref);
  });

  return Math.round(deviations.reduce((sum, value) => sum + value, 0) / allCategories.length);
}

function toBarWidth(percent) {
  const capped = Math.min(percent, 55);
  return capped * (100 / 55);
}

function toNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(toNumber(value));
}

function formatPlainNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(toNumber(value));
}

function formatSignedCurrency(value) {
  return `${value > 0 ? '+' : '-'}${formatCurrency(Math.abs(toNumber(value)))}`;
}

function formatCurrencyInput(value) {
  const amount = toNumber(value);
  if (amount <= 0) return '';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatNumberInput(value) {
  return toNumber(value).toFixed(2);
}

function parseCurrencyInput(value) {
  const raw = String(value || '').replace(/[^\d,.-]/g, '');
  const cleaned = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw;

  return toNumber(cleaned);
}

function normalizeCurrencyInput(value) {
  return String(value || '').replace(/[^\d,]/g, '');
}

function parseBrazilianDecimal(value) {
  const normalized = String(value || '').trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseSefazText(rawText) {
  const text = String(rawText || '').replace(/[ \t]+/g, ' ').replace(/\r/g, '');
  const blockRx = /^([^\n(]+?)\s*\(C[o\u00f3]digo:\s*(\d+)\)[^\n]*\nQtde\.:([^\s]+)[^\n]+Vl\. Unit\.:\s*([^\s]+)[^\n]+Vl\. Total\s*\n([\d,]+)/gm;
  const groupedByCode = {};

  let match;
  while ((match = blockRx.exec(text)) !== null) {
    const name = match[1].trim();
    const code = match[2];
    const qty = parseBrazilianDecimal(match[3]) || 1;
    const unit = parseBrazilianDecimal(match[4]);
    const total = parseBrazilianDecimal(match[5]);

    if (!name || total <= 0) continue;

    if (groupedByCode[code]) {
      groupedByCode[code].qty += qty;
      groupedByCode[code].total += total;
    } else {
      groupedByCode[code] = { name, code, qty, unit, total };
    }
  }

  return Object.values(groupedByCode).map((item) => {
    const qty = item.qty > 0 ? item.qty : 1;
    const total = Math.round(item.total * 100) / 100;
    const inferredUnit = qty > 0 ? total / qty : item.unit;
    const unitPrice = Math.round((inferredUnit || 0) * 100) / 100;

    return {
      name: item.name,
      code: item.code,
      qty,
      total,
      unitPrice: unitPrice > 0 ? unitPrice : 0
    };
  });
}

function formatHistoryDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatHistoryAxis(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function trimText(text, maxLength) {
  const value = String(text || '');
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
