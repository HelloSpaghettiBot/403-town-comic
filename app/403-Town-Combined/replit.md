# 403 Town

A comic-first 403 Town website with the existing browser TCG integrated as a secondary connected experience.

## Run & Operate

- `pnpm --filter @workspace/403-town-tcg run dev` — run the combined site locally.
- `pnpm --filter @workspace/403-town-tcg run typecheck` — typecheck the frontend.
- `pnpm --filter @workspace/403-town-tcg run build` — build the frontend.
- `pnpm run typecheck` — typecheck the full workspace.
- `pnpm run build` — build all workspace packages.

## Primary routes

- `/` — comic landing page and latest episode.
- `/archive` — episode archive.
- `/read/:slug` — vertical comic reader.
- `/tcg` — TCG command screen.
- `/tcg/*` — the rest of the existing TCG.

## Comic content source of truth

- `artifacts/403-town-tcg/public/content/episodes.json` — episode metadata and page order.
- `artifacts/403-town-tcg/public/comics/` — comic page assets.
- `COMIC_UPLOAD_GUIDE.md` — simple publishing instructions.

The site reads the episode manifest at runtime, so publishing a new episode does not require adding a React route or editing page components.

## Architecture decisions

- The comic is the root experience and owns the global public navigation.
- The TCG remains a distinct in-universe client under `/tcg`, preserving its original game UI instead of forcing that interface onto comic readers.
- Comic content is data-driven from static JSON for low-maintenance publishing.
- Existing TCG card assets, collection logic, pack opening, match queue simulation, shop, and settings are preserved.
