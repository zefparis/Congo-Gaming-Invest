import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { WalletBalance } from '@cg/shared';
import { useAuth } from '@/auth/AuthContext';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface UserProfile {
  id: string;
  msisdn: string;
  created_at: string;
}

interface ProfileResponse {
  user: UserProfile;
}

const AVATAR_URL = new URL('../assets/profile/avatar.svg', import.meta.url).href;
const DEMO_PROFILE_STORAGE_KEY = 'cg-demo-profile';
const DEMO_WALLET_STORAGE_KEY = 'cg-demo-wallet';
const INVESTOR_SUPPORT_EMAIL = 'vip@congogaming.cd';
const INVESTOR_STATEMENT_FILE = 'cg-investor-statement-demo.txt';
const DEMO_AVATAR_STORAGE_KEY = 'cg-demo-avatar';
const isBrowser = typeof window !== 'undefined';

const DEFAULT_WALLET: WalletBalance = {
  balance_cdf: 0,
  balance_usd: 0,
};

function createDefaultProfile(): UserProfile {
  return {
    id: 'INVEST-DRC-001',
    msisdn: '+243900000000',
    created_at: new Date().toISOString(),
  };
}

function loadDemoProfile(): UserProfile {
  const fallback = createDefaultProfile();
  if (!isBrowser) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...fallback,
      ...parsed,
      created_at: parsed.created_at ?? fallback.created_at,
    };
  } catch (error) {
    console.warn('Impossible de charger le profil demo', error);
    return fallback;
  }
}

function saveDemoProfile(profile: UserProfile) {
  if (!isBrowser) {
    return;
  }
  try {
    window.localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('Impossible de sauvegarder le profil demo', error);
  }
}

function loadDemoWallet(): WalletBalance | null {
  if (!isBrowser) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as WalletBalance;
  } catch (error) {
    console.warn('Impossible de charger le wallet demo', error);
    return null;
  }
}

