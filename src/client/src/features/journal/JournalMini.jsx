// features/journal/JournalMini.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Journal compact de la fenêtre flottante (spec_journal.md R-14, planche v8) : une seule
// chose à la fois, dans le plus petit espace possible.
//   - liste : recherche, « + », cartes compactes (épinglées en tête) ;
//   - note  : retour, titre, indicateur d'enregistrement, épingle, éditeur sans barre
//     d'outils (mise en forme au menu de sélection).
// La dernière note ouverte est rouverte à la prochaine ouverture (lastId, gardé par la couche).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/app/context/SessionContext.jsx';
import AlertModal from '@/ui/modal/AlertModal.jsx';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';
import ConfirmModal from '@/ui/modal/ConfirmModal.jsx';
import RichTextEditor from '@/ui/text/RichTextEditor.jsx';
import { useJournalData } from './hooks/useJournalData.js';
import { useJournalEditor } from './hooks/useJournalEditor.js';
import { filterEntries, splitPinned } from './tools/journalFilters.js';
import JournalCard from './JournalCard.jsx';
import JournalScopeSwitch from './JournalScopeSwitch.jsx';
import JournalPresence from './JournalPresence.jsx';
import { useJournalCollab } from './hooks/useJournalCollab.js';
import { useJournalMentions } from './hooks/useJournalMentions.js';
import { journalCounts } from './JournalProvider.jsx';
import { ChevronIcon, PinIcon, PlusIcon } from './JournalIcons.jsx';

const SAVE_TITLES = { saved: 'Enregistré', saving: 'Enregistrement…', error: 'Échec de l\'enregistrement : cliquer pour réessayer' };

/**
 * scope / onScope : côté affiché ('private' | 'table'), gardé par la couche
 * lastId / onLastId : dernière entrée ouverte de ce côté, rouverte à l'ouverture
 */
