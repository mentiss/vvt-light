// src/client/src/components/gm/modals/GMSendModal.jsx
// Modale envoi message GM (V2 : nouveau + depuis notes)
// CSS : classes génériques index.css uniquement — aucune classe viking-*, aucun style= pour les couleurs.

import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../../hooks/useFetch.js';
import useSystem from "../../../hooks/useSystem.js";

const TOAST_ANIMATIONS = [
    { id: 'default', label: 'Classique', icon: '📬' },
    { id: 'shake',   label: 'Tremblement', icon: '💥' },
    { id: 'flash',   label: 'Flash', icon: '⚡' },
    { id: 'glitter', label: 'Doré', icon: '✨' },
];

const GMSendModal = ({ onClose, onSend, sessionCharacters = [], preSelectedCharId = null }) => {
    const [mode, setMode] = useState('new');

    const [selectedTargets, setSelectedTargets] = useState(() => {
        if (preSelectedCharId) return new Set([preSelectedCharId]);
        return new Set(sessionCharacters.map(c => c.id));
    });

    const [title,          setTitle]          = useState('');
    const [body,           setBody]           = useState('');
    const [imageData,      setImageData]      = useState(null);
    const [imagePreview,   setImagePreview]   = useState(null);
    const [toastAnimation, setToastAnimation] = useState('default');
    const [sending,        setSending]        = useState(false);

    const [gmNotes,        setGmNotes]        = useState([]);
    const [notesLoading,   setNotesLoading]   = useState(false);
    const [noteSearch,     setNoteSearch]     = useState('');
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [isDragging,     setIsDragging]     = useState(false);

    const fileInputRef  = useRef(null);
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    useEffect(() => {
        if (mode === 'from_notes' && gmNotes.length === 0) loadGMNotes();
    }, [mode]);

    const loadGMNotes = async () => {
        setNotesLoading(true);
        try {
            const response = await fetchWithAuth(`${apiBase}/journal/-1?type=note`);
            if (response.ok) setGmNotes(await response.json());
        } catch (error) {
            console.error('[GMSendModal] Error loading GM notes:', error);
        } finally {
            setNotesLoading(false);
        }
    };

    const filteredNotes = gmNotes.filter(note => {
        if (!noteSearch.trim()) return true;
        const q = noteSearch.toLowerCase();
        return (note.title || '').toLowerCase().includes(q) ||
            (note.body  || '').toLowerCase().includes(q);
    });

    const selectNote = (note) => {
        setSelectedNoteId(note.id);
        setTitle(note.title || '');
        setBody(note.body   || '');
        if (note.metadata?.imageUrl) {
            setImageData(note.metadata.imageUrl);
            setImagePreview(note.metadata.imageUrl);
        }
    };

    const toggleTarget = (charId) => {
        setSelectedTargets(prev => {
            const next = new Set(prev);
            if (next.has(charId)) next.delete(charId);
            else next.add(charId);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedTargets.size === sessionCharacters.length) {
            setSelectedTargets(new Set());
        } else {
            setSelectedTargets(new Set(sessionCharacters.map(c => c.id)));
        }
    };

    const allSelected = selectedTargets.size === sessionCharacters.length;

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) { alert('Image trop volumineuse (max 20 Mo)'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => { setImageData(ev.target.result); setImagePreview(ev.target.result); };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageData(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        if (selectedTargets.size === 0) return;
        if (!title.trim() && !body.trim()) return;
        setSending(true);
        try {
            await onSend({
                targetCharacterIds: Array.from(selectedTargets),
                title:          title.trim() || null,
                body:           body.trim()  || null,
                imageData:      imageData    || null,
                toastAnimation,
            });
            onClose();
        } catch (error) {
            console.error('[GMSendModal] Error sending:', error);
            setSending(false);
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        if (newMode === 'new') setSelectedNoteId(null);
    };

    const canSend = selectedTargets.size > 0 && (title.trim() || body.trim());

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative border border-base"
                onClick={e => e.stopPropagation()}
                onDragOver={(e)  => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer?.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                        if (file.size > 20 * 1024 * 1024) { alert('Image trop volumineuse (max 20 Mo)'); return; }
                        const reader = new FileReader();
                        reader.onload = (ev) => { setImageData(ev.target.result); setImagePreview(ev.target.result); };
                        reader.readAsDataURL(file);
                    }
                }}
            >
                {/* Overlay drag */}
                {isDragging && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-primary"
                         style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="text-center">
                            <div className="text-4xl mb-2">📎</div>
                            <div className="text-lg font-bold text-primary">Déposez votre image ici</div>
                        </div>
                    </div>
                )}

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex justify-between items-center p-4 border-b border-base">
                    <h3 className="text-lg font-bold text-base">📨 Envoyer un message</h3>
                    <button onClick={onClose} className="text-muted hover:text-base transition-colors bg-transparent border-none ">
                        ✕
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-4">

                    {/* ── Toggle mode ──────────────────────────────────── */}
                    <div className="flex gap-1 bg-surface-alt rounded-lg p-1">
                        {[
                            { id: 'new',        label: '✏️ Nouveau'          },
                            { id: 'from_notes', label: '📓 Depuis mes notes' },
                        ].map(m => (
                            <button key={m.id} onClick={() => switchMode(m.id)}
                                    className={`flex-1 px-3 py-1.5 rounded font-semibold transition-colors border-none ${
                                        mode === m.id
                                            ? 'bg-primary text-base'
                                            : 'bg-transparent text-muted hover:text-base'
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Sélection note ───────────────────────────────── */}
                    {mode === 'from_notes' && (
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <input type="text" value={noteSearch} onChange={e => setNoteSearch(e.target.value)}
                                       placeholder="Rechercher dans mes notes..."
                                       className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-base bg-surface-alt text-base outline-none"
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted">🔍</span>
                            </div>

                            <div className="max-h-40 overflow-y-auto rounded-lg border border-base divide-y" style={{ '--tw-divide-opacity': 1 }}>
                                {notesLoading ? (
                                    <div className="p-3 text-center text-sm text-muted">Chargement…</div>
                                ) : filteredNotes.length === 0 ? (
                                    <div className="p-3 text-center text-sm text-muted">
                                        {noteSearch ? 'Aucune note trouvée' : 'Aucune note disponible'}
                                    </div>
                                ) : filteredNotes.map(note => (
                                    <button key={note.id} onClick={() => selectNote(note)}
                                            className={`w-full text-left px-3 py-2 border-none transition-colors ${
                                                selectedNoteId === note.id ? 'bg-surface-alt' : 'bg-transparent hover:bg-surface-alt'
                                            }`}
                                    >
                                        <div className="font-semibold text-sm text-base truncate">{note.title || 'Sans titre'}</div>
                                        {note.body && (
                                            <div className="text-xs text-muted truncate mt-0.5">{note.body.substring(0, 60)}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Destinataires ────────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-semibold text-base mb-2">Destinataires</label>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={toggleAll}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                        allSelected
                                            ? 'bg-primary text-base border-primary'
                                            : 'bg-transparent text-muted border-base hover:border-primary hover:text-primary'
                                    }`}
                            >
                                Tous
                            </button>

                            {sessionCharacters.map(char => {
                                const selected = selectedTargets.has(char.id);
                                return (
                                    <button key={char.id} onClick={() => toggleTarget(char.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                                selected
                                                    ? 'bg-surface-alt text-primary border-primary'
                                                    : 'bg-transparent text-muted border-base hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {char.avatar ? (
                                            <img src={char.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                            <span className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center text-[10px] text-muted">
                                                {char.name?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                        {selected ? '☑' : '☐'} {char.name}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedTargets.size === 0 && (
                            <p className="text-xs text-danger mt-1">Sélectionnez au moins un destinataire</p>
                        )}
                    </div>

                    {/* ── Titre ────────────────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-semibold text-base mb-1">Titre</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                               placeholder="Titre du message (optionnel)…"
                               className="w-full px-3 py-2 text-sm rounded-lg border border-base bg-surface-alt text-base outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* ── Corps ────────────────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-semibold text-base mb-1">Message</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)}
                                  placeholder="Contenu du message…" rows={4}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-base bg-surface-alt text-base outline-none focus:border-primary transition-colors resize-y"
                        />
                    </div>

                    {/* ── Image optionnelle ────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-semibold text-base mb-1">Image (optionnel)</label>
                        {imagePreview ? (
                            <div className="relative inline-block">
                                <img src={imagePreview} alt="Aperçu" className="max-h-32 rounded-lg border border-base" />
                                <button onClick={removeImage}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-base rounded-full text-xs font-bold border-none">
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-3 rounded-lg text-sm text-muted bg-surface-alt border border-base hover:border-primary hover:text-primary transition-colors">
                                📎 Cliquez ou glissez une image
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </div>

                    {/* ── Animation toast ───────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-semibold text-base mb-2">Animation de notification</label>
                        <div className="flex gap-2 flex-wrap">
                            {TOAST_ANIMATIONS.map(anim => {
                                const active = toastAnimation === anim.id;
                                return (
                                    <button key={anim.id} onClick={() => setToastAnimation(anim.id)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                                active
                                                    ? 'bg-primary text-base border-primary'
                                                    : 'bg-transparent text-muted border-base hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {anim.icon} {anim.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Footer ───────────────────────────────────────────── */}
                <div className="flex gap-3 p-4 border-t border-base">
                    <button onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm bg-surface-alt text-base border border-base hover:bg-surface transition-colors">
                        Annuler
                    </button>
                    <button onClick={handleSend} disabled={!canSend || sending}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                canSend && !sending
                                    ? 'bg-success text-base border-none hover:opacity-90'
                                    : 'bg-surface-alt text-muted border border-base cursor-not-allowed'
                            }`}
                    >
                        {sending ? '⏳ Envoi…' : `📨 Envoyer (${selectedTargets.size})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GMSendModal;