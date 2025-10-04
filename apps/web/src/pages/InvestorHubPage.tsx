import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const VERTICALS = [
  {
    key: 'sports',
    label: 'Paris sportifs',
    description: 'Couverture complète pre-match & live, trading desk interne et streaming.',
    expectedReturn: 0.18,
    risk: 0.4,
  },
  {
    key: 'casino',
    label: 'Casino virtuel',
    description: 'Slots RNG certifiés, live dealers et jackpots progressifs.',
    expectedReturn: 0.24,
    risk: 0.55,
  },
  {
    key: 'lottery',
    label: 'Loterie',
    description: 'Tirages officiels agréés avec distribution nationale.',
    expectedReturn: 0.12,
    risk: 0.22,
  },
  {
    key: 'scratch',
    label: 'Scratch cards',
    description: 'Distribution digitale & retail avec marges élevées.',
    expectedReturn: 0.27,
    risk: 0.6,
  },
  {
    key: 'fantasy',
    label: 'Fantasy League',
    description: 'Engagement hebdomadaire, monétisation par packs premium.',
    expectedReturn: 0.2,
    risk: 0.35,
  },
];

const COMPLIANCE_PILLARS = [
  {
    title: 'Conformité ARPTC & AML',
    detail:
      'Procédures KYC automatisées, screening OFAC/EU, reporting mensuel au régulateur et certification RNG GLI.',
  },
  {
    title: 'Gouvernance & protection des joueurs',
    detail:
      'Limites de dépôt, outils d’auto-exclusion, cellule RGPD dédiée et audits internes trimestriels.',
  },
  {
    title: 'Infrastructure & sécurité',
    detail:
      'Tier III data center, réplication multi-région, SOC 2 en cours, monitoring 24/7.',
  },
];

const ROADMAP = [
  { quarter: 'T4 2024', milestone: 'Lancement cash-out temps réel et paris combinés boostés.' },
  { quarter: 'T1 2025', milestone: 'Ouverture casino live HD & extension fantasy league en Afrique Centrale.' },
  { quarter: 'T2 2025', milestone: 'API B2B pour opérateurs partenaires + portail analytics white-label.' },
  { quarter: 'T3 2025', milestone: 'Certification ISO 27001 et expansion vers l’Afrique de l’Est.' },
];

const TESTIMONIALS = [
  {
    name: 'Groupe ViaBet',
    quote:
      '« Congo Gaming a réduit notre time-to-market de 70%. L’équipe compliance anticipe chaque exigence locale. »',
  },
  {
    name: 'Banque Capital RDC',
    quote:
      '« Leur reporting financier et AML est le plus structuré que nous ayons vu sur le continent. »',
  },
  {
    name: 'Alliance Sport Pro',
    quote:
      '« L’infrastructure a supporté 1,1 million de connexions simultanées lors de la dernière CAN. »',
  },
];

interface OperatorProfile {
  id: string;
  name: string;
  skin: string;
  country: string;
  status: 'En exploitation' | 'Lancement' | 'Signature';
  monthlyGGR: number;
  payoutRatio: number;
  taxRate: number;
  platformFeeRate: number;
  mobileMoneyFeeRate: number;
  revShareRate: number;
  verticalMix: Record<string, number>;
}

const OPERATORS: OperatorProfile[] = [
  {
    id: 'op-kin-01',
    name: 'Kinshasa Odds',
    skin: 'kinodds.cd',
    country: 'RDC',
    status: 'En exploitation',
    monthlyGGR: 75000,
    payoutRatio: 0.86,
    taxRate: 0.2,
    platformFeeRate: 0.025,
    mobileMoneyFeeRate: 0.015,
    revShareRate: 0.25,
    verticalMix: {
      sports: 0.45,
      casino: 0.25,
      lottery: 0.15,
      scratch: 0.1,
      fantasy: 0.05,
    },
  },
  {
    id: 'op-lub-02',
    name: 'Lubumbashi Royale',
    skin: 'lub-royale.com',
    country: 'RDC',
    status: 'Lancement',
    monthlyGGR: 52000,
    payoutRatio: 0.88,
    taxRate: 0.2,
    platformFeeRate: 0.028,
    mobileMoneyFeeRate: 0.018,
    revShareRate: 0.25,
    verticalMix: {
      sports: 0.3,
      casino: 0.4,
      lottery: 0.1,
      scratch: 0.1,
      fantasy: 0.1,
    },
  },
  {
    id: 'op-kind-03',
    name: 'Kindu Prime',
    skin: 'kinduprime.cd',
    country: 'RDC',
    status: 'Signature',
    monthlyGGR: 43000,
    payoutRatio: 0.85,
    taxRate: 0.2,
    platformFeeRate: 0.028,
    mobileMoneyFeeRate: 0.018,
    revShareRate: 0.25,
    verticalMix: {
      sports: 0.28,
      casino: 0.32,
      lottery: 0.18,
      scratch: 0.12,
      fantasy: 0.1,
    },
  },
];

