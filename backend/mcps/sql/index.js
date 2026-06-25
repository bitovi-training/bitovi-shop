import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { executeSql, getSchema } from './backendClient.js';

const server = new Server(
  {
    name: 'sql',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const toolDefinitions = [
  {
    name: 'execute_sql',
    description: 'Execute SQL against the live Bitovi Shop database through the backend harness.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string', minLength: 1 },
        params: { type: 'array', items: {} },
      },
    },
  },
  {
    name: 'get_schema',
    description: 'Inspect table and column metadata for the live Bitovi Shop database.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

function asResult(payload) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
}

function asErrorResult(error, fallbackMessage) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
}

function getArgumentsObject(value) {
  if (value === undefined) {
    return {};
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Tool arguments must be a JSON object.');
  }

  return value;
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = getArgumentsObject(request.params.arguments);

  switch (request.params.name) {
    case 'execute_sql': {
      const sql = args.sql;
      const params = args.params;
      const effectiveSql = typeof sql === 'string' && sql.trim().length > 0 ? sql : 'SELECT * FROM todos ORDER BY id ASC';
      const effectiveParams = Array.isArray(params) ? params : [];

      if (params !== undefined && !Array.isArray(params)) {
        return asErrorResult(new Error('Field "params" must be an array when provided.'), 'Invalid SQL params.');
      }

      try {
        return asResult(await executeSql(effectiveSql, effectiveParams));
      } catch (error) {
        return asErrorResult(error, 'Unexpected SQL tool error.');
      }
    }

    case 'get_schema':
      try {
        return asResult(await getSchema());
      } catch (error) {
        return asErrorResult(error, 'Unexpected schema tool error.');
      }

    default:
      return asErrorResult(new Error(`Tool not found: ${request.params.name}`), 'Tool not found.');
  }
});

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
