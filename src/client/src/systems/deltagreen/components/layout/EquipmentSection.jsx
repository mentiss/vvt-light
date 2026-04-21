// src/client/src/systems/deltagreen/components/layout/EquipmentSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Section 16 — Armure et matériel.
// Affichage groupé par catégorie, colonnes adaptées.
// En editMode : bouton ✎ par ligne + "+ Ajouter" + "+ Catalogue".
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_CATEGORY_ORDER} from "../../config.jsx";
import EquipmentEditPanel from "../ui/EquipmentEditPanel.jsx";
import EquipmentCatalogModal from "../modals/EquipmentCatalogModal.jsx";

// ── Constantes ────────────────────────────────────────────────────────────────


const EXPENSE_SHORT = {
    Incidental: 'Incident.',
    Standard:   'Standard',
    Unusual:    'Inhab.',
    Major:      'Majeur',
    Extreme:    'Extrême',
};

// Grilles par catégorie — read | edit (ajout de la colonne ✎)
const CAT_GRID = {
    armor:          { read: 'grid-cols-[1fr_3.5rem_5rem]',               edit: 'grid-cols-[1fr_3.5rem_5rem_1.5rem]' },
    vehicle_ground: { read: 'grid-cols-[1fr_3rem_3rem_5rem_5rem]',       edit: 'grid-cols-[1fr_3rem_3rem_5rem_5rem_1.5rem]' },
    vehicle_water:  { read: 'grid-cols-[1fr_3rem_3rem_5rem_5rem]',       edit: 'grid-cols-[1fr_3rem_3rem_5rem_5rem_1.5rem]' },
    vehicle_air:    { read: 'grid-cols-[1fr_3rem_5rem_5rem]',            edit: 'grid-cols-[1fr_3rem_5rem_5rem_1.5rem]'      },
    weapon_accessory:{ read: 'grid-cols-[1fr_6rem_5rem]',                edit: 'grid-cols-[1fr_6rem_5rem_1.5rem]'           },
    requisition:    { read: 'grid-cols-[1fr_5rem]',                      edit: 'grid-cols-[1fr_5rem_1.5rem]'                },
    _default:       { read: 'grid-cols-[1fr_5rem_2.5rem]',              edit: 'grid-cols-[1fr_5rem_2.5rem_1.5rem]'         },
};

const CAT_HEADERS = {
    armor:           ['DÉSIGNATION', 'RATING', 'COÛT'],
    vehicle_ground:  ['DÉSIGNATION', 'HP', 'ARM.', 'VITESSE', 'COÛT'],
    vehicle_water:   ['DÉSIGNATION', 'HP', 'ARM.', 'VITESSE', 'COÛT'],
    vehicle_air:     ['DÉSIGNATION', 'ARM.', 'VITESSE', 'COÛT'],
    weapon_accessory:['DÉSIGNATION', 'BONUS', 'COÛT'],
    requisition:     ['DÉSIGNATION', 'COÛT'],
    _default:        ['DÉSIGNATION', 'COÛT', 'QTÉ'],
};

const getGrid    = (catKey, editMode) => (CAT_GRID[catKey]    ?? CAT_GRID._default)[editMode ? 'edit' : 'read'];
const getHeaders = (catKey)           =>  CAT_HEADERS[catKey] ?? CAT_HEADERS._default;

// ── Sous-composants niveau module (pas de remount) ────────────────────────────

const Designation = ({ item }) => (
    <div className="min-w-0">
        <span className="text-xs font-mono truncate block">
            {item.name || '—'}
            {item.isRestricted && (
                <span className="dg-stamp dg-stamp-red ml-1 text-[8px] align-middle">R</span>
            )}
        </span>
        {item.notes && (
            <p className="text-[9px] font-mono text-muted leading-tight truncate">{item.notes}</p>
        )}
    </div>
);

const Cell = ({ children, center = false }) => (
    <span className={`text-xs font-mono${center ? ' text-center' : ''}`}>{children ?? '—'}</span>
);

// ── Rendu des cellules selon catégorie ────────────────────────────────────────

const renderCells = (item, catKey) => {
    const d = item.jsonDetails ?? {};
    const expense = EXPENSE_SHORT[item.expense] ?? item.expense;

    switch (catKey) {
        case 'armor':
            return [
                <Designation key="des" item={item} />,
                <Cell key="rat" center>{d.rating != null ? d.rating : '—'}</Cell>,
                <Cell key="exp">{expense}</Cell>,
            ];
        case 'vehicle_ground':
        case 'vehicle_water':
            return [
                <Designation key="des" item={item} />,
                <Cell key="hp"  center>{d.hp ?? '—'}</Cell>,
                <Cell key="arm" center>{d.armor_rating ?? '—'}</Cell>,
                <Cell key="spd">{d.speed ?? '—'}</Cell>,
                <Cell key="exp">{expense}</Cell>,
            ];
        case 'vehicle_air':
            return [
                <Designation key="des" item={item} />,
                <Cell key="arm" center>{d.armor_rating ?? '—'}</Cell>,
                <Cell key="spd">{d.speed ?? '—'}</Cell>,
                <Cell key="exp">{expense}</Cell>,
            ];
        case 'weapon_accessory':
            return [
                <Designation key="des" item={item} />,
                <Cell key="bon">{d.bonus ?? '—'}</Cell>,
                <Cell key="exp">{expense}</Cell>,
            ];
        case 'requisition':
            return [
                <Designation key="des" item={item} />,
                <Cell key="exp">{expense}</Cell>,
            ];
        default:
            return [
                <Designation key="des" item={item} />,
                <Cell key="exp">{expense}</Cell>,
                <Cell key="qty" center>{item.quantity > 1 ? `×${item.quantity}` : '1'}</Cell>,
            ];
    }
};

