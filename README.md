# Pluto

Know what is inside your stock-token basket.

Pluto is a Robinhood Chain basket interface with transparent collateral accounting and independently verifiable pricing evidence. Core Five combines AAPL, MSFT, NVDA, AMZN and TSLA into one fixed-quantity basket.

**[Open Pluto](https://pluto-robinhood.gana003.workers.dev)** · [Submission draft](docs/COLOSSEUM.md) · [Build record](docs/BUILD-RECORD.md) · [Validation](docs/VALIDATION.md)

## The product

- Inspect raw token units, the issuer's corporate-action multiplier and the resulting underlying exposure separately.
- View a reference NAV calculated from Robinhood's public asset and bid/ask APIs.
- Download the precise inputs and verify their canonical SHA-256 digest in your browser.
- Create or redeem proportional basket shares through an ownerless vault using exact collateral quantities and wallet-confirmed transactions.

Reference data describes issuer Stock Tokens on Robinhood Chain mainnet. Settlement is a **testnet demonstration with clearly labeled Pluto demo tokens**, not a claim to hold or redeem regulated stock tokens. Reference NAV is informational, not an executable price, oracle or proof of solvency. A matching hash proves the downloaded evidence was not changed; it does not authenticate the issuer or guarantee price correctness.

## Current deployment

The web app and live issuer API integration are deployed. Contract state is explicit in src/deployment.json and /api/health. When vault is null, create/redeem controls remain disabled. Robinhood Testnet gas funding is currently required before deploying the prepared contracts; the interface does not invent contract addresses or receipts.

## Try it

1. Open Basket to inspect the composition and reference value.
2. Open Evidence, verify the fingerprint, then download the source values and timestamps.
3. After testnet deployment, connect an EVM wallet to Robinhood Chain Testnet (46630), obtain test ETH, mint the demo constituents, approve the displayed collateral amounts and create one PLUTO share.
4. Open Your position, inspect the vault balance and redeem. Settlement uses raw units; an issuer multiplier does not change the raw collateral held by the vault.

## Run and deploy

    npm ci
    npm run build
    npm test
    npm run lint
    npm --prefix onchain ci
    npm --prefix onchain test

For the issuer API and frontend together, run npm run build followed by npm run preview. Vite alone serves the frontend; the Worker supplies /api/snapshot.

Copy .env.example to .env, supply a disposable funded testnet deployer key, then run npm --prefix onchain run deploy. The script exports the actual receipts and updates src/deployment.json. Run npm run deploy to publish the connected app. Never commit the private key. Configure your own Cloudflare account and worker name for a separate installation.

## Architecture

React/TypeScript + viem frontend → Cloudflare Worker → public Robinhood Stock Token APIs. Integer fixed-point arithmetic avoids floating-point settlement. Solidity vault + ERC-20 demo tokens run on Robinhood Chain Testnet. The vault uses balance-delta validation, minimum initial issuance, proportional share accounting, slippage bounds and a reentrancy guard.

This is an unaudited prototype. Test assets have no monetary value. Mainnet operation would require issuer permission/transfer compliance, custody and legal review, production data infrastructure and an independent security audit.
