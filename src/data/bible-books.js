/**
 * bible-books.js
 * Dados estruturados dos livros da Bíblia (AT e NT)
 * e versículos selecionados para o módulo devocional.
 */

// ============================================
// LIVROS DO ANTIGO TESTAMENTO (39 livros)
// ============================================
export const oldTestament = [
    // --- Pentateuco ---
    { name: 'Gênesis', abbr: 'Gn', chapters: 50, category: 'Pentateuco' },
    { name: 'Êxodo', abbr: 'Êx', chapters: 40, category: 'Pentateuco' },
    { name: 'Levítico', abbr: 'Lv', chapters: 27, category: 'Pentateuco' },
    { name: 'Números', abbr: 'Nm', chapters: 36, category: 'Pentateuco' },
    { name: 'Deuteronômio', abbr: 'Dt', chapters: 34, category: 'Pentateuco' },

    // --- Históricos ---
    { name: 'Josué', abbr: 'Js', chapters: 24, category: 'Históricos' },
    { name: 'Juízes', abbr: 'Jz', chapters: 21, category: 'Históricos' },
    { name: 'Rute', abbr: 'Rt', chapters: 4, category: 'Históricos' },
    { name: '1 Samuel', abbr: '1Sm', chapters: 31, category: 'Históricos' },
    { name: '2 Samuel', abbr: '2Sm', chapters: 24, category: 'Históricos' },
    { name: '1 Reis', abbr: '1Rs', chapters: 22, category: 'Históricos' },
    { name: '2 Reis', abbr: '2Rs', chapters: 25, category: 'Históricos' },
    { name: '1 Crônicas', abbr: '1Cr', chapters: 29, category: 'Históricos' },
    { name: '2 Crônicas', abbr: '2Cr', chapters: 36, category: 'Históricos' },
    { name: 'Esdras', abbr: 'Ed', chapters: 10, category: 'Históricos' },
    { name: 'Neemias', abbr: 'Ne', chapters: 13, category: 'Históricos' },
    { name: 'Ester', abbr: 'Et', chapters: 10, category: 'Históricos' },

    // --- Poéticos ---
    { name: 'Jó', abbr: 'Jó', chapters: 42, category: 'Poéticos' },
    { name: 'Salmos', abbr: 'Sl', chapters: 150, category: 'Poéticos' },
    { name: 'Provérbios', abbr: 'Pv', chapters: 31, category: 'Poéticos' },
    { name: 'Eclesiastes', abbr: 'Ec', chapters: 12, category: 'Poéticos' },
    { name: 'Cântico dos Cânticos', abbr: 'Ct', chapters: 8, category: 'Poéticos' },

    // --- Profetas Maiores ---
    { name: 'Isaías', abbr: 'Is', chapters: 66, category: 'Profetas Maiores' },
    { name: 'Jeremias', abbr: 'Jr', chapters: 52, category: 'Profetas Maiores' },
    { name: 'Lamentações', abbr: 'Lm', chapters: 5, category: 'Profetas Maiores' },
    { name: 'Ezequiel', abbr: 'Ez', chapters: 48, category: 'Profetas Maiores' },
    { name: 'Daniel', abbr: 'Dn', chapters: 12, category: 'Profetas Maiores' },

    // --- Profetas Menores ---
    { name: 'Oseias', abbr: 'Os', chapters: 14, category: 'Profetas Menores' },
    { name: 'Joel', abbr: 'Jl', chapters: 3, category: 'Profetas Menores' },
    { name: 'Amós', abbr: 'Am', chapters: 9, category: 'Profetas Menores' },
    { name: 'Obadias', abbr: 'Ob', chapters: 1, category: 'Profetas Menores' },
    { name: 'Jonas', abbr: 'Jn', chapters: 4, category: 'Profetas Menores' },
    { name: 'Miqueias', abbr: 'Mq', chapters: 7, category: 'Profetas Menores' },
    { name: 'Naum', abbr: 'Na', chapters: 3, category: 'Profetas Menores' },
    { name: 'Habacuque', abbr: 'Hc', chapters: 3, category: 'Profetas Menores' },
    { name: 'Sofonias', abbr: 'Sf', chapters: 3, category: 'Profetas Menores' },
    { name: 'Ageu', abbr: 'Ag', chapters: 2, category: 'Profetas Menores' },
    { name: 'Zacarias', abbr: 'Zc', chapters: 14, category: 'Profetas Menores' },
    { name: 'Malaquias', abbr: 'Ml', chapters: 4, category: 'Profetas Menores' },
];

