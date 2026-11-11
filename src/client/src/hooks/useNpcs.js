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
//
// Un PNJ de la table modifié ou retiré est signalé dans ce navigateur par l'événement
// `vtt:session-npc-changed` { sessionId, npc | removedId, origin } (spec_initiative.md §12) :
// les autres instances du hook (onglet PNJ, fiche ouverte depuis l'initiative) se mettent à
// jour, et la bande d'initiative suit la blessure du PNJ. Pas de socket : seul le MJ les voit.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from './useFetch.js';
import { useSystem } from './useSystem.js';

export const SESSION_NPC_EVENT = 'vtt:session-npc-changed';

/** Préférence « jets du MJ cachés » des PNJ, par table (onglet PNJ, fiche ouverte depuis l'initiative). */
export const NPC_ROLLS_OPTIONS = { defaults: { hidden: false }, validate: v => typeof v?.hidden === 'boolean' };

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
    // Identifiant de cette instance : elle ignore ses propres signaux
    const origin = useRef(Symbol('useNpcs'));

    const signal = useCallback((detail) => {
        window.dispatchEvent(new CustomEvent(SESSION_NPC_EVENT, { detail: { sessionId, origin: origin.current, ...detail } }));
    }, [sessionId]);

    // Modifications faites par une autre instance (autre onglet de l'interface MJ, fiche de l'initiative)
    useEffect(() => {
        const onChange = (e) => {
            const { sessionId: sid, origin: from, npc, added, removedId, cleared } = e.detail ?? {};
            if (sid !== sessionId || from === origin.current) return;
            if (npc) setTableState(updateList(sid, list => list.map(n => (n.id === npc.id ? npc : n))));
            if (added) setTableState(updateList(sid, list => [...list.filter(n => !added.some(a => a.id === n.id)), ...added]));
            if (removedId) setTableState(updateList(sid, list => list.filter(n => n.id !== removedId)));
            if (cleared) setTableState(updateList(sid, () => []));
        };
        window.addEventListener(SESSION_NPC_EVENT, onChange);
        return () => window.removeEventListener(SESSION_NPC_EVENT, onChange);
    }, [sessionId]);

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
        if (added) {
            setTableState(updateList(sessionId, list => [...list, ...added]));
            signal({ added });
        }
        return added;
    }, [call, sessionId, signal]);

    // Affichage immédiat, puis la réponse du serveur fait foi ; refus : retour à l'état enregistré
    const patchTableNpc = useCallback(async (id, patch) => {
        if (!sessionId) return null;
        setTableState(updateList(sessionId, list => list.map(n => (n.id === id ? { ...n, ...patch } : n))));
        const saved = await call(`/sessions/${sessionId}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
        if (saved) {
            setTableState(updateList(sessionId, list => list.map(n => (n.id === id ? saved : n))));
            signal({ npc: saved });
        } else reloadTable(sessionId);
        return saved;
    }, [call, sessionId, reloadTable, signal]);

    const removeTableNpc = useCallback(async (id) => {
        if (!sessionId) return;
        if (await call(`/sessions/${sessionId}/${id}`, { method: 'DELETE' })) {
            setTableState(updateList(sessionId, list => list.filter(n => n.id !== id)));
            signal({ removedId: id });
        }
    }, [call, sessionId, signal]);

    const clearTable = useCallback(async () => {
        if (!sessionId) return;
        if (await call(`/sessions/${sessionId}`, { method: 'DELETE' })) {
            setTableState(updateList(sessionId, () => []));
            signal({ cleared: true });
        }
    }, [call, sessionId, signal]);

    return { library, table, loading, error, saveNpc, deleteNpc, addToTable, patchTableNpc, removeTableNpc, clearTable };
}
