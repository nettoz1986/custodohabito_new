/**
 * study-hub.js
 * Módulo principal do Hub de Estudos, que ocupa a área central.
 * Renderiza cards de ferramentas de estudo e gerencia interações.
 */

import { parseMarkdown } from '../utils/markdown.js';

export function initStudyHub() {
    const container = document.getElementById('study-hub-container');
    if (!container) return;

    renderStudyHubMain(container);
}

function renderStudyHubMain(container) {
    const html = `
      <div class="study-hub-header">
        <div class="study-hub-icon">
            <i data-lucide="graduation-cap"></i>
        </div>
        <h2>Trilhas e Ferramentas</h2>
        <p>Escolha uma das funcionalidades abaixo para aprofundar seu entendimento na Palavra, utilizando o poder do Logos.</p>
      </div>
      
      <div class="study-cards-grid">
        
        <button class="study-card" data-study-view="exegesis">
          <div class="study-card-icon"><i data-lucide="microscope"></i></div>
          <div class="study-card-info">
            <h4>Raio-X do Versículo</h4>
            <p>Exegese profunda: Contexto cultural, idiomas originais e aplicação prática.</p>
          </div>
        </button>
        
        <button class="study-card" data-study-view="reading-plans">
          <div class="study-card-icon"><i data-lucide="calendar-days"></i></div>
          <div class="study-card-info">
            <h4>Planos de Leitura</h4>
            <p>Trilhas focadas preparadas para sua edificação e crescimento.</p>
          </div>
        </button>
        
        <button class="study-card" data-study-view="characters">
          <div class="study-card-icon"><i data-lucide="users"></i></div>
          <div class="study-card-info">
            <h4>Personagens Bíblicos</h4>
            <p>Biografias interativas, linha do tempo e lições de vida de grandes heróis da fé.</p>
          </div>
        </button>
        
        <button class="study-card" data-study-view="theology">
          <div class="study-card-icon"><i data-lucide="library"></i></div>
          <div class="study-card-info">
            <h4>Temas Teológicos</h4>
            <p>Estudos organizados sobre Salvação, Graça, Escatologia e mais.</p>
          </div>
        </button>

         <button class="study-card" data-study-view="journal">
          <div class="study-card-icon"><i data-lucide="book-heart"></i></div>
          <div class="study-card-info">
            <h4>Diário Espiritual</h4>
            <p>Seus estudos salvos, pregações e anotações pessoais com tags organizadas.</p>
          </div>
        </button>

      </div>
    `;

    container.innerHTML = html;

    if (window.lucide) {
        window.lucide.createIcons({ root: container });
    }

    // Attach events
    const cards = container.querySelectorAll('.study-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const view = card.dataset.studyView;
            if (view === 'characters') renderCharactersList(container);
            else if (view === 'reading-plans') renderReadingPlansView(container);
            else if (view === 'theology') renderTheologyView(container);
            else if (view === 'exegesis') renderExegesisView(container);
            else if (view === 'journal') renderJournalView(container);
        });
    });
}

