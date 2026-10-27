// src/client/src/systems/deltagreen/components/modals/WeaponCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue d'armement Delta Green (section 17) sur la modale générique
// CatalogModal (documentations/spec_ui_catalogue.md D-14) : tableau à colonnes,
// filtre par catégorie, objet libre avec les champs d'édition (WeaponFields).
// Un ajout va dans le prochain emplacement libre ; si les 7 sont pris, le
// choix de l'emplacement à remplacer s'ouvre par-dessus (D-5). La modale reste
// ouverte après un ajout.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import Modal from '../../../../components/ui/Modal.jsx';
import { WEAPON_CATALOG } from '../../config.jsx';
import WeaponFields, { weaponToDraft, draftToWeapon } from '../ui/WeaponFields.jsx';

const SLOTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const GRID = 'grid grid-cols-[34%_20%_12%_12%_10%_10%] gap-x-2 items-center';

// Catalogue à plat, chaque arme avec sa catégorie
const ITEMS = WEAPON_CATALOG.flatMap(cat => cat.items.map(item => ({ ...item, _catKey: cat.key })));

const FILTERS = [{
    key:      'category',
    getValue: it => it._catKey,
    options:  WEAPON_CATALOG.map(cat => ({ value: cat.key, label: cat.label })),
}];

const LIST_HEADER = (
    <div className={GRID}>
        <span>Arme</span><span>Comp.</span><span>Portée</span><span>Dégâts</span><span>Perf.</span><span>Létal.</span>
    </div>
);

const Cell = ({ children }) => <span className="text-xs font-mono text-muted">{children ?? '—'}</span>;

const renderItem = (item) => (
    <div className={GRID}>
        <div className="min-w-0">
            <span className="text-xs font-mono">{item.name}</span>
            {item.is_restricted && <span className="dg-stamp dg-stamp-red ml-1 text-[8px]">R</span>}
            {item.notes && <p className="text-[10px] text-muted font-mono leading-tight">{item.notes}</p>}
        </div>
        <Cell>{item.skill_label}</Cell>
        <Cell>{item.range}</Cell>
        <Cell>{item.damage ? item.damage.toUpperCase() : null}</Cell>
        <Cell>{item.armor_piercing}</Cell>
        <Cell>{item.lethality != null ? `${item.lethality}%` : null}</Cell>
    </div>
);

// Arme du catalogue → forme enregistrée (munitions pleines)
const fromCatalog = (item) => ({
    name:            item.name,
    category:        'weapon',
    expense:         item.expense ?? 'Standard',
    isRestricted:    item.is_restricted ?? false,
    restrictionNote: item.restriction_note ?? '',
    notes:           item.notes ?? '',
    jsonDetails: {
        skill_ref:      item.skill_ref ?? null,
        range:          item.range ?? null,
        damage:         item.damage ?? null,
        armor_piercing: item.armor_piercing ?? null,
        lethality:      item.lethality ?? null,
        ammo_capacity:  item.ammo_capacity ?? null,
        ammo_current:   item.ammo_capacity ?? null,
    },
});

const CUSTOM_DEFAULTS = weaponToDraft();

/**
 * @param {object[]} props.existingWeapons  armes déjà en emplacement
 * @param {object}   props.char             personnage (compétences de l'objet libre)
 * @param {Function} props.onAdd            (arme, emplacement) => void
 * @param {Function} props.onClose
 */
const WeaponCatalogModal = ({ existingWeapons, char, onAdd, onClose }) => {
    const [replaceFor, setReplaceFor] = useState(null);   // arme en attente d'un emplacement

    const freeSlots = SLOTS.filter(s => !existingWeapons.some(w => w.slot === s));

    const place = (weapon) => {
        if (freeSlots.length > 0) onAdd(weapon, freeSlots[0]);
        else setReplaceFor(weapon);
    };

    return (
        <>
            <CatalogModal
                title="Catalogue d'armement"
                items={ITEMS}
                renderItem={renderItem}
                getKey={it => `${it._catKey}:${it.name}`}
                filters={FILTERS}
                listHeader={LIST_HEADER}
                onAdd={item => place(fromCatalog(item))}
                onAddCustom={draft => place(draftToWeapon(draft))}
                customDefaults={CUSTOM_DEFAULTS}
                renderCustomForm={props => <WeaponFields {...props} char={char} />}
                onClose={onClose}
            />

            {/* Tous les emplacements pris : choisir celui à remplacer */}
            {replaceFor && (
                <Modal onClose={() => setReplaceFor(null)} title="Emplacements complets" subtitle={replaceFor.name} size="sm"
                       footer={<button type="button" onClick={() => setReplaceFor(null)} className="vtt-btn">Annuler</button>}>
                    <p className="text-sm mb-3">Les 7 emplacements sont occupés. Remplacer :</p>
                    <div className="flex flex-col gap-1.5">
                        {SLOTS.map(slot => (
                            <button key={slot} type="button" className="vtt-list-item"
                                    onClick={() => { onAdd(replaceFor, slot); setReplaceFor(null); }}>
                                <span className="font-mono text-xs text-muted">({slot})</span>
                                <span className="text-sm">{existingWeapons.find(w => w.slot === slot)?.name || '—'}</span>
                            </button>
                        ))}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default WeaponCatalogModal;
