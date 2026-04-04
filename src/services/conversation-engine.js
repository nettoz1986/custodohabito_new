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
      reading: 'O orçamento não é uma ferramenta de castigo, é o mapa da sua autonomia. Ele serve para mostrar quanto custa sustentar sua vida hoje antes de você tentar acelerar qualquer meta.',
      pattern: 'O padrão invisível aqui é o "gasto por esperança": você assume compromissos contando com uma clareza que o automático apaga.',
      impact: 'Sem esse mapa, você não perde só dinheiro; você perde a margem de manobra para reagir quando o sistema oscila.',
      awareness: 'Em vez de vigiar cada centavo, vigie o desenho dos seus blocos: quanto do seu mês já nasce comprometido?',
      nextStep: 'Separe o que é custo de sobrevivência (essencial) do que é custo de estilo de vida. Onde está a sua gordura?'
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
  },
  {
    id: 'linha_do_zero',
    triggers: ['linha do zero', 'zero relativo', 'margem de manobra', 'sem margem', 'perto do zero'],
    response: {
      reading: 'A linha do zero não é um número na planilha. É o ponto de pressão onde sua rotina deixa de absorver imprevistos e passa a depender de crédito ou pressa.',
      pattern: 'Muitas pessoas operam "encostadas no zero" achando que estão seguras só porque o saldo é positivo, ignorando que não possuem amortecedores.',
      impact: 'Quanto mais perto da linha, mais caro fica qualquer erro e mais agressivo o sistema se torna com você.',
      awareness: 'A pergunta não é quanto você tem, mas quanta distância existe entre sua vida atual e o desespero.',
      nextStep: 'Identifique seus amortecedores hoje: liquidez imediata, reserva de tempo ou flexibilidade de custos.'
    }
  },
  {
    id: 'fisiologia_do_gasto',
    triggers: ['fisiologia do gasto', 'custo de funcionamento', 'custo basal', 'manutencao invisivel'],
    response: {
      reading: 'Todo gasto ativa um circuito vivo. O preço da etiqueta é apenas o nascimento; a vida do objeto exige manutenção, tempo e espaço.',
      pattern: 'O erro comum é olhar o custo de entrada e ignorar o custo de funcionamento que vai drenar sua margem nos próximos meses.',
      impact: 'Ignorar a fisiologia do gasto cria uma rigidez silenciosa: você tem as coisas, mas não tem mais fôlego financeiro.',
      awareness: 'Não se pergunte apenas se "cabe no bolso" agora, pergunte se você quer sustentar esse organismo no longo prazo.',
      nextStep: 'Liste o que esse gasto puxa junto: ele pede upgrades, revisões, mensalidades ou mais do seu tempo?'
    }
  },
  {
    id: 'uso_vs_necessidade',
    triggers: ['uso ou necessidade', 'uso vs necessidade', 'necessidade real', 'isso serve', 'se eu nao tiver isso'],
    response: {
      reading: 'Quase tudo tem algum uso. O ponto e descobrir se existe necessidade real agora.',
      pattern: 'A mente costuma justificar com facilidade: pode ajudar, pode otimizar, pode ser util depois. Uso quase sempre aparece primeiro; necessidade precisa ser provada.',
      impact: 'Quando uso vira criterio de prioridade, o dinheiro comeca a correr para tudo o que parece justificavel e a estrutura perde foco.',
      awareness: 'Uso justifica. Necessidade decide.',
      nextStep: 'Pergunte assim: se eu nao tiver isso agora, o que de fato acontece com meu objetivo, meu trabalho ou minha seguranca?'
    }
  },
  {
    id: 'sustentabilidade',
    triggers: ['saude', 'cansaco', 'fadiga', 'sono', 'energia', 'corpo', 'rotina insustentavel'],
    response: {
      reading: 'Corpo, mente, tempo e energia tambem entram na equacao financeira. Algumas dividas comecam no corpo antes de aparecer no extrato.',
      pattern: 'Um padrao comum e tentar ganhar eficiencia financeira sacrificando sono, recuperacao, movimento ou clareza mental.',
      impact: 'Quando a sustentacao corporal cai, piora a decisao, piora a renda e cresce a chance de custo corretivo no futuro.',
      awareness: 'Saude aqui nao e estetica nem performance. E infraestrutura silenciosa para sustentar a vida.',
      nextStep: 'Vale observar se sua rotina atual esta te dando margem de decisao ou se esta te empurrando para respostas cada vez mais curtas e caras.'
    }
  }
];

const conceptOverrides = {
  linha_do_zero: {
    triggers: [
      'saldo positivo',
      'saldo negativo',
      'ficar no positivo',
      'ficar no negativo',
      'entrar no vermelho',
      'ficar no vermelho',
      'quando devo',
      'juros quando devo',
      'juros da divida',
      'juros sao maiores',
      'inflacao me joga',
      'inflacao faz gastar',
      'importancia de nao dever',
      'manter positivo',
      'nao entrar no cheque',
      'nao usar rotativo'
    ],
    response: {
      reading: `Você precisa entender a mecânica mais importante das finanças pessoais: ficar com R$ 100,00 na conta durante um mês ou usar R$ 100,00 do cheque especial pelo mesmo período não resultam no mesmo valor.

Isso é meio óbvio, mas muita gente não percebe que tem que se afastar da "linha do zero". Quando você está com saldo positivo, o dinheiro rende pouco. A poupança ou uma conta remunerada devolvem algo próximo de 80% do CDI, que por sua vez anda junto com a inflação. Ou seja: você está basicamente preservando o poder de compra, com ganho real pequeno.

Quando você passa para o lado negativo - entra no rotativo, usa cheque especial, atrasa fatura - os juros do outro lado são brutalmente maiores. Rotativo de cartão costuma passar de 300% ao ano no Brasil. Cheque especial, acima de 130%. O sistema não é neutro: ele penaliza quem cruza essa linha, mesmo que por pouco tempo, de forma mais agressiva do que recompensa quem fica acima.

A inflação entra na conta como um terceiro fator: ela corrói o valor do que você tem, mas também corrói o custo do que você compra depois - o que cria uma pressão constante de gasto que empurra as pessoas para mais perto da linha sem que elas percebam. Você não gastou mais. As coisas ficaram mais caras. O resultado é o mesmo.`,
      pattern: 'O padrão mais comum aqui é a pessoa operar muito próxima ao zero sem perceber, achando que está bem porque o saldo não ficou negativo. O problema é que perto do zero não existe amortecedor - qualquer imprevisto empurra imediatamente para o lado negativo e o sistema passa a cobrar caro.',
      impact: 'A distância do zero não é só número. Ela define quão caro um erro vai custar. Acima do zero com margem: erro é absorvido. Acima do zero sem margem: erro vira crédito. Abaixo do zero: erro vira bola de neve.',
      awareness: 'A pergunta útil não é "quanto eu tenho", mas "quanto de espaço existe entre minha rotina atual e o ponto onde o sistema passa a cobrar caro por mim".',
      nextStep: 'Se quiser tornar isso prático: estime seu custo fixo mensal real, o mínimo necessário para o mês funcionar, e veja qual é a sua distância atual desse número. Essa margem é o que protege você antes do zero.'
    }
  },
  fisiologia_do_gasto: {
    triggers: [
      'custo das coisas',
      'custo real',
      'quanto custa de verdade',
      'alem do preco',
      'mais do que o preco',
      'custo depois da compra',
      'o que uma compra custa',
      'manutencao',
      'depreciacao',
      'revenda',
      'reposicao',
      'custo oculto',
      'custo escondido',
      'custo invisivel',
      'custo total',
      'custo ao longo do tempo',
      'custa mais do que parece',
      'gasto continua',
      'gasto depois'
    ],
    response: {
      reading: `Toda compra tem dois preços: o que aparece na etiqueta e aquele que vem junto com a vida útil do objeto. Entender esses elementos muda a forma como você avalia qualquer gasto:

Manutenção: é o que o objeto exige periodicamente para continuar funcionando. Carro pede revisão, pneu, óleo, freio. Imóvel pede pintura, encanamento, elétrica. Eletrodoméstico pede assistência técnica. Isso não é exceção - é a regra de qualquer coisa com partes móveis ou que envelhece. A manutenção transforma o preço de compra em uma mensalidade invisível que você paga ao longo do tempo.

Depreciação: é a perda de valor ao longo do uso. Um carro novo perde entre 15% e 25% do valor só nos primeiros dois anos. Um celular perde mais da metade do valor em 18 meses. Isso significa que parte do que você pagou já "desapareceu" - você não perdeu dinheiro para alguém, mas perdeu a opção de resgatar esse valor se precisar. Depreciação rápida reduz sua margem de manobra futura.

Reposição: toda compra tem uma vida útil. Quando ela termina, o ciclo recomeça. Se você comprou algo barato mas que dura pouco, a conta real é preço dividido pelos meses de uso - não o preço em si. Às vezes o que tem maior preço sai mais barato por ano de uso porque a reposição demora mais.

Revenda: nem tudo que você compra ainda tem valor quando você não quer mais. Quando você precisa vender algo rápido - por necessidade ou mudança de plano - o mercado não paga o preço que você pagou. Isso é perda de liquidez: o objeto existe, mas não vira dinheiro rápido. Compras com revenda difícil aprisionam capital.`,
      pattern: 'O padrão mais comum é olhar só o preço de entrada e ignorar que a compra vai continuar cobrando nos próximos meses. Isso aparece muito em eletrônicos, carros, imóveis e até assinaturas de serviço.',
      impact: 'Quando vários gastos com custo de funcionamento alto se acumulam, a pessoa fica com muita coisa e pouca margem. O mês está comprometido não por uma decisão grande, mas pela soma desses valores ao mesmo tempo.',
      awareness: 'A pergunta certa antes de qualquer compra relevante não é só "cabe no orçamento agora?" - é "quero e posso sustentar esse custo de funcionamento por quanto tempo?".',
      nextStep: 'Escolha um objeto que você usa com frequência e tente estimar quanto ele custa por mês de verdade: preço de compra dividido pelos meses de uso, mais manutenção média, menos o que você conseguiria revender hoje. Esse número costuma surpreender.'
    }
  }
};

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
  const concept = conceptLibrary.find((item) => {
    const overrideTriggers = conceptOverrides[item.id]?.triggers || [];
    return [...item.triggers, ...overrideTriggers].some((trigger) => normalized.includes(trigger));
  });

  if (!concept) return null;

  const override = conceptOverrides[concept.id];
  if (!override) return concept;

  return {
    ...concept,
    triggers: [...concept.triggers, ...override.triggers],
    response: override.response
  };
}

