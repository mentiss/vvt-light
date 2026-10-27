// src/client/src/systems/deltagreen/components/modals/EquipmentCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue d'équipement Delta Green (section 16) sur la modale générique
// CatalogModal (documentations/spec_ui_catalogue.md D-14) : tableau à colonnes
// (désignation, catégorie, coût), filtre par catégorie, objet libre avec les
// champs d'édition (EquipmentFields). onAdd reçoit l'équipement prêt à ranger ;
// la modale reste ouverte après un ajout.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import { EQUIPMENT_CATALOG, EQUIPMENT_CATEGORY_LABELS } from '../../config.jsx';
import EquipmentFields, { equipmentToDraft, draftToEquipment } from '../ui/EquipmentFields.jsx';

const EXPENSE_SHORT = {
    Incidental: 'Incident.',
    Standard:   'Standard',
    Unusual:    'Inhab.',
    Major:      'Majeur',
    Extreme:    'Extrême',
};

const GRID = 'grid grid-cols-[45%_25%_20%] gap-x-3 items-center';

// Catalogue à plat, chaque objet avec sa catégorie
const ITEMS = EQUIPMENT_CATALOG.flatMap(cat => cat.items.map(item => ({ ...item, _catKey: cat.key })));

const FILTERS = [{
    key:      'category',
    getValue: it => it._catKey,
    options:  EQUIPMENT_CATALOG.map(cat => ({ value: cat.key, label: cat.label })),
}];

const LIST_HEADER = (
    <div className={GRID}>
        <span>Désignation</span><span>Catégorie</span><span>Coût</span>
    </div>
);

const renderItem = (item) => (
    <div className={GRID}>
        <div className="min-w-0">
            <span className="text-xs font-mono">
                {item.name}
                {item.is_restricted && <span className="dg-stamp dg-stamp-red ml-1 text-[8px] align-middle">R</span>}
            </span>
            {item.notes && <p className="text-[10px] text-muted font-mono leading-tight">{item.notes}</p>}
        </div>
        <span className="text-[10px] font-mono text-muted">{EQUIPMENT_CATEGORY_LABELS[item._catKey] ?? item._catKey}</span>
        <span className="text-xs font-mono text-muted">{EXPENSE_SHORT[item.expense] ?? item.expense}</span>
    </div>
);

const CUSTOM_DEFAULTS = equipmentToDraft();
const renderCustomForm = (props) => <EquipmentFields {...props} />;

/**
 * @param {Function} props.onAdd    (équipement) => void
 * @param {Function} props.onClose
 */
const EquipmentCatalogModal = ({ onAdd, onClose }) => (
    <CatalogModal
        title="Catalogue d'équipement"
        items={ITEMS}
        renderItem={renderItem}
        getKey={it => `${it._catKey}:${it.name}`}
        filters={FILTERS}
        listHeader={LIST_HEADER}
        onAdd={item => onAdd({
            name:            item.name,
            notes:           item.notes ?? '',
            category:        item._catKey,
            expense:         item.expense ?? 'Standard',
            isRestricted:    item.is_restricted ?? false,
            restrictionNote: '',
            quantity:        1,
            jsonDetails:     item.jsonDetails ?? {},
        })}
        onAddCustom={draft => onAdd({ ...draftToEquipment(draft), restrictionNote: '' })}
        customDefaults={CUSTOM_DEFAULTS}
        renderCustomForm={renderCustomForm}
        onClose={onClose}
    />
);

export default EquipmentCatalogModal;
