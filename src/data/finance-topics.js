export const topicCatalog = [
  {
    id: 'fundamentos',
    label: 'Fundamentos',
    icon: 'graduation-cap',
    topics: [
      {
        id: 'orcamento-pessoal',
        title: 'Orçamento pessoal',
        level: 'Iniciante',
        time: '12 min',
        summary: 'Organize entradas, saídas e metas sem transformar o orçamento em punição.',
        actionPrompt: 'Monte um orçamento pessoal simples para alguém que quer sair do improviso financeiro.',
        sections: [
          {
            title: 'O que importa',
            body: 'Orçamento é um mapa de decisão. Ele mostra para onde o dinheiro já está indo e cria espaço para escolher para onde ele deve ir.'
          },
          {
            title: 'Estrutura base',
            body: 'Comece com quatro blocos: essenciais, estilo de vida, metas e segurança. O foco inicial não é perfeição, e sim visibilidade.'
          },
          {
            title: 'Primeiro passo prático',
            body: 'Liste todos os gastos fixos, estime os variáveis das últimas quatro semanas e escolha um teto realista para a categoria que mais escapa.'
          }
        ]
      },
      {
        id: 'reserva-emergencia',
        title: 'Reserva de emergência',
        level: 'Iniciante',
        time: '10 min',
        summary: 'Construa proteção contra imprevistos antes de pensar em risco ou retorno.',
        actionPrompt: 'Explique como montar uma reserva de emergência para um iniciante com renda instável.',
        sections: [
          {
            title: 'Para que serve',
            body: 'A reserva evita que um problema vire dívida cara. Ela compra tempo, reduz ansiedade e preserva decisões importantes.'
          },
          {
            title: 'Quanto buscar',
            body: 'Uma referência útil é acumular de 3 a 6 meses de custo essencial. Quem tem renda variável ou dependentes pode mirar uma margem maior.'
          },
          {
            title: 'Onde priorizar',
            body: 'Liquidez e previsibilidade vêm antes de rentabilidade. O objetivo é acesso rápido, não maximizar ganhos.'
          }
        ]
      },
      {
        id: 'dividas',
        title: 'Dívidas e renegociação',
        level: 'Iniciante',
        time: '14 min',
        summary: 'Entenda juros, priorize pagamentos e recupere margem no orçamento.',
        actionPrompt: 'Quais passos devo seguir para sair de dívidas com juros altos sem me perder?',
        sections: [
          {
            title: 'Diagnóstico honesto',
            body: 'Separe dívidas por taxa, atraso e impacto emocional. Nem toda dívida pesa igual, então a ordem de ataque importa.'
          },
          {
            title: 'Prioridade',
            body: 'Comece pelas dívidas com custo mais alto e menor flexibilidade, especialmente rotativo e cheque especial.'
          },
          {
            title: 'Renegociação',
            body: 'Leve proposta concreta, peça taxa efetiva, valor total e número de parcelas. Comparar cenários evita trocar urgência por uma armadilha longa.'
          }
        ]
      }
    ]
  },
  {
    id: 'ferramentas',
    label: 'Ferramentas',
    icon: 'briefcase-business',
    topics: [
      {
        id: 'cartao-credito',
        title: 'Cartão de crédito',
        level: 'Intermediário',
        time: '9 min',
        summary: 'Use limite, vencimento e parcelamento a seu favor, sem terceirizar o orçamento.',
        actionPrompt: 'Explique como usar cartão de crédito sem perder o controle do orçamento.',
        sections: [
          {
            title: 'Regra central',
            body: 'Cartão não aumenta renda. Ele apenas desloca o pagamento no tempo e pode esconder a sensação de gasto.'
          },
          {
            title: 'Sinais de alerta',
            body: 'Parcelas demais, compras recorrentes esquecidas e uso do limite como extensão da conta corrente são sinais de desorganização.'
          },
          {
            title: 'Uso saudável',
            body: 'Concentre despesas planejadas, acompanhe a fatura durante o mês e defina um teto abaixo do limite liberado pelo banco.'
          }
        ]
      },
      {
        id: 'juros-compostos',
        title: 'Juros compostos',
        level: 'Iniciante',
        time: '8 min',
        summary: 'Aprenda o conceito que acelera patrimônio e também amplifica dívidas.',
        actionPrompt: 'Explique juros compostos com exemplos simples e sem jargão.',
        sections: [
          {
            title: 'Como funciona',
            body: 'Nos juros compostos, os rendimentos passam a render também. O crescimento é cumulativo e ganha força com tempo e constância.'
          },
          {
            title: 'Na prática',
            body: 'O mesmo mecanismo que favorece investimentos também torna dívidas caras rapidamente. Prazo e taxa são inseparáveis.'
          },
          {
            title: 'Aplicação útil',
            body: 'Contribuições pequenas, repetidas e sustentáveis tendem a vencer tentativas esporádicas de aportes grandes.'
          }
        ]
      },
      {
        id: 'investimentos-iniciantes',
        title: 'Investimentos para iniciantes',
        level: 'Iniciante',
        time: '15 min',
        summary: 'Comece entendendo objetivo, prazo, liquidez e risco antes de escolher produtos.',
        actionPrompt: 'Quero começar a investir do zero. Qual ordem de aprendizado você recomenda?',
        sections: [
          {
            title: 'Antes de investir',
            body: 'Sem reserva e sem orçamento claro, investir costuma virar uma experiência instável. A base vem primeiro.'
          },
          {
            title: 'Quatro perguntas',
            body: 'Para que é esse dinheiro, quando você vai usar, quanto risco suporta e quão rápido precisa resgatar?'
          },
          {
            title: 'Começo saudável',
            body: 'Entender renda fixa, inflação, diversificação e horizonte de tempo costuma ser mais importante que buscar a melhor taxa do momento.'
          }
        ]
      }
    ]
  },
  {
    id: 'planejamento',
    label: 'Planejamento',
    icon: 'calendar-range',
    topics: [
      {
        id: 'aposentadoria',
        title: 'Aposentadoria e longo prazo',
        level: 'Intermediário',
        time: '13 min',
        summary: 'Planejamento previdenciário começa com clareza de padrão de vida futuro.',
        actionPrompt: 'Como pensar aposentadoria sem depender apenas do INSS?',
        sections: [
          {
            title: 'Ponto de partida',
            body: 'A pergunta central não é só quando parar de trabalhar, mas como sustentar o padrão de vida desejado no longo prazo.'
          },
          {
            title: 'Fontes possíveis',
            body: 'INSS, previdência complementar, patrimônio investido e renda gerada por ativos podem compor a estratégia.'
          },
          {
            title: 'Ajuste de rota',
            body: 'A revisão periódica é decisiva porque renda, objetivos e tolerância a risco mudam com o tempo.'
          }
        ]
      },
      {
        id: 'metas-financeiras',
        title: 'Metas financeiras',
        level: 'Iniciante',
        time: '11 min',
        summary: 'Transforme desejos vagos em metas com valor, prazo e prioridade.',
        actionPrompt: 'Me ajude a transformar metas financeiras em um plano executável.',
        sections: [
          {
            title: 'Definição',
            body: 'Meta sem número e sem prazo vira intenção. Meta boa cabe no calendário e no fluxo de caixa.'
          },
          {
            title: 'Priorização',
            body: 'Nem toda meta deve acontecer ao mesmo tempo. Sequência inteligente reduz frustração e melhora execução.'
          },
          {
            title: 'Acompanhamento',
            body: 'Revisões mensais são suficientes para a maioria das pessoas. Ajustar rota é parte do processo, não sinal de fracasso.'
          }
        ]
      },
      {
        id: 'consumo-consciente',
        title: 'Consumo consciente',
        level: 'Iniciante',
        time: '7 min',
        summary: 'Entenda os gatilhos do consumo e proteja decisões relevantes do impulso.',
        actionPrompt: 'Como praticar consumo consciente sem viver em privação?',
        sections: [
          {
            title: 'Consumo e identidade',
            body: 'Muitas compras não respondem a necessidade, mas a cansaço, comparação social ou recompensa emocional.'
          },
          {
            title: 'Ferramenta simples',
            body: 'Criar tempo entre desejo e compra já melhora muito a qualidade das decisões, especialmente em categorias impulsivas.'
          },
          {
            title: 'Equilíbrio',
            body: 'Consumo consciente não é cortar tudo. É direcionar recursos para o que sustenta seu bem-estar e seus objetivos.'
          }
        ]
      }
    ]
  }
];

