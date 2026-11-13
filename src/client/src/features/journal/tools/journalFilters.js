// features/journal/tools/journalFilters.js
// ─────────────────────────────────────────────────────────────────────────────
// Filtres et tri de la liste du journal (documentations/plateforme/spec_journal.md,
// partie II §9, R-3, R-15, R-21, R-23). Fonctions pures.
// ─────────────────────────────────────────────────────────────────────────────

import { parseServerDate } from '@/app/tools/utils.js';
import { isoDay } from '@/ui/tools/dateRange.js';

/** Catégories fixes d'une note, les mêmes clés que le serveur (src/server/utils/journal.js). */
export const JOURNAL_CATEGORIES = [
    { key: 'notes',       label: 'Notes' },
    { key: 'personnages', label: 'Personnages' },
    { key: 'lieux',       label: 'Lieux' },
    { key: 'indices',     label: 'Indices' },
    { key: 'quetes',      label: 'Quêtes' },
];

export const categoryLabel = (key) => JOURNAL_CATEGORIES.find(c => c.key === key)?.label ?? 'Notes';

/** Message ou objet reçu du MJ. */
export const isFromGM = (entry) => entry.type === 'gm_message' || entry.type === 'gm_item';

/** Entrée non lue : message ou objet du MJ pas encore ouvert. */
export const isUnread = (entry) => isFromGM(entry) && !entry.isRead;

/** Jour local (AAAA-MM-JJ) d'une date du serveur. */
export const localDay = (value) => {
    const date = parseServerDate(value);
    return date ? isoDay(date) : '';
};

const time = (value) => parseServerDate(value)?.getTime() ?? 0;

/**
 * Entrées gardées par les filtres.
 * @param {object[]} entries
 * @param {object} f
 * @param {string} [f.query]        recherche dans le titre et le texte brut
 * @param {string} [f.kind]         'all' | clé de catégorie | 'messages' (reçus du MJ) | 'sent' (envoyés par le MJ)
 * @param {string} [f.table]        'all' | 'active' | 'none' (hors table)
 * @param {number|null} [f.activeTable]
 * @param {string} [f.from]         AAAA-MM-JJ, date de création
 * @param {string} [f.to]
 */
export function filterEntries(entries, { query = '', kind = 'all', table = 'all', activeTable = null, from = '', to = '' } = {}) {
    const q = query.trim().toLowerCase();
    return entries.filter(e => {
        if (kind === 'messages' && !isFromGM(e)) return false;
        if (kind === 'sent' && e.type !== 'gm_sent') return false;
        if (!['all', 'messages', 'sent'].includes(kind) && (e.type !== 'note' || (e.category || 'notes') !== kind)) return false;
        if (table === 'active' && (activeTable == null || e.sessionId !== activeTable)) return false;
        if (table === 'none' && e.sessionId) return false;
        if (from || to) {
            const day = localDay(e.createdAt);
            if (from && day < from) return false;
            if (to && day > to) return false;
        }
        if (q && !(e.title || '').toLowerCase().includes(q) && !(e.bodyText || '').toLowerCase().includes(q)) return false;
        return true;
    });
}

/** Épinglées en tête, puis les autres ; chaque groupe de la plus récemment modifiée à la plus ancienne. */
export function splitPinned(entries) {
    const sorted = [...entries].sort((a, b) => time(b.updatedAt) - time(a.updatedAt));
    return { pinned: sorted.filter(e => e.pinned), others: sorted.filter(e => !e.pinned) };
}

/** Un filtre avancé (table, période) est actif. */
export const hasAdvancedFilter = ({ table = 'all', from = '', to = '' }) => table !== 'all' || !!from || !!to;
