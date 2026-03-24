const directDecisionTriggers = [
  'devo',
  'vale a pena',
  'vale mais a pena',
  'compensa',
  'melhor',
  'qual e melhor',
  'o que e melhor',
  'cartao ou pix',
  'cartao ou debito',
  'a vista ou parcelado',
  'comprar ou alugar',
  'financiamento ou consorcio',
  'pagar divida ou investir',
  'reserva ou investir',
  'troco ou mantenho',
  'assino ou pago avulso',
  'compro agora ou espero',
  'compro ou junto dinheiro'
];

const patternTriggers = [
  'meu dinheiro some',
  'eu gasto por impulso',
  'nao consigo me controlar',
  'parece que eu nunca saio do lugar',
  'ganho mais mas continuo apertado',
  'me sinto culpado',
  'trabalho muito e gasto',
  'gasto para aliviar',
  'meu padrao subiu',
  'nao consigo manter',
  'fico apertado',
  'nao sobra',
  'eu mereco gastar',
  'uso cartao e perco o controle',
  'gasto para nao ficar de fora',
  'me comparo',
  'nao consigo organizar',
  'eu me aperto',
  'eu me perco',
  'vivo no limite'
];

export const fieldCatalog = {
  renda_liquida_mensal: {
    label: 'renda liquida mensal',
    question: 'Qual e a sua renda liquida mensal aproximada hoje?',
    category: 'estrutura'
  },
  gasto_fixo_mensal: {
    label: 'gasto fixo mensal',
    question: 'Quanto do seu mes ja sai em gastos fixos? Pode ser aproximado.',
    category: 'estrutura'
  },
  dividas_com_juros: {
    label: 'dividas com juros',
    question: 'Voce esta carregando alguma divida com juros hoje?',
    category: 'risco'
  },
  divida_juros_altos: {
    label: 'divida cara',
    question: 'Essa divida hoje esta em cartao rotativo, cheque especial ou outra linha com juros altos?',
    category: 'risco'
  },
  reserva_emergencia_meses: {
    label: 'reserva de emergencia em meses',
    question: 'Hoje voce tem reserva para quantos meses do seu custo essencial?',
    category: 'estrutura'
  },
  perfil_cartao: {
    label: 'perfil de uso do cartao',
    question: 'No cartao, voce costuma pagar a fatura total, pagar parcial, atrasar as vezes ou nem usar?',
    category: 'comportamento'
  },
  objetivo_compra: {
    label: 'objetivo da compra',
    question: 'Qual e exatamente a compra ou decisao que voce esta avaliando?',
    category: 'decisao'
  },
  valor_compra: {
    label: 'valor da compra',
    question: 'Qual e o valor aproximado envolvido nessa decisao?',
    category: 'decisao'
  },
  urgencia: {
    label: 'urgencia',
    question: 'Isso e urgente, pode esperar um pouco ou nao tem pressa?',
    category: 'decisao'
  },
  frequencia_de_uso: {
    label: 'frequencia de uso',
    question: 'Voce usaria isso de forma pontual, recorrente ou intensa?',
    category: 'uso'
  },
  prazo_de_uso: {
    label: 'prazo de uso',
    question: 'Voce imagina usar isso por pouco tempo, medio prazo ou longo prazo?',
    category: 'uso'
  },
  desconto_a_vista_percentual: {
    label: 'desconto a vista',
    question: 'Existe desconto real a vista ou no PIX? Se sim, de quantos por cento?',
    category: 'comparacao'
  },
  parcelamento_tem_juros: {
    label: 'parcelamento com juros',
    question: 'Esse parcelamento tem juros ou e sem juros?',
    category: 'comparacao'
  },
  beneficio_cartao_percentual_estimado: {
    label: 'beneficio real do cartao',
    question: 'No cartao existe cashback, ponto ou outro beneficio mensuravel? Quanto isso representa em percentual aproximado?',
    category: 'comparacao'
  },
  risco_de_impulso: {
    label: 'risco de impulso',
    question: 'Nessa situacao, voce sente risco baixo, medio ou alto de comprar por impulso?',
    category: 'comportamento'
  },
  risco_de_perder_controle_no_credito: {
    label: 'risco de perder controle no credito',
    question: 'Usar credito aqui tende a te ajudar no fluxo ou a aumentar o risco de perder o controle?',
    category: 'comportamento'
  },
  compra_essencial: {
    label: 'compra essencial',
    question: 'Essa compra e essencial agora ou seria mais uma compra opcional?',
    category: 'decisao'
  },
  dinheiro_ficara_reservado: {
    label: 'dinheiro reservado ate quitar',
    question: 'Se parcelar, o dinheiro total da compra ficara separado ate quitar?',
    category: 'estrutura'
  },
  tempo_esperado_no_imovel: {
    label: 'tempo esperado no imovel',
    question: 'Voce pretende ficar nesse imovel por muitos anos ou ainda ha chance real de mudar?',
    category: 'estrutura'
  },
  estabilidade_profissional: {
    label: 'estabilidade profissional',
    question: 'Sua renda e sua cidade estao estaveis hoje ou ainda podem mudar bastante?',
    category: 'estrutura'
  },
  valor_entrada: {
    label: 'valor de entrada',
    question: 'Voce ja tem entrada disponivel? Em nivel baixo, medio ou bom?',
    category: 'estrutura'
  },
  parcela_financiamento: {
    label: 'parcela do financiamento',
    question: 'Se comprar, qual seria a parcela aproximada do financiamento?',
    category: 'comparacao'
  },
  aluguel_mensal: {
    label: 'aluguel mensal',
    question: 'Qual e o aluguel mensal ou o custo atual de moradia para comparar?',
    category: 'comparacao'
  },
  custos_de_propriedade: {
    label: 'custos de propriedade',
    question: 'Voce ja considerou IPTU, condominio e manutencao nessa conta?',
    category: 'comparacao'
  },
  necessidade_de_mobilidade: {
    label: 'necessidade de mobilidade',
    question: 'Hoje sua vida pede alta mobilidade ou voce esta bem fixo no lugar?',
    category: 'estrutura'
  },
  disciplina_de_aporte: {
    label: 'disciplina de aporte',
    question: 'Voce consegue guardar com regularidade sem depender de uma trava externa?',
    category: 'comportamento'
  },
  usuario_precisa_de_mecanismo_de_compromisso: {
    label: 'precisa de mecanismo de compromisso',
    question: 'Voce sente que precisa de uma trava externa para conseguir acumular?',
    category: 'comportamento'
  },
  bem_essencial: {
    label: 'bem essencial',
    question: 'Esse bem e essencial para sua rotina ou da para reorganizar sem ele?',
    category: 'decisao'
  },
  uso_diario_intenso: {
    label: 'uso diario intenso',
    question: 'O uso disso seria diario e intenso ou mais eventual?',
    category: 'uso'
  },
  transporte_publico_insuficiente: {
    label: 'transporte publico insuficiente',
    question: 'Na sua rotina, transporte publico e app resolvem bem ou deixam sua vida travada?',
    category: 'estrutura'
  },
  custo_total_cabe: {
    label: 'custo total cabe',
    question: 'Somando parcela, seguro, manutencao, combustivel e impostos, isso cabe com folga ou apertando?',
    category: 'comparacao'
  },
  uso_pontual_ou_incerto: {
    label: 'uso pontual ou incerto',
    question: 'Esse uso e pontual/incerto ou voce sabe que vai usar bastante?',
    category: 'uso'
  },
  produto_duravel_reduz_trocas: {
    label: 'durabilidade reduz trocas',
    question: 'O produto melhor de fato reduz trocas, manutencao ou dor de cabeca ao longo do tempo?',
    category: 'comparacao'
  },
  celular_atual_atende_funcao: {
    label: 'celular atual atende',
    question: 'Seu celular atual ainda atende o que voce precisa no dia a dia?',
    category: 'uso'
  },
  celular_atual_compromete_trabalho_ou_seguranca: {
    label: 'celular compromete trabalho ou seguranca',
    question: 'Hoje o aparelho atrapalha seu trabalho, estudos ou seguranca de forma concreta?',
    category: 'decisao'
  },
  frequencia_baixa: {
    label: 'frequencia baixa',
    question: 'Voce realmente usa isso pouco ou ele ja faz parte da rotina?',
    category: 'uso'
  },
  assinatura_reduz_custo_unitario: {
    label: 'assinatura reduz custo unitario',
    question: 'Assinar reduz mesmo seu custo por uso ou so cria um pagamento automatico?',
    category: 'comparacao'
  },
  usuario_tem_muitas_assinaturas_pequenas: {
    label: 'muitas assinaturas pequenas',
    question: 'Voce sente que tem varias assinaturas pequenas somando um valor relevante?',
    category: 'padrao'
  },
  gatilho_emocional: {
    label: 'gatilho emocional',
    question: 'Isso costuma acontecer mais quando voce esta cansado, ansioso, frustrado ou querendo alivio?',
    category: 'padrao'
  },
  aumento_de_padrao: {
    label: 'aumento de padrao',
    question: 'Voce sente que essa decisao aumenta seu padrao de vida de forma recorrente ou fica so nessa compra?',
    category: 'padrao'
  },
  custo_recorrente: {
    label: 'custo recorrente',
    question: 'Depois da compra, ela puxa manutencao, mensalidade, reposicao, upgrade ou outro custo recorrente?',
    category: 'padrao'
  },
  margem_no_mes: {
    label: 'margem no mes',
    question: 'Hoje essa decisao cabe com folga, cabe apertando ou so existiria no credito?',
    category: 'estrutura'
  }
};

