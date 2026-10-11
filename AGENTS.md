# Pluto implementation rules

Pluto is a Robinhood Chain Stock Token basket application. Work on feature branches. Never publish secrets, fabricate chain receipts, or substitute reference NAV for actual vault assets. Keep market prices, issuer multipliers and on-chain raw units distinct. Use integer arithmetic for settlement. Changes require app build, app tests and lint; contract changes also require the onchain test suite. Deployment targets must belong to Pluto. Never write to the predecessor's contracts or services. Preserve provenance in docs/BUILD-RECORD.md.
