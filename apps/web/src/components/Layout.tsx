import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useState } from 'react';
import { LoginModal } from './auth/LoginModal';

const navItems = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/games', label: 'Jeux' },
  { to: '/investisseurs', label: 'Investisseurs' },
  { to: '/profile', label: 'Mon Profil' },
];

export function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="text-2xl font-bold tracking-tight">Congo Gaming Portal</div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-slate-300">Bonjour, {user?.msisdn}</span>
                <button className="btn btn-secondary" onClick={() => logout()}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setLoginOpen(true)}>
                Se connecter
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 md:px-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Congo Gaming. Tous droits réservés.
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