// ============================================
// LIVROS DO NOVO TESTAMENTO (27 livros)
// ============================================
export const newTestament = [
    // --- Evangelhos ---
    { name: 'Mateus', abbr: 'Mt', chapters: 28, category: 'Evangelhos' },
    { name: 'Marcos', abbr: 'Mc', chapters: 16, category: 'Evangelhos' },
    { name: 'Lucas', abbr: 'Lc', chapters: 24, category: 'Evangelhos' },
    { name: 'João', abbr: 'Jo', chapters: 21, category: 'Evangelhos' },

    // --- Histórico ---
    { name: 'Atos', abbr: 'At', chapters: 28, category: 'Histórico' },

    // --- Epístolas Paulinas ---
    { name: 'Romanos', abbr: 'Rm', chapters: 16, category: 'Epístolas Paulinas' },
    { name: '1 Coríntios', abbr: '1Co', chapters: 16, category: 'Epístolas Paulinas' },
    { name: '2 Coríntios', abbr: '2Co', chapters: 13, category: 'Epístolas Paulinas' },
    { name: 'Gálatas', abbr: 'Gl', chapters: 6, category: 'Epístolas Paulinas' },
    { name: 'Efésios', abbr: 'Ef', chapters: 6, category: 'Epístolas Paulinas' },
    { name: 'Filipenses', abbr: 'Fp', chapters: 4, category: 'Epístolas Paulinas' },
    { name: 'Colossenses', abbr: 'Cl', chapters: 4, category: 'Epístolas Paulinas' },
    { name: '1 Tessalonicenses', abbr: '1Ts', chapters: 5, category: 'Epístolas Paulinas' },
    { name: '2 Tessalonicenses', abbr: '2Ts', chapters: 3, category: 'Epístolas Paulinas' },
    { name: '1 Timóteo', abbr: '1Tm', chapters: 6, category: 'Epístolas Paulinas' },
    { name: '2 Timóteo', abbr: '2Tm', chapters: 4, category: 'Epístolas Paulinas' },
    { name: 'Tito', abbr: 'Tt', chapters: 3, category: 'Epístolas Paulinas' },
    { name: 'Filemom', abbr: 'Fm', chapters: 1, category: 'Epístolas Paulinas' },

    // --- Epístolas Gerais ---
    { name: 'Hebreus', abbr: 'Hb', chapters: 13, category: 'Epístolas Gerais' },
    { name: 'Tiago', abbr: 'Tg', chapters: 5, category: 'Epístolas Gerais' },
    { name: '1 Pedro', abbr: '1Pe', chapters: 5, category: 'Epístolas Gerais' },
    { name: '2 Pedro', abbr: '2Pe', chapters: 3, category: 'Epístolas Gerais' },
    { name: '1 João', abbr: '1Jo', chapters: 5, category: 'Epístolas Gerais' },
    { name: '2 João', abbr: '2Jo', chapters: 1, category: 'Epístolas Gerais' },
    { name: '3 João', abbr: '3Jo', chapters: 1, category: 'Epístolas Gerais' },
    { name: 'Judas', abbr: 'Jd', chapters: 1, category: 'Epístolas Gerais' },

    // --- Apocalíptico ---
    { name: 'Apocalipse', abbr: 'Ap', chapters: 22, category: 'Apocalíptico' },
];

