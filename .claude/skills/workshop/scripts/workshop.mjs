#!/usr/bin/env node
/**
 * Setup and reset for the workshop exercises, so every exercise starts from
 * the same state no matter what happened in the last one.
 *
 *   node .claude/skills/workshop/scripts/workshop.mjs start
 *   node .claude/skills/workshop/scripts/workshop.mjs setup <n>
 *   node .claude/skills/workshop/scripts/workshop.mjs reset <n>
 *   node .claude/skills/workshop/scripts/workshop.mjs done <n>
 *   node .claude/skills/workshop/scripts/workshop.mjs finish
 *
 * Everything happens on a workshop/<date> branch. The branch it started from
 * is remembered in git config (workshop.base) and is what reset restores to.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const npm = (...args) => execFileSync('npm', args, { cwd: ROOT, stdio: 'inherit' });
const path = (p) => join(ROOT, p);

const BUTTON = 'frontend/src/components/Button/Button.figma.ts';
const BADGE = 'frontend/src/components/Badge/Badge.figma.ts';
const RULE_ID = 'empty-state-one-way-forward';

// What each exercise may change, so reset can put exactly that back.
const PATHS = {
  1: [BUTTON, BADGE],
  2: ['design-rules/rules'],
  4: ['prototypes'],
  6: ['frontend', 'backend', 'shared'],
};

function base() {
  try {
    return git('config', '--get', 'workshop.base');
  } catch {
    fail('No workshop in progress. Run "start" first.');
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function start() {
  if (!existsSync(path('node_modules'))) npm('install');
  npm('run', '--silent', 'rules:build');

  const current = git('branch', '--show-current');
  if (current.startsWith('workshop/')) {
    console.log(`Already on ${current}. Carrying on.`);
    return;
  }
  if (git('status', '--porcelain')) {
    fail(`There are uncommitted changes on ${current}. Commit or stash them first, so the workshop starts clean.`);
  }

  const date = new Date().toISOString().slice(0, 10);
  const existing = git('branch', '--list', `workshop/${date}*`).split('\n').filter(Boolean);
  const name = existing.length ? `workshop/${date}-${existing.length + 1}` : `workshop/${date}`;
  git('checkout', '-b', name);
  git('config', 'workshop.base', current);
  console.log(`Ready. Working on ${name} (from ${current}); nothing here touches ${current}.`);
}

function setup(n) {
  base();
  if (n === 1) {
    rmSync(path(BADGE), { force: true });
    const button = readFileSync(path(BUTTON), 'utf8')
      .replace("'Accent':", "'Highlight':")
      .replace("'Accent Disabled':", "'Highlight Disabled':");
    writeFileSync(path(BUTTON), button);
    console.log('Exercise 1 set up: two Code Connect mappings changed.');
  } else if (n === 2) {
    // Only for when someone skips exercise 2 but wants 3: add the rule and approve it.
    const rules = readFileSync(path('design-rules/rules/screen.yml'), 'utf8');
    if (!rules.includes(`id: ${RULE_ID}`)) {
      execFileSync('node', ['--input-type=module', '-e', `
        import { createRule } from './design-rules/write.mjs';
        createRule({
          id: '${RULE_ID}',
          text: 'Every empty state says what is missing and offers exactly one way forward: a single button to somewhere useful. A page that only says there is nothing here is a dead end.',
          scope: 'screen',
          strength: 'should',
          source: 'session',
          components: ['Button'],
          rationale: 'Set by the design lead in a design review.',
        });
      `], { cwd: ROOT, stdio: 'inherit' });
    }
    npm('run', '--silent', 'rules:approve', '--', RULE_ID, '--by', 'Workshop');
    npm('run', '--silent', 'rules:build');
    console.log(`Exercise 2 set up: rule ${RULE_ID} added and approved.`);
  } else {
    console.log(`Exercise ${n} needs no setup.`);
  }
}

function reset(n) {
  const from = base();
  const paths = PATHS[n];
  if (!paths) return console.log(`Exercise ${n} changes nothing in the repo, so there's nothing to reset.`);
  // Put tracked files back as they were on the base branch, then remove
  // anything the exercise added that the base branch doesn't have.
  const added = git('diff', '--name-only', '--diff-filter=A', from, '--', ...paths).split('\n').filter(Boolean);
  if (added.length) git('rm', '-rfq', '--', ...added);
  git('checkout', from, '--', ...paths);
  git('clean', '-fdq', '--', ...paths);
  if (n === 2) npm('run', '--silent', 'rules:build');
  console.log(`Exercise ${n} reset to how it is on ${from}.`);
}

function done(n) {
  base();
  git('add', '-A');
  if (!git('status', '--porcelain')) return console.log(`Exercise ${n}: nothing to commit.`);
  git('commit', '-q', '-m', `Workshop exercise ${n}`);
  console.log(`Exercise ${n} committed to ${git('branch', '--show-current')}.`);
}

function finish() {
  const from = base();
  const branch = git('branch', '--show-current');
  done('final');
  git('checkout', from);
  git('config', '--unset', 'workshop.base');
  console.log(`Back on ${from}. Your work is still on ${branch}; delete it with: git branch -D ${branch}`);
}

const [command, arg] = process.argv.slice(2);
const n = arg === undefined ? undefined : Number(arg);
const commands = { start, setup, reset, done, finish };
if (!commands[command]) fail('Usage: workshop.mjs start | setup <n> | reset <n> | done <n> | finish');
commands[command](n);
