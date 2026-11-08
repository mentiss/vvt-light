// src/client/src/systems/vikings/components/creation/StepRunes.jsx
// Étape 4 : runes (spec_vikings.md §3.6, §4). Points = livre de sort des traits choisis,
// 1 point = 1 niveau. Futhark en grille ; chaque rune montre son sens littéral et son sens
// caché (retour MJ sur la planche : le joueur choisit sur le sens caché).

import React from 'react';
import { RUNES, RUNE_LEVELS } from '../../config/runes.js';
import { getCreationBudget } from '../../config/creation.js';
import { PointStick, Stepper } from './CreationParts.jsx';

const MAX_RUNE = 5;

const StepRunes = ({ character, set }) => {
    const b = getCreationBudget(character);
    const runes = character.runes;
    const change = (name, delta) => {
        const existing = runes.find(r => r.name === name);
        if (existing) set('runes', runes.map(r => (r.name === name ? { ...r, level: r.level + delta } : r)).filter(r => r.level > 0));
        else if (delta > 0) set('runes', [...runes, { name, level: 1 }]);
    };

    if (b.runeBook === 0) {
        return (
            <>
                <p className="vk-cr-lead">
                    Aucun trait choisi ne donne de livre de sort (Connaissance des runes, Leader né, Volva) : pas de runes à la création.
                    Elles pourront s'apprendre en jeu.
                </p>
                {runes.length > 0 && (
                    <div className="vk-callout vk-callout-warn text-sm">
                        Des runes restent choisies sans livre de sort.{' '}
                        <button type="button" className="vk-btn vk-btn-sm" onClick={() => set('runes', [])}>Les retirer</button>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <p className="vk-cr-lead">
                Votre livre de sort donne {b.runeBook} points : 1 point = 1 niveau de rune. La rune est une permission, jamais un bonus au jet.
            </p>
            <PointStick label="Points" left={Math.max(0, b.runeLeft)} total={b.runeBook} />
            {b.runeLeft < 0 && <div className="vk-callout vk-callout-danger text-sm mb-4">Trop de points placés ({b.runeSpent} sur {b.runeBook}) : retirez des niveaux.</div>}
            <div className="vk-cr-levels">
                {RUNE_LEVELS.slice(1).map((label, i) => <span key={label}><b>{i + 1}</b> {label}</span>)}
            </div>
            <div className="vk-cr-runes">
                {RUNES.map(rune => {
                    const level = runes.find(r => r.name === rune.name)?.level ?? 0;
                    return (
                        <div key={rune.name} className={`vk-cr-rune ${level ? 'is-known' : ''}`}>
                            <span className="vk-rune vk-cr-rune-glyph">{rune.symbol}</span>
                            <strong>{rune.name}</strong>
                            <span className="vk-cr-rune-literal">{rune.literal}</span>
                            <span className="vk-cr-rune-esoteric">{rune.esoteric}</span>
                            <span className="vk-cr-rune-level">{level ? `${level} · ${RUNE_LEVELS[level]}` : 'inconnue'}</span>
                            <Stepper value={level}
                                     onMinus={() => change(rune.name, -1)} minusDisabled={level <= 0}
                                     onPlus={() => change(rune.name, 1)} plusDisabled={level >= MAX_RUNE || b.runeLeft <= 0} />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default StepRunes;
