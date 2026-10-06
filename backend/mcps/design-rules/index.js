/**
 * MCP server for the design rules store.
 *
 * Why this exists alongside query.mjs: the CLI needs a terminal and a checkout.
 * A designer working in Figma has neither. The MCP puts the same retrieval
 * behind a transport that a hosted agent can reach, which is the shape this
 * has to take to run anywhere but a developer's laptop.
 *
 * What it deliberately does NOT do: expose SQL. The sibling sql-mcp offers
 * execute_sql, which is right for exploring a shop database and wrong here.
 * The whole claim of this store is that the same design returns the same rules
 * every time, and an agent composing its own joins gives that away — it can
 * write a subtly wrong query, miss a MUST rule, and nothing ever reports it.
 * So the tools are typed and narrow: callers choose components and tokens, the
 * server owns the query.
 *
 * Writes go to YAML and rebuild the index. Never straight to SQLite. The one
 * write it does not expose is approval, which is a person's call (approve.mjs).
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { listRules, getRule, listComponents, listGaps, IndexMissingError, DB } from '../../../design-rules/store.mjs';
import { createRule, updateRule, deleteRule } from '../../../design-rules/write.mjs';

const server = new Server(
  { name: 'design-rules-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } },
);

const ruleFields = {
  text: {
    type: 'string',
    description:
      'The rule in plain language, written for a designer and an agent both. Carry the ' +
      'exceptions in the text — they are part of the rule.',
  },
  scope: {
    type: 'string',
    enum: ['component', 'pair', 'screen', 'global'],
    description: 'component: one component alone. pair: how components relate. screen: whole screen. global: everywhere.',
  },
  strength: {
    type: 'string',
    enum: ['must', 'should', 'consider'],
    description: 'How hard the rule is. Lets findings be ranked rather than dumped.',
  },
  source: {
    type: 'string',
    enum: ['session', 'inferred', 'proposed'],
    description:
      'Where the rule came from. session: a person stated it in conversation. inferred: derived ' +
      'from existing designs. proposed: the agent is suggesting it. Defaults to proposed.',
  },
  components: { type: 'array', items: { type: 'string' }, description: 'Components the rule touches. A pair rule lists both sides.' },
  tokens: { type: 'array', items: { type: 'string' }, description: 'Design tokens the rule governs, e.g. ["--color-accent"].' },
  rationale: { type: 'string', description: 'Why the rule exists, if it is not obvious from the text.' },
};

const toolDefinitions = [
  {
    name: 'list_rules',
    description:
      'List the design system rules that apply to a set of components and tokens. Global ' +
      'rules are always included. This is the retrieval path for reviewing or building a ' +
      'design: pass every component present and you get exactly the rules that govern it, ' +
      'ordered must → should → consider. Deterministic: the same inputs always return the same rules.',
    inputSchema: {
      type: 'object',
      properties: {
        components: { type: 'array', items: { type: 'string' }, description: 'Component names present in the design, e.g. ["Button","Badge","Card"].' },
        tokens: { type: 'array', items: { type: 'string' }, description: 'Design tokens in play, e.g. ["--color-accent"].' },
        all: { type: 'boolean', description: 'Return every rule regardless of what is in the design. For browsing, not for review.' },
        status: {
          type: 'string',
          enum: ['approved', 'proposed', 'retired', 'any'],
          description: 'Defaults to approved. Only approved rules should be enforced against a design.',
        },
      },
    },
  },
  {
    name: 'get_rule',
    description: 'Get one rule in full by id, including its rationale, provenance and approver.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string', description: 'The rule id, e.g. "card-no-nesting".' } },
    },
  },
  {
    name: 'create_rule',
    description:
      'Add a rule. Writes YAML to design-rules/rules/, validates with the real build, and ' +
      'rebuilds the index. Always written as proposed: it does not enforce until a person ' +
      'approves it. Validation rejects unknown component or token names and rolls the write ' +
      'back. Call list_rules for the components involved first: a rule that duplicates an ' +
      'existing one is worse than no rule, because the two can disagree.',
    inputSchema: {
      type: 'object',
      required: ['id', 'text', 'scope', 'strength'],
      properties: {
        id: { type: 'string', description: 'Stable kebab-case handle, e.g. "card-no-nesting".' },
        ...ruleFields,
      },
    },
  },
  {
    name: 'update_rule',
    description:
      'Change a rule. Pass only the fields that change. Changing the substance of an approved ' +
      'rule (text, scope, strength, components, tokens) sends it back to proposed, because the ' +
      'approval was for the old wording. Set status to "retired" to stop enforcing a rule ' +
      'without deleting it. Status cannot be set to approved here: approval is a person\'s call.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'The rule to change.' },
        ...ruleFields,
        status: { type: 'string', enum: ['proposed', 'retired'], description: 'Retire a rule, or bring a retired one back to proposed.' },
      },
    },
  },
  {
    name: 'delete_rule',
    description:
      'Remove a rule from the store entirely (git history keeps it). Prefer update_rule with ' +
      'status "retired" when it is worth knowing this was once the rule. Confirm with the ' +
      'person before deleting an approved rule.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string', description: 'The rule to delete.' } },
    },
  },
  {
    name: 'list_components',
    description:
      'List what the design system actually ships: source path, Figma node, variants, and ' +
      'usage documentation. Call this before composing with a component so you use a real ' +
      'variant rather than a plausible-sounding one. An empty result is a real answer: the ' +
      'component does not exist, and the element should be routed for review as a new pattern.',
    inputSchema: {
      type: 'object',
      properties: {
        names: { type: 'array', items: { type: 'string' }, description: 'Component names to look up. Omit to return the whole inventory.' },
      },
    },
  },
  {
    name: 'list_gaps',
    description:
      'Report where the rules store is thin: components no rule governs, components with no ' +
      'usage docs, components not mapped to Figma, rules awaiting approval. Maintenance view: ' +
      'a rules store degrades quietly, and these are the ways it does.',
    inputSchema: { type: 'object', properties: {} },
  },
];

function asResult(payload) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

function asErrorResult(error, fallbackMessage) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return { isError: true, content: [{ type: 'text', text: message }] };
}

function getArgumentsObject(value) {
  if (value === undefined) return {};
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Tool arguments must be a JSON object.');
  }
  return value;
}

const asArray = (v, field) => {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new Error(`Field "${field}" must be an array of strings when provided.`);
  return v.map(String);
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefinitions }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  let args;
  try {
    args = getArgumentsObject(request.params.arguments);
  } catch (error) {
    return asErrorResult(error, 'Invalid tool arguments.');
  }

  try {
    switch (request.params.name) {
      case 'list_rules': {
        const rules = listRules({
          components: asArray(args.components, 'components'),
          tokens: asArray(args.tokens, 'tokens'),
          all: args.all === true,
          status: args.status ?? 'approved',
        });
        return asResult({ count: rules.length, rules });
      }

      case 'get_rule': {
        const rule = getRule(String(args.id ?? ''));
        if (!rule) return asErrorResult(new Error(`No rule with id "${args.id}".`), 'Rule not found.');
        return asResult(rule);
      }

      case 'create_rule':
        return asResult(createRule({
          id: args.id,
          text: args.text,
          scope: args.scope,
          strength: args.strength,
          source: args.source,
          components: asArray(args.components, 'components'),
          tokens: asArray(args.tokens, 'tokens'),
          rationale: args.rationale,
        }));

      case 'update_rule': {
        const { id, ...changes } = args;
        if (changes.components !== undefined) changes.components = asArray(changes.components, 'components');
        if (changes.tokens !== undefined) changes.tokens = asArray(changes.tokens, 'tokens');
        return asResult(updateRule(String(id ?? ''), changes));
      }

      case 'delete_rule':
        return asResult(deleteRule(String(args.id ?? '')));

      case 'list_components': {
        const names = asArray(args.names, 'names');
        const components = listComponents(names);
        if (!components.length && names.length) {
          return asResult({
            count: 0,
            components: [],
            note:
              `No component in the design system matches: ${names.join(', ')}. ` +
              'Nothing here covers this. Treat it as a new pattern and route it for review ' +
              'rather than building something that resembles it.',
          });
        }
        return asResult({ count: components.length, components });
      }

      case 'list_gaps':
        return asResult(listGaps());

      default:
        return asErrorResult(new Error(`Tool not found: ${request.params.name}`), 'Tool not found.');
    }
  } catch (error) {
    if (error instanceof IndexMissingError) return asErrorResult(error, 'Rules index missing.');
    return asErrorResult(error, 'Unexpected design-rules tool error.');
  }
});

async function start() {
  // rules.db is generated and gitignored, so a fresh clone won't have it.
  // Build it rather than failing every tool call. Output goes to stderr so it
  // can't corrupt the MCP stream on stdout.
  if (!existsSync(DB)) {
    execFileSync('node', [new URL('../../../design-rules/build.mjs', import.meta.url).pathname], { stdio: ['ignore', 2, 2] });
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
