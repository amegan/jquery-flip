import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    open: '/tests/test_flip.html'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'jquery.mobile.flip.js'),
      name: 'jquery.mobile.flip',
      fileName: () => 'jquery.mobile.flip.min.js',
      formats: ['iife']
    },
    sourcemap: true,
    outDir: '.',
    emptyOutDir: false,
    rollupOptions: {
      external: ['jquery'],
      output: {
        globals: {
          jquery: 'jQuery'
        }
      }
    }
  }
});