export const decisionThemes = [
  {
    id: 'pagar_no_credito_ou_no_pix',
    title: 'Pagar no credito ou no PIX/debito',
    summary: 'Escolhe a forma de pagamento com menor custo total, melhor controle e menor risco comportamental.',
    intentTriggers: ['cartao', 'credito', 'pix', 'debito', 'cashback', 'milhas', 'pontos', 'fatura', 'pagar no cartao'],
    mode: 'decision',
    requiredFields: [
      'perfil_cartao',
      'desconto_a_vista_percentual',
      'beneficio_cartao_percentual_estimado',
      'parcelamento_tem_juros',
      'risco_de_perder_controle_no_credito'
    ],
    keyRiskTypes: ['juros', 'descontrole', 'caixa'],
    blockingRules: [
      'Se o usuario paga parcial ou atrasa, o credito nao deve ser tratado como estrategia de otimizacao.',
      'Se houver juros, evitar parcelamento salvo urgencia real.',
      'Se o risco de perder controle for medio ou alto, o beneficio marginal do cartao perde relevancia.'
    ],
    recommendationFocus: 'Compare desconto certo, beneficio real e risco de perder o controle.'
  },
  {
    id: 'comprar_a_vista_ou_parcelar_sem_juros',
    title: 'Comprar a vista ou parcelar sem juros',
    summary: 'Decide entre desembolso imediato e preservacao de liquidez sem confundir parcelamento com aumento de capacidade.',
    intentTriggers: ['a vista', 'parcelar', 'parcelado', 'sem juros', '12x', '10x', 'parcelamento'],
    mode: 'decision',
    requiredFields: [
      'desconto_a_vista_percentual',
      'parcelamento_tem_juros',
      'dinheiro_ficara_reservado',
      'reserva_emergencia_meses'
    ],
    keyRiskTypes: ['caixa', 'liquidez', 'autoengano'],
    blockingRules: [
      'Parcelamento sem juros so funciona de verdade quando o dinheiro ja existe.',
      'Desconto a vista nao deve desmontar a reserva minima.',
      'Se parcelar for a unica forma de viabilizar a compra, a pergunta real deixa de ser forma de pagamento e passa a ser capacidade atual.'
    ],
    recommendationFocus: 'Liquidez tambem tem valor; o desconto precisa ser comparado com a seguranca do caixa.'
  },
  {
    id: 'comprar_ou_alugar_imovel',
    title: 'Comprar ou alugar imovel',
    summary: 'Compara posse, mobilidade, liquidez, estabilidade e custo estrutural de longo prazo.',
    intentTriggers: ['imovel', 'casa', 'apartamento', 'alugar', 'aluguel', 'financiamento imobiliario', 'comprar casa'],
    mode: 'decision',
    requiredFields: [
      'tempo_esperado_no_imovel',
      'estabilidade_profissional',
      'necessidade_de_mobilidade',
      'aluguel_mensal',
      'parcela_financiamento'
    ],
    keyRiskTypes: ['imobilizacao', 'rigidez', 'parcela apertada'],
    blockingRules: [
      'Mobilidade alta ou renda/cidade instaveis pesam a favor do aluguel.',
      'Parcela apertada e custo de propriedade ignorado sao sinais de alerta.',
      'A decisao nao deve ser guiada apenas pela ideia de posse.'
    ],
    recommendationFocus: 'O ponto nao e so posse; e o encaixe entre capital, estabilidade e liberdade futura.'
  },
  {
    id: 'financiamento_ou_consorcio_ou_juntar',
    title: 'Financiamento, consorcio ou juntar',
    summary: 'Escolhe a forma de acesso a um bem caro sem ignorar urgencia, rigidez, disciplina e custo de espera.',
    intentTriggers: ['consorcio', 'financiamento', 'juntar dinheiro', 'guardar e comprar', 'comprar depois'],
    mode: 'decision',
    requiredFields: ['urgencia', 'bem_essencial', 'disciplina_de_aporte', 'usuario_precisa_de_mecanismo_de_compromisso'],
    keyRiskTypes: ['rigidez', 'custo de espera', 'custo de juros'],
    blockingRules: [
      'Consorcio nao deve ser tratado como investimento.',
      'Se a parcela apertar o futuro, reduzir padrao ou adiar e mais prudente.',
      'Urgencia baixa com boa disciplina costuma favorecer acumular antes.'
    ],
    recommendationFocus: 'Tempo tambem custa, mas rigidez mal encaixada custa caro.'
  },
  {
    id: 'carro_proprio_ou_mobilidade_sob_demanda',
    title: 'Carro proprio ou mobilidade sob demanda',
    summary: 'Diferencia necessidade de posse de necessidade real de deslocamento.',
    intentTriggers: ['carro', 'uber', '99', 'transporte publico', 'mobilidade', 'app de transporte'],
    mode: 'decision',
    requiredFields: ['uso_diario_intenso', 'transporte_publico_insuficiente', 'custo_total_cabe'],
    keyRiskTypes: ['subestimacao', 'custo fixo', 'padrao'],
    blockingRules: [
      'Olhar so a parcela do carro mascara seguro, manutencao, IPVA, combustivel e depreciacao.',
      'Uso eventual costuma enfraquecer a justificativa da posse.'
    ],
    recommendationFocus: 'Nao decida se quer ter carro; decida quanto custa a solucao de mobilidade que sua vida exige.'
  },
  {
    id: 'produto_barato_ou_duravel',
    title: 'Produto barato ou produto duravel',
    summary: 'Compara preco de entrada com custo por ciclo de uso.',
    intentTriggers: ['barato', 'duravel', 'qualidade', 'garantia', 'assistencia', 'recompra', 'durar'],
    mode: 'decision',
    requiredFields: ['frequencia_de_uso', 'uso_pontual_ou_incerto', 'produto_duravel_reduz_trocas'],
    keyRiskTypes: ['recompra', 'falsa economia', 'subuso'],
    blockingRules: [
      'Barato repetido pode ficar caro quando gera recompra frequente.',
      'Nao pagar por robustez que talvez nunca seja usada.'
    ],
    recommendationFocus: 'O que importa e custo por ciclo de uso, nao so preco de entrada.'
  },
  {
    id: 'trocar_de_celular_ou_manter',
    title: 'Trocar de celular ou manter',
    summary: 'Separa necessidade tecnica de desconforto aspiracional.',
    intentTriggers: ['celular', 'iphone', 'trocar de celular', 'smartphone', 'aparelho'],
    mode: 'decision',
    requiredFields: ['celular_atual_atende_funcao', 'celular_atual_compromete_trabalho_ou_seguranca', 'compra_essencial'],
    keyRiskTypes: ['padrao', 'autojustificacao', 'antecipacao'],
    blockingRules: [
      'Desejo estetico ou status nao deve ser tratado como necessidade tecnica.',
      'Se o aparelho atende, a troca precisa de justificativa concreta e nao apenas comparativa.'
    ],
    recommendationFocus: 'Troca legitima e a que resolve friccao real, nao so vontade de atualizar padrao.'
  },
  {
    id: 'assinatura_recorrente_ou_avulso',
    title: 'Assinatura recorrente ou pagamento avulso',
    summary: 'Decide entre conveniencia recorrente e uso real, considerando vazamentos invisiveis.',
    intentTriggers: ['assinatura', 'mensalidade', 'streaming', 'plano', 'app', 'anual', 'avulso'],
    mode: 'decision',
    requiredFields: ['frequencia_de_uso', 'assinatura_reduz_custo_unitario', 'usuario_tem_muitas_assinaturas_pequenas'],
    keyRiskTypes: ['automaticidade', 'subuso', 'acumulo'],
    blockingRules: [
      'Uso baixo transforma conveniencia em custo fixo.',
      'Assinaturas pequenas podem se somar como vazamento estrutural.'
    ],
    recommendationFocus: 'Assinatura so e boa quando acompanha uso real e reduz custo por uso.'
  },
  {
    id: 'reserva_de_emergencia_ou_investir',
    title: 'Reserva de emergencia ou investir',
    summary: 'Prioriza base de seguranca antes de sofisticacao.',
    intentTriggers: ['reserva', 'emergencia', 'investir', 'investimento', 'comecar a investir', 'renda fixa'],
    mode: 'decision',
    requiredFields: ['reserva_emergencia_meses', 'dividas_com_juros'],
    keyRiskTypes: ['fragilidade', 'quebra de estrategia', 'falsa sofisticacao'],
    blockingRules: [
      'Sem reserva minima, qualquer imprevisto quebra a estrategia.',
      'Divida cara costuma vir antes da busca por retorno.'
    ],
    recommendationFocus: 'Base primeiro, performance depois.'
  },
  {
    id: 'pagar_divida_ou_investir',
    title: 'Pagar divida ou investir',
    summary: 'Compara custo do juro contra retorno esperado, sem romantizar investimento.',
    intentTriggers: ['pagar divida', 'quitar divida', 'investir ou pagar', 'rotativo', 'cheque especial', 'juros altos'],
    mode: 'decision',
    requiredFields: ['dividas_com_juros', 'divida_juros_altos', 'reserva_emergencia_meses'],
    keyRiskTypes: ['juros', 'erosao patrimonial', 'ilusão de progresso'],
    blockingRules: [
      'Rotativo e juros altos costumam destruir qualquer tentativa de investir ao mesmo tempo.',
      'Nem toda divida tem a mesma urgencia, mas as caras vem primeiro.'
    ],
    recommendationFocus: 'Retorno seguro raramente vence juro ruim.'
  }
];

