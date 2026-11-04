// src/client/src/systems/dune/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Dune — PUBLIC, sans authentification (spec_dune.md §6.5).
// Bande du slug (onglets = étapes, navigation libre), onglet Guide d'abord, colonne
// d'aide contextuelle (textes : config/descriptions.js), ligne « À faire »,
// Précédent / Suivant, pleine largeur. Règles pures : config/rules/creation.js
// (inchangées : rangs libres, 5 points libres, textes au rang 6, principes ≤ 8).
// Après la création, l'écran du code d'accès s'affiche avant l'accès à la fiche.
//
// Contrat (CreationPage) : onCreated, onCancel, darkMode, onToggleDarkMode.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useSystem } from '../../hooks/useSystem.js';
import DuneBand from './components/ui/DuneBand.jsx';
import DuneIcon from './components/ui/DuneIcon.jsx';
import {
    GuideStep, IdentityStep, TraitsStep, PointsStep, ExtrasStep, RecapStep, CreatedScreen,
} from './components/creation/CreationSteps.jsx';
import { STEP_HELP } from './config/descriptions.js';
import { initialCreation, creationTodo, canCreate, creationPayload } from './config/rules/creation.js';

const STEPS = [
    { id: 'guide',       label: 'Guide' },
    { id: 'identite',    label: 'Identité' },
    { id: 'competences', label: 'Compétences' },
    { id: 'principes',   label: 'Principes' },
    { id: 'points',      label: 'Points libres' },
    { id: 'extras',      label: 'Talents et atouts' },
    { id: 'recap',       label: 'Récapitulatif' },
];

// Colonne d'aide : l'élément survolé, sinon l'aide de l'étape
const HelpColumn = ({ help }) => (
    <aside className="dn-help">
        <h3 className="dn-title">{help.title}</h3>
        <p>{help.text}</p>
        {help.use && <p className="dn-help-use"><b>Quand l’utiliser</b>{help.use}</p>}
        {help.rank && <p className="dn-help-rank">{help.rank}</p>}
        {help.examples && (
            <ul className="dn-help-examples">{help.examples.map(m => <li key={m}>{m}</li>)}</ul>
        )}
    </aside>
);

const Creation = ({ onCreated, onCancel, darkMode, onToggleDarkMode }) => {
    const { apiBase } = useSystem();
    const [state, setState] = useState(initialCreation);
    const [step, setStep] = useState('guide');
    const [hoverHelp, setHoverHelp] = useState(null);
    const [bandHeight, setBandHeight] = useState(0);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [created, setCreated] = useState(null);

    const index = STEPS.findIndex(s => s.id === step);
    const todo = creationTodo(state);
    const go = (id) => { setStep(id); setHoverHelp(null); window.scrollTo({ top: 0 }); };

    const handleCreate = async () => {
        if (creating || !canCreate(state)) return;
        setCreating(true);
        setError(null);
        try {
            const r = await fetch(`${apiBase}/characters`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creationPayload(state)),
            });
            if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Erreur lors de la création');
            setCreated(await r.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const right = (
        <>
            <button type="button" className="dn-iconbtn" onClick={onToggleDarkMode}
                    title={darkMode ? 'Thème jour' : 'Thème nuit'} aria-label="Changer de thème">
                <DuneIcon name="moon" />
            </button>
            {!created && (
                <button type="button" className="dn-iconbtn" onClick={onCancel} title="Annuler la création" aria-label="Annuler la création">
                    <DuneIcon name="close" />
                </button>
            )}
        </>
    );

    const stepProps = { state, setState, setHelp: setHoverHelp };

    return (
        <div className="dn-root" style={{ '--dn-band-h': `${bandHeight}px` }}>
            <DuneBand eyebrow="Création" caption="Nouveau personnage"
                      tabs={created ? [] : STEPS} activeTab={step} onTabChange={go}
                      right={right} onHeightChange={setBandHeight} />

            {created ? (
                <CreatedScreen created={created} onEnter={onCreated} />
            ) : (
                <div className="dn-create">
                    <main className="min-w-0 flex flex-col gap-6" onMouseLeave={() => setHoverHelp(null)}>
                        {step === 'guide'       && <GuideStep />}
                        {step === 'identite'    && <IdentityStep {...stepProps} />}
                        {step === 'competences' && <TraitsStep group="competences" {...stepProps} />}
                        {step === 'principes'   && <TraitsStep group="principes" {...stepProps} />}
                        {step === 'points'      && <PointsStep {...stepProps} />}
                        {step === 'extras'      && <ExtrasStep {...stepProps} />}
                        {step === 'recap'       && <RecapStep state={state} error={error} />}

                        <div className="dn-create-nav">
                            <div className="dn-todo">
                                {todo.length === 0
                                    ? <span className="is-done">Tout est prêt</span>
                                    : <>À faire : {todo.map(t => <span key={t.text} className={t.required ? 'is-required' : ''}>{t.text}</span>)}</>}
                            </div>
                            {index > 0 && <button type="button" className="vtt-btn" onClick={() => go(STEPS[index - 1].id)}>Précédent</button>}
                            {step === 'recap' ? (
                                <button type="button" className="vtt-btn vtt-btn-primary" onClick={handleCreate} disabled={creating || !canCreate(state)}>
                                    {creating ? 'Création…' : 'Créer le personnage'}
                                </button>
                            ) : (
                                <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => go(STEPS[index + 1].id)}>Suivant</button>
                            )}
                        </div>
                    </main>
                    <HelpColumn help={hoverHelp ?? STEP_HELP[step]} />
                </div>
            )}
        </div>
    );
};

export default Creation;
