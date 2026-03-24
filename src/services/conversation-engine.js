import {
  agentKnowledge,
  fallbackScenarios,
  fieldCatalog,
  detectTheme,
  findRelevantKnowledge,
  getThemeById,
  normalizeText,
  classifyConversationEntry,
  getNextBestQuestions,
  buildDiagnosticAwarePrompt
} from '../data/agent-knowledge.js';

const conceptLibrary = [
  {
    id: 'orcamento',
    triggers: ['orcamento', 'organizar', 'controle financeiro', 'mapa financeiro', 'planejamento'],
    response: {
      reading: 'Orçamento não precisa funcionar como punição. Ele serve para mostrar quanto custa sustentar o seu mês antes de tentar acelerar qualquer meta.',
      pattern: 'Um padrão comum aqui é gastar por blocos invisíveis: fixos, variáveis, recorrências pequenas e metas que nunca entram no calendário.',
      impact: 'Sem esse mapa, o dinheiro some dentro do automático e fica difícil saber se falta renda, margem ou priorização.',
      awareness: 'Vale observar menos a categoria isolada e mais o desenho inteiro do mês.',
      nextStep: 'Comece separando em quatro blocos: essenciais, estilo de vida, segurança e metas.'
    }
  },
  {
    id: 'reserva',
    triggers: ['reserva', 'emergencia', 'imprevisto', 'colchao financeiro'],
    response: {
      reading: 'Reserva de emergência não é sobre rentabilidade máxima. É sobre proteger seu caixa quando a vida sai do roteiro.',
      pattern: 'Muita gente tenta investir antes de ter base mínima e acaba desmontando tudo no primeiro imprevisto.',
      impact: 'Sem reserva, qualquer desvio pressiona cartão, atrasa conta ou empurra decisões ruins.',
      awareness: 'Liquidez também tem valor. Tranquilidade tem custo, mas desespero custa mais.',
      nextStep: 'Se você ainda não tem base, mire primeiro um mês de custo essencial e depois expanda.'
    }
  },
  {
    id: 'dividas',
    triggers: ['divida', 'rotativo', 'cheque especial', 'renegociar', 'juros altos'],
    response: {
      reading: 'Dívida quase nunca nasce só de uma conta isolada. Normalmente ela revela pressão estrutural, falta de margem ou desorganização de fluxo.',
      pattern: 'Um padrão comum é usar crédito para proteger o presente enquanto compromissos antigos continuam comprimindo o mês.',
      impact: 'Quando entram juros ruins, o problema deixa de ser só aperto e vira perda de patrimônio líquido.',
      awareness: 'Nem toda dívida pesa igual. Taxa, atraso e impacto emocional importam na ordem de ataque.',
      nextStep: 'Monte um raio-X com valor total, taxa, parcela e atraso de cada dívida.'
    }
  },
  {
    id: 'juros_compostos',
    triggers: ['juros compostos', 'rendimento', 'render', 'investimento'],
    response: {
      reading: 'Juros compostos são o efeito de um valor render em cima dele mesmo ao longo do tempo.',
      pattern: 'No lado bom eles ajudam patrimônio; no lado ruim eles fazem dívida cara crescer rápido.',
      impact: 'Tempo e constância pesam mais do que tentar acertar um movimento heroico.',
      awareness: 'O mesmo mecanismo que ajuda a construir também pune quando você deve caro.',
      nextStep: 'Antes de buscar taxa perfeita, alinhe prazo, liquidez e consistência de aporte.'
    }
  },
  {
    id: 'consumo_consciente',
    triggers: ['consumo consciente', 'impulso', 'consumo emocional', 'gasto impulsivo'],
    response: {
      reading: 'Consumo consciente não é viver travado. É entender o que a compra está resolvendo de verdade.',
      pattern: 'Muitas compras respondem mais a cansaço, fricção e recompensa do que a necessidade real.',
      impact: 'Quando o gasto vira alívio recorrente, ele pesa pouco por vez e muito no acumulado.',
      awareness: 'O gatilho vem antes da compra. Ler o contexto vale mais do que só tentar se proibir.',
      nextStep: 'Crie tempo entre vontade e compra nas categorias em que você mais se arrepende.'
    }
  }
];

/* =========================
   Helpers de parsing
========================= */

function parseDecimal(value) {
  if (!value) return null;
  const normalized = String(value).replace(/\./g, '').replace(',', '.');
  if (!normalized.trim()) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBooleanValue(normalized, trueWords, falseWords) {
  if (trueWords.some((word) => normalized.includes(word))) return true;
  if (falseWords.some((word) => normalized.includes(word))) return false;
  return null;
}

function extractPercent(message, patterns) {
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return parseDecimal(match[1]);
  }
  return null;
}

function extractMoney(message, patterns) {
  for (const pattern of patterns) {
    const match = message.match(pattern);
    const value = match?.[1] || match?.[2];
    if (value) return parseDecimal(value);
  }
  return null;
}

function extractFirstMoney(message) {
  const match = message.match(/r\$\s*([\d\.\,]+)/i);
  return match?.[1] ? parseDecimal(match[1]) : null;
}

/* =========================
   Intenção e conceitos
========================= */

function detectIntent(normalized, previousState) {
  const classified = classifyConversationEntry(normalized);

  if (classified === 'decision') return 'decision';
  if (classified === 'pattern') return 'pattern';

  const fromConcept = ['o que e', 'oque e', 'explique', 'como funciona', 'quero entender', 'me explique'].some((trigger) =>
    normalized.includes(trigger)
  );

  const fromPlanning = ['me ajuda', 'monte', 'crie um plano', 'plano', 'passo a passo', 'trilha'].some((trigger) =>
    normalized.includes(trigger)
  );

  if (fromPlanning) return 'planning';
  if (fromConcept) return 'concept';
  if (previousState?.stage === 'coleta_decisao') return 'decision';
  if (previousState?.stage === 'coleta_padrao') return 'pattern';

  return 'open';
}

function findFallbackScenario(normalized) {
  return fallbackScenarios.find((scenario) =>
    scenario.triggers.some((trigger) => normalized.includes(trigger))
  ) || null;
}

function findConcept(normalized) {
  return conceptLibrary.find((item) =>
    item.triggers.some((trigger) => normalized.includes(trigger))
  ) || null;
}

/* =========================
   Extração de dados
========================= */

