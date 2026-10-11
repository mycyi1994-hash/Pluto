import { createPublicClient, createWalletClient, custom, defineChain, http, parseAbi } from 'viem';
import config from './deployment.json';
export type Address = `0x${string}`;
export type Provider = { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?: (event: string, callback: (...args: unknown[]) => void) => void; removeListener?: (event: string, callback: (...args: unknown[]) => void) => void };
declare global { interface Window { ethereum?: Provider } }
export const chain = defineChain({ id: 46630, name: 'Robinhood Chain Testnet', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [config.rpc] } }, blockExplorers: { default: { name: 'Explorer', url: config.explorer } } });
export const client = createPublicClient({ chain, transport: http() });
export const tokenAbi = parseAbi(['function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)', 'function approve(address,uint256) returns (bool)', 'function faucet()']);
export const vaultAbi = parseAbi(['function balanceOf(address) view returns (uint256)', 'function totalSupply() view returns (uint256)', 'function quote(uint256) view returns (uint256[] createIn,uint256[] redeemOut)', 'function create(uint256,uint256[])', 'function redeem(uint256,uint256[])']);
export async function connect() {
  if (!window.ethereum) throw new Error('Open Pluto in an EVM wallet browser or install a browser wallet.');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as Address[];
  if (!accounts[0]) throw new Error('No wallet account was selected.');
  return accounts[0];
}
export async function wallet(account: Address) {
  if (!window.ethereum) throw new Error('Wallet unavailable.');
  try { await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xb626' }] }); }
  catch (e) {
    if ((e as {code?: number}).code !== 4902) throw e;
    await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0xb626', chainName: chain.name, nativeCurrency: chain.nativeCurrency, rpcUrls: [config.rpc], blockExplorerUrls: [config.explorer] }] });
  }
  const id = await window.ethereum.request({ method: 'eth_chainId' });
  if (id !== '0xb626') throw new Error('Switch to Robinhood Chain Testnet before continuing.');
  const current = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
  if (current[0]?.toLowerCase() !== account.toLowerCase()) throw new Error('Wallet account changed. Reconnect to continue.');
  return createWalletClient({ account, chain, transport: custom(window.ethereum) });
}
