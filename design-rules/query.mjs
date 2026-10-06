#!/usr/bin/env node
/**
 * Retrieval for the design rules store.
 *
 * Given the components present in a design, return exactly the rules that
 * apply to it. Deterministic: the same design always returns the same rules,
 * which is the property a conformance check needs. A check that silently
 * misses a rule is worse than no check.
 *
 * With --inventory it also returns what those components are: their variants,
 * their Figma node, and whatever usage prose exists. That is what lets an agent
 * compose from real components instead of inventing something plausible, and
 * what lets it tell "this does not exist" from "I did not find it".
 *
 *   node query.mjs --components Button,Badge
 *   node query.mjs --components Card --tokens --color-accent
 *   node query.mjs --components Button --inventory
 *   node query.mjs --inventory --all
 *   node query.mjs --all
 *   node query.mjs --status proposed
 */

import { listRules, listComponents, IndexMissingError } from './store.mjs';

function parseArgs(argv) {
  const args = { components: [], tokens: [], all: false, status: 'approved', inventory: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--components') args.components = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (argv[i] === '--tokens') args.tokens = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (argv[i] === '--status') args.status = argv[++i];
    else if (argv[i] === '--all') args.all = true;
    else if (argv[i] === '--inventory') args.inventory = true;
  }
  return args;
}

const { components, tokens, all, status, inventory } = parseArgs(process.argv.slice(2));

let rules;
try {
  rules = listRules({ components, tokens, all, status });
} catch (e) {
  if (e instanceof IndexMissingError) { console.error(e.message); process.exit(1); }
  throw e;
}

if (inventory) {
  const comps = listComponents(components);

  if (!comps.length && components.length) {
    console.log(`No component in the design system matches: ${components.join(', ')}`);
    console.log('Nothing here covers this. Treat it as a new pattern and route it for review.\n');
  }

  for (const c of comps) {
    console.log(`${c.name}`);
    console.log(`  source: ${c.source_path}`);
    console.log(`  figma:  ${c.figma_node ?? 'not mapped to Figma yet'}`);
    if (c.variants) console.log(`  variants: ${c.variants}`);
    if (c.usage_docs) {
      console.log('  usage:');
      for (const line of c.usage_docs.split('\n')) console.log(`    ${line}`);
    } else {
      console.log('  usage:  no documentation written for this component');
    }
    console.log('');
  }
  if (comps.length) console.log('-'.repeat(70) + '\n');
}

if (!rules.length) {
  console.log('No rules match.');
  process.exit(0);
}

const asked = [
  components.length ? `components: ${components.join(', ')}` : null,
  tokens.length ? `tokens: ${tokens.join(', ')}` : null,
].filter(Boolean).join('   ');

console.log(`${rules.length} rule${rules.length === 1 ? '' : 's'}${asked ? `  (${asked})` : ''}\n`);

for (const r of rules) {
  console.log(`[${r.strength.toUpperCase()}] ${r.id}   (${r.scope})`);
  console.log(`  ${r.text}`);
  const meta = [
    r.components ? `components: ${r.components}` : null,
    r.tokens ? `tokens: ${r.tokens}` : null,
    `source: ${r.source}`,
    r.approved_by ? `approved by ${r.approved_by} ${r.approved_on}` : 'NOT YET APPROVED',
  ].filter(Boolean);
  console.log(`  ${meta.join('  |  ')}\n`);
}
