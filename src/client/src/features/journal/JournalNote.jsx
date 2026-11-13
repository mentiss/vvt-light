// features/journal/JournalNote.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Détail d'une entrée du journal (documentations/plateforme/spec_journal.md, partie II,
// planche v8) :
//   - note : titre éditable, indicateur d'enregistrement, épingle, catégorie, table de
//     rattachement (déplacement, R-21), éditeur à barre d'outils complète ;
//   - message ou objet du MJ, envoi du MJ : lecture seule (image jointe des anciens messages).
// Les modifications partent par onChange(champs) ; l'enregistrement est au parent.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import RichTextEditor from '@/ui/text/RichTextEditor.jsx';
import { JOURNAL_CATEGORIES } from './tools/journalFilters.js';
import { formatDateTime } from './tools/journalDates.js';
import { CopyIcon, PinIcon, ShareIcon, TrashIcon } from './JournalIcons.jsx';
import JournalPresence from './JournalPresence.jsx';

const SAVE_LABELS = { saved: 'Enregistré', saving: 'Enregistrement…', error: 'Échec de l\'enregistrement' };

const kindLabel = (entry) => {
    if (entry.type === 'gm_message') return 'Message du MJ';
    if (entry.type === 'gm_item') return 'Objet reçu';
    if (entry.type === 'gm_sent') return `Envoyé à ${(entry.metadata?.to ?? []).join(', ') || '…'}`;
    return null;
};

// Table de rattachement : une pastille, qui s'ouvre sur les tables possibles et « Hors table »
const TableChoice = ({ entry, tables, onMove }) => {
    const [open, setOpen] = useState(false);
    if (!open) {
        return (
            <button type="button" className="vtt-pill vtt-journal-attach" onClick={() => setOpen(true)} title="Ranger la note dans une autre table">
                {entry.sessionName || 'Hors table'} ▾
            </button>
        );
    }
    const choose = (sessionId) => { setOpen(false); if (sessionId !== (entry.sessionId ?? null)) onMove(sessionId); };
    return (
        <span className="vtt-journal-attach-menu">
            {[...tables, { id: null, name: 'Hors table' }].map(t => (
                <button key={t.id ?? 'none'} type="button" onClick={() => choose(t.id)}
                        className={`vtt-pill vtt-journal-attach${(entry.sessionId ?? null) === t.id ? ' is-selected' : ''}`}>
                    {t.name}
                </button>
            ))}
        </span>
    );
};

// « Partager » : copie la note dans le journal de la table (R-16, R-19), la note reste ici
const ShareButton = ({ onShare }) => {
    const [state, setState] = useState('idle');   // idle | busy | done
    const share = async () => {
        setState('busy');
        const ok = await onShare();
        setState(ok ? 'done' : 'idle');
        if (ok) setTimeout(() => setState('idle'), 3000);
    };
    return (
        <>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={share} disabled={state === 'busy'}><ShareIcon /> Partager</button>
            <span className="vtt-journal-hint">{state === 'done' ? 'Copiée dans « Partagé ».' : 'Copie dans « Partagé » : la note reste dans votre journal.'}</span>
        </>
    );
};

// « Copier en Markdown » (R-22) : la note dans le presse-papiers, prête pour un chat IA ou Obsidian
const CopyMarkdownButton = ({ onCopy }) => {
    const [done, setDone] = useState(false);
    const copy = async () => {
        if (await onCopy()) { setDone(true); setTimeout(() => setDone(false), 2500); }
    };
    return (
        <button type="button" className="vtt-btn vtt-btn-sm" onClick={copy} title="Copier la note en Markdown (chat IA, Obsidian…)">
            <CopyIcon /> {done ? 'Copiée' : 'Copier en Markdown'}
        </button>
    );
};

/**
 * shared  : entrée du journal partagé (pas de catégorie ni de table, auteur et modificateur affichés)
 * live    : écriture à plusieurs de l'entrée partagée (useJournalCollab) : { collaboration, peers, waiting, error }
 * onShare : note privée → copie dans le journal partagé (absent : pas de table active)
 * onDelete absent : suppression non permise (entrée partagée d'un autre)
 */
