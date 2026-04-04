const APP_NAME = 'Custo do Habito';
const HTML2CANVAS_CDN_URL = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

let html2canvasLoader = null;

function resolveShareUrl(explicitUrl) {
  if (explicitUrl) return explicitUrl;

  const baseUrl = import.meta.env?.BASE_URL || '/';

  if (typeof window === 'undefined') {
    return baseUrl;
  }

  try {
    return new URL(baseUrl, window.location.origin).toString();
  } catch {
    return window.location.href;
  }
}

async function ensureHtml2Canvas() {
  if (window.html2canvas) return window.html2canvas;
  if (html2canvasLoader) return html2canvasLoader;

  html2canvasLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[data-html2canvas-loader="true"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.html2canvas), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Nao foi possivel carregar html2canvas.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = HTML2CANVAS_CDN_URL;
    script.async = true;
    script.dataset.html2canvasLoader = 'true';
    script.onload = () => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
        return;
      }

      reject(new Error('html2canvas carregado sem exportar a funcao global.'));
    };
    script.onerror = () => reject(new Error('Nao foi possivel carregar html2canvas.'));
    document.head.appendChild(script);
  });

  return html2canvasLoader;
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'image/png';
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function buildImageFileName(context) {
  const suffix = String(context || 'compartilhamento')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'compartilhamento';

  return `${suffix}.png`;
}

async function captureElementAsImage(elementId, context) {
  const target = document.getElementById(elementId);
  if (!target) {
    throw new Error(`Elemento para captura nao encontrado: ${elementId}`);
  }

  const html2canvas = await ensureHtml2Canvas();
  const canvas = await html2canvas(target, {
    backgroundColor: '#041833',
    scale: Math.min(window.devicePixelRatio || 1.5, 2),
    useCORS: true,
    logging: false
  });

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  const imageBlob = blob || dataUrlToBlob(canvas.toDataURL('image/png'));
  const filename = buildImageFileName(context);
  const file = typeof File !== 'undefined'
    ? new File([imageBlob], filename, { type: 'image/png' })
    : null;

  return {
    blob: imageBlob,
    file,
    filename,
    downloadUrl: URL.createObjectURL(imageBlob)
  };
}

function canShareFiles(files) {
  if (!navigator.share || !files?.length) return false;
  if (typeof navigator.canShare !== 'function') return false;

  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

export async function shareContent({ title, text, url, context, elementId }) {
  const shareUrl = resolveShareUrl(url);
  const sanitizedText = String(text || '').trim();
  const fullText = sanitizedText
    ? `${sanitizedText}\n\n${APP_NAME}: ${shareUrl}`
    : `${APP_NAME}: ${shareUrl}`;

  let imagePayload = null;

  if (elementId) {
    try {
      imagePayload = await captureElementAsImage(elementId, context);
    } catch (error) {
      console.warn('Nao foi possivel gerar a imagem para compartilhamento.', error);
    }
  }

  if (navigator.share) {
    try {
      if (imagePayload?.file && canShareFiles([imagePayload.file])) {
        await navigator.share({
          title,
          text: fullText,
          url: shareUrl,
          files: [imagePayload.file]
        });
      } else {
        await navigator.share({ title, text: fullText, url: shareUrl });
      }

      if (imagePayload?.downloadUrl) {
        URL.revokeObjectURL(imagePayload.downloadUrl);
      }
      return;
    } catch (error) {
      if (error?.name === 'AbortError') {
        if (imagePayload?.downloadUrl) {
          URL.revokeObjectURL(imagePayload.downloadUrl);
        }
        return;
      }
    }
  }

  showDesktopSharePanel({ title, text: fullText, url: shareUrl, context, imagePayload });
}

function showDesktopSharePanel({ title, text, url, context, imagePayload }) {
  document.getElementById('share-panel')?.remove();

  const panel = document.createElement('div');
  panel.id = 'share-panel';
  panel.className = 'share-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', `Compartilhar ${context || 'conteudo'}`);

  const waText = encodeURIComponent(text);
  const mailBody = encodeURIComponent(text);
  const mailSubject = encodeURIComponent(title || APP_NAME);

  panel.innerHTML = `
    <div class="share-panel-inner">
      <div class="share-panel-header">
        <span class="share-panel-title">Compartilhar</span>
        <button class="share-panel-close" id="share-panel-close" type="button" aria-label="Fechar">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="share-buttons">
        <a class="share-btn share-btn-whatsapp" href="https://wa.me/?text=${waText}" target="_blank" rel="noopener noreferrer">
          <i data-lucide="message-circle"></i>
          WhatsApp
        </a>
        <a class="share-btn share-btn-email" href="mailto:?subject=${mailSubject}&body=${mailBody}">
          <i data-lucide="mail"></i>
          E-mail
        </a>
        <button class="share-btn share-btn-copy" id="share-copy-btn" type="button">
          <i data-lucide="copy"></i>
          Copiar link
        </button>
        ${imagePayload?.downloadUrl ? `
          <button class="share-btn share-btn-download" id="share-download-image-btn" type="button">
            <i data-lucide="download"></i>
            Baixar imagem
          </button>
        ` : ''}
      </div>
      <p class="share-instagram-hint">
        <i data-lucide="instagram"></i>
        Para Instagram: baixe a imagem e publique nos stories ou copie o link para a bio.
      </p>
    </div>
  `;

  document.body.appendChild(panel);
  window.lucide?.createIcons?.();

  panel.querySelector('#share-copy-btn')?.addEventListener('click', async () => {
    const button = panel.querySelector('#share-copy-btn');

    try {
      await navigator.clipboard.writeText(url);
      button.innerHTML = '<i data-lucide="check"></i> Copiado!';
      button.classList.add('share-btn-copied');
      window.lucide?.createIcons?.();

      window.setTimeout(() => {
        button.innerHTML = '<i data-lucide="copy"></i> Copiar link';
        button.classList.remove('share-btn-copied');
        window.lucide?.createIcons?.();
      }, 2000);
    } catch {
      window.prompt('Copie o link abaixo:', url);
    }
  });

  panel.querySelector('#share-download-image-btn')?.addEventListener('click', () => {
    const anchor = document.createElement('a');
    anchor.href = imagePayload.downloadUrl;
    anchor.download = imagePayload.filename || buildImageFileName(context);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  });

  const closePanel = () => {
    if (imagePayload?.downloadUrl) {
      URL.revokeObjectURL(imagePayload.downloadUrl);
    }
    panel.remove();
  };

  panel.querySelector('#share-panel-close')?.addEventListener('click', closePanel);
  panel.addEventListener('click', (event) => {
    if (event.target === panel) {
      closePanel();
    }
  });
}