function extractData(message, normalized, themeId) {
  const data = {};

  const totalCardPatterns = ['pago a fatura total', 'pago a fatura toda', 'pago a fatura integral', 'pago 100% da fatura', 'quito a fatura'];
  const partialCardPatterns = ['pago parcial', 'pago parte da fatura', 'parcial da fatura', 'minimo da fatura'];
  const delayCardPatterns = ['atraso a fatura', 'atraso as vezes', 'as vezes atraso', 'ja atrasei'];
  const noCardPatterns = ['nao uso cartao', 'nao uso credito', 'nem uso cartao'];

  if (totalCardPatterns.some((term) => normalized.includes(term))) data.perfil_cartao = 'paga_total';
  if (partialCardPatterns.some((term) => normalized.includes(term))) data.perfil_cartao = 'parcial';
  if (delayCardPatterns.some((term) => normalized.includes(term))) data.perfil_cartao = 'atrasa_as_vezes';
  if (noCardPatterns.some((term) => normalized.includes(term))) data.perfil_cartao = 'nao_usa';

  const parcelContext = /(parcel|parcela|x no cartao|x no credito|crediario)/.test(normalized);
  if (normalized.includes('sem juros')) data.parcelamento_tem_juros = false;
  if (parcelContext && (normalized.includes('com juros') || normalized.includes('tem juros'))) data.parcelamento_tem_juros = true;
  if (['nao vou parcelar', 'nao quero parcelar', 'em 1x', 'uma vez no cartao'].some((term) => normalized.includes(term))) {
    data.parcelamento_tem_juros = false;
  }

  const desconto = extractPercent(message, [
    /pix[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*%/i,
    /a vista[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*%/i,
    /(\d+(?:[.,]\d+)?)\s*%[^\n]{0,20}pix/i,
    /(\d+(?:[.,]\d+)?)\s*%[^\n]{0,20}desconto/i,
    /desconto[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*%/i
  ]);
  if (desconto !== null) data.desconto_a_vista_percentual = desconto;
  if (['nao tem desconto', 'sem desconto', 'nenhum desconto'].some((term) => normalized.includes(term))) {
    data.desconto_a_vista_percentual = 0;
  }

  const beneficio = extractPercent(message, [
    /cashback[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*%/i,
    /beneficio[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*%/i,
    /pontos?[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*%/i,
    /(\d+(?:[.,]\d+)?)\s*%[^\n]{0,20}cashback/i,
    /(\d+(?:[.,]\d+)?)\s*%[^\n]{0,20}pontos?/i
  ]);
  if (beneficio !== null) data.beneficio_cartao_percentual_estimado = beneficio;
  if (['nao tem cashback', 'sem cashback', 'nao ganho ponto', 'sem beneficio no cartao'].some((term) => normalized.includes(term))) {
    data.beneficio_cartao_percentual_estimado = 0;
  }

  const reservaMesesMatch =
    message.match(/(\d+(?:[.,]\d+)?)\s*mes(?:es)?[^\n]{0,20}reserva/i) ||
    message.match(/reserva[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*mes(?:es)?/i);
  if (reservaMesesMatch?.[1]) data.reserva_emergencia_meses = parseDecimal(reservaMesesMatch[1]);

  const renda = extractMoney(message, [/renda[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i]);
  if (renda !== null) data.renda_liquida_mensal = renda;

  const gastoFixo = extractMoney(message, [/(gasto fixo|fixos)[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i]);
  if (gastoFixo !== null) data.gasto_fixo_mensal = gastoFixo;

  const aluguel = extractMoney(message, [/aluguel[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i]);
  if (aluguel !== null) data.aluguel_mensal = aluguel;

  const parcela = extractMoney(message, [/\bparcela\b[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i, /\bfinanciamento\b[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i]);
  if (parcela !== null) data.parcela_financiamento = parcela;

  const entrada = extractMoney(message, [/entrada[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i]);
  if (entrada !== null) data.valor_entrada = entrada;

  const valorCompra = extractFirstMoney(message);
  if (valorCompra !== null && !data.valor_compra && themeId !== 'comprar_ou_alugar_imovel') {
    data.valor_compra = valorCompra;
  }

  const debtWords = ['divida', 'rotativo', 'cheque especial', 'emprestimo', 'parcelas atrasadas'];
  if (debtWords.some((word) => normalized.includes(word))) data.dividas_com_juros = true;
  if (['sem divida', 'nao tenho divida', 'nao tenho dividas'].some((word) => normalized.includes(word))) data.dividas_com_juros = false;
  if (['rotativo', 'cheque especial', 'juros altos'].some((word) => normalized.includes(word))) data.divida_juros_altos = true;
  if (['divida barata', 'juros baixos', 'financiamento barato'].some((word) => normalized.includes(word))) data.divida_juros_altos = false;

  if (['urgente', 'preciso agora', 'nao posso esperar', 'imediato'].some((word) => normalized.includes(word))) data.urgencia = 'alta';
  if (['sem pressa', 'pode esperar', 'da para esperar', 'posso esperar'].some((word) => normalized.includes(word))) data.urgencia = 'baixa';
  if (['em breve', 'logo', 'media urgencia'].some((word) => normalized.includes(word))) data.urgencia = 'media';

  if (['todo dia', 'diario', 'uso intenso', 'uso muito'].some((word) => normalized.includes(word))) data.frequencia_de_uso = 'intensa';
  if (['recorrente', 'toda semana', 'todo mes', 'uso bastante'].some((word) => normalized.includes(word))) data.frequencia_de_uso = 'recorrente';
  if (['pontual', 'eventual', 'uso pouco', 'quase nao uso'].some((word) => normalized.includes(word))) data.frequencia_de_uso = 'pontual';

  if (['longo prazo', 'muitos anos', 'vou usar bastante tempo'].some((word) => normalized.includes(word))) data.prazo_de_uso = 'longo';
  if (['medio prazo', 'alguns anos'].some((word) => normalized.includes(word))) data.prazo_de_uso = 'medio';
  if (['curto prazo', 'pouco tempo'].some((word) => normalized.includes(word))) data.prazo_de_uso = 'curto';

  if (['impulso', 'me conheco', 'perco o controle', 'acabo gastando mais'].some((word) => normalized.includes(word))) data.risco_de_impulso = 'alto';
  if (['compra planejada', 'bem pensado', 'ja planejei'].some((word) => normalized.includes(word))) data.risco_de_impulso = 'baixo';

  if (['perco o controle no cartao', 'credito me atrapalha', 'cartao me faz gastar mais'].some((word) => normalized.includes(word))) {
    data.risco_de_perder_controle_no_credito = 'alto';
  }
  if (['tenho controle', 'uso bem o cartao', 'credito nao me atrapalha'].some((word) => normalized.includes(word))) {
    data.risco_de_perder_controle_no_credito = 'baixo';
  }

  const essentialValue = parseBooleanValue(
    normalized,
    ['essencial', 'preciso para trabalhar', 'necessidade real', 'preciso disso'],
    ['nao essencial', 'superfluo', 'status', 'so quero']
  );
  if (essentialValue !== null) data.compra_essencial = essentialValue;
  if (essentialValue !== null) data.bem_essencial = essentialValue;

  const moneyReserved = parseBooleanValue(
    normalized,
    ['ja tenho o dinheiro', 'vou deixar separado', 'ficara reservado', 'saldo reservado', 'dinheiro ja existe'],
    ['nao vou deixar separado', 'nao tenho o dinheiro', 'vou contar com a renda futura']
  );
  if (moneyReserved !== null) data.dinheiro_ficara_reservado = moneyReserved;

  if (['vou ficar muitos anos', 'longo prazo no imovel', 'pretendo ficar'].some((word) => normalized.includes(word))) {
    data.tempo_esperado_no_imovel = 'longo';
  }
  if (['talvez eu mude', 'nao sei se fico', 'pouco tempo no imovel'].some((word) => normalized.includes(word))) {
    data.tempo_esperado_no_imovel = 'curto';
  }

  if (['estavel', 'estabilidade', 'renda estavel', 'cidade estavel'].some((word) => normalized.includes(word))) {
    data.estabilidade_profissional = 'alta';
  }
  if (['instavel', 'posso mudar de cidade', 'renda incerta', 'cidade incerta'].some((word) => normalized.includes(word))) {
    data.estabilidade_profissional = 'baixa';
  }

  if (['mobilidade alta', 'posso mudar', 'quero flexibilidade'].some((word) => normalized.includes(word))) {
    data.necessidade_de_mobilidade = 'alta';
  }
  if (['bem fixo', 'nao pretendo mudar', 'estou enraizado'].some((word) => normalized.includes(word))) {
    data.necessidade_de_mobilidade = 'baixa';
  }

  if (['consigo guardar sozinho', 'tenho disciplina', 'consigo poupar'].some((word) => normalized.includes(word))) {
    data.disciplina_de_aporte = 'alta';
  }
  if (['nao consigo guardar', 'perco o foco para guardar'].some((word) => normalized.includes(word))) {
    data.disciplina_de_aporte = 'baixa';
  }

  const commitmentMechanism = parseBooleanValue(
    normalized,
    ['preciso de trava', 'preciso de compromisso externo', 'sozinho nao consigo juntar'],
    ['nao preciso de trava', 'consigo juntar sozinho']
  );
  if (commitmentMechanism !== null) data.usuario_precisa_de_mecanismo_de_compromisso = commitmentMechanism;

  const dailyUse = parseBooleanValue(
    normalized,
    ['todo dia', 'uso diario', 'uso intenso'],
    ['uso eventual', 'uso pouco', 'pontual']
  );
  if (dailyUse !== null) data.uso_diario_intenso = dailyUse;

  const publicTransport = parseBooleanValue(
    normalized,
    ['transporte publico nao resolve', 'transporte publico ruim', 'app nao resolve'],
    ['transporte publico resolve', 'app resolve bem', 'nao preciso de carro']
  );
  if (publicTransport !== null) data.transporte_publico_insuficiente = publicTransport;

  if (['cabe com folga', 'cabe tranquilo'].some((word) => normalized.includes(word))) data.custo_total_cabe = true;
  if (['vai apertar', 'cabe apertando', 'fica pesado'].some((word) => normalized.includes(word))) data.custo_total_cabe = false;

  const uncertainUse = parseBooleanValue(
    normalized,
    ['uso pontual', 'uso incerto', 'nem sei se vou usar tanto'],
    ['vou usar muito', 'uso intenso', 'uso frequente']
  );
  if (uncertainUse !== null) data.uso_pontual_ou_incerto = uncertainUse;

  const durableReduces = parseBooleanValue(
    normalized,
    ['vai durar mais', 'reduz trocas', 'tem assistencia', 'tem garantia melhor'],
    ['nao muda muita coisa', 'nao reduz trocas']
  );
  if (durableReduces !== null) data.produto_duravel_reduz_trocas = durableReduces;

  const phoneStillWorks = parseBooleanValue(
    normalized,
    ['ainda atende', 'funciona bem', 'da conta'],
    ['nao atende mais', 'esta travando muito', 'nao da conta']
  );
  if (phoneStillWorks !== null) data.celular_atual_atende_funcao = phoneStillWorks;

  const phoneHurtsWork = parseBooleanValue(
    normalized,
    ['atrapalha meu trabalho', 'compromete seguranca', 'nao consigo trabalhar'],
    ['nao atrapalha o trabalho', 'nao compromete seguranca']
  );
  if (phoneHurtsWork !== null) data.celular_atual_compromete_trabalho_ou_seguranca = phoneHurtsWork;

  const manySubs = parseBooleanValue(
    normalized,
    ['muitas assinaturas', 'varias assinaturas', 'varios aplicativos cobrando'],
    ['tenho poucas assinaturas', 'nao tenho varias assinaturas']
  );
  if (manySubs !== null) data.usuario_tem_muitas_assinaturas_pequenas = manySubs;

  const subValue = parseBooleanValue(
    normalized,
    ['fica mais barato assinar', 'reduz custo por uso', 'vale pelo desconto'],
    ['nao reduz custo', 'quase nao uso']
  );
  if (subValue !== null) data.assinatura_reduz_custo_unitario = subValue;

  /* novos campos de padrão */
  if (['cansado', 'ansioso', 'frustrado', 'estressado', 'para aliviar', 'mereco'].some((word) => normalized.includes(word))) {
    data.gatilho_emocional = true;
  }

  if (['meu padrao subiu', 'estilo de vida subiu', 'subiu sem perceber', 'quero manter esse nivel'].some((word) => normalized.includes(word))) {
    data.aumento_de_padrao = true;
  }

  if (['tem manutencao', 'puxa mensalidade', 'gasto recorrente', 'tem reposicao', 'tem custo fixo depois'].some((word) => normalized.includes(word))) {
    data.custo_recorrente = true;
  }

  if (['cabe com folga'].some((word) => normalized.includes(word))) data.margem_no_mes = 'folga';
  if (['cabe apertando', 'vai apertar', 'fica justo'].some((word) => normalized.includes(word))) data.margem_no_mes = 'apertado';
  if (['so no credito', 'so parcelando', 'so consigo no cartao'].some((word) => normalized.includes(word))) data.margem_no_mes = 'so_credito';

  if (
    !data.objetivo_compra &&
    themeId &&
    ['pagar_no_credito_ou_no_pix', 'comprar_a_vista_ou_parcelar_sem_juros', 'trocar_de_celular_ou_manter'].includes(themeId)
  ) {
    data.objetivo_compra = message.trim();
  }

  return data;
}

function mergeData(previousData, newData) {
  return {
    ...previousData,
    ...Object.fromEntries(
      Object.entries(newData).filter(([, value]) => value !== null && value !== undefined && value !== '')
    )
  };
}

function isMissing(value) {
  return value === null || value === undefined || value === '';
}

function getMissingFields(theme, data) {
  if (!theme?.requiredFields?.length) return [];
  return theme.requiredFields.filter((field) => isMissing(data[field]));
}

/* =========================
   Avaliação de decisão
========================= */

function buildDefaultResult() {
  return {
    classification: 'neutro_depende_de_dados',
    tendency: 'depende de contexto',
    logic: [],
    alert: 'Sem contexto suficiente, a resposta corre o risco de parecer segura e estar desalinhada da sua realidade.',
    nextStep: 'Completar os dados críticos antes de decidir.',
    alternative: 'Se a decisão puder esperar, use esse tempo para reduzir incerteza.'
  };
}

function evaluateTheme(themeId, data) {
  const result = buildDefaultResult();

  switch (themeId) {
    case 'pagar_no_credito_ou_no_pix': {
      const desconto = data.desconto_a_vista_percentual ?? 0;
      const beneficio = data.beneficio_cartao_percentual_estimado ?? 0;

      if (data.perfil_cartao === 'parcial' || data.perfil_cartao === 'atrasa_as_vezes') {
        result.classification = 'desaconselhado_no_momento';
        result.tendency = 'priorizar PIX ou débito';
        result.logic = [
          'O cartão deixa de ser ferramenta quando a fatura não fecha limpa.',
          'Qualquer cashback pequeno tende a ser destruído por juros, atraso ou descontrole.'
        ];
        result.alert = 'Tratar crédito como organização quando ele já gera desgaste costuma piorar o mês seguinte.';
        result.nextStep = 'Se quiser usar cartão no futuro com mais segurança, o primeiro passo é voltar ao pagamento integral da fatura.';
        result.alternative = 'Se a compra não for urgente, vale adiar ou reduzir o padrão até caber à vista.';
        return result;
      }

      if (data.parcelamento_tem_juros === true) {
        result.classification = 'adiar_e_reavaliar';
        result.tendency = 'evitar parcelamento com juros';
        result.logic = [
          'Quando a parcela tem juros, você não está só comprando o item; está alugando dinheiro.',
          'Juro explícito comprime o futuro por uma vantagem presente pequena.'
        ];
        result.alert = 'O risco aqui é normalizar um custo que vai continuar pressionando o mês depois da compra.';
        result.nextStep = 'Compare o custo total do parcelamento com a opção de esperar, juntar ou reduzir o padrão.';
        result.alternative = 'Se for realmente essencial, busque a forma de menor custo total e prazo mais curto possível.';
        return result;
      }

      if (data.risco_de_perder_controle_no_credito === 'alto' || data.risco_de_impulso === 'alto') {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'preferir PIX ou débito';
        result.logic = [
          'Aqui o ganho marginal do cartão pesa menos do que o risco comportamental.',
          'Controle comportamental vale mais do que benefício pequeno.'
        ];
        result.alert = 'Um pequeno cashback não compensa uma grande chance de ampliar consumo.';
        result.nextStep = 'Se a compra for seguir, use um meio de pagamento que te dê mais fricção e mais clareza.';
        result.alternative = 'Se ainda quiser usar cartão, trate a compra como já paga e separe o dinheiro no mesmo dia.';
        return result;
      }

      if (desconto > beneficio) {
        result.classification = 'recomendado';
        result.tendency = 'tender ao PIX ou à vista';
        result.logic = [
          `O desconto real de ${desconto}% pesa mais do que o benefício estimado do cartão.`,
          'Desconto certo e imediato costuma vencer vantagem pequena e difusa.'
        ];
        result.alert = 'A única ressalva aqui é não desmontar sua liquidez só para capturar um desconto.';
        result.nextStep = 'Confirme se pagar agora não aperta o essencial do mês nem reduz sua reserva abaixo do mínimo.';
        result.alternative = 'Se pagar à vista te descapitaliza, vale comparar parcelamento sem juros com saldo reservado.';
        return result;
      }

      if (data.perfil_cartao === 'paga_total' && beneficio > 0 && data.risco_de_perder_controle_no_credito === 'baixo') {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'usar cartão pode fazer sentido';
        result.logic = [
          'Sem desconto relevante à vista, o prazo do cartão pode organizar fluxo sem custo extra.',
          'Como você paga integralmente e o risco de descontrole é baixo, o benefício do cartão pode ser aproveitado sem romantização.'
        ];
        result.alert = 'Essa estratégia só funciona se você tratar a compra como já paga e não usar o limite como extensão da renda.';
        result.nextStep = 'Se for seguir no cartão, separe o valor total da compra no mesmo dia.';
        result.alternative = 'Se o controle ficar instável, volte para PIX/débito mesmo abrindo mão do benefício marginal.';
        return result;
      }

      return result;
    }

    case 'comprar_a_vista_ou_parcelar_sem_juros': {
      const desconto = data.desconto_a_vista_percentual ?? 0;
      const reserva = data.reserva_emergencia_meses ?? 0;

      if (data.parcelamento_tem_juros === true) {
        result.classification = 'adiar_e_reavaliar';
        result.tendency = 'evitar parcelamento com juros';
        result.logic = ['A comparação aqui deixa de ser caixa versus liquidez e vira custo total mais alto.'];
        result.alert = 'Juros transformam uma compra administrável em uma pressão futura desnecessária.';
        result.nextStep = 'Reveja se a compra pode esperar, cair de padrão ou buscar outra condição.';
        result.alternative = 'Se a urgência for real, escolha o menor custo total disponível e preserve o resto do caixa.';
        return result;
      }

      if (desconto >= 5 && reserva >= 1) {
        result.classification = 'recomendado';
        result.tendency = 'tender ao pagamento à vista';
        result.logic = [
          `O desconto de ${desconto}% já é relevante.`,
          'Como pagar agora não tende a te deixar sem nenhum colchão, capturar o desconto faz sentido.'
        ];
        result.alert = 'Não vale economizar hoje e ficar vulnerável amanhã se essa saída zerar sua liquidez.';
        result.nextStep = 'Confirme o impacto no seu caixa do mês e preserve pelo menos uma base mínima de segurança.';
        result.alternative = 'Se a vista te deixa muito seco, parcelar sem juros com dinheiro reservado pode ser a segunda melhor opção.';
        return result;
      }

      if (data.dinheiro_ficara_reservado === true) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'parcelar sem juros pode ser inteligente';
        result.logic = [
          'Aqui a parcela funciona como organização de fluxo, não como autorização para comprar acima da base.',
          'Preservar liquidez sem pagar mais por isso pode ser racional.'
        ];
        result.alert = 'A armadilha é usar o alívio da parcela para assumir novos compromissos antes de quitar o atual.';
        result.nextStep = 'Se parcelar, deixe o valor total já reservado e acompanhe a fatura como se a compra estivesse encerrada.';
        result.alternative = 'Se você não vai reservar o saldo, a vista ou adiamento tendem a ser escolhas mais seguras.';
        return result;
      }

      if (reserva < 1) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'preservar liquidez';
        result.logic = [
          'Sua reserva está curta, então a liquidez pesa mais do que uma economia marginal.',
          'Ficar descapitalizado pode sair mais caro depois.'
        ];
        result.alert = 'O risco maior aqui é trocar um desconto pequeno por fragilidade estrutural.';
        result.nextStep = 'Avalie adiar, reduzir o padrão ou usar uma condição sem juros sem consumir sua margem mínima.';
        result.alternative = 'Se a compra não for urgente, usar esse tempo para recompor caixa tende a ser melhor.';
        return result;
      }

      return result;
    }

    case 'comprar_ou_alugar_imovel': {
      const parcela = data.parcela_financiamento ?? 0;
      const aluguel = data.aluguel_mensal ?? 0;

      if (data.necessidade_de_mobilidade === 'alta' || data.estabilidade_profissional === 'baixa') {
        result.classification = 'recomendado';
        result.tendency = 'tender ao aluguel';
        result.logic = [
          'Quando sua localização ou renda ainda podem mudar bastante, flexibilidade tem valor econômico.',
          'Imobilizar capital cedo pode prender dinheiro e liberdade ao mesmo tempo.'
        ];
        result.alert = 'Forçar compra em fase instável pode transformar patrimônio em pressão.';
        result.nextStep = 'Antes de decidir por compra, compare o custo de manter a flexibilidade no seu momento atual.';
        result.alternative = 'Se quiser caminhar para compra, use esse período para fortalecer entrada e previsibilidade.';
        return result;
      }

      if (data.tempo_esperado_no_imovel === 'longo' && data.estabilidade_profissional === 'alta' && data.necessidade_de_mobilidade !== 'alta') {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'compra pode ser coerente';
        result.logic = [
          'Horizonte longo ajuda a diluir custo de aquisição.',
          'Estabilidade e permanência aumentam a chance de a compra encaixar no seu momento de vida.'
        ];
        if (parcela && aluguel) {
          result.logic.push(`Hoje vale comparar com calma parcela de cerca de R$ ${parcela} versus aluguel de cerca de R$ ${aluguel}.`);
        }
        result.alert = 'A conta não para na parcela: IPTU, condomínio, manutenção e capital imobilizado precisam entrar.';
        result.nextStep = 'Monte um comparativo de custo total em 5 e 10 anos antes de fechar a narrativa da compra.';
        result.alternative = 'Se a parcela ficar apertada ou a entrada desmontar sua reserva, alugar mais um tempo ainda pode ser a melhor decisão.';
        return result;
      }

      if (parcela && aluguel && parcela > aluguel * 1.4) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'ter cautela com a compra';
        result.logic = [
          'A parcela está bem acima do aluguel atual, então o custo de posse merece leitura fria.',
          'Comprar porque parece mais patrimonial pode esconder perda de liquidez importante.'
        ];
        result.alert = 'Apertar o fluxo para comprar pode reduzir muito sua margem de manobra.';
        result.nextStep = 'Compare parcela, custos de propriedade e o rendimento que a entrada deixaria de gerar.';
        result.alternative = 'Se a ideia de compra faz sentido no longo prazo, use o período de aluguel para aumentar a entrada.';
        return result;
      }

      return result;
    }

    case 'financiamento_ou_consorcio_ou_juntar': {
      if (data.urgencia === 'alta' && data.bem_essencial === true) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'financiamento pode ser considerado';
        result.logic = [
          'Quando o bem é essencial e o tempo tem custo real, esperar pode sair caro também.',
          'Aqui o financiamento entra como acesso, não como conforto.'
        ];
        result.alert = 'A parcela não pode virar uma pressão permanente sobre o seu caixa.';
        result.nextStep = 'Compare CET, prazo e impacto mensal antes de assumir a parcela.';
        result.alternative = 'Se houver como reduzir padrão do bem e cortar custo total, isso tende a melhorar bastante a decisão.';
        return result;
      }

      if (data.urgencia === 'baixa' && data.disciplina_de_aporte === 'alta') {
        result.classification = 'recomendado';
        result.tendency = 'tender a juntar por conta própria';
        result.logic = [
          'Sem urgência, pagar por rigidez normalmente perde para guardar com liberdade.',
          'Se você tem disciplina, não precisa terceirizar a organização do aporte.'
        ];
        result.alert = 'O principal risco é perder o ritmo e transformar a boa intenção em adiamento infinito.';
        result.nextStep = 'Defina valor mensal, prazo e conta separada para esse objetivo.';
        result.alternative = 'Se você realmente não consegue manter constância, um mecanismo externo pode entrar com cautela.';
        return result;
      }

      if (data.urgencia === 'baixa' && data.usuario_precisa_de_mecanismo_de_compromisso === true) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'consórcio pode ser ferramenta de disciplina';
        result.logic = [
          'Aqui o consórcio faz sentido mais como trava comportamental do que como investimento.',
          'Ele pode funcionar para quem precisa de compromisso externo.'
        ];
        result.alert = 'O erro é chamar consórcio de investimento e ignorar taxa administrativa e falta de liquidez.';
        result.nextStep = 'Se considerar consórcio, leia custo total, prazo e regras de contemplação com frieza.';
        result.alternative = 'Se conseguir criar uma trava própria com conta separada e débito automático, juntar costuma ser mais leve.';
        return result;
      }

      return result;
    }

    case 'carro_proprio_ou_mobilidade_sob_demanda': {
      if (data.uso_diario_intenso === true && data.transporte_publico_insuficiente === true && data.custo_total_cabe === true) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'carro próprio pode fazer sentido';
        result.logic = [
          'Se a rotina depende de deslocamento diário e as alternativas não resolvem, posse pode gerar ganho funcional real.',
          'Aqui o valor pode estar em tempo, previsibilidade e autonomia.'
        ];
        result.alert = 'A decisão só continua boa se você olhar o custo total, não só a parcela.';
        result.nextStep = 'Monte a conta completa com seguro, IPVA, manutenção, combustível e depreciação.';
        result.alternative = 'Se o custo total ficar pesado, um carro mais enxuto ou mobilidade mista tende a proteger melhor o caixa.';
        return result;
      }

      if (data.uso_diario_intenso === false || data.transporte_publico_insuficiente === false) {
        result.classification = 'recomendado';
        result.tendency = 'comparar forte com app ou transporte público';
        result.logic = [
          'Quando o uso é eventual, possuir carro costuma ser mais caro do que resolver deslocamento por demanda.',
          'A necessidade central pode ser mobilidade, não posse.'
        ];
        result.alert = 'O risco é normalizar custo fixo alto para uma dor que aparece pouco.';
        result.nextStep = 'Estime quanto você gasta por mês em deslocamento sem carro e compare com o custo total de possuir um.';
        result.alternative = 'Se houver dias críticos, combine app, aluguel pontual ou transporte misto.';
        return result;
      }

      return result;
    }

    case 'produto_barato_ou_duravel': {
      if (data.frequencia_de_uso === 'intensa' && data.produto_duravel_reduz_trocas === true) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'pode valer ir para o mais durável';
        result.logic = [
          'Uso intenso muda a conta: preço de entrada perde relevância quando a durabilidade reduz recompra e manutenção.',
          'O mais caro pode sair mais barato no ciclo completo.'
        ];
        result.alert = 'Só vale pagar mais se a durabilidade for real e relevante para o seu uso.';
        result.nextStep = 'Compare custo por mês de uso, garantia e suporte antes de fechar.';
        result.alternative = 'Se a diferença de qualidade for pequena, a opção intermediária pode entregar melhor relação custo-benefício.';
        return result;
      }

      if (data.uso_pontual_ou_incerto === true) {
        result.classification = 'recomendado';
        result.tendency = 'não pagar caro só por robustez';
        result.logic = [
          'Se o uso ainda é pontual ou incerto, robustez demais pode virar custo parado.',
          'Qualidade também precisa encaixar no padrão real de uso.'
        ];
        result.alert = 'O risco aqui é comprar uma versão premium para um uso que talvez nem se confirme.';
        result.nextStep = 'Escolha uma opção adequada ao uso atual e reavalie se o padrão de uso realmente crescer.';
        result.alternative = 'Se puder alugar, pegar usado confiável ou testar primeiro, isso reduz o risco de supercompra.';
        return result;
      }

      return result;
    }

    case 'trocar_de_celular_ou_manter': {
      if (data.celular_atual_compromete_trabalho_ou_seguranca === true) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'troca pode ser legítima';
        result.logic = [
          'Quando o aparelho atrapalha trabalho, estudo ou segurança, o problema deixa de ser estético e vira funcional.',
          'Ferramenta ruim também custa dinheiro, tempo e energia.'
        ];
        result.alert = 'Troca legítima não significa trocar no teto do padrão.';
        result.nextStep = 'Busque o menor modelo que resolva o problema real, incluindo seminovo confiável ou geração anterior.';
        result.alternative = 'Se uma manutenção simples resolver, isso pode ganhar tempo sem expandir o custo do hábito.';
        return result;
      }

      if (data.celular_atual_atende_funcao === true && data.compra_essencial === false) {
        result.classification = 'recomendado';
        result.tendency = 'tender a manter o aparelho atual';
        result.logic = [
          'Se o aparelho ainda atende, a troca parece responder mais a desejo de atualização do que a necessidade técnica.',
          'Substituição prematura costuma elevar o padrão mais do que resolver um problema real.'
        ];
        result.alert = 'O risco é transformar vontade pontual em novo nível permanente de gasto.';
        result.nextStep = 'Defina qual fricção concreta justificaria uma troca de verdade e use isso como filtro.';
        result.alternative = 'Se ainda quiser trocar, olhar mercado seminovo ou modelo anterior reduz bastante o custo.';
        return result;
      }

      return result;
    }

    case 'assinatura_recorrente_ou_avulso': {
      if (data.usuario_tem_muitas_assinaturas_pequenas === true) {
        result.classification = 'recomendado';
        result.tendency = 'revisar e consolidar assinaturas';
        result.logic = [
          'Pequenos pagamentos recorrentes podem formar um vazamento estrutural silencioso.',
          'Antes de decidir por mais uma assinatura, vale limpar o que já ficou automático.'
        ];
        result.alert = 'O risco é olhar cada valor como pequeno e ignorar a soma deles no mês.';
        result.nextStep = 'Liste todas as assinaturas, uso real e custo por uso para cortar sobreposições.';
        result.alternative = 'Se uma assinatura nova for importante, compense retirando outra que não entrega valor real.';
        return result;
      }

      if (data.frequencia_de_uso === 'pontual') {
        result.classification = 'recomendado';
        result.tendency = 'tender ao avulso';
        result.logic = [
          'Uso baixo transforma conveniência em custo fixo.',
          'Quando o uso não acompanha o plano, a assinatura vira manutenção do automático.'
        ];
        result.alert = 'A armadilha é pagar todos os meses por algo que você usa só quando lembra.';
        result.nextStep = 'Calcule quantas vezes você realmente usa e compare com o custo avulso.';
        result.alternative = 'Se o serviço tiver picos de uso, assinar só em períodos específicos pode funcionar melhor.';
        return result;
      }

      if ((data.frequencia_de_uso === 'recorrente' || data.frequencia_de_uso === 'intensa') && data.assinatura_reduz_custo_unitario === true) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'assinatura pode fazer sentido';
        result.logic = [
          'Há uso real e redução de custo por uso.',
          'Nesse cenário a recorrência pode estar servindo à rotina, não só prendendo caixa.'
        ];
        result.alert = 'Mesmo uma assinatura boa precisa de revisão periódica para não virar herança esquecida.';
        result.nextStep = 'Defina um ponto de revisão para conferir se o uso continua acompanhando o pagamento.';
        result.alternative = 'Se o uso cair, migrar para avulso devolve flexibilidade rapidamente.';
        return result;
      }

      return result;
    }

    case 'reserva_de_emergencia_ou_investir': {
      const reserva = data.reserva_emergencia_meses ?? 0;

      if (data.dividas_com_juros === true) {
        result.classification = 'recomendado';
        result.tendency = 'organizar dívida e base de segurança antes de buscar performance';
        result.logic = [
          'Quando ainda existem juros rodando, a pressão no caixa vem antes da sofisticação.',
          'Muitas vezes o melhor retorno é parar de pagar juro ruim.'
        ];
        result.alert = 'Investir enquanto os juros caros continuam pode passar sensação de progresso sem melhorar patrimônio líquido.';
        result.nextStep = 'Separe o que precisa ser mini-reserva imediata e o que precisa ser ataque a juros ruins.';
        result.alternative = 'Se a dívida for barata e controlada, a conversa muda, mas primeiro vale confirmar isso.';
        return result;
      }

      if (reserva < 3) {
        result.classification = 'recomendado';
        result.tendency = 'priorizar reserva de emergência';
        result.logic = [
          `Hoje sua reserva está em torno de ${reserva} mês(es), abaixo de uma base mais segura.`,
          'Sem colchão mínimo, qualquer imprevisto pode desmontar sua estratégia de investimento.'
        ];
        result.alert = 'O risco aqui é buscar retorno antes de construir estabilidade.';
        result.nextStep = 'Mire primeiro uma reserva mínima acessível e só depois avance para objetivos de prazo maior.';
        result.alternative = 'Se investir te ajuda a ganhar motivação, faça isso só depois de separar o piso da reserva.';
        return result;
      }

      result.classification = 'recomendado_com_ressalvas';
      result.tendency = 'já existe espaço para investir com caráter educacional';
      result.logic = [
        'Com reserva mais organizada e sem juros ruins pressionando, o investimento passa a encaixar melhor.',
        'Agora faz mais sentido pensar por prazo, objetivo e liquidez.'
      ];
      result.alert = 'O risco agora é pular para produto ou promessa antes de definir para que o dinheiro serve.';
      result.nextStep = 'Comece organizando objetivo, prazo e liquidez esperada antes de escolher qualquer produto.';
      result.alternative = 'Se sua renda ainda oscila muito, fortalecer mais a reserva também pode ser uma boa escolha.';
      return result;
    }

    case 'pagar_divida_ou_investir': {
      if (data.dividas_com_juros !== true) {
        result.classification = 'recomendado';
        result.tendency = 'sem dívida cara, a conversa vai para reserva e investimento';
        result.logic = ['Se não há dívida com juros relevantes, o foco deixa de ser apagar incêndio e vai para estrutura.'];
        result.alert = 'Mesmo sem dívida, investir sem reserva pode manter fragilidade escondida.';
        result.nextStep = 'Confirme primeiro o tamanho da sua reserva antes de acelerar aporte de longo prazo.';
        result.alternative = 'Se houver parcelas baratas e controladas, elas podem coexistir com investimento com mais tranquilidade.';
        return result;
      }

      if (data.divida_juros_altos === true) {
        result.classification = 'recomendado';
        result.tendency = 'priorizar quitar ou renegociar a dívida cara';
        result.logic = [
          'Juro alto tende a vencer com folga o retorno de investimentos mais seguros.',
          'Aqui o ganho mais concreto costuma ser parar a sangria.'
        ];
        result.alert = 'Investir enquanto o rotativo ou outra dívida cara segue aberta costuma dar uma falsa sensação de equilíbrio.';
        result.nextStep = 'Ataque primeiro a dívida mais cara e preserve só uma mini-reserva operacional se necessário.';
        result.alternative = 'Se a dívida ainda não puder ser quitada, renegociar taxa e prazo já melhora a base da decisão.';
        return result;
      }

      if ((data.reserva_emergencia_meses ?? 0) >= 3) {
        result.classification = 'recomendado_com_ressalvas';
        result.tendency = 'pode haver espaço para estratégia mista';
        result.logic = [
          'Sem juros muito agressivos e com reserva minimamente organizada, nem toda dívida precisa expulsar completamente o investimento.',
          'Ainda assim, a dívida continua pedindo disciplina e leitura de custo.'
        ];
        result.alert = 'A armadilha é tratar toda dívida como neutra sem comparar taxa e prazo com seriedade.';
        result.nextStep = 'Compare o custo efetivo da dívida com o objetivo do investimento antes de dividir esforço.';
        result.alternative = 'Se quiser simplificar a vida financeira, reduzir a dívida primeiro ainda pode ser a opção mais leve.';
        return result;
      }

      return result;
    }

    default:
      return result;
  }
}

/* =========================
   Leitura de padrão
========================= */

function buildPatternReading(theme, data, fallbackScenario = null) {
  const base = {
    patternName: theme?.title || fallbackScenario?.title || 'padrão em leitura',
    reading: 'O que pode estar acontecendo é um padrão de custo invisível operando por trás do que você sente hoje.',
    impact: 'Quando esse padrão se repete, ele deixa de ser episódio e começa a morar no mês.',
    awareness: 'Isso não é sobre certo ou errado. É sobre entender o que está operando.',
    nextStep: 'Transformar essa leitura em uma observação prática do seu cotidiano.',
    bridgeToDecision: 'Se você quiser, o próximo passo é traduzir esse padrão em uma decisão concreta do dia a dia.'
  };

  switch (theme?.id) {
    case 'dinheiro_some':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é um comprometimento invisível do mês antes mesmo das escolhas pontuais. Seu dinheiro pode não estar “sumindo”; ele pode estar sendo absorvido por blocos automáticos, pequenas recorrências e custos que perderam visibilidade.',
        impact: 'Quando isso se repete, você sente esforço sem avanço, porque a margem já nasce comprimida.',
        awareness: 'O problema nem sempre é falta de controle. Muitas vezes é falta de mapa do que já está morando no mês.',
        nextStep: 'Mapear fixos, assinaturas, parcelas antigas e pequenos vazamentos recorrentes.',
        bridgeToDecision: 'Depois disso, fica muito mais fácil decidir o que cortar, manter ou renegociar.'
      };

    case 'impulso_e_alivio':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é que o gasto não está comprando só o item. Ele está comprando alívio, recompensa ou redução de fricção.',
        impact: 'O custo maior aparece quando esse alívio vira recorrência. Aí a compra deixa de ser exceção e passa a fazer parte da engrenagem do mês.',
        awareness: 'Isso não precisa ser lido com culpa. O ponto é perceber o que a compra está resolvendo de verdade.',
        nextStep: 'Observar em quais estados emocionais o impulso aparece com mais frequência.',
        bridgeToDecision: 'Com isso, você consegue construir uma resposta mais inteligente do que só “tentar se controlar”.'
      };

    case 'padrao_subiu':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é uma expansão silenciosa do padrão de vida. O custo pode não estar em uma compra grande, mas em vários pequenos ajustes que passaram a parecer normais.',
        impact: 'Quando isso se instala, o mês fica mais rígido e qualquer queda de margem assusta mais.',
        awareness: 'Vale olhar menos para o item isolado e mais para o padrão que ele passa a sustentar.',
        nextStep: 'Separar o que é valor real para você do que virou manutenção automática.',
        bridgeToDecision: 'Essa clareza ajuda muito quando você estiver escolhendo entre manter, simplificar ou expandir algo.'
      };

    case 'trabalho_muito_e_gasto':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é o merecimento ter virado critério recorrente de gasto. Isso é compreensível, mas pode encurtar sua distância entre esforço e consumo.',
        impact: 'Quando o trabalho vira justificativa constante para gasto, o alívio do presente pode impedir construção de folga estrutural.',
        awareness: 'O problema não é se recompensar. É quando toda recompensa precisa custar financeiramente.',
        nextStep: 'Observar se descanso, prazer e alívio estão sempre dependendo de gasto.',
        bridgeToDecision: 'Depois disso, fica mais fácil desenhar recompensas sustentáveis.'
      };

    case 'nao_saio_do_lugar':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é que você resolve o mês, mas não altera o sistema. Existe esforço, mas pouca mudança estrutural.',
        impact: 'Quando a lógica do mês continua a mesma, o resultado tende a se repetir mesmo com boa intenção.',
        awareness: 'Isso não significa fracasso pessoal. Significa que talvez a organização atual esteja apagando incêndio, não reorganizando base.',
        nextStep: 'Identificar quais partes do mês são repetição de padrão e quais são escolha real.',
        bridgeToDecision: 'A partir daí, dá para atacar um ponto estrutural por vez.'
      };

    case 'ganho_mais_e_continuo_apertado':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é que o padrão de vida cresceu junto com a renda. Assim, a melhora de receita não virou folga; virou manutenção de um novo nível de custo.',
        impact: 'Quando isso se consolida, a pessoa ganha mais, mas continua sem margem real.',
        awareness: 'O problema nem sempre é a renda. Às vezes é a velocidade da expansão.',
        nextStep: 'Olhar o que subiu na sua estrutura desde que a renda melhorou.',
        bridgeToDecision: 'Isso ajuda a decidir onde vale manter melhoria e onde vale recuperar margem.'
      };

    case 'medo_de_gastar':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é uma associação forte entre gasto e perda de segurança. Isso pode proteger bastante, mas também pode comprimir qualidade de vida.',
        impact: 'Quando a contenção domina tudo, a estrutura até fica segura, mas a vida pode ficar estreita demais.',
        awareness: 'Nem todo gasto é ameaça. Alguns são parte legítima de equilíbrio e bem-estar.',
        nextStep: 'Distinguir gasto que fragiliza de gasto que sustenta a vida de forma saudável.',
        bridgeToDecision: 'Depois disso, fica mais fácil decidir sem culpa e sem rigidez excessiva.'
      };

    case 'cartao_perde_controle':
      return {
        patternName: theme.title,
        reading: 'O que pode estar acontecendo é perda de referência. O cartão separa o momento do consumo do momento do pagamento, e isso pode reduzir sua percepção de custo.',
        impact: 'Quando essa distância cresce, a fatura deixa de ser consequência clara e passa a parecer surpresa recorrente.',
        awareness: 'Não é só uma questão de disciplina. É também uma questão de visibilidade.',
        nextStep: 'Observar quais tipos de gasto ficam mais nebulosos quando passam pelo crédito.',
        bridgeToDecision: 'Com essa leitura, fica mais fácil decidir onde o cartão funciona como ferramenta e onde vira risco.'
      };

    default:
      if (fallbackScenario?.id === 'pressao_financeira') {
        return {
          patternName: fallbackScenario.title,
          reading: 'O que pode estar acontecendo é pressão estrutural. O mês pode já estar entrando comprometido antes mesmo das decisões pontuais.',
          impact: 'Quando isso acontece, sobra pouca margem para escolher com calma e muita coisa vira reação.',
          awareness: 'Nem sempre o problema está em um gasto isolado. Muitas vezes está no desenho inteiro do mês.',
          nextStep: 'Mapear as pressões fixas e os vazamentos invisíveis.',
          bridgeToDecision: 'Depois disso, qualquer decisão prática fica muito mais clara.'
        };
      }

      return base;
  }
}