const ONBOARDING_STEPS = [
  {
    title: 'Étude de dossier',
    description: 'Analyse KYC corporate, projection NGR et conformité juridique locale.',
    detail: '48h pour valider gouvernance, actionnariat, politiques RG et AML.',
  },
  {
    title: 'Accord licence & SLA',
    description: 'Signature contrat de représentation + SLA technique/compliance.',
    detail: 'Inclut rev-share, responsabilités RGPD, plafonds Mobile Money.',
  },
  {
    title: 'Implémentation technique',
    description: 'Connexion APIs, thèmes white-label, intégration paiements & CRM.',
    detail: 'Sprint de 10 jours avec sandbox, tests charge et homologation ARPTC.',
  },
  {
    title: 'Go-live & monitoring',
    description: 'Activation production, dashboards temps réel, cellule support 24/7.',
    detail: 'Reportings NGR, monitoring fraude et réunions gouvernance mensuelles.',
  },
];

type OperatorStatus = OperatorProfile['status'];

interface RevShareScenario {
  monthlyGGR: number;
  payoutRatio: number;
  taxRate: number;
  platformFeeRate: number;
  mobileMoneyFeeRate: number;
  revShareRate: number;
}

interface InvestmentParams {
  initialCapital: number;
  monthlyOperatingCost: number;
  marketingBudget: number;
  projectionMonths: number;
  monthlyGrowthRate: number;
}

function distributeWeights(values: Record<string, number>) {
  const total = Object.values(values).reduce((acc, value) => acc + value, 0) || 1;
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Math.max(0, value) / total]),
  );
}

const VERTICAL_LABELS = Object.fromEntries(VERTICALS.map(vertical => [vertical.key, vertical.label]));

const operatorStatuses: OperatorStatus[] = ['En exploitation', 'Lancement', 'Signature'];