export const learningTracks = [
  {
    id: 'organizar-casa',
    title: 'Organize sua vida financeira',
    duration: '7 dias',
    description: 'Para quem quer sair do improviso e construir uma rotina simples de controle.',
    prompt: 'Crie uma trilha de 7 dias para organizar a vida financeira do zero.'
  },
  {
    id: 'sair-dividas',
    title: 'Plano de saída das dívidas',
    duration: '10 dias',
    description: 'Sequência prática para mapear, priorizar e renegociar dívidas.',
    prompt: 'Monte uma trilha prática de 10 dias para sair das dívidas com disciplina.'
  },
  {
    id: 'primeiros-investimentos',
    title: 'Primeiros investimentos',
    duration: '14 dias',
    description: 'Base conceitual para quem quer começar sem pular etapas.',
    prompt: 'Monte uma trilha de 14 dias para entender investimentos começando do zero.'
  }
];

export const financeTools = [
  {
    id: 'simulador-reserva',
    title: 'Planejar reserva de emergência',
    description: 'Receba um plano de aporte gradual com base no seu custo essencial.'
  },
  {
    id: 'raio-x-fatura',
    title: 'Raio-X da fatura',
    description: 'Aprenda a separar gastos inevitáveis, recorrentes e impulsivos no cartão.'
  },
  {
    id: 'checkup-orcamento',
    title: 'Check-up do orçamento',
    description: 'Identifique vazamentos de caixa e próximos ajustes prioritários.'
  }
];

