// src/client/src/tools/rollDate.js
// ─────────────────────────────────────────────────────────────────────────────
// Date d'un jet dans l'historique (documentations/spec_ui_actions.md §6.4) :
// relative quand elle est proche, absolue ensuite.
//   « à l'instant », « il y a 12 min », « il y a 3 h » (même jour),
//   « hier 21:40 », « 12/10 21:40 » (année ajoutée si ce n'est pas l'année en cours).
// Les dates de la base (SQLite, UTC sans fuseau : « 2026-11-01 20:40:00 ») et
// celles du serveur (ISO avec Z) sont acceptées.
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');
const time = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Date JS d'un horodatage de jet, ou null s'il est illisible. */
export function parseRollDate(timestamp) {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return Number.isNaN(timestamp.getTime()) ? null : timestamp;
    const text = String(timestamp).trim();
    // Sans fuseau (SQLite) : c'est de l'UTC
    const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(text) ? text : `${text.replace(' ', 'T')}Z`;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Date affichée sur une carte d'historique.
 * @param {string|Date} timestamp
 * @param {Date} [now]
 */
export function formatRollDate(timestamp, now = new Date()) {
    const date = parseRollDate(timestamp);
    if (!date) return '';

    const minutes = Math.floor((now - date) / 60000);
    if (minutes < 1) return 'à l\'instant';
    if (minutes < 60) return `il y a ${minutes} min`;

    const days = Math.round((dayStart(now) - dayStart(date)) / 86400000);
    if (days === 0) return `il y a ${Math.floor(minutes / 60)} h`;
    if (days === 1) return `hier ${time(date)}`;

    const year = date.getFullYear() === now.getFullYear() ? '' : `/${date.getFullYear()}`;
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}${year} ${time(date)}`;
}

/** Date complète (infobulle) : « samedi 1 novembre 2026 à 21:40 ». */
export function fullRollDate(timestamp) {
    const date = parseRollDate(timestamp);
    if (!date) return '';
    const day = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return `${day} à ${time(date)}`;
}
