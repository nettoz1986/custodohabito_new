import { buildSystemPrompt } from '../data/agent-knowledge.js';
import { analyzeConversationTurn, createConversationState } from './conversation-engine.js';

const SYSTEM_PROMPT = buildSystemPrompt();

// ---------------------------------------------------------------------------
// buildStateContext — versão completa com todos os casos tratados
// ---------------------------------------------------------------------------

function buildStateContext(analysis, conversationHistory = []) {
  const stage = analysis.modelBrief.stage;
  const collectedData = analysis.modelBrief.collectedData || {};
  const missingFields = analysis.modelBrief.missingFields || [];
  const theme = analysis.modelBrief.theme || 'tema em aberto';

  const payload = {
    theme,
    stage,
    intent: analysis.modelBrief.intent,
    missingFields,
    followUpQuestions: analysis.modelBrief.followUpQuestions,
    collectedData,
    evaluationSummary: analysis.modelBrief.evaluationSummary,
    knowledge: analysis.modelBrief.knowledge
  };

  // ---- Detectar loop: mesma pergunta aparecendo em >= 2 respostas anteriores ----
  const recentAssistant = conversationHistory
    .filter(m => m.role === 'assistant')
    .slice(-4)
    .map(m => m.content || '');

  const pendingQuestions = (analysis.modelBrief.followUpQuestions || [])
    .map(q => (typeof q === 'string' ? q : q.question) || '')
    .filter(Boolean);

  const loopDetected = pendingQuestions.some(q =>
    recentAssistant.filter(msg => msg.includes(q.slice(0, 25))).length >= 1
  );

  // ---- Quantos turnos já estamos em coleta para este tema ----
  const turnosEmColeta = conversationHistory
    .filter(m => m.role === 'assistant')
    .filter(m => (m.content || '').includes('preciso entender') ||
                 (m.content || '').includes('me conte') ||
                 (m.content || '').includes('para fechar a leitura'))
    .length;

  // ---- Montar contexto já coletado (para instrução do AI) ----
  const knownLines = [];
  if (collectedData.margem_no_mes_valor)
    knownLines.push(`- Margem mensal: R$ ${Number(collectedData.margem_no_mes_valor).toLocaleString('pt-BR')}`);
  if (collectedData.gasto_fixo_mensal)
    knownLines.push(`- Custo mensal: R$ ${Number(collectedData.gasto_fixo_mensal).toLocaleString('pt-BR')}`);
  if (collectedData.parcela_financiamento)
    knownLines.push(`- Parcela: R$ ${Number(collectedData.parcela_financiamento).toLocaleString('pt-BR')}`);
  if (collectedData.urgencia)
    knownLines.push(`- Urgência: ${collectedData.urgencia}`);
  if (collectedData.disciplina_de_aporte)
    knownLines.push(`- Disciplina de aporte: ${collectedData.disciplina_de_aporte}`);
  if (collectedData.bem_essencial !== undefined)
    knownLines.push(`- Bem essencial: ${collectedData.bem_essencial ? 'sim' : 'não'}`);
  if (collectedData.usuario_precisa_de_mecanismo_de_compromisso !== undefined)
    knownLines.push(`- Precisa de mecanismo de compromisso: ${collectedData.usuario_precisa_de_mecanismo_de_compromisso ? 'sim' : 'não'}`);
  if (collectedData.tempo_esperado_no_imovel)
    knownLines.push(`- Tempo no imóvel: ${collectedData.tempo_esperado_no_imovel}`);
  if (collectedData.necessidade_de_mobilidade)
    knownLines.push(`- Mobilidade: ${collectedData.necessidade_de_mobilidade}`);
  if (collectedData.estabilidade_profissional)
    knownLines.push(`- Estabilidade: ${collectedData.estabilidade_profissional}`);

  // ====================================================================
  // CASO 1: LOOP OU COLETA PROLONGADA EM DECISÃO
  // O AI extrai do histórico e entrega a avaliação diretamente
  // ====================================================================
  if ((loopDetected || turnosEmColeta >= 2) && stage === 'coleta_decisao') {
    return [
      `Estado atual: coletando dados para "${theme}" — mas o usuário já respondeu.`,
      '',
      'INSTRUÇÃO — EXTRAÇÃO E AVALIAÇÃO DIRETA:',
      'O sistema pediu perguntas que o usuário já respondeu com outras palavras.',
      'NÃO repita nenhuma dessas perguntas.',
      '',
      'Dados estruturados já capturados:',
      knownLines.length > 0 ? knownLines.join('\n') : '(sistema não capturou — leia o histórico)',
      '',
      'Campos ainda marcados como faltando pelo sistema:',
      missingFields.length > 0 ? missingFields.map(f => `- ${f}`).join('\n') : '(nenhum)',
      '',
      'SUA TAREFA:',
      '1. Leia TODO o histórico da conversa.',
      '2. Para cada campo faltando, mapeie o que o usuário já disse:',
      '   • "consigo guardar todo mês", "sempre guardo" → disciplina_de_aporte = alta',
      '   • "dá para me reorganizar sem", "não é essencial", "não preciso agora" → bem_essencial = false',
      '   • "não preciso de trava", "consigo sozinho" → precisa_de_mecanismo = false',
      '   • "não" como resposta isolada → considere a última pergunta feita e mapeie accordingly',
      '   • "futuramente", "quando puder", "pensando em" → urgencia = baixa',
      '3. Com esses dados, entregue a avaliação de "' + theme + '" agora.',
      '4. Tom: conversa direta, sem bullet list de perguntas, sem subtítulos formais.',
      '',
      'Se algum campo genuinamente não tiver resposta no histórico, avance mesmo assim',
      'e mencione a ressalva dentro da avaliação — mas ENTREGUE a direção.',
      '',
      `Rascunho local (use como lógica de avaliação, não como texto a copiar):\n${analysis.localResponse}`
    ].join('\n');
  }

  // ====================================================================
  // CASO 2: EXPLICAÇÃO DE CONCEITO
  // ====================================================================
  if (stage === 'explicacao') {
    const concept = analysis.modelBrief.conceptContent;
    return [
      'Estado: explicação de conceito solicitada.',
      '',
      'INSTRUÇÃO — MODO CONCEITO:',
      '- Responda como explicação conversacional, não como análise de decisão.',
      '- Sem subtítulos "Impacto estrutural", "Vale observar". Integre em parágrafos.',
      '- Se o usuário trouxe contexto próprio na pergunta, confirme e aprofunde a partir disso.',
      '- Máximo 4 parágrafos. Termine com observação prática.',
      '',
      concept ? [
        `Conteúdo base (${concept.id}):`,
        concept.reading,
        `Padrão: ${concept.pattern}`,
        `Impacto: ${concept.impact}`,
        `Perspectiva: ${concept.awareness}`,
        `Aplicação: ${concept.nextStep}`
      ].join('\n') : '',
      '',
      `Rascunho local:\n${analysis.localResponse}`
    ].filter(Boolean).join('\n');
  }

  // ====================================================================
  // CASO 3: APLICAÇÃO DE CONCEITO COM DADOS DO USUÁRIO
  // ====================================================================
  if (stage === 'explicacao_aplicada') {
    const gasto = collectedData.gasto_fixo_mensal;
    const margem = collectedData.margem_no_mes_valor;

    return [
      'Estado: usuário forneceu dados pessoais após explicação de conceito.',
      '',
      'INSTRUÇÃO — APLICAÇÃO DIRETA:',
      '- Leia os números que o usuário mencionou no histórico.',
      '- NÃO peça dados que o usuário já forneceu.',
      '- Aplique o conceito à situação específica.',
      gasto && margem
        ? `- Dados capturados: gasto=${gasto.toLocaleString('pt-BR')}, sobra=${margem.toLocaleString('pt-BR')}, margem=${Math.round((margem/(gasto+margem))*100)}%`
        : '- Se "gasto X e tenho Y no final do mês": margem = Y, renda = X+Y.',
      '- Diga se a margem é estreita (<15%), razoável (15-30%) ou confortável (>30%).',
      '- Tom conversacional, sem estrutura de relatório. Máximo 3 parágrafos.',
      '',
      `Rascunho local:\n${analysis.localResponse}`
    ].join('\n');
  }

  // ====================================================================
  // CASO 4: COLETA NORMAL (primeira ou segunda pergunta)
  // ====================================================================
  if (missingFields.length > 0) {
    return [
      'Estado conversacional atual:',
      JSON.stringify(payload, null, 2),
      '',
      'INSTRUÇÃO — COLETA:',
      '- Verifique o histórico ANTES de perguntar — o usuário pode já ter respondido.',
      '- Faça no máximo 2 perguntas genuinamente abertas. Prefira 1.',
      '- Em forma de conversa, não em lista de bullets.',
      '- Reconheça o contexto já dado antes de perguntar.',
      knownLines.length > 0 ? `\nContexto já coletado:\n${knownLines.join('\n')}` : '',
      '',
      `Rascunho local:\n${analysis.localResponse}`
    ].filter(Boolean).join('\n');
  }

  // ====================================================================
  // CASO 5: DADOS SUFICIENTES — entregar avaliação
  // ====================================================================
  return [
    'Estado conversacional atual:',
    JSON.stringify(payload, null, 2),
    '',
    'INSTRUÇÃO — AVALIAÇÃO:',
    '- Entregue tendência clara com ressalvas.',
    '- Parágrafos curtos, linguagem natural, sem excesso de subtítulos.',
    '- Diferencie uso de necessidade e custo de entrada de custo de funcionamento quando relevante.',
    '',
    `Rascunho local:\n${analysis.localResponse}`
  ].join('\n');
}