const JournalMini = ({ characterId, onRead, scope, onScope, lastId, onLastId }) => {
    const data = useJournalData(characterId);
    const shared = scope === 'table';
    const source = shared ? data.table : data.journal;
    const { entries, loading } = source;
    const { activeGMSession } = useSession();
    const activeTable = data.sessionId ?? activeGMSession ?? null;
    const isGM = characterId === -1;
    const [query, setQuery] = useState('');
    const [alert, setAlert] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const titleRef = useRef(null);
    const reopened = useRef(false);

    const editor = useJournalEditor(source, data, { onRead, onError: setAlert });
    const { entry, open, close, change, togglePin, autosave } = editor;
    const live = useJournalCollab(data, shared ? entry : null);

    // Lien « @ » cliqué : ouvre l'entrée citée, en passant de l'autre côté si besoin
    const pendingOpen = useRef(null);
    const openCited = useCallback(async (targetScope, id) => {
        if (targetScope === scope) {
            const target = source.entries.find(e => e.id === id);
            if (target && await open(target)) onLastId(target.id);
            return;
        }
        pendingOpen.current = { scope: targetScope, id };
        await close();
        onScope(targetScope);
    }, [scope, source.entries, open, close, onScope, onLastId]);
    useEffect(() => {
        const pending = pendingOpen.current;
        if (!pending || pending.scope !== scope) return;
        const target = source.entries.find(e => e.id === pending.id);
        if (!target) return;
        pendingOpen.current = null;
        open(target).then(ok => { if (ok) onLastId(target.id); });
    }, [scope, source.entries, open, onLastId]);
    const mentions = useJournalMentions(data, scope, entry, openCited);
    const canDelete = (item) => !shared || isGM || item.authorId === characterId;
    const switchScope = async (next) => {
        if (next === scope) return;
        await close();
        setQuery('');
        onScope(next);
    };

    // Rouvrir la dernière note à l'ouverture de la fenêtre, une fois la liste chargée
    useEffect(() => {
        if (reopened.current || loading) return;
        reopened.current = true;
        const last = lastId && entries.find(e => e.id === lastId);
        if (last) open(last);
    }, [loading, entries, lastId, open]);

    const { pinned, others } = useMemo(() => splitPinned(filterEntries(entries, { query })), [entries, query]);

    const openEntry = async (item) => { if (await open(item)) onLastId(item.id); };
    const back = () => { close(); onLastId(null); };
    const createNote = async () => {
        const created = await editor.createNote(shared ? { title: 'Nouvelle entrée' } : { category: 'notes', sessionId: activeTable });
        if (created) {
            onLastId(created.id);
            setTimeout(() => { titleRef.current?.focus(); titleRef.current?.select(); }, 50);
        }
    };
    const card = (item) => (
        <JournalCard key={item.id} entry={item} shared={shared} unread={source.isUnread(item)} compact
                     onOpen={openEntry} onTogglePin={togglePin} onDelete={canDelete(item) ? setDeleteTarget : undefined} />
    );
    const noTable = shared && !data.sessionId;

    const editable = !!entry && (shared || entry.type === 'note');

    return (
        <div className="vtt-journal-mini-body">
            {entry ? (
                <>
                    <div className="vtt-journal-mini-bar">
                        <button type="button" className="vtt-journal-tool" onClick={back} title="Retour à la liste"><ChevronIcon /></button>
                        {editable ? (
                            <input ref={titleRef} type="text" className="vtt-journal-mini-title" value={entry.title || ''}
                                   placeholder="Titre…" onChange={e => change({ title: e.target.value })} onBlur={autosave.flush} />
                        ) : (
                            <span className="vtt-journal-mini-title">{entry.title}</span>
                        )}
                        {editable && (
                            <button type="button" className="vtt-journal-save is-compact" data-state={autosave.status}
                                    title={SAVE_TITLES[autosave.status]} aria-label={SAVE_TITLES[autosave.status]}
                                    onClick={autosave.status === 'error' ? autosave.retry : undefined} />
                        )}
                        <button type="button" className={`vtt-journal-tool${entry.pinned ? ' is-active' : ''}`}
                                onClick={() => togglePin(entry)} title={entry.pinned ? 'Désépingler' : 'Épingler'}><PinIcon /></button>
                    </div>
                    {shared && live.peers.length > 0 && (
                        <div className="vtt-journal-mini-presence"><JournalPresence peers={live.peers} /></div>
                    )}
                    {shared && !live.collaboration ? (
                        <div className="vtt-journal-editor vtt-journal-live-wait">
                            {live.error ? 'L\'écriture partagée n\'a pas pu s\'ouvrir.' : 'Connexion…'}
                        </div>
                    ) : (
                        <RichTextEditor
                            key={`${scope}:${entry.id}`}
                            content={entry.body || ''}
                            editable={editable}
                            toolbar="selection"
                            collaboration={shared ? live.collaboration : null}
                            mentions={mentions}
                            onUpdate={(html, meta) => { if (!meta?.remote) change({ body: html }); }}
                            onBlur={autosave.flush}
                            placeholder="Écrivez ici…"
                            className="vtt-journal-editor"
                        />
                    )}
                </>
            ) : (
                <>
                    <div className="vtt-journal-mini-bar">
                        <JournalScopeSwitch scope={scope} counts={journalCounts(data)} onChange={switchScope} />
                        <input type="text" className="vtt-input" value={query} placeholder="Chercher…" onChange={e => setQuery(e.target.value)} />
                        {!noTable && (
                            <button type="button" className="vtt-journal-tool" onClick={createNote} title={shared ? 'Nouvelle entrée' : 'Nouvelle note'}><PlusIcon /></button>
                        )}
                    </div>
                    <div className="vtt-journal-list vtt-scroll">
                        {loading && entries.length === 0 && <div className="vtt-journal-empty">Chargement…</div>}
                        {!loading && pinned.length + others.length === 0 && (
                            <div className="vtt-journal-empty">
                                {noTable ? 'Pas de table active.' : entries.length ? 'Aucune entrée trouvée.' : shared ? 'Rien d\'écrit pour la table.' : 'Votre journal est vide.'}
                            </div>
                        )}
                        {pinned.length > 0 && <div className="vtt-journal-group">Épinglées</div>}
                        {pinned.map(card)}
                        {pinned.length > 0 && others.length > 0 && <div className="vtt-journal-group">Toutes</div>}
                        {others.map(card)}
                    </div>
                </>
            )}

            {/* Hors de la fenêtre flottante (conteneur de taille : une modale rendue dedans serait rognée) */}
            <HostedModal>
                {deleteTarget && (
                    <ConfirmModal title="Supprimer l'entrée" danger confirmText="Supprimer" cancelText="Annuler"
                                  message={`Supprimer « ${deleteTarget.title || 'Sans titre'} » ${shared ? 'du journal partagé, pour toute la table' : 'de votre journal'} ? Cette action est irréversible.`}
                                  onConfirm={() => { const t = deleteTarget; setDeleteTarget(null); editor.deleteEntry(t); }}
                                  onCancel={() => setDeleteTarget(null)} />
                )}
                {alert && <AlertModal message={alert} onClose={() => setAlert(null)} />}
            </HostedModal>
        </div>
    );
};

export default JournalMini;
