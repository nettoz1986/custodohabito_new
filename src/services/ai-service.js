import { buildSystemPrompt, findRelevantKnowledge } from '../data/agent-knowledge.js';

const SYSTEM_PROMPT = buildSystemPrompt();

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
  }

  buildContextualUserMessage(userMessage) {
    const matches = findRelevantKnowledge(userMessage);

    if (!matches.length) {
      return userMessage;
    }

    return [
      userMessage,
      '',
      '[Contexto interno do projeto para interpretar esta pergunta]',
      ...matches.map((item) => `- ${item.summary}`)
    ].join('\n');
  }

  async sendMessage(userMessage) {
    const contextualMessage = this.buildContextualUserMessage(userMessage);
    this.conversationHistory.push({ role: 'user', content: contextualMessage });

    try {
      const response = this.isApiMode()
        ? await this.callGroqAPI()
        : await this.getDemoResponse(userMessage);

      this.conversationHistory.push({ role: 'assistant', content: response });
      return response;
    } catch (error) {
      this.conversationHistory.pop();
      const errorInfo = error.message || 'Erro desconhecido';

      return `⚠️ **Erro ao conectar com a IA**

Não foi possível processar sua mensagem no momento.

Detalhes técnicos:
> ${errorInfo}

Você pode tentar novamente em alguns segundos ou usar o modo demonstração sem chave de API.`;
    }
  }

  async callGroqAPI() {
    let lastError = null;

    for (const model of this.models) {
      try {
        return await this.tryModel(model);
      } catch (error) {
        lastError = error;
        if (error.message.includes('401') || error.message.includes('403')) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async tryModel(model) {
    const body = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.conversationHistory
      ],
      temperature: 0.6,
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
      throw new Error(`API Groq (${model}): ${response.status} — ${errorMsg}`);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('A API retornou uma resposta vazia.');
    }

    return text;
  }

  async getDemoResponse(message) {
    await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 600));

    const lowerMsg = message.toLowerCase();
    const hasPatternPressure = ['dinheiro some', 'sem dinheiro', 'nao sobra', 'não sobra', 'aperto', 'sufoco'].some((term) => lowerMsg.includes(term));
    const hasPatternLifestyle = ['padrao', 'padrão', 'status', 'estilo de vida', 'luxo'].some((term) => lowerMsg.includes(term));
    const hasPatternHabit = ['habito', 'hábito', 'rotina', 'consumo', 'impulso', 'emocional'].some((term) => lowerMsg.includes(term));

    if (hasPatternPressure) {
      return `## Leitura do contexto

Isso acontece com muita gente e nem sempre significa falta de renda. Muitas vezes o problema está na pressão estrutural que o mês já carrega antes mesmo das escolhas pontuais.

## Padrão possível

Um padrão comum nesse cenário é a soma de compromissos invisíveis: recorrências pequenas, custo fixo alto, parcelas antigas e decisões repetidas que parecem leves isoladamente.

## Impacto ao longo do tempo

Quando esse desenho se repete, a sensação é de trabalhar muito para manter a máquina girando sem construir margem. O dinheiro entra, cumpre obrigações já embutidas no padrão de vida e desaparece.

## Ampliação de consciência

Vale observar menos o gasto isolado e mais o custo de sustentar a rotina inteira. O ponto nem sempre é "gastar demais", e sim manter um formato de vida que pede mais caixa do que parece.

## Direcionamento leve

Se quiser, eu posso te ajudar a mapear onde estão os compromissos invisíveis do seu mês em blocos simples.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    if (hasPatternLifestyle) {
      return `## Leitura do contexto

Buscar conforto, imagem ou praticidade não é um erro moral. A questão é entender qual estrutura financeira esse padrão exige para continuar de pé.

## Padrão possível

O que pode estar acontecendo é uma dependência de renda constante para sustentar um estilo de vida que cresceu aos poucos: mais manutenção, mais reposição e mais compromissos acoplados.

## Impacto ao longo do tempo

O custo real não está só na compra principal. Ele aparece na continuidade: assinatura, atualização, manutenção, reposição e expectativa social que o padrão cria.

## Ampliação de consciência

Em vez de perguntar apenas "isso cabe no orçamento?", vale perguntar "qual padrão esse gasto está alimentando?".

## Direcionamento leve

Posso te ajudar a separar o que é valor real para você e o que virou custo de manutenção automática.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    if (hasPatternHabit) {
      return `## Leitura do contexto

Comportamento financeiro não nasce no vazio. Rotina, cansaço, ambiente e busca de alívio mexem muito com a forma como o dinheiro é usado.

## Padrão possível

Um padrão comum nesse cenário é usar consumo, conveniência ou pequenas recompensas para compensar pressão emocional e desgaste da rotina.

## Impacto ao longo do tempo

O peso financeiro raramente vem de um único ato. Ele se forma na repetição, especialmente quando o hábito cria recorrência e reduz a margem do mês sem ser percebido.

## Ampliação de consciência

Vale observar o gatilho antes do gasto. Muitas vezes a chave não é disciplina bruta, e sim entender o contexto que empurra a decisão.

## Direcionamento leve

Se quiser, eu posso te ajudar a ler um hábito específico pelo ciclo completo: gatilho, compra, recorrência e custo estrutural.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    if (lowerMsg.includes('orçamento') || lowerMsg.includes('orcamento')) {
      return `## Leitura do contexto

Orçamento não precisa funcionar como punição. Ele serve para revelar o desenho real da sua rotina e mostrar quanto custa sustentar o mês.

## Padrão possível

Sem essa visão, o dinheiro costuma ser absorvido pelo automático: essenciais, estilo de vida, metas mal definidas e pequenos vazamentos que passam despercebidos.

## Impacto ao longo do tempo

Quando você não nomeia os blocos do mês, perde margem para decidir. O orçamento devolve clareza antes de tentar velocidade.

## Direcionamento leve

Comece com quatro blocos: \`essenciais\`, \`estilo de vida\`, \`metas\` e \`segurança\`. Se quiser, eu posso montar esse mapa com você agora.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    if (lowerMsg.includes('reserva')) {
      return `## Leitura do contexto

Reserva de emergência não é sobre performance. É sobre evitar que um imprevisto force decisões ruins ou crie dívida cara.

## Padrão possível

Quando não existe proteção mínima, qualquer desvio pressiona o restante da estrutura financeira e aumenta a dependência de crédito.

## Impacto ao longo do tempo

A reserva compra tempo, reduz ansiedade e protege o restante do seu planejamento. Ela sustenta a estrutura quando a rotina sai do roteiro.

## Direcionamento leve

Vale começar com \`1 custo essencial mensal\` e crescer depois para \`3 a 6 meses\`. Se quiser, eu posso te ajudar a calcular o seu piso de proteção.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    if (lowerMsg.includes('dívida') || lowerMsg.includes('divida') || lowerMsg.includes('cartão') || lowerMsg.includes('cartao')) {
      return `## Leitura do contexto

Dívida costuma ser só a parte visível do aperto. Por trás dela normalmente existe pressão de rotina, desorganização de fluxo ou custo fixo já acima do saudável.

## Padrão possível

Um padrão comum é usar crédito para sustentar o presente enquanto compromissos antigos continuam consumindo o mês.

## Impacto ao longo do tempo

Quando os juros entram, o problema deixa de ser só falta de folga e vira desgaste estrutural. A dívida passa a cobrar pelo passado e reduz a margem das próximas decisões.

## Direcionamento leve

Vale listar \`valor total\`, \`taxa\`, \`parcela\` e \`atraso\` de cada dívida para enxergar onde a pressão está maior. Posso montar esse raio-X com você.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    if (lowerMsg.includes('juros compostos') || lowerMsg.includes('invest')) {
      return `## Leitura do contexto

Investir faz mais sentido quando existe uma base mínima de estrutura. Sem isso, o investimento pode virar tentativa de compensar um sistema ainda desorganizado.

## Padrão possível

Muita gente procura rendimento antes de organizar caixa, reserva e horizonte de uso do dinheiro.

## Impacto ao longo do tempo

Juros compostos podem ajudar a construir patrimônio, mas também cobram caro quando aparecem em dívidas. Tempo, constância, risco e liquidez andam juntos.

## Direcionamento leve

Uma ordem saudável costuma ser: \`reserva\`, \`entender renda fixa\`, \`inflação\`, \`perfil de risco\` e \`diversificação\`. Se quiser, eu monto essa trilha no seu nível.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    if (lowerMsg.includes('aposentadoria') || lowerMsg.includes('longo prazo')) {
      return `## Leitura do contexto

Aposentadoria é menos sobre parar e mais sobre sustentar um padrão de vida futuro sem depender de improviso.

## Padrão possível

Quando o presente já está pressionado, o longo prazo tende a ficar sempre adiado.

## Impacto ao longo do tempo

Clareza de padrão desejado, fontes de renda e consistência de aporte importam mais do que pressa. O risco costuma estar em empurrar essa construção para depois.

## Direcionamento leve

Vale começar medindo quanto custa seu estilo de vida essencial hoje e qual parte dele você precisará sustentar no futuro.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
    }

    return `## Como eu posso atuar aqui

Eu respondo como agente do **Custo do Hábito**: leio contexto, identifico padrões, explico impactos estruturais e ajudo você a enxergar custos invisíveis da rotina.

## Temas em que posso te apoiar

- Pressão financeira e sensação de que o dinheiro some
- Padrão de vida e custo de manutenção
- Hábitos, consumo e recorrências invisíveis
- Orçamento, dívidas, reserva e primeiros investimentos
- Metas financeiras com mais clareza estrutural

## Direcionamento leve

Se quiser, comece me dizendo uma situação concreta da sua rotina financeira e eu leio o padrão com você.

Isto é conteúdo educacional e não substitui aconselhamento financeiro individual.`;
  }
}
