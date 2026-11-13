// src/client/src/app/hooks/usePlayerSession.js
// Hook générique qui gère toute la couche socket/session côté joueur.
// Extrait de App.jsx Vikings — aucune logique système dedans.
//
// Responsabilités :
//   - Émettre character-loaded / character-left (présence en ligne)
//   - Écouter character-update → onCharacterUpdate callback
//   - Écouter gm-item-received → onCharacterReload
//   - Charger les sessions du personnage dans SessionContext
//
// Le compteur du journal (non lus du MJ, nouveautés de la table) est tenu par la brique
// journal elle-même (JournalProvider, spec_journal.md partie III §13.2).

import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { useFetch } from './useFetch.js';
import useSystem from "./useSystem.js";

/**
 * @param {object|null} character       - personnage actif (null si pas connecté)
 * @param {function}    onCharacterUpdate - callback(updatedCharacter) — mise à jour temps réel
 * @param {function}    onCharacterReload  - callback() — recharger le perso complet depuis l'API
 * @param {string}      apiBase            - ex: '/api/vikings'
 */
export function usePlayerSession({ character, onCharacterUpdate, onCharacterReload, apiBase }) {
    const socket = useSocket();
    const { updateCharacterSessions, activeGMSession } = useSession();
    const fetchWithAuth = useFetch();
    const { slug } = useSystem();

    // ── Charger les sessions du personnage ──────────────────────────────────
    // Au chargement, puis quand le MJ l'ajoute à une table ou l'en retire
    // (character-sessions-changed, spec_composition_table.md)
    const loadCharacterSessions = () => {
        fetchWithAuth(`${apiBase}/characters/${character.id}/sessions`)
            .then(r => r.json())
            .then(sessions => updateCharacterSessions(sessions, character.id))
            .catch(err => console.error('[usePlayerSession] Error loading sessions:', err));
    };

    useEffect(() => {
        if (!character?.id || character.id === -1) return;
        loadCharacterSessions();
    }, [character?.id, apiBase]);

    // ── Présence en ligne ───────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !character?.id) return;

        const announce = () => socket.emit('character-loaded', {
            characterId: character.id,
            name: character.name
                ?? character.nom
                ?? ([character.prenom, character.surnom ? `"${character.surnom}"` : null].filter(Boolean).join(' ')
                || character.playerName),
            playerName:  character.playerName,
            agilite:     character.agilite     ?? 1,
            actionsMax:  character.actionsDisponibles ?? 1,
            slug,
            sessionId:   activeGMSession,
        });
        announce();
        // Reconnexion (serveur relancé, réseau coupé) : le serveur a oublié la présence
        socket.io.on('reconnect', announce);

        return () => {
            socket.io.off('reconnect', announce);
            socket.emit('character-left', character.id);
        };
    }, [socket, character?.id, activeGMSession]);

    // ── Événements temps réel ───────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !character?.id) return;

        // Mise à jour partielle (ex: tokens blessure/fatigue depuis combat)
        const handleCharacterUpdate = (data) => {
            if (String(data.characterId) === String(character.id)) {
                onCharacterUpdate(prev => ({ ...prev, ...data.updates }));
            }
        };

        const handleCharacterFullUpdate = (data) => {
            if (String(data.characterId) === String(character.id)) {
                onCharacterReload();
            }
        };

        // Réception d'un objet GM → recharger la fiche complète (inventaire)
        const handleGMItemReceived = (data) => {
            if (String(data.characterId) === String(character.id)) {
                onCharacterReload();
            }
        };

        // Ajout à une table ou retrait par le MJ → recharger les tables du personnage
        const handleSessionsChanged = (data) => {
            if (data.system === slug && String(data.characterId) === String(character.id)) {
                loadCharacterSessions();
            }
        };

        socket.on('character-update',    handleCharacterUpdate);
        socket.on('character-full-update', handleCharacterFullUpdate);
        socket.on('gm-item-received',    handleGMItemReceived);
        socket.on('character-sessions-changed', handleSessionsChanged);

        return () => {
            socket.off('character-update',    handleCharacterUpdate);
            socket.off('character-full-update', handleCharacterFullUpdate);
            socket.off('gm-item-received',    handleGMItemReceived);
            socket.off('character-sessions-changed', handleSessionsChanged);
        };
    }, [socket, character?.id]);
}