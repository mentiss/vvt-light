// src/client/src/systems/achtung/components/WeaponCatalogModal.jsx
import React, { useState, useMemo } from 'react';
import { WEAPON_CATALOG, FACTION_LABELS } from '../config/weaponCatalog.js';
import { RANGE_LABELS } from '../config.jsx';

const WeaponCatalogModal = ({ onClose, onSelect }) => {
    const [search, setSearch]             = useState('');
    const [typeFilter, setTypeFilter]     = useState(null);
    const [factionFilter, setFactionFilter] = useState(null);

    // Liste des types générée depuis le contenu réel du catalogue — pas de liste fermée à maintenir
    const types = useMemo(() => [...new Set(WEAPON_CATALOG.map(w => w.type))].sort(), []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return WEAPON_CATALOG.filter(w => {
            if (q && !w.name.toLowerCase().includes(q)) return false;
            if (typeFilter && w.type !== typeFilter) return false;
            if (factionFilter && w.faction !== factionFilter) return false;
            return true;
        });
    }, [search, typeFilter, factionFilter]);

    const pick = (w) => {
        const { type, faction, ...weaponData } = w;
        onSelect({
            ...weaponData,
            salvo:     [...(weaponData.salvo ?? [])],
            effect:    [...(weaponData.effect ?? [])],
            qualities: [...(weaponData.qualities ?? [])],
        });
        onClose();
    };

    return (
        <div className="ac-modal-overlay" onClick={onClose}>
            <div className="ac-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <div className="ac-modal-title mb-0">📖 Catalogue d'armes</div>
                    <button onClick={onClose} className="ac-btn ac-btn-ghost">✕</button>
                </div>

                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher une arme…"
                    className="ac-input w-full mb-2"
                    autoFocus
                />

                <div className="flex flex-wrap gap-1.5 mb-2">
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(f => f === t ? null : t)}
                            className={`ac-select-btn${typeFilter === t ? ' selected' : ''}`}
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(FACTION_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setFactionFilter(f => f === key ? null : key)}
                            className={`ac-select-btn${factionFilter === key ? ' selected-primary' : ''}`}
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-1" style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {filtered.map((w, i) => (
                        <button
                            key={`${w.name}-${i}`}
                            onClick={() => pick(w)}
                            className="ac-select-btn flex items-center justify-between px-3 py-2 text-left"
                        >
                            <div>
                                <span className="ac-font-title" style={{ fontSize: '0.82rem' }}>{w.name}</span>
                                <span className="ac-text-muted ml-2" style={{ fontSize: '0.68rem' }}>
                                    {w.type} · {FACTION_LABELS[w.faction]}
                                </span>
                            </div>
                            <div className="flex gap-2 ac-text-muted" style={{ fontSize: '0.7rem' }}>
                                <span className="text-secondary">{w.damage}⚄</span>
                                <span>{RANGE_LABELS[w.range] ?? w.range}</span>
                            </div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="ac-text-muted text-center py-3" style={{ fontSize: '0.8rem' }}>
                            Aucun résultat
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeaponCatalogModal;