import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
    }),
  ],
  root: 'src/workfront-ui-1/web-src',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/workfront-ui-1/web-src/src'),
    },
  },
  build: {
    outDir: '../../dist',
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/workfront-ui-1/web-src/index.html'),
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(css|less|sass|scss)$/.test(assetInfo.name || '')) {
            return `css/[name].[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name || '')) {
            return `images/[name].[hash].${ext}`;
          }
          return `assets/[name].[hash].${ext}`;
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
      interval: 500,
    },
    hmr: {
      overlay: true,
      port: 3000,
      clientPort: 3000,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@adobe/react-spectrum',
      '@adobe/uix-guest'
    ]
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}); 