export const patternThemes = [
  {
    id: 'dinheiro_some',
    title: 'Dinheiro some',
    summary: 'Le o comprometimento invisivel do mes antes de culpar falta de controle.',
    intentTriggers: ['dinheiro some', 'nao sei para onde foi', 'some', 'evapora', 'desaparece'],
    mode: 'pattern',
    readingFocus: 'comprometimento invisivel, recorrencias, parcelas antigas e perda de visibilidade',
    suggestedQuestions: ['gasto_fixo_mensal', 'usuario_tem_muitas_assinaturas_pequenas']
  },
  {
    id: 'impulso_e_alivio',
    title: 'Impulso e alivio emocional',
    summary: 'Le o gasto como tentativa de alivio, recompensa ou regulacao emocional.',
    intentTriggers: ['impulso', 'gasto por impulso', 'compro quando', 'ansioso', 'cansado', 'mereco'],
    mode: 'pattern',
    readingFocus: 'alivio, compensacao, cansaco e decisao encurtada pelo presente',
    suggestedQuestions: ['gatilho_emocional', 'risco_de_impulso']
  },
  {
    id: 'padrao_subiu',
    title: 'Padrao de vida subindo',
    summary: 'Le a expansao silenciosa do custo estrutural.',
    intentTriggers: ['padrao de vida', 'meu estilo de vida subiu', 'subiu sem perceber', 'status', 'luxo'],
    mode: 'pattern',
    readingFocus: 'expansao de padrao, manutencao e custo fixo invisivel',
    suggestedQuestions: ['aumento_de_padrao', 'custo_recorrente']
  },
  {
    id: 'trabalho_muito_e_gasto',
    title: 'Merecimento e recompensa',
    summary: 'Le a relacao entre esforco, recompensa e custo recorrente.',
    intentTriggers: ['trabalho muito', 'mereco', 'me presentear', 'recompensa'],
    mode: 'pattern',
    readingFocus: 'merecimento como criterio recorrente de gasto',
    suggestedQuestions: ['gatilho_emocional', 'aumento_de_padrao']
  },
  {
    id: 'nao_saio_do_lugar',
    title: 'Sensacao de estagnacao',
    summary: 'Le esforco sem mudanca estrutural.',
    intentTriggers: ['nao saio do lugar', 'estagnado', 'sempre no mesmo', 'nao ando'],
    mode: 'pattern',
    readingFocus: 'mes resolvido sem alteracao de sistema',
    suggestedQuestions: ['gasto_fixo_mensal', 'dividas_com_juros']
  },
  {
    id: 'ganho_mais_e_continuo_apertado',
    title: 'Renda sobe, aperto continua',
    summary: 'Le a expansao do padrao junto com a renda.',
    intentTriggers: ['ganho mais', 'aumento de renda', 'continuo apertado', 'mesmo ganhando melhor'],
    mode: 'pattern',
    readingFocus: 'crescimento do custo no mesmo ritmo da renda',
    suggestedQuestions: ['aumento_de_padrao', 'gasto_fixo_mensal']
  },
  {
    id: 'medo_de_gastar',
    title: 'Medo de gastar',
    summary: 'Le seguranca como possivel forca e tambem como possivel rigidez.',
    intentTriggers: ['tenho dificuldade de gastar', 'medo de gastar', 'evito gastar', 'nao consigo usufruir'],
    mode: 'pattern',
    readingFocus: 'protecao, escassez internalizada e compressao de qualidade de vida',
    suggestedQuestions: ['reserva_emergencia_meses', 'gatilho_emocional']
  },
  {
    id: 'cartao_perde_controle',
    title: 'Cartao e perda de referencia',
    summary: 'Le a distancia entre consumir e pagar como perda de visibilidade.',
    intentTriggers: ['perco o controle no cartao', 'cartao me atrapalha', 'fatura vem alta'],
    mode: 'pattern',
    readingFocus: 'descolamento entre consumo e impacto percebido',
    suggestedQuestions: ['perfil_cartao', 'risco_de_perder_controle_no_credito']
  }
];