export function containsFinancialContext(normalized) {
  const financialPatterns = [
    /\d+\s*(?:mil|reais|r\$)/,
    /r\$\s*\d+/,
    /\d{3,}/,
    'gasto',
    'ganho',
    'recebo',
    'sobra',
    'falta',
    'tenho na conta',
    'minha conta',
    'meu salario',
    'minha renda',
    'por mes',
    'todo mes',
    'ao mes',
    'no fim do mes',
    'final do mes',
    'no final'
  ];

  return financialPatterns.some((pattern) =>
    pattern instanceof RegExp ? pattern.test(normalized) : normalized.includes(pattern)
  );
}

export function formatConceptContinuationHuman(previousState, collectedData) {
  const conceptId = previousState.lastConceptId || 'linha_do_zero';

  const gastoMensal = collectedData.gasto_fixo_mensal;
  const margemFinal = collectedData.margem_no_mes_valor;

  if (conceptId === 'linha_do_zero' && (gastoMensal || margemFinal)) {
    if (gastoMensal && margemFinal) {
      const rendaEstimada = gastoMensal + margemFinal;
      const percentualMargem = ((margemFinal / rendaEstimada) * 100).toFixed(0);

      let leitura = '';
      let alerta = '';
      let proximo = '';

      if (percentualMargem < 15) {
        leitura = `Você tem R$ ${margemFinal.toLocaleString('pt-BR')} sobrando de uma renda estimada de R$ ${rendaEstimada.toLocaleString('pt-BR')} - isso representa ${percentualMargem}% da sua renda. É positivo, mas a margem está estreita.`;
        alerta = 'Com essa folga, um imprevisto de dois ou três meses de custo já pressiona o sistema. Não está em zona de risco imediato, mas está operando com pouco amortecedor.';
        proximo = `O próximo passo prático é avaliar qual parte dos R$ ${gastoMensal.toLocaleString('pt-BR')} é custo rígido (mora, alimentação, contas fixas) e qual tem alguma flexibilidade. Essa distinção define o quanto você pode manobrar se o mês apertar.`;
      } else if (percentualMargem < 30) {
        leitura = `Você gasta R$ ${gastoMensal.toLocaleString('pt-BR')} e sobram R$ ${margemFinal.toLocaleString('pt-BR')} - ${percentualMargem}% da renda fica disponível. É uma margem razoável, mas ainda não é confortável.`;
        alerta = 'Essa sobra precisa estar fazendo alguma coisa: reserva, objetivo, amortecimento. Se estiver parada ou sendo consumida aos poucos, a distância real do zero é menor do que parece.';
        proximo = `Vale perguntar: onde esses R$ ${margemFinal.toLocaleString('pt-BR')} estão indo hoje? Se parte deles não tem destino claro, essa é a primeira conversa a ter.`;
      } else {
        leitura = `Você gasta R$ ${gastoMensal.toLocaleString('pt-BR')} e tem R$ ${margemFinal.toLocaleString('pt-BR')} de sobra - ${percentualMargem}% da renda. É uma margem saudável.`;
        alerta = 'Com essa folga, você tem espaço para construir amortecedores reais. O risco aqui não é a linha do zero - é deixar essa margem ser consumida por expansão de padrão de vida sem perceber.';
        proximo = 'A pergunta útil agora é: essa sobra tem destino? Reserva, objetivo de médio prazo, investimento? Margem sem destino tende a virar gasto com o tempo.';
      }

      return [
        leitura,
        '',
        alerta,
        '',
        proximo,
        '',
        '_Conteúdo educacional. Não substitui consultoria financeira individual._'
      ].join('\n');
    }

    if (gastoMensal && !margemFinal) {
      return [
        `Com R$ ${gastoMensal.toLocaleString('pt-BR')} de gasto mensal, consigo fazer uma leitura parcial, mas preciso de mais um dado: quanto sobra ou fica disponível no final do mês?`,
        '',
        'Esse número define a distância real da sua linha do zero.',
        '',
        '_Conteúdo educacional. Não substitui consultoria financeira individual._'
      ].join('\n');
    }

    if (!gastoMensal && margemFinal) {
      return [
        `R$ ${margemFinal.toLocaleString('pt-BR')} sobrando é um bom começo de leitura. Para entender se essa margem é confortável ou estreita, preciso saber: quanto é o seu custo mensal total?`,
        '',
        '_Conteúdo educacional. Não substitui consultoria financeira individual._'
      ].join('\n');
    }
  }

  return [
    'Esses dados ajudam a tornar a leitura mais concreta.',
    '',
    'Para eu aplicar o conceito à sua situação específica, me confirma: qual é o seu gasto mensal estimado e quanto fica disponível no final do mês?',
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

/* =========================
   Extração de dados
========================= */

export const imovelExtractionPatterns = {
  tempo_esperado_no_imovel: {
    longo: [
      'vou ficar muitos anos',
      'longo prazo no imovel',
      'pretendo ficar',
      'nao pretendo me mudar',
      'nao pretendo mudar',
      'quero ficar',
      'nao vou sair',
      'minha ideia e ficar',
      'planejo ficar',
      'vou morar la por muito tempo',
      'nao tenho plano de sair',
      'por muitos anos',
      'definitivo',
      'para sempre'
    ],
    curto: [
      'talvez eu mude',
      'nao sei se fico',
      'pouco tempo no imovel',
      'posso me mudar',
      'nao sei quanto tempo fico',
      'talvez precise mudar',
      'posso precisar sair',
      'nao e definitivo',
      'pode mudar',
      'provisorio'
    ]
  },
  estabilidade_profissional: {
    alta: [
      'estavel',
      'estabilidade',
      'renda estavel',
      'cidade estavel',
      'emprego fixo',
      'renda fixa',
      'trabalho estavel',
      'minha situacao esta estavel',
      'estou bem no trabalho',
      'nao planejo mudar de emprego',
      'concurso publico'
    ],
    baixa: [
      'instavel',
      'posso mudar de cidade',
      'renda incerta',
      'cidade incerta',
      'posso ser demitido',
      'nao sei o que acontece',
      'minha renda varia',
      'trabalho por conta propria',
      'freelancer',
      'autonomo',
      'nao sei se fico na mesma cidade'
    ]
  },
  necessidade_de_mobilidade: {
    alta: [
      'mobilidade alta',
      'posso mudar',
      'quero flexibilidade',
      'posso precisar me mudar',
      'situacao pode mudar',
      'nao e certo que fico',
      'talvez precise de mobilidade'
    ],
    baixa: [
      'bem fixo',
      'nao pretendo mudar',
      'estou enraizado',
      'nao pretendo me mudar',
      'nao quero me mudar',
      'estou fixo',
      'fixo no lugar',
      'nao penso em sair',
      'pretendo continuar aqui',
      'nao tenho plano de mudar de cidade',
      'bem estabelecido'
    ]
  }
};

export function extractImovelFields(normalized) {
  const data = {};
  const patterns = imovelExtractionPatterns;

  if (patterns.tempo_esperado_no_imovel.longo.some((term) => normalized.includes(term))) {
    data.tempo_esperado_no_imovel = 'longo';
  } else if (patterns.tempo_esperado_no_imovel.curto.some((term) => normalized.includes(term))) {
    data.tempo_esperado_no_imovel = 'curto';
  }

  if (patterns.estabilidade_profissional.alta.some((term) => normalized.includes(term))) {
    data.estabilidade_profissional = 'alta';
  } else if (patterns.estabilidade_profissional.baixa.some((term) => normalized.includes(term))) {
    data.estabilidade_profissional = 'baixa';
  }

  if (patterns.necessidade_de_mobilidade.baixa.some((term) => normalized.includes(term))) {
    data.necessidade_de_mobilidade = 'baixa';
  } else if (patterns.necessidade_de_mobilidade.alta.some((term) => normalized.includes(term))) {
    data.necessidade_de_mobilidade = 'alta';
  }

  return data;
}

export function extractImovelValues(message, normalized) {
  const data = {};

  const aluguelPatterns = [
    /aluguel[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i,
    /pago[^\d]{0,15}r?\$?\s*([\d\.\,]+)[^\n]{0,20}(?:aluguel|apartamento|casa|imovel|moradia)/i,
    /(?:aluguel|apartamento|casa|imovel|moradia)[^\n]{0,30}r?\$?\s*([\d\.\,]+)/i,
    /(?:custo|custa|costo)[^\d]{0,15}r?\$?\s*([\d\.\,]+)[^\n]{0,20}(?:aluguel|moradia)/i,
    /mensalidade[^\d]{0,15}r?\$?\s*([\d\.\,]+)/i,
    /pago[^\d]{0,10}(?:uns?|uns?\s)?r?\$?\s*([\d\.\,]+(?:\s*mil)?)\s*(?:num?|de|por)\s*(?:apartamento|casa|imovel)/i,
    /r?\$?\s*([\d\.\,]+(?:\s*mil)?)\s*de\s*aluguel/i
  ];

  for (const pattern of aluguelPatterns) {
    const match = message.match(pattern);
    if (!match?.[1]) continue;

    const raw = match[1].replace(/\s*mil\s*/i, '000').replace(/\./g, '').replace(',', '.');
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0) {
      data.aluguel_mensal = value;
      break;
    }
  }

  const valorImovelPatterns = [
    /(?:vale|valor|custa|avaliado)[^\d]{0,20}r?\$?\s*([\d\.\,]+(?:\s*mil)?)/i,
    /imovel[^\d]{0,20}r?\$?\s*([\d\.\,]+(?:\s*mil)?)/i,
    /apartamento[^\n]{0,20}r?\$?\s*([\d\.\,]+(?:\s*mil)?)/i
  ];

  for (const pattern of valorImovelPatterns) {
    const match = message.match(pattern);
    if (!match?.[1]) continue;

    const raw = match[1].replace(/\s*mil\s*/i, '000').replace(/\./g, '').replace(',', '.');
    const value = Number(raw);
    if (Number.isFinite(value) && value > 10000) {
      data.valor_imovel = value;
      break;
    }
  }

  const parcelaPatterns = [
    /\bparcela\b[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i,
    /\bfinanciamento\b[^\d]{0,20}r?\$?\s*([\d\.\,]+)/i,
    /pagaria[^\d]{0,20}r?\$?\s*([\d\.\,]+)[^\n]{0,20}(?:mes|financiamento|parcela)/i
  ];

  for (const pattern of parcelaPatterns) {
    const match = message.match(pattern);
    if (!match?.[1]) continue;

    const raw = match[1].replace(/\s*mil\s*/i, '000').replace(/\./g, '').replace(',', '.');
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0) {
      data.parcela_financiamento = value;
      break;
    }
  }

  if (
    normalized.includes('concurso') &&
    (normalized.includes('outra cidade') || normalized.includes('outro estado') || normalized.includes('diferente'))
  ) {
    data._concurso_outra_cidade = true;
  }

  return data;
}

export function extractMonthlyContext(message, normalized) {
  const data = {};

  const gastoPatterns = [
    /gasto[^\d]{0,15}(?:uns?|cerca de|em torno de|aproximadamente)?\s*r?\$?\s*([\d\.\,]+(?:\s*mil)?)\s*(?:por mes|ao mes|mensais?|\/mes)/i,
    /gasto[^\d]{0,10}r?\$?\s*([\d\.\,]+(?:\s*mil)?)\s*(?:por mes|ao mes)/i,
    /(?:meus gastos?|custo mensal|despesas? mensais?|gastos? fixos?)[^\d]{0,15}(?:sao|e|ficam|chegam a)?\s*r?\$?\s*([\d\.\,]+(?:\s*mil)?)/i,
    /(?:saem|gastam)[^\d]{0,10}r?\$?\s*([\d\.\,]+(?:\s*mil)?)\s*(?:por mes|ao mes|todo mes)/i
  ];

  for (const pattern of gastoPatterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const value = parseMil(match[1]);
      if (value > 0) {
        data.gasto_fixo_mensal = value;
        break;
      }
    }
  }

  const margemPatterns = [
    /(?:tenho|fica|sobra|resta)[^.]{0,60}(?:no final|no fim|ao final|ao fim)[^.]{0,30}(?:uns?|cerca de)?\s*r?\$?\s*([\d\.\,]+(?:\s*mil)?)/i,
    /(?:no final|no fim|ao final|ao fim)[^\d]{0,30}(?:tenho|sobra|fica|resta|tem)\s*(?:uns?|cerca de)?\s*r?\$?\s*([\d\.\,]+(?:\s*mil)?)/i,
    /(?:sobra[mr]?|restam?|fico com|ficam)\s*(?:uns?|cerca de)?\s*r?\$?\s*([\d\.\,]+(?:\s*mil)?)/i,
    /tenho\s*(?:uns?|cerca de)?\s*r?\$?\s*([\d\.\,]+(?:\s*mil)?)\s*(?:sobrando|de sobra|disponivel|livre)/i,
    /(?:saldo|sobra)[^\d]{0,20}(?:de|e|e de)?\s*r?\$?\s*([\d\.\,]+(?:\s*mil)?)\s*(?:ao mes|por mes|no final|mensal)?/i
  ];

  for (const pattern of margemPatterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const value = parseMil(match[1]);
      if (value > 50 && value < 500000) {
        data.margem_no_mes_valor = value;
        break;
      }
    }
  }

  return data;
}

