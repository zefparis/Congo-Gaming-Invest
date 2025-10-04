# Congo Gaming – Déploiement Vercel & Backend

## Aperçu

- **Front à déployer sur Vercel** : dossier `apps/web/` (application React/Vite).
- **Backend/ingestion** : services temps réel, APIs secure, traitements financiers à héberger hors Vercel (serveur dédié ou PaaS).
- **Objectif** : permettre aux opérateurs d’accéder à l’interface investisseur sur Vercel, tout en connectant leurs comptes Stripe/Mobile Money au backend licensor.

---

## 1. Préparation du dépôt GitHub

- Repo public : `https://github.com/zefparis/Congo-Gaming-Invest.git`
- Structure relevante :
  - `apps/web/` : front-end React.
  - (À compléter) `apps/api/` ou `services/` : microservices backend si présents.

---

## 2. Front-end (Vercel)

### 2.1. Prérequis
- Vercel CLI (`npm i -g vercel`) ou dashboard Vercel.
- Compte Vercel relié au GitHub ci-dessus.

### 2.2. Configuration du projet
1. Importer le dépôt sur Vercel.
2. Répertoire racine : `apps/web/` (définir « Root Directory » dans Vercel).
3. Commandes build :
   - Install : `pnpm install` (ou `npm install` selon lockfile).
   - Build : `pnpm build` (ou `npm run build`).
   - Output : par défaut `dist/` (Vite).
4. Framework preset : `Vite`.

### 2.3. Variables d’environnement (Vercel)
Créer les variables environnement dans Vercel → Settings → Environment Variables :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL de l’API backend (https) | `https://api.congogaming.cd` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe Connect (RDC) | `pk_live_xxx` |
| `VITE_DEMO_MODE` | Activer les données démo | `true` |
| `VITE_ANALYTICS_ID` | (optionnel) ID analytics | `GTM-XXXX` |

> Adapter selon les hooks du code `useAuthFetch()` et des services Stripe. 

### 2.4. Rewrites/Proxy
Ajouter à la racine `apps/web/` un fichier `vercel.json` si besoin :

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.congogaming.cd/:path*" }
  ]
}
```

Cela redirige les appels `/api/*` vers le backend licensor.

---

## 3. Backend (hors Vercel)

### 3.1. Services à héberger localement ou sur serveur dédié
- **Ingestion temps réel** (Kafka/Webhooks providers jeu).
- **Microservice transactions** (Node.js/Prisma/PostgreSQL).
- **Orchestrateur paiements** (Stripe Connect, Mobile Money).
- **Reconciliation & reporting fiscal** (batch jobs, exports DGI).
- **Auth/gestion opérateurs** (KYC, SLA, compliance).

### 3.2. Hébergement suggéré
- VPS/Cloud : AWS ECS, AWS Fargate, Render, Railway, DigitalOcean.
- Base de données : PostgreSQL géré (RDS, Neon, Supabase).
- Filesystem/logs : S3, CloudWatch, Grafana.

### 3.3. Sécurité & Intégration
- **CORS** : autoriser les domaines Vercel (`https://congo-gaming-invest.vercel.app`).
- **JWT/Bearer** : conserver `useAuthFetch()` pour injeter tokens.
- **Webhooks Stripe** : configurer URL publique (ex. `https://api.congogaming.cd/stripe/webhooks`).
- **Mobile Money** : sécuriser les endpoints callback opérateurs (signatures, IP allowlists).

### 3.4. Variables backend
| Variable | Usage | Exemple |
|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL (Prisma) | `postgresql://user:pass@host/db` |
| `STRIPE_SECRET_KEY` | Clé secrète | `sk_live_xxx` |
| `STRIPE_CONNECT_ACCOUNT` | ID master | `acct_xxx` |
| `KAFKA_BROKERS` | Brokers ingestion | `broker1:9092,broker2:9092` |
| `MOBILE_MONEY_API_KEY` | Clé opérateur | `xxxx` |
| `JWT_SECRET` | Auth API | `super-secret` |

---

## 4. Flux d’intégration Vercel ↔ Backend

1. **Déploiement Vercel** : build + CDN global.
2. **Envoyer le front** → Le front consomme `VITE_API_BASE_URL` pour l’auth, data opérateurs.
3. **Backend** : déploiement continu via pipeline (GitHub Actions, etc.).
4. **Tests** :
   - Accès public : `https://congo-gaming-invest.vercel.app`
   - API : `https://api.congogaming.cd/health`
5. **Monitoring** : logs côté backend, Vercel Analytics pour le front.

---

## 5. Procédure rapide

1. **Backend** : déployer/mettre à jour microservices et DB.
2. **Configurer variables** (Stripe, Mobile Money, API URLs).
3. **Vercel** : push Git → Vercel build auto.
4. **Tester** :
   - Interface investisseur
   - CTA contact → mail `vip@congogaming.cd`
   - Rewrites `/api` → backend live
5. **Go-live** : pointer DNS vers Vercel (`CNAME`).

---

## 6. Notes complémentaires

- Préparer un mode « maintenance » sur le backend pour migrations.
- Documenter les endpoints (Swagger/OpenAPI) pour aligner front/back.
- Prévoir un plan de reprise : backup DB, redondance Kafka.
- Ajouter `README` ou `docs/` pour détailler pipelines financiers.

---

## 7. Support

- **Support investisseurs** : `vip@congogaming.cd`
- **Tech lead** : définir contact interne (ex. `tech@congogaming.cd`).

L’ensemble garantit un front accessible worldwide via Vercel, tout en gardant la maîtrise opérationnelle et réglementaire des flux financiers côté backend. 
