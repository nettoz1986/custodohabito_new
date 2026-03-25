const STORAGE_KEY_BUDGET = 'custodohabito_budget_v2';
const STORAGE_KEY_GROCERY = 'custodohabito_grocery_v1';

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
    const total = groceryList.reduce((sum, item) => sum + (toNumber(item.qty) * toNumber(item.price)), 0);
    const checked = groceryList.filter((item) => item.checked).length;

    return `
      <div class="grocery-tab">
        <section class="grocery-add-form">
          <div class="grocery-form-row">
            <input id="grocery-name" class="grocery-input grocery-name-input" type="text" maxlength="60" placeholder="Item (ex: arroz 5kg)" aria-label="Nome do item" />
            <div class="grocery-number-row">
              <div class="grocery-qty-wrap">
                <label class="grocery-label-small" for="grocery-qty">Qtd</label>
                <input id="grocery-qty" class="grocery-input grocery-qty-input" type="number" inputmode="decimal" min="0.1" step="0.5" value="1" />
              </div>
              <div class="grocery-price-wrap">
                <label class="grocery-label-small" for="grocery-price">R$ unit.</label>
                <input id="grocery-price" class="grocery-input grocery-price-input" type="number" inputmode="decimal" min="0" step="0.5" placeholder="0,00" />
              </div>
            </div>
          </div>

          <button id="grocery-add-btn" class="btn-primary grocery-add-btn" type="button">
            <i data-lucide="plus"></i>
            Adicionar
          </button>
        </section>

        ${groceryList.length === 0
          ? `
            <div class="grocery-empty">
              <i data-lucide="shopping-basket"></i>
              <p>Monte a lista antes de sair para ter uma projecao do total no caixa.</p>
            </div>
          `
          : `
            <div class="grocery-summary-bar">
              <span>${groceryList.length} ${groceryList.length === 1 ? 'item' : 'itens'}${checked > 0 ? ` - ${checked} marcado${checked > 1 ? 's' : ''}` : ''}</span>
              <strong class="grocery-total">${formatCurrency(total)}</strong>
            </div>

            <ul class="grocery-list">
              ${groceryList.map((item, index) => `
                <li class="grocery-item ${item.checked ? 'item-checked' : ''}">
                  <button class="grocery-check-btn" type="button" data-check="${index}" aria-label="${item.checked ? 'Desmarcar item' : 'Marcar item'}">
                    <i data-lucide="${item.checked ? 'check-circle-2' : 'circle'}"></i>
                  </button>

                  <div class="grocery-item-info">
                    <span class="grocery-item-name">${escapeHtml(item.name)}</span>
                    <span class="grocery-item-detail">${formatPlainNumber(item.qty)} x ${formatCurrency(item.price)} = <strong>${formatCurrency(item.qty * item.price)}</strong></span>
                  </div>

                  <button class="grocery-remove-btn" type="button" data-remove="${index}" aria-label="Remover item">
                    <i data-lucide="x"></i>
                  </button>
                </li>
              `).join('')}
            </ul>

            <div class="grocery-actions-bar">
              <button id="grocery-clear-checked" class="btn-secondary grocery-action-btn" type="button" ${checked === 0 ? 'disabled' : ''}>
                <i data-lucide="check-check"></i>
                Limpar marcados (${checked})
              </button>
              <button id="grocery-clear-all" class="btn-secondary grocery-action-btn grocery-danger" type="button">
                <i data-lucide="trash-2"></i>
                Limpar tudo
              </button>
            </div>
          `}

        <p class="budget-footnote">
          <i data-lucide="lightbulb"></i>
          Lance quantidade e valor unitario para prever o total antes da compra.
        </p>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelectorAll('.tools-tab').forEach((button) => {
      button.addEventListener('click', () => {
        activeTab = button.dataset.tab;
        render();
      });
    });

    if (activeTab === 'budget') {
      bindBudgetEvents();
    } else {
      bindGroceryEvents();
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
    container.querySelector('#grocery-add-btn')?.addEventListener('click', addGroceryItem);
    container.querySelector('#grocery-name')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addGroceryItem();
      }
    });

    container.querySelectorAll('[data-check]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.check);
        groceryList[index].checked = !groceryList[index].checked;
        saveGrocery(groceryList);
        render();
      });
    });

    container.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        groceryList.splice(Number(button.dataset.remove), 1);
        saveGrocery(groceryList);
        render();
      });
    });

    container.querySelector('#grocery-clear-checked')?.addEventListener('click', () => {
      groceryList = groceryList.filter((item) => !item.checked);
      saveGrocery(groceryList);
      render();
    });

    container.querySelector('#grocery-clear-all')?.addEventListener('click', () => {
      if (!window.confirm('Limpar toda a lista?')) return;
      groceryList = [];
      saveGrocery(groceryList);
      render();
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

    groceryList.push({
      id: createId(),
      name,
      qty: Math.max(0.1, toNumber(qtyInput?.value) || 1),
      price: Math.max(0, toNumber(priceInput?.value)),
      checked: false
    });

    saveGrocery(groceryList);

    if (nameInput) nameInput.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (priceInput) priceInput.value = '';

    render();
    container.querySelector('#grocery-name')?.focus();
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
    return JSON.parse(localStorage.getItem(STORAGE_KEY_GROCERY) || '[]');
  } catch {
    return [];
  }
}

function saveGrocery(data) {
  localStorage.setItem(STORAGE_KEY_GROCERY, JSON.stringify(data));
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

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
