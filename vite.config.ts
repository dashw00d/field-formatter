import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'FieldFormatter.ts'),
      name: 'FieldFormatter',
      fileName: 'field-formatter',
      formats: ['es', 'umd', 'iife']
    },
    rollupOptions: {
      // Ensure strict separation for the vanilla build
      output: {
        // Global variable name for IIFE/UMD builds
        name: 'FieldFormatter',
        exports: 'named',
      }
    }
  }
});