// ============================================
// LIVROS DEUTEROCANÔNICOS / APÓCRIFOS (15 livros)
// Presentes na Bíblia Católica e Ortodoxa
// ============================================
export const deuterocanonicalBooks = [
    // --- Históricos ---
    { name: 'Tobias', abbr: 'Tb', chapters: 14, category: 'Históricos' },
    { name: 'Judite', abbr: 'Jdt', chapters: 16, category: 'Históricos' },
    { name: '1 Macabeus', abbr: '1Mc', chapters: 16, category: 'Históricos' },
    { name: '2 Macabeus', abbr: '2Mc', chapters: 15, category: 'Históricos' },

    // --- Sapienciais ---
    { name: 'Sabedoria', abbr: 'Sb', chapters: 19, category: 'Sapienciais' },
    { name: 'Eclesiástico (Sirácida)', abbr: 'Eclo', chapters: 51, category: 'Sapienciais' },

    // --- Proféticos ---
    { name: 'Baruc', abbr: 'Br', chapters: 6, category: 'Proféticos' },
    { name: 'Carta de Jeremias', abbr: 'CJr', chapters: 1, category: 'Proféticos' },

    // --- Adições a livros canônicos ---
    { name: 'Adições a Ester', abbr: 'AdEt', chapters: 7, category: 'Adições' },
    { name: 'Adições a Daniel', abbr: 'AdDn', chapters: 3, category: 'Adições' },
    { name: 'Oração de Manassés', abbr: 'OrMn', chapters: 1, category: 'Adições' },

    // --- Livros Ortodoxos (extras) ---
    { name: '3 Esdras', abbr: '3Ed', chapters: 9, category: 'Tradição Ortodoxa' },
    { name: '4 Esdras', abbr: '4Ed', chapters: 16, category: 'Tradição Ortodoxa' },
    { name: '3 Macabeus', abbr: '3Mc', chapters: 7, category: 'Tradição Ortodoxa' },
    { name: '4 Macabeus', abbr: '4Mc', chapters: 18, category: 'Tradição Ortodoxa' },

    // --- Pseudoepígrafos — Apocalipses ---
    { name: 'Livro de Enoque', abbr: 'En', chapters: 108, category: 'Apocalipses' },
    { name: 'Apocalipse de Abraão', abbr: 'ApAb', chapters: 32, category: 'Apocalipses' },
    { name: 'Apocalipse de Adão', abbr: 'ApAd', chapters: 5, category: 'Apocalipses' },
    { name: 'Apocalipse de Elias', abbr: 'ApEl', chapters: 5, category: 'Apocalipses' },
    { name: 'Apocalipse de Daniel', abbr: 'ApDn', chapters: 14, category: 'Apocalipses' },

    // --- Pseudoepígrafos — Testamentos ---
    { name: 'Testamento dos Doze Patriarcas', abbr: 'T12P', chapters: 12, category: 'Testamentos' },
    { name: 'Testamento de Jó', abbr: 'TJó', chapters: 53, category: 'Testamentos' },
    { name: 'Testamento de Abraão', abbr: 'TAb', chapters: 20, category: 'Testamentos' },
    { name: 'Testamento de Isaac', abbr: 'TIs', chapters: 9, category: 'Testamentos' },
    { name: 'Testamento de Jacó', abbr: 'TJc', chapters: 8, category: 'Testamentos' },
    { name: 'Testamento de Moisés', abbr: 'TMo', chapters: 12, category: 'Testamentos' },
    { name: 'Testamento de Salomão', abbr: 'TSl', chapters: 26, category: 'Testamentos' },
    { name: 'Testamento de Adão', abbr: 'TAd', chapters: 4, category: 'Testamentos' },

    // --- Pseudoepígrafos — Outros ---
    { name: 'Jubileus', abbr: 'Jub', chapters: 50, category: 'Outros Pseudoepígrafos' },
    { name: 'Vida de Adão e Eva', abbr: 'VAdEv', chapters: 51, category: 'Outros Pseudoepígrafos' },
    { name: 'Martírio e Ascensão de Isaías', abbr: 'MAIs', chapters: 11, category: 'Outros Pseudoepígrafos' },
    { name: 'José e Asenate', abbr: 'JAs', chapters: 29, category: 'Outros Pseudoepígrafos' },
    { name: 'Carta de Aristeias', abbr: 'CAr', chapters: 1, category: 'Outros Pseudoepígrafos' },
    { name: 'Pseudo-Filo', abbr: 'PsFl', chapters: 65, category: 'Outros Pseudoepígrafos' },
    { name: 'Janes e Jambres', abbr: 'JnJb', chapters: 2, category: 'Outros Pseudoepígrafos' },
    { name: 'História dos Recabitas', abbr: 'HRec', chapters: 18, category: 'Outros Pseudoepígrafos' },
];

