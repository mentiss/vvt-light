// src/client/src/app/context/SessionContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Table du joueur (documentations/spec_tables.md §3.2) : parmi les tables actives
// du slug (useActiveTables, tenues par le serveur), celle dont son personnage est
// membre. Plusieurs : celle où il est, sinon son choix mémorisé, sinon on lui demande
// (fenêtre de choix, refermable sans choisir). Une table qui s'arrête est quittée ;
// l'activation d'une table dont il n'est pas membre est sans effet pour lui.
//
// Contrat lu par les slugs et les briques : activeGMSession, activeSessionName,
// updateCharacterSessions(sessions, characterId). En plus : tableChoice (fenêtre de
// choix, montée par PlayerPage), canChangeTable / openTableChoice (Changer de table).
// Sans personnage chargé (MJ, accueil), rien n'est lu ni rejoint.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSocket } from './SocketContext';
import { getSystemFromPath } from '../hooks/useSystem.js';
import { useActiveTables } from '../hooks/useActiveTables.js';
import { pickPlayerTable } from '../tools/playerTable.js';
import { readStored, storageKey, writeStored } from '../tools/browserStorage.js';

const SessionContext = createContext();

// Choix de table mémorisé, par personnage : vtt:<slug>:player-table (spec_browser_storage.md §6)
const CHOICE_OPTIONS = { defaults: { byCharacter: {} } };

export const SessionProvider = ({ children }) => {
    const socket = useSocket();
    const system = getSystemFromPath();
    const choiceKey = storageKey(system, 'player-table');

    const [characterSessions, setCharacterSessions] = useState(null); // null = pas encore chargées
    const [characterId, setCharacterId] = useState(null);
    const [activeGMSession, setActiveGMSession] = useState(null);
    const [choiceVersion, setChoiceVersion] = useState(0);           // relit le choix mémorisé
    const [choiceRequested, setChoiceRequested] = useState(false);  // Changer de table
    const [dismissedFor, setDismissedFor] = useState(null);         // candidats refusés (fenêtre fermée)

    const activeTables = useActiveTables(characterSessions !== null);

    // Choix mémorisé du personnage chargé
    const remembered = useMemo(() => {
        if (characterId == null) return null;
        return readStored(choiceKey, CHOICE_OPTIONS).byCharacter?.[characterId] ?? null;
    }, [characterId, choiceKey, choiceVersion]); // eslint-disable-line react-hooks/exhaustive-deps -- choiceVersion : relecture après un choix

    const pick = useMemo(() => {
        if (!activeTables || !characterSessions) return null;
        return pickPlayerTable({
            activeIds:  activeTables.map(t => t.id),
            memberIds:  characterSessions.map(s => s.id),
            current:    activeGMSession,
            remembered,
        });
    }, [activeTables, characterSessions, activeGMSession, remembered]);

    // Rejoindre la table retenue, quitter l'ancienne (la ref porte la room réellement rejointe)
    const joinedRef = useRef(null);
    const moveTo = useCallback((target) => {
        const current = joinedRef.current;
        if (current === target) return;
        if (socket && current) socket.emit('leave-session', { sessionId: current, system });
        if (socket && target)  socket.emit('join-session',  { sessionId: target,  system });
        joinedRef.current = target;
        setActiveGMSession(target);
    }, [socket, system]);

    useEffect(() => {
        if (!pick) return;
        moveTo(pick.tableId);
    }, [pick, moveTo]);

    // Reconnexion (serveur relancé, réseau coupé, veille) : le serveur a oublié la room
    useEffect(() => {
        if (!socket || !activeGMSession) return;
        const rejoin = () => socket.emit('join-session', { sessionId: activeGMSession, system });
        socket.io.on('reconnect', rejoin);
        return () => socket.io.off('reconnect', rejoin);
    }, [socket, activeGMSession, system]);

    // Sortie de la page : quitter la room
    useEffect(() => () => {
        if (socket && joinedRef.current) socket.emit('leave-session', { sessionId: joinedRef.current, system });
    }, [socket, system]);

    // ── Fenêtre de choix ────────────────────────────────────────────────────
    const candidatesKey = pick ? pick.candidates.join(',') : '';
    const tableChoiceOpen = !!pick && (choiceRequested || (pick.needsChoice && dismissedFor !== candidatesKey));
    const canChangeTable = !!pick && pick.candidates.length > 1;

    const chooseTable = useCallback((sessionId) => {
        if (characterId != null) {
            const stored = readStored(choiceKey, CHOICE_OPTIONS);
            writeStored(choiceKey, { byCharacter: { ...stored.byCharacter, [characterId]: sessionId } });
        }
        setChoiceVersion(v => v + 1);
        setChoiceRequested(false);
        moveTo(sessionId);
    }, [characterId, choiceKey, moveTo]);

    const dismissTableChoice = useCallback(() => {
        setChoiceRequested(false);
        setDismissedFor(candidatesKey);
    }, [candidatesKey]);

    const openTableChoice = useCallback(() => setChoiceRequested(true), []);

    const tableChoice = useMemo(() => ({
        open:     tableChoiceOpen,
        tables:   (pick?.candidates ?? []).map(id => characterSessions?.find(s => s.id === id)).filter(Boolean),
        currentId: activeGMSession,
        characterId,
        choose:   chooseTable,
        dismiss:  dismissTableChoice,
    }), [tableChoiceOpen, pick, characterSessions, activeGMSession, characterId, chooseTable, dismissTableChoice]);

    const activeSessionName = characterSessions?.find(s => s.id === activeGMSession)?.name ?? null;

    // Tables du personnage, chargées par usePlayerSession (et rechargées quand le MJ
    // l'ajoute à une table ou l'en retire)
    const updateCharacterSessions = useCallback((sessions, id = null) => {
        setCharacterSessions(Array.isArray(sessions) ? sessions : []);
        setCharacterId(id);
    }, []);

    return (
        <SessionContext.Provider value={{
            activeGMSession,
            activeSessionName,
            updateCharacterSessions,
            tableChoice,
            canChangeTable,
            openTableChoice,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within SessionProvider');
    }
    return context;
};
