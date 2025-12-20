#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');
const readline = require('readline');

const run = (command) => execSync(command, { stdio: 'inherit' });
const runQuiet = (command) =>
  execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();

const ensureGitRepo = () => {
  try {
    runQuiet('git rev-parse --git-dir');
  } catch {
    console.log('Git repository not found. Aborting.');
    process.exit(1);
  }
};

const ensureCleanTree = () => {
  const status = runQuiet('git status --porcelain');
  if (status) {
    console.log('Working tree is not clean. Commit or stash changes first.');
    process.exit(1);
  }
};

const readPackageVersion = () => {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return pkg.version || '0.0.0';
};

const parseSemver = (value) => {
  const match = String(value || '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const formatSemver = (parts) => `${parts[0]}.${parts[1]}.${parts[2]}`;

const bumpSemver = (base, bump) => {
  const parts = parseSemver(base);
  if (!parts) return null;
  const next = [...parts];
  if (bump === 'major') {
    next[0] += 1;
    next[1] = 0;
    next[2] = 0;
  } else if (bump === 'minor') {
    next[1] += 1;
    next[2] = 0;
  } else {
    next[2] += 1;
  }
  return formatSemver(next);
};

const listSemverTags = () => {
  try {
    const output = runQuiet('git tag --list');
    return output
      .split('\n')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag) => parseSemver(tag));
  } catch {
    return [];
  }
};

const getLatestTag = (tags) => {
  const parsed = tags
    .map((tag) => ({ tag, parts: parseSemver(tag) }))
    .filter((entry) => entry.parts);
  if (!parsed.length) return null;
  parsed.sort((a, b) => {
    for (let i = 0; i < 3; i += 1) {
      if (a.parts[i] !== b.parts[i]) return b.parts[i] - a.parts[i];
    }
    return 0;
  });
  return parsed[0].tag;
};

const ask = (rl, question) =>
  new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));

const parseBump = (input) => {
  const value = input.toLowerCase();
  if (!value || value === '1' || value === 'patch') return 'patch';
  if (value === '2' || value === 'minor') return 'minor';
  if (value === '3' || value === 'major') return 'major';
  if (value === '4' || value === 'custom') return 'custom';
  if (value === '5' || value === 'cancel') return 'cancel';
  return null;
};

const isValidVersion = (value) =>
  /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/.test(value);

const main = async () => {
  ensureGitRepo();
  ensureCleanTree();

  const currentVersion = readPackageVersion();
  const tags = listSemverTags();
  const latestTag = getLatestTag(tags);
  const baseVersion = latestTag ? latestTag.replace(/^v/, '') : currentVersion;

  console.log(`Current version: ${currentVersion}`);
  if (latestTag) {
    console.log(`Latest tag: ${latestTag}`);
  }
  console.log('Select bump: 1) patch 2) minor 3) major 4) custom 5) cancel');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const selection = parseBump(await ask(rl, 'Choice [1]: '));
  if (!selection) {
    console.log('Invalid option.');
    rl.close();
    process.exit(1);
  }
  if (selection === 'cancel') {
    console.log('Release cancelled.');
    rl.close();
    process.exit(0);
  }

  let versionArg = selection;
  if (selection === 'custom') {
    const custom = await ask(rl, 'Enter version (x.y.z): ');
    if (!isValidVersion(custom)) {
      console.log('Invalid version format.');
      rl.close();
      process.exit(1);
    }
    versionArg = custom;
  } else {
    const next = bumpSemver(baseVersion, selection);
    if (!next) {
      console.log(`Unable to determine next version from ${baseVersion}.`);
      rl.close();
      process.exit(1);
    }
    versionArg = next;
  }

  if (selection !== 'custom') {
    const tagSet = new Set(tags.map((tag) => tag.replace(/^v/, '')));
    let candidate = versionArg;
    while (tagSet.has(candidate)) {
      candidate = bumpSemver(candidate, 'patch');
      if (!candidate) break;
    }
    if (candidate && candidate !== versionArg) {
      console.log(`Tag ${versionArg} already exists. Using next available: ${candidate}`);
      versionArg = candidate;
    }
  }

  const runBuild = (await ask(rl, 'Run `npm run build` first? (y/N): ')).toLowerCase();
  if (runBuild === 'y' || runBuild === 'yes') {
    run('npm run build');
  }

  const confirm = (await ask(rl, `Run \`npm version ${versionArg}\`? (y/N): `)).toLowerCase();
  if (confirm !== 'y' && confirm !== 'yes') {
    console.log('Release cancelled.');
    rl.close();
    process.exit(0);
  }

  run(`npm version ${versionArg}`);

  const publish = (await ask(rl, 'Publish to npm now? (y/N): ')).toLowerCase();
  rl.close();
  if (publish === 'y' || publish === 'yes') {
    run('npm publish');
  }

  console.log('Next: push commit and tags with `git push --follow-tags`.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
