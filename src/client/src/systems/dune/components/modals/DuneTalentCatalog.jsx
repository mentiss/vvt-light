// src/client/src/systems/dune/components/modals/DuneTalentCatalog.jsx
// Les 55 talents du livre (filtre par restriction) et le talent libre, sur la modale de
// catalogue générique détournée (Q-11). Sert à la fiche et à l'assistant de création.
// onAdd reçoit un talent au format de la fiche : { talentName, description }.

import React from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import { TALENTS, TALENT_RESTRICTIONS } from '../../config/talents.js';

export const RESTRICTION_LABELS = Object.fromEntries(TALENT_RESTRICTIONS.map(r => [r.id, r.label]));

/** Restriction d'un talent, retrouvée par son nom dans le catalogue (null si libre ou sans restriction). */
export const talentRestriction = (name) => {
    const t = TALENTS.find(x => x.name === name);
    return t?.restriction ? RESTRICTION_LABELS[t.restriction] : null;
};

const CATALOG_FILTERS = [{
    key: 'restriction', getValue: t => t.restriction ?? 'none',
    options: [{ value: 'none', label: 'Sans restriction' }, ...TALENT_RESTRICTIONS.map(r => ({ value: r.id, label: r.label }))],
}];
const CATALOG_SEARCH = ['name', 'description'];

const CatalogRow = ({ t }) => (
    <div>
        <div className="dn-item-name">
            {t.name}
            {t.restriction && <span className="dn-restr">{RESTRICTION_LABELS[t.restriction]}</span>}
        </div>
        <div className="text-sm text-muted line-clamp-2">{t.description}</div>
    </div>
);

/**
 * @param {Function} props.onAdd    (talent) => void
 * @param {Function} props.onClose
 */
const DuneTalentCatalog = ({ onAdd, onClose }) => (
    <CatalogModal
        title="Talents"
        subtitle="Talents du livre ou talent libre"
        items={TALENTS}
        getKey={t => t.id}
        filters={CATALOG_FILTERS}
        searchFields={CATALOG_SEARCH}
        renderItem={t => <CatalogRow t={t} />}
        onAdd={t => onAdd({ talentName: t.name, description: t.description })}
        onAddCustom={d => onAdd({ talentName: d.name.trim(), description: d.description ?? '' })}
        onClose={onClose}
    />
);

export default DuneTalentCatalog;
