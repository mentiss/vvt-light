// ui/tools/dateRange.js
// ─────────────────────────────────────────────────────────────────────────────
// Fonctions pures du champ « période » (ui/date/DateRangeField.jsx,
// documentations/plateforme/spec_journal.md R-23) : jours au format AAAA-MM-JJ
// (heure locale), grille d'un mois, libellé, choix d'un jour.
// Une période : { from, to }, chaînes AAAA-MM-JJ ou '' (borne absente).
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

/** Jour local d'une date, au format AAAA-MM-JJ (comparable comme une chaîne). */
export const isoDay = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Jour AAAA-MM-JJ lu en date locale (midi : pas de bascule de jour au changement d'heure). */
export const parseDay = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
};

/**
 * Grille de 6 semaines d'un mois, du lundi au dimanche.
 * @param {number} year
 * @param {number} month 0-11
 * @returns {{ key: string, day: number, inMonth: boolean }[]} 42 jours
 */
export function monthGrid(year, month) {
    const first = new Date(year, month, 1, 12);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { key: isoDay(d), day: d.getDate(), inMonth: d.getMonth() === month };
    });
}

const short = (key, withYear) => {
    const [y, m, d] = key.split('-');
    return withYear ? `${d}/${m}/${y}` : `${d}/${m}`;
};

/** Libellé du champ : null sans période. */
export function periodLabel({ from, to }) {
    if (!from && !to) return null;
    if (!to) return `Depuis le ${short(from)}`;
    if (!from) return `Jusqu'au ${short(to)}`;
    if (from === to) return `Le ${short(from, true)}`;
    return `Du ${short(from)} au ${short(to)}`;
}

/** Jour affiché dans une case de borne (Du / Au). */
export const slotLabel = (key) => (key ? short(key, true) : '—');

/**
 * Choix d'un jour dans le calendrier.
 * Borne « from » : pose le début (efface une fin antérieure) et passe à la fin.
 * Borne « to » : pose la fin ; un jour avant le début devient le début, l'ancien début la fin.
 * @returns {{ range: {from: string, to: string}, mode: 'from'|'to', done: boolean }}
 */
export function pickDay({ from, to }, mode, day) {
    if (mode === 'from') return { range: { from: day, to: to && to < day ? '' : to }, mode: 'to', done: false };
    if (from && day < from) return { range: { from: day, to: from }, mode: 'from', done: true };
    return { range: { from, to: day }, mode: 'from', done: true };
}

/** Période affichée pendant le choix : celle choisie, ou celle qui se dessine au survol. */
export function previewRange({ from, to }, mode, hover) {
    if (!hover) return { from, to };
    if (mode === 'to' && from) return hover < from ? { from: hover, to: from } : { from, to: hover };
    if (mode === 'from' && !to) return { from: hover, to: '' };
    return { from, to };
}

/** Raccourci « N derniers jours » (0 = aujourd'hui seul). */
export function lastDays(days, today = new Date()) {
    const start = new Date(today);
    start.setDate(today.getDate() - days);
    return { from: isoDay(start), to: isoDay(today) };
}
