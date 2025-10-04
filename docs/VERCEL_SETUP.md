# Vercel Setup – Congo Gaming Web

## Project configuration
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

## Environment variables
| Environment | Variable | Description |
|-------------|----------|-------------|
| Preview & Production | `VITE_API_BASE_URL` | URL API backend (`https://api.congogaming.cd`) |
| Preview & Production | `VITE_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe Connect |
| Preview & Production | `VITE_DEMO_MODE` | `true`/`false` selon activation mode démo |
| Preview & Production | `VITE_ANALYTICS_ID` | ID Analytics (GTM/GA) |

> Ajouter les mêmes valeurs en Preview & Production pour éviter les divergences.

## Rewrites & headers
- Le fichier `apps/web/vercel.json` redirige `/api/*` vers `https://api.congogaming.cd/*`.
- Headers de sécurité ajoutés (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

## Déploiement
1. Connecter le dépôt GitHub (`Congo-Gaming-Invest`).
2. Sélectionner le dossier `apps/web` comme Root Directory.
3. Ajouter les variables d’environnement.
4. Lancer un déploiement Preview, vérifier sur `https://<project>.vercel.app`.
5. Lorsque validé, promouvoir en Production (alias personnalisé ex. `invest.congogaming.cd`).
