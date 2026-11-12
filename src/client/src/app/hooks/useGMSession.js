// src/client/src/app/hooks/useGMSession.js
// Hook générique qui gère toute la couche socket/session côté MJ (un « poste MJ »).
// Aucune logique système dedans. Tables actives : documentations/spec_tables.md.
//
// Responsabilités :
//   - Charger la table du poste mémorisée dans le navigateur au boot (vtt:<slug>:gm)
//   - Ouvrir la table du poste (gm-set-active-session + join-session), la reprendre
//     après une reconnexion ; ne la quitter (gm-clear-session) que sur un changement
//     ou une désactivation voulus, jamais au démontage (rechargement : délai de grâce)
//   - Présence en ligne du slug (useOnlineCharacters)
//   - Écouter character-full-update / character-update et les exposer via
//     characterUpdates (nouveau — corrige un bug de référence circulaire qui
//     empêchait toute remontée temps réel côté GM, cf. onCharacterUpdate
//     s'appelant lui-même faute de callback externe branché)
//   - Exposer activeSession + setActiveSession pour que GMView puisse en changer
//
// characterUpdates est un ajout PUREMENT ADDITIF : les slugs qui ne le
// consomment pas ne sont pas affectés, ils reçoivent juste un prop inutilisé.

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useFetch } from './useFetch.js';
import { useOnlineCharacters } from './useOnlineCharacters.js';
import { readStored, removeStored, storageKey, writeStored } from '../tools/browserStorage.js';

/**
 * @param {string} apiBase - ex: '/api/vikings'
 * @returns {{
 *   activeSession: object|null,
 *   setActiveSession: function,
 *   onlineCharacters: array,
 *   characterUpdates: object,  // { [characterId]: { type: 'full'|'partial', data, ts } }
 * }}
 */
export function useGMSession({ apiBase }) {
    const socket = useSocket();
    const fetchWithAuth = useFetch();

    const [activeSession,    setActiveSessionState] = useState(null);
    const [characterUpdates, setCharacterUpdates]   = useState({});

    // Table ouverte par ce poste, lue par setActiveSession pour la quitter
    const activeIdRef = useRef(null);
    useEffect(() => { activeIdRef.current = activeSession?.id ?? null; }, [activeSession?.id]);

    const slug = apiBase.replace(/^\/api\//, '').replace(/\/$/, '');
    // Présence en ligne (personnages de ce slug)
    const onlineCharacters = useOnlineCharacters(slug);
    // Table active du MJ, mémorisée dans ce navigateur : vtt:<slug>:gm (spec_browser_storage.md §6)
    const gmKey = storageKey(slug, 'gm');

    // ── Chargement initial depuis le navigateur ─────────────────────────────
    useEffect(() => {
        const savedId = readStored(gmKey)?.activeSessionId;
        if (!savedId) return;

        fetchWithAuth(`${apiBase}/sessions/${savedId}`)
            .then(r => r.ok ? r.json() : null)
            .then(session => { if (session) setActiveSessionState(session); })
            .catch(err => {
                console.error('[useGMSession] Error loading saved session:', err);
                removeStored(gmKey);
            });
    }, [apiBase]);

    // ── Mises à jour personnage temps réel (corrigé) ─────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onFullUpdate = ({ characterId, character }) => {
            setCharacterUpdates(prev => ({
                ...prev,
                [characterId]: { type: 'full', data: character, ts: Date.now() },
            }));
        };
        const onPartialUpdate = ({ characterId, updates }) => {
            setCharacterUpdates(prev => ({
                ...prev,
                [characterId]: { type: 'partial', data: updates, ts: Date.now() },
            }));
        };

        socket.on('character-full-update', onFullUpdate);
        socket.on('character-update',      onPartialUpdate);
        return () => {
            socket.off('character-full-update', onFullUpdate);
            socket.off('character-update',      onPartialUpdate);
        };
    }, [socket]);

    // ── Composition de la table active (ajout / retrait d'un personnage) ─────
    useEffect(() => {
        if (!socket) return;

        const onComposition = ({ system, sessionId, session }) => {
            if (system !== slug) return;
            setActiveSessionState(prev => (prev && prev.id === sessionId ? session : prev));
        };

        socket.on('session-characters-update', onComposition);
        return () => socket.off('session-characters-update', onComposition);
    }, [socket, slug]);

    // ── Ouverture de la table du poste + room ───────────────────────────────
    useEffect(() => {
        if (!socket || !activeSession) return;
        const sessionId = activeSession.id;

        const announce = () => {
            socket.emit('gm-set-active-session', { sessionId, system: slug });
            socket.emit('join-session',           { sessionId, system: slug });
        };
        announce();
        // Reconnexion (serveur relancé, réseau coupé) : le serveur a oublié la room et le
        // poste ; on les reprend. Pas au premier « connect » : les envois ci-dessus sont
        // déjà mis en attente par socket.io jusqu'à la connexion.
        socket.io.on('reconnect', announce);

        return () => {
            socket.io.off('reconnect', announce);
            // Sortie de la room seulement : la table n'est quittée que par setActiveSession
            // (sortie volontaire) ; un démontage (rechargement, onglet fermé) passe par la
            // déconnexion et le délai de grâce, sans rien changer pour les joueurs.
            socket.emit('leave-session', { sessionId, system: slug });
        };
    }, [socket, activeSession?.id]);

    // ── setActiveSession, mémorisée dans le navigateur ──────────────────────
    // Changer de table ou passer null (Désactiver, table supprimée) quitte volontairement
    // la table du poste : si c'était le dernier poste, elle s'arrête pour les joueurs.
    const setActiveSession = useCallback(async (session) => {
        const previousId = activeIdRef.current;
        if (previousId && previousId !== session?.id) {
            socket?.emit('gm-clear-session', { sessionId: previousId, system: slug });
        }

        if (!session) {
            setActiveSessionState(null);
            removeStored(gmKey);
            return;
        }

        // Si l'objet session vient de la liste, il n'a pas forcément `characters`.
        // On force un fetch de l'endpoint détail pour garantir les données complètes.
        try {
            const r = await fetchWithAuth(`${apiBase}/sessions/${session.id}`);
            const full = r.ok ? await r.json() : session; // fallback sur l'objet partiel
            setActiveSessionState(full);
            writeStored(gmKey, { activeSessionId: full.id });
        } catch {
            // fallback silencieux
            setActiveSessionState(session);
            writeStored(gmKey, { activeSessionId: session.id });
        }
    }, [apiBase, fetchWithAuth, socket, slug, gmKey]);

    return { activeSession, setActiveSession, onlineCharacters, characterUpdates };
}