// features/journal/JournalProvider.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Une seule source de données pour le journal d'une page (spec_journal.md, partie III
// §13.1-13.2) : l'onglet Journal et la fenêtre flottante (JournalLayer) lisent le même
// journal « Privé » (personnage) et le même journal « Partagé » (table active), et les
// mêmes compteurs. Une note enregistrée dans une vue est reprise par l'autre si elle y est
// ouverte (lastBody). Posé par PlayerPage (personnage chargé) et GMPage (-1).
// Sans fournisseur, la brique Journal charge ses propres données (useJournalData).
//
// Props : characterId (-1 = MJ), sessionId (table active, null : pas de journal partagé),
//         userName (nom montré aux autres pendant l'écriture à plusieurs ; « MJ » par défaut pour -1).
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePrivateJournal } from './hooks/usePrivateJournal.js';
import { useTableJournal } from './hooks/useTableJournal.js';
import { isUnread } from './tools/journalFilters.js';

export const JournalContext = createContext(null);

const JournalProvider = ({ characterId, sessionId = null, userName, children }) => {
    const journal = usePrivateJournal(characterId);
    const table = useTableJournal(sessionId, characterId);
    const [lastBody, setLastBody] = useState(null);   // { key: 'private:12', body, source, at }
    const publishBody = useCallback((key, body, source) => setLastBody({ key, body, source, at: Date.now() }), []);
    const name = userName || (characterId === -1 ? 'MJ' : 'Joueur');
    const value = useMemo(() => ({ characterId, sessionId, userName: name, journal, table, lastBody, publishBody }),
        [characterId, sessionId, name, journal, table, lastBody, publishBody]);
    return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

/** Non lus : messages et objets du MJ (Privé), nouveautés de la table (Partagé). */
export const journalCounts = ({ journal, table }) => {
    const privateCount = journal.entries.filter(isUnread).length;
    const tableCount = table.entries.filter(e => e.isNew).length;
    return { private: privateCount, table: tableCount, total: privateCount + tableCount };
};

/**
 * Compteur total du journal pour un composant posé sous le fournisseur, en rendu
 * conditionnel (ex. badge de l'onglet Journal d'une fiche) : <JournalUnread>{n => …}</JournalUnread>.
 */
export const JournalUnread = ({ children }) => {
    const data = useContext(JournalContext);
    return children(data ? journalCounts(data).total : 0);
};

export default JournalProvider;
