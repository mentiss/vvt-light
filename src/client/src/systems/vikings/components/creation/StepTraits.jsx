// src/client/src/systems/vikings/components/creation/StepTraits.jsx
// Étape 3 : traits et backgrounds (spec_vikings.md §3.5, §4, §4.1). 2 à 4, conditions et
// incompatibilités ; un trait hors de portée dit pourquoi ; un trait choisi devenu hors de
// portée (carac ou compétence baissée ensuite) est signalé « n'est plus accessible ».
// Recherche sur le nom, la description et les effets ; les traits choisis restent visibles.

import React, { useState } from 'react';
import { TRAITS } from '../../config/traits.js';
import { formatTraitConditions } from '../../config/rules.js';
import { CREATION, getTraitState, matchesSearch } from '../../config/creation.js';
import { effectsText } from '../layout/IdentitySection.jsx';
import VkIcon from '../ui/VkIcon.jsx';

// Effets chiffrés, sur l'épithète (le texte libre est dessous)
const effectsShort = (e = {}) => [
    e.actions && `+${e.actions} action`, e.armure && `+${e.armure} armure`, e.seuil && `+${e.seuil} seuil`,
    e.runePoints && `livre de sort ${e.runePoints}`, e.sagaBonus && `SAGA +${e.sagaBonus}`,
].filter(Boolean).join(' · ');

const RANK = (s) => (s.selected ? 0 : s.unavailable ? 2 : 1);   // choisis, accessibles, hors de portée

const StepTraits = ({ character, set }) => {
    const [search, setSearch] = useState('');
    const chosen = character.traits;
    const toggle = (trait, state) => {
        if (state.selected) set('traits', chosen.filter(t => t.name !== trait.name));
        else if (!state.unavailable) set('traits', [...chosen, trait]);
    };
    const shown = TRAITS
        .map(trait => ({ trait, state: getTraitState(character, trait) }))
        .filter(({ trait, state }) => state.selected
            || matchesSearch(search, trait.name, trait.description, effectsText(trait.effects), effectsShort(trait.effects)))
        .sort((a, b) => RANK(a.state) - RANK(b.state));

    return (
        <>
            <p className="vk-cr-lead">
                Choisissez {CREATION.minTraits} à {CREATION.maxTraits} traits ou backgrounds. Les conditions se vérifient sur vos
                caractéristiques et compétences : un trait hors de portée dit pourquoi.
            </p>
            <div className="vk-cr-toolbar">
                <span className="vk-input-icon block">
                    <VkIcon name="eye" />
                    <input className="vk-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un trait (nom, description, effets)…" />
                </span>
                <span className="vk-label"><strong className="vk-num">{chosen.length} / {CREATION.maxTraits}</strong> <span className="text-muted text-sm">({CREATION.minTraits} au moins)</span></span>
            </div>
            {shown.length === 0 && <p className="text-sm text-muted italic">Aucun trait ne correspond à la recherche.</p>}
            <div className="vk-cr-traits">
                {shown.map(({ trait, state }) => {
                    const short = effectsShort(trait.effects);
                    const conditions = formatTraitConditions(trait);
                    return (
                        <button key={trait.name} type="button" aria-disabled={state.unavailable || undefined} onClick={() => toggle(trait, state)}
                                className={`vk-cr-trait ${state.selected ? 'is-selected' : ''} ${state.unavailable ? 'is-unavailable' : ''} ${state.invalid ? 'is-invalid' : ''}`}>
                            {state.selected && <span className="vk-cr-trait-chosen">Choisi</span>}
                            <span className="vk-epithet vk-cr-epithet">{trait.name}{short && <small>{short}</small>}</span>
                            <span className="vk-cr-trait-desc">{trait.description}</span>
                            {trait.effects?.description && <span className="vk-cr-trait-effect">{trait.effects.description}</span>}
                            {conditions && <span className="vk-cr-trait-meta">Requis : {conditions}</span>}
                            {trait.incompatible?.length > 0 && <span className="vk-cr-trait-meta">Incompatible : {trait.incompatible.join(', ')}</span>}
                            {state.reason && <span className="vk-cr-trait-why">{state.invalid ? "N'est plus accessible : " : ''}{state.reason}</span>}
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default StepTraits;
