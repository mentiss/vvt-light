// src/client/src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Page d'accueil de la plateforme (spec_plateforme_accueil.md §4) : enveloppe et
// thème de la plateforme, lanceur de dés libre (jamais enregistré) et dés de la
// plateforme, « Reprendre » (connexions encore valides de cet appareil), cartes
// des slugs non masqués (marque du slug ou carte par défaut), pied de page.
// Liste des slugs : SystemsContext (déjà chargé au boot).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useSystems } from '../context/SystemsContext.jsx';
import SystemCard     from '../components/platform/SystemCard.jsx';
import SystemBrand    from '../components/platform/SystemBrand.jsx';
import FreeDiceModal  from '../components/modals/FreeDiceModal.jsx';
import DiceConfigModal from '../components/modals/DiceConfigModal.jsx';
import DiceAnimationOverlay from '../components/shared/DiceAnimationOverlay.jsx';
import { parseServerDate } from '../tools/utils.js';
import useSlugGuard from '../hooks/useSlugGuard.js';

const GITHUB_URL = 'https://github.com/mentiss/vvt-light';

// « hash|AAAA-MM-JJ » injecté au build (vite.config.js)
const [VERSION_HASH, VERSION_DATE] = (import.meta.env.VITE_APP_VERSION ?? 'dev').split('|');
// Version de release, fournie par scripts/release.js au build (absente en dev)
const RELEASE_VERSION = import.meta.env.VITE_RELEASE_VERSION;

const Icon = ({ d, children }) => (
    <svg className="vtt-icon-line" viewBox="0 0 24 24" aria-hidden="true">{d ? <path d={d} /> : children}</svg>
);

const HomePage = ({ darkMode, onToggleDarkMode }) => {
    const mustReload = useSlugGuard();
    const { systems, error } = useSystems();
    const [resumes,       setResumes]        = useState([]);
    const [showFreeDice,   setShowFreeDice]   = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);

    // Connexions encore valides de cet appareil (cookies de reconnexion des slugs)
    useEffect(() => {
        fetch('/api/resume', { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .then(setResumes)
            .catch(() => setResumes([]));
    }, []);

    const labelOf      = (slug) => systems?.find(s => s.slug === slug)?.label ?? slug;
    const listed       = (systems ?? []).filter(s => !s.hidden);
    const formatDay    = (d) => parseServerDate(d)?.toLocaleDateString('fr-FR') ?? '';

    // Arrivée par navigation interne depuis un slug : rechargement en cours
    if (mustReload) return null;

    return (
        <div className="vtt-platform flex flex-col">
            {/* ── En-tête ──────────────────────────────────────────────────── */}
            <header className="vtt-page-header">
                <div>
                    <h1 className="vtt-brand-name">Mentiss <span>VTT</span></h1>
                    <p className="text-xs text-muted mt-0.5">Plateforme de jeu de rôle</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setShowFreeDice(true)} title="Lancer des dés (jamais enregistré)">
                        <Icon><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="15" cy="9" r="1" fill="currentColor" /><circle cx="9" cy="15" r="1" fill="currentColor" /></Icon>
                        <span className="hidden sm:inline">Lancer des dés</span>
                    </button>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon" onClick={() => setShowDiceConfig(true)} title="Mes dés">
                        <Icon><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></Icon>
                    </button>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon" onClick={onToggleDarkMode} title={darkMode ? 'Mode jour' : 'Mode nuit'}>
                        {darkMode
                            ? <Icon><circle cx="12" cy="12" r="4.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></Icon>
                            : <Icon d="M16 3.5A8.5 8.5 0 1 0 20.5 16 7 7 0 0 1 16 3.5z" />}
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
                {/* ── Reprendre ────────────────────────────────────────────── */}
                {resumes.length > 0 && (
                    <section>
                        <h2 className="vtt-section-title">Reprendre</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            {resumes.map(r => (
                                <a key={r.slug} className="vtt-resume" href={`/${r.slug}/${r.accessUrl}`}>
                                    <span className="vtt-resume-brand">
                                        <SystemBrand variant="title" slug={r.slug} label={labelOf(r.slug)} />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block font-semibold truncate">{r.name}</span>
                                        <span className="block text-xs text-muted">Connecté le {formatDay(r.connectedAt)}</span>
                                    </span>
                                    <span className="text-primary"><Icon d="M9 6l6 6-6 6" /></span>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Systèmes ─────────────────────────────────────────────── */}
                <section>
                    <h2 className="vtt-section-title">Choisissez votre système</h2>
                    {systems === null ? (
                        <p className="text-muted animate-pulse">Chargement…</p>
                    ) : error ? (
                        <div className="vtt-callout vtt-callout-danger">Impossible de contacter le serveur ({error}).</div>
                    ) : listed.length === 0 ? (
                        <p className="text-muted">Aucun système disponible.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {listed.map(s => <SystemCard key={s.slug} slug={s.slug} label={s.label} />)}
                        </div>
                    )}
                </section>
            </main>

            {/* ── Pied de page ─────────────────────────────────────────────── */}
            <footer className="vtt-page-footer">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                    <Icon d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
                    Code source sur GitHub
                </a>
                <span>Version {RELEASE_VERSION && `v${RELEASE_VERSION} · `}{VERSION_HASH}{VERSION_DATE && ` · ${new Date(VERSION_DATE).toLocaleDateString('fr-FR')}`}</span>
                <span>{listed.length} système{listed.length > 1 ? 's' : ''}</span>
            </footer>

            {showFreeDice && <FreeDiceModal persist={false} onClose={() => setShowFreeDice(false)} />}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}
            <DiceAnimationOverlay />
        </div>
    );
};

export default HomePage;
