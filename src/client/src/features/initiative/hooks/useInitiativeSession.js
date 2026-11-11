// src/client/src/features/initiative/hooks/useInitiativeSession.js
// ─────────────────────────────────────────────────────────────────────────────
// Initiative d'une table (documentations/spec_initiative.md §9.4, §9.6) :
// - lecture à l'entrée et à chaque reconnexion du socket (GET), écoute de
//   initiative-state / initiative-avatars filtrée sur le slug et la table ;
// - écriture du MJ : l'état complet calculé par features/initiative/tools/initiative.js (PUT), la fin (DELETE) ;
//   affichée tout de suite ; pendant qu'une écriture est en cours, les réponses et
//   diffusions plus anciennes sont ignorées (deux gestes rapprochés ne reviennent pas
//   en arrière) ;
// - une annulation (l'état précédent du MJ), rattachée à sa table ;
// - copie de secours chez le MJ (vtt:<slug>:<table>:initiative) : si le serveur a
//   redémarré et n'a plus rien, `backup` la propose à la reprise.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch } from '@/app/hooks/useFetch.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import { readStored, removeStored, storageKey, tableScope, writeStored } from '@/app/tools/browserStorage.js';

const EMPTY = { loaded: false, state: null, avatars: {} };
const backupKey = (sessionId) => storageKey(tableScope(getSystemFromPath(), sessionId), 'initiative');

/**
 * @param {number|null} sessionId table active (null : rien)
 * @param {boolean} isGM le MJ écrit et garde une copie de secours
 */
export function useInitiativeSession(sessionId, isGM) {
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const [data, setData] = useState({ sessionId: null, ...EMPTY });
    // Annulation et copie de secours retiennent leur table : jamais appliquées à une autre
    const [previous, setPrevious] = useState(null);     // { sessionId, state, avatars }
    const [backup, setBackup] = useState(null);         // { sessionId, state, avatars }

    // Les données retiennent leur table : celles d'une autre table ne sont jamais renvoyées
    const current = data.sessionId === sessionId ? data : { sessionId, ...EMPTY };
    const stateRef = useRef(current);
    useEffect(() => { stateRef.current = current; });

    // Écritures en cours : la dernière seule fait foi
    const writeSeq = useRef(0);
    const pending = useRef(0);

    const apply = useCallback((patch) => {
        setData(prev => ({ ...(prev.sessionId === sessionId ? prev : { sessionId, ...EMPTY }), ...patch, sessionId, loaded: true }));
    }, [sessionId]);

    const request = useCallback(async (method, body) => {
        if (!sessionId) return null;
        try {
            const res = await fetchWithAuth(`/api/initiative/sessions/${sessionId}`, {
                method, body: body === undefined ? undefined : JSON.stringify(body),
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error(`[useInitiativeSession] ${method} failed:`, err);
            return null;
        }
    }, [sessionId, fetchWithAuth]);

    // ── Chargement, puis à chaque reconnexion ───────────────────────────────
    useEffect(() => {
        if (!sessionId) return undefined;
        let cancelled = false;
        const load = async () => {
            const res = await request('GET');
            if (!res || cancelled || pending.current) return;
            apply({ state: res.state, avatars: res.avatars ?? {} });
            if (isGM && !res.state) {
                const saved = readStored(backupKey(sessionId));
                setBackup(saved?.state ? { sessionId, ...saved } : null);
            }
        };
        load();
        socket?.on('connect', load);
        return () => {
            cancelled = true;
            socket?.off('connect', load);
        };
    }, [sessionId, socket, request, apply, isGM]);

    // ── Temps réel ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const system = getSystemFromPath();
        const mine = (payload) => payload?.system === system && payload?.sessionId === sessionId;
        // Le MJ qui écrit encore ignore les diffusions de ses écritures précédentes
        const onState = (payload) => { if (mine(payload) && !pending.current) apply({ state: payload.state }); };
        const onAvatars = (payload) => { if (mine(payload) && !pending.current) apply({ avatars: payload.avatars ?? {} }); };
        socket.on('initiative-state', onState);
        socket.on('initiative-avatars', onAvatars);
        return () => {
            socket.off('initiative-state', onState);
            socket.off('initiative-avatars', onAvatars);
        };
    }, [socket, sessionId, apply]);

    // ── Écritures du MJ ─────────────────────────────────────────────────────
    /** PUT ou DELETE ordonné : seule la réponse de la dernière écriture s'applique. */
    const write = useCallback(async (method, body) => {
        const seq = ++writeSeq.current;
        pending.current += 1;
        const res = await request(method, body);
        pending.current -= 1;
        const latest = seq === writeSeq.current;
        if (latest && !res) {
            const fresh = await request('GET');   // refusé : retour à l'état du serveur
            if (fresh && seq === writeSeq.current) apply({ state: fresh.state, avatars: fresh.avatars ?? {} });
        }
        return { res, latest };
    }, [request, apply]);

    /**
     * Enregistre l'état calculé ; `avatars` : ceux des participants ajoutés ({ clé: data URL }).
     * Renvoie true si le serveur l'a accepté.
     */
    const save = useCallback(async (state, avatars) => {
        const before = stateRef.current;
        // L'annulation rend aussi les avatars d'un participant retiré
        setPrevious({ sessionId, state: before.state, avatars: before.avatars });
        apply({ state, avatars: { ...before.avatars, ...avatars } });
        const { res, latest } = await write('PUT', { state, avatars });
        if (!res) return false;
        if (latest) {
            apply({ state: res.state, avatars: res.avatars });
            writeStored(backupKey(sessionId), { state: res.state, avatars: res.avatars });
            setBackup(null);
        }
        return true;
    }, [write, apply, sessionId]);

    const canUndo = previous?.sessionId === sessionId && !!previous?.state;

    const undo = useCallback(async () => {
        if (!canUndo) return;
        const { state, avatars } = previous;
        setPrevious(null);
        apply({ state, avatars });
        const { res, latest } = await write('PUT', { state, avatars });
        if (res && latest) {
            apply({ state: res.state, avatars: res.avatars });
            writeStored(backupKey(sessionId), { state: res.state, avatars: res.avatars });
        }
    }, [canUndo, previous, write, apply, sessionId]);

    const end = useCallback(async () => {
        const { res } = await write('DELETE');
        if (!res) return;
        apply({ state: null, avatars: {} });
        setPrevious(null);
        removeStored(backupKey(sessionId));
    }, [write, apply, sessionId]);

    /** Reprendre la copie de secours (le serveur a redémarré) ; false : l'oublier. */
    const resume = useCallback(async (accept) => {
        const copy = backup?.sessionId === sessionId ? backup : null;
        setBackup(null);
        if (!accept || !copy?.state) { removeStored(backupKey(sessionId)); return; }
        await save(copy.state, copy.avatars ?? {});
    }, [backup, save, sessionId]);

    return {
        loaded: current.loaded, state: current.state, avatars: current.avatars,
        save, undo, canUndo, end,
        backup: backup?.sessionId === sessionId ? backup : null, resume,
    };
}
