// src/client/src/systems/vikings/gm/modals/TableActionsModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Actions de table Pure Saga (spec_vikings.md §9.3, spec lot 3 §5.3, L3-3) :
//   • Attribuer +N SAGA (plafond 5, SAGA totale = gain réellement reçu)
//   • Fin d'arc : points de compétence restaurés
//   • Repos : fatigue −N, blessures −N, ou remise à 0
// Une écriture par personnage : onApply(id, patch) → PATCH des seuls champs.
//
// Props : characters (fiches complètes de la table), onApply, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { gainSaga } from '../../config/rules.js';
import { formatFullName } from '../../config/utils.js';

const Stepper = ({ label, value, min = 0, onChange }) => (
    <div className="flex items-center gap-2 text-sm text-default">
        <span className="w-24">{label}</span>
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
                className="w-7 h-7 rounded border border-default bg-default font-bold disabled:opacity-30">−</button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-7 h-7 rounded border border-default bg-default font-bold">+</button>
    </div>
);

const Block = ({ title, hint, children }) => (
    <div className="p-3 rounded-lg border border-default bg-surface-alt space-y-2">
        <div>
            <div className="text-sm font-bold text-default">{title}</div>
            {hint && <div className="text-xs text-muted">{hint}</div>}
        </div>
        {children}
    </div>
);

const ActionButton = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled}
            className="px-3 py-1.5 rounded bg-primary text-default text-xs font-semibold disabled:opacity-40">
        {children}
    </button>
);

const TableActionsModal = ({ characters, onApply, onClose }) => {
    const [selected, setSelected] = useState(() => new Set(characters.map(c => c.id)));
    const [saga,     setSaga]     = useState(1);
    const [fatigue,  setFatigue]  = useState(2);
    const [blessure, setBlessure] = useState(0);
    const [done,     setDone]     = useState('');

    const targets = characters.filter(c => selected.has(c.id));
    const toggle = (id) => setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const apply = async (label, patchFor) => {
        await Promise.all(targets.map(c => onApply(c.id, patchFor(c))));
        setDone(`${label} : ${targets.length} personnage${targets.length > 1 ? 's' : ''}`);
    };

    const grantSaga = () => apply(`+${saga} SAGA`, c => gainSaga(c, saga));
    const endOfArc  = () => apply('Fin d\'arc', c => ({
        skills: (c.skills ?? []).map(s => ({ ...s, currentPoints: s.level })),
    }));
    const rest = () => apply('Repos', c => ({
        tokensFatigue:  Math.max(0, (c.tokensFatigue ?? 0) - fatigue),
        tokensBlessure: Math.max(0, (c.tokensBlessure ?? 0) - blessure),
    }));
    const restAll = () => apply('Remise à 0', () => ({ tokensFatigue: 0, tokensBlessure: 0 }));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-lg shadow-2xl max-w-lg w-full border-2 border-primary max-h-[90vh] overflow-y-auto"
                 onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-default">
                    <h2 className="text-lg font-bold text-default">ᛟ Actions de table</h2>
                    <button onClick={onClose} className="text-xl text-muted">✕</button>
                </div>

                <div className="p-4 space-y-3">
                    {/* Personnages concernés */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-default">Personnages</span>
                            <button onClick={() => setSelected(selected.size === characters.length ? new Set() : new Set(characters.map(c => c.id)))}
                                    className="text-xs text-primary hover:underline">
                                {selected.size === characters.length ? 'Aucun' : 'Toute la table'}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {characters.map(c => (
                                <button key={c.id} onClick={() => toggle(c.id)}
                                        className={`px-2.5 py-1 rounded-full text-xs border ${
                                            selected.has(c.id) ? 'bg-primary border-primary text-default font-semibold' : 'border-default text-muted'
                                        }`}>
                                    {formatFullName(c)} <span className="opacity-70">ᛟ{c.sagaActuelle ?? 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Block title="Attribuer de la SAGA" hint="Plafond 5 ; le gain reçu compte dans la SAGA totale.">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <Stepper label="SAGA" value={saga} min={1} onChange={setSaga} />
                            <ActionButton onClick={grantSaga} disabled={!targets.length}>Attribuer</ActionButton>
                        </div>
                    </Block>

                    <Block title="Fin d'arc" hint="Restaure tous les points de compétence (succès auto).">
                        <ActionButton onClick={endOfArc} disabled={!targets.length}>Restaurer les points</ActionButton>
                    </Block>

                    <Block title="Repos" hint="Récupération narrative.">
                        <Stepper label="Fatigue −" value={fatigue} onChange={setFatigue} />
                        <Stepper label="Blessures −" value={blessure} onChange={setBlessure} />
                        <div className="flex gap-2">
                            <ActionButton onClick={rest} disabled={!targets.length || (!fatigue && !blessure)}>Appliquer</ActionButton>
                            <ActionButton onClick={restAll} disabled={!targets.length}>Tout remettre à 0</ActionButton>
                        </div>
                    </Block>

                    {done && <p className="text-xs text-success font-semibold">✓ {done}</p>}
                </div>
            </div>
        </div>
    );
};

export default TableActionsModal;
