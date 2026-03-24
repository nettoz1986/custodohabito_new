import {
  diagnosticLeadFieldOptions,
  diagnosticMeta,
  diagnosticProfileImages,
  diagnosticProfiles,
  diagnosticQuestions,
  diagnosticReportVariations
} from '../data/diagnostic-data.js';

const STORAGE_KEY = 'custodohabito_diagnostic_state_v3';
const DIAGNOSTIC_API_BASE_URL = (import.meta.env?.VITE_DIAGNOSTIC_API_BASE_URL || '').trim();
const SITE_BASE_URL = import.meta.env?.BASE_URL || '';

export function initDiagnostic() {
  const container = document.getElementById('diagnostic-container');
  if (!container) return;

  const state = createInitialState(loadSavedState());

  render();

  function render() {
    switch (state.stage) {
      case 'question':
        renderQuestion();
        return;
      case 'result':
        renderResult();
        return;
      case 'lead_form':
        renderLeadForm();
        return;
      case 'report_loading':
        renderReportLoading();
        return;
      case 'report':
        renderReport();
        return;
      case 'start':
      default:
        renderStart();
        return;
    }
  }

  function renderStart() {
    clearSavedStateIfFinished();

    container.innerHTML = `
      <section class="diagnostic-shell" aria-labelledby="diagnostic-title">
        <header class="diagnostic-hero">
          <img
            src="${resolveAssetPath('assets/logo_custodohabito.jpg')}"
            alt="Logo Custo do Habito"
            class="diagnostic-logo"
          />

          <div class="diagnostic-hero-copy">
            <span class="diagnostic-kicker">Diagnostico de habito</span>
            <h2 id="diagnostic-title">Qual logica financeira mais se aproxima do seu padrao atual?</h2>
            <p>
              Este diagnostico nao mede "certo" ou "errado".
              Ele le tendencias de comportamento, relacao com conforto, pressao do presente,
              seguranca e manutencao de padrao.
            </p>
          </div>
        </header>

        <section class="diagnostic-project-note" aria-label="Como ler este diagnostico">
          <div class="diagnostic-note-card">
            <h3>Como funciona</h3>
            <p>
              Você vai responder perguntas curtas sobre decisões do cotidiano.
              No final, o sistema identifica seu perfil predominante, perfis de apoio
              e os principais vetores que estao influenciando sua rotina financeira.
            </p>
          </div>

          <div class="diagnostic-note-card">
            <h3>Importante</h3>
            <p>
              O objetivo nao é te rotular. É te ajudar a enxergar o custo do padrão
              que está operando hoje, inclusive quando ele parece invisivel.
            </p>
          </div>
        </section>

        <section class="diagnostic-profiles" aria-label="Perfis do diagnostico">
          ${Object.entries(diagnosticProfiles).map(([key, profile]) => `
            <article class="diagnostic-profile-card" data-profile-card="${key}">
              <img src="${profileImageFor(key)}" alt="${escapeHtml(profile.name)}" />
              <h3>${escapeHtml(profile.name)}</h3>
              <p>${escapeHtml(profile.shortReading ?? profile.reading)}</p>
            </article>
          `).join('')}
        </section>

        <div class="diagnostic-actions">
          <button class="btn-primary" id="diagnostic-start-btn" type="button">
            <i data-lucide="play"></i>
            Comecar diagnostico
          </button>
          ${state.answers.length > 0 ? `
            <button class="btn-secondary" id="diagnostic-resume-btn" type="button">
              Continuar de onde parei
            </button>
          ` : ''}
        </div>

        <p class="diagnostic-disclaimer">Este diagnostico possui fins educacionais e de autoconhecimento.</p>
      </section>
    `;

    container.querySelector('#diagnostic-start-btn')?.addEventListener('click', () => {
      resetState();
      state.stage = 'question';
      saveState();
      render();
    });

    container.querySelector('#diagnostic-resume-btn')?.addEventListener('click', () => {
      state.stage = resolveResumeStage();
      render();
    });

    createIcons();
  }

  function renderQuestion() {
    const question = diagnosticQuestions[state.currentQuestion];
    const progress = Math.round((state.currentQuestion / diagnosticQuestions.length) * 100);

    container.innerHTML = `
      <section class="diagnostic-shell" aria-labelledby="diagnostic-question-title">
        <div class="progress-container" aria-label="Progresso do diagnostico">
          <div
            id="progress-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="${progress}"
            style="width:${progress}%"
          ></div>
        </div>

        <div class="diagnostic-question-card">
          <div class="diagnostic-question-header">
            <span class="diagnostic-kicker">Pergunta ${state.currentQuestion + 1} de ${diagnosticQuestions.length}</span>
            <button class="diagnostic-link-btn" id="diagnostic-exit-btn" type="button">
              Salvar e sair
            </button>
          </div>

          <h3 id="diagnostic-question-title">${escapeHtml(question.q)}</h3>

          ${question.supportText ? `
            <p class="diagnostic-support-text">${escapeHtml(question.supportText)}</p>
          ` : ''}

          <div class="diagnostic-options" role="list" aria-label="Opcoes de resposta">
            ${question.options.map((option, index) => `
              <button
                class="diagnostic-option"
                type="button"
                data-index="${index}"
                aria-describedby="option-helper-${index}"
              >
                <span class="diagnostic-option-text">${escapeHtml(option.t)}</span>
                ${option.hint ? `<span class="diagnostic-option-hint" id="option-helper-${index}">${escapeHtml(option.hint)}</span>` : ''}
              </button>
            `).join('')}
          </div>

          <div class="diagnostic-footer-actions">
            <button
              class="btn-secondary"
              id="diagnostic-back-btn"
              type="button"
              ${state.currentQuestion === 0 ? 'disabled' : ''}
            >
              Voltar
            </button>
          </div>
        </div>
      </section>
    `;

    container.querySelectorAll('.diagnostic-option').forEach((button) => {
      button.addEventListener('click', () => {
        handleAnswer(Number(button.dataset.index));
      });
    });

    container.querySelector('#diagnostic-back-btn')?.addEventListener('click', goBackOneStep);
    container.querySelector('#diagnostic-exit-btn')?.addEventListener('click', () => {
      saveState();
      state.stage = 'start';
      render();
    });

    createIcons();
  }

  function renderResult() {
    const result = getCurrentResult();

    container.innerHTML = `
      <section class="diagnostic-shell" aria-labelledby="diagnostic-result-title">
        <div class="diagnostic-result">
          <img
            src="${profileImageFor(result.primary.key)}"
            alt="${escapeHtml(result.primary.name)}"
            class="diagnostic-result-image"
          />

          <span class="badge">Leitura predominante</span>
          <h2 id="diagnostic-result-title" class="diagnostic-result-name">${escapeHtml(result.primary.name)}</h2>
          <p class="diagnostic-result-reading">${escapeHtml(result.primary.reading)}</p>

          ${result.secondary ? `
            <div class="diagnostic-blend-card">
              <div class="report-section-label">Composicao do seu padrao</div>
              <p>${escapeHtml(result.blendReading)}</p>
            </div>
          ` : ''}

          <div class="diagnostic-score-strip" aria-label="Distribuicao dos perfis">
            ${result.ranking.map((item) => `
              <div class="diagnostic-score-item">
                <span class="diagnostic-score-name">${escapeHtml(item.name)}</span>
                <strong>${item.percent}%</strong>
              </div>
            `).join('')}
          </div>

          <div class="report-section strength">
            <div class="report-section-label">Sua principal força</div>
            <p>${escapeHtml(result.primary.strength)}</p>
          </div>

          <div class="report-section warning">
            <div class="report-section-label">Ponto de atencao</div>
            <p>${escapeHtml(result.primary.warning)}</p>
          </div>

          <div class="report-section action">
            <div class="report-section-label">Direcao sugerida</div>
            <p>${escapeHtml(result.guidance)}</p>
          </div>

          ${result.patternSummary ? `
            <div class="diagnostic-summary-card">
              <div class="report-section-label">Leitura do padrão</div>
              <p>${escapeHtml(result.patternSummary)}</p>
            </div>
          ` : ''}

          <div class="diagnostic-actions">
            <button class="btn-primary" id="diagnostic-report-btn" type="button">
              <i data-lucide="file-text"></i>
              Gerar relatorio completo gratis
            </button>

            <button class="btn-secondary" id="diagnostic-restart-btn" type="button">
              Refazer diagnostico
            </button>
          </div>
        </div>
      </section>
    `;

    container.querySelector('#diagnostic-report-btn')?.addEventListener('click', () => {
      state.resultSnapshot = result;
      state.formError = '';
      state.submissionNotice = null;
      state.stage = 'lead_form';
      saveState();
      render();
    });

    container.querySelector('#diagnostic-restart-btn')?.addEventListener('click', () => {
      restartDiagnostic();
    });

    createIcons();
    saveState();
  }

  function renderLeadForm() {
    const result = getCurrentResult();
    const leadForm = state.leadForm;

    container.innerHTML = `
      <section class="diagnostic-shell" aria-labelledby="diagnostic-lead-title">
        <div class="diagnostic-question-card diagnostic-phase-card">
          <div class="phase2-header">
            <div class="profile-chip">
              <span>Perfil predominante</span>
              <strong>${escapeHtml(result.primary.name)}</strong>
            </div>
            <h2 id="diagnostic-lead-title">Agora vamos personalizar seu diagnostico</h2>
            <p>Preencha os dados abaixo para cruzar essa leitura com sua realidade e gerar um relatorio mais completo.</p>
          </div>

          ${renderNotice(state.submissionNotice)}

          <div class="form-group">
            <label for="diagnostic-email">Seu melhor e-mail</label>
            <input
              type="email"
              id="diagnostic-email"
              placeholder="Onde voce quer receber contato sobre o diagnostico?"
              value="${escapeAttribute(leadForm.email)}"
              required
            />
          </div>

          <div class="form-group">
            <label for="diagnostic-profissao">Sua profissao / atividade</label>
            <input
              type="text"
              id="diagnostic-profissao"
              placeholder="Ex: Advogada, vendedora, professora..."
              value="${escapeAttribute(leadForm.profissao)}"
              required
            />
          </div>

          <div class="form-group">
            <label for="diagnostic-renda">Renda liquida mensal</label>
            <select id="diagnostic-renda" required>
              <option value="">Selecione uma faixa...</option>
              ${renderSelectOptions(diagnosticLeadFieldOptions.renda, leadForm.renda)}
            </select>
          </div>

          <div class="form-group">
            <label for="diagnostic-comprometido">Gastos fixos (aluguel, contas, parcelas)</label>
            <select id="diagnostic-comprometido" required>
              <option value="">Quanto da renda vai para fixos?</option>
              ${renderSelectOptions(diagnosticLeadFieldOptions.comprometido, leadForm.comprometido)}
            </select>
          </div>

          <div class="form-group">
            <label>Seguranca para o futuro</label>
            <div class="radio-group" id="diagnostic-previdencia-group">
              ${renderRadioOptions(diagnosticLeadFieldOptions.previdencia, leadForm.previdencia)}
            </div>
          </div>

          <div class="privacy-check">
            <input type="checkbox" id="diagnostic-privacy-accept" ${leadForm.privacyAccepted ? 'checked' : ''} />
            <label for="diagnostic-privacy-accept">
              Li e concordo com a <a href="#" id="diagnostic-open-privacy">Política de Privacidade</a>.
              Autorizo o uso dos meus dados coletados para envio do diagnóstico e comunicações do Custo do Hábito.
            </label>
          </div>

          <p class="error-msg ${state.formError ? 'visible' : ''}" id="diagnostic-form-error">
            ${escapeHtml(state.formError || '')}
          </p>

          <div class="diagnostic-actions">
            <button class="btn-primary" id="diagnostic-generate-report-btn" type="button">
              <i data-lucide="sparkles"></i>
              Gerar meu diagnostico
            </button>
            <button class="btn-secondary" id="diagnostic-back-to-result-btn" type="button">
              Voltar
            </button>
          </div>
        </div>
      </section>
    `;

    container.querySelector('#diagnostic-generate-report-btn')?.addEventListener('click', handleLeadFormSubmit);
    container.querySelector('#diagnostic-back-to-result-btn')?.addEventListener('click', () => {
      state.formError = '';
      state.submissionNotice = null;
      state.stage = 'result';
      saveState();
      render();
    });
    container.querySelector('#diagnostic-open-privacy')?.addEventListener('click', openPrivacyModal);

    container.querySelectorAll('input[name="diagnostic-previdencia"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        toggleRadioSelection();
      });
    });

    createIcons();
    toggleRadioSelection();
  }

  function renderReportLoading() {
    const result = getCurrentResult();

    container.innerHTML = `
      <section class="diagnostic-shell" aria-labelledby="diagnostic-report-loading-title">
        <div class="diagnostic-result diagnostic-report-screen">
          <div class="report-header">
            <div class="report-title">Relatorio completo</div>
            <h2 id="diagnostic-report-loading-title" class="report-name">${escapeHtml(result.primary.name)}</h2>
            <p class="diagnostic-report-disclaimer">
              Estamos cruzando suas respostas com os dados informados para gerar uma leitura mais clara e acessivel.
            </p>
          </div>

          <div class="loading-container">
            <div class="loading-dots"><span></span><span></span><span></span></div>
            <p class="loading-text">Enviando seu cadastro com consentimento e preparando o relatorio...</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderReport() {
    const result = getCurrentResult();
    const reportData = state.reportData || buildPersonalizedReport(result, state.leadForm);

    container.innerHTML = `
      <section class="diagnostic-shell" aria-labelledby="diagnostic-report-title">
        <div class="diagnostic-result diagnostic-report-screen">
          <div class="report-header">
            <div class="report-title">Diagnostico completo</div>
            <h2 id="diagnostic-report-title" class="report-name">${escapeHtml(result.primary.name)}</h2>
            <span class="badge report-badge-prof">${escapeHtml(state.leadForm.profissao || 'Leitura personalizada')}</span>
            <p class="diagnostic-report-disclaimer">
              Esta leitura foi montada localmente com base nas suas respostas e nos dados que voce informou.
              E um conteudo educacional, nao consultoria financeira individual.
            </p>
          </div>

          ${renderNotice(state.submissionNotice)}

          ${result.secondary ? `
            <div class="diagnostic-blend-card">
              <div class="report-section-label">Composicao do seu padrao</div>
              <p>${escapeHtml(result.blendReading)}</p>
            </div>
          ` : ''}

          <div class="diagnostic-axis-grid" aria-label="Vetores do seu padrao">
            ${reportData.axisHighlights.map((axis) => `
              <div class="diagnostic-axis-card">
                <div class="report-section-label">${escapeHtml(axis.label)}</div>
                <p>${escapeHtml(axis.reading)}</p>
              </div>
            `).join('')}
          </div>

          <div class="report-section context">
            <div class="report-section-label">Sua realidade hoje</div>
            <p>${escapeHtml(reportData.context)}</p>
          </div>

          <div class="report-section strength">
            <div class="report-section-label">Sua principal força</div>
            <p>${escapeHtml(reportData.strength)}</p>
          </div>

          <div class="report-section warning">
            <div class="report-section-label">Ponto de atenção</div>
            <p>${escapeHtml(reportData.alert)}</p>
          </div>

          <div class="report-section action">
            <div class="report-section-label">Ação prática</div>
            <p>${escapeHtml(reportData.action)}</p>
          </div>

          <div class="diagnostic-summary-card diagnostic-summary-card-report">
            <div class="report-section-label">Leitura acessivel do padrão</div>
            <p>${escapeHtml(reportData.patternSummary)}</p>
          </div>

          <div class="diagnostic-actions">
            <button class="btn-secondary" id="diagnostic-review-data-btn" type="button">
              Ajustar dados do relatorio
            </button>
            <button class="btn-secondary" id="diagnostic-restart-report-btn" type="button">
              Refazer diagnostico
            </button>
          </div>
        </div>
      </section>
    `;

    container.querySelector('#diagnostic-review-data-btn')?.addEventListener('click', () => {
      state.formError = '';
      state.submissionNotice = null;
      state.stage = 'lead_form';
      saveState();
      render();
    });

    container.querySelector('#diagnostic-restart-report-btn')?.addEventListener('click', () => {
      restartDiagnostic();
    });

    createIcons();
    clearSavedState();
  }

  function handleAnswer(optionIndex) {
    const question = diagnosticQuestions[state.currentQuestion];
    const option = question?.options?.[optionIndex];
    if (!question || !option) return;

    const answerPayload = {
      questionId: question.id ?? `q_${state.currentQuestion + 1}`,
      question: question.q,
      optionIndex,
      optionText: option.t,
      profileKey: option.p ?? null,
      weights: option.weights ?? null,
      axis: option.axis ?? null,
      answeredAt: new Date().toISOString()
    };

    state.answers[state.currentQuestion] = answerPayload;
    applyScoresFromOption(option);
    state.currentQuestion += 1;
    state.formError = '';
    state.submissionNotice = null;
    state.reportData = null;
    state.resultSnapshot = null;

    if (state.currentQuestion >= diagnosticQuestions.length) {
      state.stage = 'result';
    } else {
      state.stage = 'question';
    }

    saveState();
    render();
  }

  function goBackOneStep() {
    if (state.currentQuestion === 0) return;

    const previousIndex = state.currentQuestion - 1;
    const previousAnswer = state.answers[previousIndex];
    if (previousAnswer) {
      rollbackScoresFromAnswer(previousAnswer);
      state.answers.splice(previousIndex, 1);
    }

    state.currentQuestion = previousIndex;
    state.stage = 'question';
    state.resultSnapshot = null;
    state.reportData = null;
    saveState();
    render();
  }

  async function handleLeadFormSubmit() {
    const leadForm = readLeadFormFromDom();
    const validationError = validateLeadForm(leadForm);

    state.leadForm = leadForm;
    state.formError = validationError;
    state.submissionNotice = null;

    if (validationError) {
      saveState();
      render();
      return;
    }

    const result = getCurrentResult();
    const reportData = buildPersonalizedReport(result, leadForm);

    state.resultSnapshot = result;
    state.reportData = reportData;
    state.stage = 'report_loading';
    saveState();
    render();

    try {
      const notice = await submitDiagnosticLead(buildLeadPayload(result, leadForm, reportData));
      state.submissionNotice = notice;
      state.stage = 'report';
      saveState();
      render();
    } catch (error) {
      state.submissionNotice = {
        type: 'error',
        message: error.message || 'Nao foi possivel enviar seus dados agora. Confira as informacoes e tente novamente.'
      };
      state.stage = 'lead_form';
      saveState();
      render();
    }
  }

  function applyScoresFromOption(option) {
    if (option.weights && typeof option.weights === 'object') {
      Object.entries(option.weights).forEach(([profileKey, value]) => {
        if (typeof state.scores[profileKey] === 'number') {
          state.scores[profileKey] += Number(value) || 0;
        }
      });
    } else if (option.p && typeof state.scores[option.p] === 'number') {
      state.scores[option.p] += 1;
    }

    if (option.axis && typeof option.axis === 'object') {
      Object.entries(option.axis).forEach(([axisKey, value]) => {
        if (typeof state.axes[axisKey] === 'number') {
          state.axes[axisKey] += Number(value) || 0;
        }
      });
    }
  }

  function rollbackScoresFromAnswer(answer) {
    if (answer.weights && typeof answer.weights === 'object') {
      Object.entries(answer.weights).forEach(([profileKey, value]) => {
        if (typeof state.scores[profileKey] === 'number') {
          state.scores[profileKey] -= Number(value) || 0;
        }
      });
    } else if (answer.profileKey && typeof state.scores[answer.profileKey] === 'number') {
      state.scores[answer.profileKey] -= 1;
    }

    if (answer.axis && typeof answer.axis === 'object') {
      Object.entries(answer.axis).forEach(([axisKey, value]) => {
        if (typeof state.axes[axisKey] === 'number') {
          state.axes[axisKey] -= Number(value) || 0;
        }
      });
    }
  }

  function getCurrentResult() {
    if (state.resultSnapshot) return state.resultSnapshot;
    const result = computeResult();
    state.resultSnapshot = result;
    return result;
  }

  function computeResult() {
    const ranking = Object.entries(state.scores)
      .map(([key, score]) => ({
        key,
        score,
        ...diagnosticProfiles[key]
      }))
      .sort((a, b) => b.score - a.score);

    const totalScore = ranking.reduce((sum, item) => sum + item.score, 0) || 1;
    const primary = ranking[0];
    const secondary = ranking[1] && ranking[1].score > 0 ? ranking[1] : null;

    const rankedWithPercent = ranking.map((item) => ({
      ...item,
      percent: Math.round((item.score / totalScore) * 100)
    }));

    const axes = buildAxisReadings(state.axes);
    const blendReading = buildBlendReading(primary, secondary);
    const patternSummary = buildPatternSummary(primary, secondary, axes);
    const guidance = buildGuidance(primary, secondary, axes);

    return {
      primary,
      secondary,
      ranking: rankedWithPercent,
      axes,
      blendReading,
      patternSummary,
      guidance
    };
  }

  function buildAxisReadings(axisScores) {
    const meta = diagnosticMeta?.axes ?? {};
    return Object.entries(axisScores)
      .map(([key, value]) => {
        const config = meta[key];
        if (!config) return null;

        return {
          key,
          label: config.label,
          value,
          reading: resolveAxisReading(config, value)
        };
      })
      .filter(Boolean);
  }

  function resolveAxisReading(config, value) {
    if (!config.ranges) return '';

    const matched = config.ranges.find((range) => value >= range.min && value <= range.max);
    return matched?.text ?? config.fallback ?? '';
  }

  function buildBlendReading(primary, secondary) {
    if (!secondary) {
      return primary.blendSoloReading
        ?? `Seu resultado mostra predominancia de ${primary.name}, sem uma segunda força tao proxima no momento.`;
    }

    const blendMap = diagnosticMeta?.blendReadings ?? {};
    const keyA = `${primary.key}+${secondary.key}`;
    const keyB = `${secondary.key}+${primary.key}`;

    return blendMap[keyA]
      ?? blendMap[keyB]
      ?? `Seu padrao atual mistura tracos de ${primary.name} com ${secondary.name}. Isso sugere uma força principal convivendo com uma segunda tendencia importante nas suas escolhas.`;
  }

  function buildPatternSummary(primary, secondary, axes) {
    const strongAxes = axes
      .filter((axis) => axis.reading)
      .slice(0, 3)
      .map((axis) => axis.label.toLowerCase());

    if (!secondary) {
      return `Hoje, seu padrao aparece mais concentrado em ${primary.name}. ${strongAxes.length ? `Os vetores que mais apareceram foram ${joinHuman(strongAxes)}.` : ''}`;
    }

    return `Seu padrao atual nao esta operando em linha unica. A base predominante e ${primary.name}, mas existe influencia relevante de ${secondary.name}. ${strongAxes.length ? `Os vetores mais visíveis foram ${joinHuman(strongAxes)}.` : ''}`;
  }

  function buildGuidance(primary, secondary, axes) {
    const projectGuidance = diagnosticMeta?.projectGuidance ?? {};

    if (secondary) {
      const pairKeyA = `${primary.key}+${secondary.key}`;
      const pairKeyB = `${secondary.key}+${primary.key}`;

      if (projectGuidance[pairKeyA]) return projectGuidance[pairKeyA];
      if (projectGuidance[pairKeyB]) return projectGuidance[pairKeyB];
    }

    const strongestAxis = [...axes].sort((a, b) => b.value - a.value)[0];
    if (strongestAxis && projectGuidance[`axis:${strongestAxis.key}`]) {
      return projectGuidance[`axis:${strongestAxis.key}`];
    }

    return primary.counsel ?? 'O proximo passo e transformar essa leitura em uma decisao pratica do seu cotidiano.';
  }

  function buildPersonalizedReport(result, leadForm) {
    const profileVariations = diagnosticReportVariations[result.primary.key] || diagnosticReportVariations.lia;
    const rankingSeed = result.ranking.reduce((sum, item, index) => sum + ((index + 1) * item.score), 0);
    const answerSeed = state.answers.reduce((sum, answer, index) => sum + ((index + 1) * ((answer.optionIndex ?? 0) + 1)), 0);
    const seed = rankingSeed + answerSeed;

    const contextData = {
      email: leadForm.email,
      profissao: safeInlineText(leadForm.profissao),
      rendaLabel: getOptionLabel(diagnosticLeadFieldOptions.renda, leadForm.renda),
      comprometidoLabel: getOptionLabel(diagnosticLeadFieldOptions.comprometido, leadForm.comprometido),
      previdenciaLabel: getOptionLabel(diagnosticLeadFieldOptions.previdencia, leadForm.previdencia),
      primaryName: result.primary.name,
      secondaryName: result.secondary?.name || ''
    };

    const topAxes = [...result.axes]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return {
      context: pickVariation(profileVariations.context, seed)(contextData),
      strength: pickVariation(profileVariations.strength, seed + 1)(contextData),
      alert: pickVariation(profileVariations.alert, seed + 2)(contextData),
      action: pickVariation(profileVariations.action, seed + 3)(contextData),
      patternSummary: buildReadableReportSummary(result, topAxes),
      axisHighlights: topAxes.length ? topAxes : result.axes.slice(0, 3)
    };
  }

  function buildReadableReportSummary(result, topAxes) {
    const axisLabels = topAxes
      .filter((axis) => axis.reading)
      .map((axis) => axis.label.toLowerCase());

    if (result.secondary) {
      return `Sua leitura predominante hoje foi ${result.primary.name}, com influencia relevante de ${result.secondary.name}. ${axisLabels.length ? `Os vetores mais fortes apareceram em ${joinHuman(axisLabels)}.` : ''} O ponto nao e se enquadrar em um rotulo, e entender qual logica esta puxando suas decisoes com mais frequencia.`;
    }

    return `Sua leitura predominante hoje foi ${result.primary.name}. ${axisLabels.length ? `Os vetores mais fortes apareceram em ${joinHuman(axisLabels)}.` : ''} Isso ajuda a enxergar com mais clareza onde o seu padrao esta protegendo a estrutura e onde ele pode estar criando custo ao longo do tempo.`;
  }

  function readLeadFormFromDom() {
    return {
      email: container.querySelector('#diagnostic-email')?.value?.trim() || state.leadForm.email,
      profissao: container.querySelector('#diagnostic-profissao')?.value?.trim() || state.leadForm.profissao,
      renda: container.querySelector('#diagnostic-renda')?.value || state.leadForm.renda,
      comprometido: container.querySelector('#diagnostic-comprometido')?.value || state.leadForm.comprometido,
      previdencia: container.querySelector('input[name="diagnostic-previdencia"]:checked')?.value || state.leadForm.previdencia,
      privacyAccepted: Boolean(container.querySelector('#diagnostic-privacy-accept')?.checked)
    };
  }

  function validateLeadForm(leadForm) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!leadForm.email || !emailRegex.test(leadForm.email)) {
      return 'Informe um e-mail valido para continuar.';
    }

    if (!leadForm.profissao) {
      return 'Preencha sua profissao ou atividade.';
    }

    if (!leadForm.renda || !leadForm.comprometido || !leadForm.previdencia) {
      return 'Preencha todos os campos obrigatorios antes de gerar o relatorio.';
    }

    if (!leadForm.privacyAccepted) {
      return 'Voce precisa aceitar a Politica de Privacidade para continuar.';
    }

    return '';
  }

  function buildLeadPayload(result, leadForm, reportData) {
    return {
      email: leadForm.email,
      profissao: leadForm.profissao,
      renda: leadForm.renda,
      comprometido: leadForm.comprometido,
      previdencia: leadForm.previdencia,
      privacyAccepted: leadForm.privacyAccepted,
      profilePrimary: {
        key: result.primary.key,
        name: result.primary.name
      },
      profileSecondary: result.secondary ? {
        key: result.secondary.key,
        name: result.secondary.name
      } : null,
      scores: { ...state.scores },
      axes: { ...state.axes },
      answers: [...state.answers],
      report: { ...reportData },
      source: 'diagnostic',
      submittedAt: new Date().toISOString()
    };
  }

  async function submitDiagnosticLead(payload) {
    const apiUrl = resolveDiagnosticApiUrl();

    if (!apiUrl) {
      if (isLocalEnvironment()) {
        return {
          type: 'info',
          message: 'Ambiente local detectado: o relatorio foi gerado sem envio para API externa.'
        };
      }

      throw new Error('A integracao do diagnostico ainda nao esta configurada neste ambiente.');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `Falha ao enviar o diagnostico (${response.status}).`);
    }

    return {
      type: 'success',
      message: 'Cadastro recebido com sucesso. Seu relatorio foi gerado abaixo.'
    };
  }

  function resolveDiagnosticApiUrl() {
    if (!DIAGNOSTIC_API_BASE_URL) return null;
    return `${DIAGNOSTIC_API_BASE_URL.replace(/\/$/, '')}/api/diagnostic-leads`;
  }

  function isLocalEnvironment() {
    if (import.meta.env?.DEV) return true;
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }

  function saveState() {
    const payload = {
      currentQuestion: state.currentQuestion,
      stage: state.stage,
      scores: state.scores,
      axes: state.axes,
      answers: state.answers,
      leadForm: state.leadForm,
      reportData: state.reportData,
      resultSnapshot: state.resultSnapshot,
      submissionNotice: state.submissionNotice,
      formError: state.formError
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Nao foi possivel salvar o estado do diagnostico.', error);
    }
  }

  function loadSavedState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Nao foi possivel carregar o estado salvo do diagnostico.', error);
      return null;
    }
  }

  function clearSavedState() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Nao foi possivel limpar o estado salvo do diagnostico.', error);
    }
  }

  function clearSavedStateIfFinished() {
    if (state.answers.length === 0) return;
    if (state.answers.length >= diagnosticQuestions.length && state.stage === 'start') {
      clearSavedState();
      resetState();
    }
  }

  function restartDiagnostic() {
    resetState();
    clearSavedState();
    render();
  }

  function resetState() {
    state.currentQuestion = 0;
    state.stage = 'start';
    state.scores = createEmptyScores();
    state.axes = createEmptyAxes();
    state.answers = [];
    state.leadForm = createEmptyLeadForm();
    state.reportData = null;
    state.resultSnapshot = null;
    state.submissionNotice = null;
    state.formError = '';
  }

  function createInitialState(savedState) {
    const base = {
      currentQuestion: 0,
      stage: 'start',
      scores: createEmptyScores(),
      axes: createEmptyAxes(),
      answers: [],
      leadForm: createEmptyLeadForm(),
      reportData: null,
      resultSnapshot: null,
      submissionNotice: null,
      formError: ''
    };

    if (!savedState) return base;

    const normalizedStage = savedState.stage === 'report_loading'
      ? 'lead_form'
      : savedState.stage || 'start';

    return {
      currentQuestion: Number(savedState.currentQuestion) || 0,
      stage: normalizedStage,
      scores: { ...createEmptyScores(), ...(savedState.scores || {}) },
      axes: { ...createEmptyAxes(), ...(savedState.axes || {}) },
      answers: Array.isArray(savedState.answers) ? savedState.answers : [],
      leadForm: { ...createEmptyLeadForm(), ...(savedState.leadForm || {}) },
      reportData: savedState.reportData || null,
      resultSnapshot: savedState.resultSnapshot || null,
      submissionNotice: savedState.submissionNotice || null,
      formError: savedState.formError || ''
    };
  }

  function createEmptyScores() {
    return Object.keys(diagnosticProfiles).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
  }

  function createEmptyAxes() {
    const axisKeys = Object.keys(diagnosticMeta?.axes || {});
    return axisKeys.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
  }

  function createEmptyLeadForm() {
    return {
      email: '',
      profissao: '',
      renda: '',
      comprometido: '',
      previdencia: '',
      privacyAccepted: false
    };
  }

  function resolveResumeStage() {
    if (!state.answers.length) return 'question';
    if (state.stage === 'report' && state.reportData) return 'report';
    if (state.stage === 'lead_form') return 'lead_form';
    if (state.answers.length >= diagnosticQuestions.length) return 'result';
    return 'question';
  }

  function renderSelectOptions(options, selectedValue) {
    return options.map((option) => `
      <option value="${escapeAttribute(option.value)}" ${option.value === selectedValue ? 'selected' : ''}>
        ${escapeHtml(option.label)}
      </option>
    `).join('');
  }

  function renderRadioOptions(options, selectedValue) {
    return options.map((option) => `
      <label class="radio-option ${option.value === selectedValue ? 'selected' : ''}">
        <input
          type="radio"
          name="diagnostic-previdencia"
          value="${escapeAttribute(option.value)}"
          ${option.value === selectedValue ? 'checked' : ''}
        />
        <span>${escapeHtml(option.label)}</span>
      </label>
    `).join('');
  }

  function toggleRadioSelection() {
    container.querySelectorAll('.radio-option').forEach((option) => {
      const radio = option.querySelector('input[type="radio"]');
      option.classList.toggle('selected', Boolean(radio?.checked));
    });
  }

  function renderNotice(notice) {
    if (!notice?.message) return '';
    return `<div class="send-notice ${escapeAttribute(notice.type || 'info')}">${escapeHtml(notice.message)}</div>`;
  }

  function getOptionLabel(options, value) {
    return options.find((option) => option.value === value)?.label || value || '';
  }

  function pickVariation(variations, seed) {
    const items = Array.isArray(variations) ? variations : [];
    if (!items.length) {
      return () => '';
    }

    const index = Math.abs(seed) % items.length;
    return items[index];
  }

  function openPrivacyModal(event) {
    event?.preventDefault();
    document.getElementById('privacy-modal')?.classList.remove('hidden');
  }

  function createIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  function joinHuman(items) {
    if (!items.length) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} e ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
  }
}

function profileImageFor(profileKey) {
  return resolveAssetPath(diagnosticProfileImages[profileKey] || 'assets/logo_custodohabito.jpg');
}

function resolveAssetPath(assetPath) {
  const normalizedPath = String(assetPath || '')
    .replace(/^\/+/, '')
    .replace(/^public\//, '');

  if (SITE_BASE_URL) {
    return `${SITE_BASE_URL.replace(/\/?$/, '/')}${normalizedPath}`;
  }

  return `/public/${normalizedPath}`;
}

function safeInlineText(value) {
  return String(value || '')
    .replace(/[<>"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