export const diagnosticProfilesKnowledge = {
  lia: {
    label: 'Lia Equilibrio',
    structuralReading: 'Busca adaptar a vida a realidade sem transformar tudo em privacao ou impulso.',
    likelyStrengths: ['adaptacao', 'bom senso', 'leitura de contexto'],
    likelyRisks: ['concessao excessiva', 'normalizacao do que aperta um pouco', 'elasticidade demais'],
    responseAngle: 'reforcar metodo, limite e sustentabilidade'
  },
  heitor: {
    label: 'Heitor Reserva',
    structuralReading: 'Prioriza seguranca, previsibilidade e protecao.',
    likelyStrengths: ['prudencia', 'base', 'protecao'],
    likelyRisks: ['rigidez', 'compressao de usufruto', 'medo de perder seguranca'],
    responseAngle: 'distinguir protecao saudavel de contencao excessiva'
  },
  bia: {
    label: 'Bia Agora',
    structuralReading: 'O presente pesa bastante e a decisao pode buscar alivio, recompensa ou respiro.',
    likelyStrengths: ['vitalidade', 'prazer possivel', 'busca de alivio'],
    likelyRisks: ['recorrencia cara', 'fragilidade diante do imprevisto', 'decisao encurtada pelo agora'],
    responseAngle: 'reduzir culpa e construir pequenas estruturas'
  },
  valen: {
    label: 'Valen Expansao',
    structuralReading: 'Padrão, imagem, conforto e expansao influenciam fortemente as escolhas.',
    likelyStrengths: ['visao de qualidade', 'ambicao de melhoria', 'leitura de valor'],
    likelyRisks: ['custo fixo elevado', 'expansao rapida demais', 'dependencia de renda alta constante'],
    responseAngle: 'dar ritmo ao padrao e separar valor de manutencao excessiva'
  }
};

