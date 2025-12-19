#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync, readdirSync, statSync } = require('fs');
const path = require('path');

const formatVersion = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
};

const getGitDir = (cwd) => {
  const gitPath = path.resolve(cwd, '.git');
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
      return path.resolve(cwd, match[1].trim());
    }
  } catch {
    // ignore
  }
  return null;
};

const collectTagsFromDir = (dir, base, out) => {
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

const parseVersionTag = (tag) => {
  const match = tag.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    tag: tag.startsWith('v') ? tag : `v${tag}`,
    parts: [Number(match[1]), Number(match[2]), Number(match[3])]
  };
};

const getLatestTag = (tags) => {
  const parsed = [...tags]
    .map(parseVersionTag)
    .filter(Boolean);
  if (parsed.length === 0) return null;
  parsed.sort((a, b) => {
    for (let i = 0; i < 3; i += 1) {
      if (a.parts[i] !== b.parts[i]) return b.parts[i] - a.parts[i];
    }
    return 0;
  });
  return parsed[0].tag;
};

const getLatestTagFromGitDir = (cwd) => {
  const gitDir = getGitDir(cwd);
  if (!gitDir) return null;
  const tags = new Set();
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

const getGitTag = (cwd) => {
  try {
    const tag = execSync('git describe --tags --abbrev=0', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return tag || null;
  } catch {
    return getLatestTagFromGitDir(cwd);
  }
};

const cwd = process.cwd();
const tag = getGitTag(cwd);
const version = formatVersion(tag);
if (!version) {
  console.log('No tag found, skipping version sync.');
  process.exit(0);
}

const pkgPath = path.resolve(cwd, 'package.json');
const lockPath = path.resolve(cwd, 'package-lock.json');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const normalizedVersion = version.startsWith('v') ? version.slice(1) : version;
if (pkg.version !== normalizedVersion) {
  pkg.version = normalizedVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`package.json version set to ${normalizedVersion}`);
}

if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  let updated = false;
  if (lock.version !== normalizedVersion) {
    lock.version = normalizedVersion;
    updated = true;
  }
  if (lock.packages && lock.packages[''] && lock.packages[''].version !== normalizedVersion) {
    lock.packages[''].version = normalizedVersion;
    updated = true;
  }
  if (updated) {
    writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
    console.log(`package-lock.json version set to ${normalizedVersion}`);
  }
}
