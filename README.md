# SealBench

Nightshift build 080: a legal-document evidence and provenance workbench for Solana wallets.

SealBench lets a connected wallet create durable evidence packets, hash pasted document content server-side with SHA-256, move packets through reviewer validation, and attempt MPL Core proof seal issuance only when real issuer runtime configuration is present.

## Stack

- React 19, Vite, TypeScript, Tailwind CSS v4
- Wallet Standard UI from the create-seed Solana Kit starter
- React Query for API loading, errors, and mutations
- Hono API serving the static Vite build in production
- SQLite durable state via `better-sqlite3`
- MPL Core package dependency: `@obrera/mpl-core-kit-lib`

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

When missing, `/api/mpl/status` and `/api/evidence/:id/issue` report the exact missing keys. The app does not fake asset addresses or transaction signatures.

## Commands

```bash
bun run check-types
bun run lint
bun run build
bun run verify:issue
```

`verify:issue` mirrors the UI runtime path by creating a SIWS-shaped session, creating a packet, approving it, and calling the same issue endpoint used by the UI.