export const fallbackScenarios = [
  {
    id: 'pressao_financeira',
    title: 'Pressao financeira',
    triggers: ['dinheiro some', 'nao sobra', 'sem dinheiro', 'aperto', 'sufoco', 'endividado', 'perdido', 'ansiedade'],
    summary: 'Leia a pressao estrutural do mes antes de buscar uma solucao rapida.'
  },
  {
    id: 'padrao_de_vida',
    title: 'Padrao de vida',
    triggers: ['padrao de vida', 'status', 'luxo', 'estilo de vida', 'manutencao', 'sustentar', 'comparacao'],
    summary: 'Observe o custo de sustentar o padrao, nao so o gasto isolado.'
  },
  {
    id: 'habito_e_consumo',
    title: 'Habitos e recorrencias',
    triggers: ['habito', 'rotina', 'consumo', 'impulso', 'emocional', 'automatico', 'microgasto'],
    summary: 'Entenda gatilho, repeticao e manutencao antes de tentar so reduzir gasto.'
  },
  {
    id: 'planejamento_e_clareza',
    title: 'Planejamento e clareza',
    triggers: ['orcamento', 'planejamento', 'meta', 'organizar', 'mapa financeiro', 'controle financeiro'],
    summary: 'Planejamento serve para revelar o desenho do mes, nao para punir.'
  }
];

