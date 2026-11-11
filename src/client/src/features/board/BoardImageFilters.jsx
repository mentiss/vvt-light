// src/client/src/features/board/BoardImageFilters.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Filtres d'une image du tableau (documentations/spec_tableau.md §13.2, Q-49, PB-9),
// sous la barre de sélection du MJ : préréglages (appliqués tout de suite) et trois
// curseurs, en aperçu chez le MJ pendant le réglage, enregistrés au lâcher.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { FILTER_MAX, FILTER_MIN, FILTER_PRESETS, FILTER_SLIDERS, presetFilter, withSlider } from './tools/boardFilters.js';

/**
 * @param {object} props
 * @param {object|null} props.filter filtre enregistré de l'image (null : aucun)
 * @param {Function} props.onPreview filtre en cours de réglage (aperçu local), ou null
 * @param {Function} props.onCommit  filtre à enregistrer
 */
const BoardImageFilters = ({ filter, onPreview, onCommit }) => {
    const [value, setValue] = useState(filter ?? presetFilter('normal'));

    const commit = (next) => { setValue(next); onCommit(next); };
    const slide = (key, raw) => {
        const next = withSlider(value, key, raw);
        setValue(next);
        onPreview(next);
    };

    return (
        <div className="vtt-board-filters" role="group" aria-label="Filtres de l'image">
            <div className="vtt-board-pills">
                {FILTER_PRESETS.map(p => (
                    <button key={p.id} type="button" className={`vtt-pill${value.preset === p.id ? ' is-selected' : ''}`}
                            aria-pressed={value.preset === p.id} onClick={() => commit(presetFilter(p.id))}>{p.label}</button>
                ))}
            </div>
            {FILTER_SLIDERS.map(s => (
                <label key={s.key} className="vtt-board-setting vtt-board-filter-slider">
                    <span>{s.label}</span>
                    <input type="range" min={FILTER_MIN} max={FILTER_MAX} step={0.05} value={value[s.key]}
                           onChange={e => slide(s.key, e.target.value)}
                           onPointerUp={() => commit(value)} onKeyUp={() => commit(value)} />
                    <span className="vtt-board-filter-value">{Math.round(value[s.key] * 100)} %</span>
                </label>
            ))}
        </div>
    );
};

export default BoardImageFilters;
