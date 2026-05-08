# NIGHTSHIFT-080-SUMMARY

- Repo URL: https://github.com/obrera/nightshift-080-sealbench
- Live URL: https://sealbench080.colmena.dev
- Project HEAD SHA: b55d2e46e80baac227a995613f289f28d811a91f
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
- Recovery: PR #1 removed a static `dokploy-network` IPv4 pin that collided with another Docker endpoint. Dokploy redeployed from `main`; container `sealbench080-oybg61-sealbench-1` is running on Docker-assigned overlay IP `10.0.1.8`.
- Mint/runtime proof result: strict live proof passed with `SEALBENCH_BASE_URL=https://sealbench080.colmena.dev SEALBENCH_VERIFY_WALLET=obrE1BHvP4EX8PkxPxAJxYfQkgfgCmXyJadQA3yBb7G SEALBENCH_EXPECT_ISSUED=true bun run verify:issue`. It created packet `SB-080-58865541`, issued asset `7c9tFMr7UMWZPx4j4Nc755Qj6Vy6iEtJ6FHd8u1HLesk`, and recorded transaction `4Hw6Swaqm3PFE2bDhcNZXmG2u6qibRsVMjY1cq4EEqfifDKRkjpBy8XJBAXB27GL2DzJpYqhwDC7yih7cvmYHj2y`.
- Exact blockers: none for live issue proof. Desktop and mobile Playwright screenshots rendered the real UI after hydration; console output only included the expected Solana Mobile Wallet Adapter log.
