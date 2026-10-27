// src/client/src/systems/fabula/components/modals/EquipmentCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue d'équipement Fabula sur la modale générique CatalogModal
// (documentations/spec_ui_catalogue.md) : filtres par type et par rareté,
// lignes au résumé de l'objet (EquipmentItemSummary) avec prix et badge
// « Rare », objet libre saisi avec le formulaire d'édition des fiches
// (EquipmentEditForm).
//
// Deux sources : le catalogue DE BASE (equipment.js, 31 entrées, livre de
// règles) et le catalogue RARE (equipmentRare.js, 174 objets rares fournis par
// le MJ). `includeRare` (défaut true) contrôle l'inclusion du second — le
// wizard de création passe `includeRare={false}` : les objets rares ne sont
// pas des choix de départ (décision MJ), uniquement accessibles en jeu via la
// fiche/GM ; la rangée Base / Rare disparaît alors.
//
// onPick reçoit un item DÉTACHÉ (catalogToItem/rareCatalogToItem, ou l'objet
// libre) : l'appelant l'ajoute où il veut (sac à dos fiche, liste d'achat
// wizard) — non équipé par défaut (emplacementEquipe: null). La modale reste
// ouverte après un ajout (achats multiples).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import { EQUIPMENT_CATALOG, CATALOG_ORDER, catalogToItem } from '../../config.jsx';
import { EQUIPMENT_RARE_CATALOG, RARE_CATALOG_ORDER, rareCatalogToItem } from '../../config/equipmentRare.js';
import EquipmentEditForm, { EquipmentItemSummary, createEmptyItem } from '../layout/EquipmentEditForm.jsx';

const TYPE_FILTER = {
    key:      'type',
    getValue: e => e.item.typeEmplacement,
    options:  [
        { value: 'arme',       label: 'Armes' },
        { value: 'armure',     label: 'Armures' },
        { value: 'bouclier',   label: 'Boucliers' },
        { value: 'accessoire', label: 'Accessoires' },
    ],
};

const RARITY_FILTER = {
    key:      'rarity',
    getValue: e => (e.rare ? 'rare' : 'base'),
    options:  [{ value: 'base', label: 'Base' }, { value: 'rare', label: 'Rare' }],
};

const CUSTOM_DEFAULTS = createEmptyItem();

const renderItem = ({ rare, item }) => (
    <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
            {rare && (
                <span className="inline-block mb-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white font-semibold">Rare</span>
            )}
            <EquipmentItemSummary item={item} />
        </div>
        <span className="text-xs text-accent font-semibold shrink-0">{item.prix > 0 ? `${item.prix} z` : '—'}</span>
    </div>
);

const renderCustomForm = ({ value, onChange }) => <EquipmentEditForm item={value} onChange={onChange} />;

const EquipmentCatalogModal = ({ open, onClose, onPick, includeRare = true }) => {
    // Entrées mémoïsées une fois ; la catégorie du catalogue est cherchable
    const entries = useMemo(() => {
        const base = CATALOG_ORDER.map(key => ({
            key, rare: false, categorie: EQUIPMENT_CATALOG[key].categorie ?? '', item: catalogToItem(key),
        }));
        if (!includeRare) return base;
        const rare = RARE_CATALOG_ORDER.map(key => ({
            key, rare: true, categorie: EQUIPMENT_RARE_CATALOG[key].categorie ?? '', item: rareCatalogToItem(key),
        }));
        return [...base, ...rare];
    }, [includeRare]);

    const filters = useMemo(() => (includeRare ? [TYPE_FILTER, RARITY_FILTER] : [TYPE_FILTER]), [includeRare]);

    if (!open) return null;

    return (
        <CatalogModal
            title="Catalogue d'équipement"
            items={entries}
            renderItem={renderItem}
            getKey={e => `${e.rare ? 'rare' : 'base'}:${e.key}`}
            filters={filters}
            // Objet détaché à chaque ajout (jamais l'instance mémoïsée)
            onAdd={({ key, rare }) => onPick(rare ? rareCatalogToItem(key) : catalogToItem(key))}
            onAddCustom={draft => onPick({ ...draft, nomLibre: draft.nomLibre.trim() })}
            customDefaults={CUSTOM_DEFAULTS}
            renderCustomForm={renderCustomForm}
            isCustomValid={draft => !!draft.nomLibre?.trim()}
            onClose={onClose}
        />
    );
};

export default EquipmentCatalogModal;
