import path from 'path';
import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const formatVersion = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'v0.0.0';
    return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
  };

  const getGitDir = () => {
    const gitPath = path.resolve(__dirname, '.git');
    try {
      const stat = statSync(gitPath);
      if (stat.isDirectory()) return gitPath;
    } catch {
      // ignore
    }
    try {
      const content = readFileSync(gitPath, 'utf8');
      const match = content.match(/gitdir:\s*(.+)/i);
      if (match) {
        return path.resolve(__dirname, match[1].trim());
      }
    } catch {
      // ignore
    }
    return null;
  };

  const collectTagsFromDir = (dir: string, base: string, out: Set<string>) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectTagsFromDir(fullPath, base, out);
      } else {
        const rel = path.relative(base, fullPath).replace(/\\/g, '/');
        if (rel) out.add(rel);
      }
    }
  };

  const parseVersionTag = (tag: string) => {
    const match = tag.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
    if (!match) return null;
    return {
      tag: tag.startsWith('v') ? tag : `v${tag}`,
      parts: [Number(match[1]), Number(match[2]), Number(match[3])]
    };
  };

  const getLatestTag = (tags: Set<string>) => {
    const parsed = [...tags]
      .map(parseVersionTag)
      .filter((value): value is { tag: string; parts: number[] } => Boolean(value));
    if (parsed.length === 0) return null;
    parsed.sort((a, b) => {
      for (let i = 0; i < 3; i += 1) {
        if (a.parts[i] !== b.parts[i]) return b.parts[i] - a.parts[i];
      }
      return 0;
    });
    return parsed[0].tag;
  };

  const getLatestTagFromGitDir = () => {
    const gitDir = getGitDir();
    if (!gitDir) return null;
    const tags = new Set<string>();
    collectTagsFromDir(path.join(gitDir, 'refs', 'tags'), path.join(gitDir, 'refs', 'tags'), tags);
    const packedRefs = path.join(gitDir, 'packed-refs');
    if (existsSync(packedRefs)) {
      const lines = readFileSync(packedRefs, 'utf8').split('\n');
      for (const line of lines) {
        if (!line || line.startsWith('#') || line.startsWith('^')) continue;
        const parts = line.split(' ');
        if (parts.length < 2) continue;
        const ref = parts[1].trim();
        if (ref.startsWith('refs/tags/')) {
          tags.add(ref.replace('refs/tags/', ''));
        }
      }
    }
    return getLatestTag(tags);
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
    const tagFromRefs = getLatestTagFromGitDir();
    if (tagFromRefs) {
      appVersion = formatVersion(tagFromRefs);
    } else {
      try {
        const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')) as { version?: string };
        if (pkg.version) {
          appVersion = formatVersion(pkg.version);
        }
      } catch {
        appVersion = 'v0.0.0';
      }
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
