/**
 * bible-api.js
 * Serviço para buscar textos bíblicos de APIs externas.
 * Fonte principal: bible-api.com (Almeida - português)
 * Utiliza cache local para evitar requisições repetidas.
 */

// Cache de capítulos já carregados (evita requisições repetidas)
const chapterCache = new Map();

/**
 * Mapeamento de nomes de livros em português para o formato da API.
 * A API bible-api.com usa abreviações ou nomes em inglês/padrão.
 */
const bookMapping = {
    'Gênesis': 'gn', 'Êxodo': 'ex', 'Levítico': 'lv', 'Números': 'nm',
    'Deuteronômio': 'dt', 'Josué': 'js', 'Juízes': 'jz', 'Rute': 'rt',
    '1 Samuel': '1sm', '2 Samuel': '2sm', '1 Reis': '1rs', '2 Reis': '2rs',
    '1 Crônicas': '1cr', '2 Crônicas': '2cr', 'Esdras': 'ed', 'Neemias': 'ne',
    'Ester': 'et', 'Jó': 'job', 'Salmos': 'sl', 'Provérbios': 'pv',
    'Eclesiastes': 'ec', 'Cântico dos Cânticos': 'ct', 'Isaías': 'is',
    'Jeremias': 'jr', 'Lamentações': 'lm', 'Ezequiel': 'ez', 'Daniel': 'dn',
    'Oseias': 'os', 'Joel': 'jl', 'Amós': 'am', 'Obadias': 'ob',
    'Jonas': 'jn', 'Miqueias': 'mq', 'Naum': 'na', 'Habacuque': 'hc',
    'Sofonias': 'sf', 'Ageu': 'ag', 'Zacarias': 'zc', 'Malaquias': 'ml',
    'Mateus': 'mt', 'Marcos': 'mc', 'Lucas': 'lc', 'João': 'jo',
    'Atos': 'at', 'Romanos': 'rm', '1 Coríntios': '1co', '2 Coríntios': '2co',
    'Gálatas': 'gl', 'Efésios': 'ef', 'Filipenses': 'fp', 'Colossenses': 'cl',
    '1 Tessalonicenses': '1ts', '2 Tessalonicenses': '2ts',
    '1 Timóteo': '1tm', '2 Timóteo': '2tm', 'Tito': 'tt', 'Filemom': 'fm',
    'Hebreus': 'hb', 'Tiago': 'tg', '1 Pedro': '1pe', '2 Pedro': '2pe',
    '1 João': '1jo', '2 João': '2jo', '3 João': '3jo', 'Judas': 'jd',
    'Apocalipse': 'ap',

    // --- Deuterocanônicos / Apócrifos ---
    'Tobias': 'tb', 'Judite': 'jdt', '1 Macabeus': '1mc', '2 Macabeus': '2mc',
    'Sabedoria': 'sb', 'Eclesiástico (Sirácida)': 'eclo',
    'Baruc': 'br', 'Carta de Jeremias': 'cjr',
    'Adições a Ester': 'adet', 'Adições a Daniel': 'addn',
    'Oração de Manassés': 'ormn',
    '3 Esdras': '3ed', '4 Esdras': '4ed',
    '3 Macabeus': '3mc', '4 Macabeus': '4mc',

    // --- Pseudoepígrafos ---
    'Livro de Enoque': 'en', 'Jubileus': 'jub',
    'Apocalipse de Abraão': 'apab', 'Apocalipse de Adão': 'apad',
    'Apocalipse de Elias': 'apel', 'Apocalipse de Daniel': 'apdn',
    'Testamento dos Doze Patriarcas': 't12p', 'Testamento de Jó': 'tjo',
    'Testamento de Abraão': 'tab', 'Testamento de Isaac': 'tis',
    'Testamento de Jacó': 'tjc', 'Testamento de Moisés': 'tmo',
    'Testamento de Salomão': 'tsl', 'Testamento de Adão': 'tad',
    'Vida de Adão e Eva': 'vadev', 'Martírio e Ascensão de Isaías': 'mais',
    'José e Asenate': 'jas', 'Carta de Aristeias': 'car',
    'Pseudo-Filo': 'psfl', 'Janes e Jambres': 'jnjb',
    'História dos Recabitas': 'hrec'
};

