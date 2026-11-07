// src/client/src/systems/vikings/components/layout/SagaStateSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dalle « État » (spec_vikings_pierre_peinte.md D-7, planche) : SAGA (losanges en
// bois et or, perles sur un fil en pierre peinte), blessures 0–5 et fatigue 0–10
// (cases, ou bâton à encoches), avec leur palier et leur malus. Jauges et SAGA sont
// des actions de jeu, toujours actives. Transe berserk en cours (C-4) : compteur de
// tours et fin de transe (+4 fatigue). VitalDock : version compacte amarrée dans
// l'en-tête de la fiche joueur au défilement.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
    BLESSURE_MAX, FATIGUE_MAX, SAGA_MAX,
    getBlessureMalus, getFatigueMalus, getFatigueState,
} from '../../config/rules.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';
import VkRaven from '../ui/VkRaven.jsx';

// Clic sur une case : la remplit jusqu'à elle, ou vide à partir d'elle si déjà remplie.
export const nextTokens = (current, index, max) => index < current ? index : Math.min(index + 1, max);

const BLESSURE_STATES = ['', 'Superficielle', 'Sérieuse', 'Critique', 'Incapacitante', 'KO'];
const TRANSE_TURNS = 5;
const TRANSE_FATIGUE = 4;   // fin de transe : 4 tokens de fatigue (trait Berserk)

export const Tokens = ({ value, max, kind, onToggle, tiers = false }) => (
    <div className={`vk-tokens ${tiers ? 'has-tiers' : ''}`}>
        {Array.from({ length: max }, (_, i) => {
            const isTier = tiers && i % 2 === 1 && i < max - 1;   // repères +1 à +4 (2, 4, 6, 8 tokens)
            return (
                <button key={i} type="button" onClick={() => onToggle(i)}
                        className={`vk-token ${i < value ? `is-${kind}` : ''} ${i === max - 1 ? 'is-ko' : ''} ${isTier ? 'is-tier' : ''}`}
                        data-tier={isTier ? `+${(i + 1) / 2}` : undefined}
                        title={i === max - 1 ? (kind === 'blessure' ? 'KO' : 'Inconscient') : undefined} />
            );
        })}
    </div>
);

// Sans onClick : lecture seule (halle du MJ)
export const SagaBeads = ({ saga, onClick }) => (
    <div className="vk-saga" role="group" aria-label={`Saga ${saga} sur ${SAGA_MAX}`}>
        {Array.from({ length: SAGA_MAX }, (_, i) => (
            <button key={i} type="button" onClick={onClick ? () => onClick(i) : undefined} disabled={!onClick}
                    className={i < saga ? 'is-full' : ''}
                    title={saga === i + 1 ? `Saga ${i + 1} (cliquer : ${i})` : `Saga ${i + 1}`} />
        ))}
    </div>
);

// Actions de jeu communes à la dalle et à sa version amarrée
const useVitalActions = (update) => ({
    setTokens: (key, max) => (index) => update(prev => ({ ...prev, [key]: nextTokens(prev[key] ?? 0, index, max) })),
    // Perle cliquée : la réserve passe à ce niveau ; sur la dernière pleine = −1
    clickSaga: (i) => update(prev => ({ ...prev, sagaActuelle: (prev.sagaActuelle ?? 0) === i + 1 ? i : i + 1 })),
});

const blessureLabel = (b) => {
    const m = getBlessureMalus(b);
    if (b >= BLESSURE_MAX) return <span className="vk-tag vk-tag-danger">KO / mourant</span>;
    return <>{BLESSURE_STATES[b] || 'Indemne'}{m > 0 && <> : <span className="vk-text-warn font-bold">−{m} dé{m > 1 ? 's' : ''}</span></>}</>;
};
const fatigueLabel = (f) => {
    const m = getFatigueMalus(f);
    if (f >= FATIGUE_MAX) return <span className="vk-tag vk-tag-danger">Inconscient</span>;
    return <>{getFatigueState(f) || 'Reposé'}{m > 0 && <> : <span className="vk-text-warn font-bold">+{m} succès requis</span></>}</>;
};

/**
 * @param {number}   [props.transe]          tour de transe berserk (0 : aucune)
 * @param {function} [props.onTranseChange]  nouveau tour (0 = fin)
 */
