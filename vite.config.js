// Configuração do Vite para o WebApp Bíblico
import { defineConfig } from 'vite';

export default defineConfig({
  // Base path para GitHub Pages
  base: '/custodohabito_new/',
  // Diretório raiz do projeto
  root: '.',
  // Diretório dos assets estáticos
  publicDir: 'public',
  server: {
    // Porta do servidor de desenvolvimento
    port: 5173,
    // Abre o navegador automaticamente ao iniciar
    open: true
  },
  build: {
    // Diretório de saída do build de produção
    outDir: 'dist'
  }
});