export const agentKnowledge = {
  project: {
    name: 'Custo do Habito',
    purpose: 'Ajudar pessoas a enxergar o custo do proprio padrao e transformar essa clareza em decisoes melhores.',
    centralThesis: 'O problema raramente e so matematico; o custo maior costuma estar no sistema, na recorrencia e no padrao que a rotina sustenta.',
    roleDefinition: 'Leitor de padrao e motor de decisao educacional. Nao e consultor financeiro individual, nem vendedor de solucao pronta.'
  },

  structuralBases: [
    'O problema raramente e so matematico.',
    'Todo gasto tem continuidade: manutencao, recorrencia, adaptacao ou reposicao.',
    'O custo real costuma estar no tempo, nao no momento da compra.',
    'Pequenas decisoes repetidas pesam mais do que parecem.',
    'Clareza vem antes de velocidade.',
    'O objetivo e autonomia de decisao, nao performance vazia.'
  ],

  operatingPremises: [
    'Nenhuma decisao e isolada.',
    'Toda escolha altera o sistema financeiro pessoal.',
    'O custo nao termina na compra.',
    'Padrao de vida gera inercia.',
    'A melhor decisao depende do contexto, nao de regra universal.'
  ],

  editorialPrinciples: [
    'Educar antes de recomendar.',
    'Explicar custo total, nao so preco imediato.',
    'Separar necessidade, caixa, manutencao e risco comportamental.',
    'Evitar moralismo e culpa.',
    'Transformar duvida vaga em decisao operacional.',
    'Nomear padrao invisivel antes de corrigir comportamento.'
  ],

  priorities: [
    'Proteger o caixa mensal.',
    'Evitar juros ruins.',
    'Preservar liquidez minima.',
    'Comparar custo total ao longo do tempo.',
    'So depois buscar otimizacao marginal.'
  ],

  mandatoryGuidelines: [
    'Nao tratar credito como renda.',
    'Nao empurrar parcelamento sem criterio.',
    'Nao prometer enriquecimento.',
    'Nao recomendar ativos especificos como consultoria personalizada.',
    'Nao responder no automatico sem contexto minimo.',
    'Nao moralizar consumo.',
    'Nao induzir culpa.'
  ],

  tone: {
    preferred: ['humano', 'claro', 'direto', 'respeitoso', 'analitico', 'sem linguagem de coach', 'sem entusiasmo artificial'],
    avoid: ['moralismo', 'jargao desnecessario', 'bronca', 'neutralidade vazia', 'promessa de enriquecimento', 'tom de guru'],
    preferredPhrasings: [
      'O que pode estar acontecendo e...',
      'Um padrao comum nesse cenario e...',
      'A tendencia aqui e...',
      'O principal risco seria...',
      'O que mais pesa nessa decisao e...',
      'Antes de fechar essa resposta, eu preciso de dois dados...',
      'A decisao final continua sendo sua, mas hoje eu iria nessa direcao...'
    ]
  },

  responseBlueprint: {
    decision: [
      'Leitura do contexto',
      'Tendencia ou sugestao pratica',
      'O que mais pesou na decisao',
      'Principal risco',
      'Proximo passo objetivo',
      'Alternativa se a principal opcao nao couber'
    ],
    pattern: [
      'Nomeacao do padrao',
      'Reducao de culpa',
      'Leitura do que pode estar operando',
      'Impacto estrutural no tempo',
      'Ponte para proximo passo ou decisao pratica'
    ],
    shortMode: [
      'Tendencia',
      'Risco principal',
      'Proximo passo'
    ]
  },

  directDecisionTriggers,
  patternTriggers
};

