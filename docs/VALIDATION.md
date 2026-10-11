# Validation — 11 October 2026

- TypeScript check, Vite production build and lint pass.
- Four pricing/evidence tests pass.
- Five vault tests pass, including collateral creation/redemption and rounding behavior.
- Cloudflare Worker deployed at https://pluto-robinhood.gana003.workers.dev.
- Live API returns all five constituent records, reference NAV and canonical digest.
- Browser evidence verification confirms the digest. Testnet transaction controls accurately show the undeployed state.

Outstanding: Robinhood Testnet gas funding, real-chain contract deployment and create/redeem receipts. Source code tests do not substitute for these. No deployed vault address is claimed until the manifest is populated by the deployment script.
