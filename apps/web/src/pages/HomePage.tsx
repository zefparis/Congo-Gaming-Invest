import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Game } from '@cg/shared';
import { mockGames } from '@/api/mockData';
import heroBackground from '@/assets/images/im1.jpg';

const HERO_TAGLINE = 'Pariez, jouez et gagnez en toute simplicité.';

const featureHighlights = [
  {
    title: 'Expérience premium',
    description:
      'Interface fluide, animations immersives et jeux optimisés pour mobile et desktop.',
  },
  {
    title: 'Paiements sécurisés',
    description:
      'Agrégateur ARPTC certifié : dépôts et retraits garantis auprès des opérateurs locaux.',
  },
  {
    title: 'Support 24/7',
    description:
      'Assistance francophone et lingala pour accompagner vos gains à toute heure.',
  },
];

const complianceBadges = [
  {
    label: 'Licence nationale de jeux de hasard',
    detail: 'Octroyée en 2016 par le ministère de tutelle',
  },
  {
    label: '2 certifications ARPTC',
    detail: 'Services numériques & agrégation sur tout le territoire',
  },
  {
    label: 'Game Integrity Audits',
    detail: 'Conformité RNG et monitoring indépendant',
  },
];

const keyFigures = [
  { value: '150K+', label: 'Parieurs inscrits' },
  { value: '2016', label: 'Licence officielle' },
  { value: '99.9%', label: 'Disponibilité plateforme' },
  { value: '10+', label: 'Partenaires opérateurs' },
];

const investorMetrics = [
  {
    label: 'Taux de croissance GGR 12 mois',
    value: '+38%',
    detail: 'Hausse combinée des paris sportifs et du casino virtuel',
  },
  {
    label: 'Rendement net / investisseur pilote',
    value: '22.4%',
    detail: 'Programme testé sur 4 opérateurs locaux partenaires',
  },
  {
    label: 'Taux de rétention joueurs (90 j)',
    value: '68%',
    detail: 'Gamification et CRM multicanal ARPTC compliant',
  },
  {
    label: 'Capacité pics simultanés',
    value: '1.2M',
    detail: 'Scalabilité prouvée sur événements CAN & Loterie nationale',
  },
];

const impactHighlights = [
  {
    title: 'Régulation et conformité',
    description:
      'Double certification ARPTC, audits RNG trimestriels, procédures AML/KYC automatisées couvrant paris sportifs, casino live et loterie.',
  },
  {
    title: 'Impact local',
    description:
      '120 collaborateurs en RDC, 65% de fournisseurs locaux et contributions fiscales directes aux programmes sportifs nationaux.',
  },
  {
    title: 'Scalabilité produit',
    description:
      'API unique couvrant sports, casino, loterie, scratch cards et fantasy league avec onboarding opérateur en < 7 jours.',
  },
];

const aggregatorHighlights = [
  {
    title: 'Hub agrégateur certifié',
    detail:
      'Gestion unifiée des catalogues jeux, obligations ARJEL/ARPTC et reporting multi-opérateurs prêt pour vos providers.',
  },
  {
    title: 'Connectivité Mobile Money',
    detail:
      'Intégrations directes M-Pesa, Airtel Money, Orange Money et CMOBILE avec antifraude et plafonds dynamiques.',
  },
  {
    title: 'Licences partagées',
    detail:
      'Sous-licences et contrats de représentation pour opérateurs sans agrément, couvrant paris, casino et loteries.',
  },
  {
    title: 'Settlement & compliance',
    detail:
      'Split paiements, TVA et retenues fiscales automatisées, archivage sécurisé conforme aux normes DGI.',
  },
];

