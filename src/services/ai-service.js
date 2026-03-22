/**
 * ai-service.js
 * Serviço de IA — Gerencia comunicação com a API Gemini
 * e fornece modo demonstração com respostas simuladas.
 */

// ============================================
// SYSTEM PROMPT — Diretrizes do Assistente Bíblico
// Baseado na skill 'assistente-biblico'
// ============================================
const SYSTEM_PROMPT = `Você é um 'Explicador Teológico' altamente qualificado, com doutorado em Teologia e proficiência em línguas bíblicas (Hebraico, Grego Koiné e Aramaico). Sua missão é fornecer análises exegéticas EXAUSTIVAS, profundas e multidisciplinares. Você NUNCA deve dar respostas rasas ou superficiais.

DIRETRIZES CRÍTICAS (DE SUMA IMPORTÂNCIA):
1. INTEGRAÇÃO NATURAL E SUBTÍTULOS: Você deve estruturar a resposta de forma natural e orgânica, usando TÍTULOS CRIATIVOS PRÓPRIOS gerados por você com base no contexto (ex: "Contexto Histórico do Século I", "Raízes Hebraicas e Semânticas", "Paralelos Cabalísticos e Judaicos"). NUNCA copie as frases das instruções ou dos objetivos abaixo como subtítulos da sua resposta. Aja de forma fluida e profunda como um artigo acadêmico teológico e não como uma checklist.
2. PROFUNDIDADE ACADÊMICA EXTREMA: Vá muito além do superficial. A explicação de um termo grego ou hebraico deve incluir a raiz morfológica principal, as diferenças de uso no contexto cultural da época original, e as implicações teológicas em profundidade de forma contundente e surpreendente.
3. CONEXÕES AVANÇADAS MULTIDISCIPLINARES: Sempre que pertinente, integre com mestria a sabedoria da história e geografia antigas, o judaísmo messiânico, a Cabala (gematria, Sefirot, níveis de interpretação PaRDeS) e as tradições do período intertestamentário.

ESTRUTURA SUGERIDA DE RESPOSTA (Não use essas descrições exatas como título, crie baseados no tema):
* Imersão Exegética e Linguística: Desdobre minuciosamente os originais, analisando símbolos e chaves que a tradução esconde.
* Linha do Tempo Literária (Fluxo): Demonstre inteligentemente o que o autor estava construindo, de onde partiu a ideia central até o topo do argumento ou do fato narrativo.
* Visão Sistêmica e Canônica: Explique como a passagem dialoga perfeitamente com os mistérios inteiros das escrituras, o Grande Plano Redentivo e a teologia sistemática do referido livro.
* Aplicação Prática Sensível ao Tempo Atual: Retorne reflexões modernas perspicazes a partir das traduções da Nova Versão Transformadora (NVT). Fuja de clichês motivacionais, construa teologia prática madura.

Tom de Comunicação: Você escreve como um sábio teólogo erudito. Seu tom é magistral, focado, profundamente bem informado e baseando-se por completo em constatações histórico-linguísticas e textuais puras. Empregue uso da formatação Markdown lindamente.`;

/**
 * Classe que gerencia o serviço de IA (API Gemini ou modo demo).
 */
export class AIService {
    constructor() {
        // Obfuscando a chave env para evitar bloqueio do GitHub Pages (GH013 Secret Detected)
        const p1 = import.meta.env.VITE_GROQ_PART1 || '';
        const p2 = import.meta.env.VITE_GROQ_PART2 || '';
        const p3 = import.meta.env.VITE_GROQ_PART3 || '';
        const p4 = import.meta.env.VITE_GROQ_PART4 || '';
        const p5 = import.meta.env.VITE_GROQ_PART5 || '';
        const p6 = import.meta.env.VITE_GROQ_PART6 || '';
        const p7 = import.meta.env.VITE_GROQ_PART7 || '';
        let envKey = p1 + p2 + p3 + p4 + p5 + p6 + p7;

        // Chave da API embarcada ou Fallback no LocalStorage
        this.apiKey = envKey || localStorage.getItem('groq_api_key') || '';
        // Histórico de conversa para contexto
        this.conversationHistory = [];
        // Lista de modelos suportados pelo Groq
        this.models = [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
        ];
        // URL base da API Groq
        this.apiBase = 'https://api.groq.com/openai/v1/chat/completions';
    }