function parseMil(raw) {
  const hasMil = /mil/i.test(raw);
  const clean = raw
    .replace(/\s*mil\s*/i, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = Number(clean.trim());
  if (!Number.isFinite(num) || num <= 0) return 0;
  return hasMil ? num * 1000 : num;
}

export const urgencyTriggers = {
  alta: [
    'urgente',
    'preciso agora',
    'nao posso esperar',
    'imediato',
    'preciso logo',
    'nao tem tempo',
    'e para agora',
    'preciso esta semana',
    'preciso este mes',
    'quebrando',
    'parou de funcionar',
    'nao funciona mais',
    'sem carro',
    'sem celular'
  ],
  media: [
    'em breve',
    'logo',
    'media urgencia',
    'nos proximos meses',
    'ate o fim do ano',
    'ate o ano que vem',
    'em alguns meses'
  ],
  baixa: [
    'sem pressa',
    'pode esperar',
    'da para esperar',
    'posso esperar',
    'futuramente',
    'no futuro',
    'a longo prazo',
    'quando der',
    'nao tem pressa',
    'nao e urgente',
    'nao preciso agora',
    'quando puder',
    'planejo para',
    'pensando em',
    'quero no futuro',
    'para substituir',
    'para trocar',
    'no longo prazo',
    'a medio prazo',
    'nao e agora',
    'um dia'
  ]
};

export const missingFieldTriggers = {
  disciplina_alta: [
    'consigo guardar',
    'consigo poupar',
    'guardo todo mes',
    'guardo mensalmente',
    'tenho disciplina',
    'consigo manter',
    'consigo separar',
    'separo todo mes',
    'costumo guardar',
    'sempre guardo',
    'nao tenho problema em guardar'
  ],
  disciplina_baixa: [
    'nao consigo guardar',
    'nao consigo poupar',
    'nao tenho disciplina',
    'sempre gasto tudo',
    'nao sobra para guardar',
    'acabo gastando',
    'preciso de trava',
    'preciso de algo que me force'
  ],
  bem_nao_essencial: [
    'da para reorganizar',
    'da para me reorganizar',
    'consigo sem',
    'posso reorganizar',
    'nao e essencial',
    'nao e necessario agora',
    'e opcional',
    'posso esperar',
    'da para viver sem',
    'nao preciso agora',
    'seria um upgrade',
    'seria uma melhoria',
    'nao e urgente',
    'daria para continuar sem'
  ],
  bem_essencial: [
    'e essencial',
    'preciso para trabalhar',
    'nao consigo sem',
    'e necessario',
    'nao tem como reorganizar',
    'dependo disso',
    'parou de funcionar'
  ],
  sem_mecanismo: [
    'consigo sozinho',
    'nao preciso de trava',
    'tenho disciplina',
    'me organizo bem',
    'guardo sem precisar'
  ],
  com_mecanismo: [
    'preciso de trava',
    'preciso de algo que me force',
    'sem trava nao consigo',
    'se nao tiver compromisso',
    'nao tenho disciplina'
  ]
};

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

  Object.assign(data, extractImovelValues(message, normalized));

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

  if (urgencyTriggers.alta.some((word) => normalized.includes(word))) data.urgencia = 'alta';
  else if (urgencyTriggers.media.some((word) => normalized.includes(word))) data.urgencia = 'media';
  else if (urgencyTriggers.baixa.some((word) => normalized.includes(word))) data.urgencia = 'baixa';

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
  Object.assign(data, extractImovelFields(normalized));

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

  if (missingFieldTriggers.disciplina_alta.some((word) => normalized.includes(word))) {
    data.disciplina_de_aporte = 'alta';
  } else if (missingFieldTriggers.disciplina_baixa.some((word) => normalized.includes(word))) {
    data.disciplina_de_aporte = 'baixa';
  }

  if (missingFieldTriggers.bem_nao_essencial.some((word) => normalized.includes(word))) {
    data.bem_essencial = false;
  } else if (missingFieldTriggers.bem_essencial.some((word) => normalized.includes(word))) {
    data.bem_essencial = true;
  }

  if (missingFieldTriggers.sem_mecanismo.some((word) => normalized.includes(word))) {
    data.usuario_precisa_de_mecanismo_de_compromisso = false;
  } else if (missingFieldTriggers.com_mecanismo.some((word) => normalized.includes(word))) {
    data.usuario_precisa_de_mecanismo_de_compromisso = true;
  }

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

  Object.assign(data, extractMonthlyContext(message, normalized));

  const gastoMensalPatterns = [
    /gasto[^\d]{0,15}(?:uns?|cerca de)?\s*r?\$?\s*(\d[\d\.,]*(?:\s*mil)?)\s*(?:por mes|ao mes|mensais?)/i,
    /gasto\s*(?:uns?|cerca de)?\s*r?\$?\s*(\d[\d\.,]*(?:\s*mil)?)/i
  ];
  for (const pattern of gastoMensalPatterns) {
    const match = message.match(pattern);
    if (match?.[1] && !data.gasto_fixo_mensal) {
      const value = parseMil(match[1]);
      if (value > 0) {
        data.gasto_fixo_mensal = value;
        break;
      }
    }
  }

  const margemPatterns = [
    /tenho\b.{0,80}(?:no final|no fim|ao fim).{0,40}(?:uns?\s+)?r?\$?\s*(\d[\d\.,]*(?:\s*mil)?)/i,
    /(?:sobra[mr]?|restam?|fico com)\s*(?:uns?\s+)?r?\$?\s*(\d[\d\.,]*(?:\s*mil)?)/i,
    /tenho\s+(?:uns?\s+)?r?\$?\s*(\d[\d\.,]*(?:\s*mil)?)\s*(?:sobrando|de sobra|disponiv)/i,
    /(?:no final|no fim)\s+(?:do mes\s+)?(?:tenho|sobra|fica)\s+(?:uns?\s+)?r?\$?\s*(\d[\d\.,]*(?:\s*mil)?)/i
  ];
  for (const pattern of margemPatterns) {
    const match = message.match(pattern);
    if (match?.[1] && !data.margem_no_mes_valor) {
      const value = parseMil(match[1]);
      if (value > 50 && value < 500000) {
        data.margem_no_mes_valor = value;
        break;
      }
    }
  }

  if (data.disciplina_de_aporte === 'alta' && data.usuario_precisa_de_mecanismo_de_compromisso === undefined) {
    data.usuario_precisa_de_mecanismo_de_compromisso = false;
  }
  if (data.disciplina_de_aporte === 'baixa' && data.usuario_precisa_de_mecanismo_de_compromisso === undefined) {
    data.usuario_precisa_de_mecanismo_de_compromisso = true;
  }
  if (data.usuario_precisa_de_mecanismo_de_compromisso === false && data.disciplina_de_aporte === undefined) {
    data.disciplina_de_aporte = 'alta';
  }
  if (data.usuario_precisa_de_mecanismo_de_compromisso === true && data.disciplina_de_aporte === undefined) {
    data.disciplina_de_aporte = 'baixa';
  }

  return data;
}