function saveDemoWallet(wallet: WalletBalance | null) {
  if (!isBrowser) {
    return;
  }
  try {
    if (wallet) {
      window.localStorage.setItem(DEMO_WALLET_STORAGE_KEY, JSON.stringify(wallet));
    } else {
      window.localStorage.removeItem(DEMO_WALLET_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Impossible de sauvegarder le wallet demo', error);
  }
}

function formatCurrency(value: number, currency: 'CDF' | 'USD') {
  const locale = currency === 'CDF' ? 'fr-CD' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

function loadDemoAvatar(): string | null {
  if (!isBrowser) {
    return null;
  }
  try {
    return window.localStorage.getItem(DEMO_AVATAR_STORAGE_KEY);
  } catch (error) {
    console.warn('Impossible de charger l\'avatar demo', error);
    return null;
  }
}

function saveDemoAvatar(avatarDataUrl: string | null) {
  if (!isBrowser) {
    return;
  }
  try {
    if (avatarDataUrl) {
      window.localStorage.setItem(DEMO_AVATAR_STORAGE_KEY, avatarDataUrl);
    } else {
      window.localStorage.removeItem(DEMO_AVATAR_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Impossible de sauvegarder l\'avatar demo', error);
  }
}

type StatusType = 'success' | 'error' | 'warning' | 'info';

export function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [profileForm, setProfileForm] = useState({ id: '', msisdn: '' });
  const [walletForm, setWalletForm] = useState<{ amount: string; currency: 'CDF' | 'USD' }>({
    amount: '',
    currency: 'CDF',
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const isDemo = !isAuthenticated;

  const notify = useCallback((type: StatusType, message: string) => {
    setStatus({ type, message });
  }, []);

  useEffect(() => {
    if (isDemo) {
      const demoProfile = loadDemoProfile();
      const demoWallet = loadDemoWallet();
      const demoAvatar = loadDemoAvatar();
      setProfile(demoProfile);
      setWallet(demoWallet);
      setAvatar(demoAvatar);
      setProfileForm({ id: demoProfile.id, msisdn: demoProfile.msisdn });
      setError(null);
      return;
    }

    setProfile(null);
    setWallet(null);
    setAvatar(null);
    setError(null);

    Promise.all([
      authFetch<ProfileResponse>('/users/me'),
      authFetch<{ wallet: WalletBalance }>('/users/me/wallet').catch(() => null),
    ])
      .then(([profileData, walletData]) => {
        setProfile(profileData.user);
        setWallet(walletData?.wallet ?? null);
        setAvatar(null);
        setProfileForm({ id: profileData.user.id, msisdn: profileData.user.msisdn });
        setError(null);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, [authFetch, isDemo]);

  useEffect(() => {
    if (isDemo && profile) {
      saveDemoProfile(profile);
    }
  }, [isDemo, profile]);

  useEffect(() => {
    if (isDemo) {
      saveDemoWallet(wallet);
    }
  }, [isDemo, wallet]);

  useEffect(() => {
    if (!isDemo) {
      return;
    }
    saveDemoAvatar(avatar);
  }, [avatar, isDemo]);

  useEffect(() => {
    if (!profile) {
      return;
    }
    setProfileForm({ id: profile.id, msisdn: profile.msisdn });
  }, [profile]);

  useEffect(() => {
    if (!status || !isBrowser) {
      return;
    }
    const timer = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const joinedAt = useMemo(() => {
    if (!profile) {
      return null;
    }
    return new Date(profile.created_at).toLocaleDateString('fr-CD', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [profile]);

  const handleProfileFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDemo) {
      notify('info', 'La mise à jour du profil sera disponible sur l’API sécurisée.');
      return;
    }

    const trimmedId = profileForm.id.trim();
    const trimmedMsisdn = profileForm.msisdn.trim();

    if (!trimmedId || !trimmedMsisdn) {
      notify('error', 'Merci de renseigner un identifiant et un MSISDN valides.');
      return;
    }

    setProfile(prev => {
      const base = prev ?? createDefaultProfile();
      return {
        ...base,
        id: trimmedId,
        msisdn: trimmedMsisdn,
      };
    });

    notify('success', 'Profil investisseur mis à jour.');
  };

  const handleWalletFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setWalletForm(prev => ({ ...prev, [name]: value }));
  };

  const handleWalletAction = (action: 'deposit' | 'withdraw') => {
    if (!isDemo) {
      notify('info', 'Les opérations financières réelles seront disponibles en production.');
      return;
    }

    const normalizedAmount = walletForm.amount.replace(/\s/g, '').replace(',', '.');
    const amount = Number(normalizedAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      notify('error', 'Indiquer un montant positif.');
      return;
    }

    const balanceKey = walletForm.currency === 'CDF' ? 'balance_cdf' : 'balance_usd';
    const base = wallet ? { ...wallet } : { ...DEFAULT_WALLET };

    if (action === 'withdraw' && base[balanceKey] < amount) {
      notify('error', 'Solde insuffisant pour cette opération.');
      return;
    }

    base[balanceKey] =
      action === 'withdraw' ? base[balanceKey] - amount : base[balanceKey] + amount;

    setWallet(base);
    setWalletForm(prev => ({ ...prev, amount: '' }));

    notify(
      'success',
      action === 'withdraw'
        ? 'Retrait simulé effectif.'
        : 'Dépôt simulé ajouté à votre wallet.',
    );
  };

  const handleActivateWallet = () => {
    if (!isDemo) {
      notify('info', 'Activation libre disponible uniquement en mode vitrine.');
      return;
    }
    if (wallet) {
      notify('info', 'Portefeuille déjà activé.');
      return;
    }
    setWallet({ ...DEFAULT_WALLET });
    notify('success', 'Portefeuille investisseur activé.');
  };

  const handleResetWallet = () => {
    if (!isDemo) {
      notify('info', 'Remise à zéro réservée au mode vitrine.');
      return;
    }
    setWallet({ ...DEFAULT_WALLET });
    notify('warning', 'Portefeuille démo réinitialisé.');
  };

  const handleResetDemoSession = () => {
    if (!isDemo) {
      notify('info', 'Réinitialisation utile uniquement pour la démonstration.');
      return;
    }
    const freshProfile = createDefaultProfile();
    setProfile(freshProfile);
    setWallet(null);
    saveDemoWallet(null);
    saveDemoProfile(freshProfile);
    setProfileForm({ id: freshProfile.id, msisdn: freshProfile.msisdn });
    notify('warning', 'Session démo réinitialisée.');
  };

  const handleDownloadStatement = () => {
    if (!isBrowser) {
      notify('info', 'Téléchargement disponible dans un navigateur.');
      return;
    }

    const lines = [
      'Congo Gaming – Relevé investisseur (mode vitrine)',
      `Date : ${new Date().toLocaleString('fr-CD')}`,
      '',
      `Identifiant : ${profile?.id ?? 'N/A'}`,
      `MSISDN : ${profile?.msisdn ?? 'N/A'}`,
      `Créé le : ${joinedAt ?? 'N/A'}`,
      '',
      'Solde portefeuille :',
      `- CDF : ${formatCurrency(wallet?.balance_cdf ?? 0, 'CDF')}`,
      `- USD : ${formatCurrency(wallet?.balance_usd ?? 0, 'USD')}`,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = INVESTOR_STATEMENT_FILE;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify('success', 'Relevé investisseur téléchargé.');
  };

  const handleContactSupport = () => {
    if (!isBrowser) {
      notify('info', `Contactez-nous sur ${INVESTOR_SUPPORT_EMAIL}`);
      return;
    }
    window.location.href = `mailto:${INVESTOR_SUPPORT_EMAIL}?subject=Congo%20Gaming%20-%20Investisseur%20(vitrine)`;
  };

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isDemo) {
      notify('info', 'Le changement d\'avatar est disponible en mode vitrine.');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      notify('error', 'Merci de sélectionner un fichier image.');
      return;
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      notify('error', 'Image trop lourde (max 2 Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        notify('error', 'Impossible de lire le fichier sélectionné.');
        return;
      }
      setAvatar(result);
      notify('success', 'Nouvel avatar appliqué.');
    };
    reader.onerror = () => {
      notify('error', 'Erreur lors du chargement de l\'image.');
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUploadClick = () => {
    if (!isDemo) {
      notify('info', 'Le changement d\'avatar est disponible en mode vitrine.');
      return;
    }
    avatarInputRef.current?.click();
  };

  const handleAvatarReset = () => {
    if (!isDemo) {
      notify('info', 'La réinitialisation de l\'avatar est disponible en mode vitrine.');
      return;
    }
    setAvatar(null);
    notify('warning', 'Avatar réinitialisé.');
  };

  if (error && !profile) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-2 py-12 md:px-0">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-slate-100">Mon Profil</h1>
          <p className="text-sm text-slate-400">
            Connectez-vous pour retrouver vos informations personnelles et votre portefeuille.
          </p>
        </header>
        <div className="info-box error mx-auto max-w-xl">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-2 py-12 md:px-0">
        <div className="glass-card bg-slate-950/80 text-center text-sm text-slate-300">Chargement du profil…</div>
      </div>
    );
  }

  const currentAvatar = avatar ?? AVATAR_URL;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-2 py-12 md:px-0">
      <header className="glass-card flex flex-col gap-6 bg-slate-950/70 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentAvatar}
              alt="Avatar investisseur"
              className="h-20 w-20 rounded-full border border-sky-400/40 object-cover"
            />
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>
          <div>
            <span
              className={`tag ${
                isDemo ? 'bg-emerald-500/15 text-emerald-200' : 'bg-sky-500/15 text-sky-200'
              }`}
            >
              {isDemo ? 'Investisseur – mode vitrine' : 'Compte vérifié'}
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-slate-100">Mon Profil</h1>
            <p className="text-sm text-slate-400">
              Consolidez votre dossier investisseur et suivez vos simulations de capitalisation.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-slate-300 md:items-end">
          <span>Identifiant&nbsp;: <strong className="text-slate-100">{profile.id}</strong></span>
          {joinedAt && <span>Créé le {joinedAt}</span>}
        </div>
      </header>

      {status && (
        <div
          className={`info-box ${
            status.type === 'success'
              ? 'success'
              : status.type === 'error'
                ? 'error'
                : status.type === 'warning'
                  ? 'warning'
                  : ''
          } max-w-3xl`}
        >
          {status.message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary px-4 py-2 text-xs" type="button" onClick={handleAvatarUploadClick}>
          Changer mon avatar
        </button>
        <button
          className="btn btn-secondary px-4 py-2 text-xs"
          type="button"
          onClick={handleAvatarReset}
          disabled={!avatar}
        >
          Réinitialiser l'avatar
        </button>
      </div>

      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <article className="glass-card space-y-4 bg-slate-950/70">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">Identité investisseur</h2>
            <button className="btn btn-secondary px-4 py-2 text-xs" type="submit" form="investor-profile-form">
              Sauvegarder
            </button>
          </header>
          <form id="investor-profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="text-xs uppercase tracking-wide text-slate-400">Identifiant</span>
                <input
                  name="id"
                  value={profileForm.id}
                  onChange={handleProfileFieldChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-base text-slate-100 focus:border-sky-500 focus:outline-none"
                  placeholder="INVEST-DRC-001"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="text-xs uppercase tracking-wide text-slate-400">MSISDN</span>
                <input
                  name="msisdn"
                  value={profileForm.msisdn}
                  onChange={handleProfileFieldChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-base text-slate-100 focus:border-sky-500 focus:outline-none"
                  placeholder="Ex : +243900000000"
                />
              </label>
            </div>
            <p className="text-xs text-slate-400">
              Ces informations sont stockées localement pour préparer votre dossier investisseur auprès de Congo Gaming.
            </p>
          </form>
        </article>

        <article className="glass-card space-y-5 bg-slate-950/70">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">Portefeuille démo</h2>
            <div className="flex gap-2">
              <button className="btn btn-secondary px-4 py-2 text-xs" onClick={handleActivateWallet} type="button">
                Activer
              </button>
              <button className="btn btn-secondary px-4 py-2 text-xs" onClick={handleResetWallet} type="button">
                Réinitialiser
              </button>
            </div>
          </header>

          <div className="space-y-4">
            <div className="grid gap-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-400">Solde CDF</span>
                <p className="mt-2 text-lg font-semibold text-emerald-200">
                  {formatCurrency(wallet?.balance_cdf ?? 0, 'CDF')}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-400">Solde USD</span>
                <p className="mt-2 text-lg font-semibold text-emerald-200">
                  {formatCurrency(wallet?.balance_usd ?? 0, 'USD')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Opérations simulées</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  name="amount"
                  value={walletForm.amount}
                  onChange={handleWalletFieldChange}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  placeholder="Montant"
                />
                <select
                  name="currency"
                  value={walletForm.currency}
                  onChange={handleWalletFieldChange}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                >
                  <option value="CDF">CDF</option>
                  <option value="USD">USD</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary px-4 py-2 text-xs"
                    onClick={() => handleWalletAction('deposit')}
                  >
                    Déposer
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-4 py-2 text-xs"
                    onClick={() => handleWalletAction('withdraw')}
                  >
                    Retirer
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Ajustez vos fonds pour simuler des scénarios de trésorerie. Les données sont conservées localement.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="glass-card flex flex-col gap-4 bg-slate-950/80 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-100">Support investisseur</h2>
          <p className="text-sm text-slate-400">
            Téléchargez un relevé ou contactez directement le desk VIP pour approfondir vos discussions.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary px-4 py-2 text-xs" type="button" onClick={handleDownloadStatement}>
              Télécharger le relevé
            </button>
            <button className="btn btn-primary px-4 py-2 text-xs" type="button" onClick={handleContactSupport}>
              Contacter le support VIP
            </button>
            <button className="btn btn-secondary px-4 py-2 text-xs" type="button" onClick={handleResetDemoSession}>
              Réinitialiser la vitrine
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p>
            Email direct&nbsp;: <span className="font-semibold text-slate-100">{INVESTOR_SUPPORT_EMAIL}</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Une équipe dédiée répond en moins de 4&nbsp;heures ouvrées pour les investisseurs institutionnels.
          </p>
        </div>
      </section>
    </div>
  );
}
