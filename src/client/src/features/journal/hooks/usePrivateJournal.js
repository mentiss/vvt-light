// features/journal/hooks/usePrivateJournal.js
// ─────────────────────────────────────────────────────────────────────────────
// Données du journal « Privé » d'un personnage (MJ : personnage -1)
// (documentations/plateforme/spec_journal.md, partie III §11.1) :
// liste légère (sans corps HTML), entrée complète à l'ouverture, tables où ranger une
// note, messages et objets du MJ reçus en direct.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { isUnread } from '../tools/journalFilters.js';

// Réponse JSON d'un appel, ou erreur (l'appelant signale l'échec)
async function json(response) {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

/**
 * @param {number} characterId personnage (-1 = MJ)
 */
export function usePrivateJournal(characterId) {
    const fetchWithAuth = useFetch();
    const socket = useSocket();
    const [entries, setEntries] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const base = `/api/journal/${characterId}`;

    useEffect(() => {
        if (!characterId) return undefined;
        let alive = true;
        Promise.all([fetchWithAuth(base).then(json), fetchWithAuth(`${base}/tables`).then(json)])
            .then(([list, tableList]) => { if (alive) { setEntries(list); setTables(tableList); } })
            .catch(error => console.error('[usePrivateJournal] Error loading journal:', error))
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [characterId, base, fetchWithAuth]);

    // Messages et objets envoyés par le MJ, en direct
    useEffect(() => {
        if (!socket || !characterId) return undefined;
        const add = (entry) => entry && setEntries(prev => prev.some(e => e.id === entry.id) ? prev : [entry, ...prev]);
        const onMessage = (data) => { if (data.characterId === characterId) add(data.entry); };
        const onItem = (data) => { if (data.characterId === characterId) add(data.journalEntry); };
        socket.on('gm-message-received', onMessage);
        socket.on('gm-item-received', onItem);
        return () => {
            socket.off('gm-message-received', onMessage);
            socket.off('gm-item-received', onItem);
        };
    }, [socket, characterId]);

    /** Modification locale immédiate (affichage), sans appel. */
    const patchLocal = useCallback((id, fields) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
    }, []);

    /** Entrée complète (corps HTML). */
    const loadEntry = useCallback((id) => fetchWithAuth(`${base}/${id}`).then(json), [fetchWithAuth, base]);

    /** Entrées complètes d'une liste (export). */
    const loadFull = useCallback((ids) => (ids.length ? fetchWithAuth(`${base}?full=1&ids=${ids.join(',')}`).then(json) : Promise.resolve([])),
        [fetchWithAuth, base]);

    /** Enregistre des champs ; renvoie l'entrée à jour (lève une erreur en cas d'échec). */
    const save = useCallback(async (id, fields) => {
        const updated = await fetchWithAuth(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(fields) }).then(json);
        // Le corps reste celui de l'éditeur (la liste est légère) : seuls les champs du serveur reviennent
        const { body: _body, ...light } = updated;
        setEntries(prev => prev.map(e => e.id === id ? { ...e, ...light } : e));
        return updated;
    }, [fetchWithAuth, base]);

    const create = useCallback(async (fields) => {
        const created = await fetchWithAuth(base, { method: 'POST', body: JSON.stringify({ type: 'note', ...fields }) }).then(json);
        setEntries(prev => [created, ...prev]);
        return created;
    }, [fetchWithAuth, base]);

    const remove = useCallback(async (id) => {
        await fetchWithAuth(`${base}/${id}`, { method: 'DELETE' }).then(json);
        setEntries(prev => prev.filter(e => e.id !== id));
    }, [fetchWithAuth, base]);

    /** Ouverture d'un message ou d'un objet du MJ : il est lu. */
    const markRead = useCallback((id) => {
        patchLocal(id, { isRead: true });
        save(id, { isRead: true }).catch(err => console.error('[usePrivateJournal] Error marking as read:', err));
    }, [patchLocal, save]);

    return useMemo(() => ({ scope: 'private', entries, tables, loading, changed: null, loadEntry, loadFull, save, create, remove, patchLocal, isUnread, markRead }),
        [entries, tables, loading, loadEntry, loadFull, save, create, remove, patchLocal, markRead]);
}
