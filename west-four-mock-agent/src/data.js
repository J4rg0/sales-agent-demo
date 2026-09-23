import { readFile } from 'node:fs/promises';

const root = new URL('../data/', import.meta.url);
async function records(name) {
  return JSON.parse(await readFile(new URL(name + '.json', root), 'utf8'));
}
function matches(value, query) { return value.toLowerCase().includes(query.toLowerCase()); }

export async function searchInventory(query) {
  if (!query || typeof query !== 'string') throw new Error('query must be a nonempty string');
  const stock = await records('inventory');
  return stock.filter(item => [item.sku, item.name, item.category].some(x => matches(x, query)));
}
export async function getCustomer(id) {
  if (!id || typeof id !== 'string') throw new Error('id must be a nonempty string');
  return (await records('customers')).find(x => x.id.toLowerCase() === id.toLowerCase()) ?? null;
}
export async function getOpportunity(id) {
  if (!id || typeof id !== 'string') throw new Error('id must be a nonempty string');
  return (await records('opportunities')).find(x => x.id.toLowerCase() === id.toLowerCase()) ?? null;
}
export async function listOpportunities(customerId) {
  const opportunities = await records('opportunities');
  return customerId ? opportunities.filter(x => x.customerId.toLowerCase() === customerId.toLowerCase()) : opportunities;
}
export async function prepareBrief(id) {
  const opportunity = await getOpportunity(id);
  if (!opportunity) return null;
  const customer = await getCustomer(opportunity.customerId);
  const inventory = await records('inventory');
  const items = opportunity.items.map(line => {
    const item = inventory.find(x => x.sku === line.sku);
    return { ...line, name: item?.name ?? null, available: item?.available ?? null,
      unit: item?.unit ?? null, priceCad: item?.priceCad ?? null,
      shortage: item ? Math.max(0, line.quantity - item.available) : null };
  });
  return { opportunity, customer, items, priceNote: 'Illustrative unit prices only. No taxes, delivery, labour, or discounts included.' };
}