function mergeData(previousData, newData) {
  const merged = {
    ...previousData,
    ...Object.fromEntries(
      Object.entries(newData).filter(([, value]) => value !== null && value !== undefined && value !== '')
    )
  };

  if (merged.disciplina_de_aporte === 'alta' && merged.usuario_precisa_de_mecanismo_de_compromisso === undefined) {
    merged.usuario_precisa_de_mecanismo_de_compromisso = false;
  }
  if (merged.disciplina_de_aporte === 'baixa' && merged.usuario_precisa_de_mecanismo_de_compromisso === undefined) {
    merged.usuario_precisa_de_mecanismo_de_compromisso = true;
  }
  if (merged.usuario_precisa_de_mecanismo_de_compromisso === false && merged.disciplina_de_aporte === undefined) {
    merged.disciplina_de_aporte = 'alta';
  }
  if (merged.usuario_precisa_de_mecanismo_de_compromisso === true && merged.disciplina_de_aporte === undefined) {
    merged.disciplina_de_aporte = 'baixa';
  }

  return merged;
}

function isMissing(value) {
  return value === null || value === undefined || value === '';
}

export function hasAnsweredImplicitly(fieldKey, history = []) {
  const implicitCoverage = {
    tempo_esperado_no_imovel: [
      'nao pretendo',
      'pretendo ficar',
      'quero ficar',
      'nao vou sair',
      'nao sei se fico',
      'talvez mude',
      'posso mudar',
      'muitos anos'
    ],
    necessidade_de_mobilidade: [
      'pretendo',
      'mudar',
      'fixo',
      'mobilidade',
      'flexibilidade',
      'enraizado'
    ],
    estabilidade_profissional: [
      'estavel',
      'instavel',
      'renda',
      'trabalho',
      'emprego',
      'concurso',
      'cidade'
    ],
    aluguel_mensal: ['aluguel', 'pago de aluguel', 'moradia'],
    parcela_financiamento: ['parcela', 'financiamento', 'prestacao'],
    urgencia: ['urgente', 'pressa', 'esperar', 'pode esperar', 'preciso agora'],
    reserva_emergencia_meses: ['reserva', 'emergencia', 'meses de reserva'],
    margem_no_mes: ['folga', 'apertado', 'cabe', 'sobra', 'margem']
  };

  const userMessages = history
    .filter((item) => item.role === 'user')
    .map((item) => normalizeText(item.content))
    .join(' ');

  const triggers = implicitCoverage[fieldKey];
  if (!triggers?.length) return false;

  return triggers.some((trigger) => userMessages.includes(trigger));
}

