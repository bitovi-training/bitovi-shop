/**
 * Shared retrieval for the design rules store.
 *
 * Both the CLI (query.mjs) and the MCP server read through here, so there is
 * exactly one join. Two copies of this logic would drift, and a conformance
 * check that disagrees with itself depending on how it was invoked is worse
 * than either answer alone.
 *
 * Everything is read-only. Writes go through write.mjs (YAML plus a rebuild),
 * never here.
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DB = join(HERE, 'rules.db');

export class IndexMissingError extends Error {
  constructor() {
    super('No rules index found. Run `node design-rules/build.mjs` to build it from rules/*.yml.');
    this.name = 'IndexMissingError';
  }
}

export function sql(query) {
  if (!existsSync(DB)) throw new IndexMissingError();
  const out = execFileSync('sqlite3', ['-json', DB, query], { encoding: 'utf8' }).trim();
  return out ? JSON.parse(out) : [];
}

export const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;

/**
 * The retrieval join.
 *
 * Global rules always apply, whatever is on the screen. Everything else comes
 * back because the design contains a component or token the rule is tagged
 * with. Same inputs, same rules, every time — which is the property a
 * conformance check needs. Ordering is by strength then scope so the caller
 * can report in the order findings should be read.
 */
export function listRules({ components = [], tokens = [], all = false, status = 'approved' } = {}) {
  const clauses = ["r.scope = 'global'"];
  if (components.length) {
    clauses.push(`r.id IN (SELECT rule_id FROM rule_components WHERE component IN (${components.map(esc).join(',')}))`);
  }
  if (tokens.length) {
    clauses.push(`r.id IN (SELECT rule_id FROM rule_tokens WHERE token IN (${tokens.map(esc).join(',')}))`);
  }

  const statusClause = status === 'any' ? '1=1' : `r.status = ${esc(status)}`;
  const where = all ? statusClause : `${statusClause} AND (${clauses.join(' OR ')})`;

  return sql(`
    SELECT r.id, r.text, r.scope, r.strength, r.source, r.status,
           r.approved_by, r.approved_on,
           (SELECT group_concat(component, ', ') FROM rule_components WHERE rule_id = r.id) AS components,
           (SELECT group_concat(token, ', ')     FROM rule_tokens     WHERE rule_id = r.id) AS tokens
    FROM rules r
    WHERE ${where}
    ORDER BY CASE r.strength WHEN 'must' THEN 1 WHEN 'should' THEN 2 ELSE 3 END,
             CASE r.scope WHEN 'global' THEN 1 WHEN 'screen' THEN 2 WHEN 'pair' THEN 3 ELSE 4 END,
             r.id
  `);
}

/**
 * One rule in full, including its rationale. For editing, explaining, or
 * citing a rule; not the retrieval path for a design (that's listRules).
 */
export function getRule(id) {
  const [rule] = sql(`
    SELECT r.id, r.text, r.rationale, r.scope, r.strength, r.source, r.status,
           r.approved_by, r.approved_on,
           (SELECT group_concat(component, ', ') FROM rule_components WHERE rule_id = r.id) AS components,
           (SELECT group_concat(token, ', ')     FROM rule_tokens     WHERE rule_id = r.id) AS tokens
    FROM rules r WHERE r.id = ${esc(id)}
  `);
  return rule ?? null;
}

/**
 * The component inventory.
 *
 * An agent without this cannot tell "this component does not exist" from "I
 * did not find it", so it invents something plausible and detaches from the
 * design system. Returning nothing for a name is a real answer.
 */
export function listComponents(names = []) {
  const where = names.length ? `WHERE c.name IN (${names.map(esc).join(',')})` : '';
  return sql(`
    SELECT c.name, c.source_path, c.figma_node, c.usage_docs, c.documented, c.code_connected,
           (SELECT group_concat(variant, ', ') FROM component_variants WHERE component = c.name) AS variants
    FROM components c ${where} ORDER BY c.name
  `);
}

/**
 * Maintenance view: where the store is thin.
 *
 * Not a search tool. These are the three ways a rules store quietly rots —
 * components nothing governs, components nobody documented, rules enforced
 * without an approver — and they are all answerable as queries.
 */
export function listGaps() {
  return {
    components_without_rules: sql(`
      SELECT c.name FROM components c
      WHERE c.name NOT IN (SELECT component FROM rule_components)
      ORDER BY c.name
    `).map((r) => r.name),

    components_without_docs: sql(`
      SELECT name FROM components WHERE documented = 0 ORDER BY name
    `).map((r) => r.name),

    components_not_in_figma: sql(`
      SELECT name FROM components WHERE code_connected = 0 ORDER BY name
    `).map((r) => r.name),

    rules_awaiting_approval: sql(`
      SELECT id, scope, strength, source FROM rules
      WHERE status = 'proposed' ORDER BY id
    `),

    approved_without_approver: sql(`
      SELECT id FROM rules WHERE status = 'approved' AND (approved_by IS NULL OR approved_by = '')
      ORDER BY id
    `).map((r) => r.id),
  };
}
