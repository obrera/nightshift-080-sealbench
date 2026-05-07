# BUILDLOG

## Nightshift 080 / 2026-05-07

- Project: SealBench
- Live URL: https://sealbench080.colmena.dev
- NFT use-case family: legal documentation/provenance
- Primary actor: a legal operations reviewer using a connected Solana wallet to submit and validate evidence packets
- Why NFT ownership/provenance matters: the proof seal creates a wallet-held receipt for a reviewed legal-document hash, connecting document provenance, review audit history, and ownership of the receipt asset without exposing document contents.
- Mint/issue signing model: server-signed issuance is intended. The UI calls the server issue endpoint after reviewer approval; the server refuses to mint unless real MPL issuer runtime configuration is present.

## Implementation Notes

- Scaffold source: `create-seed@latest -t bun-react-vite-solana-kit`, generated under `/tmp/sealbench-seed/sealbench` because the generator rejected `.` as the project name.
- Backend-first container: Hono serves `/api/*` and the Vite static build.
- Persistence: SQLite database at `SEALBENCH_DB_PATH` or `./data/sealbench.sqlite`.
- Async UI state: React Query hooks own loading, error, mutation, invalidation, and verifier lookup state.
- Feature layout: `src/features/session` and `src/features/evidence` use `data-access`, `feature`, and `ui` boundaries.

## MPL Runtime Status

The MPL Core package is installed and imported by the server runtime. Real issuance requires:

- `MPL_RPC_URL`
- `MPL_ISSUER_PRIVATE_KEY`
- `MPL_ISSUER_ADDRESS`

Without those values, issue requests return `409` with `mode: missing_config` and the exact missing keys. No fake mint, fake transaction signature, or fake asset address is recorded.

## Validation

- Local `bun run check-types`: pass
- Local `bun run lint`: pass
- Local `bun run build`: pass
- Local `docker build -t sealbench080-local .`: pass
- Local issue-path script: pass with expected missing-config blocker
- Live `https://sealbench080.colmena.dev`: HTTP 200
- Live `/api/health`: HTTP 200
- Live issue-path script: pass with expected missing-config blocker for `MPL_RPC_URL`, `MPL_ISSUER_PRIVATE_KEY`, and `MPL_ISSUER_ADDRESS`
