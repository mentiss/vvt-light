// src/client/src/hooks/useBoardSlide.js
// ─────────────────────────────────────────────────────────────────────────────
// Une diapositive du tableau (documentations/spec_tableau.md §10.4, §10.5, §10.8) :
// - objets chargés à l'ouverture et à chaque reconnexion, tenus à jour par
//   board-items / board-fog ;
// - écritures par HTTP, appliquées tout de suite à l'écran ; le serveur vérifie
//   les droits et diffuse ;
// - relais éphémère de la brique (P-1) : déplacement en direct (board-drag) et
//   ping (board-ping), émis ici et seulement ici, jamais par le code d'un slug ;
// - PJ de la table, pour l'avatar ou les initiales de leurs jetons.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useFetch } from './useFetch.js';
import { getSystemFromPath } from './useSystem.js';
import { resizeImage } from '../tools/imageResize.js';

const DRAG_INTERVAL_MS = 66;     // ~15 positions par seconde pendant un déplacement
const PING_MS = 2000;            // durée d'un ping (Q-40)
const IMAGE_MAX_SIDE = 1920;     // réduction avant envoi (Q-28)

const byZ = (a, b) => a.z - b.z || a.id - b.id;

/** Objets après une mise à jour (ajouts ou remplacements, puis retraits) */
function merge(items, upsert = [], remove = []) {
    const map = new Map(items.map(i => [i.id, i]));
    for (const item of upsert) map.set(item.id, item);
    for (const id of remove) map.delete(id);
    return [...map.values()].sort(byZ);
}

/**
 * @param {number|null} sessionId table active
 * @param {number|null} slideId   diapositive affichée
 */