function renderCharactersList(container) {
    const characters = [
        { name: 'Davi', title: 'O Rei Segundo o Coração de Deus', icon: 'crown', desc: 'Pastor de ovelhas, guerreiro corajoso, salmista apaixonado e o maior rei de Israel.' },
        { name: 'Paulo', title: 'O Apóstolo dos Gentios', icon: 'scroll', desc: 'De perseguidor implacável a maior plantador de igrejas e autor de grande parte do NT.' },
        { name: 'Moisés', title: 'O Libertador de Israel', icon: 'waves', desc: 'O homem escolhido para tirar o povo do Egito e receber os Dez Mandamentos.' },
        { name: 'Pedro', title: 'O Pescador de Homens', icon: 'anchor', desc: 'Discípulo impetuoso, que falhou tragicamente mas foi restaurado para liderar a igreja.' },
        { name: 'Elias', title: 'O Profeta de Fogo', icon: 'flame', desc: 'Um dos maiores profetas do Antigo Testamento, que enfrentou a idolatria de Acabe.' },
        { name: 'Ester', title: 'A Rainha Corajosa', icon: 'star', desc: 'A jovem órfã que se tornou rainha da Pérsia e arriscou sua vida para salvar seu povo.' }
    ];

    let cardsHtml = '';
    characters.forEach(char => {
        cardsHtml += `
            <button class="character-card subview-card" data-name="${char.name}">
                <div class="character-icon subview-card-icon"><i data-lucide="${char.icon}"></i></div>
                <div class="character-info subview-card-info">
                    <h4>${char.name}</h4>
                    <span>${char.title}</span>
                    <p>${char.desc}</p>
                </div>
            </button>
        `;
    });

    const html = `
        <div class="study-subview-header">
            <button class="btn-back-hub"><i data-lucide="arrow-left"></i> Voltar</button>
            <div class="subview-title-area">
                <i data-lucide="users"></i>
                <h2>Personagens Bíblicos</h2>
            </div>
            <p>Selecione um personagem para visualizar sua biografia, linha do tempo e lições para sua vida.</p>
        </div>
        
        <div class="subviews-grid">
            ${cardsHtml}
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons({ root: container });

    container.querySelector('.btn-back-hub').addEventListener('click', () => renderStudyHubMain(container));

    container.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.dataset.name;
            const prompt = `Gere um dossiê bíblico completo no formato de estudo avançado sobre o personagem ${name}. Quero sua biografia resumida, seus maiores acertos, suas maiores falhas, e os ensinamentos práticos que podemos extrair analisando seu comportamento mediante a Palavra. Formate em Markdown.`;
            generateStudyResult(container, `Estudo do Personagem: ${name}`, prompt, 'users', () => renderCharactersList(container));
        });
    });
}


// Global helper that the inline onclick handlers can use to send a prompt to AI
window.chatWithAI = function(promptText) {
    const viewChat = document.getElementById('view-chat');
    const viewStudy = document.getElementById('view-study-hub');
    const chatTitle = document.getElementById('chat-title');
    const chatStatus = document.getElementById('chat-status');
    
    if (viewChat && viewStudy) {
        viewStudy.classList.remove('active');
        viewStudy.style.display = 'none';
        viewChat.classList.add('active');
        viewChat.style.display = 'flex';
        
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        const chatBtn = document.querySelector('.nav-item[data-section="chat"]');
        if (chatBtn) chatBtn.classList.add('active');
    }

    if (chatTitle) chatTitle.textContent = 'Assistente Bíblico';
    if (chatStatus) chatStatus.innerHTML = '<span class="status-dot"></span> Estudando Tema...';

    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    if (chatInput && btnSend) {
        chatInput.value = promptText;
        btnSend.disabled = false;
        btnSend.click(); 
    }
}

function renderReadingPlansView(container) {
    const plans = [
        { id: '1ano', title: 'A Bíblia em 1 Ano', desc: 'Jornada clássica cruzando Antigo e Novo Testamento diariamente.', duration: 365, icon: 'book' },
        { id: 'relacionamentos', title: 'Curando Relacionamentos', desc: 'Princípios do Reino para famílias, amizades e casamento.', duration: 14, icon: 'heart-handshake' },
        { id: 'ansiedade', title: 'Superando a Ansiedade', desc: 'Versículos práticos e reflexões para trazer paz ao coração ansioso.', duration: 7, icon: 'wind' },
        { id: 'joao', title: 'Evangelho de João', desc: 'Mergulhe na vida, milagres e ensinamentos de Jesus.', duration: 21, icon: 'cross' }
    ];

    let cardsHtml = '';
    plans.forEach(plan => {
        cardsHtml += `
            <div class="plan-card subview-card-horizontal">
                <div class="plan-info">
                    <span class="plan-duration"><i data-lucide="clock"></i> ${plan.duration} Dias</span>
                    <h4 style="margin-top: 4px; font-size: 1.1rem;">${plan.title}</h4>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${plan.desc}</p>
                </div>
                <button class="btn-primary btn-open-plan" data-title="${plan.title}" data-duration="${plan.duration}" data-desc="${plan.desc}">Ver Plano</button>
            </div>
        `;
    });

    const html = `
        <div class="study-subview-header">
            <button class="btn-back-hub"><i data-lucide="arrow-left"></i> Voltar</button>
            <div class="subview-title-area">
                <i data-lucide="calendar-days"></i>
                <h2>Planos de Leitura</h2>
            </div>
            <p>Escolha um plano estruturado para a sua jornada com devocionais interativos.</p>
        </div>
        
        <div class="plans-list">
            ${cardsHtml}
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons({ root: container });

    container.querySelector('.btn-back-hub').addEventListener('click', () => renderStudyHubMain(container));

    container.querySelectorAll('.btn-open-plan').forEach(btn => {
        btn.addEventListener('click', () => {
            renderPlanDetailView(container, btn.dataset.title, parseInt(btn.dataset.duration), btn.dataset.desc);
        });
    });
}

