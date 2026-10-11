import { BASKET, valueConstituent, decimal, format, digest } from '../shared/basket.mjs';
import deployment from '../src/deployment.json';

const API = 'https://api.robinhood.com/rhj';
async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000), cf: { cacheTtl: 15, cacheEverything: true } });
  if (!response.ok) throw new Error(`Issuer API returned ${response.status}`);
  return response.json();
}
function json(body, status = 200) { return Response.json(body, { status, headers: { 'Cache-Control': status === 200 ? 'public, max-age=15' : 'no-store', 'X-Content-Type-Options': 'nosniff', 'Access-Control-Allow-Origin': '*' } }); }
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
    if (url.pathname === '/api/health') return json({ app: 'Pluto', chainId: 46630, deployment });
    if (url.pathname === '/api/snapshot') {
      try {
        const [catalog, ...quotes] = await Promise.all([getJson(`${API}/assets`), ...BASKET.map(a => getJson(`${API}/prices/${a.symbol}`))]);
        const now = Date.now();
        const constituents = BASKET.map((b, i) => {
          const asset = catalog.assets.find(a => a.tokenSymbol === b.symbol);
          const quote = quotes[i].quotes?.find(q => q.tokenSymbol === b.symbol);
          if (!asset || !quote) throw new Error(`Missing issuer data for ${b.symbol}`);
          return valueConstituent(b, asset, quote, now);
        });
        const evidence = { version: 1, product: 'PLUTO Core Five', observedAt: new Date(now).toISOString(), source: API, pricing: 'Underlying midpoint × issuer multiplier × raw token units', referenceChainId: 4663, constituents, referenceNav: format(constituents.reduce((sum, row) => sum + decimal(row.value), 0n)) };
        return json({ evidence, hash: await digest(evidence), deployment });
      } catch (error) { return json({ error: 'Live issuer data is temporarily unavailable.', detail: error.message }, 503); }
    }
    return json({ error: 'Not found' }, 404);
  }
};
