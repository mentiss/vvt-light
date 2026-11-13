// features/journal/tools/journalMentions.js
// Liens « @ » entre entrées du journal (spec_journal.md R-11, R-18). Fonctions pures.
// Identifiant d'un lien : « private:12 » (note privée) ou « table:5 » (entrée partagée).
//   - depuis le journal privé : ses notes et les entrées de la table ;
//   - depuis le journal partagé : les entrées de la table seulement (une note privée n'y apparaît jamais).

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const mentionId = (scope, id) => `${scope}:${id}`;

/** « table:5 » → { scope: 'table', id: 5 }, ou null */
export function parseMentionId(value) {
    const m = String(value ?? '').match(/^(private|table):(\d+)$/);
    return m ? { scope: m[1], id: Number(m[2]) } : null;
}

/**
 * Entrées proposées après « @ ».
 * @param {object}   p
 * @param {'private'|'table'} p.scope   journal de l'entrée en cours
 * @param {object[]} p.privateEntries
 * @param {object[]} p.tableEntries
 * @param {string}   p.query           texte tapé après « @ »
 * @param {string}  [p.exclude]         identifiant de l'entrée en cours (on ne se cite pas)
 * @param {number}  [p.limit=8]
 * @returns {{ id: string, label: string, group: string }[]}
 */
export function mentionCandidates({ scope, privateEntries = [], tableEntries = [], query = '', exclude = null, limit = 8 }) {
    const pool = [
        ...(scope === 'private' ? privateEntries.filter(e => e.type === 'note').map(e => ({ id: mentionId('private', e.id), label: e.title || 'Sans titre', group: 'Privé' })) : []),
        ...tableEntries.map(e => ({ id: mentionId('table', e.id), label: e.title || 'Sans titre', group: 'Partagé' })),
    ];
    const q = norm(query.trim());
    return pool.filter(c => c.id !== exclude && (!q || norm(c.label).includes(q))).slice(0, limit);
}

/** Le lien pointe vers une entrée qui existe encore (et visible depuis ce journal). */
export function mentionExists(value, { scope, privateEntries = [], tableEntries = [] }) {
    const target = parseMentionId(value);
    if (!target) return false;
    if (target.scope === 'private') return scope === 'private' && privateEntries.some(e => e.id === target.id);
    return tableEntries.some(e => e.id === target.id);
}
