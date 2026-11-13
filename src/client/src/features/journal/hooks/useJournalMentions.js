// features/journal/hooks/useJournalMentions.js
// Réglage `mentions` de RichTextEditor pour une vue du journal (liens « @ », spec_journal.md R-18) :
// entrées proposées, cible encore présente, ouverture d'une entrée citée (onOpen(scope, id)).

import { useMemo } from 'react';
import { mentionCandidates, mentionExists, mentionId, parseMentionId } from '../tools/journalMentions.js';

/**
 * @param {object}      data    useJournalData
 * @param {'private'|'table'} scope journal affiché
 * @param {object|null} entry   entrée ouverte (exclue des propositions)
 * @param {(scope: string, id: number) => void} onOpen
 */
export function useJournalMentions(data, scope, entry, onOpen) {
    const privateEntries = data.journal.entries;
    const tableEntries = data.table.entries;
    const exclude = entry ? mentionId(scope, entry.id) : null;
    return useMemo(() => ({
        items: (query) => mentionCandidates({ scope, privateEntries, tableEntries, query, exclude }),
        exists: (value) => mentionExists(value, { scope, privateEntries, tableEntries }),
        open: (value) => { const target = parseMentionId(value); if (target) onOpen(target.scope, target.id); },
    }), [scope, privateEntries, tableEntries, exclude, onOpen]);
}
