// src/client/src/systems/vileborn/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Vileborn — PUBLIC, sans auth (spec_vileborn.md §3.2, §II.7).
// Création minimale aux règles déduites des prétirés : Guide, puis six onglets
// en navigation libre, chacun avec son état (✓ ou •), sa ligne « À faire » et
// une colonne d'aide ; Précédent / Suivant. Règles pures : config/rules/creation.js.
// Après la création, l'écran du code d'accès s'affiche avant tout accès à la fiche.
//
// Contrat (CreationPage) : onCreated, onCancel, darkMode, onToggleDarkMode.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystem } from '../../hooks/useSystem.js';
import ThemeToggle   from '../../components/ui/ThemeToggle.jsx';
import CopyAccessButton from '../../components/ui/CopyAccessButton.jsx';

import { INITIAL_CREATION, creationTodo, isCreationComplete, buildCharacterPayload } from './config/rules/creation.js';
import { displayName } from './config/rules/character.js';
import Brand from './Brand.jsx';
import { VilTabs } from './components/ui/VilUi.jsx';
import { HelpProvider, HelpPanel } from './components/creation/CreationHelp.jsx';
import {
    GuideTab, HeritageTab, OriginTab, ApproachesTab, WordsTab, ResourceTab, IdentityTab,
} from './components/creation/CreationTabs.jsx';

const STEPS = [
    { id: 'guide',      label: 'Guide' },
    { id: 'heritage',   label: 'Sombre héritage' },
    { id: 'origin',     label: 'Origine' },
    { id: 'approaches', label: 'Approches' },
    { id: 'words',      label: 'Personnalité et Formation' },
    { id: 'resource',   label: 'Ressource et mobiles' },
    { id: 'identity',   label: 'Identité' },
];
const TAB_COMPONENTS = {
    heritage: HeritageTab, origin: OriginTab, approaches: ApproachesTab, words: WordsTab, resource: ResourceTab, identity: IdentityTab,
};

/** Précédent / Suivant en bas de chaque onglet */
const StepNav = ({ tab, onGo }) => {
    const i = STEPS.findIndex(s => s.id === tab);
    const prev = STEPS[i - 1];
    const next = STEPS[i + 1];
    return (
        <div className="vil-step-nav">
            {prev ? <button type="button" className="vtt-btn" onClick={() => onGo(prev.id)}>‹ {prev.label}</button> : <span />}
            {next && <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => onGo(next.id)}>{next.label} ›</button>}
        </div>
    );
};

const Creation = ({ darkMode, onToggleDarkMode }) => {
    const { apiBase, slug } = useSystem();
    const navigate = useNavigate();

    const [ws, setWs]               = useState(INITIAL_CREATION);
    const [tab, setTabState]        = useState('guide');
    const [helpTopic, setHelpTopic] = useState({ kind: 'tab', key: 'heritage' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState(null);
    const [created, setCreated]     = useState(null);   // { accessCode, accessUrl }

    const todo = useMemo(() => creationTodo(ws), [ws]);
    const complete = isCreationComplete(ws);

    // Changer d'onglet remet l'aide sur celle de l'onglet et remonte en haut de page
    const setTab = (id) => { setTabState(id); setHelpTopic({ kind: 'tab', key: id }); window.scrollTo({ top: 0 }); };

    const submit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${apiBase}/characters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildCharacterPayload(ws)),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Erreur lors de la création');
            }
            const character = await res.json();
            setCreated({ accessCode: character.accessCode, accessUrl: character.accessUrl });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Écran post-création : le code d'accès d'abord, sinon impossible de revenir ──
    if (created) {
        return (
            <div className="vil-root flex items-center justify-center p-4" data-theme={darkMode ? 'dark' : 'light'}>
                <div className="vil-sheet vil-paper text-center max-w-md w-full">
                    <div className="vil-wizard-title mb-1">{displayName(ws)}</div>
                    <p className="vil-note mb-4">rejoint la Malengeance. Notez ce code : c'est votre seule façon de retrouver votre fiche.</p>
                    <span className="vil-label is-plain">Code d'accès</span>
                    <div className="vil-code mb-3">{created.accessCode}</div>
                    <div className="flex flex-col gap-2 items-center">
                        <CopyAccessButton character={{ ...ws, ...created }} />
                        <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => navigate(`/${slug}/${created.accessUrl}`)}>
                            Accéder à ma fiche
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = STEPS.map(s => (s.id === 'guide' ? s
        : { ...s, badge: todo[s.id].length ? '•' : '✓', badgeClass: todo[s.id].length ? 'is-left' : 'is-done' }));
    const Current = TAB_COMPONENTS[tab];
    const remaining = Object.values(todo).flat();

    return (
        <div className="vil-root" data-theme={darkMode ? 'dark' : 'light'}>
            <header className="vil-sticky-top">
                <div className="vil-topbar">
                    <Brand variant="title" />
                    <span className="vil-topbar-sub">Création d'un Paria</span>
                    <span className="vil-topbar-tools"><ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} /></span>
                </div>
            </header>

            <main className="vil-page">
                <div className="vil-sheet vil-paper">
                    <VilTabs tabs={tabs} active={tab} onSelect={setTab} className="vil-wizard-tabs" />
                    {tab !== 'guide' && (
                        todo[tab].length
                            ? <div className="vil-todo"><b>À faire :</b> {todo[tab].join(' · ')}</div>
                            : <div className="vil-todo is-done">✓ Étape terminée</div>
                    )}
                    <HelpProvider value={setHelpTopic}>
                        <div className={`vil-wizard-body${tab === 'guide' ? ' is-single' : ''}`}>
                            <div className="min-w-0">
                                {tab === 'guide' ? <GuideTab onStart={() => setTab('heritage')} /> : <Current ws={ws} setWs={setWs} />}

                                {tab === 'identity' && (
                                    <div className="vil-fields" style={{ marginTop: 24 }}>
                                        {!complete && <div className="vil-todo"><b>Avant de créer :</b> {remaining.join(' · ')}</div>}
                                        {error && <div className="vil-todo vil-red">{error}</div>}
                                        <div>
                                            <button type="button" className="vtt-btn vtt-btn-primary" disabled={!complete || submitting} onClick={submit}>
                                                {submitting ? 'Création…' : 'Créer le Paria'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <StepNav tab={tab} onGo={setTab} />
                            </div>
                            {/* Pas de colonne d'aide sur le Guide : il explique déjà tout */}
                            {tab !== 'guide' && <HelpPanel topic={helpTopic} onBack={() => setHelpTopic({ kind: 'tab', key: tab })} />}
                        </div>
                    </HelpProvider>
                </div>
            </main>
        </div>
    );
};

export default Creation;
