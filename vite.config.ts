import path from 'path';
import { defineConfig } from 'vite';
import { version } from './package.json';
// import { minifyHtml } from 'vite-plugin-html';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
plugins: [viteSingleFile() /*, minifyHtml() */],
  assetsInclude: ['fbx', 'glb', 'gltf'],
  base: './',

  define: {
    'import.meta.env.BUILD': JSON.stringify(version)
  },

  resolve: { alias: {
    '@assets': path.resolve(__dirname, 'src/assets'),
    '@scss': path.resolve(__dirname, 'src/scss'),
    '@': path.resolve(__dirname, 'src')
  }},

  build: {
    target: 'esnext',
		brotliSize: false,
		cssCodeSplit: false,
		assetsInlineLimit: 2_097_152, // 2MB
		chunkSizeWarningLimit: 2_097_152, // 2MB

		rollupOptions: {
			output: { manualChunks: () => 'index.js' },
			inlineDynamicImports: true
		}
  },

  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  }
});
