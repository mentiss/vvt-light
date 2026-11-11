// src/client/src/systems/dune/components/modals/DuneAssetCatalog.jsx
// Catalogue d'atouts (95 exemples du livre, par famille) et atout libre, sur la modale
// de catalogue générique. Sert à l'ajout sur la fiche et à l'envoi d'un atout par le MJ.
// onAdd reçoit un atout au format de la fiche : { nom, description, quantite, qualite, motsCles }.

import React from 'react';
import CatalogModal from '@/ui/catalog/CatalogModal.jsx';
import { DuneField } from '../ui/DuneFields.jsx';
import { ASSETS, ASSET_FAMILIES } from '../../config/assets.js';

export const QUALITIES = [0, 1, 2, 3, 4];

const CATALOG_FILTERS = [{
    key: 'family', getValue: a => a.family,
    options: ASSET_FAMILIES.map(f => ({ value: f.id, label: f.label })),
}];
const CATALOG_GROUP  = { getValue: a => a.group };
const CATALOG_SEARCH = ['name', 'keywords', 'description', 'asAsset'];
const CUSTOM_DEFAULTS = { name: '', description: '', qualite: null, motsCles: '' };

// Disposition de la planche (planche_dune.html §5) : familles en pills avec « Atout libre »
// au bout, puis la recherche (spec_ui_catalogue.md D-19)
const CATALOG_LAYOUT = ['filters', 'search'];
const CATALOG_LABELS = {
    customTab: 'Atout libre',
    search:    'Rechercher un atout…',
    countOne:  'atout',
    countMany: 'atouts',
    added:     'Atout ajouté',
};
const ASSETS_SUBTITLE =`Catalogue · ${ASSETS.length} exemples du livre`;

/** Qualité affichée au catalogue : valeur, fourchette du livre (« 3-4 »), sinon 0 (livre p. 192). */
const catalogQuality = (a) => a.quality ?? (/^\d/.test(a.qualityNote ?? '') ? a.qualityNote.split(' ')[0] : 0);

/** Atout de la fiche depuis une entrée du catalogue (sans qualité, le livre compte 0). */
const fromCatalog = (a) => ({
    nom:         a.name,
    description: [a.description, a.asAsset].filter(Boolean).join('\n\n'),
    quantite:    1,
    qualite:     a.quality ?? 0,
    motsCles:    a.keywords.join(', '),
});

/** Choix de la qualité : pills 0 à 4, et « — » (non renseignée). */
export const QualityPills = ({ value, onChange }) => (
    <div>
        <span className="vtt-field-label block mb-1">Qualité</span>
        <div className="flex flex-wrap gap-1.5">
            <button type="button" className={`vtt-pill${value == null ? ' is-selected' : ''}`} onClick={() => onChange(null)}>—</button>
            {QUALITIES.map(q => (
                <button key={q} type="button" className={`vtt-pill${value === q ? ' is-selected' : ''}`} onClick={() => onChange(q)}>{q}</button>
            ))}
        </div>
    </div>
);

const CatalogRow = ({ a }) => (
    <div>
        <div className="dn-item-name">
            {a.name}
            <span className="dn-q" title={a.qualityNote || undefined}>Q {catalogQuality(a)}</span>
            {a.keywords.slice(0, 4).map(k => <span key={k} className="dn-kw">{k}</span>)}
        </div>
        <div className="text-sm text-muted line-clamp-2">{a.asAsset || a.description}</div>
    </div>
);

const CustomForm = ({ value, onChange }) => (
    <div className="flex flex-col gap-3">
        <DuneField label="Nom" value={value.name} onChange={v => onChange({ name: v })} />
        <DuneField label="Description" rows={4} value={value.description} onChange={v => onChange({ description: v })} />
        <QualityPills value={value.qualite} onChange={q => onChange({ qualite: q })} />
        <DuneField label="Mots-clefs" value={value.motsCles} onChange={v => onChange({ motsCles: v })} placeholder="Arme, Fremen…" />
    </div>
);

/**
 * @param {string}   [props.title='Atouts']
 * @param {string}   [props.subtitle]
 * @param {Function} props.onAdd    (atout) => void
 * @param {Function} props.onClose
 */
const DuneAssetCatalog = ({ title = 'Atouts', subtitle = ASSETS_SUBTITLE, onAdd, onClose }) => (
    <CatalogModal
        title={title}
        subtitle={subtitle}
        labels={CATALOG_LABELS}
        layout={CATALOG_LAYOUT}
        tabsAs="pill"
        items={ASSETS}
        getKey={a => a.id}
        filters={CATALOG_FILTERS}
        groupBy={CATALOG_GROUP}
        searchFields={CATALOG_SEARCH}
        renderItem={a => <CatalogRow a={a} />}
        onAdd={a => onAdd(fromCatalog(a))}
        customDefaults={CUSTOM_DEFAULTS}
        renderCustomForm={props => <CustomForm {...props} />}
        onAddCustom={d => onAdd({ nom: d.name.trim(), description: d.description ?? '', quantite: 1, qualite: d.qualite ?? null, motsCles: d.motsCles ?? '' })}
        onClose={onClose}
    />
);

export default DuneAssetCatalog;
