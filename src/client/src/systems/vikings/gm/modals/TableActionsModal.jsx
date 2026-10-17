// src/client/src/systems/vikings/gm/modals/TableActionsModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Actions de table Pure Saga (spec_vikings.md §9.3, spec lot 3 §5.3, L3-3) :
//   • Attribuer +N SAGA (plafond 5, SAGA totale = gain réellement reçu)
//   • Fin d'arc : points de compétence restaurés
//   • Repos : fatigue −N, blessures −N, ou remise à 0
// Une écriture par personnage : onApply(id, patch) → PATCH des seuls champs.
// Habillage : planche du lot 4 (section « Interface MJ »).
//
// Props : characters (fiches complètes de la table), onApply, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { gainSaga } from '../../config/rules.js';
import { formatFullName } from '../../config/utils.js';
import VkModal from '../../components/ui/VkModal.jsx';
import VkPanel from '../../components/ui/VkPanel.jsx';
import VkIcon  from '../../components/ui/VkIcon.jsx';

const Stepper = ({ value, min = 0, onChange }) => (
    <div className="vk-stepper">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}><VkIcon name="minus" /></button>
        <span className="vk-num">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}><VkIcon name="plus" /></button>
    </div>
);

const Block = ({ title, hint, children }) => (
    <VkPanel variant="sm">
        <div className="vk-label text-lg text-primary">{title}</div>
        {hint && <p className="text-xs text-muted mb-2">{hint}</p>}
        {children}
    </VkPanel>
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

    const grantSaga = () => apply(`+${saga} Saga`, c => gainSaga(c, saga));
    const endOfArc  = () => apply('Fin d\'arc', c => ({
        skills: (c.skills ?? []).map(s => ({ ...s, currentPoints: s.level })),
    }));
    const rest = () => apply('Repos', c => ({
        tokensFatigue:  Math.max(0, (c.tokensFatigue ?? 0) - fatigue),
        tokensBlessure: Math.max(0, (c.tokensBlessure ?? 0) - blessure),
    }));
    const restAll = () => apply('Remise à 0', () => ({ tokensFatigue: 0, tokensBlessure: 0 }));

    const allSelected = selected.size === characters.length;

    return (
        <VkModal title={<><span className="vk-rune mr-2">ᛟ</span>Actions de table</>} onClose={onClose} size="max-w-3xl">
            <div className="flex justify-between items-center mb-1">
                <span className="vk-field-label">Personnages</span>
                <button type="button" className="text-sm text-primary hover:underline"
                        onClick={() => setSelected(allSelected ? new Set() : new Set(characters.map(c => c.id)))}>
                    {allSelected ? 'Aucun' : 'Toute la table'}
                </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
                {characters.map(c => (
                    <button key={c.id} type="button" onClick={() => toggle(c.id)}
                            className={`vk-pill ${selected.has(c.id) ? 'is-selected' : ''}`}>
                        {formatFullName(c)} <span className="opacity-75">· <span className="vk-rune">ᛟ</span>{c.sagaActuelle ?? 0}</span>
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Block title="Attribuer la Saga" hint="Plafond 5 ; le gain reçu compte dans la Saga totale.">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Stepper value={saga} min={1} onChange={setSaga} />
                        <button type="button" className="vk-btn vk-btn-primary vk-btn-sm" onClick={grantSaga} disabled={!targets.length}>Attribuer</button>
                    </div>
                </Block>

                <Block title="Fin d'arc" hint="Restaure tous les points de compétence (succès auto).">
                    <button type="button" className="vk-btn vk-btn-primary vk-btn-sm" onClick={endOfArc} disabled={!targets.length}>Restaurer</button>
                </Block>

                <Block title="Repos" hint="Récupération narrative.">
                    <div className="flex items-center justify-between text-sm my-1 gap-2">Fatigue − <Stepper value={fatigue} onChange={setFatigue} /></div>
                    <div className="flex items-center justify-between text-sm mb-2 gap-2">Blessures − <Stepper value={blessure} onChange={setBlessure} /></div>
                    <div className="flex gap-2 flex-wrap">
                        <button type="button" className="vk-btn vk-btn-primary vk-btn-sm" onClick={rest} disabled={!targets.length || (!fatigue && !blessure)}>Appliquer</button>
                        <button type="button" className="vk-btn vk-btn-sm" onClick={restAll} disabled={!targets.length}>Tout à 0</button>
                    </div>
                </Block>
            </div>

            {done && <p className="text-sm text-success mt-3 flex items-center gap-1.5"><VkIcon name="check" />{done}</p>}
        </VkModal>
    );
};

export default TableActionsModal;
