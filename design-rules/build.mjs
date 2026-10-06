#!/usr/bin/env node
/**
 * Build the rules index from source.
 *
 * The YAML files under rules/ are the source of truth: they live in git, they
 * diff readably, and a designer can review a rule change in a pull request.
 * SQLite is a derived index, rebuilt from them, so retrieval can be a real
 * query rather than a scan. Delete rules.db at any time and run this again.
 *
 * Validation runs first. A rule that references a component that does not
 * exist, or a token that is not in the stylesheet, is a rule that will never
 * match anything — silent dead weight in a conformance check. Better to fail
 * the build.
 *
 * Two things get indexed:
 *   - rules, authored as YAML under rules/
 *   - the component inventory, extracted from the codebase and docs/components
 *
 * The inventory is never hand-written. Components come from the source tree,
 * variants from the exported *_VARIANTS maps, Figma node ids from Code Connect,
 * and usage prose from docs/components. All of it stays maintained where the
 * team already maintains it.
 *
 *   node build.mjs           build the index
 *   node build.mjs --check   validate only, exit non-zero on error
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, unlinkSync, existsSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const RULES_DIR = join(HERE, 'rules');
const DB = join(HERE, 'rules.db');
const checkOnly = process.argv.includes('--check');

const SCOPES = ['component', 'pair', 'screen', 'global'];
const STRENGTHS = ['must', 'should', 'consider'];
const SOURCES = ['session', 'inferred', 'proposed'];
const STATUSES = ['proposed', 'approved', 'retired'];

/**
 * Components the design system actually ships, read from the codebase.
 *
 * Deliberately the component source files rather than the Code Connect
 * mappings: a component can exist and be used without yet being mapped to
 * Figma (Card, Rating and Toast are in exactly that state here), and a rule
 * about it is still a real rule.
 */
function knownComponents() {
  const found = new Set();
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/^[A-Z]\w*\.jsx$/.test(e.name)) found.add(e.name.replace('.jsx', ''));
    }
  };
  walk(join(ROOT, 'frontend', 'src'));
  return found;
}

/** Tokens the stylesheet actually defines. */
function knownTokens() {
  const css = readFileSync(join(ROOT, 'frontend', 'src', 'styles.css'), 'utf8');
  return new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]));
}

/**
 * Full inventory for each component: where it lives, what variants it ships,
 * whether Figma knows about it, and whatever usage prose has been written.
 */
function buildInventory() {
  const inv = new Map();

  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }

      const m = /^([A-Z]\w*)\.jsx$/.exec(e.name);
      if (!m) continue;
      const name = m[1];
      const src = readFileSync(p, 'utf8');

      // Variants come from the exported map, e.g. BUTTON_VARIANTS = { ... }.
      // Reading them from source means the inventory cannot drift from what
      // the component actually accepts.
      const variants = [];
      const block = new RegExp(`export const ${name.toUpperCase()}_VARIANTS\\s*=\\s*\\{([^}]*)\\}`, 'i').exec(src);
      if (block) for (const v of block[1].matchAll(/'([^']+)'/g)) variants.push(v[1]);

      inv.set(name, {
        name,
        source_path: p.replace(ROOT + '/', ''),
        variants,
        figma_node: null,
        usage_docs: null,
      });
    }
  };
  walk(join(ROOT, 'frontend', 'src'));

  // Figma node ids, from the Code Connect header comment.
  const walkCC = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) { walkCC(p); continue; }
      if (!e.name.endsWith('.figma.ts')) continue;
      const name = e.name.replace('.figma.ts', '');
      const node = /node-id=([\w-]+)/.exec(readFileSync(p, 'utf8'));
      if (inv.has(name) && node) inv.get(name).figma_node = node[1];
    }
  };
  walkCC(join(ROOT, 'frontend', 'src'));

  // Usage prose, from wherever the team writes it. Frontmatter is stripped;
  // the body is stored whole.
  const docsDir = join(ROOT, 'docs', 'components');
  if (existsSync(docsDir)) {
    for (const f of readdirSync(docsDir).filter((f) => f.endsWith('.md'))) {
      const name = f.replace('.md', '');
      if (!inv.has(name)) { errors.push(`docs/components/${f} — no component named "${name}" in the codebase`); continue; }
      const raw = readFileSync(join(docsDir, f), 'utf8');
      inv.get(name).usage_docs = raw.replace(/^---[\s\S]*?---\n/, '').trim();
    }
  }

  return inv;
}

