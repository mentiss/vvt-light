// src/client/src/systems/cyberpunk/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Cyberpunk — public, sans authentification.
// Spec : spec_cyberpunk.md §9 ; planche : documentations/cyberpunk/planche_creation.html.
//
// Trois zones, pleine largeur : rail des étapes · étape en cours · dossier de
// l'opérateur (en direct). Retour libre aux étapes faites ; une étape s'ouvre
// quand les précédentes sont complètes (config/rules/creationRules.js).
// Étapes : Archétype · Identité · Stats · Manœuvres · Directives · Relations ·
// Chrome · Matos · Finalisation. Règles et corps de création : config/rules/creationRules.js.
//
// POST /api/cyberpunk/characters → code d'accès affiché à la fin.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useRef } from 'react';
import { useSystem } from '@/app/hooks/useSystem.js';
import ThemeToggle from '@/app/components/ThemeToggle.jsx';
import CpWorld from './components/ui/CpWorld.jsx';
import CpIcon from './components/ui/CpIcon.jsx';
import BoltFarm from './components/ui/BoltFarm.jsx';

import {
    STAT_PROFILES, STATS, DIRECTIVES_PERSONNELLES,
    CREATION_STEPS, CREATION_MOVE_PICKS, CREATION_RELATIONS, stepRemaining, stepReachable, findPlaybook,
    chromeEntries, kitEntries, remainingCred, buildCreationPayload, BLOCKING_STEPS, incompleteSteps,
} from './config.jsx';

import CreationRail    from './components/creation/CreationRail.jsx';
import CreationDossier from './components/creation/CreationDossier.jsx';
import StepArchetype   from './components/creation/StepArchetype.jsx';
import StepIdentity    from './components/creation/StepIdentity.jsx';
import StepStats       from './components/creation/StepStats.jsx';
import StepMoves       from './components/creation/StepMoves.jsx';
import StepDirectives  from './components/creation/StepDirectives.jsx';
import StepRelations   from './components/creation/StepRelations.jsx';
import StepChrome      from './components/creation/StepChrome.jsx';
import StepGear        from './components/creation/StepGear.jsx';
import StepFinal, { CreatedScreen } from './components/creation/StepFinal.jsx';

// ── État initial ─────────────────────────────────────────────────────────────

const EMPTY_STATS = Object.fromEntries(STATS.map(s => [s, null]));
const newRelation = () => ({ name: '', description: '', link_score: 1 });

const INITIAL_DRAFT = {
    playbook:   '',
    identity:   { playerName: '', prenom: '', nom: '', sexe: '', apparence: '' },
    statProfile: '',
    stats:      EMPTY_STATS,
    statPool:   [],                                   // [{ id, value }] valeurs à placer
    moveIds:    [],
    moveObjs:   [],                                   // manœuvres choisies (nom, stat), pour le dossier
    moveTags:   {},                                   // { [moveId]: choix } tags des manœuvres (§9.8)
    directives: DIRECTIVES_PERSONNELLES.map(d => ({ id: d.id, selected: false, blankValue: '' })),
    relations:  Array.from({ length: CREATION_RELATIONS.min }, newRelation),
    chrome:       { console: null, archetype: [], free: [], cosmetic: null },
    chromeConfig: {},                                 // { [nom]: { defects, choices } }
    gear:         { kit: {}, kitOption: {}, buys: [], config: {}, moveGear: {} },
    darkSecret: '',
};

/** Chrome imposé de l'archétype (Nomad), posé quand l'archétype est choisi. */
const mandatoryChrome = (playbook) => {
    const pb = findPlaybook(playbook);
    return pb?.mandatoryCyberware ? [pb.mandatoryCyberware] : [];
};

// ── Résumés du rail ──────────────────────────────────────────────────────────

const summariesOf = (draft) => {
    const sel = draft.directives.filter(d => d.selected);
    const name = [draft.identity.prenom, draft.identity.nom].filter(s => s.trim()).join(' ');
    return {
        1: findPlaybook(draft.playbook)?.label ?? '',
        2: name,
        3: draft.statProfile ? STAT_PROFILES.find(p => p.id === draft.statProfile)?.label.split(' — ')[0] : '',
        4: draft.moveObjs.map(m => m.name).join(' · '),
        5: sel.map(d => DIRECTIVES_PERSONNELLES.find(x => x.id === d.id)?.label).join(' · '),
        6: draft.relations.filter(r => r.name.trim()).length ? `${draft.relations.filter(r => r.name.trim()).length} liens` : '',
        7: chromeEntries(draft).length ? `${chromeEntries(draft).length} implant${chromeEntries(draft).length > 1 ? 's' : ''}` : '',
        8: `${kitEntries(draft).length + draft.gear.buys.length} objets · ${remainingCred(draft.gear.buys)} Cred`,
        9: 'accès et code',
    };
};

// ─────────────────────────────────────────────────────────────────────────────

