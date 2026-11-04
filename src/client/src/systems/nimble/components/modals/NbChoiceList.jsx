// src/client/src/systems/nimble/components/modals/NbChoiceList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Liste de choix en cartes (options de classe, sous-classes, faveurs, écoles) :
// nom, coût, texte replié sous le nom ; un clic coche ou décoche.
// Sert à la montée de niveau et aux choix rattrapés depuis la fiche.
//
// Props : items [{ key, name, vo?, cost?, text?, summary? }], selected (clés),
//         max (nombre de choix), taken (clés déjà acquises, grisées), onChange(clés)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { NbRich } from '../ui/NbUi.jsx';

const NbChoiceList = ({ items, selected, max = 1, taken = [], onChange }) => {
    const toggle = (key) => {
        if (selected.includes(key)) { onChange(selected.filter(k => k !== key)); return; }
        if (max === 1) { onChange([key]); return; }
        if (selected.length < max) onChange([...selected, key]);
    };
    return (
        <div className="nb-cards">
            {items.map(it => {
                const owned = taken.includes(it.key);
                return (
                    <button key={it.key} type="button" disabled={owned}
                            className={`nb-card-choice${selected.includes(it.key) ? ' is-selected' : ''}`} onClick={() => toggle(it.key)}>
                        <b>{it.name}</b>
                        {(it.vo || it.cost) && <span className="nb-vo">{[it.vo, it.cost].filter(Boolean).join(' · ')}{owned ? ' · déjà acquis' : ''}</span>}
                        {(it.summary || it.text) && <NbRich text={it.summary ?? it.text} className="nb-line-text" />}
                    </button>
                );
            })}
        </div>
    );
};

export default NbChoiceList;
