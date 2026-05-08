# BUILDLOG

## Nightshift 080 / 2026-05-07

- Project: SealBench
- Repo: https://github.com/obrera/nightshift-080-sealbench
- Live URL: https://sealbench080.colmena.dev
- NFT use-case family: legal documentation/provenance
- Primary actor: a legal operations reviewer using a connected Solana wallet to submit and validate evidence packets
- Why NFT ownership/provenance matters: the proof seal creates a wallet-held receipt for a reviewed legal-document hash, connecting document provenance, review audit history, and ownership of the receipt asset without exposing document contents.
- Mint/issue signing model: server-signed issuance is intended. The UI calls the server issue endpoint after reviewer approval; the server refuses to mint unless real MPL issuer runtime configuration is present.
- Model provider/id: OpenAI GPT-5 Codex implementation agent
- Reasoning setting: medium

## Implementation Notes

- Scaffold source: `create-seed@latest -t bun-react-vite-solana-kit`, generated under `/tmp/sealbench-seed/sealbench` because the generator rejected `.` as the project name.
- Backend-first container: Hono serves `/api/*` and the Vite static build.
- Persistence: SQLite database at `SEALBENCH_DB_PATH` or `./data/sealbench.sqlite`.
- Async UI state: React Query hooks own loading, error, mutation, invalidation, and verifier lookup state.
- Feature layout: `src/features/session` and `src/features/evidence` use `data-access`, `feature`, and `ui` boundaries.
- 2026-05-08T01:06:29Z: finished the issuer runtime path so configured deployments build, sign, and submit an MPL Core `createV1` instruction with Solana Kit and `@obrera/mpl-core-kit-lib`; missing or invalid issuer config still records no fake seal.
- 2026-05-08T01:06:29Z: added `/api/bootstrap` with project, build, runtime config, and capability state for runtime verification.
- 2026-05-08T01:06:29Z: added `bun run verify:runtime`, which builds, launches the production server, creates a SIWS-shaped session, submits a packet, approves it, calls `/api/evidence/:id/issue`, and shuts down with an isolated SQLite DB.
- 2026-05-08T recovery: updated issuer key parsing to accept JSON byte arrays, comma-separated bytes, `base64:<value>`, and base58 64-byte Solana secret keys; added `SEALBENCH_VERIFY_WALLET` and strict `SEALBENCH_EXPECT_ISSUED=true` verification semantics.

## MPL Runtime Status

The MPL Core package is installed and imported by the server runtime. Real issuance requires:

- `MPL_RPC_URL`
- `MPL_ISSUER_PRIVATE_KEY`
- `MPL_ISSUER_ADDRESS`

Without those values, issue requests return `409` with `mode: missing_config`, the exact missing keys, and a proof draft that contains only deterministic metadata. This is only a local degraded-mode check, not a shipped acceptance pass. With all values present, the server derives the issuer signer, verifies it matches `MPL_ISSUER_ADDRESS`, creates a new asset signer, builds the MPL Core create instruction, signs the transaction, submits it through `MPL_RPC_URL`, and records the asset address and transaction signature only after submission succeeds. No fake mint, fake transaction signature, or fake asset address is recorded. Final live acceptance requires `SEALBENCH_EXPECT_ISSUED=true bun run verify:issue` to return an issued packet with both `assetAddress` and `transactionSignature`.

## Scorecard

- Semi-complex app: pass. Public verifier, wallet/SIWS gate, packet intake, review workbench, audit persistence, runtime status, and MPL issue endpoint.
- Dark UI by default: pass.
- At least three user-facing capabilities: pass. Verify, intake, review, issue readiness/issuance.
- Solana week constraints: pass. No `@solana/web3.js`, no wallet-adapter package, no Node `Buffer` in app/server code, required `@obrera/mpl-core-kit-lib` dependency, wallet-first SIWS gate, real backend endpoint, and MPL Core create/issue runtime path.
- Build 080/project/repo identity: pass. SealBench, `obrera/nightshift-080-sealbench`.

## Validation

- 2026-05-08T01:06:29Z local `bun run check-types`: pass
- 2026-05-08T01:06:29Z local `bun run lint`: pass
- 2026-05-08T01:06:29Z local `bun run build`: pass
- 2026-05-08T01:06:29Z local `bun run ci`: pass
- 2026-05-08T01:06:29Z local `bun run verify:runtime`: degraded-mode endpoint check returned expected missing-config blocker for `MPL_RPC_URL`, `MPL_ISSUER_PRIVATE_KEY`, and `MPL_ISSUER_ADDRESS`; packet `SB-080-C0081614`; MPL Core program `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`.
- Local `docker build -t sealbench080-local .`: pass
- Local issue-path script: degraded-mode endpoint check returned expected missing-config blocker
- 2026-05-08T01:12:00Z recovery `bun run check-types`: pass
- 2026-05-08T01:12:00Z recovery `bun run lint`: pass
- 2026-05-08T01:12:00Z recovery `bun run build`: pass
- 2026-05-08T01:12:00Z recovery `bun run verify:runtime`: degraded-mode endpoint check returned `missing_config` without treating it as final acceptance; packet `SB-080-12AAB594`.
- 2026-05-08T01:12:00Z recovery `SEALBENCH_EXPECT_ISSUED=true bun run verify:issue --serve`: failed as required on `missing_config`; packet `SB-080-C8FD7169`.
- 2026-05-08T01:06:29Z live `https://sealbench080.colmena.dev`: HTTP 200
- 2026-05-08T01:06:29Z live `/api/health`: HTTP 200, response `{"build":"080","date":"2026-05-07","ok":true,"service":"SealBench"}`
- 2026-05-08T01:06:29Z live `/api/bootstrap`: currently falls through to the older deployed SPA, so the live service needs redeploy after this commit to expose the new bootstrap endpoint.
- Live issue-path script: strict issued proof remains pending until the deployed environment has issuer config and returns asset plus transaction.
- 2026-05-08T14:19Z recovery PR #1 removed the static `dokploy-network` IPv4 pin that collided with another Docker endpoint, merged as `b55d2e4`.
- 2026-05-08T14:20Z live deploy recovered. Container `sealbench080-oybg61-sealbench-1` started on Docker-assigned overlay IP `10.0.1.8`.
- 2026-05-08T14:21Z live `/api/health`: HTTP 200, response `{"build":"080","date":"2026-05-07","ok":true,"service":"SealBench"}`.
- 2026-05-08T14:21Z strict live issue proof: `SEALBENCH_BASE_URL=https://sealbench080.colmena.dev SEALBENCH_VERIFY_WALLET=obrE1BHvP4EX8PkxPxAJxYfQkgfgCmXyJadQA3yBb7G SEALBENCH_EXPECT_ISSUED=true bun run verify:issue` returned `result: issued`, packet `SB-080-58865541`, asset `7c9tFMr7UMWZPx4j4Nc755Qj6Vy6iEtJ6FHd8u1HLesk`, transaction `4Hw6Swaqm3PFE2bDhcNZXmG2u6qibRsVMjY1cq4EEqfifDKRkjpBy8XJBAXB27GL2DzJpYqhwDC7yih7cvmYHj2y`.
- 2026-05-08T14:25Z desktop and mobile Playwright screenshots loaded the real SealBench UI after waiting for hydration. Browser console had only the expected Solana Mobile Wallet Adapter log.
