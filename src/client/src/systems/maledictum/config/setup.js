// src/client/src/systems/maledictum/config/setup.js
// ─────────────────────────────────────────────────────────────────────────────
// Réglages du setup (spec_maledictum.md §13.1) : un fichier par setup (un futur
// slug Rogue Trader aura le sien). Lus par l'assistant de création, les
// catalogues de la fiche et l'interface MJ. Les personnages déjà créés gardent
// tout ce qu'ils ont, même si un livre devient indisponible.
//
//   books       : livres disponibles (champ `source` des catalogues : core, ipg, igmg)
//   chars.base  : base des caractéristiques (tirage 2d10 + base, achat base + points)
//   chars.points: achat de points (total, minimum et maximum par caractéristique)
//   creation.randomDraws : boutons « au hasard » de l'assistant (origine, faction, rôle)
//   creation.xp : 'book' = XP des tirages du livre ; { fixed: n } = n XP pour tout personnage
// ─────────────────────────────────────────────────────────────────────────────

export const BOOKS = [
    { key: 'core', label: 'Livre de base' },
    { key: 'ipg', label: 'Inquisition Player\'s Guide' },
    { key: 'igmg', label: 'Inquisition Gamemaster\'s Guide' },
];

/** Règles du livre (référence, tests) */
export const BOOK_SETUP = {
    books: { core: true, ipg: true, igmg: true },
    chars: { base: 20, points: { total: 90, min: 4, max: 18 } },
    creation: { randomDraws: true, xp: 'book' },
};

/** Réglages de la table (choix du MJ, 2026-11-06) */
export const SETUP = {
    books: { core: true, ipg: false, igmg: false },
    chars: { base: 25, points: { total: 90, min: 0, max: 20 } },
    creation: { randomDraws: false, xp: { fixed: 50 } },
};

/** Une entrée de catalogue est-elle disponible (livre activé) ? Sans `source` : livre de base. */
export const isAvailable = (entry, setup = SETUP) => setup.books[entry?.source ?? 'core'] !== false;

/** Entrées disponibles d'un catalogue */
export const available = (list, setup = SETUP) => (list ?? []).filter(e => isAvailable(e, setup));

export const hasBook = (book, setup = SETUP) => setup.books[book] !== false;
