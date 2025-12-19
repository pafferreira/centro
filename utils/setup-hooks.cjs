#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const cwd = process.cwd();
const gitDir = path.resolve(cwd, '.git');
if (!existsSync(gitDir)) {
  console.log('No .git directory found, skipping hook setup.');
  process.exit(0);
}

try {
  execSync('git config core.hooksPath utils', { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('Git hooks configured to use utils/ as core.hooksPath.');
} catch (error) {
  console.log('Failed to configure git hooks:', error.message);
}
