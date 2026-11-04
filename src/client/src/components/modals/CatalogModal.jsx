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
// ajout (ajouts multiples). Sans objets de catalogue (items vide ou absent),
// c'est une modale d'ajout libre : le formulaire seul, sans onglets.
//
// Réglages du slug (D-19) : `labels` remplace les textes (talents, atouts…),
// `layout` ordonne les blocs du haut ('tabs', 'search', 'filters'), `tabsAs:
// 'pill'` fait de l'entrée libre la dernière pill de la première rangée de
// filtres. Sur l'onglet libre, un bloc placé avant les onglets (ou toute la
// rangée en mode pill) reste en place, grisé pour la recherche.
//
// Classes vtt-catalog* stables : style par défaut dans index.css, habillage
// par le theme.css du slug.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { filterCatalog, filterOptions, groupCatalog } from '../../tools/catalog.js';

const ADDED_DELAY = 1500;   // durée du ✓ après un ajout (ms)

const NO_ITEMS = [];
const DEFAULT_CUSTOM = { name: '', description: '' };
const DEFAULT_LAYOUT = ['tabs', 'search', 'filters'];

// Textes par défaut ; `all: null` masque la pill « Tous »
const DEFAULT_LABELS = {
    catalogTab: 'Catalogue',
    customTab:  'Objet libre',
    search:     'Rechercher…',
    all:        'Tous',
    empty:      'Aucun résultat.',
    countOne:   'objet',
    countMany:  'objets',
    added:      'Objet ajouté',
    add:        'Ajouter',
};
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

// Rangée de filtres ; `active` faux (onglet libre) : aucune pill n'est montrée choisie.
// `trailing` : pill ajoutée en bout de rangée (entrée libre en mode pill).
const FilterRow = ({ options, value, onChange, allLabel, active = true, trailing }) => (
    <div className="vtt-catalog-filters">
        {allLabel != null && (
            <button type="button" onClick={() => onChange(null)} className={`vtt-pill ${active && value == null ? 'is-selected' : ''}`}>
                {allLabel}
            </button>
        )}
        {options.map(opt => (
            <button
                type="button"
                key={String(opt.value)}
                onClick={() => onChange(active && value === opt.value ? null : opt.value)}
                className={`vtt-pill ${active && value === opt.value ? 'is-selected' : ''}`}
            >
                {opt.label}
            </button>
        ))}
        {trailing}
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
    items = NO_ITEMS,
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
    labels: labelOverrides,
    layout = DEFAULT_LAYOUT,
    tabsAs = 'tabs',
}) => {
    const labels = { ...DEFAULT_LABELS, ...labelOverrides };
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

    // Sans objets de catalogue : modale d'ajout libre seule, sans onglets ni hauteur fixe
    const hasCatalog  = items.length > 0;
    const isCustomTab = !hasCatalog || tab === 'custom';
    const hasTabs     = !!onAddCustom && hasCatalog;
    const tabsAsPill  = hasTabs && tabsAs === 'pill';

    // Blocs du haut, dans l'ordre du slug. En mode pill, l'entrée libre vit dans la
    // première rangée de filtres : pas de bloc d'onglets séparé.
    const visibleRows = rows.filter(row => row.options.length > 0);
    const blocks = layout.filter(b => {
        if (b === 'tabs')    return hasTabs && !tabsAsPill;
        if (b === 'filters') return visibleRows.length > 0 || tabsAsPill;
        return true;
    });
    const tabsIndex = blocks.indexOf('tabs');
    // Sur l'onglet libre : un bloc placé avant les onglets reste (rien ne bouge),
    // la rangée qui porte la pill libre aussi ; le reste disparaît comme avant.
    const showOnCustom = (block, index) =>
        block === 'tabs' || (tabsIndex >= 0 && index < tabsIndex) || (tabsAsPill && block === 'filters');
    const shownBlocks = blocks.filter((b, i) => !isCustomTab || showOnCustom(b, i));
    // Onglets séparés en premier : hors du cadre (comme avant) ; sinon tout est dans le cadre
    const tabsOutside = shownBlocks[0] === 'tabs';

    const pickFilter = (key, value) => {
        setTab('catalog');
        setSelected(prev => ({ ...prev, [key]: value }));
    };

    const customPill = tabsAsPill && (
        <button type="button" onClick={() => setTab('custom')} className={`vtt-pill ${isCustomTab ? 'is-selected' : ''}`}>
            {labels.customTab}
        </button>
    );

    const renderBlock = (block) => {
        if (block === 'tabs') return (
            <div key="tabs" className="vtt-segmented vtt-catalog-tabs shrink-0">
                <button type="button" onClick={() => setTab('catalog')} className={`vtt-segment ${!isCustomTab ? 'is-active' : ''}`}>
                    {labels.catalogTab}
                </button>
                <button type="button" onClick={() => setTab('custom')} className={`vtt-segment ${isCustomTab ? 'is-active' : ''}`}>
                    {labels.customTab}
                </button>
            </div>
        );
        if (block === 'search') return (
            <input
                key="search"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={labels.search}
                autoFocus={!isCustomTab}
                disabled={isCustomTab}
                className="vtt-input vtt-catalog-search"
            />
        );
        // Filtres : la pill libre (mode pill) s'ajoute à la première rangée, même sans filtre déclaré
        if (visibleRows.length === 0) return <div key="filters" className="vtt-catalog-filters">{customPill}</div>;
        return (
            <React.Fragment key="filters">
                {visibleRows.map((row, i) => (
                    <FilterRow
                        key={row.key}
                        options={row.options}
                        value={selected[row.key] ?? null}
                        onChange={value => pickFilter(row.key, value)}
                        allLabel={labels.all}
                        active={!isCustomTab}
                        trailing={i === 0 ? customPill : null}
                    />
                ))}
            </React.Fragment>
        );
    };

    const footer = isCustomTab ? (
        <>
            {customAdded && <span className="vtt-catalog-count mr-auto">✓ {labels.added}</span>}
            <button type="submit" form={formId} className="vtt-btn vtt-btn-primary" disabled={!canAddCustom}>
                {labels.add}
            </button>
        </>
    ) : (
        <span className="vtt-catalog-count mr-auto">
            {filtered.length} {filtered.length > 1 ? labels.countMany : labels.countOne}
        </span>
    );

    const framed = tabsOutside ? shownBlocks.slice(1) : shownBlocks;

    return (
        <Modal onClose={onClose} title={title} subtitle={subtitle} size="lg" expandable
               className={`vtt-catalog ${hasCatalog ? 'h-full' : ''}`} footer={footer}>
            <div className="flex flex-col h-full min-h-0 gap-3">
                {hasCatalog && tabsOutside && renderBlock('tabs')}
                {hasCatalog && framed.length > 0 && (
                    <div className="vtt-catalog-controls shrink-0 flex flex-col gap-2">
                        {framed.map(renderBlock)}
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
                        <div className="vtt-catalog-list vtt-scroll">
                            {listHeader && <div className="vtt-catalog-list-header">{listHeader}</div>}
                            {filtered.length === 0 && <p className="vtt-catalog-empty">{labels.empty}</p>}
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
