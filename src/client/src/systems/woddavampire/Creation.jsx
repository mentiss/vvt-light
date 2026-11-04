// src/client/src/systems/woddavampire/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Vampire : l'Âge des Ténèbres — PUBLIC, sans auth.
// Spec : spec_woddavampire.md §5 et §II.6.
//
// Un onglet Guide puis sept onglets en navigation libre (§5.1), chacun avec son
// compteur, une colonne d'aide (CreationHelp) et un sélecteur « Répartir mes
// points / Dépenser des points bonus » avec le compteur des points bonus ; l'app
// bloque ce qui sort des règles (règles pures : creationRules.js). Identité
// placée entre Finitions et Sang (demande du MJ). Après la création, l'écran du
// code d'accès s'affiche avant tout accès à la fiche.
//
// Contrat (CreationPage) : onCreated, onCancel, darkMode, onToggleDarkMode.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystem } from '../../hooks/useSystem.js';
import ThemeToggle   from '../../components/ui/ThemeToggle.jsx';
import CopyAccessButton from '../../components/ui/CopyAccessButton.jsx';

import { ROLL_TYPES, BONUS_COSTS } from './config.jsx';
import { useVdaRoll } from './hooks/useVdaRoll.js';
import { validateCreation, sanitizeCreation, bonusRemaining, bonusBreakdown, attributeRemaining, abilityRemaining, buildCharacterPayload } from './config/rules/creationRules.js';
import { VdaCorners, VdaTabsNav, VdaToggle } from './components/ui/VdaUi.jsx';
import { HelpProvider, HelpPanel, helpProps } from './components/creation/CreationHelp.jsx';
import GuideTab      from './components/creation/GuideTab.jsx';
import LineageTab    from './components/creation/LineageTab.jsx';
import AttributesTab from './components/creation/AttributesTab.jsx';
import AbilitiesTab  from './components/creation/AbilitiesTab.jsx';
import AdvantagesTab from './components/creation/AdvantagesTab.jsx';
import FinishingTab  from './components/creation/FinishingTab.jsx';
import IdentityTab   from './components/creation/IdentityTab.jsx';
import BloodTab      from './components/creation/BloodTab.jsx';

const INITIAL = {
    clanKey: null, casteKey: null, originClanKey: null, roadKey: 'road_of_humanity', roadPathKey: null,
    attrPriority: { physical: null, social: null, mental: null }, attributes: {},
    abilityPriority: { talent: null, skill: null, knowledge: null }, abilities: {}, domains: {},
    disciplines: {}, backgrounds: {}, virtues: { moral: 0, control: 0, courage: 0 },
    bonus: { attributes: {}, abilities: {}, disciplines: {}, backgrounds: {}, virtues: {}, road: 0, willpower: 0, secondaryPaths: {}, extraRituals: [] },
    paths: {}, kraina: {}, rituals: {},
    meritsFlaws: [],
    nom: '', playerName: '', avatar: null, chronicle: '', concept: '', sire: '', natureKey: null, demeanorKey: null, weaknessDetail: '',
    historyLife: '', historySire: '', historyNights: '', languages: '', description: '',
    bloodRoll: null,
};

/** Écrit value sous path (« bonus.attributes ») puis key, sans muter l'état */
const assignIn = (state, path, key, value) => {
    const parts = path.split('.');
    const next = { ...state };
    let cursor = next;
    for (const p of parts) {
        cursor[p] = { ...(cursor[p] ?? {}) };
        cursor = cursor[p];
    }
    cursor[key] = value;
    return next;
};

const sumValues = (obj) => Object.values(obj ?? {}).reduce((s, v) => s + (v || 0), 0);

// Ce que fait un clic sur un point, interrupteur coupé (off) ou mis (on), par onglet
// (absent : pas d'interrupteur dans cet onglet)
const BONUS_HINT = {
    attributes: {
        off: 'Coupé : vos clics répartissent les points des priorités (7, 5 et 3) choisies au-dessus de chaque colonne.',
        on:  `Activé : chaque point ajouté coûte ${BONUS_COSTS.attribute} points bonus, en plus des priorités.`,
    },
    abilities: {
        off: 'Coupé : vos clics répartissent les points des priorités (13, 9 et 5), 3 au plus par Capacité.',
        on:  `Activé : chaque point ajouté coûte ${BONUS_COSTS.ability} points bonus et peut dépasser 3.`,
    },
    advantages: {
        off: 'Coupé : vos clics utilisent les 4 points de Disciplines, 5 d’Historiques et 7 de Vertus.',
        on:  `Activé : chaque point ajouté coûte des points bonus (Discipline ${BONUS_COSTS.discipline}, Historique ${BONUS_COSTS.background}, Vertu ${BONUS_COSTS.virtue}) ; toutes les Disciplines deviennent accessibles.`,
    },
};

