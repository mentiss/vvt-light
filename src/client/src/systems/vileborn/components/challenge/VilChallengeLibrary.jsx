// src/client/src/systems/vileborn/components/challenge/VilChallengeLibrary.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Colonne de la bibliothèque des défis (spec_vileborn_defis.md §II.5) :
// « Nouveau défi », recherche, filtres Source et Famille, fiches groupées par
// famille avec leur piste en miniature. Recherche et filtres par tools/catalog.js,
// comme CatalogModal.
//
// Props : library, selectedId, onSelect(id), onNew()
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import { filterCatalog, groupCatalog } from '../../../../tools/catalog.js';
import { CHALLENGE_FILTERS, CHALLENGE_GROUP, CHALLENGE_SEARCH, sortByFamily, sourceLabel } from '../../config/challenges.js';
import { VilPill } from '../ui/VilUi.jsx';
import VilTrackMini from './VilTrackMini.jsx';

const VilChallengeLibrary = ({ library, selectedId, onSelect, onNew }) => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState({});

    const groups = useMemo(() => groupCatalog(
        sortByFamily(filterCatalog(library, { query, filters: CHALLENGE_FILTERS, selected, searchFields: CHALLENGE_SEARCH })),
        CHALLENGE_GROUP.getValue,
    ), [library, query, selected]);

    const pick = (key, value) => setSelected(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));

    return (
        <aside className="vil-ch-list">
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={onNew}>Nouveau défi</button>
            <input className="vtt-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un défi…" />
            {CHALLENGE_FILTERS.map(f => (
                <div key={f.key} className="vil-pills vil-ch-filters">
                    <VilPill on={selected[f.key] == null} onClick={() => setSelected(prev => ({ ...prev, [f.key]: null }))}>Toutes</VilPill>
                    {f.options.map(o => <VilPill key={o.value} on={selected[f.key] === o.value} onClick={() => pick(f.key, o.value)}>{o.label}</VilPill>)}
                </div>
            ))}
            {groups.length === 0 && <p className="vil-note">Aucun défi.</p>}
            {groups.map(g => (
                <React.Fragment key={g.value}>
                    <div className="vil-ch-group">{CHALLENGE_GROUP.getLabel(g.value)}</div>
                    {g.items.map(c => (
                        <button key={c.id} type="button" className={`vil-ch-item${c.id === selectedId ? ' is-selected' : ''}`} onClick={() => onSelect(c.id)}>
                            <small>{sourceLabel(c.source)}{c.page ? `, p. ${c.page}` : ''}</small>
                            <strong>{c.name}</strong>
                            <VilTrackMini sheet={c} progress={0} />
                        </button>
                    ))}
                </React.Fragment>
            ))}
        </aside>
    );
};

export default VilChallengeLibrary;
