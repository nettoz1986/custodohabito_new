export const diagnosticQuestions = [
  {
    id: 'dinheiro-inesperado',
    q: 'Sobrou um dinheiro inesperado este mês. Você:',
    supportText: 'Pense no que você tenderia a fazer primeiro, sem tentar responder “certo”.',
    options: [
      {
        t: 'Guarda quase tudo e evita mexer nesse valor.',
        hint: 'Prioriza segurança e preservação.',
        weights: { heitor: 3, lia: 1 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 1 }
      },
      {
        t: 'Usa uma parte com critério e guarda o restante.',
        hint: 'Busca equilíbrio entre hoje e amanhã.',
        weights: { lia: 3, heitor: 1 },
        axis: { seguranca: 2, impulso: 1, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Resolve alguma vontade antiga ou algo que estava adiando.',
        hint: 'O presente pesa bastante na decisão.',
        weights: { bia: 3, lia: 1 },
        axis: { seguranca: 0, impulso: 2, expansao: 1, pressao_presente: 3, flexibilidade: 1 }
      },
      {
        t: 'Aproveita para se dar algo melhor, porque sente que merece.',
        hint: 'O conforto e o padrão puxam a decisão.',
        weights: { valen: 3, bia: 1 },
        axis: { seguranca: 0, impulso: 2, expansao: 3, pressao_presente: 2, flexibilidade: 1 }
      }
    ]
  },
  {
    id: 'troca-celular',
    q: 'Seu celular funciona, mas saiu um modelo melhor. Você:',
    supportText: 'Considere sua tendência real diante de melhoria, atualização e padrão.',
    options: [
      {
        t: 'Nem considera trocar agora.',
        hint: 'Mantém enquanto ainda cumpre a função.',
        weights: { heitor: 3, lia: 1 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 1 }
      },
      {
        t: 'Só troca se houver necessidade prática real.',
        hint: 'Separa desconforto de necessidade.',
        weights: { lia: 3, heitor: 1 },
        axis: { seguranca: 2, impulso: 0, expansao: 1, pressao_presente: 0, flexibilidade: 3 }
      },
      {
        t: 'Troca se isso facilitar a rotina, mesmo parcelando.',
        hint: 'Busca melhoria funcional, mas aceita antecipar custo.',
        weights: { bia: 2, lia: 1, valen: 1 },
        axis: { seguranca: 0, impulso: 1, expansao: 2, pressao_presente: 2, flexibilidade: 2 }
      },
      {
        t: 'Troca para acompanhar o padrão que considera adequado.',
        hint: 'A referência de vida pesa bastante.',
        weights: { valen: 3, bia: 1 },
        axis: { seguranca: 0, impulso: 1, expansao: 3, pressao_presente: 1, flexibilidade: 1 }
      }
    ]
  },
  {
    id: 'programa-fora-orcamento',
    q: 'Um amigo chama para um programa fora do orçamento:',
    supportText: 'Pense no que você faria com mais frequência, não no que gostaria de fazer.',
    options: [
      {
        t: 'Recusa sem culpa e tenta manter o combinado do mês.',
        hint: 'Preserva estrutura acima do momento.',
        weights: { heitor: 3, lia: 1 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 1 }
      },
      {
        t: 'Tenta adaptar para uma versão que caiba na sua realidade.',
        hint: 'Procura pertencimento sem romper a estrutura.',
        weights: { lia: 3, bia: 1 },
        axis: { seguranca: 1, impulso: 1, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Vai mesmo sabendo que vai apertar o mês.',
        hint: 'O presente e o pertencimento costumam pesar.',
        weights: { bia: 3, valen: 1 },
        axis: { seguranca: 0, impulso: 2, expansao: 1, pressao_presente: 3, flexibilidade: 1 }
      },
      {
        t: 'Vai porque considera esse tipo de experiência parte do seu padrão.',
        hint: 'Manter estilo de vida orienta a decisão.',
        weights: { valen: 3, bia: 1 },
        axis: { seguranca: 0, impulso: 1, expansao: 3, pressao_presente: 2, flexibilidade: 1 }
      }
    ]
  },
  {
    id: 'lazer',
    q: 'Quando pensa em lazer, você:',
    supportText: 'Observe a sua relação com descanso, prazer e custo.',
    options: [
      {
        t: 'Vê como algo que pode ser cortado com facilidade.',
        hint: 'Segurança vem antes de usufruto.',
        weights: { heitor: 3 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 0 }
      },
      {
        t: 'Tenta encaixar de forma viável, sem comprometer o essencial.',
        hint: 'Busca equilíbrio entre estrutura e vida.',
        weights: { lia: 3, heitor: 1 },
        axis: { seguranca: 2, impulso: 1, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Costuma usar como recompensa depois de períodos difíceis.',
        hint: 'O alívio emocional entra bastante na equação.',
        weights: { bia: 3, lia: 1 },
        axis: { seguranca: 0, impulso: 2, expansao: 1, pressao_presente: 3, flexibilidade: 1 }
      },
      {
        t: 'Considera parte obrigatória do estilo de vida que quer manter.',
        hint: 'Conforto e padrão são centrais.',
        weights: { valen: 3 },
        axis: { seguranca: 0, impulso: 1, expansao: 3, pressao_presente: 1, flexibilidade: 1 }
      }
    ]
  },
  {
    id: 'aumento-renda',
    q: 'Ao receber um aumento de renda, você tende a:',
    supportText: 'Pense na sua tendência dominante ao melhorar a condição financeira.',
    options: [
      {
        t: 'Manter o padrão e guardar quase toda a diferença.',
        hint: 'Expansão lenta, preservando margem.',
        weights: { heitor: 3, lia: 1 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 1 }
      },
      {
        t: 'Melhorar a rotina aos poucos, com ajustes graduais.',
        hint: 'Expansão com moderação.',
        weights: { lia: 3, valen: 1 },
        axis: { seguranca: 2, impulso: 0, expansao: 2, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Aumentar alguns gastos que sentia falta havia tempo.',
        hint: 'O presente tende a absorver parte do ganho.',
        weights: { bia: 3, lia: 1 },
        axis: { seguranca: 0, impulso: 1, expansao: 2, pressao_presente: 3, flexibilidade: 2 }
      },
      {
        t: 'Elevar rapidamente o consumo para combinar com a nova fase.',
        hint: 'O padrão sobe quase junto com a renda.',
        weights: { valen: 3, bia: 1 },
        axis: { seguranca: 0, impulso: 1, expansao: 3, pressao_presente: 2, flexibilidade: 1 }
      }
    ]
  },
  {
    id: 'saude-autocuidado',
    q: 'Sobre saúde e autocuidado:',
    supportText: 'Considere cuidado físico, mental e prevenção, não apenas aparência.',
    options: [
      {
        t: 'Adia esse tipo de gasto para economizar o máximo possível.',
        hint: 'Protege caixa, mas pode comprimir qualidade de vida.',
        weights: { heitor: 3 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 0 }
      },
      {
        t: 'Investe no que considera necessário, sem exagerar.',
        hint: 'Lê saúde como parte da estrutura.',
        weights: { lia: 3, heitor: 1 },
        axis: { seguranca: 2, impulso: 0, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Tenta cuidar, mas perde a constância e se desorganiza.',
        hint: 'Existe intenção, mas falta sustentação.',
        weights: { bia: 3, lia: 1 },
        axis: { seguranca: 0, impulso: 2, expansao: 1, pressao_presente: 2, flexibilidade: 1 }
      },
      {
        t: 'Investe bem, mas às vezes percebe influência de imagem e status.',
        hint: 'Cuidado real pode se misturar com padrão visível.',
        weights: { valen: 3, lia: 1 },
        axis: { seguranca: 1, impulso: 1, expansao: 3, pressao_presente: 1, flexibilidade: 2 }
      }
    ]
  },
  {
    id: 'emocional-cansado',
    q: 'Quando está emocionalmente cansado, você:',
    supportText: 'Observe sua forma mais frequente de buscar alívio.',
    options: [
      {
        t: 'Segura tudo e evita gastar, mesmo querendo se aliviar.',
        hint: 'Contenção forte, às vezes excessiva.',
        weights: { heitor: 3 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 0 }
      },
      {
        t: 'Busca algo simples que traga conforto sem pesar.',
        hint: 'Tenta aliviar sem romper a estrutura.',
        weights: { lia: 3, bia: 1 },
        axis: { seguranca: 1, impulso: 1, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Compra ou consome para compensar o desgaste.',
        hint: 'O alívio emocional entra direto na decisão.',
        weights: { bia: 3 },
        axis: { seguranca: 0, impulso: 3, expansao: 1, pressao_presente: 3, flexibilidade: 1 }
      },
      {
        t: 'Se presenteia com algo melhor porque sente que merece.',
        hint: 'Recompensa e padrão se combinam.',
        weights: { valen: 3, bia: 1 },
        axis: { seguranca: 0, impulso: 2, expansao: 3, pressao_presente: 2, flexibilidade: 1 }
      }
    ]
  },
  {
    id: 'parcelamento',
    q: 'Sobre parcelamento, você:',
    supportText: 'Pense no uso real do parcelamento na sua rotina.',
    options: [
      {
        t: 'Evita quase sempre, mesmo quando poderia usar.',
        hint: 'Prefere não carregar compromissos futuros.',
        weights: { heitor: 3 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 0 }
      },
      {
        t: 'Usa com critério, quando faz sentido para o fluxo.',
        hint: 'Tenta distinguir ferramenta de armadilha.',
        weights: { lia: 3, heitor: 1 },
        axis: { seguranca: 2, impulso: 0, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Usa para conseguir viver melhor agora.',
        hint: 'O parcelamento ajuda a aproximar o presente do desejado.',
        weights: { bia: 3, valen: 1 },
        axis: { seguranca: 0, impulso: 2, expansao: 2, pressao_presente: 3, flexibilidade: 1 }
      },
      {
        t: 'Usa como ferramenta normal para sustentar o padrão.',
        hint: 'O crédito já faz parte da engrenagem da rotina.',
        weights: { valen: 3, bia: 1 },
        axis: { seguranca: 0, impulso: 1, expansao: 3, pressao_presente: 2, flexibilidade: 2 }
      }
    ]
  },
  {
    id: 'despesa-inesperada',
    q: 'Se tivesse uma despesa inesperada alta, você:',
    supportText: 'Considere não só ter dinheiro, mas sua reação estrutural diante disso.',
    options: [
      {
        t: 'Conseguiria lidar, mas sofreria muito para mexer no dinheiro.',
        hint: 'Existe proteção, mas também rigidez.',
        weights: { heitor: 3, lia: 1 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 1 }
      },
      {
        t: 'Teria um plano de adaptação e reorganização.',
        hint: 'Consegue ajustar a estrutura sem perder o eixo.',
        weights: { lia: 3, heitor: 1 },
        axis: { seguranca: 2, impulso: 0, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Ficaria extremamente apertado e sentiria desorganização imediata.',
        hint: 'O presente já está muito pressionado.',
        weights: { bia: 3 },
        axis: { seguranca: 0, impulso: 1, expansao: 1, pressao_presente: 3, flexibilidade: 1 }
      },
      {
        t: 'Perceberia que o custo fixo do seu padrão está alto demais.',
        hint: 'A estrutura funciona, mas exige muito para se manter.',
        weights: { valen: 3, lia: 1 },
        axis: { seguranca: 1, impulso: 0, expansao: 3, pressao_presente: 2, flexibilidade: 1 }
      }
    ]
  },
  {
    id: 'logica-atual',
    q: 'O que mais parece com a sua lógica financeira atual?',
    supportText: 'Escolha a frase que mais se aproxima da sua vida hoje.',
    options: [
      {
        t: 'Proteger o futuro e evitar vulnerabilidade.',
        hint: 'Segurança é o eixo central.',
        weights: { heitor: 3 },
        axis: { seguranca: 3, impulso: 0, expansao: 0, pressao_presente: 0, flexibilidade: 0 }
      },
      {
        t: 'Equilibrar presente e futuro sem perder a realidade.',
        hint: 'Busca viabilidade, não extremos.',
        weights: { lia: 3 },
        axis: { seguranca: 2, impulso: 0, expansao: 1, pressao_presente: 1, flexibilidade: 3 }
      },
      {
        t: 'Sobreviver ao presente sem entrar em culpa o tempo todo.',
        hint: 'O agora está cobrando muito.',
        weights: { bia: 3 },
        axis: { seguranca: 0, impulso: 2, expansao: 1, pressao_presente: 3, flexibilidade: 1 }
      },
      {
        t: 'Sustentar um modo de vida que faz sentido para quem eu sou.',
        hint: 'Identidade e padrão caminham juntos.',
        weights: { valen: 3 },
        axis: { seguranca: 0, impulso: 1, expansao: 3, pressao_presente: 1, flexibilidade: 2 }
      }
    ]
  }
];

export const diagnosticProfiles = {
  lia: {
    key: 'lia',
    name: 'Lia Equilíbrio',
    shortReading: 'Busca caber na realidade sem abrir mão de viver.',
    reading: 'Você tende a operar por equilíbrio. Busca adaptar escolhas à sua realidade, sem transformar tudo em privação nem em impulso. Seu padrão sugere boa capacidade de ajuste, leitura de contexto e tentativa de sustentar uma vida possível no presente sem perder totalmente o futuro de vista.',
    strength: 'Capacidade de adaptação com senso de realidade.',
    warning: 'O equilíbrio pode virar excesso de concessão se você começar a normalizar pequenos desvios recorrentes.',
    counsel: 'Sua próxima evolução não é controlar mais. É proteger melhor os pontos em que o “mais ou menos cabe” começa a virar estrutura cara.',
    blendSoloReading: 'Seu resultado mostra predominância de equilíbrio. Isso sugere uma lógica relativamente ajustada, mas que ainda precisa observar onde a flexibilidade vira acomodação silenciosa.',
    agentPrompt: 'Meu perfil financeiro predominante foi Lia Equilíbrio. Quero entender como transformar esse equilíbrio em decisões mais consistentes no dia a dia.'
  },

  heitor: {
    key: 'heitor',
    name: 'Heitor Reserva',
    shortReading: 'Segurança, proteção e visão de longo prazo orientam seu padrão.',
    reading: 'Você tende a priorizar segurança, previsibilidade e preservação. Seu padrão mostra preocupação com proteção futura, controle de exposição e redução de risco. Isso pode ser uma força estrutural enorme, mas também pode comprimir usufruto, leveza e flexibilidade quando a lógica de proteção domina tudo.',
    strength: 'Construção de base, prudência e capacidade de preservar estrutura.',
    warning: 'A segurança pode virar rigidez e fazer você pagar um custo silencioso em qualidade de vida, conforto ou bem-estar.',
    counsel: 'Sua evolução não está em proteger mais. Está em distinguir proteção real de contenção excessiva.',
    blendSoloReading: 'Seu resultado mostra predominância forte de proteção e reserva. Hoje, seu padrão parece mais centrado em evitar vulnerabilidade do que em expandir conforto ou consumo.',
    agentPrompt: 'Meu perfil financeiro predominante foi Heitor Reserva. Quero entender como manter segurança sem transformar isso em rigidez excessiva.'
  },

  bia: {
    key: 'bia',
    name: 'Bia Agora',
    shortReading: 'O presente, o alívio e a pressão do agora pesam bastante nas suas escolhas.',
    reading: 'Seu padrão sugere que o presente tem muita força na sua vida financeira. Isso não significa irresponsabilidade; muitas vezes significa pressão, desgaste, necessidade de alívio ou sensação de que a vida já exige demais. O risco aparece quando o que ajuda hoje começa a comprometer amanhã de forma recorrente.',
    strength: 'Capacidade de buscar vida, prazer e respiro mesmo em contextos apertados.',
    warning: 'Quando o alívio emocional se mistura com decisão financeira, o mês pode ficar vulnerável e repetitivo.',
    counsel: 'Seu próximo passo não é culpa nem repressão. É criar pequenas estruturas que protejam você do peso do “agora” sem sufocar sua vida.',
    blendSoloReading: 'Seu resultado mostra predominância de decisões puxadas pelo presente. Isso costuma indicar rotina pressionada, necessidade de compensação ou pouca margem para pensar com distância.',
    agentPrompt: 'Meu perfil financeiro predominante foi Bia Agora. Quero entender como ganhar estrutura sem cair em culpa ou privação.'
  },

  valen: {
    key: 'valen',
    name: 'Valen Expansão',
    shortReading: 'Padrão de vida, imagem e expansão têm peso relevante nas suas decisões.',
    reading: 'Seu padrão sugere uma lógica de expansão. Você tende a valorizar conforto, qualidade, imagem, experiência e coerência com o modo de vida que deseja sustentar. Isso pode ser força quando existe base para isso, mas vira fragilidade quando o padrão se antecipa à estrutura que deveria sustentá-lo.',
    strength: 'Capacidade de projetar vida, ambição de qualidade e leitura de valor além do básico.',
    warning: 'O risco está em transformar renda em obrigação de padrão, reduzindo margem de manobra.',
    counsel: 'Sua evolução não é deixar de querer mais. É impedir que a expansão se torne um custo fixo mais rápido do que sua estrutura aguenta.',
    blendSoloReading: 'Seu resultado mostra predominância de expansão e padrão. Hoje, suas decisões parecem fortemente influenciadas pelo tipo de vida que você quer sustentar e pela coerência com essa identidade.',
    agentPrompt: 'Meu perfil financeiro predominante foi Valen Expansão. Quero entender como manter padrão e ambição sem fragilizar minha base.'
  }
};

export const diagnosticProfileImages = {
  bia: '/public/assets/biaAgora.png',
  heitor: '/public/assets/heitorReserva.png',
  lia: '/public/assets/liaEquilibrio.png',
  valen: '/public/assets/valenLuxo.png'
};

export const diagnosticMeta = {
  axes: {
    seguranca: {
      label: 'Segurança e proteção',
      ranges: [
        {
          min: 0,
          max: 6,
          text: 'A proteção não aparece como eixo dominante nas suas decisões hoje.'
        },
        {
          min: 7,
          max: 14,
          text: 'Existe preocupação com estabilidade, mas ela divide espaço com outras forças.'
        },
        {
          min: 15,
          max: 40,
          text: 'Segurança aparece como eixo central da sua lógica financeira atual.'
        }
      ],
      fallback: 'A relação com segurança está presente, mas de forma difusa.'
    },

    impulso: {
      label: 'Impulso e alívio emocional',
      ranges: [
        {
          min: 0,
          max: 4,
          text: 'O impulso não parece ser o principal motor das suas decisões.'
        },
        {
          min: 5,
          max: 10,
          text: 'Em alguns contextos, o alívio emocional entra na sua lógica de escolha.'
        },
        {
          min: 11,
          max: 30,
          text: 'O impulso e a busca de compensação aparecem com força no seu padrão atual.'
        }
      ],
      fallback: 'Existe alguma oscilação entre racionalidade e compensação.'
    },

    expansao: {
      label: 'Expansão de padrão',
      ranges: [
        {
          min: 0,
          max: 5,
          text: 'Expansão de padrão não parece ser uma prioridade central agora.'
        },
        {
          min: 6,
          max: 12,
          text: 'Existe desejo de melhorar a vida, mas ainda com alguma moderação.'
        },
        {
          min: 13,
          max: 30,
          text: 'Manter ou elevar padrão de vida aparece como força relevante nas suas decisões.'
        }
      ],
      fallback: 'A relação com expansão existe, mas não domina todo o padrão.'
    },

    pressao_presente: {
      label: 'Pressão do presente',
      ranges: [
        {
          min: 0,
          max: 5,
          text: 'O presente não parece estar comprimindo fortemente sua tomada de decisão.'
        },
        {
          min: 6,
          max: 12,
          text: 'Há momentos em que o agora pesa e encurta seu espaço de escolha.'
        },
        {
          min: 13,
          max: 30,
          text: 'O presente aparece muito pressionado e influencia fortemente suas decisões.'
        }
      ],
      fallback: 'Existe algum nível de pressão do presente operando na sua rotina.'
    },

    flexibilidade: {
      label: 'Flexibilidade e adaptação',
      ranges: [
        {
          min: 0,
          max: 4,
          text: 'Seu padrão parece mais rígido ou polarizado do que adaptativo.'
        },
        {
          min: 5,
          max: 10,
          text: 'Existe alguma capacidade de ajuste, mas ela ainda oscila conforme o contexto.'
        },
        {
          min: 11,
          max: 30,
          text: 'Adaptação e leitura de contexto aparecem como força importante do seu padrão.'
        }
      ],
      fallback: 'Há sinais de flexibilidade, mas não de forma totalmente consistente.'
    }
  },

  blendReadings: {
    'lia+heitor': 'Seu padrão mistura equilíbrio com proteção. Você tende a buscar decisões viáveis e sensatas, mas com uma base forte de segurança. A força disso é a prudência com adaptação. O cuidado está em não transformar bom senso em contenção excessiva.',
    'lia+bia': 'Seu padrão mistura equilíbrio com pressão do presente. Você tenta fazer caber, adaptar e sustentar a realidade, mas o agora às vezes pesa e puxa escolhas mais reativas. O ponto central é proteger sua estrutura sem sufocar sua necessidade de viver.',
    'lia+valen': 'Seu padrão mistura equilíbrio com desejo de expansão. Você não quer apenas sobreviver financeiramente; quer viver melhor com coerência. Isso pode ser saudável, desde que a melhora de padrão não corra mais rápido do que a base que deveria sustentá-la.',
    'heitor+bia': 'Seu padrão mistura contenção e pressão. Em alguns momentos você segura muito; em outros, o presente cobra e rompe essa contenção. Isso pode gerar ciclos de rigidez e compensação. A chave aqui é construir sustentabilidade, não extremos.',
    'heitor+valen': 'Seu padrão mistura proteção com padrão. Existe desejo de qualidade e expansão, mas também necessidade forte de segurança. Isso pode gerar tensão interna: uma parte quer preservar, outra quer elevar o nível de vida. A clareza está em definir ritmo de expansão.',
    'bia+valen': 'Seu padrão mistura pressão do presente com expansão de padrão. O agora pesa, mas o padrão desejado também tem força. Isso pode tornar algumas escolhas emocionalmente intensas e estruturalmente caras. O ponto central é separar alívio, identidade e custo recorrente.'
  },

  projectGuidance: {
    'lia+heitor': 'A direção mais útil agora é criar espaço de usufruto com critério, sem desmontar sua base. Seu desafio não é organizar mais, e sim evitar que a prudência vire compressão de vida.',
    'lia+bia': 'A direção mais útil agora é fortalecer pequenas estruturas de previsibilidade. Você não precisa endurecer; precisa reduzir o quanto o presente consegue sequestrar decisões repetidas.',
    'lia+valen': 'A direção mais útil agora é fazer a expansão passar pelo filtro da sustentabilidade. Melhorar a vida pode ser saudável, desde que não vire obrigação fixa antes da hora.',
    'heitor+bia': 'A direção mais útil agora é reduzir o ciclo entre contenção e compensação. O foco não é apertar mais, e sim criar um sistema possível de sustentar sem estourar depois.',
    'heitor+valen': 'A direção mais útil agora é dar ritmo ao padrão. Nem conter tudo, nem expandir por impulso: seu ganho está em decidir onde vale subir o nível e onde vale preservar margem.',
    'bia+valen': 'A direção mais útil agora é separar desejo legítimo de pressão estrutural. O foco não é cortar tudo, mas impedir que alívio e padrão se transformem em custo fixo invisível.',

    'axis:seguranca': 'Seu próximo passo é diferenciar proteção saudável de rigidez. Segurança é base importante, mas não precisa comprimir toda experiência de vida.',
    'axis:impulso': 'Seu próximo passo é criar um intervalo entre sentir e gastar. Não para se punir, mas para impedir que alívio momentâneo vire recorrência cara.',
    'axis:expansao': 'Seu próximo passo é revisar o ritmo da expansão do seu padrão. Crescer pode ser legítimo, mas precisa ser sustentado pela estrutura, não apenas pela vontade.',
    'axis:pressao_presente': 'Seu próximo passo é aliviar a pressão do agora com microestruturas práticas: previsibilidade mínima, reserva de fricção e menos decisões no automático.',
    'axis:flexibilidade': 'Seu próximo passo é transformar adaptação em método. Sua capacidade de ajuste é força real, mas precisa de limites claros para não virar elasticidade infinita.'
  }
};

export const diagnosticLeadFieldOptions = {
  renda: [
    { value: 'ate-3k', label: 'Ate R$ 3.000' },
    { value: '3k-7k', label: 'R$ 3.000 a R$ 7.000' },
    { value: '7k-15k', label: 'R$ 7.000 a R$ 15.000' },
    { value: '15k+', label: 'Acima de R$ 15.000' }
  ],
  comprometido: [
    { value: 'menos50', label: 'Menos de 50%' },
    { value: '50-70', label: 'Entre 50% e 70%' },
    { value: 'mais70', label: 'Mais de 70%' }
  ],
  previdencia: [
    { value: 'inss', label: 'Apenas INSS / FGTS' },
    { value: 'privada', label: 'Previdencia privada' },
    { value: 'ambos', label: 'Investimentos proprios (alem do INSS)' },
    { value: 'nenhum', label: 'Nenhum no momento' }
  ]
};

export const diagnosticReportVariations = {
  lia: {
    context: [
      (data) => `Como ${data.profissao} com renda ${data.rendaLabel}, seu resultado mostra uma tentativa real de caber na vida que voce tem hoje sem transformar tudo em impulso. O valor do seu perfil esta na calibragem: voce tende a ajustar mais do que reagir.`,
      (data) => `Seu padrao sugere algo valioso: com a rotina de ${data.profissao} e renda ${data.rendaLabel}, voce nao parece operar nem no extremo da contencao nem no do descontrole. Isso costuma gerar mais sustentabilidade do que performance aparente.`,
      (data) => `A combinacao entre sua realidade profissional como ${data.profissao} e renda ${data.rendaLabel} aponta para um perfil que tenta sustentar a vida com criterio. O desafio nao esta em "apertar mais", mas em proteger melhor o que hoje parece apenas administravel.`
    ],
    strength: [
      (data) => `Sua maior forca e a adaptacao com senso de realidade. Mesmo com ${data.comprometidoLabel} da renda em gastos fixos, voce tende a buscar ajuste antes de exagero.`,
      (data) => `O que mais joga a seu favor e a capacidade de ler contexto. Para alguem na rotina de ${data.profissao}, isso costuma evitar decisoes impulsivas e tambem evita rigidez desnecessaria.`,
      (data) => `Seu perfil costuma manter o pe no chao sem sufocar totalmente a vida. Essa leitura mais equilibrada vale muito quando o mes exige escolhas menos emocionais e mais sustentaveis.`
    ],
    alert: [
      (data) => `Seu ponto de atencao nao e o descontrole evidente. Com ${data.comprometidoLabel} comprometidos e seguranca futura apoiada em ${data.previdenciaLabel}, o risco esta em normalizar pequenos custos que "mais ou menos cabem" ate virarem estrutura fixa.`,
      (data) => `O equilibrio pode mascarar acomodacao silenciosa. Quando a vida vai sendo ajustada sem revisao, o que parecia flexibilidade pode virar um padrao caro dificil de perceber.`,
      (data) => `O cuidado aqui e nao confundir viabilidade com margem saudavel. Dependendo de quanto do seu mes ja esta travado, um sistema so "ok" pode ficar fragil rapido diante de imprevistos.`
    ],
    action: [
      (data) => `A acao pratica desta semana e revisar um bloco do seu mes que hoje parece neutro: assinaturas, conveniencias ou pequenos confortos. O objetivo nao e cortar por cortar, e descobrir onde a flexibilidade ja virou custo recorrente.`,
      () => 'Escolha uma decisao do seu cotidiano que voce costuma tratar no automatico e passe a olhar custo total, recorrencia e impacto no mes seguinte. Esse pequeno ajuste costuma gerar mais clareza do que tentar controlar tudo.',
      (data) => `Se voce depende principalmente de ${data.previdenciaLabel} para seguranca futura, vale abrir uma revisao simples do que hoje esta sendo protegido e do que esta apenas sendo adiado.`
    ]
  },
  heitor: {
    context: [
      (data) => `Como ${data.profissao} com renda ${data.rendaLabel}, seu resultado mostra uma logica fortemente orientada por seguranca. Voce tende a proteger a estrutura antes de liberar conforto, e isso cria base real.`,
      (data) => `Seu perfil sugere que preservar margem e evitar vulnerabilidade pesam bastante na sua rotina. Para alguem em ${data.profissao}, isso pode ser uma vantagem importante de estabilidade e previsibilidade.`,
      (data) => `Hoje, sua leitura aponta para um padrao que valoriza controle, reserva e protecao. Isso costuma reduzir sustos, mas tambem pede cuidado para nao transformar prudencia em compressao de vida.`
    ],
    strength: [
      () => 'Sua principal forca esta na construcao de base. Voce tende a pensar mais em sustentacao do que em alivio imediato, e isso protege muito a vida financeira no longo prazo.',
      (data) => `Mesmo com a pressao normal da rotina, voce parece operar com bastante consciencia de risco. Isso ajuda especialmente quando o custo fixo ja ocupa ${data.comprometidoLabel} da renda.`,
      () => 'O valor do seu perfil esta em evitar improviso caro. Quando algo aperta, voce tende a buscar seguranca antes de ampliar o problema.'
    ],
    alert: [
      (data) => `O risco aqui nao e gastar demais. E viver em modo de contencao por tempo demais. Se a sua seguranca futura hoje se apoia em ${data.previdenciaLabel}, vale diferenciar protecao real de rigidez emocional.`,
      () => 'Quando proteger vira criterio para tudo, qualidade de vida e usufruto podem ser comprimidos sem necessidade. Nem todo gasto reduz seguranca; alguns sustentam equilibrio.',
      (data) => `Mesmo com ${data.comprometidoLabel} em fixos, o cuidado principal e nao tratar todo desconforto como ameaca. Esse padrao pode dificultar escolhas legitimas de conforto, descanso ou manutencao do bem-estar.`
    ],
    action: [
      () => 'A acao mais util agora e separar um pequeno espaco consciente para uso e nao para acumulacao. O objetivo nao e gastar mais: e provar para o seu sistema que seguranca nao precisa excluir vida.',
      (data) => `Revise uma decisao que voce costuma adiar por nao ser "essencial". Se ela melhora rotina, saude ou energia de forma concreta, talvez o custo real esteja em postergar demais.`,
      () => 'Defina um criterio claro para distinguir reserva de protecao e dinheiro parado por medo. Essa separacao costuma reduzir muita rigidez silenciosa.'
    ]
  },
  bia: {
    context: [
      (data) => `Como ${data.profissao} com renda ${data.rendaLabel}, seu resultado sugere uma vida em que o presente pesa bastante. Isso nao significa falta de responsabilidade; muitas vezes significa rotina pressionada, desgaste e pouco espaco de manobra.`,
      (data) => `Sua leitura mostra que alivio, urgencia e necessidade de respiro entram forte na sua relacao com o dinheiro. Quando ${data.comprometidoLabel} da renda ja vai para fixos, esse peso do agora costuma crescer ainda mais.`,
      (data) => `Hoje, seu padrao parece menos sobre "querer tudo" e mais sobre lidar com o custo emocional de sustentar a vida. O problema aparece quando essa pressao vira um piloto automatico recorrente.`
    ],
    strength: [
      () => 'Sua principal forca esta em nao perder totalmente a capacidade de viver. Mesmo em contextos apertados, voce tende a buscar prazer, alivio e algum senso de humanidade na rotina.',
      (data) => `Para alguem em ${data.profissao}, isso pode ser uma forca importante: voce nao responde a vida apenas com dureza. O cuidado e criar estrutura para que esse alivio nao cobre caro depois.`,
      () => 'Seu perfil nao e frio nem anestesiado. Isso pode ser valioso, desde que o cuidado com o presente venha acompanhado de pequenas protecoes para o futuro.'
    ],
    alert: [
      (data) => `O risco principal aqui e a falta de amortecedor. Com ${data.comprometidoLabel} da renda comprometida e seguranca futura apoiada em ${data.previdenciaLabel}, qualquer desvio pode apertar demais o mes seguinte.`,
      () => 'Quando alivio emocional e decisao financeira se misturam com frequencia, o custo raramente aparece de uma vez. Ele vai morar no mes aos poucos.',
      (data) => `Seu ponto de atencao nao e moral. E estrutural: sem margem minima, o presente passa a decidir demais, e isso dificulta sair do mesmo lugar.`
    ],
    action: [
      () => 'A acao pratica mais util agora e criar uma pequena camada de friccao entre vontade e compra. Nao para te punir, mas para devolver alguns segundos de clareza a decisoes automaticas.',
      () => 'Escolha uma categoria em que voce mais busca alivio e adicione uma regra simples: esperar, reduzir o valor ou trocar frequencia por previsibilidade. O foco e sustentabilidade, nao privacao.',
      (data) => `Se sua seguranca futura hoje depende de ${data.previdenciaLabel}, vale construir tambem uma microbase de liquidez acessivel. Mesmo pequena, ela muda a sensacao de vulnerabilidade.`
    ]
  },
  valen: {
    context: [
      (data) => `Como ${data.profissao} com renda ${data.rendaLabel}, seu resultado sugere uma logica em que qualidade, imagem e expansao de padrao aparecem com bastante forca. Isso pode ser uma potencia quando existe base estrutural para sustentar esse ritmo.`,
      (data) => `Seu perfil mostra que voce nao quer apenas sobreviver financeiramente; quer coerencia com o tipo de vida que faz sentido para voce. O ponto central e garantir que essa expansao nao corra mais rapido do que a estrutura.`,
      (data) => `Hoje, sua leitura indica um padrao orientado por crescimento de conforto, valor percebido e manutencao de um certo nivel de vida. O risco nao esta no desejo em si, mas no custo de sustentacao que ele pede.`
    ],
    strength: [
      () => 'Sua principal forca esta na ambicao de qualidade. Voce costuma enxergar valor alem do basico e entende que algumas escolhas realmente mudam experiencia, posicionamento e conforto.',
      (data) => `Para alguem em ${data.profissao}, essa leitura pode ser uma vantagem real. Nem toda expansao e excesso; algumas elevacoes de padrao geram retorno funcional, social ou profissional.`,
      () => 'Seu perfil tende a perceber mais claramente que dinheiro tambem organiza identidade, imagem e ambiente. Isso pode ser bem usado quando existe criterio.'
    ],
    alert: [
      (data) => `O risco principal e transformar renda em obrigacao de padrao. Quando ${data.comprometidoLabel} da renda ja esta preso em fixos, a margem para sustentar expansao pode ficar menor do que parece.`,
      (data) => `Se sua protecao futura ainda depende muito de ${data.previdenciaLabel}, vale revisar se o crescimento do padrao esta vindo acompanhado de crescimento real de base.`,
      () => 'A fragilidade aqui costuma ser silenciosa: o custo nao esta numa compra isolada, mas na manutencao recorrente do nivel que vai se tornando "normal".'
    ],
    action: [
      () => 'A acao mais util agora e separar expansao que gera valor de expansao que apenas aumenta manutencao. Esse filtro sozinho ja melhora muito a qualidade das decisoes.',
      (data) => `Revise dois custos do seu padrao atual e pergunte: eles sustentam funcao real para a sua rotina de ${data.profissao} ou so mantem inercia?`,
      () => 'Defina um ritmo consciente para subir o nivel de vida. Crescer com margem costuma ser muito mais poderoso do que crescer rapido e ficar sem flexibilidade.'
    ]
  }
};
