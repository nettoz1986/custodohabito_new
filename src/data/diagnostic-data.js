export const diagnosticQuestions = [
  { q: 'Sobrou um dinheiro inesperado este mês. Você:', options: [{ t: 'Guarda quase tudo', p: 'heitor' }, { t: 'Usa parte e guarda parte', p: 'lia' }, { t: 'Compra algo que queria há tempos', p: 'bia' }, { t: "Gasta porque 'merece aproveitar'", p: 'valen' }] },
  { q: 'Seu celular funciona, mas saiu um modelo melhor. Você:', options: [{ t: 'Nem considera trocar agora', p: 'heitor' }, { t: 'Só troca se houver real necessidade', p: 'lia' }, { t: 'Parcela e troca para facilitar a rotina', p: 'bia' }, { t: 'Troca para acompanhar o padrão', p: 'valen' }] },
  { q: 'Um amigo chama para um programa fora do orçamento:', options: [{ t: 'Recusa sem culpa', p: 'heitor' }, { t: 'Tenta adaptar para uma versão viável', p: 'lia' }, { t: 'Vai mesmo sabendo que aperta o mês', p: 'bia' }, { t: 'Vai porque combina com sua vida', p: 'valen' }] },
  { q: 'Quando pensa em lazer, você:', options: [{ t: 'Vê como gasto evitável', p: 'heitor' }, { t: 'Tenta encaixar sem comprometer o essencial', p: 'lia' }, { t: 'Costuma usar como recompensa', p: 'bia' }, { t: 'Considera parte obrigatória do estilo de vida', p: 'valen' }] },
  { q: 'Ao receber um aumento de renda, você tende a:', options: [{ t: 'Manter o padrão e guardar a diferença', p: 'heitor' }, { t: 'Melhorar pouco a pouco a rotina', p: 'lia' }, { t: 'Aumentar gastos em coisas que sentia falta', p: 'bia' }, { t: 'Elevar rapidamente o consumo', p: 'valen' }] },
  { q: 'Sobre saúde e autocuidado:', options: [{ t: 'Adia para economizar', p: 'heitor' }, { t: 'Investe no que considera necessário', p: 'lia' }, { t: 'Tenta cuidar, mas perde o controle', p: 'bia' }, { t: 'Investe, mas às vezes foca no status', p: 'valen' }] },
  { q: 'Quando está emocionalmente cansado:', options: [{ t: 'Segura tudo e se fecha', p: 'heitor' }, { t: 'Busca algo simples que traga alívio', p: 'lia' }, { t: 'Compra ou consome para compensar', p: 'bia' }, { t: 'Se presenteia com algo mais caro', p: 'valen' }] },
  { q: 'Sobre parcelamento:', options: [{ t: 'Evita quase sempre', p: 'heitor' }, { t: 'Usa com critério', p: 'lia' }, { t: 'Usa para viver melhor agora', p: 'bia' }, { t: 'Usa como ferramenta normal', p: 'valen' }] },
  { q: 'Se tivesse uma despesa inesperada alta:', options: [{ t: 'Lidaria, mas sofreria para gastar', p: 'heitor' }, { t: 'Teria algum plano de adaptação', p: 'lia' }, { t: 'Ficaria extremamente apertado', p: 'bia' }, { t: 'Perceberia que o custo fixo está alto', p: 'valen' }] },
  { q: 'O que mais parece com sua lógica atual?', options: [{ t: 'Proteger o futuro', p: 'heitor' }, { t: 'Equilibrar presente e futuro', p: 'lia' }, { t: 'Sobreviver ao presente', p: 'bia' }, { t: 'Sustentar um modo de vida', p: 'valen' }] }
];

export const diagnosticProfiles = {
  lia: {
    name: 'Lia Equilíbrio',
    reading: 'Você tende a ser prudente e adaptativa. Sabe caber dentro da sua realidade financeira.',
    strength: 'Manter os pés no chão sem transformar tudo em consumo.',
    warning: 'Não deixe a prudência virar privação crônica.',
    counsel: 'Invista em pequenas alegrias hoje.',
    agentPrompt: 'Meu perfil financeiro parece ser Lia Equilíbrio. Me ajude a avançar sem cair em estagnação.'
  },
  heitor: {
    name: 'Heitor Reserva',
    reading: 'Você é um acumulador estratégico com visão de longo prazo. Valoriza a segurança.',
    strength: 'Construção de reserva e visão estrutural.',
    warning: 'A rigidez pode te impedir de usufruir das conquistas.',
    counsel: 'Defina uma verba para o puro prazer sem culpa.',
    agentPrompt: 'Meu perfil financeiro parece ser Heitor Reserva. Como equilibrar segurança e qualidade de vida?'
  },
  bia: {
    name: 'Bia Agora',
    reading: 'Seu padrão é movido pelo alívio emocional e imediatismo.',
    strength: 'Sabe gerar vida e prazer dentro das limitações.',
    warning: 'Fragilidade diante de imprevistos e sensação de estagnação.',
    counsel: 'Tente a regra de esperar 24h antes de comprar.',
    agentPrompt: 'Meu perfil financeiro parece ser Bia Agora. Me ajude a criar estrutura sem cair em culpa.'
  },
  valen: {
    name: 'Valen Luxo',
    reading: 'Perfil expansivo e sofisticado. O padrão de vida é motor da sua identidade.',
    strength: 'Sabe circular e usar a imagem como ferramenta de expansão.',
    warning: 'Dependência de renda alta constante para manter o status.',
    counsel: 'Simplificar também pode ser um luxo.',
    agentPrompt: 'Meu perfil financeiro parece ser Valen Luxo. Como manter padrão sem fragilizar minha estrutura?'
  }
};

export const diagnosticProfileImages = {
  bia: '/public/assets/biaAgora.png',
  heitor: '/public/assets/heitorReserva.png',
  lia: '/public/assets/liaEquilibrio.png',
  valen: '/public/assets/valenLuxo.png'
};