export const dailyInsights = [
  {
    title: 'Conceito do dia',
    quote: 'Renda alta sem estrutura pode gerar fragilidade financeira silenciosa.',
    reference: 'Disciplina > improviso',
    reflection: 'Observe hoje um gasto recorrente que parece pequeno, mas influencia seu padrão de vida no mês inteiro.',
    prompt: 'Explique por que renda alta sem estrutura ainda pode gerar fragilidade financeira.'
  },
  {
    title: 'Dica financeira do dia',
    quote: 'Liquidez é o preço da tranquilidade quando o imprevisto chega antes do planejado.',
    reference: 'Reserva de emergência',
    reflection: 'Reveja se sua proteção está realmente acessível sem depender de crédito.',
    prompt: 'Explique a importância da liquidez na reserva de emergência.'
  },
  {
    title: 'Prática do dia',
    quote: 'Toda meta melhora quando ganha valor, prazo e próxima ação.',
    reference: 'Metas executáveis',
    reflection: 'Escolha uma meta financeira e defina hoje o primeiro passo mensurável.',
    prompt: 'Como transformar uma meta financeira genérica em uma meta executável?'
  }
];

export const glossaryTerms = [
  {
    term: 'Liquidez',
    definition: 'Facilidade de transformar um recurso em dinheiro disponível sem perda relevante.'
  },
  {
    term: 'Inflação',
    definition: 'Aumento geral dos preços ao longo do tempo, que reduz o poder de compra do dinheiro.'
  },
  {
    term: 'Juros compostos',
    definition: 'Juros calculados sobre o valor inicial e também sobre os juros acumulados.'
  },
  {
    term: 'Diversificação',
    definition: 'Distribuição de recursos entre diferentes classes ou estratégias para reduzir concentração de risco.'
  },
  {
    term: 'Custo essencial',
    definition: 'Valor mínimo necessário para manter moradia, alimentação, contas básicas e compromissos indispensáveis.'
  },
  {
    term: 'Perfil de risco',
    definition: 'Nível de oscilação e incerteza que uma pessoa suporta ao buscar retorno.'
  }
];

export const userProfiles = [
  {
    title: 'Iniciante',
    description: 'Precisa de linguagem simples, ordem clara e próximos passos concretos.'
  },
  {
    title: 'Intermediário',
    description: 'Já conhece os conceitos básicos e quer estruturar melhor decisões e prioridades.'
  },
  {
    title: 'Avançado',
    description: 'Busca refinar estratégia, comportamento e alocação com mais profundidade.'
  }
];

export function getTopicsByCategory(categoryId) {
  return topicCatalog.find((category) => category.id === categoryId)?.topics ?? [];
}

export function findTopicById(topicId) {
  for (const category of topicCatalog) {
    const topic = category.topics.find((item) => item.id === topicId);
    if (topic) {
      return { ...topic, categoryId: category.id, categoryLabel: category.label };
    }
  }

  return null;
}
