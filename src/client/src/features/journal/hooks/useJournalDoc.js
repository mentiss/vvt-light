// features/journal/hooks/useJournalDoc.js
// ─────────────────────────────────────────────────────────────────────────────
// Écriture à plusieurs dans une entrée du journal partagé (documentations/plateforme/
// spec_journal.md, partie III §12) : document Yjs et présence (curseurs, noms) d'une entrée,
// échangés par les sockets de la page (événements journal-doc-*, socket/platform/journal.js).
//
// Une connexion par entrée et par page, partagée par l'onglet et la fenêtre flottante
// (même document : une entrée ouverte dans les deux vues reste une seule écriture).
// Le jeton d'accès authentifie l'ouverture ; refusé (expiré), il est rafraîchi une fois.
//
// Rend { doc, awareness, ready, seed, onSeeded, peers, error } :
//   ready  document reçu du serveur (l'éditeur peut s'y lier)
//   seed   ce poste doit y charger le HTML de l'entrée (entrée sans état partagé)
//   peers  autres personnes dans l'entrée : [{ name, color }]
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import * as Y from 'yjs';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useAuth } from '@/app/context/AuthContext.jsx';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';

const REMOTE = 'server';
const bytes = (data) => (data instanceof Uint8Array ? data : new Uint8Array(data));
const NO_PEERS = [];

// ── Connexions ouvertes, par entrée : { doc, awareness, refs, state, listeners, close } ──
const connections = new Map();

function openConnection({ socket, system, sessionId, entryId, user, getToken, refreshToken }) {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    awareness.setLocalStateField('user', user);
    const conn = { doc, awareness, refs: 0, listeners: new Set(), state: { ready: false, seed: false, peers: NO_PEERS, error: null } };
    const set = (patch) => { conn.state = { ...conn.state, ...patch }; conn.listeners.forEach(fn => fn()); };
    const mine = (data) => data?.system === system && data.entryId === entryId;
    let retried = false;

    const open = (token) => socket.emit('journal-doc-open', { system, sessionId, entryId, token });

    const onState = (data) => {
        if (!mine(data)) return;
        Y.applyUpdate(doc, bytes(data.state), REMOTE);
        // Ce que ce poste a écrit hors connexion (coupure, relance du serveur) repart
        socket.emit('journal-doc-update', { system, entryId, update: Y.encodeStateAsUpdate(doc) });
        socket.emit('journal-doc-awareness', { system, entryId, update: encodeAwarenessUpdate(awareness, [doc.clientID]) });
        set({ ready: true, seed: !!data.seed, error: null });
    };
    const onUpdate = (data) => { if (mine(data)) Y.applyUpdate(doc, bytes(data.update), REMOTE); };
    const onAwareness = (data) => { if (mine(data)) applyAwarenessUpdate(awareness, bytes(data.update), REMOTE); };
    const onError = async (data) => {
        if (!mine(data)) return;
        if (data.error === 'auth' && !retried) {
            retried = true;
            const token = await refreshToken().catch(() => null);
            if (token) return open(token);
        }
        set({ error: data.error });
    };
    const onConnect = () => open(getToken());
    conn.markSeeded = () => set({ seed: false });

    const docUpdate = (update, origin) => {
        if (origin !== REMOTE && conn.state.ready) socket.emit('journal-doc-update', { system, entryId, update });
    };
    const awarenessUpdate = ({ added, updated, removed }, origin) => {
        if (origin === REMOTE) return;
        const changed = [...added, ...updated, ...removed];
        socket.emit('journal-doc-awareness', { system, entryId, update: encodeAwarenessUpdate(awareness, changed) });
    };
    const awarenessChange = () => {
        const peers = [...awareness.getStates()].filter(([id, s]) => id !== doc.clientID && s.user).map(([, s]) => s.user);
        set({ peers: peers.length ? peers : NO_PEERS });
    };

    socket.on('journal-doc-state', onState);
    socket.on('journal-doc-update', onUpdate);
    socket.on('journal-doc-awareness', onAwareness);
    socket.on('journal-doc-error', onError);
    socket.on('connect', onConnect);
    doc.on('update', docUpdate);
    awareness.on('update', awarenessUpdate);
    awareness.on('change', awarenessChange);
    open(getToken());

    conn.close = () => {
        removeAwarenessStates(awareness, [doc.clientID], 'local');   // les autres effacent notre curseur
        socket.emit('journal-doc-close', { system, entryId });
        socket.off('journal-doc-state', onState);
        socket.off('journal-doc-update', onUpdate);
        socket.off('journal-doc-awareness', onAwareness);
        socket.off('journal-doc-error', onError);
        socket.off('connect', onConnect);
        doc.off('update', docUpdate);
        awareness.off('update', awarenessUpdate);
        awareness.off('change', awarenessChange);
        awareness.destroy();
        doc.destroy();
    };
    return conn;
}

const IDLE = { ready: false, seed: false, peers: NO_PEERS, error: null };
const noop = () => () => {};

/**
 * @param {{ sessionId: number|null, entryId: number|null, user: { name: string, color: string } }} params
 *   entryId null : rien d'ouvert
 */
export function useJournalDoc({ sessionId, entryId, user }) {
    const socket = useSocket();
    const { accessToken, refreshAccessToken } = useAuth();
    const tokenRef = useRef(accessToken);
    useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);
    const [conn, setConn] = useState(null);
    const key = socket && sessionId && entryId ? `${getSystemFromPath()}:${entryId}` : null;
    const userName = user.name;
    const userColor = user.color;

    useEffect(() => {
        if (!key) return undefined;
        let item = connections.get(key);
        if (!item) {
            item = openConnection({
                socket, system: getSystemFromPath(), sessionId, entryId,
                user: { name: userName, color: userColor },
                getToken: () => tokenRef.current, refreshToken: refreshAccessToken,
            });
            connections.set(key, item);
        }
        item.refs += 1;
        setConn(item);
        return () => {
            item.refs -= 1;
            if (item.refs === 0) { item.close(); connections.delete(key); }
            setConn(null);
        };
    }, [key, socket, sessionId, entryId, userName, userColor, refreshAccessToken]);

    const subscribe = useCallback((fn) => {
        if (!conn) return noop();
        conn.listeners.add(fn);
        return () => conn.listeners.delete(fn);
    }, [conn]);
    const state = useSyncExternalStore(subscribe, () => conn?.state ?? IDLE);
    const onSeeded = useCallback(() => conn?.markSeeded(), [conn]);

    return { doc: conn?.doc ?? null, awareness: conn?.awareness ?? null, ...state, onSeeded };
}