/**
 * En-tête des points bonus : interrupteur à gauche (position fixe, le texte
 * variable vient après lui), compteur toujours visible à droite. Couper
 * l'interrupteur remet l'aide de l'onglet.
 */
const BonusBar = ({ tab, ws, bonusMode, setBonusMode, onHelp, onGo }) => (
    <div className="vda-budget is-top vda-bonus-bar">
        {BONUS_HINT[tab] && (
            <span className="vda-bonus-switch">
                <span className="shrink-0">
                    <VdaToggle on={bonusMode} onChange={(v) => { setBonusMode(v); onHelp(v ? { kind: 'bonus' } : { kind: 'tab', key: tab }); }}>
                        Dépenser des points bonus
                    </VdaToggle>
                </span>
                <span className="vda-note">{bonusMode ? BONUS_HINT[tab].on : BONUS_HINT[tab].off}</span>
            </span>
        )}
        <span className="vda-bonus-count" {...helpProps(onHelp, { kind: 'bonus' })}>
            <span>Points bonus restants : <b>{bonusRemaining(ws)}</b></span>
            {/* Où sont partis les points : un clic mène à l'onglet concerné */}
            <span className="vda-bonus-detail">
                {bonusBreakdown(ws).map(l => (
                    <button key={l.label} type="button" className="vda-link" onClick={() => onGo(l.tab)}>
                        {l.label} {l.points > 0 ? l.points : `+${-l.points}`}
                    </button>
                ))}
            </span>
        </span>
    </div>
);

/** Ce qui reste à faire dans l'onglet (erreurs bloquantes, puis avertissements) */
const TodoLine = ({ tabReport }) => {
    if (!tabReport) return null;
    const { errors, warnings } = tabReport;
    if (!errors.length && !warnings.length) return <div className="vda-todo is-done">✓ Étape terminée</div>;
    return (
        <div className={`vda-todo${errors.length ? '' : ' is-warning'}`}>
            <b>{errors.length ? 'À faire :' : 'À noter :'}</b> {[...errors, ...warnings].join(' · ')}
        </div>
    );
};

/** Précédent / Suivant en bas de chaque onglet */
const StepNav = ({ order, tab, labels, onGo }) => {
    const i = order.indexOf(tab);
    const prev = order[i - 1];
    const next = order[i + 1];
    return (
        <div className="vda-step-nav">
            {prev ? <button type="button" className="vtt-btn" onClick={() => onGo(prev)}>← {labels[prev]}</button> : <span />}
            {next && <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => onGo(next)}>{labels[next]} →</button>}
        </div>
    );
};

