const fs = require('node:fs');
const { ethers, network } = require('hardhat');
async function main() {
  const chain = await ethers.provider.getNetwork();
  if (chain.chainId !== 46630n) throw new Error('Testnet chain guard failed');
  const symbols = ['AAPL','MSFT','NVDA','AMZN','TSLA'], units = ['0.08','0.04','0.12','0.08','0.04'];
  const tokens = [];
  for (const symbol of symbols) { const t = await (await ethers.getContractFactory('PlutoDemoStock')).deploy(symbol); await t.waitForDeployment(); tokens.push({ symbol, address: await t.getAddress() }); }
  const v = await (await ethers.getContractFactory('PlutoBasket')).deploy('Pluto Core Five Demo', 'PLUTO', tokens.map(t => t.address), units.map(ethers.parseEther));
  await v.waitForDeployment(); const receipt = await v.deploymentTransaction().wait();
  const result = { chainId:46630, network:'Robinhood Chain Testnet', rpc:network.config.url || 'http://127.0.0.1:8545', explorer:'https://explorer.testnet.chain.robinhood.com', vault:await v.getAddress(), tokens, transactionHash:receipt.hash, blockNumber:receipt.blockNumber, mode: network.name === 'localhost' ? 'local' : 'testnet-demo', deployedAt:new Date().toISOString() };
  fs.mkdirSync('deployments',{recursive:true}); fs.writeFileSync(`deployments/${network.name}.json`,JSON.stringify(result,null,2));
  if (network.name === 'robinhoodTestnet') fs.writeFileSync('../src/deployment.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
}
main().catch(e => { console.error(e.shortMessage || e.message); process.exitCode = 1; });
