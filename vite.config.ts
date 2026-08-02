import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig({
  plugins: [react(), swCacheBust()],
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
