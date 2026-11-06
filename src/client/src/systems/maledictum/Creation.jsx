// src/client/src/systems/maledictum/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Imperium Maledictum — PUBLIC, sans auth (spec_maledictum.md §11.3).
// Guide, puis six onglets en navigation libre, chacun avec son état (✓ ou •),
// sa ligne « À faire » et une colonne d'aide ; Précédent / Suivant. Le thème
// suit la faction choisie (rôle de faction). Règles pures : config/rules/creation.js.
// Après la création, l'écran du code d'accès s'affiche avant tout accès à la fiche.
//
// Contrat (CreationPage) : onCreated, onCancel, darkMode, onToggleDarkMode.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystem } from '../../hooks/useSystem.js';
import CopyAccessButton from '../../components/ui/CopyAccessButton.jsx';

import { SKILLS } from './config/skills.js';
import { INITIAL_CREATION, creationTodo, isCreationComplete, buildCharacterPayload, creationXp } from './config/rules/creation.js';
import { themeForFaction } from './config/rules/themes.js';
import MlTopBar from './components/ui/MlTopBar.jsx';
import { MlTabs, Block } from './components/ui/MlUi.jsx';
import { useBoxSize } from './hooks/useBoxSize.js';
import { useLivery } from './hooks/useLivery.js';
import { useMlRoll } from './hooks/useMlRoll.js';
import { HelpPanel, GuideTab, CharsTab, OriginTab, FactionTab, RoleTab, EquipmentTab, IdentityTab } from './components/creation/CreationTabs.jsx';

const STEPS = [
    { id: 'guide',     label: 'Guide' },
    { id: 'chars',     label: 'Caractéristiques' },
    { id: 'origin',    label: 'Origine' },
    { id: 'faction',   label: 'Faction' },
    { id: 'role',      label: 'Rôle' },
    { id: 'equipment', label: 'Équipement' },
    { id: 'identity',  label: 'Identité' },
];
const TAB_COMPONENTS = { origin: OriginTab, faction: FactionTab, role: RoleTab, equipment: EquipmentTab, identity: IdentityTab };

/** Précédent / Suivant en bas de chaque onglet */
const StepNav = ({ tab, onGo }) => {
    const i = STEPS.findIndex(s => s.id === tab);
    const prev = STEPS[i - 1];
    const next = STEPS[i + 1];
    return (
        <div className="im-step-nav">
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
    const { launch, rolling } = useMlRoll();

    const [ws, setWs]               = useState(INITIAL_CREATION);
    const [tab, setTabState]        = useState('guide');
    const [helpTopic, setHelpTopic] = useState({ kind: 'tab', key: 'chars' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState(null);
    const [created, setCreated]     = useState(null);   // { accessCode, accessUrl }

    useLivery(themeForFaction(ws.factionKey, ws.useDuty ? ws.dutyKey : null));
    const todo = useMemo(() => creationTodo(ws), [ws]);
    const complete = isCreationComplete(ws);

    // Changer d'onglet remet l'aide sur celle de l'onglet et remonte en haut de page
    const setTab = (id) => { setTabState(id); setHelpTopic({ kind: 'tab', key: id }); window.scrollTo({ top: 0 }); };

    // 2d10 + 20 par caractéristique, dans l'ordre (18 dés), sans historique de table
    const rollChars = async (again) => {
        const r = await launch({ label: 'Caractéristiques', type: 'chargen', systemData: {}, persistHistory: false });
        if (r?.chars) setWs(prev => ({ ...prev, rolled: Object.values(r.chars), order: null, rerolled: prev.rerolled || again }));
    };

    const submit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${apiBase}/characters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildCharacterPayload(ws, SKILLS)),
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
            <div className="im flex items-center justify-center p-4 im-created">
                <Block title="Acolyte enrôlé" skulls className="im-created-card">
                    <div className="im-name">{[ws.prenom, ws.nom].filter(Boolean).join(' ')}</div>
                    <p className="im-note">rejoint la cellule. Notez ce code : c'est votre seule façon de retrouver votre fiche.</p>
                    <span className="vtt-field-label">Code d'accès</span>
                    <div className="im-code">{created.accessCode}</div>
                    <div className="flex flex-col gap-2 items-center">
                        <CopyAccessButton character={created} codeOnly />
                        <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => navigate(`/${slug}/${created.accessUrl}`)}>
                            Accéder à ma fiche
                        </button>
                    </div>
                </Block>
            </div>
        );
    }

    const tabs = STEPS.map(s => (s.id === 'guide' ? s
        : { ...s, badge: todo[s.id].length ? '•' : '✓', badgeClass: todo[s.id].length ? 'is-left' : 'is-done' }));
    const Current = TAB_COMPONENTS[tab];
    const remaining = Object.values(todo).flat();

    return (
        <div className="im" style={{ '--im-band-h': `${band.height ?? 0}px` }}>
            <MlTopBar ref={stickyRef} subtitle="Enrôlement d'un acolyte" darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />

            <main className="im-tab-page">
                <div className="im-wizard">
                    <MlTabs tabs={tabs} active={tab} onSelect={setTab} className="im-wizard-tabs" />
                    {tab !== 'guide' && (
                        todo[tab].length
                            ? <div className="im-todo"><b>À faire :</b> {todo[tab].join(' · ')}</div>
                            : <div className="im-todo is-done">✓ Étape terminée</div>
                    )}
                    <div className={`im-wizard-body${tab === 'guide' ? ' is-single' : ''}`}>
                        <div className="min-w-0">
                            {tab === 'guide' && <GuideTab onStart={() => setTab('chars')} />}
                            {tab === 'chars' && <CharsTab ws={ws} setWs={setWs} help={setHelpTopic} onRollChars={rollChars} rolling={rolling} />}
                            {Current && <Current ws={ws} setWs={setWs} help={setHelpTopic} />}

                            {tab === 'identity' && (
                                <div className="im-fields mt-6">
                                    {!complete && <div className="im-todo"><b>Avant de créer :</b> {remaining.join(' · ')}</div>}
                                    {error && <div className="im-todo is-error">{error}</div>}
                                    <div>
                                        <button type="button" className="vtt-btn vtt-btn-primary" disabled={!complete || submitting} onClick={submit}>
                                            {submitting ? 'Enrôlement…' : `Enrôler l'acolyte (${creationXp(ws)} XP à dépenser)`}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <StepNav tab={tab} onGo={setTab} />
                        </div>
                        {/* Pas de colonne d'aide sur le Guide : il explique déjà tout */}
                        {tab !== 'guide' && <HelpPanel topic={helpTopic} onBack={() => setHelpTopic({ kind: 'tab', key: tab })} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Creation;
