import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'Arasaki_Staff_Planner_v0_8_Deploy',
  plugins: [
    react(),
    {
      name: 'copy-legacy-runtime',
      closeBundle() {
        cpSync(
          resolve('Arasaki_Staff_Planner_v0_8_Deploy/assets/js'),
          resolve('dist/assets/js'),
          { recursive: true },
        );
      },
    },
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
