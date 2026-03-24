import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9333;
const ROOT_DIR = process.cwd();
const CONVERTER_URL = pathToFileURL(path.join(ROOT_DIR, 'tools', 'webp-converter.html')).href;

const conversions = [
  {
    input: 'public/assets/biaAgora.png',
    output: 'public/assets/biaAgora.webp',
    quality: 0.82,
    maxWidth: 1200
  },
  {
    input: 'public/assets/heitorReserva.png',
    output: 'public/assets/heitorReserva.webp',
    quality: 0.82,
    maxWidth: 1200
  },
  {
    input: 'public/assets/liaEquilibrio.png',
    output: 'public/assets/liaEquilibrio.webp',
    quality: 0.82,
    maxWidth: 1200
  },
  {
    input: 'public/assets/valenLuxo.png',
    output: 'public/assets/valenLuxo.webp',
    quality: 0.82,
    maxWidth: 1200
  },
  {
    input: 'public/assets/logo_custodohabito_dourada.png',
    output: 'public/assets/logo_custodohabito_dourada.webp',
    quality: 0.8,
    maxWidth: 900
  }
];

async function main() {
  const results = [];

  for (const conversion of conversions) {
    const result = await convertOne(conversion);
    results.push(result);
    console.log(`${path.basename(conversion.output)} ${result.width}x${result.height} ${formatBytes(result.bytes)}`);
  }
}

async function convertOne(conversion) {
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cdh-edge-'));
  const targetUrl = buildTargetUrl(conversion.input, conversion.quality, conversion.maxWidth);
  const edge = spawn(EDGE_PATH, [
    '--headless',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    targetUrl
  ], {
    stdio: 'ignore'
  });

  try {
    const websocketUrl = await waitForWebSocketUrl(DEBUG_PORT);
    const payload = await readConversionPayload(websocketUrl);
    if (payload.error) {
      throw new Error(`Conversion error for ${conversion.input}: ${payload.error}`);
    }

    const buffer = decodeDataUrl(payload.dataUrl);
    const outputPath = path.join(ROOT_DIR, conversion.output);
    await fs.writeFile(outputPath, buffer);

    return {
      width: payload.width,
      height: payload.height,
      bytes: buffer.byteLength
    };
  } finally {
    edge.kill('SIGTERM');
    await waitForProcessExit(edge);
    await fs.rm(userDataDir, { recursive: true, force: true });
  }
}

function buildTargetUrl(inputPath, quality, maxWidth) {
  const inputUrl = pathToFileURL(path.join(ROOT_DIR, inputPath)).href;
  return `${CONVERTER_URL}?input=${encodeURIComponent(inputUrl)}&quality=${quality}&maxWidth=${maxWidth}`;
}

async function waitForWebSocketUrl(port) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const pageTarget = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);

      if (pageTarget?.webSocketDebuggerUrl) {
        return pageTarget.webSocketDebuggerUrl;
      }
    } catch {
      await sleep(250);
    }

    await sleep(250);
  }

  throw new Error('Timed out waiting for Edge remote debugger.');
}

async function readConversionPayload(websocketUrl) {
  const socket = new WebSocket(websocketUrl);
  let nextCommandId = 1;
  const pending = new Map();

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;

    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);

    if (message.error) {
      reject(new Error(message.error.message || 'Unknown CDP error'));
      return;
    }

    resolve(message.result);
  });

  const send = (method, params = {}) => {
    const id = nextCommandId++;
    socket.send(JSON.stringify({ id, method, params }));

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  };

  await send('Runtime.enable');

  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    const result = await send('Runtime.evaluate', {
      expression: `document.getElementById('out')?.textContent || ''`,
      returnByValue: true
    });

    const rawValue = result?.result?.value;
    if (!rawValue || rawValue === '{"status":"pending"}') {
      await sleep(250);
      continue;
    }

    socket.close();
    return JSON.parse(rawValue);
  }

  socket.close();
  throw new Error('Timed out waiting for converted image payload.');
}

function decodeDataUrl(dataUrl) {
  const [, base64Payload = ''] = String(dataUrl || '').split(',');
  return Buffer.from(base64Payload, 'base64');
}

function waitForProcessExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }

    child.once('exit', () => resolve());
    setTimeout(() => resolve(), 5000);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
