#!/usr/bin/env node
// Minimal MCP stdio server for learning. One JSON-RPC message per line.
import { searchInventory, getCustomer, getOpportunity, listOpportunities, prepareBrief } from './data.js';

const tools = [
  { name: 'search_inventory', description: 'Find fictional products by SKU, name, or category. Read-only.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false } },
  { name: 'get_customer', description: 'Retrieve a fictional customer by ID. Read-only.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } },
  { name: 'get_opportunity', description: 'Retrieve a fictional sales opportunity by ID. Read-only.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } },
  { name: 'list_opportunities', description: 'List fictional opportunities; optionally filter by customer ID. Read-only.',
    inputSchema: { type: 'object', properties: { customerId: { type: 'string' } }, additionalProperties: false } },
  { name: 'prepare_brief', description: 'Collect a fictional opportunity, customer, and stock positions for review. Read-only; no quote is issued.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } }
];
const handlers = {
  search_inventory: a => searchInventory(a.query), get_customer: a => getCustomer(a.id),
  get_opportunity: a => getOpportunity(a.id), list_opportunities: a => listOpportunities(a.customerId),
  prepare_brief: a => prepareBrief(a.id)
};
function send(message) { process.stdout.write(JSON.stringify(message) + '\n'); }
async function handle(request) {
  if (!request || request.jsonrpc !== '2.0') return;
  if (request.id === undefined) return; // Notifications have no response.
  const { id, method, params = {} } = request;
  try {
    let result;
    if (method === 'initialize') result = { protocolVersion: '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'mock-sales-data', version: '0.1.0' } };
    else if (method === 'ping') result = {};
    else if (method === 'tools/list') result = { tools };
    else if (method === 'tools/call') {
      if (!Object.hasOwn(handlers, params.name)) throw new Error('Unknown tool');
      const args = params.arguments ?? {};
      const spec = tools.find(x => x.name === params.name).inputSchema;
      if (typeof args !== 'object' || args === null || Array.isArray(args) ||
          spec.required?.some(key => typeof args[key] !== 'string' || !args[key].trim()) ||
          Object.keys(args).some(key => !Object.hasOwn(spec.properties, key) || typeof args[key] !== 'string')) {
        throw new Error('Invalid arguments');
      }
      const data = await handlers[params.name](args);
      result = { content: [{ type: 'text', text: JSON.stringify(data) }] };
    } else { send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } }); return; }
    send({ jsonrpc: '2.0', id, result });
  } catch (error) {
    if (method === 'tools/call') send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: error.message }], isError: true } });
    else send({ jsonrpc: '2.0', id, error: { code: -32603, message: error.message } });
  }
}
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
    if (!line.trim()) continue;
    try { void handle(JSON.parse(line)); }
    catch { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  }
});
