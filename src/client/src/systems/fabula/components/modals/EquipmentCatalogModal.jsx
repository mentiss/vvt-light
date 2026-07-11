// src/client/src/systems/fabula/components/modals/EquipmentCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de parcours du catalogue d'équipement — même patron que les
// catalogues Delta Green / Cyberpunk / Achtung : pills de filtre par type,
// champ de recherche (insensible aux accents), cartes cliquables.
//
// Deux sources : le catalogue DE BASE (equipment.js, 31 entrées, livre de
// règles) et le catalogue RARE (equipmentRare.js, 174 objets rares fournis par
// le MJ). `includeRare` (défaut true) contrôle l'inclusion du second — le
// wizard de création passe `includeRare={false}` : les objets rares ne sont
// pas des choix de départ (décision MJ), uniquement accessibles en jeu via la
// fiche/GM. Un badge "Rare" distingue visuellement les entrées de ce catalogue.
//
// onPick reçoit un item DÉTACHÉ (catalogToItem/rareCatalogToItem) : préremplissage
// pur, l'appelant l'ajoute où il veut (sac à dos fiche, liste d'achat wizard) —
// non équipé par défaut (emplacementEquipe: null). La modale reste ouverte
// après un ajout (achats multiples), fermeture via ✕ ou le fond.
// La catégorie Accessoires du catalogue de base est prévue d'origine (état
// vide) mais le catalogue rare couvre déjà 29 accessoires.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { EQUIPMENT_CATALOG, CATALOG_ORDER, catalogToItem } from '../../config.jsx';
import { EQUIPMENT_RARE_CATALOG, RARE_CATALOG_ORDER, rareCatalogToItem } from '../../config/equipmentRare.js';
import { EquipmentItemSummary } from '../layout/EquipmentEditForm.jsx';

const FILTERS = [
    { key: 'tous',       label: 'Tous' },
    { key: 'arme',       label: 'Armes' },
    { key: 'armure',     label: 'Armures' },
    { key: 'bouclier',   label: 'Boucliers' },
    { key: 'accessoire', label: 'Accessoires' },
];

// Recherche insensible à la casse et aux accents ("epee" trouve "Épée").
const norm = (s) => (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const EquipmentCatalogModal = ({ open, onClose, onPick, includeRare = true }) => {
    const [filter, setFilter] = useState('tous');
    const [search, setSearch] = useState('');

    // Items détachés mémoïsés une fois — la recherche filtre dessus.
    const entries = useMemo(() => {
        const base = CATALOG_ORDER.map(key => ({ key, rare: false, item: catalogToItem(key) }));
        if (!includeRare) return base;
        const rare = RARE_CATALOG_ORDER.map(key => ({ key, rare: true, item: rareCatalogToItem(key) }));
        return [...base, ...rare];
    }, [includeRare]);

    if (!open) return null;

    const q = norm(search);
    const filtered = entries.filter(({ key, rare, item }) => {
        if (filter !== 'tous' && item.typeEmplacement !== filter) return false;
        if (!q) return true;
        const cat = rare ? (EQUIPMENT_RARE_CATALOG[key].categorie ?? '') : (EQUIPMENT_CATALOG[key].categorie ?? '');
        return norm(item.nomLibre).includes(q) || norm(cat).includes(q);
    });

    const pick = ({ key, rare }) => onPick(rare ? rareCatalogToItem(key) : catalogToItem(key));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
             onClick={onClose}>
            <div className="bg-surface border border-default rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
                 onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-default shrink-0">
                    <h3 className="fu-font-title text-primary">Catalogue d'équipement</h3>
                    <button type="button" onClick={onClose} className="text-muted text-lg px-2">✕</button>
                </div>

                {/* Filtres + recherche */}
                <div className="p-3 flex flex-col gap-2 border-b border-default shrink-0">
                    <div className="flex gap-1 flex-wrap">
                        {FILTERS.map(f => (
                            <button key={f.key} type="button" onClick={() => setFilter(f.key)}
                                    className={`px-2 py-1 rounded-full text-xs border ${
                                        filter === f.key ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                    }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <input placeholder="Rechercher (nom, catégorie…)" value={search}
                           onChange={e => setSearch(e.target.value)}
                           className="bg-default border border-default rounded px-2 py-1 text-sm" />
                </div>

                {/* Liste */}
                <div className="p-3 overflow-y-auto flex flex-col gap-2">
                    {filtered.length === 0 && (
                        <p className="text-xs text-muted italic">Aucun résultat.</p>
                    )}

                    {filtered.map(({ key, rare, item }) => (
                        <div key={`${rare ? 'rare' : 'base'}:${key}`} className="bg-surface-alt rounded p-2 flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    {rare && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white font-semibold">
                                            Rare
                                        </span>
                                    )}
                                </div>
                                <EquipmentItemSummary item={item} showType={filter === 'tous'} />
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-xs text-accent font-semibold">
                                    {item.prix > 0 ? `${item.prix} z` : '—'}
                                </span>
                                <button type="button" onClick={() => pick({ key, rare })}
                                        className="px-2 py-0.5 rounded-full bg-primary text-white text-xs">
                                    + Ajouter
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EquipmentCatalogModal;