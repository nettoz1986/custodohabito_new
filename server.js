import { createReadStream, existsSync } from 'node:fs';
import { appendFile, mkdir, readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const dataDirectory = path.join(__dirname, '.data');
const diagnosticLeadsPath = path.join(dataDirectory, 'diagnostic-leads.ndjson');
const diagnosticAdminToken = (process.env.DIAGNOSTIC_ADMIN_TOKEN || '').trim();
const MAX_BODY_SIZE_BYTES = 1024 * 1024;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function resolveRequestPath(urlPath) {
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const requestedPath = safePath === path.sep ? '/index.html' : safePath;
  return path.join(__dirname, requestedPath);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache'
  });
  res.end(body);
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Origin', '*');
}

async function readJsonBody(req) {
  const chunks = [];
  let totalSize = 0;

  for await (const chunk of req) {
    totalSize += chunk.length;
    if (totalSize > MAX_BODY_SIZE_BYTES) {
      const error = new Error('Payload excede o limite permitido.');
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch (error) {
    const parseError = new Error('Corpo da requisicao em JSON invalido.');
    parseError.statusCode = 400;
    throw parseError;
  }
}

function validateDiagnosticLead(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Nenhum dado de diagnostico foi enviado.';
  }

  const email = String(payload.email || '').trim();
  const profissao = String(payload.profissao || '').trim();
  const renda = String(payload.renda || '').trim();
  const comprometido = String(payload.comprometido || '').trim();
  const previdencia = String(payload.previdencia || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Informe um e-mail valido.';
  }

  if (!profissao || !renda || !comprometido || !previdencia) {
    return 'Preencha todos os campos obrigatorios do diagnostico.';
  }

  if (!payload.privacyAccepted) {
    return 'O consentimento da politica de privacidade e obrigatorio.';
  }

  if (!payload.profilePrimary?.key || !payload.profilePrimary?.name) {
    return 'O perfil principal do diagnostico nao foi informado.';
  }

  if (!Array.isArray(payload.answers) || !payload.answers.length) {
    return 'As respostas do diagnostico nao foram enviadas.';
  }

  return '';
}

async function storeDiagnosticLead(payload, req) {
  await mkdir(dataDirectory, { recursive: true });

  const record = {
    ...payload,
    storedAt: new Date().toISOString(),
    metadata: {
      userAgent: req.headers['user-agent'] || '',
      forwardedFor: req.headers['x-forwarded-for'] || '',
      remoteAddress: req.socket?.remoteAddress || ''
    }
  };

  await appendFile(diagnosticLeadsPath, `${JSON.stringify(record)}\n`, 'utf-8');
}

function parseNdjson(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

function assertAdminAccess(req, url) {
  if (!diagnosticAdminToken) return true;

  const authHeader = String(req.headers.authorization || '').trim();
  const tokenFromHeader = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';
  const tokenFromQuery = String(url.searchParams.get('token') || '').trim();

  return tokenFromHeader === diagnosticAdminToken || tokenFromQuery === diagnosticAdminToken;
}

function toCsvValue(value) {
  const normalized = String(value ?? '').replace(/"/g, '""');
  return `"${normalized}"`;
}

function serializeLeadsToCsv(leads) {
  const headers = [
    'storedAt',
    'submittedAt',
    'email',
    'profissao',
    'renda',
    'comprometido',
    'previdencia',
    'profilePrimary',
    'profileSecondary',
    'source'
  ];

  const rows = leads.map((lead) => ([
    lead.storedAt || '',
    lead.submittedAt || '',
    lead.email || '',
    lead.profissao || '',
    lead.renda || '',
    lead.comprometido || '',
    lead.previdencia || '',
    lead.profilePrimary?.name || '',
    lead.profileSecondary?.name || '',
    lead.source || ''
  ]));

  return [
    headers.map(toCsvValue).join(','),
    ...rows.map((row) => row.map(toCsvValue).join(','))
  ].join('\n');
}

async function sendFile(filePath, res) {
  const fileStat = await stat(filePath);
  const ext = path.extname(filePath).toLowerCase();

  res.writeHead(200, {
    'Content-Length': fileStat.size,
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });

  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || `${host}:${port}`}`);

    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === '/api/diagnostic-leads' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const validationError = validateDiagnosticLead(payload);

      if (validationError) {
        sendJson(res, 400, {
          ok: false,
          message: validationError
        });
        return;
      }

      await storeDiagnosticLead(payload, req);

      sendJson(res, 201, {
        ok: true,
        message: 'Lead registrado com sucesso.'
      });
      return;
    }

    if (url.pathname === '/api/diagnostic-leads' && req.method === 'GET') {
      if (!assertAdminAccess(req, url)) {
        sendJson(res, 401, {
          ok: false,
          message: 'Acesso nao autorizado.'
        });
        return;
      }

      const fileContent = existsSync(diagnosticLeadsPath)
        ? await readFile(diagnosticLeadsPath, 'utf-8')
        : '';
      const leads = parseNdjson(fileContent);
      const format = String(url.searchParams.get('format') || 'json').toLowerCase();

      if (format === 'csv') {
        const csv = serializeLeadsToCsv(leads);
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Length': Buffer.byteLength(csv),
          'Content-Disposition': 'attachment; filename=\"diagnostic-leads.csv\"',
          'Cache-Control': 'no-cache'
        });
        res.end(csv);
        return;
      }

      sendJson(res, 200, {
        ok: true,
        total: leads.length,
        leads
      });
      return;
    }

    let filePath = resolveRequestPath(url.pathname);

    if (existsSync(filePath) && (await stat(filePath)).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!existsSync(filePath)) {
      filePath = path.join(__dirname, 'index.html');
    }

    await sendFile(filePath, res);
  } catch (error) {
    const statusCode = Number(error.statusCode) || 500;
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || 'Erro interno do servidor.'
    });
  }
});

server.listen(port, host, () => {
  console.log(`Servidor rodando em http://${host}:${port}`);
});
