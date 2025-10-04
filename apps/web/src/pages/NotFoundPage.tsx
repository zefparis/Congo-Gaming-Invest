import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <h1>Page introuvable</h1>
      <p>
        La page que vous recherchez n’existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn primary">Retour à l’accueil</Link>
    </div>
  );
}
