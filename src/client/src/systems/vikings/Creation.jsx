// src/client/src/systems/vikings/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Vikings (spec_vikings.md §4, §4.1 ; disposition :
// spec_vikings_pierre_peinte.md §9, planche refonte_vikings/planche_creation.html).
// Trois zones pleine largeur : rail des étapes (navigation libre, Q-L6-1), étape en
// cours, pierre du personnage qui se remplit en direct (sous l'étape sur tablette,
// repliable). Finalisation : la pierre au centre ; création une fois tout complet.
// Naissance : gravure, rune ᛊ, corbeau (pierre peinte). Les deux habillages ;
// le choix d'habillage est dans la poutre (la création n'a pas de menu, Q-L6-5).
// À la fin : « SAGA +N » des traits appliqué à la SAGA de départ (D-9, D-11) et
// valeurs de combat dérivées (L3-6). Règles de l'assistant : config/creation.js.
//
// Props (CreationPage) : onCreated, onCancel, darkMode, onToggleDarkMode
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { gainSaga, getTraitSagaBonus, withDerivedValues } from "./config/rules.js";
import { CREATION_STEPS, EMPTY_GEAR, STEP, getCreationInventory, getCreationKit, getInvalidTraits } from "./config/creation.js";
import { toRunes } from "./config/runes.js";
import useSystem from "@/app/hooks/useSystem.js";
import { useVkLook, useVkLookOnRoot } from "./hooks/useVkLook.js";
import VkPanel from "./components/ui/VkPanel.jsx";
import VkIcon from "./components/ui/VkIcon.jsx";
import VkSky from "./components/ui/VkSky.jsx";
import RuneTitle from "./components/ui/RuneTitle.jsx";
import CreationRail from "./components/creation/CreationRail.jsx";
import CreationStone from "./components/creation/CreationStone.jsx";
import CreationSummary from "./components/creation/CreationSummary.jsx";
import { StepNav } from "./components/creation/CreationParts.jsx";
import StepIntro from "./components/creation/StepIntro.jsx";
import StepCaracs from "./components/creation/StepCaracs.jsx";
import StepGear from "./components/creation/StepGear.jsx";
import StepSkills from "./components/creation/StepSkills.jsx";
import StepTraits from "./components/creation/StepTraits.jsx";
import StepRunes from "./components/creation/StepRunes.jsx";
import StepIdentity from "./components/creation/StepIdentity.jsx";
import { StepFinal, Birth } from "./components/creation/StepFinal.jsx";

const INITIAL_CHARACTER = {
    prenom: '', surnom: '', nom: '',   // nom du parent (« fils/fille de » selon le sexe)
    sexe: 'homme', age: 25, activite: '', playerName: '',
    force: 1, agilite: 1, perception: 1, intelligence: 1, charisme: 1, chance: 1,
    sagaActuelle: 1, sagaTotale: 1,
    armure: 0, actionsDisponibles: 1, seuilCombat: 1,
    tokensBlessure: 0, tokensFatigue: 0,
    skills: [], traits: [], runes: [], items: [],
};

const ENGRAVE_DELAY_MS = 700;   // le ruban se regrave quand on cesse d'écrire le nom
const NEUTRAL_INSCRIPTION = toRunes('ici naitra un viking');

// Inscription du ruban : « Prénom fils / fille de Parent » en runes (comme la fiche)
const inscriptionOf = (c) => (c.prenom.trim()
    ? toRunes([c.prenom, c.nom ? `${c.sexe === 'homme' ? 'fils' : 'fille'} de ${c.nom}` : ''].filter(Boolean).join(' '))
    : NEUTRAL_INSCRIPTION);

const STEP_COMPONENTS = {
    [STEP.intro]: StepIntro, [STEP.caracs]: StepCaracs, [STEP.skills]: StepSkills, [STEP.traits]: StepTraits,
    [STEP.runes]: StepRunes, [STEP.gear]: StepGear, [STEP.identity]: StepIdentity,
};

