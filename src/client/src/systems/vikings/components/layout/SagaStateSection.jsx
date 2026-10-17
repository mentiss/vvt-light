// src/client/src/systems/vikings/components/layout/SagaStateSection.jsx
// SAGA (losanges cliquables, SAGA totale) et état physique : blessures 0–5,
// fatigue 0–10 avec repères de palier. Jauges et SAGA sont des actions de jeu,
// toujours actives. Composant validé sur la planche (section 5).

import React from 'react';
import {
    BLESSURE_MAX, FATIGUE_MAX, SAGA_MAX,
    getBlessureMalus, getFatigueMalus, getFatigueState,
} from '../../config/rules.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';

// Clic sur une case : la remplit jusqu'à elle, ou vide à partir d'elle si déjà remplie.
const nextTokens = (current, index, max) => index < current ? index : Math.min(index + 1, max);

const BLESSURE_STATES = ['', 'Superficielle', 'Sérieuse', 'Critique', 'Incapacitante', 'KO'];

const Tokens = ({ value, max, kind, onToggle, tiers = false }) => (
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

const SagaStateSection = ({ char, editMode, set, update }) => {
    const saga = char.sagaActuelle ?? 0;
    const blessures = char.tokensBlessure ?? 0;
    const fatigue = char.tokensFatigue ?? 0;
    const blessureMalus = getBlessureMalus(blessures);
    const fatigueMalus = getFatigueMalus(fatigue);

    const setTokens = (key, max) => (index) =>
        update(prev => ({ ...prev, [key]: nextTokens(prev[key] ?? 0, index, max) }));
    // Losange cliquable : la réserve passe à ce niveau ; sur le dernier rempli = −1
    const clickSaga = (i) =>
        update(prev => ({ ...prev, sagaActuelle: (prev.sagaActuelle ?? 0) === i + 1 ? i : i + 1 }));

    return (
        <VkPanel>
            <div className="vk-section-title">Saga & état</div>

            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <span className="vk-label text-lg">Saga</span>
                    <div className="vk-saga" role="group" aria-label={`Saga ${saga} sur ${SAGA_MAX}`}>
                        {Array.from({ length: SAGA_MAX }, (_, i) => (
                            <button key={i} type="button" onClick={() => clickSaga(i)}
                                    className={i < saga ? 'is-full' : ''}
                                    title={saga === i + 1 ? `Saga ${i + 1} (cliquer : ${i})` : `Saga ${i + 1}`} />
                        ))}
                    </div>
                    <span className="vk-num font-bold">{saga} / {SAGA_MAX}</span>
                </div>
                <div className="text-sm text-muted flex items-center gap-2">
                    Saga totale
                    {editMode
                        ? <input type="number" className="vk-input vk-num w-20" value={char.sagaTotale ?? 0}
                                 onChange={e => set('sagaTotale', parseInt(e.target.value) || 0)} />
                        : <strong className="text-default vk-num">{char.sagaTotale ?? 0}</strong>}
                </div>
            </div>

            <div className="vk-gauges">
                <div>
                    <div className="flex justify-between items-baseline gap-4 mb-1">
                        <span className="vk-label text-lg"><VkIcon name="blood" /> Blessures</span>
                        <span className="text-sm text-muted">
                            {blessures}/{BLESSURE_MAX}{blessures > 0 && ` — ${BLESSURE_STATES[blessures]}`}
                            {blessureMalus > 0 && blessures < BLESSURE_MAX && <> : <span className="vk-text-warn">−{blessureMalus} dé{blessureMalus > 1 ? 's' : ''}</span></>}
                        </span>
                    </div>
                    <Tokens value={blessures} max={BLESSURE_MAX} kind="blessure" onToggle={setTokens('tokensBlessure', BLESSURE_MAX)} />
                </div>
                <div>
                    <div className="flex justify-between items-baseline gap-4 mb-1">
                        <span className="vk-label text-lg"><VkIcon name="moon" /> Fatigue</span>
                        <span className="text-sm text-muted">
                            {fatigue}/{FATIGUE_MAX}{fatigue > 0 && ` — ${getFatigueState(fatigue)}`}
                            {fatigueMalus > 0 && fatigue < FATIGUE_MAX && <> : <span className="vk-text-warn">+{fatigueMalus} succès requis</span></>}
                        </span>
                    </div>
                    <Tokens value={fatigue} max={FATIGUE_MAX} kind="fatigue" tiers onToggle={setTokens('tokensFatigue', FATIGUE_MAX)} />
                </div>
            </div>

            {editMode && (
                <div className="flex gap-2 mt-2">
                    <button type="button" className="vk-btn vk-btn-success vk-btn-sm" onClick={() => update(prev => ({ ...prev, tokensBlessure: 0 }))}>Soigner</button>
                    <button type="button" className="vk-btn vk-btn-sm" onClick={() => update(prev => ({ ...prev, tokensFatigue: 0 }))}>Repos</button>
                </div>
            )}
        </VkPanel>
    );
};

export default SagaStateSection;
