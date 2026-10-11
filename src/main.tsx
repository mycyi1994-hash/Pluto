import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { formatUnits, parseUnits } from 'viem';
import { BASKET, digest } from '../shared/basket.mjs';
import deployment from './deployment.json';
import { client, connect, wallet, tokenAbi, vaultAbi, type Address } from './wallet';
import './style.css';

type Row = typeof BASKET[number] & { value: string; multiplier: string; exposure: string; address: string; bid: string; ask: string; generatedAt: string; stale: boolean; halted: boolean };
type Snapshot = { evidence: { referenceNav: string; observedAt: string; constituents: Row[]; pricing: string; source: string }; hash: string };
const money = (v: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v));
const short = (s: string) => `${s.slice(0, 6)}…${s.slice(-4)}`;
const contract = deployment.vault as Address | null;
const tokens = deployment.tokens as { symbol: string; address: Address }[];

function App() {
  const [tab, setTab] = useState('Basket'), [snapshot, setSnapshot] = useState<Snapshot | null>(null), [error, setError] = useState('');
  const [account, setAccount] = useState<Address | null>(null), [shares, setShares] = useState('1'), [mode, setMode] = useState('Create');
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [hash, setHash] = useState(''), [verified, setVerified] = useState(false);
  const [balance, setBalance] = useState('0'), [supply, setSupply] = useState('0'), [holdings, setHoldings] = useState<string[]>([]);
  async function refresh() {
    try { const r = await fetch('/api/snapshot'); const data = await r.json(); if (!r.ok) throw new Error(data.error); setSnapshot(data); setError(''); setVerified(false); } catch (e) { setError((e as Error).message); }
  }
  async function refreshChain(a = account) {
    if (!contract) return;
    const total = await client.readContract({ address: contract, abi: vaultAbi, functionName: 'totalSupply' }); setSupply(formatUnits(total, 6));
    if (a) { const b = await client.readContract({ address: contract, abi: vaultAbi, functionName: 'balanceOf', args: [a] }); setBalance(formatUnits(b, 6)); }
    const held = await Promise.all(tokens.map(t => client.readContract({ address: t.address, abi: tokenAbi, functionName: 'balanceOf', args: [contract] })));
    setHoldings(held.map(v => formatUnits(v, 18)));
  }
  useEffect(() => { void refresh(); void refreshChain().catch(() => setStatus('Testnet RPC unavailable. Try again shortly.')); }, []);
  useEffect(() => {
    const changed = () => { setAccount(null); setBalance('0'); setStatus('Wallet changed. Connect again before transacting.'); };
    window.ethereum?.on?.('accountsChanged', changed); window.ethereum?.on?.('chainChanged', changed);
    return () => { window.ethereum?.removeListener?.('accountsChanged', changed); window.ethereum?.removeListener?.('chainChanged', changed); };
  }, []);
  async function link() { try { const a = await connect(); setAccount(a); await refreshChain(a); setStatus('Wallet connected. Transactions use Robinhood Chain Testnet.'); } catch (e) { setStatus((e as Error).message); } }
  async function transact(faucet = false) {
    setBusy(true); setHash('');
    try {
      if (!contract) throw new Error('Testnet contract deployment is not configured yet. Live issuer evidence is available.');
      const a = account || await connect(); setAccount(a); const w = await wallet(a);
      if (faucet) {
        for (const t of tokens) { setStatus(`Claim ${t.symbol} demo tokens in your wallet.`); const tx = await w.writeContract({ address:t.address,abi:tokenAbi,functionName:'faucet' }); const r=await client.waitForTransactionReceipt({hash:tx}); if(r.status!=='success')throw new Error('Demo token claim reverted.'); }
        setStatus('Demo tokens received. You can create your first basket.');
      } else {
        if (!/^\d+(\.\d{1,6})?$/.test(shares) || Number(shares) <= 0) throw new Error('Enter a positive amount with up to six decimals.');
        const amount = parseUnits(shares,6); const quote = await client.readContract({address:contract,abi:vaultAbi,functionName:'quote',args:[amount]});
        if(mode==='Create') for(let i=0;i<tokens.length;i++) {
          const allowance=await client.readContract({address:tokens[i].address,abi:tokenAbi,functionName:'allowance',args:[a,contract]});
          if(allowance<quote[0][i]) { setStatus(`Approve exactly ${formatUnits(quote[0][i],18)} ${tokens[i].symbol} demo tokens.`); const tx=await w.writeContract({address:tokens[i].address,abi:tokenAbi,functionName:'approve',args:[contract,quote[0][i]]}); const r=await client.waitForTransactionReceipt({hash:tx});if(r.status!=='success')throw new Error('Approval reverted.'); }
        }
        setStatus(`Confirm ${mode.toLowerCase()} in your wallet.`);
        const {request}=await client.simulateContract({account:a,address:contract,abi:vaultAbi,functionName:mode==='Create'?'create':'redeem',args:[amount,mode==='Create'?quote[0]:quote[1]]});
        const tx=await w.writeContract(request);setHash(tx);setStatus('Transaction submitted. Waiting for confirmation…');
        const receipt=await client.waitForTransactionReceipt({hash:tx});if(receipt.status!=='success')throw new Error('Transaction reverted. No settlement occurred.');
        setStatus(`${mode==='Create'?'Created':'Redeemed'} ${shares} PLUTO. Confirmed in block ${receipt.blockNumber}.`);
      }
      await refreshChain(a);
    } catch(e) {setStatus((e as {shortMessage?: string;message:string}).shortMessage || (e as Error).message);} finally {setBusy(false);}
  }
  async function verify() { if(snapshot) { const ok=await digest(snapshot.evidence)===snapshot.hash;setVerified(ok);setStatus(ok?'Evidence digest verified in your browser. This proves file integrity, not issuer accuracy.':'Evidence hash mismatch. Refresh before relying on this snapshot.'); } }
  function download() {if(!snapshot)return;const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pluto-evidence.json';a.click();URL.revokeObjectURL(url);}
  const rows=snapshot?.evidence.constituents || [], nav=Number(snapshot?.evidence.referenceNav || 0);
  let angle=0;const segments=rows.map(r=>{const start=angle;angle+=Number(r.value)/nav*100;return `${r.color} ${start}% ${angle}%`;}).join(',');
  return <div className="shell">
    <aside className="rail"><a className="brand" href="/"><img src="/pluto.svg" alt=""/>pluto<span>●</span></a><p className="rail-note">A clearer orbit<br/>for your assets.</p><nav aria-label="Main">{['Basket','Your position','Evidence'].map((t,i)=><button className={tab===t?'nav active':'nav'} key={t} onClick={()=>setTab(t)}><span aria-hidden="true">{['◉','▦','◇'][i]}</span>{t}</button>)}</nav><div className="rail-bottom"><span className="network-dot"/>Robinhood Chain<br/><small>Independent application</small><a href="https://github.com/mycyi1994-hash/Pluto" target="_blank" rel="noreferrer">Code & methodology ↗</a></div></aside>
    <main><header className="top"><div><span className="breadcrumb">Workspace /</span> {tab}</div><button className="wallet" onClick={link} disabled={busy}>{account?short(account):'Connect wallet'}</button></header>
      <div className="intro"><div><p className="section-note">The Stock Token basket</p><h1>Every share,<br/>accounted for.</h1><p>Five companies. One transparent basket.<br/>See what backs it, how it’s valued, and what you own.</p></div><div className="network-label"><span className="network-dot"/> Live issuer evidence<span>Settlement on testnet</span></div></div>
      {error&&<div className="notice error" role="alert">{error} <button onClick={refresh}>Retry issuer data</button></div>}
      {tab==='Basket'&&<><div className="workspace"><section className="basket-panel"><div className="panel-heading"><div><span className="pill">Core Five</span><h2>America’s builders.</h2></div><span className="ticker">PLUTO</span></div><div className="basket-visual"><div className="ring" style={{background:segments?`conic-gradient(${segments})`:'#dce9f5'}}><div><small>Reference NAV / share</small><strong>{snapshot?money(nav):'—'}</strong><span>Indicative, not a trade quote</span></div></div><div className="legend">{BASKET.map(b=><div key={b.symbol}><span style={{background:b.color}}/>{b.symbol}<b>{rows.length?(Number(rows.find(r=>r.symbol===b.symbol)?.value || 0)/nav*100).toFixed(1)+'%':'—'}</b></div>)}</div></div><div className="basket-foot"><span>Fixed token quantities</span><span>Fully redeemable in kind</span><span>No manager key</span></div></section>
      <section className="action-panel"><div className="switch" aria-label="Transaction type">{['Create','Redeem'].map(m=><button key={m} className={mode===m?'selected':''} onClick={()=>setMode(m)}>{m}</button>)}</div><h2>{mode==='Create'?'Your next basket.':'Back to the underlying.'}</h2><p>{mode==='Create'?'Deposit each constituent to receive PLUTO shares.':'Burn PLUTO to receive your portion of every constituent.'}</p><label htmlFor="shares">PLUTO shares</label><div className="amount"><input id="shares" inputMode="decimal" value={shares} onChange={e=>setShares(e.target.value)} aria-describedby="testnet-note"/><span>PLUTO</span></div><div className="summary"><span>Indicative reference value</span><b>{snapshot&&Number.isFinite(Number(shares))?money(nav*Number(shares)):'—'}</b></div><button className="primary" disabled={busy||!contract} onClick={()=>transact()}>{busy?'Check your wallet…':!contract?'Testnet deployment pending':`${mode} basket`}</button><p id="testnet-note" className="fine">Testnet demonstration. Demo tokens have no monetary value and are not Robinhood-issued Stock Tokens.</p><div className="action-links"><a href="https://faucet.testnet.chain.robinhood.com" target="_blank" rel="noreferrer">Get test ETH ↗</a><button disabled={busy||!contract} onClick={()=>transact(true)}>Get demo tokens</button></div></section></div>
      <section className="holdings"><div className="section-head"><div><h2>Inside every share</h2><p>Raw token units × corporate action multiplier × underlying price.</p></div><button className="text-button" onClick={refresh}>Refresh data ⟳</button></div><div className="table-scroll"><table><thead><tr><th>Company</th><th>Raw units</th><th>Issuer multiplier</th><th>Underlying exposure</th><th>Reference value</th><th>Source</th></tr></thead><tbody>{BASKET.map(b=>{const r=rows.find(row=>row.symbol===b.symbol);return <tr key={b.symbol}><td><span className="asset-icon" style={{background:b.color}}>{b.symbol[0]}</span><span><b>{b.symbol}</b><small>{b.name}</small></span></td><td>{b.units}</td><td>{r?Number(r.multiplier).toFixed(8)+'×':'—'}</td><td>{r?Number(r.exposure).toFixed(6):'—'}</td><td>{r?money(r.value):'—'}</td><td>{r?<a href={`https://robinhoodchain.blockscout.com/address/${r.address}`} target="_blank" rel="noreferrer">Issuer token ↗</a>:'Loading'}</td></tr>})}</tbody></table></div><div className="data-note">{!snapshot?'Waiting for issuer data.':rows.some(r=>r.stale)?'Some market quotes are older than 5 minutes. Markets may be closed; inspect timestamps before using the reference value.':'Issuer quotes are within the five-minute freshness window.'} {rows.some(r=>r.halted)&&'A constituent has an active trading halt.'}</div></section></>}
      {tab==='Your position'&&<section className="detail-panel"><h2>Your basket, on chain.</h2><p>Balances below are read directly from the testnet contracts.</p><div className="position-stats"><div><span>Your PLUTO</span><strong>{account?balance:'Connect wallet'}</strong></div><div><span>Total demo shares</span><strong>{contract?supply:'Not deployed'}</strong></div></div><div className="table-scroll"><table><thead><tr><th>Constituent</th><th>Raw units in vault</th><th>Contract</th></tr></thead><tbody>{tokens.map((t,i)=><tr key={t.symbol}><td>{t.symbol} demo</td><td>{holdings[i]||'0'}</td><td><a href={`${deployment.explorer}/address/${t.address}`} target="_blank" rel="noreferrer">{short(t.address)} ↗</a></td></tr>)}</tbody></table></div>{contract?<a href={`${deployment.explorer}/address/${contract}`} target="_blank" rel="noreferrer">Inspect the vault ↗</a>:<p>The deployment record will appear here once a contract is deployed.</p>}</section>}
      {tab==='Evidence'&&<section className="detail-panel"><div className="section-head"><div><h2>Don’t take our word for it.</h2><p>Download the inputs. Recompute the value. Verify the fingerprint.</p></div><span className="pill">{verified?'Integrity verified':'Browser verification'}</span></div><div className="explanation"><div><h3>Raw units stay raw.</h3><p>Robinhood’s corporate action multiplier changes economic exposure. Pluto accounts for it in reference value; it never mints extra vault collateral because a multiplier changes.</p></div><div><h3>Keep the sources distinct.</h3><p>The issuer REST midpoint is multiplied once. An already-adjusted oracle price must not be multiplied again. Reference NAV is informational; settlement uses collateral quantities.</p></div></div><dl><dt>Observed at</dt><dd>{snapshot?.evidence.observedAt||'Waiting for issuer data'}</dd><dt>Canonical SHA-256 digest</dt><dd className="digest">{snapshot?.hash||'—'}</dd><dt>Evidence source</dt><dd><a href="https://api.robinhood.com/rhj/assets" target="_blank" rel="noreferrer">Robinhood public asset & price API ↗</a></dd></dl><div className="proof-actions"><button className="primary" disabled={!snapshot} onClick={verify}>Verify in this browser</button><button className="secondary" disabled={!snapshot} onClick={download}>Download evidence JSON</button></div><div className="table-scroll"><table><thead><tr><th>Asset</th><th>Bid / ask</th><th>Quote timestamp</th><th>Freshness</th></tr></thead><tbody>{rows.map(r=><tr key={r.symbol}><td>{r.symbol}</td><td>{r.bid} / {r.ask}</td><td>{r.generatedAt}</td><td>{r.halted?'Halted':r.stale?'Older than 5 min':'Current'}</td></tr>)}</tbody></table></div></section>}
      {status&&<div className="status" role="status">{status}{hash&&<a href={`${deployment.explorer}/tx/${hash}`} target="_blank" rel="noreferrer"> View transaction ↗</a>}</div>}
      <footer><span>Pluto. Know what you hold.</span><p>Stock Tokens provide economic exposure and do not confer shareholder rights. Pluto is independent of Robinhood. Reference data on mainnet; demonstration contracts on testnet.</p></footer>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