/**
 * Busca o texto de um capítulo bíblico.
 * Tenta a API bible-api.com, com fallback para Groq IA.
 * @param {string} bookName - Nome do livro em português
 * @param {number} chapter - Número do capítulo
 * @returns {Promise<{verses: Array, source: string}>} Versículos e fonte
 */
export async function fetchChapter(bookName, chapter) {
    // Verificar cache primeiro
    const cacheKey = `${bookName}_${chapter}`;
    if (chapterCache.has(cacheKey)) {
        console.log(`📋 Cache hit: ${cacheKey}`);
        return chapterCache.get(cacheKey);
    }

    try {
        // Tentar API bible-api.com (Almeida - português)
        const result = await fetchFromBibleAPI(bookName, chapter);
        chapterCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.warn('⚠️ API bible-api.com falhou:', error.message);

        try {
            // Fallback: Tentar pedir para o Groq
            const result = await fetchFromGroq(bookName, chapter);
            chapterCache.set(cacheKey, result);
            return result;
        } catch (groqError) {
            console.error('❌ Fallback Groq também falhou:', groqError.message);
            throw new Error(`Não foi possível carregar ${bookName} ${chapter}. Verifique sua conexão.`);
        }
    }
}

/**
 * Busca texto na API bible-api.com (versão Almeida em português).
 * @param {string} bookName - Nome do livro
 * @param {number} chapter - Número do capítulo
 * @returns {Promise<{verses: Array, source: string}>}
 */
async function fetchFromBibleAPI(bookName, chapter) {
    const abbr = bookMapping[bookName];
    if (!abbr) throw new Error(`Livro não encontrado: ${bookName}`);

    // A API bible-api.com aceita referências no formato "abreviação+capítulo"
    const url = `https://bible-api.com/${abbr}+${chapter}?translation=almeida`;

    console.log(`📡 Buscando: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API retornou status ${response.status}`);
    }

    const data = await response.json();

    if (!data.verses || data.verses.length === 0) {
        throw new Error('Nenhum versículo retornado');
    }

    // Formatar versículos no padrão do app
    const verses = data.verses.map(v => ({
        number: v.verse,
        text: v.text.trim()
    }));

    return {
        verses,
        source: 'Almeida (via bible-api.com)',
        bookName,
        chapter
    };
}

/**
 * Busca texto via IA Groq como fallback.
 * Útil quando a API externa está indisponível.
 * @param {string} bookName - Nome do livro
 * @param {number} chapter - Número do capítulo
 * @returns {Promise<{verses: Array, source: string}>}
 */
async function fetchFromGroq(bookName, chapter) {
    const p1 = import.meta.env.VITE_GROQ_PART1 || '';
    const p2 = import.meta.env.VITE_GROQ_PART2 || '';
    const p3 = import.meta.env.VITE_GROQ_PART3 || '';
    const p4 = import.meta.env.VITE_GROQ_PART4 || '';
    const p5 = import.meta.env.VITE_GROQ_PART5 || '';
    const p6 = import.meta.env.VITE_GROQ_PART6 || '';
    const p7 = import.meta.env.VITE_GROQ_PART7 || '';
    let envKey = p1 + p2 + p3 + p4 + p5 + p6 + p7;

    const apiKey = envKey || localStorage.getItem('groq_api_key');
    if (!apiKey || apiKey.length < 10) {
        throw new Error('Chave da API Groq não configurada para fallback');
    }

    const prompt = `Escreva o texto completo de ${bookName} capítulo ${chapter} da Bíblia.
Retorne APENAS no formato JSON, sem markdown, sem explicação, assim:
{"verses": [{"number": 1, "text": "texto do versículo"}, {"number": 2, "text": "texto"}]}
Use a tradução mais próxima da Nova Versão Transformadora (NVT) possível.
Retorne TODOS os versículos do capítulo, sem exceção.`;

    const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

    for (const model of models) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 8192,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) continue;

            const data = await response.json();
            const textContent = data?.choices?.[0]?.message?.content;

            if (!textContent) continue;

            // Parser o JSON da resposta
            const parsed = JSON.parse(textContent);

            if (parsed.verses && parsed.verses.length > 0) {
                return {
                    verses: parsed.verses,
                    source: 'NVT (via IA Groq)',
                    bookName,
                    chapter
                };
            }
        } catch (e) {
            continue;
        }
    }

    throw new Error('Groq não conseguiu gerar o texto');
}

/**
 * Limpa todo o cache de capítulos.
 */
export function clearBibleCache() {
    chapterCache.clear();
}
