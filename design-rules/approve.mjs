#!/usr/bin/env node
/**
 * Approve a proposed rule. For people, not agents.
 *
 * This is the one write the MCP server does not expose. An agent can propose,
 * edit and retire rules, but a rule only enforces once a person with standing
 * says so, and the approval carries their name. Keeping it out of the agent's
 * tools is what makes "approved" mean something.
 *
 *   npm run rules:approve -- <rule-id> [more-ids...] --by "Levi"
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseDocument } from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_DIR = join(HERE, 'rules');

const args = process.argv.slice(2);
const byIndex = args.indexOf('--by');
const by = byIndex !== -1 ? args[byIndex + 1] : undefined;
const ids = args.filter((a, i) => !a.startsWith('--') && i !== byIndex + 1);

if (!ids.length || !by) {
  console.error('Usage: npm run rules:approve -- <rule-id> [more-ids...] --by "Your Name"');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const pending = new Set(ids);

for (const file of readdirSync(RULES_DIR).filter((f) => f.endsWith('.yml'))) {
  const path = join(RULES_DIR, file);
  // Edit the document in place so the file keeps its comments and formatting.
  const doc = parseDocument(readFileSync(path, 'utf8'));
  let changed = false;

  for (const rule of doc.get('rules')?.items ?? []) {
    const id = rule.get?.('id');
    if (!pending.has(id)) continue;
    pending.delete(id);
    if (rule.get('status') === 'approved') {
      console.log(`${id}: already approved by ${rule.get('approved_by')}`);
      continue;
    }
    rule.set('status', 'approved');
    rule.set('approved_by', by);
    rule.set('approved_on', today);
    changed = true;
    console.log(`${id}: approved`);
  }

  if (changed) writeFileSync(path, doc.toString({ lineWidth: 80, flowCollectionPadding: false }));
}

for (const id of pending) console.error(`${id}: no rule with this id`);
execFileSync('node', [join(HERE, 'build.mjs')], { stdio: 'inherit' });
process.exit(pending.size ? 1 : 0);