/* =========================
   Formatação
========================= */

function formatDecisionResponse(snapshot) {
  const themeTitle = snapshot.theme?.title || 'essa decisão';
  const result = snapshot.evaluation || buildDefaultResult();
  const logicLines = result.logic.length
    ? result.logic.map((item) => `- ${item}`).join('\n')
    : '- Ainda faltam variáveis importantes para uma leitura segura.';

  return [
    '## Leitura do contexto',
    `Você trouxe uma decisão concreta sobre ${themeTitle.toLowerCase()}. Em vez de te empurrar uma resposta pronta, eu estou olhando custo total, risco de caixa, risco de juros e risco comportamental juntos.`,
    '',
    '## Tendência',
    `${result.tendency}. A decisão final continua sendo sua, mas essa é a direção que hoje parece mais coerente com o que você me trouxe.`,
    '',
    '## O que mais pesou aqui',
    logicLines,
    '',
    '## Principal risco',
    result.alert,
    '',
    '## Próximo passo',
    result.nextStep,
    '',
    '## Se a opção principal não couber',
    result.alternative,
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatPatternResponse(snapshot) {
  const reading = snapshot.patternReading;

  return [
    '## Leitura do padrão',
    reading.reading,
    '',
    '## Impacto estrutural',
    reading.impact,
    '',
    '## Vale observar',
    reading.awareness,
    '',
    '## Próximo passo',
    reading.nextStep,
    '',
    '## Ponte para algo prático',
    reading.bridgeToDecision,
    '',
    '_Conteúdo educacional. A decisão final continua sendo sua._'
  ].join('\n');
}

function formatFollowUpDecisionResponse(snapshot) {
  const themeTitle = snapshot.theme?.title || 'essa decisão';
  const questions = snapshot.followUpQuestions.length
    ? snapshot.followUpQuestions.map((item) => `- ${item.question}`).join('\n')
    : '- Me conte um pouco mais do contexto para eu não cair numa resposta padrão.';

  return [
    '## Leitura do contexto',
    `Você trouxe uma dúvida concreta sobre ${themeTitle.toLowerCase()}, e eu prefiro não te responder no automático.`,
    '',
    '## Antes de fechar uma direção',
    'Me responde só o que estiver fácil agora:',
    questions,
    '',
    '## Por que isso pesa',
    'Porque aqui a diferença entre uma boa resposta e uma resposta vazia costuma estar em poucos dados críticos: caixa, juros, controle, urgência e custo no tempo.',
    '',
    '## Direção provisória',
    'Sem esses dados, a melhor postura é evitar romantizar crédito, parcelamento ou ganho marginal.',
    '',
    '_Conteúdo educacional. A decisão final continua sendo sua._'
  ].join('\n');
}

function formatFollowUpPatternResponse(snapshot) {
  const questions = snapshot.followUpQuestions.length
    ? snapshot.followUpQuestions.map((item) => `- ${item.question}`).join('\n')
    : '- Me conta um pouco mais de quando isso costuma acontecer.';

  return [
    '## Leitura inicial',
    'Tem um padrão aqui que vale nomear com mais cuidado antes de tentar resolver rápido.',
    '',
    '## Para eu ler isso melhor',
    questions,
    '',
    '## Por que eu estou te perguntando isso',
    'Porque comportamento financeiro quase nunca nasce só da matemática. Contexto, gatilho e repetição importam muito.',
    '',
    '## Direção provisória',
    'Antes de corrigir o gasto, vale entender o que ele está tentando resolver.',
    '',
    '_Conteúdo educacional. Isso não é sobre certo ou errado._'
  ].join('\n');
}

function formatConceptResponse(concept) {
  return [
    '## Leitura do contexto',
    concept.response.reading,
    '',
    '## Padrão comum',
    concept.response.pattern,
    '',
    '## Impacto estrutural',
    concept.response.impact,
    '',
    '## Vale observar',
    concept.response.awareness,
    '',
    '## Próximo passo prático',
    concept.response.nextStep,
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatScenarioResponse(scenario) {
  const scenarioResponses = {
    pressao_financeira: {
      reading: 'Isso acontece com muita gente e nem sempre significa falta de renda. Muitas vezes o mês já entra pressionado antes mesmo das escolhas pontuais.',
      pattern: 'Um padrão comum nesse cenário é a soma de compromissos invisíveis: recorrências pequenas, parcelas antigas, alívios emocionais e custo fixo alto.',
      impact: 'Quando esse sistema se repete, o dinheiro entra para manter a máquina girando e sobra pouca margem para decidir.',
      awareness: 'O ponto aqui não é só cortar gasto. É enxergar qual estrutura está consumindo sua folga antes de ela nascer.',
      nextStep: 'Se quiser, a próxima boa conversa é mapear o seu mês em blocos simples para encontrar a pressão estrutural.'
    },
    padrao_de_vida: {
      reading: 'Buscar conforto ou praticidade não é erro moral. A questão é entender qual estrutura financeira isso exige para continuar de pé.',
      pattern: 'Um padrão comum aqui é o custo principal não estar na compra, e sim na manutenção do padrão que ela puxa junto.',
      impact: 'Quando o estilo de vida cresce no automático, o mês fica mais rígido e qualquer queda de margem assusta mais.',
      awareness: 'Vale perguntar menos "isso cabe?" e mais "que padrão isso alimenta ao longo do tempo?".',
      nextStep: 'A boa próxima etapa é separar valor real para você de custo automático de manutenção.'
    },
    habito_e_consumo: {
      reading: 'Comportamento financeiro responde muito a contexto, cansaço e busca de alívio. Isso não é julgamento, é leitura de ambiente.',
      pattern: 'Um padrão comum é o gasto pequeno recorrente parecer irrelevante no dia e pesado no acumulado.',
      impact: 'O problema raramente vem de um ato só. Ele nasce na repetição que reduz margem sem chamar atenção.',
      awareness: 'Ler o gatilho antes da compra costuma ser mais útil do que só tentar aumentar força de vontade.',
      nextStep: 'Escolha um hábito específico e leia o ciclo completo: gatilho, compra, recorrência e custo.'
    },
    planejamento_e_clareza: {
      reading: 'Planejamento não serve para apertar sua vida. Serve para devolver visibilidade ao seu dinheiro.',
      pattern: 'Sem mapa, o mês vira uma sequência de reações. É fácil confundir correria com progresso.',
      impact: 'Quando você nomeia blocos e prioridades, recupera margem de escolha e reduz improviso caro.',
      awareness: 'Clareza não é restrição; é o que permite decidir sem neblina.',
      nextStep: 'Se quiser, a próxima conversa pode ser montar um mapa simples do mês com prioridades reais.'
    }
  };

  const response = scenarioResponses[scenario.id] || scenarioResponses.planejamento_e_clareza;

  return [
    '## Leitura do contexto',
    response.reading,
    '',
    '## Padrão possível',
    response.pattern,
    '',
    '## Impacto estrutural',
    response.impact,
    '',
    '## Vale observar',
    response.awareness,
    '',
    '## Direcionamento leve',
    response.nextStep,
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatOpenResponse() {
  return [
    '## Como eu posso te ajudar aqui',
    'Eu posso ler uma decisão concreta com você, explicar um conceito financeiro sem jargão ou ajudar a enxergar o padrão que está apertando seu mês.',
    '',
    '## Jeito de responder',
    'Quando a dúvida é prática, eu comparo custo total, caixa, juros, liquidez e risco de perder controle. Quando a dor ainda está difusa, eu ajudo a transformar isso em algo mais claro.',
    '',
    '## Se quiser começar por algo objetivo',
    '- Me diga a decisão que você está tentando tomar.',
    '- Ou me diga o que mais te incomoda hoje na sua vida financeira.',
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function summarizeEvaluation(evaluation) {
  if (!evaluation) return 'Ainda sem recomendação final; faltam dados críticos.';
  return [
    `Classificação: ${evaluation.classification}.`,
    `Tendência: ${evaluation.tendency}.`,
    `Risco principal: ${evaluation.alert}`,
    `Próximo passo: ${evaluation.nextStep}`
  ].join(' ');
}

/* =========================
   Estado
========================= */

export function createConversationState() {
  return {
    themeId: null,
    stage: 'abertura',
    intent: 'open',
    entryType: 'unknown',
    requiredFields: [],
    collectedData: {},
    blockingRules: [],
    followUpQuestions: [],
    lastRecommendation: null,
    lastNextStep: null,
    lastPatternReading: null,
    diagnosticContext: null
  };
}

/* =========================
   Principal
========================= */

export function analyzeConversationTurn(userMessage, previousState = createConversationState(), options = {}) {
  const normalized = normalizeText(userMessage);

  const entryType = classifyConversationEntry(normalized);
  let intent = detectIntent(normalized, previousState);

  const theme = detectTheme(userMessage, previousState.themeId);
  const activeTheme = theme || getThemeById(previousState.themeId);

  const fallbackScenario = findFallbackScenario(normalized);
  const concept = findConcept(normalized);

  const extractedData = extractData(userMessage, normalized, activeTheme?.id || previousState.themeId);
  const collectedData = mergeData(previousState.collectedData, extractedData);

  const diagnosticContext = options.diagnosticContext || previousState.diagnosticContext || null;

  if (intent === 'open' && activeTheme?.mode === 'decision') intent = 'decision';
  if (intent === 'open' && activeTheme?.mode === 'pattern') intent = 'pattern';

  const missingFields = getMissingFields(activeTheme, collectedData);

  const followUpQuestions =
    activeTheme?.mode === 'decision'
      ? getNextBestQuestions(activeTheme, collectedData, 3)
      : activeTheme?.mode === 'pattern'
        ? (activeTheme.suggestedQuestions || [])
            .filter((field) => isMissing(collectedData[field]))
            .slice(0, 3)
            .map((field) => ({
              field,
              question: fieldCatalog[field]?.question,
              category: fieldCatalog[field]?.category || 'padrao'
            }))
            .filter((item) => item.question)
        : [];

  const shouldAskDecision =
    Boolean(activeTheme) &&
    activeTheme.mode === 'decision' &&
    (intent === 'decision' || intent === 'planning' || previousState.stage === 'coleta_decisao') &&
    missingFields.length > 0;

  const shouldAskPattern =
    Boolean(activeTheme) &&
    activeTheme.mode === 'pattern' &&
    (intent === 'pattern' || previousState.stage === 'coleta_padrao') &&
    followUpQuestions.length > 0 &&
    Object.keys(collectedData).length < 2;

  const evaluation =
    activeTheme?.mode === 'decision' && !shouldAskDecision
      ? evaluateTheme(activeTheme.id, collectedData)
      : null;

  const patternReading =
    activeTheme?.mode === 'pattern'
      ? buildPatternReading(activeTheme, collectedData, fallbackScenario)
      : (intent === 'pattern' || fallbackScenario)
        ? buildPatternReading(activeTheme, collectedData, fallbackScenario)
        : null;

  let stage = 'abertura';
  let localResponse = formatOpenResponse();

  if (shouldAskDecision) {
    stage = 'coleta_decisao';
    localResponse = formatFollowUpDecisionResponse({ theme: activeTheme, followUpQuestions });
  } else if (shouldAskPattern) {
    stage = 'coleta_padrao';
    localResponse = formatFollowUpPatternResponse({ theme: activeTheme, followUpQuestions });
  } else if (activeTheme?.mode === 'decision' && evaluation) {
    stage = 'recomendacao_decisao';
    localResponse = formatDecisionResponse({ theme: activeTheme, evaluation });
  } else if (patternReading) {
    stage = 'leitura_padrao';
    localResponse = formatPatternResponse({ theme: activeTheme, patternReading });
  } else if (concept) {
    stage = 'explicacao';
    localResponse = formatConceptResponse(concept);
  } else if (fallbackScenario) {
    stage = 'leitura';
    localResponse = formatScenarioResponse(fallbackScenario);
  }

  const knowledgeSnippets = findRelevantKnowledge(userMessage, activeTheme?.id, diagnosticContext);
  const diagnosticPrompt = diagnosticContext ? buildDiagnosticAwarePrompt(diagnosticContext) : null;

  const nextState = {
    themeId: activeTheme?.id || null,
    stage,
    intent,
    entryType,
    requiredFields: activeTheme?.requiredFields || [],
    collectedData,
    blockingRules: activeTheme?.blockingRules || [],
    followUpQuestions,
    lastRecommendation: evaluation?.tendency || previousState.lastRecommendation,
    lastNextStep: evaluation?.nextStep || previousState.lastNextStep,
    lastPatternReading: patternReading?.reading || previousState.lastPatternReading,
    diagnosticContext
  };

  return {
    theme: activeTheme,
    intent,
    entryType,
    stage,
    collectedData,
    missingFields,
    followUpQuestions,
    evaluation,
    patternReading,
    knowledgeSnippets,
    diagnosticPrompt,
    localResponse,
    nextState,
    modelBrief: {
      theme: activeTheme?.title || 'tema em aberto',
      stage,
      intent,
      entryType,
      missingFields,
      followUpQuestions: followUpQuestions.map((item) => item.question),
      collectedData,
      evaluationSummary: summarizeEvaluation(evaluation),
      patternSummary: patternReading?.reading || null,
      knowledge: knowledgeSnippets.map((item) => item.summary),
      diagnosticPrompt
    }
  };
}