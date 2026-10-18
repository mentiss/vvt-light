// src/client/src/components/gm/modals/GMSendModal.jsx
// Modale envoi message GM (V2 : nouveau + depuis notes)
// CSS : composant Modal et classes vtt-* (habillables par le theme.css du slug).
// Pas de fermeture au clic sur le fond : le message en cours serait perdu.
//
// Contrat :
//   onClose            — () => void
//   sessionCharacters  — destinataires possibles : [{ id, name, avatar? }]
//   preSelectedCharId  — personnage coché d'office (sinon tous)
//   sessionId          — session active, transmise avec le message
//   onSend?            — (sendData) => Promise ; facultatif : sans lui, la modale
//                        envoie elle-même à la route commune POST journal/gm-send
//
// Message : éditeur de texte riche du journal (HTML, images insérées dans le texte),
// une note choisie « depuis mes notes » s'y charge mise en forme (spec_journal.md §2.8).

import React, { useState, useEffect } from 'react';
import { useFetch } from '../../../hooks/useFetch.js';
import useSystem from "../../../hooks/useSystem.js";
import Modal from '../../ui/Modal.jsx';
import RichTextEditor, { stripHtml } from '../../shared/RichTextEditor.jsx';

// Le message a un contenu : du texte ou au moins une image
const hasContent = (html) => !!stripHtml(html) || /<img/i.test(html || '');

const TOAST_ANIMATIONS = [
    { id: 'default', label: 'Classique' },
    { id: 'shake',   label: 'Tremblement' },
    { id: 'flash',   label: 'Flash' },
    { id: 'glitter', label: 'Doré' },
];

const GMSendModal = ({ onClose, onSend, sessionCharacters = [], preSelectedCharId = null, sessionId = null }) => {
    const [mode, setMode] = useState('new');

    const [selectedTargets, setSelectedTargets] = useState(() => {
        if (preSelectedCharId) return new Set([preSelectedCharId]);
        return new Set(sessionCharacters.map(c => c.id));
    });

    const [title,          setTitle]          = useState('');
    const [body,           setBody]           = useState('');
    const [toastAnimation, setToastAnimation] = useState('default');
    const [sending,        setSending]        = useState(false);

    const [gmNotes,        setGmNotes]        = useState([]);
    const [notesLoading,   setNotesLoading]   = useState(false);
    const [noteSearch,     setNoteSearch]     = useState('');
    const [selectedNoteId, setSelectedNoteId] = useState(null);

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
            stripHtml(note.body).toLowerCase().includes(q);
    });

    const selectNote = (note) => {
        setSelectedNoteId(note.id);
        setTitle(note.title || '');
        setBody(note.body   || '');
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

    const handleSend = async () => {
        if (selectedTargets.size === 0) return;
        if (!title.trim() && !hasContent(body)) return;
        setSending(true);
        const sendData = {
            targetCharacterIds: Array.from(selectedTargets),
            title:          title.trim() || null,
            body:           hasContent(body) ? body : null,
            toastAnimation,
        };
        try {
            if (onSend) {
                await onSend(sendData);
            } else {
                const response = await fetchWithAuth(`${apiBase}/journal/gm-send`, {
                    method: 'POST',
                    body: JSON.stringify({
                        targetCharacterIds: sendData.targetCharacterIds,
                        sessionId,
                        title:          sendData.title,
                        body:           sendData.body,
                        toastAnimation: sendData.toastAnimation,
                    }),
                });
                if (!response.ok) throw new Error('Envoi échoué');
            }
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

    const canSend = selectedTargets.size > 0 && (title.trim() || hasContent(body));

    return (
        <Modal
            title="Envoyer un message"
            size="lg"
            expandable
            closeOnBackdrop={false}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className="vtt-btn flex-1">
                        Annuler
                    </button>
                    <button type="button" onClick={handleSend} disabled={!canSend || sending} className="vtt-btn vtt-btn-primary flex-1">
                        {sending ? 'Envoi…' : `Envoyer (${selectedTargets.size})`}
                    </button>
                </>
            }
        >
                <div className="flex flex-col gap-4">

                    {/* ── Toggle mode ──────────────────────────────────── */}
                    <div className="vtt-segmented">
                        {[
                            { id: 'new',        label: 'Nouveau'          },
                            { id: 'from_notes', label: 'Depuis mes notes' },
                        ].map(m => (
                            <button type="button" key={m.id} onClick={() => switchMode(m.id)}
                                    className={`vtt-segment ${mode === m.id ? 'is-active' : ''}`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Sélection note ───────────────────────────────── */}
                    {mode === 'from_notes' && (
                        <div className="flex flex-col gap-2">
                            <input type="text" value={noteSearch} onChange={e => setNoteSearch(e.target.value)}
                                   placeholder="Rechercher dans mes notes..."
                                   className="vtt-input"
                            />

                            <div className="max-h-40 overflow-y-auto rounded-lg border border-default divide-y divide-default">
                                {notesLoading ? (
                                    <div className="p-3 text-center text-sm text-muted">Chargement…</div>
                                ) : filteredNotes.length === 0 ? (
                                    <div className="p-3 text-center text-sm text-muted">
                                        {noteSearch ? 'Aucune note trouvée' : 'Aucune note disponible'}
                                    </div>
                                ) : filteredNotes.map(note => (
                                    <button type="button" key={note.id} onClick={() => selectNote(note)}
                                            className={`w-full text-left px-3 py-2 border-none transition-colors ${
                                                selectedNoteId === note.id ? 'bg-primary/15' : 'bg-transparent hover:bg-surface-alt'
                                            }`}
                                    >
                                        <div className="font-semibold text-sm truncate">{note.title || 'Sans titre'}</div>
                                        {stripHtml(note.body) && (
                                            <div className="text-xs text-muted truncate mt-0.5">{stripHtml(note.body).substring(0, 80)}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Destinataires ────────────────────────────────── */}
                    <div>
                        <label className="vtt-field-label">Destinataires</label>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={toggleAll}
                                    className={`vtt-pill ${allSelected ? 'is-selected' : ''}`}
                            >
                                Tous
                            </button>

                            {sessionCharacters.map(char => {
                                const selected = selectedTargets.has(char.id);
                                return (
                                    <button type="button" key={char.id} onClick={() => toggleTarget(char.id)}
                                            className={`vtt-pill ${selected ? 'is-selected' : ''}`}
                                    >
                                        {char.avatar ? (
                                            <img src={char.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                            <span className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center text-[10px] text-muted">
                                                {char.name?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                        {char.name}
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
                        <label className="vtt-field-label">Titre</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                               placeholder="Titre du message (optionnel)…"
                               className="vtt-input"
                        />
                    </div>

                    {/* ── Corps ────────────────────────────────────────── */}
                    <div>
                        <label className="vtt-field-label">Message</label>
                        <div className="h-64">
                            <RichTextEditor
                                content={body}
                                onUpdate={setBody}
                                editable
                                placeholder="Contenu du message…"
                                className="h-full border border-default rounded-lg bg-surface-alt"
                            />
                        </div>
                    </div>

                    {/* ── Animation toast ───────────────────────────────── */}
                    <div>
                        <label className="vtt-field-label">Animation de notification</label>
                        <div className="flex gap-2 flex-wrap">
                            {TOAST_ANIMATIONS.map(anim => (
                                <button type="button" key={anim.id} onClick={() => setToastAnimation(anim.id)}
                                        className={`vtt-pill ${toastAnimation === anim.id ? 'is-selected' : ''}`}
                                >
                                    {anim.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
        </Modal>
    );
};

export default GMSendModal;