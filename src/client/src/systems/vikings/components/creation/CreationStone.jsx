// src/client/src/systems/vikings/components/creation/CreationStone.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Pierre du personnage en cours de création (spec_vikings_pierre_peinte.md §9.2) :
// l'en-tête de la fiche en lecture (ruban-serpent, avatar, nom, épithètes), posé sur
// une tablette pleine (pas de ciel derrière le texte). Le nom se grave dans le ruban
// à l'étape Identité ; avant, une inscription neutre. Une épithète devenue hors de
// portée est marquée. children : posé dans la pierre (le corbeau de la naissance).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { toRunes } from '../../config/runes.js';
import { TRAITS } from '../../config/traits.js';
import { effectsText } from '../layout/IdentitySection.jsx';
import VkSerpent from '../ui/VkSerpent.jsx';

const SHORT_EFFECT_MAX = 26;   // même règle que l'en-tête de la fiche
const NBSP = String.fromCharCode(160);   // le surnom et ses guillemets ne se coupent pas

/**
 * @param {object}   props.character    personnage en cours
 * @param {string}   props.inscription  texte en runes du ruban
 * @param {string[]} [props.invalid]    noms des traits devenus hors de portée
 * @param {string}   [props.className]
 */
const CreationStone = ({ character, inscription, invalid = [], className = '', children }) => {
    const parent = character.sexe === 'femme' ? 'fille' : 'fils';
    const details = [
        character.nom && `${parent} de ${character.nom}`,
        character.prenom && `${character.age} ans`,
        character.activite,
    ].filter(Boolean).join(' · ');

    return (
        <div className={`vk-stone vk-cr-stone ${className}`}>
            <VkSerpent inscription={inscription} />
            <div className="vk-stone-inner">
                <div className="vk-avatar vk-stone-avatar shrink-0">
                    {character.prenom ? character.prenom[0].toUpperCase() : <span className="vk-rune">ᛟ</span>}
                </div>
                <div className="flex-1 min-w-0">
                    {character.prenom ? (
                        <>
                            <div className="vk-rune vk-stone-runes">{toRunes([character.prenom, character.surnom].filter(Boolean).join(' '))}</div>
                            <div className="vk-title vk-stone-name">
                                {character.prenom}{character.surnom && <span className="vk-cr-surname"> {`«${NBSP}${character.surnom.trim().replace(/ /g, NBSP)}${NBSP}»`}</span>}
                            </div>
                        </>
                    ) : (
                        <div className="vk-cr-unnamed">Sans nom : il se gravera à l'étape Identité</div>
                    )}
                    {(details || character.playerName) && (
                        <div className="text-sm text-muted">
                            {details}{character.playerName && <>{details && ' · '}<em>joué{character.sexe === 'femme' ? 'e' : ''} par {character.playerName}</em></>}
                        </div>
                    )}
                    <div className="vk-epithets">
                        {character.traits.length === 0 && <span className="text-sm text-muted italic">Traits à venir</span>}
                        {character.traits.map(trait => {
                            const def = TRAITS.find(t => t.name === trait.name);
                            const effect = effectsText(def?.effects);
                            return (
                                <span key={trait.name} title={def?.description}
                                      className={`vk-epithet vk-cr-epithet ${invalid.includes(trait.name) ? 'is-invalid' : ''}`}>
                                    {trait.name}
                                    {effect.length <= SHORT_EFFECT_MAX && effect && <small>{effect}</small>}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
};

export default CreationStone;