export function getThemeById(themeId) {
  return [...decisionThemes, ...patternThemes].find((theme) => theme.id === themeId) || null;
}

export function getDecisionThemeById(themeId) {
  return decisionThemes.find((theme) => theme.id === themeId) || null;
}

export function getPatternThemeById(themeId) {
  return patternThemes.find((theme) => theme.id === themeId) || null;
}

export function getFieldQuestion(fieldKey) {
  return fieldCatalog[fieldKey]?.question || null;
}

export function classifyConversationEntry(userMessage) {
  const normalized = normalizeText(userMessage);

  const decisionScore = directDecisionTriggers.reduce((total, trigger) => (
    normalized.includes(trigger) ? total + 1 : total
  ), 0);

  const patternScore = patternTriggers.reduce((total, trigger) => (
    normalized.includes(trigger) ? total + 1 : total
  ), 0);

  if (decisionScore === 0 && patternScore === 0) return 'unknown';
  if (decisionScore >= patternScore) return 'decision';
  return 'pattern';
}

export function detectTheme(userMessage, previousThemeId = null) {
  const normalized = normalizeText(userMessage);
  let bestTheme = previousThemeId ? getThemeById(previousThemeId) : null;
  let bestScore = bestTheme ? 1 : 0;

  [...decisionThemes, ...patternThemes].forEach((theme) => {
    const score = theme.intentTriggers.reduce((total, trigger) => (
      normalized.includes(trigger) ? total + 1 : total
    ), 0);

    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  });

  return bestScore > 0 ? bestTheme : null;
}

export function getCriticalMissingFields(theme, knownData = {}) {
  if (!theme?.requiredFields?.length) return [];

  return theme.requiredFields.filter((fieldKey) => {
    const value = knownData[fieldKey];
    return value === undefined || value === null || value === '';
  });
}

export function getNextBestQuestions(theme, knownData = {}, limit = 3) {
  const missingFields = getCriticalMissingFields(theme, knownData);
  return missingFields
    .slice(0, limit)
    .map((fieldKey) => ({
      field: fieldKey,
      question: getFieldQuestion(fieldKey),
      category: fieldCatalog[fieldKey]?.category || 'geral'
    }))
    .filter((item) => item.question);
}

export function findRelevantKnowledge(userMessage, themeId = null, diagnosticContext = null) {
  const normalized = normalizeText(userMessage);
  const snippets = [];

  fallbackScenarios.forEach((scenario) => {
    if (scenario.triggers.some((trigger) => normalized.includes(trigger))) {
      snippets.push({
        id: scenario.id,
        type: 'scenario',
        title: scenario.title,
        summary: scenario.summary
      });
    }
  });

  if (themeId) {
    const theme = getThemeById(themeId);
    if (theme) {
      snippets.unshift({
        id: theme.id,
        type: theme.mode === 'pattern' ? 'pattern-theme' : 'decision-theme',
        title: theme.title,
        summary: theme.mode === 'pattern'
          ? `${theme.summary} Foco de leitura: ${theme.readingFocus}.`
          : `${theme.summary} Foco de recomendacao: ${theme.recommendationFocus}.`
      });
    }
  }

  if (diagnosticContext?.primaryProfile && diagnosticProfilesKnowledge[diagnosticContext.primaryProfile]) {
    const profile = diagnosticProfilesKnowledge[diagnosticContext.primaryProfile];
    snippets.push({
      id: `diagnostic_${diagnosticContext.primaryProfile}`,
      type: 'diagnostic-profile',
      title: profile.label,
      summary: `${profile.structuralReading} Riscos provaveis: ${profile.likelyRisks.join(', ')}.`
    });
  }

  return snippets;
}

