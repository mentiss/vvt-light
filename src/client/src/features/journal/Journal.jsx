// features/journal/Journal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Brique assemblée du journal (documentations/plateforme/spec_journal.md, parties II et
// III §13.1, planche v8) : bascule Privé / Partagé, colonne repliable (recherche, filtres,
// catégories, cartes), détail de l'entrée ouverte. Montée par JournalTab (joueur) et
// TabJournal (MJ, -1).
//   - Privé   : journal du personnage (notes, messages et objets du MJ, envois du MJ) ;
//   - Partagé : journal de la table active, écrit par toute la table.
//
// Props :
//   characterId        personnage (-1 = MJ)
//   onRead?(id, scope) une entrée non lue vient d'être ouverte
// Habillage : classes vtt-journal-* (features/journal/journal.css), surchargeables par
// le theme.css du slug.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/app/context/SessionContext.jsx';
import { usePersistedState } from '@/app/hooks/usePersistedState.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import ConfirmModal from '@/ui/modal/ConfirmModal.jsx';
import AlertModal from '@/ui/modal/AlertModal.jsx';
import ImageLightbox from '@/ui/image/ImageLightbox.jsx';
import DateRangeField from '@/ui/date/DateRangeField.jsx';
import { useJournalData } from './hooks/useJournalData.js';
import { useJournalEditor } from './hooks/useJournalEditor.js';
import { useFillHeight } from './hooks/useFillHeight.js';
import { useJournalCollab } from './hooks/useJournalCollab.js';
import { useJournalMentions } from './hooks/useJournalMentions.js';
import { journalCounts } from './JournalProvider.jsx';
import { JOURNAL_CATEGORIES, filterEntries, hasAdvancedFilter, splitPinned } from './tools/journalFilters.js';
import JournalCard from './JournalCard.jsx';
import JournalNote from './JournalNote.jsx';
import JournalScopeSwitch from './JournalScopeSwitch.jsx';
import { ChevronIcon, DownloadIcon, PlusIcon } from './JournalIcons.jsx';
import { entriesToMarkdown, entryToMarkdown, markdownFileName } from './tools/journalMarkdown.js';
import { entryContext } from './tools/journalContext.js';
import { isoDay } from '@/ui/tools/dateRange.js';

