// src/client/src/systems/deltagreen/components/layout/EquipmentCatalogModal.jsx

import React, { useState, useMemo } from 'react';
import {EQUIPMENT_CATALOG, EQUIPMENT_CATEGORY_LABELS} from '../../config.jsx';

const EXPENSE_SHORT = {
    Incidental: 'Incident.',
    Standard:   'Standard',
    Unusual:    'Inhab.',
    Major:      'Majeur',
    Extreme:    'Extrême',
};

const EquipmentCatalogModal = ({ onAdd, onClose }) => {
    const [search,   setSearch]   = useState('');
    const [category, setCategory] = useState(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return EQUIPMENT_CATALOG
            .filter(cat => !category || cat.key === category)
            .flatMap(cat => cat.items.map(item => ({ ...item, _catKey: cat.key, _catLabel: cat.label })))
            .filter(item => !q ||
                item.name.toLowerCase().includes(q) ||
                item.notes?.toLowerCase().includes(q)
            );
    }, [search, category]);

    const handleSelect = (item) => {
        onAdd({
            name:            item.name,
            notes:           item.notes           ?? '',
            category:        item._catKey,
            expense:         item.expense          ?? 'Standard',
            isRestricted:    item.is_restricted    ?? false,
            restrictionNote: '',
            quantity:        1,
            jsonDetails:     item.jsonDetails      ?? {},
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
                className="bg-default border border-default shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
                style={{ fontFamily: 'var(--dg-font-body)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="dg-header px-4 py-3 flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">
                        Catalogue d'équipement — Delta Green
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white shrink-0 ml-2">✕</button>
                </div>

                {/* Recherche + filtres catégories */}
                <div className="shrink-0 px-4 py-3 border-b border-default space-y-2">
                    <input
                        className="dg-field-input w-full px-3 py-1.5 text-sm"
                        placeholder="Rechercher un équipement…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                    <div className="flex flex-wrap gap-1">
                        <button
                            onClick={() => setCategory(null)}
                            className={[
                                'px-2 py-0.5 text-[10px] font-mono border transition-colors',
                                !category ? 'border-accent text-accent bg-accent/10' : 'border-default text-muted hover:text-default',
                            ].join(' ')}
                        >Tout</button>
                        {EQUIPMENT_CATALOG.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setCategory(category === cat.key ? null : cat.key)}
                                className={[
                                    'px-2 py-0.5 text-[10px] font-mono border transition-colors',
                                    category === cat.key ? 'border-accent text-accent bg-accent/10' : 'border-default text-muted hover:text-default',
                                ].join(' ')}
                            >{cat.label}</button>
                        ))}
                    </div>
                </div>

                {/* Liste */}
                <div className="overflow-x-hidden overflow-y-auto max-w-full flex-1">
                    {/* En-têtes */}
                    <div className="grid grid-cols-[45%_20%_20%_15%] gap-x-3 px-4 py-1 border-b border-default/40 sticky top-0 bg-default z-10 w-full">
                        {['DÉSIGNATION', 'CATÉGORIE', 'COÛT', ''].map(h => (
                            <span key={h} className="dg-section-label text-[9px]">{h}</span>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <p className="text-sm text-muted font-mono italic px-4 py-8 text-center">
                            Aucun équipement trouvé.
                        </p>
                    )}

                    {filtered.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(item)}
                            className="grid grid-cols-[45%_20%_20%_15%] gap-x-3 px-4 py-1.5 border-b border-default/20 w-full text-left hover:bg-surface-alt transition-colors group"
                        >
                            {/* Désignation */}
                            <div className="min-w-0">
                                <span className="text-xs font-mono group-hover:text-accent transition-colors">
                                    {item.name}
                                    {item.is_restricted && (
                                        <span className="dg-stamp dg-stamp-red ml-1 text-[8px] align-middle">R</span>
                                    )}
                                </span>
                                {item.notes && (
                                    <p className="text-[9px] text-muted font-mono leading-tight truncate">{item.notes}</p>
                                )}
                            </div>
                            {/* Catégorie */}
                            <span className="text-[10px] font-mono text-muted self-center">
                                {EQUIPMENT_CATEGORY_LABELS[item._catKey] ?? item._catKey}
                            </span>
                            {/* Coût */}
                            <span className="text-xs font-mono text-muted self-center">
                                {EXPENSE_SHORT[item.expense] ?? item.expense}
                            </span>
                            {/* Vide */}
                            <span />
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-4 py-2 border-t border-default flex items-center justify-between">
                    <p className="text-[10px] font-mono text-muted">
                        Cliquer pour ajouter à l'inventaire
                    </p>
                    <p className="text-[10px] font-mono text-muted">{filtered.length} élément(s)</p>
                </div>
            </div>
        </div>
    );
};

export default EquipmentCatalogModal;