const Creation = ({ darkMode, onToggleDarkMode }) => {
    const { apiBase, slug } = useSystem();
    const { launch: rollDice, rolling, error: rollError } = useVdaRoll();
    const navigate          = useNavigate();

    const [ws, setWs]               = useState(INITIAL);
    const [tab, setTabState]        = useState('guide');
    const [helpTopic, setHelpTopic] = useState({ kind: 'tab', key: 'guide' });
    const [bonusMode, setBonusMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState(null);
    const [created, setCreated]     = useState(null);   // { accessCode, accessUrl }

    // Chaque modification rend les points des traits devenus interdits (sanitizeCreation)
    const patch = useCallback((p) => setWs(prev => sanitizeCreation({ ...prev, ...p })), []);
    const setIn = useCallback((path, key, value) => setWs(prev => sanitizeCreation(assignIn(prev, path, key, value))), []);

    const report = useMemo(() => validateCreation(ws), [ws]);

    // Changer d'onglet remet l'aide sur celle de l'onglet et remonte en haut de page
    const setTab = (id) => { setTabState(id); setHelpTopic({ kind: 'tab', key: id }); window.scrollTo({ top: 0 }); };

    // ── Jet de la réserve de départ (1d10, moteur de dés) ───────────────────
    const rollBlood = async () => {
        const result = await rollDice({
            characterName: ws.nom || 'Personnage', label: 'Réserve de sang de départ', rollType: ROLL_TYPES.startingBlood,
            persistHistory: false, systemData: { type: 'starting_blood' },
        });
        if (result) patch({ bloodRoll: result.value });
    };

    // ── Création ─────────────────────────────────────────────────────────────
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

    // ── Onglets et compteurs ─────────────────────────────────────────────────
    const badge = (left, errors) => (left === 0 && !errors ? { badge: '✓', badgeClass: 'is-done' } : { badge: left || '!', badgeClass: 'is-left' });
    const attrLeft = sumValues(attributeRemaining(ws));
    const abilLeft = sumValues(abilityRemaining(ws));
    const advLeft  = (4 - sumValues(ws.disciplines)) + (5 - sumValues(ws.backgrounds)) + (7 - sumValues(ws.virtues));
    const tabs = [
        { id: 'guide',      label: 'Guide' },
        { id: 'lineage',    label: 'Lignée et Route', ...badge(0, report.lineage.errors.length) },
        { id: 'attributes', label: 'Attributs',       ...badge(attrLeft, report.attributes.errors.length) },
        { id: 'abilities',  label: 'Capacités',       ...badge(abilLeft, report.abilities.errors.length) },
        { id: 'advantages', label: 'Avantages',       ...badge(advLeft, report.advantages.errors.length) },
        { id: 'finishing',  label: 'Finitions', badge: bonusRemaining(ws), badgeClass: report.finishing.errors.length ? 'is-left' : '' },
        { id: 'identity',   label: 'Identité',        ...badge(0, report.identity.errors.length) },
        { id: 'blood',      label: 'Sang et résumé',  ...badge(0, report.blood.errors.length) },
    ];

    // ══════════════════════════════════════════════════════════════════════════
    // Écran post-création : le code d'accès d'abord, sinon impossible de revenir
    // ══════════════════════════════════════════════════════════════════════════
    if (created) {
        return (
            <div className="vda-root flex items-center justify-center p-4">
                <div className="vda-sheet text-center max-w-md w-full">
                    <VdaCorners />
                    <div className="vda-font-title text-2xl text-primary mb-1">{ws.nom} entre dans la nuit</div>
                    <p className="vda-note mb-4">Notez ce code : c'est votre seule façon de retrouver votre fiche.</p>
                    <div className="vda-label">Code d'accès</div>
                    <div className="vda-font-title text-4xl tracking-widest text-accent mb-3">{created.accessCode}</div>
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

    const tabProps = { ws, patch, setIn, bonusMode };

    return (
        <div className="vda-root">
            <header className="vda-header">
                <div>
                    <div className="vda-header-title">Création d'un Caïnite</div>
                    <div className="vda-header-sub">Vampire : l'Âge des Ténèbres — étapes dans l'ordre de votre choix</div>
                </div>
                <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
            </header>

            <main className="vda-page">
                {(error || rollError) && <div className="vda-error-list mb-3">{error || rollError}</div>}
                <div className="vda-sheet is-wizard">
                    <VdaCorners />
                    <VdaTabsNav tabs={tabs} active={tab} onSelect={setTab} />
                    <BonusBar tab={tab} ws={ws} bonusMode={bonusMode} setBonusMode={setBonusMode} onHelp={setHelpTopic} onGo={setTab} />
                    <TodoLine tabReport={report[tab]} />
                    <HelpProvider value={setHelpTopic}>
                        <div className={`vda-wizard-body mt-3${tab === 'guide' ? ' is-single' : ''}`}>
                            <div className="min-w-0">
                                {tab === 'guide'      && <GuideTab onGo={setTab} />}
                                {tab === 'lineage'    && <LineageTab {...tabProps} />}
                                {tab === 'attributes' && <AttributesTab {...tabProps} />}
                                {tab === 'abilities'  && <AbilitiesTab {...tabProps} />}
                                {tab === 'advantages' && <AdvantagesTab {...tabProps} />}
                                {tab === 'finishing'  && <FinishingTab {...tabProps} />}
                                {tab === 'identity'   && <IdentityTab {...tabProps} />}
                                {tab === 'blood'      && (
                                    <BloodTab ws={ws} report={report} rolling={rolling} onRollBlood={rollBlood}
                                              onSubmit={submit} submitting={submitting} />
                                )}
                                <StepNav order={tabs.map(t => t.id)} tab={tab} labels={Object.fromEntries(tabs.map(t => [t.id, t.label]))} onGo={setTab} />
                            </div>
                            {/* Pas de colonne d'aide sur le Guide : il explique déjà tout */}
                            {tab !== 'guide' && <HelpPanel topic={helpTopic} ws={ws} onBack={() => setHelpTopic({ kind: 'tab', key: tab })} />}
                        </div>
                    </HelpProvider>
                </div>
            </main>
        </div>
    );
};

export default Creation;
