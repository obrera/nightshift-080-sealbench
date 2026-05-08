# SealBench

Nightshift build 080: a legal-document evidence and provenance workbench for Solana wallets.

Live: https://sealbench080.colmena.dev
Repository: https://github.com/obrera/nightshift-080-sealbench
Challenge reference: Nightshift build 080, project name SealBench

SealBench lets a connected wallet create durable evidence packets, hash pasted document content server-side with SHA-256, move packets through reviewer validation, and attempt MPL Core proof seal issuance only when real issuer runtime configuration is present.

## Capabilities

- Public verifier for packet IDs, document hashes, asset addresses, titles, and counterparties.
- Wallet-first SIWS session registration before privileged evidence intake, review, or issue actions.
- Server-side SHA-256 packet creation with SQLite audit persistence.
- Reviewer decision workflow with risk, expiry, and append-only audit events.
- MPL Core create/issue path that builds, signs, and submits a proof-seal transaction when issuer runtime configuration is present.

## Stack

- React 19, Vite, TypeScript, Tailwind CSS v4
- Wallet Standard UI from the create-seed Solana Kit starter
- React Query for API loading, errors, and mutations
- Hono API serving the static Vite build in production
- SQLite durable state via `better-sqlite3`
- MPL Core package dependency: `@obrera/mpl-core-kit-lib`

## Model Metadata

- Provider: OpenAI
- Model: GPT-5 Codex implementation agent
- Reasoning setting: medium

## Development

```bash
bun install
bun run dev
```

Run the API separately for local full-stack work:

```bash
bun run build
bun run server
```

The production server listens on `PORT` and serves `/api/*` plus `dist/index.html`.

## Runtime Configuration

Evidence intake, review, verifier lookup, and audit persistence work with no chain credentials. MPL Core issue requests are blocked unless these environment variables are configured:

```bash
MPL_RPC_URL=
MPL_ISSUER_PRIVATE_KEY=
MPL_ISSUER_ADDRESS=
```

`MPL_ISSUER_PRIVATE_KEY` accepts a Solana JSON byte array, comma-separated byte values, `base64:<value>`, or a base58-encoded 64-byte secret key. `MPL_ISSUER_ADDRESS` must match the derived issuer signer. When configuration is missing or invalid, `/api/mpl/status`, `/api/bootstrap`, and `/api/evidence/:id/issue` report the exact blocker. The app does not fake asset addresses or transaction signatures.

## Commands

```bash
bun run check-types
bun run lint
bun run build
bun run verify:issue
bun run verify:runtime
bun run ci
```

`verify:issue` mirrors the UI runtime path against `SEALBENCH_BASE_URL` by creating a SIWS-shaped session, creating a packet, approving it, and calling the same issue endpoint used by the UI. `verify:runtime` builds the app, starts the production Hono server with an isolated SQLite database, runs the same check, and stops the server.

By default, `verify:issue` allows a local degraded `missing_config` response so developers can confirm the endpoint and blocker shape without chain credentials. Final live acceptance must run strict issued proof:

```bash
SEALBENCH_EXPECT_ISSUED=true bun run verify:issue
```

In strict mode, any `409` or `missing_config` response is a failure, and success requires a persisted packet with a real MPL Core `assetAddress` and `transactionSignature`.

## Deploy

The deployed service is configured as a Dokploy compose app using `docker-compose.yml`, project `nightshift-080-sealbench`, compose `sealbench080`, and compose id `H8PbUYvx73BEdeknrVIzr`.

```bash
git push origin main
dokploy compose redeploy --composeId H8PbUYvx73BEdeknrVIzr --title "SealBench 080" --description "Redeploy Nightshift build 080"
```
