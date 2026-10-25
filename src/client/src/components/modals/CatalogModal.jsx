// src/client/src/components/modals/CatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de catalogue générique (documentations/spec_ui_catalogue.md) : ajout
// d'un objet à un inventaire, depuis un catalogue ou en objet libre.
//
// La plateforme porte la fenêtre (Modal, grande et agrandissable, hauteur
// fixe : seule la liste défile), la recherche et les filtres (tools/catalog.js),
// la ligne cliquable avec son bouton + / ✓, les onglets et le formulaire de
// l'objet libre. Le slug fournit les objets, le contenu d'une ligne
// (renderItem, sans bouton : la ligne en est un), les champs de l'objet libre
// s'il en a besoin, et ce que fait l'ajout. La modale reste ouverte après un
// ajout (ajouts multiples).
//
// Classes vtt-catalog* stables : style par défaut dans index.css, habillage
// par le theme.css du slug.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { filterCatalog, filterOptions, groupCatalog } from '../../tools/catalog.js';

const ADDED_DELAY = 1500;   // durée du ✓ après un ajout (ms)

const DEFAULT_CUSTOM = { name: '', description: '' };
const defaultIsCustomValid = (draft) => !!draft.name?.trim();

// Formulaire de base de l'objet libre : nom et description
const DefaultCustomForm = ({ value, onChange }) => (
    <>
        <label className="block">
            <span className="vtt-field-label">Nom</span>
            <input className="vtt-input" value={value.name ?? ''} onChange={e => onChange({ name: e.target.value })} autoFocus />
        </label>
        <label className="block">
            <span className="vtt-field-label">Description</span>
            <textarea className="vtt-input" rows={4} value={value.description ?? ''} onChange={e => onChange({ description: e.target.value })} />
        </label>
    </>
);

const FilterRow = ({ options, value, onChange }) => (
    <div className="vtt-catalog-filters">
        <button type="button" onClick={() => onChange(null)} className={`vtt-pill ${value == null ? 'is-selected' : ''}`}>
            Tous
        </button>
        {options.map(opt => (
            <button
                type="button"
                key={String(opt.value)}
                onClick={() => onChange(value === opt.value ? null : opt.value)}
                className={`vtt-pill ${value === opt.value ? 'is-selected' : ''}`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

const CatalogItem = ({ added, onAdd, children }) => (
    <button type="button" onClick={onAdd} className={`vtt-catalog-item ${added ? 'is-added' : ''}`}>
        <div className="vtt-catalog-item-body">{children}</div>
        <span className="vtt-catalog-add" aria-hidden="true">{added ? '✓' : '+'}</span>
    </button>
);

const CatalogModal = ({
    title,
    subtitle,
    items,
    renderItem,
    onAdd,
    onClose,
    filters = [],
    groupBy,
    searchFields,
    listHeader,
    getKey = (item) => item.name,
    onAddCustom,
    renderCustomForm,
    customDefaults = DEFAULT_CUSTOM,
    isCustomValid = defaultIsCustomValid,
}) => {
    const formId = useId();
    const [tab,         setTab]         = useState('catalog');   // 'catalog' | 'custom'
    const [query,       setQuery]       = useState('');
    const [selected,    setSelected]    = useState({});          // valeur choisie par rangée de filtres
    const [added,       setAdded]       = useState(() => new Set());
    const [draft,       setDraft]       = useState(customDefaults);
    const [customAdded, setCustomAdded] = useState(false);
    const timersRef = useRef([]);

    // Minuteries du ✓ annulées à la fermeture
    useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

    const later = (fn) => { timersRef.current.push(setTimeout(fn, ADDED_DELAY)); };

    const rows = useMemo(
        () => filters.map(f => ({ ...f, options: filterOptions(items, f) })),
        [items, filters],
    );

    const filtered = useMemo(
        () => filterCatalog(items, { query, filters, selected, searchFields }),
        [items, query, filters, selected, searchFields],
    );

    const groups = useMemo(
        () => (groupBy ? groupCatalog(filtered, groupBy.getValue) : null),
        [filtered, groupBy],
    );

    const handleAdd = (item) => {
        onAdd(item);
        const key = getKey(item);
        setAdded(prev => new Set(prev).add(key));
        later(() => setAdded(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        }));
    };

    const canAddCustom = isCustomValid(draft);
    const handleAddCustom = (e) => {
        e.preventDefault();
        if (!canAddCustom) return;
        onAddCustom(draft);
        setDraft(customDefaults);
        setCustomAdded(true);
        later(() => setCustomAdded(false));
    };

    const renderRow = (item) => {
        const key = getKey(item);
        return (
            <CatalogItem key={key} added={added.has(key)} onAdd={() => handleAdd(item)}>
                {renderItem(item)}
            </CatalogItem>
        );
    };

    const isCustomTab = tab === 'custom';

    const footer = isCustomTab ? (
        <>
            {customAdded && <span className="vtt-catalog-count mr-auto">✓ Objet ajouté</span>}
            <button type="submit" form={formId} className="vtt-btn vtt-btn-primary" disabled={!canAddCustom}>
                Ajouter
            </button>
        </>
    ) : (
        <span className="vtt-catalog-count mr-auto">
            {filtered.length} objet{filtered.length > 1 ? 's' : ''}
        </span>
    );

    return (
        <Modal onClose={onClose} title={title} subtitle={subtitle} size="lg" expandable className="vtt-catalog h-full" footer={footer}>
            <div className="flex flex-col h-full min-h-0 gap-3">
                {onAddCustom && (
                    <div className="vtt-segmented vtt-catalog-tabs shrink-0">
                        <button type="button" onClick={() => setTab('catalog')} className={`vtt-segment ${!isCustomTab ? 'is-active' : ''}`}>
                            Catalogue
                        </button>
                        <button type="button" onClick={() => setTab('custom')} className={`vtt-segment ${isCustomTab ? 'is-active' : ''}`}>
                            Objet libre
                        </button>
                    </div>
                )}

                {isCustomTab ? (
                    <form id={formId} onSubmit={handleAddCustom} className="vtt-catalog-custom">
                        {renderCustomForm
                            ? renderCustomForm({ value: draft, onChange: patch => setDraft(prev => ({ ...prev, ...patch })) })
                            : <DefaultCustomForm value={draft} onChange={patch => setDraft(prev => ({ ...prev, ...patch }))} />}
                    </form>
                ) : (
                    <>
                        <div className="vtt-catalog-controls shrink-0 flex flex-col gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Rechercher…"
                                autoFocus
                                className="vtt-input vtt-catalog-search"
                            />
                            {rows.map(row => row.options.length > 0 && (
                                <FilterRow
                                    key={row.key}
                                    options={row.options}
                                    value={selected[row.key] ?? null}
                                    onChange={value => setSelected(prev => ({ ...prev, [row.key]: value }))}
                                />
                            ))}
                        </div>

                        <div className="vtt-catalog-list vtt-scroll">
                            {listHeader && <div className="vtt-catalog-list-header">{listHeader}</div>}
                            {filtered.length === 0 && <p className="vtt-catalog-empty">Aucun résultat.</p>}
                            {groups
                                ? groups.map(group => (
                                    <div key={String(group.value)}>
                                        <div className="vtt-catalog-group">{groupBy.getLabel?.(group.value) ?? group.value}</div>
                                        {group.items.map(renderRow)}
                                    </div>
                                ))
                                : filtered.map(renderRow)}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default CatalogModal;
