// features/journal/JournalCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Carte d'une entrée dans la liste du journal (documentations/plateforme/spec_journal.md,
// partie II §8.4, planche v8) : titre, étiquette (Privé) ou auteur (Partagé), table, date,
// aperçu, et ses actions (épingler, supprimer) en haut à droite, visibles au survol ;
// l'épingle d'une carte épinglée reste visible. La carte est un role="button" (un <button>
// ne peut pas contenir les boutons d'action), ouverte au clic ou par Entrée / Espace.
// onDelete absent : pas de corbeille (entrée partagée d'un autre, hors MJ).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { categoryLabel } from './tools/journalFilters.js';
import { formatShortDate } from './tools/journalDates.js';
import { PinIcon, TrashIcon } from './JournalIcons.jsx';

const tagOf = (entry) => {
    if (entry.type === 'gm_message') return 'Message du MJ';
    if (entry.type === 'gm_item') return 'Objet reçu';
    if (entry.type === 'gm_sent') return 'Envoyé';
    return categoryLabel(entry.category);
};

// Méta d'une entrée partagée : auteur, et dernier à l'avoir modifiée si c'est un autre
const sharedMeta = (entry) => entry.editorName && entry.editorName !== entry.authorName
    ? `${entry.authorName} · modifié par ${entry.editorName}` : entry.authorName;

const JournalCard = ({ entry, shared = false, unread = false, selected, compact = false, onOpen, onTogglePin, onDelete }) => {
    const open = () => onOpen(entry);
    const onKey = (e) => {
        if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        open();
    };
    const stop = (fn) => (e) => { e.stopPropagation(); fn(entry); };

    return (
        <div role="button" tabIndex={0} onClick={open} onKeyDown={onKey}
             className={`vtt-list-item vtt-journal-item${selected ? ' is-selected' : ''}${unread ? ' is-unread' : ''}`}>
            <span className="vtt-journal-item-head">
                {unread && <span className="vtt-unread" title={shared ? 'Nouveau' : 'Non lu'} />}
                <span className="vtt-journal-item-title">{entry.title || 'Sans titre'}</span>
                <span className="vtt-journal-item-actions">
                    <button type="button" className={`vtt-journal-tool${entry.pinned ? ' is-active' : ''}`}
                            onClick={stop(onTogglePin)} title={entry.pinned ? 'Désépingler' : 'Épingler'}>
                        <PinIcon />
                    </button>
                    {onDelete && (
                        <button type="button" className="vtt-journal-tool is-danger" onClick={stop(onDelete)} title="Supprimer">
                            <TrashIcon />
                        </button>
                    )}
                </span>
            </span>
            <span className="vtt-journal-item-meta">
                {shared ? <span>{sharedMeta(entry)}</span> : <span className="vtt-tag">{tagOf(entry)}</span>}
                {!shared && entry.type === 'gm_sent' && entry.metadata?.to?.length > 0 && <span>à {entry.metadata.to.join(', ')}</span>}
                {!shared && !compact && <span>{entry.sessionName || 'Hors table'}</span>}
                <span>{formatShortDate(entry.updatedAt)}</span>
            </span>
            {!compact && entry.bodyText && <span className="vtt-journal-item-preview">{entry.bodyText}</span>}
        </div>
    );
};

export default JournalCard;