function renderPlanDetailView(container, planTitle, planDuration, planDesc) {
    // Dropdown options para os dias
    let daysOptions = '';
    for(let i = 1; i <= planDuration; i++) {
        daysOptions += `<option value="${i}">Dia ${i} de ${planDuration}</option>`;
    }

    const html = `
        <div class="study-subview-header">
            <button class="btn-back-hub" id="btn-back-plans"><i data-lucide="arrow-left"></i> Voltar aos Planos</button>
        </div>

        <div class="char-detail-banner" style="margin-bottom: 20px;">
            <div class="char-detail-avatar" style="border-radius: var(--radius-md);"><i data-lucide="calendar-check"></i></div>
            <div class="char-detail-title">
                <h1>${planTitle}</h1>
                <span class="char-title-sub">Plano de Leitura de ${planDuration} Dias</span>
            </div>
        </div>

        <div class="char-section" style="max-width: 600px;">
            <h3 style="margin-bottom: 12px;"><i data-lucide="info"></i> Sobre o Plano</h3>
            <p style="margin-bottom: 24px; color: var(--text-muted);">${planDesc}</p>
            
            <div class="setting-group">
                <label style="display:block; margin-bottom: 8px; font-weight: 500;">Selecione o dia do plano:</label>
                <select id="plan-day-selector" class="setting-input" style="width: 100%; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-primary); color: var(--text-primary); margin-bottom: 20px;">
                    ${daysOptions}
                </select>
            </div>
            
            <button id="btn-start-plan-day" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
                <i data-lucide="play-circle"></i> Iniciar Estudo do Dia Selecionado
            </button>
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons({ root: container });

    container.querySelector('#btn-back-plans').addEventListener('click', () => renderReadingPlansView(container));

    const btnStart = container.querySelector('#btn-start-plan-day');
    const selectDay = container.querySelector('#plan-day-selector');

    btnStart.addEventListener('click', () => {
        const selectedDay = selectDay.value;
        const totalDays = planDuration;
        const prompt = `Vamos iniciar o **Dia ${selectedDay} de ${totalDays}** do meu plano de leitura: "${planTitle}".
Me envie a leitura bíblica proposta (NVT), um devocional reflexivo e uma oração guiada referentes apenas ao material deste dia. Formate a resposta de forma elegante em Markdown.`;
        
        generateStudyResult(container, `${planTitle} - Dia ${selectedDay}`, prompt, 'calendar-days', () => renderPlanDetailView(container, planTitle, planDuration, planDesc));
    });
}

function renderTheologyView(container) {
    const themes = [
        { title: 'Soteriologia', desc: 'O Estudo da Salvação (Graça, Fé, Justificação)', icon: 'shield-check' },
        { title: 'Escatologia', desc: 'O Estudo dos Últimos Tempos e o Livro do Apocalipse', icon: 'hourglass' },
        { title: 'Cristologia', desc: 'O Estudo da Pessoa e Obra de Jesus Cristo', icon: 'cross' },
        { title: 'Pneumatologia', desc: 'O Estudo do Espírito Santo e Seus Dons', icon: 'wind' },
        { title: 'Eclesiologia', desc: 'O Estudo da Igreja, Corpo de Cristo', icon: 'users' },
        { title: 'Bibliologia', desc: 'O Estudo sobre a Natureza e Inspiração da Bíblia', icon: 'book' }
    ];

    let cardsHtml = '';
    themes.forEach(theme => {
        cardsHtml += `
            <button class="theme-card subview-card" data-title="${theme.title}">
                <div class="subview-card-icon" style="margin: 0 auto 12px;"><i data-lucide="${theme.icon}"></i></div>
                <div class="subview-card-info" style="align-items: center; text-align: center;">
                    <h4>${theme.title}</h4>
                    <p style="font-size:0.85rem; color:var(--text-muted);">${theme.desc}</p>
                </div>
            </button>
        `;
    });

    const html = `
        <div class="study-subview-header">
            <button class="btn-back-hub"><i data-lucide="arrow-left"></i> Voltar</button>
            <div class="subview-title-area">
                <i data-lucide="library"></i>
                <h2>Temas Teológicos</h2>
            </div>
            <p>Escolha um conceito para uma explicação clara fundamentada da teologia cristã (NVT).</p>
        </div>
        
        <div class="subviews-grid">
            ${cardsHtml}
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons({ root: container });

    container.querySelector('.btn-back-hub').addEventListener('click', () => renderStudyHubMain(container));

    container.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.dataset.title;
            const desc = card.querySelector('p').textContent;
            const prompt = `Preciso de um estudo claro, acessível e profundo sobre **${title}** (${desc}). 
Faça como uma aula introduzindo o tema de forma imparcial (citando se necessário as grandes vertentes cristãs históricas) com referências e base sólida na NVT. Organize os tópicos em Markdown.`;
            generateStudyResult(container, `Estudo: ${title}`, prompt, 'library', () => renderTheologyView(container));
        });
    });
}

