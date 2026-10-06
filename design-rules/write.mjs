/**
 * The write path: create, update and delete rules.
 *
 * Rules are written to YAML under rules/, never to SQLite. The database is a
 * derived index: a rule written straight into it disappears on the next
 * rebuild, and skips every validation the build performs. So every write
 * edits YAML, runs the real build in --check mode, rolls back if validation
 * fails, and rebuilds the index if it passes.
 *
 * Approval is deliberately not here. An agent can propose, edit and remove
 * rules, but only a person can approve one (approve.mjs), and the approval
 * carries their name. Editing an approved rule's substance sends it back to
 * proposed, because the approval was for the old wording.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseDocument } from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_DIR = join(HERE, 'rules');

export const SCOPES = ['component', 'pair', 'screen', 'global'];
export const STRENGTHS = ['must', 'should', 'consider'];
export const SOURCES = ['session', 'inferred', 'proposed'];

const fileFor = (scope) => join(RULES_DIR, `${scope}.yml`);

/** Ids are the stable handle for a rule, so they have to be readable and unique. */
function validateId(id) {
  if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    return `id must be lower-case kebab-case, e.g. "card-no-nesting" (got ${JSON.stringify(id)})`;
  }
  return null;
}

/**
 * Each scope's YAML as an editable document. Editing the document rather than
 * re-serializing plain objects keeps the files' comments and formatting, so a
 * one-rule change is a one-rule diff.
 */
function readDocs() {
  const docs = {};
  for (const scope of SCOPES) {
    const f = fileFor(scope);
    docs[scope] = parseDocument(existsSync(f) ? readFileSync(f, 'utf8') : 'rules: []\n');
    if (!docs[scope].get('rules')) docs[scope].set('rules', docs[scope].createNode([]));
  }
  return docs;
}

const rulesOf = (doc) => doc.get('rules').items;

function findRule(docs, id) {
  for (const scope of SCOPES) {
    const index = rulesOf(docs[scope]).findIndex((node) => node.get?.('id') === id);
    if (index !== -1) return { scope, index, rule: rulesOf(docs[scope])[index].toJSON() };
  }
  return null;
}

/** A rule node styled like the hand-written ones: folded prose, [a, b] lists, a blank line above. */
function ruleNode(doc, rule) {
  const node = doc.createNode(rule);
  for (const key of ['text', 'rationale']) {
    const scalar = node.get(key, true);
    if (scalar) scalar.type = 'BLOCK_FOLDED';
  }
  for (const key of ['components', 'tokens']) {
    const list = node.get(key, true);
    if (list) list.flow = true;
  }
  node.spaceBefore = true;
  return node;
}

const addRule = (doc, rule) => doc.get('rules').items.push(ruleNode(doc, rule));

/**
 * Apply a change to the YAML, validate with the real build, and roll back on
 * failure. The build is the same one CI runs; there is no second, weaker copy
 * of the validation rules here.
 */
function commit(docs, touchedScopes, result) {
  const backups = touchedScopes.map((scope) => {
    const f = fileFor(scope);
    const b = `${f}.bak`;
    copyFileSync(f, b);
    return [f, b];
  });

  try {
    for (const scope of touchedScopes) {
      // Match the hand-written files: prose folded at 80 columns, compact [a, b] lists.
      writeFileSync(fileFor(scope), docs[scope].toString({ lineWidth: 80, flowCollectionPadding: false }));
    }

    let output;
    try {
      output = execFileSync('node', [join(HERE, 'build.mjs'), '--check'], { encoding: 'utf8' });
    } catch (e) {
      for (const [f, b] of backups) copyFileSync(b, f);
      return {
        ok: false,
        stage: 'validation',
        problems: (e.stderr || e.stdout || String(e)).trim().split('\n').filter(Boolean),
        note: 'Nothing was written. Validation rejected the change, most often an unknown component or token name.',
      };
    }

    execFileSync('node', [join(HERE, 'build.mjs')], { encoding: 'utf8' });
    return { ok: true, ...result, validation: output.trim() };
  } finally {
    for (const [, b] of backups) if (existsSync(b)) unlinkSync(b);
  }
}

function checkFields({ text, scope, strength, source, components, tokens }, problems) {
  if (text !== undefined && !text?.trim()) problems.push('text is required: state the rule in plain language, including its exceptions');
  if (scope !== undefined && !SCOPES.includes(scope)) problems.push(`scope must be one of ${SCOPES.join(', ')}`);
  if (strength !== undefined && !STRENGTHS.includes(strength)) problems.push(`strength must be one of ${STRENGTHS.join(', ')}`);
  if (source !== undefined && !SOURCES.includes(source)) problems.push(`source must be one of ${SOURCES.join(', ')}`);
  if (scope !== undefined && scope !== 'global' && !components?.length && !tokens?.length) {
    problems.push('a non-global rule needs at least one component or token, or nothing will ever retrieve it');
  }
}