export function useBoardSlide(sessionId, slideId) {
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const fetchRef = useRef(fetchWithAuth);
    useEffect(() => { fetchRef.current = fetchWithAuth; });

    const [state, setState] = useState({ slideId: null, loaded: false, items: [], fog: [] });
    const [drags, setDrags] = useState({});        // itemId → { x, y, w?, h? } reçus en direct
    const [pings, setPings] = useState([]);
    const [characters, setCharacters] = useState({});
    const lastDragRef = useRef(0);

    const base = `/api/board/sessions/${sessionId}`;

    const request = useCallback(async (method, path, body) => {
        try {
            const res = await fetchRef.current(`${base}${path}`, {
                method, body: body === undefined ? undefined : JSON.stringify(body),
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error(`[useBoardSlide] ${method} ${path} failed:`, err);
            return null;
        }
    }, [base]);

    const update = useCallback((fn) => {
        setState(prev => (prev.slideId === slideId ? fn(prev) : prev));
    }, [slideId]);

    // ── Chargement, puis à chaque reconnexion du socket ─────────────────────
    const load = useCallback(async () => {
        if (!sessionId || !slideId) return;
        const data = await request('GET', `/slides/${slideId}`);
        if (!data) return;
        setState({ slideId, loaded: true, items: data.items.sort(byZ), fog: data.slide.fog });
        setDrags({});
    }, [sessionId, slideId, request]);

    useEffect(() => {
        if (!sessionId || !slideId) return undefined;
        const run = () => { load(); };
        run();
        socket?.on('connect', run);
        return () => { socket?.off('connect', run); };
    }, [sessionId, slideId, socket, load]);

    // ── PJ de la table (jetons), rechargés si un jeton inconnu apparaît ─────
    const unknownCharacter = state.items.some(i => i.kind === 'token' && i.data.characterId !== undefined && !characters[i.data.characterId]);
    useEffect(() => {
        if (!sessionId) return undefined;
        let cancelled = false;
        request('GET', '/characters').then(rows => {
            if (rows && !cancelled) setCharacters(Object.fromEntries(rows.map(c => [c.id, c])));
        });
        return () => { cancelled = true; };
    }, [sessionId, request, unknownCharacter]);

    // ── Temps réel ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !sessionId || !slideId) return undefined;
        const system = getSystemFromPath();
        const mine = (p) => p?.system === system && p?.sessionId === sessionId && p?.slideId === slideId;

        const onItems = (p) => {
            if (!mine(p)) return;
            update(prev => ({ ...prev, items: merge(prev.items, p.upsert, p.remove) }));
            // Position définitive reçue : le déplacement en direct est terminé
            setDrags(prev => {
                const next = { ...prev };
                for (const item of p.upsert) delete next[item.id];
                for (const id of p.remove) delete next[id];
                return next;
            });
        };
        const onFog = (p) => { if (mine(p)) update(prev => ({ ...prev, fog: p.fog })); };
        const onDrag = (p) => {
            if (!mine(p)) return;
            setDrags(prev => ({ ...prev, [p.itemId]: { x: p.x, y: p.y, w: p.w, h: p.h } }));
        };
        const onPing = (p) => {
            if (!mine(p)) return;
            const ping = { id: `${Date.now()}-${Math.random()}`, x: p.x, y: p.y, color: p.color };
            setPings(prev => [...prev, ping]);
            setTimeout(() => setPings(prev => prev.filter(x => x.id !== ping.id)), PING_MS);
        };

        socket.on('board-items', onItems);
        socket.on('board-fog', onFog);
        socket.on('board-drag', onDrag);
        socket.on('board-ping', onPing);
        return () => {
            socket.off('board-items', onItems);
            socket.off('board-fog', onFog);
            socket.off('board-drag', onDrag);
            socket.off('board-ping', onPing);
        };
    }, [socket, sessionId, slideId, update]);

    // ── Écritures (HTTP) ────────────────────────────────────────────────────
    const addItem = useCallback(async (body) => {
        const item = await request('POST', `/slides/${slideId}/items`, body);
        if (item) update(prev => ({ ...prev, items: merge(prev.items, [item]) }));
        return item;
    }, [request, slideId, update]);

    const patchItem = useCallback(async (id, patch) => {
        update(prev => ({ ...prev, items: prev.items.map(i => (i.id === id ? { ...i, ...patch } : i)) }));
        const item = await request('PATCH', `/items/${id}`, patch);
        if (item) update(prev => ({ ...prev, items: merge(prev.items, [item]) }));
        else load();   // refusé : on revient à l'état du serveur
    }, [request, update, load]);

    const deleteItem = useCallback(async (id) => {
        update(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
        if (!(await request('DELETE', `/items/${id}`))) load();
    }, [request, update, load]);

    const clearItems = useCallback(async () => {
        const data = await request('DELETE', `/slides/${slideId}/items`);
        if (data) update(prev => ({ ...prev, items: merge(prev.items, [], data.removed) }));
    }, [request, slideId, update]);

    const placePcTokens = useCallback(async () => {
        const data = await request('POST', `/slides/${slideId}/pc-tokens`);
        if (data?.items?.length) update(prev => ({ ...prev, items: merge(prev.items, data.items) }));
    }, [request, slideId, update]);

    /** Brouillard (MJ) : { op: 'reveal'|'cover', x, y, w, h } ou { reset: 'cover'|'reveal' } */
    const updateFog = useCallback(async (operation) => {
        const data = await request('PUT', `/slides/${slideId}/fog`, operation);
        if (data) update(prev => ({ ...prev, fog: data.fog }));
    }, [request, slideId, update]);

    /** Image déposée ou collée : réduite ici, puis envoyée (MJ) */
    const uploadImage = useCallback(async (file, { x, y, background = false } = {}) => {
        const { dataUrl, width, height } = await resizeImage(file, { maxSide: IMAGE_MAX_SIDE });
        const body = { dataUrl, width, height, background };
        if (x !== undefined) Object.assign(body, { x: x - width / 2, y: y - height / 2 });
        const item = await request('POST', `/slides/${slideId}/images`, body);
        if (item) update(prev => ({ ...prev, items: merge(prev.items, [item]) }));
        return item;
    }, [request, slideId, update]);

    // ── Relais éphémère (socket) ────────────────────────────────────────────
    const emitDrag = useCallback((itemId, geometry, force = false) => {
        const now = Date.now();
        if (!force && now - lastDragRef.current < DRAG_INTERVAL_MS) return;
        lastDragRef.current = now;
        socket?.emit('board-drag', { system: getSystemFromPath(), sessionId, slideId, itemId, ...geometry });
    }, [socket, sessionId, slideId]);

    const ping = useCallback((x, y, color) => {
        socket?.emit('board-ping', { system: getSystemFromPath(), sessionId, slideId, x, y, color });
        const own = { id: `${Date.now()}-own`, x, y, color };
        setPings(prev => [...prev, own]);
        setTimeout(() => setPings(prev => prev.filter(p => p.id !== own.id)), PING_MS);
    }, [socket, sessionId, slideId]);

    const current = state.slideId === slideId ? state : { slideId, loaded: false, items: [], fog: [] };
    return {
        ...current, drags, pings, characters,
        addItem, patchItem, deleteItem, clearItems, placePcTokens, uploadImage, updateFog, emitDrag, ping,
    };
}