const Creation = ({ onCreated, onCancel, darkMode, onToggleDarkMode }) => {
    const { apiBase } = useSystem();
    useVkLookOnRoot();   // habillage choisi (pierre peinte / bois et or) posé sur <html>
    const [look, setLook] = useVkLook();
    const [character, setCharacter] = useState(INITIAL_CHARACTER);
    const [gear, setGear] = useState(EMPTY_GEAR);   // choix du kit (§9.5)
    const [step, setStep] = useState(STEP.intro);
    const [visited, setVisited] = useState(() => new Set([STEP.intro]));
    const [folded, setFolded] = useState(false);
    const [customCode, setCustomCode] = useState('');
    const [created, setCreated] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const set = (field, value) => setCharacter(prev => ({ ...prev, [field]: value }));
    const invalid = getInvalidTraits(character).map(t => t.name);
    // Le personnage avec son kit : l'armure des objets équipés compte au départ
    const kit = getCreationKit(character, gear);
    const equipped = { ...character, items: kit.items };

    // Le nom se grave quand on cesse de l'écrire (le ruban se retrace à chaque inscription)
    const target = inscriptionOf(character);
    const [inscription, setInscription] = useState(target);
    useEffect(() => {
        const t = setTimeout(() => setInscription(target), ENGRAVE_DELAY_MS);
        return () => clearTimeout(t);
    }, [target]);

    const go = (n) => {
        const next = Math.max(STEP.intro, Math.min(STEP.final, n));
        setStep(next);
        setVisited(prev => new Set(prev).add(next));
        window.scrollTo(0, 0);
    };

    const handleCreate = async () => {
        // Personnage final : « SAGA +N » des traits appliqué à la SAGA de départ (D-9, D-11),
        // inventaire du kit, des achats et de la bourse (§9.5), valeurs de combat dérivées (L3-6)
        const finalChar = withDerivedValues({
            ...character,
            items: getCreationInventory(character, gear),
            ...gainSaga(character, getTraitSagaBonus(character.traits.map(t => t.name))),
        });
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${apiBase}/characters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customCode ? { ...finalChar, accessCode: customCode } : finalChar),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Erreur lors de la création');
            }
            setCreated(await res.json());
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const pierre = look.skin === 'pierre';
    const Step = STEP_COMPONENTS[step];
    const wide = step === STEP.intro || step === STEP.final;   // sans la pierre en colonne
    const layout = created ? 'is-born' : wide ? 'is-final' : '';

    return (
        <div className="vk-root vk-cr-page min-h-screen">
            <VkSky />

            <header className="vk-header vk-cr-header px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                    <RuneTitle className="text-3xl vk-cr-runetitle" />
                    <h1 className="vk-title vk-cr-title">Naissance d'un Viking</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button type="button" className="vk-btn vk-btn-sm" onClick={() => setLook(prev => ({ ...prev, skin: pierre ? 'bois' : 'pierre' }))}>
                        <VkIcon name={pierre ? 'shield' : 'longhouse'} />{pierre ? 'Passer au bois et or' : 'Passer à la pierre peinte'}
                    </button>
                    <button type="button" onClick={onToggleDarkMode} className="vk-btn vk-btn-icon" title={darkMode ? 'Mode jour' : 'Mode nuit'}>
                        <VkIcon name={darkMode ? 'sun' : 'moon'} />
                    </button>
                </div>
            </header>

            <div className={`vk-cr ${layout}`}>
                {!created && <CreationRail character={character} gear={gear} step={step} visited={visited} onGo={go} />}

                <main className="vk-cr-main">
                    <VkPanel className="vk-cr-step-slab">
                        <h3 className="vk-band-title">{created ? 'Naissance' : CREATION_STEPS[step]}</h3>
                        {created ? (
                            <Birth character={character} created={created} inscription={inscription} onCreated={onCreated} />
                        ) : step === STEP.final ? (
                            <StepFinal character={equipped} gear={gear} silver={kit.silver.left} inscription={inscription} invalid={invalid} onGo={go}
                                       customCode={customCode} onCustomCode={setCustomCode}
                                       onCreate={handleCreate} loading={loading} error={error} />
                        ) : (
                            <>
                                <Step character={character} set={set} gear={gear} setGear={setGear} />
                                <StepNav step={step} onGo={go} onCancel={onCancel} />
                            </>
                        )}
                    </VkPanel>
                </main>

                {!created && !wide && (
                    <aside className={`vk-cr-aside ${folded ? 'is-folded' : ''}`}>
                        <div className="vk-cr-aside-head">
                            <button type="button" className="vk-btn vk-btn-sm vk-cr-fold" onClick={() => setFolded(f => !f)}>{folded ? 'Déplier' : 'Replier'}</button>
                        </div>
                        <CreationStone character={character} inscription={inscription} invalid={invalid} />
                        <CreationSummary character={equipped} silver={kit.silver.left} />
                    </aside>
                )}
            </div>
        </div>
    );
};

export default Creation;
