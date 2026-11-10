// src/client/src/hooks/useNpcs.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ de la plateforme côté MJ (documentations/spec_pnj.md §6.3, §6.5) :
// bibliothèque (/npcs) et PNJ présents à la table active (/npcs/sessions/:sid),
// par HTTP. Aucune écoute socket : seul le MJ les voit.
//
// const n = useNpcs(sessionId);
// n.library, n.table, n.loading, n.error
// n.saveNpc(npc, id?) → fiche | null          (sans id : création)
// n.deleteNpc(id) → boolean
// n.addToTable(npcId, quantity, state) → PNJ ajoutés | null
// n.patchTableNpc(id, patch) (affichage immédiat), n.removeTableNpc(id), n.clearTable()
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useFetch } from './useFetch.js';
import { useSystem } from './useSystem.js';

const byName = (a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
    || (a.prenom ?? '').localeCompare(b.prenom ?? '', 'fr', { sensitivity: 'base' });

/**
 * Mise à jour de la liste des PNJ de la table `sessionId` : ignorée si la liste affichée
 * est déjà celle d'une autre table (réponse arrivée après un changement de table).
 */
const updateList = (sessionId, update) => (state) => (state.sessionId === sessionId ? { ...state, list: update(state.list) } : state);

export function useNpcs(sessionId) {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const [library, setLibrary] = useState([]);
    // PNJ de la table, rattachés à leur table : changer de table n'affiche pas ceux de la précédente
    const [tableState, setTableState] = useState({ sessionId: null, list: [] });
    const table = tableState.sessionId === sessionId ? tableState.list : [];
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Appel JSON ; l'erreur du serveur devient le message affiché, une réussite l'efface
    // (sauf `keepError` : rechargement après un refus, le message reste visible)
    const call = useCallback(async (path, options = {}, keepError = false) => {
        try {
            const r = await fetchWithAuth(`${apiBase}/npcs${path}`, options);
            const body = await r.json().catch(() => null);
            if (!r.ok) { setError(body?.error ?? 'Erreur du serveur'); return null; }
            if (!keepError) setError(null);
            return body;
        } catch (e) {
            console.error('[npcs]', e);
            setError('Serveur injoignable');
            return null;
        }
    }, [fetchWithAuth, apiBase]);

    useEffect(() => {
        let cancelled = false;
        call('/').then(list => {
            if (cancelled) return;
            if (list) setLibrary(list);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [call]);

    // Après un refus du serveur : la table affichée revient à son état enregistré
    const reloadTable = useCallback(async (sid) => {
        const list = await call(`/sessions/${sid}`, {}, true);
        if (list) setTableState(updateList(sid, () => list));
    }, [call]);

    useEffect(() => {
        let cancelled = false;
        if (!sessionId) return undefined;
        call(`/sessions/${sessionId}`).then(list => { if (!cancelled && list) setTableState({ sessionId, list }); });
        return () => { cancelled = true; };
    }, [call, sessionId]);

    const saveNpc = useCallback(async (npc, id = null) => {
        const saved = await call(id ? `/${id}` : '/', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ npc }) });
        if (saved) setLibrary(list => [...list.filter(n => n.id !== saved.id), saved].sort(byName));
        return saved;
    }, [call]);

    const deleteNpc = useCallback(async (id) => {
        const ok = await call(`/${id}`, { method: 'DELETE' });
        if (ok) setLibrary(list => list.filter(n => n.id !== id));
        return !!ok;
    }, [call]);

    const addToTable = useCallback(async (npcId, quantity = 1, state = {}) => {
        if (!sessionId) return null;
        const added = await call(`/sessions/${sessionId}`, { method: 'POST', body: JSON.stringify({ npcId, quantity, state }) });
        if (added) setTableState(updateList(sessionId, list => [...list, ...added]));
        return added;
    }, [call, sessionId]);

    // Affichage immédiat, puis la réponse du serveur fait foi ; refus : retour à l'état enregistré
    const patchTableNpc = useCallback(async (id, patch) => {
        if (!sessionId) return null;
        setTableState(updateList(sessionId, list => list.map(n => (n.id === id ? { ...n, ...patch } : n))));
        const saved = await call(`/sessions/${sessionId}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
        if (saved) setTableState(updateList(sessionId, list => list.map(n => (n.id === id ? saved : n))));
        else reloadTable(sessionId);
        return saved;
    }, [call, sessionId, reloadTable]);

    const removeTableNpc = useCallback(async (id) => {
        if (!sessionId) return;
        if (await call(`/sessions/${sessionId}/${id}`, { method: 'DELETE' })) setTableState(updateList(sessionId, list => list.filter(n => n.id !== id)));
    }, [call, sessionId]);

    const clearTable = useCallback(async () => {
        if (!sessionId) return;
        if (await call(`/sessions/${sessionId}`, { method: 'DELETE' })) setTableState(updateList(sessionId, () => []));
    }, [call, sessionId]);

    return { library, table, loading, error, saveNpc, deleteNpc, addToTable, patchTableNpc, removeTableNpc, clearTable };
}
