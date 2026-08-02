import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { gzipSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Replace BUILD_TIMESTAMP_PLACEHOLDER in sw.js with actual build hash
function swCacheBust(): Plugin {
  return {
    name: 'sw-cache-bust',
    generateBundle(_, bundle) {
      const hash = Date.now().toString(36);
      const swFile = bundle['sw.js'];
      if (swFile && swFile.type === 'asset') {
        swFile.source = (swFile.source as string).replace('BUILD_TIMESTAMP_PLACEHOLDER', hash);
      }
    },
  };
}

// #4: Pre-compress JS/CSS assets with gzip for servers that support it
function gzipPrecompress(): Plugin {
  return {
    name: 'gzip-precompress',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist/assets');
      try {
        const { readdirSync, readFileSync } = require('fs');
        const files = readdirSync(distDir).filter((f: string) => f.endsWith('.js') || f.endsWith('.css'));
        for (const file of files) {
          const content = readFileSync(resolve(distDir, file));
          const compressed = gzipSync(content, { level: 9 });
          writeFileSync(resolve(distDir, `${file}.gz`), compressed);
        }
      } catch { /* dist may not exist yet */ }
    },
  };
}

// #3: Inject modulepreload hints for vendor chunk
function modulePreloadHints(): Plugin {
  return {
    name: 'modulepreload-hints',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        '  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>\n  </head>'
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), swCacheBust(), gzipPrecompress(), modulePreloadHints()],
  base: './',
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          vendor: ['react', 'react-dom', 'zustand'],
          // #1: Split simulation into separate chunk (loaded with store, not in critical render path)
          simulation: [
            './src/simulation/engine.ts',
            './src/simulation/orchestrator.ts',
            './src/simulation/tactics.ts',
            './src/simulation/season.ts',
            './src/simulation/fastmatch.ts',
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
