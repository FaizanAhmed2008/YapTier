import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { generateSeoFiles, writeSeoFiles } from './seo/generate.ts';

function contentTypeFor(fileName: string): string {
  if (fileName.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (fileName.endsWith('.txt')) return 'text/plain; charset=utf-8';
  return 'text/html; charset=utf-8';
}

function serveGeneratedSeo(files: Map<string, string>) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const pathname = (req.url ?? '/').split('?')[0];
    const key = pathname.replace(/^\/+/, '').replace(/\/+$/, '');

    if (!key) {
      next();
      return;
    }

    const candidates = [key, `${key}.html`];
    const fileName = candidates.find((candidate) => files.has(candidate));

    if (!fileName) {
      next();
      return;
    }

    const content = files.get(fileName) ?? '';
    res.statusCode = fileName === '404.html' ? 404 : 200;
    res.setHeader('Content-Type', contentTypeFor(fileName));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(content);
  };
}

function seoPlugin(): Plugin {
  let outDir = 'dist';
  let root = process.cwd();

  return {
    name: 'yaptier-seo',
    configResolved(config) {
      outDir = config.build.outDir;
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(serveGeneratedSeo(generateSeoFiles()));
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveGeneratedSeo(generateSeoFiles()));
    },
    closeBundle() {
      writeSeoFiles(resolve(root, outDir));
    },
  };
}

export default defineConfig({
  plugins: [react(), seoPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.includes('@dnd-kit') ? 'dnd' : 'vendor';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
  },
});
