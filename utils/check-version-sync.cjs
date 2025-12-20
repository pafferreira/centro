#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

const formatTag = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
};

const getExactTag = () => {
  try {
    const tag = execSync('git describe --tags --exact-match', {
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .toString()
      .trim();
    return tag || null;
  } catch {
    return null;
  }
};

const cwd = process.cwd();
const pkgPath = path.resolve(cwd, 'package.json');
const lockPath = path.resolve(cwd, 'package-lock.json');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const pkgVersion = pkg.version;

if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  const lockVersion = lock.version;
  const rootVersion = lock.packages && lock.packages[''] ? lock.packages[''].version : null;
  if (lockVersion && lockVersion !== pkgVersion) {
    console.error(`package-lock.json version (${lockVersion}) does not match package.json (${pkgVersion}).`);
    process.exit(1);
  }
  if (rootVersion && rootVersion !== pkgVersion) {
    console.error(`package-lock.json packages[""].version (${rootVersion}) does not match package.json (${pkgVersion}).`);
    process.exit(1);
  }
}

const tag = getExactTag();
if (!tag) {
  console.log('No tag on HEAD; version sync check passed for package files.');
  process.exit(0);
}

const normalizedTag = formatTag(tag);
const normalizedVersion = formatTag(pkgVersion);
if (normalizedTag !== normalizedVersion) {
  console.error(`Git tag (${normalizedTag}) does not match package.json (${normalizedVersion}).`);
  process.exit(1);
}

console.log('Version sync check passed.');
