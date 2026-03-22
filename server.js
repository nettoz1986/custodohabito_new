import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);

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
    let filePath = resolveRequestPath(url.pathname);

    if (existsSync(filePath) && (await stat(filePath)).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!existsSync(filePath)) {
      filePath = path.join(__dirname, 'index.html');
    }

    await sendFile(filePath, res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Erro ao iniciar o servidor: ${error.message}`);
  }
});

server.listen(port, host, () => {
  console.log(`Servidor rodando em http://${host}:${port}`);
});