// Téléchargement d'un texte en fichier (export Markdown)
function downloadText(fileName, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Colonne repliée ou non, côté affiché, par slug et par navigateur (F-STORAGE)
const LAYOUT_OPTIONS = { defaults: { collapsed: false, scope: 'private' } };
const NO_FILTER = { query: '', kind: 'all', table: 'all', from: '', to: '' };

const Journal = ({ characterId, onRead }) => {
    const isGM = characterId === -1;
    const data = useJournalData(characterId);
    const { activeGMSession } = useSession();
    const activeTable = data.sessionId ?? activeGMSession ?? null;
    const [layout, setLayout] = usePersistedState(getSystemFromPath(), 'journal', LAYOUT_OPTIONS);
    const scope = layout.scope === 'table' ? 'table' : 'private';
    const shared = scope === 'table';
    const source = shared ? data.table : data.journal;
    const { entries, tables, loading } = source;
    const counts = journalCounts(data);

    const [filter, setFilter] = useState(NO_FILTER);
    const [showMore, setShowMore] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [alert, setAlert] = useState(null);
    const titleRef = useRef(null);
    const rootRef = useRef(null);
    const height = useFillHeight(rootRef);

    const editor = useJournalEditor(source, data, { onRead, onError: setAlert });
    const { entry: selected, open, change, togglePin, autosave } = editor;
    const live = useJournalCollab(data, shared ? selected : null);

    // Changer de côté : la saisie en cours part d'abord, l'entrée ouverte se ferme
    const closeEntry = editor.close;
    const switchScope = useCallback(async (next) => {
        if (next === scope) return;
        await closeEntry();
        setFilter(NO_FILTER);
        setLayout(prev => ({ ...prev, scope: next }));
    }, [scope, closeEntry, setLayout]);

    // Lien « @ » cliqué : ouvre l'entrée citée, en passant de l'autre côté si besoin
    const pendingOpen = useRef(null);
    const openCited = useCallback(async (targetScope, id) => {
        if (targetScope === scope) {
            const target = source.entries.find(e => e.id === id);
            if (target) open(target);
            return;
        }
        pendingOpen.current = { scope: targetScope, id };
        await switchScope(targetScope);
    }, [scope, source.entries, open, switchScope]);
    useEffect(() => {
        const pending = pendingOpen.current;
        if (!pending || pending.scope !== scope) return;
        const target = source.entries.find(e => e.id === pending.id);
        if (!target) return;   // liste pas encore chargée : on réessaie au prochain rendu
        pendingOpen.current = null;
        open(target);
    }, [scope, source.entries, open]);
    const mentions = useJournalMentions(data, scope, selected, openCited);
    const setF = (fields) => setFilter(f => ({ ...f, ...fields }));
    const canDelete = (entry) => !shared || isGM || entry.authorId === characterId;

    // ── Liste ─────────────────────────────────────────────────────────────
    const shown = useMemo(() => filterEntries(entries, shared
        ? { query: filter.query, from: filter.from, to: filter.to }
        : { ...filter, activeTable }), [entries, filter, activeTable, shared]);
    const { pinned, others } = useMemo(() => splitPinned(shown), [shown]);    const filtered = shown.length !== entries.length;

    // ── Créer, partager, supprimer (ouvrir et modifier : useJournalEditor) ─
    const createNote = async () => {
        const category = JOURNAL_CATEGORIES.some(c => c.key === filter.kind) ? filter.kind : 'notes';
        const created = await editor.createNote(shared ? { title: 'Nouvelle entrée' } : { category, sessionId: activeTable });
        if (created) setTimeout(() => { titleRef.current?.focus(); titleRef.current?.select(); }, 50);
    };

    // « Partager » : copie de la note privée dans le journal partagé (R-19)
    const shareNote = async () => {
        await autosave.flush();
        try {
            await data.table.create({ title: selected.title, body: selected.body });
            return true;
        } catch (error) {
            console.error('[Journal] Error sharing note:', error);
            setAlert('La note n\'a pas pu être partagée.');
            return false;
        }
    };

    // ── Markdown (R-22, Q-4) ──────────────────────────────────────────────
    // Corps relu au serveur : en écriture à plusieurs, celui de l'éditeur ne suit que ses propres frappes
    const copyMarkdown = async () => {
        await autosave.flush();
        try {
            const full = await source.loadEntry(selected.id);
            await navigator.clipboard.writeText(entryToMarkdown(full, { context: entryContext(full, { shared }) }));
            return true;
        } catch (error) {
            console.error('[Journal] Error copying markdown:', error);
            setAlert('La note n\'a pas pu être copiée (presse-papiers refusé par le navigateur).');
            return false;
        }
    };

    // Export de la liste affichée (filtres compris), dans l'ordre affiché, en un seul fichier .md
    const exportMarkdown = async () => {
        await autosave.flush();
        const order = [...pinned, ...others].map(e => e.id);
        if (!order.length) return;
        try {
            const full = await source.loadFull(order);
            const byId = new Map(full.map(e => [e.id, e]));
            const md = entriesToMarkdown(order.map(id => byId.get(id)).filter(Boolean), (e) => entryContext(e, { shared }));
            downloadText(markdownFileName('journal', shared ? 'partage' : 'prive', getSystemFromPath(), isoDay(new Date())), md);
        } catch (error) {
            console.error('[Journal] Error exporting markdown:', error);
            setAlert('L\'export n\'a pas pu être préparé.');
        }
    };

    const confirmDelete = () => {
        const target = deleteTarget;
        setDeleteTarget(null);
        editor.deleteEntry(target);
    };

    // ── Rendu ─────────────────────────────────────────────────────────────
    const card = (entry) => (
        <JournalCard key={entry.id} entry={entry} shared={shared} unread={source.isUnread(entry)} selected={selected?.id === entry.id}
                     onOpen={open} onTogglePin={togglePin} onDelete={canDelete(entry) ? setDeleteTarget : undefined} />
    );
    const kinds = [{ key: 'all', label: 'Toutes' }, ...JOURNAL_CATEGORIES];
    const extraKind = isGM
        ? { key: 'sent', label: 'Envoyés' }
        : { key: 'messages', label: `Messages du MJ${counts.private ? ` (${counts.private})` : ''}` };
    const countLabel = `${shown.length} entrée${shown.length > 1 ? 's' : ''}${filtered ? ' (filtrées)' : ''}`;
    const tableFilters = [{ key: 'all', label: 'Toutes' }, ...(activeTable ? [{ key: 'active', label: 'Table active' }] : []), { key: 'none', label: 'Hors table' }];
    const advanced = hasAdvancedFilter(shared ? { from: filter.from, to: filter.to } : filter);
    const newLabel = shared ? 'Nouvelle entrée' : 'Nouvelle note';
    const noTable = shared && !data.sessionId;

    const emptyText = noTable ? 'Pas de table active : le journal partagé est celui de la table en cours.'
        : entries.length ? 'Aucune entrée ne correspond aux filtres.'
        : shared ? 'Rien d\'écrit pour la table. Écrivez la première entrée.' : 'Votre journal est vide.';

    return (
        <div ref={rootRef} className="vtt-journal" style={height ? { height: `${height}px` } : undefined}>
            {layout.collapsed ? (
                <aside className="vtt-panel vtt-journal-side is-collapsed">
                    <button type="button" className="vtt-journal-list-toggle" onClick={() => setLayout(prev => ({ ...prev, collapsed: false }))} title="Afficher la liste">
                        <ChevronIcon right />
                    </button>
                    <div className="vtt-journal-rail">
                        {counts.total > 0 && <span className="vtt-journal-count" title="Non lus">{counts.total}</span>}
                        {!noTable && <button type="button" className="vtt-journal-tool" onClick={createNote} title={newLabel}><PlusIcon /></button>}
                    </div>
                </aside>
            ) : (
                <aside className="vtt-panel vtt-journal-side">
                    <button type="button" className="vtt-journal-list-toggle" onClick={() => setLayout(prev => ({ ...prev, collapsed: true }))} title="Masquer la liste">
                        <ChevronIcon /><span>{countLabel}</span>
                    </button>
                    <div className="vtt-journal-side-head">
                        <JournalScopeSwitch scope={scope} counts={counts} onChange={switchScope} />
                        <div className="vtt-journal-search-row">
                            <input type="text" className="vtt-input" value={filter.query} placeholder="Rechercher…"
                                   onChange={e => setF({ query: e.target.value })} />
                            <button type="button" onClick={() => setShowMore(v => !v)}
                                    className={`vtt-btn vtt-btn-sm${advanced ? ' vtt-btn-primary' : ''}`}>
                                Filtres{advanced ? ' •' : ''}
                            </button>
                        </div>
                        {showMore && (
                            <div className="vtt-journal-more">
                                {!shared && (
                                    <>
                                        <div className="vtt-journal-more-label">Table</div>
                                        <div className="vtt-journal-filters">
                                            {tableFilters.map(t => (
                                                <button key={t.key} type="button" onClick={() => setF({ table: t.key })}
                                                        className={`vtt-pill${filter.table === t.key ? ' is-selected' : ''}`}>{t.label}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <div className="vtt-journal-more-label">Créées</div>
                                <DateRangeField value={{ from: filter.from, to: filter.to }} onChange={range => setF(range)} />
                                {advanced && (
                                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setF({ table: 'all', from: '', to: '' })}>Réinitialiser</button>
                                )}
                            </div>
                        )}
                        {!shared && (
                            <div className="vtt-journal-filters">
                                {kinds.map(k => (
                                    <button key={k.key} type="button" onClick={() => setF({ kind: k.key })}
                                            className={`vtt-pill${filter.kind === k.key ? ' is-selected' : ''}`}>{k.label}</button>
                                ))}
                                <span className="vtt-journal-filter-sep" />
                                <button type="button" onClick={() => setF({ kind: extraKind.key })}
                                        className={`vtt-pill${filter.kind === extraKind.key ? ' is-selected' : ''}`}>{extraKind.label}</button>
                            </div>
                        )}
                    </div>
                    <div className="vtt-journal-list vtt-scroll">
                        {loading && entries.length === 0 && <div className="vtt-journal-empty">Chargement du journal…</div>}
                        {!loading && shown.length === 0 && <div className="vtt-journal-empty">{emptyText}</div>}
                        {pinned.length > 0 && <div className="vtt-journal-group">Épinglées</div>}
                        {pinned.map(card)}
                        {pinned.length > 0 && others.length > 0 && <div className="vtt-journal-group">Toutes</div>}
                        {others.map(card)}
                    </div>
                    {!noTable && (
                        <div className="vtt-journal-side-foot">
                            <button type="button" className="vtt-btn vtt-btn-primary" onClick={createNote}><PlusIcon /> {newLabel}</button>
                            <button type="button" className="vtt-btn vtt-journal-export" onClick={exportMarkdown} disabled={!shown.length}
                                    title="Exporter la liste affichée en Markdown (.md)" aria-label="Exporter en Markdown">
                                <DownloadIcon />
                            </button>
                        </div>
                    )}
                </aside>
            )}

            {selected ? (
                <JournalNote key={`${scope}:${selected.id}`} entry={selected} shared={shared} live={shared ? live : null} tables={tables} titleRef={titleRef}
                             saveStatus={autosave.status} onRetry={autosave.retry}
                             onChange={change} onBlur={autosave.flush}
                             onTogglePin={() => togglePin(selected)}
                             onDelete={canDelete(selected) ? () => setDeleteTarget(selected) : undefined}
                             onShare={!shared && data.sessionId ? shareNote : undefined}
                             onCopy={copyMarkdown}
                             mentions={mentions}
                             onImageOpen={setLightboxSrc} />
            ) : (
                <section className="vtt-panel vtt-journal-detail vtt-journal-placeholder">
                    <p className="vtt-journal-empty">
                        {noTable ? emptyText : entries.length ? 'Choisissez une entrée ou créez-en une.'
                            : shared ? 'Le journal partagé de la table : résumés, personnages, lieux… ce que la table veut garder.'
                            : 'Créez votre première note pour garder une trace de vos aventures.'}
                    </p>
                </section>
            )}

            {deleteTarget && (
                <ConfirmModal title="Supprimer l'entrée" danger confirmText="Supprimer" cancelText="Annuler"
                              message={`Supprimer « ${deleteTarget.title || 'Sans titre'} » ${shared ? 'du journal partagé, pour toute la table' : 'de votre journal'} ? Cette action est irréversible.`}
                              onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
            )}
            {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
            {alert && <AlertModal message={alert} onClose={() => setAlert(null)} />}
        </div>
    );
};

export default Journal;
