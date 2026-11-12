// src/client/src/features/npc/NpcLibrary.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque des PNJ, colonne de l'onglet (spec_pnj.md §6.5, §6.7) : recherche,
// filtre par étiquettes (plusieurs à la fois, bloc repliable), une ligne par fiche
// (crayon et corbeille en haut à gauche, étiquettes, quantité et « À la table »),
// clic = lire la fiche, glisser vers la table = ajouter.
//
// <NpcLibrary npcs summary={npc => …} canAdd onOpen onEdit onDelete onAdd(npc, qty)
//             onNew onCollapse collapseIcon tagsOpen onToggleTags
//             wide? onToggleWide? widenIcon?   (colonne élargie, §11 ; sans onToggleWide : pas de bouton)
//             tagGroups={[{ label: 'Rang', tags: ['Mineur', 'Notable', 'Majeur'] }, …]}
//             selectedTags onSelectedTagsChange(list)   (sélection gardée par l'appelant)
//             hiddenTags={['Mineur', …]} />            (filtrables, mais pas affichées sur les lignes)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import NpcAvatar, { npcName } from './NpcAvatar.jsx';
import { filterNpcs, tagCounts } from './tools/npcFilter.js';

export const NPC_DRAG_TYPE = 'application/x-vtt-npc';

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
);

// Une fiche de la bibliothèque
const NpcRow = ({ npc, summary, canAdd, onOpen, onEdit, onDelete, onAdd, hiddenTags }) => {
    const rowTags = (npc.tags ?? []).filter(t => !hiddenTags.includes(t));
    const [quantity, setQuantity] = useState(1);
    const [dragging, setDragging] = useState(false);
    const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
    return (
        <div className={`vtt-list-item vtt-npc-row${dragging ? ' is-dragging' : ''}`} role="button" tabIndex={0}
             draggable={canAdd} title="Cliquer : lire la fiche · glisser vers la table : ajouter"
             onClick={() => onOpen(npc)} onKeyDown={e => { if (e.key === 'Enter') onOpen(npc); }}
             onDragStart={e => { e.dataTransfer.setData(NPC_DRAG_TYPE, JSON.stringify({ id: npc.id, quantity })); e.dataTransfer.effectAllowed = 'copy'; setDragging(true); }}
             onDragEnd={() => setDragging(false)}>
            <NpcAvatar npc={npc} />
            <div className="vtt-npc-row-body">
                {/* Nom, puis Modifier / Supprimer à droite sur la même ligne */}
                <div className="vtt-npc-row-head">
                    <div className="vtt-npc-name">{npcName(npc)} {npc.role && <small>{npc.role}</small>}</div>
                    <span className="vtt-npc-row-tools">
                        <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" title="Modifier la fiche" aria-label="Modifier la fiche" onClick={stop(() => onEdit(npc))}>✎</button>
                        <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" title="Supprimer la fiche" aria-label="Supprimer la fiche" onClick={stop(() => onDelete(npc))}><TrashIcon /></button>
                    </span>
                </div>
                {summary && <div className="vtt-npc-summary">{summary(npc)}</div>}
                {rowTags.length > 0 && <div className="vtt-npc-tags">{rowTags.map(t => <span key={t} className="vtt-tag">{t}</span>)}</div>}
            </div>
            {canAdd && (
                <span className="vtt-npc-qty" onClick={e => e.stopPropagation()}>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" aria-label="Un de moins" disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <b>{quantity}</b>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" aria-label="Un de plus" disabled={quantity >= 20} onClick={() => setQuantity(q => Math.min(20, q + 1))}>+</button>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => onAdd(npc, quantity)}>À la table</button>
                </span>
            )}
        </div>
    );
};

// Filtre par étiquettes (spec_pnj.md §6.7) : groupes déclarés par le slug d'abord (ex. Rang),
// puis « Autres ». Dans un groupe, les étiquettes choisies s'additionnent (Mineur + Notable) ;
// entre groupes, et pour les autres étiquettes, une fiche doit toutes les avoir. Le nombre
// d'une étiquette = fiches obtenues en l'ajoutant au filtre en cours ; 0 : grisée.
// Repliable : replié, seules les étiquettes choisies restent visibles.
const TagPills = ({ tags, counts, selected, onToggle }) => (
    <div className="vtt-catalog-filters vtt-npc-tagfilter-list">
        {tags.map(t => {
            const on = selected.includes(t);
            const count = counts.get(t) ?? 0;
            return (
                <button key={t} type="button" className={`vtt-pill${on ? ' is-selected' : ''}${!on && count === 0 ? ' is-empty' : ''}`}
                        aria-pressed={on} disabled={!on && count === 0} onClick={() => onToggle(t)}>
                    {t} <small>{count}</small>
                </button>
            );
        })}
    </div>
);