const errors = [];
const inventory = buildInventory();
const components = new Set(inventory.keys());
const tokens = knownTokens();

const rules = [];

for (const file of readdirSync(RULES_DIR).filter((f) => f.endsWith('.yml')).sort()) {
  const doc = parse(readFileSync(join(RULES_DIR, file), 'utf8'));
  for (const r of doc?.rules ?? []) {
    const where = `${file}: ${r.id ?? '(no id)'}`;
    if (!r.id) errors.push(`${where} — missing id`);
    if (!r.text?.trim()) errors.push(`${where} — missing text`);
    if (!SCOPES.includes(r.scope)) errors.push(`${where} — scope must be one of ${SCOPES.join(', ')}`);
    if (!STRENGTHS.includes(r.strength)) errors.push(`${where} — strength must be one of ${STRENGTHS.join(', ')}`);
    if (!SOURCES.includes(r.source)) errors.push(`${where} — source must be one of ${SOURCES.join(', ')}`);
    if (!STATUSES.includes(r.status)) errors.push(`${where} — status must be one of ${STATUSES.join(', ')}`);

    // An approved rule needs a name attached to the approval. Otherwise the
    // audit trail says a rule is enforced but not who decided that.
    if (r.status === 'approved' && !r.approved_by) errors.push(`${where} — approved with no approved_by`);

    // A rule nothing can retrieve is dead weight.
    const untagged = !(r.components?.length) && !(r.tokens?.length) && r.scope !== 'global';
    if (untagged) errors.push(`${where} — no components or tokens, so nothing will ever retrieve it`);

    for (const c of r.components ?? []) {
      if (!components.has(c)) errors.push(`${where} — unknown component "${c}"`);
    }
    for (const t of r.tokens ?? []) {
      if (!tokens.has(t)) errors.push(`${where} — unknown token "${t}"`);
    }
    rules.push(r);
  }
}

const ids = rules.map((r) => r.id);
for (const id of new Set(ids)) {
  if (ids.filter((x) => x === id).length > 1) errors.push(`duplicate id "${id}"`);
}

if (errors.length) {
  console.error(`${errors.length} problem${errors.length === 1 ? '' : 's'}:\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const documented = [...inventory.values()].filter((c) => c.usage_docs).length;
const connected = [...inventory.values()].filter((c) => c.figma_node).length;
console.log(
  `${rules.length} rules valid\n` +
  `${inventory.size} components  (${connected} mapped to Figma, ${documented} with usage docs)`
);
if (checkOnly) process.exit(0);

const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
const stmts = [readFileSync(join(HERE, 'schema.sql'), 'utf8'), 'DELETE FROM rules;', 'DELETE FROM components;'];

for (const r of rules) {
  stmts.push(
    `INSERT INTO rules (id, text, rationale, scope, strength, source, status, approved_by, approved_on) VALUES (` +
    `${esc(r.id)}, ${esc(r.text.trim())}, ${r.rationale?.trim() ? esc(r.rationale.trim()) : 'NULL'}, ` +
    [r.scope, r.strength, r.source, r.status].map(esc).join(', ') +
    `, ${r.approved_by ? esc(r.approved_by) : 'NULL'}, ${r.approved_on ? esc(r.approved_on) : 'NULL'});`
  );
  for (const c of r.components ?? []) stmts.push(`INSERT INTO rule_components VALUES (${esc(r.id)}, ${esc(c)});`);
  for (const t of r.tokens ?? []) stmts.push(`INSERT INTO rule_tokens VALUES (${esc(r.id)}, ${esc(t)});`);
}

for (const c of inventory.values()) {
  stmts.push(
    `INSERT INTO components (name, source_path, figma_node, usage_docs, documented, code_connected) VALUES (` +
    [c.name, c.source_path].map(esc).join(', ') +
    `, ${c.figma_node ? esc(c.figma_node) : 'NULL'}` +
    `, ${c.usage_docs ? esc(c.usage_docs) : 'NULL'}` +
    `, ${c.usage_docs ? 1 : 0}, ${c.figma_node ? 1 : 0});`
  );
  for (const v of c.variants) stmts.push(`INSERT INTO component_variants VALUES (${esc(c.name)}, ${esc(v)});`);
}

if (existsSync(DB)) unlinkSync(DB);
const tmp = join(mkdtempSync(join(tmpdir(), 'rules-')), 'build.sql');
writeFileSync(tmp, stmts.join('\n'));
execFileSync('sqlite3', [DB, `.read ${tmp}`]);

console.log(`built ${DB.replace(ROOT + '/', '')}`);
