export const BASKET = Object.freeze([
  { symbol: 'AAPL', name: 'Apple', units: '0.08', color: '#2464dc' },
  { symbol: 'MSFT', name: 'Microsoft', units: '0.04', color: '#6a87bb' },
  { symbol: 'NVDA', name: 'NVIDIA', units: '0.12', color: '#13775d' },
  { symbol: 'AMZN', name: 'Amazon', units: '0.08', color: '#f3a55a' },
  { symbol: 'TSLA', name: 'Tesla', units: '0.04', color: '#a493ce' },
]);
export const SCALE = 10n ** 18n;
export function decimal(value, places = 18) {
  if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value)) throw new Error('Invalid decimal');
  const [a, b = ''] = value.split('.');
  if (b.length > places && /[1-9]/.test(b.slice(places))) throw new Error('Excess precision');
  return BigInt(a) * 10n ** BigInt(places) + BigInt(b.slice(0, places).padEnd(places, '0'));
}
export function format(value, places = 18) {
  const scale = 10n ** BigInt(places), n = BigInt(value);
  return `${n / scale}.${(n % scale).toString().padStart(places, '0')}`.replace(/\.?0+$/, '');
}
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  return '0x' + Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export function valueConstituent(basket, asset, quote, now = Date.now()) {
  const deployment = asset.deployments?.find(d => d.chainId === 4663);
  if (!deployment || asset.tokenDecimals !== 18 || asset.tokenSymbol !== basket.symbol || quote.tokenSymbol !== basket.symbol) throw new Error(`Unverified asset: ${basket.symbol}`);
  const bid = decimal(quote.bid), ask = decimal(quote.ask), multiplier = decimal(asset.currentMultiplier);
  if (bid <= 0n || ask < bid || multiplier <= 0n || quote.currency !== 'USD') throw new Error(`Invalid market: ${basket.symbol}`);
  const at = Date.parse(quote.generatedAt);
  if (!Number.isFinite(at) || at > now + 60_000) throw new Error('Invalid quote timestamp');
  const raw = decimal(basket.units);
  // The REST quote is the underlying share price, not the already-adjusted Chainlink token price.
  const exposure = raw * multiplier / SCALE;
  const mark = (bid + ask) / 2n;
  return { ...basket, address: deployment.contractAddress, chainId: 4663, rawUnits: raw.toString(), multiplier: asset.currentMultiplier, exposure: format(exposure), bid: quote.bid, ask: quote.ask, value: format(exposure * mark / SCALE), generatedAt: quote.generatedAt, halted: !!quote.isTradingHalt, stale: now - at > 300_000, status: asset.status };
}