const TagFilter = ({ groups, counts, selected, onToggle, onClear, open, onToggleOpen }) => (
    <div className="vtt-npc-tagfilter">
        <div className="vtt-npc-tagfilter-head">
            <button type="button" className="vtt-npc-tagfilter-toggle" aria-expanded={open} onClick={onToggleOpen}>
                <span aria-hidden="true">{open ? '▾' : '▸'}</span> Étiquettes
                {selected.length > 0 && <small> · {selected.length} choisie{selected.length > 1 ? 's' : ''}</small>}
            </button>
            {selected.length > 0 && <button type="button" className="vtt-btn vtt-btn-sm" onClick={onClear}>Tout afficher</button>}
        </div>
        {groups.map(g => {
            const tags = open ? g.tags : g.tags.filter(t => selected.includes(t));
            if (!tags.length) return null;
            return (
                <div key={g.label} className="vtt-npc-tagfilter-group">
                    {open && groups.length > 1 && <span className="vtt-npc-tagfilter-label">{g.label}</span>}
                    <TagPills tags={tags} counts={counts} selected={selected} onToggle={onToggle} />
                </div>
            );
        })}
    </div>
);

const NO_GROUPS = [];

const NpcLibrary = ({ npcs, summary = null, canAdd = false, loading = false, onOpen, onEdit, onDelete, onAdd, onNew, onCollapse, collapseIcon,
                      tagsOpen = true, onToggleTags, tagGroups = NO_GROUPS, selectedTags: storedTags = NO_GROUPS, onSelectedTagsChange,
                      hiddenTags = NO_GROUPS, wide = false, onToggleWide = null, widenIcon = '»' }) => {
    const [search, setSearch] = useState('');
    const query = search.trim().toLowerCase();
    const matches = (n) => !query || `${npcName(n)} ${n.role ?? ''} ${(n.tags ?? []).join(' ')}`.toLowerCase().includes(query);

    // Étiquettes présentes : groupes du slug (dans leur ordre), puis les autres, les plus fréquentes d'abord
    const { groups, groupOf, total } = useMemo(() => {
        const totals = new Map();
        for (const t of npcs.flatMap(n => n.tags ?? [])) totals.set(t, (totals.get(t) ?? 0) + 1);
        const map = new Map();
        const declared = tagGroups.map((g, gi) => {
            const present = g.tags.filter(t => totals.has(t) && !map.has(t));
            present.forEach(t => map.set(t, gi));
            return { label: g.label, tags: present };
        });
        const others = [...totals.keys()].filter(t => !map.has(t))
            .sort((a, b) => totals.get(b) - totals.get(a) || a.localeCompare(b, 'fr'));
        const list = [...declared, { label: 'Autres', tags: others }].filter(g => g.tags.length);
        return { groups: list, groupOf: map, total: totals };
    }, [npcs, tagGroups]);

    // Sélection gardée par slug (TabNpcs) ; une étiquette qui n'existe plus est ignorée
    const selectedTags = storedTags.filter(t => total.has(t));
    const setSelectedTags = (update) => onSelectedTagsChange(update(selectedTags));
    const filter = { matches, groupOf, groupCount: tagGroups.length, selected: selectedTags };
    const shown = filterNpcs(npcs, filter);
    const counts = tagCounts(npcs, filter, total.keys());
    const toggleTag = (t) => setSelectedTags(list => (list.includes(t) ? list.filter(x => x !== t) : [...list, t]));

    return (
        <section className="vtt-panel vtt-npc-zone vtt-npc-aside vtt-npc-library vtt-scroll">
            <div className="vtt-npc-zone-head">
                <h2 className="vtt-section-title">Bibliothèque · {shown.length < npcs.length ? `${shown.length} / ` : ''}{npcs.length}</h2>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={onNew}>Nouvelle fiche</button>
                {onToggleWide && (
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" onClick={onToggleWide} aria-pressed={wide}
                            title={wide ? 'Rétrécir la colonne' : 'Élargir la colonne'} aria-label={wide ? 'Rétrécir la colonne' : 'Élargir la colonne'}>{widenIcon}</button>
                )}
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" onClick={onCollapse} title="Replier la bibliothèque" aria-label="Replier la bibliothèque">{collapseIcon}</button>
            </div>
            <input className="vtt-input vtt-catalog-search" type="search" value={search} placeholder="Rechercher un PNJ, une créature…"
                   aria-label="Rechercher dans la bibliothèque" onChange={e => setSearch(e.target.value)} />
            {groups.length > 0 && (
                <TagFilter groups={groups} counts={counts} selected={selectedTags} onToggle={toggleTag} onClear={() => setSelectedTags(() => [])}
                           open={tagsOpen} onToggleOpen={onToggleTags} />
            )}
            <div className="vtt-npc-list">
                {loading && <p className="vtt-npc-empty">Chargement…</p>}
                {!loading && shown.length === 0 && <p className="vtt-npc-empty">{npcs.length ? 'Aucune fiche ne correspond.' : 'Aucune fiche : crée la première avec « Nouvelle fiche ».'}</p>}
                {shown.map(npc => (
                    <NpcRow key={npc.id} npc={npc} summary={summary} canAdd={canAdd} hiddenTags={hiddenTags}
                            onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} />
                ))}
            </div>
        </section>
    );
};

export default NpcLibrary;
