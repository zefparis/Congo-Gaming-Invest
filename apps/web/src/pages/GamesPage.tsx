import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '@cg/shared';

interface GameWithArtwork extends Game {
  artwork: string;
}

const GAME_IMAGES: Record<string, string> = {
  aviator: new URL('../assets/games/aviator.svg', import.meta.url).href,
  bingo: new URL('../assets/games/bingo.svg', import.meta.url).href,
  loto: new URL('../assets/games/loto.svg', import.meta.url).href,
};

const DEFAULT_GAME_IMAGE = new URL('../assets/games/default.svg', import.meta.url).href;

function formatVolatility(volatility: Game['volatility']) {
  switch (volatility) {
    case 'HIGH':
      return 'Haute';
    case 'MEDIUM':
      return 'Moyenne';
    case 'LOW':
    default:
      return 'Faible';
  }
}

const providerHighlights = [
  {
    title: 'Licence & conformité prêtes',
    description:
      'Exploitez notre licence nationale et nos certifications ARPTC pour lancer vos titres en RDC sans friction réglementaire.',
  },
  {
    title: 'Distribution omnicanale',
    description:
      'Intégration unique pour accéder à notre base joueurs mobile, desktop et retail via terminaux agréés.',
  },
  {
    title: 'Monétisation et analytics',
    description:
      'Dashboards temps réel, CRM segmenté et campagnes marketing co-brandées pour maximiser le GGR.',
  },
];

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/games')
      .then(async res => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setGames(data.games ?? []);
      })
      .catch(err => {
        setError(err.message ?? 'Impossible de récupérer les jeux');
      })
      .finally(() => setLoading(false));
  }, []);

  const gamesWithArtwork = useMemo<GameWithArtwork[]>(
    () =>
      games.map(game => ({
        ...game,
        artwork: GAME_IMAGES[game.slug] ?? DEFAULT_GAME_IMAGE,
      })),
    [games],
  );

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-2 py-12 md:px-0">
        <div className="glass-card bg-slate-950/80 text-center text-sm text-slate-300">
          Chargement des jeux…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-2 py-12 md:px-0">
        <h1 className="text-3xl font-semibold text-slate-100">Jeux disponibles</h1>
        <div className="info-box error max-w-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-2 py-12 md:px-0">
      <header className="space-y-3">
        <span className="tag bg-sky-500/15 text-sky-200">Catalogue officiel</span>
        <h1 className="text-3xl font-semibold text-slate-100">Jeux disponibles</h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Partez à la découverte des titres phares du Congo Gaming Portal. RTP contrôlés, volatilité maîtrisée et expériences certifiées.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {gamesWithArtwork.map(game => (
          <article
            key={game.slug}
            id={game.slug}
            className="glass-card flex h-full flex-col overflow-hidden bg-slate-950/70"
          >
            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              <img
                src={game.artwork}
                alt={`Illustration du jeu ${game.title}`}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-4 flex flex-1 flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">{game.title}</h2>
                  <p className="text-sm text-slate-400">{game.description}</p>
                </div>
                <span className={`tag ${game.volatility.toLowerCase()}`}>
                  Volatilité {formatVolatility(game.volatility)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <span className="font-semibold text-sky-300">RTP&nbsp;: {game.rtp}%</span>
                <button className="btn btn-secondary px-4 py-2 text-xs">Demo</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {gamesWithArtwork.length === 0 && (
        <p className="text-sm text-slate-400">Aucun jeu n’est disponible pour le moment.</p>
      )}

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Vous êtes provider ou investisseur jeux&nbsp;?</h2>
          <p className="text-sm text-slate-400">
            Nous offrons une rampe d’accès complète pour distribuer vos contenus ou co-financer de nouvelles verticales sous notre licence officielle.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {providerHighlights.map(item => (
            <article key={item.title} className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            className="btn btn-primary px-5 py-2 text-xs"
            href="mailto:vip@congogaming.cd?subject=Partenariat%20jeux%20-%20Congo%20Gaming"
          >
            Contacter le desk licences
          </a>
          <Link to="/investisseurs" className="btn btn-secondary px-5 py-2 text-xs">
            Découvrir le hub investisseurs
          </Link>
        </div>
      </section>
    </div>
  );
}