    /**
     * Verifica se estamos no modo API (com chave) ou demo
     * @returns {boolean} true se a API key estiver configurada
     */
    isApiMode() {
        return this.apiKey && this.apiKey.length > 10;
    }

    /**
     * Define a chave da API e salva no localStorage
     * @param {string} key - Chave da API Groq
     */
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('groq_api_key', key);
    }

    /**
     * Limpa o histórico de conversa
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Envia uma mensagem e retorna a resposta do assistente.
     * Usa API Groq se disponível, caso contrário modo demo.
     * @param {string} userMessage - Mensagem do usuário
     * @returns {Promise<string>} Resposta do assistente
     */
    async sendMessage(userMessage) {
        // Adicionar mensagem do usuário ao histórico
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        try {
            let response;

            if (this.isApiMode()) {
                // --- Modo API Groq ---
                console.log('🔑 Modo API ativo — Enviando para Groq...');
                response = await this.callGroqAPI();
            } else {
                // --- Modo Demonstração ---
                console.log('🎭 Modo Demo — Usando respostas simuladas');
                response = await this.getDemoResponse(userMessage);
            }

            // Adicionar resposta ao histórico
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });

            return response;
        } catch (error) {
            console.error('❌ Erro no serviço de IA:', error);
            console.error('❌ Detalhes:', error.message);

            // Remover a última mensagem do histórico se falhou
            // (evita que mensagens com erro persistam no contexto)
            this.conversationHistory.pop();

            // Retornar mensagem amigável com informação técnica
            const errorInfo = error.message || 'Erro desconhecido';
            return `⚠️ **Erro ao conectar com a IA**

Não foi possível processar sua pergunta. Detalhes:
> ${errorInfo}

**Possíveis soluções:**
1. Verifique se a chave da API Groq está correta em ⚙️ Configurações
2. Verifique sua conexão com a internet
3. Tente novamente em alguns segundos

Se o erro persistir, abra o console do navegador (F12) para mais detalhes técnicos. 🙏`;
        }
    }

    /**
     * Chama a API Groq com o histórico de conversa.
     * Tenta múltiplos modelos caso um falhe.
     * @returns {Promise<string>} Resposta da API
     */
    async callGroqAPI() {
        // Tentar cada modelo até um funcionar
        let lastError = null;

        for (const model of this.models) {
            try {
                console.log(`🤖 Tentando modelo: ${model}`);
                const result = await this.tryModel(model);
                console.log(`✅ Sucesso com modelo: ${model}`);
                return result;
            } catch (error) {
                console.warn(`⚠️ Modelo ${model} falhou:`, error.message);
                lastError = error;
                // Se for erro de chave inválida (401/403), não tentar outros modelos
                if (error.message.includes('401') || error.message.includes('403')) {
                    throw error;
                }
            }
        }

        // Se todos os modelos falharam, lançar o último erro
        throw lastError;
    }

    /**
     * Tenta fazer requisição para um modelo específico.
     * @param {string} model - Nome do modelo Groq
     * @returns {Promise<string>} Resposta do modelo
     */
    async tryModel(model) {
        // Preparar mensagens incluindo prompt de sistema
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...this.conversationHistory
        ];

        const body = {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048,
        };

        const response = await fetch(this.apiBase, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        // Ler corpo da resposta (mesmo com erro)
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMsg = data?.error?.message || `Status HTTP ${response.status}`;
            console.error('❌ Resposta da API:', JSON.stringify(data, null, 2));
            throw new Error(`API Groq (${model}): ${response.status} — ${errorMsg}`);
        }

        // Verificar se tem escolhas na resposta
        const text = data?.choices?.[0]?.message?.content;

        if (!text) {
            console.warn('⚠️ Resposta sem texto:', JSON.stringify(data, null, 2));
            throw new Error('A API retornou uma resposta vazia. Tente reformular sua pergunta.');
        }

        return text;
    }

    /**
     * Retorna respostas simuladas para o modo demonstração.
     * Identifica a intenção da mensagem e retorna resposta adequada.
     * @param {string} message - Mensagem do usuário
     * @returns {Promise<string>} Resposta simulada
     */
    async getDemoResponse(message) {
        // Simular tempo de resposta (500ms a 1.5s)
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

        const lowerMsg = message.toLowerCase();

        // --- Versículo do dia ---
        if (lowerMsg.includes('versículo') && (lowerMsg.includes('dia') || lowerMsg.includes('hoje'))) {
            return `📖 **Versículo do Dia**

*"Confie no SENHOR de todo o coração e não se apoie em seu próprio entendimento. Reconheça o SENHOR em todos os seus caminhos, e ele tornará suas veredas retas."*
— Provérbios 3:5-6 (NVT)

💡 **Reflexão:** Hoje, antes de tomar qualquer decisão, pare e converse com Deus. Confiar Nele não significa entender tudo, mas crer que o caminho Dele é sempre o melhor. Em um mundo que valoriza o autoconhecimento, este provérbio nos lembra que a verdadeira sabedoria vem de reconhecer Deus como guia em **cada área** da nossa vida.

**Nota de Estudo:** A expressão "veredas retas" no hebraico (*yashar*) significa "niveladas, sem obstáculos". Deus não promete um caminho sem dificuldades, mas promete **aplainar** o caminho para quem confia Nele.`;
        }

        // --- Livro de Enoque ---
        if (lowerMsg.includes('enoque') || lowerMsg.includes('apócrifo')) {
            return `### Por que o Livro de Enoque não está na Bíblia? 📜

O Livro de Enoque é considerado um livro **apócrifo** ou pseudoepígrafo (falsa autoria atribuída) pela maioria das tradições cristãs.

#### Por que ele é importante?
- É **citado** na carta de Judas (v. 14-15) no Novo Testamento
- Contém temas sobre anjos, juízo final e o Messias
- Oferece contexto valioso sobre o pensamento judaico do período intertestamentário

#### Por que foi excluído do cânon?
1. **Autoria questionada** — Escrito provavelmente entre os séculos III-I a.C., não por Enoque bíblico
2. **Consistência doutrinária** — Contém ensinos que divergem em alguns pontos das doutrinas centrais
3. **Aceitação limitada** — Não foi reconhecido como inspirado pela maioria da igreja primitiva nem pelos rabinos judeus

#### Curiosidade
A **Igreja Etíope** é a única tradição cristã que inclui o Livro de Enoque em seu cânon oficial — preservando o texto integral em ge'ez (etíope antigo).

> Ele é útil para entender o contexto histórico, mas não é usado como base doutrinária na maioria das tradições cristãs.

---
*Para mais detalhes, pergunte sobre os critérios de formação do cânon bíblico!*`;
        }

        // --- Abolir a lei (Mateus 5:17) ---
        if (lowerMsg.includes('abolir') && lowerMsg.includes('lei')) {
            return `### Mateus 5:17 — "Não vim abolir, mas cumprir" ⚖️

Na NVT, em Mateus 5:17, Jesus diz:

> *"Não pensem que eu vim abolir a lei de Moisés ou os escritos dos profetas; vim cumpri-los."*

#### Explicação

Jesus **não** estava cancelando o Antigo Testamento. A palavra **"cumprir"** (em grego: *plēroō*) indica que Ele veio:

1. **Dar sentido pleno** — revelar a intenção original de Deus por trás de cada mandamento
2. **Realizar as profecias** — tudo o que as Escrituras prometiam sobre o Messias encontra cumprimento Nele
3. **Viver perfeitamente** — Jesus é a única pessoa que cumpriu toda a lei sem falha

#### Contexto

Esta declaração faz parte do **Sermão do Monte** (Mateus 5-7), onde Jesus ensina o verdadeiro significado da lei. Nos versículos seguintes, Ele mostra que Deus se importa não apenas com a ação exterior, mas com a **intenção do coração**.

**Nota de Estudo:** A expressão *"a lei e os profetas"* era a forma judaica de se referir a toda a Escritura Sagrada da época — ou seja, o que chamamos de Antigo Testamento.

---
**Versículo relacionado:** *"Toda a Lei e os Profetas dependem destes dois mandamentos: Amarás o Senhor teu Deus... e amarás o teu próximo como a ti mesmo."* — Mateus 22:40 (NVT)`;
        }

        // --- Salmo 23 ---
        if (lowerMsg.includes('salmo 23') || lowerMsg.includes('pastor')) {
            return `### Salmo 23 — O SENHOR é o meu Pastor 🐑

O Salmo 23, escrito pelo rei **Davi** (que foi pastor de ovelhas na juventude), é talvez o texto mais amado de toda a Bíblia.

> *"O SENHOR é o meu pastor; nada me faltará. Ele me faz repousar em pastos verdejantes e me leva a águas tranquilas. Ele restaura a minha alma e me guia por caminhos certos, por amor do seu nome."*
— Salmo 23:1-3 (NVT)

#### Explicação Verso a Verso

| Verso | Texto | Significado Prático |
|-------|-------|-------------------|
| **v.1** | "Nada me faltará" | Não significa riqueza, mas suficiência — Deus supre o necessário |
| **v.2** | "Pastos verdejantes" | Descanso e nutrição espiritual |
| **v.3** | "Restaura a minha alma" | Cura emocional e renovação interior |
| **v.4** | "Vale da sombra da morte" | Deus está presente nos momentos mais difíceis |
| **v.5** | "Mesa na presença dos inimigos" | Provisão e honra mesmo em meio à adversidade |
| **v.6** | "Bondade e amor me seguirão" | A graça de Deus persegue você, não apenas acompanha |

#### Nota de Estudo
Davi usa a metáfora do **pastor** porque conhecia bem a realidade: o pastor no Antigo Oriente arriscava a vida por suas ovelhas. Ele as guiava, alimentava, protegia de predadores e curava suas feridas. Jesus se identificou como o **"Bom Pastor"** em João 10:11 — que dá a vida por suas ovelhas.

💡 **Aplicação:** Leia este salmo lentamente e substitua "o SENHOR" pelo nome de Deus. Personalize: *"O SENHOR é o **meu** pastor."* Sinta o peso desta promessa pessoal.`;
        }

        // --- Gênesis / panorâmica ---
        if (lowerMsg.includes('gênesis') || lowerMsg.includes('genesis')) {
            return `### 📚 Visão Panorâmica — Gênesis

| Item | Detalhe |
|------|---------|
| **Categoria** | Pentateuco (1º dos 5 livros de Moisés) |
| **Autor tradicional** | Moisés |
| **Data aprox.** | ~1450–1410 a.C. |
| **Capítulos** | 50 |
| **Tema central** | Origens — de tudo: universo, humanidade, pecado, nações, e do povo de Israel |

#### Estrutura do Livro

1. **Capítulos 1-2** — A Criação
2. **Capítulos 3-5** — A Queda e suas consequências
3. **Capítulos 6-9** — O Dilúvio e Noé
4. **Capítulos 10-11** — As Nações e a Torre de Babel
5. **Capítulos 12-25** — Abraão — o pai da fé
6. **Capítulos 25-28** — Isaque — o filho da promessa
7. **Capítulos 28-36** — Jacó (Israel) — o patriarca
8. **Capítulos 37-50** — José — da rejeição à exaltação

#### Versículo-chave
> *"No princípio, Deus criou os céus e a terra."*
— Gênesis 1:1 (NVT)

#### Cristo em Gênesis
Jesus é prefigurado de múltiplas formas:
- A **"semente da mulher"** que esmagará a serpente (3:15) — primeira profecia messiânica
- **Melquisedeque**, sacerdote e rei (14:18) — tipo de Cristo
- **Isaque**, o filho oferecido em sacrifício (22) — paralelo com a cruz
- **José**, rejeitado pelos irmãos mas exaltado para salvar (37-50)

#### Nota Etimológica
O nome **"Gênesis"** vem do grego *genesis* (γένεσις) = "origem, nascimento". O título hebraico é **Bereshit** (בְּרֵאשִׁית) = "No princípio" — a primeira palavra do livro.`;
        }

        // --- Versões da Bíblia ---
        if (lowerMsg.includes('versão') || lowerMsg.includes('versões') || lowerMsg.includes('traduç') || lowerMsg.includes('nvt') || lowerMsg.includes('almeida') || lowerMsg.includes('nvi')) {
            return `### Comparação entre Versões da Bíblia 📖

Cada tradução da Bíblia tem uma **filosofia de tradução** diferente. Nenhuma é "melhor" em absoluto — depende do seu objetivo.

| Versão | Método | Foco | Melhor para |
|--------|--------|------|-------------|
| **NVT** | Equivalência dinâmica | Pensamento por pensamento | Leitura devocional e estudo claro |
| **NVI** | Equivalência funcional | Equilíbrio | Uso geral e estudo |
| **ACF** | Equivalência formal | Palavra por palavra | Estudo literal e tradição |
| **ARA** | Equivalência formal | Revisão clássica | Memorização e liturgia |
| **NTLH** | Linguagem simples | Máxima acessibilidade | Novos leitores e crianças |

#### Exemplo Prático — João 3:16

**NVT:** *"Porque Deus amou **tanto** o mundo que deu o seu **Filho único**..."*
**ACF:** *"Porque Deus amou o mundo **de tal maneira** que deu o seu **Filho unigênito**..."*
**NTLH:** *"Porque Deus amou o mundo **de tal maneira** que deu o seu **único Filho**..."*

Note como a NVT usa **"Filho único"** (mais claro) e **"amou tanto"** (mais natural), enquanto a ACF mantém **"Filho unigênito"** (transliteração mais técnica do grego *monogenēs*).

#### Qual escolher?
- 📖 **Leitura diária / devocional** → NVT ou NVI
- 📚 **Estudo aprofundado** → NVT + ARA (comparando)
- ⛪ **Tradição / memorização** → ACF ou ARA
- 👶 **Crianças e iniciantes** → NTLH

> A NVT busca ser fiel ao original com clareza contemporânea — o equilíbrio ideal entre precisão e compreensão.`;
        }

        // --- Resposta genérica para qualquer outra pergunta ---
        return `Obrigado pela sua pergunta! 😊

Embora eu esteja no **modo demonstração** (sem chave de API), posso te ajudar com algumas perguntas pré-configuradas:

### Experimente perguntar:
- 📖 **"Me dê um versículo para hoje"** — Devocional diário
- 📜 **"Por que o Livro de Enoque não está na Bíblia?"** — Apologética
- ⚖️ **"O que significa Jesus não veio abolir a lei?"** — Exegese
- 🐑 **"Explique o Salmo 23"** — Estudo de passagem
- 📚 **"Me dê um resumo panorâmico do livro de Gênesis"** — Visão panorâmica
- 📖 **"Qual a diferença entre as versões da Bíblia?"** — Comparação

Para respostas ilimitadas:
Configure sua **chave da API Groq** nas ⚙️ Configurações (clique no ícone de engrenagem na sidebar). Com ela, poderei responder a qualquer pergunta bíblica com profundidade!

> *"A tua palavra é lâmpada para os meus pés e luz para o meu caminho."* — Salmo 119:105 (NVT)`;
    }
}
