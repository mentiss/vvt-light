// src/client/src/hooks/useBoardSession.js
// ─────────────────────────────────────────────────────────────────────────────
// Tableau d'une table (documentations/spec_tableau.md §10.4, §10.5, §10.8) :
// - chargement des réglages et des diapositives à l'entrée et à chaque reconnexion
//   du socket ;
// - écoute de board-session / board-slides, filtrée sur le slug et la table ;
// - actions du MJ (activation, diapositive montrée, gestion des diapositives).
// Le serveur diffuse après chaque écriture : la réponse sert seulement à aller plus vite.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useFetch } from './useFetch.js';
import { getSystemFromPath } from './useSystem.js';

const EMPTY = {
    loaded: false, enabled: false, shownSlideId: null, keep: false,
    grid: { value: null, unit: null }, purgeAt: null, size: 0, prolongedFrom: null, slides: [],
};

/**
 * @param {number|null} sessionId table active (null : rien)
 */
export function useBoardSession(sessionId) {
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const fetchRef = useRef(fetchWithAuth);
    useEffect(() => { fetchRef.current = fetchWithAuth; });

    // Les données retiennent leur table : celles d'une autre table ne sont jamais renvoyées
    const [board, setBoard] = useState({ sessionId: null, ...EMPTY });

    const apply = useCallback((patch, loaded = false) => {
        setBoard(prev => {
            const base = prev.sessionId === sessionId ? prev : { sessionId, ...EMPTY };
            return { ...base, ...patch, sessionId, loaded: loaded || base.loaded };
        });
    }, [sessionId]);

    /** Requête vers la route du tableau de la table ; réponse JSON, ou null en cas d'échec */
    const request = useCallback(async (method, path = '', body) => {
        if (!sessionId) return null;
        try {
            const res = await fetchRef.current(`/api/board/sessions/${sessionId}${path}`, {
                method, body: body === undefined ? undefined : JSON.stringify(body),
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error(`[useBoardSession] ${method} ${path} failed:`, err);
            return null;
        }
    }, [sessionId]);

    // ── Chargement, puis à chaque reconnexion du socket ─────────────────────
    useEffect(() => {
        if (!sessionId) return undefined;
        let cancelled = false;
        const load = async () => {
            const data = await request('GET');
            if (data && !cancelled) apply(data, true);
        };
        load();
        socket?.on('connect', load);
        return () => {
            cancelled = true;
            socket?.off('connect', load);
        };
    }, [sessionId, socket, request, apply]);

    // ── Temps réel ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const system = getSystemFromPath();
        const mine = (payload) => payload?.system === system && payload?.sessionId === sessionId;
        const onSession = (payload) => {
            if (!mine(payload)) return;
            const { enabled, shownSlideId, keep, grid, purgeAt } = payload;
            apply({ enabled, shownSlideId, keep, grid, purgeAt });
        };
        const onSlides = (payload) => { if (mine(payload)) apply({ slides: payload.slides }); };
        socket.on('board-session', onSession);
        socket.on('board-slides', onSlides);
        return () => {
            socket.off('board-session', onSession);
            socket.off('board-slides', onSlides);
        };
    }, [socket, sessionId, apply]);

    // ── Actions du MJ ───────────────────────────────────────────────────────
    const updateTable = useCallback(async (patch) => {
        const data = await request('PUT', '', patch);
        if (data) apply(data);
        return !!data;
    }, [request, apply]);

    const show = useCallback(async (slideId) => {
        const data = await request('PUT', '/shown', { slideId });
        if (data) apply(data);
    }, [request, apply]);

    // Chaque action applique sa réponse tout de suite : l'écran de celui qui agit ne
    // dépend pas de la diffusion (qui ne lui arrive pas si son socket a perdu la room)
    const upsertSlide = useCallback((slide) => {
        if (!slide) return;
        setBoard(prev => {
            const exists = prev.slides.some(s => s.id === slide.id);
            const slides = exists ? prev.slides.map(s => (s.id === slide.id ? slide : s)) : [...prev.slides, slide];
            return { ...prev, slides };
        });
    }, []);

    const createSlide = useCallback(async (name) => {
        const slide = await request('POST', '/slides', name ? { name } : {});
        upsertSlide(slide);
        return slide;
    }, [request, upsertSlide]);

    const updateSlide = useCallback(async (id, patch) => {
        setBoard(prev => ({ ...prev, slides: prev.slides.map(s => (s.id === id ? { ...s, ...patch } : s)) }));
        const slide = await request('PUT', `/slides/${id}`, patch);
        if (slide) upsertSlide(slide);
        else {
            const data = await request('GET');   // refusé : retour à l'état du serveur
            if (data) apply(data);
        }
        return slide;
    }, [request, upsertSlide, apply]);

    const duplicateSlide = useCallback(async (id) => {
        const slide = await request('POST', `/slides/${id}/duplicate`);
        upsertSlide(slide);
        return slide;
    }, [request, upsertSlide]);

    const deleteSlide = useCallback(async (id) => {
        const done = await request('DELETE', `/slides/${id}`);
        if (done) {
            setBoard(prev => ({
                ...prev,
                slides: prev.slides.filter(s => s.id !== id),
                shownSlideId: prev.shownSlideId === id ? null : prev.shownSlideId,
            }));
        }
        return done;
    }, [request]);

    const orderSlides = useCallback(async (ids) => {
        // Ordre affiché tout de suite ; la liste diffusée par le serveur fait foi ensuite
        setBoard(prev => ({ ...prev, slides: ids.map(id => prev.slides.find(s => s.id === id)).filter(Boolean) }));
        await request('PUT', '/slides/order', { ids });
    }, [request]);

    const current = board.sessionId === sessionId ? board : { sessionId, ...EMPTY };
    return {
        ...current,
        setEnabled: (enabled) => updateTable({ enabled }),
        setKeep: (keep) => updateTable({ keep }),
        setGrid: (patch) => updateTable(patch),   // { gridValue?, gridUnit? } ; null : défaut du slug
        show, createSlide, updateSlide, duplicateSlide, deleteSlide, orderSlides,
    };
}
