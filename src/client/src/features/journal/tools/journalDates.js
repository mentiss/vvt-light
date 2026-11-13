// features/journal/tools/journalDates.js
// Dates du journal : enregistrées par le serveur en UTC, affichées en heure locale (spec_journal.md §2.4).
import { parseServerDate } from '@/app/tools/utils.js';

/** 13/11/26 */
export const formatShortDate = (value) => parseServerDate(value)?.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
}) ?? '';

/** 13/11/2026 14:05 */
export const formatDateTime = (value) => parseServerDate(value)?.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) ?? '';