const JournalNote = ({ entry, shared = false, live = null, tables, saveStatus, onRetry, onChange, onBlur, onTogglePin, onDelete, onShare, onCopy, mentions = null, onImageOpen, titleRef }) => {
    const editable = shared || entry.type === 'note';
    const kind = shared ? null : kindLabel(entry);
    const item = entry.metadata?.item;

    return (
        <section className="vtt-panel vtt-journal-detail">
            <div className="vtt-journal-detail-head">
                <div className="vtt-journal-row">
                    {editable ? (
                        <input ref={titleRef} type="text" className="vtt-journal-title" value={entry.title || ''}
                               placeholder="Titre de la note…" onChange={e => onChange({ title: e.target.value })} onBlur={onBlur} />
                    ) : (
                        <h2 className="vtt-journal-title">{entry.title || kind}</h2>
                    )}
                    {editable && (
                        saveStatus === 'error'
                            ? <button type="button" className="vtt-journal-save" data-state="error" onClick={onRetry} title="Réessayer">{SAVE_LABELS.error} · réessayer</button>
                            : <span className="vtt-journal-save" data-state={saveStatus}>{SAVE_LABELS[saveStatus]}</span>
                    )}
                    <button type="button" className={`vtt-journal-tool${entry.pinned ? ' is-active' : ''}`}
                            onClick={onTogglePin} title={entry.pinned ? 'Désépingler' : 'Épingler'}>
                        <PinIcon />
                    </button>
                </div>
                {editable && !shared && (
                    <div className="vtt-journal-cats">
                        {JOURNAL_CATEGORIES.map(c => (
                            <button key={c.key} type="button" onClick={() => onChange({ category: c.key }, { now: true })}
                                    className={`vtt-pill${(entry.category || 'notes') === c.key ? ' is-selected' : ''}`}>
                                {c.label}
                            </button>
                        ))}
                    </div>
                )}
                {shared ? (
                    <div className="vtt-journal-meta">
                        <span>Écrite par {entry.authorName || '?'} le {formatDateTime(entry.createdAt)}</span>
                        {entry.updatedAt !== entry.createdAt && (
                            <span>· modifiée par {entry.editorName || '?'} le {formatDateTime(entry.updatedAt)}</span>
                        )}
                        <JournalPresence peers={live?.peers} />
                    </div>
                ) : (
                    <div className="vtt-journal-meta">
                        {editable
                            ? <TableChoice entry={entry} tables={tables} onMove={sessionId => onChange({ sessionId }, { now: true })} />
                            : <span>{entry.sessionName || 'Hors table'}</span>}
                        {kind && <span className="vtt-tag">{kind}</span>}
                        <span>Créée le {formatDateTime(entry.createdAt)}</span>
                        {entry.updatedAt !== entry.createdAt && <span>· modifiée le {formatDateTime(entry.updatedAt)}</span>}
                    </div>
                )}
            </div>

            <div className="vtt-journal-body">
                {item && (
                    <div className="vtt-callout">
                        <div className="font-bold">{item.name}{item.quantity > 1 && ` × ${item.quantity}`}</div>
                        {item.category && <div className="text-xs text-muted mt-0.5">{item.category}</div>}
                    </div>
                )}
                {shared && !live?.collaboration ? (
                    <div className="vtt-journal-editor vtt-journal-live-wait">
                        {live?.error ? 'L\'écriture partagée n\'a pas pu s\'ouvrir. Fermez puis rouvrez l\'entrée.' : 'Connexion à l\'écriture partagée…'}
                    </div>
                ) : (editable || entry.body) && (
                    <RichTextEditor
                        content={entry.body || ''}
                        editable={editable}
                        toolbar="full"
                        collaboration={shared ? live.collaboration : null}
                        mentions={mentions}
                        // Les frappes des autres arrivent par le document partagé : seules les siennes s'enregistrent
                        onUpdate={editable ? ((html, meta) => { if (!meta?.remote) onChange({ body: html }); }) : undefined}
                        onBlur={editable ? onBlur : undefined}
                        placeholder="Écrivez vos notes ici…"
                        className="vtt-journal-editor"
                    />
                )}
                {entry.metadata?.imageUrl && (
                    <div className="vtt-journal-editor vtt-journal-attachment vtt-scroll">
                        <img src={entry.metadata.imageUrl} alt="" onDoubleClick={() => onImageOpen(entry.metadata.imageUrl)} />
                    </div>
                )}
            </div>

            <div className="vtt-journal-foot">
                {!shared && entry.type === 'note' && onShare && <ShareButton key={`share-${entry.id}`} onShare={onShare} />}
                {shared && <span className="vtt-journal-hint">Toute la table peut modifier cette entrée.</span>}
                <span className="vtt-journal-spacer" />
                {onCopy && <CopyMarkdownButton key={`copy-${entry.id}`} onCopy={onCopy} />}
                <button type="button" className="vtt-btn vtt-btn-danger vtt-btn-sm" onClick={onDelete} disabled={!onDelete}
                        title={onDelete ? undefined : 'Seuls l\'auteur et le MJ peuvent supprimer cette entrée'}>
                    <TrashIcon /> Supprimer
                </button>
            </div>
        </section>
    );
};

export default JournalNote;
