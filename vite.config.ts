import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED_FIREBASE_FIELDS = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'] as const;

function firebaseRuntimeConfigSource(): string {
  const rawConfig = process.env.FIREBASE_CONFIG_JSON;
  const teamId = process.env.FIREBASE_TEAM_ID || 'arasaki-shipyard';

  if (!rawConfig) {
    console.warn('FIREBASE_CONFIG_JSON が未設定のため、未設定用config.jsを生成します。');
    return [
      `export const FIREBASE_CONFIG = ${JSON.stringify({
        apiKey: 'ここにFirebase API Key',
        authDomain: 'ここにFirebase Auth Domain',
        databaseURL: 'ここにRealtime Database URL',
        projectId: 'ここにFirebase Project ID',
        appId: 'ここにFirebase App ID',
      }, null, 2)};`,
      `export const TEAM_ID = ${JSON.stringify(teamId)};`,
      '',
    ].join('\n');
  }

  let config: Record<string, unknown>;
  try {
    config = JSON.parse(rawConfig) as Record<string, unknown>;
  } catch {
    throw new Error('FIREBASE_CONFIG_JSON は有効なJSONで設定してください。');
  }

  const missing = REQUIRED_FIREBASE_FIELDS.filter(field => !config[field]);
  if (missing.length) {
    throw new Error(`FIREBASE_CONFIG_JSON に必須項目がありません: ${missing.join(', ')}`);
  }

  return [
    `export const FIREBASE_CONFIG = ${JSON.stringify(config, null, 2)};`,
    `export const TEAM_ID = ${JSON.stringify(teamId)};`,
    '',
  ].join('\n');
}

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
        writeFileSync(
          resolve('dist/assets/js/config.js'),
          firebaseRuntimeConfigSource(),
          { encoding: 'utf8', mode: 0o600 },
        );
      },
    },
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
