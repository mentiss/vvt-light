// src/client/src/hooks/usePlayerSession.js
// Hook générique qui gère toute la couche socket/session côté joueur.
// Extrait de App.jsx Vikings — aucune logique système dedans.
//
// Responsabilités :
//   - Émettre character-loaded / character-left (présence en ligne)
//   - Écouter character-update → onCharacterUpdate callback
//   - Écouter gm-item-received → onCharacterReload + badge journal
//   - Écouter gm-message-received → badge journal
//   - Charger les sessions du personnage dans SessionContext
//
// Badge journal = messages et objets du MJ non lus : chargé depuis le serveur à
// l'ouverture de la fiche, +1 à chaque réception, −1 quand une entrée non lue est
// ouverte dans le journal (spec_journal.md §2.6 bis et §3).

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { useFetch } from './useFetch.js';
import useSystem from "./useSystem.js";

/**
 * @param {object|null} character       - personnage actif (null si pas connecté)
 * @param {function}    onCharacterUpdate - callback(updatedCharacter) — mise à jour temps réel
 * @param {function}    onCharacterReload  - callback() — recharger le perso complet depuis l'API
 * @param {string}      apiBase            - ex: '/api/vikings'
 * @returns {{ journalUnread: number, markJournalRead: function }}
 */
export function usePlayerSession({ character, onCharacterUpdate, onCharacterReload, apiBase }) {
    const socket = useSocket();
    const { updateCharacterSessions, activeGMSession } = useSession();
    const fetchWithAuth = useFetch();
    const { slug } = useSystem();
    const [journalUnread, setJournalUnread] = useState(0);

    // ── Charger les sessions du personnage ──────────────────────────────────
    // Au chargement, puis quand le MJ l'ajoute à une table ou l'en retire
    // (character-sessions-changed, spec_composition_table.md)
    const loadCharacterSessions = () => {
        fetchWithAuth(`${apiBase}/characters/${character.id}/sessions`)
            .then(r => r.json())
            .then(sessions => updateCharacterSessions(sessions))
            .catch(err => console.error('[usePlayerSession] Error loading sessions:', err));
    };

    useEffect(() => {
        if (!character?.id || character.id === -1) return;
        loadCharacterSessions();
    }, [character?.id, apiBase]);

    // ── Charger le nombre d'entrées du journal non lues ─────────────────────
    useEffect(() => {
        if (!character?.id || character.id === -1) return;

        fetchWithAuth(`${apiBase}/journal/${character.id}/unread-count`)
            .then(r => r.ok ? r.json() : { count: 0 })
            .then(({ count }) => setJournalUnread(count ?? 0))
            .catch(err => console.error('[usePlayerSession] Error loading unread journal count:', err));
    }, [character?.id, apiBase]);

    // ── Présence en ligne ───────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !character?.id) return;

        socket.emit('character-loaded', {
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

        return () => {
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

        // Réception d'un objet GM → recharger la fiche complète + badge journal
        const handleGMItemReceived = (data) => {
            if (String(data.characterId) === String(character.id)) {
                onCharacterReload();
                setJournalUnread(n => n + 1);
            }
        };

        // Message GM → badge journal uniquement
        const handleGMMessage = (data) => {
            if (String(data.characterId) === String(character.id)) {
                setJournalUnread(n => n + 1);
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
        socket.on('gm-message-received', handleGMMessage);
        socket.on('character-sessions-changed', handleSessionsChanged);

        return () => {
            socket.off('character-update',    handleCharacterUpdate);
            socket.off('character-full-update', handleCharacterFullUpdate);
            socket.off('gm-item-received',    handleGMItemReceived);
            socket.off('gm-message-received', handleGMMessage);
            socket.off('character-sessions-changed', handleSessionsChanged);
        };
    }, [socket, character?.id]);

    return {
        journalUnread,
        // Appelé avec l'id d'une entrée ouverte dans le journal ; sans id (changement
        // d'onglet, appel historique des fiches), le compteur ne bouge pas : les non lus
        // restent signalés jusqu'à leur lecture.
        markJournalRead: (entryId) => {
            if (entryId) setJournalUnread(n => Math.max(0, n - 1));
        },
    };
}