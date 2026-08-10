import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Minimal, zero-config build. Tailwind v4 is wired via its Vite plugin
// (no postcss.config / tailwind.config.js needed).
export default defineConfig({
  // Served from https://quyen0723.github.io/WeTheFlywheel_Feature/ — the base
  // must match the repo path or built assets 404 on GitHub Pages.
  base: '/WeTheFlywheel_Feature/',
  plugins: [react(), tailwindcss()],
});