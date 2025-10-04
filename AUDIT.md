# Audit – Congo Gaming Monorepo

## Monorepo structure
- **Package manager**: pnpm (`packageManager": "pnpm@8.10.0"`, `pnpm-lock.yaml`, workspace file).
- **Workspaces**: `apps/*`, `packages/*` (`pnpm-workspace.yaml`).
- **Applications**:
  - `apps/web/` – React 18 + Vite 5 (`@cg/web`).
  - `apps/api/` – NestJS 10 backend (`@cg/api`).
- **Shared packages**: `packages/` (non analysés en détail).

## Tooling & scripts
- Root `package.json` scripts:
  - `pnpm dev` → démarre API + web (concurrently).
  - `pnpm build`, `pnpm lint`, `pnpm typecheck` → commandes récursives workspaces.
- `apps/web/package.json` : scripts `dev`, `build` (`tsc && vite build`), `preview`.
- `apps/api/package.json` : scripts Nest (`start`, `start:dev`, `build`, `lint` placeholder, `typecheck`). `lint` est TODO.

## Stack & dépendances
- **Front**: React 18, React Router 6, Tailwind, Vite. TypeScript 5.5.
- **Backend**: NestJS (core, config, JWT, Swagger, Throttler), PostgreSQL driver, bcrypt, zod, Joi. TypeScript 5.5.
- **Dev tooling**: `concurrently`, Nest CLI, Type defs.

## Observations / risques
- `apps/api/scripts/esm-loader.mjs` requis pour démarrage (non audité).
- `lint` script API renvoie un placeholder (`echo "(todo lint)"`). TODO futur.
- Pas de configuration CI actuelle (`.github/` vide).
- Déploiement front/back non documenté avant `DEPLOYMENT.md`.
- Aucune config Vercel existante (`vercel.json` absent).
- Variables d’environnement non standardisées (`.env.example` manquants pour web/api).
- Pas de guide Postman / tests API automatisés.
- Backend dépendances lourdes (JWT, Swagger) mais absence d’implémentation visible dans audit rapide.

## Recommandations
1. Ajouter configuration Vercel (rewrites, security headers) et `.env.example` pour le front.
2. Créer doc Vercel + check-list déploiement.
3. Ajouter workflows CI (lint/build front & backend, docker build + push GHCR).
4. Documenter backend (README, Dockerfile, env sample) et valider endpoints minimal (health, Stripe webhook stub, auth login, operators).
5. Générer collection Postman pour QA/ops.
