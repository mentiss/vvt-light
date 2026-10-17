// src/client/src/systems/vikings/components/layout/SagaStateSection.jsx
// SAGA (réserve 0–5, SAGA totale) et état physique : blessures 0–5, fatigue 0–10.
// Jauges et SAGA sont des actions de jeu, toujours actives.

import React from 'react';
import {
    BLESSURE_MAX, FATIGUE_MAX,
    getBlessureMalus, getFatigueMalus, getFatigueState, isFatigueKO,
} from '../../config/rules.js';

// Clic sur une case : la remplit jusqu'à elle, ou vide à partir d'elle si déjà remplie.
const nextTokens = (current, index, max) => index < current ? index : Math.min(index + 1, max);

const StatusTags = ({ char }) => {
    const tags = [];
    const blessureMalus = getBlessureMalus(char.tokensBlessure);
    const fatigueMalus  = getFatigueMalus(char.tokensFatigue);
    if (char.tokensBlessure >= BLESSURE_MAX) tags.push({ text: '⚠️ KO / Mourant', color: 'bg-danger text-white' });
    else if (blessureMalus > 0) tags.push({ text: `−${blessureMalus}d10`, color: 'bg-danger text-white' });
    if (isFatigueKO(char.tokensFatigue)) tags.push({ text: '⚠️ Inconscient', color: 'bg-danger text-white' });
    else if (fatigueMalus > 0) tags.push({ text: `+${fatigueMalus} succès requis`, color: 'bg-secondary text-white' });
    if (!tags.length) return null;
    return (
        <div className="flex gap-2 flex-wrap mb-2">
            {tags.map(tag => (
                <span key={tag.text} className={`px-2 py-1 rounded text-xs font-bold ${tag.color}`}>{tag.text}</span>
            ))}
        </div>
    );
};

const TokenGauge = ({ label, value, max, filledClass, onToggle, hint }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-semibold text-default">{label}</span>
            <span className="text-[10px] text-muted">{value}/{max}{hint ? ` — ${hint}` : ''}</span>
        </div>
        <div className="flex flex-wrap gap-1">
            {Array.from({ length: max }, (_, i) => (
                <button key={i} type="button" onClick={() => onToggle(i)}
                        className={`w-6 h-6 rounded border-2 transition-all ${i < value ? filledClass : 'border-default hover:border-danger'} ${i === max - 1 ? 'border-danger' : ''}`}
                        title={i === max - 1 ? 'KO' : undefined} />
            ))}
        </div>
    </div>
);

const SagaStateSection = ({ char, editMode, set, update }) => {
    const setTokens = (key, max) => (index) =>
        update(prev => ({ ...prev, [key]: nextTokens(prev[key] ?? 0, index, max) }));
    const adjustSaga = (delta) =>
        update(prev => ({ ...prev, sagaActuelle: Math.max(0, Math.min(5, (prev.sagaActuelle ?? 0) + delta)) }));

    return (
        <div className="bg-surface rounded-lg p-3 border-2 border-default">
            <h3 className="text-sm font-bold text-default mb-2">SAGA & État physique</h3>
            <StatusTags char={char} />

            <div className="flex items-center justify-between mb-3 pb-3 border-b border-default">
                <div className="flex items-center gap-2">
                    <button onClick={() => adjustSaga(-1)} disabled={char.sagaActuelle <= 0}
                            className="w-6 h-6 bg-primary rounded-full font-bold text-sm disabled:opacity-30 text-default">-</button>
                    <span className="text-3xl font-bold text-primary">{char.sagaActuelle}</span>
                    <button onClick={() => adjustSaga(1)} disabled={char.sagaActuelle >= 5}
                            className="w-6 h-6 bg-primary rounded-full font-bold text-sm disabled:opacity-30 text-default">+</button>
                </div>
                <div className="text-xs text-default">
                    <span className="font-semibold">SAGA totale :</span>
                    {editMode ? (
                        <input type="number" value={char.sagaTotale ?? 0}
                               onChange={e => set('sagaTotale', parseInt(e.target.value) || 0)}
                               className="ml-1 w-14 px-1 border border-default rounded text-xs bg-default text-default" />
                    ) : (
                        <span className="ml-1 font-bold">{char.sagaTotale}</span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <TokenGauge label="Blessures" value={char.tokensBlessure ?? 0} max={BLESSURE_MAX}
                            filledClass="bg-danger border-danger"
                            onToggle={setTokens('tokensBlessure', BLESSURE_MAX)} />
                <TokenGauge label="Fatigue" value={char.tokensFatigue ?? 0} max={FATIGUE_MAX}
                            filledClass="bg-secondary border-secondary"
                            hint={getFatigueState(char.tokensFatigue)}
                            onToggle={setTokens('tokensFatigue', FATIGUE_MAX)} />
            </div>

            {editMode && (
                <div className="flex gap-2 mt-3">
                    <button onClick={() => update(prev => ({ ...prev, tokensBlessure: 0 }))} className="px-3 py-1.5 bg-success text-white rounded text-xs">Soigner</button>
                    <button onClick={() => update(prev => ({ ...prev, tokensFatigue: 0 }))} className="px-3 py-1.5 bg-primary text-default rounded text-xs">Repos</button>
                </div>
            )}
        </div>
    );
};

export default SagaStateSection;
