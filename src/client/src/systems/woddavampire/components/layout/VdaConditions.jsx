// src/client/src/systems/woddavampire/components/layout/VdaConditions.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Faiblesse du clan, Dérangements et liens de sang (spec §12, §17, §19,
// §II.13 C-5 à C-8).
//   - VdaWeakness : section Faiblesse (texte, précision, faiblesse appliquée) ;
//   - VdaClanWeakness : faiblesse appliquée du clan (compteur ou bascule), action
//     de jeu enregistrée tout de suite ; les états se règlent à la table ;
//   - VdaDerangements, VdaBloodBonds : listes avec rappel de l'effet, modifiables
//     en mode Édition.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { CLAN_WEAKNESS_STATES, DERANGEMENTS, DERANGEMENT_RULE, BLOOD_BOND_LEVELS } from '../../config.jsx';
import { characterProfile } from '../../config/rules/character.js';
import { Field } from './VdaSheetParts.jsx';
import { VdaChip, VdaStepper, VdaToggle } from '../ui/VdaUi.jsx';

/**
 * Faiblesse du clan : texte, précision (champ en édition ; compact : à la suite du texte)
 * et faiblesse appliquée — props : c, editMode, onField, onQuick, compact
 */
export const VdaWeakness = ({ c, editMode = false, onField, onQuick, compact = false }) => {
    const { clan } = characterProfile(c);
    return (
        <div>
            <div className={`vda-col-title${compact ? ' vda-gm-h' : ''}`}>Faiblesse</div>
            <p className="vda-note">{clan?.weakness}{compact && c.weaknessDetail ? ` — ${c.weaknessDetail}` : ''}</p>
            {!compact && <Field label="Précision" value={c.weaknessDetail} editMode={editMode} onChange={(v) => onField('weaknessDetail', v)} />}
            <VdaClanWeakness c={c} onQuick={onQuick} />
        </div>
    );
};

/** Faiblesse appliquée du clan (Tzimisce, Lhiannan, Gargouilles, Anda) — props : c, onQuick ; rien pour les autres clans */
export const VdaClanWeakness = ({ c, onQuick }) => {
    const weakness = CLAN_WEAKNESS_STATES[c.clanKey];
    if (!weakness) return null;
    const states = c.states ?? [];
    const counter = weakness.kind === 'halvePerCount' || weakness.kind === 'minusPerCount';
    return (
        <div className="vda-clan-weakness">
            {counter ? (
                <div className="vda-trait">
                    <span className="vda-trait-name">{weakness.counterLabel}</span>
                    <VdaStepper value={c.weaknessCounter ?? 0} min={0} max={30} onChange={(v) => onQuick({ weaknessCounter: v })} label={weakness.counterLabel} />
                </div>
            ) : (
                <VdaToggle on={states.includes('weakness')} onChange={(on) => onQuick({ states: on ? [...states, 'weakness'] : states.filter(x => x !== 'weakness') })}>
                    {weakness.label}
                </VdaToggle>
            )}
            <p className="vda-note">{counter || weakness.kind === 'halve' ? 'Appliquée à toutes les réserves de dés (ligne « Faiblesse » du jet).' : weakness.reminder}</p>
        </div>
    );
};
/** Dérangements — props : c, editMode, onArray */
export const VdaDerangements = ({ c, editMode, onArray }) => {
    const [adding, setAdding] = useState(false);
    const list = c.derangements ?? [];
    const set = (d, patch) => onArray('derangements', list.map(x => (x === d ? { ...x, ...patch } : x)));
    return (
        <div>
            <div className="vda-col-title">Dérangements</div>
            {list.length === 0 && <p className="vda-note text-center">Aucun</p>}
            {list.map(d => {
                const def = DERANGEMENTS[d.derangementKey];
                return (
                    <div key={d.id ?? d.derangementKey} className="vda-power-row">
                        <div className="vda-power-head">
                            <b className="flex-1">{def?.label ?? d.derangementKey}{d.incurable && <small className="vda-note"> · incurable</small>}</b>
                            {editMode && <VdaToggle on={!!d.incurable} onChange={(v) => set(d, { incurable: v })}>incurable</VdaToggle>}
                            {editMode && <VdaChip onClick={() => onArray('derangements', list.filter(x => x !== d))}>✕</VdaChip>}
                        </div>
                        <div className="vda-power-effect">
                            <p className="vda-note">{def?.effect}</p>
                            {editMode
                                ? <input className="vda-input" placeholder="Précision" value={d.details ?? ''} onChange={(e) => set(d, { details: e.target.value })} />
                                : d.details && <p>{d.details}</p>}
                        </div>
                    </div>
                );
            })}
            {editMode && (
                <div className="mt-2">
                    <VdaChip on={adding} onClick={() => setAdding(a => !a)}>Ajouter un Dérangement</VdaChip>
                    {adding && (
                        <div className="vda-chips is-small mt-1">
                            {Object.entries(DERANGEMENTS).filter(([k]) => !list.some(d => d.derangementKey === k)).map(([k, def]) => (
                                <VdaChip key={k} onClick={() => onArray('derangements', [...list, { derangementKey: k, incurable: false, details: '' }])}>{def.label}</VdaChip>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {list.length > 0 && <p className="vda-note mt-1">{DERANGEMENT_RULE}</p>}
        </div>
    );
};

/** Liens de sang — props : c, editMode, onArray */
export const VdaBloodBonds = ({ c, editMode, onArray }) => {
    const list = c.bloodBonds ?? [];
    const set = (b, patch) => onArray('bloodBonds', list.map(x => (x === b ? { ...x, ...patch } : x)));
    return (
        <div>
            <div className="vda-col-title">Liens de sang</div>
            {list.length === 0 && <p className="vda-note text-center">Aucun</p>}
            {list.map((b, i) => (
                <div key={b.id ?? `new-${i}`} className="vda-power-row">
                    <div className="vda-power-head">
                        {editMode
                            ? <input className="vda-input flex-1" placeholder="Régnant" value={b.regnant ?? ''} onChange={(e) => set(b, { regnant: e.target.value })} />
                            : <b className="flex-1">{b.regnant || 'Régnant inconnu'}</b>}
                        {editMode
                            ? <VdaStepper value={b.level ?? 1} min={1} max={3} onChange={(v) => set(b, { level: v })} label="Niveau du lien" />
                            : <span className="vda-power-meta">niveau {b.level}</span>}
                        {editMode && <VdaChip onClick={() => onArray('bloodBonds', list.filter(x => x !== b))}>✕</VdaChip>}
                    </div>
                    <div className="vda-power-effect">
                        <p className="vda-note">{BLOOD_BOND_LEVELS[b.level ?? 1]}</p>
                        {editMode
                            ? <input className="vda-input" placeholder="Dernière gorgée (ex. Pâques 1242)" value={b.lastDrink ?? ''} onChange={(e) => set(b, { lastDrink: e.target.value })} />
                            : b.lastDrink && <p>Dernière gorgée : {b.lastDrink}</p>}
                    </div>
                </div>
            ))}
            {editMode && <div className="mt-2"><VdaChip onClick={() => onArray('bloodBonds', [...list, { regnant: '', level: 1, lastDrink: '' }])}>Ajouter un lien</VdaChip></div>}
        </div>
    );
};
