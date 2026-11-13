// features/journal/hooks/useJournalData.js
// Données du journal d'un personnage : celles du JournalProvider de la page s'il porte ce
// personnage, sinon un chargement propre (Privé seul : sans table connue, pas de Partagé).

import { useContext } from 'react';
import { JournalContext } from '../JournalProvider.jsx';
import { usePrivateJournal } from './usePrivateJournal.js';
import { useTableJournal } from './useTableJournal.js';

const NO_SHARE = () => {};

export function useJournalData(characterId) {
    const shared = useContext(JournalContext);
    const useShared = shared?.characterId === characterId;
    const own = usePrivateJournal(useShared ? null : characterId);
    const noTable = useTableJournal(null, characterId);
    return useShared ? shared : {
        characterId, sessionId: null, userName: characterId === -1 ? 'MJ' : 'Joueur',
        journal: own, table: noTable, lastBody: null, publishBody: NO_SHARE,
    };
}
