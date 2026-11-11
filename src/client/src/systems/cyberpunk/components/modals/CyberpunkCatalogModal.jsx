// src/client/src/systems/cyberpunk/components/modals/CyberpunkCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Catalogues Cyberpunk (cyberware, inventaire) sur la modale générique
// CatalogModal (documentations/spec_ui_catalogue.md) : filtre et intertitres
// par catégorie, rendu d'une entrée (description, option, tags), objet libre
// avec tags. onAdd reçoit l'objet prêt à ranger dans le personnage
// (cyberware ou items), l'appelant l'enregistre (fiche ou TabSession MJ).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CatalogModal from '@/ui/catalog/CatalogModal.jsx';
import Modal from '@/ui/modal/Modal.jsx';
import { CYBERWARE_ALL, ITEMS_ALL, ITEM_AND_CYBERWARE_CATEGORY_LABEL, TAG_VARIANT_CLASS, tagChoicesOf, chosenOptions } from '../../config.jsx';
import { TagList } from '../layout/TagManager.jsx';
import { TagChoices } from '../creation/CreationParts.jsx';

const categoryLabel = (cat) => ITEM_AND_CYBERWARE_CATEGORY_LABEL[cat] ?? cat;

// Des noms reviennent dans le catalogue d'inventaire avec des contenus
// différents : la position dans le catalogue (statique) sert d'identifiant.
const keysOf = (list) => new Map(list.map((it, i) => [it, i]));

const KINDS = {
    cyberware: {
        title: 'Cyberware',
        items: CYBERWARE_ALL,
        keys:  keysOf(CYBERWARE_ALL),
        toEntry: ({ name, description = '', tags, option = '' }) => ({ name, option_text: option, notes: description, tags }),
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

// Options imposées d'un élément (spec_cyberpunk.md §9.7) : choisies avant l'ajout,
// comme à la création ; une variante ou un modèle remplit le champ « option »
const ChoicesModal = ({ item, onConfirm, onCancel }) => {
    const [value, setValue] = useState({});
    const choices = tagChoicesOf(item);
    const complete = choices.every(c => (value[c.label]?.length ?? 0) >= c.pick);
    return (
        <Modal title={item.name} size="sm" alert onClose={onCancel}
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onCancel}>Annuler</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={!complete} onClick={() => onConfirm(value)}>Ajouter</button>
               </>}>
            <div className="flex flex-col gap-2">
                <TagChoices choices={choices} value={value} onChange={(label, v) => setValue(prev => ({ ...prev, [label]: v }))} />
            </div>
        </Modal>
    );
};

const renderItem = (item) => (
    <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{item.name}</span>
        {item.description && <span className="text-xs leading-relaxed text-muted">{item.description}</span>}
        {item.optionHint && <span className="text-xs italic text-accent">{item.optionHint}</span>}
        {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
                {item.tags.map(t => (
                    <span key={t.text} className={`cp-tag ${TAG_VARIANT_CLASS[t.variant] ?? 'is-neutral'}`}>{t.text}</span>
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
            <TagList
                tags={value.tags}
                entityType={kind === 'cyberware' ? 'cyberware' : 'item'}
                onAdd={(text, variant) => {
                    if (value.tags.some(t => t.tag_text === text)) return;
                    onChange({ tags: [...value.tags, { tag_text: text, tag_variant: variant }] });
                }}
                onRemove={(i) => onChange({ tags: value.tags.filter((_, j) => j !== i) })}
                onChangeVariant={(i, v) => onChange({ tags: value.tags.map((t, j) => (j === i ? { ...t, tag_variant: v } : t)) })}
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
    const [pending, setPending] = useState(null);   // élément à options, en attente de son choix
    const add = (it, choices = {}) => {
        const chosen = tagChoicesOf(it).flatMap(c => (choices[c.label] ?? []).map(text => c.from.find(f => f.text === text) ?? { text, variant: 'neutral' }));
        onAdd(toEntry({ name: it.name, tags: toTags([...(it.tags ?? []), ...chosen]), option: chosenOptions(it, { choices }).join(', ') }));
    };
    return (
        <>
        {pending && <ChoicesModal item={pending} onCancel={() => setPending(null)} onConfirm={(choices) => { add(pending, choices); setPending(null); }} />}
        <CatalogModal
            title={title}
            items={items}
            renderItem={renderItem}
            getKey={it => keys.get(it)}
            filters={FILTERS[kind]}
            groupBy={GROUP_BY}
            onAdd={it => (tagChoicesOf(it).length ? setPending(it) : add(it))}
            onAddCustom={draft => onAdd(toEntry({ ...draft, name: draft.name.trim() }))}
            customDefaults={CUSTOM_DEFAULTS}
            renderCustomForm={props => <CustomForm {...props} kind={kind} />}
            onClose={onClose}
        />
        </>
    );
};

export default CyberpunkCatalogModal;
