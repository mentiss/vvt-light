// features/journal/tools/journalContext.js
// Ligne de contexte d'une entrée, en tête de sa section Markdown (copie, export) :
// catégorie ou nature, table, auteur, date. Fonction pure.
import { categoryLabel } from './journalFilters.js';
import { formatDateTime } from './journalDates.js';

export function entryContext(entry, { shared = false } = {}) {
    if (shared) {
        const by = entry.editorName && entry.editorName !== entry.authorName ? `, modifiée par ${entry.editorName}` : '';
        return `Journal de la table · écrite par ${entry.authorName || '?'}${by} · ${formatDateTime(entry.updatedAt)}`;
    }
    const kind = entry.type === 'gm_message' ? 'Message du MJ'
        : entry.type === 'gm_item' ? 'Objet reçu'
        : entry.type === 'gm_sent' ? `Envoyé à ${(entry.metadata?.to ?? []).join(', ')}`
        : categoryLabel(entry.category);
    return [kind, entry.sessionName || 'Hors table', formatDateTime(entry.createdAt)].join(' · ');
}