export function buildSystemPrompt() {
  return [
    `Voce e o agente educador financeiro do projeto "${agentKnowledge.project.name}".`,
    `Papel: ${agentKnowledge.project.roleDefinition}`,
    `Proposito: ${agentKnowledge.project.purpose}`,
    `Tese central: ${agentKnowledge.project.centralThesis}`,
    '',
    'Bases estruturais do projeto:',
    ...agentKnowledge.structuralBases.map((item) => `- ${item}`),
    '',
    'Premissas operacionais:',
    ...agentKnowledge.operatingPremises.map((item) => `- ${item}`),
    '',
    'Principios editoriais:',
    ...agentKnowledge.editorialPrinciples.map((item) => `- ${item}`),
    '',
    'Hierarquia de prioridades:',
    ...agentKnowledge.priorities.map((item) => `- ${item}`),
    '',
    'Diretrizes obrigatorias:',
    ...agentKnowledge.mandatoryGuidelines.map((item) => `- ${item}`),
    '',
    `Tom preferido: ${agentKnowledge.tone.preferred.join(', ')}.`,
    `Evite: ${agentKnowledge.tone.avoid.join(', ')}.`,
    `Expressoes uteis: ${agentKnowledge.tone.preferredPhrasings.join(' | ')}.`,
    '',
    'Fluxo conversacional esperado:',
    '- Primeiro identifique se a entrada do usuario e de decisao ou de padrao.',
    '- Se for decisao, colete apenas 2 a 4 dados criticos e pare se ainda faltar contexto.',
    '- Se for padrao, nomeie o que pode estar acontecendo antes de tentar resolver.',
    '- Sempre conecte a resposta ao tempo, ao custo estrutural e ao risco invisivel.',
    '- Nunca responda com "depende" generico.',
    '- Se houver contexto suficiente, entregue tendencia clara com ressalvas e proximo passo.',
    '- Sempre preserve a autonomia do usuario.',
    '',
    'Estrutura preferida para respostas de decisao:',
    ...agentKnowledge.responseBlueprint.decision.map((item, index) => `${index + 1}. ${item}`),
    '',
    'Estrutura preferida para respostas de padrao:',
    ...agentKnowledge.responseBlueprint.pattern.map((item, index) => `${index + 1}. ${item}`),
    '',
    'Modo curto quando o usuario quiser rapidez:',
    ...agentKnowledge.responseBlueprint.shortMode.map((item, index) => `${index + 1}. ${item}`),
    '',
    'Lembrete final:',
    'Voce nao ensina a economizar no vazio. Voce ajuda o usuario a enxergar o custo do proprio padrao e, a partir disso, decidir melhor.'
  ].join('\n');
}

export function buildDiagnosticAwarePrompt(diagnosticResult = {}) {
  const primary = diagnosticResult.primaryProfile;
  const secondary = diagnosticResult.secondaryProfile;
  const axes = Array.isArray(diagnosticResult.axes) ? diagnosticResult.axes : [];

  const primaryKnowledge = primary ? diagnosticProfilesKnowledge[primary] : null;
  const secondaryKnowledge = secondary ? diagnosticProfilesKnowledge[secondary] : null;

  return [
    'Contexto adicional do diagnostico do usuario:',
    primaryKnowledge ? `- Perfil predominante: ${primaryKnowledge.label}. ${primaryKnowledge.structuralReading}` : null,
    secondaryKnowledge ? `- Perfil secundario: ${secondaryKnowledge.label}. ${secondaryKnowledge.structuralReading}` : null,
    axes.length ? `- Eixos percebidos: ${axes.join(', ')}.` : null,
    primaryKnowledge ? `- Forcas provaveis: ${primaryKnowledge.likelyStrengths.join(', ')}.` : null,
    primaryKnowledge ? `- Riscos provaveis: ${primaryKnowledge.likelyRisks.join(', ')}.` : null,
    primaryKnowledge ? `- Angulo de resposta sugerido: ${primaryKnowledge.responseAngle}.` : null,
    'Use esse contexto apenas para aumentar a precisao da leitura, sem rotular o usuario de forma fechada.'
  ].filter(Boolean).join('\n');
}

export function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}