import { buildSystemPrompt } from '../data/agent-knowledge.js';
import { analyzeConversationTurn, createConversationState } from './conversation-engine.js';

const SYSTEM_PROMPT = buildSystemPrompt();

function buildStateContext(analysis) {
  const payload = {
    theme: analysis.modelBrief.theme,
    stage: analysis.modelBrief.stage,
    intent: analysis.modelBrief.intent,
    missingFields: analysis.modelBrief.missingFields,
    followUpQuestions: analysis.modelBrief.followUpQuestions,
    collectedData: analysis.modelBrief.collectedData,
    evaluationSummary: analysis.modelBrief.evaluationSummary,
    knowledge: analysis.modelBrief.knowledge
  };

  const instructions = analysis.missingFields.length
      ? [
        'Instrucao operacional:',
        '- Não entregue recomendação final nesta resposta.',
        '- Faça apenas as perguntas pendentes, de forma humana e curta.',
        '- Não repita uma aula genérica sobre finanças.',
        '- Pergunte sobre o terreno real da pessoa: margem, liquidez, linha do zero, urgência ou manutenção do gasto.',
        '- Soe como uma conversa lúcida e próxima da vida real, não como formulário.'
      ]
    : [
        'Instrucao operacional:',
        '- Use o resumo estruturado abaixo como âncora da resposta.',
        '- Entregue tendência clara com ressalvas, sem contradizer o estado analisado localmente.',
        '- Se a pergunta for concreta, não desvie para reflexão abstrata.',
        '- Prefira parágrafos curtos e linguagem natural; evite excesso de subtítulos e cara de relatório.',
        '- Quando fizer sentido, diferencie uso de necessidade, custo de entrada de custo de funcionamento e conforto de sustentabilidade.'
      ];

  return [
    'Estado conversacional atual do app:',
    JSON.stringify(payload, null, 2),
    ...instructions,
    `Rascunho local confiável do app:\n${analysis.localResponse}`
  ].join('\n');
}

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

      return `**Erro ao conectar com a IA**\n\nNao foi possivel processar sua mensagem no momento.\n\nDetalhes tecnicos:\n> ${errorInfo}\n\nVoce pode tentar novamente em alguns segundos ou usar o modo demonstracao sem chave de API.`;
    }
  }

  async callGroqAPI(analysis) {
    let lastError = null;

    for (const model of this.models) {
      try {
        return await this.tryModel(model, analysis);
      } catch (error) {
        lastError = error;
        if (error.message.includes('401') || error.message.includes('403')) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async tryModel(model, analysis) {
    const body = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: buildStateContext(analysis) },
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
    if (!text) {
      throw new Error('A API retornou uma resposta vazia.');
    }

    return text;
  }
}