/** Add a rule. Always written as proposed. */
export function createRule({ id, text, scope, strength, source = 'proposed', components = [], tokens = [], rationale }) {
  const problems = [];
  const idProblem = validateId(id);
  if (idProblem) problems.push(idProblem);
  if (text === undefined) problems.push('text is required');
  if (scope === undefined) problems.push('scope is required');
  if (strength === undefined) problems.push('strength is required');
  checkFields({ text, scope, strength, source, components, tokens }, problems);
  if (problems.length) return { ok: false, stage: 'input', problems };

  const docs = readDocs();
  if (findRule(docs, id)) return { ok: false, stage: 'input', problems: [`a rule with id "${id}" already exists`] };

  const entry = { id, text: text.trim(), scope, strength, source, status: 'proposed' };
  if (components.length) entry.components = components;
  if (tokens.length) entry.tokens = tokens;
  if (rationale?.trim()) entry.rationale = rationale.trim();
  addRule(docs[scope], entry);

  return commit(docs, [scope], {
    action: 'created',
    id,
    status: 'proposed',
    note: 'Written as proposed. It does not enforce until a person approves it with `npm run rules:approve`.',
  });
}

/**
 * Change a rule. Only the fields passed change. Changing the substance of an
 * approved rule (text, scope, strength, components, tokens) sends it back to
 * proposed. Setting status to "retired" takes it out of enforcement without
 * deleting it; status can never be set to "approved" here.
 */
export function updateRule(id, changes) {
  const docs = readDocs();
  const found = findRule(docs, id);
  if (!found) return { ok: false, stage: 'input', problems: [`no rule with id "${id}"`] };

  const { status, ...fields } = changes;
  const problems = [];
  if (status !== undefined && !['proposed', 'retired'].includes(status)) {
    problems.push('status can only be set to "proposed" or "retired". Approval is a person\'s call: `npm run rules:approve`.');
  }

  const next = { ...found.rule };
  for (const key of ['text', 'scope', 'strength', 'source', 'components', 'tokens', 'rationale']) {
    if (fields[key] !== undefined) next[key] = typeof fields[key] === 'string' ? fields[key].trim() : fields[key];
  }
  if (next.components && !next.components.length) delete next.components;
  if (next.tokens && !next.tokens.length) delete next.tokens;
  if (next.rationale === '') delete next.rationale;
  checkFields({ ...next, components: next.components ?? [], tokens: next.tokens ?? [] }, problems);
  if (problems.length) return { ok: false, stage: 'input', problems };

  const substantive = ['text', 'scope', 'strength', 'components', 'tokens']
    .some((k) => JSON.stringify(next[k]) !== JSON.stringify(found.rule[k]));
  let reopened = false;
  if (status !== undefined) next.status = status;
  else if (substantive && found.rule.status === 'approved') {
    next.status = 'proposed';
    reopened = true;
  }
  if (next.status !== 'approved') {
    delete next.approved_by;
    delete next.approved_on;
  }

  if (next.scope === found.scope) {
    // Same file: replace in place so the rule keeps its position.
    docs[found.scope].get('rules').items[found.index] = ruleNode(docs[found.scope], next);
  } else {
    docs[found.scope].get('rules').items.splice(found.index, 1);
    addRule(docs[next.scope], next);
  }
  const touched = [...new Set([found.scope, next.scope])];

  return commit(docs, touched, {
    action: 'updated',
    id,
    status: next.status,
    note: reopened
      ? 'This rule was approved. Its substance changed, so it is back to proposed and needs approving again.'
      : undefined,
  });
}

/**
 * Remove a rule from the store entirely. The YAML is in git, so history keeps
 * it. Prefer updateRule with status "retired" when the rule might come back or
 * when it is worth knowing it was once the rule.
 */
export function deleteRule(id) {
  const docs = readDocs();
  const found = findRule(docs, id);
  if (!found) return { ok: false, stage: 'input', problems: [`no rule with id "${id}"`] };

  docs[found.scope].get('rules').items.splice(found.index, 1);
  return commit(docs, [found.scope], {
    action: 'deleted',
    id,
    was: { status: found.rule.status, approved_by: found.rule.approved_by },
  });
}