function renderExegesisView(container) {
    const html = `
        <div class="study-subview-header">
            <button class="btn-back-hub"><i data-lucide="arrow-left"></i> Voltar</button>
            <div class="subview-title-area">
                <i data-lucide="microscope"></i>
                <h2>Raio-X do Versículo</h2>
            </div>
            <p>Digite a referência da passagem para fazer uma exegese profunda focando no contexto histórico, idiomas originais e aplicação prática.</p>
        </div>
        
        <div class="study-form-container" style="max-width:600px; margin: 0 auto; background: var(--bg-surface); padding: 30px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
            <div class="setting-group">
                <label style="display:block; margin-bottom: 8px; font-weight: 500;">Qual passagem deseja estudar?</label>
                <input type="text" id="exegesis-input" class="setting-input" placeholder="Ex: João 3:16, Salmo 23, Romanos 8..." style="width: 100%; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-primary); color: var(--text-primary); margin-bottom: 20px;" />
            </div>
            <button id="btn-start-exegesis" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
                <i data-lucide="sparkles"></i> Gerar Raio-X Completo
            </button>
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons({ root: container });

    container.querySelector('.btn-back-hub').addEventListener('click', () => renderStudyHubMain(container));

    const btnStart = container.querySelector('#btn-start-exegesis');
    const input = container.querySelector('#exegesis-input');

    btnStart.addEventListener('click', () => {
        const passage = input.value.trim();
        if(!passage) {
            input.style.borderColor = 'var(--accent)';
            return;
        }
        const prompt = `Faça um 'Raio-X' exegético da passagem bibliográfica de **${passage}**. Quero que divida a resposta nas seguintes seções:
1. Contexto Histórico e Cultural (Quando, quem escreveu, o que estava acontecendo)
2. Idiomas Originais (Análise de palavras-chave no grego ou hebraico)
3. Referências Cruzadas
4. Aplicação Prática para a vida hoje. O retorno deve ser formatado em Markdown para facilitar a leitura.`;
        generateStudyResult(container, `Raio-X: ${passage}`, prompt, 'microscope', () => renderExegesisView(container));
    });
}

function renderJournalView(container) {
    const html = `
        <div class="study-subview-header">
            <button class="btn-back-hub"><i data-lucide="arrow-left"></i> Voltar</button>
            <div class="subview-title-area">
                <i data-lucide="book-heart"></i>
                <h2>Diário Espiritual</h2>
            </div>
            <p>Seus estudos e anotações pessoais. (Em breve)</p>
        </div>
        
        <div class="empty-state" style="text-align: center; padding: 60px 20px;">
            <div style="display: inline-flex; justify-content: center; align-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--bg-surface); color: var(--text-muted); margin-bottom: 16px;">
                <i data-lucide="pen-tool" style="width: 24px; height: 24px;"></i>
            </div>
            <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Nenhuma anotação salva</h3>
            <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto;">Em futuras atualizações, você poderá salvar os estudos gerados pelo Logos e adicionar suas próprias tags para organizar seus sermões e devocionais privativos aqui.</p>
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons({ root: container });

    container.querySelector('.btn-back-hub').addEventListener('click', () => renderStudyHubMain(container));
}

// -------------------------------------------------------------------------------------------------
// ENGINE DE GERAÇÃO INTRA-HUB
// -------------------------------------------------------------------------------------------------

