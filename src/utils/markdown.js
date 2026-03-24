/**
 * markdown.js
 * Parser simples de Markdown para HTML.
 * Converte formatação Markdown das respostas do assistente em HTML renderizável.
 */

/**
 * Converte texto em Markdown para HTML formatado.
 * Suporta: títulos, negrito, itálico, listas, blockquotes, código,
 * tabelas, linhas horizontais e links.
 * @param {string} text - Texto em Markdown para converter
 * @returns {string} HTML formatado
 */
export function parseMarkdown(text) {
    if (!text) return '';

    let html = text;

    // --- Escapar caracteres HTML perigosos ---
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // --- Blocos de código (```) ---
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
    });

    // --- Tabelas ---
    html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (match) => {
        const lines = match.trim().split('\n');
        // Cabeçalho da tabela
        const headers = lines[0].split('|').filter(h => h.trim());
        // Linhas de dados (pular linha do separador)
        const rows = lines.slice(2).map(line =>
            line.split('|').filter(c => c.trim())
        );

        let tableHtml = '<table><thead><tr>';
        headers.forEach(h => {
            tableHtml += `<th>${h.trim()}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        rows.forEach(row => {
            tableHtml += '<tr>';
            row.forEach(cell => {
                tableHtml += `<td>${cell.trim()}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        return tableHtml;
    });

    // --- Títulos (h1-h4) ---
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // --- Blockquotes (incluindo linhas vazias com apenas o sinal >) ---
    html = html.replace(/^&gt;\s*(.*?)$/gm, (match, p1) => {
        return p1.trim() === '' ? '<br>' : `<blockquote>${p1}</blockquote>`;
    });

    // --- Negrito e Itálico Avançados ---
    // Negrito: **texto**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Itálico: *texto* ou _texto_ (sem pegar dentro de palavras)
    html = html.replace(/\b_([^_]+)_\b/g, '<em>$1</em>');
    html = html.replace(/(?:^|[^\*])\*([^\*\n]+)\*(?=[^\*]|$)/g, '$&') // protecao asteriscos
               .replace(/\*([^\*\n]+)\*/g, '<em>$1</em>');

    // --- Listas não-ordenadas (* ou -) ---
    html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
    // Envolver LIs consecutivos em UL
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // --- Emoji de versículo (manter como está) ---
    // Nenhuma transformação necessária; emojis são suportados nativamente

    // --- Links ---
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // --- Parágrafos e Quebras de Linha ---
    // Converter \n\n em fechamento e abertura de novo parágrafo
    html = html.replace(/\n\n/g, '</p><p>');
    // Converter um \n simples (desde que não esteja dentro de uma tag block-level estrutural)
    html = html.replace(/(?<!>\s*)\n(?!\s*<)/g, '<br>');

    // Envolver todo o texto num grande contêiner de parágrafo (pular o q for tags grandes)
    if (!html.match(/^<(h[1-4]|ul|ol|table|pre|blockquote|hr)/)) {
        html = `<p>${html}</p>`;
    }

    // Limpar restos
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<br>\s*<\/p>/g, '</p>'); // Evitar espaçamento extra no fim do parágrafo

    return html;
}
