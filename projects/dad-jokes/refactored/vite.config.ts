/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';

/**
 * Relax CSP in dev mode so Vite's HMR inline scripts work.
 * Production builds keep the strict CSP from index.html.
 */
function cspDevPlugin(): Plugin {
  return {
    name: 'csp-dev-relax',
    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        // Dev mode: allow inline scripts/styles for Vite HMR
        return html.replace(
          /script-src 'self'/,
          "script-src 'self' 'unsafe-inline'",
        ).replace(
          /style-src 'self'/,
          "style-src 'self' 'unsafe-inline'",
        );
      }
      return html;
    },
  };
}

export default defineConfig({
  plugins: [cspDevPlugin()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