const Creation = ({ darkMode, onToggleDarkMode, onCreated, onCancel }) => {
    const { apiBase } = useSystem();

    const [step,     setStep]     = useState(1);
    const [visited,  setVisited]  = useState(1);       // étape la plus loin atteinte (rail : étapes faites)
    const [draft,    setDraft]    = useState(INITIAL_DRAFT);
    const [pendingPlaybook, setPendingPlaybook] = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [created,  setCreated]  = useState(null);

    const patch = useCallback((changes) => setDraft(d => ({ ...d, ...changes })), []);
    const go = useCallback((s) => {
        if (!(stepReachable(s, draft) || s < step)) return;
        setStep(s);
        setVisited(v => Math.max(v, s));
        window.scrollTo?.(0, 0);
    }, [draft, step]);

    // ── Archétype : changer après coup réinitialise manœuvres, chrome et matos ──
    const applyPlaybook = (pb) => {
        setDraft(d => ({
            ...d, playbook: pb, moveIds: [], moveObjs: [], moveTags: {},
            chrome: { ...INITIAL_DRAFT.chrome, archetype: mandatoryChrome(pb) }, chromeConfig: {}, gear: INITIAL_DRAFT.gear,
        }));
        setPendingPlaybook(null);
    };
    const selectPlaybook = (pb) => {
        if (pb === draft.playbook) return;
        const hasDependents = draft.moveIds.length > 0
            || chromeEntries(draft).some(e => !mandatoryChrome(draft.playbook).includes(e.name))
            || Object.values(draft.gear.kit).some(Boolean) || draft.gear.buys.length > 0;
        if (draft.playbook && hasDependents) setPendingPlaybook(pb);
        else applyPlaybook(pb);
    };

    // ── Stats ──
    const chooseProfile = (id) => {
        const p = STAT_PROFILES.find(x => x.id === id);
        if (!p) return;
        patch({ statProfile: id, stats: EMPTY_STATS, statPool: p.values.map((value, i) => ({ id: `v-${id}-${i}`, value })) });
    };
    const placeStat = (stat, chipId) => setDraft(d => {
        const chip = d.statPool.find(c => c.id === chipId);
        if (!chip || d.stats[stat] !== null) return d;
        return { ...d, stats: { ...d.stats, [stat]: chip.value }, statPool: d.statPool.filter(c => c.id !== chipId) };
    });
    const returnStat = (stat) => setDraft(d => {
        const v = d.stats[stat];
        if (v === null) return d;
        return { ...d, stats: { ...d.stats, [stat]: null }, statPool: [...d.statPool, { id: `v-back-${stat}-${Date.now()}`, value: v }] };
    });
    const resetStats = () => chooseProfile(draft.statProfile);   // profil inchangé : pas de course possible

    // Mises à jour fonctionnelles : deux clics rapprochés ne s'écrasent pas
    // ── Manœuvres (ids et fiches choisies, ensemble) ──
    const toggleMove = (move) => setDraft(d => {
        const on = d.moveIds.includes(move.id);
        if (!on && d.moveIds.length >= CREATION_MOVE_PICKS) return d;
        return on
            ? { ...d, moveIds: d.moveIds.filter(id => id !== move.id), moveObjs: d.moveObjs.filter(m => m.id !== move.id),
                moveTags: Object.fromEntries(Object.entries(d.moveTags).filter(([id]) => Number(id) !== move.id)) }
            : { ...d, moveIds: [...d.moveIds, move.id], moveObjs: [...d.moveObjs, move] };
    });

    const setMoveTag = (id, value) => setDraft(d => ({ ...d, moveTags: { ...d.moveTags, [id]: value } }));

    // ── Directives ──
    const mapDirective = (id, fn) => setDraft(d => ({ ...d, directives: d.directives.map(x => (x.id === id ? fn(x) : x)) }));
    const toggleDirective   = (id) => mapDirective(id, x => ({ ...x, selected: !x.selected }));
    const setDirectiveBlank = (id, value) => mapDirective(id, x => ({ ...x, blankValue: value }));

    // ── Relations ──
    const addRelation    = () => setDraft(d => ({ ...d, relations: [...d.relations, newRelation()] }));
    const removeRelation = (i) => setDraft(d => ({ ...d, relations: d.relations.filter((_, j) => j !== i) }));
    const updateRelation = (i, changes) => setDraft(d => ({ ...d, relations: d.relations.map((r, j) => (j === i ? { ...r, ...changes } : r)) }));

    // ── Chrome ──
    const patchChrome = (changes) => setDraft(d => ({ ...d, chrome: { ...d.chrome, ...changes } }));
    const patchChromeConfig = (name, changes) => setDraft(d => ({
        ...d, chromeConfig: { ...d.chromeConfig, [name]: { ...d.chromeConfig[name], ...changes } },
    }));

    // ── Matos ── (fn reçoit le matos courant et renvoie les champs à changer)
    const buyId = useRef(0);
    const patchGear = (fn) => setDraft(d => ({ ...d, gear: { ...d.gear, ...fn(d.gear) } }));
    const patchGearConfig = (key, changes) => patchGear(g => ({ config: { ...g.config, [key]: { ...g.config[key], ...changes } } }));
    const buy = (name) => { buyId.current += 1; const uid = `b${buyId.current}`; patchGear(g => ({ buys: [...g.buys, { uid, name }] })); };
    const unbuy = (uid) => patchGear(g => {
        const config = { ...g.config };
        delete config[`buy:${uid}`];
        return { buys: g.buys.filter(b => b.uid !== uid), config };
    });
    const patchMoveGear = (move, changes) => patchGear(g => ({ moveGear: { ...g.moveGear, [move]: { ...g.moveGear[move], ...changes } } }));

    // ── Création ──
    const submit = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const body = buildCreationPayload(draft);
            const res = await fetch(`${apiBase}/characters`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Erreur lors de la création');
            }
            setCreated(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Navigation ──
    const remaining = stepRemaining(step, draft);
    const isLast = step === CREATION_STEPS.length;
    const blocking = BLOCKING_STEPS.includes(step);
    const missing = incompleteSteps(draft);
    const next = () => (isLast ? submit() : go(step + 1));
    const nextDisabled = loading || (isLast ? missing.length > 0 : blocking && remaining > 0);
    const hint = isLast
        ? (missing.length ? `${missing.length} étape${missing.length > 1 ? 's' : ''} à finir avant la création` : 'Prêt à créer l\'opérateur')
        : !remaining ? 'Étape complète'
            : blocking ? `${remaining} choix restant${remaining > 1 ? 's' : ''} avant de continuer`
                : `${remaining} choix restant${remaining > 1 ? 's' : ''} : à finir avant la création`;

    const stepView = {
        1: <StepArchetype playbook={draft.playbook} onSelect={selectPlaybook} pending={pendingPlaybook}
                          onConfirm={() => applyPlaybook(pendingPlaybook)} onCancel={() => setPendingPlaybook(null)} />,
        2: <StepIdentity identity={draft.identity} onChange={(k, v) => setDraft(d => ({ ...d, identity: { ...d.identity, [k]: v } }))} />,
        3: <StepStats playbook={draft.playbook} profile={draft.statProfile} stats={draft.stats} pool={draft.statPool}
                      onProfile={chooseProfile} onPlace={placeStat} onReturn={returnStat} onReset={resetStats} />,
        4: <StepMoves playbook={draft.playbook} moveIds={draft.moveIds} moveObjs={draft.moveObjs} moveTags={draft.moveTags}
                      onToggle={toggleMove} onMoveTag={setMoveTag} />,
        5: <StepDirectives directives={draft.directives} onToggle={toggleDirective} onBlank={setDirectiveBlank} />,
        6: <StepRelations relations={draft.relations} onAdd={addRelation} onUpdate={updateRelation} onRemove={removeRelation} />,
        7: <StepChrome draft={draft} onChrome={patchChrome} onConfig={patchChromeConfig} />,
        8: <StepGear draft={draft} onGear={patchGear} onConfig={patchGearConfig} onBuy={buy} onUnbuy={unbuy} onMoveGear={patchMoveGear} />,
        9: <StepFinal darkSecret={draft.darkSecret} onDarkSecret={v => patch({ darkSecret: v })} error={error} missing={missing} onGo={go} />,
    };

    return (
        <div className="cp-root cp-cr">
            {/* Ville et météo derrière l'interface (spec_cyberpunk.md §3.1) */}
            <CpWorld />

            <header className="cp-bar cp-cr-header sticky top-0 z-30">
                <div className="flex flex-col items-center ml-3">
                    <div className="relative cp-brand-glitch cp-brand-pulse">
                        <BoltFarm />
                        <div className="cp-cr-brand-title text-[34px] cp-font-title text-accent tracking-widest cp-brand-stroke relative z-10">CyberPunk</div>
                    </div>
                    <p className="text-xs cp-font-ui uppercase tracking-widest text-muted">The Sprawl — édition Ré²</p>
                </div>
                <div className="cp-cr-header-title">Création · <b>nouvel opérateur</b></div>
                <div className="cp-cr-header-actions">
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                    {onCancel && !created && (
                        <button type="button" className="cp-btn" onClick={onCancel}><CpIcon name="logout" size="sm" />Quitter</button>
                    )}
                </div>
            </header>

            <div className="cp-cr-shell">
                <CreationRail step={step} visited={visited} draft={draft} summaries={summariesOf(draft)} onGo={go} />

                <main className="cp-cr-stage">
                    {created
                        ? <CreatedScreen created={created} onOpen={onCreated} />
                        : (
                            <>
                                {stepView[step]}
                                <div className="cp-cr-nav">
                                    <button type="button" className="cp-btn" onClick={() => go(step - 1)} disabled={step === 1}>‹ Précédent</button>
                                    <span className={`cp-cr-nav-hint ${(isLast ? missing.length : remaining) ? (blocking ? '' : 'is-warn') : 'is-ok'}`}>{hint}</span>
                                    <button type="button" className="cp-btn is-primary" onClick={next} disabled={nextDisabled}>
                                        {isLast ? (loading ? 'Création…' : 'Créer l\'opérateur') : 'Suivant ›'}
                                    </button>
                                </div>
                            </>
                        )}
                </main>

                <CreationDossier draft={draft} />
            </div>
        </div>
    );
};

export default Creation;
