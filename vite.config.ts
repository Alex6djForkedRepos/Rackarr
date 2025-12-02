import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
	// VITE_BASE_PATH env var allows different base paths per deployment:
	// - GitHub Pages: /rackarr/ (set in workflow)
	// - Docker/local: / (default)
	base: process.env.VITE_BASE_PATH || '/',
	publicDir: 'static',
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	}
}));