function formatCurrencyUSD(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function computeRevShareBreakdown(scenario: RevShareScenario) {
  const gross = scenario.monthlyGGR;
  const tax = gross * scenario.taxRate;
  const platformFees = gross * scenario.platformFeeRate;
  const mobileMoneyFees = gross * scenario.mobileMoneyFeeRate;
  const netAfterFees = gross - tax - platformFees - mobileMoneyFees;
  const providerShare = netAfterFees * scenario.revShareRate;
  const operatorShare = netAfterFees - providerShare;

  return {
    gross,
    tax,
    platformFees,
    mobileMoneyFees,
    netAfterFees,
    providerShare,
    operatorShare,
  };
}

export function InvestorHubPage() {
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(VERTICALS.map(vertical => [vertical.key, 1])),
  );
  const [statusFilter, setStatusFilter] = useState<OperatorStatus | 'all'>('all');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(OPERATORS[0]?.id ?? '');
  const [scenario, setScenario] = useState<RevShareScenario>(() => {
    const operator = OPERATORS[0];
    if (!operator) {
      return {
        monthlyGGR: 40000,
        payoutRatio: 0.85,
        taxRate: 0.2,
        platformFeeRate: 0.025,
        mobileMoneyFeeRate: 0.02,
        revShareRate: 0.25,
      };
    }
    return {
      monthlyGGR: operator.monthlyGGR,
      payoutRatio: operator.payoutRatio,
      taxRate: operator.taxRate,
      platformFeeRate: operator.platformFeeRate,
      mobileMoneyFeeRate: operator.mobileMoneyFeeRate,
      revShareRate: operator.revShareRate,
    };
  });
  const [investmentParams, setInvestmentParams] = useState<InvestmentParams>({
    initialCapital: 150_000,
    monthlyOperatingCost: 18_000,
    marketingBudget: 12_000,
    projectionMonths: 12,
    monthlyGrowthRate: 0.06,
  });

  const normalized = useMemo(() => distributeWeights(weights), [weights]);
  const filteredOperators = useMemo(
    () =>
      statusFilter === 'all'
        ? OPERATORS
        : OPERATORS.filter(operator => operator.status === statusFilter),
    [statusFilter],
  );
  const selectedOperator = useMemo(
    () => OPERATORS.find(operator => operator.id === selectedOperatorId) ?? OPERATORS[0] ?? null,
    [selectedOperatorId],
  );
  const breakdown = useMemo(() => computeRevShareBreakdown(scenario), [scenario]);
  const verticalBreakdown = useMemo(() => {
    if (!selectedOperator) {
      return [];
    }
    return Object.entries(selectedOperator.verticalMix).map(([key, weight]) => ({
      key,
      label: VERTICAL_LABELS[key] ?? key,
      weight,
      amount: scenario.monthlyGGR * weight,
    }));
  }, [scenario.monthlyGGR, selectedOperator]);
  const investmentMetrics = useMemo(() => {
    const projectionMonths = Math.max(1, investmentParams.projectionMonths);
    const monthlyOperatorNet = breakdown.operatorShare - investmentParams.monthlyOperatingCost - investmentParams.marketingBudget;
    let cumulativeNet = 0;
    let monthlyNet = monthlyOperatorNet;
    for (let month = 0; month < projectionMonths; month += 1) {
      cumulativeNet += monthlyNet;
      monthlyNet *= 1 + investmentParams.monthlyGrowthRate;
    }
    const roi = investmentParams.initialCapital > 0 ? cumulativeNet / investmentParams.initialCapital : 0;
    let paybackMonths = Number.POSITIVE_INFINITY;
    let runningNet = 0;
    monthlyNet = monthlyOperatorNet;
    for (let month = 0; month < projectionMonths; month += 1) {
      runningNet += monthlyNet;
      if (runningNet >= investmentParams.initialCapital) {
        paybackMonths = month + 1;
        break;
      }
      monthlyNet *= 1 + investmentParams.monthlyGrowthRate;
    }

    return {
      monthlyOperatorNet,
      cumulativeNet,
      roi,
      paybackMonths,
      projectionMonths,
      monthlyGrowthRate: investmentParams.monthlyGrowthRate,
    };
  }, [breakdown.operatorShare, investmentParams]);

  const { expectedReturn, risk } = useMemo(() => {
    return VERTICALS.reduce(
      (acc, vertical) => {
        const weight = normalized[vertical.key] ?? 0;
        acc.expectedReturn += weight * vertical.expectedReturn;
        acc.risk += weight * vertical.risk;
        return acc;
      },
      { expectedReturn: 0, risk: 0 },
    );
  }, [normalized]);

  const handleWeightChange = (key: string, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!selectedOperator) {
      return;
    }
    setScenario({
      monthlyGGR: selectedOperator.monthlyGGR,
      payoutRatio: selectedOperator.payoutRatio,
      taxRate: selectedOperator.taxRate,
      platformFeeRate: selectedOperator.platformFeeRate,
      mobileMoneyFeeRate: selectedOperator.mobileMoneyFeeRate,
      revShareRate: selectedOperator.revShareRate,
    });
  }, [selectedOperator]);

  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === 'all') {
      setStatusFilter('all');
      return;
    }
    setStatusFilter(value as OperatorStatus);
  };

  const handleOperatorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperatorId(event.target.value);
  };

  const handleMonthlyGGRChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (Number.isNaN(nextValue)) {
      return;
    }
    setScenario(prev => ({ ...prev, monthlyGGR: Math.max(0, nextValue) }));
  };

  const handleScenarioRateChange = (field: keyof Omit<RevShareScenario, 'monthlyGGR'>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = Number(event.target.value);
      if (Number.isNaN(nextValue)) {
        return;
      }
      setScenario(prev => ({ ...prev, [field]: Math.max(0, nextValue / 100) }));
    };

  const handleInvestmentChange = (field: keyof InvestmentParams) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = Number(event.target.value);
      if (Number.isNaN(nextValue)) {
        return;
      }
      setInvestmentParams(prev => ({ ...prev, [field]: Math.max(0, field === 'projectionMonths' ? Math.round(nextValue) : nextValue) }));
    };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-2 py-12 md:px-0">
      <header className="glass-card space-y-4 bg-slate-950/70">
        <span className="tag bg-emerald-500/15 text-emerald-200">Investisseur</span>
        <h1 className="text-4xl font-semibold text-slate-100">Hub stratégique Congo Gaming</h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Accédez aux indicateurs de performance, simulez vos allocations multi-verticales et consultez
          la feuille de route gouvernance & conformité. Ce module de démonstration illustre notre capacité à intégrer
          l’ensemble des produits (sports, casino, loterie, scratch cards, fantasy) dans une offre unifiée.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1">Données consolidées</span>
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1">API temps réel</span>
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1">Due diligence prête</span>
        </div>
      </header>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Simulateur de portefeuille</h2>
            <p className="text-sm text-slate-400">
              Ajustez les pondérations de chaque verticale pour visualiser rendement net attendu et profil de risque agrégé.
            </p>
          </div>
          <button
            className="btn btn-secondary px-5 py-2 text-xs"
            type="button"
            onClick={() => setWeights(Object.fromEntries(VERTICALS.map(vertical => [vertical.key, 1])))}
          >
            Réinitialiser les pondérations
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            {VERTICALS.map(vertical => (
              <div key={vertical.key} className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
                <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">{vertical.label}</h3>
                    <p className="text-xs text-slate-400">{vertical.description}</p>
                  </div>
                  <span className="text-xs text-slate-400">Return cible: {(vertical.expectedReturn * 100).toFixed(0)}% · Risque: {(vertical.risk * 100).toFixed(0)}%</span>
                </header>
                <div className="mt-4 flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={weights[vertical.key] ?? 0}
                    onChange={event => handleWeightChange(vertical.key, Number(event.target.value))}
                    className="flex-1 accent-sky-500"
                  />
                  <span className="w-14 text-right text-sm text-sky-300">
                    {(normalized[vertical.key] * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-4 rounded-3xl border border-sky-500/30 bg-sky-500/10 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Profil agrégé</h3>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Rendement net attendu (12 mois)</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-200">{(expectedReturn * 100).toFixed(1)}%</p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Indice de risque pondéré</p>
                <p className="mt-2 text-2xl font-semibold text-amber-200">{(risk * 100).toFixed(1)}%</p>
              </div>
              <p className="text-xs text-slate-300">
                Ces calculs reposent sur des scénarios internes (FY2024). Les valeurs définitives dépendent des accords opérateurs et des contraintes réglementaires.
              </p>
              <Link to="/profile" className="btn btn-primary w-full justify-center">
                Ouvrir un dossier investisseur
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Opérateurs sous licence Congo Gaming</h2>
            <p className="text-sm text-slate-400">
              Catalogue des skins co-exploités : chaque opérateur finance son front, nous assurons la conformité, les paiements et l’infrastructure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              {operatorStatuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={selectedOperatorId}
              onChange={handleOperatorChange}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            >
              {filteredOperators.map(operator => (
                <option key={operator.id} value={operator.id}>
                  {operator.name} • {operator.skin}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {filteredOperators.map(operator => (
            <article
              key={operator.id}
              className={`rounded-3xl border ${
                operator.id === selectedOperatorId ? 'border-emerald-500/40' : 'border-slate-700/60'
              } bg-slate-900/60 p-5 transition-colors`}
            >
              <header className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{operator.name}</h3>
                  <p className="text-xs text-slate-400">Skin : {operator.skin}</p>
                </div>
                <span className="tag bg-sky-500/15 text-sky-200">{operator.status}</span>
              </header>
              <dl className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <dt>Marché :</dt>
                  <dd className="font-semibold text-slate-100">{operator.country}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>GGR mensuel :</dt>
                  <dd className="font-semibold text-emerald-200">{formatCurrencyUSD(operator.monthlyGGR)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Rev-share Congo Gaming :</dt>
                  <dd className="font-semibold text-sky-300">{formatPercent(operator.revShareRate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Frais plateforme :</dt>
                  <dd>{formatPercent(operator.platformFeeRate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Frais Mobile Money :</dt>
                  <dd>{formatPercent(operator.mobileMoneyFeeRate)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => setSelectedOperatorId(operator.id)}
                className="btn btn-secondary mt-4 w-full justify-center"
              >
                Simuler ce partenariat
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Simulation revenus & partage NGR</h2>
          <p className="text-sm text-slate-400">
            Ajustez les paramètres financiers pour mesurer la répartition entre votre équipe et Congo Gaming, incluant taxes et frais Mobile Money.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-slate-100">Hypothèses financières</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>GGR mensuel (USD)</span>
                  <input
                    type="number"
                    min={0}
                    value={scenario.monthlyGGR}
                    onChange={handleMonthlyGGRChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Taux de redistribution joueurs</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={(scenario.payoutRatio * 100).toFixed(1)}
                    onChange={handleScenarioRateChange('payoutRatio')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Taxe d’État</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={(scenario.taxRate * 100).toFixed(1)}
                    onChange={handleScenarioRateChange('taxRate')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Frais plateforme</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={(scenario.platformFeeRate * 100).toFixed(1)}
                    onChange={handleScenarioRateChange('platformFeeRate')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Frais Mobile Money</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={(scenario.mobileMoneyFeeRate * 100).toFixed(1)}
                    onChange={handleScenarioRateChange('mobileMoneyFeeRate')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Rev-share Congo Gaming</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={(scenario.revShareRate * 100).toFixed(1)}
                    onChange={handleScenarioRateChange('revShareRate')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Croissance mensuelle du net</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={(investmentParams.monthlyGrowthRate * 100).toFixed(1)}
                    onChange={handleInvestmentChange('monthlyGrowthRate')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Capital initial</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={investmentParams.initialCapital}
                    onChange={handleInvestmentChange('initialCapital')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Coûts opérationnels mensuels</span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={investmentParams.monthlyOperatingCost}
                    onChange={handleInvestmentChange('monthlyOperatingCost')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Budget marketing mensuel</span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={investmentParams.marketingBudget}
                    onChange={handleInvestmentChange('marketingBudget')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Horizon de projection (mois)</span>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={investmentParams.projectionMonths}
                    onChange={handleInvestmentChange('projectionMonths')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-slate-100">Répartition par verticale</h3>
              <p className="mt-2 text-xs text-slate-400">
                Pondération issue de l’opérateur sélectionné. Ajustez la valeur du GGR pour simuler vos projections.
              </p>
              <div className="mt-4 space-y-3">
                {verticalBreakdown.map(item => (
                  <div key={item.key} className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                    <span>{item.label}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-400">{formatPercent(item.weight)}</span>
                      <span className="text-sm font-semibold text-emerald-200">
                        {formatCurrencyUSD(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Partage NGR simulé</h3>
            <dl className="space-y-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">GGR brut</dt>
                <dd className="mt-2 text-2xl font-semibold text-emerald-200">{formatCurrencyUSD(breakdown.gross)}</dd>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Taxes & frais</dt>
                <dd className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Taxe État</span>
                    <span>{formatCurrencyUSD(breakdown.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais plateforme</span>
                    <span>{formatCurrencyUSD(breakdown.platformFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais Mobile Money</span>
                    <span>{formatCurrencyUSD(breakdown.mobileMoneyFees)}</span>
                  </div>
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Net après frais</dt>
                <dd className="mt-2 text-2xl font-semibold text-sky-300">{formatCurrencyUSD(breakdown.netAfterFees)}</dd>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Part Congo Gaming</dt>
                <dd className="mt-2 text-2xl font-semibold text-emerald-200">{formatCurrencyUSD(breakdown.providerShare)}</dd>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Part opérateur</dt>
                <dd className="mt-2 text-2xl font-semibold text-amber-200">{formatCurrencyUSD(breakdown.operatorShare)}</dd>
              </div>
            </dl>
            <p className="text-xs text-slate-300">
              Exemple indicatif. Nous adaptons le rev-share selon la verticale, l’apport marketing et la couverture des coûts opérationnels.
            </p>
            <Link to="/profile" className="btn btn-primary w-full justify-center">
              Démarrer le process contractuel
            </Link>
          </aside>
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Projection capital et retour sur investissement</h2>
          <p className="text-sm text-slate-400">
            Visualisez l’impact de votre capital initial, des coûts récurrents et de la croissance mensuelle sur le cash-flow net.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Synthèse investisseurs</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                <dt>Net mensuel opérateur après coûts</dt>
                <dd className="text-lg font-semibold text-emerald-200">{formatCurrencyUSD(investmentMetrics.monthlyOperatorNet)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                <dt>Net cumulé sur {investmentMetrics.projectionMonths} mois</dt>
                <dd className="text-lg font-semibold text-emerald-200">{formatCurrencyUSD(investmentMetrics.cumulativeNet)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                <dt>ROI estimé</dt>
                <dd className="text-lg font-semibold text-sky-300">{formatPercent(investmentMetrics.roi, 1)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
                <dt>Période de retour sur capital</dt>
                <dd className="text-lg font-semibold text-amber-200">
                  {Number.isFinite(investmentMetrics.paybackMonths)
                    ? `${investmentMetrics.paybackMonths.toFixed(1)} mois`
                    : 'Non atteint sur la période'}
                </dd>
              </div>
            </dl>
          </div>
          <aside className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Hypothèses de croissance</h3>
            <p className="mt-3 text-sm text-slate-300">
              Croissance mensuelle du net opérateur&nbsp;: <strong className="text-sky-300">{formatPercent(investmentMetrics.monthlyGrowthRate, 1)}</strong>.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Ajustez le capital initial, les coûts et la croissance pour adapter la projection à votre capacité d’investissement. Les valeurs obtenues sont indicatives et doivent être consolidées via due diligence.
            </p>
            <Link to="/investisseurs" className="btn btn-secondary mt-4 w-full justify-center">
              Télécharger la fiche financière
            </Link>
          </aside>
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Infrastructure temps réel & monitoring financier</h2>
          <p className="text-sm text-slate-400">
            Congo Gaming opère la couche agrégateur : toutes les transactions sont capturées en temps réel, monitorées sur votre interface opérateur et redirigées vers votre compte Stripe avant reconciliation fiscale.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="text-base font-semibold text-slate-100">Pipeline technique</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              <li>
                <strong className="text-slate-100">Ingestion temps réel :</strong> événements jeux (bets, cashout, bonus) streamés via Kafka & Webhooks providers vers notre bus.
              </li>
              <li>
                <strong className="text-slate-100">Orchestration paiements :</strong> API Stripe Connect (RDC) + Mobile Money. Les fonds sont ventilés directement sur votre compte Stripe Connecté. Congo Gaming ne détient aucun fonds opérateur.
              </li>
              <li>
                <strong className="text-slate-100">Ledger unifié :</strong> microservice Node.js/Prisma stockant chaque transaction (TXID, joueur, verticale, TVA, taxes) avec horodatage et contexte conformité.
              </li>
              <li>
                <strong className="text-slate-100">Back-office opérateur :</strong> dashboard React temps réel avec sockets sécurisés, permettant de filtrer par verticale, canal de paiement et statut (pending/settled/refund).
              </li>
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="text-base font-semibold text-slate-100">Reconciliation & fiscalité</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              <li>
                <strong className="text-slate-100">Stripe payout :</strong> À J+1, Stripe verse directement sur votre compte bancaire le montant net (après frais Stripe/Mobile Money) pour chaque verticale.
              </li>
              <li>
                <strong className="text-slate-100">Reconciliation Congo Gaming :</strong> notre outil calcule la part Congo Gaming (25% NGR), les taxes (20%) et génère les écritures comptables partagées (format XLS/CSV/API).
              </li>
              <li>
                <strong className="text-slate-100">Portail fiscal :</strong> export mensuel (XML + PDF) compatible DGI, avec justificatifs TVA, retenues et contributions sociales.
              </li>
              <li>
                <strong className="text-slate-100">Alerting :</strong> alertes temps réel en cas d’écart de règlement, chargeback Stripe ou blocage Mobile Money, avec workflow de résolution.
              </li>
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5 lg:col-span-2">
            <h3 className="text-base font-semibold text-slate-100">Interface opérateur & APIs</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                <h4 className="font-semibold text-slate-100">Dashboard temps réel</h4>
                <p className="mt-2 text-xs text-slate-400">
                  Vue consolidée des transactions, KPIs en live (GGR, NGR, marge Congo Gaming, taxes, paiements). Filtres par verticale, device, campagne marketing.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                <h4 className="font-semibold text-slate-100">API opérateur</h4>
                <p className="mt-2 text-xs text-slate-400">
                  Endpoints REST/GraphQL pour récupérer transactions, status payouts Stripe, états de jeux, logs KYC. Intégration possible avec vos ERP/BI.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                <h4 className="font-semibold text-slate-100">Console Stripe</h4>
                <p className="mt-2 text-xs text-slate-400">
                  Accès direct à votre compte Stripe Connect pour suivre transferts, litiges, remboursements et configurer les payouts (quotidien/hebdo).
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                <h4 className="font-semibold text-slate-100">Automatisation compliance</h4>
                <p className="mt-2 text-xs text-slate-400">
                  Matching automatique des paiements avec nos obligations fiscales (TVA, taxe jeux). Les rapports sont signés numériquement et partagés en lecture seule.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <Link to="/profile" className="btn btn-primary px-5 py-2 text-xs">
                Accéder au back-office démo
              </Link>
              <a
                className="btn btn-secondary px-5 py-2 text-xs"
                href="mailto:vip@congogaming.cd?subject=Stripe%20Connect%20-%20Monitoring%20Congo%20Gaming"
              >
                Activer mon compte Stripe Connecté
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Workflow onboarding & conformité</h2>
          <p className="text-sm text-slate-400">
            Notre modèle licensor/prestataire accompagne les opérateurs de la due diligence jusqu’au monitoring 24/7.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-4">
          {ONBOARDING_STEPS.map(step => (
            <article key={step.title} className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
              <h3 className="text-base font-semibold text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.description}</p>
              <p className="mt-3 text-xs text-slate-400">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Modèle licensor & services fournis</h2>
          <p className="text-sm text-slate-400">
            Nous fournissons la licence, la stack technique, l’agrégation jeux et les connecteurs paiements. Vous opérez votre marque et gardez la main sur l’acquisition.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="text-base font-semibold text-slate-100">Congo Gaming fournit</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Licence officielle ARPTC et sous-licence partenaires</li>
              <li>• Infrastructure hébergée, SLA 99.9%, monitoring 24/7</li>
              <li>• Intégration Mobile Money & passerelles bancaires</li>
              <li>• Back-office multi-marques, reporting NGR, compliance</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="text-base font-semibold text-slate-100">L’opérateur/investisseur gère</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Branding, acquisition et gestion de sa communauté</li>
              <li>• Capitalisation du wallet, relation client locale</li>
              <li>• Stratégie marketing & promotions locales</li>
              <li>• Service client front-line (avec escalade vers nos équipes)</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="text-base font-semibold text-slate-100">Rev-share & gouvernance</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Part Congo Gaming sur le NGR net des taxes & frais</li>
              <li>• Réunions mensuelles de pilotage et reporting automatisé</li>
              <li>• Audit AML et plan de remédiation partagé</li>
              <li>• Roadmap conjointe (nouvelles verticales, marchés voisins)</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Pilier compliance & gouvernance</h2>
          <p className="text-sm text-slate-400">
            Nos procédures couvrent l’ensemble du cycle produit : de l’onboarding joueur aux audits de distribution opérateurs.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {COMPLIANCE_PILLARS.map(pillar => (
            <article key={pillar.title} className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-slate-100">{pillar.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{pillar.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/70">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Feuille de route stratégique</h2>
          <p className="text-sm text-slate-400">
            Vision à 12 mois incluant expansion régionale, nouvelles verticales et certifications.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {ROADMAP.map(item => (
            <article key={item.quarter} className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-sky-500/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">{item.quarter}</p>
              <p className="mt-2 text-sm text-slate-200">{item.milestone}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card space-y-6 bg-slate-950/80">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-100">Retours d&apos;opérateurs</h2>
          <p className="text-sm text-slate-400">
            Témoignages de partenaires ayant intégré notre stack multi-verticale.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map(testimonial => (
            <article key={testimonial.name} className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
              <p className="text-sm italic text-slate-200">{testimonial.quote}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">{testimonial.name}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
