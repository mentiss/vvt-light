// features/journal/hooks/useTableJournal.js
// ─────────────────────────────────────────────────────────────────────────────
// Données du journal « Partagé » de la table (documentations/plateforme/spec_journal.md,
// partie III §11.2) : liste légère, entrée complète à l'ouverture, écritures en HTTP
// (le dernier qui enregistre gagne, avant l'écriture à plusieurs du lot 4), suivi en direct
// des écritures des autres (table-journal-changed / -deleted, room de la table).
// Même forme que usePrivateJournal (useJournalEditor sert les deux).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';

async function json(response) {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

const NO_TABLES = [];

/**
 * @param {number|null} sessionId   table (null : pas de journal partagé)
 * @param {number}      characterId lecteur (-1 = MJ), pour les nouveautés reçues en direct
 */
export function useTableJournal(sessionId, characterId) {
    const fetchWithAuth = useFetch();
    const socket = useSocket();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(null);   // { id, at } : corps modifié par un autre
    const watching = useRef(new Map());              // id → nombre de vues où l'entrée est ouverte
    const base = `/api/table-journal/${sessionId}`;

    useEffect(() => {
        if (!sessionId) return undefined;
        let alive = true;
        setLoading(true);   // eslint-disable-line react-hooks/set-state-in-effect -- changement de table : la liste se recharge
        fetchWithAuth(base).then(json)
            .then(list => { if (alive) setEntries(list); })
            .catch(error => { console.error('[useTableJournal] Error loading table journal:', error); if (alive) setEntries([]); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [sessionId, base, fetchWithAuth]);

    // Écritures des autres, en direct
    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const system = getSystemFromPath();
        const mine = (data) => data.system === system && data.sessionId === sessionId;
        const onChanged = (data) => {
            if (!mine(data)) return;
            const byOther = data.entry.editorId !== characterId;
            const open = watching.current.has(data.entry.id);   // sous les yeux : jamais « nouvelle »
            setEntries(prev => {
                const known = prev.find(e => e.id === data.entry.id);
                const isNew = byOther && !open ? (data.bodyChanged || !known ? true : known.isNew) : (known?.isNew ?? false) && !open;
                const next = { ...known, ...data.entry, isNew };
                return known ? prev.map(e => e.id === next.id ? next : e) : [next, ...prev];
            });
            if (byOther && data.bodyChanged) setChanged({ id: data.entry.id, at: Date.now() });
        };
        const onDeleted = (data) => { if (mine(data)) setEntries(prev => prev.filter(e => e.id !== data.id)); };
        socket.on('table-journal-changed', onChanged);
        socket.on('table-journal-deleted', onDeleted);
        return () => {
            socket.off('table-journal-changed', onChanged);
            socket.off('table-journal-deleted', onDeleted);
        };
    }, [socket, sessionId, characterId]);

    const patchLocal = useCallback((id, fields) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
    }, []);

    const loadEntry = useCallback((id) => fetchWithAuth(`${base}/${id}`).then(json), [fetchWithAuth, base]);

    /** Entrées complètes d'une liste (export). */
    const loadFull = useCallback((ids) => (ids.length ? fetchWithAuth(`${base}?full=1&ids=${ids.join(',')}`).then(json) : Promise.resolve([])),
        [fetchWithAuth, base]);

    // Corps par PUT …/body, titre et épingle par PATCH ; la liste reprend les champs du serveur
    const save = useCallback(async (id, fields) => {
        const { body, ...rest } = fields;
        let updated = null;
        if (body !== undefined) updated = await fetchWithAuth(`${base}/${id}/body`, { method: 'PUT', body: JSON.stringify({ body }) }).then(json);
        const patch = Object.fromEntries(Object.entries(rest).filter(([k]) => k === 'title' || k === 'pinned'));
        if (Object.keys(patch).length) updated = await fetchWithAuth(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }).then(json);
        if (updated) setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
        return updated;
    }, [fetchWithAuth, base]);

    const create = useCallback(async (fields) => {
        const created = await fetchWithAuth(base, { method: 'POST', body: JSON.stringify({ title: fields.title, body: fields.body }) }).then(json);
        setEntries(prev => prev.some(e => e.id === created.id) ? prev.map(e => e.id === created.id ? created : e) : [created, ...prev]);
        return created;
    }, [fetchWithAuth, base]);

    const remove = useCallback(async (id) => {
        await fetchWithAuth(`${base}/${id}`, { method: 'DELETE' }).then(json);
        setEntries(prev => prev.filter(e => e.id !== id));
    }, [fetchWithAuth, base]);

    /** Entrée nouvelle pour le lecteur. */
    const isUnread = useCallback((entry) => !!entry.isNew, []);

    /** Ouverture : l'entrée n'est plus nouvelle. */
    const markRead = useCallback((id) => {
        patchLocal(id, { isNew: false });
        fetchWithAuth(`${base}/${id}/seen`, { method: 'POST' }).catch(err => console.error('[useTableJournal] Error marking as seen:', err));
    }, [patchLocal, fetchWithAuth, base]);

    /**
     * Entrée ouverte dans une vue : ses modifications par les autres ne la rendent pas nouvelle ;
     * à la fermeture, elle est marquée vue (côté serveur aussi, pour le prochain chargement).
     * Renvoie la fonction de fermeture.
     */
    const watch = useCallback((id) => {
        const views = watching.current;
        views.set(id, (views.get(id) ?? 0) + 1);
        return () => {
            const left = (views.get(id) ?? 1) - 1;
            if (left > 0) { views.set(id, left); return; }
            views.delete(id);
            markRead(id);
        };
    }, [markRead]);

    const list = sessionId ? entries : NO_TABLES;
    return useMemo(() => ({
        scope: 'table', sessionId, entries: list, tables: NO_TABLES, loading, changed,
        loadEntry, loadFull, save, create, remove, patchLocal, isUnread, markRead, watch,
    }), [sessionId, list, loading, changed, loadEntry, loadFull, save, create, remove, patchLocal, isUnread, markRead, watch]);
}
