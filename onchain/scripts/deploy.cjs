const fs = require('node:fs');
const { ethers, network } = require('hardhat');
async function main() {
  const chain = await ethers.provider.getNetwork();
  if (chain.chainId !== 46630n) throw new Error('Testnet chain guard failed');
  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error('Set DEPLOYER_PRIVATE_KEY in the project .env file.');
  if (await ethers.provider.getBalance(deployer.address) === 0n) throw new Error(`Robinhood Testnet ETH is required at ${deployer.address}. No contract has been deployed.`);
  const symbols = ['AAPL','MSFT','NVDA','AMZN','TSLA'], units = ['0.08','0.04','0.12','0.08','0.04'];
  const tokens = [];
  for (const symbol of symbols) { const t = await (await ethers.getContractFactory('PlutoDemoStock')).deploy(symbol); await t.waitForDeployment(); tokens.push({ symbol, address: await t.getAddress() }); }
  const v = await (await ethers.getContractFactory('PlutoBasket')).deploy('Pluto Core Five Demo', 'PLUTO', tokens.map(t => t.address), units.map(ethers.parseEther));
  await v.waitForDeployment(); const receipt = await v.deploymentTransaction().wait();
  const local = ['localhost','hardhat'].includes(network.name);
  const result = { chainId:46630, network:local?'Local development chain':'Robinhood Chain Testnet', rpc:network.config.url || 'http://127.0.0.1:8545', explorer:local?'':'https://explorer.testnet.chain.robinhood.com', vault:await v.getAddress(), tokens, transactionHash:receipt.hash, blockNumber:receipt.blockNumber, mode:local?'local':'testnet-demo', deployedAt:new Date().toISOString() };
  fs.mkdirSync('deployments',{recursive:true}); fs.writeFileSync(`deployments/${network.name}.json`,JSON.stringify(result,null,2));
  if (network.name === 'robinhoodTestnet') fs.writeFileSync('../src/deployment.json',JSON.stringify(result,null,2));
  // Validate the complete path on the disposable local chain, without publishing
  // its addresses as a real testnet deployment.
  if (network.name === 'hardhat') {
    for (const item of tokens) { const token=await ethers.getContractAt('PlutoDemoStock',item.address); await (await token.faucet()).wait(); await (await token.approve(result.vault,ethers.parseEther('1'))).wait(); }
    await (await v.create(1000000,units.map(ethers.parseEther))).wait();
    const [,minimum]=await v.quote(1000000);await (await v.redeem(1000000,Array.from(minimum))).wait();
    if (await v.totalSupply() !== 0n) throw new Error('Local create/redeem validation failed');
    console.log('Local deployment, faucet, approvals, creation and full redemption passed.');
  }
  console.log(JSON.stringify(result,null,2));
}
main().catch(e => { console.error(e.shortMessage || e.message); process.exitCode = 1; });