// ---------------------------------------------------------------------------
// AIService — sem alterações na lógica, apenas passa conversationHistory
// ---------------------------------------------------------------------------

export class AIService {
  constructor() {
    const env = import.meta.env || {};
    const p1 = env.VITE_GROQ_PART1 || '';
    const p2 = env.VITE_GROQ_PART2 || '';
    const p3 = env.VITE_GROQ_PART3 || '';
    const p4 = env.VITE_GROQ_PART4 || '';
    const p5 = env.VITE_GROQ_PART5 || '';
    const p6 = env.VITE_GROQ_PART6 || '';
    const p7 = env.VITE_GROQ_PART7 || '';
    const envKey = p1 + p2 + p3 + p4 + p5 + p6 + p7;

    this.apiKey = envKey || localStorage.getItem('groq_api_key') || '';
    this.conversationHistory = [];
    this.conversationState = createConversationState();
    this.models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    this.apiBase = 'https://api.groq.com/openai/v1/chat/completions';
  }

  isApiMode() {
    return this.apiKey && this.apiKey.length > 10;
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('groq_api_key', key);
  }

  clearHistory() {
    this.conversationHistory = [];
    this.conversationState = createConversationState();
  }

  async sendMessage(userMessage) {
    const analysis = analyzeConversationTurn(userMessage, this.conversationState);
    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      const response = this.isApiMode()
        ? await this.callGroqAPI(analysis)
        : analysis.localResponse;

      this.conversationHistory.push({ role: 'assistant', content: response });
      this.conversationState = analysis.nextState;
      return response;
    } catch (error) {
      this.conversationHistory.pop();
      const errorInfo = error.message || 'Erro desconhecido';
      return `**Erro ao conectar com a IA**\n\nNao foi possivel processar sua mensagem no momento.\n\nDetalhes tecnicos:\n> ${errorInfo}\n\nVoce pode tentar novamente em alguns segundos.`;
    }
  }

  async callGroqAPI(analysis) {
    let lastError = null;
    for (const model of this.models) {
      try {
        return await this.tryModel(model, analysis);
      } catch (error) {
        lastError = error;
        if (error.message.includes('401') || error.message.includes('403')) throw error;
      }
    }
    throw lastError;
  }

  async tryModel(model, analysis) {
    const body = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        // Passa conversationHistory para buildStateContext detectar loops
        { role: 'system', content: buildStateContext(analysis, this.conversationHistory) },
        ...this.conversationHistory
      ],
      temperature: 0.45,
      max_tokens: 1800
    };

    const response = await fetch(this.apiBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data?.error?.message || `Status HTTP ${response.status}`;
      throw new Error(`API Groq (${model}): ${response.status} - ${errorMsg}`);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('A API retornou uma resposta vazia.');
    return text;
  }
}