// features/journal/hooks/useJournalCollab.js
// Écriture à plusieurs de l'entrée partagée ouverte dans une vue (onglet ou fenêtre) :
// réglage `collaboration` de RichTextEditor, personnes présentes, attente ou échec.

import { useMemo } from 'react';
import { useJournalDoc } from './useJournalDoc.js';
import { personColor } from '../tools/journalPeople.js';

/**
 * @param {object}      data   useJournalData
 * @param {object|null} entry  entrée partagée ouverte (complète), null sinon
 * @returns {{ collaboration: object|null, peers: object[], waiting: boolean, error: string|null }}
 */
export function useJournalCollab(data, entry) {
    const user = useMemo(() => ({ name: data.userName, color: personColor(data.characterId) }), [data.userName, data.characterId]);
    const entryId = entry?.id ?? null;
    const live = useJournalDoc({ sessionId: data.sessionId, entryId, user });
    const seedHtml = live.seed ? (entry?.body ?? '') : null;
    const collaboration = useMemo(() => (entryId && live.ready && live.doc
        ? { doc: live.doc, awareness: live.awareness, user, seedHtml, onSeeded: live.onSeeded }
        : null), [entryId, live.ready, live.doc, live.awareness, user, seedHtml, live.onSeeded]);
    return { collaboration, peers: live.peers, waiting: !!entryId && !live.ready && !live.error, error: live.error };
}