// ============================================
// VERSÍCULOS PARA O DEVOCIONAL DIÁRIO
// Seleção de versículos de conforto, esperança e instrução
// ============================================
export const devotionalVerses = [
    {
        text: 'Confie no SENHOR de todo o coração e não se apoie em seu próprio entendimento. Reconheça o SENHOR em todos os seus caminhos, e ele tornará suas veredas retas.',
        reference: 'Provérbios 3:5-6',
        reflection: 'Hoje, antes de tomar qualquer decisão, pare e converse com Deus. Confiar Nele não significa entender tudo, mas crer que o caminho Dele é sempre o melhor.'
    },
    {
        text: 'Pois eu sei muito bem os planos que tenho para vocês, diz o SENHOR: planos de paz e não de desastre, para lhes dar um futuro e uma esperança.',
        reference: 'Jeremias 29:11',
        reflection: 'Mesmo quando o presente parece incerto, Deus já preparou um caminho de esperança para você. Descanse sabendo que Ele controla o futuro.'
    },
    {
        text: 'O SENHOR é o meu pastor; nada me faltará. Ele me faz repousar em pastos verdejantes, e me leva a águas tranquilas.',
        reference: 'Salmo 23:1-2',
        reflection: 'Permita-se descansar hoje. O Pastor cuida de cada detalhe da sua vida — das necessidades básicas ao repouso da alma.'
    },
    {
        text: 'Não tenha medo, pois eu estou com você. Não fique desanimado, pois eu sou o seu Deus. Fortalecerei você e ajudarei; ampararei com a minha mão direita vitoriosa.',
        reference: 'Isaías 41:10',
        reflection: 'Você não está sozinho(a) em suas batalhas. Deus promete Sua presença, força e amparo para este dia.'
    },
    {
        text: 'Venham a mim, todos vocês que estão cansados e sobrecarregados, e eu lhes darei descanso.',
        reference: 'Mateus 11:28',
        reflection: 'Jesus convida você pessoalmente a entregar o peso. Não é fraqueza buscar descanso — é obediência à voz do Mestre.'
    },
    {
        text: 'Porque Deus amou tanto o mundo que deu o seu Filho único, para que todo aquele que nele crer não pereça, mas tenha a vida eterna.',
        reference: 'João 3:16',
        reflection: 'O amor de Deus não é abstrato — Ele demonstrou na prática, dando o que tinha de mais precioso. Hoje, viva na consciência desse amor.'
    },
    {
        text: 'Entreguem todas as suas preocupações a Deus, pois ele cuida de vocês.',
        reference: '1 Pedro 5:7',
        reflection: '"Lançar" no original grego significa atirar com força para longe. Jogue suas ansiedades em Deus — Ele quer carregá-las por você.'
    },
    {
        text: 'E sabemos que Deus age em todas as coisas para o bem daqueles que o amam, que foram chamados de acordo com o seu propósito.',
        reference: 'Romanos 8:28',
        reflection: 'Nem tudo que acontece é bom, mas Deus é suficientemente poderoso para transformar qualquer situação para o seu bem.'
    },
    {
        text: 'Tudo posso naquele que me fortalece.',
        reference: 'Filipenses 4:13',
        reflection: 'Sua capacidade não está em suas forças, mas no poder de Cristo em você. Vá em frente — Ele é a sua força.'
    },
    {
        text: 'O SENHOR está perto dos que têm o coração quebrantado e salva os que estão com o espírito abatido.',
        reference: 'Salmo 34:18',
        reflection: 'Se o seu coração dói hoje, saiba que Deus está especialmente perto de você. Ele não ignora a sua dor.'
    },
    {
        text: 'Seu amor leal jamais se acaba, e suas misericórdias nunca se esgotam. Elas se renovam cada manhã; grande é a fidelidade do SENHOR!',
        reference: 'Lamentações 3:22-23',
        reflection: 'Cada amanhecer é uma nova porção da misericórdia de Deus. Ontem ficou para trás — hoje Ele oferece graça fresca.'
    },
    {
        text: 'Deleite-se no SENHOR, e ele satisfará os desejos do seu coração.',
        reference: 'Salmo 37:4',
        reflection: 'Quando encontramos nossa alegria em Deus, nossos desejos são transformados para refletir os Dele. É uma troca maravilhosa.'
    },
    {
        text: 'Não se preocupem com coisa alguma; pelo contrário, em tudo, pela oração e súplica, com ações de graças, apresentem seus pedidos a Deus. E a paz de Deus, que excede todo entendimento, guardará o coração e a mente de vocês em Cristo Jesus.',
        reference: 'Filipenses 4:6-7',
        reflection: 'A ansiedade é substituída pela paz quando transformamos preocupação em oração. Experimente agora: entregue algo a Deus em gratidão.'
    },
    {
        text: 'Ensina-nos a contar bem os nossos dias, para que nosso coração alcance sabedoria.',
        reference: 'Salmo 90:12',
        reflection: 'Viver com sabedoria começa quando reconhecemos que cada dia é um presente. Use este dia com propósito e gratidão.'
    },
    {
        text: 'Mas os que esperam no SENHOR renovam suas forças; sobem com asas como águias, correm e não se cansam, caminham e não se fatigam.',
        reference: 'Isaías 40:31',
        reflection: 'Esperar no Senhor não é passividade — é uma decisão ativa de confiar. E a recompensa é uma força que vem do alto.'
    },
    {
        text: 'Sejam fortes e corajosos. Não tenham medo nem fiquem apavorados por causa delas, pois o SENHOR, o seu Deus, vai com vocês; nunca os deixará, nunca os abandonará.',
        reference: 'Deuteronômio 31:6',
        reflection: 'Coragem não é ausência de medo — é avançar mesmo com medo, sabendo que Deus está ao seu lado em cada passo.'
    },
    {
        text: 'A tua palavra é lâmpada para os meus pés e luz para o meu caminho.',
        reference: 'Salmo 119:105',
        reflection: 'Quando o caminho parece escuro, a Palavra de Deus ilumina o próximo passo. Você não precisa ver a estrada inteira — apenas o suficiente para avançar.'
    },
    {
        text: 'De fato, o amor de Deus foi derramado em nosso coração pelo Espírito Santo que nos foi dado.',
        reference: 'Romanos 5:5',
        reflection: 'Você não precisa gerar amor próprio — Deus já derramou Seu amor dentro de você pelo Espírito Santo. Viva a partir dessa fonte.'
    },
    {
        text: 'Busquem, acima de tudo, o Reino de Deus e a sua justiça, e todas essas coisas serão dadas a vocês.',
        reference: 'Mateus 6:33',
        reflection: 'Quando priorizamos o que é de Deus, Ele cuida de tudo o que é nosso. Reorganize suas prioridades e veja a provisão Dele agir.'
    },
    {
        text: 'Porque nada é impossível para Deus.',
        reference: 'Lucas 1:37',
        reflection: 'Aquela situação que parece sem saída? Para Deus, é apenas mais uma oportunidade de mostrar Seu poder. Confie!'
    },
    {
        text: 'Portanto, a fé vem por ouvir a mensagem, e a mensagem é ouvida por meio da palavra de Cristo.',
        reference: 'Romanos 10:17',
        reflection: 'Quanto mais nos alimentamos da Palavra, mais cresce a nossa fé. Dedique tempo hoje para ler e meditar nas Escrituras.'
    },
    {
        text: 'Eu sou a videira; vocês são os ramos. Se alguém permanecer em mim e eu nele, dará muito fruto; pois, sem mim, vocês não podem fazer nada.',
        reference: 'João 15:5',
        reflection: 'Produtividade espiritual não vem do esforço humano, mas da conexão com Cristo. Permaneça Nele — os frutos serão consequência.'
    },
    {
        text: 'O ladrão vem apenas para roubar, matar e destruir; eu vim para que tenham vida, e vida plena.',
        reference: 'João 10:10',
        reflection: 'Jesus não oferece uma vida pela metade. Ele quer que você viva de forma plena, abundante e cheia de propósito.'
    },
    {
        text: 'Lembrem-se disto: quem semeia pouco, pouco colherá; quem semeia com fartura, com fartura colherá.',
        reference: '2 Coríntios 9:6',
        reflection: 'Generosidade é a semente de uma colheita abundante. O que você pode semear hoje — tempo, atenção, amor, recursos?'
    },
    {
        text: 'Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei e cearei com ele, e ele comigo.',
        reference: 'Apocalipse 3:20',
        reflection: 'Jesus não arroba a porta — Ele bate e espera. Abra o coração para uma comunhão íntima com Ele hoje.'
    },
    {
        text: 'As misericórdias do SENHOR são a causa de não sermos consumidos; pois suas compaixões não têm fim.',
        reference: 'Lamentações 3:22',
        reflection: 'Se você está de pé hoje, é por causa da misericórdia renovada de Deus. Agradeça e avance com confiança.'
    },
    {
        text: 'Respondeu Jesus: "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim."',
        reference: 'João 14:6',
        reflection: 'Em um mundo cheio de opções, Jesus é claro: Ele é o único caminho confiável para Deus. Ande por Ele hoje.'
    },
    {
        text: 'Acima de tudo, porém, revistam-se do amor, que é o elo da perfeição.',
        reference: 'Colossenses 3:14',
        reflection: 'Antes de sair de casa, "vista-se" de amor. Ele conecta todas as virtudes e transforma cada interação do seu dia.'
    },
    {
        text: 'E a paz de Cristo, para a qual vocês foram chamados em um só corpo, domine o coração de vocês. E sejam agradecidos.',
        reference: 'Colossenses 3:15',
        reflection: 'Permita que a paz de Cristo governe suas decisões e emoções hoje. A gratidão é o solo onde essa paz floresce.'
    },
    {
        text: 'Cada um exerça o dom que recebeu para servir os outros, como bons administradores da multiforme graça de Deus.',
        reference: '1 Pedro 4:10',
        reflection: 'Você tem dons únicos que o mundo precisa. Use-os com generosidade — eles não são para guardar, mas para compartilhar.'
    }
];

