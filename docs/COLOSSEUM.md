# Crypto World's Fair submission draft

**Project:** Pluto

**One line:** Transparent stock-token baskets on Robinhood Chain, with collateral you can inspect and pricing evidence you can verify.

**Problem:** A basket price alone hides the units behind it. Tokenized equities add another source of confusion: corporate-action multipliers can change economic exposure without changing raw token balances. A portfolio should make those quantities understandable and auditable.

**Solution:** Pluto shows each constituent's raw units, issuer multiplier, underlying exposure and reference value. It packages the source inputs into canonical downloadable evidence. A proportional collateral vault demonstrates creating and redeeming one basket share while keeping pricing separate from settlement.

**Why Robinhood Chain:** The product is built around Robinhood Stock Token metadata and market APIs, including their issuer multiplier model. It uses the chain's EVM tooling for the vault and wallet flows. The testnet contract uses demo collateral and does not imply permission to custody or redeem real Stock Tokens.

**Links:** [Application](https://pluto-robinhood.gana003.workers.dev) · [Source](https://github.com/mycyi1994-hash/Pluto) · [Deployment status](https://pluto-robinhood.gana003.workers.dev/api/health)

**Deadline checked 11 October:** 12 October 2026, 11:59 p.m. Pacific = 13 October, 15:59 Korea time. The [official rules, section 5](https://colosseum.com/legal/Crypto%20World%27s%20Fair%20Hackathon%20Rules.pdf) control the deadline. The [submission FAQ](https://colosseum.com/hackathon?year=fall2026) requests a 2–3 minute presentation and a product demo no longer than 3 minutes, plus founder/team details and prior-development disclosure. One product per participant/team is permitted in this event.

## Initial market and business hypothesis

Start with wallet and portfolio product teams evaluating stock-token baskets. The first proposed pilot is an issuer-approved basket with explicit constituent units, corporate-action handling and independently reproducible reference pricing. Distribution would come through an embedded portfolio view and the evidence API. There is no signed pilot or issuer partnership yet.

The commercial hypothesis is a paid integration/API service and basket administration tooling, subject to issuer permission and the requirements of each market. The prototype currently charges no fee and uses demo collateral. Before handling real assets, validate issuer permissions, custody and transfer constraints with the relevant partners. The next validation milestone is interviews with five wallet/portfolio teams and one agreed pilot; neither is claimed complete.

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
