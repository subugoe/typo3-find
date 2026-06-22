import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  build: {
    outDir: './Resources/Public/JavaScript',
    emptyOutDir: true,
    lib: {
      entry: './Resources/Private/JavaScript/find.ts',
      name: 'Find',
      fileName: () => 'find.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'find.css';
          return '[name][extname]';
        },
      },
    },
  },
  plugins: [
    checker({ typescript: true }),
  ],
  esbuild: {
    target: 'es2020',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
