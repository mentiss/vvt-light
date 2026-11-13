// features/journal/hooks/useJournalEditor.js
// ─────────────────────────────────────────────────────────────────────────────
// Entrée ouverte dans une vue du journal (onglet ou fenêtre flottante) : ouverture (corps
// complet, marquée lue), modification avec enregistrement automatique, épingle, création,
// suppression. Les champs de liste (titre, catégorie, épingle, table) viennent toujours de
// la liste partagée ; le corps enregistré par l'autre vue est repris s'il est plus récent
// que ce que celle-ci a chargé ou tapé.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { stripHtml } from '@/ui/text/RichTextEditor.jsx';
import { useAutosave } from './useAutosave.js';

/**
 * @param {object} journal       source : usePrivateJournal ou useTableJournal (même forme)
 * @param {{ lastBody: object|null, publishBody: Function }} share  partage du corps entre vues (useJournalData)
 * @param {{ onRead?: Function, onError: (message: string) => void }} options
 */
export function useJournalEditor(journal, { lastBody, publishBody }, { onRead, onError }) {
    const { entries, tables, loadEntry, save, create, remove, patchLocal, isUnread, markRead, changed } = journal;
    const source = useId();
    const [selected, setSelected] = useState(null);   // { ...entrée complète, stamp }

    const saveAndShare = useCallback(async (id, fields) => {
        const updated = await save(id, fields);
        if (fields.body !== undefined) publishBody(`${journal.scope}:${id}`, fields.body, source);
        return updated;
    }, [save, publishBody, source, journal.scope]);
    const autosave = useAutosave(saveAndShare);

    // Entrée affichée : champs de liste à jour, corps de l'autre vue s'il est plus récent
    const listed = selected ? entries.find(e => e.id === selected.id) : null;
    const key = selected ? `${journal.scope}:${selected.id}` : null;
    const entry = useMemo(() => {
        if (!selected || !listed) return null;
        const fresh = lastBody && lastBody.key === key && lastBody.source !== source && lastBody.at > selected.stamp;
        return { ...selected, ...listed, body: fresh ? lastBody.body : selected.body };
    }, [selected, listed, lastBody, source, key]);

    const open = useCallback(async (item) => {
        await autosave.flush();
        try {
            const full = await loadEntry(item.id);
            if (isUnread(item)) {
                // Ouvrir une entrée non lue (message du MJ, nouveauté de la table) : le compteur baisse
                markRead(item.id);
                onRead?.(item.id, journal.scope);
            }
            setSelected({ ...full, stamp: Date.now() });
            return full;
        } catch (error) {
            console.error('[Journal] Error opening entry:', error);
            onError('L\'entrée n\'a pas pu être ouverte.');
            return null;
        }
    }, [autosave, loadEntry, isUnread, markRead, onRead, onError, journal.scope]);

    // Journal partagé : l'entrée ouverte n'est pas « nouvelle » tant qu'on l'a sous les yeux
    const { watch } = journal;
    const watchedId = selected?.id ?? null;
    useEffect(() => (watch && watchedId ? watch(watchedId) : undefined), [watch, watchedId]);

    // Journal partagé : corps modifié par un autre pendant qu'on lit l'entrée → rechargé,
    // sauf si on est en train d'y écrire (le dernier qui enregistre gagne, avant le lot 4)
    const selectedId = selected?.id;
    const writing = autosave.status === 'saving';
    useEffect(() => {
        if (!changed || changed.id !== selectedId || writing) return;
        let alive = true;
        loadEntry(changed.id)
            .then(full => { if (alive) setSelected(s => (s?.id === full.id ? { ...full, stamp: Date.now() } : s)); })
            .catch(err => console.error('[Journal] Error reloading entry:', err));
        return () => { alive = false; };
    }, [changed, selectedId, writing, loadEntry]);

    const close = useCallback(async () => {
        await autosave.flush();
        setSelected(null);
    }, [autosave]);

    /** Champs modifiés : affichés tout de suite, enregistrés après une pause (now : tout de suite). */
    const change = useCallback((fields, { now = false } = {}) => {
        if (!selected) return;
        const local = { ...fields };
        if (fields.body !== undefined) local.bodyText = stripHtml(fields.body);
        if (fields.sessionId !== undefined) local.sessionName = tables.find(t => t.id === fields.sessionId)?.name ?? null;
        patchLocal(selected.id, local);
        if (fields.body !== undefined) setSelected(s => ({ ...s, body: fields.body, stamp: Date.now() }));
        autosave.queue(selected.id, fields);
        if (now) autosave.flush();
    }, [selected, tables, patchLocal, autosave]);

    const togglePin = useCallback((item) => {
        const pinned = !item.pinned;
        patchLocal(item.id, { pinned });
        save(item.id, { pinned }).catch(() => {
            patchLocal(item.id, { pinned: !pinned });
            onError('L\'épingle n\'a pas pu être enregistrée.');
        });
    }, [patchLocal, save, onError]);

    const createNote = useCallback(async (fields) => {
        await autosave.flush();
        try {
            const created = await create({ title: 'Nouvelle note', body: '', ...fields });
            setSelected({ ...created, stamp: Date.now() });
            return created;
        } catch (error) {
            console.error('[Journal] Error creating note:', error);
            onError('La note n\'a pas pu être créée.');
            return null;
        }
    }, [autosave, create, onError]);

    const deleteEntry = useCallback(async (item) => {
        try {
            await remove(item.id);
            if (selected?.id === item.id) setSelected(null);
        } catch (error) {
            console.error('[Journal] Error deleting entry:', error);
            onError('L\'entrée n\'a pas pu être supprimée.');
        }
    }, [remove, selected, onError]);

    return { entry, open, close, change, togglePin, createNote, deleteEntry, autosave };
}
