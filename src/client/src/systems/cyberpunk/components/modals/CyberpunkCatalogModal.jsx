// src/client/src/systems/cyberpunk/components/modals/CyberpunkCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Catalogues Cyberpunk (cyberware, inventaire) sur la modale générique
// CatalogModal (documentations/spec_ui_catalogue.md) : filtre et intertitres
// par catégorie, rendu d'une entrée (description, option, tags), objet libre
// avec tags. onAdd reçoit l'objet prêt à ranger dans le personnage
// (cyberware ou items), l'appelant l'enregistre (fiche ou TabSession MJ).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import { CYBERWARE_ALL, ITEMS_ALL, ITEM_AND_CYBERWARE_CATEGORY_LABEL, TAG_VARIANT_CLASS } from '../../config.jsx';
import { Tag, TagAdder } from '../layout/TagManager.jsx';

const categoryLabel = (cat) => ITEM_AND_CYBERWARE_CATEGORY_LABEL[cat] ?? cat;

// Des noms reviennent dans le catalogue d'inventaire avec des contenus
// différents : la position dans le catalogue (statique) sert d'identifiant.
const keysOf = (list) => new Map(list.map((it, i) => [it, i]));

const KINDS = {
    cyberware: {
        title: 'Cyberware',
        items: CYBERWARE_ALL,
        keys:  keysOf(CYBERWARE_ALL),
        toEntry: ({ name, description = '', tags }) => ({ name, option_text: '', notes: description, tags }),
    },
    items: {
        title: 'Inventaire',
        items: ITEMS_ALL,
        keys:  keysOf(ITEMS_ALL),
        toEntry: ({ name, description = '', tags }) => ({ name, description, quantity: 1, tags }),
    },
};

const FILTERS = Object.fromEntries(Object.entries(KINDS).map(([kind, { items }]) => [kind, [{
    key:      'category',
    getValue: it => it.category,
    options:  [...new Set(items.map(it => it.category))].map(cat => ({ value: cat, label: categoryLabel(cat) })),
}]]));

const GROUP_BY = { getValue: it => it.category, getLabel: categoryLabel };

const CUSTOM_DEFAULTS = { name: '', description: '', tags: [] };

const toTags = (tags) => tags.map(t => ({ tag_text: t.text, tag_variant: t.variant }));

const renderItem = (item) => (
    <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{item.name}</span>
        {item.description && <span className="text-xs leading-relaxed text-muted">{item.description}</span>}
        {item.optionHint && <span className="text-xs italic text-accent">{item.optionHint}</span>}
        {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
                {item.tags.map(t => (
                    <span key={t.text} className={`cp-tag ${TAG_VARIANT_CLASS[t.variant] ?? 'cp-tag-neutral'}`}>{t.text}</span>
                ))}
            </div>
        )}
    </div>
);

// Objet libre : nom, description (notes pour le cyberware) et tags
const CustomForm = ({ value, onChange, kind }) => (
    <>
        <label className="block">
            <span className="vtt-field-label">Nom</span>
            <input className="vtt-input" value={value.name} onChange={e => onChange({ name: e.target.value })} autoFocus />
        </label>
        <label className="block">
            <span className="vtt-field-label">{kind === 'cyberware' ? 'Notes' : 'Description'}</span>
            <textarea className="vtt-input" rows={3} value={value.description} onChange={e => onChange({ description: e.target.value })} />
        </label>
        <div>
            <span className="vtt-field-label">Tags</span>
            {value.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {value.tags.map((t, i) => (
                        <Tag key={`${t.tag_text}-${t.tag_variant}`} tag={t} alwaysRemovable
                             onRemove={() => onChange({ tags: value.tags.filter((_, j) => j !== i) })} />
                    ))}
                </div>
            )}
            <TagAdder
                entityType={kind === 'cyberware' ? 'cyberware' : 'item'}
                existingTags={value.tags}
                onAdd={(text, variant) => {
                    if (value.tags.some(t => t.tag_text === text)) return;
                    onChange({ tags: [...value.tags, { tag_text: text, tag_variant: variant }] });
                }}
            />
        </div>
    </>
);

/**
 * @param {'cyberware'|'items'} props.kind
 * @param {Function} props.onAdd    (entry) => void, entrée prête pour character.cyberware / character.items
 * @param {Function} props.onClose
 */
const CyberpunkCatalogModal = ({ kind, onAdd, onClose }) => {
    const { title, items, keys, toEntry } = KINDS[kind];
    return (
        <CatalogModal
            title={title}
            items={items}
            renderItem={renderItem}
            getKey={it => keys.get(it)}
            filters={FILTERS[kind]}
            groupBy={GROUP_BY}
            onAdd={it => onAdd(toEntry({ name: it.name, tags: toTags(it.tags ?? []) }))}
            onAddCustom={draft => onAdd(toEntry({ ...draft, name: draft.name.trim() }))}
            customDefaults={CUSTOM_DEFAULTS}
            renderCustomForm={props => <CustomForm {...props} kind={kind} />}
            onClose={onClose}
        />
    );
};

export default CyberpunkCatalogModal;