export function countConsecutiveSameStage(stage, history = []) {
  if (!Array.isArray(history) || !history.length) return 0;

  const stageMarkers = {
    coleta_decisao: [
      'para eu entender sua linha do zero',
      'me conte um pouco mais do contexto',
      'e para nao te dar uma resposta rasa'
    ],
    coleta_padrao: [
      'tem um padrao aqui que vale nomear',
      'para eu ler isso melhor',
      'direcao provisoria'
    ]
  };

  const markers = stageMarkers[stage] || [];
  if (!markers.length) return 0;

  let count = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index];
    if (message.role !== 'assistant') continue;

    const normalizedContent = normalizeText(message.content);
    if (!markers.some((marker) => normalizedContent.includes(marker))) {
      break;
    }

    count += 1;
  }

  return count;
}

function getMissingFields(theme, data, conversationHistory = []) {
  if (!theme?.requiredFields?.length) return [];
  return theme.requiredFields.filter((field) => {
    if (!isMissing(data[field])) return false;
    return !hasAnsweredImplicitly(field, conversationHistory);
  });
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

export function evaluateImovel(data) {
  const result = {
    classification: 'sem_dados_suficientes',
    tendency: 'depende de contexto',
    logic: [],
    alert: 'Ainda faltam algumas variáveis para uma leitura precisa.',
    nextStep: 'Completar os dados críticos antes de decidir.',
    alternative: 'Se a decisão puder esperar, use esse tempo para reduzir incerteza.'
  };

  const parcela = data.parcela_financiamento ?? 0;
  const aluguel = data.aluguel_mensal ?? 0;
  const valorImovel = data.valor_imovel ?? 0;

  if (data._concurso_outra_cidade) {
    result.classification = 'recomendado_com_ressalvas';
    result.tendency = 'manter flexibilidade por enquanto';
    result.logic = [
      'Você disse que não pretende se mudar, mas há um concurso em outra cidade que muda o terreno.',
      'Quando existe uma variável com poder de relocação, comprar antes do resultado pode imobilizar capital e liberdade ao mesmo tempo.'
    ];

    if (aluguel && valorImovel) {
      const yieldBruto = ((aluguel * 12) / valorImovel * 100).toFixed(1);
      result.logic.push(
        `Com aluguel de R$ ${aluguel.toLocaleString('pt-BR')} num imóvel de R$ ${valorImovel.toLocaleString('pt-BR')}, o yield bruto de locação é de ~${yieldBruto}% ao ano.`
      );
    }

    result.alert = 'Comprar agora e precisar vender rápido costuma ser caro nos dois lados da operação.';
    result.nextStep = 'Aguarde o resultado do concurso antes de fechar qualquer coisa. Use esse período para construir entrada ou fortalecer reserva.';
    result.alternative = 'Se quiser caminhar para compra mesmo assim, avalie só imóveis com liquidez alta e condições de saída claras.';
    return result;
  }

  if (data.necessidade_de_mobilidade === 'alta' || data.estabilidade_profissional === 'baixa') {
    result.classification = 'recomendado';
    result.tendency = 'tender ao aluguel';
    result.logic = [
      'Quando localização ou renda ainda podem mudar bastante, flexibilidade tem valor econômico real.',
      'Imobilizar capital cedo pode prender dinheiro e liberdade ao mesmo tempo.'
    ];
    result.alert = 'Forçar compra em fase instável pode transformar patrimônio em pressão.';
    result.nextStep = 'Antes de decidir por compra, compare o custo de manter a flexibilidade no seu momento atual.';
    result.alternative = 'Se quiser caminhar para compra, use esse período para fortalecer entrada e previsibilidade.';
    return result;
  }

  if (data.tempo_esperado_no_imovel === 'longo' && data.necessidade_de_mobilidade !== 'alta') {
    const estabilidadeConfirmada = data.estabilidade_profissional === 'alta';
    result.classification = 'recomendado_com_ressalvas';
    result.tendency = 'compra pode ser coerente - mas a conta toda precisa fechar';
    result.logic = [
      'Horizonte longo e mobilidade baixa são dois fatores que ajudam a diluir o custo de aquisição.'
    ];

    if (!estabilidadeConfirmada) {
      result.logic.push(
        'Sua estabilidade profissional ainda não está confirmada nessa conversa, e isso é uma variável que pesa na decisão.'
      );
    }

    if (aluguel && valorImovel) {
      const yieldBruto = ((aluguel * 12) / valorImovel * 100).toFixed(1);
      result.logic.push(
        `Você paga R$ ${aluguel.toLocaleString('pt-BR')} de aluguel num imóvel de R$ ${valorImovel.toLocaleString('pt-BR')}. Isso representa um yield bruto de ~${yieldBruto}% ao ano.`
      );
      if (parseFloat(yieldBruto) < 4) {
        result.logic.push('Com esse yield baixo, comprar tende a ser mais caro do que continuar alugando se você considerar o custo de oportunidade da entrada.');
      } else if (parseFloat(yieldBruto) >= 6) {
        result.logic.push('Com esse yield, o aluguel já está relativamente alto em relação ao valor, o que pode favorecer a compra no médio prazo.');
      }
    }

    if (parcela && aluguel) {
      result.logic.push(
        `Ainda falta comparar a parcela estimada do financiamento com o aluguel atual de R$ ${aluguel.toLocaleString('pt-BR')}.`
      );
    }

    result.alert = 'A conta não para na parcela: IPTU, condomínio, manutenção e capital imobilizado precisam entrar. E a entrada não deve desmontar sua reserva.';
    result.nextStep = aluguel && valorImovel
      ? `Com os dados que você já trouxe, o próximo passo é simular a parcela do financiamento e comparar com R$ ${aluguel.toLocaleString('pt-BR')} de aluguel num horizonte de 5 a 10 anos.`
      : 'Monte um comparativo de custo total em 5 e 10 anos antes de fechar qualquer narrativa.';
    result.alternative = 'Se a parcela ficar apertada ou a entrada desmontar sua reserva, continuar alugando mais um tempo ainda pode ser a melhor decisão.';
    return result;
  }

  if (parcela && aluguel && parcela > aluguel * 1.4) {
    result.classification = 'recomendado_com_ressalvas';
    result.tendency = 'ter cautela com a compra';
    result.logic = [
      'A parcela está bem acima do aluguel atual, e o custo de posse merece uma leitura fria.',
      'Comprar porque parece mais patrimonial pode esconder perda de liquidez importante.'
    ];
    result.alert = 'Apertar o fluxo para comprar pode reduzir muito sua margem de manobra.';
    result.nextStep = 'Compare parcela, custos de propriedade e o rendimento que a entrada deixaria de gerar.';
    result.alternative = 'Se a ideia de compra faz sentido no longo prazo, use o período de aluguel para aumentar a entrada.';
    return result;
  }

  if (aluguel || valorImovel || data.tempo_esperado_no_imovel || data.necessidade_de_mobilidade) {
    result.classification = 'leitura_parcial';
    result.tendency = 'ainda sem tendência clara - mas posso adiantar o que já li';
    result.logic = [];

    if (data.tempo_esperado_no_imovel === 'longo') {
      result.logic.push('Horizonte longo: peso positivo para compra, se a conta toda fechar.');
    }
    if (data.necessidade_de_mobilidade === 'baixa') {
      result.logic.push('Mobilidade baixa: outro ponto que favorece compra.');
    }
    if (aluguel) {
      result.logic.push(`Aluguel de R$ ${aluguel.toLocaleString('pt-BR')} identificado; ainda preciso da parcela estimada do financiamento para comparar.`);
    }
    if (!data.estabilidade_profissional) {
      result.logic.push('Estabilidade profissional ainda não foi confirmada, e isso precisa entrar na conta.');
    }

    result.alert = 'Com as informações que temos até agora, a direção parece mais coerente com compra, mas a decisão fica mais segura com a parcela estimada e a confirmação da estabilidade.';
    result.nextStep = 'Me diga a parcela aproximada do financiamento e confirme se sua renda está estável hoje; com isso, a leitura fica muito mais precisa.';
    result.alternative = 'Se não souber a parcela agora, simule num banco ou use uma regra inicial: financiamento de 80% do valor a 30 anos costuma gerar parcela de 0,8% a 1% do valor por mês.';
    return result;
  }

  return result;
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
      return evaluateImovel(data);

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
      if (data.urgencia === 'baixa' && data.bem_essencial === false) {
        result.classification = 'recomendado';
        result.tendency = 'juntar livremente ou investir enquanto decide';
        result.logic = [
          'Sem urgência e sem dependência real do bem, você tem o ativo mais valioso dessa decisão: tempo.',
          'Com isso, financiamento e consórcio perdem a justificativa - ambos cobram um preço por rigidez que você não precisa pagar agora.'
        ];
        result.alert = 'O risco é ficar adiando sem destino claro. Boa intenção sem rota vira procrastinação - e a margem some no cotidiano.';
        result.nextStep = 'Defina se quer guardar para esse objetivo específico ou investir livremente por ora. Conta separada com aporte mensal fixo já resolve.';
        result.alternative = 'Se a urgência mudar lá na frente, volte com o cenário real de então - a decisão fica mais limpa quando os dados são concretos.';
        return result;
      }

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
        reading: 'O que pode estar acontecendo é um comprometimento invisível do mês antes mesmo das escolhas pontuais. Seu dinheiro pode não estar â€œsumindoâ€; ele pode estar sendo absorvido por blocos automáticos, pequenas recorrências e custos que perderam visibilidade.',
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
        bridgeToDecision: 'Com isso, você consegue construir uma resposta mais inteligente do que só â€œtentar se controlarâ€.'
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
    `### Como eu leio o seu terreno`,
    `Olhando para a decisão sobre **${snapshot.theme?.title.toLowerCase()}**, vejo que a direção mais sustentável agora é **${result.tendency}**.`,
    '',
    `**O que está operando aqui:**`,
    result.logic.map((item) => `- ${item}`).join('\n'),
    '',
    `**O risco que vale vigiar:** ${result.alert}`,
    '',
    `**Para ganhar margem agora:** ${result.nextStep}`,
    '',
    `*Essa é uma leitura lógica do sistema, a autoria da decisão final é sempre sua.*`
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

function formatDecisionResponseHuman(snapshot) {
  const themeTitle = snapshot.theme?.title || 'essa decisão';
  const result = snapshot.evaluation || buildDefaultResult();
  const logicLines = result.logic.length
    ? result.logic.map((item) => `- ${item}`).join('\n')
    : '- Ainda faltam variáveis importantes para uma leitura segura.';

  return [
    `Vamos olhar para o contexto antes da decisão sobre ${themeTitle.toLowerCase()}.`,
    `A tendência hoje é ${result.tendency}. Não como regra universal, mas como a direção que parece mais sustentável para o terreno que você me mostrou.`,
    '',
    'O que mais pesou aqui:',
    logicLines,
    '',
    `Principal risco: ${result.alert}`,
    '',
    `Próximo passo: ${result.nextStep}`,
    '',
    `Se a melhor opção não couber agora: ${result.alternative}`,
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatPatternResponseHuman(snapshot) {
  const reading = snapshot.patternReading;

  return [
    reading.reading,
    '',
    `O impacto estrutural aqui é este: ${reading.impact}`,
    '',
    `Vale observar: ${reading.awareness}`,
    '',
    `Próximo passo: ${reading.nextStep}`,
    '',
    reading.bridgeToDecision,
    '',
    '_Conteúdo educacional. A decisão final continua sendo sua._'
  ].join('\n');
}

function formatFollowUpDecisionResponseHuman(snapshot) {
  const themeTitle = snapshot.theme?.title || 'essa decisão';
  const questions = snapshot.followUpQuestions.length
    ? snapshot.followUpQuestions.map((item) => `- ${item.question}`).join('\n')
    : '- Me conte um pouco mais do contexto para eu não cair numa resposta padrão.';

  return [
    `Você trouxe uma dúvida sobre **${snapshot.theme?.title.toLowerCase()}**, e para não te dar uma resposta rasa, eu prefiro olhar para o contexto antes.`,
    '',
    '**Para eu entender sua linha do zero, me conte:**',
    questions,
    '',
    '**Por que isso importa?** Porque a diferença entre uma escolha estratégica e um erro caro está nos detalhes do seu caixa e na urgência do momento.',
    '',
    '*Enquanto isso, evite decisões automáticas baseadas apenas em benefícios pequenos de cartão ou parcelas "que cabem".*'
  ].join('\n');
}
function formatFollowUpDecisionResponseHumanV2(snapshot) {
  const { theme, followUpQuestions, collectedData = {} } = snapshot;
  const themeTitle = theme?.title?.toLowerCase() || 'essa decisão';

  const knownContext = [];
  if (collectedData.margem_no_mes_valor) {
    knownContext.push(`margem mensal de R$ ${collectedData.margem_no_mes_valor.toLocaleString('pt-BR')}`);
  }
  if (collectedData.gasto_fixo_mensal) {
    knownContext.push(`custo mensal de R$ ${collectedData.gasto_fixo_mensal.toLocaleString('pt-BR')}`);
  }
  if (collectedData.parcela_financiamento) {
    knownContext.push(`parcela estimada de R$ ${collectedData.parcela_financiamento.toLocaleString('pt-BR')}`);
  }
  if (collectedData.urgencia === 'baixa') {
    knownContext.push('sem urgência imediata');
  } else if (collectedData.urgencia === 'alta') {
    knownContext.push('urgência alta');
  }

  const openQuestions = followUpQuestions.filter((item) => {
    if (item.field === 'urgencia' && collectedData.urgencia) return false;
    if (item.field === 'bem_essencial' && collectedData.bem_essencial !== undefined) return false;
    if (item.field === 'disciplina_de_aporte' && collectedData.disciplina_de_aporte) return false;
    if (item.field === 'reserva_emergencia_meses' && collectedData.reserva_emergencia_meses !== undefined) return false;
    if (item.field === 'aluguel_mensal' && collectedData.aluguel_mensal) return false;
    if (item.field === 'parcela_financiamento' && collectedData.parcela_financiamento) return false;
    return true;
  });

  if (openQuestions.length === 0) {
    return `Tenho o contexto necessário para ler ${themeTitle}. Deixa eu montar a análise.`;
  }

  const intro = knownContext.length > 0
    ? `Com ${knownContext.join(', ')} já no contexto, só preciso entender mais uma coisa para fechar a leitura de ${themeTitle}:`
    : `Para não te dar uma resposta rasa sobre ${themeTitle}, preciso entender melhor o terreno:`;

  const questionTexts = openQuestions
    .slice(0, 2)
    .map((item) => item.question)
    .filter(Boolean);

  if (questionTexts.length === 1) {
    return [
      intro,
      '',
      questionTexts[0],
      '',
      '_Conteúdo educacional. Não substitui consultoria financeira individual._'
    ].join('\n');
  }

  return [
    intro,
    '',
    questionTexts.join(' E também: '),
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatFollowUpPatternResponseHuman(snapshot) {
  const questions = snapshot.followUpQuestions.length
    ? snapshot.followUpQuestions.map((item) => `- ${item.question}`).join('\n')
    : '- Me conta um pouco mais de quando isso costuma acontecer.';

  return [
    'Tem um padrão aqui que vale nomear com mais cuidado antes de tentar resolver rápido.',
    '',
    'Para eu ler isso melhor:',
    questions,
    '',
    'Estou te perguntando isso porque comportamento financeiro quase nunca nasce só da matemática. Contexto, gatilho, repetição e linha do zero importam muito.',
    '',
    'Direção provisória: antes de corrigir o gasto, vale entender o que ele está tentando resolver.',
    '',
    '_Conteúdo educacional. Isso não é sobre certo ou errado._'
  ].join('\n');
}

function formatConceptResponseHuman(concept) {
  return [
    concept.response.reading,
    '',
    `Um ponto central aqui é este: ${concept.response.pattern}`,
    '',
    `Impacto estrutural: ${concept.response.impact}`,
    '',
    `Vale observar: ${concept.response.awareness}`,
    '',
    `Próximo passo prático: ${concept.response.nextStep}`,
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatScenarioResponseHuman(scenario) {
  const scenarioResponses = {
    pressao_financeira: {
      reading: 'Viver sob pressão financeira raramente é um erro de caráter. Na maioria das vezes, é o resultado de um mês que já nasce estrangulado por compromissos automáticos.',
      pattern: 'O padrão aqui é a "reação constante": como não sobra margem, toda decisão é urgente e, por ser urgente, acaba saindo mais cara.',
      impact: 'Isso gera uma fadiga de decisão que te empurra de volta para o consumo de alívio, fechando o ciclo.',
      awareness: 'O ponto de virada não é ganhar mais, é recuperar o oxigênio entre o que entra e o que já sai carimbado.',
      nextStep: 'Vamos olhar para os seus blocos fixos. Onde o seu dinheiro está morando antes mesmo de você acordar?'
    },
    padrao_de_vida: {
      reading: 'Buscar conforto ou praticidade não é erro moral. A questão é entender qual estrutura financeira isso exige para continuar de pé.',
      pattern: 'Um padrão comum aqui é o custo principal não estar na compra, e sim na manutenção do padrão que ela puxa junto.',
      impact: 'Quando o estilo de vida cresce no automático, o mês fica mais rígido e qualquer queda de margem assusta mais.',
      awareness: 'Vale perguntar menos "isso cabe?" e mais "que padrão isso alimenta ao longo do tempo?".',
      nextStep: 'A boa próxima etapa é separar valor real para você de custo automático de manutenção.'
    },
    habito_e_consumo: {
      reading: 'Comportamento financeiro responde muito a contexto, cansaço e busca de alívio. Isso não é julgamento; é leitura de ambiente.',
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
    },
    linha_do_zero: {
      reading: 'O ponto talvez não seja apenas quanto você ganha ou gasta, mas quão perto sua rotina está do lugar em que qualquer desvio vira aperto.',
      pattern: 'Um padrão comum aqui é operar com pouca folga e descobrir isso só quando aparece um imprevisto.',
      impact: 'Quando a linha do zero fica muito perto, o sistema perde amortecimento e começa a responder com mais rigidez.',
      awareness: 'Vale olhar menos para o saldo isolado e mais para a distância entre sua rotina e a necessidade de usar crédito, improviso ou pressa.',
      nextStep: 'Se quiser, a próxima conversa pode ser mapear seus amortecedores reais: folga mensal, liquidez, reserva e rigidez de custos.'
    },
    fisiologia_do_gasto: {
      reading: 'A compra pode até parecer simples, mas o custo real costuma aparecer no organismo que ela cria depois.',
      pattern: 'Um padrão comum aqui é olhar a entrada e ignorar manutenção, reposição, recorrência e perda de liquidez.',
      impact: 'Quando isso acontece, o gasto parece caber hoje e começa a apertar o sistema em silêncio nos meses seguintes.',
      awareness: 'Vale perguntar não só quanto custa comprar, mas quanto custa sustentar esse circuito em funcionamento.',
      nextStep: 'A boa próxima etapa é listar quais custos passam a existir depois da compra, mesmo que eles pareçam pequenos.'
    },
    sustentabilidade_da_vida: {
      reading: 'Seu corpo e sua mente são a infraestrutura invisível das suas finanças. Algumas dívidas começam no cansaço antes de chegar ao extrato.',
      pattern: 'Tentar ganhar eficiência financeira sacrificando o sono ou a saúde é como queimar os móveis da casa para manter a lareira acesa.',
      impact: 'Quando a sustentação corporal cai, a qualidade da sua decisão despenca e o custo corretivo no futuro será exponencial.',
      awareness: 'Saúde não é luxo nem performance; é margem de manobra operacional.',
      nextStep: 'Onde sua rotina atual está cobrando juros da sua energia que o dinheiro não vai conseguir pagar depois?'
    }
  };

  const response = scenarioResponses[scenario.id] || scenarioResponses.planejamento_e_clareza;

  return [
    response.reading,
    '',
    `Um padrão possível aqui é: ${response.pattern}`,
    '',
    `Impacto estrutural: ${response.impact}`,
    '',
    `Vale observar: ${response.awareness}`,
    '',
    `Direcionamento leve: ${response.nextStep}`,
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatOpenResponseHuman() {
  return [
    'Posso te ajudar de três jeitos por aqui: ler uma decisão concreta, explicar um conceito sem jargão ou mapear o padrão que está apertando sua vida hoje.',
    '',
    'Meu jeito de responder é olhar o terreno antes da resposta. Em vez de só dizer "sim" ou "não", eu tento ler custo total, liquidez, linha do zero, manutenção do gasto e risco de você perder margem de manobra.',
    '',
    'Se quiser começar de forma objetiva:',
    '- Me diga a decisão que você está tentando tomar.',
    '- Ou me diga o que mais está te incomodando hoje na sua vida financeira.',
    '- Ou me pergunte sobre um conceito como linha do zero, custo de funcionamento ou uso versus necessidade.',
    '',
    '_Conteúdo educacional. Não substitui consultoria financeira individual._'
  ].join('\n');
}

function formatOpenResponseHumanV2() {
  return [
    'Posso te ajudar de algumas formas aqui.',
    '',
    'Se você está em dúvida sobre uma compra ou decisão - comprar ou alugar, parcelar ou não, trocar de carro - me conta o cenário e eu leio o terreno com você antes de dar uma direção.',
    '',
    'Se você sente que o dinheiro some, que não sobra nada no fim do mês ou que algo está errado, mas você não sabe exatamente o que, me conta o padrão e a gente entende o que está operando por baixo.',
    '',
    'E se quiser entender melhor um conceito - como funcionam os juros, por que manter saldo positivo importa, o que uma compra realmente custa ao longo do tempo - é só perguntar.',
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
    lastConceptId: null,
    diagnosticContext: null
  };
}

/* =========================
   Principal
========================= */

export function analyzeConversationTurn(userMessage, previousState = createConversationState(), options = {}) {
  const normalized = normalizeText(userMessage);
  const conversationHistory = Array.isArray(options.conversationHistory) ? options.conversationHistory : [];

  const entryType = classifyConversationEntry(normalized);
  let intent = detectIntent(normalized, previousState);

  const theme = detectTheme(userMessage, previousState.themeId);
  const activeTheme = theme || getThemeById(previousState.themeId);

  const fallbackScenario = findFallbackScenario(normalized);
  const concept = findConcept(normalized);

  const isConceptContinuation =
    previousState.stage === 'explicacao' &&
    intent === 'open' &&
    !concept &&
    !activeTheme &&
    containsFinancialContext(normalized);

  if (isConceptContinuation) intent = 'concept_continuation';

  const extractedData = extractData(userMessage, normalized, activeTheme?.id || previousState.themeId);
  const collectedData = mergeData(previousState.collectedData, extractedData);

  const diagnosticContext = options.diagnosticContext || previousState.diagnosticContext || null;

  if (intent === 'open' && activeTheme?.mode === 'decision') intent = 'decision';
  if (intent === 'open' && activeTheme?.mode === 'pattern') intent = 'pattern';

  const missingFields = getMissingFields(activeTheme, collectedData, conversationHistory);
  const repeatedDecisionCollection = countConsecutiveSameStage('coleta_decisao', conversationHistory);
  const repeatedPatternCollection = countConsecutiveSameStage('coleta_padrao', conversationHistory);

  const followUpQuestions =
    activeTheme?.mode === 'decision'
      ? getNextBestQuestions(activeTheme, collectedData, repeatedDecisionCollection > 0 ? 2 : 3)
          .filter((item) => missingFields.includes(item.field))
      : activeTheme?.mode === 'pattern'
        ? (activeTheme.suggestedQuestions || [])
            .filter((field) => missingFields.includes(field))
            .slice(0, repeatedPatternCollection > 0 ? 2 : 3)
            .map((field) => ({
              field,
              question: fieldCatalog[field]?.question,
              category: fieldCatalog[field]?.category || 'padrao'
            }))
            .filter((item) => item.question)
        : [];

  const shouldAskPattern =
    Boolean(activeTheme) &&
    activeTheme.mode === 'pattern' &&
    (intent === 'pattern' || previousState.stage === 'coleta_padrao') &&
    followUpQuestions.length > 0 &&
    Object.keys(collectedData).length < 2 &&
    !(repeatedPatternCollection >= 2 && Object.keys(extractedData).length === 0);

  const tentativeEvaluation =
    activeTheme?.mode === 'decision'
      ? evaluateTheme(activeTheme.id, collectedData)
      : null;

  const canEvaluateNow =
    tentativeEvaluation !== null &&
    tentativeEvaluation.classification !== 'sem_dados_suficientes';

  const shouldAskDecision =
    Boolean(activeTheme) &&
    activeTheme.mode === 'decision' &&
    !canEvaluateNow &&
    (
      intent === 'decision' ||
      intent === 'planning' ||
      previousState.stage === 'coleta_decisao' ||
      activeTheme !== null
    ) &&
    missingFields.length > 0 &&
    !(repeatedDecisionCollection >= 2 && Object.keys(extractedData).length === 0);

  const evaluation =
    shouldAskDecision || tentativeEvaluation?.classification === 'sem_dados_suficientes'
      ? null
      : tentativeEvaluation;

  const patternReading =
    activeTheme?.mode === 'pattern'
      ? buildPatternReading(activeTheme, collectedData, fallbackScenario)
      : (intent === 'pattern' || (fallbackScenario && intent !== 'concept'))
        ? buildPatternReading(activeTheme, collectedData, fallbackScenario)
        : null;

  let stage = 'abertura';
  let localResponse = formatOpenResponseHumanV2();

  if (shouldAskDecision) {
    stage = 'coleta_decisao';
    localResponse = formatFollowUpDecisionResponseHumanV2({ theme: activeTheme, followUpQuestions, collectedData });
  } else if (shouldAskPattern) {
    stage = 'coleta_padrao';
    localResponse = formatFollowUpPatternResponseHuman({ theme: activeTheme, followUpQuestions });
  } else if (activeTheme?.mode === 'decision' && evaluation) {
    stage = 'recomendacao_decisao';
    localResponse = formatDecisionResponseHuman({ theme: activeTheme, evaluation });
  } else if (intent === 'concept_continuation') {
    stage = 'explicacao_aplicada';
    localResponse = formatConceptContinuationHuman(previousState, collectedData);
  } else if (concept) {
    stage = 'explicacao';
    localResponse = formatConceptResponseHuman(concept);
  } else if (patternReading) {
    stage = 'leitura_padrao';
    localResponse = formatPatternResponseHuman({ theme: activeTheme, patternReading });
  } else if (fallbackScenario) {
    stage = 'leitura';
    localResponse = formatScenarioResponseHuman(fallbackScenario);
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
    lastConceptId: concept?.id || previousState.lastConceptId || null,
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
      conceptContent: concept ? {
        id: concept.id,
        reading: concept.response.reading,
        pattern: concept.response.pattern,
        impact: concept.response.impact,
        awareness: concept.response.awareness,
        nextStep: concept.response.nextStep
      } : null,
      entryType,
      missingFields,
      followUpQuestions: followUpQuestions.map((item) => item.question),
      collectedData,
      evaluationSummary: summarizeEvaluation(evaluation),
      patternSummary: patternReading?.reading || null,
      knowledge: knowledgeSnippets.map((item) => item.summary),
      diagnosticPrompt,
      repeatedDecisionCollection,
      repeatedPatternCollection
    }
  };
}