// ── Composant principal ───────────────────────────────────────────────────────

const EquipmentSection = ({ char, editMode, setArr }) => {
    const [panelItem,   setPanelItem]   = useState(null);   // item en cours d'édition ou null (nouveau)
    const [showCatalog, setShowCatalog] = useState(false);

    // Items sans slot = équipement général (pas armes)
    const items = (char.equipment ?? []).filter(e => !e.slot);

    // Groupés par catégorie, dans l'ordre défini
    const grouped = EQUIPMENT_CATEGORY_ORDER.reduce((acc, key) => {
        const cat = items.filter(e => e.category === key);
        if (cat.length > 0) acc[key] = cat;
        return acc;
    }, {});
    // Items sans catégorie reconnue → misc
    const uncategorized = items.filter(e => !EQUIPMENT_CATEGORY_ORDER.includes(e.category));
    if (uncategorized.length > 0) {
        grouped['misc'] = [...(grouped['misc'] ?? []), ...uncategorized];
    }

    // ── Mutations ──────────────────────────────────────────────────────────────
    const saveItem = (itemData) => {
        const all = char.equipment ?? [];
        if (panelItem?.id) {
            // Item existant avec id BDD
            setArr('equipment', all.map(e => e.id === panelItem.id ? { ...e, ...itemData } : e));
        } else if (panelItem && Object.keys(panelItem).length > 0) {
            // Item existant sans id (pas encore persisté) — comparaison par référence
            setArr('equipment', all.map(e => e === panelItem ? { ...e, ...itemData } : e));
        } else {
            // Nouvel item
            setArr('equipment', [...all, { slot: null, quantity: 1, ...itemData }]);
        }
        setPanelItem(null);
    };

    const removeItem = (item) => {
        setArr('equipment', (char.equipment ?? []).filter(e =>
            panelItem.id ? e.id !== panelItem.id : e !== panelItem
        ));
        setPanelItem(null);
    };

    const addFromCatalog = (itemData) => {
        setArr('equipment', [...(char.equipment ?? []), { slot: null, ...itemData }]);
        setShowCatalog(false);
    };

    // ── Rendu ──────────────────────────────────────────────────────────────────
    const hasItems = Object.keys(grouped).length > 0;

    return (
        <div>
            {/* En-tête section */}
            <div className="flex items-center justify-between mb-1 border-b border-default pb-1">
                <p className="dg-section-label text-base">16. ARMURE ET MATÉRIEL</p>
                {editMode && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPanelItem({})}
                            className="text-[10px] font-mono border border-default px-2 py-0.5 hover:border-accent hover:text-accent transition-colors"
                        >+ Ajouter</button>
                        <button
                            onClick={() => setShowCatalog(true)}
                            className="text-[10px] font-mono border border-default px-2 py-0.5 hover:border-accent hover:text-accent transition-colors"
                        >+ Catalogue</button>
                    </div>
                )}
            </div>

            <p className="text-xs text-muted font-mono italic mb-3">
                Les protections individuelles réduisent les dégâts de toutes les attaques,
                à l'exception des Attaques précises et des jets de Létalité réussis.
            </p>

            {!hasItems && !editMode && (
                <p className="text-sm text-muted font-mono italic">Aucun équipement.</p>
            )}

            {/* Groupes par catégorie */}
            {EQUIPMENT_CATEGORY_ORDER.filter(k => grouped[k]).map(catKey => {
                const catItems = grouped[catKey];
                const grid     = getGrid(catKey, editMode);
                const headers  = getHeaders(catKey);

                return (
                    <div key={catKey} className="mb-4">
                        {/* Sous-titre catégorie */}
                        <p className="dg-section-label text-[10px] uppercase tracking-widest text-muted mb-0.5 mt-2">
                            {EQUIPMENT_CATEGORY_LABELS[catKey]}
                        </p>

                        {/* En-têtes colonnes */}
                        <div className={`grid ${grid} gap-x-2 mb-0.5`}>
                            {headers.map(h => (
                                <span key={h} className="dg-section-label text-[9px]">{h}</span>
                            ))}
                            {editMode && <span />}
                        </div>

                        {/* Lignes */}
                        {catItems.map((item, i) => (
                            <div
                                key={item.id ?? i}
                                className={`grid ${grid} gap-x-2 border-b border-default/20 py-0.5 items-center min-h-[1.75rem]`}
                            >
                                {renderCells(item, catKey)}
                                {editMode && (
                                    <button
                                        onClick={() => setPanelItem(item)}
                                        className="text-muted hover:text-accent transition-colors text-sm"
                                        title="Éditer"
                                    >✎</button>
                                )}
                            </div>
                        ))}
                    </div>
                );
            })}

            {/* Panel édition */}
            {panelItem !== null && (
                <EquipmentEditPanel
                    item={panelItem}
                    onSave={saveItem}
                    onDelete={removeItem}
                    onClose={() => setPanelItem(null)}
                />
            )}

            {/* Catalogue */}
            {showCatalog && (
                <EquipmentCatalogModal
                    onAdd={addFromCatalog}
                    onClose={() => setShowCatalog(false)}
                />
            )}
        </div>
    );
};

export default EquipmentSection;