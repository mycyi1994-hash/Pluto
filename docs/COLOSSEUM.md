# Crypto World's Fair submission draft

**Project:** Pluto

**One line:** Transparent stock-token baskets on Robinhood Chain, with collateral you can inspect and pricing evidence you can verify.

**Problem:** A basket price alone hides the units behind it. Tokenized equities add another source of confusion: corporate-action multipliers can change economic exposure without changing raw token balances. A portfolio should make those quantities understandable and auditable.

**Solution:** Pluto shows each constituent's raw units, issuer multiplier, underlying exposure and reference value. It packages the source inputs into canonical downloadable evidence. A proportional collateral vault demonstrates creating and redeeming one basket share while keeping pricing separate from settlement.

**Why Robinhood Chain:** The product is built around Robinhood Stock Token metadata and market APIs, including their issuer multiplier model. It uses the chain's EVM tooling for the vault and wallet flows. The testnet contract uses demo collateral and does not imply permission to custody or redeem real Stock Tokens.

**Links:** [Application](https://pluto-robinhood.gana003.workers.dev) · [Source](https://github.com/mycyi1994-hash/Pluto) · [Deployment status](https://pluto-robinhood.gana003.workers.dev/api/health)

## Three-minute demo script

1. 0:00–0:20: Explain the difference between owning token units and understanding economic exposure.
2. 0:20–0:55: Show Core Five. Follow one constituent from raw units through multiplier to its reference value.
3. 0:55–1:30: Open Evidence, verify the hash and download the JSON. Explain what the hash does and does not prove.
4. 1:30–2:25: Once contracts are deployed, mint demo tokens, create one PLUTO share and inspect the real receipt and position. Clearly identify test collateral.
5. 2:25–2:50: Redeem part of the position, showing proportional raw collateral returned.
6. 2:50–3:00: Describe the next step: an issuer-approved, compliance-aware basket pilot. This is a planned milestone, not an existing partnership.

## Submission checklist

Use BUILD-RECORD.md to disclose the prior repository and the work performed in the event window. Attach the live app and source. Add the deployed vault address and create/redeem receipts only when present in the manifest. Record the actual demo and founder introduction required by the organizer; video recording and final form submission are not claimed complete here.

Known dependencies: testnet gas for contract deployment, final screen recording and organizer eligibility review. No mainnet assets, financial returns, users or issuer endorsement are claimed.
