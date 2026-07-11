// src/client/src/systems/fabula/components/BondsPanel.jsx
import React from 'react';

const SENTIMENT_PAIRS = [
    ['admiration', 'inferiorite'],
    ['loyaute', 'mefiance'],
    ['affection', 'haine'],
];
const SENTIMENT_LABELS = {
    admiration: 'Admiration', inferiorite: 'Infériorité',
    loyaute: 'Loyauté', mefiance: 'Méfiance',
    affection: 'Affection', haine: 'Haine',
};
const CIBLE_TYPES = [
    { key: 'pj', label: 'PJ' },
    { key: 'pnj', label: 'PNJ' },
    { key: 'lieu', label: 'Lieu' },
    { key: 'organisation', label: 'Organisation' },
];

const BondsPanel = ({ character, editMode, onArrayChange }) => {
    const bonds = character.bonds ?? [];

    const addBond = () => {
        if (bonds.length >= 6) return;
        onArrayChange('bonds', [...bonds, { cibleNom: '', cibleType: 'pj', sentiments: [], notes: '' }]);
    };
    const updateBond = (i, patch) => onArrayChange('bonds', bonds.map((b, idx) => idx === i ? { ...b, ...patch } : b));
    const removeBond = (i) => onArrayChange('bonds', bonds.filter((_, idx) => idx !== i));
    const toggleSentiment = (i, sentiment, pair) => {
        const b = bonds[i];
        const withoutPair = b.sentiments.filter(s => !pair.includes(s));
        const has = b.sentiments.includes(sentiment);
        updateBond(i, { sentiments: has ? withoutPair : [...withoutPair, sentiment].slice(0, 3) });
    };

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="fu-font-title text-primary text-sm">Liens ({bonds.length}/6)</h3>
                {editMode && (
                    <button type="button" onClick={addBond} disabled={bonds.length >= 6}
                            className="px-2 py-1 rounded-full bg-primary text-white text-xs disabled:opacity-40">
                        + Ajouter
                    </button>
                )}
            </div>

            {bonds.length === 0 && <p className="text-xs text-muted italic">Aucun lien.</p>}

            <div className="flex flex-col gap-2">
                {bonds.map((b, i) => (
                    <div key={i} className="bg-surface-alt rounded p-2">
                        {editMode ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center">
                                    <input placeholder="Nom de la cible" value={b.cibleNom}
                                           onChange={e => updateBond(i, { cibleNom: e.target.value })}
                                           className="bg-default border border-default rounded px-2 py-1 text-sm flex-1" />
                                    <div className="flex gap-1">
                                        {CIBLE_TYPES.map(t => (
                                            <button key={t.key} type="button" onClick={() => updateBond(i, { cibleType: t.key })}
                                                    className={`px-2 py-1 rounded-full text-xs border ${
                                                        b.cibleType === t.key ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                                    }`}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => removeBond(i)} className="text-danger text-sm">✕</button>
                                </div>
                                <input placeholder="Notes (optionnel)" value={b.notes ?? ''}
                                       onChange={e => updateBond(i, { notes: e.target.value })}
                                       className="bg-default border border-default rounded px-2 py-1 text-sm" />
                            </div>
                        ) : (
                            <div className="text-sm font-semibold">
                                {b.cibleNom} <span className="text-xs text-muted font-normal">({CIBLE_TYPES.find(t => t.key === b.cibleType)?.label})</span>
                                {b.notes && <p className="text-xs text-muted font-normal mt-0.5">{b.notes}</p>}
                            </div>
                        )}
                        {/* Les sentiments sont une action de jeu (ils évoluent en cours de
                            partie), pas une édition de texte libre — toujours actifs, comme
                            Équiper/Attaquer côté équipement. La seule contrainte réelle (max 3
                            sentiments, exclusivité de paire) est déjà gérée dans
                            toggleSentiment et ne dépend d'aucune façon du mode édition. */}
                        <div className="flex gap-3 text-xs flex-wrap mt-1">
                            {SENTIMENT_PAIRS.map(pair => (
                                <div key={pair.join('-')} className="flex gap-1">
                                    {pair.map(s => (
                                        <button key={s} type="button" onClick={() => toggleSentiment(i, s, pair)}
                                                className={`px-2 py-0.5 rounded border cursor-pointer ${
                                                    b.sentiments.includes(s) ? 'bg-accent text-white border-accent' : 'bg-default border-default'
                                                }`}>
                                            {SENTIMENT_LABELS[s]}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BondsPanel;