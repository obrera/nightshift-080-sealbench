# NIGHTSHIFT-080-SUMMARY

- Repo URL: https://github.com/obrera/nightshift-080-sealbench
- Live URL: https://sealbench080.colmena.dev
- Project HEAD SHA: final SHA reported by orchestrator; this summary update is included in the final commit, so embedding the final SHA here would change HEAD again.
- Deploy method: Dokploy CLI GitHub-source compose deployment, project `nightshift-080-sealbench`, compose `sealbench080`, composeId `H8PbUYvx73BEdeknrVIzr`, branch `main`, compose path `./docker-compose.yml`.
- Local validation:
  - `bun run check-types`: pass
  - `bun run lint`: pass
  - `bun run build`: pass
  - Headless no-wallet mobile viewport sanity check: pass, CDP `innerWidth` 390 and `documentElement.scrollWidth` 390.
  - `docker compose config`: pass
  - `docker build -t sealbench080-local .`: pass
  - `SEALBENCH_BASE_URL=http://localhost:3000 bun run verify:issue`: pass with expected missing-config blocker
- Live HTTP status:
  - `https://sealbench080.colmena.dev`: 200
  - `https://sealbench080.colmena.dev/api/health`: 200
- Mint/runtime proof result or blocker: `bun run verify:issue` against the live URL created packet `SB-080-B88524CC`, approved it, and reached `/api/evidence/:id/issue`; the endpoint returned the expected missing MPL runtime config blocker.
- Exact blockers: real MPL Core issuance is blocked until `MPL_RPC_URL`, `MPL_ISSUER_PRIVATE_KEY`, and `MPL_ISSUER_ADDRESS` are configured in the Dokploy compose environment. No fake asset address or transaction signature was recorded.
