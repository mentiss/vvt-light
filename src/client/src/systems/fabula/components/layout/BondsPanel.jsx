// src/client/src/systems/fabula/components/BondsPanel.jsx
// Nouer un lien est une action de jeu : « Ajouter » est toujours disponible.
// Hors mode édition, « Ajouter » ouvre un brouillon (nom, type, notes) gardé en
// local : il n'est enregistré qu'à « Valider », jamais un lien sans nom.
import React, { useState } from 'react';
import FuIcon from '../ui/FuIcon.jsx';

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
    // Brouillon local hors mode édition : rien n'est enregistré avant « Valider ».
    const [draft, setDraft] = useState(null);

    const addBond = () => {
        if (bonds.length >= 6) return;
        if (editMode) onArrayChange('bonds', [...bonds, { cibleNom: '', cibleType: 'pj', sentiments: [], notes: '' }]);
        else setDraft({ cibleNom: '', cibleType: 'pj', notes: '' });
    };
    const confirmDraft = () => {
        onArrayChange('bonds', [...bonds, { ...draft, cibleNom: draft.cibleNom.trim(), sentiments: [] }]);
        setDraft(null);
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
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Liens<span className="fu-kana" aria-hidden="true">絆</span></h3>
                <span className="fu-rule" />
                <span className="fu-aside"><b>{bonds.length}</b> / 6</span>
                <button type="button" onClick={addBond} disabled={bonds.length >= 6 || draft !== null}
                        className="fu-btn fu-btn-sm">
                    <FuIcon name="plus" className="fu-ico-sm" />Ajouter
                </button>
            </div>

            {bonds.length === 0 && !draft && <p className="text-xs text-muted italic">Aucun lien.</p>}

            <div>
                {bonds.map((b, i) => (
                    <div key={i} className="fu-bond">
                        {editMode ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center">
                                    <input placeholder="Nom de la cible" value={b.cibleNom}
                                           onChange={e => updateBond(i, { cibleNom: e.target.value })}
                                           className="bg-default border border-default rounded px-2 py-1 text-sm flex-1" />
                                    <div className="flex gap-1">
                                        {CIBLE_TYPES.map(t => (
                                            <button key={t.key} type="button" onClick={() => updateBond(i, { cibleType: t.key })}
                                                    className={`fu-pill${b.cibleType === t.key ? ' is-on' : ''}`}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => removeBond(i)} className="text-danger text-sm" aria-label="Retirer le lien"><FuIcon name="close" className="fu-ico-sm" /></button>
                                </div>
                                <input placeholder="Notes (optionnel)" value={b.notes ?? ''}
                                       onChange={e => updateBond(i, { notes: e.target.value })}
                                       className="bg-default border border-default rounded px-2 py-1 text-sm" />
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2">
                                    <FuIcon name="bond" className="fu-ico-sm text-danger" />
                                    <b className="text-sm">{b.cibleNom}</b>
                                    <span className="fu-tag text-secondary">{CIBLE_TYPES.find(t => t.key === b.cibleType)?.label}</span>
                                </div>
                                {b.notes && <p className="text-xs text-muted mt-0.5">{b.notes}</p>}
                            </div>
                        )}
                        {/* Les sentiments sont une action de jeu (ils évoluent en cours de
                            partie), pas une édition de texte libre — toujours actifs, comme
                            Équiper/Attaquer côté équipement. La seule contrainte réelle (max 3
                            sentiments, exclusivité de paire) est déjà gérée dans
                            toggleSentiment et ne dépend d'aucune façon du mode édition. */}
                        {/* Chaque paire est un interrupteur à deux positions (positif / négatif) */}
                        <div className="fu-feelings">
                            {SENTIMENT_PAIRS.map(pair => (
                                <div key={pair.join('-')} className="fu-feel">
                                    {pair.map((s, k) => (
                                        <button key={s} type="button" onClick={() => toggleSentiment(i, s, pair)}
                                                aria-pressed={b.sentiments.includes(s)}
                                                className={`${b.sentiments.includes(s) ? 'is-on' : ''}${k === 1 ? ' is-neg' : ''}`}>
                                            {SENTIMENT_LABELS[s]}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {draft && (
                    <div className="fu-bond flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                            <input placeholder="Nom de la cible" value={draft.cibleNom} autoFocus
                                   onChange={e => setDraft(d => ({ ...d, cibleNom: e.target.value }))}
                                   className="bg-default border border-default rounded px-2 py-1 text-sm flex-1" />
                            <div className="flex gap-1">
                                {CIBLE_TYPES.map(t => (
                                    <button key={t.key} type="button" onClick={() => setDraft(d => ({ ...d, cibleType: t.key }))}
                                            className={`fu-pill${draft.cibleType === t.key ? ' is-on' : ''}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input placeholder="Notes (optionnel)" value={draft.notes}
                               onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                               className="bg-default border border-default rounded px-2 py-1 text-sm" />
                        <div className="flex gap-1 justify-end">
                            <button type="button" onClick={() => setDraft(null)} className="fu-btn fu-btn-sm">Annuler</button>
                            <button type="button" onClick={confirmDraft} disabled={!draft.cibleNom.trim()}
                                    className="fu-btn fu-btn-sm fu-btn-gold">
                                Valider
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BondsPanel;