const SagaStateSection = ({ char, editMode, set, update, transe = 0, onTranseChange }) => {
    const { setTokens, clickSaga } = useVitalActions(update);
    const saga = char.sagaActuelle ?? 0;
    const blessures = char.tokensBlessure ?? 0;
    const fatigue = char.tokensFatigue ?? 0;

    const endTranse = () => {
        onTranseChange?.(0);
        update(prev => ({ ...prev, tokensFatigue: Math.min(FATIGUE_MAX, (prev.tokensFatigue ?? 0) + TRANSE_FATIGUE) }));
    };

    return (
        <VkPanel className="vk-vital" data-vk-vital="">
            <h3 className="vk-band-title">État</h3>
            <VkRaven characterId={char.id} ko={blessures >= BLESSURE_MAX || fatigue >= FATIGUE_MAX} />
            <div className="vk-vital-grid">
                <div className="vk-vital-saga">
                    <span className="vk-vital-label">Saga</span>
                    <SagaBeads saga={saga} onClick={clickSaga} />
                    <span className="text-sm text-muted flex items-center gap-1.5">
                        légende
                        {editMode
                            ? <input type="number" className="vk-input vk-input-short vk-num" value={char.sagaTotale ?? 0}
                                     onChange={e => set('sagaTotale', parseInt(e.target.value) || 0)} />
                            : <strong className="text-default vk-num">{char.sagaTotale ?? 0}</strong>}
                    </span>
                </div>
                <div>
                    <div className="vk-vital-head"><span className="vk-vital-label"><VkIcon name="blood" /> Blessures</span><span className="text-sm">{blessureLabel(blessures)}</span></div>
                    <Tokens value={blessures} max={BLESSURE_MAX} kind="blessure" onToggle={setTokens('tokensBlessure', BLESSURE_MAX)} />
                </div>
                <div>
                    <div className="vk-vital-head"><span className="vk-vital-label"><VkIcon name="moon" /> Fatigue</span><span className="text-sm">{fatigueLabel(fatigue)}</span></div>
                    <Tokens value={fatigue} max={FATIGUE_MAX} kind="fatigue" tiers onToggle={setTokens('tokensFatigue', FATIGUE_MAX)} />
                </div>
            </div>

            {transe > 0 && (
                <div className="vk-vital-trance">
                    <span className="vk-vital-label">Transe berserk</span>
                    <span>tour <strong className="vk-num">{transe}</strong> / {TRANSE_TURNS}</span>
                    <div className="vk-stepper">
                        <button type="button" onClick={() => onTranseChange(Math.max(1, transe - 1))} disabled={transe <= 1}><VkIcon name="minus" /></button>
                        <span className="vk-num">{transe}</span>
                        <button type="button" onClick={() => onTranseChange(Math.min(TRANSE_TURNS, transe + 1))} disabled={transe >= TRANSE_TURNS}><VkIcon name="plus" /></button>
                    </div>
                    <button type="button" className="vk-btn vk-btn-sm" onClick={endTranse}>Fin de la transe (+{TRANSE_FATIGUE} fatigue)</button>
                </div>
            )}

            {editMode && (
                <div className="flex gap-2 mt-3">
                    <button type="button" className="vk-btn vk-btn-success vk-btn-sm" onClick={() => update(prev => ({ ...prev, tokensBlessure: 0 }))}>Soigner</button>
                    <button type="button" className="vk-btn vk-btn-sm" onClick={() => update(prev => ({ ...prev, tokensFatigue: 0 }))}>Repos</button>
                </div>
            )}
        </VkPanel>
    );
};

/** Bandeau d'état compact, amarré dans l'en-tête de la fiche joueur au défilement (D-7). */
export const VitalDock = ({ char, update }) => {
    const { setTokens, clickSaga } = useVitalActions(update);
    const b = char.tokensBlessure ?? 0, f = char.tokensFatigue ?? 0;
    const bm = getBlessureMalus(b), fm = getFatigueMalus(f);
    return (
        <div className="vk-dock">
            <SagaBeads saga={char.sagaActuelle ?? 0} onClick={clickSaga} />
            <span className="vk-dock-gauge">
                <span className="vk-dock-label">Blessures</span>
                <Tokens value={b} max={BLESSURE_MAX} kind="blessure" onToggle={setTokens('tokensBlessure', BLESSURE_MAX)} />
                {bm > 0 && b < BLESSURE_MAX && <span className="vk-dock-state">−{bm} dé{bm > 1 ? 's' : ''}</span>}
            </span>
            <span className="vk-dock-gauge">
                <span className="vk-dock-label">Fatigue</span>
                <Tokens value={f} max={FATIGUE_MAX} kind="fatigue" onToggle={setTokens('tokensFatigue', FATIGUE_MAX)} />
                {fm > 0 && f < FATIGUE_MAX && <span className="vk-dock-state">+{fm} requis</span>}
            </span>
        </div>
    );
};

export default SagaStateSection;
