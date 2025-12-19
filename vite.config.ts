import path from 'path';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const formatVersion = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'v0.0.0';
    return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
  };

  let appVersion = 'v0.0.0';
  try {
    const tag = execSync('git describe --tags --abbrev=0', { cwd: __dirname })
      .toString()
      .trim();
    if (tag) {
      appVersion = formatVersion(tag);
    } else {
      throw new Error('No git tag found');
    }
  } catch {
    try {
      const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')) as { version?: string };
      if (pkg.version) {
        appVersion = formatVersion(pkg.version);
      }
    } catch {
      appVersion = 'v0.0.0';
    }
  }
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      __APP_VERSION__: JSON.stringify(appVersion)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
