# Validation — 11 October 2026

- TypeScript check, Vite production build and lint pass.
- Four pricing/evidence tests pass.
- Five vault tests pass, including collateral creation/redemption and rounding behavior.
- Cloudflare Worker deployed at https://pluto-robinhood.gana003.workers.dev.
- Live API returns all five constituent records, reference NAV and canonical digest.
- Browser evidence verification confirms the digest. Testnet transaction controls accurately show the undeployed state.
- A disposable local-chain deployment completed all five token deployments, vault deployment, faucets, approvals, share creation and full redemption. Local addresses are ignored by Git and never published as the live testnet manifest.
- GitHub Actions Verify Pluto passed for the published repository.

Outstanding: Robinhood Testnet gas funding, real-chain contract deployment and create/redeem receipts. Source code tests do not substitute for these. No deployed vault address is claimed until the manifest is populated by the deployment script.

Deployment wallet: 0x83807fADf119f22A8B062ba19588F6c19B7Fbe25 (Robinhood Chain Testnet, 46630). The official faucet did not render its request form in either tested browser. An alternate faucet did not complete eligibility checking. The wallet's testnet ETH balance remains zero. No mainnet funds are needed or requested.
