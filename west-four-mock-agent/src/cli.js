#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { searchInventory, getCustomer, listOpportunities, prepareBrief } from './data.js';

async function run(words) {
  const [action, ...rest] = words;
  const arg = rest.join(' ');
  switch (action) {
    case 'inventory': return searchInventory(arg);
    case 'customer': return getCustomer(arg);
    case 'pipeline': return listOpportunities(arg || undefined);
    case 'brief': return prepareBrief(arg);
    case 'help': return 'Commands: inventory <term>, customer <id>, pipeline [customer-id], brief <opportunity-id>, exit';
    default: return 'Unknown command. Type help.';
  }
}

const rl = createInterface({ input: stdin, output: stdout, terminal: true });
stdout.write('Fictional sales data demo. Type help.\n');
try {
  while (true) {
    const line = (await rl.question('sales> ')).trim();
    if (['exit', 'quit'].includes(line)) break;
    if (!line) continue;
    try {
      const result = await run(line.split(/\s+/));
      stdout.write(typeof result === 'string' ? result + '\n' : JSON.stringify(result, null, 2) + '\n');
    } catch (error) { stdout.write(`Error: ${error.message}\n`); }
  }
} finally { rl.close(); }