// ============================================
// TERMOS DO GLOSSÁRIO RÁPIDO
// Exibidos no painel de estudo
// ============================================
export const glossaryTerms = [
    { term: 'Exegese', definition: 'Extrair o significado original do texto bíblico a partir do contexto histórico e linguístico.' },
    { term: 'Hermenêutica', definition: 'Ciência e arte de interpretar as Escrituras corretamente, considerando gênero, contexto e intenção do autor.' },
    { term: 'Cânon', definition: 'Conjunto dos 66 livros reconhecidos como Escritura Sagrada na tradição protestante.' },
    { term: 'Apócrifo', definition: 'Livro não incluído no cânon bíblico padrão, mas de valor histórico e literário.' },
    { term: 'Equivalência dinâmica', definition: 'Método de tradução que busca transmitir o pensamento/sentido original, como faz a NVT.' },
    { term: 'Equivalência formal', definition: 'Método palavra por palavra, mais literal mas pode ser mais difícil de entender (ex: Almeida).' },
    { term: 'Graça', definition: 'Favor imerecido de Deus; dom gratuito que não pode ser conquistado por obras humanas.' },
    { term: 'Justificação', definition: 'Ato de Deus declarar o pecador justo por meio da fé em Cristo, não por méritos próprios.' },
    { term: 'Redenção', definition: 'Resgate/libertação; Cristo pagou o preço pelo pecado da humanidade na cruz.' },
    { term: 'Parábola', definition: 'História curta contada por Jesus para ensinar uma verdade espiritual por meio de comparação.' },
    { term: 'Messias/Cristo', definition: '"O Ungido" — título de Jesus como o salvador prometido no Antigo Testamento.' },
    { term: 'Pentateuco', definition: 'Os 5 primeiros livros da Bíblia (Gênesis a Deuteronômio), também chamados "Torá" ou "Lei de Moisés".' },
];
