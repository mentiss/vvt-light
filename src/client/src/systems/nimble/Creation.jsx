// src/client/src/systems/nimble/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Nimble — PUBLIC, sans auth (spec_nimble.md §6.3).
// Guide, puis six onglets en navigation libre, chacun avec son état (✓ ou •),
// sa ligne « À faire » et une colonne d'aide ; Précédent / Suivant. Règles
// pures : config/rules/creation.js. Après la création, l'écran du code
// d'accès s'affiche avant tout accès à la fiche.
//
// Contrat (CreationPage) : onCreated, onCancel, darkMode, onToggleDarkMode.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystem } from '@/app/hooks/useSystem.js';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';

import { INITIAL_CREATION, creationTodo, isCreationComplete, buildCharacterPayload } from './config/rules/creation.js';
import { displayName } from './config/rules/character.js';
import NbTopBar from './components/ui/NbTopBar.jsx';
import { NbTabs } from './components/ui/NbUi.jsx';
import { useBoxSize } from './hooks/useBoxSize.js';
import { HelpProvider, HelpPanel } from './components/creation/CreationHelp.jsx';
import { GuideTab, ClassTab, AncestryTab, BackgroundTab, StatsTab, EquipmentTab, IdentityTab } from './components/creation/CreationTabs.jsx';

const STEPS = [
    { id: 'guide',      label: 'Guide' },
    { id: 'class',      label: 'Classe' },
    { id: 'ancestry',   label: 'Ascendance' },
    { id: 'background', label: 'Historique' },
    { id: 'stats',      label: 'Caractéristiques' },
    { id: 'equipment',  label: 'Équipement' },
    { id: 'identity',   label: 'Identité' },
];
const TAB_COMPONENTS = {
    class: ClassTab, ancestry: AncestryTab, background: BackgroundTab, stats: StatsTab, equipment: EquipmentTab, identity: IdentityTab,
};

/** Précédent / Suivant en bas de chaque onglet */
const StepNav = ({ tab, onGo }) => {
    const i = STEPS.findIndex(s => s.id === tab);
    const prev = STEPS[i - 1];
    const next = STEPS[i + 1];
    return (
        <div className="nb-step-nav">
            {prev ? <button type="button" className="vtt-btn" onClick={() => onGo(prev.id)}>‹ {prev.label}</button> : <span />}
            {next && <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => onGo(next.id)}>{next.label} ›</button>}
        </div>
    );
};

const Creation = ({ darkMode, onToggleDarkMode }) => {
    const { apiBase, slug } = useSystem();
    const navigate = useNavigate();
    const stickyRef = useRef(null);
    const band = useBoxSize(stickyRef);

    const [ws, setWs]               = useState(INITIAL_CREATION);
    const [tab, setTabState]        = useState('guide');
    const [helpTopic, setHelpTopic] = useState({ kind: 'tab', key: 'class' });
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
            <div className="nb-root flex items-center justify-center p-4">
                <div className="nb-wizard nb-paper text-center max-w-md w-full">
                    <div className="nb-help-title mb-1">{displayName(ws)}</div>
                    <p className="nb-note mb-4">prend la route. Notez ce code : c'est votre seule façon de retrouver votre fiche.</p>
                    <span className="nb-label">Code d'accès</span>
                    <div className="nb-code mb-3">{created.accessCode}</div>
                    <div className="flex flex-col gap-2 items-center">
                        <CopyAccessButton character={created} codeOnly />
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
        <div className="nb-root" style={{ '--nb-band-h': `${band.height ?? 0}px` }}>
            <NbTopBar ref={stickyRef} subtitle="Création d'un héros" darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />

            <main className="nb-page">
                <div className="nb-wizard nb-paper">
                    <NbTabs tabs={tabs} active={tab} onSelect={setTab} className="nb-wizard-tabs" />
                    {tab !== 'guide' && (
                        todo[tab].length
                            ? <div className="nb-todo"><b>À faire :</b> {todo[tab].join(' · ')}</div>
                            : <div className="nb-todo is-done">✓ Étape terminée</div>
                    )}
                    <HelpProvider value={setHelpTopic}>
                        <div className={`nb-wizard-body${tab === 'guide' ? ' is-single' : ''}`}>
                            <div className="min-w-0">
                                {tab === 'guide' ? <GuideTab onStart={() => setTab('class')} /> : <Current ws={ws} setWs={setWs} />}

                                {tab === 'identity' && (
                                    <div className="nb-fields mt-6">
                                        {!complete && <div className="nb-todo"><b>Avant de créer :</b> {remaining.join(' · ')}</div>}
                                        {error && <div className="nb-todo is-error">{error}</div>}
                                        <div>
                                            <button type="button" className="vtt-btn vtt-btn-primary" disabled={!complete || submitting} onClick={submit}>
                                                {submitting ? 'Création…' : 'Créer le héros'}
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
