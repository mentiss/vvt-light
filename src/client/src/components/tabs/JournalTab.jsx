// components/JournalTab.jsx - Onglet Journal V2 (split layout, recherche, filtres)
// Habillage : classes vtt-* (index.css, surchargeables par le theme.css du slug),
// aucune classe propre à un slug (spec_journal.md §3).

import React, { useState, useEffect, useRef } from 'react';
import { useFetch }   from '../../hooks/useFetch.js';
import { useSession } from '../../context/SessionContext.jsx';
import ConfirmModal   from '../modals/ConfirmModal.jsx';
import { useSocket }  from '../../context/SocketContext.jsx';
import RichTextEditor, { stripHtml } from '../shared/RichTextEditor.jsx';
import ImageLightbox from "../ui/ImageLightbox.jsx";
import AlertModal     from '../modals/AlertModal.jsx';
import { parseServerDate } from '../../tools/utils.js';

// onRead?(entryId) — appelé quand une entrée non lue (message ou objet du MJ) est
//                    ouverte : le compteur de l'onglet Journal baisse d'une unité.
const JournalTab = ({ characterId, onRead }) => {
    const [entries,       setEntries]       = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [deleteTarget,  setDeleteTarget]  = useState(null);

    // Filtres
    const [searchQuery,   setSearchQuery]   = useState('');
    const [sessionFilter, setSessionFilter] = useState('all'); // 'all' | 'session' | 'none'
    const [dateFrom,      setDateFrom]      = useState('');
    const [dateTo,        setDateTo]        = useState('');
    const [showFilters,   setShowFilters]   = useState(false);
    const [listCollapsed, setListCollapsed] = useState(false);

    const titleRef    = useRef(null);
    const pendingSave = useRef(null);

    const fetchWithAuth       = useFetch();
    const { activeGMSession } = useSession();
    const socket              = useSocket();

    // Agrandissement d'une image (double-clic dans l'éditeur ou sur l'image jointe d'un ancien message)
    const [lightboxSrc,   setLightboxSrc]   = useState(null);
    const [alertMessage,  setAlertMessage]  = useState(null);

    // ── Socket : messages et objets envoyés par le MJ ────────────────────────
    useEffect(() => {
        if (!socket || !characterId) return;
        const handleGMMessage = (data) => {
            if (data.characterId === characterId) {
                setEntries(prev => [data.entry, ...prev]);
            }
        };
        const handleGMItem = (data) => {
            if (data.characterId === characterId && data.journalEntry) {
                setEntries(prev => [data.journalEntry, ...prev]);
            }
        };
        socket.on('gm-message-received', handleGMMessage);
        socket.on('gm-item-received',    handleGMItem);
        return () => {
            socket.off('gm-message-received', handleGMMessage);
            socket.off('gm-item-received',    handleGMItem);
        };
    }, [socket, characterId]);

    // ── Chargement des entrées ────────────────────────────────────────────────
    useEffect(() => {
        if (!characterId) return;
        loadEntries();
    }, [characterId, sessionFilter, activeGMSession]);

    const loadEntries = async () => {
        try {
            setLoading(true);
            let url = `/api/journal/${characterId}`;
            if (sessionFilter === 'session' && activeGMSession) {
                url += `?sessionId=${activeGMSession}`;
            }
            const response = await fetchWithAuth(url);
            if (response.ok) setEntries(await response.json());
        } catch (error) {
            console.error('[JournalTab] Error loading entries:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Filtrage local ────────────────────────────────────────────────────────
    // Jour local (AAAA-MM-JJ) d'une date serveur, comparable aux champs de date
    const localDay = (dateStr) => parseServerDate(dateStr)?.toLocaleDateString('sv-SE') ?? '';

    const filteredEntries = entries.filter(entry => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (
                !(entry.title || '').toLowerCase().includes(q) &&
                !stripHtml(entry.body).toLowerCase().includes(q)
            ) return false;
        }
        if (sessionFilter === 'none' && entry.sessionId) return false;
        if (dateFrom && localDay(entry.createdAt) < dateFrom) return false;
        if (dateTo   && localDay(entry.createdAt) > dateTo)   return false;
        return true;
    });

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const createNote = async () => {
        await flushPendingSave();
        try {
            const response = await fetchWithAuth(`/api/journal/${characterId}`, {
                method: 'POST',
                body: JSON.stringify({
                    sessionId: activeGMSession || null,
                    type:  'note',
                    title: 'Nouvelle note',
                    body:  '',
                }),
            });
            if (response.ok) {
                const newEntry = await response.json();
                setEntries(prev => [newEntry, ...prev]);
                setSelectedEntry(newEntry);
                setTimeout(() => {
                    if (titleRef.current) {
                        titleRef.current.focus();
                        titleRef.current.select();
                    }
                }, 50);
            }
        } catch (error) {
            console.error('[JournalTab] Error creating note:', error);
        }
    };

    const saveEntry = async (entryId, updates) => {
        try {
            const response = await fetchWithAuth(`/api/journal/${characterId}/${entryId}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const updated = await response.json();
            setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
            if (selectedEntry?.id === entryId) setSelectedEntry(updated);
        } catch (error) {
            // Échec visible (taille, réseau, serveur) : sinon la saisie disparaît au rechargement
            console.error('[JournalTab] Error saving entry:', error);
            setAlertMessage('La note n\'a pas pu être enregistrée.');
        }
    };

    const handleFieldChange = (field, value) => {
        if (!selectedEntry) return;
        const updated = { ...selectedEntry, [field]: value };
        setSelectedEntry(updated);
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
        pendingSave.current = {
            entryId: selectedEntry.id,
            ...(pendingSave.current || {}),
            [field]: value,
        };
    };

    const flushPendingSave = async () => {
        if (pendingSave.current) {
            const { entryId, ...updates } = pendingSave.current;
            pendingSave.current = null;
            await saveEntry(entryId, updates);
        }
    };

    const deleteEntry = async (entryId) => {
        try {
            const response = await fetchWithAuth(`/api/journal/${characterId}/${entryId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setEntries(prev => prev.filter(e => e.id !== entryId));
                if (selectedEntry?.id === entryId) setSelectedEntry(null);
            }
        } catch (error) {
            console.error('[JournalTab] Error deleting entry:', error);
        } finally {
            setDeleteTarget(null);
        }
    };

    // Ouvrir un message ou un objet du MJ non lu le marque comme lu
    const markAsRead = async (entry) => {
        const read = { ...entry, isRead: true };
        setEntries(prev => prev.map(e => e.id === entry.id ? read : e));
        onRead?.(entry.id);
        try {
            await fetchWithAuth(`/api/journal/${characterId}/${entry.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isRead: true }),
            });
        } catch (error) {
            console.error('[JournalTab] Error marking entry as read:', error);
        }
        return read;
    };

    const selectEntry = async (entry) => {
        await flushPendingSave();
        setSelectedEntry(entry.type !== 'note' && !entry.isRead ? await markAsRead(entry) : entry);
    };

    // ── Filtres ───────────────────────────────────────────────────────────────
    const clearFilters = () => {
        setSearchQuery('');
        setSessionFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    const hasActiveFilters = searchQuery || sessionFilter !== 'all' || dateFrom || dateTo;

    // ── Formatters date ───────────────────────────────────────────────────────
    // Dates serveur en UTC, affichées en heure locale (spec_journal.md §2.4)
    const formatDate = (dateStr) => {
        return parseServerDate(dateStr)?.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }) ?? '';
    };

    const formatDateShort = (dateStr) => {
        return parseServerDate(dateStr)?.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
        }) ?? '';
    };

    // ── Render ────────────────────────────────────────────────────────────────
    // Classes vtt-* habillables par le theme.css du slug (spec_journal.md §3)
    const typeLabel = (entry) =>
        entry.type === 'gm_item' ? 'Objet reçu' : entry.type === 'gm_message' ? 'Message du MJ' : null;
    const isUnread = (entry) => entry.type !== 'note' && !entry.isRead;

    return (
        <div className="w-full flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>

            {/* ── Barre d'outils ──────────────────────────────────────────── */}
            <div className="shrink-0 mb-3 space-y-2">
                <div className="flex gap-2 items-center">
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Rechercher dans le journal..."
                            className="vtt-input"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="vtt-btn shrink-0"
                        title="Filtres avancés"
                    >
                        Filtres{hasActiveFilters ? ' (actifs)' : ''}
                    </button>
                    <button type="button" onClick={createNote} className="vtt-btn vtt-btn-primary shrink-0">
                        Nouvelle note
                    </button>
                </div>

                {/* Filtres avancés */}
                {showFilters && (
                    <div className="vtt-panel flex flex-wrap gap-3 items-center p-3">
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { value: 'all',     label: 'Toutes' },
                                ...(activeGMSession ? [{ value: 'session', label: 'Session' }] : []),
                                { value: 'none',    label: 'Hors session' },
                            ].map(opt => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    onClick={() => setSessionFilter(opt.value)}
                                    className={`vtt-pill ${sessionFilter === opt.value ? 'is-selected' : ''}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted">
                            <span>Du</span>
                            <span className="w-36">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="vtt-input" />
                            </span>
                            <span>au</span>
                            <span className="w-36">
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="vtt-input" />
                            </span>
                        </div>

                        {hasActiveFilters && (
                            <button type="button" onClick={clearFilters} className="vtt-btn vtt-btn-sm">
                                Réinitialiser
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Loading ──────────────────────────────────────────────────── */}
            {loading && entries.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-muted">
                    Chargement du journal...
                </div>
            )}

            {/* ── Journal vide ──────────────────────────────────────────────── */}
            {!loading && entries.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-sm">
                        <h3 className="vtt-journal-title mb-2">Journal vide</h3>
                        <p className="mb-4 text-muted">
                            Créez votre première note pour garder une trace de vos aventures.
                        </p>
                        <button type="button" onClick={createNote} className="vtt-btn vtt-btn-primary">
                            Créer une note
                        </button>
                    </div>
                </div>
            )}

            {/* ── Layout split ─────────────────────────────────────────────── */}
            {entries.length > 0 && (
                <div className="flex-1 flex gap-3 min-h-0">

                    {/* ── PANNEAU GAUCHE : Liste ──────────────────────────── */}
                    <div className={`vtt-panel shrink-0 flex flex-col overflow-hidden transition-all ${listCollapsed ? 'w-10' : 'w-72'}`}>
                        {/* Bouton collapse */}
                        <button
                            type="button"
                            onClick={() => setListCollapsed(!listCollapsed)}
                            className="vtt-journal-list-toggle"
                            title={listCollapsed ? 'Afficher la liste' : 'Masquer la liste'}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={listCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
                            </svg>
                            {!listCollapsed && (
                                <span>
                                    {filteredEntries.length} entrée{filteredEntries.length > 1 ? 's' : ''}
                                    {hasActiveFilters && ` (filtrée${filteredEntries.length > 1 ? 's' : ''})`}
                                </span>
                            )}
                        </button>

                        {!listCollapsed && (
                            <div className="flex-1 overflow-y-auto vtt-scroll p-2 space-y-1.5">
                                {filteredEntries.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-muted">
                                        Aucune entrée ne correspond aux filtres.
                                    </div>
                                ) : (
                                    filteredEntries.map(entry => {
                                        const preview = stripHtml(entry.body);
                                        return (
                                            <button
                                                type="button"
                                                key={entry.id}
                                                onClick={() => selectEntry(entry)}
                                                className={`vtt-list-item flex-col items-stretch gap-1 p-2.5 ${selectedEntry?.id === entry.id ? 'is-selected' : ''}`}
                                            >
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    {isUnread(entry) && <span className="vtt-unread" title="Non lu" />}
                                                    <span className={`text-sm truncate ${isUnread(entry) ? 'font-bold' : 'font-semibold'}`}>
                                                        {entry.title || 'Sans titre'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-[10px] text-muted">
                                                        {formatDateShort(entry.updatedAt)}
                                                    </span>
                                                    {typeLabel(entry) && <span className="vtt-tag">{typeLabel(entry)}</span>}
                                                    {entry.sessionName && (
                                                        <span className="vtt-tag truncate max-w-[100px]">{entry.sessionName}</span>
                                                    )}
                                                </div>
                                                {preview && (
                                                    <div className="text-[11px] line-clamp-2 text-muted">
                                                        {preview.substring(0, 60)}{preview.length > 60 ? '…' : ''}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── PANNEAU DROIT : Détail / Édition ───────────────── */}
                    <div className="flex-1 min-w-0">
                        {selectedEntry ? (
                            <div className="vtt-panel h-full flex flex-col">
                                {/* Header */}
                                <div className="shrink-0 p-4 border-b border-default">
                                    {selectedEntry.type === 'note' ? (
                                        <input
                                            ref={titleRef}
                                            type="text"
                                            value={selectedEntry.title || ''}
                                            onChange={e => handleFieldChange('title', e.target.value)}
                                            onBlur={flushPendingSave}
                                            placeholder="Titre de la note..."
                                            className="vtt-journal-title"
                                        />
                                    ) : (
                                        <h2 className="vtt-journal-title">
                                            {selectedEntry.title || typeLabel(selectedEntry)}
                                        </h2>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted">
                                        <span>
                                            {selectedEntry.sessionName ? `Session : ${selectedEntry.sessionName}` : 'Hors session'}
                                        </span>
                                        {typeLabel(selectedEntry) && <span className="vtt-tag">{typeLabel(selectedEntry)}</span>}
                                        <span>·</span>
                                        <span>Créée le {formatDate(selectedEntry.createdAt)}</span>
                                        {selectedEntry.updatedAt !== selectedEntry.createdAt && (
                                            <>
                                                <span>·</span>
                                                <span>Modifiée le {formatDate(selectedEntry.updatedAt)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Corps — flex-1 min-h-0 pour que le scroll fonctionne */}
                                <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-4">
                                    {selectedEntry.type === 'note' ? (
                                        /* ── Note éditable ── */
                                        <RichTextEditor
                                            content={selectedEntry.body || ''}
                                            onUpdate={html => handleFieldChange('body', html)}
                                            onBlur={flushPendingSave}
                                            editable={true}
                                            onImageDoubleClick={setLightboxSrc}
                                            placeholder="Écrivez vos notes ici..."
                                            className="vtt-journal-editor w-full h-full"
                                        />
                                    ) : (
                                        /* ── Message ou objet du MJ (lecture + image jointe des anciens messages) ── */
                                        <div className="flex flex-col flex-1 min-h-0 gap-3">
                                            {selectedEntry.type === 'gm_item' && selectedEntry.metadata?.item && (
                                                <div className="vtt-callout shrink-0">
                                                    <div className="font-bold">
                                                        {selectedEntry.metadata.item.name}
                                                        {selectedEntry.metadata.item.quantity > 1 && ` × ${selectedEntry.metadata.item.quantity}`}
                                                    </div>
                                                    {selectedEntry.metadata.item.category && (
                                                        <div className="text-xs text-muted mt-0.5">{selectedEntry.metadata.item.category}</div>
                                                    )}
                                                </div>
                                            )}
                                            {(selectedEntry.type !== 'gm_item' || stripHtml(selectedEntry.body)) && (
                                                <RichTextEditor
                                                    content={selectedEntry.body || ''}
                                                    editable={false}
                                                    onImageDoubleClick={setLightboxSrc}
                                                    className="vtt-journal-editor flex-1 min-h-0"
                                                />
                                            )}
                                            {selectedEntry.metadata?.imageUrl && (
                                                <div className="vtt-journal-editor shrink-0 overflow-y-auto vtt-scroll p-2" style={{ maxHeight: '220px' }}>
                                                    <img
                                                        src={selectedEntry.metadata.imageUrl}
                                                        alt=""
                                                        className="max-w-full rounded-lg border border-default cursor-zoom-in"
                                                        onDoubleClick={() => setLightboxSrc(selectedEntry.metadata.imageUrl)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="shrink-0 px-4 py-3 border-t border-default flex justify-end">
                                    <button type="button" onClick={() => setDeleteTarget(selectedEntry)} className="vtt-btn vtt-btn-danger vtt-btn-sm">
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="vtt-panel h-full flex items-center justify-center p-4">
                                <p className="text-sm text-muted text-center">
                                    Sélectionnez une entrée ou créez une nouvelle note
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Confirmation suppression ──────────────────────────────────── */}
            {deleteTarget && (
                <ConfirmModal
                    title="Supprimer l'entrée"
                    message={`Voulez-vous vraiment supprimer « ${deleteTarget.title || 'Sans titre'} » ? Cette action est irréversible.`}
                    onConfirm={() => deleteEntry(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                    confirmText="Supprimer"
                    cancelText="Annuler"
                    danger={true}
                />
            )}
            {lightboxSrc && (
                <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
            )}
            {alertMessage && (
                <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}
        </div>
    );
};

export default JournalTab;