async function generateStudyResult(container, title, promptText, iconName, backCallback) {
    // 1. Mostrar estado de Loading
    const htmlLoading = `
        <div class="study-subview-header">
            <button class="btn-back-hub btn-back-generating"><i data-lucide="arrow-left"></i> Cancelar</button>
            <div class="subview-title-area">
                <i data-lucide="${iconName}"></i>
                <h2>${title}</h2>
            </div>
            <p>Gerando estudo aprofundado...</p>
        </div>
        
        <div class="study-loading-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 60px 0;">
            <div class="typing-indicator" style="margin-bottom: 20px;">
                <span></span><span></span><span></span>
            </div>
            <h3 style="color: var(--accent); margin-bottom: 8px;">O Logos está pesquisando...</h3>
            <p style="color: var(--text-muted); text-align:center; max-width:400px;">Buscando referências históricas, cruzando textos no idioma original e organizando o material.</p>
        </div>
    `;

    container.innerHTML = htmlLoading;
    if (window.lucide) window.lucide.createIcons({ root: container });

    container.querySelector('.btn-back-generating').addEventListener('click', backCallback);

    // 2. Chamar a API Groq
    try {
        // Obter chave (mesmo fallback do chat principal)
        const p1 = import.meta.env.VITE_GROQ_PART1 || '';
        const p2 = import.meta.env.VITE_GROQ_PART2 || '';
        const p3 = import.meta.env.VITE_GROQ_PART3 || '';
        const p4 = import.meta.env.VITE_GROQ_PART4 || '';
        const p5 = import.meta.env.VITE_GROQ_PART5 || '';
        const p6 = import.meta.env.VITE_GROQ_PART6 || '';
        const p7 = import.meta.env.VITE_GROQ_PART7 || '';
        let envKey = p1 + p2 + p3 + p4 + p5 + p6 + p7;

        const apiKey = envKey || localStorage.getItem('groq_api_key') || window.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("Chave da API não configurada. Configure na engrenagem superior direita.");
        }

        const systemMessage = "Você é o 'Logos', um assistente bíblico e teológico reformado/ortodoxo. Sua missão é prover respostas profundas e acadêmicas, sem perder a linguagem devocional. Formate SEMPRE em Markdown bem estruturado, usando negritos, itálicos, títulos (##), e listas. A versão primária da bíblia é a Nova Versão Transformadora (NVT).";
        
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: promptText }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2500
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Erro na API');
        }

        const data = await response.json();
        const marKdownResult = data.choices[0].message.content;

        // 3. Renderizar o Markdown usando a lib utilitária do projeto
        const parsedHtml = parseMarkdown(marKdownResult);

        const htmlResult = `
            <div class="study-subview-header">
                <button class="btn-back-hub btn-back-result"><i data-lucide="arrow-left"></i> Voltar</button>
                <div class="subview-title-area">
                    <i data-lucide="${iconName}"></i>
                    <h2>${title}</h2>
                </div>
            </div>
            
            <div class="study-result-content char-section" style="max-width:850px; background:var(--bg-surface); padding: 30px; border-radius:var(--radius-lg); line-height: 1.6;">
                <div class="markdown-body">
                    ${parsedHtml || marKdownResult.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div style="margin-top: 20px; display:flex; gap:10px;">
                <button class="btn-primary" onclick="alert('Funcionalidade de Salvar no Diário virá em breve!')"><i data-lucide="bookmark"></i> Salvar no Diário</button>
            </div>
        `;

        container.innerHTML = htmlResult;
        if (window.lucide) window.lucide.createIcons({ root: container });

        container.querySelector('.btn-back-result').addEventListener('click', backCallback);

    } catch (error) {
        console.error('Erro ao gerar estudo no Hub:', error);
        
        const htmlError = `
            <div class="study-subview-header">
                <button class="btn-back-hub btn-back-result"><i data-lucide="arrow-left"></i> Voltar</button>
            </div>
            
            <div class="char-detail-banner" style="margin-bottom: 20px;">
                <div class="char-detail-avatar" style="border-radius: var(--radius-md); background:var(--bg-surface); border-color:var(--accent);"><i data-lucide="alert-triangle"></i></div>
                <div class="char-detail-title">
                    <h1>Erro na Geração</h1>
                    <span class="char-title-sub">Ops! Algo deu errado.</span>
                </div>
            </div>

            <div class="char-section" style="text-align: center; padding: 60px 20px;">
                <h3 style="color: var(--accent); justify-content:center;">Não foi possível concluir o estudo.</h3>
                <p style="color: var(--text-muted);">${error.message}</p>
            </div>
        `;
        container.innerHTML = htmlError;
        if (window.lucide) window.lucide.createIcons({ root: container });
        container.querySelector('.btn-back-result').addEventListener('click', backCallback);
    }
}
