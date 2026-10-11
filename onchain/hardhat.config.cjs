require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '../.env' });
const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async ({ solcVersion }) => ({ compilerPath: require.resolve('solc/soljson.js'), isSolcJs: true, version: solcVersion, longVersion: require('solc').version() }));
module.exports = {
  solidity: { version: '0.8.28', settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'cancun' } },
  networks: { hardhat: { chainId: 46630 }, localhost: { url: 'http://127.0.0.1:8545', chainId: 46630 }, robinhoodTestnet: { url: process.env.ROBINHOOD_RPC_URL || 'https://rpc.testnet.chain.robinhood.com', chainId: 46630, accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [] } }
};
