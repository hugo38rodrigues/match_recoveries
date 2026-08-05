import { defineConfig } from 'vitest/config'
export default defineConfig({
	test: {
		globals: true,           // describe, it globalement
		environment: 'node',     // Environnement Node.js
		coverage: {
			provider: 'v8',        // V8 pour la couverture
			reporter: ['text', 'html'], // Rapports
		},
		testTimeout: 10000,      // Timeout de 10s
	},
})