export function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/games')
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setGames(data.games ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Connexion à l’API indisponible. Mode démo activé.');
          setGames(mockGames);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-2 md:px-0">
      <section
        className="glass-card relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.35)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative space-y-8">
          <div className="space-y-4">
            <span className="tag high bg-sky-500/20 text-sky-200">Plateforme certifiée</span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Bienvenue sur Congo Gaming</h1>
            <p className="max-w-2xl text-lg text-slate-200 sm:text-xl">{HERO_TAGLINE}</p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {complianceBadges.map(badge => (
                <div key={badge.label} className="glass-card flex max-w-xs flex-col gap-1 bg-slate-950/70 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-200">
                    {badge.label}
                  </span>
                  <span className="text-sm text-slate-200">{badge.detail}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/games" className="btn btn-primary">
                Explorer les jeux
              </Link>
              <Link to="/profile" className="btn btn-secondary">
                Mon espace sécurisé
              </Link>
            </div>
          </div>

          {error && <p className="info-box error max-w-xl">{error}</p>}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {keyFigures.map(stat => (
          <div
            key={stat.label}
            className="glass-card bg-slate-900/70 text-center shadow-soft"
          >
            <p className="text-3xl font-semibold text-sky-300">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Pourquoi choisir Congo Gaming&nbsp;?</h2>
            <p className="text-sm text-slate-400">
              Une infrastructure robuste, un cadre légal solide et une équipe passionnée par le divertissement responsable.
            </p>
          </div>
          <Link to="/profile" className="text-sm font-medium text-sky-400 hover:text-sky-300">
            Créer mon portefeuille
          </Link>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {featureHighlights.map(feature => (
            <article key={feature.title} className="glass-card space-y-3 bg-slate-950/70">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-200">
                <span className="text-lg font-semibold">✔</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{feature.title}</h3>
              <p className="text-sm text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Jeux populaires</h2>
          <Link to="/games" className="text-sm font-medium text-sky-400 hover:text-sky-300">
            Voir tout le catalogue
          </Link>
        </header>

        {loading ? (
          <div className="info-box warning w-fit">Chargement des jeux…</div>
        ) : games.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {games.slice(0, 3).map(game => (
              <article key={game.slug} className="glass-card space-y-4">
                <header className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-100">{game.title}</h3>
                  <span className={`tag ${game.volatility.toLowerCase()}`}>Volatilité {game.volatility}</span>
                </header>
                <p className="text-sm text-slate-300">{game.description}</p>
                <footer className="flex items-center justify-between text-sm text-slate-300">
                  <span className="font-semibold text-sky-300">RTP&nbsp;: {game.rtp}%</span>
                  <Link to={`/games#${game.slug}`} className="text-sky-400 hover:text-sky-300">
                    En savoir plus
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-300">Aucun jeu disponible pour le moment.</p>
        )}
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Investor Insights</h2>
            <p className="text-sm text-slate-400">
              Données agrégées multi-verticales mettant en avant performance, conformité et résilience de la plateforme.
            </p>
          </div>
          <Link to="/investisseurs" className="btn btn-secondary px-5 py-2 text-xs">
            Accéder au hub investisseurs
          </Link>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {investorMetrics.map(metric => (
            <article
              key={metric.label}
              className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-sky-500/10 p-5 shadow-soft"
            >
              <p className="text-xs uppercase tracking-wide text-slate-300">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-sky-300">{metric.value}</p>
              <p className="mt-2 text-xs text-slate-400">{metric.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold">Pourquoi les investisseurs nous choisissent</h2>
          <p className="text-sm text-slate-400">
            Une proposition complète opérant sous licence nationale, appuyée par une gouvernance data-driven et un impact social tangible.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {impactHighlights.map(item => (
            <article key={item.title} className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-5 text-sm text-slate-200">
          <p>
            Préparez votre due diligence avec notre <strong>Investor Hub</strong> : tableaux de bord temps réel, documentation API, plan de gouvernance et calendrier d’expansion en Afrique Centrale.
          </p>
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold">Agrégation jeux & passerelles Mobile Money</h2>
          <p className="text-sm text-slate-400">
            Déployez vos contenus et vos flux financiers grâce à notre licence et nos accords bancaires, même si vous n’avez pas d’autorisation locale.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {aggregatorHighlights.map(item => (
            <article key={item.title} className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-emerald-500/10 p-5">
              <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/investisseurs" className="btn btn-primary px-5 py-2 text-xs">
            Voir les connecteurs disponibles
          </Link>
          <a
            className="btn btn-secondary px-5 py-2 text-xs"
            href="mailto:vip@congogaming.cd?subject=Agr%C3%A9gation%20%26%20Mobile%20Money%20-%20Congo%20Gaming"
          >
            Discuter d’un partenariat
          </a>
        </div>
      </section>

      <section className="glass-card bg-slate-950/80 text-center">
        <h2 className="text-2xl font-semibold">Prêt à rejoindre les professionnels du jeu en RDC&nbsp;?</h2>
        <p className="mt-3 text-sm text-slate-300">
          Congo Gaming opère sous licence officielle depuis 2016 et offre les meilleures conditions pour les joueurs comme pour les partenaires.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link to="/games" className="btn btn-primary">
            Lancer mon expérience
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            Contacter le support VIP
          </Link>
        </div>
      </section>
    </div>
  );
}
